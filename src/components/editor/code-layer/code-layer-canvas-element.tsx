'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { Code, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCodeLayerStore } from '@/store/code-layer-store';

interface CodeLayerCanvasElementProps {
  elementId: string;
  width: number;
  height: number;
  onDoubleClick?: () => void;
}

const THEME_STYLES: Record<string, { bg: string; text: string }> = {
  dark: { bg: '#1e293b', text: '#e2e8f0' },
  light: { bg: '#ffffff', text: '#1a1a2e' },
  monokai: { bg: '#272822', text: '#f8f8f2' },
  dracula: { bg: '#282a36', text: '#f8f8f2' },
};

export function CodeLayerCanvasElement({
  elementId,
  width,
  height,
  onDoubleClick,
}: CodeLayerCanvasElementProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [hovered, setHovered] = useState(false);

  const codeData = useCodeLayerStore((s) => s.codeLayers[elementId]);

  const srcDoc = useMemo(() => {
    if (!codeData) return null;
    const theme = THEME_STYLES[codeData.theme] || THEME_STYLES.dark;

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { width:100%; height:100%; overflow:hidden; }
  body { background:${theme.bg}; color:${theme.text}; font-family:system-ui,-apple-system,sans-serif; }
  ${codeData.css}
</style>
</head>
<body>
  ${codeData.html}
  <script>${codeData.js}<\/script>
</body>
</html>`;
  }, [codeData]);

  useEffect(() => {
    if (iframeRef.current && srcDoc) {
      iframeRef.current.srcdoc = srcDoc;
    }
  }, [srcDoc]);

  if (!codeData) {
    return (
      <div
        className="flex flex-col items-center justify-center bg-muted/30 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer"
        style={{ width, height }}
        onDoubleClick={onDoubleClick}
      >
        <Code className="size-6 text-muted-foreground/50 mb-1" />
        <span className="text-xs text-muted-foreground/50">Code Layer</span>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-lg overflow-hidden border border-border/50"
      style={{ width, height }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDoubleClick={onDoubleClick}
    >
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts"
        className="w-full h-full border-0"
        title={`Code layer ${elementId}`}
        style={{ pointerEvents: 'none' }}
      />

      {/* Hover overlay */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center bg-black/0 transition-colors pointer-events-none',
          hovered && 'bg-black/10'
        )}
      >
        {hovered && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs backdrop-blur-sm">
            <Edit3 className="size-3" />
            Double-click to edit
          </div>
        )}
      </div>
    </div>
  );
}