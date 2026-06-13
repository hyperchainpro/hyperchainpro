'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useCanvasStore } from '@/store/canvas-store';

const RULER_SIZE = 24;
const RULER_BG = 'hsl(var(--muted) / 0.8)';

interface RulerProps {
  onMousePos?: (canvasX: number, canvasY: number) => void;
}

export default function Rulers({ onMousePos }: RulerProps) {
  const panX = useCanvasStore((s) => s.panX);
  const panY = useCanvasStore((s) => s.panY);
  const zoom = useCanvasStore((s) => s.zoom);
  const [mouseCanvasPos, setMouseCanvasPos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Track mouse position relative to the canvas area (below the rulers)
  useEffect(() => {
    const container = containerRef.current?.parentElement;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const cx = (e.clientX - rect.left - panX) / zoom;
      const cy = (e.clientY - rect.top - panY) / zoom;
      setMouseCanvasPos({ x: cx, y: cy });
      onMousePos?.(cx, cy);
    };

    const handleMouseLeave = () => {
      setMouseCanvasPos(null);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [panX, panY, zoom, onMousePos]);

  return (
    <div ref={containerRef} className="pointer-events-none absolute left-0 top-0 z-30">
      {/* Horizontal ruler */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: RULER_SIZE,
          top: 0,
          width: 'calc(100% - 24px)',
          height: RULER_SIZE,
          backgroundColor: RULER_BG,
          borderBottom: '1px solid hsl(var(--border))',
        }}
      >
        <HORIZONTAL_RULER panX={panX} panY={panY} zoom={zoom} mouseCanvasPos={mouseCanvasPos} />
      </div>

      {/* Vertical ruler */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: 0,
          top: RULER_SIZE,
          width: RULER_SIZE,
          height: 'calc(100% - 24px)',
          backgroundColor: RULER_BG,
          borderRight: '1px solid hsl(var(--border))',
        }}
      >
        <VERTICAL_RULER panX={panX} panY={panY} zoom={zoom} mouseCanvasPos={mouseCanvasPos} />
      </div>

      {/* Corner square */}
      <div
        className="absolute"
        style={{
          left: 0,
          top: 0,
          width: RULER_SIZE,
          height: RULER_SIZE,
          backgroundColor: RULER_BG,
          borderBottom: '1px solid hsl(var(--border))',
          borderRight: '1px solid hsl(var(--border))',
        }}
      />
    </div>
  );
}

/* ── Horizontal Ruler ── */
function HORIZONTAL_RULER({
  panX,
  zoom,
  mouseCanvasPos,
}: {
  panX: number;
  panY: number;
  zoom: number;
  mouseCanvasPos: { x: number; y: number } | null;
}) {
  // Calculate tick marks
  const ticks = useMemo(() => {
    const result: { x: number; label: string; isMajor: boolean }[] = [];
    // Determine step size based on zoom
    const rawStep = 100 / zoom;
    // Round to a nice number
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const residual = rawStep / magnitude;
    let step: number;
    if (residual <= 1) step = magnitude;
    else if (residual <= 2) step = 2 * magnitude;
    else if (residual <= 5) step = 5 * magnitude;
    else step = 10 * magnitude;

    const majorEvery = 5;

    // Calculate visible range (canvas coords)
    // Ruler width in screen pixels, offset by panX
    // We'll generate ticks over a wide range and let SVG clipping handle visibility
    const startCanvas = Math.floor(-panX / zoom / step) * step - step;
    const endCanvas = Math.ceil((-panX / zoom + 3000) / zoom / step) * step + step;

    let tickIndex = 0;
    for (let canvasX = startCanvas; canvasX <= endCanvas; canvasX += step) {
      const screenX = canvasX * zoom + panX;
      const isMajor = tickIndex % majorEvery === 0;
      result.push({
        x: screenX,
        label: isMajor ? String(Math.round(canvasX)) : '',
        isMajor,
      });
      tickIndex++;
    }

    return result;
  }, [panX, zoom]);

  // Mouse crosshair position in screen coords relative to the ruler
  const crosshairX = mouseCanvasPos
    ? mouseCanvasPos.x * zoom + panX
    : null;

  return (
    <svg width="100%" height={RULER_SIZE} className="overflow-hidden">
      {ticks.map((tick, i) => (
        <g key={i}>
          {/* Tick line */}
          <line
            x1={tick.x}
            y1={tick.isMajor ? 6 : RULER_SIZE - 6}
            x2={tick.x}
            y2={RULER_SIZE}
            stroke="hsl(var(--foreground) / 0.3)"
            strokeWidth={tick.isMajor ? 1 : 0.5}
          />
          {/* Label for major ticks */}
          {tick.label && (
            <text
              x={tick.x + 3}
              y={12}
              fontSize="9"
              fill="hsl(var(--foreground) / 0.5)"
              fontFamily="ui-monospace, monospace"
            >
              {tick.label}
            </text>
          )}
        </g>
      ))}
      {/* Crosshair indicator */}
      {crosshairX !== null && crosshairX > RULER_SIZE && (
        <line
          x1={crosshairX}
          y1={0}
          x2={crosshairX}
          y2={RULER_SIZE}
          stroke="hsl(var(--foreground) / 0.6)"
          strokeWidth={1}
        />
      )}
    </svg>
  );
}

/* ── Vertical Ruler ── */
function VERTICAL_RULER({
  panY,
  zoom,
  mouseCanvasPos,
}: {
  panX: number;
  panY: number;
  zoom: number;
  mouseCanvasPos: { x: number; y: number } | null;
}) {
  const ticks = useMemo(() => {
    const result: { y: number; label: string; isMajor: boolean }[] = [];
    const rawStep = 100 / zoom;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const residual = rawStep / magnitude;
    let step: number;
    if (residual <= 1) step = magnitude;
    else if (residual <= 2) step = 2 * magnitude;
    else if (residual <= 5) step = 5 * magnitude;
    else step = 10 * magnitude;

    const majorEvery = 5;

    const startCanvas = Math.floor(-panY / zoom / step) * step - step;
    const endCanvas = Math.ceil((-panY / zoom + 3000) / zoom / step) * step + step;

    let tickIndex = 0;
    for (let canvasY = startCanvas; canvasY <= endCanvas; canvasY += step) {
      const screenY = canvasY * zoom + panY;
      const isMajor = tickIndex % majorEvery === 0;
      result.push({
        y: screenY,
        label: isMajor ? String(Math.round(canvasY)) : '',
        isMajor,
      });
      tickIndex++;
    }

    return result;
  }, [panY, zoom]);

  const crosshairY = mouseCanvasPos
    ? mouseCanvasPos.y * zoom + panY
    : null;

  return (
    <svg width={RULER_SIZE} height="100%" className="overflow-hidden">
      {ticks.map((tick, i) => (
        <g key={i}>
          <line
            x1={tick.isMajor ? 6 : RULER_SIZE - 6}
            y1={tick.y}
            x2={RULER_SIZE}
            y2={tick.y}
            stroke="hsl(var(--foreground) / 0.3)"
            strokeWidth={tick.isMajor ? 1 : 0.5}
          />
          {tick.label && (
            <text
              x={3}
              y={tick.y - 3}
              fontSize="9"
              fill="hsl(var(--foreground) / 0.5)"
              fontFamily="ui-monospace, monospace"
            >
              {tick.label}
            </text>
          )}
        </g>
      ))}
      {/* Crosshair indicator */}
      {crosshairY !== null && crosshairY > RULER_SIZE && (
        <line
          x1={0}
          y1={crosshairY}
          x2={RULER_SIZE}
          y2={crosshairY}
          stroke="hsl(var(--foreground) / 0.6)"
          strokeWidth={1}
        />
      )}
    </svg>
  );
}