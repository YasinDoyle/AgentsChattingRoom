import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";
import { AgentDef } from "@/common/types/agent";
import {
  Bot,
  Brain,
  Edit3,
  Info,
  Sparkles,
  Target,
  User,
  X,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";

interface FloatingAgentInfoProps {
  agent: AgentDef;
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
  autoHide?: boolean;
  className?: string;
}

export function FloatingAgentInfo({
  agent,
  isVisible,
  onVisibilityChange,
  autoHide = true,
  className,
}: FloatingAgentInfoProps) {
  const handleToggle = () => {
    onVisibilityChange(!isVisible);
  };

  const handleClose = () => {
    onVisibilityChange(false);
  };

  const [copied, setCopied] = useState(false);
  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(agent.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRoleConfig = (role?: string) => {
    switch (role) {
      case "moderator":
        return {
          icon: Bot,
          color: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-50 dark:bg-amber-950/50",
          borderColor: "border-amber-200 dark:border-amber-800",
          label: "主持人",
        };
      case "participant":
        return {
          icon: Bot,
          color: "text-emerald-600 dark:text-emerald-400",
          bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
          borderColor: "border-emerald-200 dark:border-emerald-800",
          label: "参与者",
        };
      default:
        return {
          icon: Sparkles,
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-50 dark:bg-blue-950/50",
          borderColor: "border-blue-200 dark:border-blue-800",
          label: "智能体",
        };
    }
  };

  const roleConfig = getRoleConfig(agent.role);

  return (
    <>
      {/* 悬浮按钮 - 始终显示 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className={cn(
          "absolute top-4 right-4 z-10 transition-all duration-200",
          "text-muted-foreground hover:text-foreground",
          isVisible && "text-primary",
          className,
        )}
      >
        <Info className="w-4 h-4" />
        <span className="hidden sm:inline ml-2 text-xs">
          {isVisible ? "隐藏信息" : "查看信息"}
        </span>
      </Button>

      {/* 信息面板 - 在header下方展开 */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isVisible ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="border-b bg-muted/30">
          <div className="p-6">
            {/* 头部信息 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-foreground">
                  {agent.name}
                </h3>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs px-2 py-1",
                    roleConfig.borderColor,
                    roleConfig.bgColor,
                    roleConfig.color,
                  )}
                >
                  {roleConfig.label}
                </Badge>
                <div
                  className="group/id flex items-center gap-2 px-2.5 py-1 rounded-lg bg-muted/50 hover:bg-primary/5 hover:border-primary/30 cursor-pointer transition-all border border-border/50 ml-1"
                  onClick={handleCopyId}
                  title="复制 Agent ID"
                >
                  <span className="text-[11px] font-mono text-muted-foreground/80 group-hover/id:text-primary transition-colors">
                    ID: {agent.id}
                  </span>
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-muted-foreground/40 group-hover/id:text-primary/60 transition-colors" />
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="w-8 h-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* 描述信息 */}
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {agent.personality || "一个智能助手，随时为您提供帮助"}
            </p>

            {/* 详细信息网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 左侧信息 */}
              <div className="space-y-3">
                {/* 性格特征 */}
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground mb-1">
                      性格特征
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      {agent.personality || "友善、专业、乐于助人"}
                    </div>
                  </div>
                </div>

                {/* 回应风格 */}
                <div className="flex items-start gap-3">
                  <Target className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground mb-1">
                      回应风格
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      {agent.responseStyle || "友好专业"}
                    </div>
                  </div>
                </div>
              </div>

              {/* 右侧信息 */}
              <div className="space-y-3">
                {/* 专业技能 */}
                <div className="flex items-start gap-3">
                  <Brain className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground mb-1">
                      专业技能
                    </div>
                    {agent.expertise && agent.expertise.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {agent.expertise.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs px-1.5 py-0"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        通用智能助手
                      </div>
                    )}
                  </div>
                </div>

                {/* 系统提示词预览 */}
                {agent.prompt && (
                  <div className="flex items-start gap-3">
                    <Edit3 className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground mb-1">
                        系统提示
                      </div>
                      <div className="max-h-20 overflow-y-auto">
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          {agent.prompt}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 底部提示 */}
            {autoHide && (
              <div className="mt-4 pt-3 border-t border-border/50">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 inline-block">
                    💡 发送消息时会自动隐藏
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
