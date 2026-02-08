'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Plus, MessageSquare, Trash2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  sender: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  date: string
  messages: Message[]
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      content:
        "Hello! I'm your AI study assistant. Ask me anything about your study materials, concepts you're struggling with, or get explanations on complex topics.",
      timestamp: new Date(Date.now() - 5 * 60000),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [chatSessions] = useState<ChatSession[]>([
    { id: '1', title: 'Cell Biology Basics', date: '2 hours ago', messages: [] },
    { id: '2', title: 'Photosynthesis Questions', date: 'Yesterday', messages: [] },
    { id: '3', title: 'Genetic Inheritance', date: '3 days ago', messages: [] },
  ])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        'The cell membrane is a selectively permeable barrier that controls the movement of substances in and out of the cell. It consists of a phospholipid bilayer with embedded proteins that facilitate specific transport mechanisms.',
        'Photosynthesis is the process by which plants convert light energy into chemical energy stored in glucose. It occurs in two stages: the light-dependent reactions in the thylakoid and the light-independent reactions (Calvin cycle) in the stroma.',
        'Genetic inheritance follows Mendelian principles. Traits are inherited through genes, which exist in different forms called alleles. Dominant alleles mask recessive ones in heterozygous individuals.',
        'DNA replication ensures that each daughter cell receives an identical copy of genetic material. It occurs during the S phase of the cell cycle and is semi-conservative, with each strand serving as a template.',
      ]

      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: randomResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="p-8 h-[calc(100vh)] flex gap-6">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">AI Study Assistant</h1>
            <p className="text-sm text-muted-foreground">Ask any questions about your studies</p>
          </div>

          {/* Messages Container */}
          <Card className="flex-1 border border-border p-6 mb-6 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-card border border-border text-foreground rounded-bl-none'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card border border-border px-4 py-3 rounded-lg rounded-bl-none">
                  <div className="flex gap-2">
                    <div
                      className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </Card>

          {/* Input Area */}
          <div className="flex gap-3">
            <Input
              placeholder="Ask your question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="bg-input border border-border"
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()} className="gap-2">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Sidebar - Chat History */}
        <div className="w-80 hidden lg:flex flex-col border-l border-border pl-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-foreground">Chat History</h2>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {chatSessions.map((session) => (
              <Card
                key={session.id}
                className="p-4 border border-border hover:border-primary/50 cursor-pointer transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-4 h-4 text-primary flex-shrink-0" />
                      <p className="text-sm font-medium text-foreground truncate">{session.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{session.date}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Study Tips */}
          <Card className="border border-border p-4 mt-6 bg-gradient-to-br from-primary/5 to-accent/5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Study Tips</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Ask specific questions for better answers</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Request explanations on difficult concepts</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Use follow-up questions to dive deeper</span>
              </li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  )
}
