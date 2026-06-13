import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface BoardElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content?: string;
  color?: string;
  zIndex: number;
  locked: boolean;
}

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

    if (!boardName) {
      return NextResponse.json(
        { error: 'boardName is required' },
        { status: 400 }
      );
    }

    try {
      const zai = await ZAI.create();

      // Build a summary of the board elements for the AI
      const elementInfo = (elements as BoardElement[]).map((e, i) => ({
        index: i + 1,
        type: e.type,
        content: e.content?.substring(0, 100) || '(empty)',
        position: `(${Math.round(e.x)}, ${Math.round(e.y)})`,
      }));

      const boardDescription = JSON.stringify(elementInfo, null, 2);

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: `You are a helpful assistant that summarizes whiteboard content. Given a list of elements on a whiteboard board, provide a clear, concise summary (2-4 sentences) describing what the board contains, its purpose, and any notable patterns or groupings. Write in a professional but friendly tone.`,
          },
          {
            role: 'user',
            content: `Summarize the following whiteboard board named "${boardName}" with these elements:\n\n${boardDescription}`,
          },
        ],
        thinking: { type: 'disabled' },
      });

      const summary = completion.choices[0]?.message?.content?.trim() || 'Unable to generate a summary of this board.';

      return NextResponse.json({ summary });
    } catch (aiError) {
      console.error('AI summarization failed:', aiError);
      return NextResponse.json(
        { error: 'Failed to generate summary. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error summarizing board:', error);
    return NextResponse.json(
      { error: 'Failed to summarize board' },
      { status: 500 }
    );
  }
}