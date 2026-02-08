'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Download, RotateCcw, Repeat2 } from 'lucide-react'
import { useState } from 'react'

export default function FlashcardsPage() {
  const [currentCard, setCurrentCard] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const flashcards = [
    {
      front: 'What is the basic unit of life?',
      back: 'The cell is the basic unit of life. All living organisms are composed of one or more cells.',
    },
    {
      front: 'Name the two types of cells',
      back: 'Prokaryotic cells (bacteria and archaea) and Eukaryotic cells (animals, plants, fungi, protists)',
    },
    {
      front: 'What does mitochondria do?',
      back: 'Mitochondria is the powerhouse of the cell. It produces energy in the form of ATP through cellular respiration.',
    },
    {
      front: 'What is the function of the Golgi apparatus?',
      back: 'The Golgi apparatus modifies, packages, and ships proteins and lipids to their destinations.',
    },
    {
      front: 'What do lysosomes contain?',
      back: 'Lysosomes contain digestive enzymes that break down waste materials and cellular debris.',
    },
    {
      front: 'What is the role of the cell membrane?',
      back: 'The cell membrane is a selectively permeable barrier that controls the movement of substances in and out of the cell.',
    },
  ]

  const nextCard = () => {
    setIsFlipped(false)
    setCurrentCard((prev) => (prev + 1) % flashcards.length)
  }

  const prevCard = () => {
    setIsFlipped(false)
    setCurrentCard((prev) => (prev - 1 + flashcards.length) % flashcards.length)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="p-8">
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Flashcards</h1>
              <p className="text-muted-foreground">Interactive flashcards for effective memorization</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              <Button className="gap-2">
                <Download className="w-4 h-4" />
                Export as Images
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-8">
          {/* Card Counter */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Card {currentCard + 1} of {flashcards.length}
            </p>
            <div className="mt-2 flex gap-1">
              {flashcards.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    idx <= currentCard ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Flashcard */}
          <div
            className="h-96 cursor-pointer perspective"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div
              className="relative w-full h-full transition-transform duration-500"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front */}
              <Card
                className="absolute w-full h-full border-2 border-primary bg-gradient-to-br from-primary/5 to-accent/5 p-8 flex items-center justify-center text-center"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-4">Question</p>
                  <h2 className="text-3xl font-bold text-foreground leading-tight">
                    {flashcards[currentCard].front}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-8">Click to reveal answer</p>
                </div>
              </Card>

              {/* Back */}
              <Card
                className="absolute w-full h-full border-2 border-accent bg-gradient-to-br from-accent/5 to-primary/5 p-8 flex items-center justify-center text-center"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-4">Answer</p>
                  <p className="text-lg text-foreground leading-relaxed">
                    {flashcards[currentCard].back}
                  </p>
                  <p className="text-xs text-muted-foreground mt-8">Click to see question</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button onClick={prevCard} variant="outline" size="icon" className="h-12 w-12">
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <div className="space-y-4 text-center">
              <Button variant="outline" className="gap-2">
                <Repeat2 className="w-4 h-4" />
                Mark for Review
              </Button>
              <div className="flex gap-2 justify-center">
                <Button size="sm" variant="ghost">
                  I Know
                </Button>
                <Button size="sm" variant="ghost">
                  Still Learning
                </Button>
              </div>
            </div>

            <Button onClick={nextCard} variant="outline" size="icon" className="h-12 w-12">
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          {/* Grid View */}
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">All Flashcards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {flashcards.map((card, idx) => (
                <Card
                  key={idx}
                  className={`p-4 border-2 cursor-pointer transition-all ${
                    idx === currentCard
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => {
                    setCurrentCard(idx)
                    setIsFlipped(false)
                  }}
                >
                  <p className="text-xs font-medium text-muted-foreground mb-2">Q{idx + 1}</p>
                  <p className="text-sm font-medium text-foreground line-clamp-2">{card.front}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
