# README 3 — Why this Technology Stack is Best for SriVibes (Scale + Cost + Sri Lanka Context)

## 1. Final Selected Stack

### Core Stack

* Frontend Mobile: React Native (Expo)
* Frontend Web: Next.js (React)
* Backend: Node.js (Express + TypeScript)
* Main Database: PostgreSQL (Supabase)
* ORM: Prisma
* Live Location / Realtime: Socket.IO + Redis based real-time engine
* Cache: Redis (Upstash)
* Storage: Supabase Storage / Cloudinary
* Payment: PayHere (Sri Lanka)
* Hosting: Railway / Vercel / Supabase

This architecture is designed for:
• 20K users (launch phase)
• 100K+ spike during Avurudu season
• Minimal operating cost
• Easy scaling without rebuild

---

## 2. Why PostgreSQL + Prisma (Not MongoDB / Full managed realtime stacks)

### PostgreSQL Advantages

* Ideal for structured booking data
* ACID compliant (financial transactions safe)
* Strong relationships (Bus → Route → Trip → Booking)
* Easy reporting, analytics, accounting
* Works perfectly with PayHere webhooks

### Why Prisma

* Safer queries (type-safe)
* Faster development
* Easy migrations
* Prevents data corruption
* Works smoothly with Supabase Postgres

**MongoDB rejected because**:

* Complex relations become messy
* No true transaction guarantee without setup
* Harder for fintech-like logic

**Full managed realtime stacks rejected because**:

* Expensive at scale
* Relational data poorly supported
* Hard to query travel history / analytics

---

## 3. Live GPS (FINAL)

Realtime location needs:

* WebSocket connection for low-latency streaming
* Ultra-low latency
* Only last location usually matters for live UI

Socket.IO + Redis based real-time engine:

* Use Socket.IO (WebSockets) for streaming driver GPS
* Redis for fast in-memory location caching and geo-queries
* PostgreSQL ONLY for optional historical snapshots (LocationSnapshot table)
* Mobile client emits location every 3–5 seconds via WebSocket
* Backend pushes live location to subscribed users (passengers / admin dashboard)
* Save snapshot to PostgreSQL every 3–5 minutes or at trip end (NOT continuously)

This architecture uses Socket.IO + Redis (with PostgreSQL snapshots) to provide a scalable, low-cost realtime layer.

---

## 4. Cost Comparison (SriVibes Scenario)

### At 20,000 - 30,000 users

| Service             | Monthly Cost (approx)    |
| ------------------- | ------------------------ |
| Supabase (Postgres) | FREE - $25               |
| Socket.IO / Redis (realtime) | $10 - $20                |
| Backend hosting     | $20 - $30                |
| Redis cache         | $10 - $20                |
| Storage             | $10 - $20                |
| Domains/SSL         | $2                       |
| **Total**           | **~ $75 - $120 / month** |

In LKR → Rs. 24,000 – Rs. 38,000/month

✅ Fits your Rs. 800K budget for a full year

---

### At 100,000+ users (Avurudu spike)

| Service        | Monthly Cost            |
| -------------- | ----------------------- |
| Supabase Pro   | $50 - $75               |
| Socket.IO / Redis | $40 - $60               |
| Backend Server | $50 - $80               |
| Redis          | $20 - $40               |
| Storage/CDN    | $30 - $50               |
| Security (WAF) | $15                     |
| **Total**      | **$205 - $320 / month** |

In LKR → Rs. 65,000 – Rs. 102,000/month

✅ Still profitable if you earn even Rs. 50 per booking

---

## 5. Why React Native (Expo) (Mobile App)

Instead of Kotlin + Swift or other cross-platform frameworks

* One codebase for iOS and Android
* Faster development iterations with Expo
* Cheaper maintenance and shared JS/TypeScript expertise
* Large community and stable ecosystem
* Easier for a JavaScript-first team to onboard

---

## 6. Why Next.js (Web App)

* CEO/Owner dashboard
* SEO for restaurants/buses
* Fast SSR loading
* Good for ads + marketing
* Works perfectly on Vercel

Also perfect for your Web Specialist member

---

## 7. Handling 100,000 Users (Architecture Proof)

This stack supports:

* Horizontal scaling
* Multiple backend instances
* Read replica DB
* Redis caching for heavy searches
* Socket.IO + Redis for realtime

Your app will NOT crash during Avurudu.

---

## 8. Decision Finalized (For your Team / Investors)

We chose:
**PostgreSQL + Prisma + Socket.IO + Redis + React Native (Expo) + Next.js**

Because:

* Lowest long-term cost
* Easy scaling
* Strong security
* Easy for your team
* Industry standard
* Sri Lanka payment ready

This is the BEST possible combo under Rs. 800,000

---

## 9. Next Step

Reply:
✅ **"READY FOR GITHUB SETUP"**

And I’ll generate:

* Final GitHub repo setup commands
* Branch structure
* Access roles
* CI/CD pipeline
* Initial issues list
* Task breakdown per member
