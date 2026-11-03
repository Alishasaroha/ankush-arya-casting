import { createHash, randomBytes } from "node:crypto";

// Converts a token into its SHA-256 hash.
export function hashVerificationToken(token: string): string {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

// Generates a secure verification token.
export function generateEmailVerificationToken() {
  const token = randomBytes(32).toString("hex");

  const tokenHash = hashVerificationToken(token);

  return {
    token,
    tokenHash,
  };
}