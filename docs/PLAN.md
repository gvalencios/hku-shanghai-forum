# Shanghai Forum - Implementation Plan

## Context

A teaching assistant at the University of Hong Kong needs a trip management website for ~100 students traveling to Shanghai. The app serves as a single-channel platform with two role-based views (Student / TA) covering: student profiles with Excel bulk import, trip checkpoint monitoring, an incident/report system with TA triage, and an information hub. The site must be clean, Apple-style, mobile-friendly, and hosted for free on Vercel with Firebase as the database.

## Tech Stack

- **Framework**: Next.js 15 App Router + TypeScript
- **Database**: Firebase Firestore
- **Auth**: Firebase Auth (magic link / email link sign-in) + `next-firebase-auth-edge` for middleware
- **Hosting**: Vercel (free tier)
- **Styling**: Tailwind CSS (Apple-style design tokens)
- **Excel parsing**: ExcelJS
- **Drag-and-drop**: @dnd-kit/core (for info block reordering)
- **Utilities**: clsx + tailwind-merge
- **Frontend Design**: Use `/frontend-design` skill for all UI components, pages, and visual design work

---

## Progress Tracking (Cross-Session Continuity)

Two files will be created in the project root for efficient continuity:

### `CLAUDE.md` (auto-read by Claude Code every session)
Contains:
- Project overview & tech stack summary
- Current phase being worked on (update after each phase)
- Key architecture decisions (Firestore schema, auth flow, role assignment)
- File structure overview
- Pointer to `docs/PROGRESS.md` for detailed task tracking
- Common commands (dev server, build, deploy)

### `docs/PROGRESS.md` (detailed task checklist)
Contains:
- All tasks organized by phase with checkboxes `[ ]` / `[x]`
- Each task maps to a specific file or feature
- Updated after completing each task
- Includes notes on blockers or decisions made during implementation

Both files are created during Phase 1 setup and updated at the end of every phase.

---

## Phase 1: Project Scaffolding + Authentication

**Goal**: Working login/logout flow with magic link auth and role-based route protection.

### Setup Steps
1. `npx create-next-app@latest shanghai-forum --typescript --tailwind --eslint --app --src-dir`
2. `cd shanghai-forum && npm install firebase next-firebase-auth-edge exceljs clsx tailwind-merge`
3. Initialize git repo, create `.env.local` and `.env.example`
4. Create `CLAUDE.md` and `docs/PROGRESS.md` with initial content
5. Create Firebase project in console, enable Firestore + Auth (Email Link)
6. Add `localhost` to Firebase authorized domains

### Files to Create

| File | Purpose |
|------|---------|
| `.env.local` / `.env.example` | Firebase keys, cookie secrets, app URL |
| `middleware.ts` | `authMiddleware` from next-firebase-auth-edge; public paths: `/login`, `/login/callback` |
| `src/lib/firebase/client.ts` | Firebase client SDK init (getApps guard) |
| `src/lib/firebase/admin.ts` | Firebase Admin SDK init with `server-only` |
| `src/lib/firebase/auth-config.ts` | Shared config for middleware + getTokens calls |
| `src/lib/utils/cn.ts` | clsx + tailwind-merge utility |
| `src/lib/types/user.ts` | UserDocument TypeScript interface |
| `src/components/auth/AuthProvider.tsx` | React context: `{ user, role, loading }` |
| `src/lib/hooks/use-auth.ts` | `useAuth()` hook |
| `src/app/layout.tsx` | Root layout with AuthProvider |
| `src/app/page.tsx` | Redirect to /dashboard or /login |
| `src/app/login/page.tsx` | Magic link login form (email domain validated) |
| `src/app/login/callback/page.tsx` | Complete sign-in, set cookie, assign role via custom claims |
| `src/app/api/admin/set-claims/route.ts` | Determine role from pre-approved TA list or email domain, set custom claims, link emailStudentMap data |
| `src/app/(authenticated)/layout.tsx` | Auth guard via getTokens, renders AppShell |
| `src/app/(authenticated)/dashboard/page.tsx` | Placeholder dashboard |
| `src/components/layout/AppShell.tsx` | Placeholder navigation shell |
| `src/components/layout/Header.tsx` | User name, role badge, logout |

### Role Assignment: Pre-Approved TA List
- Store a list of TA email addresses in Firestore collection `config/taEmails` (array field)
- OR hardcode in environment variable `TA_EMAILS` (comma-separated) for simplicity
- During sign-in, `/api/admin/set-claims` checks if email is in the TA list
- If match -> role: "ta", otherwise -> role: "student"
- Both `@hku.hk` and `@connect.hku.hk` emails are accepted for login
- Only emails in the pre-approved list get TA privileges

### Auth Flow
1. User enters school email on `/login` (validated: must end with `@hku.hk` or `@connect.hku.hk`)
2. `sendSignInLinkToEmail()` sends magic link, email saved to localStorage
3. User clicks link -> `/login/callback`
4. `isSignInWithEmailLink()` + `signInWithEmailLink()` completes auth
5. POST ID token to `/api/login` (middleware cookie endpoint)
6. `/api/admin/set-claims` checks pre-approved TA list -> assigns role accordingly, links emailStudentMap data
7. Redirect to `/dashboard`

### Verification
- [ ] Visit `/login` -> email form renders
- [ ] Send magic link -> email received
- [ ] Click link -> redirected to `/dashboard` with correct role
- [ ] Unauthenticated visit to `/dashboard` -> redirected to `/login`
- [ ] Logout -> cookie cleared, redirected to `/login`

---

## Phase 2: UI Design System + Navigation Shell

**Goal**: Reusable Apple-style component library and full responsive navigation.

**IMPORTANT**: Use the `/frontend-design` skill for all UI component creation and page design throughout this phase (and all subsequent phases with frontend work). This ensures high design quality, distinctive Apple-style aesthetics, and production-grade code.

### Design Brief for frontend-design skill
- **Style**: Apple-inspired, clean, minimalistic, lots of white space
- **Font**: SF Pro system font stack (-apple-system, BlinkMacSystemFont)
- **Colors**: Primary #007AFF, surfaces white/#F5F5F7/#E8E8ED, text #1D1D1F/#6E6E73/#86868B
- **Border radius**: 16px cards, 12px inputs, 20px modals
- **Shadows**: Subtle card shadows `0 1px 3px rgba(0,0,0,0.04)`, elevated `0 4px 14px rgba(0,0,0,0.08)`
- **Responsive**: Desktop-first with mobile breakpoint at 768px
- **Audience**: University students (20s) - friendly, modern, intuitive

### Design Tokens (tailwind.config.ts)
- Font: SF Pro system font stack
- Colors: primary #007AFF, surface white/#F5F5F7, text #1D1D1F/#6E6E73
- Border radius: 16px cards, 12px inputs
- Shadows: subtle card shadows, elevated modals

### UI Components to Build (via /frontend-design)
`src/components/ui/`: Button, Card, Input, Select, Textarea, Badge, Modal, Accordion, Tabs, DataTable, FileUpload, SearchBar, Spinner, Toast, EmptyState

### Navigation (via /frontend-design)
| Component | Purpose |
|-----------|---------|
| `Sidebar.tsx` | Desktop left sidebar with role-conditional nav items |
| `MobileNav.tsx` | Fixed bottom tab bar for mobile |
| `Header.tsx` | Page title, breadcrumbs (desktop), user dropdown |

### Route Structure
- Student nav: Dashboard, Profile, Checkpoints, Reports, Info
- TA nav: Dashboard, Students, Checkpoints, Reports, Info, Contacts
- `src/app/(authenticated)/ta/layout.tsx` - TA role guard

### Verification
- [ ] All UI components render correctly
- [ ] Desktop: sidebar + content layout
- [ ] Mobile (<768px): bottom tab bar, no sidebar
- [ ] TA-only nav items hidden from students
- [ ] `/ta/*` routes redirect students to `/dashboard`

---

## Phase 3: Student Profiles + Excel Bulk Upload

**Goal**: TAs upload Excel to populate student data. Students view/edit their own fields.
**Frontend**: Use `/frontend-design` for ProfileView, ProfileEditForm, ExcelUpload, StudentList, StudentDetail components.

### Firestore Collections

**`users`** (doc ID = Firebase Auth UID)
- TA-managed: familyNameEn, firstNameEn, fullChineseName, gender, faculty, email, studentId, passportCountry, hasChinaBankAccount, telephone, specialRequest
- Student-managed: flights (departure/arrival with date, time, flightNumber), visaStatus, visaNotes, emergencyContact (name, relationship, phone, email), dietaryRestrictions, medicalConditions
- System: role, authUid, createdAt, updatedAt

**`emailStudentMap`** (doc ID = email) - Bridges Excel upload (before sign-up) with first sign-in. Admin SDK only.

### Excel Upload Flow
1. TA uploads `.xlsx` on `/ta/students`
2. `ExcelJS` parses file, validates headers & rows
3. Preview table shown with validation errors
4. On confirm: API route creates `users` docs + `emailStudentMap` entries
5. When student signs in for first time, `set-claims` route links pre-populated data

### Key Files
| File | Purpose |
|------|---------|
| `src/lib/excel/parse-students.ts` | ExcelJS parser with header validation |
| `src/app/api/admin/upload-students/route.ts` | Multipart upload endpoint (Admin SDK) |
| `src/lib/firestore/users.ts` | CRUD: getUserById, updateUserProfile, bulkUpsertUsers, getAllStudents |
| `src/app/(authenticated)/profile/page.tsx` | Student profile page |
| `src/components/profile/ProfileView.tsx` | Read-only TA-managed fields |
| `src/components/profile/ProfileEditForm.tsx` | Editable student-managed fields |
| `src/app/(authenticated)/ta/students/page.tsx` | Student list + Excel upload |
| `src/components/students/ExcelUpload.tsx` | Upload + preview + confirm |
| `src/components/students/StudentList.tsx` | DataTable of all students |

### Verification
- [ ] TA uploads Excel with 5 students -> preview shows correctly -> confirms -> success
- [ ] Student signs in (email matches Excel) -> profile shows pre-populated TA data
- [ ] Student edits flight schedule, emergency contact -> saves -> persists
- [ ] Student cannot edit TA-managed fields
- [ ] Excel with invalid data shows row-level errors

---

## Phase 4: Checkpoint System

**Goal**: TAs define checkpoints. Students check in. TAs see a completion matrix.
**Frontend**: Use `/frontend-design` for CheckpointList, CheckpointCheckin, CheckpointMatrix, CheckpointForm components.

### Firestore Collections

**`checkpoints`** - name, description, expectedTime, order, category (pre_departure | day_of | arrival | during_trip | return), isRecurring, createdBy

**`checkins`** - checkpointId, userId, timestamp, note, recurringDate

### Default Checkpoints
1. Passport & visa confirmed
2. Flight ticket purchased
3. Travel insurance purchased
4. Boarded departure flight
5. Landed at Shanghai Pudong International Airport
6. Passed immigration/customs
7. Arrived at university/dorm
8. Checked into dorm room
9. Daily check-in (recurring)
10. Boarded return flight
11. Arrived back in Hong Kong

### Key Files
| File | Purpose |
|------|---------|
| `src/lib/firestore/checkpoints.ts` | CRUD for checkpoints |
| `src/lib/firestore/checkins.ts` | CRUD for checkins |
| `src/actions/checkpoints.ts` | Server actions: create, update, checkIn |
| `src/app/(authenticated)/checkpoints/page.tsx` | Student: categorized list with check-in buttons |
| `src/components/checkpoints/CheckpointList.tsx` | Grouped checkpoint list |
| `src/components/checkpoints/CheckpointCheckin.tsx` | Check-in button with confirmation |
| `src/app/(authenticated)/ta/checkpoints/page.tsx` | TA: manage + matrix view |
| `src/components/checkpoints/CheckpointMatrix.tsx` | Students x Checkpoints grid (green/gray cells) |
| `src/components/checkpoints/CheckpointForm.tsx` | Create/edit checkpoint form |

### Matrix View
- Rows = students (sorted by name), Columns = checkpoints (sorted by order)
- Green checkmark = checked in, Gray dash = not yet
- Sticky headers, summary row with completion counts
- Data volume: ~100 students x ~15 checkpoints = ~1500 checkins max (trivially fits in memory)

### Verification
- [ ] TA creates 11 checkpoints -> appear in order
- [ ] Student sees checkpoints grouped by category
- [ ] Student checks in -> green checkmark + timestamp
- [ ] Cannot double-check-in to non-recurring checkpoint
- [ ] TA matrix shows accurate completion status
- [ ] Matrix updates when student checks in

---

## Phase 5: Report System + Contact Persons

**Goal**: Students submit reports. TAs triage, reply, link contact persons.
**Frontend**: Use `/frontend-design` for ReportCard, ReportForm, ReportDetail, ReplyThread, ReportFilters, ContactPersonPicker, ContactList, ContactForm components.

### Firestore Collections

**`reports`** - title, description, studentId, studentName, status (open | in_progress | resolved | cancelled), importance (low | medium | high | urgent), contactPersonIds[], createdAt, updatedAt

**`reports/{id}/replies`** (subcollection) - authorId, authorName, authorRole, content, createdAt

**`contactPersons`** - name, role, phone, email, responsibilityArea, createdBy

### Report Lifecycle
- Student creates -> status: open, importance: low
- TA sets importance -> low/medium/high/urgent
- TA replies / marks in_progress -> status: in_progress
- TA resolves -> status: resolved
- Student cancels own report -> status: cancelled (soft delete, TA still sees with badge)

### Key Files
| File | Purpose |
|------|---------|
| `src/lib/firestore/reports.ts` | CRUD for reports + replies |
| `src/lib/firestore/contact-persons.ts` | CRUD for contact persons |
| `src/actions/reports.ts` | Server actions: create, cancel, reply, updateImportance, linkContact |
| `src/app/(authenticated)/reports/page.tsx` | Student: own reports list |
| `src/app/(authenticated)/reports/new/page.tsx` | Student: create report |
| `src/app/(authenticated)/reports/[reportId]/page.tsx` | Student: report detail + replies |
| `src/app/(authenticated)/ta/reports/page.tsx` | TA: all reports with filters |
| `src/app/(authenticated)/ta/reports/[reportId]/page.tsx` | TA: detail + importance + contact linking + reply |
| `src/app/(authenticated)/ta/contacts/page.tsx` | TA: manage contact persons |
| `src/components/reports/` | ReportCard, ReportForm, ReportDetail, ReplyThread, ReplyForm, ReportFilters, ContactPersonPicker |

### Verification
- [ ] Student creates report -> appears in list
- [ ] Student cancels report -> "cancelled" badge, still visible to TA
- [ ] TA sets importance to "urgent" -> badge updates
- [ ] TA replies -> appears in thread with "TA" badge
- [ ] TA links contact person to report -> shown in detail
- [ ] Filters by status/importance work

---

## Phase 6: Information Hub

**Goal**: TAs manage informational content blocks. Students browse and search.
**Frontend**: Use `/frontend-design` for InfoBrowser, InfoBlockCard, InfoBlockForm, InfoReorder components.

### Firestore Collection

**`infoBlocks`** - title, body (text/markdown), category, order, links[], isPublished, createdAt, updatedAt, createdBy

### Categories (fixed constant)
Schedule, Emergency Contacts, Accommodation, Transportation, Local Info, Rules & Guidelines

### Key Files
| File | Purpose |
|------|---------|
| `src/lib/firestore/info-blocks.ts` | CRUD + reorder |
| `src/actions/info-blocks.ts` | Server actions |
| `src/app/(authenticated)/info/page.tsx` | Student: browse + search |
| `src/components/info/InfoBrowser.tsx` | Category tabs + search + accordion cards |
| `src/components/info/InfoBlockCard.tsx` | Expandable card |
| `src/app/(authenticated)/ta/info/page.tsx` | TA: manage + reorder |
| `src/components/info/InfoBlockForm.tsx` | Create/edit modal |
| `src/components/info/InfoReorder.tsx` | Drag-and-drop reorder (@dnd-kit/core) |

### Verification
- [ ] TA creates info block -> appears in management view
- [ ] Draft (unpublished) block NOT visible to students
- [ ] Published block visible to students
- [ ] Student searches "airport" -> filters correctly
- [ ] TA reorders blocks -> new order persists
- [ ] TA edits block -> changes reflected for students

---

## Phase 7: Dashboards + Real-time + Polish

**Goal**: Role-specific dashboards, real-time listeners, loading/error states, final UX polish.
**Frontend**: Use `/frontend-design` for StudentDashboard, TADashboard, loading skeletons, and final visual polish pass.

### Student Dashboard
- Profile completion percentage
- Next unchecked checkpoint
- Open reports count + list
- Quick links to schedule/emergency info

### TA Dashboard
- Total students + profile completion stats
- Checkpoint progress bars
- Urgent reports count
- Recent activity feed

### Real-time Updates
- Switch critical lists to `onSnapshot` listeners: reports list, checkpoint matrix, student list
- Use `src/lib/hooks/use-firestore.ts` generic subscription hook

### Polish
- `loading.tsx` skeleton files for each route
- `error.tsx` error boundaries
- EmptyState components for empty lists
- Toast notifications on actions
- Smooth page transitions
- Final responsive audit on mobile

### Verification
- [ ] Student dashboard shows accurate data
- [ ] TA dashboard shows aggregate stats
- [ ] Checkpoint matrix updates in real-time when student checks in
- [ ] New reports appear in TA view without refresh
- [ ] Loading skeletons visible during data fetch
- [ ] All empty states render properly
- [ ] Mobile experience is smooth on actual device

---

## Phase 8: Deployment + Security + Final Testing

**Goal**: Production deployment, security rules, end-to-end testing.

### Firebase Console Setup
1. Enable Email/Password + Email Link sign-in
2. Add Vercel domain to authorized domains
3. Deploy Firestore security rules
4. Generate Admin SDK service account key

### Firestore Security Rules (Summary)
- `users`: students edit own student-managed fields only; TAs read/write all
- `checkpoints`: TAs write, all read
- `checkins`: students create own, all read
- `reports`: students create/cancel own, TAs update all; replies writable by all auth'd
- `contactPersons` / `infoBlocks`: TAs write, all read
- `emailStudentMap`: Admin SDK only (no client access)

### Vercel Deployment
1. Connect GitHub repo to Vercel
2. Set all env vars in Vercel project settings
3. Deploy
4. Add Vercel URL to Firebase authorized domains

### Security Audit
- [ ] Student cannot write TA-managed fields
- [ ] Student cannot access `/ta/*` routes
- [ ] Student cannot create checkin for another student
- [ ] Unauthenticated users cannot access any data
- [ ] API admin routes verify caller role

### E2E Testing
- [ ] Full student journey: sign in -> profile -> checkpoints -> reports -> info
- [ ] Full TA journey: sign in -> Excel upload -> checkpoints -> matrix -> reports -> info hub
- [ ] Edge cases: expired link, duplicate checkin, cancel resolved report

---

## Environment Variables

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_APP_URL=

FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
COOKIE_SECRET_CURRENT=
COOKIE_SECRET_PREVIOUS=
TA_EMAILS=ta1@hku.hk,ta2@connect.hku.hk,ta3@hku.hk
```

## Key Packages

```json
{
  "firebase": "latest",
  "firebase-admin": "latest",
  "next-firebase-auth-edge": "latest",
  "exceljs": "latest",
  "clsx": "latest",
  "tailwind-merge": "latest",
  "@dnd-kit/core": "latest",
  "@dnd-kit/sortable": "latest"
}
```
