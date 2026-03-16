import { NextResponse } from "next/server";
import {
  findUserByEmail,
  verifyPassword,
  signJwt,
  buildSetCookie,
  toSafeUser,
} from "@/server/auth.service";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json(
      { ok: false, error: "邮箱和密码不能为空", code: "invalid_input" },
      { status: 400 },
    );
  }

  const { email, password } = body as { email: string; password: string };

  const user = findUserByEmail(email);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "邮箱或密码错误", code: "invalid_credentials" },
      { status: 401 },
    );
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return NextResponse.json(
      { ok: false, error: "邮箱或密码错误", code: "invalid_credentials" },
      { status: 401 },
    );
  }

  const jwt = await signJwt(user.id);
  const res = NextResponse.json({
    ok: true,
    user: toSafeUser(user),
  });
  res.headers.set("Set-Cookie", buildSetCookie(jwt));
  return res;
}
