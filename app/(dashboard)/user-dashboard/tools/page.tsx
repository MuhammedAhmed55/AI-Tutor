'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Brain, Lightbulb, FileText, Zap, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AIToolsPage() {
  const tools = [
    {
      icon: BookOpen,
      title: 'Smart Summaries',
      description: 'Generate concise, AI-powered summaries of your study materials',
      features: ['Key concepts', 'Main ideas', 'Quick review'],
      color: 'from-blue-500/10 to-blue-500/5',
      href: '/user-dashboard/tools/summary',
    },
    {
      icon: Brain,
      title: 'MCQ Generator',
      description: 'Auto-generate multiple choice questions for practice',
      features: ['Easy level', 'Medium level', 'Hard level'],
      color: 'from-purple-500/10 to-purple-500/5',
      href: '/user-dashboard/tools/mcqs',
    },
    {
      icon: Zap,
      title: 'Flashcards',
      description: 'Create interactive flashcards for effective memorization',
      features: ['Flip animation', 'Progress tracking', 'Export support'],
      color: 'from-orange-500/10 to-orange-500/5',
      href: '/user-dashboard/tools/flashcards',
    },
    {
      icon: FileText,
      title: 'Short Questions',
      description: 'Generate short answer questions for deeper learning',
      features: ['Theory questions', 'Practice drills', 'Answer keys'],
      color: 'from-green-500/10 to-green-500/5',
      href: '/user-dashboard/tools/short-questions',
    },
    {
      icon: Lightbulb,
      title: 'Important Topics',
      description: 'Identify and highlight the most important topics',
      features: ['Auto-detection', 'Priority ranking', 'Focus areas'],
      color: 'from-yellow-500/10 to-yellow-500/5',
      href: '/user-dashboard/tools/important-topics',
    },
    {
      icon: TrendingUp,
      title: 'Past Paper Prediction',
      description: 'Predict likely exam questions based on patterns',
      features: ['Historical data', 'Accuracy score', 'Study tips'],
      color: 'from-pink-500/10 to-pink-500/5',
      href: '/user-dashboard/tools/past-papers',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <main className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Tools</h1>
          <p className="text-muted-foreground">Transform your study materials with powerful AI-powered tools</p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Card
              key={tool.title}
              className="border border-border overflow-hidden hover:border-primary/50 transition-all group cursor-pointer"
            >
              <div className={`bg-gradient-to-br ${tool.color} p-6 pb-4`}>
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <tool.icon className="w-6 h-6 text-foreground" />
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">{tool.title}</h3>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </div>

                <div className="space-y-2">
                  {tool.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href={tool.href}>
                  <Button className="w-full gap-2 group/btn" variant="default">
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* Pro Features Notice */}
        <Card className="mt-12 border border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 p-8">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-foreground text-lg mb-2">Unlock Pro Features</h3>
              <p className="text-muted-foreground">
                Get unlimited access to all AI tools, priority processing, and advanced features
              </p>
            </div>
            <Button className="gap-2">
              Upgrade to Pro <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}
