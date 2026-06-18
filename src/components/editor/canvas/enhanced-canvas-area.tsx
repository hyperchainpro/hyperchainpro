'use client';

import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, X, ZoomIn, ZoomOut, Maximize2, Puzzle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t, type Locale } from '@/lib/i18n';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuthStore } from '@/store/auth-store';
import { useCanvasStore } from '@/store/canvas-store';
import { usePrototypeStore } from '@/store/prototype-store';
import { usePresenceStore } from '@/store/presence-store';
import { useAppStore } from '@/store/app-store';
import {
  GRID_SIZE,
  SNAP_THRESHOLD,
  type BoardElement as BoardElementType,
  type ElementType,
  type CanvasTool,
  type AlignmentGuide,
} from '@/lib/types';
import { computeAlignmentGuides, snapToGuides } from '@/lib/canvas-utils';
import EnhancedBoardElement from './enhanced-board-element';
import Rulers from './rulers';
import AlignmentGuidesComponent from './alignment-guides';
import PrototypeFlowOverlay from './prototype-flow-overlay';
import Minimap from '@/components/canvas/minimap';

const RULER_SIZE = 24;

interface EnhancedCanvasAreaProps {
  onCursorMove?: (x: number, y: number) => void;
}

// Tools that support drag-to-draw
const DRAW_TOOLS: CanvasTool[] = ['RECTANGLE', 'ELLIPSE', 'FRAME', 'STAR', 'POLYGON', 'LINE'];

// Mapping from tool to element type
const TOOL_TO_ELEMENT: Record<string, ElementType> = {
  RECTANGLE: 'RECTANGLE',
  ELLIPSE: 'ELLIPSE',
  FRAME: 'FRAME',
  STAR: 'STAR',
  POLYGON: 'POLYGON',
  LINE: 'LINE',
  CIRCLE: 'CIRCLE',
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  STICKY_NOTE: 'STICKY_NOTE',
  CONNECTOR: 'CONNECTOR',
  PEN_TOOL: 'PEN_PATH',
};

export default function EnhancedCanvasArea({ onCursorMove }: EnhancedCanvasAreaProps) {
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

  // Panning refs
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Dragging element refs
  const dragStartRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    elX: number;
    elY: number;
    moved: boolean;
  } | null>(null);

  // Selection box refs
  const selectionStartRef = useRef<{ startX: number; startY: number } | null>(null);

  // Drawing refs (local state for drag-to-draw)
  const isDrawingRef = useRef(false);
  const drawStartRef = useRef<{ x: number; y: number } | null>(null);
  const drawingElementIdRef = useRef<string | null>(null);
  const shiftHeldRef = useRef(false);

  // Resize refs
  const resizeHandleRef = useRef<string | null>(null);
  const resizeStartRef = useRef<{
    x: number;
    y: number;
    elX: number;
    elY: number;
    elW: number;
    elH: number;
  } | null>(null);

  // Rotation ref
  const isRotatingRef = useRef(false);
  const rotatingElementIdRef = useRef<string | null>(null);

  // Alignment guides state
  const [activeGuides, setActiveGuides] = useState<AlignmentGuide[]>([]);

  const cursorThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cursor and UI state
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isDragOver, setIsDragOver] = useState(false);

  const editorMode = useAppStore((s) => s.editorMode);
  const isPlaying = usePrototypeStore((s) => s.isPlaying);
  const currentPlayFrameId = usePrototypeStore((s) => s.currentPlayFrameId);
  const stopPlayback = usePrototypeStore((s) => s.stopPlayback);
  const goBack = usePrototypeStore((s) => s.goBack);
  const getInteractionsForFrame = usePrototypeStore((s) => s.getInteractionsForFrame);
  const navigateToFrame = usePrototypeStore((s) => s.navigateToFrame);

  // Sort elements by z-index
  const sortedElements = useMemo(
    () => [...elements].sort((a, b) => a.zIndex - b.zIndex),
    [elements],
  );

  // Filter out hidden elements for rendering
  const visibleElements = useMemo(
    () => sortedElements.filter((el) => el.visible !== false),
    [sortedElements],
  );

  // ── Convert screen coords to canvas coords ──
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (screenX - rect.left - RULER_SIZE - panX) / zoom,
        y: (screenY - rect.top - RULER_SIZE - panY) / zoom,
      };
    },
    [panX, panY, zoom],
  );

  // ── Check if a tool is a draw tool ──
  const isDrawTool = DRAW_TOOLS.includes(activeTool);

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

      // Left click
      if (e.button === 0) {
        const canvasPos = screenToCanvas(e.clientX, e.clientY);

        // Drag-to-draw for shape tools
        if (isDrawTool) {
          e.preventDefault();
          const elementType = TOOL_TO_ELEMENT[activeTool];
          if (elementType) {
            const el = useCanvasStore.getState().addElement(elementType, canvasPos.x, canvasPos.y, {
              width: 0,
              height: 0,
            });
            // Keep the drawing tool active during drag-to-draw
            // (addElement switches to SELECT, so we restore it)
            useCanvasStore.getState().setTool(activeTool);
            isDrawingRef.current = true;
            drawStartRef.current = { x: canvasPos.x, y: canvasPos.y };
            drawingElementIdRef.current = el.id;
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          }
          return;
        }

        // IMAGE tool: file picker
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
          return;
        }

        // CONNECTOR: start from this point
        if (activeTool === 'CONNECTOR') {
          useCanvasStore.getState().addElement('CONNECTOR', canvasPos.x, canvasPos.y);
          return;
        }

        // SELECT tool: rubber band selection on empty space
        if (activeTool === 'SELECT') {
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
      }
    },
    [activeTool, spacePressed, panX, panY, screenToCanvas, isDrawTool],
  );

  // ── Pointer move ──
  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      setCursorPos(canvasPos);

      // Throttled cursor broadcasting
      if (onCursorMove && !cursorThrottleRef.current) {
        onCursorMove(canvasPos.x, canvasPos.y);
        cursorThrottleRef.current = setTimeout(() => {
          cursorThrottleRef.current = null;
        }, 50);
      }

      // ── Panning ──
      if (isPanningRef.current) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        useCanvasStore.getState().setPan(panStartRef.current.panX + dx, panStartRef.current.panY + dy);
        return;
      }

      // ── Drawing (drag-to-draw) ──
      if (isDrawingRef.current && drawStartRef.current && drawingElementIdRef.current) {
        const startX = drawStartRef.current.x;
        const startY = drawStartRef.current.y;
        let newW = canvasPos.x - startX;
        let newH = canvasPos.y - startY;

        // Shift constrains to square/circle
        if (shiftHeldRef.current) {
          const size = Math.max(Math.abs(newW), Math.abs(newH));
          newW = newW < 0 ? -size : size;
          newH = newH < 0 ? -size : size;
        }

        let finalX = newW < 0 ? startX + newW : startX;
        let finalY = newH < 0 ? startY + newH : startY;
        let finalW = Math.abs(newW);
        let finalH = Math.abs(newH);

        // For LINE, store x2/y2 instead
        if (activeTool === 'LINE') {
          useCanvasStore.getState().updateElement(drawingElementIdRef.current, {
            width: canvasPos.x - startX,
            height: 0,
            styles: { x2: canvasPos.x - startX, y2: canvasPos.y - startY },
          });
        } else {
          useCanvasStore.getState().updateElement(drawingElementIdRef.current, {
            x: finalX,
            y: finalY,
            width: Math.max(1, finalW),
            height: Math.max(1, finalH),
          });
        }
        return;
      }

      // ── Resizing ──
      if (resizeHandleRef.current && resizeStartRef.current) {
        const dx = (e.clientX - resizeStartRef.current.x) / zoom;
        const dy = (e.clientY - resizeStartRef.current.y) / zoom;
        const handle = resizeHandleRef.current;
        const orig = resizeStartRef.current;

        let newX = orig.elX;
        let newY = orig.elY;
        let newW = orig.elW;
        let newH = orig.elH;

        // Shift to constrain aspect ratio
        if (shiftHeldRef.current) {
          const aspect = orig.elW / orig.elH;
          if (handle.includes('w') || handle.includes('e')) {
            newH = newW / aspect;
          } else {
            newW = newH * aspect;
          }
        }

        switch (handle) {
          case 'nw':
            newX = orig.elX + dx;
            newY = orig.elY + dy;
            newW = orig.elW - dx;
            newH = orig.elH - dy;
            break;
          case 'n':
            newY = orig.elY + dy;
            newH = orig.elH - dy;
            break;
          case 'ne':
            newY = orig.elY + dy;
            newW = orig.elW + dx;
            newH = orig.elH - dy;
            break;
          case 'e':
            newW = orig.elW + dx;
            break;
          case 'se':
            newW = orig.elW + dx;
            newH = orig.elH + dy;
            break;
          case 's':
            newH = orig.elH + dy;
            break;
          case 'sw':
            newX = orig.elX + dx;
            newW = orig.elW - dx;
            newH = orig.elH + dy;
            break;
          case 'w':
            newX = orig.elX + dx;
            newW = orig.elW - dx;
            break;
        }

        // Minimum size enforcement
        if (newW < 10) {
          if (handle.includes('w')) newX = orig.elX + orig.elW - 10;
          newW = 10;
        }
        if (newH < 10) {
          if (handle.includes('n')) newY = orig.elY + orig.elH - 10;
          newH = 10;
        }

        const elId = selectedIds[0];
        if (elId) {
          useCanvasStore.getState().resizeElement(elId, newX, newY, newW, newH);
        }
        return;
      }

      // ── Rotating ──
      if (isRotatingRef.current && rotatingElementIdRef.current) {
        const el = elements.find((e) => e.id === rotatingElementIdRef.current);
        if (el) {
          const centerX = el.x + el.width / 2;
          const centerY = el.y + el.height / 2;
          // Convert center to screen coords
          const screenCenterX = centerX * zoom + panX + RULER_SIZE;
          const screenCenterY = centerY * zoom + panY + RULER_SIZE;
          const angle = Math.atan2(e.clientY - screenCenterY, e.clientX - screenCenterX) * (180 / Math.PI) + 90;
          useCanvasStore.getState().rotateElement(rotatingElementIdRef.current, Math.round(angle));
        }
        return;
      }

      // ── Rubber band selection ──
      if (isDrawingSelection && selectionStartRef.current) {
        useCanvasStore.getState().setSelectionBox({
          startX: selectionStartRef.current.startX,
          startY: selectionStartRef.current.startY,
          endX: e.clientX,
          endY: e.clientY,
        });
        return;
      }

      // ── Dragging an element ──
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
        const rawX = dragStartRef.current.elX + dx;
        const rawY = dragStartRef.current.elY + dy;

        // Compute alignment guides while dragging
        const draggingEl = elements.find((el) => el.id === dragStartRef.current?.id);
        if (draggingEl) {
          const movedEl = { ...draggingEl, x: rawX, y: rawY };
          const guides = computeAlignmentGuides([movedEl], elements, SNAP_THRESHOLD);
          const snapped = snapToGuides(rawX, rawY, guides, SNAP_THRESHOLD);
          setActiveGuides(snapped.guides);

          const finalX = snapToGrid ? Math.round(snapped.x / SNAP_THRESHOLD) * SNAP_THRESHOLD : snapped.x;
          const finalY = snapToGrid ? Math.round(snapped.y / SNAP_THRESHOLD) * SNAP_THRESHOLD : snapped.y;
          useCanvasStore.getState().moveElement(dragStartRef.current.id, finalX, finalY);
        }
      }
    },
    [
      isDrawingSelection,
      screenToCanvas,
      zoom,
      panX,
      panY,
      onCursorMove,
      elements,
      selectedIds,
      activeTool,
      snapToGrid,
    ],
  );

  // ── Pointer up ──
  const handleCanvasPointerUp = useCallback(
    (e: React.PointerEvent) => {
      // End panning
      if (isPanningRef.current) {
        isPanningRef.current = false;
        return;
      }

      // End drawing
      if (isDrawingRef.current) {
        isDrawingRef.current = false;
        // If element is too small, delete it
        if (drawingElementIdRef.current) {
          const el = useCanvasStore.getState().elements.find((e) => e.id === drawingElementIdRef.current);
          if (el && el.width < 5 && el.height < 5 && el.type !== 'LINE') {
            useCanvasStore.getState().deleteElements([drawingElementIdRef.current]);
          }
          useCanvasStore.getState().pushHistory();
        }
        drawStartRef.current = null;
        drawingElementIdRef.current = null;
        return;
      }

      // End resizing
      if (resizeHandleRef.current) {
        resizeHandleRef.current = null;
        resizeStartRef.current = null;
        useCanvasStore.getState().pushHistory();
        return;
      }

      // End rotating
      if (isRotatingRef.current) {
        isRotatingRef.current = false;
        rotatingElementIdRef.current = null;
        useCanvasStore.getState().pushHistory();
        return;
      }

      // End rubber band selection
      if (isDrawingSelection && selectionBox) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect && selectionBox) {
          const x1 = Math.min(selectionBox.startX, selectionBox.endX) - rect.left - RULER_SIZE;
          const y1 = Math.min(selectionBox.startY, selectionBox.endY) - rect.top - RULER_SIZE;
          const x2 = Math.max(selectionBox.startX, selectionBox.endX) - rect.left - RULER_SIZE;
          const y2 = Math.max(selectionBox.startY, selectionBox.endY) - rect.top - RULER_SIZE;

          const canvasX1 = (x1 - panX) / zoom;
          const canvasY1 = (y1 - panY) / zoom;
          const canvasX2 = (x2 - panX) / zoom;
          const canvasY2 = (y2 - panY) / zoom;

          const intersecting = visibleElements.filter((el) => {
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
        setActiveGuides([]);
      }
    },
    [isDrawingSelection, selectionBox, panX, panY, zoom, visibleElements, activeTool],
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

      containerRef.current?.setPointerCapture(e.pointerId);
    },
    [activeTool, elements],
  );

  // ── Resize start (called from EnhancedBoardElement) ──
  const handleResizeStart = useCallback(
    (handle: string, e: React.PointerEvent) => {
      const elId = selectedIds[0];
      if (!elId) return;
      const el = elements.find((el) => el.id === elId);
      if (!el) return;

      resizeHandleRef.current = handle;
      resizeStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        elX: el.x,
        elY: el.y,
        elW: el.width,
        elH: el.height,
      };

      containerRef.current?.setPointerCapture(e.pointerId);
    },
    [selectedIds, elements],
  );

  // ── Rotation start (called from EnhancedBoardElement) ──
  const handleRotateStart = useCallback(
    (e: React.PointerEvent) => {
      const elId = selectedIds[0];
      if (!elId) return;

      isRotatingRef.current = true;
      rotatingElementIdRef.current = elId;

      containerRef.current?.setPointerCapture(e.pointerId);
    },
    [selectedIds],
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

        const newPanX = mouseX - (mouseX - panX) * (newZoom / zoom);
        const newPanY = mouseY - (mouseY - panY) * (newZoom / zoom);

        useCanvasStore.getState().setZoom(newZoom);
        useCanvasStore.getState().setPan(newPanX, newPanY);
      } else {
        e.preventDefault();
        useCanvasStore.getState().setPan(panX - e.deltaX, panY - e.deltaY);
      }
    },
    [zoom, panX, panY],
  );

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.isContentEditable) {
        if (e.key === 'Escape') target.blur();
        return;
      }

      // Track shift for constraining
      if (e.key === 'Shift') {
        shiftHeldRef.current = true;
      }

      if (e.key === ' ') {
        e.preventDefault();
        useCanvasStore.getState().setSpacePressed(true);
        return;
      }

      // Ctrl/Cmd shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault();
            useCanvasStore.getState().zoomIn();
            return;
          case '-':
          case '_':
            e.preventDefault();
            useCanvasStore.getState().zoomOut();
            return;
          case '0':
            e.preventDefault();
            useCanvasStore.getState().zoomToFit();
            return;
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
              const selectedEls = useCanvasStore.getState().elements.filter((el) => useCanvasStore.getState().selectedIds.includes(el.id));
              const groups = new Set(selectedEls.map((el) => el.groupId).filter(Boolean));
              groups.forEach((g) => useCanvasStore.getState().ungroupElements(g as string));
            } else {
              if (useCanvasStore.getState().selectedIds.length >= 2) {
                useCanvasStore.getState().groupElements(useCanvasStore.getState().selectedIds);
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
        case 'o':
        case 'O':
          if (!e.ctrlKey && !e.metaKey) useCanvasStore.getState().setTool('ELLIPSE');
          return;
        case 'f':
        case 'F':
          if (!e.ctrlKey && !e.metaKey) useCanvasStore.getState().setTool('FRAME');
          return;
        case 'p':
        case 'P':
          if (!e.ctrlKey && !e.metaKey) useCanvasStore.getState().setTool('PEN_TOOL');
          return;
        case 'Escape':
          useCanvasStore.getState().deselectAll();
          useCanvasStore.getState().setTool('SELECT');
          return;
        case '/':
          useAppStore.getState().setPluginDialogOpen(true);
          return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        useCanvasStore.getState().setSpacePressed(false);
      }
      if (e.key === 'Shift') {
        shiftHeldRef.current = false;
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
    backgroundPosition: `${panX + RULER_SIZE}px ${panY + RULER_SIZE}px`,
  };

  // ── Selection box style ──
  const selectionBoxStyle = selectionBox
    ? {
        left: Math.min(selectionBox.startX, selectionBox.endX),
        top: Math.min(selectionBox.startY, selectionBox.endY),
        width: Math.abs(selectionBox.endX - selectionBox.startX),
        height: Math.abs(selectionBox.endY - selectionBox.startY),
      }
    : null;

  // ── Canvas cursor ──
  const canvasCursor = spacePressed || activeTool === 'HAND'
    ? 'grab'
    : activeTool === 'TEXT'
      ? 'text'
      : activeTool === 'PEN_TOOL'
        ? 'crosshair'
        : isDrawTool
          ? 'crosshair'
          : 'default';

  // ── Connector SVG layer ──
  const connectorElements = visibleElements.filter((el) => el.type === 'CONNECTOR');

  // ── Presence users ──
  const presenceUsers = usePresenceStore((s) => s.users);

  // ── Prototype player data ──
  const currentFrame = useMemo(
    () => elements.find((el) => el.id === currentPlayFrameId),
    [elements, currentPlayFrameId],
  );

  // ── Single selection for resize/rotate ──
  const isSingleSelected = selectedIds.length === 1;

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════════

  // Prototype Player overlay
  if (isPlaying && currentFrame) {
    return <PrototypePlayer frame={currentFrame} />;
  }

  return (
    <div className="relative flex h-full w-full flex-1 overflow-hidden bg-background">
      {/* Canvas Container (full size, includes ruler area) */}
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
        {/* Rulers (rendered in screen space, not canvas transform space) */}
        <Rulers />

        {/* Canvas transform layer — offset by RULER_SIZE */}
        <div
          className="absolute origin-top-left"
          style={{
            left: RULER_SIZE,
            top: RULER_SIZE,
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
              const s = el.styles ?? {};
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

          {/* Board Elements (all types rendered with EnhancedBoardElement) */}
          {visibleElements
            .filter((el) => el.type !== 'CONNECTOR')
            .map((el) => (
              <div key={el.id} data-element-id={el.id}>
                <EnhancedBoardElement
                  element={el}
                  isSelected={selectedIds.includes(el.id)}
                  zoom={zoom}
                  onPointerDown={handleElementPointerDown}
                  onResizeStart={isSingleSelected ? handleResizeStart : undefined}
                  onRotateStart={isSingleSelected ? handleRotateStart : undefined}
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

        {/* Alignment Guides (screen space overlay) */}
        <AlignmentGuidesComponent
          guides={activeGuides}
          panX={panX + RULER_SIZE}
          panY={panY + RULER_SIZE}
          zoom={zoom}
        />

        {/* Prototype Flow Overlay (when in prototype mode) */}
        {editorMode === 'prototype' && (
          <PrototypeFlowOverlay
            panX={panX + RULER_SIZE}
            panY={panY + RULER_SIZE}
            zoom={zoom}
          />
        )}

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

        {/* Bottom-Left: Zoom Controls */}
        <div className="absolute left-3 bottom-3 z-50 flex items-center gap-1 rounded-xl border bg-card/90 px-1.5 py-1 shadow-sm backdrop-blur-sm">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-accent/50 text-foreground"
            onClick={() => useCanvasStore.getState().zoomOut()}
            title="Zoom Out (Ctrl+-)"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            className="flex h-8 min-w-[56px] items-center justify-center rounded-lg px-2 text-xs font-mono font-medium text-foreground transition-colors hover:bg-accent/50"
            onClick={() => {
              // Prompt-free: cycle through common zoom levels
              const zoomLevels = [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 5];
              const nextZoom = zoomLevels.find((z) => z > zoom + 0.01) ?? 1;
              useCanvasStore.getState().setZoom(nextZoom);
            }}
            title="Click to set zoom level"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-accent/50 text-foreground"
            onClick={() => useCanvasStore.getState().zoomIn()}
            title="Zoom In (Ctrl++)"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <div className="mx-0.5 h-5 w-px bg-border" />
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-accent/50 text-foreground"
            onClick={() => useCanvasStore.getState().zoomToFit()}
            title="Zoom to Fit (Ctrl+0)"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        {/* Bottom-Left: Plugin Button (below zoom controls on desktop) */}
        <div className="absolute left-3 bottom-14 z-50">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl border bg-card/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-accent/50 text-foreground"
                  onClick={() => useAppStore.getState().setPluginDialogOpen(true)}
                >
                  <Puzzle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <span className="font-medium">{t('toolbar.plugins', locale)}</span>
                <kbd className="ml-2 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono">/</kbd>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Bottom-Right: Status Bar */}
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

/* ═══════════════════════════════════════════════════════════════════════════════
   Prototype Player — full-screen overlay showing current frame
   ═══════════════════════════════════════════════════════════════════════════════ */

function PrototypePlayer({ frame }: { frame: BoardElementType }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const elements = useCanvasStore((s) => s.elements);
  const stopPlayback = usePrototypeStore((s) => s.stopPlayback);
  const goBack = usePrototypeStore((s) => s.goBack);
  const getInteractionsForFrame = usePrototypeStore((s) => s.getInteractionsForFrame);
  const navigateToFrame = usePrototypeStore((s) => s.navigateToFrame);

  // Compute scale to fit frame in viewport
  useEffect(() => {
    const computeFit = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight - 60; // bottom nav space
      const scaleX = vw / frame.width;
      const scaleY = vh / frame.height;
      const s = Math.min(scaleX, scaleY, 1);
      setScale(s);
      setOffset({
        x: (vw - frame.width * s) / 2,
        y: (vh - frame.height * s) / 2,
      });
    };
    computeFit();
    window.addEventListener('resize', computeFit);
    return () => window.removeEventListener('resize', computeFit);
  }, [frame.width, frame.height]);

  // Frame children elements
  const children = useMemo(
    () =>
      elements.filter(
        (el) => el.parentId === frame.id && el.visible !== false,
      ),
    [elements, frame.id],
  );

  // Handle interaction triggers on child elements
  const handleChildClick = useCallback(
    (childId: string) => {
      const interactions = getInteractionsForFrame(frame.id);
      const interaction = interactions.find((i) => i.triggerElementId === childId);
      if (interaction) {
        navigateToFrame(interaction.targetFrameId);
      }
    },
    [frame.id, getInteractionsForFrame, navigateToFrame],
  );

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-black/90">
      {/* Close button */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={stopPlayback}
            className="flex items-center gap-1 rounded-md bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
            Close
          </button>
          <span className="text-sm text-white/60">
            {frame.name || frame.content || 'Frame'}
          </span>
        </div>
      </div>

      {/* Frame display area */}
      <div ref={containerRef} className="relative flex-1 overflow-hidden">
        <div
          className="absolute bg-white shadow-2xl"
          style={{
            left: offset.x,
            top: offset.y,
            width: frame.width * scale,
            height: frame.height * scale,
            transformOrigin: 'top left',
          }}
        >
          {children.map((child) => {
            const screenX = child.x * scale;
            const screenY = child.y * scale;
            return (
              <div
                key={child.id}
                className="absolute cursor-pointer"
                style={{
                  left: screenX,
                  top: screenY,
                  width: child.width * scale,
                  height: child.height * scale,
                }}
                onClick={() => handleChildClick(child.id)}
              >
                <div className="h-full w-full">
                  {child.type === 'TEXT' && (
                    <div
                      className="h-full w-full overflow-hidden"
                      style={{
                        fontSize: (child.styles?.typography?.fontSize || 16) * scale,
                        color: child.styles?.typography?.color || child.color,
                        fontWeight: child.styles?.typography?.fontWeight || 'normal',
                      }}
                    >
                      {child.content}
                    </div>
                  )}
                  {child.type === 'RECTANGLE' && (
                    <div
                      className="h-full w-full"
                      style={{ backgroundColor: child.color || '#fff' }}
                    />
                  )}
                  {child.type === 'IMAGE' && (
                    <img
                      src={child.styles?.src}
                      alt={child.content || ''}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  )}
                  {child.type === 'STICKY_NOTE' && (
                    <div
                      className="h-full w-full p-2"
                      style={{
                        backgroundColor: child.color,
                        fontSize: 12 * scale,
                      }}
                    >
                      {child.content}
                    </div>
                  )}
                  {/* Fallback for other types */}
                  {child.type === 'ELLIPSE' && (
                    <div
                      className="h-full w-full"
                      style={{
                        backgroundColor: child.color || '#fff',
                        borderRadius: '50%',
                      }}
                    />
                  )}
                  {(child.type === 'STAR' || child.type === 'POLYGON' || child.type === 'LINE' || child.type === 'CONNECTOR' || child.type === 'CIRCLE' || child.type === 'FRAME' || child.type === 'PEN_PATH') && (
                    <div
                      className="h-full w-full"
                      style={{
                        backgroundColor: child.color || 'transparent',
                        borderRadius: child.type === 'CIRCLE' ? '50%' : undefined,
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom navigation bar */}
      <div className="flex items-center justify-center gap-3 px-4 py-3">
        <button
          onClick={goBack}
          className="flex items-center gap-1 rounded-md bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════════════ */

function getArrowPoints(tipX: number, tipY: number, size: number, angle: number): string {
  const a1 = angle + Math.PI * 0.85;
  const a2 = angle - Math.PI * 0.85;
  const p1x = tipX + Math.cos(a1) * size;
  const p1y = tipY + Math.sin(a1) * size;
  const p2x = tipX + Math.cos(a2) * size;
  const p2y = tipY + Math.sin(a2) * size;
  return `${tipX},${tipY} ${p1x},${p1y} ${p2x},${p2y}`;
}