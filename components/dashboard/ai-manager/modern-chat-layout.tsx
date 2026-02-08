"use client";

import * as React from "react";
import { ChatHistoryDrawer } from "./chat-history-drawer";
import { ClaudeChatMessages } from "./chat-messages";
import { ClaudeChatInput } from "./chat-input";
import { ChatWelcome } from "./chat-welcome";
import { useConversation } from "./conversation-provider";
import { Button } from "@/components/ui/button";
import { HistoryIcon, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export function ModernChatLayout() {
  const [selectedBot, setSelectedBot] = React.useState("general");
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [selectedModel, setSelectedModel] = React.useState("gpt-4o-mini");
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = React.useState(false);
  const [apiKeyInput, setApiKeyInput] = React.useState("");
  const [pendingModel, setPendingModel] = React.useState<string | null>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    isStreaming,
    conversations,
    currentConversationId,
    createNewConversation,
    selectConversation,
    messageLoading,
    isCreatingNewConversation,
    errorMessage,
  } = useConversation();

  const getProviderFromModel = React.useCallback((model: string) => {
    const lower = model.toLowerCase();
    if (lower.startsWith("gpt")) return "openai";
    if (lower.includes("gemini")) return "gemini";
    return null;
  }, []);

  // Ensure we have a key for the initial model (if one was already stored)
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const provider = getProviderFromModel(selectedModel);
    if (!provider) return;
    const existingKey = window.localStorage.getItem(
      `ai-api-key:${provider}`
    );
    if (!existingKey) {
      setPendingModel(selectedModel);
      setApiKeyDialogOpen(true);
    }
  }, [selectedModel, getProviderFromModel]);

  // Format conversations for history drawer
  const chatHistory = React.useMemo(() => {
    return conversations.map((conv) => ({
      id: conv.id,
      title: conv.title,
      description: conv.description ?? undefined,
      updatedAt: conv.updatedAt ? new Date(conv.updatedAt) : new Date(),
    }));
  }, [conversations]);

  const handleNewChat = () => {
    createNewConversation();
    // Focus will be handled by the input component
  };

  const handleSuggestionClick = (suggestionText: string) => {
    // Pre-fill input with suggestion
    const event = {
      target: { value: suggestionText },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    handleInputChange(event);
    // Focus the input
    setTimeout(() => {
      const textarea = document.querySelector(
        'textarea[placeholder*="How can I help"]'
      ) as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(
          textarea.value.length,
          textarea.value.length
        );
      }
    }, 100);
  };

  const showWelcome = messages.length === 0 && !isLoading;

  return (
    <div className="flex h-[calc(100vh-110px)] md:h-[calc(100vh-120px)] flex-col bg-background relative">
      {/* Header with History Button */}
      <div className="absolute top-[-8px] md:top-0 md:right-4 z-20 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setHistoryOpen(true)}
          aria-label="Open chat history"
          className="h-8 w-8 md:h-10 md:w-10"
        >
          <HistoryIcon className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
        </Button>
      </div>

      <ChatHistoryDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        history={chatHistory}
        activeChatId={currentConversationId}
        onSelectChat={selectConversation}
        onNewChat={handleNewChat}
      />

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-hidden  md:pt-4">
        {messageLoading || isCreatingNewConversation ? (
          <div className="flex h-full justify-center items-center">
            <Loader2 className="h-8 w-8 md:h-10 md:w-10 animate-spin" />
          </div>
        ) : showWelcome ? (
          <div className="h-full overflow-y-auto">
            <ChatWelcome
              onStartChat={handleNewChat}
              onSuggestionClick={handleSuggestionClick}
            />
          </div>
        ) : (
          <ClaudeChatMessages
            messages={messages}
            isLoading={isLoading}
            isStreaming={isStreaming}
          />
        )}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="px-2 md:px-4 pb-1 md:pb-2 shrink-0">
          <Alert variant="destructive" className="text-xs md:text-sm">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Input Area - Fixed at Bottom */}
      <div className="shrink-0 relative top-[14px] md:top-0">
        <ClaudeChatInput
          value={input}
          onChange={(value) => {
            const event = {
              target: { value },
            } as React.ChangeEvent<HTMLTextAreaElement>;
            handleInputChange(event);
          }}
          onSubmit={() => {
            const form = document.createElement("form");
            form.dataset.model = selectedModel;
            const event = {
              preventDefault: () => {},
              target: form,
            } as unknown as React.FormEvent<HTMLFormElement>;
            handleSubmit(event);
          }}
          isLoading={isLoading}
          selectedBot={selectedBot}
          onBotChange={setSelectedBot}
          selectedModel={selectedModel}
          onModelChange={(model) => {
            setSelectedModel(model);
            if (typeof window === "undefined") return;
            const provider = getProviderFromModel(model);
            if (!provider) return;
            const existingKey = window.localStorage.getItem(
              `ai-api-key:${provider}`
            );
            if (!existingKey) {
              setPendingModel(model);
              setApiKeyInput("");
              setApiKeyDialogOpen(true);
            }
          }}
          onManageKey={() => {
            if (typeof window === "undefined") return;
            const provider = getProviderFromModel(selectedModel);
            if (provider) {
              const existingKey = window.localStorage.getItem(
                `ai-api-key:${provider}`
              );
              setApiKeyInput(existingKey || "");
              setPendingModel(selectedModel);
            } else {
              setApiKeyInput("");
              setPendingModel(null);
            }
            setApiKeyDialogOpen(true);
          }}
        />
      </div>

      <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">Enter API key</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Provide your API key for the selected model. It will be stored
              securely in your browser&apos;s local storage and used only from
              your device.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 md:space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="api-key" className="text-sm md:text-base">API key</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="sk-..."
                className="text-sm md:text-base"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setApiKeyDialogOpen(false);
                  setPendingModel(null);
                }}
                className="text-xs md:text-sm h-8 md:h-10"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (typeof window === "undefined") return;
                  const model = pendingModel || selectedModel;
                  const provider = getProviderFromModel(model);
                  if (!provider || !apiKeyInput.trim()) {
                    return;
                  }
                  window.localStorage.setItem(
                    `ai-api-key:${provider}`,
                    apiKeyInput.trim()
                  );
                  setApiKeyDialogOpen(false);
                  setPendingModel(null);
                  toast.success("API key saved successfully");
                }}
                className="text-xs md:text-sm h-8 md:h-10"
              >
                Save key
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
