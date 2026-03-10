"use client";

import { usePathname } from "next/navigation";
import { LoginPage } from "../pages/login-page";
import { VerifyEmailPage } from "../pages/verify-email-page";
import { ForgotPasswordPage } from "../pages/forgot-password-page";
import { ResetPasswordPage } from "../pages/reset-password-page";
import { Redirect } from "@/common/components/common/redirect";

export function AuthRoutes() {
  const pathname = usePathname();

  if (pathname === "/verify") return <VerifyEmailPage />;
  if (pathname === "/forgot") return <ForgotPasswordPage />;
  if (pathname === "/reset") return <ResetPasswordPage />;
  if (pathname === "/login") return <LoginPage />;

  return <Redirect to="/login" />;
}
