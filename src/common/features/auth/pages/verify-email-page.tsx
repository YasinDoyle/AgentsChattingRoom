"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/common/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/common/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { AuthShell } from "../components/auth-shell";
import { useAuth } from "@/core/hooks/use-auth";

type VerifyStatus = "idle" | "loading" | "success" | "error";

export function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { verifyEmail } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<VerifyStatus>(
    token ? "loading" : "error",
  );
  const [message, setMessage] = useState<string | null>(null);

  const effectiveStatus: VerifyStatus = token ? status : "error";
  const effectiveMessage = token ? message : "缺少验证令牌，请重新获取验证邮件";

  useEffect(() => {
    if (!token) {
      return;
    }
    let canceled = false;
    const run = async () => {
      const result = await verifyEmail(token);
      if (canceled) {
        return;
      }
      if (result.ok) {
        setStatus("success");
        setMessage("邮箱验证成功，欢迎使用 AgentVerse");
      } else {
        setStatus("error");
        setMessage(result.error || "验证失败，请稍后再试");
      }
    };
    void run();
    return () => {
      canceled = true;
    };
  }, [token, verifyEmail]);

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardTitle>邮箱验证</CardTitle>
          <CardDescription>完成验证后即可进入应用</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <Alert className="mb-4">
              <AlertTitle>处理中</AlertTitle>
              <AlertDescription>正在验证，请稍候...</AlertDescription>
            </Alert>
          )}
          {effectiveStatus === "success" && (
            <Alert className="mb-4">
              <AlertTitle>验证成功</AlertTitle>
              <AlertDescription>{effectiveMessage}</AlertDescription>
            </Alert>
          )}
          {effectiveStatus === "error" && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>验证失败</AlertTitle>
              <AlertDescription>{effectiveMessage}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.replace("/chat")}
              disabled={effectiveStatus === "loading"}
            >
              进入应用
            </Button>
            <Link
              href="/login"
              className="text-sm text-primary hover:underline text-center"
            >
              返回登录
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
