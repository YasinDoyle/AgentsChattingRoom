"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/core/hooks/use-auth";

const AUTH_PATHS = ["/login", "/verify", "/forgot", "/reset"];

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, refresh } = useAuth();

  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (status === "idle") {
      void refresh();
      return;
    }

    // 认证页面：已登录则跳转到业务页
    if (isAuthPath && status === "authenticated") {
      router.replace("/chat");
      return;
    }

    // 业务页面：未登录则跳转登录页
    if (!isAuthPath && status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, isAuthPath, refresh, router]);

  // 认证页面：未登录放行
  if (isAuthPath) {
    return <>{children}</>;
  }

  // 业务页面：已登录放行
  if (status === "authenticated") {
    return <>{children}</>;
  }

  // 其他状态（idle / loading / unauthenticated 等待跳转）
  return null;
}
