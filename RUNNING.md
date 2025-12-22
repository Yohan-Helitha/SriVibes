# Runbook — SL-Transit (SriVibes)

This document summarizes the recent architecture/doc changes and gives a concrete plan to run the system locally (Docker) and run the mobile app (Expo).

## 1) Summary of important project changes (locked)

- Mobile framework: React Native (Expo). Flutter removed.
- Realtime/live tracking: replaced Firebase with Socket.IO + Redis + PostgreSQL (optional snapshots stored in `LocationSnapshot`).
- New/updated data models (Prisma): `LocationSnapshot`, `TripSeat`, `Payment`, `WebhookLog`, `AdminOverride`, `AdminOverrideApproval`, `AdminAuditLog`, and `PlaceImage` (images stored in Supabase Storage — DB stores paths).
- Seat locking remains via Redis (locks + atomic checks); DB is authoritative for persisted bookings.
- QR design: booking reference + server-side verification. Consider signing QR with short JWT for better security.
- PayHere integration: `Payment` and `WebhookLog` models exist — webhook endpoint required and must be reachable from PayHere.

All code and docs now reference:

> Socket.IO + Redis + PostgreSQL (optional) as the realtime method

---

## 2) Prerequisites (local dev)

- Docker & Docker Compose (v2) installed
- Node.js (18+ recommended)
- npm or pnpm (root uses workspaces)
- Expo CLI (for mobile dev): `npm install -g expo-cli` (or use `npx expo`)
- A Postgres and Redis instance (Docker compose included below)
- (Optional) ngrok or a tunneling service for PayHere webhook testing

Create a copy of `.env.example` at the repo root to `.env` and fill values:

- DATABASE_URL (Postgres)
- REDIS_URL (Redis)
- SUPABASE_URL / SUPABASE_KEY
- PAYHERE_MERCHANT_ID / PAYHERE_SECRET
- JWT_SECRET
- NODE_ENV / PORT

---

## 3) Docker-based local run (recommended for integrated testing)

This repo includes a sample docker-compose file at `infra/docker/docker-compose.yml` which will bring up:

- postgres (Postgres DB)
- redis (Redis)
- backend (built from `./backend`)
- web (optional admin web built from `./apps/web`)
- adminer (optional DB GUI)

Important note: the compose file references the repository `.env` file. Create `.env` at the repo root before `docker compose up`.

Steps (PowerShell):

```powershell
# from repo root
cp .env.example .env
# edit .env (set DATABASE_URL to use the docker-compose postgres connection, e.g. postgresql://postgres:postgres@postgres:5432/srivibes)
# then bring up services
docker compose -f infra/docker/docker-compose.yml up --build -d
```

After containers are up:

- Run Prisma migrations (from your host machine or backend container):

```powershell
# from repo root (host)
cd backend
# install deps if not already in container image
npm install
# generate prisma client
npx prisma generate --schema=./prisma/schema.prisma
# apply migrations (dev)
npx prisma migrate dev --name init --schema=./prisma/schema.prisma
```

Or run the migrate command inside the backend container if you prefer CI-style runs.

To view DB via Adminer (if running): http://localhost:8080 (login as defined in .env/docker-compose)

---

## 4) Docker-compose (sample)

A ready example is provided at `infra/docker/docker-compose.yml`. The file is tuned for local dev and mounts volumes for code so you can iterate quickly. It expects `.env` in the repo root.

(See `infra/docker/docker-compose.yml` for exact content.)

---

## 5) Running backend locally (without Docker)

If you prefer running the backend directly for faster iteration:

```powershell
# from repo root
cd backend
npm install
# copy .env.example to .env and set DATABASE_URL, REDIS_URL, etc.
cp ..\.env.example .env
# start in dev (ts-node-dev)
npm run dev
```

Backend dev server will start (by default configured to use `PORT` from `.env`).

Socket server lives in the backend process and is exposed on the same host:port as the API (unless you configure differently). It accepts Socket.IO connections and expects an authenticate event with a JWT.

---

## 6) Running mobile app (Expo)

Recommended for development — use Expo Go for rapid iteration. Mobile will connect to the backend API and Socket.IO server.

1. Ensure the backend is running locally and reachable from the mobile device (same network) or use ngrok / LAN tunnel.
2. From repo root:

```powershell
cd apps\mobile
npm install
# start expo in dev mode
npx expo start --tunnel
# or for LAN (if your phone and machine are on same Wi-Fi)
npx expo start --lan
```

3. Open the Expo Go app on your phone and scan the QR (or use the tunnel link). If using a simulator/emulator you can open the iOS/Android simulator from the Expo CLI UI.

Notes for Socket.IO connection from mobile:

- Use the `SOCKET_URL` env variable (e.g. `http://192.168.1.10:4000` for local LAN) — set this in the mobile app `app.config.js` or runtime config.
- Authenticate over socket by emitting `authenticate` with the user's JWT after the socket connects.
- Mobile should subscribe to `trip` rooms using `subscribe:trip` event and handle `trip:location` broadcasts.

Production builds:

- Use EAS or Expo Application Services to create Android/iOS builds. Configure `app.json`/`app.config.js` with production API endpoints.

---

## 7) PayHere webhook testing (local)

- PayHere needs to reach your webhook URL. Use `ngrok http 4000` (or appropriate port) and copy the generated HTTPS url to PayHere's dashboard.
- The backend must implement `/payments/webhook` (or the configured endpoint) and validate the payload using PayHere secrets.
- Webhook calls should be logged to the `WebhookLog` table and the `Payment` model updated accordingly.

---

## 8) Useful commands summary (PowerShell)

```powershell
# bring up docker components
docker compose -f infra/docker/docker-compose.yml up --build -d

# stop
docker compose -f infra/docker/docker-compose.yml down

# run backend locally
cd backend
npm install
cp ..\.env.example .env
npm run dev

# run mobile (expo)
cd apps\mobile
npm install
npx expo start --tunnel
```

---

## 9) Next steps I can implement for you (pick one)

- Create a runnable `backend/src/index.ts` skeleton wiring Express + Socket.IO + Redis (auth middleware, `location:update` handler, broadcasting) so mobile devs can integrate immediately.
- Create `apps/mobile` Expo skeleton (auth + trips list + socket stub) that loads against the API above.
- Add full `.github/workflows/ci.yml` to build/test backend and web and optionally mobile.

Tell me which one to do next and I'll implement it.
