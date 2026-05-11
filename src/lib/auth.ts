import { cookies } from "next/headers";
import { query } from "./db";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_secret_key_change_me_in_production"
);

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);

  (await cookies()).set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  return token;
}

export async function getSession() {
  const token = (await cookies()).get("session")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string };
  } catch {
    return null;
  }
}

export async function getUser() {
  const session = await getSession();
  if (!session) return null;

  const { rows } = await query("SELECT * FROM users WHERE id = ?", [session.userId]);
  const users = rows as Record<string, unknown>[];

  if (users.length === 0) return null;

  const user = users[0];
  return user;
}

export async function logout() {
  (await cookies()).delete("session");
}
