# Task 1 - Authentication System & i18n Infrastructure

**Agent**: Auth & i18n Builder  
**Status**: ✅ Completed

## Files Created (8 total)

### 1. `src/store/auth-store.ts`
- Zustand store with `AuthUser` interface, `AuthView` type
- localStorage persistence via `branchboard_user` key
- Actions: `setUser`, `logout`, `setLoading`, `setAuthView`, `initialize`, `getLocale`
- `initialize()` restores session from localStorage on app load
- `getLocale()` returns current user's language or defaults to `'en'`
- Exported: `useAuthStore`, `AuthUser`, `AuthView`

### 2. `src/lib/i18n.ts`
- 5 languages: English, Bahasa Indonesia, 日本語, 한국어, 简体中文
- `Locale` type, `LOCALES` array with code/name/flag
- `t(key, locale, params?)` function with `{param}` interpolation
- Falls back to English, then to raw key
- Comprehensive translation dictionary covering:
  - `auth.*` (20+ keys): login, register, forgot-password flows, validation messages
  - `dashboard.*` (10 keys): board listing, search, sort, filter
  - `board.*` (15 keys): CRUD, visibility, sharing
  - `editor.*` (6 keys): navigation, commit, branch, merge
  - `branch.*` (5 keys), `commit.*` (5 keys), `merge.*` (7 keys)
  - `settings.*` (10 keys): profile, appearance, theme, language, AI agents
  - `ai.*` (10 keys): LLM, VLM, TTS, ASR, image/video gen, model config
  - `stitch.*` (9 keys): collaboration, sharing, permissions
  - `common.*` (12 keys): save, cancel, delete, edit, close, search, loading, error, etc.
  - `captcha.*` (2 keys): verify, verifying

### 3. `src/components/auth/auth-view.tsx`
- Full-screen auth overlay with gradient background and decorative blur effects
- 3 animated sub-views: login, register, forgot-password
- Framer Motion slide transitions (spring physics) between views
- Cloudflare Turnstile captcha: dynamic script loading, explicit render, widget reset on view change
- Glassmorphism card with backdrop blur
- BranchBoard logo (GitBranch icon + gradient background)
- Password show/hide toggle
- Form validation for all fields
- Language selector bar at bottom
- Responsive design (mobile-friendly)
- Uses shadcn/ui Card, Input, Button, Label
- All text via `t()` function

### 4. `src/app/api/auth/register/route.ts`
- POST handler accepting `{ email, name, password, captchaToken }`
- Captcha token validation
- Email normalization, format validation
- Email uniqueness check → 409 on conflict
- bcryptjs password hashing (10 salt rounds)
- Creates User with default settings
- Creates default "My First Board" with "main" branch
- Returns `{ user: {id, email, name, role}, token }` with 201

### 5. `src/app/api/auth/login/route.ts`
- POST handler accepting `{ email, password, captchaToken }`
- Captcha validation, email normalization
- Finds user by email, compares password with bcrypt
- Returns generic 401 for invalid credentials (no email enumeration)
- Returns full user object with settings and `token`

### 6. `src/app/api/auth/forgot-password/route.ts`
- POST handler accepting `{ email, captchaToken }`
- Generates 32-byte hex reset token with 1-hour expiry
- Always returns 200 (even if email doesn't exist) for security
- Updates user's `resetToken` and `resetTokenExpiry`

### 7. `src/app/api/auth/reset-password/route.ts`
- POST handler accepting `{ token, password }`
- Finds user by resetToken where expiry > now
- Hashes new password, clears resetToken fields
- Returns `{ message }` on success

### 8. `src/app/api/user/settings/route.ts`
- GET: Returns user settings (language, theme, accentColor, aiSettings) by userId query param
- POST: Updates user fields (any combination of language, theme, accentColor, aiSettings, name, avatar)
- Returns updated user object

## Notes
- ESLint passes with zero errors
- No modifications to page.tsx, layout.tsx, or globals.css
- All API routes follow existing patterns (NextRequest/NextResponse, consistent error handling)
- Auth view is designed to be conditionally rendered by page.tsx based on auth state