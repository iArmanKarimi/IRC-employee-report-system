# IRC Staff System – Server Quick Guide

**Version 2.0 · Updated Nov 2025**

---

## 1. Purpose & Stack

- Handles employee CRUD with role-aware access (`globalAdmin`, `provinceAdmin`).
- Built with Node.js, Express 5 (TypeScript), MongoDB via Mongoose, session auth using `express-session` + `connect-mongo`.
- Entry files: `src/app.ts` (Express + sessions + routes) and `src/index.ts` (bootstraps DB + server).

---

## 2. Authentication & Roles

- Login (`POST /auth/login`) stores `{ userId, role, provinceId? }` in the session.
- Cookies: HttpOnly, 24 h lifetime, `secure` flag in production. Client must send `credentials: "include"`.
- Middleware helpers (`src/middleware/auth.ts`):
  - `auth(requiredRole)` – enforce an exact role on a route.
  - `requireAnyRole` – ensure the user is logged in (shared routes).
  - `canAccessProvince(user, targetProvinceId)` – gate province admins while letting global admins through.
- Role constants live in `src/types/roles.ts` and should be imported instead of hard-coding strings:

```startLine:endLine:server/src/types/roles.ts
export const USER_ROLE = {
	GLOBAL_ADMIN: "globalAdmin",
	PROVINCE_ADMIN: "provinceAdmin"
} as const;
```

- `Express.Request` is augmented in `src/types/express.d.ts` so route handlers can safely access `req.user`. If `req.user` is undefined, throw or return early – see `ensureUser()` inside `routes/employees.ts`.

---

## 3. Data Model Highlights

- `User`: `username`, `passwordHash`, `role`, optional `provinceAdmin` reference.
- `Province`: `name`, `admin`, `employees[]`.
- `Employee`: `provinceId`, nested `basicInfo`, `workPlace`, `additionalSpecifications`, `performances[]`.
  - Sub-schemas kept under `models/employee-sub-schemas/` for validation reuse.

---

## 4. Key Routes

| Path                     | Method     | Guard                                  | Description                            |
| ------------------------ | ---------- | -------------------------------------- | -------------------------------------- |
| `/health`                | GET        | public                                 | `{ ok: true }` heartbeat.              |
| `/auth/login`            | POST       | public                                 | Validates credentials, seeds session.  |
| `/auth/logout`           | POST       | logged-in                              | Destroys session + cookie.             |
| `/employees/`            | GET        | `auth(globalAdmin)`                    | All employees, populated provinces.    |
| `/employees/my-province` | GET        | `auth(provinceAdmin)`                  | Province admin’s roster.               |
| `/employees/:id`         | GET        | `requireAnyRole` + `canAccessProvince` | View a single employee.                |
| `/employees/`            | POST       | same as above                          | Create employee (province guard).      |
| `/employees/:id`         | PUT/DELETE | same as above                          | Update/delete within allowed province. |

---

## 5. Configuration Cheat Sheet

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ircdb
SESSION_SECRET=change-me
CORS_ORIGIN=http://localhost:5173
```

- Defaults kick in if omitted.
- `app.ts` already wires CORS with `credentials: true`.

---

## 6. Run & Test

```bash
cd server
npm install
npm run dev        # ts-node/nodemon

npm run build && npm start   # production-style
```

Expect logs: “MongoDB connected” then “Server running on port …”.

Health check:

```bash
curl http://localhost:3000/health
```

Sessioned requests (example):

```bash
# login
curl -X POST http://localhost:3000/auth/login \
	-H "Content-Type: application/json" \
	-c cookies.txt \
	-d '{"username":"admin","password":"secret"}'

# reuse cookie
curl http://localhost:3000/employees/ -b cookies.txt
```

---

## 7. Admin Seeding Workflow

- Use `admins.example.json` as a template for `server/admins.json`; define one `globalAdmin` and any number of `provinceAdmins` (each may include `provinceName` to auto-link).
- Run `npm run seed:admins` (after `npm install`) to invoke `src/scripts/seed-admins.ts`. The script connects to Mongo, validates credentials, hashes passwords, and links province admins to existing `Province` documents.
- Re-running the script is idempotent for usernames (existing users are skipped) but will re-link provinces if you provide a different admin.
- Expect console output per admin plus a final ✅/❌ summary; failures exit with code `1`.

## 8. Gotchas

- Always send requests with cookies (`credentials: "include"` or `curl -b/-c`) or you’ll get `401 Not authenticated`.
- Province admins can only operate on their `provinceId`; failed guard returns `403`.
- Mongo errors typically mean `MONGODB_URI` is wrong or the service is down.
- Keep `SESSION_SECRET` and Mongo credentials out of git; rotate secrets if compromised.

---

Need deeper details? Consult the matching files inside `server/src/`—this guide only surfaces the essentials.\*\*\*
