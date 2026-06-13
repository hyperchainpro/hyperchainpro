import { NextRequest, NextResponse } from 'next/server';
import { createLLM } from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';
import type { BoardElement, ElementStyles } from '@/lib/types';

const DEMO_USER_ID = 'user-demo-1';

const DEFAULT_SYSTEM_PROMPT = `You are a professional UI/UX design assistant that generates board element layouts from text descriptions. You create realistic, well-structured UI designs with proper spacing, typography hierarchy, and visual composition.

You MUST respond with a JSON object containing an "elements" array. Each element must have these fields:
- "type": one of "RECTANGLE", "CIRCLE", "ELLIPSE", "TEXT", "LINE", "IMAGE", "FRAME", "PEN_PATH", "STICKY_NOTE", "CONNECTOR", "STAR", "POLYGON"
- "x": horizontal position (number, pixels from left)
- "y": vertical position (number, pixels from top)
- "width": width in pixels
- "height": height in pixels
- "rotation": rotation in degrees (default 0)
- "content": text content for TEXT and STICKY_NOTE elements, empty string for shapes
- "color": background color as hex string (e.g. "#FFFFFF", "#1E293B", "#3B82F6", "transparent" for text)
- "name": descriptive name for the element (e.g. "Header Bar", "Hero Title", "Button")
- "zIndex": stacking order (higher = on top)
- "locked": false
- "visible": true
- "styles": an object with optional sub-properties:
  - "fills": array of { "id": "fill-1", "type": "solid", "color": "#hex", "opacity": 1 }
  - "typography": { "fontFamily": "Inter, system-ui, sans-serif", "fontSize": 16, "fontWeight": 400, "lineHeight": 1.5, "color": "#hex", "textAlign": "left" }
  - "cornerRadius": { "topLeft": 8, "topRight": 8, "bottomRight": 8, "bottomLeft": 8 }
  - "opacity": 1
  - "borderRadius": 8

Design principles to follow:
- Use proper visual hierarchy: large bold titles, medium subtitles, body text
- Add adequate spacing between elements (at least 16-24px gaps)
- Use consistent color schemes
- Include realistic UI elements like headers, navigation bars, cards, buttons, input fields
- Frame containers (FRAME type) should be used for major sections (e.g. a phone frame, card frame)
- RECTANGLEs are great for cards, buttons, input fields, and UI blocks
- TEXT elements for all text content
- CIRCLE or ELLIPSE for avatars, icons placeholders
- Use cornerRadius of 8-16px for modern rounded look
- Typical header height: 56-72px, button height: 40-48px
- Ensure elements don't overlap unless intentional (use zIndex)

Respond ONLY with the JSON object, no markdown, no explanation. Example format:
{ "elements": [ { "type": "FRAME", "x": 100, "y": 50, "width": 800, "height": 600, ... }, ... ] }`;

const STYLE_PROMPTS: Record<string, string> = {
  Modern: 'Use a modern design style with bold typography, vibrant accent colors, clean lines, and ample white space. Prefer rounded corners (12-16px), subtle shadows, and a card-based layout.',
  Minimalist: 'Use a minimalist design style with lots of white space, thin borders, monochrome palette with one accent color, small and elegant typography, and only essential elements.',
  Playful: 'Use a playful and fun design style with bright colors, rounded shapes (large border-radius 16-24px), larger text sizes, decorative elements, and an energetic feel.',
  Corporate: 'Use a professional corporate design style with navy/dark blue tones, structured grid layouts, formal typography (serif for headings), clean lines, and a trustworthy appearance.',
  'Dark Mode': 'Use a dark mode design with dark backgrounds (#0F172A, #1E293B), light text (#F8FAFC, #E2E8F0), subtle borders (#334155), and vibrant accent colors that pop against dark surfaces.',
};

const COLOR_SCHEMES: Record<string, { primary: string; secondary: string; accent: string; background: string; text: string; muted: string }> = {
  Blue: { primary: '#3B82F6', secondary: '#1E40AF', accent: '#60A5FA', background: '#FFFFFF', text: '#1E293B', muted: '#94A3B8' },
  Green: { primary: '#22C55E', secondary: '#15803D', accent: '#4ADE80', background: '#FFFFFF', text: '#1E293B', muted: '#94A3B8' },
  Purple: { primary: '#8B5CF6', secondary: '#6D28D9', accent: '#A78BFA', background: '#FFFFFF', text: '#1E293B', muted: '#94A3B8' },
  Orange: { primary: '#F97316', secondary: '#C2410C', accent: '#FB923C', background: '#FFFFFF', text: '#1E293B', muted: '#94A3B8' },
  Monochrome: { primary: '#1E293B', secondary: '#0F172A', accent: '#475569', background: '#FFFFFF', text: '#1E293B', muted: '#94A3B8' },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, boardId, agentId, style, colorScheme } = body as {
      prompt?: string;
      boardId?: string;
      agentId?: string;
      style?: string;
      colorScheme?: string;
    };

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'A prompt is required' }, { status: 400 });
    }

    // Determine system prompt
    let systemPrompt = DEFAULT_SYSTEM_PROMPT;
    let agentName = 'Default';

    if (agentId) {
      const agent = await db.aIAgent.findUnique({
        where: { id: agentId },
      });
      if (agent) {
        systemPrompt = agent.systemPrompt;
        agentName = agent.name;
      }
    }

    // Build style/color context
    let styleContext = '';
    if (style && STYLE_PROMPTS[style]) {
      styleContext += `\n\nStyle requirement: ${STYLE_PROMPTS[style]}`;
    }
    if (colorScheme && COLOR_SCHEMES[colorScheme]) {
      const cs = COLOR_SCHEMES[colorScheme];
      styleContext += `\n\nColor scheme (${colorScheme}):
- Primary color: ${cs.primary}
- Secondary color: ${cs.secondary}
- Accent color: ${cs.accent}
- Background: ${cs.background}
- Text color: ${cs.text}
- Muted text: ${cs.muted}
Use these colors throughout the design.`;
    }

    const fullSystemPrompt = systemPrompt + styleContext;

    // Call LLM
    const llm = createLLM({
      baseURL: process.env.ZAI_BASE_URL || '',
      apiKey: process.env.ZAI_API_KEY || '',
    });

    const response = await llm.chat.completions.create({
      model: 'default',
      messages: [
        { role: 'system', content: fullSystemPrompt },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const aiResponse = response.choices?.[0]?.message?.content?.trim() || '';

    // Parse the response, handling potential markdown code blocks
    let jsonStr = aiResponse;
    const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);

    // Extract elements array
    let rawElements: unknown[];
    if (Array.isArray(parsed)) {
      rawElements = parsed;
    } else if (parsed && Array.isArray(parsed.elements)) {
      rawElements = parsed.elements;
    } else {
      throw new Error('AI response must contain an "elements" array');
    }

    if (rawElements.length === 0) {
      throw new Error('No elements were generated');
    }

    // Validate and normalize elements to BoardElement type
    const validTypes = new Set([
      'RECTANGLE', 'CIRCLE', 'ELLIPSE', 'TEXT', 'LINE', 'IMAGE',
      'FRAME', 'PEN_PATH', 'STICKY_NOTE', 'CONNECTOR', 'STAR', 'POLYGON',
    ]);

    const elements: BoardElement[] = rawElements.map((el: Record<string, unknown>, index: number) => {
      const type = validTypes.has(String(el.type)) ? String(el.type) as BoardElement['type'] : 'RECTANGLE';

      const styles: ElementStyles = {};
      if (el.styles && typeof el.styles === 'object') {
        const s = el.styles as Record<string, unknown>;
        if (Array.isArray(s.fills)) styles.fills = s.fills as ElementStyles['fills'];
        if (Array.isArray(s.strokes)) styles.strokes = s.strokes as ElementStyles['strokes'];
        if (s.typography && typeof s.typography === 'object') styles.typography = s.typography as ElementStyles['typography'];
        if (s.cornerRadius && typeof s.cornerRadius === 'object') styles.cornerRadius = s.cornerRadius as ElementStyles['cornerRadius'];
        if (typeof s.opacity === 'number') styles.opacity = s.opacity;
        if (typeof s.borderRadius === 'number') styles.borderRadius = s.borderRadius;
        if (typeof s.fontSize === 'number') styles.fontSize = s.fontSize;
        if (typeof s.fontWeight === 'string') styles.fontWeight = s.fontWeight;
        if (typeof s.src === 'string') styles.src = s.src;
      }

      // Set default fills for shapes that don't have them
      if (!styles.fills || styles.fills.length === 0) {
        const color = typeof el.color === 'string' ? el.color : '#FFFFFF';
        if (type !== 'TEXT' && type !== 'LINE' && type !== 'CONNECTOR' && type !== 'PEN_PATH') {
          styles.fills = [{
            id: `fill-${Date.now()}-${index}`,
            type: 'solid' as const,
            color,
            opacity: 1,
          }];
        }
      }

      // Set default typography for text elements
      if ((type === 'TEXT' || type === 'STICKY_NOTE') && !styles.typography) {
        styles.typography = {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: type === 'TEXT' ? 16 : 14,
          fontWeight: 400,
          lineHeight: 1.5,
          letterSpacing: 0,
          textDecoration: 'none',
          color: '#1F2937',
          textAlign: 'left',
          fontStyle: 'normal',
          textCase: 'none',
        };
      }

      return {
        id: String(el.id) || `ai-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        x: Number(el.x) || 100 + (index % 3) * 260,
        y: Number(el.y) || 100 + Math.floor(index / 3) * 200,
        width: Number(el.width) || (type === 'FRAME' ? 800 : type === 'TEXT' ? 200 : 180),
        height: Number(el.height) || (type === 'FRAME' ? 600 : type === 'TEXT' ? 40 : 120),
        rotation: Number(el.rotation) || 0,
        content: typeof el.content === 'string' ? el.content : '',
        color: typeof el.color === 'string' ? el.color : '#FFFFFF',
        zIndex: Number(el.zIndex) || index,
        locked: false,
        visible: typeof el.visible === 'boolean' ? el.visible : true,
        name: typeof el.name === 'string' ? el.name : undefined,
        styles,
      } satisfies BoardElement;
    });

    // Increment agent usage count if agentId was provided
    if (agentId) {
      try {
        await db.aIAgent.update({
          where: { id: agentId },
          data: { usageCount: { increment: 1 } },
        });
      } catch {
        // Non-critical: don't fail the request if usage count update fails
      }
    }

    return NextResponse.json({ elements, agentName });
  } catch (error) {
    console.error('AI design generation error:', error);
    const message = error instanceof SyntaxError
      ? 'AI returned invalid JSON. Please try again with a more specific prompt.'
      : error instanceof Error
        ? error.message
        : 'Failed to generate design. Please try again.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}