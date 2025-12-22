import express, { Request, Response } from 'express';
import http from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import Redis from 'ioredis';
import cors from 'cors';
import { verifyToken, TokenPayload } from './middleware/auth';
import { PrismaClient } from '@prisma/client';

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: '*' }
});

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const prisma = new PrismaClient();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

type SocketData = { user?: TokenPayload } & any;

// In-memory map to throttle snapshot writes per trip (tripId -> lastPersistTs)
const lastSnapshotAt = new Map<string, number>();
const SNAPSHOT_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes

// Simple health route
app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

// Public webhook endpoint for PayHere (implementation placeholder)
app.post('/payments/webhook', async (req: Request, res: Response) => {
  // Log webhook payload to DB (WebhookLog) and process
  // For now, just acknowledge
  console.log('Webhook received:', req.body?.event || req.body);
  // TODO: validate signature using PAYHERE secret
  res.status(200).send('OK');
});

// Socket auth pattern: client emits 'authenticate' with { token }
io.on('connection', (socket: Socket & { data: SocketData }) => {
  console.log('Socket connected', socket.id);

  socket.on('authenticate', ({ token }: { token?: string }) => {
    const payload = verifyToken(token ?? null);
    if (!payload) {
      socket.emit('auth:error', { message: 'Invalid token' });
      socket.disconnect(true);
      return;
    }
    socket.data.user = payload;
    socket.emit('auth:ok', { userId: payload.userId, role: payload.role });
  });

  socket.on('subscribe:trip', ({ tripId }: { tripId: string }) => {
    if (!tripId) return;
    socket.join(`trip:${tripId}`);
    socket.emit('subscribed', { tripId });
  });

  socket.on('unsubscribe:trip', ({ tripId }: { tripId: string }) => {
    if (!tripId) return;
    socket.leave(`trip:${tripId}`);
    socket.emit('unsubscribed', { tripId });
  });

  socket.on('location:update', async (payload: { tripId: string; lat: number; lng: number; speed?: number; timestamp?: string }) => {
    // Basic validation & auth
    const user = socket.data.user;
    if (!user) return socket.emit('error', { message: 'unauthenticated' });
    // Only allow drivers (or admins in special cases)
    if (user.role !== 'DRIVER' && user.role !== 'ADMIN') return socket.emit('error', { message: 'forbidden' });

    const { tripId, lat, lng, speed, timestamp } = payload;
    if (!tripId || typeof lat !== 'number' || typeof lng !== 'number') {
      return socket.emit('error', { message: 'invalid payload' });
    }

    const now = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();

    // Update Redis latest location (keep small TTL so it expires when driver goes offline)
    const key = `live:trip:${tripId}`;
    const value = JSON.stringify({ tripId, lat, lng, speed, updatedAt: now });
    try {
      await redis.set(key, value, 'EX', 30); // expires in 30s
    } catch (err) {
      console.error('Redis set error', err);
    }

    // Broadcast to room
    io.to(`trip:${tripId}`).emit('trip:location', { tripId, lat, lng, speed, timestamp: now });

    // Persist occasional snapshots to Postgres (every SNAPSHOT_INTERVAL_MS)
    const last = lastSnapshotAt.get(tripId) || 0;
    const diff = Date.now() - last;
    if (diff > SNAPSHOT_INTERVAL_MS) {
      lastSnapshotAt.set(tripId, Date.now());
      // Try to persist; errors should not break live flow
      try {
        await prisma.locationSnapshot.create({
          data: { tripId, lat, lng, speed: speed ?? null, recordedAt: new Date(now) }
        });
      } catch (err) {
        console.error('Prisma snapshot error', err);
      }
    }
  });

  socket.on('disconnect', (reason: any) => {
    console.log('Socket disconnected', socket.id, reason);
  });
});

server.listen(PORT, () => {
  console.log(`Backend + Socket.IO running on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  console.log('Shutting down...');
  try { await prisma.$disconnect(); } catch {}
  try { await redis.quit(); } catch {}
  process.exit(0);
});
