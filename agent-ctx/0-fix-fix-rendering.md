---
Task ID: 0-fix
Agent: fix-rendering
Task: Fix all client-side rendering issues causing blank page

Work Log:
- Fixed CanvasTool case mismatch: updated type from lowercase ('select', 'hand', etc.) to uppercase ('SELECT', 'HAND', 'STICKY_NOTE', etc.) in types.ts; updated canvas-store.ts default from 'select' to 'SELECT' and reset after addElement
- Fixed right panel Dialog imports: replaced BranchDialog/MergeRequestDialog (Dialog wrappers) with inline BranchesTab/MergesTab panel components; branches tab shows list with switch button, merges tab shows MRs with status badges; removed unused Dialog imports
- Made create board dialog call API: replaced console.log with actual POST /api/boards fetch call, then refreshes board list from API
- Added error boundary: created ErrorBoundary class component at src/components/error-boundary.tsx with retry button and error message display; wrapped page content in it
- Verified DropdownMenuItem variant prop: confirmed shadcn/ui DropdownMenuItem supports variant="destructive" natively, no fix needed

Stage Summary:
- All known rendering issues fixed
- Lint passes cleanly
