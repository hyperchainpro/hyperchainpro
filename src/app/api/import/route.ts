import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseSVG, parseFigmaJSON, parseImageData, parseJSONDesign } from '@/lib/import/parsers';
import type { BoardElement, ElementType, ElementStyles, Fill, Stroke } from '@/lib/types';
import { createDefaultElement } from '@/lib/types';

const DEMO_USER_ID = 'user-demo-1';
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

// ─── Supported Extensions ────────────────────────────────────────────────────

const SUPPORTED_EXTENSIONS = new Set([
  // Vector & SVG
  '.svg', '.svgz', '.eps', '.ps', '.ai',
  // Raster images
  '.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tiff', '.tif', '.ico', '.avif',
  '.heic', '.heif', '.tga', '.hdr', '.icns', '.wbmp', '.jxr', '.dds',
  // Document / layout
  '.pdf', '.html', '.htm',
  // Data / config / code
  '.json', '.yaml', '.yml', '.xml', '.csv', '.toml', '.env', '.txt', '.md', '.css',
  '.jsx', '.tsx', '.vue', '.svelte', '.dart',
  // Design tools — Figma
  '.fig', '.figma',
  // Design tools — Sketch
  '.sketch',
  // Design tools — Adobe
  '.xd', '.psd', '.psb', '.indd', '.idml', '.aep', '.prproj',
  // Design tools — Affinity
  '.afdesign', '.afphoto', '.afpub',
  // Design tools — Corel
  '.cdr',
  // Design tools — Generic/Visio
  '.gvdesign', '.framer', '.principle', '.pie', '.inv', '.invd', '.rp', '.jm', '.mp',
  '.penpot', '.drawio', '.dio', '.vsdx', '.vsd', '.graffle', '.bmpr', '.pencil',
  // Design tools — Excalidraw / whiteboard
  '.excalidraw', '.miro', '.rtb', '.figjam', '.whimsical', '.lucid', '.gliffy', '.canva',
  // Presentation / office
  '.pptx', '.ppt', '.key', '.gslides', '.odp', '.pez',
  // 3D / motion
  '.blend', '.c4d', '.riv', '.lottie',
  // Word processing / spreadsheets
  '.docx', '.doc', '.rtf', '.pages', '.numbers',
]);

// ─── Supported MIME Types ────────────────────────────────────────────────────

const SUPPORTED_MIME: Record<string, string> = {
  // Image MIME types
  'image/svg+xml': '.svg',
  'image/png': '.png',
  'image/jpeg': '.jpeg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/bmp': '.bmp',
  'image/tiff': '.tiff',
  'image/x-icon': '.ico',
  'image/avif': '.avif',
  'image/heic': '.heic',
  'image/heif': '.heif',
  'image/targa': '.tga',
  'image/vnd.ms-photo': '.jxr',
  'image/x-eps': '.eps',
  'application/pdf': '.pdf',
  'application/eps': '.eps',
  'application/postscript': '.eps',
  // JSON / data MIME types
  'application/json': '.json',
  'application/yaml': '.yaml',
  'text/yaml': '.yaml',
  'text/xml': '.xml',
  'application/xml': '.xml',
  'text/csv': '.csv',
  'text/html': '.html',
  'text/css': '.css',
  'text/plain': '.txt',
  'text/markdown': '.md',
  // Design tool MIME types
  'application/x-figma': '.fig',
  'application/octet-stream': '',  // will fall back to extension
  // Compressed / archive formats
  'application/zip': '.zip',
  'application/x-zip-compressed': '.zip',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'application/vnd.ms-visio.drawing': '.vsdx',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getExtension(fileName: string, mimeType: string): string {
  const dotIdx = fileName.lastIndexOf('.');
  if (dotIdx !== -1) {
    const ext = fileName.slice(dotIdx).toLowerCase();
    if (SUPPORTED_EXTENSIONS.has(ext)) return ext;
  }
  // Fallback to MIME type mapping
  const mimeExt = SUPPORTED_MIME[mimeType];
  if (mimeExt && SUPPORTED_EXTENSIONS.has(mimeExt)) return mimeExt;
  // application/octet-stream — try to guess from extension even if not in our set
  if (mimeType === 'application/octet-stream' && dotIdx !== -1) {
    const ext = fileName.slice(dotIdx).toLowerCase();
    // Accept any extension for octet-stream since browsers often send this
    return ext;
  }
  return '';
}

// ─── File Type Routing ───────────────────────────────────────────────────────

function getFileType(ext: string): string {
  const imageExts = new Set([
    '.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tiff', '.tif', '.ico',
    '.avif', '.heic', '.heif', '.tga', '.hdr', '.icns', '.wbmp', '.jxr', '.dds',
    '.psd', '.psb', '.ai', '.afphoto', '.cdr', '.key', '.gslides', '.rtb',
    '.blend', '.c4d', '.principle', '.jm', '.pez', '.ppt', '.doc', '.docx',
    '.rtf', '.pages', '.numbers', '.aep', '.prproj', '.indd', '.afpub', '.pdf',
  ]);

  const svgExts = new Set(['.svg', '.svgz', '.eps']);

  const jsonExts = new Set([
    '.json', '.yaml', '.yml', '.xml', '.csv', '.toml', '.env', '.css',
    '.jsx', '.tsx', '.vue', '.svelte', '.dart', '.md',
  ]);

  const drawioExts = new Set(['.drawio', '.dio']);

  const excalidrawExts = new Set(['.excalidraw']);

  const balsamiqExts = new Set(['.bmpr']);

  const htmlExts = new Set(['.html', '.htm']);

  const zipBasedExts = new Set([
    '.sketch', '.fig', '.figma', '.pptx', '.vsdx', '.graffle', '.idml', '.canva',
    '.figjam', '.inv', '.invd', '.odp', '.rp', '.mp', '.pie', '.framer', '.penpot',
    '.gvdesign', '.afdesign', '.pencil', '.lottie', '.whimsical', '.miro', '.lucid',
    '.gliffy', '.xd', '.vsd',
  ]);

  const textExts = new Set([
    '.txt', '.md', '.css', '.csv', '.yaml', '.yml', '.xml', '.toml', '.env',
    '.jsx', '.tsx', '.vue', '.svelte', '.dart',
  ]);

  if (imageExts.has(ext)) return 'image';
  if (svgExts.has(ext)) return 'svg';
  if (drawioExts.has(ext)) return 'drawio';
  if (excalidrawExts.has(ext)) return 'excalidraw';
  if (balsamiqExts.has(ext)) return 'balsamiq';
  if (htmlExts.has(ext)) return 'html';
  if (jsonExts.has(ext)) return 'json';
  if (zipBasedExts.has(ext)) return 'zip-based';
  if (textExts.has(ext)) return 'text';
  return 'unknown';
}

// ─── File Readers ────────────────────────────────────────────────────────────

async function readFileAsBuffer(file: File): Promise<Buffer> {
  const arrayBuf = await file.arrayBuffer();
  return Buffer.from(arrayBuf);
}

async function readFileAsText(file: File): Promise<string> {
  return file.text();
}

async function readFileAsBase64(file: File): Promise<string> {
  const buf = await readFileAsBuffer(file);
  const mimeType = file.type || 'application/octet-stream';
  return `data:${mimeType};base64,${buf.toString('base64')}`;
}

/** Decompress gzip data (for .svgz files). */
function decompressGzip(buffer: Buffer): Buffer {
  // Dynamic import of zlib (Node built-in) — only runs on server
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const zlib = require('zlib');
  return zlib.gunzipSync(buffer);
}

// ─── Draw.io Parser ──────────────────────────────────────────────────────────

/**
 * Parse a draw.io / diagrams.net XML file into BoardElement[].
 * Extracts mxCell nodes from the mxGraphModel and converts them to board elements.
 */
function parseDrawIO(xmlString: string): BoardElement[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');
  const model = doc.querySelector('mxGraphModel');
  if (!model) return [];

  const cells = Array.from(model.querySelectorAll('mxCell'));
  const elements: BoardElement[] = [];
  let zIdx = 0;

  // Build an id → geometry map from mxGeometry children
  const geometries: Record<string, { x: number; y: number; w: number; h: number; points?: string[] }> = {};
  const allCells = Array.from(model.querySelectorAll('mxCell'));

  for (const cell of allCells) {
    const id = cell.getAttribute('id') || '';
    const geo = cell.querySelector(':scope > mxGeometry');
    if (geo) {
      const x = parseFloat(geo.getAttribute('x') || '0');
      const y = parseFloat(geo.getAttribute('y') || '0');
      const w = parseFloat(geo.getAttribute('width') || '120');
      const h = parseFloat(geo.getAttribute('height') || '60');
      const as = geo.getAttribute('as') || '';
      const points: string[] = [];
      if (as === 'geometry') {
        for (const point of Array.from(geo.querySelectorAll('mxPoint'))) {
          points.push(`${point.getAttribute('x') || '0'},${point.getAttribute('y') || '0'}`);
        }
      }
      geometries[id] = { x, y, w: Math.max(w, 1), h: Math.max(h, 1), points };
    }
  }

  // Build a parent → children map for source/target resolution on edges
  const cellMap: Record<string, Element> = {};
  for (const cell of allCells) {
    const id = cell.getAttribute('id') || '';
    cellMap[id] = cell;
  }

  for (const cell of cells) {
    const id = cell.getAttribute('id') || '';
    // Skip the root cells (usually id=0, 1, 2)
    if (['0', '1', '2'].includes(id)) continue;

    const value = cell.getAttribute('value') || '';
    const style = cell.getAttribute('style') || '';
    const source = cell.getAttribute('source');
    const target = cell.getAttribute('target');

    // Determine if this is an edge (connector/line)
    if (source || target) {
      const srcGeo = geometries[source || ''];
      const tgtGeo = geometries[target || ''];
      const geo = geometries[id];

      const sx = srcGeo?.x ?? 0;
      const sy = srcGeo?.y ?? 0;
      const tx = tgtGeo?.x ?? (geo?.x + geo?.w ?? sx + 200);
      const ty = tgtGeo?.y ?? (geo?.y + geo?.h ?? sy + 100);

      const minX = Math.min(sx, tx);
      const minY = Math.min(sy, ty);
      const w = Math.max(Math.abs(tx - sx), 2);
      const h = Math.max(Math.abs(ty - sy), 2);

      const label = value.replace(/<[^>]*>/g, '').trim();

      elements.push(
        createDefaultElement(
          'CONNECTOR',
          minX,
          minY,
          w,
          h,
          {
            zIndex: zIdx++,
            name: label || undefined,
            content: label,
            sourceId: source || undefined,
            targetId: target || undefined,
            styles: {
              connectorStyle: style.includes('curved') ? 'curve' : 'straight',
              arrowHead: !style.includes('noArrow'),
              borderColor: style.match(/strokeColor=([^;]+)/)?.[1] || '#374151',
              borderWidth: parseFloat(style.match(/strokeWidth=([^;]+)/)?.[1] || '1'),
            },
          },
        ),
      );
      continue;
    }

    const geo = geometries[id];
    if (!geo) continue;

    // Determine element type from style
    const isEllipse = style.includes('ellipse') || style.includes('oval');
    const isRhombus = style.includes('rhombus');
    const isRounded = style.includes('rounded');
    const isText = !style || style === 'text';
    const hasImage = style.includes('image');

    const fillColor = style.match(/fillColor=([^;]+)/)?.[1] || '#FFFFFF';
    const strokeColor = style.match(/strokeColor=([^;]+)/)?.[1] || '#374151';
    const strokeWidth = parseFloat(style.match(/strokeWidth=([^;]+)/)?.[1] || '1');
    const fontSize = parseFloat(style.match(/fontSize=([^;]+)/)?.[1] || '12');
    const label = value.replace(/<[^>]*>/g, '').trim();

    const styles: ElementStyles = {
      fills: [{ id: `fill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type: 'solid', color: fillColor, opacity: 1 }],
      strokes: [{
        id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        color: strokeColor,
        width: strokeWidth,
        style: 'solid',
        align: 'center',
        cap: 'butt',
        join: 'miter',
      }],
    };

    let type: ElementType = 'RECTANGLE';
    let content = label;
    let color = fillColor;

    if (isText) {
      type = 'TEXT';
      content = label || 'Text';
      color = 'transparent';
      styles.typography = {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize,
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: 0,
        textDecoration: 'none',
        color: strokeColor,
        textAlign: 'center',
        fontStyle: 'normal',
        textCase: 'none',
      };
    } else if (isEllipse) {
      type = 'ELLIPSE';
    } else if (isRhombus) {
      type = 'POLYGON';
      styles.pointCount = 4;
    } else if (hasImage) {
      type = 'IMAGE';
    } else if (isRounded) {
      type = 'RECTANGLE';
      styles.cornerRadius = { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 };
    }

    elements.push(
      createDefaultElement(type, geo.x, geo.y, geo.w, geo.h, {
        zIndex: zIdx++,
        name: label || undefined,
        content,
        color,
        styles,
      }),
    );
  }

  return elements;
}

// ─── Excalidraw Parser ───────────────────────────────────────────────────────

/**
 * Parse an Excalidraw JSON file into BoardElement[].
 * Excalidraw files have a top-level `elements` array with shape definitions.
 */
function parseExcalidraw(jsonString: string): BoardElement[] {
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(jsonString);
  } catch {
    return [];
  }

  const rawElements = data.elements || data.EXCALIDRAW_DATA?.elements;
  if (!Array.isArray(rawElements)) return [];

  const elements: BoardElement[] = [];
  let zIdx = 0;

  for (const raw of rawElements) {
    const el = raw as Record<string, unknown>;
    if (!el || typeof el !== 'object') continue;
    if (el.isDeleted) continue;

    const typeStr = String(el.type || 'rectangle');
    const x = Number(el.x) || 0;
    const y = Number(el.y) || 0;
    const w = Math.abs(Number(el.width) || 100);
    const h = Math.abs(Number(el.height) || 100);
    const angle = Number(el.angle) || 0;
    const rotation = (angle * 180) / Math.PI;

    const bgColor = String(el.backgroundColor || '#FFFFFF');
    const strokeColor = String(el.strokeColor || '#374151');
    const opacity = Number(el.opacity ?? 1);
    const fillOpacity = Number(el.fillOpacity ?? 1);

    const styles: ElementStyles = {
      fills: [{ id: `fill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type: 'solid', color: bgColor, opacity: fillOpacity }],
      strokes: [{
        id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        color: strokeColor,
        width: Number(el.strokeWidth) || 2,
        style: el.strokeStyle === 'dashed' ? 'dashed' : el.strokeStyle === 'dotted' ? 'dotted' : 'solid',
        align: 'center',
        cap: 'round',
        join: 'round',
        opacity,
      }],
      opacity,
    };

    // Corner radius from excalidraw roundness
    if (el.roundness && typeof el.roundness === 'object') {
      const r = Number((el.roundness as Record<string, unknown>).type === 3
        ? Math.min(w, h) * 0.5
        : (el.roundness as Record<string, number>).value || 0) || 0;
      if (r > 0) {
        styles.cornerRadius = { topLeft: r, topRight: r, bottomRight: r, bottomLeft: r };
      }
    }

    let type: ElementType = 'RECTANGLE';
    let content = '';
    let color = bgColor;

    if (typeStr === 'rectangle' || typeStr === 'diamond') {
      type = typeStr === 'diamond' ? 'POLYGON' : 'RECTANGLE';
      if (typeStr === 'diamond') styles.pointCount = 4;
    } else if (typeStr === 'ellipse') {
      type = 'ELLIPSE';
    } else if (typeStr === 'line' || typeStr === 'arrow') {
      type = typeStr === 'arrow' ? 'CONNECTOR' : 'LINE';
      // Use boundCoords for proper positioning if available
      const pts = el.points as Array<[number, number]> | undefined;
      if (pts && pts.length >= 2) {
        styles.x2 = pts[pts.length - 1][0] - pts[0][0];
        styles.y2 = pts[pts.length - 1][1] - pts[0][1];
      }
      if (type === 'CONNECTOR') {
        styles.arrowHead = true;
        styles.connectorStyle = 'curve';
      }
      color = strokeColor;
    } else if (typeStr === 'text') {
      type = 'TEXT';
      content = String(el.text || el.originalText || '');
      color = 'transparent';
      const fontSize = Number(el.fontSize) || 16;
      styles.typography = {
        fontFamily: 'Virgil, Inter, system-ui, sans-serif',
        fontSize,
        fontWeight: Number(el.fontFamily === 3) ? 700 : 400,
        lineHeight: 1.25,
        letterSpacing: 0,
        textDecoration: 'none',
        color: strokeColor,
        textAlign: el.textAlign === 1 ? 'center' : el.textAlign === 2 ? 'right' : 'left',
        fontStyle: el.fontFamily === 2 ? 'italic' : 'normal',
        textCase: 'none',
      };
    } else if (typeStr === 'frame') {
      type = 'FRAME';
      const name = String(el.name || 'Frame');
      content = name;
    } else if (typeStr === 'image') {
      type = 'IMAGE';
      if (el.data) {
        styles.src = `data:image/png;base64,${String(el.data)}`;
      }
      color = 'transparent';
    } else if (typeStr === 'freedraw') {
      type = 'PEN_PATH';
      const pts = el.points as Array<[number, number]> | undefined;
      if (pts && pts.length > 1) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const [px, py] of pts) {
          minX = Math.min(minX, px);
          minY = Math.min(minY, py);
          maxX = Math.max(maxX, px);
          maxY = Math.max(maxY, py);
        }
        const relPts = pts.map(([px, py]) => `${(px - minX).toFixed(1)},${(py - minY).toFixed(1)}`);
        styles.pathData = `M${relPts[0]} ${relPts.slice(1).map(p => `L${p}`).join(' ')}`;
      }
      color = strokeColor;
    }

    elements.push(
      createDefaultElement(type, x, y, Math.max(w, 2), Math.max(h, 2), {
        zIndex: zIdx++,
        rotation,
        content,
        color,
        name: String(el.id || undefined),
        visible: true,
        styles,
      }),
    );
  }

  return elements;
}

// ─── Balsamiq (BMML) Parser ──────────────────────────────────────────────────

/**
 * Parse a Balsamiq wireframe (.bmpr / .bmml) XML file into BoardElement[].
 * Balsamiq uses a custom BMML XML format with <control> elements.
 */
function parseBalsamiq(xmlString: string): BoardElement[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');
  const controls = doc.querySelectorAll('control');
  if (controls.length === 0) return [];

  const elements: BoardElement[] = [];
  let zIdx = 0;

  for (const ctrl of Array.from(controls)) {
    const controlType = ctrl.getAttribute('controlTypeID') || ctrl.getAttribute('type') || '';
    const x = parseFloat(ctrl.getAttribute('x') || '0');
    const y = parseFloat(ctrl.getAttribute('y') || '0');
    const w = parseFloat(ctrl.getAttribute('w') || '120');
    const h = parseFloat(ctrl.getAttribute('h') || '60');
    const text = ctrl.getAttribute('text') || ctrl.textContent || '';
    const href = ctrl.getAttribute('href') || '';

    const styles: ElementStyles = {
      fills: [{ id: `fill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type: 'solid', color: '#FFFFFF', opacity: 1 }],
      strokes: [{
        id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        color: '#999999',
        width: 1,
        style: 'solid',
        align: 'center',
        cap: 'butt',
        join: 'miter',
      }],
    };

    let type: ElementType = 'RECTANGLE';
    let content = text;
    let color = '#FFFFFF';

    // Map Balsamiq control types to board element types
    if (controlType.includes('Button') || controlType.includes('ButtonBar')) {
      type = 'RECTANGLE';
      styles.cornerRadius = { topLeft: 4, topRight: 4, bottomRight: 4, bottomLeft: 4 };
      styles.fills = [{ id: `fill-${Date.now()}-1`, type: 'solid', color: '#E5E5E5', opacity: 1 }];
      color = '#E5E5E5';
    } else if (controlType.includes('TextInput') || controlType.includes('TextArea')) {
      type = 'RECTANGLE';
      color = '#FFFFFF';
    } else if (controlType.includes('Label') || controlType.includes('Paragraph')) {
      type = 'TEXT';
      color = 'transparent';
      const fontSize = controlType.includes('H1') ? 28 : controlType.includes('H2') ? 22 : controlType.includes('H3') ? 18 : 13;
      styles.typography = {
        fontFamily: 'Arial, sans-serif',
        fontSize,
        fontWeight: controlType.includes('H1') || controlType.includes('H2') || controlType.includes('H3') ? 700 : 400,
        lineHeight: 1.4,
        letterSpacing: 0,
        textDecoration: 'none',
        color: '#333333',
        textAlign: 'left',
        fontStyle: 'normal',
        textCase: 'none',
      };
    } else if (controlType.includes('Image') || controlType.includes('Icon')) {
      type = 'IMAGE';
      color = 'transparent';
    } else if (controlType.includes('Checkbox') || controlType.includes('RadioButton')) {
      type = 'RECTANGLE';
      content = text;
    } else if (controlType.includes('Canvas') || controlType.includes('BrowserWindow') || controlType.includes('iPhone') || controlType.includes('iPad')) {
      type = 'FRAME';
      content = controlType.includes('BrowserWindow') ? 'Browser Window' : controlType.includes('iPhone') ? 'iPhone' : controlType.includes('iPad') ? 'iPad' : 'Canvas';
      styles.frameClip = true;
    } else if (controlType.includes('Link')) {
      type = 'TEXT';
      color = 'transparent';
      styles.typography = {
        fontFamily: 'Arial, sans-serif',
        fontSize: 13,
        fontWeight: 400,
        lineHeight: 1.4,
        letterSpacing: 0,
        textDecoration: 'underline',
        color: '#0066CC',
        textAlign: 'left',
        fontStyle: 'normal',
        textCase: 'none',
      };
    } else if (controlType.includes('Line') || controlType.includes('Arrow')) {
      type = 'LINE';
      color = '#999999';
      styles.strokes = [{
        id: `stroke-${Date.now()}-1`,
        color: '#999999',
        width: 1,
        style: 'solid',
        align: 'center',
        cap: 'butt',
        join: 'miter',
      }];
      content = '';
    } else if (controlType.includes('ComboBox') || controlType.includes('List') || controlType.includes('Menu')) {
      type = 'RECTANGLE';
      styles.cornerRadius = { topLeft: 2, topRight: 2, bottomRight: 2, bottomLeft: 2 };
    } else if (controlType.includes('StickyNote')) {
      type = 'STICKY_NOTE';
      color = '#FEF3C7';
      styles.fills = [{ id: `fill-${Date.now()}-1`, type: 'solid', color: '#FEF3C7', opacity: 1 }];
    } else if (controlType.includes('PieChart') || controlType.includes('BarChart') || controlType.includes('LineChart')) {
      type = 'IMAGE';
      color = 'transparent';
    } else if (controlType.includes('Table') || controlType.includes('DataGrid')) {
      type = 'RECTANGLE';
      styles.cornerRadius = { topLeft: 2, topRight: 2, bottomRight: 2, bottomLeft: 2 };
    } else if (controlType.includes('Accordion') || controlType.includes('TabBar') || controlType.includes('VerticalTabBar')) {
      type = 'RECTANGLE';
    } else if (controlType.includes('Tree') || controlType.includes('Breadcrumb')) {
      type = 'TEXT';
      color = 'transparent';
      styles.typography = {
        fontFamily: 'Arial, sans-serif',
        fontSize: 13,
        fontWeight: 400,
        lineHeight: 1.6,
        letterSpacing: 0,
        textDecoration: 'none',
        color: '#333333',
        textAlign: 'left',
        fontStyle: 'normal',
        textCase: 'none',
      };
    }

    elements.push(
      createDefaultElement(type, x, y, Math.max(w, 10), Math.max(h, 10), {
        zIndex: zIdx++,
        content,
        color,
        name: text || controlType || undefined,
        styles,
      }),
    );
  }

  return elements;
}

// ─── HTML Parser ─────────────────────────────────────────────────────────────

/**
 * Parse an HTML file into BoardElement[] by extracting common layout elements.
 * Converts div, p, span, h1-h6, img, svg, a, button, input, and table elements.
 */
function parseHTML(htmlString: string): BoardElement[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const body = doc.body;
  if (!body) return [];

  const elements: BoardElement[] = [];
  let zIdx = 0;

  function processElement(el: Element, offsetX = 0, offsetY = 0): void {
    const tag = el.tagName.toLowerCase();

    // Skip non-visible / script / style elements
    if (['script', 'style', 'head', 'meta', 'link', 'noscript', 'template'].includes(tag)) return;

    // Recurse into container elements
    const containerTags = ['div', 'section', 'article', 'main', 'header', 'footer', 'nav', 'aside', 'ul', 'ol', 'li', 'form', 'fieldset'];
    if (containerTags.includes(tag)) {
      for (const child of Array.from(el.children)) {
        processElement(child, offsetX, offsetY + (zIdx * 4));
      }
      return;
    }

    // Extract computed styles from inline style
    const inlineStyle = el.getAttribute('style') || '';
    const bgMatch = inlineStyle.match(/background(?:-color)?\s*:\s*([^;]+)/);
    const bgColor = bgMatch ? bgMatch[1].trim() : '';
    const colorMatch = inlineStyle.match(/(?:^|;)\s*color\s*:\s*([^;]+)/);
    const textColor = colorMatch ? colorMatch[1].trim() : '#1F2937';
    const widthMatch = inlineStyle.match(/(?:^|;)\s*width\s*:\s*(\d+)/);
    const heightMatch = inlineStyle.match(/(?:^|;)\s*height\s*:\s*(\d+)/);
    const fontSizeMatch = inlineStyle.match(/(?:^|;)\s*font-size\s*:\s*(\d+)/);
    const paddingMatch = inlineStyle.match(/(?:^|;)\s*padding\s*:\s*(\d+)/);
    const marginMatch = inlineStyle.match(/(?:^|;)\s*margin\s*:\s*(\d+)/);

    const textContent = el.textContent?.trim() || '';
    const estimatedW = widthMatch ? parseInt(widthMatch[1]) : Math.max(textContent.length * 8, 100);
    const estimatedH = heightMatch ? parseInt(heightMatch[1]) : Math.max((parseInt(fontSizeMatch?.[1]) || 16) * 1.5, 24);
    const fontSize = parseInt(fontSizeMatch?.[1]) || 16;
    const padding = parseInt(paddingMatch?.[1]) || 0;
    const margin = parseInt(marginMatch?.[1]) || 0;
    const yPos = offsetY + margin;

    if (tag === 'img') {
      const src = el.getAttribute('src') || '';
      const alt = el.getAttribute('alt') || 'Image';
      elements.push(
        createDefaultElement('IMAGE', offsetX + margin, yPos, estimatedW, estimatedH, {
          zIndex: zIdx++,
          color: 'transparent',
          name: alt,
          styles: { src },
        }),
      );
    } else if (tag === 'svg') {
      // Parse embedded SVG
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(el);
      const svgElements = parseSVG(svgString);
      for (const svgEl of svgElements) {
        elements.push({
          ...svgEl,
          x: svgEl.x + offsetX + margin,
          y: svgEl.y + yPos,
          zIndex: zIdx++,
        });
      }
    } else if (['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'label'].includes(tag)) {
      const isHeading = /^h[1-6]$/.test(tag);
      const isLink = tag === 'a';
      const headingSize = tag === 'h1' ? 32 : tag === 'h2' ? 24 : tag === 'h3' ? 20 : tag === 'h4' ? 18 : tag === 'h5' ? 16 : 14;

      elements.push(
        createDefaultElement('TEXT', offsetX + margin + padding, yPos + padding, estimatedW, estimatedH, {
          zIndex: zIdx++,
          content: textContent,
          color: 'transparent',
          name: textContent.slice(0, 50) || undefined,
          styles: {
            typography: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: isHeading ? headingSize : fontSize,
              fontWeight: isHeading ? 700 : 400,
              lineHeight: 1.5,
              letterSpacing: 0,
              textDecoration: isLink ? 'underline' : 'none',
              color: textColor,
              textAlign: 'left',
              fontStyle: 'normal',
              textCase: 'none',
            },
          },
        }),
      );
    } else if (tag === 'button') {
      elements.push(
        createDefaultElement('RECTANGLE', offsetX + margin, yPos, estimatedW, estimatedH, {
          zIndex: zIdx++,
          content: textContent,
          color: bgColor || '#E5E7EB',
          name: textContent || 'Button',
          styles: {
            fills: [{ id: `fill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type: 'solid', color: bgColor || '#E5E7EB', opacity: 1 }],
            borderRadius: 6,
            typography: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 14,
              fontWeight: 500,
              lineHeight: 1.5,
              letterSpacing: 0,
              textDecoration: 'none',
              color: '#1F2937',
              textAlign: 'center',
              fontStyle: 'normal',
              textCase: 'none',
            },
          },
        }),
      );
    } else if (['input', 'textarea', 'select'].includes(tag)) {
      const placeholder = el.getAttribute('placeholder') || '';
      elements.push(
        createDefaultElement('RECTANGLE', offsetX + margin, yPos, estimatedW, estimatedH, {
          zIndex: zIdx++,
          content: placeholder,
          color: '#FFFFFF',
          name: el.getAttribute('name') || placeholder || 'Input',
          styles: {
            fills: [{ id: `fill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type: 'solid', color: '#FFFFFF', opacity: 1 }],
            strokes: [{ id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, color: '#D1D5DB', width: 1, style: 'solid', align: 'center', cap: 'butt', join: 'miter' }],
            borderRadius: 4,
          },
        }),
      );
    } else if (tag === 'table') {
      elements.push(
        createDefaultElement('FRAME', offsetX + margin, yPos, estimatedW, estimatedH, {
          zIndex: zIdx++,
          content: 'Table',
          color: '#FFFFFF',
          name: 'Table',
          styles: {
            fills: [{ id: `fill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type: 'solid', color: '#FFFFFF', opacity: 1 }],
            strokes: [{ id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, color: '#E5E7EB', width: 1, style: 'solid', align: 'center', cap: 'butt', join: 'miter' }],
            borderRadius: 4,
            frameClip: true,
          },
        }),
      );
    } else if (tag === 'hr') {
      elements.push(
        createDefaultElement('LINE', offsetX + margin, yPos, estimatedW, 2, {
          zIndex: zIdx++,
          color: '#E5E7EB',
          styles: {
            borderColor: '#E5E7EB',
            borderWidth: 1,
          },
        }),
      );
    } else if (tag === 'canvas' || tag === 'video' || tag === 'iframe') {
      elements.push(
        createDefaultElement('RECTANGLE', offsetX + margin, yPos, estimatedW, estimatedH, {
          zIndex: zIdx++,
          content: `${tag.toUpperCase()} element`,
          color: '#F3F4F6',
          name: tag,
          styles: {
            fills: [{ id: `fill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type: 'solid', color: '#F3F4F6', opacity: 1 }],
            borderRadius: 4,
          },
        }),
      );
    }

    // Recurse into children for unhandled elements
    if (!['img', 'svg', 'br', 'hr', 'input'].includes(tag)) {
      for (const child of Array.from(el.children)) {
        processElement(child, offsetX, yPos + estimatedH + 4);
      }
    }
  }

  for (const child of Array.from(body.children)) {
    processElement(child);
  }

  return elements;
}

// ─── EPS / PostScript Parser ─────────────────────────────────────────────────

/**
 * Attempt to extract paths and text from an EPS/PostScript file.
 * This is a best-effort parser that looks for path definitions and text commands.
 */
function parseEPS(psString: string): BoardElement[] {
  const elements: BoardElement[] = [];
  let zIdx = 0;

  // Extract text from PostScript show/showpage commands
  const textRegex = /\(([^)]+)\)\s*(?:show|Tj|TJ)/g;
  let match: RegExpExecArray | null;

  while ((match = textRegex.exec(psString)) !== null) {
    const text = match[1].trim();
    if (text) {
      elements.push(
        createDefaultElement('TEXT', 100 + (zIdx * 10), 100 + (zIdx * 30), 200, 24, {
          zIndex: zIdx++,
          content: text,
          color: 'transparent',
          name: text.slice(0, 30),
          styles: {
            typography: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 16,
              fontWeight: 400,
              lineHeight: 1.5,
              letterSpacing: 0,
              textDecoration: 'none',
              color: '#000000',
              textAlign: 'left',
              fontStyle: 'normal',
              textCase: 'none',
            },
          },
        }),
      );
    }
  }

  // Extract BoundingBox
  const bbMatch = psString.match(/%%BoundingBox:\s*([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)/);
  if (bbMatch) {
    const bx = parseFloat(bbMatch[1]);
    const by = parseFloat(bbMatch[2]);
    const bw = parseFloat(bbMatch[3]) - bx;
    const bh = parseFloat(bbMatch[4]) - by;
    // Create a frame representing the bounding box
    elements.unshift(
      createDefaultElement('FRAME', bx, by, Math.max(bw, 100), Math.max(bh, 100), {
        zIndex: 0,
        content: 'EPS Artwork',
        color: '#FFFFFF',
        name: 'EPS Artwork',
        styles: {
          fills: [{ id: `fill-${Date.now()}-1`, type: 'solid', color: '#FFFFFF', opacity: 1 }],
          frameClip: true,
        },
      }),
    );
  }

  // Extract moveto/lineto path data for basic paths
  const pathSegments: string[] = [];
  const pathRegex = /(\d+\.?\d*)\s+(\d+\.?\d*)\s+(?:moveto|lineto|curveto|lineto|closepath)/g;
  while ((match = pathRegex.exec(psString)) !== null) {
    const cmd = psString.slice(match.index + match[0].length - 6).trim();
    const cmdName = cmd.match(/(moveto|lineto|curveto|closepath)/)?.[1];
    if (cmdName === 'moveto') {
      pathSegments.push(`M${match[1]},${match[2]}`);
    } else if (cmdName === 'lineto') {
      pathSegments.push(`L${match[1]},${match[2]}`);
    }
  }
  if (pathSegments.length >= 2) {
    elements.push(
      createDefaultElement('PEN_PATH', 100, 100, 400, 300, {
        zIndex: zIdx++,
        content: '',
        color: '#000000',
        name: 'EPS Path',
        styles: {
          pathData: pathSegments.join(' '),
          strokes: [{ id: `stroke-${Date.now()}-1`, color: '#000000', width: 1, style: 'solid', align: 'center', cap: 'round', join: 'round' }],
        },
      }),
    );
  }

  // If no elements were extracted, create a placeholder
  if (elements.length === 0) {
    const bb = bbMatch
      ? { x: parseFloat(bbMatch[1]), y: parseFloat(bbMatch[2]), w: parseFloat(bbMatch[3]) - parseFloat(bbMatch[1]), h: parseFloat(bbMatch[4]) - parseFloat(bbMatch[2]) }
      : { x: 0, y: 0, w: 400, h: 300 };

    elements.push(
      createDefaultElement('IMAGE', bb.x, bb.y, Math.max(bb.w, 100), Math.max(bb.h, 100), {
        zIndex: 0,
        content: 'EPS File',
        color: 'transparent',
        name: 'EPS File (converted to image placeholder)',
        styles: {},
      }),
    );
  }

  return elements;
}

// ─── Zip-Based Format Handler ────────────────────────────────────────────────

/**
 * Attempt to extract parseable content from zip-based design files.
 * For many proprietary formats (.sketch, .fig, .vsdx, etc.), we try to find
 * JSON or XML data inside the zip and fall back to an image placeholder.
 */
async function parseZipBased(file: File, fileName: string, ext: string): Promise<{ elements: BoardElement[]; warning?: string }> {
  try {
    // Dynamic import of JSZip-like approach using Node's built-in zlib
    // For a server-side implementation, we try to read the file and look for known internal structures
    const buffer = await readFileAsBuffer(file);

    // Check if it's a valid zip (PK header)
    const isZip = buffer[0] === 0x50 && buffer[1] === 0x4B;
    if (!isZip) {
      // Not actually a zip — return as image placeholder
      return {
        elements: [
          createDefaultElement('IMAGE', 100, 100, 400, 300, {
            zIndex: 0,
            color: 'transparent',
            name: fileName.replace(/\.[^.]+$/, '') || 'Imported Design',
            styles: {},
          }),
        ],
        warning: `${ext} file could not be fully parsed. A placeholder element has been created.`,
      };
    }

    // Try to find JSON content within the zip for known formats
    // .sketch files have a "meta.json" and page JSON files
    // .vsdx files have "visio/document.xml" and "visio/pages/pages.xml"
    // .pptx files have "ppt/slides/slide1.xml"
    // .drawio files within .zip are just the XML
    // .fig files are proprietary binary

    // For a robust implementation, we'd use a zip library here.
    // Since we want to keep dependencies minimal, we'll search for
    // readable string content within the binary.

    const text = buffer.toString('utf-8', 0, Math.min(buffer.length, 1024 * 1024)); // first 1MB as text

    // Try to find and extract JSON from .sketch meta
    if (ext === '.sketch') {
      const metaMatch = text.match(/\{[^{}]*"pages"[^{}]*\}/s);
      if (metaMatch) {
        try {
          const meta = JSON.parse(metaMatch[0]);
          if (meta.pages && Array.isArray(meta.pages)) {
            const elements: BoardElement[] = [];
            for (const page of meta.pages) {
              elements.push(
                createDefaultElement('FRAME', 0, 0, 1440, 900, {
                  zIndex: 0,
                  content: page.name || 'Sketch Page',
                  color: '#FFFFFF',
                  name: page.name || 'Sketch Page',
                  styles: {
                    fills: [{ id: `fill-${Date.now()}-1`, type: 'solid', color: '#FFFFFF', opacity: 1 }],
                    frameClip: true,
                  },
                }),
              );
            }
            return { elements };
          }
        } catch {
          // fall through to placeholder
        }
      }
    }

    // For .pptx, try to extract slide dimensions and content
    if (ext === '.pptx') {
      const slideMatch = text.match(/<p:sldIdLst>(.*?)<\/p:sldIdLst>/s);
      if (slideMatch) {
        const slideCount = (slideMatch[1].match(/<p:sldId /g) || []).length;
        const elements: BoardElement[] = [];
        for (let i = 0; i < Math.max(slideCount, 1); i++) {
          elements.push(
            createDefaultElement('FRAME', 0, i * 960, 1920, 1080, {
              zIndex: i,
              content: `Slide ${i + 1}`,
              color: '#FFFFFF',
              name: `Slide ${i + 1}`,
              styles: {
                fills: [{ id: `fill-${Date.now()}-${i}`, type: 'solid', color: '#FFFFFF', opacity: 1 }],
                frameClip: true,
                frameDevice: 'presentation',
              },
            }),
          );
        }
        return { elements };
      }
    }

    // For .vsdx, try to extract page info
    if (ext === '.vsdx' || ext === '.vsd') {
      const pageMatch = text.match(/<Page[^>]*Name="([^"]+)"/);
      const elements: BoardElement[] = [];
      elements.push(
        createDefaultElement('FRAME', 0, 0, 1122, 793, {
          zIndex: 0,
          content: pageMatch ? pageMatch[1] : 'Visio Page',
          color: '#FFFFFF',
          name: pageMatch ? pageMatch[1] : 'Visio Drawing',
          styles: {
            fills: [{ id: `fill-${Date.now()}-1`, type: 'solid', color: '#FFFFFF', opacity: 1 }],
            frameClip: true,
          },
        }),
      );
      return { elements };
    }

    // For .idml (InDesign), try to extract spread/page info
    if (ext === '.idml') {
      const elements: BoardElement[] = [];
      elements.push(
        createDefaultElement('FRAME', 0, 0, 1190, 842, {
          zIndex: 0,
          content: 'InDesign Document',
          color: '#FFFFFF',
          name: 'InDesign Document',
          styles: {
            fills: [{ id: `fill-${Date.now()}-1`, type: 'solid', color: '#FFFFFF', opacity: 1 }],
            frameClip: true,
          },
        }),
      );
      return { elements };
    }

    // For .afdesign (Affinity Designer), .framer, .penpot, etc.
    // These are proprietary formats — create a meaningful placeholder
    const formatNames: Record<string, string> = {
      '.sketch': 'Sketch', '.fig': 'Figma', '.figma': 'Figma',
      '.vsdx': 'Visio', '.vsd': 'Visio', '.graffle': 'OmniGraffle',
      '.idml': 'InDesign', '.canva': 'Canva', '.figjam': 'FigJam',
      '.inv': 'InVision', '.invd': 'InVision', '.odp': 'OpenDocument',
      '.rp': 'Axure', '.mp': 'Mockplus', '.pie': 'ProtoPie',
      '.framer': 'Framer', '.penpot': 'Penpot', '.gvdesign': 'GVDesign',
      '.afdesign': 'Affinity Designer', '.pencil': 'Pencil',
      '.lottie': 'Lottie', '.whimsical': 'Whimsical', '.miro': 'Miro',
      '.lucid': 'Lucidchart', '.gliffy': 'Gliffy', '.xd': 'Adobe XD',
    };

    const formatName = formatNames[ext] || ext.replace('.', '').toUpperCase();
    const elements: BoardElement[] = [];
    elements.push(
      createDefaultElement('FRAME', 0, 0, 1440, 900, {
        zIndex: 0,
        content: `${formatName} Design`,
        color: '#FFFFFF',
        name: `${formatName} File: ${fileName}`,
        styles: {
          fills: [{ id: `fill-${Date.now()}-1`, type: 'solid', color: '#FFFFFF', opacity: 1 }],
          frameClip: true,
        },
      }),
    );

    return {
      elements,
      warning: `Full ${formatName} parsing is not yet available. A placeholder frame has been created. For best results, export as SVG or PNG from ${formatName} and re-import.`,
    };
  } catch {
    return {
      elements: [
        createDefaultElement('IMAGE', 100, 100, 400, 300, {
          zIndex: 0,
          color: 'transparent',
          name: fileName.replace(/\.[^.]+$/, '') || 'Imported Design',
          styles: {},
        }),
      ],
      warning: `Could not read ${ext} file. A placeholder has been created.`,
    };
  }
}

// ─── Text Parser ─────────────────────────────────────────────────────────────

/**
 * Parse a plain text / code / config file into a STICKY_NOTE BoardElement.
 */
function parseText(text: string, fileName: string): BoardElement[] {
  const truncated = text.length > 2000 ? text.slice(0, 2000) + '…' : text;
  const name = fileName.replace(/\.[^.]+$/, '') || 'Imported Text';

  return [
    createDefaultElement('STICKY_NOTE', 100, 100, 280, 200, {
      zIndex: 0,
      content: truncated,
      color: '#FEF3C7',
      name,
      styles: {
        fills: [{ id: `fill-${Date.now()}-1`, type: 'solid', color: '#FEF3C7', opacity: 1 }],
        typography: {
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 13,
          fontWeight: 400,
          lineHeight: 1.6,
          letterSpacing: 0,
          textDecoration: 'none',
          color: '#1F2937',
          textAlign: 'left',
          fontStyle: 'normal',
          textCase: 'none',
        },
      },
    }),
  ];
}

// ─── POST Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const boardId = (formData.get('boardId') as string) || 'board-demo-1';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds the 20 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).` },
        { status: 413 },
      );
    }

    const ext = getExtension(file.name, file.type);
    if (!ext) {
      return NextResponse.json(
        { error: `Unsupported file type: "${file.name}". Supported formats include SVG, PNG, JPG, WebP, GIF, PDF, JSON, YAML, XML, Draw.io, Excalidraw, Balsamiq, HTML, and many more.` },
        { status: 400 },
      );
    }

    const fileType = getFileType(ext);
    const fileSize = file.size;
    let elements: BoardElement[] = [];
    let error: string | null = null;
    let warning: string | null = null;

    // Create the import job record
    const job = await db.importJob.create({
      data: {
        userId: DEMO_USER_ID,
        boardId,
        fileName: file.name,
        fileType,
        fileSize,
        status: 'processing',
      },
    });

    try {
      if (fileType === 'svg') {
        let text: string;

        if (ext === '.svgz') {
          // Decompress gzip first
          const buffer = await readFileAsBuffer(file);
          const decompressed = decompressGzip(buffer);
          text = decompressed.toString('utf-8');
        } else if (ext === '.eps' || ext === '.ps') {
          // Try EPS/PostScript extraction
          text = await readFileAsText(file);
          elements = parseEPS(text);
        } else {
          text = await readFileAsText(file);
        }

        if (elements.length === 0 && text) {
          elements = parseSVG(text);
        }

        // If SVG parsing yielded nothing but it's not EPS, try as plain text
        if (elements.length === 0 && ext !== '.eps' && ext !== '.ps') {
          elements = parseText(text, file.name);
        }
      } else if (fileType === 'json') {
        const text = await readFileAsText(file);
        // Try Figma format first (has `document` key), then generic
        let parsed: unknown;
        try { parsed = JSON.parse(text); } catch { parsed = null; }
        const isFigma = parsed && typeof parsed === 'object' && 'document' in (parsed as object);
        elements = isFigma ? parseFigmaJSON(text) : parseJSONDesign(text);

        // If no elements found, also try as excalidraw (which is JSON but has `elements` array)
        if (elements.length === 0 && parsed && typeof parsed === 'object' && 'elements' in (parsed as object)) {
          const excalidrawElements = parseExcalidraw(text);
          if (excalidrawElements.length > 0) {
            elements = excalidrawElements;
          }
        }
      } else if (fileType === 'drawio') {
        const text = await readFileAsText(file);
        elements = parseDrawIO(text);
      } else if (fileType === 'excalidraw') {
        const text = await readFileAsText(file);
        elements = parseExcalidraw(text);
      } else if (fileType === 'balsamiq') {
        const text = await readFileAsText(file);
        elements = parseBalsamiq(text);
      } else if (fileType === 'html') {
        const text = await readFileAsText(file);
        elements = parseHTML(text);
      } else if (fileType === 'zip-based') {
        const result = await parseZipBased(file, file.name, ext);
        elements = result.elements;
        warning = result.warning || null;
      } else if (fileType === 'text') {
        const text = await readFileAsText(file);
        elements = parseText(text, file.name);
      } else if (fileType === 'image') {
        const base64 = await readFileAsBase64(file);
        elements = [parseImageData(base64, file.name)];
      } else {
        error = `File type "${fileType}" (.${ext}) is recognized but not yet fully supported. Try exporting as SVG or PNG.`;
      }

      if (elements.length === 0 && !error) {
        error = 'No elements could be parsed from the file. The file may be empty or in an unsupported format.';
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to parse file.';
    }

    // Update the job record
    const status = error ? 'failed' : 'completed';
    await db.importJob.update({
      where: { id: job.id },
      data: {
        status,
        result: !error ? JSON.stringify(elements) : null,
        error,
      },
    });

    if (error) {
      return NextResponse.json({ error, jobId: job.id }, { status: 422 });
    }

    return NextResponse.json({
      elements,
      jobId: job.id,
      ...(warning ? { warning } : {}),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}