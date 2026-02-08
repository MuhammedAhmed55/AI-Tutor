"use client";

import * as React from "react";
import { UIMessage } from "ai";
import { FormattedText } from "./formatted-text";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ClaudeChatMessagesProps {
  messages: UIMessage[];
  isLoading: boolean;
  isStreaming?: boolean;
}

export function ClaudeChatMessages({
  messages,
  isLoading,
  isStreaming = false,
}: ClaudeChatMessagesProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change (including during streaming)
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col gap-3 md:gap-6 px-3 md:px-8 py-3 md:py-4 pb-4 md:pb-6 max-w-3xl mx-auto">
        {messages.map((message, index) => {
          const rawContent =
            message.parts
              ?.filter((part) => part.type === "text")
              .map((part) => (part as { type: "text"; text: string }).text)
              .join("") || "";

          // Check if this is the last message and if it's currently streaming
          const isLastMessage = index === messages.length - 1;
          const isCurrentlyStreaming =
            isLastMessage && isStreaming && message.role === "assistant";

          // Parse JSON response and extract description for assistant messages
          let messageContent = rawContent;
          if (message.role === "assistant" && rawContent.trim()) {
            try {
              const trimmed = rawContent.trim();

              // First, try to parse as complete JSON
              if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
                const parsed = JSON.parse(rawContent);
                if (parsed && typeof parsed.description === "string") {
                  messageContent = parsed.description;
                }
              } else if (isCurrentlyStreaming && trimmed.startsWith("{")) {
                // During streaming with incomplete JSON, extract description value using regex
                // This pattern matches: "description": "value" even if the JSON is incomplete
                const match = rawContent.match(
                  /"description"\s*:\s*"((?:[^"\\]|\\.|\\[^"])*)/
                );
                if (match && match[1]) {
                  // Unescape the extracted value
                  messageContent = match[1]
                    .replace(/\\n/g, "\n")
                    .replace(/\\t/g, "\t")
                    .replace(/\\r/g, "\r")
                    .replace(/\\"/g, '"')
                    .replace(/\\\\/g, "\\");
                } else {
                  // If we can't extract, show empty to avoid showing raw JSON structure
                  messageContent = "";
                }
              }
            } catch {
              // If parsing fails and we're streaming, don't show raw JSON
              if (isCurrentlyStreaming) {
                messageContent = "";
              } else {
                messageContent = rawContent;
              }
            }
          }

          const isUser = message.role === "user";

          // Get timestamp from metadata or use current time
          const messageTime = (
            message.metadata as { timestamp?: Date | string }
          )?.timestamp
            ? new Date(
                (message.metadata as { timestamp: Date | string }).timestamp!
              )
            : new Date();

          return (
            <div
              key={message.id}
              className={cn(
                "flex gap-2 md:gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300",
                isUser ? "justify-end" : "justify-start"
              )}
            >
              {/* Avatar */}
              {/* <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                  isUser ? "bg-primary/10 order-2" : "bg-muted order-1"
                )}
              >
                {isUser ? (
                  <User className="h-4 w-4 text-primary" />
                ) : (
                  <Bot className="h-4 w-4 text-foreground" />
                )}
              </div> */}

              {/* Message Content */}
              <div
                className={cn(
                  "flex flex-col gap-1 md:gap-1.5 max-w-[90%] md:max-w-[85%] lg:max-w-[75%]",
                  isUser ? "items-end order-1" : "items-start order-2"
                )}
              >
                <div
                  className={cn(
                    "rounded-2xl px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-[15px] leading-relaxed",
                    isUser
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted rounded-bl-sm text-foreground"
                  )}
                >
                  <FormattedText content={messageContent} />
                </div>
                {/* Timestamp */}
                {/* <span className="text-xs text-muted-foreground px-1.5 mt-0.5">
                  {format(messageTime, "h:mm a")}
                </span> */}
              </div>
            </div>
          );
        })}

        {/* Typing indicator - only show when submitted but not yet streaming */}
        {/* Once streaming starts, the message will be in the messages array and rendered */}
        {isLoading &&
          !isStreaming &&
          (messages.length === 0 ||
            messages[messages.length - 1]?.role !== "assistant") && (
            <div className="flex gap-2 md:gap-4 justify-start animate-in fade-in slide-in-from-bottom-2">
              <div className="flex flex-col gap-2">
                <div className="bg-muted rounded-2xl rounded-bl-md px-3 py-2.5 md:px-4 md:py-3">
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" />
                  </div>
                </div>
              </div>
            </div>
          )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
