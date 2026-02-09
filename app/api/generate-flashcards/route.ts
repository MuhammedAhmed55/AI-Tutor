import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/supabase-server-client';

const API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  try {
    const { pdfNoteId, userId, extractedText, pdfFileName } = await request.json();

    if (!pdfNoteId || !userId || !extractedText) {
      return NextResponse.json(
        { error: 'Missing required parameters: pdfNoteId, userId, or extractedText' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Limit text to avoid token limits
    const textToProcess = extractedText.substring(0, 30000);

    // Generate flashcards prompt - ONLY 5 flashcards
    const flashcardPrompt = `Generate exactly 5 educational flashcards from the following text. Return ONLY a valid JSON array with this exact structure, no other text:
[
  {
    "front": "Question or term here",
    "back": "Answer or definition here",
    "difficulty": "easy"
  }
]

Difficulty should be: easy, medium, or hard.

Text to generate flashcards from:
${textToProcess}`;

    console.log('Starting flashcard generation for PDF:', pdfNoteId);

    const flashcardResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: flashcardPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    let flashcardDeck = null;
    let flashcards = [];

    if (!flashcardResponse.ok) {
      const errorData = await flashcardResponse.text();
      console.error('Flashcard API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate flashcards from Gemini API' },
        { status: 500 }
      );
    }

    const data = await flashcardResponse.json();
    let flashcardText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!flashcardText) {
      console.warn('Empty response from Gemini API for flashcards');
      return NextResponse.json({
        success: true,
        flashcardDeck: null,
        flashcards: [],
        message: 'No flashcard content generated',
      });
    }

    // Clean up response - remove markdown code blocks if present
    flashcardText = flashcardText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    try {
      const flashcardsData = JSON.parse(flashcardText);

      if (!Array.isArray(flashcardsData) || flashcardsData.length === 0) {
        console.warn('Invalid or empty flashcards array from Gemini');
        return NextResponse.json({
          success: true,
          flashcardDeck: null,
          flashcards: [],
          message: 'No valid flashcards generated',
        });
      }

      // Create deck
      const { data: deck, error: deckError } = await supabase
        .from('flashcard_decks')
        .insert({
          user_id: userId,
          pdf_note_id: pdfNoteId,
          title: `${pdfFileName || 'PDF'} - Flashcards`,
          description: 'Auto-generated flashcards from PDF',
          total_cards: flashcardsData.length,
        })
        .select()
        .single();

      if (deckError || !deck) {
        console.error('Error creating flashcard deck:', deckError);
        return NextResponse.json(
          { error: 'Failed to create flashcard deck' },
          { status: 500 }
        );
      }

      flashcardDeck = deck;

      // Create individual flashcards
      const flashcardInserts = flashcardsData.map((card: any) => ({
        deck_id: deck.id,
        front_text: card.front,
        back_text: card.back,
        difficulty: card.difficulty || 'medium',
      }));

      const { data: insertedCards, error: cardsError } = await supabase
        .from('flashcards')
        .insert(flashcardInserts)
        .select();

      if (cardsError) {
        console.error('Error inserting flashcards:', cardsError);
        return NextResponse.json(
          { error: 'Failed to insert flashcards' },
          { status: 500 }
        );
      }

      if (insertedCards) {
        flashcards = insertedCards;
        console.log(`Successfully created ${flashcards.length} flashcards`);
      }

      return NextResponse.json({
        success: true,
        flashcardDeck,
        flashcards,
      });
    } catch (parseError) {
      console.error('Failed to parse flashcards JSON:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse flashcard response as JSON' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error generating flashcards:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate flashcards' },
      { status: 500 }
    );
  }
}
