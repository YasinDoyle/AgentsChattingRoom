import { forwardRef } from "react";
import { MessageInputDesktop } from "./message-input-desktop";

export interface MessageInputRef {
  setValue: (value: string) => void;
  focus: () => void;
}

interface MessageInputProps {
  className?: string;
  isFirstMessage?: boolean;
}

export const MessageInput = forwardRef<MessageInputRef, MessageInputProps>(
  function MessageInput(props, ref) {
    return <MessageInputDesktop {...props} ref={ref} />;
  },
);
