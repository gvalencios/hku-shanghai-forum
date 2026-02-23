# Shanghai Forum - HKU Trip Management

## Overview
Trip management website for ~100 HKU students traveling to Shanghai. Two role-based views (Student / TA) covering: student profiles with Excel bulk import, trip checkpoint monitoring, incident/report system with TA triage, and an information hub.

## Tech Stack
- **Framework**: Next.js 16 App Router + TypeScript
- **Database**: Firebase Firestore
- **Auth**: Firebase Auth (magic link / email link) + `next-firebase-auth-edge` for middleware
- **Hosting**: Vercel (free tier)
- **Styling**: Tailwind CSS v4 (Apple-style design tokens)
- **Excel**: ExcelJS
- **Drag-and-drop**: @dnd-kit/core + @dnd-kit/sortable
- **Utilities**: clsx + tailwind-merge

## Current Status
**ALL PHASES COMPLETE** - All code is built and compiles (19 routes).

Remaining manual steps:
1. Firebase console: Create project, enable Firestore + Auth (Email Link provider)
2. Copy Firebase config values into `.env.local`
3. Deploy Firestore security rules (`firestore.rules`)
4. Vercel: Connect GitHub repo, set env vars, deploy
5. Add Vercel domain to Firebase authorized domains

## Architecture
- **Auth flow**: Magic link email -> `/login/callback` -> set claims -> redirect to `/dashboard`
- **Role assignment**: TA emails defined in `TA_EMAILS` env var; all others are students
- **Email domains**: Only `@hku.hk` and `@connect.hku.hk` accepted
- **Route protection**: Middleware via `next-firebase-auth-edge`; `/ta/*` routes restricted to TA role
- **Firestore collections**: `users`, `emailStudentMap`, `checkpoints`, `checkins`, `reports`, `reports/{id}/replies`, `contactPersons`, `infoBlocks`

## Routes (19 total)
```
/                           - Redirect to /dashboard or /login
/login                      - Magic link email form
/login/callback             - Complete sign-in flow
/api/admin/set-claims       - Role assignment + data linking
/api/admin/upload-students  - Excel upload endpoint
/dashboard                  - Role-based dashboard (student/TA)
/profile                    - Student profile (view TA fields + edit own)
/checkpoints                - Student checkpoint list with check-in
/reports                    - Student reports list
/reports/new                - Create new report
/reports/[reportId]         - Report detail + replies
/info                       - Student info browser
/ta/students                - Student management + Excel upload
/ta/checkpoints             - Checkpoint management + matrix view
/ta/reports                 - All reports with filters + triage
/ta/reports/[reportId]      - Report triage (status, importance, contacts)
/ta/contacts                - Contact persons management
/ta/info                    - Info blocks management
```

## File Structure
```
src/
├── app/
│   ├── layout.tsx, page.tsx, globals.css
│   ├── login/ (page, callback)
│   ├── api/admin/ (set-claims, upload-students)
│   └── (authenticated)/
│       ├── layout.tsx, error.tsx
│       ├── dashboard/ (page, loading)
│       ├── profile/ (page, loading)
│       ├── checkpoints/ (page, loading)
│       ├── reports/ (page, loading, new, [reportId])
│       ├── info/ (page)
│       └── ta/ (layout, students, checkpoints, reports, contacts, info)
├── components/
│   ├── auth/AuthProvider.tsx
│   ├── layout/ (AppShell, Header)
│   ├── ui/ (15 components + barrel export)
│   ├── profile/ (ProfileView, ProfileEditForm)
│   ├── students/ (ExcelUpload, StudentList)
│   ├── checkpoints/ (CheckpointList, CheckpointMatrix, CheckpointForm)
│   └── reports/ (ReportCard, ReplyThread, ReportFilters)
└── lib/
    ├── firebase/ (client, admin, auth-config)
    ├── hooks/ (use-auth, use-firestore)
    ├── types/ (user, checkpoint, report, info)
    ├── utils/ (cn)
    ├── firestore/ (users, checkpoints, checkins, reports, contact-persons, info-blocks)
    └── excel/ (parse-students)
```

## Common Commands
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
```

## Detailed Progress
See `docs/PROGRESS.md` for task-level tracking.
See `docs/PLAN.md` for the original implementation plan.
