// app/api/tailor/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { resume, jobDescription } = await req.json();

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct', // or try other free models like 'meta-llama/llama-3-8b-instruct'
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that tailors resumes to match job descriptions.'
          },
          {
            role: 'user',
            content: `Here is the resume:\n${resume}\n\nHere is the job description:\n${jobDescription}\n\nTailor the resume to better match the job description.`
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `Error tailoring resume: ${error}` }, { status: 500 });
    }

    const data = await response.json();
    const tailoredResume = data.choices?.[0]?.message?.content;

    return NextResponse.json({ tailoredResume });
  } catch (err) {
    return NextResponse.json({ error: `Unexpected error: ${err}` }, { status: 500 });
  }
}
