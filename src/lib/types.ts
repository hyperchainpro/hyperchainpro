// ─── Element & Board Types ───────────────────────────────────────────────────

export type ElementType =
  | 'STICKY_NOTE'
  | 'RECTANGLE'
  | 'CIRCLE'
  | 'LINE'
  | 'TEXT'
  | 'CONNECTOR'
  | 'IMAGE';

export type BoardRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'REVIEWER' | 'VIEWER';

export type MergeStatus = 'OPEN' | 'APPROVED' | 'REJECTED' | 'MERGED' | 'CONFLICT';

export type ViewMode = 'dashboard' | 'editor';

export type RightPanelTab = 'history' | 'branches' | 'merges' | 'comments' | 'members';

export type CanvasTool =
  | 'SELECT'
  | 'HAND'
  | 'STICKY_NOTE'
  | 'RECTANGLE'
  | 'CIRCLE'
  | 'LINE'
  | 'TEXT'
  | 'CONNECTOR'
  | 'IMAGE';

export type ConnectorStyle = 'curve' | 'straight';

export type StickyColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple' | 'orange';

export type SelectionBox = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

export interface ElementStyles {
  fontSize?: number;
  fontWeight?: string;
  textAlign?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: string;
  opacity?: number;
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
};

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createDefaultElement(
  type: ElementType,
  x: number,
  y: number,
  overrides?: Partial<BoardElement>,
): BoardElement {
  const defaults = ELEMENT_DEFAULTS[type];
  return {
    id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    x: Math.round(x),
    y: Math.round(y),
    width: defaults.width,
    height: defaults.height,
    rotation: 0,
    content: type === 'STICKY_NOTE' ? '' : type === 'TEXT' ? 'Text' : '',
    color: overrides?.color ?? defaults.color,
    zIndex: 0,
    locked: false,
    styles: {},
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
  groupId?: string;
  styles?: ElementStyles;
  // Connector specific
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
  branches?: Branch[];
  commits?: CommitInfo[];
  mergeRequests?: MergeRequestInfo[];
}

// ─── Board Member ────────────────────────────────────────────────────────────

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  role: BoardRole;
  joinedAt: string;
  user?: { id: string; name: string; email: string; avatar?: string };
}

// ─── Branch ──────────────────────────────────────────────────────────────────

export interface Branch {
  id: string;
  boardId: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  headCommit?: CommitInfo;
}

// ─── Commit ──────────────────────────────────────────────────────────────────

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

// ─── Merge Request ───────────────────────────────────────────────────────────

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

// ─── Presence (real-time collaboration) ─────────────────────────────────────

export interface PresenceUser {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  cursor?: { x: number; y: number };
  currentElement?: string;
}

// ─── Template ────────────────────────────────────────────────────────────────

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  elements: Omit<BoardElement, 'id'>[];
}