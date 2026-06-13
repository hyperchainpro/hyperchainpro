import { NextRequest, NextResponse } from 'next/server';
import { LLM } from 'z-ai-web-dev-sdk';

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
  styles?: string;
  zIndex: number;
  locked: boolean;
  groupId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceSnapshot, targetSnapshot, boardName = 'Board' } = body;

    if (!sourceSnapshot || !Array.isArray(sourceSnapshot)) {
      return NextResponse.json(
        { error: 'sourceSnapshot array is required' },
        { status: 400 }
      );
    }

    if (!targetSnapshot || !Array.isArray(targetSnapshot)) {
      return NextResponse.json(
        { error: 'targetSnapshot array is required' },
        { status: 400 }
      );
    }

    try {
      const conflictInfo = JSON.stringify({
        sourceElements: sourceSnapshot.map((e: BoardElement) => ({
          id: e.id,
          type: e.type,
          content: e.content?.substring(0, 100),
          x: e.x,
          y: e.y,
          width: e.width,
          height: e.height,
          color: e.color,
        })),
        targetElements: targetSnapshot.map((e: BoardElement) => ({
          id: e.id,
          type: e.type,
          content: e.content?.substring(0, 100),
          x: e.x,
          y: e.y,
          width: e.width,
          height: e.height,
          color: e.color,
        })),
        boardName,
      });

      const result = await LLM.chat({
        model: 'glm-4-flash',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that resolves merge conflicts in a collaborative whiteboard application.
You will receive two snapshots: a source branch snapshot and a target branch snapshot.
Some elements may have the same ID but different content/position in each snapshot.
Your job is to produce a merged result that combines both snapshots intelligently.

Rules:
1. Elements that exist only in one snapshot should be kept as-is.
2. For conflicting elements (same ID, different content/position), use the source branch version as the base but incorporate meaningful changes from the target.
3. Ensure no duplicate element IDs in the output.
4. Preserve all element properties (id, type, x, y, width, height, rotation, content, color, zIndex, locked).

Respond with a JSON object with exactly two fields:
- "mergedElements": an array of the merged elements (each element must have: id, type, x, y, width, height, rotation, content, color, zIndex, locked)
- "explanation": a brief explanation of how conflicts were resolved

Respond ONLY with valid JSON, no markdown formatting.`,
          },
          {
            role: 'user',
            content: conflictInfo,
          },
        ],
      });

      const aiResponse = result.choices[0].message.content?.trim() || '';

      // Parse the AI response, handling potential markdown code blocks
      let jsonStr = aiResponse;
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      const parsed = JSON.parse(jsonStr);

      if (!parsed.mergedElements || !Array.isArray(parsed.mergedElements)) {
        throw new Error('Invalid AI response: missing mergedElements');
      }

      if (!parsed.explanation || typeof parsed.explanation !== 'string') {
        throw new Error('Invalid AI response: missing explanation');
      }

      // Ensure each merged element has all required fields
      const mergedElements: BoardElement[] = parsed.mergedElements.map((el: Record<string, unknown>) => ({
        id: String(el.id),
        type: String(el.type),
        x: Number(el.x) || 0,
        y: Number(el.y) || 0,
        width: Number(el.width) || 100,
        height: Number(el.height) || 100,
        rotation: Number(el.rotation) || 0,
        content: el.content != null ? String(el.content) : undefined,
        color: el.color != null ? String(el.color) : undefined,
        zIndex: Number(el.zIndex) || 0,
        locked: Boolean(el.locked),
      }));

      return NextResponse.json({
        mergedElements,
        explanation: parsed.explanation,
      });
    } catch (aiError) {
      console.error('AI conflict resolution failed:', aiError);

      // Fallback: simple merge strategy - prefer source for conflicts, include all unique elements
      const targetMap = new Map<string, BoardElement>();
      for (const el of targetSnapshot as BoardElement[]) {
        targetMap.set(el.id, el);
      }

      const mergedIds = new Set<string>();
      const mergedElements: BoardElement[] = [];

      // Add all source elements
      for (const el of sourceSnapshot as BoardElement[]) {
        mergedElements.push(el);
        mergedIds.add(el.id);
      }

      // Add target-only elements (not in source)
      for (const el of targetSnapshot as BoardElement[]) {
        if (!mergedIds.has(el.id)) {
          mergedElements.push(el);
        }
      }

      return NextResponse.json({
        mergedElements,
        explanation:
          'AI resolution unavailable. Used automatic merge: kept source branch versions for conflicts and included all unique elements from both branches.',
      });
    }
  } catch (error) {
    console.error('Error resolving conflicts:', error);
    return NextResponse.json(
      { error: 'Failed to resolve conflicts' },
      { status: 500 }
    );
  }
}