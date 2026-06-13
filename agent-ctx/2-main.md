---
Task ID: 2
Agent: Main
Task: Create all backend API routes for BranchBoard

Work Log:
- Created /api/boards/route.ts: GET (list with search/starred filters, auto-seeds 6 demo boards on first request) and POST (creates board with main branch, owner member, and initial commit)
- Created /api/boards/[id]/route.ts: GET (board with branches, members, latest commits) and DELETE (cascading delete)
- Created /api/branches/route.ts: POST (creates branch with name validation via regex, duplicate check, based on default branch head)
- Created /api/branches/[id]/route.ts: GET (branch with all commits ordered by createdAt desc) and DELETE (prevents default branch deletion)
- Created /api/commits/route.ts: POST (creates commit with parent chain, message validation >= 3 chars) and GET (list commits with optional branchId filter)
- Created /api/merge-requests/route.ts: POST (creates MR with conflict detection by comparing snapshots), PATCH (approve/reject/merge with merge commit creation), GET (list MRs by boardId)
- Created /api/ai/commit-message/route.ts: POST (uses z-ai-web-dev-sdk LLM to generate commit messages, fallback to "Update board elements")
- Created /api/ai/resolve-conflict/route.ts: POST (uses AI to merge conflicting snapshots, fallback to source-preference strategy)
- All routes use proper error handling with try/catch, NextResponse JSON responses, and correct status codes
- Lint passes with zero errors

Stage Summary:
- All 8 API route files created with full implementation
- Demo data seeding for 6 boards with realistic names, descriptions, and commit histories
- AI integration for commit message generation and conflict resolution
- Proper TypeScript types throughout