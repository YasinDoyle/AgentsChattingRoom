import { createElement } from "react";
import { cn } from "@/common/lib/utils";
import { useIcon } from "@/core/stores/icon.store";
import { LucideIcon } from "lucide-react";

interface IconRegistryProps {
  id?: string;
  className?: string;
  fallbackIcon?: LucideIcon;
}

export function IconRegistry({
  id,
  className,
  fallbackIcon,
}: IconRegistryProps) {
  const icon = useIcon(id || "");

  // 优先使用配置的图标，其次使用fallback，都没有则返回null
  const IconToRender = icon ?? fallbackIcon;

  if (!IconToRender) return null;

  return createElement(IconToRender, {
    className: cn("w-4 h-4", className),
  });
}