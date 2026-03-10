"use client"
import { navigationStore } from "@/core/stores/navigation.store";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export const useConnectNavigationStore = () => {
  const router = useRouter();
  const pathname = usePathname();
  const targetPath = navigationStore((state) => state.targetPath);
  const currentPath = navigationStore((state) => state.currentPath);

  // 监听导航状态变化
  useEffect(() => {
    if (targetPath) {
      router.push(targetPath);
      navigationStore.getState().navigate(null);
    }
  }, [targetPath, router]);

  // 监听路由路径变化
  useEffect(() => {
    if (pathname !== currentPath) {
      navigationStore.getState().setCurrentPath(pathname);
    }
  }, [pathname, currentPath]);
};
