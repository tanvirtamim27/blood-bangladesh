# 🩸 Blood Bangladesh (ব্লাড বাংলাদেশ)

A free, volunteer-run web platform that connects blood donors and patients across Bangladesh.

স্বেচ্ছাসেবী রক্তদাতা ও রক্তগ্রহীতাদের যুক্ত করার একটি বিনামূল্যের ওয়েব প্ল্যাটফর্ম।

**Live:** https://blood-bangladesh-psi.vercel.app

> This is a completely voluntary initiative. Do not make any financial transaction in exchange for blood.
> এটি একটি সম্পূর্ণ স্বেচ্ছাসেবী উদ্যোগ। রক্তের বিনিময়ে কোনো প্রকার আর্থিক লেনদেন করবেন না।

## Features

- 🔍 **Donor search** by blood group, division, district and upazila (all 64 districts, 494 upazilas)
- ⏳ **90-day rule:** recent donors automatically show as unavailable
- 🔒 **Privacy:** phone numbers are masked for visitors who are not signed in
- 🎚️ **Interest switch:** donors can hide themselves from all searches
- 🚨 **Emergency blood requests** with an auto-refreshing feed and expiry
- ✉️ **Direct messages** to donors, with notifications and daily limits
- ✅ **Donation confirmation** by the requester, donation history and **badges**
- 🔔 **In-app notifications**
- 🛡️ **Admin panel:** user moderation, donor verification, request removal, admin management, blog CMS
- 📝 **Awareness blog** (English and Bangla)
- 🌐 **Bilingual UI** (বাংলা / English) and light / dark mode
- 🔑 **Google sign-in only** (no passwords stored), refresh-token rotation, rate limiting

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 4, Spring Security (JWT), JdbcClient, Flyway |
| Database | PostgreSQL |
| Frontend | Next.js 16 (App Router), React, TypeScript, Tailwind CSS |
| Auth | Google Identity Services, JWT access token + HttpOnly refresh cookie |
| Deploy | Vercel (frontend), Render (backend, Docker), Neon (PostgreSQL) |

## Project structure


blood-bangladesh/
├── blood-bangladesh-api/   # Spring Boot REST API
├── blood-bangladesh-web/   # Next.js frontend
├── docker-compose.yml      # Local PostgreSQL + Adminer
├── docker-compose.prod.yml # Full production-style stack (db, api, web, Caddy)
└── Caddyfile


## Run locally

**Requirements:** JDK 21, Node.js 20+, Docker Desktop.

1. Create a .env file in the project root (never commit it):
   
   DB_NAME=blood_bd
   DB_USER=bb_user
   DB_PASSWORD=choose-a-password
   JWT_SECRET=a-random-string-of-at-least-32-characters
   GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
   
2. Start the database:
   bash
   docker compose up -d
   
3. Start the backend (set JWT_SECRET and GOOGLE_CLIENT_ID as environment variables):
   bash
   cd blood-bangladesh-api
   ./mvnw spring-boot:run
   
4. Start the frontend (create lood-bangladesh-web/.env.local with NEXT_PUBLIC_GOOGLE_CLIENT_ID=...):
   bash
   cd blood-bangladesh-web
   npm install
   npm run dev
   
5. Open http://localhost:3000

### Google sign-in setup

Create an OAuth client (type **Web application**) in Google Cloud Console and add your site URL
(for example http://localhost:3000) to **Authorized JavaScript origins**.

### Make the first admin

Sign in once, then run in your database:

sql
UPDATE users SET role = 'ROLE_ADMIN' WHERE email = 'you@gmail.com';


After that, admins can promote or demote other admins from the Admin panel.

## Environment variables

| Name | Used by | Purpose |
|---|---|---|
| DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_PARAMS | API | Database connection (DB_PARAMS=?sslmode=require for Neon) |
| JWT_SECRET | API | Signs access tokens (min. 32 characters) |
| GOOGLE_CLIENT_ID | API | Verifies Google ID tokens |
| APP_BASE_URL | API | Public site URL |
| COOKIE_SECURE | API | 	rue in production (HTTPS) |
| API_URL | Web | Backend URL for the /api proxy |
| NEXT_PUBLIC_GOOGLE_CLIENT_ID | Web | Google client ID for the sign-in button |

## Security notes

- No passwords are stored. Sign-in is through Google only.
- Refresh tokens are hashed, rotated on every use, and revoked on logout, ban or admin change.
- Banned users and removed admins lose access within seconds.
- Secrets live in environment variables, not in the repository.

## Roadmap

- Real-time updates with WebSocket
- Profile pictures
- Account self-deletion
- Automated tests and CI

## Developer

**Tanvir Islam Tamim**
Department of ICT, Mawlana Bhashani Science and Technology University (MBSTU)
[Facebook](https://www.facebook.com/tanvirislam.tamim.37) · [LinkedIn](https://www.linkedin.com/in/tanvir-islam-tamim-18b963256/)

## License

© 2026 Blood Bangladesh. All Rights Reserved.