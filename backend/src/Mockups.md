# Mobile Mockups & Realtime Mapping Notes

This file documents the UI screens and how they map to realtime events and data sources. Use this as the source-of-truth when converting mockups into production screens.

1) Available mockups

- No graphical mockup images were provided in the repository. Use the screen list below to create quick wireframes.

2) Screens (high-level)

- Splash / Onboarding
- Auth (Login / Register / Forgot)
- Home / Search (from/to/date)
- Trips list (search results)
- Trip details + Seat map (real-time seat status)
- Booking flow (lock -> confirm -> pay)
- Ticket (QR + reference) + Booking history
- Driver mode (start/end journey, share location)
- Conductor mode (scan QR -> verify)
- Business owner screens (place CRUD)

3) Realtime mapping notes

- Live location: mobile (driver) emits `location:update` via Socket.IO every 3-5s.
  - Payload: { tripId, lat, lng, speed, timestamp }
  - Backend updates Redis `live:trip:${tripId}` and broadcasts `trip:location` to room `trip:${tripId}`.
  - Passenger app subscribes to `trip:${tripId}` and listens for `trip:location` to update the map marker.

- Seat booking: UI locks a seat by calling POST /bookings/lock — backend creates a Redis lock key `lock:trip:${tripId}:seat:${seatNumber}`.
  - After lock, UI shows temporary reserved state and starts countdown. If user does not confirm before expiry, call unlock endpoint or let lock expire.

- Booking confirmation: After payment or confirmation, backend emits `seat:update` with status BOOKED to `trip:${tripId}` to update other clients' seat maps.

4) Map & marker behavior

- Follow the driver's position; smooth animations by interpolating between successive positions.
- On reconnection, fetch latest `live:trip:${tripId}` from REST (or Redis via socket request) to avoid jumps.

5) Assets & placeholders

- Use placeholder images until Supabase Storage paths are available. Store `PlaceImage` records with `path` pointing to Supabase.

6) Notes for Play Store production

- Use release channel builds, set applicationId / bundleIdentifier per Play Store rules.
- Integrate app signing and follow Play Store privacy/disclosure for location usage.
