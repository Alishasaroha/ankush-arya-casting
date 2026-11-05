import ImageKit from "@imagekit/nodejs";

let imageKitClient: ImageKit | undefined;

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

/** Lazily initialize ImageKit so unrelated routes do not require media credentials. */
export function getImageKitClient(): ImageKit {
  if (!imageKitClient) {
    imageKitClient = new ImageKit({
      privateKey: requiredEnvironmentVariable("IMAGEKIT_PRIVATE_KEY"),
    });
  }

  return imageKitClient;
}

function getImageKitUrlEndpoint(): string {
  const value = requiredEnvironmentVariable("IMAGEKIT_URL_ENDPOINT");
  let endpoint: URL;

  try {
    endpoint = new URL(value);
  } catch {
    throw new Error("IMAGEKIT_URL_ENDPOINT must be a valid HTTPS URL");
  }

  if (endpoint.protocol !== "https:") {
    throw new Error("IMAGEKIT_URL_ENDPOINT must use HTTPS");
  }

  return value.replace(/\/+$/, "");
}

/**
 * Private assets are only delivered through short-lived, signed URLs.
 * The persisted database value is the stable ImageKit file path, not this URL.
 */
export function getSignedTalentPhotoUrl(filePath: string): string {
  const normalizedPath = filePath.startsWith("/") ? filePath : `/${filePath}`;

  return getImageKitClient().helper.buildSrc({
    urlEndpoint: getImageKitUrlEndpoint(),
    src: normalizedPath,
    signed: true,
    // Keep previously issued private-photo links short-lived so revoked access decays quickly.
    expiresIn: 15 * 60,
  });
}
