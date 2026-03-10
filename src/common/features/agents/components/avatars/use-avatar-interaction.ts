"use client";
import { useCallback, useEffect, useState } from "react";
import { useAnimation } from "framer-motion";
import {
  useInteractionStore,
  type InteractionRect,
} from "@/common/features/chat/stores/interaction.store";

type UseAvatarInteractionOptions = {
  agentId?: string;
  isUser?: boolean;
  enableDoubleClick?: boolean;
};

export function useAvatarInteraction<T extends HTMLElement>({
  agentId,
  isUser = false,
  enableDoubleClick = false,
}: UseAvatarInteractionOptions) {
  // 用 useState 存储 DOM 节点，完全避免 useRef，
  // 这样 React Compiler 不会将 callback ref 误判为 ref 访问
  const [element, setElement] = useState<T | null>(null);

  const attachAvatar = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  const triggerInteraction = useInteractionStore((s) => s.triggerInteraction);
  const setUserAvatarRect = useInteractionStore((s) => s.setUserAvatarRect);
  const setAgentAvatarRect = useInteractionStore((s) => s.setAgentAvatarRect);
  const impactTimestamp = useInteractionStore((s) =>
    agentId ? s.impacts[agentId] : 0,
  );
  const controls = useAnimation();

  useEffect(() => {
    if (!agentId || !element) return;

    const updateRect = () => {
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const value: InteractionRect = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };
      setAgentAvatarRect(agentId, value);
      if (isUser) {
        setUserAvatarRect(value);
      }
    };

    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
      setAgentAvatarRect(agentId, null);
      if (isUser) {
        setUserAvatarRect(null);
      }
    };
  }, [agentId, isUser, element, setAgentAvatarRect, setUserAvatarRect]);

  useEffect(() => {
    if (impactTimestamp > 0) {
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4 },
      });
    }
  }, [impactTimestamp, controls]);

  const handleDoubleClick = useCallback(() => {
    if (!enableDoubleClick || isUser || !agentId || !element) return;
    const rect = element.getBoundingClientRect();
    const types: ("poop" | "trash")[] = ["poop", "trash"];
    const randomType = types[Math.floor(Math.random() * types.length)];
    triggerInteraction({
      sourceAgentId: "user",
      targetAgentId: agentId,
      targetRect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      },
      type: randomType,
    });
  }, [enableDoubleClick, isUser, agentId, element, triggerInteraction]);

  return {
    attachAvatar,
    controls,
    handleDoubleClick,
  };
}
