'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ChevronDown, 
  Download, 
  RotateCcw, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/supabase-auth-client'
import { useParams } from 'next/navigation'

interface MCQQuestion {
  id: string
  question_text: string
  options: string[]
  correct_answer: number
  explanation: string | null
  difficulty: string
  created_at: string
}

interface MCQSet {
  id: string
  title: string
  difficulty_level: string
  total_questions: number
  created_at: string
}

export default function MCQPage() {
  const params = useParams()
  const pdfNoteId = params?.pdfNoteId as string
  
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [mcqSet, setMcqSet] = useState<MCQSet | null>(null)
  const [mcqs, setMcqs] = useState<MCQQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({})
  const [showResults, setShowResults] = useState(false)

  const supabaseClient = supabase();

  // Fetch MCQs from database
  const fetchMCQs = async () => {
    try {
      setLoading(true)
      setError(null)

      // First get the MCQ set for this PDF
      let setQuery = supabaseClient
        .from('mcq_sets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)

      if (pdfNoteId) {
        setQuery = setQuery.eq('pdf_note_id', pdfNoteId)
      }

      const { data: setData, error: setFetchError } = await setQuery.single()

      if (setFetchError && setFetchError.code !== 'PGRST116') throw setFetchError // PGRST116 = no rows returned

      if (setData) {
        setMcqSet(setData)

        // Get questions for this set
        const { data: questionsData, error: questionsError } = await supabaseClient
          .from('mcq_questions')
          .select('*')
          .eq('mcq_set_id', setData.id)
          .order('created_at', { ascending: true })

        if (questionsError) throw questionsError
        setMcqs(questionsData || [])
      } else {
        setMcqSet(null)
        setMcqs([])
      }
    } catch (err: any) {
      console.error('Error fetching MCQs:', err)
      setError('Failed to load MCQs')
    } finally {
      setLoading(false)
    }
  }

  // Regenerate MCQs
  const handleRegenerate = async () => {
    if (!pdfNoteId) {
      setError('No PDF selected')
      return
    }

    try {
      setRegenerating(true)
      setError(null)
      setShowResults(false)
      setUserAnswers({})

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
        throw new Error('Failed to regenerate MCQs')
      }

      // Refresh the MCQs
      await fetchMCQs()
    } catch (err: any) {
      console.error('Error regenerating:', err)
      setError(err.message || 'Failed to regenerate MCQs')
    } finally {
      setRegenerating(false)
    }
  }

  // Export MCQs to JSON
  const handleExport = () => {
    const exportData = {
      mcqSet,
      questions: mcqs,
      generatedAt: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mcqs-${mcqSet?.title || 'export'}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    if (showResults) return // Prevent changing after submission
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIndex }))
  }

  // Calculate score
  const calculateScore = () => {
    let correct = 0
    mcqs.forEach(mcq => {
      if (userAnswers[mcq.id] === mcq.correct_answer) correct++
    })
    return correct
  }

  // Submit answers
  const handleSubmit = async () => {
    if (Object.keys(userAnswers).length !== mcqs.length) {
      setError('Please answer all questions before submitting')
      return
    }

    setShowResults(true)
    setError(null)

    // Save attempt to database if user is logged in
    try {
      const { data: { user } } = await supabaseClient.auth.getUser()
      if (user && mcqSet) {
        const score = calculateScore()
        await supabaseClient.from('mcq_attempts').insert({
          user_id: user.id,
          mcq_set_id: mcqSet.id,
          score: score,
          total_questions: mcqs.length,
          answers: userAnswers,
          completed_at: new Date().toISOString(),
        })
      }
    } catch (err) {
      console.error('Error saving attempt:', err)
    }
  }

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  useEffect(() => {
    fetchMCQs()
  }, [pdfNoteId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          Loading MCQs...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">MCQ Generator</h1>
              <p className="text-muted-foreground">
                {mcqs.length > 0 
                  ? `${mcqs.length} questions generated from your notes`
                  : 'No MCQs generated yet. Upload a PDF to get started.'}
              </p>
              {mcqSet && (
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(mcqSet.difficulty_level)}`}>
                    {mcqSet.difficulty_level.charAt(0).toUpperCase() + mcqSet.difficulty_level.slice(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Set: {mcqSet.title}
                  </span>
                </div>
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

            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Score Display */}
          {showResults && (
            <div className="mt-6 p-6 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Quiz Completed!</h3>
                  <p className="text-muted-foreground">
                    You scored {calculateScore()} out of {mcqs.length}
                  </p>
                </div>
                <div className="text-3xl font-bold text-primary">
                  {Math.round((calculateScore() / mcqs.length) * 100)}%
                </div>
              </div>
            </div>
          )}
        </div>

        {mcqs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No MCQs found</p>
            <p className="text-sm">Upload a PDF to generate multiple choice questions</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {mcqs.map((mcq, index) => {
                const isExpanded = expandedId === mcq.id
                const userAnswer = userAnswers[mcq.id]
                const isCorrect = userAnswer === mcq.correct_answer
                const hasAnswered = userAnswer !== undefined

                return (
                  <Card
                    key={mcq.id}
                    className={`border overflow-hidden transition-all ${
                      showResults && hasAnswered
                        ? isCorrect
                          ? 'border-green-300 bg-green-50/30'
                          : 'border-red-300 bg-red-50/30'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-sm font-semibold bg-primary text-primary-foreground rounded px-2 py-1">
                              Q{index + 1}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(mcq.difficulty)}`}>
                              {mcq.difficulty}
                            </span>
                            <h3 className="font-semibold text-foreground">{mcq.question_text}</h3>
                          </div>
                          
                          <div className="grid sm:grid-cols-2 gap-2">
                            {mcq.options.map((option, idx) => {
                              const isSelected = userAnswer === idx
                              const isCorrectOption = idx === mcq.correct_answer
                              let optionClass = 'p-3 rounded-lg text-sm border cursor-pointer transition-all '
                              
                              if (showResults) {
                                if (isCorrectOption) {
                                  optionClass += 'bg-green-100 border-green-300 text-green-900 font-medium'
                                } else if (isSelected && !isCorrectOption) {
                                  optionClass += 'bg-red-100 border-red-300 text-red-900'
                                } else {
                                  optionClass += 'bg-card border-border text-muted-foreground opacity-60'
                                }
                              } else {
                                if (isSelected) {
                                  optionClass += 'bg-primary/10 border-primary text-foreground font-medium'
                                } else {
                                  optionClass += 'bg-card border-border text-muted-foreground hover:bg-muted/50'
                                }
                              }

                              return (
                                <div
                                  key={idx}
                                  className={optionClass}
                                  onClick={() => handleAnswerSelect(mcq.id, idx)}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{String.fromCharCode(65 + idx)})</span>
                                    {option}
                                    {showResults && isCorrectOption && (
                                      <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />
                                    )}
                                    {showResults && isSelected && !isCorrectOption && (
                                      <XCircle className="w-4 h-4 text-red-600 ml-auto" />
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : mcq.id)}
                          className="p-1 hover:bg-muted rounded transition-colors"
                        >
                          <ChevronDown
                            className={`w-5 h-5 text-muted-foreground transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {isExpanded && mcq.explanation && (
                        <div className="mt-4 pt-4 border-t border-border animate-in slide-in-from-top-2">
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <p className="text-sm font-semibold text-blue-900 mb-1">
                              Explanation
                            </p>
                            <p className="text-sm text-blue-800">{mcq.explanation}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Submit Button */}
            {!showResults && mcqs.length > 0 && (
              <div className="mt-8 flex justify-center">
                <Button 
                  size="lg"
                  onClick={handleSubmit}
                  disabled={Object.keys(userAnswers).length !== mcqs.length}
                  className="px-8"
                >
                  Submit Answers ({Object.keys(userAnswers).length}/{mcqs.length})
                </Button>
              </div>
            )}

            {/* Retake Button */}
            {showResults && (
              <div className="mt-8 flex justify-center">
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setShowResults(false)
                    setUserAnswers({})
                    setExpandedId(null)
                  }}
                  className="px-8"
                >
                  Retake Quiz
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}