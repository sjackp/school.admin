## School Administration Dashboard – Umm Al‑Mu'mineen Private School

This repository contains a Dockerized React + Node.js admin dashboard for **مدرسة أم المؤمنين الخاصة** in Cairo.  
It connects directly to your existing Supabase PostgreSQL instance running on a Proxmox VM.

### Stack

- **Frontend**: Vite + React + TypeScript, Tailwind (RTL), React Router, Zustand, React Hook Form + Zod, TanStack Table, Recharts, i18next (Arabic/English)
- **Backend**: Node.js (Express), TypeScript, `pg` + pooling, JWT auth, bcrypt, Zod validation, express-rate-limit, pino logging
- **Reverse Proxy**: Nginx
- **Database**: Supabase PostgreSQL (hosted separately on the VM)

---

## 1. Project Structure

- `frontend/` – Vite React dashboard (login, dashboard, students list, basic pages)
- `backend/` – Express API (auth, students, enrollments, submissions, reports, admin users)
- `nginx/` – Reverse proxy that routes `/` → frontend, `/api/*` → backend
- `backend/sql/` – SQL migrations (admin users + audit log, seed initial admin)
- `docker-compose.yml` – Orchestration for nginx + frontend + backend

---

## 2. Environment Configuration

Create a `.env` file in the project root with:

```bash
DATABASE_URL=postgres://postgres.your-tenant-id:your-super-secret-and-long-postgres-password@host.docker.internal:6543/postgres

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PUBLIC_API_KEY=your-public-api-key-for-vercel-site

# If the API will be called directly from your Vercel site (bypassing nginx)
CORS_ORIGIN=https://your-vercel-site.vercel.app

NODE_ENV=production

# Frontend build-time API base (nginx proxies /api to backend)
VITE_API_URL=/api

# Cloudflare Tunnel token (used by cloudflared service in docker-compose)
CLOUDFLARE_TUNNEL_TOKEN=your-cloudflare-tunnel-token
```

> **Note**: `host.docker.internal` lets the backend container talk to the Supabase PostgreSQL server running on the VM host at port `6543`.

---

## 3. Database Migrations & Seeding

Run these against your Supabase PostgreSQL database (from the VM, replace `$DATABASE_URL` as needed):

```bash
psql "$DATABASE_URL" -f backend/sql/001_create_admin_users_audit_log.sql
psql "$DATABASE_URL" -f backend/sql/002_seed_initial_admin.sql
```

This will:

- Create `public.admin_users` and `public.audit_log` tables (if they don’t already exist)
- Seed an initial admin user:
  - **username**: `admin`
  - **password**: `admin123` (you must change this on first login)

---

## 4. Running Locally with Docker Compose

From the project root:

```bash
docker-compose build
docker-compose up -d
```

Services:

- `nginx` – Listens on port **80**, exposed to Cloudflare Tunnel
- `frontend` – Static React build served via nginx inside the container
- `backend` – Node.js API on port **3000** (proxied as `/api/*` by nginx)

Health check:

- API: `http://localhost/health`
- App: `http://localhost/`

Login with the seeded admin credentials and change the password immediately.

---

## 5. Cloudflare Tunnel Configuration

On the Proxmox VM, configure Cloudflare Tunnel to point to the nginx service:

```yaml
ingress:
  - hostname: admin.your-school-domain.com
    service: http://localhost:80
  - service: http_status:404
```

Cloudflare will terminate HTTPS and forward traffic to port 80 on the VM, which is the nginx reverse proxy in this stack.

---

## 6. Public Enrollment Endpoint (for Vercel Site)

- URL (through Cloudflare Tunnel + nginx): `https://admin.your-school-domain.com/api/public/enroll`
- Method: `POST`
- Auth: `x-api-key: ${PUBLIC_API_KEY}`
- Rate limit: **5 requests / IP / hour**
- CORS: Controlled by `CORS_ORIGIN` if called directly from the Vercel frontend to the backend service

Payload fields (core ones):

- `student_name_ar`, `birth_date`, `gender`, `national_id`
- `parent_name`, `parent_phone`, `parent_email`, `parent_relation`
- `desired_stage`, `desired_grade`, `preferred_language`
- Plus optional `previous_school`, `special_needs`, `medical_conditions`, `notes`

All submissions are stored in `public.enrollment_submissions` with `status = 'pending'`.

---

## 7. Admin Dashboard Overview

- **Authentication**
  - `/api/auth/login` – username + password → JWT (7-day expiry)
  - `/api/auth/me` – current user info
  - Roles: `admin`, `editor`, `viewer`

- **Key Protected Endpoints**
  - `/api/students` – list, create, view, update, delete
  - `/api/enrollments` – list, create
  - `/api/submissions` – list & update enrollment submissions
  - `/api/reports/overview` – simple stats for dashboard widgets
  - `/api/users` – admin user list & create (admin only)
  - `/api/audit-log` – (can be added to expose audit log in UI)

- **Audit Logging**
  - All changes to students, enrollments, submissions, and admin users are logged to `audit_log`.

---

## 8. Development Notes

- **Backend dev**:

  ```bash
  cd backend
  npm install
  npm run dev
  ```

- **Frontend dev**:

  ```bash
  cd frontend
  npm install
  npm run dev
  ```

  Set a `.env.local` in `frontend/` if needed:

  ```bash
  VITE_API_URL=http://localhost:3000/api
  ```

---

## 9. Next Steps / Extensions

- Add full CRUD UI for:
  - Enrollment submissions review/approval/rejection
  - Enrollment records per academic year
  - Admin user management & password change
- Add printable reports (class lists, age distribution, etc.)
- Harden security (more detailed rate limiting, audit-log viewer, stricter input validation rules)


