import type { AgentTool } from "@/common/hooks/use-provide-agent-tools";
import type { ToolCall } from "@agent-labs/agent-chat";
import { SidePanelConfig } from "@/common/features/world-class-chat/hooks/use-side-panel-manager";
import { WorldClassChatHtmlPreview } from "@/common/features/world-class-chat/components/world-class-chat-html-preview";
import { useIframeManager } from "@/common/features/world-class-chat/hooks/use-iframe-manager";
import { defaultFileManager } from "@/common/lib/file-manager.service";
import { i18n } from "@/core/hooks/use-i18n";

export interface HtmlPreviewFromFileToolParams {
  filePath: string;
}

export interface HtmlPreviewFromFileToolResult {
  success: boolean;
  message: string;
  htmlContent?: string;
  iframeId?: string;
  error?: string;
}

// 读取 HTML 文件的函数
async function readHtmlFile(
  filePath: string,
): Promise<{ success: boolean; htmlContent?: string; error?: string }> {
  try {
    // 使用真实的文件系统读取文件
    const readResult = await defaultFileManager.readFile(filePath);

    if (!readResult.success) {
      return {
        success: false,
        error:
          readResult.error || i18n.t("tool.htmlPreviewFromFile.fileReadError"),
      };
    }

    const fileData = readResult.data as
      | { content: string; path: string; size: number; modifiedTime: Date }
      | undefined;
    const htmlContent = fileData?.content;

    if (!htmlContent) {
      return {
        success: false,
        error: i18n.t("tool.htmlPreviewFromFile.fileContentEmpty"),
      };
    }

    // 检查文件内容是否包含 HTML 标签
    if (
      !htmlContent.includes("<html") &&
      !htmlContent.includes("<!DOCTYPE") &&
      !htmlContent.includes("<html")
    ) {
      return {
        success: false,
        error: i18n.t("tool.htmlPreviewFromFile.invalidHtmlFile"),
      };
    }

    return {
      success: true,
      htmlContent,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : i18n.t("tool.htmlPreviewFromFile.fileReadError"),
    };
  }
}

export function createHtmlPreviewFromFileTool(
  openCustomPanel: (
    key: string,
    config: SidePanelConfig,
    props?: unknown,
  ) => string | null,
  getIframeManager?: () => ReturnType<typeof useIframeManager> | null,
): AgentTool {
  let currentPreviewInfo: {
    filePath: string;
    htmlContent: string;
    panelKey: string;
    iframeId?: string;
  } | null = null;

  return {
    name: "previewHtmlFromFile",
    description: i18n.t("tool.htmlPreviewFromFile.description"),
    parameters: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: i18n.t("tool.htmlPreviewFromFile.filePathDescription"),
        },
      },
      required: ["filePath"],
    },
    async execute(toolCall: ToolCall) {
      const args = JSON.parse(toolCall.function.arguments);

      if (!args || !args.filePath) {
        return {
          toolCallId: toolCall.id,
          result: {
            success: false,
            message: i18n.t("tool.htmlPreviewFromFile.filePathNotSpecified"),
            error: i18n.t("tool.htmlPreviewFromFile.missingFilePathParam"),
          },
          status: "error" as const,
        };
      }

      // 读取文件内容
      const readResult = await readHtmlFile(args.filePath);

      if (!readResult.success) {
        return {
          toolCallId: toolCall.id,
          result: {
            success: false,
            message: i18n.t("tool.htmlPreviewFromFile.fileReadFailed"),
            error:
              readResult.error ||
              i18n.t("tool.htmlPreviewFromFile.unknownError"),
          },
          status: "error" as const,
        };
      }

      const htmlContent = readResult.htmlContent!;

      // 生成面板 key
      const panelKey = `html-preview-${Date.now()}`;

      // 获取 iframe 管理器
      const iframeManager = getIframeManager?.();

      // 存储当前预览信息
      currentPreviewInfo = {
        filePath: args.filePath,
        htmlContent,
        panelKey,
      };

      // 刷新回调函数
      const handleRefresh = async () => {
        if (!currentPreviewInfo) return;
        const refreshResult = await readHtmlFile(currentPreviewInfo.filePath);
        if (refreshResult.success && refreshResult.htmlContent) {
          // 更新存储的内容
          currentPreviewInfo.htmlContent = refreshResult.htmlContent;
          // 直接更新 iframe 内容，而不是重新创建面板
          if (iframeManager && currentPreviewInfo.iframeId) {
            const iframeElement = iframeManager.getElement(
              currentPreviewInfo.iframeId,
            );
            if (iframeElement && iframeElement.contentDocument) {
              iframeElement.contentDocument.open();
              iframeElement.contentDocument.write(refreshResult.htmlContent);
              iframeElement.contentDocument.close();
            }
          }
        } else {
          // 如果刷新失败，抛出错误
          throw new Error(
            refreshResult.error || i18n.t("tool.fileSystem.refreshFailed"),
          );
        }
      };

      // 打开自定义面板预览 HTML
      const returnedIframeId = openCustomPanel(
        panelKey,
        {
          key: panelKey,
          hideCloseButton: true,
          render: (_panelProps: unknown, close: () => void) => (
            <WorldClassChatHtmlPreview
              html={htmlContent}
              onClose={close}
              onRefresh={handleRefresh}
              showRefreshButton={true}
              iframeId={returnedIframeId || undefined}
              onIframeReady={(element: HTMLIFrameElement) => {
                if (iframeManager && returnedIframeId) {
                  iframeManager.registerElement(returnedIframeId, element);
                }
              }}
            />
          ),
        },
        { filePath: args.filePath },
      );

      // 使用返回的 iframe ID
      const finalIframeId = returnedIframeId;
      if (currentPreviewInfo) {
        currentPreviewInfo.iframeId = finalIframeId || undefined;
      }

      return {
        toolCallId: toolCall.id,
        result: {
          success: true,
          message: i18n.t("tool.htmlPreviewFromFile.previewSuccess", {
            filePath: args.filePath,
          }),
          htmlContent: htmlContent.substring(0, 200) + "...", // 只显示前200字符
          iframeId: finalIframeId || undefined,
        },
        status: "success" as const,
      };
    },
    render(toolCall: ToolCall & { result?: HtmlPreviewFromFileToolResult }) {
      return (
        <div
          style={{
            background: "#f1f5f9",
            borderRadius: 12,
            padding: "18px 24px",
            boxShadow: "0 2px 8px #6366f133",
            fontSize: 17,
            color: "#22223b",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 8,
            minWidth: 220,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: toolCall.result?.success ? "#0ea5e9" : "#ef4444",
              marginBottom: 4,
            }}
          >
            🖥️ {i18n.t("tool.htmlPreviewFromFile.title")}
          </div>
          <div style={{ fontSize: 15, color: "#64748b" }}>
            {toolCall.result?.success ? "✅ " : "❌ "}
            {toolCall.result?.message}
          </div>
          {toolCall.result?.error && (
            <div
              style={{
                fontSize: 14,
                color: "#ef4444",
                background: "#fef2f2",
                padding: "8px 12px",
                borderRadius: 6,
              }}
            >
              {i18n.t("tool.htmlPreviewFromFile.error")}:{" "}
              {toolCall.result.error}
            </div>
          )}
        </div>
      );
    },
  };
}
