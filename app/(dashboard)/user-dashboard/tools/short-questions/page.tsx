'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ChevronDown, 
  Download, 
  RotateCcw, 
  Copy, 
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/supabase-auth-client'
import { useParams } from 'next/navigation'

interface ShortQuestion {
  id: string
  question_text: string
  answer_text: string
  marks: number
  created_at: string
}

interface ShortQuestionSet {
  id: string
  title: string
  total_questions: number
  created_at: string
}

export default function ShortQuestionsPage() {
  const params = useParams()
  const pdfNoteId = params?.pdfNoteId as string
  
  const [showAnswers, setShowAnswers] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [questionSet, setQuestionSet] = useState<ShortQuestionSet | null>(null)
  const [shortQuestions, setShortQuestions] = useState<ShortQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAllAnswers, setShowAllAnswers] = useState(false)

  // Initialize supabase client
  const supabaseClient = supabase()

  // Fetch short questions from database
  const fetchShortQuestions = async () => {
    try {
      setLoading(true)
      setError(null)

      // First get the question set for this PDF
      let setQuery = supabaseClient
        .from('short_question_sets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)

      if (pdfNoteId) {
        setQuery = setQuery.eq('pdf_note_id', pdfNoteId)
      }
      const { data: setData, error: setFetchError } = await setQuery.single()
      if (setFetchError && setFetchError.code !== 'PGRST116') throw setFetchError // PGRST116 = no rows returned

      if (setData) {
        setQuestionSet(setData)

        // Get questions for this set
        const { data: questionsData, error: questionsError } = await supabaseClient
          .from('short_questions')
          .select('*')
          .eq('set_id', setData.id)
          .order('created_at', { ascending: true })

        if (questionsError) throw questionsError
        setShortQuestions(questionsData || [])
      } else {
        setQuestionSet(null)
        setShortQuestions([])
      }
    } catch (err: any) {
      console.error('Error fetching short questions:', err)
      setError('Failed to load short questions')
    } finally {
      setLoading(false)
    }
  }

  // Regenerate short questions
  const handleRegenerate = async () => {
    if (!pdfNoteId) {
      setError('No PDF selected')
      return
    }

    try {
      setRegenerating(true)
      setError(null)
      setShowAnswers(new Set())
      setShowAllAnswers(false)

      // Get current user
      const { data: { user } } = await supabaseClient.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Call the process-pdf API
      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfNoteId,
          userId: user.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate short questions')
      }

      // Refresh the questions
      await fetchShortQuestions()
    } catch (err: any) {
      console.error('Error regenerating:', err)
      setError(err.message || 'Failed to regenerate short questions')
    } finally {
      setRegenerating(false)
    }
  }

  // Export questions to JSON
  const handleExport = () => {
    const exportData = {
      questionSet,
      questions: shortQuestions,
      generatedAt: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `short-questions-${questionSet?.title || 'export'}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Toggle individual answer visibility
  const toggleAnswer = (id: string) => {
    const newSet = new Set(showAnswers)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setShowAnswers(newSet)
  }

  // Toggle all answers
  const toggleAllAnswers = () => {
    if (showAllAnswers) {
      setShowAnswers(new Set())
    } else {
      setShowAnswers(new Set(shortQuestions.map(q => q.id)))
    }
    setShowAllAnswers(!showAllAnswers)
  }

  // Copy answer to clipboard
  const handleCopy = async (questionId: string, answerText: string) => {
    try {
      await navigator.clipboard.writeText(answerText)
      setCopiedId(questionId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Copy all questions and answers
  const handleCopyAll = async () => {
    try {
      const text = shortQuestions.map((q, idx) => 
        `Q${idx + 1}: ${q.question_text}\n\nAnswer (${q.marks} marks):\n${q.answer_text}\n\n${'='.repeat(50)}`
      ).join('\n\n')
      
      await navigator.clipboard.writeText(text)
      setCopiedId('all')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy all:', err)
    }
  }

  useEffect(() => {
    fetchShortQuestions()
  }, [pdfNoteId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          Loading short questions...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Short Questions</h1>
              <p className="text-muted-foreground">
                {shortQuestions.length > 0 
                  ? `${shortQuestions.length} practice questions generated from your notes`
                  : 'No questions generated yet. Upload a PDF to get started.'}
              </p>
              {questionSet && (
                <p className="text-xs text-muted-foreground mt-1">
                  Set: {questionSet.title}
                </p>
              )}
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
                disabled={shortQuestions.length === 0}
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Bulk Actions */}
          {shortQuestions.length > 0 && (
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAllAnswers}
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                {showAllAnswers ? 'Hide All Answers' : 'Show All Answers'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAll}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                {copiedId === 'all' ? 'Copied All!' : 'Copy All'}
              </Button>
            </div>
          )}
        </div>

        {shortQuestions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No short questions found</p>
            <p className="text-sm">Upload a PDF to generate practice questions</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {shortQuestions.map((item, index) => {
              const isVisible = showAnswers.has(item.id)
              const isCopied = copiedId === item.id

              return (
                <Card 
                  key={item.id} 
                  className={`border p-6 transition-all duration-200 ${
                    isVisible ? 'border-primary/50 bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold bg-primary text-primary-foreground rounded px-2 py-0.5">
                            Q{index + 1}
                          </span>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {item.marks} marks
                          </span>
                        </div>
                        <h3 className="font-semibold text-foreground text-lg">
                          {item.question_text}
                        </h3>
                      </div>
                      <Button
                        variant={isVisible ? "default" : "ghost"}
                        size="sm"
                        onClick={() => toggleAnswer(item.id)}
                        className="gap-2 whitespace-nowrap"
                      >
                        <Eye className="w-4 h-4" />
                        {isVisible ? 'Hide' : 'View'} Answer
                      </Button>
                    </div>

                    {isVisible && (
                      <div className="mt-4 p-4 bg-background rounded-lg border border-border animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              Suggested Answer:
                            </p>
                            <p className="text-sm text-foreground leading-relaxed">
                              {item.answer_text}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-border flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(item.id, item.answer_text)}
                            className={`gap-2 transition-all ${isCopied ? 'text-green-600' : ''}`}
                          >
                            {isCopied ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                            {isCopied ? 'Copied!' : 'Copy Answer'}
                          </Button>
                        </div>
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