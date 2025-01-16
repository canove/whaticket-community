import { useState, createContext } from "react";
import type { ReactNode } from "react";

interface ReplyMessageContextType {
  replyingMessage: string | null;
  setReplyingMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

const ReplyMessageContext = createContext<ReplyMessageContextType | null>(null);

const ReplyMessageProvider = ({ children }: { children: ReactNode }) => {
  const [replyingMessage, setReplyingMessage] = useState<string | null>(null);

  return (
    <ReplyMessageContext.Provider
      value={{ replyingMessage, setReplyingMessage }}
    >
      {children}
    </ReplyMessageContext.Provider>
  );
};

export { ReplyMessageContext, ReplyMessageProvider };
