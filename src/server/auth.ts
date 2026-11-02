import "server-only";
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { HttpError } from "@/lib/api-response";
import { db } from "@/lib/db";
import type { Role, SessionUser } from "@/lib/types";

/**
 * Email + password auth with database sessions.
 * - Passwords: scrypt (Node built-in), stored as "scrypt$<salt>$<hash>".
 * - Sessions: random token in an httpOnly cookie; only its SHA-256 is stored in Session.id,
 *   so a leaked database cannot be used to log in.
 * TODO: Google / Microsoft sign-in when AUTH_GOOGLE_* / AUTH_MICROSOFT_* credentials exist.
 */

const scrypt = promisify(scryptCb) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

export const SESSION_COOKIE = "bg_session";
const SESSION_DAYS = 7;
const KEY_LENGTH = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [alg, salt, hash] = stored.split("$");
  if (alg !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const key = await scrypt(password, Buffer.from(salt, "hex"), expected.length);
  return timingSafeEqual(key, expected);
}

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { id: hashToken(token), userId, expiresAt } });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { id: hashToken(token) } });
  store.delete(SESSION_COOKIE);
}

/** Sign out everywhere except (optionally) the current session — used after a password change */
export async function destroyOtherSessions(userId: string) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  await db.session.deleteMany({
    where: { userId, ...(token ? { id: { not: hashToken(token) } } : {}) },
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { id: hashToken(token) },
    include: { user: { include: { company: true } } },
  });
  if (!session || session.expiresAt < new Date()) return null;
  const { user } = session;
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role as Role,
    companyId: user.companyId,
    companyName: user.company?.name ?? null,
    onboardingCompleted: user.company?.onboardingCompleted ?? false,
  };
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new HttpError(401, "UNAUTHORIZED", "Please sign in to continue");
  return user;
}

export async function requireCompanyUser() {
  const user = await requireUser();
  if (!user.companyId) throw new HttpError(403, "NO_COMPANY", "Set up your company first");
  return user as SessionUser & { companyId: string };
}

/** Viewers are read-only; collaborator management is admin-only */
export function requireRole(user: SessionUser, roles: Role[]) {
  if (!roles.includes(user.role)) {
    throw new HttpError(403, "FORBIDDEN", "You don't have permission to do this");
  }
}

export const CAN_EDIT: Role[] = ["admin", "member"];
