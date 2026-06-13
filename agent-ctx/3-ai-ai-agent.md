# Task 3-ai: Wire up AI features integration

## Work Done

### 1. Fixed existing AI API routes
- **commit-message/route.ts**: Changed from `import { LLM } from 'z-ai-web-dev-sdk'` (broken) to `import ZAI from 'z-ai-web-dev-sdk'` with correct usage: `const zai = await ZAI.create(); await zai.chat.completions.create(...)`. Also changed system prompt role from `'system'` to `'assistant'` per SDK requirements.
- **resolve-conflict/route.ts**: Same fix — replaced `LLM.chat()` with `ZAI.create()` + `zai.chat.completions.create()` pattern. System role changed to `'assistant'`.

### 2. Created `/api/ai/generate-layout` route
- Accepts POST with `{ boardName, description? }`
- Uses ZAI SDK with glm-4-flash model to generate JSON array of whiteboard elements
- Validates and normalizes element types, positions, dimensions
- Handles markdown code block wrapping in AI responses
- Returns `{ elements: [...] }`

### 3. Created `/api/ai/summarize` route
- Accepts POST with `{ elements, boardName }`
- Builds element summaries (type, content, position) for AI context
- Uses ZAI SDK to generate 2-4 sentence board summary
- Returns `{ summary: string }`

### 4. Added AI Assist button to toolbar
- Sparkles icon from lucide-react, placed between spacer and zoom controls
- Popover with 3 options:
  - **Generate Layout** (LayoutGrid icon, amber) — calls `/api/ai/generate-layout`, adds elements to canvas via `addElement`
  - **Auto-arrange** (AlignHorizontalSpaceAround icon, emerald) — client-side grid arrangement
  - **Summarize Board** (FileText icon, sky) — calls `/api/ai/summarize`, shows summary in toast
- Loading state with spinner icon
- Toast notifications for success/error
- Disabled states for empty board / loading

### 5. Wired AI Generate Layout to canvas
- `handleGenerateLayout` calls API, iterates response elements, calls `store.addElement()` for each
- Validates element types against `ElementType` union before adding
- Passes content, color, width, height as overrides