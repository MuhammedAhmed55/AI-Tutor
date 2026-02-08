'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, TrendingUp, Download, RotateCcw, AlertCircle, BookMarked } from 'lucide-react'
import { useState } from 'react'

export default function ImportantTopicsPage() {
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  const topics = [
    {
      id: 1,
      title: 'Cell Structure and Functions',
      description: 'Basic understanding of cell components and their roles in cell functions.',
      priority: 'high',
      frequency: 'Appears in 87% of past papers',
      color: 'from-red-500/10 to-red-500/5',
      borderColor: 'border-red-200',
      badgeColor: 'bg-red-100 text-red-800',
    },
    {
      id: 2,
      title: 'Cellular Respiration',
      description: 'The process of ATP production and energy conversion in cells.',
      priority: 'high',
      frequency: 'Appears in 85% of past papers',
      color: 'from-red-500/10 to-red-500/5',
      borderColor: 'border-red-200',
      badgeColor: 'bg-red-100 text-red-800',
    },
    {
      id: 3,
      title: 'Mitochondria and Chloroplast',
      description: 'Understanding organelle structure and their roles in energy production.',
      priority: 'high',
      frequency: 'Appears in 82% of past papers',
      color: 'from-red-500/10 to-red-500/5',
      borderColor: 'border-red-200',
      badgeColor: 'bg-red-100 text-red-800',
    },
    {
      id: 4,
      title: 'Protein Synthesis',
      description: 'The process of protein formation using DNA and RNA.',
      priority: 'medium',
      frequency: 'Appears in 65% of past papers',
      color: 'from-yellow-500/10 to-yellow-500/5',
      borderColor: 'border-yellow-200',
      badgeColor: 'bg-yellow-100 text-yellow-800',
    },
    {
      id: 5,
      title: 'Cell Division',
      description: 'Mitosis and meiosis processes for cell reproduction.',
      priority: 'medium',
      frequency: 'Appears in 72% of past papers',
      color: 'from-yellow-500/10 to-yellow-500/5',
      borderColor: 'border-yellow-200',
      badgeColor: 'bg-yellow-100 text-yellow-800',
    },
    {
      id: 6,
      title: 'Enzyme Catalysis',
      description: 'How enzymes accelerate biochemical reactions.',
      priority: 'low',
      frequency: 'Appears in 45% of past papers',
      color: 'from-green-500/10 to-green-500/5',
      borderColor: 'border-green-200',
      badgeColor: 'bg-green-100 text-green-800',
    },
  ]

  const filteredTopics =
    selectedPriority === 'all' ? topics : topics.filter((t) => t.priority === selectedPriority)

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'medium':
        return <TrendingUp className="w-5 h-5 text-yellow-500" />
      default:
        return <BookMarked className="w-5 h-5 text-green-500" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="p-8">
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Important Topics</h1>
              <p className="text-muted-foreground">
                Topics identified based on past paper analysis and frequency
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Regenerate
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Priority Filter */}
          <div className="flex gap-3">
            {[
              { value: 'all', label: 'All Topics' },
              { value: 'high', label: 'High Priority', color: 'bg-red-100 text-red-800' },
              { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800' },
              { value: 'low', label: 'Low Priority', color: 'bg-green-100 text-green-800' },
            ].map((filter) => (
              <Button
                key={filter.value}
                variant={selectedPriority === filter.value ? 'default' : 'outline'}
                onClick={() => setSelectedPriority(filter.value as any)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid gap-4">
          {filteredTopics.map((topic) => (
            <Card key={topic.id} className={`border ${topic.borderColor} p-6 bg-gradient-to-br ${topic.color}`}>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getPriorityIcon(topic.priority)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-lg mb-1">{topic.title}</h3>
                      <p className="text-sm text-muted-foreground">{topic.description}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${topic.badgeColor}`}
                  >
                    {topic.priority.charAt(0).toUpperCase() + topic.priority.slice(1)} Priority
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border/50">
                  <TrendingUp className="w-4 h-4" />
                  {topic.frequency}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
