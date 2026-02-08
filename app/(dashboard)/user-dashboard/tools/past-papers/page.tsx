'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Eye, BarChart3, Zap, TrendingUp, FileText, RotateCcw } from 'lucide-react'
import { useState } from 'react'

export default function PastPapersPage() {
  const [selectedYear, setSelectedYear] = useState<'all' | '2024' | '2023' | '2022'>('all')

  const predictions = [
    {
      id: 1,
      topic: 'Cell Structure and Organelles',
      year: '2024',
      probability: 92,
      frequency: 'Frequently asked',
      questionsCount: 5,
      estimatedMarks: '15-20',
      color: 'from-red-500/10 to-red-500/5',
      borderColor: 'border-red-200',
      predictedQuestions: ['Define cell structure', 'Describe organelle functions', 'Compare prokaryotic and eukaryotic cells']
    },
    {
      id: 2,
      topic: 'Photosynthesis and Respiration',
      year: '2024',
      probability: 88,
      frequency: 'Very common',
      questionsCount: 4,
      estimatedMarks: '12-18',
      color: 'from-green-500/10 to-green-500/5',
      borderColor: 'border-green-200',
      predictedQuestions: ['Explain photosynthesis process', 'Compare aerobic and anaerobic respiration', 'ATP production']
    },
    {
      id: 3,
      topic: 'Protein Synthesis',
      year: '2024',
      probability: 85,
      frequency: 'Common',
      questionsCount: 3,
      estimatedMarks: '10-15',
      color: 'from-blue-500/10 to-blue-500/5',
      borderColor: 'border-blue-200',
      predictedQuestions: ['Role of RNA in protein synthesis', 'Transcription and translation', 'Ribosome function']
    },
    {
      id: 4,
      topic: 'Cell Division',
      year: '2023',
      probability: 78,
      frequency: 'Common',
      questionsCount: 3,
      estimatedMarks: '9-14',
      color: 'from-purple-500/10 to-purple-500/5',
      borderColor: 'border-purple-200',
      predictedQuestions: ['Stages of mitosis', 'Meiosis and sexual reproduction', 'Cell cycle regulation']
    },
    {
      id: 5,
      topic: 'Enzyme Kinetics',
      year: '2023',
      probability: 72,
      frequency: 'Moderately common',
      questionsCount: 2,
      estimatedMarks: '8-12',
      color: 'from-orange-500/10 to-orange-500/5',
      borderColor: 'border-orange-200',
      predictedQuestions: ['Enzyme activation energy', 'Factors affecting enzyme activity', 'Enzyme-substrate interactions']
    },
    {
      id: 6,
      topic: 'Genetics and Heredity',
      year: '2022',
      probability: 65,
      frequency: 'Moderately common',
      questionsCount: 2,
      estimatedMarks: '6-10',
      color: 'from-pink-500/10 to-pink-500/5',
      borderColor: 'border-pink-200',
      predictedQuestions: ['Mendelian inheritance', 'Punnett squares', 'Dominant and recessive traits']
    }
  ]

  const filteredPredictions = selectedYear === 'all'
    ? predictions
    : predictions.filter(p => p.year === selectedYear)

  const getTotalProbability = () => {
    return Math.round(filteredPredictions.reduce((sum, p) => sum + p.probability, 0) / filteredPredictions.length)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Past Paper Prediction</h1>
              <p className="text-muted-foreground">AI-powered analysis of likely exam questions based on past papers</p>
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

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border border-border p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Probability</p>
                  <p className="text-2xl font-bold text-foreground">{getTotalProbability()}%</p>
                </div>
              </div>
            </Card>
            <Card className="border border-border p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Predicted Topics</p>
                  <p className="text-2xl font-bold text-foreground">{filteredPredictions.length}</p>
                </div>
              </div>
            </Card>
            <Card className="border border-border p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Est. Marks</p>
                  <p className="text-2xl font-bold text-foreground">50-80</p>
                </div>
              </div>
            </Card>
            <Card className="border border-border p-4">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="text-2xl font-bold text-foreground">{filteredPredictions.reduce((sum, p) => sum + p.questionsCount, 0)}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Year Filter */}
          <div className="flex gap-3">
            {[
              { value: 'all', label: 'All Years' },
              { value: '2024', label: '2024' },
              { value: '2023', label: '2023' },
              { value: '2022', label: '2022' }
            ].map(filter => (
              <Button
                key={filter.value}
                variant={selectedYear === filter.value ? 'default' : 'outline'}
                onClick={() => setSelectedYear(filter.value as any)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Predictions Grid */}
        <div className="grid gap-4">
          {filteredPredictions.map((prediction) => (
            <Card key={prediction.id} className={`border ${prediction.borderColor} p-6 bg-gradient-to-br ${prediction.color}`}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg mb-1">{prediction.topic}</h3>
                    <p className="text-sm text-muted-foreground">Exam Year: {prediction.year}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-foreground" />
                      <span className="font-bold text-lg text-foreground">{prediction.probability}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Probability</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-card rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Frequency</p>
                    <p className="font-medium text-foreground">{prediction.frequency}</p>
                  </div>
                  <div className="p-3 bg-card rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Questions</p>
                    <p className="font-medium text-foreground">{prediction.questionsCount}</p>
                  </div>
                  <div className="p-3 bg-card rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Est. Marks</p>
                    <p className="font-medium text-foreground">{prediction.estimatedMarks}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50">
                  <p className="text-xs font-semibold text-foreground mb-2">Predicted Questions:</p>
                  <ul className="space-y-1">
                    {prediction.predictedQuestions.map((q, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-foreground">•</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
