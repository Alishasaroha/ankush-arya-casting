import { createFileRoute } from "@tanstack/react-router";

import {
  deleteTalentProfilePhoto,
  isSameOriginRequest,
  talentPhotoErrorResponse,
} from "@/lib/server/talent-photos";

export const Route = createFileRoute("/api/talent-profiles/$profileId/photos/$photoId")({
  server: {
    handlers: {
      DELETE: async ({ request, params }) => {
        if (!isSameOriginRequest(request)) {
          return Response.json({ message: "Invalid request origin." }, { status: 403 });
        }

        try {
          await deleteTalentProfilePhoto({
            profileId: params.profileId,
            photoId: params.photoId,
          });

          return Response.json({ success: true });
        } catch (error) {
          return talentPhotoErrorResponse(error);
        }
      },
    },
  },
});
