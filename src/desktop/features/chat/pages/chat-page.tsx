"use client";
import { ChatArea } from "@/common/features/chat/components/chat-area";
import { useBreakpointContext } from "@/common/components/common/breakpoint-provider";
import { DiscussionController } from "@/common/features/discussion/components/control/discussion-controller";
import { DiscussionList } from "@/common/features/discussion/components/list/discussion-list";
import { DiscussionSidebar } from "@/common/features/discussion/components/sidebar/discussion-sidebar";
import { ResponsiveContainer } from "@/common/components/layouts/responsive-container";
import { UI_PERSIST_KEYS } from "@/core/config/ui-persist";
import { usePersistedState } from "@/core/hooks/use-persisted-state";
import { useCurrentDiscussionId } from "@/core/hooks/use-current-discussion-id";
import { useIsPaused } from "@/core/hooks/use-discussion-runtime";
import { useState } from "react";

export function ChatPage() {
  const { isDesktop } = useBreakpointContext();
  const [showMembersForDesktop, setShowMembersForDesktop] = usePersistedState(
    false,
    {
      key: UI_PERSIST_KEYS.DISCUSSION.MEMBER_PANEL_VISIBLE,
      version: 1,
    },
  );
  const [isInitialState, setIsInitialState] = useState(false);
  const showDesktopMembers =
    isDesktop && showMembersForDesktop && !isInitialState;
  const currentDiscussionId = useCurrentDiscussionId();
  const isPaused = useIsPaused();
  const status = isPaused ? "paused" : "active";

  const handleToggleMembers = () => {
    setShowMembersForDesktop(!showMembersForDesktop);
  };

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 flex justify-center min-w-0 h-full">
        <div className="w-full max-w-[1920px] h-full">
          <ResponsiveContainer
            sidebarContent={
              <div className="h-full bg-card">
                <DiscussionList />
              </div>
            }
            mainContent={
              <div className="flex flex-col h-full">
                {!isInitialState && (
                  <DiscussionController
                    status={status}
                    onToggleMembers={handleToggleMembers}
                    enableSettings={false}
                  />
                )}
                <div className="flex-1 min-h-0">
                  <ChatArea
                    key={currentDiscussionId}
                    onInitialStateChange={setIsInitialState}
                  />
                </div>
              </div>
            }
          />
        </div>
      </div>
      {showDesktopMembers && (
        <div className="w-80 flex-none border-l border-border bg-card">
          <DiscussionSidebar />
        </div>
      )}
    </div>
  );
}
