# SriVibes – Folder Structure

This document defines the **complete monorepo structure** for the SriVibes Mobile + Web + Backend system.

Use **ONE GitHub repository** to manage all services in an organized, scalable way.

---

## 📁 Root Structure

```
SriVibes/
│
├── apps/                     # All client-facing applications
│   ├── mobile/               # React Native (Expo) app
│   └── web/                  # Next.js web app
│
├── backend/                  # Node.js + Express + Prisma API
│
├── database/                 # Database related files (Prisma schema & migrations)
│
├── infrastructure/           # Docker, Nginx, Redis, deployment configs
│
├── docs/                     # System documentation
│
├── scripts/                  # Utility & automation scripts
│
└── .github/                  # GitHub Actions CI/CD
```

---

## 📱 `/apps/mobile` – Mobile Application (React Native + Expo)

```
/apps/mobile
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── animations/
│
├── src/
│   ├── components/           # Reusable UI components
│   ├── screens/               # Screen pages (Login, Home, Booking, QR, Tracking)
│   ├── navigation/           # App navigation (Stack, Tabs)
│   ├── context/              # Global states (Auth, Booking, Location)
│   ├── services/             # API & Socket.IO services (realtime)
│   ├── hooks/                # Custom React hooks
│   ├── utils/                # Helper functions
│   ├── constants/            # Colors, URLs, keys, enums
│   └── types/                # TypeScript types
│
├── App.tsx
├── app.json
├── package.json
└── tsconfig.json
```

Main responsibilities:

* User booking flow
* QR code display
* Bus live tracking
* Conductor scan mode
* Driver journey mode

---

## 🌐 `/apps/web` – Web Application (Next.js)

```
/apps/web
│
├── public/
│
├── src/
│   ├── app/                      # Next.js App router
│   ├── components/
│   ├── pages/                   # Business & admin dashboards
│   ├── layouts/
│   ├── services/
│   ├── lib/
│   ├── styles/
│   └── utils/
│
├── next.config.js
├── tsconfig.json
└── package.json
```

Main responsibilities:

* Admin panel
* Business owner dashboard
* Data reports & analytics
* Manual Overriding system

---

## ⚙️ `/backend` – Main Backend Server

```
/backend
│
├── src/
│   ├── controllers/             # Business logic
│   ├── routes/                   # API grouping
│   ├── middlewares/             # Auth, role checks, rate limits
│   ├── services/                # PayHere, QR, Redis, Storage
│   ├── sockets/                 # Socket.IO logic for live tracking
│   ├── utils/                   # Helper utilities
│   ├── types/                   # Shared types
│   ├── jobs/                    # Background jobs (refunds, cleanup)
│   └── server.ts               # Entry point
│
├── prisma/
│   ├── index.ts
│
├── tests/
│
├── package.json
├── tsconfig.json
└── .env.example
```

Main responsibilities:

* Authentication & Authorization
* Ticket booking & verification
* QR code generation & validation
* Seat locking using Redis
* Live bus location handling (Socket.IO + Redis realtime engine)
* Manual override functionality

---

## 🗄️ `/database`

```
/database
│
├── schema.prisma
├── migrations/
├── seed.ts
└── enums/
```

Contains:

* Full PostgreSQL structure
* Prisma ORM schema (includes `LocationSnapshot`, `Payment`, `WebhookLog`, admin override & audit models)
* Data seeding scripts

---

## 🏗️ `/infrastructure`

```
/infrastructure
│
├── docker/
│   ├── backend.Dockerfile
│   ├── web.Dockerfile
│   └── mobile.Dockerfile
│
├── nginx/
│   └── default.conf
│
├── redis/
│   └── redis.conf
│
├── docker-compose.yml
└── cloudflare-config.md
```

Handles:

* Production deployment
* Load balancing
* Redis setup
* Nginx routing

---

## 🧾 `/docs`

```
/docs
│
├── API-SPEC.md
├── ARCHITECTURE.md
├── ROLES.md
├── OVERRIDE_SYSTEM.md
└── SECURITY.md
```

Documentation about:

* API contracts
* Roles & permissions
* Security policy
* Manual override permission model

---

## 🔁 `/scripts`

```
/scripts
│
├── setup.sh
├── migrate.sh
├── seed.sh
└── deploy.sh
```

Used for:

* One-command setup
* Database migration
* CI/CD automation

---

## 🤖 `/.github`

```
/.github
│
└── workflows/
    └── ci.yml
```

Handles:

* Auto testing
* Build on push
* Deployment automation

---

## ✅ Branching Strategy

```
main      → Production only
staging   → Testing & QA
dev       → Active development
feature/* → New features
hotfix/*  → Emergency fixes
```

---

## ✅ This structure is built for:

* ✅ 100,000+ users
* ✅ Real-time tracking
* ✅ Scalability
* ✅ Security
* ✅ Easy collaboration
* ✅ Investor ready

---

✅ This is **README #1 – Folder Structure & Repository Design**

Reply with:
**GENERATE DOC 2**  → I will now generate your full **Prisma + PostgreSQL Schema** document.
