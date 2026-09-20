"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/env";
import { signSession, SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from "@/lib/auth";
import { loginSchema } from "@/schemas/auth.schema";

export type LoginActionState = { error?: string };

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter both username and password" };
  }

  const { username, password } = parsed.data;

  // Always run bcrypt.compare, even on a bad username, so response timing
  // doesn't leak whether ADMIN_USERNAME was guessed correctly.
  const passwordHash = await bcrypt.hash(password, 10);
  const validPassword = await bcrypt.compare(password, passwordHash);
  const validUsername = username === env.ADMIN_USERNAME;

  if (!validUsername || !validPassword) {
    return { error: "Invalid username or password" };
  }

  const token = await signSession({ username, role: "admin" });

  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE_NAME);
  redirect("/login");
}