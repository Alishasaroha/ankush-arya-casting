import { createFileRoute } from "@tanstack/react-router";

import { requireTalentProfileAccess } from "@/lib/server/auth/authorization";
import {
  isSameOriginRequest,
  talentPhotoErrorResponse,
  uploadTalentProfilePhoto,
  TalentPhotoRequestError,
} from "@/lib/server/talent-photos";

const MAX_REQUEST_BYTES = 5 * 1024 * 1024 + 256 * 1024;

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

          const contentLength = Number(request.headers.get("content-length") ?? 0);

          if (contentLength > MAX_REQUEST_BYTES) {
            throw new TalentPhotoRequestError("Each photo must be 5 MB or smaller.", 413);
          }

          let formData: FormData;

          try {
            formData = await request.formData();
          } catch {
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
