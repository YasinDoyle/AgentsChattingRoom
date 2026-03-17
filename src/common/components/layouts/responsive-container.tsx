import { cn } from "@/common/lib/utils";
import { ReactNode } from "react";

interface ResponsiveContainerProps {
  children?: ReactNode;
  className?: string;
  sidebarContent?: ReactNode;
  mainContent: ReactNode;
}

export function ResponsiveContainer({
  className,
  sidebarContent,
  mainContent,
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn("relative h-full w-full overflow-hidden flex", className)}
      data-component="responsive-container"
    >
      {sidebarContent && (
        <div
          data-component="sidebar-wrapper"
          className="w-[280px] h-full border-r border-border bg-card flex-shrink-0"
        >
          {sidebarContent}
        </div>
      )}

      {/* 主内容区域 */}
      <div className="flex-1 min-h-0 min-w-0 flex flex-col">{mainContent}</div>
    </div>
  );
}
