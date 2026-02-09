'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Star, 
  TrendingUp, 
  Download, 
  RotateCcw, 
  AlertCircle, 
  BookMarked,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/supabase-auth-client'
import { useParams } from 'next/navigation'

interface ImportantTopic {
  id: string
  topic_name: string
  description: string | null
  importance_score: number
  subtopics: string[] | null
  key_points: string[] | null
  created_at: string
}

export default function ImportantTopicsPage() {
  const params = useParams()
  const pdfNoteId = params?.pdfNoteId as string
  
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [topics, setTopics] = useState<ImportantTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const supabaseClient = supabase();

  // Fetch topics from database
  const fetchTopics = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabaseClient
        .from('important_topics')
        .select('*')
        .order('importance_score', { ascending: false })

      if (pdfNoteId) {
        query = query.eq('pdf_note_id', pdfNoteId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setTopics(data || [])
    } catch (err: any) {
      console.error('Error fetching topics:', err)
      setError('Failed to load important topics')
    } finally {
      setLoading(false)
    }
  }

  // Regenerate topics by calling the process-pdf API again
  const handleRegenerate = async () => {
    if (!pdfNoteId) {
      setError('No PDF selected')
      return
    }

    try {
      setRegenerating(true)
      setError(null)

      // Get current user
      const { data: { user } } = await supabaseClient.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Call the process-pdf API to regenerate
      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfNoteId,
          userId: user.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate topics')
      }

      // Refresh the topics list
      await fetchTopics()
    } catch (err: any) {
      console.error('Error regenerating:', err)
      setError(err.message || 'Failed to regenerate topics')
    } finally {
      setRegenerating(false)
    }
  }

  // Export topics to JSON
  const handleExport = () => {
    const exportData = {
      topics: filteredTopics,
      generatedAt: new Date().toISOString(),
      totalTopics: topics.length,
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `important-topics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Toggle topic expansion
  const toggleExpand = (topicId: string) => {
    const newExpanded = new Set(expandedTopics)
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId)
    } else {
      newExpanded.add(topicId)
    }
    setExpandedTopics(newExpanded)
  }

  // Determine priority based on importance_score
  const getPriorityFromScore = (score: number): 'high' | 'medium' | 'low' => {
    if (score >= 8) return 'high'
    if (score >= 5) return 'medium'
    return 'low'
  }

  // Get styling based on priority
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          color: 'from-red-500/10 to-red-500/5',
          borderColor: 'border-red-200',
          badgeColor: 'bg-red-100 text-red-800',
          iconColor: 'text-red-500',
        }
      case 'medium':
        return {
          color: 'from-yellow-500/10 to-yellow-500/5',
          borderColor: 'border-yellow-200',
          badgeColor: 'bg-yellow-100 text-yellow-800',
          iconColor: 'text-yellow-500',
        }
      default:
        return {
          color: 'from-green-500/10 to-green-500/5',
          borderColor: 'border-green-200',
          badgeColor: 'bg-green-100 text-green-800',
          iconColor: 'text-green-500',
        }
    }
  }

  // Get priority icon
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

  // Filter topics based on selected priority
  const filteredTopics = selectedPriority === 'all' 
    ? topics 
    : topics.filter((t) => getPriorityFromScore(t.importance_score) === selectedPriority)

  // Load topics on mount
  useEffect(() => {
    fetchTopics()
  }, [pdfNoteId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          Loading important topics...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Important Topics</h1>
              <p className="text-muted-foreground">
                AI-generated key topics from your PDF with importance rankings
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleRegenerate}
                disabled={regenerating || !pdfNoteId}
              >
                {regenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                {regenerating ? 'Regenerating...' : 'Regenerate'}
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleExport}
                disabled={topics.length === 0}
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Priority Filter */}
          <div className="flex gap-3 flex-wrap">
            {[
              { value: 'all', label: 'All Topics', count: topics.length },
              { value: 'high', label: 'High Priority', color: 'bg-red-100 text-red-800', count: topics.filter(t => getPriorityFromScore(t.importance_score) === 'high').length },
              { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800', count: topics.filter(t => getPriorityFromScore(t.importance_score) === 'medium').length },
              { value: 'low', label: 'Low Priority', color: 'bg-green-100 text-green-800', count: topics.filter(t => getPriorityFromScore(t.importance_score) === 'low').length },
            ].map((filter) => (
              <Button
                key={filter.value}
                variant={selectedPriority === filter.value ? 'default' : 'outline'}
                onClick={() => setSelectedPriority(filter.value as any)}
                className="gap-2"
              >
                {filter.label}
                <span className={`text-xs px-2 py-0.5 rounded-full ${filter.color}`}>
                  {filter.count}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Topics Grid */}
        {filteredTopics.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookMarked className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No topics found</p>
            <p className="text-sm">Upload a PDF to generate important topics</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTopics.map((topic) => {
              const priority = getPriorityFromScore(topic.importance_score)
              const styles = getPriorityStyles(priority)
              const isExpanded = expandedTopics.has(topic.id)

              return (
                <Card 
                  key={topic.id} 
                  className={`border ${styles.borderColor} p-6 bg-gradient-to-br ${styles.color} transition-all duration-200 hover:shadow-md`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getPriorityIcon(priority)}
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-lg mb-1">
                            {topic.topic_name}
                          </h3>
                          {topic.description && (
                            <p className="text-sm text-muted-foreground">{topic.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${styles.badgeColor}`}
                        >
                          {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(topic.id)}
                          className="h-8 w-8 p-0"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Importance Score Bar */}
                    <div className="flex items-center gap-2 text-sm pt-2">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-muted-foreground text-xs">Importance Score</span>
                          <span className="font-medium text-xs">{topic.importance_score}/10</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              priority === 'high' ? 'bg-red-500' : 
                              priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${topic.importance_score * 10}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-border/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
                        {/* Subtopics */}
                        {topic.subtopics && topic.subtopics.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <Star className="w-4 h-4" />
                              Subtopics
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {topic.subtopics.map((sub, idx) => (
                                <span 
                                  key={idx}
                                  className="px-3 py-1 bg-background/50 rounded-full text-xs border border-border"
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Key Points */}
                        {topic.key_points && topic.key_points.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Key Points
                            </h4>
                            <ul className="space-y-1">
                              {topic.key_points.map((point, idx) => (
                                <li 
                                  key={idx}
                                  className="text-sm text-muted-foreground flex items-start gap-2"
                                >
                                  <span className="text-primary mt-1.5">•</span>
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}