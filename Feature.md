# SriVibes – Full Feature Specification & System Scope

This document explains **every feature**, **every role**, and **every system function** in SriVibes so that the whole team clearly understands the same scope before development begins.

This will be used for:
• Team alignment
• Task breakdown
• Development planning
• Investor / partner explanation
• Feature freeze for v1.0

---

## 1. Core Purpose of SriVibes

SriVibes is a **mobile + web platform** that helps people in Sri Lanka:
✅ Find hotels & restaurants for any occasion
✅ Book bus seats for long-distance travel
✅ Track buses in real-time
✅ Verify tickets using QR + Reference ID
✅ Give business owners a digital platform

Target users:
• Travelers
• Couples / friends / families
• Restaurant & hotel owners
• Bus drivers & conductors
• Admins / shareholders

---

## 2. User Roles & What They Can Do

### 2.1 Normal User (Passenger / Customer)

Mobile App access (React Native with Expo)

* Register / login (email / phone / Google)
* Search restaurants & hotels by:

  * Location
  * Occasion (date, family, party)
  * Budget
  * Ratings
* View:

  * Images
  * Menus / rooms
  * Price range
  * Contacts / directions

Bus ticket features:

* Search bus by:

  * From → To
  * Date & time
  * Price
* Select seat
* Pay using PayHere
* Receive:

  * E-bill (PDF-like screen)
  * QR code
  * Unique reference ID
* Track live bus location on map (Socket.IO + Redis realtime engine)
* View ticket history

On journey day:

* Show QR to conductor
* Get verified
* Booking changes → USED

---

### 2.2 Bus Driver App (simplified view)

* Login with special account
* See assigned trip
* Button: **START JOURNEY**
* Button: **END JOURNEY**
* Auto-share live location via Socket.IO (emit every 3–5 seconds)
* View number of passengers

No payments. No booking creation.

---

### 2.3 Conductor App (verification role)

* Login with special account
* Scan QR using camera
* View:

  * Passenger name
  * Trip details
  * Seat number
  * Status
* Tap: "Mark as used"
* Can reject invalid tickets

---

### 2.4 Hotel / Restaurant Owner

Web App + Mobile App

* Register business
* Add place
* Upload images (stored in Supabase Storage; DB stores image metadata / paths)
* Write description
* Set price range
* View user views
* Request promotions

No access to bus data

---

### 2.5 Admin (5 Shareholders)

Full Web Dashboard

* Add / edit / delete:

  * Buses
  * Routes
  * Trips
  * Place listings
* Manage users
* View payments

**Manual Override Power:**
Override flow is multi-sig and fully auditable. The data model includes `AdminOverride`, `AdminOverrideApproval`, and `AdminAuditLog` to ensure multi-admin approvals and immutable logging.

Any admin can request an override which creates an `AdminOverride` record. Critical overrides require approvals from other admins via `AdminOverrideApproval` records. All actions and decisions are recorded in `AdminAuditLog`.

Any admin action must:

* Include reason
* Be logged
* Be permanent in logs

---

## 3. Main System Features

### 3.1 Smart Search Engine

For restaurants & hotels and buses

* Filters
* Sorting
* Fast results using Redis cache

---

### 3.2 Seat Booking System

* Real-time availability
* Lock not allowed for too long
* Remove race conditions
* Prevent double booking

---

### 3.3 E-Ticket + QR System

Ticket includes:

* User name
* Date & time
* Bus & route
* Pickup & drop
* Price
* Unique Reference ID
* Auto-generated QR code

---

### 3.4 Live Location Tracking

Driver phone sends:

* lat
* lng
* speed
* timestamp

Architecture:

* Use Socket.IO (WebSockets) for real-time streaming of driver GPS to backend
* Use Redis for fast in-memory location caching and geo-queries
* Use PostgreSQL ONLY for optional historical snapshots in `LocationSnapshot` (saved every 3–5 minutes or at trip end)
* Mobile client emits location every 3–5 seconds via WebSocket (Socket.IO)
* Backend pushes live location to subscribed passengers and admin dashboards
* Admin can hide bus only if accident happens

---

### 3.5 Notification System

* Booking success
* Trip starting soon
* Bus is near pickup point
* Booking cancelled / changed

(delivered via platform push services or third-party providers; no vendor-managed realtime or push services used for tracking or messaging)

---

## 4. Security Features

* JWT Authentication
* Role-based access
* Encrypted passwords
* QR contains token, not real data
* Admin override logs
* Fraud detection rules
* Brute force protection
* Payment verification through PayHere webhook

---

## 5. Performance Architecture

Handles:

* 20,000 base users
* 100,000+ during festivals

Using:

* Supabase PostgreSQL
* Redis caching
* Socket.IO + Redis + PostgreSQL (optional) for realtime
* Horizontal backend scaling

---

## 6. Planned Add-ons (Version 2)

Optional future features:

* Hotel room booking
* Restaurant seat reservation
* AI recommendation engine
* Mobile wallet
* Loyalty points
* Reviews & ratings

These are NOT included in v1 to avoid scope explosion.

---

## 7. Team Responsibility Map

Leader: UI/UX + Marketing + Final decisions
You: Backend + System + Database + Mobile core
Member 2: Mobile features + Web features
Member 3: Web dashboard + SEO
Member 4: Finance + Data + Testing + Support

---

## 8. Status

✅ Features are now locked for version 1.0
✅ Ready for GitHub + Task creation
✅ Ready for sprint planning

Additional data models to support v1 (database + realtime changes):

- `LocationSnapshot` — historical GPS snapshots saved periodically (tripId, lat, lng, speed, recordedAt)
- `AdminOverride` — override request metadata (action, target, reason, createdBy, createdAt, status)
- `AdminOverrideApproval` — per-admin approval records (overrideId, adminId, decision, comment, decidedAt)
- `AdminAuditLog` — immutable audit entries for admin actions (actorId, action, details, timestamp)
- `Payment` — payment records for PayHere (bookingId, providerId, amount, currency, status, initiatedAt, completedAt)
- `WebhookLog` — raw webhook payloads and processing status (provider, event, payload, receivedAt, processedAt, status)

Notes:

- Seat locking and race-condition avoidance remain implemented via Redis (locks + atomic checks), not DB-only.
- Place images will be stored in Supabase Storage. The DB will store image metadata and storage paths (or a `PlaceImage` table) rather than raw string arrays.

---

Reply: **READY FOR GITHUB SETUP** when confirmed
Or: **ADD FEATURE** if you want modifications
