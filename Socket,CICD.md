Below you’ll find:

1. Socket.IO event map (server & client)
2. Redis key naming and patterns (locks, live state, channels)
3. Seat-lock algorithm (safe Redis pattern + DB fallback)
4. Redis pub/sub + scaling notes for Socket.IO
5. GitHub Actions CI/CD pipeline skeletons (ci.yml, deploy-staging.yml, deploy-prod.yml)
6. `.env` variables layout
7. `docker-compose.yml` (dev / small staging)
8. Nginx config snippet for proxying WebSockets + API
9. Quick runbook / checklist for rollout

## 1) Socket.IO event map

### Events overview

* `driver:connect` — driver authenticates socket for a trip
* `driver:location:update` — driver → server sends `{ tripId, lat, lng, speed, heading }`
* `driver:status` — driver → server status changes: `STARTED`, `PAUSED`, `ENDED`, `EMERGENCY`
* `passenger:subscribe` — passenger subscribes to trip updates `{ tripId }`
* `server:location:update` — server → passenger broadcast `{ tripId, lat, lng, speed, updatedAt }`
* `server:trip:status` — server → passengers broadcast trip status changes
* `conductor:scan` — conductor sends `{ token }` to verify; server responds with booking info
* `server:heartbeat` — optional periodic health ping

### Minimal server-side Socket.IO handlers (pseudo-TS)

```ts
// sockets/index.ts (express + socket.io)
import { Server } from "socket.io";
import redisAdapter from "socket.io-redis";
import { verifyJwt } from "./auth";
import { updateLiveLocation, getLiveLocation } from "./locations";

export function attachSocket(server, redisClient) {
  const io = new Server(server, { cors: { origin: "*" } });
  io.adapter(redisAdapter({ pubClient: redisClient, subClient: redisClient.duplicate() }));

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    const user = await verifyJwt(token);
    if (!user) return next(new Error("unauthorized"));
    socket.data.user = user;
    next();
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;

    socket.on("driver:connect", (payload) => {
      // payload: { tripId }
      socket.join(`driver:${payload.tripId}`);
      socket.join(`trip:${payload.tripId}:subscribers`);
      socket.data.tripId = payload.tripId;
      socket.data.role = "driver";
    });

    socket.on("driver:location:update", async (payload) => {
      // payload: { tripId, lat, lng, speed, heading }
      const { tripId, lat, lng, speed } = payload;
      const updatedAt = new Date().toISOString();
      // write latest to redis
      await updateLiveLocation(tripId, { lat, lng, speed, updatedAt });
      // broadcast to subscribers (scale-safe via adapter)
      io.to(`trip:${tripId}:subscribers`).emit("server:location:update", { tripId, lat, lng, speed, updatedAt });
    });

    socket.on("passenger:subscribe", (payload) => {
      socket.join(`trip:${payload.tripId}:subscribers`);
    });

    socket.on("driver:status", (payload) => {
      io.to(`trip:${payload.tripId}:subscribers`).emit("server:trip:status", payload);
    });

    socket.on("disconnect", () => {
      // cleanup if needed
    });
  });
}
```

### Client-side snippets

* Driver (send location every N seconds):

```ts
// driver app
const socket = io(SOCKET_URL, { auth: { token } });
socket.emit("driver:connect", { tripId });

setInterval(() => {
  const loc = await getCurrentLocation();
  socket.emit("driver:location:update", { tripId, lat: loc.lat, lng: loc.lng, speed: loc.speed });
}, 5000);
```

* Passenger (subscribe):

```ts
const socket = io(SOCKET_URL, { auth: { token } });
socket.emit("passenger:subscribe", { tripId });
socket.on("server:location:update", data => updateMapMarker(data));
```

---

## 2) Redis key naming & patterns

Use consistent prefixes. TTLs chosen for resiliency.

### Keys

* `live:trip:{tripId}` → HASH or JSON value `{ lat, lng, speed, updatedAt }`

  * TTL: 30s (so stale data disappears)
* `lock:trip:{tripId}:seat:{seatNumber}` → string containing `userId` or `requestId`

  * TTL: 300s (5 min hold)
* `pubsub:trip:{tripId}` → Redis pub/sub channel name (if using pub/sub directly)
* `booking:pending:{bookingId}` → TEMP marker during payment flow
* `socket:user:{userId}` → set of socket ids (for targeted pushes)
* `audit:adminoverride:{id}` → store override object briefly if needed

### Data storage choices

* Use Redis **HASH** for `live:trip:{tripId}`: `HSET live:trip:{id} lat 6.9 lng 79.8 updatedAt 2025-..`
* Use `SET NX` for locks: `SET lock:trip:TRIP123:seat:12 <owner> NX EX 300`

---

## 3) Seat-lock algorithm (Redis + DB fallback)

### Goal

Prevent double-booking under concurrent requests and across multiple app servers.

### Flow (server-side)

1. User selects seat → server tries to get a Redis lock:

```text
SET lock:trip:{tripId}:seat:{seatNumber} "{userId}:{requestId}" NX EX 300
```

2. If `SET` returns OK:

   * Temporarily reserve the seat in Redis
   * Return `lockToken` to client (or keep it server-side)
   * Start payment flow
3. After payment success webhook:

   * In a DB transaction:

     * Verify seat still available (SELECT ... FOR UPDATE on TripSeat or Booking checks)
     * Insert Booking row and mark TripSeat as BOOKED (or if no TripSeat table, insert Booking with unique constraint)
   * Delete Redis lock: `DEL lock:trip:{tripId}:seat:{seatNumber}`
4. If payment timeout / cancel: release lock automatically by TTL or through `DEL` on cancel.

### Atomicity + race protection

* Use DB UNIQUE constraint `UNIQUE(tripId, seatNumber)` on `TripSeat` or `Booking` table to prevent last-second race in case two servers try to write.
* Always perform DB insert inside transaction; if insert fails due to unique constraint, notify client that seat is no longer available.

### Pseudocode for confirm handler

```ts
async function confirmBooking(bookingId, lockValue) {
  // check lock owned by this user
  const current = await redis.get(lockKey);
  if (current !== lockValue) throw new Error("Lock lost");

  // do DB transaction
  await prisma.$transaction(async (tx) => {
    const exist = await tx.booking.findFirst({ where: { tripId, seatNumber }});
    if (exist) throw new Error("Seat already booked");
    const booking = await tx.booking.create({...});
    // optionally mark TripSeat if used
  });

  // release lock
  await redis.del(lockKey);
}
```

---

## 4) Redis pub/sub + scaling for Socket.IO

* Use `socket.io-redis` (or `@socket.io/redis-adapter`) so many Socket.IO nodes share rooms & broadcasts.
* Redis cluster / managed Redis recommended when you have >2 instances.
* Use `ioredis` and `duplicate()` connections for pub/sub and for data operations.

Scaling note:

* Keep message payloads small (lat/lng + timestamp)
* Broadcast only to `trip:{id}:subscribers` room — avoids global fanout
* Consider rate-limiting location broadcasts (server can down-sample: broadcast every 2nd ping if many subscribers)

---

## 5) GitHub Actions — CI/CD skeletons

Place workflows in `.github/workflows/`

### `ci.yml` — run tests for all packages

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Run backend tests
        run: cd backend && npm ci && npm run test
      - name: Run web tests
        run: cd apps/web && npm ci && npm run test
      - name: Run mobile static checks
        run: cd apps/mobile && npm ci && npm run lint
```

### `deploy-staging.yml` — auto deploy to staging

```yaml
name: Deploy Staging
on:
  push:
    branches: [ staging ]
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: node-version: 20
      - name: Build backend
        run: |
          cd backend
          npm ci
          npm run build
      - name: Run migrations (staging)
        env:
          DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}
        run: |
          cd backend
          npx prisma migrate deploy
      - name: Deploy to server (example: ssh)
        run: ./scripts/deploy-staging.sh
        env:
          SSH_KEY: ${{ secrets.STAGING_SSH_KEY }}
```

### `deploy-prod.yml` — manual production deploy with backup

```yaml
name: Deploy Prod
on:
  workflow_dispatch:
jobs:
  backup_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Take DB Snapshot
        run: |
          # Example using supabase or provider CLI to snapshot
          ./scripts/take-prod-backup.sh
        env:
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
      - name: Run migrations
        env:
          DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
        run: |
          cd backend
          npx prisma migrate deploy
      - name: Deploy
        run: ./scripts/deploy-prod.sh
        env:
          SSH_KEY: ${{ secrets.PROD_SSH_KEY }}
```

Notes:

* Keep secrets in GitHub Secrets
* Ensure `take-prod-backup.sh` uses provider CLI to snapshot before migrations

---

## 6) `.env` variables layout (example `.env.example`)

```
# App
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Prisma
SHADOW_DATABASE_URL=

# Redis
REDIS_URL=redis://:password@redis-host:6379/0

# JWT
JWT_SECRET=change_this

# PayHere
PAYHERE_MERCHANT_ID=
PAYHERE_MERCHANT_SECRET=
PAYHERE_CALLBACK_SECRET=

# Socket
SOCKET_ORIGIN=https://staging.srivibes.lk

# Storage (Supabase)
SUPABASE_URL=
SUPABASE_KEY=

# Sentry
SENTRY_DSN=

# Deployment
APP_HOST=api.srivibes.lk
```

---

## 7) `docker-compose.yml` (dev / small staging)

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: srivibes
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    command: ["redis-server", "--appendonly", "yes"]
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/srivibes
      REDIS_URL: redis://redis:6379
    ports:
      - "4000:4000"

  web:
    build: ./apps/web
    depends_on:
      - backend
    ports:
      - "3000:3000"

volumes:
  pgdata:
```

---

## 8) Nginx config snippet (proxy + WebSocket)

`/infra/nginx/default.conf`

```nginx
server {
  listen 80;
  server_name api.srivibes.lk;

  location / {
    proxy_pass http://backend:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  location /socket.io/ {
    proxy_pass http://backend:4000/socket.io/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
  }
}
```

If you use Cloudflare, enable "WebSockets" and pass through.

---

## 9) Runbook / quick checklist for rollout

1. Provision Supabase Postgres + managed Redis (or DO managed)
2. Configure GitHub Secrets (DB URLs, Redis URL, JWT_SECRET, PayHere)
3. Create `.env.production` on server (from GitHub Secrets)
4. Deploy docker-compose on staging; run `npx prisma migrate dev`
5. Add Socket.IO Redis adapter configuration (`REDIS_URL`)
6. Load test booking flow: concurrent seat select → ensure locks hold
7. Simulate driver connections, 500 concurrent sockets → verify broadcast
8. Test payment webhooks & booking confirmation flow
9. Schedule daily DB backups + monthly restore drills

---

## Extras / Best practices

* Use `pgbouncer` or Supabase pooling to avoid `too many connections`
* Limit socket message size and apply server-side throttling (e.g., ignore location updates < 1 sec per same socket)
* Use health endpoints `/healthz` for uptime checks; set an uptime monitor
* Add instrumentation (Prometheus metrics or provider metrics) for: active sockets, redis locks, queue lengths, booking throughput

