# HKU Shanghai Forum - Trip Management

## Overview
Trip management website for ~100 HKU students travelling to Shanghai (AILT1001-2S, March 2026). Two role-based views (Student / TA) covering: student profiles with Excel bulk import, trip checkpoint monitoring, incident/report system with TA triage, and an information hub.

## Quick Start
```bash
# 1. Clone and install
git clone <repo-url>
cd shanghai-forum
npm install

# 2. Set up environment variables
cp .env.example .env.local  # (or create manually with values below)

# 3. Start development server
npm run dev

# App will be available at http://localhost:3000
# Log in with HKU email (@hku.hk or @connect.hku.hk) + Student/Staff ID
```

**For local Firebase setup:** You'll need the Firebase Admin SDK credentials. Download from Firebase Console → Project Settings → Service Accounts → Node.js. Set `FIREBASE_ADMIN_CLIENT_EMAIL` and `FIREBASE_ADMIN_PRIVATE_KEY` in `.env.local`.

## Tech Stack
- **Framework**: Next.js 16 App Router + TypeScript
- **Database**: Firebase Firestore
- **Auth**: Custom JWT (HKU email + Student/Staff ID → `/api/login` → JWT cookie)
- **Hosting**: Vercel (free tier) — deployed
- **Styling**: Tailwind CSS v4 (Apple-style design tokens)
- **Excel**: ExcelJS
- **Drag-and-drop**: @dnd-kit/core + @dnd-kit/sortable
- **Utilities**: clsx + tailwind-merge

## Current Status
**DEPLOYED** — Core routes (19 total) built and live on Vercel. Firebase project: `hku-shanghai-portal`.

**Feature Status:**
- ✅ Checkpoint matrix with Excel export + header tooltips
- ✅ Accommodation section on student profiles (read-only for students, editable by TA)
- ✅ Bulk accommodation import via `/api/admin/upload-accommodation`
- ✅ Add/Remove individual students via modals on TA students page
- ✅ Student full name + profile link on TA report pages
- ✅ TA student enhancements (Excel bulk import, student editing, list improvements)

Completed manual steps:
1. ✅ Firebase project created, Firestore enabled (no Firebase Auth used — custom JWT only)
2. ✅ `.env.local` configured with all keys
3. ✅ Firestore security rules deployed (`firebase deploy --only firestore:rules`)
4. ✅ Vercel deployment connected to GitHub, env vars set
5. ✅ Vercel domain added to Firebase authorized domains

## Architecture
- **Auth flow**: HKU email + Student/Staff ID → POST `/api/login` → JWT cookie → redirect to `/dashboard`
- **Cookie config**: `sameSite: "none"`, `secure: true` — required for cross-site iframe embedding (e.g. ED platform)
- **Role assignment**: TA emails defined in `TA_EMAILS` env var; all others are students
- **Email domains**: Only `@hku.hk` and `@connect.hku.hk` accepted
- **Route protection**: Middleware (`middleware.ts`) checks JWT; `/ta/*` routes restricted to TA role
- **Firestore collections**: `users`, `emailStudentMap`, `checkpoints`, `checkins`, `reports`, `reports/{id}/replies`, `contactPersons`, `infoBlocks`, `settings/infoCategories`

## Student-Facing Features

### Login
- Enter HKU email (@hku.hk or @connect.hku.hk) + Student/Staff ID
- Click Sign in → server validates credentials → JWT cookie set → redirected to `/dashboard`
- No email sent, no magic link, no callback page

### Dashboard (`/dashboard`)
- **3 stat cards**: Profile % complete, Checkpoints (X/Y), Open Reports count
- **Action Required banner** (red): shown when `flightTicketStatus`, any departure/return flight field, or `visaStatus` is missing → links to `/profile`
- **Next Checkpoint card**: shows next unchecked checkpoint with "Go to Checkpoints" button

### Profile (`/profile`)
**Sections (in order):**
1. **Accommodation** (read-only, managed by TA) — check-in/out dates, room type (Single/Double), room info, booking confirmation number
2. **Flight Information** (editable, required) — ticket status, departure/return flight details
3. **Visa Information** (editable, required) — status + notes
4. **Emergency Contact** (editable, optional)
5. **Health & Dietary** (editable, optional)

**TA-managed fields** (read-only in University Info card): familyNameEn, firstNameEn, fullChineseName, gender, faculty, studentId, passportCountry, hasChinaBankAccount, telephone, specialRequest

**8 required fields for profile %**: flightTicketStatus, departureFlight (date/time/flightNumber), arrivalFlight (date/time/flightNumber), visaStatus

### Checkpoints (`/checkpoints`)
- Grouped by 5 categories: Pre-Departure, Day of Travel, Arrival, During Trip, Return
- Each card: order number, category tag (coloured pill), name, description
- **Check in** button → creates checkin record in Firestore
- **Undo** button → deletes checkin record
- Recurring checkpoints (Daily check-in) use `recurringDate` field (YYYY-MM-DD)

**9 active checkpoints** across 5 categories: Pre-Departure, Day of Travel, Arrival, During Trip, Return. Includes a recurring "Daily check-in" checkpoint.

### Reports (`/reports`)
- List of own reports with status badges
- New report: Title + Description fields → status auto-set to "open"
- Report detail: view description, status, TA replies
- Cancel report: only if status === "open" and own report

### Info Hub (`/info`)
- Title: "Trip Information"
- Tab-filtered by category (dynamic, stored in `settings/infoCategories` Firestore doc)
- Active categories: Overview, Schedule, Assessment, Contacts, Rules
- Only published blocks shown; links auto-prefixed with `https://` if no protocol

## TA-Facing Features

### Students (`/ta/students`)
- Full student table with search, click row → student detail page (`/ta/students/[studentId]`)
- **Action buttons** (above table): Add Student, Remove Student, Import Excel, Export Excel
  - **Add Student**: modal form for TA-managed fields → creates user + emailStudentMap docs
  - **Remove Student**: modal with search → select student → confirm deletion
  - **Import Excel**: modal with drag-and-drop upload, preview (added/deleted diff) → confirm → batch upsert/delete
  - **Export Excel**: downloads all student data as .xlsx
- Student detail page includes editable accommodation card and university info

### Checkpoints (`/ta/checkpoints`)
- **Matrix View**: student × checkpoint grid showing check-in status
- **Manage tab**: list with coloured category pills, edit/delete, up/down reorder (per-category)
- Add/edit checkpoint form: name, description, category, order, recurring toggle
- Auto-renumbers on create (shifts conflicting orders) and delete

### Reports (`/ta/reports`)
- All student reports with filters (status, importance)
- Student name displayed with link to their profile
- Triage: set status (open/in_progress/resolved/cancelled), importance (low/medium/high/urgent), assign contact persons
- Reply thread on each report

### Contacts (`/ta/contacts`)
- Manage contact person cards (name, role, phone, email, notes)

### Info Hub (`/ta/info`)
- Manage Sections: add/remove dynamic categories (stored in Firestore)
- Per-block: title, body, category, published toggle, links (label + URL pairs), reorder up/down
- Preview mode filtered by tab; arrows hidden on "All" tab

## Routes (20 total)
```
/                                - Redirect to /dashboard or /login
/login                           - HKU email + Student/Staff ID login form
/api/login                       - Validate credentials, set JWT cookie
/api/admin/upload-students       - Excel upload (preview + confirm modes)
/api/admin/upload-accommodation  - Accommodation Excel upload
/api/admin/seed-info             - Seed info blocks (?force=true to re-seed)
/dashboard                       - Role-based dashboard (student/TA)
/profile                         - Student profile (TA fields read-only + edit own)
/checkpoints                     - Student checkpoint list with check-in/undo
/reports                         - Student reports list
/reports/new                     - Create new report
/reports/[reportId]              - Report detail + replies + cancel
/info                            - Student info hub (tab-filtered)
/ta/students                     - Student management (add/remove/import/export)
/ta/students/[studentId]         - Student detail (all fields + accommodation)
/ta/checkpoints                  - Checkpoint management + matrix view
/ta/reports                      - All reports with filters + triage
/ta/reports/[reportId]           - Report triage (status, importance, contacts)
/ta/contacts                     - Contact persons management
/ta/info                         - Info blocks management + section management
```

## File Structure
```
src/
├── app/
│   ├── layout.tsx, page.tsx, globals.css
│   ├── login/ (page)
│   ├── api/ (login, admin/upload-students, admin/upload-accommodation, admin/seed-info)
│   └── (authenticated)/
│       ├── layout.tsx, error.tsx
│       ├── dashboard/ (page, loading)
│       ├── profile/ (page, loading)
│       ├── checkpoints/ (page, loading)
│       ├── reports/ (page, loading, new, [reportId])
│       ├── info/ (page)
│       └── ta/ (layout, students/page, students/[studentId], checkpoints, reports, reports/[reportId], contacts, info)
├── components/
│   ├── auth/AuthProvider.tsx
│   ├── layout/ (AppShell, Header)
│   ├── ui/ (Badge, Button, Card, DataTable, EmptyState, FileUpload, Input, Modal, Select, Spinner, Tabs, Textarea, Toast — barrel export)
│   ├── profile/ (ProfileView, ProfileEditForm)
│   ├── students/ (ExcelUpload, StudentList)
│   ├── checkpoints/ (CheckpointList, CheckpointMatrix, CheckpointForm)
│   └── reports/ (ReportCard, ReplyThread, ReportFilters)
└── lib/
    ├── firebase/ (client, admin)
    ├── hooks/ (use-auth, use-firestore)
    ├── types/ (user, checkpoint, report, info)
    ├── utils/ (cn)
    └── firestore/ (users, checkpoints, checkins, reports, contact-persons, info-blocks, info-categories)
```

## Environment Variables
Required in `.env.local` and Vercel:

**Authentication & Security:**
- `JWT_SECRET` — secret for signing session JWTs (generate: `openssl rand -hex 32`)
- `TA_EMAILS` — comma-separated list of TA email addresses (e.g., `ta1@hku.hk,ta2@hku.hk`)
- `TA_PASSCODE` — shared passcode for TA login (if used; currently not enforced in login flow)

**Firebase Client (public, from Firebase Console → Project Settings):**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Firebase Admin (private, from Firebase Console → Service Accounts → Node.js):**
- `FIREBASE_ADMIN_CLIENT_EMAIL` — service account email (used for admin operations in `/api/*` routes)
- `FIREBASE_ADMIN_PRIVATE_KEY` — service account private key (use `\n` for newlines, wrap in quotes)

## Known Gotchas
- **Webpack cache warning**: `.next/cache/webpack/server-development/0.pack.gz` ENOENT on dev startup — non-fatal, safe to ignore
- **Excel upload deletes**: Uploading a new Excel file deletes ALL students not present in it (from both `users` and `emailStudentMap`). Preview mode shows diff before confirm.
- **Cross-site cookies**: `sameSite: "none"` requires `secure: true` always (even in dev). Browsers reject SameSite=None without Secure.

## Common Commands
```bash
npm run dev                              # Start dev server (localhost:3000)
npm run build                            # Production build
npm run lint                             # ESLint
firebase deploy --only firestore:rules   # Deploy Firestore security rules
git add . && git commit -m "..." && git push  # Deploy to Vercel (auto on push)
```
