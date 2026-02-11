'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Download, RotateCcw, Repeat2, Loader2, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/supabase-auth-client'

interface Flashcard {
  id: string
  front_text: string
  back_text: string
  difficulty: string
}

interface FlashcardDeck {
  id: string
  title: string
  description: string
  total_cards: number
}

export default function FlashcardsPage() {
  const [currentCard, setCurrentCard] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [decks, setDecks] = useState<FlashcardDeck[]>([])
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDecks()
  }, [])

  const loadDecks = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabaseClient = supabase()
      
      const { data: { user } } = await supabaseClient.auth.getUser()
      if (!user) {
        setError('Please log in to view flashcards')
        return
      }

      const { data, error: err } = await supabaseClient
        .from('flashcard_decks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (err) {
        setError('Failed to load flashcard decks')
        console.error(err)
      } else {
        setDecks(data || [])
        if (data && data.length > 0) {
          setSelectedDeck(data[0].id)
          loadFlashcards(data[0].id)
        }
      }
    } catch (err) {
      setError('An error occurred while loading decks')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadFlashcards = async (deckId: string) => {
    try {
      setLoading(true)
      setError(null)
      const supabaseClient = supabase()

      const { data, error: err } = await supabaseClient
        .from('flashcards')
        .select('*')
        .eq('deck_id', deckId)
        .order('created_at', { ascending: true })

      if (err) {
        setError('Failed to load flashcards')
        console.error(err)
      } else {
        setFlashcards(data || [])
        setCurrentCard(0)
        setIsFlipped(false)
      }
    } catch (err) {
      setError('An error occurred while loading flashcards')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const nextCard = () => {
    setIsFlipped(false)
    setCurrentCard((prev) => (prev + 1) % flashcards.length)
  }

  const prevCard = () => {
    setIsFlipped(false)
    setCurrentCard((prev) => (prev - 1 + flashcards.length) % flashcards.length)
  }

  const handleDeckSelect = (deckId: string) => {
    setSelectedDeck(deckId)
    loadFlashcards(deckId)
  }

  const deleteFlashcard = async (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this flashcard?')) {
      return
    }
    
    try {
      const supabaseClient = supabase()
      const { error } = await supabaseClient
        .from('flashcards')
        .delete()
        .eq('id', cardId)
      
      if (error) {
        setError('Failed to delete flashcard')
        console.error(error)
      } else {
        setFlashcards(flashcards.filter(card => card.id !== cardId))
        if (currentCard >= flashcards.length - 1 && currentCard > 0) {
          setCurrentCard(currentCard - 1)
        }
      }
    } catch (err) {
      setError('An error occurred while deleting the flashcard')
      console.error(err)
    }
  }

  if (loading && flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading flashcards...</p>
        </div>
      </div>
    )
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
              <Button variant="outline" className="gap-2" onClick={() => loadDecks()}>
                <RotateCcw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Deck Selection */}
        {decks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Your Flashcard Decks</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {decks.map((deck) => (
                <Card
                  key={deck.id}
                  className={`p-4 cursor-pointer transition-all border-2 ${
                    selectedDeck === deck.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleDeckSelect(deck.id)}
                >
                  <p className="font-semibold text-foreground">{deck.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{deck.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">{deck.total_cards} cards</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {flashcards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {decks.length === 0
                ? 'No flashcard decks yet. Upload and process a PDF to create flashcards!'
                : 'No flashcards in this deck yet.'}
            </p>
          </div>
        ) : (
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
                      {flashcards[currentCard]?.front_text}
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
                      {flashcards[currentCard]?.back_text}
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
                    key={card.id}
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
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Q{idx + 1}</p>
                        <p className="text-sm font-medium text-foreground line-clamp-2">{card.front_text}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => deleteFlashcard(card.id, e)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
