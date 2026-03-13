"use client";

import { useTheme } from "@/common/components/common/theme";
import { ActivityBarComponent } from "@/common/features/app/components/activity-bar";
import { allInOneAgentExtension } from "@/common/features/all-in-one-agent";
import { cn } from "@/common/lib/utils";
import { useSetupApp } from "@/core/hooks/use-setup-app";
import { useAppBootstrap } from "@/core/hooks/use-app-bootstrap";
import { useViewportHeight } from "@/core/hooks/use-viewport-height";
import { desktopAgentsExtension } from "@/desktop/features/agents/extensions";
import { desktopChatExtension } from "@/desktop/features/chat/extensions";
import { AuthGate } from "@/common/features/auth/components/auth-gate";

export function DesktopShell({ children }: { children: React.ReactNode }) {
  useAppBootstrap();
  const { initialized } = useSetupApp({
    extensions: [
      allInOneAgentExtension,
      desktopChatExtension,
      desktopAgentsExtension,
    ],
  });
  const { rootClassName } = useTheme();
  const { height } = useViewportHeight();

  if (!initialized) {
    return <div>Loading...</div>;
  }

  return (
    <div className="fixed inset-0 flex flex-col" style={{ height }}>
      <div className={cn(rootClassName, "flex flex-col h-full")}>
        <AuthGate>
          <div className="flex-1 min-h-0 flex">
            <ActivityBarComponent className="flex" />
            <div className="flex-1 min-w-0 overflow-hidden">{children}</div>
          </div>
        </AuthGate>
      </div>
    </div>
  );
}
