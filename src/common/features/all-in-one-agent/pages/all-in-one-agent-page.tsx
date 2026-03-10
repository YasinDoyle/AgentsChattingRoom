"use client";
import type { Suggestion } from "@/common/features/chat/components/suggestions/suggestion.types";
import {
  WorldClassChatContainer,
  WorldClassChatContainerRef,
} from "@/common/features/world-class-chat";
import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import { useProvideAgentTools } from "@/common/hooks/use-provide-agent-tools";
import { AgentDef } from "@/common/types/agent";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@/core/hooks/use-i18n";
import { calculatorTool, weatherTool } from "../components/agent-tools";
import { createClearSuggestionsTool } from "../components/agent-tools/clear-suggestions.tool";
import { fileSystemTool } from "../components/agent-tools/file-system.tool";
import { getCurrentTimeTool } from "../components/agent-tools/get-current-time.tool";
import { createHtmlPreviewFromFileTool } from "../components/agent-tools/html-preview-from-file.tool";
import { createProvideNextStepsTool } from "../components/agent-tools/provide-next-steps.tool";
import { createRecommendTopicsTool } from "../components/agent-tools/recommend-topics.tool";
import { createRequestUserChoiceTool } from "../components/agent-tools/request-user-choice.tool";
import { createSendMessageToIframeTool } from "../components/agent-tools/send-message-to-iframe.tool";
import { createSubscribeIframeMessagesTool } from "../components/agent-tools/subscribe-iframe-messages.tool";

export function AllInOneAgentPage() {
  const { t } = useTranslation();
  const chatRef = useRef<WorldClassChatContainerRef>(null);

  const AGENT_DEF: AgentDef = useMemo(
    () => ({
      id: "atlas-all-in-one",
      name: t("allInOneAgent.name"),
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Atlas",
      prompt: t("allInOneAgent.prompt"),
      role: "participant",
      personality: t("allInOneAgent.personality"),
      expertise: [
        t("allInOneAgent.expertise.globalControl"),
        t("allInOneAgent.expertise.aiAssistant"),
        t("allInOneAgent.expertise.systemManagement"),
      ],
      bias: t("allInOneAgent.bias"),
      responseStyle: t("allInOneAgent.responseStyle"),
    }),
    [t],
  );

  // 默认的 suggestions
  const DEFAULT_SUGGESTIONS: Suggestion[] = useMemo(
    () => [
      {
        id: "1",
        type: "question",
        actionName: t("allInOneAgent.suggestions.whatCanYouDo"),
        content: t("allInOneAgent.suggestions.whatCanYouDo"),
      },
      {
        id: "2",
        type: "action",
        actionName: t("allInOneAgent.suggestions.clearChat"),
        content: t("allInOneAgent.suggestions.clearChat"),
      },
      {
        id: "3",
        type: "question",
        actionName: t("allInOneAgent.suggestions.summarizeToday"),
        content: t("allInOneAgent.suggestions.summarizeToday"),
      },
      {
        id: "4",
        type: "question",
        actionName: t("allInOneAgent.suggestions.recommendTools"),
        content: t("allInOneAgent.suggestions.recommendTools"),
      },
    ],
    [t],
  );

  // 用 useState + useEffect 创建工具实例，确保所有闭包（包括访问 chatRef.current 的部分）
  // 都在 useEffect 中生成，而非 render 阶段。这符合 React Compiler 的要求：
  // ref.current 只能在 effect / 事件处理器中访问，不能在 render 期间访问。
  const [refDependentTools, setRefDependentTools] = useState<{
    htmlPreviewFromFile: AgentTool;
    subscribeIframeMessages: AgentTool;
    sendMessageToIframe: AgentTool;
    requestUserChoice: AgentTool;
    recommendTopics: AgentTool;
    provideNextSteps: AgentTool;
    clearSuggestions: AgentTool;
  } | null>(null);

  useEffect(() => {
    setRefDependentTools({
      htmlPreviewFromFile: createHtmlPreviewFromFileTool(
        (key, config, props) =>
          chatRef.current?.openCustomPanel(key, config, props) ?? null,
        () => chatRef.current?.iframeManager ?? null,
      ),
      subscribeIframeMessages: createSubscribeIframeMessagesTool(
        () => chatRef.current?.iframeManager ?? null,
        () => chatRef.current?.addMessages ?? null,
      ),
      sendMessageToIframe: createSendMessageToIframeTool(
        () => chatRef.current?.iframeManager ?? null,
      ),
      requestUserChoice: createRequestUserChoiceTool(
        () => chatRef.current?.suggestionsManager ?? null,
      ),
      recommendTopics: createRecommendTopicsTool(
        () => chatRef.current?.suggestionsManager ?? null,
      ),
      provideNextSteps: createProvideNextStepsTool(
        () => chatRef.current?.suggestionsManager ?? null,
      ),
      clearSuggestions: createClearSuggestionsTool(
        () => chatRef.current?.suggestionsManager ?? null,
      ),
    });
    // chatRef is stable (useRef), so this effect runs only once after mount
  }, []);

  // 基础工具列表：静态工具始终可用，依赖 ref 的工具在 mount 后才注入
  const baseTools: AgentTool[] = useMemo(
    () => [
      getCurrentTimeTool,
      weatherTool,
      calculatorTool,
      fileSystemTool,
      ...(refDependentTools
        ? [
            refDependentTools.htmlPreviewFromFile,
            refDependentTools.subscribeIframeMessages,
            refDependentTools.sendMessageToIframe,
            refDependentTools.requestUserChoice,
            refDependentTools.recommendTopics,
            refDependentTools.provideNextSteps,
            refDependentTools.clearSuggestions,
          ]
        : []),
    ],
    [refDependentTools],
  );

  // 提供工具给 agent
  useProvideAgentTools(baseTools);

  // 处理 suggestions 管理
  useEffect(() => {
    if (chatRef.current) {
      // 这里可以添加动态 suggestions 管理逻辑
      // 例如：根据对话内容动态添加相关建议
      // 或者：根据用户行为模式调整建议
      // const { suggestionsManager } = chatRef.current;
    }
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif",
      }}
    >
      <WorldClassChatContainer
        ref={chatRef}
        agentDef={AGENT_DEF}
        initialSuggestions={DEFAULT_SUGGESTIONS}
      />
    </div>
  );
}

export default AllInOneAgentPage;
