'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t, type Locale } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import { useCanvasStore } from '@/store/canvas-store';
import type { BoardElement as BoardElementType, ElementStyles } from '@/lib/types';

interface BoardElementProps {
  element: BoardElementType;
  isSelected: boolean;
  zoom: number;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
}

type ResizeHandle =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'right'
  | 'bottom-right'
  | 'bottom'
  | 'bottom-left'
  | 'left';

const HANDLE_SIZE = 8;

const HANDLE_POSITIONS: Record<ResizeHandle, { x: string; y: string; cursor: string }> = {
  'top-left': { x: 'left-0', y: 'top-0', cursor: 'nwse-resize' },
  top: { x: 'left-1/2 -translate-x-1/2', y: 'top-0', cursor: 'ns-resize' },
  'top-right': { x: 'right-0', y: 'top-0', cursor: 'nesw-resize' },
  right: { x: 'right-0', y: 'top-1/2 -translate-y-1/2', cursor: 'ew-resize' },
  'bottom-right': { x: 'right-0', y: 'bottom-0', cursor: 'nwse-resize' },
  bottom: { x: 'left-1/2 -translate-x-1/2', y: 'bottom-0', cursor: 'ns-resize' },
  'bottom-left': { x: 'left-0', y: 'bottom-0', cursor: 'nesw-resize' },
  left: { x: 'left-0', y: 'top-1/2 -translate-y-1/2', cursor: 'ew-resize' },
};

const ROTATION_HANDLE_OFFSET = 30;

export default function BoardElement({ element, isSelected, zoom, onPointerDown }: BoardElementProps) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const store = useCanvasStore();
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const canEdit = !element.locked;
  const styles = element.styles;

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!canEdit) return;
      if (element.type === 'STICKY_NOTE' || element.type === 'RECTANGLE' || element.type === 'CIRCLE' || element.type === 'TEXT') {
        setIsEditing(true);
        setTimeout(() => textRef.current?.focus(), 0);
      }
    },
    [canEdit, element.type],
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      store.updateElement(element.id, { content: e.target.value });
    },
    [store, element.id],
  );

  const handleTextBlur = useCallback(() => {
    setIsEditing(false);
    store.pushHistory();
  }, [store]);

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

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent, handle: ResizeHandle) => {
      e.stopPropagation();
      e.preventDefault();
      if (!canEdit) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const origX = element.x;
      const origY = element.y;
      const origW = element.width;
      const origH = element.height;

      const onMove = (ev: PointerEvent) => {
        const dx = (ev.clientX - startX) / zoom;
        const dy = (ev.clientY - startY) / zoom;

        let newX = origX;
        let newY = origY;
        let newW = origW;
        let newH = origH;

        if (handle.includes('right')) newW = origW + dx;
        if (handle.includes('left')) {
          newX = origX + dx;
          newW = origW - dx;
        }
        if (handle.includes('bottom')) newH = origH + dy;
        if (handle.includes('top')) {
          newY = origY + dy;
          newH = origH - dy;
        }

        if (newW < 20) {
          if (handle.includes('left')) newX = origX + origW - 20;
          newW = 20;
        }
        if (newH < 20) {
          if (handle.includes('top')) newY = origY + origH - 20;
          newH = 20;
        }

        store.resizeElement(element.id, newX, newY, newW, newH);
      };

      const onUp = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.body.style.cursor = '';
        store.pushHistory();
      };

      document.body.style.cursor = HANDLE_POSITIONS[handle].cursor;
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    },
    [canEdit, element.id, element.x, element.y, element.width, element.height, zoom, store],
  );

  const handleRotationPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!canEdit) return;

      const elRect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
      const centerX = elRect.left + elRect.width / 2;
      const centerY = elRect.top + elRect.height / 2;

      const onMove = (ev: PointerEvent) => {
        const angle = Math.atan2(ev.clientY - centerY, ev.clientX - centerX) * (180 / Math.PI) + 90;
        store.rotateElement(element.id, Math.round(angle));
      };

      const onUp = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.body.style.cursor = '';
        store.pushHistory();
      };

      document.body.style.cursor = 'crosshair';
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    },
    [canEdit, element.id, store],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      store.deleteElements([element.id]);
    },
    [store, element.id],
  );

  const showResizeHandles =
    isSelected && canEdit && (element.type === 'RECTANGLE' || element.type === 'CIRCLE');
  const showStickyResize = isSelected && canEdit && element.type === 'STICKY_NOTE';
  const showRotationHandles = isSelected && canEdit && (element.type === 'RECTANGLE' || element.type === 'CIRCLE');

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
      }}
      onPointerDown={(e) => {
        if (e.button === 0) onPointerDown(e, element.id);
      }}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Element Content */}
      <ElementContent
        element={element}
        isEditing={isEditing}
        textRef={textRef}
        onTextChange={handleTextChange}
        onTextBlur={handleTextBlur}
        onTextKeyDown={handleTextKeyDown}
      />

      {/* Selection Outline */}
      {isSelected && (
        <motion.div
          initial={false}
          className={cn(
            'pointer-events-none absolute inset-0 rounded-sm',
            'ring-2 ring-blue-500/80 ring-offset-0',
          )}
          style={{ zIndex: 100 }}
        />
      )}

      {/* Delete Button */}
      {isHovered && canEdit && !isEditing && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute -right-3 -top-3 z-[200] flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={handleDelete}
        >
          <X className="h-3 w-3" />
        </motion.button>
      )}

      {/* Lock Icon */}
      {element.locked && (
        <div className="absolute -right-2 -top-2 z-[200] flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <GripVertical className="h-3 w-3" />
        </div>
      )}

      {/* Sticky Note Resize Handle */}
      {showStickyResize && (
        <div
          className="absolute bottom-0 right-0 z-[150] cursor-nwse-resize"
          style={{ width: 16, height: 16 }}
          onPointerDown={(e) => handleResizePointerDown(e, 'bottom-right')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" className="text-gray-400">
            <path d="M14 2L14 14L2 14" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M14 6L6 14" stroke="currentColor" strokeWidth="1" fill="none" />
            <path d="M14 10L10 14" stroke="currentColor" strokeWidth="1" fill="none" />
          </svg>
        </div>
      )}

      {/* Rectangle / Circle Resize Handles */}
      {showResizeHandles &&
        (Object.keys(HANDLE_POSITIONS) as ResizeHandle[]).map((handle) => (
          <div
            key={handle}
            className={cn(
              'absolute z-[150]',
              HANDLE_POSITIONS[handle].x,
              HANDLE_POSITIONS[handle].y,
            )}
            style={{
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              cursor: HANDLE_POSITIONS[handle].cursor,
              transform: HANDLE_POSITIONS[handle].x.includes('translate')
                ? undefined
                : 'translate(-50%, -50%)',
            }}
            onPointerDown={(e) => handleResizePointerDown(e, handle)}
          >
            <div className="h-full w-full rounded-sm border border-blue-500 bg-white shadow-sm" />
          </div>
        ))}

      {/* Rotation Handles */}
      {showRotationHandles && (
        <>
          {/* Top rotation handle */}
          <div
            className="absolute left-1/2 z-[160] cursor-crosshair"
            style={{ top: -ROTATION_HANDLE_OFFSET, transform: 'translateX(-50%)' }}
            onPointerDown={handleRotationPointerDown}
          >
            <div className="flex h-3 w-3 items-center justify-center rounded-full border border-blue-500 bg-white shadow-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            </div>
            <div className="mx-auto h-5 w-px bg-blue-500/40" />
          </div>
          {/* Right rotation handle */}
          <div
            className="absolute top-1/2 z-[160] cursor-crosshair"
            style={{ right: -ROTATION_HANDLE_OFFSET, transform: 'translateY(-50%)' }}
            onPointerDown={handleRotationPointerDown}
          >
            <div className="flex h-3 w-3 items-center justify-center rounded-full border border-blue-500 bg-white shadow-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            </div>
            <div className="my-auto h-px w-5 bg-blue-500/40" />
          </div>
          {/* Bottom rotation handle */}
          <div
            className="absolute left-1/2 z-[160] cursor-crosshair"
            style={{ bottom: -ROTATION_HANDLE_OFFSET, transform: 'translateX(-50%)' }}
            onPointerDown={handleRotationPointerDown}
          >
            <div className="h-5 w-px bg-blue-500/40" />
            <div className="flex h-3 w-3 items-center justify-center rounded-full border border-blue-500 bg-white shadow-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            </div>
          </div>
          {/* Left rotation handle */}
          <div
            className="absolute top-1/2 z-[160] cursor-crosshair"
            style={{ left: -ROTATION_HANDLE_OFFSET, transform: 'translateY(-50%)' }}
            onPointerDown={handleRotationPointerDown}
          >
            <div className="my-auto h-px w-5 bg-blue-500/40" />
            <div className="flex h-3 w-3 items-center justify-center rounded-full border border-blue-500 bg-white shadow-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Sub-components for each element type ── */

interface ElementContentProps {
  element: BoardElementType;
  isEditing: boolean;
  textRef: React.RefObject<HTMLTextAreaElement | null>;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onTextBlur: () => void;
  onTextKeyDown: (e: React.KeyboardEvent) => void;
}

function ElementContent({ element, isEditing, textRef, onTextChange, onTextBlur, onTextKeyDown }: ElementContentProps) {
  switch (element.type) {
    case 'STICKY_NOTE':
      return <StickyNoteContent element={element} isEditing={isEditing} textRef={textRef} onTextChange={onTextChange} onTextBlur={onTextBlur} onTextKeyDown={onTextKeyDown} />;
    case 'RECTANGLE':
      return <RectangleContent element={element} isEditing={isEditing} textRef={textRef} onTextChange={onTextChange} onTextBlur={onTextBlur} onTextKeyDown={onTextKeyDown} />;
    case 'CIRCLE':
      return <CircleContent element={element} isEditing={isEditing} textRef={textRef} onTextChange={onTextChange} onTextBlur={onTextBlur} onTextKeyDown={onTextKeyDown} />;
    case 'LINE':
      return <LineContent element={element} />;
    case 'CONNECTOR':
      return <ConnectorContent element={element} />;
    case 'TEXT':
      return <TextContent element={element} isEditing={isEditing} textRef={textRef} onTextChange={onTextChange} onTextBlur={onTextBlur} onTextKeyDown={onTextKeyDown} />;
    case 'IMAGE':
      return <ImageContent element={element} />;
    default:
      return null;
  }
}

/* ── Sticky Note ── */
function StickyNoteContent({ element, isEditing, textRef, onTextChange, onTextBlur, onTextKeyDown }: ElementContentProps & { element: BoardElementType }) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
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
          style={{ color: '#1a1a2e', fontSize: element.styles.fontSize || 14 }}
          placeholder={t('canvas.typeSomething', locale)}
        />
      ) : (
        <div
          className="h-full min-h-[80px] w-full overflow-hidden whitespace-pre-wrap break-words text-sm leading-relaxed"
          style={{ color: '#1a1a2e', fontSize: element.styles.fontSize || 14 }}
        >
          {element.content || <span className="opacity-40">{t('canvas.typeSomething', locale)}</span>}
        </div>
      )}
    </div>
  );
}

/* ── Rectangle ── */
function RectangleContent({ element, isEditing, textRef, onTextChange, onTextBlur, onTextKeyDown }: ElementContentProps & { element: BoardElementType }) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const s = element.styles;
  const borderStyle = s.lineStyle === 'dashed' ? 'dashed' : 'solid';
  const fillOpacity = s.fillOpacity ?? 1;

  return (
    <div
      className="relative flex h-full w-full items-center justify-center"
      style={{
        border: `${s.borderWidth || 2}px ${borderStyle} ${s.borderColor || '#374151'}`,
        backgroundColor: element.color === '#ffffff' ? 'white' : element.color,
        opacity: fillOpacity,
        borderRadius: 4,
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
          style={{ fontSize: s.fontSize || 16 }}
          placeholder={t('canvas.addText', locale)}
        />
      ) : (
        <div
          className="w-full overflow-hidden p-2 text-center whitespace-pre-wrap break-words"
          style={{ fontSize: s.fontSize || 16 }}
        >
          {element.content || <span className="opacity-40">{t('canvas.addText', locale)}</span>}
        </div>
      )}
    </div>
  );
}

/* ── Circle / Ellipse ── */
function CircleContent({ element, isEditing, textRef, onTextChange, onTextBlur, onTextKeyDown }: ElementContentProps & { element: BoardElementType }) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const s = element.styles;
  const borderStyle = s.lineStyle === 'dashed' ? 'dashed' : 'solid';
  const fillOpacity = s.fillOpacity ?? 1;

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        border: `${s.borderWidth || 2}px ${borderStyle} ${s.borderColor || '#374151'}`,
        backgroundColor: element.color === '#ffffff' ? 'white' : element.color,
        opacity: fillOpacity,
        borderRadius: '50%',
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
          style={{ fontSize: s.fontSize || 16 }}
          placeholder={t('canvas.addText', locale)}
        />
      ) : (
        <div
          className="w-full overflow-hidden p-2 text-center whitespace-pre-wrap break-words"
          style={{ fontSize: s.fontSize || 16 }}
        >
          {element.content || <span className="opacity-40">{t('canvas.addText', locale)}</span>}
        </div>
      )}
    </div>
  );
}

/* ── Line ── */
function LineContent({ element }: { element: BoardElementType }) {
  const s = element.styles;
  const x2 = s.x2 ?? element.width;
  const y2 = s.y2 ?? 0;
  const showArrow = s.arrowHead ?? false;

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
        stroke={element.color}
        strokeWidth={2}
        strokeDasharray={s.lineStyle === 'dashed' ? '6,4' : undefined}
      />
      {showArrow && (
        <polygon
          points={getArrowPoints(x2, y2, 12, Math.atan2(y2, x2))}
          fill={element.color}
        />
      )}
      {/* Drag endpoints */}
      <circle cx="0" cy="0" r="4" fill="white" stroke={element.color} strokeWidth="2" className="pointer-events-auto cursor-crosshair" />
      <circle cx={x2} cy={y2} r="4" fill="white" stroke={element.color} strokeWidth="2" className="pointer-events-auto cursor-crosshair" />
    </svg>
  );
}

/* ── Connector ── */
function ConnectorContent({ element }: { element: BoardElementType }) {
  const s = element.styles;
  const x2 = s.x2 ?? element.width;
  const y2 = s.y2 ?? element.height;
  const showArrow = s.arrowHead ?? true;
  const style = s.connectorStyle || 'curve';

  let d: string;
  if (style === 'curve') {
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
        strokeDasharray={s.lineStyle === 'dashed' ? '6,4' : undefined}
      />
      {showArrow && (
        <polygon
          points={getArrowPoints(x2, y2, 12, Math.atan2(y2 - 0, x2 - 0))}
          fill={element.color}
        />
      )}
      {/* Label */}
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
      {/* Endpoints */}
      <circle cx="0" cy="0" r="4" fill="white" stroke={element.color} strokeWidth="2" className="pointer-events-auto cursor-crosshair" />
      <circle cx={x2} cy={y2} r="4" fill="white" stroke={element.color} strokeWidth="2" className="pointer-events-auto cursor-crosshair" />
    </svg>
  );
}

/* ── Text ── */
function TextContent({ element, isEditing, textRef, onTextChange, onTextBlur, onTextKeyDown }: ElementContentProps & { element: BoardElementType }) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const s = element.styles;

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
            fontSize: s.fontSize || 16,
            fontWeight: s.fontWeight || 'normal',
            fontStyle: s.fontStyle || 'normal',
            textAlign: s.textAlign || 'left',
            color: element.color,
            lineHeight: 1.5,
          }}
          placeholder={t('canvas.typeText', locale)}
        />
      ) : (
        <div
          className="min-h-[24px] w-full whitespace-pre-wrap break-words"
          style={{
            fontSize: s.fontSize || 16,
            fontWeight: s.fontWeight || 'normal',
            fontStyle: s.fontStyle || 'normal',
            textAlign: s.textAlign || 'left',
            color: element.color,
            lineHeight: 1.5,
          }}
        >
          {element.content || <span className="opacity-30">{t('canvas.typeText', locale)}</span>}
        </div>
      )}
    </div>
  );
}

/* ── Image ── */
function ImageContent({ element }: { element: BoardElementType }) {
  const src = element.styles.src || '/placeholder.png';

  return (
    <img
      src={src}
      alt={element.content || 'Image'}
      className="h-full w-full rounded object-contain"
      draggable={false}
    />
  );
}

/* ── Helper ── */
function getArrowPoints(tipX: number, tipY: number, size: number, angle: number): string {
  const a1 = angle + Math.PI * 0.85;
  const a2 = angle - Math.PI * 0.85;
  const p1x = tipX + Math.cos(a1) * size;
  const p1y = tipY + Math.sin(a1) * size;
  const p2x = tipX + Math.cos(a2) * size;
  const p2y = tipY + Math.sin(a2) * size;
  return `${tipX},${tipY} ${p1x},${p1y} ${p2x},${p2y}`;
}