import { randomUUID } from "node:crypto";
import { Buffer } from "node:buffer";

import { toFile } from "@imagekit/nodejs";

import { prisma } from "./prisma";
import {
  AuthenticationRequiredError,
  AuthorizationError,
  requireTalentProfileAccess,
  TalentProfileNotFoundError,
} from "./auth/authorization";
import { getImageKitClient, getSignedTalentPhotoUrl } from "./imagekit";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_PHOTOS_PER_PROFILE = 30;

const IMAGE_TYPES = {
  "image/jpeg": { extension: "jpg", signature: (bytes: Uint8Array) =>
    bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  "image/png": { extension: "png", signature: (bytes: Uint8Array) =>
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e &&
    bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a &&
    bytes[6] === 0x1a && bytes[7] === 0x0a },
  "image/webp": { extension: "webp", signature: (bytes: Uint8Array) =>
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP" },
} as const;

export class TalentPhotoRequestError extends Error {
  constructor(
    message: string,
    readonly status: number = 400,
  ) {
    super(message);
    this.name = "TalentPhotoRequestError";
  }
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    return false;
  }

  try {
    return origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function uploadTalentProfilePhoto(input: {
  profileId: string;
  file: File;
  altText?: string;
}) {
  // Authorization is checked again in the service, not just in the route.
  await requireTalentProfileAccess(input.profileId);

  if (input.file.size <= 0) {
    throw new TalentPhotoRequestError("Choose a non-empty image file.");
  }

  if (input.file.size > MAX_PHOTO_BYTES) {
    throw new TalentPhotoRequestError("Each photo must be 5 MB or smaller.", 413);
  }

  const imageType = IMAGE_TYPES[input.file.type as keyof typeof IMAGE_TYPES];

  if (!imageType) {
    throw new TalentPhotoRequestError("Use a JPG, PNG, or WebP image.");
  }

  const bytes = new Uint8Array(await input.file.arrayBuffer());

  if (!imageType.signature(bytes)) {
    throw new TalentPhotoRequestError("The selected file is not a valid image of the declared type.");
  }

  const altText = input.altText?.trim() ?? "";

  if (altText.length > 200) {
    throw new TalentPhotoRequestError("Photo description cannot exceed 200 characters.");
  }

  const existingPhotoCount = await prisma.talentProfilePhoto.count({
    where: { talentProfileId: input.profileId },
  });

  if (existingPhotoCount >= MAX_PHOTOS_PER_PROFILE) {
    throw new TalentPhotoRequestError(
      `A talent profile can contain up to ${MAX_PHOTOS_PER_PROFILE} photos.`,
      409,
    );
  }

  const fileName = `talent-${randomUUID()}.${imageType.extension}`;
  const imageKit = getImageKitClient();
  const uploaded = await imageKit.files.upload({
    file: await toFile(Buffer.from(bytes), fileName),
    fileName,
    folder: `/ankush-arya-casting/talent/${input.profileId}`,
    useUniqueFileName: true,
    overwriteFile: false,
    isPrivateFile: true,
  });

  if (!uploaded.fileId || !uploaded.filePath || !uploaded.url) {
    throw new Error("ImageKit did not return the expected uploaded-file details.");
  }

  let photo: {
    id: string;
    altText: string | null;
    sortOrder: number;
    filePath: string | null;
  };

  try {
    photo = await prisma.talentProfilePhoto.create({
      data: {
        talentProfileId: input.profileId,
        url: uploaded.url,
        fileId: uploaded.fileId,
        filePath: uploaded.filePath,
        altText: altText || null,
        sortOrder: existingPhotoCount,
      },
      select: {
        id: true,
        altText: true,
        sortOrder: true,
        filePath: true,
      },
    });
  } catch (error) {
    // Avoid an orphaned cloud asset if the database write fails.
    try {
      await imageKit.files.delete(uploaded.fileId);
    } catch (cleanupError) {
      console.error("ImageKit upload cleanup failed:", cleanupError);
    }

    throw error;
  }

  return {
    id: photo.id,
    altText: photo.altText,
    sortOrder: photo.sortOrder,
    // The database column is nullable for legacy URL-based photos.
    // Fall back to the verified path returned by ImageKit for this upload.
    url: getSignedTalentPhotoUrl(photo.filePath ?? uploaded.filePath),
  };
}

export async function deleteTalentProfilePhoto(input: {
  profileId: string;
  photoId: string;
}) {
  await requireTalentProfileAccess(input.profileId);

  const photo = await prisma.talentProfilePhoto.findFirst({
    where: {
      id: input.photoId,
      talentProfileId: input.profileId,
    },
    select: {
      id: true,
      fileId: true,
    },
  });

  if (!photo) {
    throw new TalentPhotoRequestError("Photo not found for this talent profile.", 404);
  }

  // Delete the cloud asset before the DB row. If storage deletion fails,
  // preserve the database record so the operation can be retried.
  if (photo.fileId) {
    await getImageKitClient().files.delete(photo.fileId);
  }

  await prisma.talentProfilePhoto.delete({
    where: { id: photo.id },
  });
}

export function talentPhotoErrorResponse(error: unknown): Response {
  if (error instanceof AuthenticationRequiredError) {
    return Response.json({ message: "Please sign in to manage profile photos." }, { status: 401 });
  }

  if (error instanceof AuthorizationError) {
    return Response.json({ message: "You do not have permission to manage these photos." }, { status: 403 });
  }

  if (error instanceof TalentProfileNotFoundError) {
    return Response.json({ message: "Talent profile not found." }, { status: 404 });
  }

  if (error instanceof TalentPhotoRequestError) {
    return Response.json({ message: error.message }, { status: error.status });
  }

  console.error("Talent photo operation failed:", error);
  return Response.json(
    { message: "We couldn't complete the photo operation. Please try again." },
    { status: 500 },
  );
}
