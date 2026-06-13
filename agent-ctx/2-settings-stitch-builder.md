# Task 2 — Settings & Stitch Builder

## Task
Build Settings panel (with AI agents, theme, language, profile), Google Stitch collaboration features (share, comments, activity feed), and neumorphism CSS design system.

## Files Created (8 total)

### Settings Components (5)
1. **src/components/settings/settings-dialog.tsx** — Main entry dialog with 5 tabs, vertical sidebar (desktop) / horizontal scroll (mobile), AnimatePresence transitions
2. **src/components/settings/profile-settings.tsx** — Avatar, name, email (readonly), role badge, member-since, change password with show/hide
3. **src/components/settings/ai-agents-settings.tsx** — 8 AI agent configs (LLM, VLM, TTS, ASR, ImageGen, Video, WebSearch, WebReader) with collapsible cards, per-agent settings, enable/disable, reset, JSON persistence
4. **src/components/settings/theme-settings.tsx** — Theme toggle (Light/Dark/System), accent color picker (8 presets + custom), font size, compact mode, animations toggle
5. **src/components/settings/language-settings.tsx** — 5 locales with flags, native names, checkmark on active, API persistence

### Stitch Components (3)
6. **src/components/stitch/share-dialog.tsx** — Share link (public/private, permission level), invite people (email + role), collaborators list with role management, integrations (GitHub, Slack, PDF)
7. **src/components/stitch/comment-panel.tsx** — Filter tabs (All/Open/Resolved), comment cards with avatars/mentions/resolve, @mention autocomplete, Cmd+Enter submit, empty state
8. **src/components/stitch/activity-feed.tsx** — Timeline with 11 activity types, color-coded icons, time-grouped sections, load more pagination, demo data

## Design System
- Neumorphism: `shadow-[6px_6px_12px_rgba(0,0,0,0.08),-6px_-6px_12px_rgba(255,255,255,0.9)]` (light) and dark variant
- Inset inputs: `shadow-[inset_3px_3px_6px_rgba(0,0,0,0.06),inset_-3px_-3px_6px_rgba(255,255,255,0.7)]`
- Rounded-xl corners throughout
- Consistent use of `bg-muted/50` for subtle backgrounds

## Key Decisions
- Used framer-motion for all enter/exit/tab animations
- AI agent settings stored as JSON string in user.aiSettings field
- Stitch features use demo data; API endpoints to be wired later
- All text via t() from @/lib/i18n with locale from useAuthStore
- No modifications to page.tsx, layout.tsx, or globals.css
- ESLint: zero errors