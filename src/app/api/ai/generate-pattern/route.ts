import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type = 'geometric',
      style = 'minimal',
      colors = ['#10b981', '#f59e0b', '#ec4899'],
      count = 8,
      canvasWidth = 800,
      canvasHeight = 600,
    } = body as {
      type?: string;
      style?: string;
      colors?: string[];
      count?: number;
      canvasWidth?: number;
      canvasHeight?: number;
    };

    // Generate SVG pattern procedurally (no LLM needed for pattern generation)
    const svg = generateSvgPattern(type, style, colors, count, canvasWidth, canvasHeight);

    // Also generate individual elements for canvas placement
    const elements = generateCanvasElements(type, colors, count, canvasWidth, canvasHeight);

    return NextResponse.json({ svg, elements });
  } catch (error) {
    console.error('Pattern generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate pattern' },
      { status: 500 }
    );
  }
}

// ─── Procedural SVG Pattern Generator ─────────────────────────────────────

function generateSvgPattern(
  type: string,
  _style: string,
  colors: string[],
  count: number,
  w: number,
  h: number
): string {
  const c1 = colors[0] || '#10b981';
  const c2 = colors[1] || '#f59e0b';
  const c3 = colors[2] || '#ec4899';
  const allColors = [c1, c2, c3];

  let shapes = '';

  switch (type) {
    case 'geometric':
      for (let i = 0; i < count; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const size = 20 + Math.random() * 80;
        const rot = Math.random() * 360;
        const color = allColors[i % allColors.length];
        const opacity = 0.3 + Math.random() * 0.5;
        const shape = i % 3;
        if (shape === 0) {
          shapes += `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="4" fill="${color}" opacity="${opacity}" transform="rotate(${rot} ${x + size / 2} ${y + size / 2})"/>`;
        } else if (shape === 1) {
          shapes += `<circle cx="${x}" cy="${y}" r="${size / 2}" fill="${color}" opacity="${opacity}"/>`;
        } else {
          const points = `${x},${y - size / 2} ${x + size / 2},${y + size / 2} ${x - size / 2},${y + size / 2}`;
          shapes += `<polygon points="${points}" fill="${color}" opacity="${opacity}"/>`;
        }
      }
      break;

    case 'organic':
      for (let i = 0; i < count; i++) {
        const cx = Math.random() * w;
        const cy = Math.random() * h;
        const r = 30 + Math.random() * 100;
        const color = allColors[i % allColors.length];
        const opacity = 0.15 + Math.random() * 0.25;
        const id = `blob${i}`;
        shapes += `<defs><filter id="${id}"><feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="3" seed="${i}"/><feDisplacementMap in="SourceGraphic" scale="20"/></filter></defs>`;
        shapes += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${opacity}" filter="url(#${id})"/>`;
      }
      break;

    case 'data-viz':
      const barCount = Math.min(count, 12);
      const barWidth = (w - 80) / barCount - 4;
      for (let i = 0; i < barCount; i++) {
        const barH = 40 + Math.random() * (h - 120);
        const x = 40 + i * (barWidth + 4);
        const y = h - 40 - barH;
        const color = allColors[i % allColors.length];
        shapes += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="4" fill="${color}" opacity="0.8"/>`;
        shapes += `<text x="${x + barWidth / 2}" y="${h - 20}" text-anchor="middle" font-size="10" fill="#94a3b8">D${i + 1}</text>`;
      }
      // Axis
      shapes += `<line x1="40" y1="${h - 40}" x2="${w - 20}" y2="${h - 40}" stroke="#334155" stroke-width="1"/>`;
      shapes += `<line x1="40" y1="20" x2="40" y2="${h - 40}" stroke="#334155" stroke-width="1"/>`;
      break;

    case 'abstract':
      for (let i = 0; i < count; i++) {
        const x1 = Math.random() * w;
        const y1 = Math.random() * h;
        const x2 = Math.random() * w;
        const y2 = Math.random() * h;
        const color = allColors[i % allColors.length];
        const opacity = 0.3 + Math.random() * 0.4;
        const sw = 2 + Math.random() * 6;
        shapes += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" opacity="${opacity}" stroke-linecap="round"/>`;
        shapes += `<circle cx="${x1}" cy="${y1}" r="${3 + Math.random() * 8}" fill="${color}" opacity="${opacity}"/>`;
        shapes += `<circle cx="${x2}" cy="${y2}" r="${3 + Math.random() * 8}" fill="${color}" opacity="${opacity}"/>`;
      }
      break;

    case 'mosaic':
      const cellSize = Math.max(30, Math.floor(Math.min(w, h) / (Math.sqrt(count) + 1)));
      const cols = Math.floor(w / cellSize);
      const rows = Math.floor(h / cellSize);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() > 0.3) continue;
          const color = allColors[Math.floor(Math.random() * allColors.length)];
          const opacity = 0.2 + Math.random() * 0.6;
          const gap = 2;
          shapes += `<rect x="${c * cellSize + gap}" y="${r * cellSize + gap}" width="${cellSize - gap * 2}" height="${cellSize - gap * 2}" rx="3" fill="${color}" opacity="${opacity}"/>`;
        }
      }
      break;

    default:
      for (let i = 0; i < count; i++) {
        const cx = Math.random() * w;
        const cy = Math.random() * h;
        const r = 10 + Math.random() * 40;
        const color = allColors[i % allColors.length];
        shapes += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="0.4"/>`;
      }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#0f172a"/>${shapes}</svg>`;
}

// ─── Generate individual canvas elements ─────────────────────────────────

interface GenElement {
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;
  rotation?: number;
  opacity?: number;
}

function generateCanvasElements(
  type: string,
  colors: string[],
  count: number,
  canvasW: number,
  canvasH: number
): GenElement[] {
  const elements: GenElement[] = [];
  const c1 = colors[0] || '#10b981';

  switch (type) {
    case 'geometric':
    case 'organic':
    case 'abstract':
      for (let i = 0; i < count; i++) {
        const size = 40 + Math.random() * 80;
        elements.push({
          type: 'rect',
          x: Math.random() * (canvasW - size),
          y: Math.random() * (canvasH - size),
          width: size,
          height: size,
          content: '',
          color: colors[i % colors.length],
          rotation: Math.floor(Math.random() * 360),
          opacity: 0.4 + Math.random() * 0.5,
        });
      }
      break;

    case 'data-viz':
      const barCount = Math.min(count, 12);
      const barW = 50;
      for (let i = 0; i < barCount; i++) {
        const barH = 60 + Math.random() * 200;
        elements.push({
          type: 'rect',
          x: 40 + i * (barW + 4),
          y: canvasH - 40 - barH,
          width: barW,
          height: barH,
          content: `D${i + 1}`,
          color: colors[i % colors.length],
          opacity: 0.8,
        });
      }
      break;

    case 'mosaic': {
      const cellSize = 60;
      const cols = Math.floor(canvasW / cellSize);
      const rows = Math.floor(canvasH / cellSize);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() > 0.5) continue;
          elements.push({
            type: 'rect',
            x: c * cellSize + 2,
            y: r * cellSize + 2,
            width: cellSize - 4,
            height: cellSize - 4,
            content: '',
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: 0.3 + Math.random() * 0.5,
          });
        }
      }
      break;
    }

    default:
      elements.push({
        type: 'rect',
        x: 0,
        y: 0,
        width: 200,
        height: 200,
        content: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="${c1}" rx="16"/></svg>`,
        color: c1,
        opacity: 1,
      });
  }

  return elements;
}