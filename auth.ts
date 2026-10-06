import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";

export const SESSION_COOKIE = "animeil_session";

/** Hanya akun pemilik AnimeIL ini yang boleh memakai fitur Studio/posting. */
export const VERIFIED_EMAIL = "ilfil1087@gmail.com";

export type SessionUser = {
  id: number;
  email: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  isVerified: boolean;
};

/**
 * Bersihkan email dari hal-hal yang sering ikut tersalin:
 * spasi, karakter tak terlihat, kurung [ ] < > ( ), huruf besar.
 * Khusus Gmail: titik dan +label diabaikan (ilf.il1087+a@gmail.com = ilfil1087@gmail.com).
 */
export function normalizeEmail(email: string | null | undefined): string {
  let e = (email ?? "")
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "")
    .trim()
    .replace(/^[<[(]+|[>\])]+$/g, "")
    .trim()
    .toLowerCase();
  const at = e.lastIndexOf("@");
  if (at > 0) {
    let lokal = e.slice(0, at);
    const domain = e.slice(at + 1);
    if (domain === "gmail.com" || domain === "googlemail.com") {
      lokal = lokal.split("+")[0].replace(/\./g, "");
      e = `${lokal}@gmail.com`;
    } else {
      e = `${lokal}@${domain}`;
    }
  }
  return e;
}

const VERIFIED_NORMAL = normalizeEmail(VERIFIED_EMAIL);

export function isVerifiedEmail(email: string | null | undefined): boolean {
  return normalizeEmail(email) === VERIFIED_NORMAL;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

export async function createSession(userId: number): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  await db.insert(sessions).values({ token, userId, expiresAt });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  return token;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        avatarUrl: users.avatarUrl,
        bio: users.bio,
      })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return { ...row, isVerified: isVerifiedEmail(row.email) };
  } catch {
    return null;
  }
}
