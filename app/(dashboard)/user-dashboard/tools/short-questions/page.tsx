'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, Download, RotateCcw, Copy, Eye } from 'lucide-react'
import { useState } from 'react'

export default function ShortQuestionsPage() {
  const [showAnswers, setShowAnswers] = useState<Set<number>>(new Set())
  const [copied, setCopied] = useState(false)

  const shortQuestions = [
    {
      id: 1,
      question: 'Define the cell and explain its importance in living organisms.',
      answer: 'The cell is the basic unit of life - the smallest unit that can perform all life functions. It is important because all living organisms are composed of cells, and it is where all life processes occur.'
    },
    {
      id: 2,
      question: 'Differentiate between prokaryotic and eukaryotic cells.',
      answer: 'Prokaryotic cells lack a membrane-bound nucleus and are found in bacteria and archaea. Eukaryotic cells have a true nucleus and are found in animals, plants, fungi, and protists.'
    },
    {
      id: 3,
      question: 'What is the role of mitochondria in cellular respiration?',
      answer: 'Mitochondria breaks down glucose to produce ATP (adenosine triphosphate), which provides energy for cellular activities. This process is called cellular respiration.'
    },
    {
      id: 4,
      question: 'Explain the function of the endoplasmic reticulum.',
      answer: 'The ER is a network of membranes that synthesizes proteins (rough ER with ribosomes) and lipids (smooth ER without ribosomes), then transports them throughout the cell.'
    },
    {
      id: 5,
      question: 'What does the Golgi apparatus do in the cell?',
      answer: 'The Golgi apparatus modifies, packages, and ships proteins and lipids received from the ER to their final destinations inside or outside the cell.'
    },
    {
      id: 6,
      question: 'Describe the structure and function of the cell membrane.',
      answer: 'The cell membrane is a selectively permeable barrier made of a phospholipid bilayer with embedded proteins. It controls the movement of substances in and out of the cell and provides cell recognition.'
    }
  ]

  const toggleAnswer = (id: number) => {
    const newSet = new Set(showAnswers)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setShowAnswers(newSet)
  }

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Short Questions</h1>
              <p className="text-muted-foreground">Practice with theory questions and develop deeper understanding</p>
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
        </div>

        {/* Questions List */}
        <div className="grid gap-4">
          {shortQuestions.map((item) => (
            <Card key={item.id} className="border border-border p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg mb-2">
                      Question {item.id}: {item.question}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAnswer(item.id)}
                    className="gap-2 whitespace-nowrap"
                  >
                    <Eye className="w-4 h-4" />
                    {showAnswers.has(item.id) ? 'Hide' : 'View'} Answer
                  </Button>
                </div>

                {showAnswers.has(item.id) && (
                  <div className="mt-4 p-4 bg-muted rounded-lg border border-border">
                    <p className="text-sm text-foreground mb-3">{item.answer}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? 'Copied!' : 'Copy Answer'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
