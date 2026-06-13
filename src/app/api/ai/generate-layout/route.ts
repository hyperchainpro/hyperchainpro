import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { boardName = 'Board', description } = body;

    if (!boardName) {
      return NextResponse.json(
        { error: 'boardName is required' },
        { status: 400 }
      );
    }

    try {
      const zai = await ZAI.create();

      const userPrompt = description
        ? `Generate a whiteboard layout for a board called "${boardName}". Description: "${description}". Create a well-organized layout with a title text element, some sticky notes with ideas, rectangles for process steps, and connecting text labels. Arrange elements in a logical flow from top to bottom or left to right.`
        : `Generate a whiteboard layout for a board called "${boardName}". Create a well-organized layout with a title text element, some sticky notes with relevant ideas, rectangles for key areas, and text labels. Arrange elements in a logical flow from top to bottom or left to right.`;

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: `You are a whiteboard layout generator. Given a board name and optional description, generate a JSON array of whiteboard elements.

Valid element types are: STICKY_NOTE, RECTANGLE, CIRCLE, LINE, TEXT, CONNECTOR.

Each element must have:
- "type": one of the valid types above
- "x": horizontal position (number, 50-800)
- "y": vertical position (number, 50-600)
- "content": text content for the element (string)
- "color": background color as hex string (e.g. "#FEF3C7" for yellow sticky, "#FFFFFF" for white rectangle, "#DBEAFE" for blue sticky, "#D1FAE5" for green sticky, "#FCE7F3" for pink sticky, "transparent" for text)
- "width": optional width (number, default varies by type)
- "height": optional height (number, default varies by type)

Generate 5-10 elements that form a coherent layout. Include a TEXT element as a title at the top. Group related items together spatially.

Respond ONLY with a valid JSON array, no markdown formatting or extra text.`,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        thinking: { type: 'disabled' },
      });

      const aiResponse = completion.choices[0]?.message?.content?.trim() || '';

      // Parse the AI response, handling potential markdown code blocks
      let jsonStr = aiResponse;
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      const elements = JSON.parse(jsonStr);

      if (!Array.isArray(elements) || elements.length === 0) {
        throw new Error('Invalid AI response: expected non-empty array');
      }

      // Validate and normalize elements
      const validTypes = ['STICKY_NOTE', 'RECTANGLE', 'CIRCLE', 'LINE', 'TEXT', 'CONNECTOR'];
      const normalized = elements.map((el: Record<string, unknown>, index: number) => ({
        type: validTypes.includes(String(el.type)) ? String(el.type) : 'TEXT',
        x: Number(el.x) || 100 + (index % 3) * 250,
        y: Number(el.y) || 100 + Math.floor(index / 3) * 200,
        width: Number(el.width) || (String(el.type) === 'STICKY_NOTE' ? 200 : String(el.type) === 'TEXT' ? 200 : 180),
        height: Number(el.height) || (String(el.type) === 'STICKY_NOTE' ? 160 : String(el.type) === 'TEXT' ? 40 : 120),
        content: typeof el.content === 'string' ? el.content : `Element ${index + 1}`,
        color: typeof el.color === 'string' ? el.color : '#FFFFFF',
      }));

      return NextResponse.json({ elements: normalized });
    } catch (aiError) {
      console.error('AI layout generation failed:', aiError);
      return NextResponse.json(
        { error: 'Failed to generate layout. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating layout:', error);
    return NextResponse.json(
      { error: 'Failed to generate layout' },
      { status: 500 }
    );
  }
}