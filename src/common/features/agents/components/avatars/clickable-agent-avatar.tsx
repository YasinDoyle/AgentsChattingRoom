"use client";
import { SmartAvatar } from "@/common/components/ui/smart-avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/ui/popover";
import { AgentInfoCard } from "@/common/features/agents/components/cards/agent-info-card";
import { AgentDef } from "@/common/types/agent";
import { cn } from "@/common/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import {
  useInteractionStore,
  type InteractionRect,
} from "@/common/features/chat/stores/interaction.store";

export interface ClickableAgentAvatarProps {
  agent: AgentDef | undefined;
  avatar: string;
  name: string;
  isUser?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  onEditWithAI?: (agent: AgentDef) => void;
  showEditActions?: boolean;
  isResponding?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-9 h-9",
  lg: "w-10 h-10",
};

// 计算圆形轨迹的半径（基于头像大小）
const getOrbitRadius = (size: "sm" | "md" | "lg") => {
  const sizeMap = { sm: 14, md: 16, lg: 18 };
  return sizeMap[size];
};

export function ClickableAgentAvatar({
  agent,
  avatar,
  name,
  isUser = false,
  size = "md",
  className,
  onEditWithAI,
  showEditActions = false,
  isResponding = false,
}: ClickableAgentAvatarProps) {
  const router = useRouter();
  const sizeClass = sizeClasses[size];
  const [open, setOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveringRef = useRef(false);

  // user 头像 callback ref → state，避免 React Compiler ref 污染
  const [userElement, setUserElement] = useState<HTMLSpanElement | null>(null);
  const attachUserAvatar = useCallback((node: HTMLSpanElement | null) => {
    setUserElement(node);
  }, []);

  // agent 头像 callback ref → state
  const [agentElement, setAgentElement] = useState<HTMLButtonElement | null>(
    null,
  );
  const attachAgentAvatar = useCallback((node: HTMLButtonElement | null) => {
    setAgentElement(node);
  }, []);

  const agentControls = useAnimation();

  const triggerInteraction = useInteractionStore((s) => s.triggerInteraction);
  const setUserAvatarRect = useInteractionStore((s) => s.setUserAvatarRect);
  const setAgentAvatarRect = useInteractionStore((s) => s.setAgentAvatarRect);
  const impactTimestamp = useInteractionStore((s) =>
    agent?.id ? s.impacts[agent.id] : 0,
  );

  // 同步 user 头像位置到 store
  useEffect(() => {
    if (!userElement) return;
    const updateRect = () => {
      const rect = userElement.getBoundingClientRect();
      const value: InteractionRect = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };
      setAgentAvatarRect("user", value);
      setUserAvatarRect(value);
    };
    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
      setAgentAvatarRect("user", null);
      setUserAvatarRect(null);
    };
  }, [userElement, setAgentAvatarRect, setUserAvatarRect]);

  // 同步 agent 头像位置到 store
  useEffect(() => {
    const id = agent?.id;
    if (!id || !agentElement) return;
    const updateRect = () => {
      const rect = agentElement.getBoundingClientRect();
      const value: InteractionRect = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };
      setAgentAvatarRect(id, value);
    };
    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
      setAgentAvatarRect(id, null);
    };
  }, [agent?.id, agentElement, setAgentAvatarRect]);

  // 被击中时触发抖动动画
  useEffect(() => {
    if (impactTimestamp > 0) {
      agentControls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4 },
      });
    }
  }, [impactTimestamp, agentControls]);

  const handleDoubleClick = useCallback(() => {
    const id = agent?.id;
    if (!id || !agentElement) return;
    const rect = agentElement.getBoundingClientRect();
    const types: ("poop" | "trash")[] = ["poop", "trash"];
    const randomType = types[Math.floor(Math.random() * types.length)];
    triggerInteraction({
      sourceAgentId: "user",
      targetAgentId: id,
      targetRect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      },
      type: randomType,
    });
  }, [agent?.id, agentElement, triggerInteraction]);

  // 点击头像跳转到详情页
  const handleViewDetail = useCallback(
    (agentId: string) => {
      setOpen(false);
      router.push(`/agents/${agentId}`);
    },
    [router],
  );

  // Hover 进入时打开
  const handleMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpen(true);
  }, []);

  // Hover 离开时延迟关闭
  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  }, []);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (!nextOpen && isHoveringRef.current) {
      return;
    }
    setOpen(nextOpen);
  }, []);

  if (isUser || !agent) {
    // For user, always show text avatar (no image)
    return (
      <span ref={attachUserAvatar} className="inline-flex">
        <SmartAvatar
          src={avatar || undefined}
          alt={name}
          className={cn(
            sizeClass,
            "shrink-0 bg-gradient-to-br from-primary/80 to-primary",
            className,
          )}
          fallback={
            <span className="text-white text-xs font-medium">
              {name[0] || "我"}
            </span>
          }
        />
      </span>
    );
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <motion.button
          ref={attachAgentAvatar}
          animate={agentControls}
          className="cursor-pointer hover:opacity-80 transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 active:scale-95 relative"
          aria-label={`查看 ${name} 的详细信息`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onDoubleClick={handleDoubleClick}
        >
          {/* 响应时的圆形轨迹动画 - 优雅的光点沿着边框移动 */}
          {isResponding && (
            <div className="absolute inset-0 rounded-full overflow-visible pointer-events-none z-0">
              {/* 移动的光点 - 沿着圆形轨迹 */}
              <div
                className="absolute w-2 h-2 rounded-full bg-primary animate-orbit"
                style={
                  {
                    top: "50%",
                    left: "50%",
                    marginTop: "-4px",
                    marginLeft: "-4px",
                    "--radius": `${getOrbitRadius(size)}px`,
                    boxShadow:
                      "0 0 6px 2px hsl(var(--primary) / 0.6), 0 0 12px 4px hsl(var(--primary) / 0.3)",
                  } as React.CSSProperties
                }
              />
            </div>
          )}
          <SmartAvatar
            src={avatar}
            alt={name}
            className={cn(
              sizeClass,
              "shrink-0 relative z-10 transition-all duration-300",
              "ring-2 ring-transparent hover:ring-primary/40",
              isResponding
                ? "ring-primary/40 shadow-md"
                : "hover:scale-105 shadow-sm hover:shadow-md",
              className,
            )}
            fallback={<span className="text-white text-xs">{name[0]}</span>}
          />
        </motion.button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 border shadow-xl bg-popover/95 backdrop-blur-sm"
        align="start"
        sideOffset={8}
        side="right"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <AgentInfoCard
          agent={agent}
          variant="compact"
          showPrompt={false}
          className="border-0 shadow-none"
          onEditWithAI={onEditWithAI}
          showEditActions={showEditActions}
          onViewDetail={handleViewDetail}
        />
      </PopoverContent>
    </Popover>
  );
}
