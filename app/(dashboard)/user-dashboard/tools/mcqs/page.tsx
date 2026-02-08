'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, Download, RotateCcw } from 'lucide-react'
import { useState } from 'react'

export default function MCQPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const mcqs = [
    {
      id: 1,
      question: 'What is the basic unit of life?',
      options: ['Atom', 'Cell', 'Molecule', 'Organism'],
      correct: 1,
      explanation: 'The cell is the smallest unit of life that can function independently.',
    },
    {
      id: 2,
      question: 'Which organelle is known as the powerhouse of the cell?',
      options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Lysosome'],
      correct: 2,
      explanation: 'Mitochondria produces ATP, which provides energy for cellular activities.',
    },
    {
      id: 3,
      question: 'What is the function of the endoplasmic reticulum?',
      options: [
        'DNA replication',
        'Protein synthesis and transport',
        'Energy production',
        'Waste breakdown',
      ],
      correct: 1,
      explanation: 'The ER synthesizes proteins (rough ER) and lipids (smooth ER) for cellular use.',
    },
    {
      id: 4,
      question: 'Which type of cell lacks a nucleus?',
      options: ['Eukaryotic', 'Prokaryotic', 'Animal', 'Plant'],
      correct: 1,
      explanation:
        'Prokaryotic cells (bacteria and archaea) do not have a membrane-bound nucleus.',
    },
    {
      id: 5,
      question: 'What is the Golgi apparatus responsible for?',
      options: [
        'Synthesizing proteins',
        'Modifying and packaging proteins',
        'Breaking down waste',
        'Producing energy',
      ],
      correct: 1,
      explanation:
        'The Golgi apparatus modifies proteins and lipids, then packages them for transport.',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <main className="p-8">
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">MCQ Generator</h1>
              <p className="text-muted-foreground">5 questions generated from your notes</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Regenerate
              </Button>
              <Button className="gap-2">
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {mcqs.map((mcq) => (
            <Card
              key={mcq.id}
              className="border border-border overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setExpandedId(expandedId === mcq.id ? null : mcq.id)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-semibold bg-primary text-primary-foreground rounded px-2 py-1">
                        Q{mcq.id}
                      </span>
                      <h3 className="font-semibold text-foreground">{mcq.question}</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {mcq.options.map((option, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg text-sm border ${
                            expandedId === mcq.id && idx === mcq.correct
                              ? 'bg-green-50 border-green-300 text-foreground font-medium'
                              : 'bg-card border-border text-muted-foreground'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}) {option}
                        </div>
                      ))}
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 mt-1 ${
                      expandedId === mcq.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {expandedId === mcq.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-sm font-semibold text-green-900 mb-2">
                        Correct Answer: {String.fromCharCode(65 + mcq.correct)}
                      </p>
                      <p className="text-sm text-green-800">{mcq.explanation}</p>
                    </div>
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
