import type { BoardElement, AlignmentGuide } from '@/lib/types';

export function screenToCanvas(screenX: number, screenY: number, panX: number, panY: number, zoom: number) {
  return {
    x: (screenX - panX) / zoom,
    y: (screenY - panY) / zoom,
  };
}

export function canvasToScreen(canvasX: number, canvasY: number, panX: number, panY: number, zoom: number) {
  return {
    x: canvasX * zoom + panX,
    y: canvasY * zoom + panY,
  };
}

export function computeAlignmentGuides(
  movingElements: BoardElement[],
  allElements: BoardElement[],
  threshold: number,
): AlignmentGuide[] {
  const guides: AlignmentGuide[] = [];
  const movingIds = new Set(movingElements.map((e) => e.id));
  const others = allElements.filter((e) => !movingIds.has(e.id) && e.type !== 'LINE' && e.type !== 'CONNECTOR' && e.visible !== false);

  if (others.length === 0) return guides;

  for (const moving of movingElements) {
    const mLeft = moving.x;
    const mRight = moving.x + moving.width;
    const mTop = moving.y;
    const mBottom = moving.y + moving.height;
    const mCenterX = moving.x + moving.width / 2;
    const mCenterY = moving.y + moving.height / 2;

    for (const other of others) {
      const oLeft = other.x;
      const oRight = other.x + other.width;
      const oTop = other.y;
      const oBottom = other.y + other.height;
      const oCenterX = other.x + other.width / 2;
      const oCenterY = other.y + other.height / 2;

      // Horizontal guides (Y axis)
      if (Math.abs(mTop - oTop) < threshold) guides.push({ axis: 'y', position: oTop, type: 'edge', elements: [moving.id, other.id] });
      if (Math.abs(mTop - oBottom) < threshold) guides.push({ axis: 'y', position: oBottom, type: 'edge', elements: [moving.id, other.id] });
      if (Math.abs(mBottom - oTop) < threshold) guides.push({ axis: 'y', position: oTop, type: 'edge', elements: [moving.id, other.id] });
      if (Math.abs(mBottom - oBottom) < threshold) guides.push({ axis: 'y', position: oBottom, type: 'edge', elements: [moving.id, other.id] });
      if (Math.abs(mCenterY - oCenterY) < threshold) guides.push({ axis: 'y', position: oCenterY, type: 'center', elements: [moving.id, other.id] });
      if (Math.abs(mCenterY - oTop) < threshold) guides.push({ axis: 'y', position: oTop, type: 'center', elements: [moving.id, other.id] });
      if (Math.abs(mCenterY - oBottom) < threshold) guides.push({ axis: 'y', position: oBottom, type: 'center', elements: [moving.id, other.id] });

      // Vertical guides (X axis)
      if (Math.abs(mLeft - oLeft) < threshold) guides.push({ axis: 'x', position: oLeft, type: 'edge', elements: [moving.id, other.id] });
      if (Math.abs(mLeft - oRight) < threshold) guides.push({ axis: 'x', position: oRight, type: 'edge', elements: [moving.id, other.id] });
      if (Math.abs(mRight - oLeft) < threshold) guides.push({ axis: 'x', position: oLeft, type: 'edge', elements: [moving.id, other.id] });
      if (Math.abs(mRight - oRight) < threshold) guides.push({ axis: 'x', position: oRight, type: 'edge', elements: [moving.id, other.id] });
      if (Math.abs(mCenterX - oCenterX) < threshold) guides.push({ axis: 'x', position: oCenterX, type: 'center', elements: [moving.id, other.id] });
      if (Math.abs(mCenterX - oLeft) < threshold) guides.push({ axis: 'x', position: oLeft, type: 'center', elements: [moving.id, other.id] });
      if (Math.abs(mCenterX - oRight) < threshold) guides.push({ axis: 'x', position: oRight, type: 'center', elements: [moving.id, other.id] });
    }
  }

  return guides;
}

export function getBounds(elements: BoardElement[]) {
  if (elements.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  const minX = Math.min(...elements.map((e) => e.x));
  const minY = Math.min(...elements.map((e) => e.y));
  const maxX = Math.max(...elements.map((e) => e.x + e.width));
  const maxY = Math.max(...elements.map((e) => e.y + e.height));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function getCenter(el: BoardElement) {
  return { x: el.x + el.width / 2, y: el.y + el.height / 2 };
}

export function pointInElement(px: number, py: number, el: BoardElement): boolean {
  return px >= el.x && px <= el.x + el.width && py >= el.y && py <= el.y + el.height;
}

export function generateStarPoints(cx: number, cy: number, outerR: number, innerR: number, points: number) {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  return pts;
}

export function generatePolygonPoints(cx: number, cy: number, radius: number, sides: number) {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (2 * Math.PI / sides) * i - Math.PI / 2;
    pts.push({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) });
  }
  return pts;
}

export function snapToGuides(
  x: number, y: number,
  guides: AlignmentGuide[],
  threshold: number,
): { x: number; y: number; guides: AlignmentGuide[] } {
  let newX = x, newY = y;
  const matchedGuides: AlignmentGuide[] = [];

  for (const guide of guides) {
    if (guide.axis === 'x') {
      if (Math.abs(x - guide.position) < threshold) {
        newX = guide.position;
        matchedGuides.push(guide);
      }
    } else {
      if (Math.abs(y - guide.position) < threshold) {
        newY = guide.position;
        matchedGuides.push(guide);
      }
    }
  }

  return { x: newX, y: newY, guides: matchedGuides };
}

export function cssStringFromFills(fills: NonNullable<BoardElement['styles']>['fills']): string {
  if (!fills || fills.length === 0) return 'transparent';
  const fill = fills[0];
  if (!fill) return 'transparent';
  if (fill.type === 'none') return 'transparent';
  if (fill.type === 'solid') return fill.color || 'transparent';
  if (fill.type === 'linear-gradient' && fill.gradientStops && fill.gradientStops.length >= 2) {
    const angle = fill.gradientAngle ?? 0;
    const stops = fill.gradientStops.map((s) => `${s.color} ${(s.position * 100).toFixed(0)}%`).join(', ');
    return `linear-gradient(${angle}deg, ${stops})`;
  }
  if (fill.type === 'radial-gradient' && fill.gradientStops && fill.gradientStops.length >= 2) {
    const stops = fill.gradientStops.map((s) => `${s.color} ${(s.position * 100).toFixed(0)}%`).join(', ');
    return `radial-gradient(circle, ${stops})`;
  }
  return fill.color || 'transparent';
}

export function cssBoxShadow(shadows: NonNullable<BoardElement['styles']>['shadows']): string {
  if (!shadows || shadows.length === 0) return 'none';
  return shadows
    .filter((s) => s.visible)
    .map((s) => {
      if (s.type === 'inner-shadow') {
        return `inset ${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.spread}px ${s.color}`;
      }
      return `${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.spread}px ${s.color}`;
    })
    .join(', ');
}
