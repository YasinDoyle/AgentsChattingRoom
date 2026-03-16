import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { getDb } from "./db";

/* ─── Types ─── */

export interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  email_verified: number;
  created_at: string;
}

export interface SafeUser {
  id: string;
  email: string;
  emailVerified: boolean;
}

interface DbToken {
  id: string;
  user_id: string;
  type: string;
  token: string;
  expires_at: string;
  used: number;
  created_at: string;
}

/* ─── Helpers ─── */

const SALT_ROUNDS = 12;
const JWT_EXPIRY = "7d";
const TOKEN_EXPIRY_HOURS = 24;
const COOKIE_NAME = "auth_token";

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) {
    throw new Error("AUTH_JWT_SECRET environment variable is required");
  }
  return new TextEncoder().encode(secret);
}

export function toSafeUser(row: DbUser): SafeUser {
  return {
    id: row.id,
    email: row.email,
    emailVerified: row.email_verified === 1,
  };
}

/* ─── JWT ─── */

export async function signJwt(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getJwtSecret());
}

export async function verifyJwt(
  token: string,
): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as { sub: string };
  } catch {
    return null;
  }
}

/* ─── Auth Cookie ─── */

export function authCookieOptions(maxAge?: number) {
  return [
    `${COOKIE_NAME}=${maxAge === 0 ? "" : "{TOKEN}"}`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Path=/`,
    `Max-Age=${maxAge ?? 60 * 60 * 24 * 7}`,
    ...(process.env.NODE_ENV === "production" ? ["Secure"] : []),
  ].join("; ");
}

export function buildSetCookie(jwt: string): string {
  return authCookieOptions().replace("{TOKEN}", jwt);
}

export function buildClearCookie(): string {
  return authCookieOptions(0);
}

export { COOKIE_NAME };

/* ─── User CRUD ─── */

export function findUserByEmail(email: string): DbUser | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email) as
    | DbUser
    | undefined;
}

export function findUserById(id: string): DbUser | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | DbUser
    | undefined;
}

export async function createUser(
  email: string,
  password: string,
): Promise<DbUser> {
  const db = getDb();
  const id = randomUUID();
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  db.prepare(
    "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)",
  ).run(id, email, passwordHash);

  return findUserById(id)!;
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function markEmailVerified(userId: string): void {
  const db = getDb();
  db.prepare("UPDATE users SET email_verified = 1 WHERE id = ?").run(userId);
}

export async function updatePassword(
  userId: string,
  newPassword: string,
): Promise<void> {
  const db = getDb();
  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(
    hash,
    userId,
  );
}

/* ─── Token CRUD ─── */

export function createToken(
  userId: string,
  type: "email_verification" | "password_reset",
): string {
  const db = getDb();
  const id = randomUUID();
  const token = randomUUID();
  const expiresAt = new Date(
    Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
  ).toISOString();

  // Invalidate previous tokens of same type for this user
  db.prepare(
    "UPDATE tokens SET used = 1 WHERE user_id = ? AND type = ? AND used = 0",
  ).run(userId, type);

  db.prepare(
    "INSERT INTO tokens (id, user_id, type, token, expires_at) VALUES (?, ?, ?, ?, ?)",
  ).run(id, userId, type, token, expiresAt);

  return token;
}

export function consumeToken(
  tokenValue: string,
  type: "email_verification" | "password_reset",
): DbToken | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM tokens WHERE token = ? AND type = ? AND used = 0")
    .get(tokenValue, type) as DbToken | undefined;

  if (!row) return null;
  if (new Date(row.expires_at) < new Date()) {
    // Expired — mark as used and return null
    db.prepare("UPDATE tokens SET used = 1 WHERE id = ?").run(row.id);
    return null;
  }

  db.prepare("UPDATE tokens SET used = 1 WHERE id = ?").run(row.id);
  return row;
}
