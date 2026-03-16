import { NextResponse } from "next/server";
import {
  verifyJwt,
  findUserById,
  toSafeUser,
  COOKIE_NAME,
} from "@/server/auth.service";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { ok: false, error: "未登录", code: "unauthenticated" },
      { status: 401 },
    );
  }

  const payload = await verifyJwt(token);
  if (!payload?.sub) {
    return NextResponse.json(
      { ok: false, error: "登录已过期", code: "token_expired" },
      { status: 401 },
    );
  }

  const user = findUserById(payload.sub);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "用户不存在", code: "user_not_found" },
      { status: 401 },
    );
  }

  return NextResponse.json({ ok: true, user: toSafeUser(user) });
}
