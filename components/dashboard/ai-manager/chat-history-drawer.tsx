"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatDate } from "@/lib/utils";
import { Bot, PlusIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EmptyState } from "@/components/ui/empty-state";

interface ChatHistory {
  id: string;
  title: string;
  description?: string;
  updatedAt: Date;
}

interface ChatHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: ChatHistory[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
}

export function ChatHistoryDrawer({
  open,
  onOpenChange,
  history,
  activeChatId,
  onSelectChat,
  onNewChat,
}: ChatHistoryDrawerProps) {
  const handleSelectChat = (id: string) => {
    onSelectChat(id);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[85vw] sm:w-[400px] max-w-[400px] p-0">
        <SheetHeader className="px-3 md:px-4 py-3 md:py-4 border-b">
          <SheetTitle className="text-base md:text-lg">Chat History</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100vh-65px)] md:h-[calc(100vh-73px)]">
          <div className="px-3 md:px-4 py-3 md:pb-4 border-b">
            <Button
              onClick={() => {
                onNewChat();
                onOpenChange(false);
              }}
              className="w-full h-8 md:h-9 text-sm"
              size="sm"
            >
              <PlusIcon className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
              New Chat
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2">
              {history.length === 0 ? (
                <EmptyState
                  icon={<Bot className="text-primary" />}
                  title="No chat history yet"
                  description="Start a new conversation to see it here"
                />
              ) : (
                <div className="space-y-1 h-[calc(100vh-140px)] overflow-y-auto">
                  {history.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                      className={cn(
                        "w-full text-left p-2.5 md:p-3 rounded-lg transition-colors",
                        "hover:bg-muted focus:bg-muted focus:outline-none active:scale-[0.98]",
                        activeChatId === chat.id && "bg-muted"
                      )}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="font-medium text-xs md:text-sm truncate min-w-0 w-full">
                            {chat.title}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{chat.title}</TooltipContent>
                      </Tooltip>
                      {chat.description && (
                        <div className="text-[10px] md:text-xs text-muted-foreground truncate mb-1 min-w-0 w-full">
                          {chat.description}
                        </div>
                      )}
                      <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                        {formatDate(chat.updatedAt)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
