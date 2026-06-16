import { useCanvasStore } from '@/store/canvas-store';
import { useAppStore } from '@/store/app-store';
import { type DesignPlugin } from '@/lib/plugins-data';
import { createDefaultElement, type BoardElement, type ElementType } from '@/lib/types';
import { toast } from 'sonner';

// ─── Viewport Helper ──────────────────────────────────────────────────────────

function getViewportCenter(): { x: number; y: number } {
  const { panX, panY, zoom } = useCanvasStore.getState();
  const centerX = (window.innerWidth / 2 - panX) / zoom;
  const centerY = (window.innerHeight / 2 - panY) / zoom;
  return { x: Math.round(centerX), y: Math.round(centerY) };
}

// ─── Batch Insert Helper ──────────────────────────────────────────────────────

function insertElementsBatch(
  elements: BoardElement[],
  selectLast = true,
): string[] {
  const store = useCanvasStore.getState();
  const ids = elements.map((e) => e.id);
  useCanvasStore.setState({
    elements: [...store.elements, ...elements],
    selectedIds: selectLast && ids.length > 0 ? [ids[ids.length - 1]] : ids,
    activeTool: 'SELECT' as const,
  });
  store.pushHistory();
  return ids;
}

function makeElement(
  type: ElementType,
  x: number,
  y: number,
  overrides?: Partial<BoardElement>,
): BoardElement {
  return createDefaultElement(type, x, y, overrides);
}

// ─── Color Palettes ───────────────────────────────────────────────────────────

const CHART_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

const SWATCH_PALETTE = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#6366F1', '#14B8A6', '#F43F5E', '#A855F7', '#0EA5E9',
];

const BRAND_COLORS = ['#1F2937', '#6366F1', '#EC4899', '#F59E0B', '#10B981', '#FFFFFF'];

const GRAY = '#E5E7EB';
const DARK_BG = '#1E1E1E';
const CODE_GREEN = '#4EC9B0';
const CODE_BLUE = '#569CD6';
const CODE_ORANGE = '#CE9178';
const CODE_YELLOW = '#DCDCAA';
const CODE_WHITE = '#D4D4D4';

// ─── Category Actions ─────────────────────────────────────────────────────────

function handleShapes(plugin: DesignPlugin, cx: number, cy: number): void {
  const tags = plugin.tags.map((t) => t.toLowerCase());
  const store = useCanvasStore.getState();

  if (tags.some((t) => t === 'circle')) {
    const el = store.addElement('CIRCLE', cx - 70, cy - 70, {
      color: '#6366F1',
      styles: {
        fills: [{ id: 'f1', type: 'solid', color: '#6366F1', opacity: 1 }],
        cornerRadius: undefined,
      },
    });
    store.selectElement(el.id);
  } else if (tags.some((t) => t === 'star' || t === 'burst')) {
    const el = store.addElement('STAR', cx - 60, cy - 60, {
      color: '#FCD34D',
      styles: { pointCount: 5 },
    });
    store.selectElement(el.id);
  } else if (tags.some((t) => t === 'polygon' || t === 'pentagon' || t === 'hexagon' || t === 'octagon' || t === 'heptagon' || t === 'sides')) {
    const pointCount = tags.includes('pentagon') ? 5
      : tags.includes('hexagon') ? 6
        : tags.includes('heptagon') ? 7
          : tags.includes('octagon') ? 8
            : 6;
    const el = store.addElement('POLYGON', cx - 60, cy - 60, {
      color: '#6EE7B7',
      styles: { pointCount },
    });
    store.selectElement(el.id);
  } else if (tags.some((t) => t === 'arrow' || t === 'connector')) {
    const el = store.addElement('CONNECTOR', cx - 100, cy - 50, {
      styles: {
        arrowHead: true,
        connectorStyle: 'curve',
      },
    });
    store.selectElement(el.id);
  } else if (tags.some((t) => t === 'bubble' || t === 'speech' || t === 'chat' || t === 'dialogue')) {
    const el = store.addElement('RECTANGLE', cx - 80, cy - 40, {
      width: 160,
      height: 80,
      styles: {
        fills: [{ id: 'f1', type: 'solid', color: '#DBEAFE', opacity: 1 }],
        cornerRadius: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 },
        strokes: [{ id: 's1', color: '#93C5FD', width: 2, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'round' as const }],
      },
    });
    store.selectElement(el.id);
  } else if (tags.some((t) => t === 'badge' || t === 'ribbon' || t === 'label' || t === 'award' || t === 'decorative')) {
    const el = store.addElement('STAR', cx - 50, cy - 50, {
      width: 100,
      height: 100,
      color: '#FCD34D',
      styles: { pointCount: 8 },
    });
    store.selectElement(el.id);
  } else if (tags.some((t) => t === 'bezier' || t === 'curve' || t === 'arc' || t === 'path' || t === 'organic')) {
    const el = store.addElement('PEN_PATH', cx - 100, cy - 100, {
      width: 200,
      height: 200,
      styles: { pathData: 'M0,100 C50,0 150,200 200,100' },
    });
    store.selectElement(el.id);
  } else {
    // Default: rectangle + circle + star
    const elements: BoardElement[] = [
      makeElement('RECTANGLE', cx - 150, cy - 40, {
        width: 100,
        height: 80,
        color: '#6366F1',
        styles: {
          fills: [{ id: 'f1', type: 'solid', color: '#6366F1', opacity: 1 }],
          cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 },
        },
      }),
      makeElement('CIRCLE', cx - 10, cy - 50, {
        width: 100,
        height: 100,
        color: '#EC4899',
        styles: {
          fills: [{ id: 'f1', type: 'solid', color: '#EC4899', opacity: 1 }],
        },
      }),
      makeElement('STAR', cx + 100, cy - 45, {
        width: 90,
        height: 90,
        color: '#FCD34D',
        styles: { pointCount: 5 },
      }),
    ];
    insertElementsBatch(elements);
  }
}

function handleCharts(plugin: DesignPlugin, cx: number, cy: number): void {
  const frameW = 300;
  const frameH = 220;
  const frameX = cx - frameW / 2;
  const frameY = cy - frameH / 2;

  const frame = makeElement('FRAME', frameX, frameY, {
    width: frameW,
    height: frameH,
    name: 'Bar Chart',
    styles: {
      fills: [{ id: 'f1', type: 'solid', color: '#FFFFFF', opacity: 1 }],
      strokes: [{ id: 's1', color: '#E5E7EB', width: 1, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'round' as const }],
      cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 },
      shadows: [{ id: 'sh1', type: 'drop-shadow' as const, color: '#000000', offsetX: 0, offsetY: 2, blur: 8, spread: 0, visible: true }],
    },
  });

  const barHeights = [140, 100, 170, 90, 120, 60];
  const barW = 30;
  const barGap = (frameW - barHeights.length * barW) / (barHeights.length + 1);

  const bars: BoardElement[] = barHeights.map((h, i) => {
    const bx = Math.round(barGap + i * (barW + barGap));
    const by = Math.round(frameH - 20 - h);
    return makeElement('RECTANGLE', frameX + bx, frameY + by, {
      width: barW,
      height: h,
      parentId: frame.id,
      color: CHART_COLORS[i % CHART_COLORS.length],
      styles: {
        fills: [{ id: `bf${i}`, type: 'solid', color: CHART_COLORS[i % CHART_COLORS.length], opacity: 1 }],
        cornerRadius: { topLeft: 4, topRight: 4, bottomRight: 0, bottomLeft: 0 },
      },
    });
  });

  insertElementsBatch([frame, ...bars], true);
}

function handleIcons(plugin: DesignPlugin, cx: number, cy: number): void {
  const elements: BoardElement[] = [
    makeElement('RECTANGLE', cx - 24, cy - 34, {
      width: 48,
      height: 48,
      color: '#F3F4F6',
      styles: {
        fills: [{ id: 'f1', type: 'solid', color: '#F3F4F6', opacity: 1 }],
        cornerRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 },
        strokes: [{ id: 's1', color: '#D1D5DB', width: 1, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'round' as const }],
      },
      name: 'Icon Placeholder',
    }),
    makeElement('TEXT', cx - 40, cy + 24, {
      width: 80,
      height: 24,
      content: plugin.name,
      styles: {
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 12,
          fontWeight: 500,
          lineHeight: 1.4,
          letterSpacing: 0,
          textDecoration: 'none',
          color: '#6B7280',
          textAlign: 'center',
          fontStyle: 'normal',
          textCase: 'none',
        },
      },
    }),
  ];

  insertElementsBatch(elements);
}

function handleLayout(_plugin: DesignPlugin, cx: number, cy: number): void {
  const frameW = 360;
  const frameH = 640;
  const frameX = cx - frameW / 2;
  const frameY = cy - frameH / 2;

  const frame = makeElement('FRAME', frameX, frameY, {
    width: frameW,
    height: frameH,
    name: 'Layout',
    styles: {
      fills: [{ id: 'f1', type: 'solid', color: '#FFFFFF', opacity: 1 }],
      strokes: [{ id: 's1', color: '#E5E7EB', width: 1, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'round' as const }],
      cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 },
      shadows: [{ id: 'sh1', type: 'drop-shadow' as const, color: '#000000', offsetX: 0, offsetY: 4, blur: 12, spread: 0, visible: true }],
    },
  });

  const children: BoardElement[] = [
    // Header
    makeElement('RECTANGLE', frameX, frameY, {
      width: frameW,
      height: 60,
      parentId: frame.id,
      color: '#6366F1',
      styles: {
        fills: [{ id: 'f1', type: 'solid', color: '#6366F1', opacity: 1 }],
        cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 0, bottomLeft: 0 },
      },
      name: 'Header',
    }),
    // Sidebar
    makeElement('RECTANGLE', frameX, frameY + 60, {
      width: 80,
      height: frameH - 60 - 60,
      parentId: frame.id,
      color: '#F3F4F6',
      styles: {
        fills: [{ id: 'f1', type: 'solid', color: '#F3F4F6', opacity: 1 }],
      },
      name: 'Sidebar',
    }),
    // Content area
    makeElement('RECTANGLE', frameX + 80, frameY + 60, {
      width: frameW - 80,
      height: frameH - 60 - 60,
      parentId: frame.id,
      color: '#FFFFFF',
      styles: {
        fills: [{ id: 'f1', type: 'solid', color: '#FFFFFF', opacity: 1 }],
      },
      name: 'Content',
    }),
    // Footer
    makeElement('RECTANGLE', frameX, frameY + frameH - 60, {
      width: frameW,
      height: 60,
      parentId: frame.id,
      color: '#F9FAFB',
      styles: {
        fills: [{ id: 'f1', type: 'solid', color: '#F9FAFB', opacity: 1 }],
        cornerRadius: { topLeft: 0, topRight: 0, bottomRight: 8, bottomLeft: 8 },
        strokes: [{ id: 's1', color: '#E5E7EB', width: 1, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'round' as const }],
      },
      name: 'Footer',
    }),
  ];

  insertElementsBatch([frame, ...children], true);
}

function handleWireframe(_plugin: DesignPlugin, cx: number, cy: number): void {
  const frameW = 375;
  const frameH = 667;
  const frameX = cx - frameW / 2;
  const frameY = cy - frameH / 2;

  const frame = makeElement('FRAME', frameX, frameY, {
    width: frameW,
    height: frameH,
    name: 'Wireframe',
    styles: {
      fills: [{ id: 'f1', type: 'solid', color: '#FFFFFF', opacity: 1 }],
      strokes: [{ id: 's1', color: '#D1D5DB', width: 1, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'round' as const }],
      cornerRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 },
      shadows: [{ id: 'sh1', type: 'drop-shadow' as const, color: '#000000', offsetX: 0, offsetY: 4, blur: 16, spread: 0, visible: true }],
    },
  });

  const grayFill = (id: string) => [{ id, type: 'solid' as const, color: GRAY, opacity: 1 }];

  const children: BoardElement[] = [
    // Status bar
    makeElement('RECTANGLE', frameX + 0, frameY + 0, {
      width: frameW, height: 44, parentId: frame.id, color: GRAY,
      styles: { fills: grayFill('g1'), cornerRadius: { topLeft: 12, topRight: 12, bottomRight: 0, bottomLeft: 0 } },
      name: 'Status Bar',
    }),
    // Nav bar
    makeElement('RECTANGLE', frameX + 0, frameY + 44, {
      width: frameW, height: 56, parentId: frame.id, color: GRAY,
      styles: { fills: grayFill('g2') },
      name: 'Nav Bar',
    }),
    // Hero image placeholder
    makeElement('RECTANGLE', frameX + 16, frameY + 116, {
      width: frameW - 32, height: 180, parentId: frame.id, color: GRAY,
      styles: { fills: grayFill('g3'), cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 } },
      name: 'Hero Image',
    }),
    // Text line 1
    makeElement('RECTANGLE', frameX + 16, frameY + 316, {
      width: frameW - 80, height: 16, parentId: frame.id, color: GRAY,
      styles: { fills: grayFill('g4') },
      name: 'Title Line',
    }),
    // Text line 2
    makeElement('RECTANGLE', frameX + 16, frameY + 342, {
      width: frameW - 32, height: 12, parentId: frame.id, color: GRAY,
      styles: { fills: grayFill('g5') },
      name: 'Body Line 1',
    }),
    // Text line 3
    makeElement('RECTANGLE', frameX + 16, frameY + 362, {
      width: frameW - 60, height: 12, parentId: frame.id, color: GRAY,
      styles: { fills: grayFill('g6') },
      name: 'Body Line 2',
    }),
    // Text line 4
    makeElement('RECTANGLE', frameX + 16, frameY + 382, {
      width: frameW - 100, height: 12, parentId: frame.id, color: GRAY,
      styles: { fills: grayFill('g7') },
      name: 'Body Line 3',
    }),
    // CTA button placeholder
    makeElement('RECTANGLE', frameX + 16, frameY + 416, {
      width: 140, height: 44, parentId: frame.id, color: GRAY,
      styles: { fills: grayFill('g8'), cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 } },
      name: 'CTA Button',
    }),
    // Card placeholder
    makeElement('RECTANGLE', frameX + 16, frameY + 480, {
      width: frameW - 32, height: 140, parentId: frame.id, color: GRAY,
      styles: { fills: grayFill('g9'), cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 } },
      name: 'Card',
    }),
  ];

  insertElementsBatch([frame, ...children], true);
}

function handleDiagrams(_plugin: DesignPlugin, cx: number, cy: number): void {
  const nodeW = 140;
  const nodeH = 50;
  const gap = 80;

  // 3 nodes in a flow
  const node1X = cx - (nodeW + gap);
  const node1Y = cy - nodeH / 2;

  const node2X = cx - nodeW / 2;
  const node2Y = cy - nodeH / 2;

  const node3X = cx + gap;
  const node3Y = cy - nodeH / 2;

  const nodes: BoardElement[] = [
    makeElement('RECTANGLE', node1X, node1Y, {
      width: nodeW, height: nodeH, name: 'Start',
      styles: {
        fills: [{ id: 'f1', type: 'solid', color: '#DBEAFE', opacity: 1 }],
        cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 },
        strokes: [{ id: 's1', color: '#3B82F6', width: 2, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'round' as const }],
      },
    }),
    makeElement('RECTANGLE', node2X, node2Y, {
      width: nodeW, height: nodeH, name: 'Process',
      styles: {
        fills: [{ id: 'f2', type: 'solid', color: '#FEF3C7', opacity: 1 }],
        cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 },
        strokes: [{ id: 's2', color: '#F59E0B', width: 2, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'round' as const }],
      },
    }),
    makeElement('RECTANGLE', node3X, node3Y, {
      width: nodeW, height: nodeH, name: 'End',
      styles: {
        fills: [{ id: 'f3', type: 'solid', color: '#D1FAE5', opacity: 1 }],
        cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 },
        strokes: [{ id: 's3', color: '#10B981', width: 2, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'round' as const }],
      },
    }),
  ];

  const conn1 = makeElement('CONNECTOR', node1X + nodeW, node1Y + nodeH / 2 - 30, {
    width: gap, height: 60,
    sourceId: nodes[0].id,
    targetId: nodes[1].id,
    styles: { arrowHead: true, connectorStyle: 'curve' },
  });

  const conn2 = makeElement('CONNECTOR', node2X + nodeW, node2Y + nodeH / 2 - 30, {
    width: gap, height: 60,
    sourceId: nodes[1].id,
    targetId: nodes[2].id,
    styles: { arrowHead: true, connectorStyle: 'curve' },
  });

  insertElementsBatch([...nodes, conn1, conn2]);
}

function handleText(_plugin: DesignPlugin, cx: number, cy: number): void {
  const elements: BoardElement[] = [
    makeElement('TEXT', cx - 120, cy - 70, {
      width: 240, height: 48, content: 'Heading',
      styles: {
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 36,
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: -0.5,
          textDecoration: 'none',
          color: '#111827',
          textAlign: 'left',
          fontStyle: 'normal',
          textCase: 'none',
        },
      },
      name: 'Heading',
    }),
    makeElement('TEXT', cx - 120, cy - 10, {
      width: 240, height: 36, content: 'Body text goes here for preview purposes.',
      styles: {
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 16,
          fontWeight: 400,
          lineHeight: 1.6,
          letterSpacing: 0,
          textDecoration: 'none',
          color: '#4B5563',
          textAlign: 'left',
          fontStyle: 'normal',
          textCase: 'none',
        },
      },
      name: 'Body',
    }),
    makeElement('TEXT', cx - 120, cy + 40, {
      width: 240, height: 24, content: 'Caption or subtitle text',
      styles: {
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 12,
          fontWeight: 400,
          lineHeight: 1.5,
          letterSpacing: 0.5,
          textDecoration: 'none',
          color: '#9CA3AF',
          textAlign: 'left',
          fontStyle: 'normal',
          textCase: 'none',
        },
      },
      name: 'Caption',
    }),
  ];

  insertElementsBatch(elements);
}

function handleImages(_plugin: DesignPlugin, cx: number, cy: number): void {
  const store = useCanvasStore.getState();
  const el = store.addElement('IMAGE', cx - 120, cy - 90, {
    width: 240,
    height: 180,
    styles: {
      cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 },
      strokes: [{ id: 's1', color: '#E5E7EB', width: 1, style: 'dashed', align: 'center' as const, cap: 'butt' as const, join: 'round' as const }],
    },
    name: 'Image Placeholder',
  });
  store.selectElement(el.id);
}

function handleColors(_plugin: DesignPlugin, cx: number, cy: number): void {
  const size = 40;
  const gap = 8;
  const count = 6;
  const totalW = count * size + (count - 1) * gap;
  const startX = cx - totalW / 2;

  const swatches: BoardElement[] = SWATCH_PALETTE.slice(0, count).map((color, i) =>
    makeElement('RECTANGLE', Math.round(startX + i * (size + gap)), cy - size / 2, {
      width: size,
      height: size,
      color,
      styles: {
        fills: [{ id: `sf${i}`, type: 'solid', color, opacity: 1 }],
        cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 },
        shadows: [{ id: `sh${i}`, type: 'drop-shadow' as const, color: '#000000', offsetX: 0, offsetY: 2, blur: 4, spread: 0, visible: true }],
      },
    }),
  );

  insertElementsBatch(swatches);
}

function handleExport(plugin: DesignPlugin): void {
  useAppStore.getState().setExportDialogOpen(true);
  toast.success(`${plugin.name} opened`);
}

function handleTemplates(_plugin: DesignPlugin, cx: number, cy: number): void {
  const frameW = 375;
  const frameH = 812;
  const frameX = cx - frameW / 2;
  const frameY = cy - frameH / 2;

  const frame = makeElement('FRAME', frameX, frameY, {
    width: frameW,
    height: frameH,
    name: 'iPhone Template',
    styles: {
      fills: [{ id: 'f1', type: 'solid', color: '#FFFFFF', opacity: 1 }],
      cornerRadius: { topLeft: 40, topRight: 40, bottomRight: 40, bottomLeft: 40 },
      strokes: [{ id: 's1', color: '#D1D5DB', width: 1, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'round' as const }],
      shadows: [{ id: 'sh1', type: 'drop-shadow' as const, color: '#000000', offsetX: 0, offsetY: 8, blur: 24, spread: 0, visible: true }],
    },
  });

  const children: BoardElement[] = [
    // Status bar
    makeElement('RECTANGLE', frameX, frameY, {
      width: frameW, height: 48, parentId: frame.id,
      styles: {
        fills: [{ id: 'g1', type: 'solid', color: '#111827', opacity: 1 }],
        cornerRadius: { topLeft: 40, topRight: 40, bottomRight: 0, bottomLeft: 0 },
      },
      name: 'Status Bar',
    }),
    // Hero section
    makeElement('RECTANGLE', frameX, frameY + 48, {
      width: frameW, height: 280, parentId: frame.id,
      styles: {
        fills: [{ id: 'g2', type: 'solid', color: '#6366F1', opacity: 1 }],
      },
      name: 'Hero',
    }),
    // Title text area
    makeElement('RECTANGLE', frameX + 20, frameY + 120, {
      width: 200, height: 20, parentId: frame.id,
      styles: { fills: [{ id: 'g3', type: 'solid', color: '#FFFFFF', opacity: 0.9 }] },
      name: 'Title',
    }),
    // Subtitle text area
    makeElement('RECTANGLE', frameX + 20, frameY + 150, {
      width: 260, height: 14, parentId: frame.id,
      styles: { fills: [{ id: 'g4', type: 'solid', color: '#FFFFFF', opacity: 0.6 }] },
      name: 'Subtitle',
    }),
    // Content card 1
    makeElement('RECTANGLE', frameX + 16, frameY + 348, {
      width: frameW - 32, height: 100, parentId: frame.id,
      styles: {
        fills: [{ id: 'g5', type: 'solid', color: '#F9FAFB', opacity: 1 }],
        cornerRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 },
        strokes: [{ id: 's2', color: '#E5E7EB', width: 1, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'round' as const }],
      },
      name: 'Card 1',
    }),
    // Content card 2
    makeElement('RECTANGLE', frameX + 16, frameY + 464, {
      width: frameW - 32, height: 100, parentId: frame.id,
      styles: {
        fills: [{ id: 'g6', type: 'solid', color: '#F9FAFB', opacity: 1 }],
        cornerRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 },
        strokes: [{ id: 's3', color: '#E5E7EB', width: 1, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'round' as const }],
      },
      name: 'Card 2',
    }),
    // Bottom tab bar
    makeElement('RECTANGLE', frameX, frameY + frameH - 80, {
      width: frameW, height: 80, parentId: frame.id,
      styles: {
        fills: [{ id: 'g7', type: 'solid', color: '#FFFFFF', opacity: 1 }],
        cornerRadius: { topLeft: 0, topRight: 0, bottomRight: 40, bottomLeft: 40 },
        strokes: [{ id: 's4', color: '#E5E7EB', width: 1, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'round' as const }],
      },
      name: 'Tab Bar',
    }),
  ];

  insertElementsBatch([frame, ...children], true);
}

function handleAITools(plugin: DesignPlugin): void {
  useAppStore.getState().setAIDesignDialogOpen(true);
  toast.success(`${plugin.name} opened`);
}

function handleCollaboration(plugin: DesignPlugin): void {
  toast.info('Collaboration features available via invite');
  toast.success(`${plugin.name} applied`);
}

function handleAccessibility(_plugin: DesignPlugin, cx: number, cy: number): void {
  const elements: BoardElement[] = [
    makeElement('TEXT', cx - 120, cy - 80, {
      width: 240, height: 28, content: '[alt: Descriptive image text]',
      styles: {
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 14,
          fontWeight: 400,
          lineHeight: 1.5,
          letterSpacing: 0,
          textDecoration: 'none',
          color: '#6B7280',
          textAlign: 'left',
          fontStyle: 'italic',
          textCase: 'none',
        },
      },
      name: 'Alt Text Label',
    }),
    makeElement('RECTANGLE', cx - 100, cy - 30, {
      width: 200, height: 60,
      styles: {
        fills: [{ id: 'f1', type: 'solid', color: '#111827', opacity: 1 }],
        cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 },
      },
      name: 'Contrast Checker (21:1)',
    }),
    makeElement('TEXT', cx - 90, cy - 16, {
      width: 180, height: 32, content: 'White on Dark\nContrast: 21:1 ✓ AAA',
      styles: {
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 13,
          fontWeight: 500,
          lineHeight: 1.4,
          letterSpacing: 0,
          textDecoration: 'none',
          color: '#FFFFFF',
          textAlign: 'center',
          fontStyle: 'normal',
          textCase: 'none',
        },
      },
    }),
    makeElement('TEXT', cx - 120, cy + 50, {
      width: 240, height: 24, content: '✓ Meets WCAG 2.1 AA standards',
      styles: {
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 12,
          fontWeight: 500,
          lineHeight: 1.5,
          letterSpacing: 0,
          textDecoration: 'none',
          color: '#10B981',
          textAlign: 'left',
          fontStyle: 'normal',
          textCase: 'none',
        },
      },
      name: 'WCAG Notice',
    }),
  ];

  insertElementsBatch(elements);
}

function handleMath(_plugin: DesignPlugin, cx: number, cy: number): void {
  const elements: BoardElement[] = [
    makeElement('TEXT', cx - 140, cy - 60, {
      width: 280, height: 36, content: 'E = mc²',
      styles: {
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 32,
          fontWeight: 600,
          lineHeight: 1.2,
          letterSpacing: 0,
          textDecoration: 'none',
          color: '#1F2937',
          textAlign: 'center',
          fontStyle: 'normal',
          textCase: 'none',
        },
      },
      name: 'Einstein Equation',
    }),
    makeElement('TEXT', cx - 140, cy - 10, {
      width: 280, height: 28, content: 'a² + b² = c²',
      styles: {
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 24,
          fontWeight: 500,
          lineHeight: 1.3,
          letterSpacing: 0,
          textDecoration: 'none',
          color: '#4B5563',
          textAlign: 'center',
          fontStyle: 'normal',
          textCase: 'none',
        },
      },
      name: 'Pythagorean Theorem',
    }),
    makeElement('TEXT', cx - 140, cy + 30, {
      width: 280, height: 24, content: '∑ f(x) = ∫ F(x) dx',
      styles: {
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 18,
          fontWeight: 400,
          lineHeight: 1.4,
          letterSpacing: 0,
          textDecoration: 'none',
          color: '#6B7280',
          textAlign: 'center',
          fontStyle: 'normal',
          textCase: 'none',
        },
      },
      name: 'Calculus Notation',
    }),
  ];

  insertElementsBatch(elements);
}

function handleTypography(_plugin: DesignPlugin, cx: number, cy: number): void {
  const elements: BoardElement[] = [
    makeElement('TEXT', cx - 120, cy - 90, {
      width: 240, height: 56, content: 'H1 Heading',
      styles: {
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 48,
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: -1,
          textDecoration: 'none',
          color: '#111827',
          textAlign: 'left',
          fontStyle: 'normal',
          textCase: 'none',
        },
      },
      name: 'H1',
    }),
    makeElement('TEXT', cx - 120, cy - 20, {
      width: 240, height: 40, content: 'H2 Subheading',
      styles: {
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 28,
          fontWeight: 600,
          lineHeight: 1.3,
          letterSpacing: -0.3,
          textDecoration: 'none',
          color: '#374151',
          textAlign: 'left',
          fontStyle: 'normal',
          textCase: 'none',
        },
      },
      name: 'H2',
    }),
    makeElement('TEXT', cx - 120, cy + 30, {
      width: 240, height: 48, content: 'Body text styled with a comfortable reading size for long-form content.',
      styles: {
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 16,
          fontWeight: 400,
          lineHeight: 1.6,
          letterSpacing: 0,
          textDecoration: 'none',
          color: '#6B7280',
          textAlign: 'left',
          fontStyle: 'normal',
          textCase: 'none',
        },
      },
      name: 'Body',
    }),
  ];

  insertElementsBatch(elements);
}

function handleBranding(_plugin: DesignPlugin, cx: number, cy: number): void {
  const frameW = 400;
  const frameH = 400;
  const frameX = cx - frameW / 2;
  const frameY = cy - frameH / 2;

  const frame = makeElement('FRAME', frameX, frameY, {
    width: frameW,
    height: frameH,
    name: 'Brand Board',
    styles: {
      fills: [{ id: 'f1', type: 'solid', color: '#FFFFFF', opacity: 1 }],
      cornerRadius: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 },
      shadows: [{ id: 'sh1', type: 'drop-shadow' as const, color: '#000000', offsetX: 0, offsetY: 4, blur: 16, spread: 0, visible: true }],
      strokes: [{ id: 's1', color: '#E5E7EB', width: 1, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'round' as const }],
    },
  });

  const swatchSize = 48;
  const swatchGap = 8;
  const swatchStartX = frameX + (frameW - (BRAND_COLORS.length * swatchSize + (BRAND_COLORS.length - 1) * swatchGap)) / 2;

  const children: BoardElement[] = [
    // Logo placeholder
    makeElement('RECTANGLE', frameX + frameW / 2 - 36, frameY + 40, {
      width: 72, height: 72, parentId: frame.id,
      styles: {
        fills: [{ id: 'g1', type: 'solid', color: '#6366F1', opacity: 1 }],
        cornerRadius: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 },
      },
      name: 'Logo',
    }),
    // Brand name
    makeElement('TEXT', frameX + frameW / 2 - 80, frameY + 130, {
      width: 160, height: 32, content: 'Brand Name', parentId: frame.id,
      styles: {
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 24,
          fontWeight: 700,
          lineHeight: 1.3,
          letterSpacing: -0.5,
          textDecoration: 'none',
          color: '#1F2937',
          textAlign: 'center',
          fontStyle: 'normal',
          textCase: 'none',
        },
      },
      name: 'Brand Name',
    }),
    // Color swatches
    ...BRAND_COLORS.map((color, i) =>
      makeElement('RECTANGLE', Math.round(swatchStartX + i * (swatchSize + swatchGap)), frameY + 200, {
        width: swatchSize,
        height: swatchSize,
        parentId: frame.id,
        color,
        styles: {
          fills: [{ id: `bs${i}`, type: 'solid', color, opacity: 1 }],
          cornerRadius: { topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10 },
          strokes: color === '#FFFFFF'
            ? [{ id: `bss${i}`, color: '#E5E7EB', width: 1, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'round' as const }]
            : [],
        },
      }),
    ),
  ];

  insertElementsBatch([frame, ...children], true);
}

function handleAnimation(_plugin: DesignPlugin, cx: number, cy: number): void {
  const colors = ['#6366F1', '#8B5CF6', '#EC4899'];
  const elements: BoardElement[] = [
    ...colors.map((color, i) =>
      makeElement('RECTANGLE', cx - 120 + i * 90, cy - 50, {
        width: 70, height: 70, color,
        styles: {
          fills: [{ id: `af${i}`, type: 'solid', color, opacity: 0.6 + i * 0.2 }],
          cornerRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 },
        },
        name: `Element ${i + 1}`,
      }),
    ),
    makeElement('TEXT', cx - 140, cy + 40, {
      width: 280, height: 24,
      content: '↔ Set transitions in Prototype mode to animate between frames',
      styles: {
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 12,
          fontWeight: 400,
          lineHeight: 1.5,
          letterSpacing: 0,
          textDecoration: 'none',
          color: '#9CA3AF',
          textAlign: 'center',
          fontStyle: 'italic',
          textCase: 'none',
        },
      },
      name: 'Animation Note',
    }),
  ];

  insertElementsBatch(elements);
}

function handlePrototyping(plugin: DesignPlugin): void {
  useAppStore.getState().setEditorMode('prototype');
  toast.success(`${plugin.name}: Prototype mode activated`);
}

function handle3D(_plugin: DesignPlugin, cx: number, cy: number): void {
  const elements: BoardElement[] = [
    makeElement('RECTANGLE', cx - 80, cy - 80, {
      width: 160, height: 160,
      styles: {
        fills: [{ id: 'f1', type: 'solid', color: '#6366F1', opacity: 1 }],
        cornerRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 },
        shadows: [
          { id: 'sh1', type: 'drop-shadow' as const, color: '#000000', offsetX: 8, offsetY: 8, blur: 0, spread: 0, visible: true },
          { id: 'sh2', type: 'drop-shadow' as const, color: '#000000', offsetX: 16, offsetY: 16, blur: 0, spread: 0, visible: true },
        ],
      },
      name: '3D Cube',
    }),
    makeElement('TEXT', cx - 90, cy + 100, {
      width: 180, height: 20,
      content: 'Layer shadows simulate 3D depth',
      styles: {
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 11,
          fontWeight: 400,
          lineHeight: 1.4,
          letterSpacing: 0,
          textDecoration: 'none',
          color: '#9CA3AF',
          textAlign: 'center',
          fontStyle: 'italic',
          textCase: 'none',
        },
      },
      name: '3D Note',
    }),
  ];

  insertElementsBatch(elements);
}

function handleIllustration(_plugin: DesignPlugin, cx: number, cy: number): void {
  const elements: BoardElement[] = [
    // Sky/background
    makeElement('RECTANGLE', cx - 100, cy - 100, {
      width: 200, height: 200,
      styles: {
        fills: [{ id: 'f1', type: 'solid', color: '#DBEAFE', opacity: 1 }],
        cornerRadius: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 },
      },
      name: 'Background',
    }),
    // Sun
    makeElement('CIRCLE', cx + 40, cy - 60, {
      width: 60, height: 60,
      color: '#FCD34D',
      styles: { fills: [{ id: 'f2', type: 'solid', color: '#FCD34D', opacity: 1 }] },
      name: 'Sun',
    }),
    // Mountain / triangle (approximated with polygon)
    makeElement('POLYGON', cx - 80, cy - 10, {
      width: 160, height: 120,
      color: '#6EE7B7',
      styles: {
        fills: [{ id: 'f3', type: 'solid', color: '#6EE7B7', opacity: 1 }],
        pointCount: 3,
      },
      name: 'Mountain',
    }),
    // Ground
    makeElement('RECTANGLE', cx - 100, cy + 60, {
      width: 200, height: 40,
      styles: {
        fills: [{ id: 'f4', type: 'solid', color: '#A7F3D0', opacity: 1 }],
        cornerRadius: { topLeft: 0, topRight: 0, bottomRight: 16, bottomLeft: 16 },
      },
      name: 'Ground',
    }),
  ];

  insertElementsBatch(elements, true);
}

function handlePhotoEditing(plugin: DesignPlugin): void {
  const { selectedIds } = useCanvasStore.getState();
  if (selectedIds.length > 0) {
    toast.info('Select image filters and adjustments in the right panel');
    toast.success(`${plugin.name}: Editing ${selectedIds.length} element(s)`);
  } else {
    const store = useCanvasStore.getState();
    const el = store.addElement('IMAGE', cx_default() - 120, cy_default() - 90, {
      width: 240,
      height: 180,
      styles: {
        cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 },
        strokes: [{ id: 's1', color: '#E5E7EB', width: 1, style: 'dashed', align: 'center' as const, cap: 'butt' as const, join: 'round' as const }],
      },
      name: 'Photo Placeholder',
    });
    store.selectElement(el.id);
    toast.success(`${plugin.name}: Image placeholder inserted`);
  }
}

function cx_default() { return getViewportCenter().x; }
function cy_default() { return getViewportCenter().y; }

function handleResponsive(_plugin: DesignPlugin, cx: number, cy: number): void {
  const devices = [
    { name: 'Mobile', w: 375, h: 667 },
    { name: 'Tablet', w: 768, h: 1024 },
    { name: 'Desktop', w: 1440, h: 900 },
  ];

  // Scale down to fit in viewport
  const maxW = 1440;
  const targetW = Math.min(window.innerWidth * 0.6, 1200) / 1;
  const scale = Math.min(targetW / maxW, 0.3);

  const totalW = devices.reduce((sum, d) => sum + d.w * scale + 40, 0) - 40;
  let currentX = cx - totalW / 2;

  const frames: BoardElement[] = devices.map((device) => {
    const fw = Math.round(device.w * scale);
    const fh = Math.round(device.h * scale);
    const frame = makeElement('FRAME', Math.round(currentX), cy - fh / 2, {
      width: fw,
      height: fh,
      name: device.name,
      styles: {
        fills: [{ id: `rf${device.name}`, type: 'solid', color: '#FFFFFF', opacity: 1 }],
        cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 },
        strokes: [{ id: `rs${device.name}`, color: '#D1D5DB', width: 1, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'round' as const }],
        shadows: [{ id: `rsh${device.name}`, type: 'drop-shadow' as const, color: '#000000', offsetX: 0, offsetY: 2, blur: 8, spread: 0, visible: true }],
      },
    });

    // Label below frame
    const label = makeElement('TEXT', Math.round(currentX), cy + fh / 2 + 8, {
      width: fw, height: 20,
      content: `${device.name} (${device.w}×${device.h})`,
      styles: {
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 11,
          fontWeight: 500,
          lineHeight: 1.4,
          letterSpacing: 0,
          textDecoration: 'none',
          color: '#9CA3AF',
          textAlign: 'center',
          fontStyle: 'normal',
          textCase: 'none',
        },
      },
      name: `${device.name} Label`,
    });

    currentX += fw + 40;
    return [frame, label];
  }).flat();

  insertElementsBatch(frames);
}

function handleCodeGen(_plugin: DesignPlugin, cx: number, cy: number): void {
  const frameW = 480;
  const frameH = 320;
  const frameX = cx - frameW / 2;
  const frameY = cy - frameH / 2;

  const frame = makeElement('FRAME', frameX, frameY, {
    width: frameW,
    height: frameH,
    name: 'Code Editor',
    styles: {
      fills: [{ id: 'f1', type: 'solid', color: DARK_BG, opacity: 1 }],
      cornerRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 },
      shadows: [{ id: 'sh1', type: 'drop-shadow' as const, color: '#000000', offsetX: 0, offsetY: 4, blur: 12, spread: 0, visible: true }],
    },
  });

  const codeLines = [
    { text: 'function App() {', color: CODE_BLUE },
    { text: '  return (', color: CODE_WHITE },
    { text: '    <div className="app">', color: CODE_GREEN },
    { text: '      <h1>Hello World</h1>', color: CODE_ORANGE },
    { text: '    </div>', color: CODE_GREEN },
    { text: '  );', color: CODE_WHITE },
    { text: '}', color: CODE_BLUE },
  ];

  const children: BoardElement[] = [
    // Title bar
    makeElement('RECTANGLE', frameX, frameY, {
      width: frameW, height: 32, parentId: frame.id,
      styles: {
        fills: [{ id: 'tb', type: 'solid', color: '#2D2D2D', opacity: 1 }],
        cornerRadius: { topLeft: 12, topRight: 12, bottomRight: 0, bottomLeft: 0 },
      },
      name: 'Title Bar',
    }),
    // Window dots
    makeElement('CIRCLE', frameX + 14, frameY + 10, {
      width: 12, height: 12, parentId: frame.id,
      styles: { fills: [{ id: 'd1', type: 'solid', color: '#FF5F56', opacity: 1 }] },
    }),
    makeElement('CIRCLE', frameX + 32, frameY + 10, {
      width: 12, height: 12, parentId: frame.id,
      styles: { fills: [{ id: 'd2', type: 'solid', color: '#FFBD2E', opacity: 1 }] },
    }),
    makeElement('CIRCLE', frameX + 50, frameY + 10, {
      width: 12, height: 12, parentId: frame.id,
      styles: { fills: [{ id: 'd3', type: 'solid', color: '#27C93F', opacity: 1 }] },
    }),
    // Code lines
    ...codeLines.map((line, i) =>
      makeElement('TEXT', frameX + 16, frameY + 44 + i * 28, {
        width: frameW - 32, height: 22,
        content: line.text,
        parentId: frame.id,
        styles: {
          typography: {
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: 14,
            fontWeight: 400,
            lineHeight: 1.5,
            letterSpacing: 0,
            textDecoration: 'none',
            color: line.color,
            textAlign: 'left',
            fontStyle: 'normal',
            textCase: 'none',
          },
        },
        name: `Line ${i + 1}`,
      }),
    ),
  ];

  insertElementsBatch([frame, ...children], true);
}

function handleHandoff(plugin: DesignPlugin): void {
  useAppStore.getState().setExportDialogOpen(true);
  toast.success(`${plugin.name} opened`);
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

export function executePluginAction(plugin: DesignPlugin): void {
  const { x: cx, y: cy } = getViewportCenter();

  switch (plugin.category) {
    case 'shapes':
      handleShapes(plugin, cx, cy);
      break;
    case 'charts':
      handleCharts(plugin, cx, cy);
      break;
    case 'icons':
      handleIcons(plugin, cx, cy);
      break;
    case 'layout':
      handleLayout(plugin, cx, cy);
      break;
    case 'wireframe':
      handleWireframe(plugin, cx, cy);
      break;
    case 'diagrams':
      handleDiagrams(plugin, cx, cy);
      break;
    case 'text':
      handleText(plugin, cx, cy);
      break;
    case 'images':
      handleImages(plugin, cx, cy);
      break;
    case 'colors':
      handleColors(plugin, cx, cy);
      break;
    case 'export':
      handleExport(plugin);
      return; // already toasts
    case 'templates':
      handleTemplates(plugin, cx, cy);
      break;
    case 'ai-tools':
      handleAITools(plugin);
      return; // already toasts
    case 'collaboration':
      handleCollaboration(plugin);
      return; // already toasts
    case 'accessibility':
      handleAccessibility(plugin, cx, cy);
      break;
    case 'math':
      handleMath(plugin, cx, cy);
      break;
    case 'typography':
      handleTypography(plugin, cx, cy);
      break;
    case 'branding':
      handleBranding(plugin, cx, cy);
      break;
    case 'animation':
      handleAnimation(plugin, cx, cy);
      break;
    case 'prototyping':
      handlePrototyping(plugin);
      return; // already toasts
    case '3d':
      handle3D(plugin, cx, cy);
      break;
    case 'illustration':
      handleIllustration(plugin, cx, cy);
      break;
    case 'photo-editing':
      handlePhotoEditing(plugin);
      return; // already toasts
    case 'responsive':
      handleResponsive(plugin, cx, cy);
      break;
    case 'code-gen':
      handleCodeGen(plugin, cx, cy);
      break;
    case 'handoff':
      handleHandoff(plugin);
      return; // already toasts
    default:
      toast.info(`Plugin "${plugin.name}" has no action defined`);
      return;
  }

  toast.success(`${plugin.name} applied`);
}