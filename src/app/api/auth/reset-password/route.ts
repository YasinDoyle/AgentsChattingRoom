import { NextResponse } from "next/server";
import {
  consumeToken,
  findUserById,
  updatePassword,
  signJwt,
  buildSetCookie,
  toSafeUser,
} from "@/server/auth.service";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.token || !body?.password) {
    return NextResponse.json(
      { ok: false, error: "缺少必填参数", code: "invalid_input" },
      { status: 400 },
    );
  }

  if (body.password.length < 6) {
    return NextResponse.json(
      { ok: false, error: "密码长度至少为 6 位", code: "password_too_short" },
      { status: 400 },
    );
  }

  const record = consumeToken(body.token, "password_reset");
  if (!record) {
    return NextResponse.json(
      { ok: false, error: "重置链接无效或已过期", code: "invalid_token" },
      { status: 400 },
    );
  }

  await updatePassword(record.user_id, body.password);

  const user = findUserById(record.user_id)!;
  const jwt = await signJwt(user.id);
  const res = NextResponse.json({ ok: true, user: toSafeUser(user) });
  res.headers.set("Set-Cookie", buildSetCookie(jwt));
  return res;
}
