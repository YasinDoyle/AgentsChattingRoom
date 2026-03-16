import { NextResponse } from "next/server";
import {
  consumeToken,
  findUserById,
  markEmailVerified,
  signJwt,
  buildSetCookie,
  toSafeUser,
} from "@/server/auth.service";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.token) {
    return NextResponse.json(
      { ok: false, error: "缺少验证 Token", code: "invalid_input" },
      { status: 400 },
    );
  }

  const record = consumeToken(body.token, "email_verification");
  if (!record) {
    return NextResponse.json(
      {
        ok: false,
        error: "验证链接无效或已过期",
        code: "invalid_token",
      },
      { status: 400 },
    );
  }

  markEmailVerified(record.user_id);

  const user = findUserById(record.user_id)!;
  const jwt = await signJwt(user.id);
  const res = NextResponse.json({ ok: true, user: toSafeUser(user) });
  res.headers.set("Set-Cookie", buildSetCookie(jwt));
  return res;
}
