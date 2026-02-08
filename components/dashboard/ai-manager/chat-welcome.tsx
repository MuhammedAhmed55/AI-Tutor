"use client";

import * as React from "react";
import {
  MessageSquare,
  Database,
  Headphones,
  Bot,
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface ChatWelcomeProps {
  onStartChat?: () => void;
  onSuggestionClick?: (text: string) => void;
}

const suggestions = [
  {
    icon: MessageSquare,
    title: "What can you do?",
    description: "Discover available features and capabilities",
  },
  {
    icon: Headphones,
    title: "Get Help",
    description: "Ask questions and get instant support",
  },
  {
    icon: Database,
    title: "Show Examples",
    description: "See sample use cases and demonstrations",
  },
  {
    icon: Bot,
    title: "Getting Started",
    description: "Learn how to use this application effectively",
  },
];

export function ChatWelcome({
  onStartChat,
  onSuggestionClick,
}: ChatWelcomeProps) {
  return (
    <div className="flex min-h-full items-center justify-center px-3 py-6 md:p-8">
      <div className="w-full max-w-3xl mx-auto text-center">
        {/* Logo/Icon */}
        <div className="mb-6 md:mb-8 flex justify-center">
          <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Bot className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          </div>
        </div>

        {/* Welcome Text */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-2 md:mb-3 text-foreground px-2">
          How can I help you today?
        </h1>
        <p className="text-muted-foreground text-sm md:text-base lg:text-lg mb-6 md:mb-8 max-w-xl mx-auto px-4">
          I&apos;m here to assist you with any questions or tasks you have.
        </p>

        {/* Suggestions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mb-6 md:mb-8 max-w-2xl mx-auto">
          {suggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <Card key={index} className="p-3 md:p-4 text-left border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-start gap-2 md:gap-3">
                  <div className="p-1.5 md:p-2 rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-xs md:text-sm mb-0.5 md:mb-1 text-foreground">
                      {suggestion.title}
                    </h3>
                    <p className="text-[10px] md:text-xs text-muted-foreground leading-tight">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
