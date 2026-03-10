"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// 通用的重定向组件
export const Redirect = ({ to }: { to: string }) => {
  const router = useRouter();

  useEffect(() => {
    router.replace(to);
  }, [router, to]);

  return null;
};

// 重定向到聊天页面的组件
export const RedirectToChat = () => <Redirect to="/chat" />;
