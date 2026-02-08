'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, Calendar, Clock, TrendingUp } from 'lucide-react'
import { useState } from 'react'

export default function StudyPlanPage() {
  const [formState, setFormState] = useState({
    chapterName: 'Cell Biology',
    timeAvailable: '7',
    difficulty: 'medium',
  })

  const [studyPlan, setStudyPlan] = useState({
    generated: true,
    chapters: [
      {
        day: 1,
        topics: ['Introduction to Cells', 'Types of Cells'],
        duration: '1.5 hours',
        activities: ['Read theory', 'Watch videos'],
      },
      {
        day: 2,
        topics: ['Cell Structure', 'Organelles'],
        duration: '2 hours',
        activities: ['Study notes', 'Create flashcards'],
      },
      {
        day: 3,
        topics: ['Cell Functions', 'Protein Synthesis'],
        duration: '2 hours',
        activities: ['Practice problems', 'MCQ practice'],
      },
      {
        day: 4,
        topics: ['Cell Division', 'Mitosis & Meiosis'],
        duration: '2.5 hours',
        activities: ['Diagrams study', 'Short answers'],
      },
      {
        day: 5,
        topics: ['DNA & Genetics', 'Inheritance'],
        duration: '2 hours',
        activities: ['Read chapter', 'Generate summary'],
      },
      {
        day: 6,
        topics: ['Revision', 'Past papers'],
        duration: '2 hours',
        activities: ['MCQ test', 'Review weak areas'],
      },
      {
        day: 7,
        topics: ['Final revision', 'Mock exam'],
        duration: '2 hours',
        activities: ['Full test', 'Check answers'],
      },
    ],
  })

  return (
    <div className="min-h-screen bg-background">
      <main className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Study Plan Generator</h1>
          <p className="text-muted-foreground">Create a personalized study schedule based on your needs</p>
        </div>

        {!studyPlan.generated ? (
          <Card className="border border-border p-8 max-w-2xl">
            <h2 className="text-xl font-semibold text-foreground mb-6">Create Your Study Plan</h2>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Chapter/Topic Name</label>
                <Input
                  placeholder="Enter chapter name"
                  value={formState.chapterName}
                  onChange={(e) => setFormState({ ...formState, chapterName: e.target.value })}
                  className="bg-input border border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Time Available (Days)</label>
                <Input
                  type="number"
                  value={formState.timeAvailable}
                  onChange={(e) => setFormState({ ...formState, timeAvailable: e.target.value })}
                  className="bg-input border border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setFormState({ ...formState, difficulty: level })}
                      className={`p-3 rounded-lg border-2 capitalize font-medium transition-colors ${
                        formState.difficulty === level
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <Button className="w-full" size="lg">
                Generate Study Plan
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Plan Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border border-border p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm text-muted-foreground">Total Duration</h3>
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{studyPlan.chapters.length} Days</p>
              </Card>

              <Card className="border border-border p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm text-muted-foreground">Daily Time</h3>
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <p className="text-2xl font-bold text-foreground">1.5-2.5 hrs</p>
              </Card>

              <Card className="border border-border p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm text-muted-foreground">Topics Covered</h3>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-foreground">14 Topics</p>
              </Card>
            </div>

            {/* Day-wise Breakdown */}
            <div className="space-y-4 mb-8">
              {studyPlan.chapters.map((chapter) => (
                <Card
                  key={chapter.day}
                  className="border border-border overflow-hidden hover:border-primary/50 transition-colors"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-bold bg-primary text-primary-foreground rounded px-3 py-1">
                            Day {chapter.day}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {chapter.duration}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Topics to Cover:</h4>
                        <div className="flex flex-wrap gap-2">
                          {chapter.topics.map((topic) => (
                            <span
                              key={topic}
                              className="text-xs bg-primary/10 text-primary rounded-full px-3 py-1"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Recommended Activities:</h4>
                        <ul className="space-y-1">
                          {chapter.activities.map((activity) => (
                            <li
                              key={activity}
                              className="flex items-center gap-2 text-sm text-muted-foreground"
                            >
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button className="gap-2" size="lg">
                <Download className="w-4 h-4" />
                Download Plan
              </Button>
              <Button variant="outline" size="lg">
                Generate New Plan
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
