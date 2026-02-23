# Shanghai Forum - Progress Tracker

## Phase 1: Project Scaffolding + Authentication
- [x] Create Next.js project with TypeScript, Tailwind, App Router
- [x] Install dependencies (firebase, next-firebase-auth-edge, exceljs, etc.)
- [x] Create `.env.local` and `.env.example`
- [x] Create `CLAUDE.md` and `docs/PROGRESS.md`
- [x] Firebase client SDK init (`src/lib/firebase/client.ts`)
- [x] Firebase Admin SDK init (`src/lib/firebase/admin.ts`)
- [x] Auth config (`src/lib/firebase/auth-config.ts`)
- [x] cn utility (`src/lib/utils/cn.ts`)
- [x] User types (`src/lib/types/user.ts`)
- [x] AuthProvider + useAuth hook
- [x] Middleware with route protection
- [x] Login page with email validation
- [x] Login callback page
- [x] Set-claims API route (role assignment + data linking)
- [x] Root layout with AuthProvider
- [x] Root page redirect
- [x] Authenticated layout with AppShell
- [x] Header component (user info, role badge, logout)
- [x] AppShell with sidebar + mobile nav
- [x] Dashboard placeholder page
- [x] TA layout guard
- [ ] **MANUAL**: Firebase project setup in console (user must create project, enable Auth Email Link, copy config to .env.local)
- [ ] **BLOCKED**: Verify full auth flow end-to-end (blocked by Firebase console setup above)

**Note**: All Phase 1 CODE is complete and builds successfully. The 2 remaining items require manual Firebase console setup by the user.

## Phase 2: UI Design System + Navigation Shell
- [x] Design tokens in globals.css (colors, fonts, radii, shadows)
- [x] Button component (primary/secondary/ghost/danger, sm/md/lg, loading)
- [x] Card component (Card, CardHeader, CardContent, CardFooter)
- [x] Input component (label, error, hint)
- [x] Select component (label, error, options)
- [x] Textarea component (label, error)
- [x] Badge component (default/primary/success/warning/danger/urgent)
- [x] Modal component (sizes, ESC close, backdrop click)
- [x] Accordion component (single/multi expand)
- [x] Tabs component (segmented control style, optional count)
- [x] DataTable component (generic)
- [x] FileUpload component (drag-and-drop, file browse)
- [x] SearchBar component (with clear button)
- [x] Spinner component (sm/md/lg)
- [x] Toast component (success/error/info with provider + hook)
- [x] EmptyState component (icon, title, description, action)
- [x] Barrel export (src/components/ui/index.ts)
- [x] ToastProvider added to root layout

## Phase 3: Student Profiles + Excel Bulk Upload
- [x] ExcelJS parser with header validation (`src/lib/excel/parse-students.ts`)
- [x] Upload students API route (`src/app/api/admin/upload-students/route.ts`)
- [x] Firestore users CRUD functions (`src/lib/firestore/users.ts`)
- [x] Student profile page (`src/app/(authenticated)/profile/page.tsx`)
- [x] ProfileView component (read-only TA fields)
- [x] ProfileEditForm component (student fields: flights, visa, emergency, health)
- [x] TA students list page (`src/app/(authenticated)/ta/students/page.tsx`)
- [x] ExcelUpload component (upload, preview, confirm)
- [x] StudentList component (DataTable with search)

## Phase 4: Checkpoint System
- [x] Checkpoint + Checkin types with default checkpoints (`src/lib/types/checkpoint.ts`)
- [x] Firestore checkpoints CRUD (`src/lib/firestore/checkpoints.ts`)
- [x] Firestore checkins CRUD (`src/lib/firestore/checkins.ts`)
- [x] Student checkpoints page (categorized list with check-in buttons)
- [x] CheckpointList component (grouped by category, check-in flow)
- [x] TA checkpoints page (manage + matrix view, seed defaults)
- [x] CheckpointMatrix component (students x checkpoints grid, green/gray)
- [x] CheckpointForm component (create/edit modal)

## Phase 5: Report System + Contact Persons
- [x] Report + Reply + ContactPerson types (`src/lib/types/report.ts`)
- [x] Firestore reports CRUD + replies subcollection (`src/lib/firestore/reports.ts`)
- [x] Firestore contact persons CRUD (`src/lib/firestore/contact-persons.ts`)
- [x] Student reports list page
- [x] Student create report page
- [x] Student report detail page (with cancel + reply)
- [x] TA reports page (all reports with status/importance filters)
- [x] TA report detail page (triage: status, importance, contact linking, reply)
- [x] TA contacts page (CRUD management)
- [x] ReportCard component
- [x] ReplyThread component (with reply form)
- [x] ReportFilters component (tabs + importance select)

## Phase 6: Information Hub
- [x] InfoBlock + InfoCategory types (`src/lib/types/info.ts`)
- [x] Firestore info blocks CRUD + reorder (`src/lib/firestore/info-blocks.ts`)
- [x] Student info browser page (category tabs + search + accordion)
- [x] TA info management page (CRUD + up/down reorder + publish/draft)

## Phase 7: Dashboards + Real-time + Polish
- [x] Student dashboard with real data (profile %, checkpoints, reports, next checkpoint)
- [x] TA dashboard with aggregate stats (students, progress %, reports, urgent alerts)
- [x] Real-time Firestore listeners hook (`src/lib/hooks/use-firestore.ts`)
- [x] Loading skeletons (dashboard, profile, checkpoints, reports)
- [x] Error boundary for authenticated routes
- [x] EmptyState components used throughout
- [x] Toast notifications on all actions

## Phase 8: Deployment + Security
- [x] Firestore security rules (`firestore.rules`)
- [ ] **MANUAL**: Vercel deployment (connect GitHub, set env vars)
- [ ] **MANUAL**: Add Vercel domain to Firebase authorized domains
- [ ] **MANUAL**: Deploy Firestore security rules via Firebase CLI
- [ ] **MANUAL**: E2E testing (requires live Firebase project)

**Note**: All code is complete and builds successfully (19 routes). Remaining items are manual deployment/configuration steps.
