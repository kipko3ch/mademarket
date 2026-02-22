# MaDe Market — Password & Authentication Guide

## Authentication Overview

MaDe Market uses **NextAuth.js v5** with JWT strategy. Two authentication providers are supported:

1. **Credentials** — Email + password (bcrypt hashed)
2. **Google OAuth** — Social login (no password stored)

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | NextAuth configuration, providers, JWT/session callbacks |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth API handler |
| `src/app/api/auth/register/route.ts` | User registration endpoint |
| `src/app/api/account/security/route.ts` | Password change endpoint |
| `src/middleware.ts` | Route protection & role-based access |
| `scripts/seed-admin.ts` | CLI script to seed admin account |

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_SECRET` | JWT signing secret (required) |
| `NEXTAUTH_URL` | Base URL for NextAuth callbacks |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `DATABASE_URL` | Neon PostgreSQL connection string |

All environment variables are stored in `.env.local` (not committed to git).

---

## How Passwords Work

### Password Hashing
- Library: `bcryptjs`
- Hash rounds: **12**
- Passwords are hashed before storage: `bcrypt.hash(password, 12)`
- Passwords are verified on login: `bcrypt.compare(input, stored)`

### Registration Flow
1. User submits name, email, password, role (user/vendor)
2. `POST /api/auth/register` validates input with Zod
3. Password is hashed with bcrypt (12 rounds)
4. User record created in `users` table
5. Auto-login via NextAuth credentials provider

### Login Flow
1. User submits email + password
2. NextAuth credentials provider calls `authorize()`
3. User looked up by email in database
4. `bcrypt.compare()` validates password
5. JWT token issued with user id, role, name, email
6. Role-based redirect: admin → `/admin`, vendor → `/dashboard`, user → `/`

### Google OAuth Flow
1. User clicks "Continue with Google"
2. Redirected to Google consent screen
3. On callback, NextAuth `signIn` callback fires
4. If user exists (by email), signs them in
5. If new user, creates account with role "user" (no password set)
6. Redirected to `/auth/redirect` for role-based routing

---

## Changing Passwords

### For Users/Vendors (via UI)
1. Go to **Account → Security** (`/account/security`)
2. Enter current password
3. Enter new password (min 6 characters)
4. Confirm new password
5. Click "Update Password"

The API (`PATCH /api/account/security`) will:
- Verify the session is authenticated
- Look up the user in the database
- Verify current password with `bcrypt.compare()`
- Reject if the account uses Google OAuth (no password)
- Hash new password with `bcrypt.hash(newPassword, 12)`
- Update the `password` field in the `users` table

### For Admin (via CLI/Database)

#### Option 1: Using the seed script
```bash
npx tsx scripts/seed-admin.ts
```
This creates/resets the admin account with the password defined in the script.

#### Option 2: Manual database reset
```sql
-- Generate a bcrypt hash for the new password first
-- Use an online bcrypt generator or Node.js:
-- node -e "require('bcryptjs').hash('NewPassword123', 12).then(console.log)"

UPDATE users
SET password = '$2a$12$YOUR_BCRYPT_HASH_HERE'
WHERE email = 'admin@mademarket.com';
```

#### Option 3: Using Node.js directly
```bash
node -e "
const bcrypt = require('bcryptjs');
bcrypt.hash('YourNewPassword', 12).then(hash => {
  console.log('Hashed password:', hash);
  console.log('Run this SQL:');
  console.log(\`UPDATE users SET password = '\${hash}' WHERE email = 'admin@mademarket.com';\`);
});
"
```

#### Option 4: Via Neon Console
1. Go to your Neon project dashboard
2. Open the SQL Editor
3. Run the UPDATE query from Option 2

---

## Role System

| Role | Access |
|------|--------|
| `admin` | Full platform control, `/admin/*` routes |
| `vendor` | Store management, `/dashboard/*` routes |
| `user` | Shopping, price comparison, `/account/*` routes |

Roles are stored in the `users.role` column (text enum).

### Vendor Approval
- New vendors register with role "vendor"
- Their store starts as `approved: false`
- Admin must approve via `/admin/stores` (toggle approved)
- Unapproved vendors can prepare listings but products aren't publicly visible

### Changing Roles
- Admin can change any user's role via `/admin/users`
- API: `PATCH /api/admin/users` with `{ userId, role }`
- Admin cannot demote themselves

---

## Security Notes

1. **JWT tokens** expire based on NextAuth defaults (30 days)
2. **bcrypt** with 12 rounds provides strong password hashing
3. **Middleware** protects routes server-side (not just client-side)
4. **Admin routes** require `role === "admin"` in both middleware and API
5. **CSRF protection** is handled by NextAuth automatically
6. **Google OAuth** accounts have `password: null` — cannot use credential login
7. **Rate limiting** is not currently implemented — consider adding for production
