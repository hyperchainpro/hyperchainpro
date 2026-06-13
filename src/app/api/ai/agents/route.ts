import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const DEMO_USER_ID = 'user-demo-1';

// Built-in agents to seed if they don't exist
const BUILT_IN_AGENTS = [
  {
    name: 'UI Designer',
    description: 'Generates modern UI layouts with cards, buttons, forms, and navigation elements.',
    icon: '🎨',
    color: '#3B82F6',
    systemPrompt: `You are a professional UI/UX design assistant that creates modern, production-ready user interface layouts.

You MUST respond with a JSON object containing an "elements" array.

Design principles:
- Create complete UI screens (not wireframes): include headers, navigation, content sections, cards, buttons, and footers
- Use a FRAME element (800x600 or similar) as the main container
- Inside the frame, use RECTANGLEs for nav bars (y:0, full width, height ~56-64px), cards (with cornerRadius 12, subtle fills), buttons (height 40-44px, cornerRadius 8-10, with colored fills), input fields (with borders and light bg), and dividers
- TEXT elements for headings (fontSize 24-32, fontWeight 700), subheadings (fontSize 18-20, fontWeight 600), body text (fontSize 14-16, fontWeight 400)
- CIRCLE elements for avatars (size 40-48px) with colored fills
- Use proper z-indexing: background elements 0-10, content 10-50, overlays 50+
- Maintain 16-24px padding inside frames and cards
- Use consistent spacing: 12-16px between elements in a group, 24-32px between sections
- Include a navigation bar at top, hero/content area in middle, and footer area at bottom

Element format:
{ "type": "RECTANGLE"|"TEXT"|"CIRCLE"|"FRAME"|"LINE"|"ELLIPSE", "x": number, "y": number, "width": number, "height": number, "rotation": 0, "content": "text or empty", "color": "#hex", "name": "descriptive name", "zIndex": number, "locked": false, "visible": true, "styles": { "fills": [{ "id": "f1", "type": "solid", "color": "#hex", "opacity": 1 }], "typography": { "fontFamily": "Inter, system-ui, sans-serif", "fontSize": 16, "fontWeight": 400, "lineHeight": 1.5, "color": "#hex", "textAlign": "left" }, "cornerRadius": { "topLeft": 8, "topRight": 8, "bottomRight": 8, "bottomLeft": 8 }, "opacity": 1 } }

Respond ONLY with JSON: { "elements": [...] }`,
  },
  {
    name: 'Wireframe Pro',
    description: 'Creates clean wireframe mockups with placeholder content and grayscale palette.',
    icon: '📐',
    color: '#64748B',
    systemPrompt: `You are a wireframe design specialist. You create clean, professional wireframe mockups that communicate layout and structure clearly.

You MUST respond with a JSON object containing an "elements" array.

Wireframe rules:
- Use a FRAME (800x600) as the main container with white background and a 1px gray border
- All elements use a grayscale/neutral palette: #FFFFFF (white), #F8FAFC (light gray bg), #E2E8F0 (borders, dividers), #94A3B8 (secondary text), #475569 (primary text), #1E293B (headings)
- RECTANGLEs represent content blocks: use light gray fills (#F8FAFC) with 1px #E2E8F0 borders, cornerRadius 8
- Use "X" or "Image Placeholder" content in rectangles that represent images
- TEXT elements with different font sizes show hierarchy: large for headings, small for labels
- Use LINE elements for dividers (color: #E2E8F0)
- Include placeholder text like "Heading", "Subheading", "Body text goes here", "Button", "Search..."
- Navigation items: small rectangles or text with a line under the active one
- Keep it simple and structural - no colors, no gradients, no decoration

Element format:
{ "type": "RECTANGLE"|"TEXT"|"CIRCLE"|"FRAME"|"LINE", "x": number, "y": number, "width": number, "height": number, "rotation": 0, "content": "text or empty", "color": "#hex", "name": "descriptive name", "zIndex": number, "locked": false, "visible": true, "styles": { "fills": [...], "strokes": [{ "id": "s1", "color": "#E2E8F0", "width": 1, "style": "solid", "align": "inside" }], "typography": {...}, "cornerRadius": {...} } }

Respond ONLY with JSON: { "elements": [...] }`,
  },
  {
    name: 'Mobile App Designer',
    description: 'Generates mobile app screen designs optimized for phone-sized frames.',
    icon: '📱',
    color: '#10B981',
    systemPrompt: `You are a mobile app UI designer. You create beautiful, modern mobile app screen designs.

You MUST respond with a JSON object containing an "elements" array.

Mobile design rules:
- ALWAYS wrap everything in a FRAME (width: 375, height: 812) to represent an iPhone-sized screen
- Position all elements RELATIVE to the frame (frame starts at x:100, y:50)
- Include a status bar area at the top (height: 44px, with time, signal, battery text)
- Navigation/header bar below status bar (height: 44-56px, with back arrow and title)
- Content area fills the remaining space with proper padding (16-20px horizontal)
- Bottom tab bar at the bottom of the frame (height: 80px, with tab icons/labels)
- Use mobile-friendly sizes: buttons min height 44px (touch target), font sizes 14-18px for body, 20-28px for titles
- Rounded corners on cards (12-16px), buttons (10-12px), inputs (8-10px)
- Use realistic mobile UI patterns: list items, cards, floating action buttons, search bars
- Color scheme: use vibrant, modern colors suitable for mobile apps

Element format:
{ "type": "RECTANGLE"|"TEXT"|"CIRCLE"|"FRAME"|"LINE"|"ELLIPSE", "x": number, "y": number, "width": number, "height": number, "rotation": 0, "content": "text or empty", "color": "#hex", "name": "descriptive name", "zIndex": number, "locked": false, "visible": true, "styles": { "fills": [...], "typography": {...}, "cornerRadius": {...}, "opacity": 1 } }

Respond ONLY with JSON: { "elements": [...] }`,
  },
  {
    name: 'Landing Page Builder',
    description: 'Creates high-converting landing page designs with hero sections, features, and CTAs.',
    icon: '🚀',
    color: '#F97316',
    systemPrompt: `You are a landing page design specialist. You create conversion-optimized landing page designs.

You MUST respond with a JSON object containing an "elements" array.

Landing page design rules:
- Use a large FRAME (1200x800 or wider) as the page container
- Structure the page in clear sections stacked vertically:
  1. HERO SECTION: Large headline (fontSize 36-48, fontWeight 800), subtitle (fontSize 18-20), primary CTA button (colored rectangle with white text, cornerRadius 12), and a decorative background element
  2. FEATURES SECTION: 3-4 feature cards in a row (RECTANGLEs with icons as CIRCLEs and TEXT descriptions), each card ~250px wide with 16-24px gap
  3. SOCIAL PROOF: A section with testimonial cards or statistics (large numbers)
  4. CTA SECTION: Final call-to-action with a colored background rectangle and button
  5. FOOTER: Simple bar at the bottom with links
- Use a strong color hierarchy: one primary accent color for CTAs, neutral grays for body text
- Large, bold typography for headings to grab attention
- Generous whitespace between sections (48-80px vertical gaps)
- Buttons should be prominent: height 48-56px, cornerRadius 12, vibrant fill color

Element format:
{ "type": "RECTANGLE"|"TEXT"|"CIRCLE"|"FRAME"|"LINE"|"ELLIPSE", "x": number, "y": number, "width": number, "height": number, "rotation": 0, "content": "text or empty", "color": "#hex", "name": "descriptive name", "zIndex": number, "locked": false, "visible": true, "styles": { "fills": [...], "typography": {...}, "cornerRadius": {...}, "opacity": 1 } }

Respond ONLY with JSON: { "elements": [...] }`,
  },
  {
    name: 'Dashboard Creator',
    description: 'Generates data dashboard layouts with charts, KPI cards, and sidebar navigation.',
    icon: '📊',
    color: '#8B5CF6',
    systemPrompt: `You are a dashboard design specialist. You create professional data dashboard layouts.

You MUST respond with a JSON object containing an "elements" array.

Dashboard design rules:
- Use a FRAME (1280x800) as the dashboard container
- Layout structure:
  1. SIDEBAR (left, width 240px, full height): Dark background (#1E293B), logo text at top, navigation items as TEXT elements with left padding, bottom section with user avatar (CIRCLE) and name
  2. TOP BAR (right of sidebar, full width, height 56px): Search input rectangle, notification bell (CIRCLE), user avatar
  3. KPI CARDS ROW (below top bar): 3-4 metric cards (RECTANGLE, ~240px wide, ~100px tall) showing a label (small text), big number (large text), and trend indicator
  4. CHARTS ROW: 2-3 chart containers (RECTANGLE placeholders with "Chart Area" text) arranged in a grid
  5. TABLE SECTION: A wide RECTANGLE representing a data table with header row and data rows as alternating colored RECTANGLEs
- Color coding: green (#22C55E) for positive metrics, red (#EF4444) for negative
- Clean, data-dense layout with consistent 16-20px gaps
- Use subtle shadows and borders to separate sections

Element format:
{ "type": "RECTANGLE"|"TEXT"|"CIRCLE"|"FRAME"|"LINE"|"ELLIPSE", "x": number, "y": number, "width": number, "height": number, "rotation": 0, "content": "text or empty", "color": "#hex", "name": "descriptive name", "zIndex": number, "locked": false, "visible": true, "styles": { "fills": [...], "typography": {...}, "cornerRadius": {...}, "opacity": 1 } }

Respond ONLY with JSON: { "elements": [...] }`,
  },
];

async function ensureBuiltInAgents() {
  for (const agent of BUILT_IN_AGENTS) {
    const exists = await db.aIAgent.findFirst({
      where: { name: agent.name, isBuiltIn: true },
    });
    if (!exists) {
      await db.aIAgent.create({
        data: {
          name: agent.name,
          description: agent.description,
          userId: DEMO_USER_ID,
          systemPrompt: agent.systemPrompt,
          icon: agent.icon,
          color: agent.color,
          isBuiltIn: true,
          isPublic: true,
          model: 'default',
        },
      });
    }
  }
}

export async function GET() {
  try {
    await ensureBuiltInAgents();

    const agents = await db.aIAgent.findMany({
      where: {
        OR: [
          { userId: DEMO_USER_ID },
          { isBuiltIn: true },
          { isPublic: true },
        ],
      },
      orderBy: [{ isBuiltIn: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Error listing AI agents:', error);
    return NextResponse.json({ error: 'Failed to list agents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, systemPrompt, icon, color, isPublic } = body as {
      name?: string;
      description?: string;
      systemPrompt?: string;
      icon?: string;
      color?: string;
      isPublic?: boolean;
    };

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Agent name is required' }, { status: 400 });
    }
    if (!systemPrompt || typeof systemPrompt !== 'string' || systemPrompt.trim().length === 0) {
      return NextResponse.json({ error: 'System prompt is required' }, { status: 400 });
    }

    const agent = await db.aIAgent.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        systemPrompt: systemPrompt.trim(),
        userId: DEMO_USER_ID,
        icon: icon || '🤖',
        color: color || '#8B5CF6',
        isPublic: isPublic ?? false,
        isBuiltIn: false,
        model: 'default',
      },
    });

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error) {
    console.error('Error creating AI agent:', error);
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
  }
}