# SL-Transit (SriVibes) Monorepo

Monorepo skeleton for SL-Transit (mobile + web + backend).

- Mobile: React Native (Expo)
- Web: Next.js (Admin + Business dashboard)
- Backend: Node.js + Express + Socket.IO
- Realtime: Socket.IO + Redis (Postgres used only for snapshots)
- Database: PostgreSQL (Supabase) + Prisma

Structure:
```
... (see INSTRUCTION.md for full structure)
```

To get started:

1. Copy `.env.example` to `.env` and populate credentials.
2. Install root deps: `npm install` (supports workspaces)
3. Start backend in development: `cd backend && npm run dev`

