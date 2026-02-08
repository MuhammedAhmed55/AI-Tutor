"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { useRouter, useSearchParams } from "next/navigation";
import { UIMessage, DefaultChatTransport } from "ai";
import { systemPrompt as baseSystemPrompt } from "./system-prompt";
import { useAuth } from "@/context/AuthContext";
import { aiMessagesService, aiConversationsService } from "@/modules";
import { toast } from "sonner";
// Custom fetch wrapper to intercept response headers
// According to AI SDK docs: https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat#usechat
// Headers are available immediately for streaming responses
function createHeaderInterceptingFetch(
  responseIdRef: React.MutableRefObject<string | null>
) {
  return async (url: RequestInfo | URL, options?: RequestInit) => {
    const response = await fetch(url, options);
    // Extract response ID from headers (headers are sent before the stream body)
    const responseId = response.headers.get("x-response-id");
    if (responseId) {
      responseIdRef.current = responseId;
    }
    return response;
  };
}

interface Conversation {
  id: string;
  title: string;
  messages: UIMessage[];
  previousResponseId?: string | null;
  updatedAt?: string;
  description?: string;
}

interface ConversationContextType {
  conversations: Conversation[];
  currentConversationId: string | null;
  createNewConversation: () => void;
  selectConversation: (id: string) => void;
  messages: UIMessage[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  isStreaming: boolean;
  messageLoading: boolean;
  isCreatingNewConversation: boolean;
  errorMessage: string | null;
}

const ConversationContext = React.createContext<
  ConversationContextType | undefined
>(undefined);

export function ConversationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = React.useState<
    string | null
  >(null);
  const [input, setInput] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [vectorContext, setVectorContext] = React.useState<string | null>(null);
  const { userProfile } = useAuth();
  // Use ref to track conversationId for onFinish callback (handles async creation)
  const conversationIdRef = React.useRef<string | null>(null);
  // Track if we're creating a new conversation to prevent message loading during first message
  const isCreatingNewConversationRef = React.useRef<boolean>(false);
  // Track response ID from headers
  const responseIdRef = React.useRef<string | null>(null);

  const [messageLoading, setMessageLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Fetch vector store context once on load and cache in state
  React.useEffect(() => {
    let isMounted = true;

    async function loadVectorContext() {
      try {
        const res = await fetch("/api/openai/vector-context");
        if (!res.ok) return;
        const data = (await res.json()) as { context?: string };
        if (isMounted && typeof data.context === "string") {
          setVectorContext(data.context);
        }
      } catch (error) {
        console.error("Failed to load vector context:", error);
      }
    }

    loadVectorContext();

    return () => {
      isMounted = false;
    };
  }, []);

  const enhancedSystemPrompt = React.useMemo(() => {
    if (!vectorContext) return baseSystemPrompt;
    return `${baseSystemPrompt}\n\n--- Knowledge Base Context ---\n${vectorContext}`;
  }, [vectorContext]);

  // Load conversationId from URL on mount
  React.useEffect(() => {
    const conversationIdFromUrl = searchParams?.get("conversationId");
    if (conversationIdFromUrl) {
      // Validate UUID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(conversationIdFromUrl)) {
        setCurrentConversationId(conversationIdFromUrl);
        conversationIdRef.current = conversationIdFromUrl;
      } else {
        // Clear conversationId from state and URL
        setCurrentConversationId(null);
        conversationIdRef.current = null;
        setMessages([]);
        router.replace("?", { scroll: false });
      }
    }
  }, [searchParams]);

  // Sync ref with state
  React.useEffect(() => {
    conversationIdRef.current = currentConversationId;
  }, [currentConversationId]);

  // Load conversations from DB on mount
  React.useEffect(() => {
    if (!userProfile?.id) return;

    async function loadConversations() {
      try {
        const { aiConversationsService } = await import("@/modules");
        if (!userProfile?.id) return;

        const data = await aiConversationsService.getUserConversations(
          userProfile.id
        );

        if (data.length > 0) {
          setConversations(
            data.map(
              (conv: {
                id: string;
                title: string;
                updatedAt: string;
                description?: string;
                previous_response_id?: string;
              }) => ({
                id: conv.id,
                title: conv.title,
                description: conv.description,
                messages: [],
                previousResponseId: conv.previous_response_id,
                updatedAt: conv.updatedAt,
              })
            )
          );
        } else {
          // No conversations yet, start with empty state (no conversationId)
          setCurrentConversationId(null);
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
      }
    }

    loadConversations();
  }, [userProfile?.id]);

  // Chat hook for the current conversation (AI SDK v6 API)
  // When currentConversationId is null, useChat will generate a new ID internally
  // We'll capture it after the first response completes
  // Use a stable ID to prevent reset during streaming - only change when not streaming
  const stableChatId = React.useMemo(() => {
    // If we're streaming, keep the current ID to prevent reset
    if (isStreaming) {
      return conversationIdRef.current || currentConversationId || undefined;
    }
    // Otherwise, use the current conversation ID
    return currentConversationId || conversationIdRef.current || undefined;
  }, [currentConversationId, isStreaming]);

  // Custom transport with fetch interceptor to capture response headers
  // According to AI SDK docs: https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat#usechat
  // We use a custom fetch function to intercept headers from streaming responses
  const customTransport = React.useMemo(() => {
    return new DefaultChatTransport({
      api: "/api/chat",
      fetch: createHeaderInterceptingFetch(responseIdRef),
    });
  }, []);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: customTransport,
    id: stableChatId,
    onFinish: async ({ message, messages: allMessages }) => {
      setIsStreaming(false);
      setErrorMessage(null);

      // Extract provider response ID from response headers
      const responseId = responseIdRef.current;

      // Reset response ID ref after reading
      responseIdRef.current = null;

      // Extract assistant message content
      const assistantMessageContent =
        message.parts
          ?.filter((part) => part.type === "text")
          .map((part) => (part as { type: "text"; text: string }).text)
          .join("") || "";

      // Check if this is an error response from the API
      let isErrorResponse = false;
      try {
        const parsed = JSON.parse(assistantMessageContent);
        if (parsed.error === true) {
          isErrorResponse = true;
          console.warn("API returned error:", parsed.description);
          // Set error message for UI display if needed
          toast.error("AI Provider Error", {
            description: parsed.description ?? "Something went wrong while calling the AI provider.",
          });
        }
      } catch {
        // Not JSON or doesn't have error flag, treat as normal response
      }

      // Get conversationId from ref (handles async creation during first message)
      // The ref is updated when conversation is created in handleSubmit

      // Extract last user message for title
      const lastUserMessage = allMessages
        .filter((m) => m.role === "user")
        .pop();
      const lastUserMessageContent =
        lastUserMessage?.parts
          ?.filter((part) => part.type === "text")
          .map((part) => (part as { type: "text"; text: string }).text)[0] ||
        null;
      const convId = currentConversationId || conversationIdRef.current;

      // Ensure messages are preserved in useChat state
      // The allMessages from onFinish should already be in useChat, but we ensure they're set
      if (allMessages.length > 0) {
        setMessages(allMessages);
      }

      // Reset the flag after response completes
      isCreatingNewConversationRef.current = false;

      // Only save to database if this is NOT an error response
      if (!isErrorResponse && convId && userProfile?.id) {
      
        // Save assistant message without await (fire and forget)
        if (assistantMessageContent.trim().length > 0) {
          aiMessagesService
            .createMessage(
              {
                conversationId: convId,
                userId: userProfile.id,
                role: "assistant",
                content: assistantMessageContent,
                providerResponseId: responseId,
              }
            )
            .catch((error) => {
              console.error("Error saving assistant message:", error);
            });
        }

        // Update conversation without await (fire and forget) - includes title, description, previousResponseId, updated_at
        // title = last user message input (first 5 words)
        // description = last response (assistant message content)
        // previousResponseId = last message ID from AI through stream (responseId)
        if (userProfile?.roles?.name) {
          aiConversationsService
            .updateConversation(
              {
                id: convId,
                title: lastUserMessageContent ?? null,
                description: assistantMessageContent ?? null,
                previousResponseId: responseId ?? null,
              }
            )
            .catch((error) => {
              console.error("Error updating conversation:", error);
            });
        }

        // Update local state
        setConversations((prevConversations) => {
            const existing = prevConversations.find((c) => c.id === convId);
            if (existing) {
              return prevConversations.map((conv) =>
                conv.id === convId
                  ? {
                      ...conv,
                      id: convId,
                      title: lastUserMessageContent ?? conv.title,
                      previousResponseId: responseId,
                      description: (() => {
                        // Extract description from JSON response, fallback to full content if not JSON
                        try {
                          const parsed = JSON.parse(assistantMessageContent);
                          return parsed.description || assistantMessageContent;
                        } catch {
                          return assistantMessageContent; // If not JSON, use full content as description
                        }
                      })(),
                      updatedAt: new Date().toISOString(),
                      messages: allMessages,
                    }
                  : conv
              );
            } else {
              // Add new conversation
              return [
                ...prevConversations,
                {
                  id: convId,
                  title: lastUserMessageContent ?? "New conversation",
                  messages: allMessages,
                  description: (() => {
                    // Extract description from JSON response, fallback to full content if not JSON
                    try {
                      const parsed = JSON.parse(assistantMessageContent);
                      return parsed.description || assistantMessageContent;
                    } catch {
                      return assistantMessageContent; // If not JSON, use full content as description
                    }
                  })(),
                  previousResponseId: responseId,
                  updatedAt: new Date().toISOString(),
                },
            ];
          }
        });
      }
    },
    onError: (error) => {
      setIsStreaming(false);
      console.error("AI chat error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while calling the AI provider.";
        setMessages([...messages, {
          id: crypto.randomUUID(),
          role: "assistant",
          parts: [{ type: "text", text: message }],
        } as UIMessage]);
    },
  });

  // Load messages when conversation is selected (after useChat hook)
  React.useEffect(() => {
    if (!currentConversationId || !userProfile?.id) {
      // Don't clear messages when no conversationId - let useChat manage them
      // This allows messages to show during new conversations
      return;
    }

    async function loadMessages() {
      try {
        if (!currentConversationId) return;
        setMessageLoading(true);

        const data = await aiMessagesService.getConversationMessages(
          currentConversationId
        );
        console.log("🚀 ~ loadMessages ~ data:", data)

        if (data.length > 0) {
          // Load messages into useChat
          setMessages(data);
          // Update conversation with loaded messages for history
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === currentConversationId
                ? { ...conv, messages: data }
                : conv
            )
          );
        } else {
          // If route has conversationId but no messages, remove conversationId from URL
          const conversationIdFromUrl = searchParams?.get("conversationId");
          if (conversationIdFromUrl === currentConversationId) {
            // Clear conversationId from state and URL
            setCurrentConversationId(null);
            conversationIdRef.current = null;
            setMessages([]);
            router.replace("?", { scroll: false });
          }
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setMessageLoading(false);
      }
    }

    loadMessages();
  }, [currentConversationId]);

  // Track streaming status based on chat status
  React.useEffect(() => {
    setIsStreaming(status === "streaming");
  }, [status]);

  // Handle input change (managed locally in AI SDK v6)
  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  // Handle form submit (use sendMessage from useChat)
  const handleSubmit = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (input.trim() && status !== "streaming") {
        setErrorMessage(null);
        const currentConversation = conversations.find(
          (c) => c.id === currentConversationId
        );

        const userMessageText = input;
        const previousResponseIdForMessage =
          currentConversation?.previousResponseId ?? null;

        const modelFromEvent =
          (e.target as HTMLFormElement).dataset.model || "gpt-4o-mini";

        let providerApiKey: string | undefined;
        let providerName: "openai" | "gemini" | null = null;
        if (typeof window !== "undefined") {
          const lower = modelFromEvent.toLowerCase();
          providerName =
            lower.startsWith("gpt") || lower.includes("openai")
              ? "openai"
              : lower.includes("gemini")
              ? "gemini"
              : null;
          if (providerName) {
            const storedKey = window.localStorage.getItem(
              `ai-api-key:${providerName}`
            );
            if (storedKey && storedKey.trim().length > 0) {
              providerApiKey = storedKey.trim();
            }
          }
        }

        // Validate UUID format
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const hasValidConversationId =
          currentConversationId &&
          typeof currentConversationId === "string" &&
          uuidRegex.test(currentConversationId);

        let finalConversationId = currentConversationId;

        // If no conversationId, create conversation with await, then save message without await
        if (
          !hasValidConversationId &&
          userProfile?.id &&
          userProfile?.roles?.name
        ) {
          try {
            // Set flag to prevent message loading during new conversation creation
            isCreatingNewConversationRef.current = true;

            // Create conversation with await (wait for UUID)
            const createData =
              await aiConversationsService.createConversation(
                {
                  userId: userProfile.id,
                  userRole: userProfile.roles.name,
                  title: null, // Title will be set after first response
                  previousResponseId: previousResponseIdForMessage ?? null,
                }
              );
            finalConversationId = createData;

            setCurrentConversationId(finalConversationId);
            conversationIdRef.current = finalConversationId; // Update ref immediately
            router.replace(`?conversationId=${finalConversationId}`, {
              scroll: false,
            });

            // Add conversation to local state
            setConversations((prev) => [
              {
                id: finalConversationId!,
                title: "New conversation",
                messages: [],
                previousResponseId: previousResponseIdForMessage,
                updatedAt: new Date().toISOString(),
              },
              ...prev,
            ]);

            // Save user message without await (fire and forget) after conversation is created
            if (finalConversationId) {
              aiMessagesService
                .createMessage(
                  {
                    conversationId: finalConversationId,
                    userId: userProfile.id,
                    role: "user",
                    content: userMessageText,
                    providerResponseId: previousResponseIdForMessage ?? null,
                  }
                )
                .catch((error) => {
                  console.error("Error saving user message:", error);
                });
            }
          } catch (error) {
            console.error("Error creating conversation:", error);
            // Continue anyway - message will be saved after response
            isCreatingNewConversationRef.current = false;
          }
        } else if (
          hasValidConversationId &&
          finalConversationId &&
          userProfile?.id
        ) {
          // If conversationId exists, save user message without await (fire and forget)
          aiMessagesService
            .createMessage(
              {
                conversationId: finalConversationId,
                userId: userProfile.id,
                role: "user",
                content: userMessageText,
                providerResponseId: previousResponseIdForMessage ?? null,
              }
            )
            .catch((error) => {
              console.error("Error saving user message:", error);
            });
        }

        sendMessage(
          { text: input },
          {
            body: {
              systemPrompt: enhancedSystemPrompt,
              conversationId: finalConversationId || undefined,
              userId: userProfile?.id,
              userRoleName: userProfile?.roles?.name,
              userMessage: input,
              previousResponseId: previousResponseIdForMessage,
              model: modelFromEvent,
              providerApiKey,
              providerName,
            },
          }
        );
      }
      setInput("");
    },
    [
      input,
      sendMessage,
      status,
      enhancedSystemPrompt,
      currentConversationId,
      conversations,
      userProfile?.id,
      userProfile?.roles?.name,
      router,
    ]
  );

  // Derive isLoading from status
  const isLoading = status === "submitted" || status === "streaming";

  // Create a new conversation - don't generate ID, let DB generate UUID
  const createNewConversation = React.useCallback(() => {
    // Clear current conversationId - new conversation will be created after first response
    // The database will generate a UUID when the conversation is created
    setCurrentConversationId(null);
    // Clear messages for new conversation
    setMessages([]);
    conversationIdRef.current = null;
    // Clear URL parameter
    router.replace("?", { scroll: false });
  }, [setMessages, router]);

  // Select an existing conversation and update route
  const selectConversation = React.useCallback(
    (id: string) => {
      setCurrentConversationId(id);
      // Update URL with conversation ID
      router.replace(`?conversationId=${id}`, { scroll: false });
    },
    [router]
  );

  const value = React.useMemo(
    () => ({
      conversations,
      currentConversationId,
      createNewConversation,
      selectConversation,
      messages,
      input,
      handleInputChange,
      handleSubmit,
      isLoading,
      isStreaming,
      messageLoading,
      isCreatingNewConversation: isCreatingNewConversationRef.current,
      errorMessage,
    }),
    [
      conversations,
      currentConversationId,
      createNewConversation,
      selectConversation,
      messages,
      input,
      handleInputChange,
      handleSubmit,
      isLoading,
      isStreaming,
      messageLoading,
      errorMessage,
    ]
  );

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = React.useContext(ConversationContext);
  if (context === undefined) {
    throw new Error(
      "useConversation must be used within a ConversationProvider"
    );
  }
  return context;
}
