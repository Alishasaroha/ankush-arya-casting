import argon2 from "argon2";
import { randomBytes } from "node:crypto";

export async function hashPassword(
  password: string
): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return argon2.verify(hashedPassword, password);
}


let dummyPasswordHashPromise: Promise<string> | undefined;

/**
 * Create a process-local Argon2id dummy hash lazily. Login checks use it when
 * an email address does not exist so the no-account path still performs an
 * Argon2id verification instead of returning immediately.
 */
export function getDummyPasswordHash(): Promise<string> {
  dummyPasswordHashPromise ??= hashPassword(randomBytes(32).toString("hex"));
  return dummyPasswordHashPromise;
}
