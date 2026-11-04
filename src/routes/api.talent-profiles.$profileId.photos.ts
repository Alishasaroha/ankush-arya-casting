import { createFileRoute } from "@tanstack/react-router";

import { requireTalentProfileAccess } from "@/lib/server/auth/authorization";
import {
  isSameOriginRequest,
  talentPhotoErrorResponse,
  uploadTalentProfilePhoto,
  TalentPhotoRequestError,
} from "@/lib/server/talent-photos";

const MAX_REQUEST_BYTES = 5 * 1024 * 1024 + 256 * 1024;

async function readRequestBodyWithLimit(
  request: Request,
  maxBytes: number,
): Promise<Uint8Array> {
  if (!request.body) {
    throw new TalentPhotoRequestError("Select an image to upload.");
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      totalBytes += value.byteLength;

      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new TalentPhotoRequestError(
          "Each photo must be 5 MB or smaller.",
          413,
        );
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return body;
}

export const Route = createFileRoute("/api/talent-profiles/$profileId/photos")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        if (!isSameOriginRequest(request)) {
          return Response.json({ message: "Invalid request origin." }, { status: 403 });
        }

        try {
          // Reject unauthorized requests before parsing the multipart file body.
          await requireTalentProfileAccess(params.profileId);

          const contentLengthHeader = request.headers.get("content-length");

          if (
            contentLengthHeader &&
            (!/^\\d+$/.test(contentLengthHeader) ||
              Number(contentLengthHeader) > MAX_REQUEST_BYTES)
          ) {
            throw new TalentPhotoRequestError("Each photo must be 5 MB or smaller.", 413);
          }

          let formData: FormData;

          try {
            const body = await readRequestBodyWithLimit(request, MAX_REQUEST_BYTES);
            const boundedRequest = new Request(request.url, {
              method: "POST",
              headers: {
                "content-type": request.headers.get("content-type") ?? "",
              },
              body,
            });

            formData = await boundedRequest.formData();
          } catch (parseError) {
            if (parseError instanceof TalentPhotoRequestError) {
              throw parseError;
            }

            throw new TalentPhotoRequestError("Send the photo as multipart form data.");
          }

          const file = formData.get("file");
          const altText = formData.get("altText");

          if (!(file instanceof File)) {
            throw new TalentPhotoRequestError("Select an image to upload.");
          }

          if (altText !== null && typeof altText !== "string") {
            throw new TalentPhotoRequestError("Invalid photo description.");
          }

          const photo = await uploadTalentProfilePhoto({
            profileId: params.profileId,
            file,
            altText: typeof altText === "string" ? altText : "",
          });

          return Response.json({ photo }, { status: 201 });
        } catch (error) {
          return talentPhotoErrorResponse(error);
        }
      },
    },
  },
});
