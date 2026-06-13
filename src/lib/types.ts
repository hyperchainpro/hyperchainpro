// ─── Element & Board Types ───────────────────────────────────────────────────

export type ElementType =
  | 'STICKY_NOTE' | 'RECTANGLE' | 'CIRCLE' | 'LINE' | 'TEXT' | 'CONNECTOR' | 'IMAGE'
  | 'FRAME' | 'ELLIPSE' | 'STAR' | 'POLYGON' | 'PEN_PATH';

export type BoardRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'REVIEWER' | 'VIEWER';
export type MergeStatus = 'OPEN' | 'APPROVED' | 'REJECTED' | 'MERGED' | 'CONFLICT';
export type ViewMode = 'dashboard' | 'editor' | 'community';
export type EditorMode = 'design' | 'prototype';
export type LeftPanelTab = 'layers' | 'assets';

export type RightPanelTab = 'design' | 'prototype' | 'history' | 'branches' | 'merges' | 'comments' | 'members';

export type CanvasTool =
  | 'SELECT' | 'HAND' | 'STICKY_NOTE' | 'RECTANGLE' | 'CIRCLE' | 'ELLIPSE'
  | 'STAR' | 'POLYGON' | 'LINE' | 'TEXT' | 'CONNECTOR' | 'IMAGE'
  | 'FRAME' | 'PEN_TOOL';

export type ConnectorStyle = 'curve' | 'straight';
export type StickyColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple' | 'orange';

export type SelectionBox = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

// ─── Enhanced Style System (Figma-like) ──────────────────────────────────────

export type FillType = 'solid' | 'linear-gradient' | 'radial-gradient' | 'image' | 'none';

export interface GradientStop {
  color: string;
  position: number; // 0-1
}

export interface Fill {
  id: string;
  type: FillType;
  color?: string;
  opacity?: number;
  gradientStops?: GradientStop[];
  gradientAngle?: number;
  imageSrc?: string;
}

export type StrokeAlign = 'center' | 'inside' | 'outside';
export type StrokeCap = 'butt' | 'round' | 'square';
export type StrokeJoin = 'miter' | 'round' | 'bevel';

export interface Stroke {
  id: string;
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
  align: StrokeAlign;
  cap: StrokeCap;
  join: StrokeJoin;
  opacity?: number;
}

export type ShadowType = 'drop-shadow' | 'inner-shadow' | 'layer-blur';

export interface ShadowEffect {
  id: string;
  type: ShadowType;
  color: string;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  visible: boolean;
}

export interface BlurEffect {
  id: string;
  type: 'layer-blur' | 'background-blur';
  value: number;
  visible: boolean;
}

export interface TypographyStyles {
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  lineHeight: number;
  letterSpacing: number;
  textDecoration: 'none' | 'underline' | 'line-through';
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  fontStyle: 'normal' | 'italic';
  textCase: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export type FlexDirection = 'horizontal' | 'vertical';
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch';
export type FlexJustify = 'start' | 'center' | 'end' | 'space-between' | 'space-around';

export interface AutoLayout {
  enabled: boolean;
  direction: FlexDirection;
  gap: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  alignItems: FlexAlign;
  justifyContent: FlexJustify;
  wrap: boolean;
}

export interface CornerRadius {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}

export interface LayoutConstraints {
  horizontal: 'left' | 'right' | 'center' | 'left-right' | 'scale';
  vertical: 'top' | 'bottom' | 'center' | 'top-bottom' | 'scale';
}

export type ExportFormat = 'png' | 'jpg' | 'svg' | 'pdf' | 'webp';

export interface ExportSetting {
  format: ExportFormat;
  scale: number;
  suffix: string;
}

export interface ElementStyles {
  fills?: Fill[];
  strokes?: Stroke[];
  shadows?: ShadowEffect[];
  blurs?: BlurEffect[];
  typography?: TypographyStyles;
  autoLayout?: AutoLayout;
  constraints?: LayoutConstraints;
  cornerRadius?: CornerRadius;
  // Legacy compat
  fontSize?: number;
  fontWeight?: string;
  textAlign?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: string;
  opacity?: number;
  fillOpacity?: number;
  lineStyle?: string;
  connectorStyle?: string;
  arrowHead?: boolean;
  fontStyle?: string;
  src?: string;
  x2?: number;
  y2?: number;
  pathData?: string;
  pointCount?: number;
  innerRadius?: number;
  frameClip?: boolean;
  frameScroll?: boolean;
  frameDevice?: string;
  exportSettings?: ExportSetting[];
  [key: string]: unknown;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const GRID_SIZE = 20;
export const SNAP_THRESHOLD = 20;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5;

export const STICKY_COLORS: Record<StickyColor, string> = {
  yellow: '#FEF3C7',
  green: '#D1FAE5',
  blue: '#DBEAFE',
  pink: '#FCE7F3',
  purple: '#EDE9FE',
  orange: '#FFEDD5',
};

export const ELEMENT_DEFAULTS: Record<ElementType, { width: number; height: number; color: string }> = {
  STICKY_NOTE: { width: 200, height: 160, color: STICKY_COLORS.yellow },
  RECTANGLE: { width: 180, height: 120, color: '#FFFFFF' },
  CIRCLE: { width: 140, height: 140, color: '#FFFFFF' },
  LINE: { width: 200, height: 4, color: '#374151' },
  TEXT: { width: 200, height: 40, color: 'transparent' },
  CONNECTOR: { width: 200, height: 100, color: '#374151' },
  IMAGE: { width: 240, height: 180, color: 'transparent' },
  FRAME: { width: 375, height: 812, color: '#FFFFFF' },
  ELLIPSE: { width: 160, height: 120, color: '#FFFFFF' },
  STAR: { width: 120, height: 120, color: '#FCD34D' },
  POLYGON: { width: 120, height: 120, color: '#6EE7B7' },
  PEN_PATH: { width: 200, height: 200, color: '#374151' },
};

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createDefaultElement(
  type: ElementType,
  x: number,
  y: number,
  overrides?: Partial<BoardElement>,
): BoardElement {
  const defaults = ELEMENT_DEFAULTS[type];
  const baseStyles: Partial<ElementStyles> = {};

  if (type === 'RECTANGLE' || type === 'FRAME') {
    baseStyles.fills = [{ id: `fill-${Date.now()}`, type: 'solid', color: defaults.color, opacity: 1 }];
    baseStyles.strokes = [];
    baseStyles.shadows = [];
    baseStyles.cornerRadius = { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 };
  }

  if (type === 'TEXT') {
    baseStyles.typography = {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 16,
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 0,
      textDecoration: 'none',
      color: '#1F2937',
      textAlign: 'left',
      fontStyle: 'normal',
      textCase: 'none',
    };
  }

  return {
    id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    x: Math.round(x),
    y: Math.round(y),
    width: defaults.width,
    height: defaults.height,
    rotation: 0,
    content: type === 'STICKY_NOTE' ? '' : type === 'TEXT' ? 'Text' : type === 'FRAME' ? 'Frame' : '',
    color: overrides?.color ?? defaults.color,
    zIndex: 0,
    locked: false,
    visible: true,
    name: undefined,
    groupId: undefined,
    parentId: undefined,
    componentId: undefined,
    componentOverrides: undefined,
    styles: { ...baseStyles },
    ...overrides,
  };
}

// ─── Board Element ───────────────────────────────────────────────────────────

export interface BoardElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content: string;
  color: string;
  zIndex: number;
  locked: boolean;
  visible?: boolean;
  name?: string;
  groupId?: string;
  parentId?: string;
  componentId?: string;
  componentOverrides?: Record<string, unknown>;
  styles?: ElementStyles;
  sourceId?: string;
  targetId?: string;
  sourceAnchor?: { x: number; y: number };
  targetAnchor?: { x: number; y: number };
}

// ─── Board ───────────────────────────────────────────────────────────────────

export interface Board {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  isPublic: boolean;
  thumbnail?: string;
  defaultBranch: string;
  branchProtection: boolean;
  minReviewers: number;
  createdAt: string;
  updatedAt: string;
  members?: BoardMember[];
  branches?: BranchInfo[];
  commits?: CommitInfo[];
  mergeRequests?: MergeRequestInfo[];
}

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  role: BoardRole;
  joinedAt: string;
  user?: { id: string; name: string; email: string; avatar?: string };
}

export interface BranchInfo {
  id: string;
  boardId: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  headCommit?: CommitInfo;
}

/** @deprecated Use BranchInfo instead. Kept for backward compatibility. */
export type Branch = BranchInfo;

export interface CommitInfo {
  id: string;
  boardId: string;
  branchId: string;
  authorId: string;
  message: string;
  tag?: string;
  parentId?: string;
  createdAt: string;
  author?: { id: string; name: string; email: string; avatar?: string };
}

export interface MergeRequestInfo {
  id: string;
  boardId: string;
  sourceBranchId: string;
  targetBranchId: string;
  title: string;
  description?: string;
  authorId: string;
  status: MergeStatus;
  conflictData?: string;
  createdAt: string;
  resolvedAt?: string;
  author?: { id: string; name: string; email: string; avatar?: string };
  sourceBranch?: { id: string; name: string };
  targetBranch?: { id: string; name: string };
}

export interface PresenceUser {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  cursor?: { x: number; y: number };
  currentElement?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  elements: Omit<BoardElement, 'id'>[];
}

// ─── Component System ────────────────────────────────────────────────────────

export interface ComponentDefinition {
  id: string;
  name: string;
  description?: string;
  masterElementId: string;
  childElementIds: string[];
  thumbnail?: string;
  variants?: ComponentVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ComponentVariant {
  id: string;
  name: string;
  property: string;
  instanceOverrides: Record<string, unknown>;
}

// ─── Prototype System ────────────────────────────────────────────────────────

export type PrototypeTrigger = 'on_click' | 'on_drag' | 'on_hover' | 'on_press' | 'on_timer' | 'on_scroll';
export type TransitionType = 'instant' | 'dissolve' | 'smart_animate' | 'slide_left' | 'slide_right' | 'slide_up' | 'slide_down' | 'push_left' | 'push_right';
export type EasingType = 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';

export interface PrototypeInteraction {
  id: string;
  sourceFrameId: string;
  targetFrameId: string;
  trigger: PrototypeTrigger;
  triggerElementId?: string;
  transition: TransitionType;
  duration: number;
  easing: EasingType;
  preserveScrollPosition?: boolean;
  navigationType?: 'navigate' | 'overlay' | 'swap';
  overlayPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

// ─── Device Templates ────────────────────────────────────────────────────────

export interface DeviceTemplate {
  id: string;
  name: string;
  category: 'phone' | 'tablet' | 'desktop' | 'presentation' | 'custom';
  width: number;
  height: number;
  statusBarHeight?: number;
  homeIndicatorHeight?: number;
}

// ─── Alignment Guide ─────────────────────────────────────────────────────────

export interface AlignmentGuide {
  axis: 'x' | 'y';
  position: number;
  type: 'edge' | 'center' | 'gap';
  elements: string[];
}

// ─── Layer Tree ──────────────────────────────────────────────────────────────

export interface LayerTreeNode {
  element: BoardElement;
  children: LayerTreeNode[];
  depth: number;
  isExpanded: boolean;
}

// ─── Plugin System ───────────────────────────────────────────────────────────

export type PluginPermission = 'canvas:read' | 'canvas:write' | 'selection:read' | 'selection:write' | 'ui:panel' | 'export' | 'network';

export interface PluginMenuItem {
  label: string;
  action: string;
  shortcut?: string;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  icon?: string;
  permissions: PluginPermission[];
  menuItems: PluginMenuItem[];
}

export interface BuiltInPlugin {
  manifest: PluginManifest;
  enabled: boolean;
}
