import "server-only";

import bcrypt from "bcryptjs";
import { MINIMUM_PASSWORD_LENGTH } from "@/lib/auth/password-rules";

const PASSWORD_HASH_ROUNDS = 12;

export { MINIMUM_PASSWORD_LENGTH };

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
}

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function isPasswordLongEnough(password: string): boolean {
  return password.length >= MINIMUM_PASSWORD_LENGTH;
}
