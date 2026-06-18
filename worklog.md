---
Task ID: 1
Agent: Main
Task: Fix blank preview and continue pending TODOS

Work Log:
- Diagnosed blank preview: Zustand object selectors in page.tsx and auth-view.tsx caused getSnapshot infinite re-render loops
- Fixed page.tsx: Changed `const { viewMode } = useAppStore()` to individual selector `const viewMode = useAppStore((s) => s.viewMode)`
- Fixed auth-view.tsx: Split 5 destructured values into individual selectors
- Fixed enhanced-toolbar.tsx: Split `const { editorMode, setEditorMode } = useAppStore()` into individual selectors
- Resolved dev server startup: Created musl libc shim (gcc shared library) to use the correct v16.1.3 SWC/Turbopack binary from bun cache, avoiding 114MB network download
- Fixed canvas-area.tsx: Replaced `const store = useCanvasStore()` with 10 individual selectors + getState() for 30+ action calls
- Fixed toolbar.tsx: Replaced `const store = useCanvasStore()` with 9 individual selectors + getState() for action calls
- Fixed board-element.tsx: Removed store entirely, replaced all action calls with `useCanvasStore.getState()`
- Fixed enhanced-canvas-area.tsx: Replaced `const store = useCanvasStore()` with 10 individual selectors + 55 getState() calls
- Fixed mobile double close button: Removed duplicate close button from MobileRightPanel and MobileLeftPanel Sheet components, using only built-in Sheet close button
- Fixed sidebar close button spacing: Added `pt-2.5 pb-3` padding to create breathing room between close button and features in right panel, left panel, and dev mode panel
- Fixed AI Prompt CRUD: Created missing `/api/ai/prompt` API route using z-ai-web-dev-sdk, fixed `saveAsComponent` method name (`addComponent` → `registerComponent`), fixed redundant `removeLastMessage` in `handleEditAndResend`
- Generated Prisma client with `npx prisma generate`
- ESLint passes cleanly with zero errors
- Browser verified: Login page renders, Dashboard with 28 boards loads, Editor view opens, Zero console errors, Zero getSnapshot warnings

Stage Summary:
- Root cause of blank preview: Zustand getSnapshot infinite loop from object selectors in critical render path (page.tsx, auth-view.tsx)
- All Zustand stores now use individual selectors: `const x = useStore((s) => s.x)` pattern
- Dev server runs with musl SWC binary + glibc compatibility shim + LD_LIBRARY_PATH
- AI Prompt system: Full CRUD working - Create/Read/Update/Delete for agents (DB), messages (store+localStorage), chat API endpoint
- Mobile: Single close button on panels (Sheet's built-in X only)
- Desktop: Close button has adequate spacing from features (pt-2.5 pb-3)
