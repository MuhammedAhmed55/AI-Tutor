"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUp, Loader2, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClaudeChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder?: string;
  selectedBot: string;
  onBotChange: (bot: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onManageKey?: () => void;
}

const models = [
  {
    id: "gpt-4o-mini",
    name: "OpenAI - GPT-4o Mini",
    description: "OpenAI ChatGPT model for everyday tasks",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    description: "Google Gemini model for fast responses",
  },
];

export function ClaudeChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder = "Ask me anything...",
  selectedBot,
  onBotChange,
  selectedModel,
  onModelChange,
  onManageKey,
}: ClaudeChatInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const isMobile = window.innerWidth < 768;
      const maxHeight = isMobile ? 128 : 240; // 32*4=128px mobile, 60*4=240px desktop
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        maxHeight
      )}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (value.trim() && !isLoading) {
      onSubmit();
    }
  };

  const chatbots = [
    { id: "general", name: "General Assistant" },
    { id: "support", name: "Support Bot" },
    { id: "sales", name: "Sales Bot" },
  ];

  const hasContent = value.trim().length > 0;

  const selectedBotData =
    chatbots.find((bot) => bot.id === selectedBot) || chatbots[0];

  return (
    <div className="bg-background border-t md:border-t-0">
      <div className="mx-auto max-w-3xl px-2 py-2 md:px-4 md:py-3">
        {/* Main Input Container - Claude Style */}
        <div
          onClick={() => textareaRef.current?.focus()}
          className={cn(
            "flex flex-col items-stretch transition-all duration-200 relative rounded-xl md:rounded-2xl cursor-text",
            "border shadow-sm md:shadow-[0_0_15px_rgba(0,0,0,0.08)] dark:md:shadow-[0_0_15px_rgba(0,0,0,0.3)]",
            "hover:shadow-md md:hover:shadow-[0_0_20px_rgba(0,0,0,0.12)] dark:hover:md:shadow-[0_0_20px_rgba(0,0,0,0.4)]",
            "focus-within:shadow-md md:focus-within:shadow-[0_0_25px_rgba(0,0,0,0.15)] dark:focus-within:md:shadow-[0_0_25px_rgba(0,0,0,0.5)]",
            "bg-background border-border dark:border-[#30302E] dark:bg-[#30302E]"
          )}
        >
          <div className="flex flex-col px-2.5 md:px-3 pt-2 md:pt-3 pb-1.5 md:pb-2 gap-1.5 md:gap-2">
            {/* Input Area */}
            <div className="relative mb-0.5 md:mb-1">
              <div className="max-h-32 md:max-h-60 w-full overflow-y-auto min-h-8 md:min-h-10 pl-0.5 md:pl-1">
                <Textarea
                  ref={textareaRef}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  disabled={isLoading}
                  className="w-full bg-transparent border-0 outline-none text-foreground text-sm md:text-base placeholder:text-muted-foreground resize-none overflow-hidden py-1 md:py-0 leading-relaxed block font-normal min-h-[1.5em] focus-visible:ring-0 focus-visible:ring-offset-0"
                  rows={1}
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex gap-1 md:gap-2 w-full items-center">
              {/* Left Tools */}
              <div className="relative flex-1 flex items-center shrink min-w-0 gap-1">
                {/* Attach Button */}
                {/* <button
                  type="button"
                  className="inline-flex items-center justify-center relative shrink-0 transition-colors duration-200 h-8 w-8 rounded-lg active:scale-95 text-muted-foreground hover:text-foreground hover:bg-muted"
                  aria-label="Attach file"
                >
                  <Plus className="w-5 h-5" />
                </button> */}

                {/* Extended Thinking Toggle */}
                {/* <Select value={selectedBot} onValueChange={onBotChange}>
                  <SelectTrigger className="h-9 w-max">
                    <SelectValue>
                      <span className="text-foreground">
                        {selectedBotData.name}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent align="start" className="w-[240px]">
                    {chatbots.map((bot) => (
                      <SelectItem
                        key={bot.id}
                        value={bot.id}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col gap-0.5 py-1">
                          <span className="text-sm">{bot.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select> */}
              </div>

              {/* Right Tools */}
              <div className="flex flex-row items-center min-w-0 gap-1">
                {onManageKey && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 md:h-8 md:w-8 rounded-lg md:rounded-xl shrink-0"
                    onClick={onManageKey}
                    aria-label="Manage API key"
                  >
                    <KeyRound className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Button>
                )}
                {/* Model Selector */}
                <Select value={selectedModel} onValueChange={onModelChange}>
                  <SelectTrigger className="h-7 md:h-8 w-auto min-w-[100px] md:min-w-[120px] text-xs md:text-sm">
                    <SelectValue>
                      {models.find((m) => m.id === selectedModel)?.name ||
                        "GPT-4.1-Nano"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-w-[280px] md:max-w-none">
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs md:text-sm">{model.name}</span>
                          <span className="text-[10px] md:text-xs text-muted-foreground">
                            {model.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Send Button */}
                <Button
                  onClick={handleSubmit}
                  size="icon"
                  disabled={!hasContent || isLoading}
                  className={cn("h-7 w-7 md:h-8 md:w-8 rounded-lg md:rounded-xl shrink-0")}
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" />
                  ) : (
                    <ArrowUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
