import { NextRequest, NextResponse } from 'next/server';
import type { BoardElement } from '@/lib/types';
import { EXPORTABLE_FORMATS, getFormatByExtension } from '@/lib/design-formats';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ExportRequestBody {
  elements: BoardElement[];
  format: string;
  boardName: string;
}

type ExportStatus = 'idle' | 'exporting' | 'done' | 'error';

// ─── POST Handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequestBody = await request.json();
    const { elements, format, boardName } = body;

    if (!elements || !Array.isArray(elements)) {
      return NextResponse.json({ error: 'elements array is required' }, { status: 400 });
    }
    if (!format || typeof format !== 'string') {
      return NextResponse.json({ error: 'format string is required' }, { status: 400 });
    }

    const ext = format.startsWith('.') ? format.toLowerCase() : `.${format.toLowerCase()}`;
    const formatInfo = getFormatByExtension(ext);

    const fileName = (boardName || 'branchboard-design').replace(/[^a-zA-Z0-9_\-. ]/g, '_');

    // Generate the export content based on format
    const result = generateExport(elements, ext, fileName);

    if (!result) {
      return NextResponse.json(
        { error: `Export format "${ext}" is not supported` },
        { status: 400 },
      );
    }

    // Build response headers
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${fileName}${ext}"`);

    if (result.contentType) {
      headers.set('Content-Type', result.contentType);
    }

    return new NextResponse(result.content, { headers });
  } catch (error) {
    console.error('[Export API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Export failed' },
      { status: 500 },
    );
  }
}

// ─── Export Result ───────────────────────────────────────────────────────────

interface ExportResult {
  content: string | Uint8Array;
  contentType: string;
}

// ─── Main Export Dispatcher ──────────────────────────────────────────────────

function generateExport(elements: BoardElement[], ext: string, fileName: string): ExportResult | null {
  switch (ext) {
    // ── SVG ──
    case '.svg':
    case '.svgz':
      return { content: generateSVG(elements), contentType: 'image/svg+xml' };

    // ── Raster images (SVG-as-image approach) ──
    case '.png':
      return { content: generateSVG(elements, '#FFFFFF'), contentType: 'image/svg+xml' };
    case '.jpg':
    case '.jpeg':
      return { content: generateSVG(elements, '#FFFFFF'), contentType: 'image/svg+xml' };
    case '.webp':
      return { content: generateSVG(elements), contentType: 'image/svg+xml' };
    case '.gif':
      return { content: generateSVG(elements), contentType: 'image/svg+xml' };
    case '.bmp':
      return { content: generateSVG(elements, '#FFFFFF'), contentType: 'image/svg+xml' };
    case '.avif':
      return { content: generateSVG(elements), contentType: 'image/svg+xml' };
    case '.heic':
    case '.heif':
      return { content: generateSVG(elements), contentType: 'image/svg+xml' };
    case '.tiff':
    case '.tif':
      return { content: generateSVG(elements), contentType: 'image/svg+xml' };
    case '.eps':
      return { content: generateSVG(elements), contentType: 'image/svg+xml' };
    case '.pdf':
      return { content: generatePDF(elements), contentType: 'application/pdf' };

    // ── JSON formats ──
    case '.json':
      return { content: generateBranchBoardJSON(elements), contentType: 'application/json' };
    case '.fig':
    case '.figma':
      return { content: generateFigmaJSON(elements, fileName), contentType: 'application/json' };
    case '.sketch':
      return { content: generateSketchJSON(elements, fileName), contentType: 'application/json' };
    case '.excalidraw':
      return { content: generateExcalidrawJSON(elements), contentType: 'application/json' };
    case '.lottie':
      return { content: generateLottieJSON(elements), contentType: 'application/json' };

    // ── Diagramming ──
    case '.drawio':
    case '.dio':
      return { content: generateDrawIO(elements), contentType: 'application/xml' };
    case '.vsdx':
    case '.vsd':
      return { content: generateDrawIO(elements), contentType: 'application/xml' };
    case '.bmpr':
      return { content: generateBalsamiqXML(elements, fileName), contentType: 'application/xml' };

    // ── Code & Web ──
    case '.html':
    case '.htm':
      return { content: generateHTML(elements, fileName), contentType: 'text/html' };
    case '.css':
      return { content: generateCSS(elements), contentType: 'text/css' };
    case '.jsx':
      return { content: generateReactJSX(elements, fileName), contentType: 'text/javascript' };
    case '.tsx':
      return { content: generateReactTSX(elements, fileName), contentType: 'text/typescript' };
    case '.vue':
      return { content: generateVueSFC(elements, fileName), contentType: 'text/x-vue' };
    case '.svelte':
      return { content: generateSvelteComponent(elements, fileName), contentType: 'text/x-svelte' };

    // ── Presentation ──
    case '.pptx':
      return { content: generatePPTXHTML(elements, fileName), contentType: 'text/html' };
    case '.ppt':
      return { content: generatePPTXHTML(elements, fileName), contentType: 'text/html' };
    case '.key':
      return { content: generateSVG(elements), contentType: 'image/svg+xml' };
    case '.odp':
      return { content: generatePPTXHTML(elements, fileName), contentType: 'text/html' };

    // ── Data & Config ──
    case '.csv':
      return { content: generateCSV(elements), contentType: 'text/csv' };
    case '.yaml':
    case '.yml':
      return { content: generateYAML(elements), contentType: 'text/yaml' };
    case '.xml':
      return { content: generateXML(elements, fileName), contentType: 'application/xml' };
    case '.toml':
      return { content: generateTOML(elements), contentType: 'text/plain' };
    case '.md':
      return { content: generateMarkdown(elements, fileName), contentType: 'text/markdown' };
    case '.txt':
      return { content: generatePlainText(elements), contentType: 'text/plain' };
    case '.env':
      return { content: generateEnvFile(elements), contentType: 'text/plain' };

    // ── Professional design (approximation) ──
    case '.xd':
      return { content: generateFigmaJSON(elements, fileName), contentType: 'application/json' };
    case '.ai':
      return { content: generateSVG(elements), contentType: 'image/svg+xml' };
    case '.afdesign':
      return { content: generateFigmaJSON(elements, fileName), contentType: 'application/json' };
    case '.gvdesign':
      return { content: generateFigmaJSON(elements, fileName), contentType: 'application/json' };
    case '.framer':
      return { content: generateReactJSX(elements, fileName), contentType: 'text/javascript' };
    case '.penpot':
      return { content: generateSVG(elements), contentType: 'image/svg+xml' };
    case '.rp':
      return { content: generateHTML(elements, fileName), contentType: 'text/html' };
    case '.pie':
      return { content: generateFigmaJSON(elements, fileName), contentType: 'application/json' };
    case '.inv':
    case '.invd':
      return { content: generateFigmaJSON(elements, fileName), contentType: 'application/json' };
    case '.idml':
      return { content: generateHTML(elements, fileName), contentType: 'text/html' };
    case '.dart':
      return { content: generateDartCode(elements, fileName), contentType: 'application/dart' };
    case '.riv':
      return { content: generateLottieJSON(elements), contentType: 'application/json' };

    // ── Whiteboard / other ──
    case '.miro':
      return { content: generateExcalidrawJSON(elements), contentType: 'application/json' };
    case '.figjam':
      return { content: generateExcalidrawJSON(elements), contentType: 'application/json' };
    case '.whimsical':
      return { content: generateExcalidrawJSON(elements), contentType: 'application/json' };
    case '.lucid':
      return { content: generateDrawIO(elements), contentType: 'application/xml' };
    case '.gliffy':
      return { content: generateDrawIO(elements), contentType: 'application/xml' };
    case '.canva':
      return { content: generateSVG(elements), contentType: 'image/svg+xml' };
    case '.pencil':
      return { content: generateSVG(elements), contentType: 'image/svg+xml' };
    case '.graffle':
      return { content: generateDrawIO(elements), contentType: 'application/xml' };

    // ── Image-only (return SVG) ──
    case '.psd':
    case '.psb':
    case '.aep':
    case '.prproj':
    case '.afphoto':
    case '.afpub':
    case '.cdr':
    case '.ico':
    case '.icns':
    case '.wbmp':
    case '.jxr':
    case '.dds':
    case '.hdr':
    case '.tga':
    case '.rtb':
    case '.gslides':
    case '.pez':
    case '.jm':
    case '.mp':
    case '.docx':
    case '.doc':
    case '.pages':
    case '.numbers':
    case '.principle':
    case '.blend':
    case '.c4d':
      return { content: generateSVG(elements), contentType: 'image/svg+xml' };

    default:
      return null;
  }
}

// ─── Helper: compute bounding box ───────────────────────────────────────────

function getBBox(elements: BoardElement[]) {
  if (elements.length === 0) return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
  const xs = elements.map((e) => e.x);
  const ys = elements.map((e) => e.y);
  const xrs = elements.map((e) => e.x + e.width);
  const yrs = elements.map((e) => e.y + e.height);
  const minX = Math.min(...xs) - 20;
  const minY = Math.min(...ys) - 20;
  const maxX = Math.max(...xrs) + 20;
  const maxY = Math.max(...yrs) + 20;
  return { minX, minY, maxX, maxY };
}

function getFillColor(el: BoardElement): string {
  if (el.styles?.fills?.[0]?.type === 'solid' && el.styles.fills[0].color) {
    return el.styles.fills[0].color;
  }
  return el.color || 'transparent';
}

function getStroke(el: BoardElement): { color: string; width: number; style: string } | null {
  if (el.styles?.strokes?.[0]) {
    const s = el.styles.strokes[0];
    return { color: s.color, width: s.width, style: s.style };
  }
  if (el.styles?.borderColor) {
    return { color: el.styles.borderColor, width: el.styles.borderWidth || 1, style: el.styles.borderStyle || 'solid' };
  }
  return null;
}

function getCornerRadius(el: BoardElement): number {
  if (el.styles?.cornerRadius) {
    const cr = el.styles.cornerRadius;
    return cr.topLeft || 0;
  }
  return el.styles?.borderRadius || 0;
}

// ═════════════════════════════════════════════════════════════════════════════
// FORMAT GENERATORS
// ═════════════════════════════════════════════════════════════════════════════

// ─── 1. SVG ──────────────────────────────────────────────────────────────────

function generateSVG(elements: BoardElement[], bgOverride?: string): string {
  const bbox = getBBox(elements);
  const w = bbox.maxX - bbox.minX;
  const h = bbox.maxY - bbox.minY;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bbox.minX} ${bbox.minY} ${w} ${h}" width="${w}" height="${h}">\n`;

  // Background
  if (bgOverride) {
    svg += `  <rect x="${bbox.minX}" y="${bbox.minY}" width="${w}" height="${h}" fill="${bgOverride}" />\n`;
  }

  // Elements sorted by zIndex
  const sorted = [...elements].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));

  for (const el of sorted) {
    if (el.visible === false) continue;
    const fill = getFillColor(el);
    const stroke = getStroke(el);
    const strokeAttr = stroke ? ` stroke="${stroke.color}" stroke-width="${stroke.width}"${stroke.style === 'dashed' ? ' stroke-dasharray="6 3"' : stroke.style === 'dotted' ? ' stroke-dasharray="2 2"' : ''}` : '';
    const opacity = el.styles?.opacity ?? 1;
    const opacityAttr = opacity < 1 ? ` opacity="${opacity}"` : '';
    const transformAttr = el.rotation ? ` transform="rotate(${el.rotation} ${el.x + el.width / 2} ${el.y + el.height / 2})"` : '';

    switch (el.type) {
      case 'RECTANGLE':
      case 'STICKY_NOTE':
      case 'FRAME': {
        const rx = getCornerRadius(el);
        svg += `  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${rx}" fill="${fill}"${strokeAttr}${opacityAttr}${transformAttr} />\n`;
        break;
      }
      case 'CIRCLE': {
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        const r = Math.min(el.width, el.height) / 2;
        svg += `  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${strokeAttr}${opacityAttr}${transformAttr} />\n`;
        break;
      }
      case 'ELLIPSE': {
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        const rx = el.width / 2;
        const ry = el.height / 2;
        svg += `  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${strokeAttr}${opacityAttr}${transformAttr} />\n`;
        break;
      }
      case 'STAR': {
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        const outerR = Math.min(el.width, el.height) / 2;
        const innerR = el.styles?.innerRadius || outerR * 0.4;
        const points = el.styles?.pointCount || 5;
        let pathD = '';
        for (let i = 0; i < points * 2; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (Math.PI / points) * i - Math.PI / 2;
          const px = cx + r * Math.cos(angle);
          const py = cy + r * Math.sin(angle);
          pathD += (i === 0 ? 'M' : 'L') + ` ${px.toFixed(2)} ${py.toFixed(2)} `;
        }
        pathD += 'Z';
        svg += `  <path d="${pathD}" fill="${fill}"${strokeAttr}${opacityAttr}${transformAttr} />\n`;
        break;
      }
      case 'POLYGON': {
        const sides = el.styles?.pointCount || 6;
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        const r = Math.min(el.width, el.height) / 2;
        let pathD = '';
        for (let i = 0; i < sides; i++) {
          const angle = (2 * Math.PI / sides) * i - Math.PI / 2;
          const px = cx + r * Math.cos(angle);
          const py = cy + r * Math.sin(angle);
          pathD += (i === 0 ? 'M' : 'L') + ` ${px.toFixed(2)} ${py.toFixed(2)} `;
        }
        pathD += 'Z';
        svg += `  <path d="${pathD}" fill="${fill}"${strokeAttr}${opacityAttr}${transformAttr} />\n`;
        break;
      }
      case 'TEXT': {
        const typo = el.styles?.typography;
        const fontSize = typo?.fontSize || el.styles?.fontSize || 16;
        const fontFamily = typo?.fontFamily || 'sans-serif';
        const fontWeight = typo?.fontWeight || el.styles?.fontWeight || '400';
        const textColor = typo?.color || '#1F2937';
        const textAlign = typo?.textAlign || 'left';
        const fontStyle = typo?.fontStyle === 'italic' ? ' font-style="italic"' : '';
        const textDecoration = typo?.textDecoration !== 'none' ? ` text-decoration="${typo?.textDecoration}"` : '';
        let anchor = 'start';
        if (textAlign === 'center') anchor = 'middle';
        else if (textAlign === 'right') anchor = 'end';
        const textX = textAlign === 'center' ? el.x + el.width / 2 : textAlign === 'right' ? el.x + el.width : el.x;
        const textContent = (el.content || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        if (textContent) {
          svg += `  <text x="${textX}" y="${el.y + (fontSize * 0.35).toFixed(1)}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${textColor}" text-anchor="${anchor}"${fontStyle}${textDecoration}${opacityAttr}${transformAttr}>${textContent}</text>\n`;
        }
        break;
      }
      case 'LINE': {
        const lineStroke = stroke || { color: el.color || '#374151', width: 2, style: 'solid' };
        const dashAttr = lineStroke.style === 'dashed' ? ' stroke-dasharray="6 3"' : lineStroke.style === 'dotted' ? ' stroke-dasharray="2 2"' : '';
        svg += `  <line x1="${el.x}" y1="${el.y + el.height / 2}" x2="${el.x + el.width}" y2="${el.y + el.height / 2}" stroke="${lineStroke.color}" stroke-width="${lineStroke.width}"${dashAttr}${opacityAttr}${transformAttr} />\n`;
        break;
      }
      case 'CONNECTOR': {
        const connStroke = stroke || { color: el.color || '#374151', width: 2, style: 'solid' };
        const sx = el.sourceAnchor?.x ?? el.x;
        const sy = el.sourceAnchor?.y ?? (el.y + el.height / 2);
        const ex = el.targetAnchor?.x ?? (el.x + el.width);
        const ey = el.targetAnchor?.y ?? (el.y + el.height / 2);
        const connStyle = el.styles?.connectorStyle || 'curve';
        let pathD: string;
        if (connStyle === 'straight') {
          pathD = `M ${sx} ${sy} L ${ex} ${ey}`;
        } else {
          const midX = (sx + ex) / 2;
          pathD = `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ey}, ${ex} ${ey}`;
        }
        const dashAttr = connStroke.style === 'dashed' ? ' stroke-dasharray="6 3"' : connStroke.style === 'dotted' ? ' stroke-dasharray="2 2"' : '';
        const marker = el.styles?.arrowHead ? ' marker-end="url(#arrowhead)"' : '';
        svg += `  <path d="${pathD}" fill="none" stroke="${connStroke.color}" stroke-width="${connStroke.width}"${dashAttr}${marker}${opacityAttr}${transformAttr} />\n`;
        break;
      }
      case 'PEN_PATH': {
        const pathData = el.styles?.pathData;
        if (pathData) {
          svg += `  <path d="${pathData}" fill="none" stroke="${el.color || '#374151'}" stroke-width="2"${opacityAttr}${transformAttr} />\n`;
        }
        break;
      }
      case 'IMAGE': {
        const imgSrc = el.styles?.src;
        if (imgSrc) {
          svg += `  <image href="${imgSrc}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"${opacityAttr}${transformAttr} />\n`;
        } else {
          svg += `  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="#f0f0f0" stroke="#ccc"${opacityAttr}${transformAttr} />\n`;
          svg += `  <text x="${el.x + el.width / 2}" y="${el.y + el.height / 2}" text-anchor="middle" font-size="12" fill="#999">Image</text>\n`;
        }
        break;
      }
    }
  }

  // Arrowhead marker if any connector uses arrows
  const hasArrow = elements.some(
    (e) => e.type === 'CONNECTOR' && e.styles?.arrowHead,
  );
  if (hasArrow) {
    svg = svg.replace(
      '</svg>',
      `  <defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#374151" /></marker></defs>\n</svg>`,
    );
  }

  svg += '</svg>';
  return svg;
}

// ─── 2. PDF (basic hand-rolled) ─────────────────────────────────────────────

function generatePDF(elements: BoardElement[]): string {
  const bbox = getBBox(elements);
  const w = Math.ceil(bbox.maxX - bbox.minX);
  const h = Math.ceil(bbox.maxY - bbox.minY);

  // Generate a minimal valid PDF
  const svgContent = generateSVG(elements);
  const objects: string[] = [];
  let objNum = 1;

  // Object 1: Catalog
  objects.push(`${objNum} 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`);
  objNum++;

  // Object 2: Pages
  objects.push(`${objNum} 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`);
  objNum++;

  // Object 3: Page
  objects.push(`${objNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Contents 4 0 R /Resources << /XObject << /SVG 5 0 R >> >> >>\nendobj`);
  objNum++;

  // Object 4: Contents - draw the SVG as a placeholder
  const contentStream = `q ${w} 0 0 ${h} 0 0 cm /SVG Do Q`;
  objects.push(`${objNum} 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj`);
  objNum++;

  // Object 5: XObject (SVG reference)
  objects.push(`${objNum} 0 obj\n<< /Type /XObject /Subtype /Form /BBox [0 0 ${w} ${h}] /Length ${svgContent.length} >>\nstream\n${svgContent}\nendstream\nendobj`);
  objNum++;

  // Build the PDF
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj + '\n';
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objNum}\n`;
  pdf += '0000000000 65535 f \n';
  for (const off of offsets) {
    pdf += `${off.toString().padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objNum} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

// ─── 3. BranchBoard JSON ────────────────────────────────────────────────────

function generateBranchBoardJSON(elements: BoardElement[]): string {
  const data = {
    format: 'branchboard',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    elements,
  };
  return JSON.stringify(data, null, 2);
}

// ─── 4. Figma-compatible JSON ───────────────────────────────────────────────

function generateFigmaJSON(elements: BoardElement[], fileName: string): string {
  const bbox = getBBox(elements);
  const children = elements.map((el) => convertToFigmaNode(el)).filter(Boolean);

  const data = {
    id: '0:0',
    name: fileName,
    type: 'DOCUMENT',
    children: [
      {
        id: '0:1',
        name: 'Page 1',
        type: 'CANVAS',
        children: [
          {
            id: '0:2',
            name: 'Frame 1',
            type: 'FRAME',
            x: bbox.minX,
            y: bbox.minY,
            width: bbox.maxX - bbox.minX,
            height: bbox.maxY - bbox.minY,
            fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 1 }],
            children,
          },
        ],
      },
    ],
  };
  return JSON.stringify(data, null, 2);
}

function convertToFigmaNode(el: BoardElement): Record<string, unknown> | null {
  const base: Record<string, unknown> = {
    id: el.id,
    name: el.name || `${el.type}`,
    type: el.type === 'RECTANGLE' || el.type === 'FRAME' || el.type === 'STICKY_NOTE' ? 'RECTANGLE' :
          el.type === 'CIRCLE' ? 'ELLIPSE' :
          el.type === 'TEXT' ? 'TEXT' :
          el.type === 'LINE' || el.type === 'CONNECTOR' ? 'LINE' :
          el.type === 'IMAGE' ? 'RECTANGLE' : 'RECTANGLE',
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,
    rotation: el.rotation || 0,
    visible: el.visible !== false,
  };

  // Fills
  const fill = getFillColor(el);
  if (fill && fill !== 'transparent') {
    const rgb = hexToRGB(fill);
    base.fills = [{ type: 'SOLID', color: rgb, opacity: el.styles?.opacity ?? 1 }];
  }

  // Strokes
  const stroke = getStroke(el);
  if (stroke) {
    base.strokes = [{ type: 'SOLID', color: hexToRGB(stroke.color) }];
    base.strokeWeight = stroke.width;
  }

  // Corner radius
  const cr = getCornerRadius(el);
  if (cr > 0) base.cornerRadius = cr;

  // Text
  if (el.type === 'TEXT' && el.content) {
    const typo = el.styles?.typography;
    base.characters = el.content;
    base.style = {
      fontFamily: typo?.fontFamily || 'Inter',
      fontSize: typo?.fontSize || 16,
      fontWeight: typo?.fontWeight || 400,
      textAlignHorizontal: typo?.textAlign || 'LEFT',
      fills: [{ type: 'SOLID', color: hexToRGB(typo?.color || '#1F2937') }],
    };
  }

  // Constraints
  base.constraints = { vertical: 'TOP', horizontal: 'LEFT' };

  return base;
}

function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '');
  const num = parseInt(cleaned.length === 3
    ? cleaned.split('').map((c) => c + c).join('')
    : cleaned, 16);
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}

// ─── 5. Sketch-compatible JSON ──────────────────────────────────────────────

function generateSketchJSON(elements: BoardElement[], fileName: string): string {
  const bbox = getBBox(elements);
  const layers = elements.map((el) => ({
    _class: el.type === 'TEXT' ? 'text' : el.type === 'LINE' || el.type === 'CONNECTOR' ? 'shapePath' : 'rectangle',
    do_objectID: el.id,
    name: el.name || el.type,
    frame: { _class: 'rect', x: el.x, y: el.y, width: el.width, height: el.height },
    style: {
      _class: 'style',
      fills: getFillColor(el) !== 'transparent' ? [{ _class: 'fill', isEnabled: true, color: hexToSketchColor(getFillColor(el)),fillType: 'color' }] : [],
      borders: getStroke(el) ? [{ _class: 'border', isEnabled: true, color: hexToSketchColor(getStroke(el).color), position: 1, thickness: getStroke(el).width }] : [],
      opacity: el.styles?.opacity ?? 1,
    },
  }));

  const data = {
    _class: 'document',
    pages: [
      {
        _class: 'page',
        name: fileName,
        frames: [
          {
            _class: 'artboard',
            name: 'Artboard',
            frame: { _class: 'rect', x: bbox.minX, y: bbox.minY, width: bbox.maxX - bbox.minX, height: bbox.maxY - bbox.minY },
            layers,
          },
        ],
      },
    ],
  };
  return JSON.stringify(data, null, 2);
}

function hexToSketchColor(hex: string): { r: number; g: number; b: number; a: number } {
  const rgb = hexToRGB(hex);
  return { r: rgb.r, g: rgb.g, b: rgb.b, a: 1 };
}

// ─── 6. Draw.io XML ──────────────────────────────────────────────────────────

function generateDrawIO(elements: BoardElement[]): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<mxfile host="BranchBoard" modified="${new Date().toISOString()}" agent="BranchBoard Export" version="21.0.0" type="device">\n  <diagram id="export-diagram" name="Page-1">\n    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1200" math="0" shadow="0">\n      <root>\n        <mxCell id="0" />\n        <mxCell id="1" parent="0" />\n`;

  for (const el of elements) {
    if (el.visible === false) continue;
    const fill = getFillColor(el);
    const stroke = getStroke(el);

    switch (el.type) {
      case 'RECTANGLE':
      case 'STICKY_NOTE':
      case 'FRAME': {
        const style = `rounded=${getCornerRadius(el) > 0 ? 1 : 0};whiteSpace=wrap;html=1;fillColor=${fill === 'transparent' ? 'none' : fill};strokeColor=${stroke?.color || 'none'};strokeWidth=${stroke?.width || 0};`;
        xml += `        <mxCell id="${el.id}" value="${escapeXML(el.content || '')}" style="${style}" vertex="1" parent="1">\n          <mxGeometry x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" as="geometry" />\n        </mxCell>\n`;
        break;
      }
      case 'CIRCLE':
      case 'ELLIPSE': {
        const style = `ellipse;whiteSpace=wrap;html=1;fillColor=${fill === 'transparent' ? 'none' : fill};strokeColor=${stroke?.color || 'none'};`;
        xml += `        <mxCell id="${el.id}" value="${escapeXML(el.content || '')}" style="${style}" vertex="1" parent="1">\n          <mxGeometry x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" as="geometry" />\n        </mxCell>\n`;
        break;
      }
      case 'TEXT': {
        const typo = el.styles?.typography;
        const style = `text;html=1;strokeColor=none;fillColor=none;align=${(typo?.textAlign || 'left').replace('left', 'left').replace('center', 'center').replace('right', 'right')};verticalAlign=middle;whiteSpace=wrap;overflow=hidden;fontSize=${typo?.fontSize || 16};fontColor=${typo?.color || '#1F2937'};`;
        xml += `        <mxCell id="${el.id}" value="${escapeXML(el.content || '')}" style="${style}" vertex="1" parent="1">\n          <mxGeometry x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" as="geometry" />\n        </mxCell>\n`;
        break;
      }
      case 'LINE': {
        const style = `endArrow=classic;html=1;strokeColor=${stroke?.color || el.color};strokeWidth=${stroke?.width || 2};`;
        xml += `        <mxCell id="${el.id}" style="${style}" edge="1" parent="1" source="${el.sourceId || ''}" target="${el.targetId || ''}">\n          <mxGeometry relative="1" as="geometry">\n            <mxPoint x="${el.x}" y="${el.y + el.height / 2}" as="sourcePoint" />\n            <mxPoint x="${el.x + el.width}" y="${el.y + el.height / 2}" as="targetPoint" />\n          </mxGeometry>\n        </mxCell>\n`;
        break;
      }
      case 'CONNECTOR': {
        const style = `curved=1;endArrow=${el.styles?.arrowHead ? 'classic' : 'none'};html=1;strokeColor=${stroke?.color || el.color};strokeWidth=${stroke?.width || 2};`;
        xml += `        <mxCell id="${el.id}" style="${style}" edge="1" parent="1" source="${el.sourceId || ''}" target="${el.targetId || ''}">\n          <mxGeometry relative="1" as="geometry">\n            <mxPoint x="${el.sourceAnchor?.x ?? el.x}" y="${el.sourceAnchor?.y ?? el.y}" as="sourcePoint" />\n            <mxPoint x="${el.targetAnchor?.x ?? (el.x + el.width)}" y="${el.targetAnchor?.y ?? (el.y + el.height)}" as="targetPoint" />\n          </mxGeometry>\n        </mxCell>\n`;
        break;
      }
      default: {
        const style = `rounded=0;whiteSpace=wrap;html=1;fillColor=${fill === 'transparent' ? 'none' : fill};`;
        xml += `        <mxCell id="${el.id}" value="${escapeXML(el.content || el.type)}" style="${style}" vertex="1" parent="1">\n          <mxGeometry x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" as="geometry" />\n        </mxCell>\n`;
      }
    }
  }

  xml += `      </root>\n    </mxGraphModel>\n  </diagram>\n</mxfile>`;
  return xml;
}

// ─── 7. Excalidraw JSON ─────────────────────────────────────────────────────

function generateExcalidrawJSON(elements: BoardElement[]): string {
  const excalidrawElements = elements.map((el, index) => {
    const fill = getFillColor(el);
    const stroke = getStroke(el);
    const seed = Math.floor(Math.random() * 100000);

    switch (el.type) {
      case 'RECTANGLE':
      case 'STICKY_NOTE':
      case 'FRAME':
        return {
          id: el.id,
          type: 'rectangle',
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          angle: (el.rotation || 0) * (Math.PI / 180),
          strokeColor: stroke?.color || '#1e1e1e',
          backgroundColor: fill === 'transparent' ? 'transparent' : fill,
          fillStyle: 'solid',
          strokeWidth: stroke?.width || 2,
          roughness: 1,
          opacity: el.styles?.opacity ?? 100,
          angle: 0,
          groupIds: el.groupId ? [el.groupId] : [],
          roundness: { type: 3 },
          seed,
          version: 1,
          versionNonce: index,
          isDeleted: false,
          boundElements: null,
          updated: Date.now(),
          link: null,
          locked: el.locked,
          text: el.content || '',
          fontSize: 16,
          fontFamily: 1,
          textAlign: 'left',
          verticalAlign: 'top',
          containerId: null,
          originalText: el.content || '',
          autoResize: true,
          lineHeight: 1.25,
        };
      case 'CIRCLE':
      case 'ELLIPSE':
        return {
          id: el.id, type: 'ellipse', x: el.x, y: el.y, width: el.width, height: el.height,
          angle: 0, strokeColor: stroke?.color || '#1e1e1e', backgroundColor: fill === 'transparent' ? 'transparent' : fill,
          fillStyle: 'solid', strokeWidth: stroke?.width || 2, roughness: 1, opacity: el.styles?.opacity ?? 100,
          groupIds: el.groupId ? [el.groupId] : [], roundness: { type: 2 }, seed, version: 1,
          versionNonce: index, isDeleted: false, boundElements: null, updated: Date.now(),
          link: null, locked: el.locked,
        };
      case 'TEXT': {
        const typo = el.styles?.typography;
        return {
          id: el.id, type: 'text', x: el.x, y: el.y, width: el.width, height: el.height,
          angle: 0, strokeColor: 'transparent', backgroundColor: 'transparent',
          fillStyle: 'solid', strokeWidth: 1, roughness: 1, opacity: 100,
          groupIds: el.groupId ? [el.groupId] : [], roundness: null, seed, version: 1,
          versionNonce: index, isDeleted: false, boundElements: null, updated: Date.now(),
          link: null, locked: el.locked,
          text: el.content || '', fontSize: typo?.fontSize || 16, fontFamily: 1,
          textAlign: (typo?.textAlign || 'left') === 'center' ? 'center' : 'left',
          verticalAlign: 'top', containerId: null, originalText: el.content || '',
          autoResize: true, lineHeight: 1.25,
        };
      }
      case 'LINE':
      case 'CONNECTOR':
        return {
          id: el.id, type: 'arrow', x: el.x, y: el.y, width: el.width, height: el.height,
          angle: 0, strokeColor: stroke?.color || el.color || '#1e1e1e', backgroundColor: 'transparent',
          fillStyle: 'solid', strokeWidth: stroke?.width || 2, roughness: 1, opacity: 100,
          groupIds: el.groupId ? [el.groupId] : [], roundness: { type: 2 }, seed, version: 1,
          versionNonce: index, isDeleted: false, boundElements: null, updated: Date.now(),
          link: null, locked: el.locked,
          points: [[0, 0], [el.width, el.height]],
          lastCommittedPoint: null, startBinding: null, endBinding: null,
          startArrowhead: null, endArrowhead: el.styles?.arrowHead ? 'arrow' : null,
        };
      default:
        return {
          id: el.id, type: 'rectangle', x: el.x, y: el.y, width: el.width, height: el.height,
          angle: 0, strokeColor: '#1e1e1e', backgroundColor: fill === 'transparent' ? 'transparent' : fill,
          fillStyle: 'solid', strokeWidth: 2, roughness: 1, opacity: 100,
          groupIds: [], roundness: { type: 3 }, seed, version: 1,
          versionNonce: index, isDeleted: false, boundElements: null, updated: Date.now(),
          link: null, locked: el.locked,
        };
    }
  });

  const data = {
    type: 'excalidraw',
    version: 2,
    source: 'branchboard-export',
    elements: excalidrawElements,
    appState: {
      viewBackgroundColor: '#ffffff',
      gridSize: 20,
    },
    files: {},
  };

  return JSON.stringify(data, null, 2);
}

// ─── 8. HTML ────────────────────────────────────────────────────────────────

function generateHTML(elements: BoardElement[], boardName: string): string {
  const bbox = getBBox(elements);
  const w = bbox.maxX - bbox.minX;
  const h = bbox.maxY - bbox.minY;

  let bodyContent = '';
  const sorted = [...elements].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));

  for (const el of sorted) {
    if (el.visible === false) continue;
    const fill = getFillColor(el);
    const stroke = getStroke(el);
    const opacity = el.styles?.opacity ?? 1;
    const cr = getCornerRadius(el);

    const baseStyle = [
      `position: absolute`,
      `left: ${el.x}px`,
      `top: ${el.y}px`,
      `width: ${el.width}px`,
      `height: ${el.height}px`,
      el.rotation ? `transform: rotate(${el.rotation}deg)` : '',
      opacity < 1 ? `opacity: ${opacity}` : '',
    ].filter(Boolean).join('; ');

    const bgStyle = fill !== 'transparent' ? `background-color: ${fill};` : '';
    const borderStyle = stroke ? `border: ${stroke.width}px ${stroke.style} ${stroke.color};` : '';
    const radiusStyle = cr > 0 ? `border-radius: ${cr}px;` : '';

    switch (el.type) {
      case 'RECTANGLE':
      case 'STICKY_NOTE':
      case 'FRAME':
      case 'IMAGE':
        bodyContent += `    <div style="${baseStyle}; ${bgStyle} ${borderStyle} ${radiusStyle}">${el.type === 'IMAGE' && el.styles?.src ? `<img src="${el.styles.src}" style="width:100%;height:100%;object-fit:cover;" alt="Image" />` : escapeHTML(el.content || '')}</div>\n`;
        break;
      case 'CIRCLE':
        bodyContent += `    <div style="${baseStyle}; ${bgStyle} ${borderStyle} border-radius: 50%;"></div>\n`;
        break;
      case 'ELLIPSE':
        bodyContent += `    <div style="${baseStyle}; ${bgStyle} ${borderStyle} border-radius: 50%;"></div>\n`;
        break;
      case 'TEXT': {
        const typo = el.styles?.typography;
        const textStyle = [
          `font-family: ${typo?.fontFamily || 'sans-serif'}`,
          `font-size: ${typo?.fontSize || 16}px`,
          `font-weight: ${typo?.fontWeight || 400}`,
          `color: ${typo?.color || '#1F2937'}`,
          `text-align: ${typo?.textAlign || 'left'}`,
          typo?.fontStyle === 'italic' ? 'font-style: italic' : '',
          typo?.textDecoration !== 'none' ? `text-decoration: ${typo?.textDecoration}` : '',
          `display: flex`,
          `align-items: center`,
          `line-height: ${typo?.lineHeight || 1.5}`,
        ].filter(Boolean).join('; ');
        bodyContent += `    <div style="${baseStyle}; ${textStyle}">${escapeHTML(el.content || '')}</div>\n`;
        break;
      }
      case 'LINE':
      case 'CONNECTOR': {
        const lineColor = stroke?.color || el.color || '#374151';
        const lineWidth = stroke?.width || 2;
        if (el.type === 'LINE') {
          bodyContent += `    <div style="position:absolute; left:${el.x}px; top:${el.y + el.height / 2 - lineWidth / 2}px; width:${el.width}px; height:${lineWidth}px; background:${lineColor};"></div>\n`;
        } else {
          bodyContent += `    <svg style="position:absolute; left:${el.x}px; top:${el.y}px; width:${el.width}px; height:${el.height}px; overflow:visible;" viewBox="0 0 ${el.width} ${el.height}"><path d="M ${el.sourceAnchor?.x ? el.sourceAnchor.x - el.x : 0} ${el.sourceAnchor?.y ? el.sourceAnchor.y - el.y : el.height / 2} C ${el.width / 2} 0, ${el.width / 2} ${el.height}, ${el.targetAnchor?.x ? el.targetAnchor.x - el.x : el.width} ${el.targetAnchor?.y ? el.targetAnchor.y - el.y : el.height / 2}" fill="none" stroke="${lineColor}" stroke-width="${lineWidth}" /></svg>\n`;
        }
        break;
      }
      default:
        bodyContent += `    <div style="${baseStyle}; ${bgStyle} ${borderStyle} ${radiusStyle}"></div>\n`;
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(boardName)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #ffffff; }
    .canvas { position: relative; width: ${w}px; height: ${h}px; margin: 20px auto; overflow: hidden; }
  </style>
</head>
<body>
  <div class="canvas">
${bodyContent}  </div>
</body>
</html>`;
}

// ─── 9. CSS ─────────────────────────────────────────────────────────────────

function generateCSS(elements: BoardElement[]): string {
  let css = `/* BranchBoard Export - CSS Layout */\n/* Generated: ${new Date().toISOString()} */\n\n`;
  css += `.canvas {\n  position: relative;\n  width: 100%;\n  min-height: 800px;\n  background: #ffffff;\n}\n\n`;

  for (const el of elements) {
    if (el.visible === false) continue;
    const fill = getFillColor(el);
    const stroke = getStroke(el);
    const opacity = el.styles?.opacity ?? 1;
    const cr = getCornerRadius(el);

    const className = (el.name || el.id).replace(/[^a-zA-Z0-9_-]/g, '-');
    css += `.${className} {\n`;
    css += `  position: absolute;\n`;
    css += `  left: ${el.x}px;\n`;
    css += `  top: ${el.y}px;\n`;
    css += `  width: ${el.width}px;\n`;
    css += `  height: ${el.height}px;\n`;
    if (el.rotation) css += `  transform: rotate(${el.rotation}deg);\n`;
    if (opacity < 1) css += `  opacity: ${opacity};\n`;
    if (fill !== 'transparent') css += `  background-color: ${fill};\n`;
    if (stroke) css += `  border: ${stroke.width}px ${stroke.style} ${stroke.color};\n`;
    if (cr > 0) css += `  border-radius: ${cr}px;\n`;

    if (el.type === 'CIRCLE' || el.type === 'ELLIPSE') {
      css += `  border-radius: 50%;\n`;
    }

    if (el.type === 'TEXT') {
      const typo = el.styles?.typography;
      if (typo) {
        css += `  display: flex;\n  align-items: center;\n`;
        css += `  font-family: ${typo.fontFamily};\n`;
        css += `  font-size: ${typo.fontSize}px;\n`;
        css += `  font-weight: ${typo.fontWeight};\n`;
        css += `  color: ${typo.color};\n`;
        css += `  text-align: ${typo.textAlign};\n`;
        if (typo.fontStyle === 'italic') css += `  font-style: italic;\n`;
        if (typo.textDecoration !== 'none') css += `  text-decoration: ${typo.textDecoration};\n`;
      }
    }

    css += `  z-index: ${el.zIndex || 0};\n`;
    css += `}\n\n`;
  }

  return css;
}

// ─── 10. Markdown ────────────────────────────────────────────────────────────

function generateMarkdown(elements: BoardElement[], boardName: string): string {
  let md = `# ${boardName}\n\n`;
  md += `> Exported from BranchBoard on ${new Date().toLocaleDateString()}\n\n`;
  md += `## Elements (${elements.length})\n\n`;

  for (const el of elements) {
    if (el.visible === false) continue;
    md += `### ${el.name || el.type}\n\n`;
    md += `- **Type:** ${el.type}\n`;
    md += `- **Position:** (${el.x}, ${el.y})\n`;
    md += `- **Size:** ${el.width} × ${el.height}\n`;
    if (el.rotation) md += `- **Rotation:** ${el.rotation}°\n`;
    if (el.content) md += `- **Content:** ${el.content}\n`;
    const fill = getFillColor(el);
    if (fill !== 'transparent') md += `- **Fill:** \`${fill}\`\n`;
    const stroke = getStroke(el);
    if (stroke) md += `- **Stroke:** \`${stroke.color}\` (${stroke.width}px)\n`;
    md += '\n';
  }

  return md;
}

// ─── 11. CSV ─────────────────────────────────────────────────────────────────

function generateCSV(elements: BoardElement[]): string {
  const headers = ['id', 'name', 'type', 'x', 'y', 'width', 'height', 'rotation', 'content', 'fill', 'strokeColor', 'strokeWidth', 'zIndex', 'visible', 'locked'];
  const rows = elements.map((el) => [
    el.id,
    el.name || el.type,
    el.type,
    el.x,
    el.y,
    el.width,
    el.height,
    el.rotation || 0,
    el.content || '',
    getFillColor(el),
    getStroke(el)?.color || '',
    getStroke(el)?.width || 0,
    el.zIndex,
    el.visible !== false ? 'true' : 'false',
    el.locked ? 'true' : 'false',
  ]);

  const escapeCSV = (val: string | number | boolean) => {
    const s = String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  return [headers.join(','), ...rows.map((r) => r.map(escapeCSV).join(','))].join('\n');
}

// ─── 12. YAML ────────────────────────────────────────────────────────────────

function generateYAML(elements: BoardElement[]): string {
  let yaml = `# BranchBoard Export\n# Generated: ${new Date().toISOString()}\n\n`;
  yaml += `elements:\n`;

  for (const el of elements) {
    if (el.visible === false) continue;
    yaml += `  - id: "${el.id}"\n`;
    yaml += `    name: "${el.name || el.type}"\n`;
    yaml += `    type: ${el.type}\n`;
    yaml += `    x: ${el.x}\n`;
    yaml += `    y: ${el.y}\n`;
    yaml += `    width: ${el.width}\n`;
    yaml += `    height: ${el.height}\n`;
    if (el.rotation) yaml += `    rotation: ${el.rotation}\n`;
    if (el.content) yaml += `    content: "${el.content.replace(/"/g, '\\"')}"\n`;
    const fill = getFillColor(el);
    if (fill !== 'transparent') yaml += `    fill: "${fill}"\n`;
    const stroke = getStroke(el);
    if (stroke) yaml += `    stroke:\n      color: "${stroke.color}"\n      width: ${stroke.width}\n      style: ${stroke.style}\n`;
    yaml += `    zIndex: ${el.zIndex}\n`;
  }

  return yaml;
}

// ─── 13. XML ─────────────────────────────────────────────────────────────────

function generateXML(elements: BoardElement[], boardName: string): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<branchboard name="${escapeXML(boardName)}" version="1.0" exported="${new Date().toISOString()}">\n  <elements>\n`;

  for (const el of elements) {
    if (el.visible === false) continue;
    xml += `    <element id="${el.id}" type="${el.type}" name="${escapeXML(el.name || el.type)}">\n`;
    xml += `      <position x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" />\n`;
    if (el.rotation) xml += `      <rotation degrees="${el.rotation}" />\n`;
    if (el.content) xml += `      <content>${escapeXML(el.content)}</content>\n`;
    const fill = getFillColor(el);
    if (fill !== 'transparent') xml += `      <fill color="${fill}" />\n`;
    const stroke = getStroke(el);
    if (stroke) xml += `      <stroke color="${stroke.color}" width="${stroke.width}" style="${stroke.style}" />\n`;
    xml += `      <zIndex>${el.zIndex}</zIndex>\n`;
    xml += `    </element>\n`;
  }

  xml += `  </elements>\n</branchboard>`;
  return xml;
}

// ─── 14. Balsamiq BMML ──────────────────────────────────────────────────────

function generateBalsamiqXML(elements: BoardElement[], boardName: string): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<Mockup version="1.0" measuredW="800" measuredH="600" mockupW="800" mockupH="600">\n`;

  for (const el of elements) {
    if (el.visible === false) continue;
    const fill = getFillColor(el);
    const stroke = getStroke(el);

    let controlType = 'com.balsamiq.mockups::Rect';
    let props = `<cp>${fill === 'transparent' ? '#FFFFFF' : fill}</cp>`;

    switch (el.type) {
      case 'TEXT':
        controlType = 'com.balsamiq.mockups::Label';
        props = `<text>${escapeXML(el.content || '')}</text><fontSize>${el.styles?.typography?.fontSize || 16}</fontSize>`;
        break;
      case 'CIRCLE':
      case 'ELLIPSE':
        controlType = 'com.balsamiq.mockups::Ellipse';
        break;
      case 'STICKY_NOTE':
        controlType = 'com.balsamiq.mockups::StickyNote';
        props = `<text>${escapeXML(el.content || '')}</text>`;
        break;
      case 'IMAGE':
        controlType = 'com.balsamiq.mockups::Image';
        break;
      case 'BUTTON':
        controlType = 'com.balsamiq.mockups::Button';
        props = `<text>${escapeXML(el.content || 'Button')}</text>`;
        break;
      default:
        if (el.content) {
          controlType = 'com.balsamiq.mockups::Canvas';
          props = `<text>${escapeXML(el.content)}</text>`;
        }
    }

    xml += `  <control controlID="${el.id}" controlTypeID="${controlType}" x="${el.x}" y="${el.y}" w="${el.width}" h="${el.height}" measuredW="${el.width}" measuredH="${el.height}" zOrder="${el.zIndex || 0}">\n    ${props}\n  </control>\n`;
  }

  xml += `</Mockup>`;
  return xml;
}

// ─── 15. React JSX ───────────────────────────────────────────────────────────

function generateReactJSX(elements: BoardElement[], boardName: string): string {
  const pascalName = boardName.replace(/[^a-zA-Z0-9]/g, '').replace(/^[a-z]/, (c) => c.toUpperCase()) || 'BoardDesign';

  const jsxElements = elements.map((el) => {
    const fill = getFillColor(el);
    const stroke = getStroke(el);
    const opacity = el.styles?.opacity ?? 1;
    const cr = getCornerRadius(el);

    const baseProps = [
      `style={{ position: 'absolute', left: ${el.x}, top: ${el.y}, width: ${el.width}, height: ${el.height}${el.rotation ? `, transform: 'rotate(${el.rotation}deg)'` : ''}${opacity < 1 ? `, opacity: ${opacity}` : ''}${fill !== 'transparent' ? `, backgroundColor: '${fill}'` : ''}${stroke ? `, border: '${stroke.width}px ${stroke.style} ${stroke.color}'` : ''}${cr > 0 ? `, borderRadius: ${cr}` : ''}${el.type === 'CIRCLE' || el.type === 'ELLIPSE' ? `, borderRadius: '50%'` : ''} }}`,
    ].join(' ');

    switch (el.type) {
      case 'TEXT':
        return `      <div ${baseProps}>${el.content || ''}</div>`;
      default:
        return `      <div ${baseProps} />`;
    }
  });

  return `import React from 'react';

export default function ${pascalName}() {
  return (
    <div style={{ position: 'relative', width: 800, height: 600, background: '#ffffff' }}>
${jsxElements.join('\n')}
    </div>
  );
}
`;
}

// ─── 16. React TSX ───────────────────────────────────────────────────────────

function generateReactTSX(elements: BoardElement[], boardName: string): string {
  const pascalName = boardName.replace(/[^a-zA-Z0-9]/g, '').replace(/^[a-z]/, (c) => c.toUpperCase()) || 'BoardDesign';

  const jsxElements = elements.map((el) => {
    const fill = getFillColor(el);
    const stroke = getStroke(el);
    const opacity = el.styles?.opacity ?? 1;
    const cr = getCornerRadius(el);

    const isCircle = el.type === 'CIRCLE' || el.type === 'ELLIPSE';
    const styleObj: string[] = [
      `position: 'absolute'`,
      `left: ${el.x}`,
      `top: ${el.y}`,
      `width: ${el.width}`,
      `height: ${el.height}`,
      el.rotation ? `transform: 'rotate(${el.rotation}deg)'` : '',
      opacity < 1 ? `opacity: ${opacity}` : '',
      fill !== 'transparent' ? `backgroundColor: '${fill}'` : '',
      stroke ? `border: '${stroke.width}px ${stroke.style} ${stroke.color}'` : '',
      cr > 0 ? `borderRadius: ${cr}` : '',
      isCircle ? `borderRadius: '50%'` : '',
    ].filter(Boolean);

    return `      <div style={{ ${styleObj.join(', ')} }}>${el.type === 'TEXT' ? (el.content || '') : ''}</div>`;
  });

  return `import React from 'react';

interface ${pascalName}Props {
  className?: string;
}

const ${pascalName}: React.FC<${pascalName}Props> = ({ className }) => {
  return (
    <div className={className} style={{ position: 'relative', width: 800, height: 600, background: '#ffffff' }}>
${jsxElements.join('\n')}
    </div>
  );
};

export default ${pascalName};
`;
}

// ─── 17. Vue SFC ─────────────────────────────────────────────────────────────

function generateVueSFC(elements: BoardElement[], boardName: string): string {
  const pascalName = boardName.replace(/[^a-zA-Z0-9]/g, '').replace(/^[a-z]/, (c) => c.toUpperCase()) || 'BoardDesign';

  const templateElements = elements.map((el) => {
    const fill = getFillColor(el);
    const stroke = getStroke(el);
    const opacity = el.styles?.opacity ?? 1;
    const cr = getCornerRadius(el);
    const isCircle = el.type === 'CIRCLE' || el.type === 'ELLIPSE';

    const styleObj: string[] = [
      `position: absolute`,
      `left: ${el.x}px`,
      `top: ${el.y}px`,
      `width: ${el.width}px`,
      `height: ${el.height}px`,
      el.rotation ? `transform: rotate(${el.rotation}deg)` : '',
      opacity < 1 ? `opacity: ${opacity}` : '',
      fill !== 'transparent' ? `background-color: ${fill}` : '',
      stroke ? `border: ${stroke.width}px ${stroke.style} ${stroke.color}` : '',
      cr > 0 ? `border-radius: ${cr}px` : '',
      isCircle ? `border-radius: 50%` : '',
    ].filter(Boolean);

    return `      <div style="${styleObj.join('; ')}">${el.type === 'TEXT' ? (el.content || '') : ''}</div>`;
  });

  return `<template>
  <div class="${pascalName.toLowerCase()}" style="position: relative; width: 800px; height: 600px; background: #ffffff;">
${templateElements.join('\n')}
  </div>
</template>

<script setup lang="ts">
interface Props {
  class?: string;
}
defineProps<Props>();
</script>

<style scoped>
.${pascalName.toLowerCase()} {
  position: relative;
}
</style>
`;
}

// ─── 18. Svelte Component ────────────────────────────────────────────────────

function generateSvelteComponent(elements: BoardElement[], boardName: string): string {
  const pascalName = boardName.replace(/[^a-zA-Z0-9]/g, '').replace(/^[a-z]/, (c) => c.toUpperCase()) || 'BoardDesign';

  const templateElements = elements.map((el) => {
    const fill = getFillColor(el);
    const stroke = getStroke(el);
    const opacity = el.styles?.opacity ?? 1;
    const cr = getCornerRadius(el);
    const isCircle = el.type === 'CIRCLE' || el.type === 'ELLIPSE';

    const styleObj: string[] = [
      `position: absolute`,
      `left: {${el.x}}px`,
      `top: {${el.y}}px`,
      `width: {${el.width}}px`,
      `height: {${el.height}}px`,
      el.rotation ? `transform: rotate({${el.rotation}}deg)` : '',
      opacity < 1 ? `opacity: {${opacity}}` : '',
      fill !== 'transparent' ? `background-color: ${fill}` : '',
      stroke ? `border: ${stroke.width}px ${stroke.style} ${stroke.color}` : '',
      cr > 0 ? `border-radius: {${cr}}px` : '',
      isCircle ? `border-radius: 50%` : '',
    ].filter(Boolean);

    return `    <div style="${styleObj.join('; ')}">${el.type === 'TEXT' ? `{${JSON.stringify(el.content || '')}}` : ''}</div>`;
  });

  return `<script lang="ts">
  interface Props {
    class?: string;
  }
  export let className: string | undefined = undefined;
</script>

<div class="canvas" class:className>
${templateElements.join('\n')}
</div>

<style>
  .canvas {
    position: relative;
    width: 800px;
    height: 600px;
    background: #ffffff;
  }
</style>
`;
}

// ─── 19. Lottie JSON ─────────────────────────────────────────────────────────

function generateLottieJSON(elements: BoardElement[]): string {
  const bbox = getBBox(elements);
  const w = Math.ceil(bbox.maxX - bbox.minX);
  const h = Math.ceil(bbox.maxY - bbox.minY);

  const shapes = elements
    .filter((e) => e.visible !== false)
    .map((el, index) => {
      const fill = getFillColor(el);
      const stroke = getStroke(el);
      const rgb = fill !== 'transparent' ? hexToRGB(fill) : { r: 0.5, g: 0.5, b: 0.5 };
      const opacity = el.styles?.opacity ?? 1;

      let shape: Record<string, unknown>;
      if (el.type === 'CIRCLE' || el.type === 'ELLIPSE') {
        shape = {
          ty: 'el',
          p: { a: 0, k: [el.x + el.width / 2, el.y + el.height / 2] },
          s: { a: 0, k: [el.width, el.height] },
        };
      } else {
        shape = {
          ty: 'rc',
          p: { a: 0, k: [el.x, el.y] },
          s: { a: 0, k: [el.width, el.height] },
          r: { a: 0, k: getCornerRadius(el) },
        };
      }

      return {
        ty: 'gr',
        nm: el.name || `Shape ${index + 1}`,
        it: [
          shape,
          {
            ty: 'fl',
            c: { a: 0, k: [rgb.r * 255, rgb.g * 255, rgb.b * 255, 255] },
            o: { a: 0, k: opacity * 100 },
            r: 1,
            nm: 'Fill',
          },
          ...(stroke ? [{
            ty: 'st',
            c: { a: 0, k: (() => { const sc = hexToRGB(stroke.color); return [sc.r * 255, sc.g * 255, sc.b * 255, 255]; })() },
            o: { a: 0, k: 100 },
            w: { a: 0, k: stroke.width },
            lc: 2,
            lj: 2,
            nm: 'Stroke',
          }] : []),
          {
            ty: 'tr',
            p: { a: 0, k: [0, 0] },
            a: { a: 0, k: [0, 0] },
            s: { a: 0, k: [100, 100] },
            r: { a: 0, k: el.rotation || 0 },
            o: { a: 0, k: 100 },
          },
        ],
      };
    });

  const data = {
    v: '5.7.4',
    fr: 30,
    ip: 0,
    op: 60,
    w,
    h,
    nm: 'BranchBoard Export',
    ddd: 0,
    assets: [],
    layers: [{
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Board',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [w / 2, h / 2, 0] },
        a: { a: 0, k: [w / 2, h / 2, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes,
      ip: 0,
      op: 60,
      st: 0,
    }],
  };

  return JSON.stringify(data, null, 2);
}

// ─── 20. PPTX HTML (best approximation) ──────────────────────────────────────

function generatePPTXHTML(elements: BoardElement[], boardName: string): string {
  const svgContent = generateSVG(elements);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHTML(boardName)} - Presentation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #1a1a2e; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: -apple-system, sans-serif; color: #fff; }
    .slide { width: 960px; height: 540px; background: #fff; box-shadow: 0 8px 32px rgba(0,0,0,0.3); border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
    .slide svg { max-width: 100%; max-height: 100%; }
    .title { margin-bottom: 24px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.7; }
    .note { margin-top: 16px; font-size: 12px; opacity: 0.5; }
  </style>
</head>
<body>
  <p class="title">Slide 1 — ${escapeHTML(boardName)}</p>
  <div class="slide">
    ${svgContent}
  </div>
  <p class="note">Generated by BranchBoard — open in browser and use "Print to PDF" or screenshot for best results</p>
</body>
</html>`;
}

// ─── 21. TOML ────────────────────────────────────────────────────────────────

function generateTOML(elements: BoardElement[]): string {
  let toml = `# BranchBoard Export\n# Generated: ${new Date().toISOString()}\n\n`;
  toml += `[[elements]]\n`;

  for (const el of elements) {
    if (el.visible === false) continue;
    toml += `  id = "${el.id}"\n`;
    toml += `  name = "${el.name || el.type}"\n`;
    toml += `  type = "${el.type}"\n`;
    toml += `  x = ${el.x}\n`;
    toml += `  y = ${el.y}\n`;
    toml += `  width = ${el.width}\n`;
    toml += `  height = ${el.height}\n`;
    if (el.rotation) toml += `  rotation = ${el.rotation}\n`;
    if (el.content) toml += `  content = """${el.content}"""\n`;
    toml += `  z_index = ${el.zIndex}\n\n`;
    toml += `[[elements]]\n`;
  }

  return toml;
}

// ─── 22. Plain Text ─────────────────────────────────────────────────────────

function generatePlainText(elements: BoardElement[]): string {
  let text = `BranchBoard Export\n${'='.repeat(40)}\n`;
  text += `Elements: ${elements.length}\n`;
  text += `Exported: ${new Date().toISOString()}\n\n`;

  for (const el of elements) {
    text += `--- ${el.name || el.id} ---\n`;
    text += `  Type: ${el.type}\n`;
    text += `  Position: (${el.x}, ${el.y})\n`;
    text += `  Size: ${el.width} x ${el.height}\n`;
    if (el.content) text += `  Content: ${el.content}\n`;
    text += '\n';
  }

  return text;
}

// ─── 23. Env File ────────────────────────────────────────────────────────────

function generateEnvFile(elements: BoardElement[]): string {
  let env = `# BranchBoard Design Export\n# ${new Date().toISOString()}\n\n`;
  env += `DESIGN_NAME="branchboard-design"\n`;
  env += `ELEMENT_COUNT=${elements.length}\n\n`;

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    env += `# Element ${i + 1}: ${el.name || el.type}\n`;
    env += `ELEMENT_${i}_ID="${el.id}"\n`;
    env += `ELEMENT_${i}_TYPE="${el.type}"\n`;
    env += `ELEMENT_${i}_X=${el.x}\n`;
    env += `ELEMENT_${i}_Y=${el.y}\n`;
    env += `ELEMENT_${i}_WIDTH=${el.width}\n`;
    env += `ELEMENT_${i}_HEIGHT=${el.height}\n\n`;
  }

  return env;
}

// ─── 24. Dart / Flutter Code ─────────────────────────────────────────────────

function generateDartCode(elements: BoardElement[], boardName: string): string {
  const className = boardName.replace(/[^a-zA-Z0-9]/g, '').replace(/^[a-z]/, (c) => c.toUpperCase()) || 'BoardDesign';

  const widgetCode = elements.map((el) => {
    const fill = getFillColor(el);
    const stroke = getStroke(el);
    const isCircle = el.type === 'CIRCLE' || el.type === 'ELLIPSE';

    if (el.type === 'TEXT') {
      return `        Container(
          padding: const EdgeInsets.all(8),
          alignment: Alignment.centerLeft,
          child: Text('${(el.content || '').replace(/'/g, "\\'")}'),
        )`;
    }

    return `        Container(
          decoration: BoxDecoration(
            color: ${fill !== 'transparent' ? `const Color(0x${fill.replace('#', '')})` : 'Colors.transparent'},
            borderRadius: ${isCircle ? 'BorderRadius.circular(999)' : `BorderRadius.circular(${getCornerRadius(el)})`},
            ${stroke ? `border: Border.all(color: const Color(0x${stroke.color.replace('#', '')}), width: ${stroke.width})` : ''}
          ),
        )`;
  });

  return `import 'package:flutter/material.dart';

class ${className} extends StatelessWidget {
  const ${className}({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
${widgetCode.map((w) => `          Positioned(
            left: ${elements[widgetCode.indexOf(w)]?.x ?? 0},
            top: ${elements[widgetCode.indexOf(w)]?.y ?? 0},
            width: ${elements[widgetCode.indexOf(w)]?.width ?? 100},
            height: ${elements[widgetCode.indexOf(w)]?.height ?? 100},
            child: ${w.replace(/^        /, '')}
          )`).join(',\n')}
        ],
      ),
    );
  }
}
`;
}

// ─── Utility Functions ───────────────────────────────────────────────────────

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}