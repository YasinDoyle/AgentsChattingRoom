import { NextResponse } from "next/server";
import { findUserByEmail, createToken } from "@/server/auth.service";
import { sendVerificationEmail } from "@/server/email.service";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.email) {
    return NextResponse.json(
      { ok: false, error: "邮箱不能为空", code: "invalid_input" },
      { status: 400 },
    );
  }

  const user = findUserByEmail(body.email);
  // Always return success to avoid leaking whether the email is registered
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  if (user.email_verified) {
    return NextResponse.json({ ok: true });
  }

  const token = createToken(user.id, "email_verification");
  sendVerificationEmail(user.email, token);

  return NextResponse.json({ ok: true });
}
