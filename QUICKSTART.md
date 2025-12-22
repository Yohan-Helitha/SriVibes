# SriVibes - Quick Start Guide

## 🚀 Run Docker Containers

```powershell
# From project root
docker compose -f infra/docker/docker-compose.yml up --build
```

This starts:
- ✅ PostgreSQL (port 5432)
- ✅ Redis (port 6379)
- ✅ Backend API + Socket.IO (port 4000)
- ✅ Web Admin Dashboard (port 3000)
- ✅ Adminer DB GUI (port 8080)

---

## 📱 Run Mobile App (After Docker is running)

**New Terminal:**

```powershell
cd apps/mobile
npm install
npm start --lan
```

**On Your Phone:**
1. Connect phone to **same Wi-Fi** as laptop
2. Install **Expo Go** app from store
3. Scan QR code from terminal
4. App loads instantly! 🎉

---

## 🔗 Access Points

- Backend API: http://localhost:4000
- Web Dashboard: http://localhost:3000
- Database GUI: http://localhost:8080
- Mobile App: Scan QR with Expo Go

---

## 🛠️ Troubleshooting

**Can't scan QR?**
- Ensure phone and laptop on same Wi-Fi
- Try `npm start --tunnel` instead

**Database connection failed?**
- Wait 10 seconds for Postgres to initialize
- Check `.env` file exists

**Port already in use?**
- Stop existing containers: `docker compose down`
- Or change ports in `docker-compose.yml`

---

## 📝 Next Steps

1. Run Prisma migrations:
   ```powershell
   docker compose exec backend npx prisma migrate dev
   ```

2. Seed database:
   ```powershell
   docker compose exec backend npx prisma db seed
   ```

3. View logs:
   ```powershell
   docker compose logs -f backend
   ```
