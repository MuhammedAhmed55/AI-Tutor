import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/supabase-server-client';
// @ts-ignore
import PDFParser from 'pdf2json';

const API_KEY = process.env.GEMINI_API_KEY;

// Helper function to extract text from PDF with error handling
async function extractTextFromPDF(pdfBuffer: Buffer): Promise<{ text: string; numPages: number }> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      try {
        let fullText = '';
        const pages = pdfData.Pages || [];

        pages.forEach((page: any) => {
          const texts = page.Texts || [];
          texts.forEach((text: any) => {
            try {
              const rawText = text.R?.[0]?.T || '';
              if (rawText) {
                try {
                  const decoded = decodeURIComponent(rawText);
                  fullText += decoded + ' ';
                } catch (e) {
                  fullText += rawText + ' ';
                }
              }
            } catch (err) {
              console.warn('Skipping malformed text in PDF');
            }
          });
          fullText += '\n';
        });

        resolve({
          text: fullText.trim(),
          numPages: pages.length,
        });
      } catch (error) {
        reject(error);
      }
    });

    pdfParser.on('pdfParser_dataError', (error: any) => {
      reject(error);
    });

    pdfParser.parseBuffer(pdfBuffer);
  });
}

// Helper function to call Gemini API
async function callGemini(prompt: string, maxTokens: number = 2048, temperature: number = 0.7): Promise<string | null> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return null;
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error('Error calling Gemini:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { pdfNoteId, userId } = await request.json();

    if (!pdfNoteId || !userId) {
      return NextResponse.json(
        { error: 'Missing pdfNoteId or userId' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // 1. Get PDF details from database
    const { data: pdfNote, error: fetchError } = await supabase
      .from('pdf_notes')
      .select('*')
      .eq('id', pdfNoteId)
      .single();

    if (fetchError || !pdfNote) {
      return NextResponse.json(
        { error: 'PDF not found' },
        { status: 404 }
      );
    }

    // 2. Download and extract text from PDF
    const response = await fetch(pdfNote.file_url);
    const arrayBuffer = await response.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);
    
    const { text: extractedText, numPages } = await extractTextFromPDF(pdfBuffer);

    if (!extractedText || extractedText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Could not extract meaningful text from PDF' },
        { status: 400 }
      );
    }

    const textToProcess = extractedText.substring(0, 30000);

    // 3. Generate summaries (smart, brief, detailed)
    const summaryPrompts = [
      {
        type: 'smart',
        prompt: `Create a smart, concept-focused summary highlighting the key ideas, insights, and takeaways from this text. Make it clear and structured:\n\n${textToProcess}`,
      },
      {
        type: 'brief',
        prompt: `Create a brief 2-3 paragraph summary of the main points from this text:\n\n${textToProcess}`,
      },
      {
        type: 'detailed',
        prompt: `Create a comprehensive, detailed summary covering all important points, examples, and explanations from this text:\n\n${textToProcess}`,
      },
    ];

    const summaries = [];

    for (const { type, prompt } of summaryPrompts) {
      const startTime = Date.now();
      const content = await callGemini(prompt, 1024, 0.7);

      if (content) {
        const generationTime = Date.now() - startTime;

        const { data: summary, error: summaryError } = await supabase
          .from('ai_summaries')
          .insert({
            user_id: userId,
            pdf_note_id: pdfNoteId,
            summary_type: type,
            content,
            model_used: 'gemini-2.5-flash',
            generation_time_ms: generationTime,
          })
          .select()
          .single();

        if (summaryError) {
          console.error(`Error saving ${type} summary:`, summaryError);
        } else if (summary) {
          summaries.push(summary);
          console.log(`Successfully saved ${type} summary`);
        }
      }
    }

    // 4. Generate flashcards
    let flashcardDeck = null;
    let flashcards = [];

    try {
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

      const flashcardText = await callGemini(flashcardPrompt, 2048, 0.8);

      if (flashcardText) {
        const cleanedText = flashcardText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();

        try {
          const flashcardsData = JSON.parse(cleanedText);

          if (Array.isArray(flashcardsData) && flashcardsData.length > 0) {
            const { data: deck, error: deckError } = await supabase
              .from('flashcard_decks')
              .insert({
                user_id: userId,
                pdf_note_id: pdfNoteId,
                title: `${pdfNote.file_name} - Flashcards`,
                description: 'Auto-generated flashcards from PDF',
                total_cards: flashcardsData.length,
              })
              .select()
              .single();

            if (!deckError && deck) {
              flashcardDeck = deck;

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

              if (!cardsError && insertedCards) {
                flashcards = insertedCards;
                console.log(`Successfully created ${flashcards.length} flashcards`);
              }
            }
          }
        } catch (parseError) {
          console.error('Failed to parse flashcards JSON:', parseError);
        }
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
    }

    // 5. Generate MCQs
    let mcqSet = null;
    let mcqQuestions = [];

    try {
      const mcqPrompt = `Generate exactly 5 multiple choice questions from the following text. Return ONLY a valid JSON array with this exact structure, no other text:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "explanation": "Brief explanation of why this is correct",
    "difficulty": "medium"
  }
]

Rules:
- correct_answer must be 0, 1, 2, or 3 (index of correct option)
- difficulty must be: easy, medium, or hard
- Provide 4 options for each question
- Include brief explanation for each

Text to generate MCQs from:
${textToProcess}`;

      const mcqText = await callGemini(mcqPrompt, 2048, 0.8);

      if (mcqText) {
        const cleanedText = mcqText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();

        try {
          const mcqData = JSON.parse(cleanedText);

          if (Array.isArray(mcqData) && mcqData.length > 0) {
            // Calculate difficulty distribution
            const difficultyCounts = mcqData.reduce((acc: any, q: any) => {
              acc[q.difficulty || 'medium'] = (acc[q.difficulty || 'medium'] || 0) + 1;
              return acc;
            }, {});
            
            const dominantDifficulty = Object.entries(difficultyCounts)
              .sort((a: any, b: any) => b[1] - a[1])[0][0];

            const { data: set, error: setError } = await supabase
              .from('mcq_sets')
              .insert({
                user_id: userId,
                pdf_note_id: pdfNoteId,
                title: `${pdfNote.file_name} - MCQs`,
                difficulty_level: dominantDifficulty,
                total_questions: mcqData.length,
              })
              .select()
              .single();

            if (!setError && set) {
              mcqSet = set;

              const questionInserts = mcqData.map((q: any) => ({
                mcq_set_id: set.id,
                question_text: q.question,
                options: q.options,
                correct_answer: q.correct_answer,
                explanation: q.explanation || '',
                difficulty: q.difficulty || 'medium',
              }));

              const { data: insertedQuestions, error: questionsError } = await supabase
                .from('mcq_questions')
                .insert(questionInserts)
                .select();

              if (!questionsError && insertedQuestions) {
                mcqQuestions = insertedQuestions;
                console.log(`Successfully created ${mcqQuestions.length} MCQs`);
              }
            }
          }
        } catch (parseError) {
          console.error('Failed to parse MCQs JSON:', parseError);
        }
      }
    } catch (error) {
      console.error('Error generating MCQs:', error);
    }

    // 6. Generate Short Questions
    let shortQuestionSet = null;
    let shortQuestions = [];

    try {
      const shortQPrompt = `Generate exactly 5 short answer questions from the following text suitable for a 5-mark exam question. Return ONLY a valid JSON array with this exact structure, no other text:
[
  {
    "question": "Question text here?",
    "answer": "Detailed answer here (2-3 paragraphs)",
    "marks": 5
  }
]

Rules:
- Questions should require detailed but concise answers
- Answers should be comprehensive but exam-appropriate
- marks should be 5 for all questions

Text to generate short questions from:
${textToProcess}`;

      const shortQText = await callGemini(shortQPrompt, 2048, 0.7);

      if (shortQText) {
        const cleanedText = shortQText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();

        try {
          const shortQData = JSON.parse(cleanedText);

          if (Array.isArray(shortQData) && shortQData.length > 0) {
            const { data: set, error: setError } = await supabase
              .from('short_question_sets')
              .insert({
                user_id: userId,
                pdf_note_id: pdfNoteId,
                title: `${pdfNote.file_name} - Short Questions`,
                total_questions: shortQData.length,
              })
              .select()
              .single();

            if (!setError && set) {
              shortQuestionSet = set;

              const questionInserts = shortQData.map((q: any) => ({
                set_id: set.id,
                question_text: q.question,
                answer_text: q.answer,
                marks: q.marks || 5,
              }));

              const { data: insertedQuestions, error: questionsError } = await supabase
                .from('short_questions')
                .insert(questionInserts)
                .select();

              if (!questionsError && insertedQuestions) {
                shortQuestions = insertedQuestions;
                console.log(`Successfully created ${shortQuestions.length} short questions`);
              }
            }
          }
        } catch (parseError) {
          console.error('Failed to parse short questions JSON:', parseError);
        }
      }
    } catch (error) {
      console.error('Error generating short questions:', error);
    }

    // 7. Generate Important Topics
    let importantTopics = [];

    try {
      const topicsPrompt = `Extract the 5 most important topics from the following text. Return ONLY a valid JSON array with this exact structure, no other text:
[
  {
    "topic_name": "Main Topic Name",
    "description": "Brief description of this topic",
    "importance_score": 8,
    "subtopics": ["Subtopic 1", "Subtopic 2", "Subtopic 3"],
    "key_points": ["Key point 1", "Key point 2", "Key point 3"]
  }
]

Rules:
- importance_score must be 1-10 (10 being most important)
- subtopics should be an array of related sub-topics (3-5 items)
- key_points should be an array of crucial points to remember (3-5 items)

Text to extract important topics from:
${textToProcess}`;

      const topicsText = await callGemini(topicsPrompt, 2048, 0.6);

      if (topicsText) {
        const cleanedText = topicsText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();

        try {
          const topicsData = JSON.parse(cleanedText);

          if (Array.isArray(topicsData) && topicsData.length > 0) {
            const topicInserts = topicsData.map((t: any) => ({
              user_id: userId,
              pdf_note_id: pdfNoteId,
              topic_name: t.topic_name,
              description: t.description || '',
              importance_score: Math.min(10, Math.max(1, t.importance_score || 5)),
              subtopics: t.subtopics || [],
              key_points: t.key_points || [],
            }));

            const { data: insertedTopics, error: topicsError } = await supabase
              .from('important_topics')
              .insert(topicInserts)
              .select();

            if (!topicsError && insertedTopics) {
              importantTopics = insertedTopics;
              console.log(`Successfully created ${importantTopics.length} important topics`);
            } else {
              console.error('Error inserting important topics:', topicsError);
            }
          }
        } catch (parseError) {
          console.error('Failed to parse important topics JSON:', parseError);
        }
      }
    } catch (error) {
      console.error('Error generating important topics:', error);
    }

    // 8. Update PDF as processed
    await supabase
      .from('pdf_notes')
      .update({
        is_processed: true,
        total_pages: numPages,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pdfNoteId);

    console.log('PDF Processing Complete:', {
      summariesCount: summaries.length,
      flashcardsCount: flashcards.length,
      mcqsCount: mcqQuestions.length,
      shortQuestionsCount: shortQuestions.length,
      importantTopicsCount: importantTopics.length,
      totalPages: numPages,
    });

    return NextResponse.json({
      success: true,
      summaries,
      flashcardDeck,
      flashcards,
      mcqSet,
      mcqQuestions,
      shortQuestionSet,
      shortQuestions,
      importantTopics,
      totalPages: numPages,
    });
  } catch (error: any) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process PDF' },
      { status: 500 }
    );
  }
}