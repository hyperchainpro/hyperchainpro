'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCanvasStore } from '@/store/canvas-store';
import { cssStringFromFills, cssBoxShadow, generateStarPoints, generatePolygonPoints } from '@/lib/canvas-utils';
import type { BoardElement, ElementStyles, CanvasTool } from '@/lib/types';

interface BoardElementProps {
  element: BoardElement;
  isSelected: boolean;
  zoom: number;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  onResizeStart?: (handle: string, e: React.PointerEvent) => void;
  onRotateStart?: (e: React.PointerEvent) => void;
}

const HANDLE_SIZE = 8;
const ROTATION_HANDLE_OFFSET = 30;

type ResizeHandle =
  | 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const HANDLE_DEFS: Record<ResizeHandle, { xPercent: number; yPercent: number; cursor: string }> = {
  nw: { xPercent: 0, yPercent: 0, cursor: 'nwse-resize' },
  n:  { xPercent: 0.5, yPercent: 0, cursor: 'ns-resize' },
  ne: { xPercent: 1, yPercent: 0, cursor: 'nesw-resize' },
  e:  { xPercent: 1, yPercent: 0.5, cursor: 'ew-resize' },
  se: { xPercent: 1, yPercent: 1, cursor: 'nwse-resize' },
  s:  { xPercent: 0.5, yPercent: 1, cursor: 'ns-resize' },
  sw: { xPercent: 0, yPercent: 1, cursor: 'nesw-resize' },
  w:  { xPercent: 0, yPercent: 0.5, cursor: 'ew-resize' },
};

const RESIZABLE_TYPES: BoardElement['type'][] = [
  'RECTANGLE', 'CIRCLE', 'ELLIPSE', 'STAR', 'POLYGON', 'TEXT',
  'IMAGE', 'STICKY_NOTE', 'FRAME', 'PEN_PATH',
];

export default function EnhancedBoardElement({
  element,
  isSelected,
  zoom,
  onPointerDown,
  onResizeStart,
  onRotateStart,
}: BoardElementProps) {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const canEdit = !element.locked;
  const s = element.styles ?? {};

  // ── Text editing ──
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!canEdit) return;
      if (element.type === 'TEXT' || element.type === 'STICKY_NOTE') {
        setIsEditing(true);
        setTimeout(() => textRef.current?.focus(), 0);
      }
    },
    [canEdit, element.type],
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      useCanvasStore.getState().updateElement(element.id, { content: e.target.value });
    },
    [element.id],
  );

  const handleTextBlur = useCallback(() => {
    setIsEditing(false);
    useCanvasStore.getState().pushHistory();
  }, []);

  const handleTextKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsEditing(false);
        textRef.current?.blur();
      }
    },
    [],
  );

  // Auto-resize textarea
  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.style.height = 'auto';
      textRef.current.style.height = textRef.current.scrollHeight + 'px';
    }
  }, [element.content, isEditing]);

  // ── Resize handle pointer down ──
  const handleResizePointerDown = useCallback(
    (handle: ResizeHandle, e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!canEdit || !onResizeStart) return;
      onResizeStart(handle, e);
    },
    [canEdit, onResizeStart],
  );

  // ── Rotation handle pointer down ──
  const handleRotatePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!canEdit || !onRotateStart) return;
      onRotateStart(e);
    },
    [canEdit, onRotateStart],
  );

  // Don't render hidden elements at all (after all hooks)
  if (element.visible === false) return null;

  const showResizeHandles = isSelected && canEdit && RESIZABLE_TYPES.includes(element.type);
  const showRotationHandle = isSelected && canEdit && RESIZABLE_TYPES.includes(element.type);
  const opacity = s.opacity ?? 1;

  // Stroke CSS
  const strokeCSS = getStrokeCSS(s);

  return (
    <div
      className={cn(
        'absolute',
        element.type !== 'LINE' && element.type !== 'CONNECTOR' ? 'cursor-pointer' : '',
        element.locked ? 'cursor-not-allowed' : '',
      )}
      style={{
        left: element.x,
        top: element.y,
        width: element.type === 'LINE' || element.type === 'CONNECTOR' ? 'auto' : element.width,
        height: element.type === 'LINE' || element.type === 'CONNECTOR' ? 'auto' : element.height,
        zIndex: element.zIndex,
        transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
        opacity: opacity < 1 ? opacity : undefined,
      }}
      onPointerDown={(e) => {
        if (e.button === 0) onPointerDown(e, element.id);
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Element Content */}
      <ElementContent
        element={element}
        styles={s}
        isEditing={isEditing}
        textRef={textRef}
        onTextChange={handleTextChange}
        onTextBlur={handleTextBlur}
        onTextKeyDown={handleTextKeyDown}
      />

      {/* Selection Outline */}
      {isSelected && (
        <div
          className="pointer-events-none absolute inset-0 rounded-sm"
          style={{
            zIndex: 100,
            border: '2px solid rgb(59 130 246)',
          }}
        />
      )}

      {/* Lock indicator */}
      {element.locked && (
        <div className="absolute -right-2 -top-2 z-[200] flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-sm">
          <Lock className="h-3 w-3" />
        </div>
      )}

      {/* Resize Handles (8 handles: corners + edges) */}
      {showResizeHandles &&
        (Object.keys(HANDLE_DEFS) as ResizeHandle[]).map((handle) => {
          const def = HANDLE_DEFS[handle];
          return (
            <div
              key={handle}
              className="absolute z-[150]"
              style={{
                left: `${def.xPercent * 100}%`,
                top: `${def.yPercent * 100}%`,
                width: HANDLE_SIZE,
                height: HANDLE_SIZE,
                transform: 'translate(-50%, -50%)',
                cursor: def.cursor,
              }}
              onPointerDown={(e) => handleResizePointerDown(handle, e)}
            >
              <div className="h-full w-full rounded-sm border-2 border-blue-500 bg-white shadow-sm" />
            </div>
          );
        })}

      {/* Rotation Handle (circle above element connected by thin line) */}
      {showRotationHandle && (
        <div
          className="absolute left-1/2 z-[160] cursor-crosshair"
          style={{ top: -ROTATION_HANDLE_OFFSET, transform: 'translateX(-50%)' }}
          onPointerDown={handleRotatePointerDown}
        >
          <div className="flex h-3 w-3 items-center justify-center rounded-full border border-blue-500 bg-white shadow-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          </div>
          <div className="mx-auto h-5 w-px bg-blue-500/40" />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Element Content — renders the visual body of each element type
   ═══════════════════════════════════════════════════════════════════════════════ */

interface ElementContentProps {
  element: BoardElement;
  styles: ElementStyles;
  isEditing?: boolean;
  textRef?: React.RefObject<HTMLTextAreaElement | null>;
  onTextChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onTextBlur?: () => void;
  onTextKeyDown?: (e: React.KeyboardEvent) => void;
}

function ElementContent({
  element,
  styles,
  isEditing,
  textRef,
  onTextChange,
  onTextBlur,
  onTextKeyDown,
}: ElementContentProps) {
  switch (element.type) {
    case 'STICKY_NOTE':
      return <StickyNoteContent element={element} styles={styles} isEditing={isEditing} textRef={textRef} onTextChange={onTextChange} onTextBlur={onTextBlur} onTextKeyDown={onTextKeyDown} />;
    case 'RECTANGLE':
      return <RectangleContent element={element} styles={styles} isEditing={isEditing} textRef={textRef} onTextChange={onTextChange} onTextBlur={onTextBlur} onTextKeyDown={onTextKeyDown} />;
    case 'CIRCLE':
      return <CircleContent element={element} styles={styles} isEditing={isEditing} textRef={textRef} onTextChange={onTextChange} onTextBlur={onTextBlur} onTextKeyDown={onTextKeyDown} />;
    case 'ELLIPSE':
      return <EllipseContent element={element} styles={styles} />;
    case 'STAR':
      return <StarContent element={element} styles={styles} />;
    case 'POLYGON':
      return <PolygonContent element={element} styles={styles} />;
    case 'TEXT':
      return <TextContent element={element} styles={styles} isEditing={isEditing} textRef={textRef} onTextChange={onTextChange} onTextBlur={onTextBlur} onTextKeyDown={onTextKeyDown} />;
    case 'LINE':
      return <LineContent element={element} styles={styles} />;
    case 'CONNECTOR':
      return <ConnectorContent element={element} styles={styles} />;
    case 'IMAGE':
      return <ImageContent element={element} styles={styles} />;
    case 'FRAME':
      return <FrameContent element={element} styles={styles} />;
    case 'PEN_PATH':
      return <PenPathContent element={element} styles={styles} />;
    default:
      return null;
  }
}

/* ── Sticky Note ── */
function StickyNoteContent({ element, styles, isEditing, textRef, onTextChange, onTextBlur, onTextKeyDown }: ElementContentProps) {
  return (
    <div
      className="h-full w-full rounded-lg p-4 shadow-md"
      style={{
        backgroundColor: element.color,
        minHeight: element.height,
      }}
    >
      {isEditing ? (
        <textarea
          ref={textRef}
          value={element.content}
          onChange={onTextChange}
          onBlur={onTextBlur}
          onKeyDown={onTextKeyDown}
          className="h-full w-full resize-none bg-transparent text-sm leading-relaxed outline-none"
          style={{ color: '#1a1a2e', fontSize: styles.fontSize || 14 }}
          placeholder="Type something..."
        />
      ) : (
        <div
          className="h-full min-h-[80px] w-full overflow-hidden whitespace-pre-wrap break-words text-sm leading-relaxed"
          style={{ color: '#1a1a2e', fontSize: styles.fontSize || 14 }}
        >
          {element.content || <span className="opacity-40">Type something...</span>}
        </div>
      )}
    </div>
  );
}

/* ── Rectangle ── */
function RectangleContent({ element, styles, isEditing, textRef, onTextChange, onTextBlur, onTextKeyDown }: ElementContentProps) {
  const bg = cssStringFromFills(styles.fills);
  const shadow = cssBoxShadow(styles.shadows);
  const strokeCSS = getStrokeCSS(styles);
  const cornerRadius = styles.cornerRadius;

  const borderRadius = cornerRadius
    ? `${cornerRadius.topLeft}px ${cornerRadius.topRight}px ${cornerRadius.bottomRight}px ${cornerRadius.bottomLeft}px`
    : styles.borderRadius != null
      ? `${styles.borderRadius}px`
      : '0px';

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{
        background: bg,
        borderRadius,
        boxShadow: shadow !== 'none' ? shadow : undefined,
        ...strokeCSS,
      }}
    >
      {isEditing ? (
        <textarea
          ref={textRef}
          value={element.content}
          onChange={onTextChange}
          onBlur={onTextBlur}
          onKeyDown={onTextKeyDown}
          className="h-full w-full resize-none bg-transparent p-2 text-center outline-none"
          style={{ fontSize: styles.fontSize || 16 }}
          placeholder="Add text..."
        />
      ) : element.content ? (
        <div
          className="w-full overflow-hidden p-2 text-center whitespace-pre-wrap break-words"
          style={{ fontSize: styles.fontSize || 16 }}
        >
          {element.content}
        </div>
      ) : null}
    </div>
  );
}

/* ── Circle (forced square bounding box with 50% radius) ── */
function CircleContent({ element, styles, isEditing, textRef, onTextChange, onTextBlur, onTextKeyDown }: ElementContentProps) {
  const bg = cssStringFromFills(styles.fills);
  const shadow = cssBoxShadow(styles.shadows);
  const strokeCSS = getStrokeCSS(styles);

  return (
    <div
      className="flex h-full w-full items-center justify-center overflow-hidden"
      style={{
        background: bg,
        borderRadius: '50%',
        boxShadow: shadow !== 'none' ? shadow : undefined,
        ...strokeCSS,
      }}
    >
      {isEditing ? (
        <textarea
          ref={textRef}
          value={element.content}
          onChange={onTextChange}
          onBlur={onTextBlur}
          onKeyDown={onTextKeyDown}
          className="h-full w-full resize-none bg-transparent p-2 text-center outline-none"
          style={{ fontSize: styles.fontSize || 16 }}
          placeholder="Add text..."
        />
      ) : element.content ? (
        <div
          className="w-full overflow-hidden p-2 text-center whitespace-pre-wrap break-words"
          style={{ fontSize: styles.fontSize || 16 }}
        >
          {element.content}
        </div>
      ) : null}
    </div>
  );
}

/* ── Ellipse (true ellipse: border-radius 50%) ── */
function EllipseContent({ element, styles }: ElementContentProps) {
  const bg = cssStringFromFills(styles.fills);
  const shadow = cssBoxShadow(styles.shadows);
  const strokeCSS = getStrokeCSS(styles);

  return (
    <div
      className="h-full w-full overflow-hidden"
      style={{
        background: bg,
        borderRadius: '50%',
        boxShadow: shadow !== 'none' ? shadow : undefined,
        ...strokeCSS,
      }}
    />
  );
}

/* ── Star (SVG polygon from generateStarPoints) ── */
function StarContent({ element, styles }: ElementContentProps) {
  const bg = cssStringFromFills(styles.fills);
  const strokeCSS = getStrokeCSS(styles);
  const pointCount = styles.pointCount ?? 5;
  const innerRadius = styles.innerRadius ?? 0.4;
  const outerR = Math.min(element.width, element.height) / 2;
  const innerR = outerR * innerRadius;
  const cx = element.width / 2;
  const cy = element.height / 2;

  const points = generateStarPoints(cx, cy, outerR, innerR, pointCount);
  const pointsStr = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg
      width={element.width}
      height={element.height}
      viewBox={`0 0 ${element.width} ${element.height}`}
      className="overflow-visible"
    >
      <polygon
        points={pointsStr}
        fill={bg}
        stroke={strokeCSS.border ? strokeCSS.border.replace(/.*?:\s*([^;]+).*/, '$1') : 'none'}
        strokeWidth={strokeCSS.borderWidth ? Number(strokeCSS.borderWidth) : 0}
      />
    </svg>
  );
}

/* ── Polygon (SVG polygon from generatePolygonPoints) ── */
function PolygonContent({ element, styles }: ElementContentProps) {
  const bg = cssStringFromFills(styles.fills);
  const strokeCSS = getStrokeCSS(styles);
  const pointCount = styles.pointCount ?? 6;
  const radius = Math.min(element.width, element.height) / 2;
  const cx = element.width / 2;
  const cy = element.height / 2;

  const points = generatePolygonPoints(cx, cy, radius, pointCount);
  const pointsStr = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg
      width={element.width}
      height={element.height}
      viewBox={`0 0 ${element.width} ${element.height}`}
      className="overflow-visible"
    >
      <polygon
        points={pointsStr}
        fill={bg}
        stroke={strokeCSS.border ? strokeCSS.border.replace(/.*?:\s*([^;]+).*/, '$1') : 'none'}
        strokeWidth={strokeCSS.borderWidth ? Number(strokeCSS.borderWidth) : 0}
      />
    </svg>
  );
}

/* ── Text (enhanced typography) ── */
function TextContent({ element, styles, isEditing, textRef, onTextChange, onTextBlur, onTextKeyDown }: ElementContentProps) {
  const t = styles.typography;
  const fontFamily = t?.fontFamily || 'Inter, system-ui, sans-serif';
  const fontSize = t?.fontSize || styles.fontSize || 16;
  const fontWeight = t?.fontWeight || styles.fontWeight || 'normal';
  const lineHeight = t?.lineHeight || 1.5;
  const letterSpacing = t?.letterSpacing || 0;
  const color = t?.color || element.color || '#1F2937';
  const textAlign = t?.textAlign || (styles.textAlign as React.CSSProperties['textAlign']) || 'left';
  const fontStyle = t?.fontStyle || styles.fontStyle || 'normal';
  const textDecoration = t?.textDecoration || 'none';
  const textCase = t?.textCase || 'none';

  const textTransform = textCase === 'uppercase' ? 'uppercase' : textCase === 'lowercase' ? 'lowercase' : textCase === 'capitalize' ? 'capitalize' : 'none';

  return (
    <div className="h-full w-full">
      {isEditing ? (
        <textarea
          ref={textRef}
          value={element.content}
          onChange={onTextChange}
          onBlur={onTextBlur}
          onKeyDown={onTextKeyDown}
          className="min-h-[24px] w-full resize-none bg-transparent outline-none"
          style={{
            fontFamily,
            fontSize,
            fontWeight: Number(fontWeight) || fontWeight,
            lineHeight,
            letterSpacing,
            color,
            textAlign,
            fontStyle,
            textDecoration,
            textTransform: textTransform as React.CSSProperties['textTransform'],
          }}
          placeholder="Type text..."
        />
      ) : (
        <div
          className="min-h-[24px] w-full whitespace-pre-wrap break-words"
          style={{
            fontFamily,
            fontSize,
            fontWeight: Number(fontWeight) || fontWeight,
            lineHeight,
            letterSpacing,
            color,
            textAlign,
            fontStyle,
            textDecoration,
            textTransform: textTransform as React.CSSProperties['textTransform'],
          }}
        >
          {element.content || <span className="opacity-30">Type text...</span>}
        </div>
      )}
    </div>
  );
}

/* ── Line ── */
function LineContent({ element, styles }: ElementContentProps) {
  const x2 = styles.x2 ?? element.width;
  const y2 = styles.y2 ?? 0;
  const showArrow = styles.arrowHead ?? false;
  const strokeCSS = getStrokeCSS(styles);

  return (
    <svg
      width={Math.abs(x2) + 20}
      height={Math.abs(y2) + 20}
      style={{ overflow: 'visible' }}
      className="pointer-events-none"
    >
      <line
        x1="0"
        y1="0"
        x2={x2}
        y2={y2}
        stroke={strokeCSS.border || element.color}
        strokeWidth={strokeCSS.borderWidth ? Number(strokeCSS.borderWidth) : 2}
        strokeDasharray={styles.lineStyle === 'dashed' ? '6,4' : styles.lineStyle === 'dotted' ? '2,4' : undefined}
      />
      {showArrow && (
        <polygon
          points={getArrowPoints(x2, y2, 12, Math.atan2(y2, x2))}
          fill={strokeCSS.border || element.color}
        />
      )}
      <circle cx="0" cy="0" r="4" fill="white" stroke={element.color} strokeWidth="2" className="pointer-events-auto cursor-crosshair" />
      <circle cx={x2} cy={y2} r="4" fill="white" stroke={element.color} strokeWidth="2" className="pointer-events-auto cursor-crosshair" />
    </svg>
  );
}

/* ── Connector ── */
function ConnectorContent({ element, styles }: ElementContentProps) {
  const x2 = styles.x2 ?? element.width;
  const y2 = styles.y2 ?? element.height;
  const showArrow = styles.arrowHead ?? true;
  const connStyle = styles.connectorStyle || 'curve';

  let d: string;
  if (connStyle === 'curve') {
    const cx = Math.abs(x2) / 2;
    d = `M 0 0 C ${cx} 0, ${cx} ${y2}, ${x2} ${y2}`;
  } else {
    d = `M 0 0 L ${x2} ${y2}`;
  }

  const midX = x2 / 2;
  const midY = y2 / 2;

  return (
    <svg
      width={Math.abs(x2) + 20}
      height={Math.abs(y2) + 20}
      style={{ overflow: 'visible' }}
      className="pointer-events-none"
    >
      <path
        d={d}
        fill="none"
        stroke={element.color}
        strokeWidth={2}
        strokeDasharray={styles.lineStyle === 'dashed' ? '6,4' : undefined}
      />
      {showArrow && (
        <polygon
          points={getArrowPoints(x2, y2, 12, Math.atan2(y2, x2))}
          fill={element.color}
        />
      )}
      {element.content && (
        <text
          x={midX}
          y={midY - 8}
          textAnchor="middle"
          className="fill-gray-600 text-xs"
          fontSize="12"
        >
          {element.content}
        </text>
      )}
      <circle cx="0" cy="0" r="4" fill="white" stroke={element.color} strokeWidth="2" className="pointer-events-auto cursor-crosshair" />
      <circle cx={x2} cy={y2} r="4" fill="white" stroke={element.color} strokeWidth="2" className="pointer-events-auto cursor-crosshair" />
    </svg>
  );
}

/* ── Image ── */
function ImageContent({ element, styles }: ElementContentProps) {
  const src = styles.src || '/placeholder.png';
  return (
    <img
      src={src}
      alt={element.content || 'Image'}
      className="h-full w-full rounded object-contain"
      draggable={false}
    />
  );
}

/* ── Frame (white container with name label, dashed border when not selected) ── */
function FrameContent({ element, styles }: ElementContentProps) {
  const frameClip = styles.frameClip ?? false;
  const frameDevice = styles.frameDevice || null;
  const cornerRadius = styles.cornerRadius;
  const borderRadius = cornerRadius
    ? `${cornerRadius.topLeft}px ${cornerRadius.topRight}px ${cornerRadius.bottomRight}px ${cornerRadius.bottomLeft}px`
    : '0px';

  return (
    <div className="relative h-full w-full">
      {/* Device frame indicator */}
      {frameDevice && (
        <div className="absolute -top-6 left-0 flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap">
          <span className="font-medium opacity-60">{frameDevice}</span>
        </div>
      )}
      {/* Frame name label at top */}
      <div
        className="absolute left-0 -top-6 max-w-full truncate text-[10px] font-medium text-muted-foreground/70"
        style={{ top: frameDevice ? -26 : -18 }}
      >
        {element.name || element.content || 'Frame'}
      </div>
      {/* Frame body */}
      <div
        className={cn(
          'h-full w-full bg-white',
          !element.locked ? 'border border-dashed border-gray-300' : 'border border-solid border-gray-200',
        )}
        style={{
          borderRadius,
          overflow: frameClip ? 'hidden' : undefined,
        }}
      />
    </div>
  );
}

/* ── Pen Path (SVG path from styles.pathData) ── */
function PenPathContent({ element, styles }: ElementContentProps) {
  const pathData = styles.pathData || '';
  const strokeCSS = getStrokeCSS(styles);

  if (!pathData) return null;

  return (
    <svg
      width={element.width}
      height={element.height}
      viewBox={`0 0 ${element.width} ${element.height}`}
      className="overflow-visible"
    >
      <path
        d={pathData}
        fill="none"
        stroke={strokeCSS.border || element.color}
        strokeWidth={strokeCSS.borderWidth ? Number(strokeCSS.borderWidth) : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════════════ */

function getStrokeCSS(styles: ElementStyles): Record<string, string> {
  const strokes = styles.strokes;
  if (!strokes || strokes.length === 0) {
    // Legacy fallback
    if (styles.borderWidth && styles.borderColor) {
      const borderStyle = styles.borderStyle === 'dashed' ? 'dashed' : styles.borderStyle === 'dotted' ? 'dotted' : 'solid';
      return {
        border: `${styles.borderWidth}px ${borderStyle} ${styles.borderColor}`,
        borderWidth: `${styles.borderWidth}`,
      };
    }
    return {};
  }
  const s = strokes[0];
  if (!s || s.width === 0) return {};
  const borderStyle = s.style === 'dashed' ? 'dashed' : s.style === 'dotted' ? 'dotted' : 'solid';
  return {
    border: `${s.width}px ${borderStyle} ${s.color}`,
    borderWidth: `${s.width}`,
  };
}

function getArrowPoints(tipX: number, tipY: number, size: number, angle: number): string {
  const a1 = angle + Math.PI * 0.85;
  const a2 = angle - Math.PI * 0.85;
  const p1x = tipX + Math.cos(a1) * size;
  const p1y = tipY + Math.sin(a1) * size;
  const p2x = tipX + Math.cos(a2) * size;
  const p2y = tipY + Math.sin(a2) * size;
  return `${tipX},${tipY} ${p1x},${p1y} ${p2x},${p2y}`;
}