import { getPresenter } from "@/core/presenter/presenter";
import { AgentMessage } from "@/common/types/discussion";
import { useEffect, useState } from "react";
import { useDiscussionSettings } from "@/core/hooks/use-discussion-settings";
import { useDiscussionMembers } from "@/core/hooks/use-discussion-members";

interface UseDiscussionControlProps {
  status: "active" | "paused" | "completed";
  onSendMessage?: (params: {
    content: string;
    agentId: string;
    type?: AgentMessage["type"];
    replyTo?: string;
  }) => Promise<AgentMessage | undefined>;
}

export function useDiscussionControl({ status }: UseDiscussionControlProps) {
  const discussionControl = getPresenter().discussionControl;
  const [showSettings, setShowSettings] = useState(false);
  const settings = useDiscussionSettings();
  const messageCount = 0;
  const { members } = useDiscussionMembers();

  useEffect(() => {
    discussionControl.setMembers(members);
  }, [discussionControl, members]);

  useEffect(() => {
    if (status === "active") {
      void discussionControl.startIfEligible();
    } else {
      discussionControl.pause();
    }
  }, [discussionControl, status, members]);

  useEffect(() => {
    return () => {
      discussionControl.pause();
    };
  }, [discussionControl]);

  const handleStatusChange = (isActive: boolean) => {
    if (!isActive) discussionControl.pause();
    else void discussionControl.startIfEligible();
  };

  const setSettings = (next: typeof settings) => {
    // Forward settings updates through service to keep runtime in sync
    discussionControl.setSettings(next);
  };

  return {
    showSettings,
    setShowSettings,
    settings,
    setSettings,
    messageCount,
    handleStatusChange,
  };
}
