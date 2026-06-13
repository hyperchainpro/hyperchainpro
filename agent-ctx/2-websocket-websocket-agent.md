---
Task ID: 2-websocket
Agent: websocket-agent
Task: Create WebSocket mini-service for real-time collaboration

Work Log:
- Created mini-services/collab-service/package.json with socket.io dependency
- Created mini-services/collab-service/index.ts with Socket.IO server on port 3003
  - Room-based collaboration (join-board / leave-board)
  - Presence tracking with user-init (random name + color)
  - Cursor broadcasting (cursor-move) to other room members
  - Element sync events (element-add, element-update, element-delete, element-move)
  - Graceful disconnect cleanup with presence broadcast
- Installed socket.io in mini-service and socket.io-client in main project
- Created src/hooks/use-collaboration.ts React hook
  - Connects via gateway: io("/?XTransformPort=3003")
  - Manages socket lifecycle tied to boardId
  - Exposes: sendCursorMove, sendElementAdd/Update/Delete/Move
  - Syncs remote presence users into usePresenceStore
  - Handles incoming remote element changes from other users
- Integrated into editor-view.tsx
  - Calls useCollaboration(currentBoardId) to establish connection
  - Passes sendCursorMove to CanvasArea
  - Added presence avatars in topbar (colored circles with initials)
  - Added connection status indicator (green dot when connected)
- Integrated into canvas-area.tsx
  - Added onCursorMove prop with 50ms throttle (~20 updates/sec)
  - Renders remote user cursors as colored SVG pointers with name labels
  - Reads presence users from usePresenceStore
- Started collab-service on port 3003 (verified listening)

Stage Summary:
- WebSocket service running on port 3003
- Presence tracking and cursor broadcasting implemented
- Lint passes cleanly (0 errors, 0 warnings)
- Dev server compiles successfully