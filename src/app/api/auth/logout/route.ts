import { NextResponse } from "next/server";
import { buildClearCookie } from "@/server/auth.service";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", buildClearCookie());
  return res;
}
