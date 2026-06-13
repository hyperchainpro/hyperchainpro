import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { elements, boardName = 'Board' } = body;

    if (!elements || !Array.isArray(elements) || elements.length === 0) {
      return NextResponse.json(
        { error: 'elements array is required' },
        { status: 400 }
      );
    }

    const elementSummaries = elements.map((e: Record<string, unknown>) => ({
      type: e.type || 'unknown',
      content: typeof e.content === 'string' ? e.content.substring(0, 50) : undefined,
    }));

    try {
      const zai = await ZAI.create();

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content:
              'You are a helpful assistant that generates concise Git commit messages. Respond with only the commit message, no explanation.',
          },
          {
            role: 'user',
            content: `Generate a concise commit message (max 72 chars) for changes to board "${boardName}". Elements changed: ${JSON.stringify(elementSummaries)}`,
          },
        ],
        thinking: { type: 'disabled' },
      });

      const message = completion.choices[0]?.message?.content?.trim() || 'Update board elements';

      // Truncate to 72 characters if needed
      const truncated = message.length > 72 ? message.substring(0, 69) + '...' : message;

      return NextResponse.json({ message: truncated });
    } catch (aiError) {
      console.error('AI commit message generation failed:', aiError);
      return NextResponse.json({ message: 'Update board elements' });
    }
  } catch (error) {
    console.error('Error generating commit message:', error);
    return NextResponse.json(
      { error: 'Failed to generate commit message' },
      { status: 500 }
    );
  }
}