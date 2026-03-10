"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/core/hooks/use-auth";
import { AuthRoutes } from "./auth-routes";
import { Redirect } from "@/common/components/common/redirect";

const AUTH_PATHS = ["/login", "/verify", "/forgot", "/reset"];

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const pathname = usePathname();
  const { status, refresh } = useAuth();

  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (status === "idle") {
      void refresh();
    }
  }, [refresh, status]);

  if (isAuthPath) {
    if (status === "authenticated" && pathname === "/login") {
      return <Redirect to="/chat" />;
    }
    return <AuthRoutes />;
  }

  return <>{children}</>;
}
