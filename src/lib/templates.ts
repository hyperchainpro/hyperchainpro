import type { BoardElement } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// Template Data — 7 pre-built board templates with complete element layouts
// ═══════════════════════════════════════════════════════════════════════════════

// ── Shared Helpers ──────────────────────────────────────────────────────────

let _fillIdx = 0;
let _strokeIdx = 0;
function fill(color: string, opacity = 1) {
  return [{ id: `f-tpl-${++_fillIdx}`, type: 'solid' as const, color, opacity }];
}

function stroke(color: string, width = 2, style: 'solid' | 'dashed' = 'solid') {
  return [{ id: `s-tpl-${++_strokeIdx}`, color, width, style, align: 'inside' as const, cap: 'round' as const, join: 'round' as const }];
}

function typo(color: string, size = 14, weight: number | string = 400, align: 'left' | 'center' | 'right' = 'left') {
  return {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: size,
    fontWeight: weight,
    lineHeight: 1.5,
    letterSpacing: 0,
    textDecoration: 'none' as const,
    color,
    textAlign: align,
    fontStyle: 'normal' as const,
    textCase: 'none' as const,
  };
}

const cr = (r: number) => ({ topLeft: r, topRight: r, bottomRight: r, bottomLeft: r });

// ── 1. FLOWCHART ────────────────────────────────────────────────────────────
const flowchart: BoardElement[] = [
  { id: 'tmpl-fc-0', type: 'TEXT', x: 275, y: 20, width: 250, height: 32, rotation: 0, content: 'User Onboarding Flow', color: 'transparent', zIndex: 20, locked: false, visible: true, name: 'Title', styles: { typography: typo('#1E293B', 20, 700, 'center') } },
  { id: 'tmpl-fc-1', type: 'RECTANGLE', x: 330, y: 70, width: 140, height: 46, rotation: 0, content: '', color: '#FFFFFF', zIndex: 2, locked: false, visible: true, name: 'Start Node', styles: { fills: fill('#10B981'), cornerRadius: cr(23) } },
  { id: 'tmpl-fc-2', type: 'TEXT', x: 345, y: 78, width: 110, height: 30, rotation: 0, content: 'Start', color: 'transparent', zIndex: 21, locked: false, visible: true, name: 'Start Label', styles: { typography: typo('#FFFFFF', 15, 600, 'center') } },
  { id: 'tmpl-fc-3', type: 'LINE', x: 400, y: 116, width: 2, height: 34, rotation: 0, content: '', color: '#64748B', zIndex: 1, locked: false, visible: true, name: 'Arrow 1', styles: { x2: 0, y2: 34, arrowHead: true } },
  { id: 'tmpl-fc-4', type: 'RECTANGLE', x: 310, y: 150, width: 180, height: 54, rotation: 0, content: '', color: '#FFFFFF', zIndex: 2, locked: false, visible: true, name: 'Sign Up Box', styles: { fills: fill('#EFF6FF'), strokes: stroke('#3B82F6', 2), cornerRadius: cr(8) } },
  { id: 'tmpl-fc-5', type: 'TEXT', x: 320, y: 161, width: 160, height: 32, rotation: 0, content: 'Sign Up', color: 'transparent', zIndex: 21, locked: false, visible: true, name: 'Sign Up Label', styles: { typography: typo('#1E40AF', 15, 600, 'center') } },
  { id: 'tmpl-fc-6', type: 'LINE', x: 400, y: 204, width: 2, height: 26, rotation: 0, content: '', color: '#64748B', zIndex: 1, locked: false, visible: true, name: 'Arrow 2', styles: { x2: 0, y2: 26, arrowHead: true } },
  { id: 'tmpl-fc-7', type: 'RECTANGLE', x: 300, y: 230, width: 200, height: 54, rotation: 0, content: '', color: '#FFFFFF', zIndex: 2, locked: false, visible: true, name: 'Verify Email Box', styles: { fills: fill('#EFF6FF'), strokes: stroke('#3B82F6', 2), cornerRadius: cr(8) } },
  { id: 'tmpl-fc-8', type: 'TEXT', x: 310, y: 241, width: 180, height: 32, rotation: 0, content: 'Verify Email', color: 'transparent', zIndex: 21, locked: false, visible: true, name: 'Verify Label', styles: { typography: typo('#1E40AF', 15, 600, 'center') } },
  { id: 'tmpl-fc-9', type: 'LINE', x: 400, y: 284, width: 2, height: 16, rotation: 0, content: '', color: '#64748B', zIndex: 1, locked: false, visible: true, name: 'Arrow 3', styles: { x2: 0, y2: 16, arrowHead: true } },
  { id: 'tmpl-fc-10', type: 'RECTANGLE', x: 372, y: 312, width: 56, height: 56, rotation: 45, content: '', color: '#FFFFFF', zIndex: 3, locked: false, visible: true, name: 'Decision Diamond', styles: { fills: fill('#FEF3C7'), strokes: stroke('#F59E0B', 2), cornerRadius: cr(4) } },
  { id: 'tmpl-fc-11', type: 'TEXT', x: 375, y: 327, width: 50, height: 24, rotation: 0, content: 'Valid?', color: 'transparent', zIndex: 22, locked: false, visible: true, name: 'Decision Label', styles: { typography: typo('#92400E', 12, 600, 'center') } },
  { id: 'tmpl-fc-12', type: 'TEXT', x: 406, y: 376, width: 32, height: 20, rotation: 0, content: 'Yes', color: 'transparent', zIndex: 22, locked: false, visible: true, name: 'Yes', styles: { typography: typo('#059669', 12, 700) } },
  { id: 'tmpl-fc-13', type: 'LINE', x: 400, y: 392, width: 2, height: 28, rotation: 0, content: '', color: '#64748B', zIndex: 1, locked: false, visible: true, name: 'Arrow 4', styles: { x2: 0, y2: 28, arrowHead: true } },
  { id: 'tmpl-fc-14', type: 'TEXT', x: 446, y: 332, width: 26, height: 20, rotation: 0, content: 'No', color: 'transparent', zIndex: 22, locked: false, visible: true, name: 'No', styles: { typography: typo('#DC2626', 12, 700) } },
  { id: 'tmpl-fc-15', type: 'LINE', x: 440, y: 340, width: 90, height: 2, rotation: 0, content: '', color: '#64748B', zIndex: 1, locked: false, visible: true, name: 'Arrow 5', styles: { x2: 90, y2: 0, arrowHead: true } },
  { id: 'tmpl-fc-16', type: 'RECTANGLE', x: 530, y: 312, width: 170, height: 54, rotation: 0, content: '', color: '#FFFFFF', zIndex: 2, locked: false, visible: true, name: 'Resend Box', styles: { fills: fill('#FEF2F2'), strokes: stroke('#EF4444', 2), cornerRadius: cr(8) } },
  { id: 'tmpl-fc-17', type: 'TEXT', x: 540, y: 323, width: 150, height: 32, rotation: 0, content: 'Resend Email', color: 'transparent', zIndex: 21, locked: false, visible: true, name: 'Resend Label', styles: { typography: typo('#991B1B', 14, 600, 'center') } },
  { id: 'tmpl-fc-18', type: 'RECTANGLE', x: 310, y: 420, width: 180, height: 54, rotation: 0, content: '', color: '#FFFFFF', zIndex: 2, locked: false, visible: true, name: 'Profile Box', styles: { fills: fill('#EFF6FF'), strokes: stroke('#3B82F6', 2), cornerRadius: cr(8) } },
  { id: 'tmpl-fc-19', type: 'TEXT', x: 320, y: 431, width: 160, height: 32, rotation: 0, content: 'Set Up Profile', color: 'transparent', zIndex: 21, locked: false, visible: true, name: 'Profile Label', styles: { typography: typo('#1E40AF', 15, 600, 'center') } },
  { id: 'tmpl-fc-20', type: 'LINE', x: 400, y: 474, width: 2, height: 26, rotation: 0, content: '', color: '#64748B', zIndex: 1, locked: false, visible: true, name: 'Arrow 6', styles: { x2: 0, y2: 26, arrowHead: true } },
  { id: 'tmpl-fc-21', type: 'RECTANGLE', x: 310, y: 500, width: 180, height: 54, rotation: 0, content: '', color: '#FFFFFF', zIndex: 2, locked: false, visible: true, name: 'Welcome Box', styles: { fills: fill('#EFF6FF'), strokes: stroke('#3B82F6', 2), cornerRadius: cr(8) } },
  { id: 'tmpl-fc-22', type: 'TEXT', x: 320, y: 511, width: 160, height: 32, rotation: 0, content: 'Welcome Tour', color: 'transparent', zIndex: 21, locked: false, visible: true, name: 'Welcome Label', styles: { typography: typo('#1E40AF', 15, 600, 'center') } },
  { id: 'tmpl-fc-23', type: 'LINE', x: 400, y: 554, width: 2, height: 26, rotation: 0, content: '', color: '#64748B', zIndex: 1, locked: false, visible: true, name: 'Arrow 7', styles: { x2: 0, y2: 26, arrowHead: true } },
  { id: 'tmpl-fc-24', type: 'RECTANGLE', x: 330, y: 580, width: 140, height: 46, rotation: 0, content: '', color: '#FFFFFF', zIndex: 2, locked: false, visible: true, name: 'End Node', styles: { fills: fill('#10B981'), cornerRadius: cr(23) } },
  { id: 'tmpl-fc-25', type: 'TEXT', x: 345, y: 588, width: 110, height: 30, rotation: 0, content: 'End', color: 'transparent', zIndex: 21, locked: false, visible: true, name: 'End Label', styles: { typography: typo('#FFFFFF', 15, 600, 'center') } },
];

// ── 2. MINDMAP ──────────────────────────────────────────────────────────────
const MM_CX = 450, MM_CY = 300;
const mindmap: BoardElement[] = [
  { id: 'tmpl-mm-0', type: 'TEXT', x: 350, y: 15, width: 200, height: 28, rotation: 0, content: 'Product Launch Strategy', color: 'transparent', zIndex: 20, locked: false, visible: true, name: 'Title', styles: { typography: typo('#1E293B', 18, 700, 'center') } },
  // Center node
  { id: 'tmpl-mm-1', type: 'CIRCLE', x: MM_CX - 60, y: MM_CY - 60, width: 120, height: 120, rotation: 0, content: '', color: '#FFFFFF', zIndex: 10, locked: false, visible: true, name: 'Center Node', styles: { fills: fill('#6366F1'), cornerRadius: cr(60) } },
  { id: 'tmpl-mm-2', type: 'TEXT', x: MM_CX - 50, y: MM_CY - 14, width: 100, height: 28, rotation: 0, content: 'Product\nLaunch', color: 'transparent', zIndex: 21, locked: false, visible: true, name: 'Center Label', styles: { typography: typo('#FFFFFF', 14, 700, 'center') } },
  // Branch 1: Marketing (top-right) — purple
  { id: 'tmpl-mm-3', type: 'LINE', x: MM_CX + 60, y: MM_CY - 30, width: 80, height: 0, rotation: 0, content: '', color: '#8B5CF6', zIndex: 1, locked: false, visible: true, name: 'Branch 1 Line', styles: { x2: 80, y2: -80, strokeWidth: 3 } },
  { id: 'tmpl-mm-4', type: 'RECTANGLE', x: MM_CX + 120, y: MM_CY - 160, width: 130, height: 40, rotation: 0, content: '', color: '#FFFFFF', zIndex: 5, locked: false, visible: true, name: 'Marketing Node', styles: { fills: fill('#8B5CF6'), cornerRadius: cr(20) } },
  { id: 'tmpl-mm-5', type: 'TEXT', x: MM_CX + 130, y: MM_CY - 152, width: 110, height: 24, rotation: 0, content: 'Marketing', color: 'transparent', zIndex: 21, locked: false, visible: true, name: 'Marketing Label', styles: { typography: typo('#FFFFFF', 13, 600, 'center') } },
  { id: 'tmpl-mm-6', type: 'TEXT', x: MM_CX + 260, y: MM_CY - 170, width: 90, height: 20, rotation: 0, content: 'Social Media', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'SM Sub', styles: { typography: typo('#6D28D9', 11, 400) } },
  { id: 'tmpl-mm-7', type: 'TEXT', x: MM_CX + 260, y: MM_CY - 145, width: 90, height: 20, rotation: 0, content: 'Content Plan', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'CP Sub', styles: { typography: typo('#6D28D9', 11, 400) } },
  // Branch 2: Development (right) — blue
  { id: 'tmpl-mm-8', type: 'LINE', x: MM_CX + 60, y: MM_CY, width: 70, height: 0, rotation: 0, content: '', color: '#3B82F6', zIndex: 1, locked: false, visible: true, name: 'Branch 2 Line', styles: { x2: 70, y2: 0, strokeWidth: 3 } },
  { id: 'tmpl-mm-9', type: 'RECTANGLE', x: MM_CX + 140, y: MM_CY - 20, width: 130, height: 40, rotation: 0, content: '', color: '#FFFFFF', zIndex: 5, locked: false, visible: true, name: 'Dev Node', styles: { fills: fill('#3B82F6'), cornerRadius: cr(20) } },
  { id: 'tmpl-mm-10', type: 'TEXT', x: MM_CX + 150, y: MM_CY - 12, width: 110, height: 24, rotation: 0, content: 'Development', color: 'transparent', zIndex: 21, locked: false, visible: true, name: 'Dev Label', styles: { typography: typo('#FFFFFF', 13, 600, 'center') } },
  { id: 'tmpl-mm-11', type: 'TEXT', x: MM_CX + 280, y: MM_CY - 28, width: 80, height: 20, rotation: 0, content: 'Frontend', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'FE Sub', styles: { typography: typo('#1E40AF', 11, 400) } },
  { id: 'tmpl-mm-12', type: 'TEXT', x: MM_CX + 280, y: MM_CY - 3, width: 80, height: 20, rotation: 0, content: 'Backend API', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'BE Sub', styles: { typography: typo('#1E40AF', 11, 400) } },
  { id: 'tmpl-mm-13', type: 'TEXT', x: MM_CX + 280, y: MM_CY + 22, width: 80, height: 20, rotation: 0, content: 'Testing', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Test Sub', styles: { typography: typo('#1E40AF', 11, 400) } },
  // Branch 3: Design (bottom-right) — orange
  { id: 'tmpl-mm-14', type: 'LINE', x: MM_CX + 50, y: MM_CY + 50, width: 70, height: 0, rotation: 0, content: '', color: '#F97316', zIndex: 1, locked: false, visible: true, name: 'Branch 3 Line', styles: { x2: 70, y2: 80, strokeWidth: 3 } },
  { id: 'tmpl-mm-15', type: 'RECTANGLE', x: MM_CX + 110, y: MM_CY + 110, width: 100, height: 40, rotation: 0, content: '', color: '#FFFFFF', zIndex: 5, locked: false, visible: true, name: 'Design Node', styles: { fills: fill('#F97316'), cornerRadius: cr(20) } },
  { id: 'tmpl-mm-16', type: 'TEXT', x: MM_CX + 118, y: MM_CY + 118, width: 84, height: 24, rotation: 0, content: 'Design', color: 'transparent', zIndex: 21, locked: false, visible: true, name: 'Design Label', styles: { typography: typo('#FFFFFF', 13, 600, 'center') } },
  { id: 'tmpl-mm-17', type: 'TEXT', x: MM_CX + 220, y: MM_CY + 100, width: 100, height: 20, rotation: 0, content: 'UI/UX Research', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'UI Sub', styles: { typography: typo('#C2410C', 11, 400) } },
  { id: 'tmpl-mm-18', type: 'TEXT', x: MM_CX + 220, y: MM_CY + 125, width: 80, height: 20, rotation: 0, content: 'Prototyping', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Proto Sub', styles: { typography: typo('#C2410C', 11, 400) } },
  // Branch 4: Budget (bottom-left) — green
  { id: 'tmpl-mm-19', type: 'LINE', x: MM_CX - 50, y: MM_CY + 50, width: 60, height: 0, rotation: 0, content: '', color: '#22C55E', zIndex: 1, locked: false, visible: true, name: 'Branch 4 Line', styles: { x2: -60, y2: 70, strokeWidth: 3 } },
  { id: 'tmpl-mm-20', type: 'RECTANGLE', x: MM_CX - 180, y: MM_CY + 100, width: 100, height: 40, rotation: 0, content: '', color: '#FFFFFF', zIndex: 5, locked: false, visible: true, name: 'Budget Node', styles: { fills: fill('#22C55E'), cornerRadius: cr(20) } },
  { id: 'tmpl-mm-21', type: 'TEXT', x: MM_CX - 172, y: MM_CY + 108, width: 84, height: 24, rotation: 0, content: 'Budget', color: 'transparent', zIndex: 21, locked: false, visible: true, name: 'Budget Label', styles: { typography: typo('#FFFFFF', 13, 600, 'center') } },
  { id: 'tmpl-mm-22', type: 'TEXT', x: MM_CX - 300, y: MM_CY + 95, width: 90, height: 20, rotation: 0, content: 'Cost Estimate', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Cost Sub', styles: { typography: typo('#15803D', 11, 400) } },
  { id: 'tmpl-mm-23', type: 'TEXT', x: MM_CX - 300, y: MM_CY + 120, width: 80, height: 20, rotation: 0, content: 'Revenue Plan', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Rev Sub', styles: { typography: typo('#15803D', 11, 400) } },
  // Branch 5: Launch (top-left) — rose
  { id: 'tmpl-mm-24', type: 'LINE', x: MM_CX - 50, y: MM_CY - 30, width: 60, height: 0, rotation: 0, content: '', color: '#F43F5E', zIndex: 1, locked: false, visible: true, name: 'Branch 5 Line', styles: { x2: -60, y2: -70, strokeWidth: 3 } },
  { id: 'tmpl-mm-25', type: 'RECTANGLE', x: MM_CX - 190, y: MM_CY - 140, width: 110, height: 40, rotation: 0, content: '', color: '#FFFFFF', zIndex: 5, locked: false, visible: true, name: 'Launch Node', styles: { fills: fill('#F43F5E'), cornerRadius: cr(20) } },
  { id: 'tmpl-mm-26', type: 'TEXT', x: MM_CX - 182, y: MM_CY - 132, width: 94, height: 24, rotation: 0, content: 'Go-Live', color: 'transparent', zIndex: 21, locked: false, visible: true, name: 'Launch Label', styles: { typography: typo('#FFFFFF', 13, 600, 'center') } },
  { id: 'tmpl-mm-27', type: 'TEXT', x: MM_CX - 320, y: MM_CY - 155, width: 100, height: 20, rotation: 0, content: 'Release Party', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Party Sub', styles: { typography: typo('#BE123C', 11, 400) } },
  { id: 'tmpl-mm-28', type: 'TEXT', x: MM_CX - 320, y: MM_CY - 130, width: 100, height: 20, rotation: 0, content: 'Press Release', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Press Sub', styles: { typography: typo('#BE123C', 11, 400) } },
];

// ── 3. WIREFRAME (Mobile App) ───────────────────────────────────────────────
const WF_X = 100, WF_Y = 40;
const wireframe: BoardElement[] = [
  // Phone frame
  { id: 'tmpl-wf-0', type: 'RECTANGLE', x: WF_X, y: WF_Y, width: 375, height: 812, rotation: 0, content: '', color: '#FFFFFF', zIndex: 0, locked: false, visible: true, name: 'Phone Frame', styles: { fills: fill('#FFFFFF'), strokes: stroke('#1E293B', 1), cornerRadius: cr(40) } },
  // Status bar
  { id: 'tmpl-wf-1', type: 'TEXT', x: WF_X + 24, y: WF_Y + 12, width: 60, height: 20, rotation: 0, content: '9:41', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Time', styles: { typography: typo('#1E293B', 14, 600, 'left') } },
  { id: 'tmpl-wf-2', type: 'RECTANGLE', x: WF_X + 120, y: WF_Y + 14, width: 120, height: 24, rotation: 0, content: '', color: '#1E293B', zIndex: 5, locked: false, visible: true, name: 'Notch', styles: { cornerRadius: cr(12) } },
  { id: 'tmpl-wf-3', type: 'TEXT', x: WF_X + 290, y: WF_Y + 12, width: 70, height: 20, rotation: 0, content: '100%  🔋', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Battery', styles: { typography: typo('#1E293B', 12, 400, 'right') } },
  // Header
  { id: 'tmpl-wf-4', type: 'RECTANGLE', x: WF_X, y: WF_Y + 48, width: 375, height: 56, rotation: 0, content: '', color: '#F8FAFC', zIndex: 1, locked: false, visible: true, name: 'Header BG', styles: { fills: fill('#F8FAFC') } },
  { id: 'tmpl-wf-5', type: 'TEXT', x: WF_X + 56, y: WF_Y + 60, width: 200, height: 32, rotation: 0, content: 'Explore', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Header Title', styles: { typography: typo('#1E293B', 22, 700) } },
  { id: 'tmpl-wf-6', type: 'CIRCLE', x: WF_X + 311, y: WF_Y + 58, width: 40, height: 40, rotation: 0, content: '', color: '#E2E8F0', zIndex: 5, locked: false, visible: true, name: 'Avatar', styles: { fills: fill('#E2E8F0') } },
  // Search bar
  { id: 'tmpl-wf-7', type: 'RECTANGLE', x: WF_X + 20, y: WF_Y + 120, width: 335, height: 44, rotation: 0, content: '', color: '#F1F5F9', zIndex: 2, locked: false, visible: true, name: 'Search Bar', styles: { fills: fill('#F1F5F9'), cornerRadius: cr(12) } },
  { id: 'tmpl-wf-8', type: 'TEXT', x: WF_X + 44, y: WF_Y + 130, width: 200, height: 24, rotation: 0, content: 'Search destinations...', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Search Placeholder', styles: { typography: typo('#94A3B8', 14, 400) } },
  // Category pills
  { id: 'tmpl-wf-9', type: 'RECTANGLE', x: WF_X + 20, y: WF_Y + 180, width: 72, height: 32, rotation: 0, content: '', color: '#1E293B', zIndex: 3, locked: false, visible: true, name: 'Pill Active', styles: { fills: fill('#1E293B'), cornerRadius: cr(16) } },
  { id: 'tmpl-wf-10', type: 'TEXT', x: WF_X + 30, y: WF_Y + 186, width: 52, height: 20, rotation: 0, content: 'All', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Pill Active Text', styles: { typography: typo('#FFFFFF', 13, 600, 'center') } },
  { id: 'tmpl-wf-11', type: 'RECTANGLE', x: WF_X + 100, y: WF_Y + 180, width: 80, height: 32, rotation: 0, content: '', color: '#F1F5F9', zIndex: 3, locked: false, visible: true, name: 'Pill 2', styles: { fills: fill('#F1F5F9'), cornerRadius: cr(16) } },
  { id: 'tmpl-wf-12', type: 'TEXT', x: WF_X + 110, y: WF_Y + 186, width: 60, height: 20, rotation: 0, content: 'Popular', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Pill 2 Text', styles: { typography: typo('#64748B', 13, 400, 'center') } },
  { id: 'tmpl-wf-13', type: 'RECTANGLE', x: WF_X + 188, y: WF_Y + 180, width: 72, height: 32, rotation: 0, content: '', color: '#F1F5F9', zIndex: 3, locked: false, visible: true, name: 'Pill 3', styles: { fills: fill('#F1F5F9'), cornerRadius: cr(16) } },
  { id: 'tmpl-wf-14', type: 'TEXT', x: WF_X + 198, y: WF_Y + 186, width: 52, height: 20, rotation: 0, content: 'Trending', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Pill 3 Text', styles: { typography: typo('#64748B', 13, 400, 'center') } },
  // Card 1
  { id: 'tmpl-wf-15', type: 'RECTANGLE', x: WF_X + 20, y: WF_Y + 228, width: 335, height: 120, rotation: 0, content: '', color: '#F1F5F9', zIndex: 2, locked: false, visible: true, name: 'Card 1', styles: { fills: fill('#F1F5F9'), cornerRadius: cr(16) } },
  { id: 'tmpl-wf-16', type: 'RECTANGLE', x: WF_X + 20, y: WF_Y + 228, width: 120, height: 120, rotation: 0, content: '', color: '#E2E8F0', zIndex: 3, locked: false, visible: true, name: 'Card 1 Image', styles: { cornerRadius: { topLeft: 16, topRight: 0, bottomRight: 0, bottomLeft: 16 } } },
  { id: 'tmpl-wf-17', type: 'TEXT', x: WF_X + 152, y: WF_Y + 238, width: 190, height: 20, rotation: 0, content: 'Bali, Indonesia', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Card 1 Title', styles: { typography: typo('#1E293B', 16, 700) } },
  { id: 'tmpl-wf-18', type: 'TEXT', x: WF_X + 152, y: WF_Y + 262, width: 190, height: 16, rotation: 0, content: 'Beautiful temples & beaches', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Card 1 Desc', styles: { typography: typo('#94A3B8', 12, 400) } },
  { id: 'tmpl-wf-19', type: 'TEXT', x: WF_X + 152, y: WF_Y + 290, width: 60, height: 18, rotation: 0, content: '⭐ 4.8', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Card 1 Rating', styles: { typography: typo('#F59E0B', 13, 600) } },
  { id: 'tmpl-wf-20', type: 'TEXT', x: WF_X + 300, y: WF_Y + 318, width: 50, height: 18, rotation: 0, content: '$1,200', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Card 1 Price', styles: { typography: typo('#1E293B', 15, 700, 'right') } },
  // Card 2
  { id: 'tmpl-wf-21', type: 'RECTANGLE', x: WF_X + 20, y: WF_Y + 364, width: 335, height: 120, rotation: 0, content: '', color: '#F1F5F9', zIndex: 2, locked: false, visible: true, name: 'Card 2', styles: { fills: fill('#F1F5F9'), cornerRadius: cr(16) } },
  { id: 'tmpl-wf-22', type: 'RECTANGLE', x: WF_X + 20, y: WF_Y + 364, width: 120, height: 120, rotation: 0, content: '', color: '#E2E8F0', zIndex: 3, locked: false, visible: true, name: 'Card 2 Image', styles: { cornerRadius: { topLeft: 16, topRight: 0, bottomRight: 0, bottomLeft: 16 } } },
  { id: 'tmpl-wf-23', type: 'TEXT', x: WF_X + 152, y: WF_Y + 374, width: 190, height: 20, rotation: 0, content: 'Tokyo, Japan', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Card 2 Title', styles: { typography: typo('#1E293B', 16, 700) } },
  { id: 'tmpl-wf-24', type: 'TEXT', x: WF_X + 152, y: WF_Y + 398, width: 190, height: 16, rotation: 0, content: 'Modern city & culture', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Card 2 Desc', styles: { typography: typo('#94A3B8', 12, 400) } },
  { id: 'tmpl-wf-25', type: 'TEXT', x: WF_X + 152, y: WF_Y + 426, width: 60, height: 18, rotation: 0, content: '⭐ 4.9', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Card 2 Rating', styles: { typography: typo('#F59E0B', 13, 600) } },
  { id: 'tmpl-wf-26', type: 'TEXT', x: WF_X + 300, y: WF_Y + 454, width: 50, height: 18, rotation: 0, content: '$2,100', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Card 2 Price', styles: { typography: typo('#1E293B', 15, 700, 'right') } },
  // Bottom Tab Bar
  { id: 'tmpl-wf-27', type: 'RECTANGLE', x: WF_X, y: WF_Y + 732, width: 375, height: 80, rotation: 0, content: '', color: '#FFFFFF', zIndex: 5, locked: false, visible: true, name: 'Tab Bar', styles: { fills: fill('#FFFFFF'), strokes: stroke('#E2E8F0', 1) } },
  { id: 'tmpl-wf-28', type: 'TEXT', x: WF_X + 30, y: WF_Y + 750, width: 60, height: 36, rotation: 0, content: '🏠\nHome', color: 'transparent', zIndex: 6, locked: false, visible: true, name: 'Tab Home', styles: { typography: typo('#6366F1', 10, 600, 'center') } },
  { id: 'tmpl-wf-29', type: 'TEXT', x: WF_X + 110, y: WF_Y + 750, width: 60, height: 36, rotation: 0, content: '🔍\nSearch', color: 'transparent', zIndex: 6, locked: false, visible: true, name: 'Tab Search', styles: { typography: typo('#94A3B8', 10, 400, 'center') } },
  { id: 'tmpl-wf-30', type: 'TEXT', x: WF_X + 195, y: WF_Y + 750, width: 60, height: 36, rotation: 0, content: '❤️\nSaved', color: 'transparent', zIndex: 6, locked: false, visible: true, name: 'Tab Saved', styles: { typography: typo('#94A3B8', 10, 400, 'center') } },
  { id: 'tmpl-wf-31', type: 'TEXT', x: WF_X + 275, y: WF_Y + 750, width: 60, height: 36, rotation: 0, content: '👤\nProfile', color: 'transparent', zIndex: 6, locked: false, visible: true, name: 'Tab Profile', styles: { typography: typo('#94A3B8', 10, 400, 'center') } },
  // Home indicator
  { id: 'tmpl-wf-32', type: 'RECTANGLE', x: WF_X + 130, y: WF_Y + 790, width: 115, height: 4, rotation: 0, content: '', color: '#1E293B', zIndex: 6, locked: false, visible: true, name: 'Home Indicator', styles: { cornerRadius: cr(2) } },
];

// ── 4. KANBAN ───────────────────────────────────────────────────────────────
const KB_W = 260, KB_GAP = 16, KB_X0 = 40, KB_Y0 = 50;
const KB_C2 = KB_X0 + KB_W + KB_GAP, KB_C3 = KB_C2 + KB_W + KB_GAP, KB_C4 = KB_C3 + KB_W + KB_GAP;

function kbCol(x: number, title: string, count: string, color: string): BoardElement[] {
  const id = (i: number) => `tmpl-kb-${title.toLowerCase().replace(/\s/g,'')}-${i}`;
  const cards: BoardElement[] = [
    { id: id(0), type: 'RECTANGLE', x, y: KB_Y0, width: KB_W, height: 520, rotation: 0, content: '', color: '#FFFFFF', zIndex: 0, locked: false, visible: true, name: `${title} Column`, styles: { fills: fill('#F8FAFC'), cornerRadius: cr(12) } },
    { id: id(1), type: 'TEXT', x: x + 16, y: KB_Y0 + 12, width: 80, height: 28, rotation: 0, content: title, color: 'transparent', zIndex: 10, locked: false, visible: true, name: `${title} Header`, styles: { typography: typo('#334155', 15, 700) } },
    { id: id(2), type: 'TEXT', x: x + KB_W - 46, y: KB_Y0 + 12, width: 30, height: 28, rotation: 0, content: count, color: 'transparent', zIndex: 10, locked: false, visible: true, name: `${title} Count`, styles: { typography: typo('#94A3B8', 14, 500, 'center') } },
  ];
  return cards;
}

function kbCard(x: number, y: number, baseId: string, title: string, desc: string, tag: string, tagColor: string, avatarColor: string): BoardElement[] {
  return [
    { id: baseId, type: 'RECTANGLE', x, y, width: KB_W - 24, height: 110, rotation: 0, content: '', color: '#FFFFFF', zIndex: 5, locked: false, visible: true, name: `${title} Card`, styles: { fills: fill('#FFFFFF'), cornerRadius: cr(10) } },
    { id: `${baseId}-tag`, type: 'RECTANGLE', x: x + 10, y: y + 10, width: 52, height: 20, rotation: 0, content: '', color: tagColor, zIndex: 10, locked: false, visible: true, name: 'Tag', styles: { fills: fill(tagColor), cornerRadius: cr(6) } },
    { id: `${baseId}-tag-t`, type: 'TEXT', x: x + 14, y: y + 11, width: 44, height: 18, rotation: 0, content: tag, color: 'transparent', zIndex: 11, locked: false, visible: true, name: 'Tag Text', styles: { typography: typo('#FFFFFF', 10, 600, 'center') } },
    { id: `${baseId}-title`, type: 'TEXT', x: x + 10, y: y + 36, width: KB_W - 44, height: 22, rotation: 0, content: title, color: 'transparent', zIndex: 10, locked: false, visible: true, name: 'Card Title', styles: { typography: typo('#1E293B', 13, 600) } },
    { id: `${baseId}-desc`, type: 'TEXT', x: x + 10, y: y + 58, width: KB_W - 44, height: 30, rotation: 0, content: desc, color: 'transparent', zIndex: 10, locked: false, visible: true, name: 'Card Desc', styles: { typography: typo('#94A3B8', 11, 400) } },
    { id: `${baseId}-avatar`, type: 'CIRCLE', x: x + 10, y: y + 84, width: 22, height: 22, rotation: 0, content: '', color: avatarColor, zIndex: 10, locked: false, visible: true, name: 'Avatar', styles: { fills: fill(avatarColor) } },
  ];
}

const kanban: BoardElement[] = [
  { id: 'tmpl-kb-title', type: 'TEXT', x: KB_X0, y: 14, width: 300, height: 28, rotation: 0, content: 'Sprint Board — Q4 Planning', color: 'transparent', zIndex: 20, locked: false, visible: true, name: 'Board Title', styles: { typography: typo('#1E293B', 18, 700) } },
  ...kbCol(KB_X0, 'To Do', '3', '#64748B'),
  ...kbCard(KB_X0 + 12, KB_Y0 + 50, 'tmpl-kb-todo-1', 'Design system audit', 'Review all components for consistency', 'Design', '#8B5CF6', '#A78BFA'),
  ...kbCard(KB_X0 + 12, KB_Y0 + 172, 'tmpl-kb-todo-2', 'API documentation', 'Write docs for all endpoints', 'Backend', '#3B82F6', '#60A5FA'),
  ...kbCard(KB_X0 + 12, KB_Y0 + 294, 'tmpl-kb-todo-3', 'User research', 'Conduct 5 user interviews', 'Research', '#22C55E', '#4ADE80'),
  ...kbCol(KB_C2, 'In Progress', '2', '#F59E0B'),
  ...kbCard(KB_C2 + 12, KB_Y0 + 50, 'tmpl-kb-wip-1', 'Auth flow redesign', 'New login & signup screens', 'Frontend', '#F97316', '#FB923C'),
  ...kbCard(KB_C2 + 12, KB_Y0 + 172, 'tmpl-kb-wip-2', 'Database migration', 'Migrate from SQLite to PostgreSQL', 'DevOps', '#EF4444', '#F87171'),
  ...kbCol(KB_C3, 'Review', '2', '#8B5CF6'),
  ...kbCard(KB_C3 + 12, KB_Y0 + 50, 'tmpl-kb-rev-1', 'Dashboard charts', 'Add interactive chart components', 'Feature', '#06B6D4', '#22D3EE'),
  ...kbCard(KB_C3 + 12, KB_Y0 + 172, 'tmpl-kb-rev-2', 'Notification system', 'Real-time push notifications', 'Feature', '#06B6D4', '#22D3EE'),
  ...kbCol(KB_C4, 'Done', '2', '#22C55E'),
  ...kbCard(KB_C4 + 12, KB_Y0 + 50, 'tmpl-kb-done-1', 'Onboarding flow', 'Complete signup wizard', 'UX', '#10B981', '#34D399'),
  ...kbCard(KB_C4 + 12, KB_Y0 + 172, 'tmpl-kb-done-2', 'CI/CD pipeline', 'GitHub Actions setup', 'DevOps', '#10B981', '#34D399'),
];

// ── 5. UML CLASS DIAGRAM ────────────────────────────────────────────────────
const uml: BoardElement[] = [
  { id: 'tmpl-uml-0', type: 'TEXT', x: 260, y: 15, width: 280, height: 28, rotation: 0, content: 'Class Diagram — E-Commerce System', color: 'transparent', zIndex: 20, locked: false, visible: true, name: 'Title', styles: { typography: typo('#1E293B', 18, 700, 'center') } },
  // User class
  { id: 'tmpl-uml-1', type: 'RECTANGLE', x: 60, y: 60, width: 220, height: 180, rotation: 0, content: '', color: '#FFFFFF', zIndex: 2, locked: false, visible: true, name: 'User Class Box', styles: { fills: fill('#FFFFFF'), strokes: stroke('#334155', 2), cornerRadius: cr(8) } },
  { id: 'tmpl-uml-2', type: 'RECTANGLE', x: 60, y: 60, width: 220, height: 36, rotation: 0, content: '', color: '#EFF6FF', zIndex: 3, locked: false, visible: true, name: 'User Class Header', styles: { fills: fill('#EFF6FF'), cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 0, bottomLeft: 0 } } },
  { id: 'tmpl-uml-3', type: 'TEXT', x: 130, y: 66, width: 80, height: 24, rotation: 0, content: 'User', color: 'transparent', zIndex: 4, locked: false, visible: true, name: 'User ClassName', styles: { typography: typo('#1E40AF', 15, 700, 'center') } },
  { id: 'tmpl-uml-4', type: 'LINE', x: 60, y: 96, width: 220, height: 1, rotation: 0, content: '', color: '#E2E8F0', zIndex: 4, locked: false, visible: true, name: 'User Divider 1', styles: { x2: 220, y2: 0 } },
  { id: 'tmpl-uml-5', type: 'TEXT', x: 72, y: 102, width: 196, height: 60, rotation: 0, content: '- id: string\n- name: string\n- email: string\n- avatar: string', color: 'transparent', zIndex: 4, locked: false, visible: true, name: 'User Attributes', styles: { typography: typo('#475569', 11, 400) } },
  { id: 'tmpl-uml-6', type: 'LINE', x: 60, y: 170, width: 220, height: 1, rotation: 0, content: '', color: '#E2E8F0', zIndex: 4, locked: false, visible: true, name: 'User Divider 2', styles: { x2: 220, y2: 0 } },
  { id: 'tmpl-uml-7', type: 'TEXT', x: 72, y: 176, width: 196, height: 50, rotation: 0, content: '+ getProfile(): Profile\n+ updateName(n: string): void\n+ deleteAccount(): void', color: 'transparent', zIndex: 4, locked: false, visible: true, name: 'User Methods', styles: { typography: typo('#1E293B', 11, 400) } },
  // Order class
  { id: 'tmpl-uml-10', type: 'RECTANGLE', x: 390, y: 60, width: 240, height: 200, rotation: 0, content: '', color: '#FFFFFF', zIndex: 2, locked: false, visible: true, name: 'Order Class Box', styles: { fills: fill('#FFFFFF'), strokes: stroke('#334155', 2), cornerRadius: cr(8) } },
  { id: 'tmpl-uml-11', type: 'RECTANGLE', x: 390, y: 60, width: 240, height: 36, rotation: 0, content: '', color: '#F0FDF4', zIndex: 3, locked: false, visible: true, name: 'Order Class Header', styles: { fills: fill('#F0FDF4'), cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 0, bottomLeft: 0 } } },
  { id: 'tmpl-uml-12', type: 'TEXT', x: 460, y: 66, width: 100, height: 24, rotation: 0, content: 'Order', color: 'transparent', zIndex: 4, locked: false, visible: true, name: 'Order ClassName', styles: { typography: typo('#15803D', 15, 700, 'center') } },
  { id: 'tmpl-uml-13', type: 'LINE', x: 390, y: 96, width: 240, height: 1, rotation: 0, content: '', color: '#E2E8F0', zIndex: 4, locked: false, visible: true, name: 'Order Divider 1', styles: { x2: 240, y2: 0 } },
  { id: 'tmpl-uml-14', type: 'TEXT', x: 402, y: 102, width: 216, height: 76, rotation: 0, content: '- id: string\n- userId: string\n- total: number\n- status: OrderStatus\n- createdAt: Date', color: 'transparent', zIndex: 4, locked: false, visible: true, name: 'Order Attributes', styles: { typography: typo('#475569', 11, 400) } },
  { id: 'tmpl-uml-15', type: 'LINE', x: 390, y: 186, width: 240, height: 1, rotation: 0, content: '', color: '#E2E8F0', zIndex: 4, locked: false, visible: true, name: 'Order Divider 2', styles: { x2: 240, y2: 0 } },
  { id: 'tmpl-uml-16', type: 'TEXT', x: 402, y: 192, width: 216, height: 56, rotation: 0, content: '+ addItem(p: Product): void\n+ checkout(): boolean\n+ cancel(): void\n+ getTotal(): number', color: 'transparent', zIndex: 4, locked: false, visible: true, name: 'Order Methods', styles: { typography: typo('#1E293B', 11, 400) } },
  // Product class
  { id: 'tmpl-uml-20', type: 'RECTANGLE', x: 720, y: 60, width: 220, height: 180, rotation: 0, content: '', color: '#FFFFFF', zIndex: 2, locked: false, visible: true, name: 'Product Class Box', styles: { fills: fill('#FFFFFF'), strokes: stroke('#334155', 2), cornerRadius: cr(8) } },
  { id: 'tmpl-uml-21', type: 'RECTANGLE', x: 720, y: 60, width: 220, height: 36, rotation: 0, content: '', color: '#FFF7ED', zIndex: 3, locked: false, visible: true, name: 'Product Class Header', styles: { fills: fill('#FFF7ED'), cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 0, bottomLeft: 0 } } },
  { id: 'tmpl-uml-22', type: 'TEXT', x: 780, y: 66, width: 100, height: 24, rotation: 0, content: 'Product', color: 'transparent', zIndex: 4, locked: false, visible: true, name: 'Product ClassName', styles: { typography: typo('#C2410C', 15, 700, 'center') } },
  { id: 'tmpl-uml-23', type: 'LINE', x: 720, y: 96, width: 220, height: 1, rotation: 0, content: '', color: '#E2E8F0', zIndex: 4, locked: false, visible: true, name: 'Product Divider 1', styles: { x2: 220, y2: 0 } },
  { id: 'tmpl-uml-24', type: 'TEXT', x: 732, y: 102, width: 196, height: 60, rotation: 0, content: '- id: string\n- name: string\n- price: number\n- stock: number', color: 'transparent', zIndex: 4, locked: false, visible: true, name: 'Product Attributes', styles: { typography: typo('#475569', 11, 400) } },
  { id: 'tmpl-uml-25', type: 'LINE', x: 720, y: 170, width: 220, height: 1, rotation: 0, content: '', color: '#E2E8F0', zIndex: 4, locked: false, visible: true, name: 'Product Divider 2', styles: { x2: 220, y2: 0 } },
  { id: 'tmpl-uml-26', type: 'TEXT', x: 732, y: 176, width: 196, height: 50, rotation: 0, content: '+ getPrice(): number\n+ updateStock(n: number): void\n+ isAvailable(): boolean', color: 'transparent', zIndex: 4, locked: false, visible: true, name: 'Product Methods', styles: { typography: typo('#1E293B', 11, 400) } },
  // Relationship lines
  { id: 'tmpl-uml-30', type: 'LINE', x: 280, y: 150, width: 110, height: 2, rotation: 0, content: '', color: '#334155', zIndex: 1, locked: false, visible: true, name: 'User→Order Line', styles: { x2: 110, y2: 0, arrowHead: true } },
  { id: 'tmpl-uml-31', type: 'TEXT', x: 310, y: 130, width: 40, height: 16, rotation: 0, content: '1..*', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'User→Order Mult', styles: { typography: typo('#64748B', 11, 600, 'center') } },
  { id: 'tmpl-uml-32', type: 'LINE', x: 630, y: 150, width: 90, height: 2, rotation: 0, content: '', color: '#334155', zIndex: 1, locked: false, visible: true, name: 'Order→Product Line', styles: { x2: 90, y2: 0, arrowHead: true } },
  { id: 'tmpl-uml-33', type: 'TEXT', x: 645, y: 130, width: 30, height: 16, rotation: 0, content: '*..*', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Order→Product Mult', styles: { typography: typo('#64748B', 11, 600, 'center') } },
];

// ── 6. TIMELINE ─────────────────────────────────────────────────────────────
const TL_Y = 200, TL_X0 = 80, TL_SPACING = 170;
const timeline: BoardElement[] = [
  { id: 'tmpl-tl-0', type: 'TEXT', x: 250, y: 20, width: 300, height: 32, rotation: 0, content: 'Product Launch Timeline — 2026', color: 'transparent', zIndex: 20, locked: false, visible: true, name: 'Title', styles: { typography: typo('#1E293B', 20, 700, 'center') } },
  // Timeline axis
  { id: 'tmpl-tl-1', type: 'LINE', x: TL_X0, y: TL_Y, width: TL_SPACING * 5, height: 3, rotation: 0, content: '', color: '#CBD5E1', zIndex: 1, locked: false, visible: true, name: 'Timeline Axis', styles: { x2: TL_SPACING * 5, y2: 0 } },
  // Milestone 1
  { id: 'tmpl-tl-10', type: 'CIRCLE', x: TL_X0 + TL_SPACING * 0 - 12, y: TL_Y - 12, width: 24, height: 24, rotation: 0, content: '', color: '#3B82F6', zIndex: 5, locked: false, visible: true, name: 'Milestone 1 Dot', styles: { fills: fill('#3B82F6') } },
  { id: 'tmpl-tl-11', type: 'TEXT', x: TL_X0 + TL_SPACING * 0 - 40, y: TL_Y + 24, width: 80, height: 20, rotation: 0, content: 'Jan 2026', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Date 1', styles: { typography: typo('#64748B', 12, 600, 'center') } },
  { id: 'tmpl-tl-12', type: 'RECTANGLE', x: TL_X0 + TL_SPACING * 0 - 60, y: TL_Y - 100, width: 120, height: 70, rotation: 0, content: '', color: '#FFFFFF', zIndex: 3, locked: false, visible: true, name: 'Milestone 1 Card', styles: { fills: fill('#FFFFFF'), strokes: stroke('#3B82F6', 2), cornerRadius: cr(10) } },
  { id: 'tmpl-tl-13', type: 'TEXT', x: TL_X0 + TL_SPACING * 0 - 52, y: TL_Y - 92, width: 104, height: 20, rotation: 0, content: 'Research', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'MS 1 Title', styles: { typography: typo('#1E40AF', 13, 700, 'center') } },
  { id: 'tmpl-tl-14', type: 'TEXT', x: TL_X0 + TL_SPACING * 0 - 52, y: TL_Y - 68, width: 104, height: 30, rotation: 0, content: 'User research & market analysis', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'MS 1 Desc', styles: { typography: typo('#94A3B8', 10, 400, 'center') } },
  // Milestone 2
  { id: 'tmpl-tl-20', type: 'CIRCLE', x: TL_X0 + TL_SPACING * 1 - 12, y: TL_Y - 12, width: 24, height: 24, rotation: 0, content: '', color: '#8B5CF6', zIndex: 5, locked: false, visible: true, name: 'Milestone 2 Dot', styles: { fills: fill('#8B5CF6') } },
  { id: 'tmpl-tl-21', type: 'TEXT', x: TL_X0 + TL_SPACING * 1 - 40, y: TL_Y + 24, width: 80, height: 20, rotation: 0, content: 'Mar 2026', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Date 2', styles: { typography: typo('#64748B', 12, 600, 'center') } },
  { id: 'tmpl-tl-22', type: 'RECTANGLE', x: TL_X0 + TL_SPACING * 1 - 60, y: TL_Y + 50, width: 120, height: 70, rotation: 0, content: '', color: '#FFFFFF', zIndex: 3, locked: false, visible: true, name: 'Milestone 2 Card', styles: { fills: fill('#FFFFFF'), strokes: stroke('#8B5CF6', 2), cornerRadius: cr(10) } },
  { id: 'tmpl-tl-23', type: 'TEXT', x: TL_X0 + TL_SPACING * 1 - 52, y: TL_Y + 58, width: 104, height: 20, rotation: 0, content: 'Design', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'MS 2 Title', styles: { typography: typo('#6D28D9', 13, 700, 'center') } },
  { id: 'tmpl-tl-24', type: 'TEXT', x: TL_X0 + TL_SPACING * 1 - 52, y: TL_Y + 82, width: 104, height: 30, rotation: 0, content: 'UI/UX design & prototyping', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'MS 2 Desc', styles: { typography: typo('#94A3B8', 10, 400, 'center') } },
  // Milestone 3
  { id: 'tmpl-tl-30', type: 'CIRCLE', x: TL_X0 + TL_SPACING * 2 - 12, y: TL_Y - 12, width: 24, height: 24, rotation: 0, content: '', color: '#F59E0B', zIndex: 5, locked: false, visible: true, name: 'Milestone 3 Dot', styles: { fills: fill('#F59E0B') } },
  { id: 'tmpl-tl-31', type: 'TEXT', x: TL_X0 + TL_SPACING * 2 - 40, y: TL_Y + 24, width: 80, height: 20, rotation: 0, content: 'Jun 2026', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Date 3', styles: { typography: typo('#64748B', 12, 600, 'center') } },
  { id: 'tmpl-tl-32', type: 'RECTANGLE', x: TL_X0 + TL_SPACING * 2 - 60, y: TL_Y - 100, width: 120, height: 70, rotation: 0, content: '', color: '#FFFFFF', zIndex: 3, locked: false, visible: true, name: 'Milestone 3 Card', styles: { fills: fill('#FFFFFF'), strokes: stroke('#F59E0B', 2), cornerRadius: cr(10) } },
  { id: 'tmpl-tl-33', type: 'TEXT', x: TL_X0 + TL_SPACING * 2 - 52, y: TL_Y - 92, width: 104, height: 20, rotation: 0, content: 'Develop', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'MS 3 Title', styles: { typography: typo('#92400E', 13, 700, 'center') } },
  { id: 'tmpl-tl-34', type: 'TEXT', x: TL_X0 + TL_SPACING * 2 - 52, y: TL_Y - 68, width: 104, height: 30, rotation: 0, content: 'Core features & API build', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'MS 3 Desc', styles: { typography: typo('#94A3B8', 10, 400, 'center') } },
  // Milestone 4
  { id: 'tmpl-tl-40', type: 'CIRCLE', x: TL_X0 + TL_SPACING * 3 - 12, y: TL_Y - 12, width: 24, height: 24, rotation: 0, content: '', color: '#22C55E', zIndex: 5, locked: false, visible: true, name: 'Milestone 4 Dot', styles: { fills: fill('#22C55E') } },
  { id: 'tmpl-tl-41', type: 'TEXT', x: TL_X0 + TL_SPACING * 3 - 40, y: TL_Y + 24, width: 80, height: 20, rotation: 0, content: 'Sep 2026', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Date 4', styles: { typography: typo('#64748B', 12, 600, 'center') } },
  { id: 'tmpl-tl-42', type: 'RECTANGLE', x: TL_X0 + TL_SPACING * 3 - 60, y: TL_Y + 50, width: 120, height: 70, rotation: 0, content: '', color: '#FFFFFF', zIndex: 3, locked: false, visible: true, name: 'Milestone 4 Card', styles: { fills: fill('#FFFFFF'), strokes: stroke('#22C55E', 2), cornerRadius: cr(10) } },
  { id: 'tmpl-tl-43', type: 'TEXT', x: TL_X0 + TL_SPACING * 3 - 52, y: TL_Y + 58, width: 104, height: 20, rotation: 0, content: 'Beta Test', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'MS 4 Title', styles: { typography: typo('#15803D', 13, 700, 'center') } },
  { id: 'tmpl-tl-44', type: 'TEXT', x: TL_X0 + TL_SPACING * 3 - 52, y: TL_Y + 82, width: 104, height: 30, rotation: 0, content: 'Testing & bug fixing', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'MS 4 Desc', styles: { typography: typo('#94A3B8', 10, 400, 'center') } },
  // Milestone 5
  { id: 'tmpl-tl-50', type: 'CIRCLE', x: TL_X0 + TL_SPACING * 4 - 12, y: TL_Y - 12, width: 24, height: 24, rotation: 0, content: '', color: '#F43F5E', zIndex: 5, locked: false, visible: true, name: 'Milestone 5 Dot', styles: { fills: fill('#F43F5E') } },
  { id: 'tmpl-tl-51', type: 'TEXT', x: TL_X0 + TL_SPACING * 4 - 40, y: TL_Y + 24, width: 80, height: 20, rotation: 0, content: 'Dec 2026', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Date 5', styles: { typography: typo('#64748B', 12, 600, 'center') } },
  { id: 'tmpl-tl-52', type: 'RECTANGLE', x: TL_X0 + TL_SPACING * 4 - 60, y: TL_Y - 100, width: 120, height: 70, rotation: 0, content: '', color: '#FFFFFF', zIndex: 3, locked: false, visible: true, name: 'Milestone 5 Card', styles: { fills: fill('#FFFFFF'), strokes: stroke('#F43F5E', 2), cornerRadius: cr(10) } },
  { id: 'tmpl-tl-53', type: 'TEXT', x: TL_X0 + TL_SPACING * 4 - 52, y: TL_Y - 92, width: 104, height: 20, rotation: 0, content: '🚀 Launch', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'MS 5 Title', styles: { typography: typo('#BE123C', 13, 700, 'center') } },
  { id: 'tmpl-tl-54', type: 'TEXT', x: TL_X0 + TL_SPACING * 4 - 52, y: TL_Y - 68, width: 104, height: 30, rotation: 0, content: 'Public release & marketing', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'MS 5 Desc', styles: { typography: typo('#94A3B8', 10, 400, 'center') } },
];

// ── 7. JOURNEY MAP ─────────────────────────────────────────────────────────
const JM_Y = 50, JM_W = 200, JM_GAP = 8, JM_X0 = 40;
const jmColors = ['#3B82F6', '#8B5CF6', '#F59E0B', '#22C55E', '#F43F5E'];
const jmStages = ['Awareness', 'Consideration', 'Purchase', 'Retention', 'Advocacy'];
const jmActions = ['Sees ad on social media', 'Reads reviews & compares', 'Signs up & makes first purchase', 'Uses product regularly', 'Recommends to friends'];
const jmThoughts = ['"This looks interesting..."', '"Is this better than competitors?"', '"Let me try the free trial"', '"This saves me so much time!"', '"Everyone should use this!"'];
const jmEmotions = ['😊 Curious', '🤔 Evaluating', '💪 Decisive', '😍 Delighted', '🤩 Enthusiastic'];

const journey: BoardElement[] = [
  { id: 'tmpl-jm-0', type: 'TEXT', x: 300, y: 10, width: 400, height: 32, rotation: 0, content: 'Customer Journey Map — SaaS Product', color: 'transparent', zIndex: 20, locked: false, visible: true, name: 'Title', styles: { typography: typo('#1E293B', 20, 700, 'center') } },
  // Stage headers
  ...jmStages.map((stage, i) => {
    const x = JM_X0 + i * (JM_W + JM_GAP);
    return [
      { id: `tmpl-jm-h-${i}`, type: 'RECTANGLE', x, y: JM_Y, width: JM_W, height: 40, rotation: 0, content: '', color: jmColors[i], zIndex: 3, locked: false, visible: true, name: `Stage ${i} Header`, styles: { fills: fill(jmColors[i]), cornerRadius: { topLeft: cr(10).topLeft, topRight: cr(10).topRight, bottomRight: 0, bottomLeft: 0 } } },
      { id: `tmpl-jm-ht-${i}`, type: 'TEXT', x: x + 8, y: JM_Y + 8, width: JM_W - 16, height: 24, rotation: 0, content: stage, color: 'transparent', zIndex: 5, locked: false, visible: true, name: `Stage ${i} Title`, styles: { typography: typo('#FFFFFF', 13, 700, 'center') } },
    ] as BoardElement[];
  }).flat(),
  // Action rows
  ...jmActions.map((action, i) => {
    const x = JM_X0 + i * (JM_W + JM_GAP);
    return { id: `tmpl-jm-a-${i}`, type: 'RECTANGLE', x: x + 8, y: JM_Y + 52, width: JM_W - 16, height: 80, rotation: 0, content: '', color: '#FFFFFF', zIndex: 2, locked: false, visible: true, name: `Action ${i} Card`, styles: { fills: fill('#FFFFFF'), strokes: stroke('#E2E8F0', 1), cornerRadius: cr(8) } } as BoardElement;
  }),
  // Action row labels
  { id: 'tmpl-jm-al', type: 'RECTANGLE', x: JM_X0, y: JM_Y + 52, width: 0, height: 0, rotation: 0, content: '', color: 'transparent', zIndex: 1, locked: false, visible: false, name: '_', styles: {} },
  ...jmActions.map((action, i) => {
    const x = JM_X0 + i * (JM_W + JM_GAP);
    return [
      { id: `tmpl-jm-at-${i}`, type: 'TEXT', x: x + 16, y: JM_Y + 56, width: JM_W - 32, height: 16, rotation: 0, content: 'ACTIONS', color: 'transparent', zIndex: 5, locked: false, visible: true, name: `Action ${i} Label`, styles: { typography: typo('#94A3B8', 9, 700) } },
      { id: `tmpl-jm-av-${i}`, type: 'TEXT', x: x + 16, y: JM_Y + 76, width: JM_W - 32, height: 46, rotation: 0, content: action, color: 'transparent', zIndex: 5, locked: false, visible: true, name: `Action ${i} Value`, styles: { typography: typo('#1E293B', 12, 400) } },
    ] as BoardElement[];
  }).flat(),
  // Thought rows
  ...jmThoughts.map((thought, i) => {
    const x = JM_X0 + i * (JM_W + JM_GAP);
    return [
      { id: `tmpl-jm-tc-${i}`, type: 'RECTANGLE', x: x + 8, y: JM_Y + 144, width: JM_W - 16, height: 64, rotation: 0, content: '', color: '#F8FAFC', zIndex: 2, locked: false, visible: true, name: `Thought ${i} Card`, styles: { fills: fill('#F8FAFC'), cornerRadius: cr(8) } },
      { id: `tmpl-jm-tl-${i}`, type: 'TEXT', x: x + 16, y: JM_Y + 148, width: JM_W - 32, height: 16, rotation: 0, content: 'THOUGHTS', color: 'transparent', zIndex: 5, locked: false, visible: true, name: `Thought ${i} Label`, styles: { typography: typo('#94A3B8', 9, 700) } },
      { id: `tmpl-jm-tv-${i}`, type: 'TEXT', x: x + 16, y: JM_Y + 166, width: JM_W - 32, height: 34, rotation: 0, content: thought, color: 'transparent', zIndex: 5, locked: false, visible: true, name: `Thought ${i} Value`, styles: { typography: typo('#475569', 12, 400) } },
    ] as BoardElement[];
  }).flat(),
  // Emotion rows
  ...jmEmotions.map((emotion, i) => {
    const x = JM_X0 + i * (JM_W + JM_GAP);
    return [
      { id: `tmpl-jm-ec-${i}`, type: 'RECTANGLE', x: x + 8, y: JM_Y + 220, width: JM_W - 16, height: 44, rotation: 0, content: '', color: '#FFFFFF', zIndex: 2, locked: false, visible: true, name: `Emotion ${i} Card`, styles: { fills: fill('#FFFFFF'), strokes: stroke('#E2E8F0', 1), cornerRadius: cr(8) } },
      { id: `tmpl-jm-ev-${i}`, type: 'TEXT', x: x + 16, y: JM_Y + 228, width: JM_W - 32, height: 28, rotation: 0, content: emotion, color: 'transparent', zIndex: 5, locked: false, visible: true, name: `Emotion ${i} Value`, styles: { typography: typo('#1E293B', 14, 600, 'center') } },
    ] as BoardElement[];
  }).flat(),
  // Bottom: Opportunity / KPI row
  { id: 'tmpl-jm-opp-label', type: 'RECTANGLE', x: JM_X0, y: JM_Y + 278, width: 5 * (JM_W + JM_GAP) - JM_GAP, height: 60, rotation: 0, content: '', color: '#F0FDF4', zIndex: 2, locked: false, visible: true, name: 'Opportunities Bar', styles: { fills: fill('#F0FDF4'), cornerRadius: cr(10) } },
  { id: 'tmpl-jm-opp-title', type: 'TEXT', x: JM_X0 + 16, y: JM_Y + 284, width: 200, height: 20, rotation: 0, content: '💡 Key Opportunities', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Opp Title', styles: { typography: typo('#15803D', 13, 700) } },
  { id: 'tmpl-jm-opp-desc', type: 'TEXT', x: JM_X0 + 16, y: JM_Y + 306, width: 900, height: 24, rotation: 0, content: 'Focus on social proof at Consideration stage • Simplify onboarding at Purchase • Add referral rewards at Advocacy', color: 'transparent', zIndex: 5, locked: false, visible: true, name: 'Opp Desc', styles: { typography: typo('#475569', 12, 400) } },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════════════════════

export const TEMPLATES: Record<string, BoardElement[]> = {
  flowchart,
  mindmap,
  wireframe,
  kanban,
  uml,
  timeline,
  journey,
};