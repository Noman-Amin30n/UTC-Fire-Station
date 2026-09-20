import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/env";

export const SESSION_COOKIE_NAME = "utc_fire_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days
const secretKey = new TextEncoder().encode(env.SESSION_SECRET);

export type SessionPayload = {
  username: string;
  role: "admin";
};

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secretKey);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (payload.role !== "admin" || typeof payload.username !== "string") return null;
    return { username: payload.username, role: "admin" };
  } catch {
    return null;
  }
}

export { SESSION_DURATION_SECONDS };

export async function requireAdmin(): Promise<SessionPayload> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) redirect("/login");
  return session;
}