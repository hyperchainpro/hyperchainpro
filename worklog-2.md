---
Task ID: 2
Agent: Main
Task: Create all TypeScript types and Zustand stores for BranchBoard

Work Log:
- Created `/src/lib/types.ts` with all shared types: ElementType, BoardRole, MergeStatus, ViewMode, RightPanelTab, CanvasTool, BoardElement, Board, BoardMember, Branch, CommitInfo, MergeRequestInfo, PresenceUser, Template
- Created `/src/store/app-store.ts` — manages viewMode, currentBoardId, rightPanel, sidebar, searchQuery with actions for navigation and UI toggling
- Created `/src/store/canvas-store.ts` — comprehensive canvas state with element CRUD, selection, zoom/pan, clipboard, undo/redo, z-ordering, lock/group, grid/snap/minimap toggles, load/clear
- Created `/src/store/version-store.ts` — version control state with branch CRUD, commit history, merge request lifecycle (create/approve/reject/remove), dialog open state
- Created `/src/store/presence-store.ts` — real-time collaboration presence with user add/remove, cursor tracking, element selection tracking, connection state
- All stores use `zustand` v5 with `create()` pattern, fully typed with exported store types and hooks
- ESLint passes with zero errors

Stage Summary:
- 5 files created covering all application state management needs
- Full TypeScript strict typing throughout
- Each store exports its combined type (e.g. `AppStore`, `CanvasStore`) for external consumption
- Canvas store includes zoom clamping (0.1–5), undo/redo stacks, and a zoomToFit algorithm
- Version store handles branch switching, commit history filtering by branch, and merge request status transitions