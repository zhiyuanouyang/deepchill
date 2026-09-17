import { NextRequest, NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { getAiClient } from '@/lib/gemini';
import { Product } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, products = [] } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
    }

    const ai = getAiClient();

    if (!ai) {
      // Graceful fallback if no GEMINI_API_KEY is supplied
      return NextResponse.json({
        answer: `Here are the top matches found for "${query}". Explore these indie and open-source tools curated in our directory.`,
        recommendedProductIds: products.slice(0, 3).map((p: Product) => p.id),
        keyTakeaways: [
          'High quality open-source and indie-backed software',
          'Self-hostable or zero vendor lock-in',
          'Direct dofollow backlinks for all listed projects',
        ],
        searchTags: ['Open Source', 'Self-Hosted', 'Developer Tools'],
      });
    }

    // Summarize directory catalog for context
    const directorySummary = (products as Product[]).map((p) => ({
      id: p.id,
      name: p.name,
      tagline: p.tagline,
      category: p.category,
      pricing: p.pricing,
      tags: p.tags,
    }));

    const systemInstruction = `You are the intelligent AI Search & Discovery Assistant for the "Indie & Open Source Product Directory".
Your goal is to answer developer and maker queries about tools, open-source alternatives, indie projects, and stack decisions.
You have access to a directory catalog of verified indie and open-source products.
Analyze the user's inquiry, match with the most relevant products from the provided directory catalog, explain why each fits their needs, and provide clear developer guidance.
Always return structured JSON matching the requested schema.`;

    const prompt = `User Query: "${query}"

Available Directory Catalog:
${JSON.stringify(directorySummary, null, 2)}

Provide a thoughtful, developer-focused recommendation response.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: {
              type: Type.STRING,
              description: 'Clear, insightful 2-4 sentence recommendation explaining how these tools solve the query.',
            },
            recommendedProductIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Array of product IDs from the catalog that match the user request.',
            },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 to 3 concise bullet points highlighting key benefits.',
            },
            searchTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 to 5 relevant keyword tags.',
            },
          },
          required: ['answer', 'recommendedProductIds', 'keyTakeaways', 'searchTags'],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);

    return NextResponse.json({
      answer: parsed.answer || 'Here are the best indie and open-source matches for your query.',
      recommendedProductIds: Array.isArray(parsed.recommendedProductIds) ? parsed.recommendedProductIds : [],
      keyTakeaways: Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways : [],
      searchTags: Array.isArray(parsed.searchTags) ? parsed.searchTags : [],
    });
  } catch (err: unknown) {
    console.error('Error in /api/ai/ask:', err);
    return NextResponse.json(
      {
        error: 'Failed to process AI search query.',
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
