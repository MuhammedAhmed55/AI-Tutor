import { NextResponse } from 'next/server'

const API_KEY = process.env.GEMINI_API_KEY

export async function POST(request: Request) {
  const { messages } = await request.json()

  // Format messages for Gemini API (latest format)
  const contents = messages.map((msg: any) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }))

  const body = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 256,
    }
  }

  try {
    // Using the current stable model: gemini-2.5-flash
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', errorText)
      return NextResponse.json({ error: 'Failed to fetch from Gemini API' }, { status: 500 })
    }

    const data = await response.json()
    console.log('Gemini API response:', data)

    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, no response'

    return NextResponse.json({ aiText })
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    return NextResponse.json({ error: 'Error calling Gemini API' }, { status: 500 })
  }
}