import { NextResponse } from "next/server";
import {
  createUser,
  findUserByEmail,
  createToken,
  signJwt,
  buildSetCookie,
  toSafeUser,
} from "@/server/auth.service";
import { sendVerificationEmail } from "@/server/email.service";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json(
      { ok: false, error: "邮箱和密码不能为空", code: "invalid_input" },
      { status: 400 },
    );
  }

  const { email, password } = body as { email: string; password: string };

  if (password.length < 6) {
    return NextResponse.json(
      { ok: false, error: "密码长度至少为 6 位", code: "password_too_short" },
      { status: 400 },
    );
  }

  const existing = findUserByEmail(email);
  if (existing) {
    return NextResponse.json(
      { ok: false, error: "该邮箱已注册", code: "email_exists" },
      { status: 409 },
    );
  }

  const user = await createUser(email, password);
  const token = createToken(user.id, "email_verification");
  sendVerificationEmail(email, token);

  const jwt = await signJwt(user.id);
  const res = NextResponse.json({
    ok: true,
    user: toSafeUser(user),
  });
  res.headers.set("Set-Cookie", buildSetCookie(jwt));
  return res;
}
