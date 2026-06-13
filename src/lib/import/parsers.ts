/**
 * Import Parsers for BranchBoard
 *
 * Parses SVG, Figma JSON, generic JSON, and image files into BoardElement[].
 */

import type { BoardElement, ElementType, ElementStyles, Fill, Stroke } from '@/lib/types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function uid(): string {
  return `el-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function fillId(): string {
  return `fill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function strokeId(): string {
  return `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function baseElement(
  type: ElementType,
  x: number,
  y: number,
  w: number,
  h: number,
  overrides: Partial<BoardElement> = {},
): BoardElement {
  return {
    id: uid(),
    type,
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(w),
    height: Math.round(h),
    rotation: 0,
    content: '',
    color: '#FFFFFF',
    zIndex: 0,
    locked: false,
    visible: true,
    name: undefined,
    groupId: undefined,
    parentId: undefined,
    componentId: undefined,
    componentOverrides: undefined,
    styles: {},
    sourceId: undefined,
    targetId: undefined,
    sourceAnchor: undefined,
    targetAnchor: undefined,
    ...overrides,
  };
}

/** Extract an absolute number from an SVG attribute, defaulting to `fallback`. */
function num(val: string | null | undefined, fallback = 0): number {
  if (!val) return fallback;
  const n = parseFloat(val);
  return Number.isFinite(n) ? n : fallback;
}

/** Normalise a CSS / SVG colour to a hex string. */
function normalizeColor(raw: string | null | undefined): string {
  if (!raw) return '#374151';
  const trimmed = raw.trim().toLowerCase();
  if (trimmed.startsWith('#')) {
    // Ensure 6-char hex
    if (trimmed.length === 4) {
      return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
    }
    return trimmed;
  }
  // Simple named colour lookup
  const named: Record<string, string> = {
    black: '#000000', white: '#FFFFFF', red: '#EF4444', green: '#22C55E',
    blue: '#3B82F6', yellow: '#EAB308', purple: '#A855F7', orange: '#F97316',
    gray: '#6B7280', grey: '#6B7280', pink: '#EC4899', cyan: '#06B6D4',
    teal: '#14B8A6', indigo: '#6366F1', lime: '#84CC16', amber: '#F59E0B',
  };
  if (named[trimmed]) return named[trimmed];
  // For rgb(...) / rgba(...) just return as-is (the canvas can handle it)
  if (trimmed.startsWith('rgb')) return trimmed;
  return '#374151';
}

// ─── SVG Parser ─────────────────────────────────────────────────────────────

/**
 * Parse an SVG string into BoardElement[].
 * Handles: rect, circle, ellipse, line, polyline, polygon, path, text, g (groups).
 */
export function parseSVG(svgString: string): BoardElement[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgEl = doc.querySelector('svg');
  if (!svgEl) return [];

  const elements: BoardElement[] = [];
  let zIdx = 0;

  function processNode(node: Element, offsetX = 0, offsetY = 0): void {
    const tag = node.tagName.toLowerCase();

    // Skip defs, metadata, etc.
    if (['defs', 'metadata', 'title', 'desc', 'clippath', 'mask', 'lineargradient', 'radialgradient', 'pattern', 'filter'].includes(tag)) return;

    // Recurse into <g> and <svg>
    if (tag === 'g' || tag === 'svg') {
      const tx = num(node.getAttribute('transform')?.match(/translate\(\s*([\d.-]+)/)?.[1]);
      const ty = num(node.getAttribute('transform')?.match(/translate\([^,]*,\s*([\d.-]+)/)?.[1]);
      for (const child of Array.from(node.children)) {
        processNode(child, offsetX + tx, offsetY + ty);
      }
      return;
    }

    const fill = normalizeColor(node.getAttribute('fill'));
    const strokeColor = normalizeColor(node.getAttribute('stroke'));
    const strokeWidth = num(node.getAttribute('stroke-width'), 1);
    const opacity = num(node.getAttribute('opacity'), 1);
    const name = node.getAttribute('id') || node.getAttribute('name') || undefined;

    const baseStyles: ElementStyles = {};
    const fills: Fill[] = [];
    const strokes: Stroke[] = [];

    if (fill && fill !== 'none') {
      fills.push({ id: fillId(), type: 'solid', color: fill, opacity });
    }
    baseStyles.fills = fills;

    if (node.hasAttribute('stroke') && strokeColor !== 'none' && strokeWidth > 0) {
      strokes.push({
        id: strokeId(),
        color: strokeColor,
        width: strokeWidth,
        style: 'solid',
        align: 'center',
        cap: 'butt',
        join: 'miter',
        opacity,
      });
    }
    baseStyles.strokes = strokes;

    if (tag === 'rect') {
      const x = num(node.getAttribute('x')) + offsetX;
      const y = num(node.getAttribute('y')) + offsetY;
      const w = Math.max(num(node.getAttribute('width'), 1));
      const h = Math.max(num(node.getAttribute('height'), 1));
      const rx = num(node.getAttribute('rx'), 0);
      const ry = num(node.getAttribute('ry'), 0);
      const cornerRadius = Math.max(rx, ry);
      if (cornerRadius > 0) {
        baseStyles.cornerRadius = {
          topLeft: cornerRadius,
          topRight: cornerRadius,
          bottomRight: cornerRadius,
          bottomLeft: cornerRadius,
        };
      }
      elements.push(baseElement('RECTANGLE', x, y, w, h, { zIndex: zIdx++, color: fill, name, styles: baseStyles }));
    } else if (tag === 'circle') {
      const cx = num(node.getAttribute('cx')) + offsetX;
      const cy = num(node.getAttribute('cy')) + offsetY;
      const r = Math.max(num(node.getAttribute('r'), 1));
      const d = r * 2;
      elements.push(baseElement('CIRCLE', cx - r, cy - r, d, d, { zIndex: zIdx++, color: fill, name, styles: baseStyles }));
    } else if (tag === 'ellipse') {
      const cx = num(node.getAttribute('cx')) + offsetX;
      const cy = num(node.getAttribute('cy')) + offsetY;
      const rx = Math.max(num(node.getAttribute('rx'), 1));
      const ry = Math.max(num(node.getAttribute('ry'), 1));
      elements.push(baseElement('ELLIPSE', cx - rx, cy - ry, rx * 2, ry * 2, { zIndex: zIdx++, color: fill, name, styles: baseStyles }));
    } else if (tag === 'line') {
      const x1 = num(node.getAttribute('x1')) + offsetX;
      const y1 = num(node.getAttribute('y1')) + offsetY;
      const x2 = num(node.getAttribute('x2')) + offsetX;
      const y2 = num(node.getAttribute('y2')) + offsetY;
      const minX = Math.min(x1, x2);
      const minY = Math.min(y1, y2);
      const w = Math.max(Math.abs(x2 - x1), 2);
      const h = Math.max(Math.abs(y2 - y1), 2);
      const rad = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
      baseStyles.x2 = x2 - x1;
      baseStyles.y2 = y2 - y1;
      elements.push(baseElement('LINE', minX, minY, w, h, { zIndex: zIdx++, color: strokeColor, name, styles: baseStyles, rotation: rad }));
    } else if (tag === 'polyline' || tag === 'polygon') {
      const points = (node.getAttribute('points') || '').trim();
      if (!points) return;
      const coords = points.split(/[\s,]+/).map(Number).filter(Number.isFinite);
      if (coords.length < 4) return;

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (let i = 0; i < coords.length; i += 2) {
        minX = Math.min(minX, coords[i]);
        minY = Math.min(minY, coords[i + 1]);
        maxX = Math.max(maxX, coords[i]);
        maxY = Math.max(maxY, coords[i + 1]);
      }

      const closed = tag === 'polygon';
      const relCoords = [];
      for (let i = 0; i < coords.length; i += 2) {
        relCoords.push(coords[i] - minX, coords[i + 1] - minY);
      }
      const pathParts = relCoords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c}`);
      if (closed) pathParts.push('Z');
      const pathData = pathParts.join(' ');

      baseStyles.pathData = pathData;
      elements.push(baseElement('PEN_PATH', minX + offsetX, minY + offsetY, Math.max(maxX - minX, 1), Math.max(maxY - minY, 1), { zIndex: zIdx++, color: fill, name, styles: baseStyles }));
    } else if (tag === 'path') {
      const d = node.getAttribute('d') || '';
      if (!d) return;

      // Estimate bounding box by extracting all coordinate values
      const coordMatches = d.match(/[-+]?[\d]*\.?[\d]+/g);
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      if (coordMatches) {
        const nums = coordMatches.map(Number).filter(Number.isFinite);
        for (let i = 0; i < nums.length; i += 2) {
          if (i + 1 < nums.length) {
            minX = Math.min(minX, nums[i]);
            minY = Math.min(minY, nums[i + 1]);
            maxX = Math.max(maxX, nums[i]);
            maxY = Math.max(maxY, nums[i + 1]);
          }
        }
      }
      if (!Number.isFinite(minX)) { minX = 0; minY = 0; maxX = 200; maxY = 200; }

      // Make path relative to bounding box
      let relPath = d;
      if (Number.isFinite(minX) && Number.isFinite(minY) && (minX !== 0 || minY !== 0)) {
        // For M/L/C/Q commands, offset absolute coordinates
        relPath = d.replace(/([MLCQ])\s*([-+]?[\d]*\.?[\d]+)\s*,?\s*([-+]?[\d]*\.?[\d]+)/g,
          (_match, cmd, cx, cy) => `${cmd}${parseFloat(cx) - minX},${parseFloat(cy) - minY}`);
      }

      baseStyles.pathData = relPath;
      elements.push(baseElement('PEN_PATH', minX + offsetX, minY + offsetY, Math.max(maxX - minX, 1), Math.max(maxY - minY, 1), { zIndex: zIdx++, color: fill, name, styles: baseStyles }));
    } else if (tag === 'text' || tag === 'tspan') {
      const x = num(node.getAttribute('x')) + offsetX;
      const y = num(node.getAttribute('y')) + offsetY;
      const fontSize = num(node.getAttribute('font-size'), 16);
      const fontWeight = node.getAttribute('font-weight') || '400';
      const textAlign = node.getAttribute('text-anchor') === 'middle' ? 'center' : node.getAttribute('text-anchor') === 'end' ? 'right' : 'left';
      const textContent = node.textContent || '';

      baseStyles.typography = {
        fontFamily: node.getAttribute('font-family') || 'Inter, system-ui, sans-serif',
        fontSize,
        fontWeight,
        lineHeight: 1.5,
        letterSpacing: 0,
        textDecoration: 'none',
        color: fill !== 'none' ? fill : '#1F2937',
        textAlign: textAlign as 'left' | 'center' | 'right' | 'justify',
        fontStyle: 'normal',
        textCase: 'none',
      };

      // Estimate width/height from text content
      const estimatedW = Math.max(textContent.length * fontSize * 0.6, 20);
      const estimatedH = fontSize * 1.5;

      elements.push(baseElement('TEXT', x, y - estimatedH, estimatedW, estimatedH, {
        zIndex: zIdx++,
        color: 'transparent',
        name,
        content: textContent,
        styles: baseStyles,
      }));
    }
  }

  // Process all top-level children of <svg>
  for (const child of Array.from(svgEl.children)) {
    processNode(child);
  }

  return elements;
}

// ─── Figma JSON Parser ──────────────────────────────────────────────────────

/**
 * Minimal type for a Figma API node.
 * Figma's API returns a tree: document > canvas > frame > nodes...
 */
interface FigmaNode {
  id?: string;
  name?: string;
  type?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  visible?: boolean;
  fills?: Array<{ type?: string; color?: { r: number; g: number; b: number; a?: number }; opacity?: number }>;
  strokes?: Array<{ color?: { r: number; g: number; b: number; a?: number } }>;
  strokeWeight?: number;
  effects?: Array<{ type?: string; color?: { r: number; g: number; b: number; a?: number }; offset?: { x: number; y: number }; radius?: number; spread?: number; visible?: boolean }>;
  opacity?: number;
  characters?: string;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    textAlignHorizontal?: string;
    textAlignVertical?: string;
    lineHeightPx?: number;
    letterSpacing?: number;
  };
  cornerRadius?: number;
  topLeftRadius?: number;
  topRightRadius?: number;
  bottomLeftRadius?: number;
  bottomRightRadius?: number;
  children?: FigmaNode[];
  vectorData?: { path: string };
  absoluteBoundingBox?: { x: number; y: number; width: number; height: number };
  absoluteRenderBounds?: { x: number; y: number; width: number; height: number };
}

function figmaColor(c?: { r: number; g: number; b: number; a?: number }): string {
  if (!c) return '#374151';
  const r = Math.round(c.r * 255).toString(16).padStart(2, '0');
  const g = Math.round(c.g * 255).toString(16).padStart(2, '0');
  const b = Math.round(c.b * 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

/** Recursively collect leaf nodes from a Figma tree, skipping containers. */
function flattenFigmaNodes(node: FigmaNode): FigmaNode[] {
  const containerTypes = ['DOCUMENT', 'CANVAS', 'PAGE', 'GROUP', 'BOOLEAN_OPERATION', 'SECTION'];
  if (node.type && containerTypes.includes(node.type) && node.children?.length) {
    return node.children.flatMap(flattenFigmaNodes);
  }
  // Frame could also be a container, but it maps to FRAME element
  if (node.type === 'FRAME' && node.children?.length) {
    // Return the frame itself AND its children
    return [node, ...node.children.flatMap(flattenFigmaNodes)];
  }
  return [node];
}

function mapFigmaType(figmaType?: string): ElementType {
  const map: Record<string, ElementType> = {
    RECTANGLE: 'RECTANGLE',
    ELLIPSE: 'ELLIPSE',
    CIRCLE: 'CIRCLE',
    LINE: 'LINE',
    TEXT: 'TEXT',
    FRAME: 'FRAME',
    VECTOR: 'PEN_PATH',
    STAR: 'STAR',
    POLYGON: 'POLYGON',
    REGULAR_POLYGON: 'POLYGON',
    IMAGE: 'IMAGE',
  };
  return map[figmaType || ''] || 'RECTANGLE';
}

/**
 * Parse a Figma export JSON string into BoardElement[].
 * Handles the standard Figma API node format (document > canvas > frame > nodes).
 */
export function parseFigmaJSON(figmaData: string): BoardElement[] {
  let data: FigmaNode;
  try {
    data = JSON.parse(figmaData);
  } catch {
    return [];
  }

  // If it's the top-level API response, dig into document
  const doc = (data as Record<string, unknown>).document as FigmaNode | undefined;
  const root = doc || data;

  const flat = flattenFigmaNodes(root);
  const elements: BoardElement[] = [];

  for (let i = 0; i < flat.length; i++) {
    const node = flat[i];
    if (!node.type) continue;
    // Skip non-leaf container types that we already flattened
    const skipTypes = ['DOCUMENT', 'CANVAS', 'PAGE', 'GROUP', 'SECTION', 'BOOLEAN_OPERATION'];
    if (skipTypes.includes(node.type)) continue;

    const bb = node.absoluteBoundingBox || { x: node.x || 0, y: node.y || 0, width: node.width || 100, height: node.height || 100 };
    const type = mapFigmaType(node.type);
    const fills: Fill[] = [];
    const strokes: Stroke[] = [];
    const styles: ElementStyles = {};

    // Parse fills
    if (node.fills) {
      for (const f of node.fills) {
        if (f.type === 'SOLID' && f.color) {
          fills.push({
            id: fillId(),
            type: 'solid',
            color: figmaColor(f.color),
            opacity: f.opacity ?? f.color.a ?? 1,
          });
        } else if (f.type === 'GRADIENT_LINEAR' && f.color) {
          fills.push({
            id: fillId(),
            type: 'linear-gradient',
            color: figmaColor(f.color),
            opacity: f.opacity ?? 1,
          });
        }
      }
    }
    styles.fills = fills;

    // Parse strokes
    if (node.strokes?.[0]?.color) {
      strokes.push({
        id: strokeId(),
        color: figmaColor(node.strokes[0].color),
        width: node.strokeWeight || 1,
        style: 'solid',
        align: 'center',
        cap: 'butt',
        join: 'miter',
      });
    }
    styles.strokes = strokes;

    // Parse shadows
    if (node.effects) {
      const shadows = node.effects
        .filter(e => e.type === 'DROP_SHADOW' && e.visible !== false)
        .map(e => ({
          id: `shadow-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: 'drop-shadow' as const,
          color: figmaColor(e.color),
          offsetX: e.offset?.x ?? 0,
          offsetY: e.offset?.y ?? 4,
          blur: e.radius ?? 8,
          spread: e.spread ?? 0,
          visible: true,
        }));
      if (shadows.length) styles.shadows = shadows;
    }

    // Parse corner radius
    if (node.cornerRadius) {
      const r = node.cornerRadius;
      styles.cornerRadius = { topLeft: r, topRight: r, bottomRight: r, bottomLeft: r };
    } else if (node.topLeftRadius || node.topRightRadius || node.bottomRightRadius || node.bottomLeftRadius) {
      styles.cornerRadius = {
        topLeft: node.topLeftRadius || 0,
        topRight: node.topRightRadius || 0,
        bottomRight: node.bottomRightRadius || 0,
        bottomLeft: node.bottomLeftRadius || 0,
      };
    }

    // Parse typography
    if (node.type === 'TEXT' && node.style) {
      styles.typography = {
        fontFamily: node.style.fontFamily || 'Inter, system-ui, sans-serif',
        fontSize: node.style.fontSize || 16,
        fontWeight: node.style.fontWeight || 400,
        lineHeight: (node.style.lineHeightPx || node.style.fontSize || 16) / (node.style.fontSize || 16),
        letterSpacing: node.style.letterSpacing || 0,
        textDecoration: 'none',
        color: fills[0]?.color || '#1F2937',
        textAlign: (node.style.textAlignHorizontal === 'CENTER' ? 'center' : node.style.textAlignHorizontal === 'RIGHT' ? 'right' : 'left') as 'left' | 'center' | 'right' | 'justify',
        fontStyle: 'normal',
        textCase: 'none',
      };
    }

    // Parse path data for vectors
    if (node.type === 'VECTOR' && node.vectorData?.path) {
      styles.pathData = node.vectorData.path;
    }

    const fillColor = fills[0]?.color || '#FFFFFF';
    const content = node.type === 'TEXT' ? (node.characters || '') : '';
    const name = node.name || node.type?.toLowerCase() || undefined;

    elements.push(
      baseElement(type, bb.x, bb.y, Math.max(bb.width, 1), Math.max(bb.height, 1), {
        zIndex: i,
        rotation: node.rotation || 0,
        content,
        color: fillColor,
        name,
        visible: node.visible !== false,
        opacity: node.opacity ?? 1,
        styles,
      }),
    );
  }

  return elements;
}

// ─── Image Parser ────────────────────────────────────────────────────────────

/**
 * Create an IMAGE BoardElement from uploaded image data (base64).
 */
export function parseImageData(base64: string, fileName: string): BoardElement {
  const src = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
  const styles: ElementStyles = {
    src,
  };
  const name = fileName.replace(/\.[^.]+$/, '') || 'Imported Image';

  return baseElement('IMAGE', 100, 100, 400, 300, {
    zIndex: 0,
    color: 'transparent',
    name,
    styles,
  });
}

// ─── Generic JSON Design Parser ─────────────────────────────────────────────

/**
 * Parse a generic JSON design file from other design tools.
 * Supports a flexible format where each element describes a shape.
 *
 * Expected format (array or object with `elements` / `children` / `nodes`):
 * ```json
 * {
 *   "elements": [
 *     { "type": "rectangle", "x": 0, "y": 0, "width": 100, "height": 100, "fill": "#ff0000" }
 *   ]
 * }
 * ```
 */
export function parseJSONDesign(jsonString: string): BoardElement[] {
  let data: unknown;
  try {
    data = JSON.parse(jsonString);
  } catch {
    return [];
  }

  // Try Figma format first (it has a `document` key at top level)
  if (typeof data === 'object' && data !== null && 'document' in data) {
    return parseFigmaJSON(jsonString);
  }

  // Extract the array of nodes
  let nodes: unknown[] = [];
  if (Array.isArray(data)) {
    nodes = data;
  } else if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    nodes = (obj.elements || obj.children || obj.nodes || obj.layers || obj.items || []) as unknown[];
  }

  if (!Array.isArray(nodes)) return [];

  const elements: BoardElement[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i] as Record<string, unknown>;
    if (!n || typeof n !== 'object') continue;

    const rawType = String(n.type || 'RECTANGLE').toUpperCase();
    const typeMap: Record<string, ElementType> = {
      RECTANGLE: 'RECTANGLE', RECT: 'RECTANGLE',
      CIRCLE: 'CIRCLE', ELLIPSE: 'ELLIPSE',
      TEXT: 'TEXT', LABEL: 'TEXT',
      LINE: 'LINE',
      IMAGE: 'IMAGE', IMG: 'IMAGE',
      FRAME: 'FRAME', ARTBOARD: 'FRAME', CONTAINER: 'FRAME',
      PATH: 'PEN_PATH', VECTOR: 'PEN_PATH', PEN: 'PEN_PATH',
      STAR: 'STAR',
      POLYGON: 'POLYGON',
      STICKY_NOTE: 'STICKY_NOTE', NOTE: 'STICKY_NOTE',
    };
    const type = typeMap[rawType] || 'RECTANGLE';

    const x = Number(n.x) || 0;
    const y = Number(n.y) || 0;
    const w = Math.max(Number(n.width) || Number(n.w) || 100, 1);
    const h = Math.max(Number(n.height) || Number(n.h) || 100, 1);
    const rotation = Number(n.rotation) || Number(n.angle) || 0;
    const content = String(n.content || n.text || n.label || n.characters || '');
    const fill = normalizeColor(String(n.fill || n.color || n.background || n.bg || null));
    const name = n.name ? String(n.name) : undefined;

    const styles: ElementStyles = {};
    const fills: Fill[] = [];
    const strokes: Stroke[] = [];

    if (fill && fill !== 'none' && fill !== 'transparent') {
      fills.push({ id: fillId(), type: 'solid', color: fill, opacity: Number(n.opacity) ?? 1 });
    }
    styles.fills = fills;

    if (n.stroke || n.borderColor) {
      strokes.push({
        id: strokeId(),
        color: normalizeColor(String(n.stroke || n.borderColor)),
        width: Number(n.strokeWidth || n.borderWidth) || 1,
        style: 'solid',
        align: 'center',
        cap: 'butt',
        join: 'miter',
      });
    }
    styles.strokes = strokes;

    if (n.borderRadius || n.cornerRadius) {
      const r = Number(n.borderRadius || n.cornerRadius) || 0;
      styles.cornerRadius = { topLeft: r, topRight: r, bottomRight: r, bottomLeft: r };
    }

    if (n.src || n.imageSrc || n.url) {
      styles.src = String(n.src || n.imageSrc || n.url);
    }

    if (n.pathData || n.d) {
      styles.pathData = String(n.pathData || n.d);
    }

    if (n.fontSize || n.fontWeight) {
      styles.typography = {
        fontFamily: String(n.fontFamily || 'Inter, system-ui, sans-serif'),
        fontSize: Number(n.fontSize) || 16,
        fontWeight: Number(n.fontWeight) || 400,
        lineHeight: 1.5,
        letterSpacing: 0,
        textDecoration: 'none',
        color: fill !== 'none' ? fill : '#1F2937',
        textAlign: 'left',
        fontStyle: 'normal',
        textCase: 'none',
      };
    }

    if (typeof n.opacity === 'number') {
      styles.opacity = n.opacity;
    }

    elements.push(
      baseElement(type, x, y, w, h, {
        zIndex: Number(n.zIndex) || i,
        rotation,
        content,
        color: fill,
        name,
        visible: n.visible !== false,
        styles,
      }),
    );
  }

  return elements;
}