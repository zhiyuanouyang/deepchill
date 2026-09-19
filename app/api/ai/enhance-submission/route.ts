import { NextRequest, NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { getAiClient } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Project name is required.' }, { status: 400 });
    }

    const ai = getAiClient();

    if (!ai) {
      // Graceful fallback if no GEMINI_API_KEY is supplied
      return NextResponse.json({
        polishedTagline: `${name} — Built for modern developers and indie creators.`,
        suggestedTags: ['Open Source', 'DevTools', 'Indie', 'Productivity'],
        seoAdvice: 'Include clear developer keywords in your README to maximize backlink referral value.',
        suggestedFeatures: [
          'High performance and lightweight architecture',
          'Zero-lockin developer friendly API design',
          'Seamless integration with modern tech stacks',
        ],
        targetAudience: 'Software developers, indie makers, and engineering teams',
      });
    }

    const prompt = `A developer is submitting their indie / open-source project to our high-authority product directory.
Project Name: ${name}
Project Description: ${description || 'A developer tool or indie product'}

Please create:
1. A punchy, high-converting 1-sentence tagline (under 75 characters, clean, no hype verbs).
2. Exactly 4-5 high-relevance technical/category tags (e.g. ['PostgreSQL', 'DevOps', 'TypeScript']).
3. A brief 1-sentence SEO tip for boosting backlink conversion.
4. Exactly 3 key feature highlight bullet points (concise, clear value propositions).
5. A concise target audience description (e.g. "Full-stack developers and SaaS founders").`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.4,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            polishedTagline: { type: Type.STRING },
            suggestedTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            seoAdvice: { type: Type.STRING },
            suggestedFeatures: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            targetAudience: { type: Type.STRING },
          },
          required: ['polishedTagline', 'suggestedTags', 'seoAdvice', 'suggestedFeatures', 'targetAudience'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return NextResponse.json({
      polishedTagline: parsed.polishedTagline || `${name} — Built for modern developers and creators.`,
      suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags : ['DevTools', 'Indie'],
      seoAdvice: parsed.seoAdvice || 'Include clear developer keywords in your project documentation.',
      suggestedFeatures: Array.isArray(parsed.suggestedFeatures)
        ? parsed.suggestedFeatures
        : [
            'High performance and lightweight architecture',
            'Zero-lockin developer friendly API design',
            'Seamless integration with modern tech stacks',
          ],
      targetAudience: parsed.targetAudience || 'Developers, indie makers, and modern tech teams',
    });
  } catch (err: unknown) {
    console.error('Error in /api/ai/enhance-submission:', err);
    return NextResponse.json(
      {
        error: 'Failed to enhance submission.',
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
