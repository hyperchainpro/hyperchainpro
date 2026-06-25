// ─── Generative Template System ─────────────────────────────────────────────
// Predefined generation prompts and parameters for common patterns

export type PatternCategory =
  | 'Backgrounds'
  | 'Borders'
  | 'Decorations'
  | 'Data Viz'
  | 'Icons'
  | 'Text Effects';

export type PatternType =
  | 'geometric'
  | 'organic'
  | 'data-viz'
  | 'typographic'
  | 'abstract'
  | 'noise'
  | 'fractal'
  | 'mosaic';

export type StylePreset =
  | 'Minimal'
  | 'Bold'
  | 'Playful'
  | 'Elegant'
  | 'Retro'
  | 'Futuristic';

export type LayoutType =
  | 'dashboard'
  | 'landing-hero'
  | 'card-grid'
  | 'timeline'
  | 'comparison'
  | 'pricing-table';

export interface GenerativeTemplate {
  id: string;
  name: string;
  description: string;
  category: PatternCategory;
  patternType: PatternType;
  style: StylePreset;
  defaultParams: {
    colors: string[];
    count: number;
    density: number; // 1-10
  };
  promptHint: string; // Extra context for the LLM
  icon: string; // Emoji icon
}

// ─── Template Definitions ──────────────────────────────────────────────────

export const GENERATIVE_TEMPLATES: GenerativeTemplate[] = [
  // ── Backgrounds ─────────────────────────────────────────────────────────
  {
    id: 'bg-dots-grid',
    name: 'Dot Grid',
    description: 'Uniform dot grid pattern for clean backgrounds',
    category: 'Backgrounds',
    patternType: 'geometric',
    style: 'Minimal',
    defaultParams: {
      colors: ['#94A3B8', '#CBD5E1'],
      count: 80,
      density: 7,
    },
    promptHint: 'Create a regular grid of small circles (dots) evenly spaced across the canvas. Use subtle, light colors. Dots should be small (3-5px radius) with consistent spacing.',
    icon: '⚫',
  },
  {
    id: 'bg-diagonal-lines',
    name: 'Diagonal Lines',
    description: 'Repeating diagonal line stripes',
    category: 'Backgrounds',
    patternType: 'geometric',
    style: 'Bold',
    defaultParams: {
      colors: ['#E2E8F0', '#F1F5F9'],
      count: 20,
      density: 5,
    },
    promptHint: 'Create parallel diagonal lines at 45 degrees across the canvas. Use thin strokes (1-2px) with subtle colors. Lines should be evenly spaced.',
    icon: '📐',
  },
  {
    id: 'bg-organic-blobs',
    name: 'Organic Blobs',
    description: 'Soft, flowing blob shapes for modern backgrounds',
    category: 'Backgrounds',
    patternType: 'organic',
    style: 'Playful',
    defaultParams: {
      colors: ['#FECDD3', '#BFDBFE', '#D9F99D'],
      count: 8,
      density: 3,
    },
    promptHint: 'Create soft, organic blob shapes using bezier curves. Blobs should overlap slightly with low opacity. Use pastel colors. Shapes should feel fluid and natural.',
    icon: '🫧',
  },
  {
    id: 'bg-noise-grain',
    name: 'Noise Grain',
    description: 'Film grain texture overlay',
    category: 'Backgrounds',
    patternType: 'noise',
    style: 'Retro',
    defaultParams: {
      colors: ['#1E293B', '#334155'],
      count: 200,
      density: 10,
    },
    promptHint: 'Create a noise/grain texture using many small scattered rectangles and circles of varying sizes (1-3px) and opacities. Random distribution. Subtle and organic feel.',
    icon: '📺',
  },
  {
    id: 'bg-honeycomb',
    name: 'Honeycomb',
    description: 'Hexagonal grid pattern',
    category: 'Backgrounds',
    patternType: 'geometric',
    style: 'Futuristic',
    defaultParams: {
      colors: ['#10B981', '#059669', '#047857'],
      count: 30,
      density: 5,
    },
    promptHint: 'Create a honeycomb pattern with hexagonal shapes. Hexagons should tessellate perfectly with thin strokes. Use green tones. Consistent size and spacing.',
    icon: '⬡',
  },
  {
    id: 'bg-waves',
    name: 'Flowing Waves',
    description: 'Smooth sine wave layers',
    category: 'Backgrounds',
    patternType: 'organic',
    style: 'Elegant',
    defaultParams: {
      colors: ['#A78BFA', '#F472B6', '#FB923C'],
      count: 6,
      density: 4,
    },
    promptHint: 'Create flowing wave lines using smooth curves. Multiple layers of waves at different amplitudes and frequencies. Use gradient-like color progression. Elegant and fluid.',
    icon: '🌊',
  },

  // ── Borders ──────────────────────────────────────────────────────────────
  {
    id: 'border-zigzag',
    name: 'Zigzag Border',
    description: 'Classic zigzag edge pattern',
    category: 'Borders',
    patternType: 'geometric',
    style: 'Retro',
    defaultParams: {
      colors: ['#F59E0B', '#D97706'],
      count: 15,
      density: 6,
    },
    promptHint: 'Create a zigzag pattern along the border of the canvas. Sharp triangular points with consistent spacing. Use warm amber/gold tones. Bold and visible.',
    icon: '⚡',
  },
  {
    id: 'border-scallop',
    name: 'Scallop Edge',
    description: 'Rounded scallop border decoration',
    category: 'Borders',
    patternType: 'organic',
    style: 'Elegant',
    defaultParams: {
      colors: ['#EC4899', '#DB2777'],
      count: 12,
      density: 5,
    },
    promptHint: 'Create scallop/wave border using semicircular arcs along the edges. Overlapping semicircles forming a decorative edge. Use pink/rose tones.',
    icon: '〰️',
  },
  {
    id: 'border-dashed-deco',
    name: 'Dashed Decorative',
    description: 'Decorative dashed line border with dots',
    category: 'Borders',
    patternType: 'geometric',
    style: 'Minimal',
    defaultParams: {
      colors: ['#6B7280', '#9CA3AF'],
      count: 10,
      density: 4,
    },
    promptHint: 'Create a decorative border frame with dashed lines and small circle decorations at corners. Clean and minimal. Use neutral gray tones.',
    icon: '✏️',
  },

  // ── Decorations ──────────────────────────────────────────────────────────
  {
    id: 'deco-confetti',
    name: 'Confetti Burst',
    description: 'Scattered confetti particles',
    category: 'Decorations',
    patternType: 'abstract',
    style: 'Playful',
    defaultParams: {
      colors: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'],
      count: 40,
      density: 8,
    },
    promptHint: 'Create scattered confetti shapes: small rotated rectangles, circles, and triangles in random positions. Various sizes (4-12px). Bright, festive colors with some rotation.',
    icon: '🎊',
  },
  {
    id: 'deco-starry-night',
    name: 'Starry Night',
    description: 'Stars and sparkles scattered pattern',
    category: 'Decorations',
    patternType: 'abstract',
    style: 'Elegant',
    defaultParams: {
      colors: ['#FCD34D', '#FDE68A', '#FEF3C7'],
      count: 25,
      density: 4,
    },
    promptHint: 'Create star/sparkle shapes scattered across the canvas. Mix of 4-pointed and 6-pointed stars. Various sizes. Golden/yellow tones with varying opacity. Some twinkling effect with size variation.',
    icon: '✨',
  },
  {
    id: 'deco-mandala',
    name: 'Mandala',
    description: 'Symmetrical mandala flower pattern',
    category: 'Decorations',
    patternType: 'fractal',
    style: 'Elegant',
    defaultParams: {
      colors: ['#7C3AED', '#A78BFA', '#C4B5FD'],
      count: 15,
      density: 5,
    },
    promptHint: 'Create a symmetrical mandala-like pattern centered on the canvas. Use concentric rings of petal shapes radiating outward. Purple tones. Precise radial symmetry.',
    icon: '🌸',
  },
  {
    id: 'deco-circuit-board',
    name: 'Circuit Board',
    description: 'Tech-inspired circuit trace pattern',
    category: 'Decorations',
    patternType: 'geometric',
    style: 'Futuristic',
    defaultParams: {
      colors: ['#10B981', '#059669', '#34D399'],
      count: 20,
      density: 6,
    },
    promptHint: 'Create circuit board traces: straight horizontal/vertical lines with right-angle turns. Add small circles at connection points and rectangles at nodes. Green tech aesthetic.',
    icon: '🔌',
  },
  {
    id: 'deco-spiral',
    name: 'Spiral Pattern',
    description: 'Hypnotic spiral design',
    category: 'Decorations',
    patternType: 'fractal',
    style: 'Abstract',
    defaultParams: {
      colors: ['#F43F5E', '#E11D48'],
      count: 10,
      density: 5,
    },
    promptHint: 'Create a spiral pattern emanating from the center. Use arcs and curves that gradually increase in radius. Red/rose tones. Smooth and hypnotic.',
    icon: '🌀',
  },

  // ── Data Viz ─────────────────────────────────────────────────────────────
  {
    id: 'dataviz-bar-chart',
    name: 'Bar Chart Pattern',
    description: 'Stylized bar chart decoration',
    category: 'Data Viz',
    patternType: 'data-viz',
    style: 'Bold',
    defaultParams: {
      colors: ['#F97316', '#FB923C', '#FDBA74'],
      count: 12,
      density: 5,
    },
    promptHint: 'Create a decorative bar chart pattern with vertical bars of varying heights. Bars should have rounded tops. Orange gradient tones. Add thin baseline.',
    icon: '📊',
  },
  {
    id: 'dataviz-pie-charts',
    name: 'Mini Pie Charts',
    description: 'Scattered small donut/pie charts',
    category: 'Data Viz',
    patternType: 'data-viz',
    style: 'Minimal',
    defaultParams: {
      colors: ['#10B981', '#F59E0B', '#EF4444', '#6366F1'],
      count: 8,
      density: 4,
    },
    promptHint: 'Create several small donut charts (ring charts) scattered across the canvas. Each with 3-4 segments in different colors. Various sizes. Clean and minimal.',
    icon: '🍩',
  },
  {
    id: 'dataviz-line-graph',
    name: 'Line Graph Waves',
    description: 'Decorative line graph curves',
    category: 'Data Viz',
    patternType: 'data-viz',
    style: 'Elegant',
    defaultParams: {
      colors: ['#14B8A6', '#2DD4BF', '#99F6E4'],
      count: 5,
      density: 3,
    },
    promptHint: 'Create smooth line graph curves with area fills underneath. Multiple lines showing different data trends. Teal/green tones with subtle gradients.',
    icon: '📈',
  },
  {
    id: 'dataviz-radar',
    name: 'Radar Chart',
    description: 'Spider/radar chart decoration',
    category: 'Data Viz',
    patternType: 'data-viz',
    style: 'Futuristic',
    defaultParams: {
      colors: ['#8B5CF6', '#A78BFA', '#C4B5FD'],
      count: 8,
      density: 5,
    },
    promptHint: 'Create a radar/spider chart with pentagonal or hexagonal grid. Data polygon filled with semi-transparent purple. Clean gridlines and labels at vertices.',
    icon: '🕸️',
  },

  // ── Icons ────────────────────────────────────────────────────────────────
  {
    id: 'icon-geometric-shapes',
    name: 'Geo Icons',
    description: 'Geometric shape icon set',
    category: 'Icons',
    patternType: 'geometric',
    style: 'Minimal',
    defaultParams: {
      colors: ['#1E293B', '#475569', '#64748B'],
      count: 10,
      density: 3,
    },
    promptHint: 'Create simple geometric icons: triangles, squares, circles, hexagons, diamonds. Each icon is a single outlined shape with consistent stroke width. Arranged in a grid-like pattern.',
    icon: '🔷',
  },
  {
    id: 'icon-arrows',
    name: 'Arrow Set',
    description: 'Various directional arrow icons',
    category: 'Icons',
    patternType: 'geometric',
    style: 'Bold',
    defaultParams: {
      colors: ['#DC2626', '#EA580C', '#CA8A04'],
      count: 8,
      density: 4,
    },
    promptHint: 'Create various arrow icons: left, right, up, down, diagonal, curved arrows. Bold strokes. Warm red/orange/yellow tones. Each arrow distinct and clear.',
    icon: '➡️',
  },

  // ── Text Effects ─────────────────────────────────────────────────────────
  {
    id: 'text-banner',
    name: 'Text Banner',
    description: 'Decorative ribbon/banner for text',
    category: 'Text Effects',
    patternType: 'typographic',
    style: 'Bold',
    defaultParams: {
      colors: ['#DC2626', '#B91C1C'],
      count: 4,
      density: 2,
    },
    promptHint: 'Create decorative banner/ribbon shapes that can hold text. Include folded ribbon ends. Red tones. Bold and prominent, suitable for headings.',
    icon: '🎀',
  },
  {
    id: 'text-speech-bubbles',
    name: 'Speech Bubbles',
    description: 'Various speech bubble shapes',
    category: 'Text Effects',
    patternType: 'typographic',
    style: 'Playful',
    defaultParams: {
      colors: ['#FFFFFF', '#F1F5F9', '#E2E8F0'],
      count: 6,
      density: 4,
    },
    promptHint: 'Create speech bubble shapes with tails/points. Various styles: rounded, cloud-like, angular. White/light fill with subtle border. Different sizes and tail positions.',
    icon: '💬',
  },
  {
    id: 'text-number-blocks',
    name: 'Number Blocks',
    description: 'Large decorative number tiles',
    category: 'Text Effects',
    patternType: 'typographic',
    style: 'Bold',
    defaultParams: {
      colors: ['#1E293B', '#334155', '#475569'],
      count: 5,
      density: 3,
    },
    promptHint: 'Create large number tiles/blocks (0-9) with thick typography inside rounded rectangles. Dark slate colors. Each number in its own card. Bold and impactful.',
    icon: '🔢',
  },
  {
    id: 'text-letter-scatter',
    name: 'Letter Scatter',
    description: 'Scattered typography letters',
    category: 'Text Effects',
    patternType: 'typographic',
    style: 'Abstract',
    defaultParams: {
      colors: ['#F43F5E', '#8B5CF6', '#0EA5E9'],
      count: 15,
      density: 6,
    },
    promptHint: 'Scatter individual letters across the canvas in various sizes, rotations, and colors. Mix of serif and sans-serif feel. Vibrant multi-color. Some letters larger as focal points.',
    icon: '🔤',
  },
];

// ─── Layout Templates ──────────────────────────────────────────────────────

export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  layoutType: LayoutType;
  columns: number;
  style: StylePreset;
  promptHint: string;
  icon: string;
}

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  {
    id: 'layout-dashboard',
    name: 'Dashboard',
    description: 'KPI cards + charts + sidebar layout',
    layoutType: 'dashboard',
    columns: 3,
    style: 'Minimal',
    promptHint: 'Create a dashboard layout with a narrow sidebar on the left (containing nav icons), a top stats row of 4 KPI metric cards, and a main content area with a large chart placeholder and a smaller data table below. Use a clean, professional style with rounded cards.',
    icon: '📊',
  },
  {
    id: 'layout-hero',
    name: 'Landing Hero',
    description: 'Hero section with CTA and features',
    layoutType: 'landing-hero',
    columns: 2,
    style: 'Bold',
    promptHint: 'Create a landing page hero section: large headline text on the left, subheading below, a CTA button, and a decorative illustration placeholder on the right. Below that, a row of 3 feature cards with icons and text.',
    icon: '🚀',
  },
  {
    id: 'layout-cards',
    name: 'Card Grid',
    description: 'Responsive card grid layout',
    layoutType: 'card-grid',
    columns: 3,
    style: 'Elegant',
    promptHint: 'Create a 3x2 grid of content cards. Each card has a small image placeholder at top, title text, description text, and a subtle footer with a link/button. Consistent spacing and alignment. Elegant and clean.',
    icon: '🃏',
  },
  {
    id: 'layout-timeline',
    name: 'Timeline',
    description: 'Vertical timeline with events',
    layoutType: 'timeline',
    columns: 1,
    style: 'Minimal',
    promptHint: 'Create a vertical timeline layout with 5-6 events. A central vertical line with alternating left/right event cards. Each card has a date, title, and description. Small circles on the timeline for each event.',
    icon: '📅',
  },
  {
    id: 'layout-comparison',
    name: 'Comparison',
    description: 'Side-by-side comparison layout',
    layoutType: 'comparison',
    columns: 2,
    style: 'Bold',
    promptHint: 'Create a comparison layout with two columns separated by a "VS" element in the center. Each column has a header, feature list with check/cross icons, and a CTA button at the bottom. One column highlighted as recommended.',
    icon: '⚖️',
  },
  {
    id: 'layout-pricing',
    name: 'Pricing Table',
    description: 'Pricing tier comparison table',
    layoutType: 'pricing-table',
    columns: 3,
    style: 'Elegant',
    promptHint: 'Create a pricing table with 3 tiers: Basic, Pro (highlighted/recommended), Enterprise. Each column has a tier name, price, feature list with checkmarks, and a CTA button. The Pro tier should be taller or have a badge.',
    icon: '💰',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────

export function getTemplatesByCategory(category: PatternCategory): GenerativeTemplate[] {
  return GENERATIVE_TEMPLATES.filter((t) => t.category === category);
}

export function getTemplateById(id: string): GenerativeTemplate | undefined {
  return GENERATIVE_TEMPLATES.find((t) => t.id === id);
}

export function getLayoutTemplateById(id: string): LayoutTemplate | undefined {
  return LAYOUT_TEMPLATES.find((t) => t.id === id);
}

export const PATTERN_CATEGORIES: PatternCategory[] = [
  'Backgrounds',
  'Borders',
  'Decorations',
  'Data Viz',
  'Icons',
  'Text Effects',
];

export const PATTERN_TYPES: { value: PatternType; label: string }[] = [
  { value: 'geometric', label: 'Geometric' },
  { value: 'organic', label: 'Organic' },
  { value: 'data-viz', label: 'Data Visualization' },
  { value: 'typographic', label: 'Typographic' },
  { value: 'abstract', label: 'Abstract' },
  { value: 'noise', label: 'Noise' },
  { value: 'fractal', label: 'Fractal' },
  { value: 'mosaic', label: 'Mosaic' },
];

export const STYLE_PRESETS: { value: StylePreset; label: string; desc: string }[] = [
  { value: 'Minimal', label: 'Minimal', desc: 'Clean, sparse, subtle' },
  { value: 'Bold', label: 'Bold', desc: 'Strong, vivid, prominent' },
  { value: 'Playful', label: 'Playful', desc: 'Fun, colorful, rounded' },
  { value: 'Elegant', label: 'Elegant', desc: 'Refined, graceful, sophisticated' },
  { value: 'Retro', label: 'Retro', desc: 'Nostalgic, vintage, warm' },
  { value: 'Futuristic', label: 'Futuristic', desc: 'Sleek, tech, modern' },
];

export const LAYOUT_TYPES: { value: LayoutType; label: string; desc: string }[] = [
  { value: 'dashboard', label: 'Dashboard', desc: 'KPIs and data panels' },
  { value: 'landing-hero', label: 'Landing Hero', desc: 'Hero section with CTA' },
  { value: 'card-grid', label: 'Card Grid', desc: 'Content card layout' },
  { value: 'timeline', label: 'Timeline', desc: 'Vertical event timeline' },
  { value: 'comparison', label: 'Comparison', desc: 'Side-by-side comparison' },
  { value: 'pricing-table', label: 'Pricing Table', desc: 'Tiered pricing layout' },
];