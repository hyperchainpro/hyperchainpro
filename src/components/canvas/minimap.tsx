'use client';

import React, { useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { t, type Locale } from '@/lib/i18n';import { useAuthStore } from '@/store/auth-store';
import { useCanvasStore } from '@/store/canvas-store';

const MINIMAP_WIDTH = 180;
const MINIMAP_HEIGHT = 130;
const MINIMAP_PADDING = 16;

export default function Minimap() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const store = useCanvasStore();
  const svgRef = useRef<SVGSVGElement>(null);

  const { elements, panX, panY, zoom, showMinimap } = store;

  // Calculate bounds of all elements
  const bounds = useMemo(() => {
    if (elements.length === 0) {
      return { minX: -100, minY: -100, maxX: 500, maxY: 400 };
    }
    const nonLineElements = elements.filter(
      (el) => el.type !== 'LINE' && el.type !== 'CONNECTOR',
    );
    if (nonLineElements.length === 0) {
      return { minX: -100, minY: -100, maxX: 500, maxY: 400 };
    }
    const minX = Math.min(...nonLineElements.map((e) => e.x)) - 50;
    const minY = Math.min(...nonLineElements.map((e) => e.y)) - 50;
    const maxX = Math.max(...nonLineElements.map((e) => e.x + e.width)) + 50;
    const maxY = Math.max(...nonLineElements.map((e) => e.y + e.height)) + 50;
    return { minX, minY, maxX, maxY };
  }, [elements]);

  // Calculate scale to fit content in minimap
  const { scaleX, scaleY, scale, offsetX, offsetY } = useMemo(() => {
    const contentW = bounds.maxX - bounds.minX;
    const contentH = bounds.maxY - bounds.minY;
    const availW = MINIMAP_WIDTH - MINIMAP_PADDING * 2;
    const availH = MINIMAP_HEIGHT - MINIMAP_PADDING * 2;
    const sx = contentW > 0 ? availW / contentW : 1;
    const sy = contentH > 0 ? availH / contentH : 1;
    const s = Math.min(sx, sy, 1);
    return {
      scaleX: sx,
      scaleY: sy,
      scale: s,
      offsetX: MINIMAP_PADDING + (availW - contentW * s) / 2,
      offsetY: MINIMAP_PADDING + (availH - contentH * s) / 2,
    };
  }, [bounds]);

  // Viewport rectangle (what's visible in the main canvas)
  const viewport = useMemo(() => {
    // The visible canvas area in canvas coordinates
    // Assuming the canvas container is roughly window.innerWidth - 56 (toolbar) and window.innerHeight
    const containerW = (typeof window !== 'undefined' ? window.innerWidth - 56 : 1200);
    const containerH = typeof window !== 'undefined' ? window.innerHeight : 800;

    const visibleLeft = -panX / zoom;
    const visibleTop = -panY / zoom;
    const visibleRight = visibleLeft + containerW / zoom;
    const visibleBottom = visibleTop + containerH / zoom;

    return {
      x: visibleLeft,
      y: visibleTop,
      width: visibleRight - visibleLeft,
      height: visibleBottom - visibleTop,
    };
  }, [panX, panY, zoom]);

  // Convert canvas coord to minimap coord
  const toMini = useCallback(
    (cx: number, cy: number) => ({
      x: (cx - bounds.minX) * scale + offsetX,
      y: (cy - bounds.minY) * scale + offsetY,
    }),
    [bounds, scale, offsetX, offsetY],
  );

  // Click on minimap to navigate
  const handleMinimapClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Convert minimap coord back to canvas coord
      const canvasX = (clickX - offsetX) / scale + bounds.minX;
      const canvasY = (clickY - offsetY) / scale + bounds.minY;

      // Center the viewport on that point
      const containerW = (typeof window !== 'undefined' ? window.innerWidth - 56 : 1200);
      const containerH = typeof window !== 'undefined' ? window.innerHeight : 800;

      store.setPan(
        -canvasX * zoom + containerW / 2,
        -canvasY * zoom + containerH / 2,
      );
    },
    [offsetX, offsetY, scale, bounds, zoom, store],
  );

  // Minimap viewport rect in minimap coords
  const vpMini = useMemo(() => {
    const topLeft = toMini(viewport.x, viewport.y);
    const bottomRight = toMini(viewport.x + viewport.width, viewport.y + viewport.height);
    return {
      x: topLeft.x,
      y: topLeft.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y,
    };
  }, [viewport, toMini]);

  const elementColors: Record<string, string> = {
    STICKY_NOTE: '#f59e0b',
    RECTANGLE: '#3b82f6',
    CIRCLE: '#8b5cf6',
    LINE: '#6b7280',
    TEXT: '#374151',
    CONNECTOR: '#6b7280',
    IMAGE: '#10b981',
  };

  return (
    <AnimatePresence>
      {showMinimap && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-14 right-3 z-50"
        >
          <div
            className={cn(
              'overflow-hidden rounded-xl border bg-card/90 shadow-lg backdrop-blur-sm',
            )}
          >
            <svg
              ref={svgRef}
              width={MINIMAP_WIDTH}
              height={MINIMAP_HEIGHT}
              className="cursor-pointer"
              onClick={handleMinimapClick}
            >
              {/* Background */}
              <rect width={MINIMAP_WIDTH} height={MINIMAP_HEIGHT} fill="hsl(var(--muted) / 0.3)" rx="8" />

              {/* Grid dots */}
              {Array.from({ length: 20 }).map((_, i) => (
                <circle
                  key={`gx-${i}`}
                  cx={i * 10 + 5}
                  cy={Math.floor(i * 7) % 14 + 3}
                  r={0.5}
                  fill="hsl(var(--border))"
                  opacity={0.5}
                />
              ))}

              {/* Elements */}
              {elements
                .filter((el) => el.type !== 'LINE' && el.type !== 'CONNECTOR')
                .map((el) => {
                  const pos = toMini(el.x, el.y);
                  const w = el.width * scale;
                  const h = el.height * scale;
                  const color = el.color || elementColors[el.type] || '#6b7280';
                  return (
                    <rect
                      key={el.id}
                      x={pos.x}
                      y={pos.y}
                      width={Math.max(2, w)}
                      height={Math.max(2, h)}
                      rx={el.type === 'CIRCLE' ? Math.max(1, w / 2) : el.type === 'STICKY_NOTE' ? 1 : 0.5}
                      fill={color}
                      opacity={0.7}
                      stroke={color}
                      strokeWidth={0.5}
                    />
                  );
                })}

              {/* Viewport rectangle */}
              <rect
                x={Math.max(0, vpMini.x)}
                y={Math.max(0, vpMini.y)}
                width={Math.min(MINIMAP_WIDTH, Math.max(4, vpMini.width))}
                height={Math.min(MINIMAP_HEIGHT, Math.max(4, vpMini.height))}
                rx={2}
                fill="hsl(var(--primary) / 0.08)"
                stroke="hsl(var(--primary))"
                strokeWidth={1.5}
              />
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}