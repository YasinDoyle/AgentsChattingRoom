import { useCallback, useState } from "react";

/**
 * 可插拔的聊天消息缓存 Hook
 * @param cacheKey 缓存唯一 key
 * @returns { initialMessages, handleMessagesChange }
 */
export function useChatMessageCache<T = unknown>(cacheKey: string) {
  // 惰性初始化：只在首次渲染时执行，从 localStorage 恢复缓存
  const [initialMessages] = useState<T[]>(() => {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) return JSON.parse(raw) as T[];
    } catch {
      /* ignore */
    }
    return [];
  });

  // 消息变更时自动缓存
  const handleMessagesChange = useCallback(
    (messages: T[]) => {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(messages));
      } catch {
        /* ignore */
      }
    },
    [cacheKey],
  );

  return {
    initialMessages,
    handleMessagesChange,
  };
}
