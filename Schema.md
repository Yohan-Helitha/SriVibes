# README 2 — Prisma + PostgreSQL Database Schema for SriVibes

## 1. Overview

This document defines the database structure for SriVibes using:
• PostgreSQL (Supabase hosted)
• Prisma ORM

It is designed for:
• 100,000+ users
• Real-time bus tracking
• QR-based ticket verification
• Admin override control
• Restaurant & hotel listings

---

## 2. Main Tables

### 2.1 users

```prisma
model User {
  id            String   @id @default(uuid())
  name          String
  email         String   @unique
  phone         String?
  password      String
  role          Role     @default(USER)
  createdAt     DateTime @default(now())
  bookings      Booking[]
}
```

### 2.2 buses

```prisma
model Bus {
  id           String   @id @default(uuid())
  busNumber    String @unique
  expressName  String
  driverName   String
  capacity     Int
  isActive     Boolean  @default(true)
  trips        Trip[]
}
```

### 2.3 routes

```prisma
model Route {
  id           String   @id @default(uuid())
  startPoint   String
  endPoint     String
  distanceKm   Float
  trips        Trip[]
}
```

### 2.4 trips

```prisma
model Trip {
  id           String   @id @default(uuid())
  busId        String
  routeId      String
  departure    DateTime
  arrival      DateTime
  price        Float
  seatsTotal   Int
  seatsBooked  Int @default(0)

  bus          Bus   @relation(fields: [busId], references: [id])
  route        Route @relation(fields: [routeId], references: [id])
  bookings     Booking[]
}
```

### 2.5 bookings

```prisma
model Booking {
  id           String   @id @default(uuid())
  referenceId  String   @unique
  userId       String
  tripId       String
  seatNumber   String
  price        Float
  status       BookingStatus @default(CONFIRMED)
  qrCode       String
  createdAt    DateTime @default(now())

  user         User @relation(fields: [userId], references: [id])
  trip         Trip @relation(fields: [tripId], references: [id])
}
```

```prisma
model TripSeat {
  id        String @id @default(uuid())
  tripId    String
  seatNumber String
  status    SeatStatus @default(AVAILABLE)
  bookingId String?

  trip      Trip @relation(fields: [tripId], references: [id])
  @@unique([tripId, seatNumber])
  @@index([tripId])
}

enum SeatStatus {
  AVAILABLE
  LOCKED
  BOOKED
}
```

### 2.6 Location snapshots (history only)

```prisma
model LocationSnapshot {
  id        String   @id @default(cuid())
  tripId    String
  lat       Float
  lng       Float
  speed     Float?
  recordedAt DateTime @default(now())
  @@index([tripId])
}
```

```prisma
model Payment {
  id          String  @id @default(uuid())
  bookingId   String
  provider    String  // e.g. 'PAYHERE'
  providerRef String? // provider transaction id
  amount      Float
  currency    String  @default("LKR")
  status      PaymentStatus @default(PENDING)
  initiatedAt DateTime @default(now())
  completedAt DateTime?

  booking     Booking @relation(fields: [bookingId], references: [id])
  @@index([bookingId])
}

model WebhookLog {
  id          String @id @default(uuid())
  provider    String
  event       String
  payload     Json
  receivedAt  DateTime @default(now())
  processedAt DateTime?
  status      String @default("PENDING")
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
}
```

### 2.7 restaurants & hotels

```prisma
model Place {
  id          String   @id @default(uuid())
  name        String
  type        PlaceType
  location    String
  priceRange  String
  description String
  rating      Float @default(0)
  images      PlaceImage[]
}

model PlaceImage {
  id        String @id @default(uuid())
  placeId   String
  path      String // Supabase Storage path or public URL
  caption   String?
  createdAt DateTime @default(now())

  place     Place @relation(fields: [placeId], references: [id])
  @@index([placeId])
}
```

### 2.8 admin overrides & audit

```prisma
model AdminOverride {
  id          String   @id @default(uuid())
  action      String   // e.g. 'FORCE_REFUND', 'UNLOCK_SEAT', 'HIDE_LOCATION'
  targetId    String?  // target resource id (bookingId, tripId, etc.)
  reason      String
  createdBy   String   // admin who requested
  status      OverrideStatus @default(PENDING)
  createdAt   DateTime @default(now())
  approvals   AdminOverrideApproval[]
}

model AdminOverrideApproval {
  id          String  @id @default(uuid())
  overrideId  String
  adminId     String
  decision    Boolean
  comment     String?
  decidedAt   DateTime @default(now())

  override    AdminOverride @relation(fields: [overrideId], references: [id])
  @@index([overrideId])
}

model AdminAuditLog {
  id        String @id @default(uuid())
  actorId   String
  action    String
  details   String
  timestamp DateTime @default(now())
  @@index([actorId])
}
```

enum OverrideStatus {
  PENDING
  APPROVED
  REJECTED
  EXECUTED
}

```

---

## 3. ENUMS

```prisma
enum Role {
  USER
  DRIVER
  CONDUCTOR
  PARTNER
  ADMIN
  SUPER_ADMIN
}

enum BookingStatus {
  CONFIRMED
  CANCELLED
  USED
  EXPIRED
}

enum PlaceType {
  RESTAURANT
  HOTEL
}

```

---

## 4. QR code logic

QR contains:

```
SriVibes|BOOKING|{referenceId}
```

When scanned:

1. API verifies referenceId
2. Shows details (name, date, bus, pickup, drop, price)
3. Changes status -> USED

---

## 5. Scalability


• Indexed on: referenceId, tripId, userId
• Works on Supabase Postgres with read replicas
• Live tracking: Socket.IO + Redis (Postgres used only for optional snapshots)

---

## 6. Migration command

```bash
npx prisma init
npx prisma migrate dev --name srivibes
```

---

Reply **"GENERATE DOC 3"** to get the final doc (Why this technology is best + cost advantage for Sri Lanka)
