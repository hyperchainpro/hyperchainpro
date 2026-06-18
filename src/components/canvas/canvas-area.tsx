'use client';

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { t, type Locale } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import { useCanvasStore } from '@/store/canvas-store';
import { usePresenceStore } from '@/store/presence-store';
import { GRID_SIZE, type BoardElement as BoardElementType } from '@/lib/types';
import BoardElementComponent from './board-element';
import Toolbar from './toolbar';
import Minimap from './minimap';

interface CanvasAreaProps {
  onCursorMove?: (x: number, y: number) => void;
}

export default function CanvasArea({ onCursorMove }: CanvasAreaProps) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const elements = useCanvasStore((s) => s.elements);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const activeTool = useCanvasStore((s) => s.activeTool);
  const panX = useCanvasStore((s) => s.panX);
  const panY = useCanvasStore((s) => s.panY);
  const zoom = useCanvasStore((s) => s.zoom);
  const selectionBox = useCanvasStore((s) => s.selectionBox);
  const isDrawingSelection = useCanvasStore((s) => s.isDrawingSelection);
  const spacePressed = useCanvasStore((s) => s.spacePressed);
  const snapToGrid = useCanvasStore((s) => s.snapToGrid);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const dragStartRef = useRef<{ id: string; startX: number; startY: number; elX: number; elY: number; moved: boolean } | null>(null);
  const selectionStartRef = useRef<{ startX: number; startY: number } | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isDragOver, setIsDragOver] = useState(false);
  const cursorThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sort elements by z-index
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  // ── Convert screen coords to canvas coords ──
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (screenX - rect.left - panX) / zoom,
        y: (screenY - rect.top - panY) / zoom,
      };
    },
    [panX, panY, zoom],
  );

  // ── Pointer down on canvas background ──
  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Middle mouse or space+left => pan
      if (e.button === 1 || (e.button === 0 && spacePressed) || activeTool === 'HAND') {
        e.preventDefault();
        isPanningRef.current = true;
        panStartRef.current = { x: e.clientX, y: e.clientY, panX, panY };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        return;
      }

      // Left click on empty space
      if (e.button === 0) {
        const canvasPos = screenToCanvas(e.clientX, e.clientY);

        // Drawing a new shape
        if (activeTool !== 'SELECT' && activeTool !== 'HAND') {
          if (activeTool === 'IMAGE') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (ev) => {
              const file = (ev.target as HTMLInputElement).files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (re) => {
                  useCanvasStore.getState().addElement('IMAGE', canvasPos.x, canvasPos.y, {
                    styles: { src: re.target?.result as string },
                  });
                };
                reader.readAsDataURL(file);
              }
            };
            input.click();
          } else {
            useCanvasStore.getState().addElement(activeTool, canvasPos.x, canvasPos.y);
          }
          return;
        }

        // Rubber band selection
        useCanvasStore.getState().deselectAll();
        selectionStartRef.current = { startX: e.clientX, startY: e.clientY };
        useCanvasStore.getState().setIsDrawingSelection(true);
        useCanvasStore.getState().setSelectionBox({
          startX: e.clientX,
          startY: e.clientY,
          endX: e.clientX,
          endY: e.clientY,
        });
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }
    },
    [activeTool, spacePressed, panX, panY, screenToCanvas],
  );

  // ── Pointer move ──
  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      setCursorPos(canvasPos);

      // Throttled cursor broadcasting for collaboration
      if (onCursorMove && !cursorThrottleRef.current) {
        onCursorMove(canvasPos.x, canvasPos.y);
        cursorThrottleRef.current = setTimeout(() => {
          cursorThrottleRef.current = null;
        }, 50); // ~20 updates per second
      }

      // Panning
      if (isPanningRef.current) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        useCanvasStore.getState().setPan(panStartRef.current.panX + dx, panStartRef.current.panY + dy);
        return;
      }

      // Rubber band selection
      if (isDrawingSelection && selectionStartRef.current) {
        useCanvasStore.getState().setSelectionBox({
          startX: selectionStartRef.current.startX,
          startY: selectionStartRef.current.startY,
          endX: e.clientX,
          endY: e.clientY,
        });
        return;
      }

      // Dragging an element
      if (dragStartRef.current && !dragStartRef.current.moved) {
        const dx = Math.abs(e.clientX - dragStartRef.current.startX);
        const dy = Math.abs(e.clientY - dragStartRef.current.startY);
        if (dx > 3 || dy > 3) {
          dragStartRef.current.moved = true;
        }
      }
      if (dragStartRef.current && dragStartRef.current.moved) {
        const dx = (e.clientX - dragStartRef.current.startX) / zoom;
        const dy = (e.clientY - dragStartRef.current.startY) / zoom;
        useCanvasStore.getState().moveElement(
          dragStartRef.current.id,
          dragStartRef.current.elX + dx,
          dragStartRef.current.elY + dy,
        );
      }
    },
    [isDrawingSelection, screenToCanvas, zoom, onCursorMove],
  );

  // ── Pointer up ──
  const handleCanvasPointerUp = useCallback(
    (e: React.PointerEvent) => {
      // End panning
      if (isPanningRef.current) {
        isPanningRef.current = false;
        return;
      }

      // End rubber band selection
      if (isDrawingSelection && selectionBox) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect && selectionBox) {
          const x1 = Math.min(selectionBox.startX, selectionBox.endX) - rect.left;
          const y1 = Math.min(selectionBox.startY, selectionBox.endY) - rect.top;
          const x2 = Math.max(selectionBox.startX, selectionBox.endX) - rect.left;
          const y2 = Math.max(selectionBox.startY, selectionBox.endY) - rect.top;

          const canvasX1 = (x1 - panX) / zoom;
          const canvasY1 = (y1 - panY) / zoom;
          const canvasX2 = (x2 - panX) / zoom;
          const canvasY2 = (y2 - panY) / zoom;

          const intersecting = sortedElements.filter((el) => {
            if (el.type === 'LINE' || el.type === 'CONNECTOR') return false;
            return (
              el.x < canvasX2 &&
              el.x + el.width > canvasX1 &&
              el.y < canvasY2 &&
              el.y + el.height > canvasY1
            );
          });

          if (intersecting.length > 0) {
            useCanvasStore.getState().deselectAll();
            intersecting.forEach((el) => useCanvasStore.getState().selectElement(el.id, true));
          }
        }
        useCanvasStore.getState().setSelectionBox(null);
        useCanvasStore.getState().setIsDrawingSelection(false);
        selectionStartRef.current = null;
        return;
      }

      // End element drag
      if (dragStartRef.current) {
        if (dragStartRef.current.moved) {
          useCanvasStore.getState().pushHistory();
        }
        dragStartRef.current = null;
      }
    },
    [isDrawingSelection, selectionBox, panX, panY, zoom, sortedElements],
  );

  // ── Element pointer down (start drag or select) ──
  const handleElementPointerDown = useCallback(
    (e: React.PointerEvent, id: string) => {
      if (activeTool !== 'SELECT') return;
      e.stopPropagation();

      const el = elements.find((el) => el.id === id);
      if (!el || el.locked) {
        if (el?.locked) useCanvasStore.getState().selectElement(id, e.shiftKey);
        return;
      }

      // Select
      useCanvasStore.getState().selectElement(id, e.shiftKey);

      // Start drag
      dragStartRef.current = {
        id,
        startX: e.clientX,
        startY: e.clientY,
        elX: el.x,
        elY: el.y,
        moved: false,
      };

      // Capture pointer on container
      containerRef.current?.setPointerCapture(e.pointerId);
    },
    [activeTool, elements],
  );

  // ── Double click on empty space to create text ──
  const handleCanvasDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool !== 'SELECT') return;
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      const el = useCanvasStore.getState().addElement('TEXT', canvasPos.x, canvasPos.y, {
        width: 200,
        height: 40,
      });
      // Trigger edit mode on the element
      setTimeout(() => {
        const textarea = document.querySelector(`[data-element-id="${el.id}"] textarea`);
        if (textarea) (textarea as HTMLTextAreaElement).focus();
      }, 100);
    },
    [activeTool, screenToCanvas],
  );

  // ── Mouse wheel for zoom ──
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const direction = e.deltaY > 0 ? -1 : 1;
        const factor = 1 + direction * 0.08;
        const newZoom = Math.min(5, Math.max(0.1, zoom * factor));

        // Zoom toward cursor
        const newPanX = mouseX - (mouseX - panX) * (newZoom / zoom);
        const newPanY = mouseY - (mouseY - panY) * (newZoom / zoom);

        useCanvasStore.getState().setZoom(newZoom);
        useCanvasStore.getState().setPan(newPanX, newPanY);
      } else {
        // Scroll to pan
        e.preventDefault();
        useCanvasStore.getState().setPan(panX - e.deltaX, panY - e.deltaY);
      }
    },
    [zoom, panX, panY],
  );

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when editing text
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.isContentEditable) {
        if (e.key === 'Escape') target.blur();
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        useCanvasStore.getState().setSpacePressed(true);
        return;
      }

      // Ctrl/Cmd shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              useCanvasStore.getState().redo();
            } else {
              e.preventDefault();
              useCanvasStore.getState().undo();
            }
            return;
          case 'y':
            e.preventDefault();
            useCanvasStore.getState().redo();
            return;
          case 'c':
            e.preventDefault();
            useCanvasStore.getState().copySelected();
            return;
          case 'v':
            e.preventDefault();
            useCanvasStore.getState().pasteClipboard();
            return;
          case 'a':
            e.preventDefault();
            useCanvasStore.getState().selectAll();
            return;
          case 'g':
            e.preventDefault();
            if (e.shiftKey) {
              // Ungroup
              const { elements: els, selectedIds: sIds } = useCanvasStore.getState();
              const selectedEls = els.filter((el) => sIds.includes(el.id));
              const groups = new Set(selectedEls.map((el) => el.groupId).filter(Boolean));
              groups.forEach((g) => useCanvasStore.getState().ungroupElements(g as string));
            } else {
              // Group
              const { selectedIds: sIds } = useCanvasStore.getState();
              if (sIds.length >= 2) {
                useCanvasStore.getState().groupElements(sIds);
              }
            }
            return;
        }
      }

      // Single key shortcuts
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          useCanvasStore.getState().deleteElements();
          return;
        case 'v':
        case 'V':
          if (!e.ctrlKey && !e.metaKey) useCanvasStore.getState().setTool('SELECT');
          return;
        case 'h':
        case 'H':
          useCanvasStore.getState().setTool('HAND');
          return;
        case 's':
        case 'S':
          if (!e.ctrlKey && !e.metaKey) useCanvasStore.getState().setTool('STICKY_NOTE');
          return;
        case 'r':
        case 'R':
          if (!e.ctrlKey && !e.metaKey) useCanvasStore.getState().setTool('RECTANGLE');
          return;
        case 'c':
        case 'C':
          if (!e.ctrlKey && !e.metaKey) useCanvasStore.getState().setTool('CIRCLE');
          return;
        case 'l':
        case 'L':
          useCanvasStore.getState().setTool('LINE');
          return;
        case 't':
        case 'T':
          useCanvasStore.getState().setTool('TEXT');
          return;
        case 'i':
        case 'I':
          if (!e.ctrlKey && !e.metaKey) useCanvasStore.getState().setTool('IMAGE');
          return;
        case 'Escape':
          useCanvasStore.getState().deselectAll();
          useCanvasStore.getState().setTool('SELECT');
          return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        useCanvasStore.getState().setSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // ── File drop ──
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      const canvasPos = screenToCanvas(e.clientX, e.clientY);

      files.forEach((file) => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          useCanvasStore.getState().addElement('IMAGE', canvasPos.x, canvasPos.y, {
            styles: { src: ev.target?.result as string },
            content: file.name,
          });
        };
        reader.readAsDataURL(file);
      });
    },
    [screenToCanvas],
  );

  // ── Compute grid background ──
  const gridBg = {
    backgroundImage: `
      linear-gradient(to right, hsl(var(--border) / 0.3) 1px, transparent 1px),
      linear-gradient(to bottom, hsl(var(--border) / 0.3) 1px, transparent 1px)
    `,
    backgroundSize: `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`,
    backgroundPosition: `${panX}px ${panY}px`,
  };

  // ── Compute selection box in screen coords ──
  const selectionBoxStyle = selectionBox
    ? {
        left: Math.min(selectionBox.startX, selectionBox.endX),
        top: Math.min(selectionBox.startY, selectionBox.endY),
        width: Math.abs(selectionBox.endX - selectionBox.startX),
        height: Math.abs(selectionBox.endY - selectionBox.startY),
      }
    : null;

  // Get cursor style (derived from state, not refs)
  const canvasCursor = spacePressed || activeTool === 'HAND'
    ? 'grab'
    : activeTool === 'TEXT'
      ? 'text'
      : 'default';

  // Connectors SVG layer
  const connectorElements = sortedElements.filter((el) => el.type === 'CONNECTOR');

  // Presence users for collaboration cursors
  const presenceUsers = usePresenceStore((s) => s.users);

  return (
    <div className="relative flex h-screen w-screen flex-1 overflow-hidden bg-background">
      {/* Toolbar */}
      <Toolbar />

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden"
        style={{
          cursor: canvasCursor,
          ...gridBg,
        }}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onDoubleClick={handleCanvasDoubleClick}
        onWheel={handleWheel}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Infinite canvas transform layer */}
        <div
          className="absolute origin-top-left"
          style={{
            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
            width: 1,
            height: 1,
          }}
        >
          {/* SVG Layer for connectors */}
          <svg
            className="pointer-events-none absolute top-0 left-0"
            style={{ overflow: 'visible', zIndex: 0 }}
          >
            {connectorElements.map((el) => {
              const s = el.styles;
              const x2 = s.x2 ?? el.width;
              const y2 = s.y2 ?? el.height;
              const showArrow = s.arrowHead ?? true;
              const style = s.connectorStyle || 'curve';

              let d: string;
              if (style === 'curve') {
                const cx = Math.abs(x2) / 2;
                d = `M ${el.x} ${el.y} C ${el.x + cx} ${el.y}, ${el.x + cx} ${el.y + y2}, ${el.x + x2} ${el.y + y2}`;
              } else {
                d = `M ${el.x} ${el.y} L ${el.x + x2} ${el.y + y2}`;
              }

              const midX = el.x + x2 / 2;
              const midY = el.y + y2 / 2;
              const angle = Math.atan2(y2, x2);

              return (
                <g key={el.id}>
                  <path
                    d={d}
                    fill="none"
                    stroke={el.color}
                    strokeWidth={2 / zoom}
                    strokeDasharray={s.lineStyle === 'dashed' ? '6,4' : undefined}
                  />
                  {showArrow && (
                    <polygon
                      points={getArrowPoints(el.x + x2, el.y + y2, 12 / zoom, angle)}
                      fill={el.color}
                    />
                  )}
                  {el.content && (
                    <text
                      x={midX}
                      y={midY - 8 / zoom}
                      textAnchor="middle"
                      className="fill-gray-600"
                      style={{ fontSize: `${12 / zoom}px` }}
                    >
                      {el.content}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Board Elements */}
          {sortedElements
            .filter((el) => el.type !== 'CONNECTOR')
            .map((el) => (
              <div key={el.id} data-element-id={el.id}>
                <BoardElementComponent
                  element={el}
                  isSelected={selectedIds.includes(el.id)}
                  zoom={zoom}
                  onPointerDown={handleElementPointerDown}
                />
              </div>
            ))}

          {/* Remote User Cursors (collaboration) */}
          {presenceUsers
            .filter((u) => u.cursor)
            .map((user) => {
              const cursor = user.cursor!;
              return (
                <div
                  key={user.id}
                  className="pointer-events-none absolute z-[9990] transition-transform duration-75"
                  style={{
                    left: cursor.x,
                    top: cursor.y,
                  }}
                >
                  {/* Cursor SVG */}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    style={{ transform: 'translate(-2px, -2px)' }}
                  >
                    <path
                      d="M3 1L7 18L10 10L18 7L3 1Z"
                      fill={user.color}
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {/* Name label */}
                  <div
                    className="mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium leading-none text-white whitespace-nowrap shadow-sm"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Selection Box (screen coordinates) */}
        <AnimatePresence>
          {selectionBoxStyle && isDrawingSelection && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute z-[9999] rounded-sm border-2 border-blue-500/60 bg-blue-500/10"
              style={selectionBoxStyle}
            />
          )}
        </AnimatePresence>

        {/* File Drop Overlay */}
        <AnimatePresence>
          {isDragOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[9998] flex items-center justify-center bg-background/80 backdrop-blur-sm"
            >
              <div className="rounded-2xl border-2 border-dashed border-primary/50 bg-card/80 px-12 py-8 text-center">
                <p className="text-lg font-medium text-primary">{t('canvas.dropImages', locale)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t('canvas.supportedFormats', locale)}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Status Bar */}
        <div className="absolute right-3 bottom-3 z-50 flex items-center gap-3 rounded-lg border bg-card/90 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur-sm">
          <span>
            X: <span className="font-mono text-foreground">{Math.round(cursorPos.x)}</span>
          </span>
          <span>
            Y: <span className="font-mono text-foreground">{Math.round(cursorPos.y)}</span>
          </span>
          <span className="text-border">|</span>
          <span>
            {Math.round(zoom * 100)}%
          </span>
          {snapToGrid && (
            <>
              <span className="text-border">|</span>
              <span className="text-emerald-600">{t('canvas.gridOn', locale)}</span>
            </>
          )}
        </div>

        {/* Minimap */}
        <Minimap />
      </div>
    </div>
  );
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