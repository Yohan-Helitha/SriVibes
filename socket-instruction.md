# sockets.md — Socket.IO Event Contract & TypeScript Types

This file defines the **Socket.IO event contract** for SriVibes and TypeScript types you can use both in the backend and clients (driver, passenger, conductor, admin). Keep this as the canonical reference for realtime events.

---

## 1. High-level overview

Roles that use sockets:

* DRIVER — sends location and status
* PASSENGER — subscribes to trips and receives location & status updates
* CONDUCTOR — may subscribe and perform scans (optional via socket or REST)
* ADMIN — subscribes to admin channels (alerts)

Naming convention for channels / rooms:

* `driver:{tripId}` — driver private room
* `trip:{tripId}:subscribers` — passengers & conductors subscribed to live updates
* `admin:alerts` — admin alerts channel

All socket connections must authenticate using JWT in `handshake.auth.token`.

---

## 2. TypeScript types (shared)

```ts
// packages/types/src/socket.ts
export type Role = 'PASSENGER' | 'DRIVER' | 'CONDUCTOR' | 'ADMIN' | 'BUSINESS';

export interface UserPayload {
  id: string; // user id
  role: Role;
  email?: string;
}

// driver -> server: connect to trip
export interface DriverConnectPayload {
  tripId: string; // UUID
}

// driver -> server: periodic location update
export interface DriverLocationUpdate {
  tripId: string; // UUID
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp?: string; // ISO
}

// driver -> server: status event
export type DriverStatus = 'STARTED' | 'PAUSED' | 'ENDED' | 'EMERGENCY';
export interface DriverStatusPayload {
  tripId: string;
  status: DriverStatus;
  timestamp?: string;
}

// passenger -> server: subscribe
export interface PassengerSubscribePayload {
  tripId: string; // UUID
}

// server -> passenger: broadcast location
export interface ServerLocationPayload {
  tripId: string;
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  updatedAt: string; // ISO
}

// conductor -> server: scan token (if using socket based scan)
export interface ConductorScanPayload {
  token: string; // token from QR
}

// server -> conductor: scan result
export interface ConductorScanResult {
  valid: boolean;
  bookingId?: string;
  referenceCode?: string;
  passengerName?: string;
  seatNumber?: number;
  pickupPoint?: string;
  dropPoint?: string;
  price?: number;
  status?: string; // booking status
  message?: string; // error or explanatory
}
```

---

## 3. Events list (canonical)

### Connection / Authentication

* client -> server: (on connect) send `auth` object in handshake: `{ token }` (JWT)
* server validates token and populates `socket.data.user` with `UserPayload`

### Driver events

* `driver:connect` (payload: `DriverConnectPayload`) — join driver to trip rooms
* `driver:location:update` (payload: `DriverLocationUpdate`) — server stores latest state in Redis and broadcasts to `trip:{tripId}:subscribers`
* `driver:status` (payload: `DriverStatusPayload`) — server updates trip status and broadcasts

### Passenger events

* `passenger:subscribe` (payload: `PassengerSubscribePayload`) — join `trip:{tripId}:subscribers`

### Conductor events

* `conductor:scan` (payload: `ConductorScanPayload`) — server verifies token (DB) and returns `ConductorScanResult`

### Admin events

* `admin:subscribe` — join `admin:alerts`
* `server:alert` — server -> admin: events like `EMERGENCY` or high error rates

---

## 4. Error handling & ack pattern

All critical events should use acknowledgements (Socket.IO ACK) so client knows whether the server successfully processed the event.

Example (driver location):

```ts
socket.emit('driver:location:update', payload, (ack) => {
  if (ack && ack.ok) {
    // success
  } else {
    // handle retry/backoff
  }
});
```

ACKs should include at minimum:

```ts
{ ok: boolean, error?: string }
```

---

## 5. Rate limiting & throttling

* Driver clients: enforce min interval (e.g., 3s) and max updates per minute cap on server
* Passenger subscriptions: limit number of active subscriptions per user (e.g., 5 trips)
* Use Redis counters (sliding window) for rate limiting per socket/user

---

## 6. Security considerations

* Always validate `tripId` and ensure socket user is authorized (driver for that trip, passenger with booking for that trip etc.)
* Do not broadcast sensitive PII; only minimal data needed
* Use TLS and secure cookie/session if needed

---

## 7. Persisting history (LocationSnapshot)

* Save snapshots to Postgres every N minutes or on `trip:ENDED` event
* Use a background worker (BullMQ) to persist snapshots so Socket.IO server is non-blocking

---

## 8. Development utilities

* `tools/replay-location.js` — script to replay location streams for load testing
* `tools/mock-driver-client.ts` — local mock driver script

---

# backend/src/sockets/index.ts — Full implementation (TypeScript)

```ts
// backend/src/sockets/index.ts
import http from 'http';
import { Server as IOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import IORedis from 'ioredis';
import { verifyJwt } from '../utils/auth';
import { setLiveLocation, getLiveLocation } from '../services/locationService';
import { logger } from '../utils/logger';

// Types (import or define)
import type { DriverLocationUpdate, DriverConnectPayload, PassengerSubscribePayload, DriverStatusPayload, ConductorScanPayload } from '../../packages/types/src/socket';

export function attachSocket(server: http.Server) {
  const io = new IOServer(server, {
    cors: { origin: '*' },
    maxHttpBufferSize: 1e6, // 1MB
  });

  // Configure Redis adapter (read REDIS_URL from env)
  const pubClient = new IORedis(process.env.REDIS_URL as string);
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = (socket.handshake.auth && socket.handshake.auth.token) || socket.handshake.headers['authorization'];
      if (!token) return next(new Error('NO_TOKEN'));
      const jwt = Array.isArray(token) ? token[0] : token;
      const user = await verifyJwt(jwt.replace('Bearer ', ''));
      if (!user) return next(new Error('INVALID_TOKEN'));
      socket.data.user = user; // { id, role }
      return next();
    } catch (err) {
      logger.error('Socket auth failed', err);
      return next(new Error('AUTH_ERROR'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    logger.info(`Socket connected: ${user.id} (${user.role}) socketId=${socket.id}`);

    // DRIVER connects to trip
    socket.on('driver:connect', async (payload: DriverConnectPayload, cb?: (ack: any) => void) => {
      try {
        // Basic authorization: ensure user role is DRIVER
        if (user.role !== 'DRIVER') throw new Error('NOT_DRIVER');
        const { tripId } = payload;
        socket.join(`driver:${tripId}`);
        socket.join(`trip:${tripId}:subscribers`);
        socket.data.tripId = tripId;
        cb && cb({ ok: true });
      } catch (err: any) {
        logger.warn('driver:connect failed', err?.message || err);
        cb && cb({ ok: false, error: err?.message });
      }
    });

    // Driver location updates
    socket.on('driver:location:update', async (payload: DriverLocationUpdate, cb?: (ack: any) => void) => {
      try {
        const { tripId, lat, lng, speed } = payload;
        // minimal validation
        if (!tripId || typeof lat !== 'number' || typeof lng !== 'number') throw new Error('INVALID_PAYLOAD');

        // store latest location into redis (service)
        const updatedAt = new Date().toISOString();
        await setLiveLocation(tripId, { lat, lng, speed, updatedAt });

        // broadcast to subscribers
        io.to(`trip:${tripId}:subscribers`).emit('server:location:update', { tripId, lat, lng, speed, updatedAt });

        cb && cb({ ok: true });
      } catch (err: any) {
        logger.error('driver:location:update failed', err);
        cb && cb({ ok: false, error: err?.message });
      }
    });

    // Driver status events
    socket.on('driver:status', async (payload: DriverStatusPayload, cb?: (ack: any) => void) => {
      try {
        const { tripId, status } = payload;
        // Broadcast new status
        io.to(`trip:${tripId}:subscribers`).emit('server:trip:status', { tripId, status, timestamp: new Date().toISOString() });
        cb && cb({ ok: true });
      } catch (err: any) {
        logger.error('driver:status failed', err);
        cb && cb({ ok: false, error: err?.message });
      }
    });

    // Passenger subscription
    socket.on('passenger:subscribe', async (payload: PassengerSubscribePayload, cb?: (ack: any) => void) => {
      try {
        const { tripId } = payload;
        // optional: authorization: ensure passenger has booking for tripId
        socket.join(`trip:${tripId}:subscribers`);
        // optionally emit current location immediately
        const loc = await getLiveLocation(tripId);
        if (loc) socket.emit('server:location:update', loc);
        cb && cb({ ok: true, current: loc });
      } catch (err: any) {
        logger.warn('passenger:subscribe failed', err);
        cb && cb({ ok: false, error: err?.message });
      }
    });

    // Conductor scan via socket (optional)
    socket.on('conductor:scan', async (payload: ConductorScanPayload, cb?: (ack: any) => void) => {
      try {
        // parse token and verify (implementation detail in a service)
        // const result = await verifyScanToken(payload.token);
        // cb(result)
        cb && cb({ ok: false, error: 'Not implemented in example' });
      } catch (err: any) {
        logger.error('conductor:scan failed', err);
        cb && cb({ ok: false, error: err?.message });
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} reason=${reason}`);
    });
  });

  return io;
}
```

---

# scripts/deploy-staging.sh (placeholder)

```bash
#!/usr/bin/env bash
set -euo pipefail

# deploy-staging.sh
# Example staging deploy script. Adapt to your infra (ssh, rsync, docker, kubectl, etc.)

echo "Starting staging deployment..."

# 1. Build backend
cd backend
npm ci
npm run build

# 2. Run migrations on staging database
if [ -z "${STAGING_DATABASE_URL:-}" ]; then
  echo "STAGING_DATABASE_URL not set"; exit 1
fi
export DATABASE_URL="$STAGING_DATABASE_URL"
npx prisma migrate deploy

# 3. Copy files to staging server (example via rsync over SSH)
# Note: configure STAGING_SSH_USER and STAGING_SSH_HOST in your CI
# rsync -avz --delete ./dist $STAGING_SSH_USER@$STAGING_SSH_HOST:/var/www/srivibes/backend

# 4. Restart services on staging (systemd / docker-compose / k8s)
# ssh $STAGING_SSH_USER@$STAGING_SSH_HOST 'cd /var/www/srivibes && docker-compose pull && docker-compose up -d --build'

echo "Staging deployment complete."
```

---

# scripts/take-prod-backup.sh (placeholder)

```bash
#!/usr/bin/env bash
set -euo pipefail

# take-prod-backup.sh
# Example script to trigger a production DB snapshot.
# Implement using your provider's CLI (Supabase, AWS RDS, DigitalOcean, etc.)

if [ -z "${PROD_DATABASE_URL:-}" ]; then
  echo "PROD_DATABASE_URL not set"; exit 1
fi

# Example: Using supabase CLI (if you use Supabase)
# supabase db remote set $PROD_DATABASE_URL
# supabase db dump --file prod-snapshot-$(date +%F_%H%M%S).sql

# Placeholder: print message
echo "Triggering production backup (placeholder). Implement provider-specific commands here."

# Example with psql (if allowed):
# PGPASSWORD=$PGPASSWORD pg_dump --format=custom --file=prod-snapshot-$(date +%F_%H%M%S).dump $PROD_DATABASE_URL

