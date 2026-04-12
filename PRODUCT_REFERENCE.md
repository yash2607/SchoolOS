# SchoolOS — Product Reference Document
> Single App + Web Admin + Backend | Living Reference for Feature-by-Feature Build

**Version:** 2.1 (Current State + Future Roadmap)  
**Last Updated:** 2026-04-12  
**Markets:** India, Southeast Asia, Middle East  
**Goal:** Cloud-native, multi-tenant SaaS School ERP — one mobile app (role-aware) + web admin portal + powerful NestJS backend

---

## ⚡ Current Reality Snapshot

> Read this first before starting any feature. Know what's actually working vs what's planned.

| Layer | Current (Build on this NOW) | Future (Don't code for yet) |
|-------|----------------------------|----------------------------|
| **Backend hosting** | Railway.app | AWS EKS |
| **Database** | PostgreSQL 16 + Redis 7 (Docker local, Railway prod) | AWS RDS Multi-AZ |
| **ORM** | TypeORM | — (keep TypeORM) |
| **Auth** | OTP via **Twilio WhatsApp** (1 verified sender number) | MSG91 (India DLT SMS), Google/Microsoft SSO |
| **Push notifications** | Firebase FCM (configured, not wired up yet) | APNs (iOS), topic subscriptions |
| **File storage** | Not implemented yet — keys configured for AWS S3 | AWS S3 + CloudFront CDN |
| **Payments** | Not implemented yet — Razorpay + Stripe keys configured | Full payment gateway |
| **Email** | SendGrid (configured, not implemented) | — |
| **SMS** | Twilio WhatsApp only (OTP) | MSG91 DLT bulk SMS |
| **AI** | Anthropic Claude — API key configured, `ai` service scaffolded | Streaming, rate limiting, cost tracking |
| **Events/Queue** | Redis (cache/sessions only) | BullMQ (async jobs), Kafka |
| **Admin web hosting** | Local dev only (Vite) | Vercel or Railway static |
| **Mobile CI/CD** | EAS Build + GitHub Actions | — |
| **What's deployed** | Only `auth` service on Railway | All 10 services |
| **What's scaffolded** | 9 other NestJS services (no business logic yet) | — |
| **Tests** | Zero tests written | Full test suite |

### Twilio WhatsApp Note
Currently using **one Twilio-verified WhatsApp sender number** for OTP. This means:
- In development/testing: only pre-verified numbers can receive WhatsApp messages
- For production at scale: need to apply for WhatsApp Business API approval (through Twilio or Meta directly)
- Fallback for now: OTP is also printed to console (dev mode) so you can test without WhatsApp delivery
- Future plan: add MSG91 as primary India SMS channel + Twilio as WhatsApp/international fallback

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [Monorepo Structure](#3-monorepo-structure)
4. [User Roles & Role Switching](#4-user-roles--role-switching)
5. [Feature Modules](#5-feature-modules)
   - [5.1 Auth & Onboarding](#51-auth--onboarding)
   - [5.2 Dashboard (Role-Aware Home)](#52-dashboard-role-aware-home)
   - [5.3 Student Information System (SIS)](#53-student-information-system-sis)
   - [5.4 Attendance](#54-attendance)
   - [5.5 Academic — Assignments & Grades](#55-academic--assignments--grades)
   - [5.6 Timetable & Calendar](#56-timetable--calendar)
   - [5.7 Fee Management & Payments](#57-fee-management--payments)
   - [5.8 Communication & Announcements](#58-communication--announcements)
   - [5.9 Report Cards & Progress Reports](#59-report-cards--progress-reports)
   - [5.10 AI Features](#510-ai-features)
   - [5.11 Transport (Bus Tracking)](#511-transport-bus-tracking)
   - [5.12 Parent-Teacher Meetings (PTM)](#512-parent-teacher-meetings-ptm)
   - [5.13 Notifications](#513-notifications)
   - [5.14 Documents & Media](#514-documents--media)
   - [5.15 Admissions](#515-admissions)
   - [5.16 Library](#516-library)
   - [5.17 Surveys & Feedback](#517-surveys--feedback)
6. [Web Admin Portal](#6-web-admin-portal)
7. [Backend Architecture](#7-backend-architecture)
8. [Infrastructure & Hosting](#8-infrastructure--hosting)
9. [Data Models (Key Entities)](#9-data-models-key-entities)
10. [API Design Conventions](#10-api-design-conventions)
11. [Build Phases & Priorities](#11-build-phases--priorities)
12. [Screen Inventory](#12-screen-inventory)

---

## 1. Architecture Overview

### Single App Model
One Expo mobile app with role-aware UI + a React web admin portal + NestJS backend services.

| Surface | Location | Status |
|---------|----------|--------|
| **Mobile App** | `apps/mobile` | ✅ Structure built, APK builds working, auth flow working |
| **Web Admin Portal** | `apps/admin` | 🔶 UI pages scaffolded, no backend wired |
| **Backend** | `backend/services/` | ✅ `auth` deployed on Railway; 9 services scaffolded |

### Role-Aware Mobile
- After OTP login, server returns `{ role, permissions, schoolId, userId }`
- Mobile renders a different tab bar per role: `(parent)`, `(teacher)`, `(admin)`
- Multi-role users get a **"Switch Role"** option in profile (e.g., teacher who is also a parent)
- All permissions are server-driven — no client-side gating

### Multi-Tenancy
- Every school is a tenant. `schoolId` is embedded in the JWT and injected into every request
- Currently: single PostgreSQL database, `schoolId` column on all tables
- Future: schema-per-tenant for stronger isolation

### Auth Flow (Currently Working)
```
User enters phone number
  → POST /api/v1/auth/otp/send
  → OTP generated, stored in Redis (5-min TTL)
  → Sent via Twilio WhatsApp (or console in dev)
User enters 6-digit OTP
  → POST /api/v1/auth/otp/verify
  → User created/fetched, session created
  → Returns { accessToken, refreshToken, role, user }
Tokens stored in expo-secure-store
  → Auto-refresh on 401 (interceptor in @schoolos/api)
```

---

## 2. Tech Stack

### Mobile App (`apps/mobile`)

| Layer | Current Choice | Notes |
|-------|---------------|-------|
| Framework | Expo SDK 54 + React Native 0.81.5 | ✅ Working, APK builds locally |
| Language | TypeScript 5.x strict | ✅ |
| Navigation | Expo Router v3 (file-based) | ✅ Route groups per role |
| State (local) | Zustand 4.x | ✅ |
| State (server) | TanStack Query v5 | ✅ |
| Styling | NativeWind v4 (Tailwind) | ✅ |
| Forms | React Hook Form v7 + Zod v3 | ✅ |
| Offline cache | expo-sqlite | ✅ Configured |
| Push notifications | Expo Notifications + FCM | 🔶 Configured, not wired |
| Biometric auth | expo-local-authentication | ✅ Configured |
| Secure storage | expo-secure-store | ✅ For JWT tokens |
| File picker | expo-document-picker, expo-image-picker | ✅ |
| Maps | react-native-maps | ✅ Installed |
| Animations | react-native-reanimated + Bottom Sheet | ✅ |
| Payments | Razorpay SDK / WebView | 🔶 Keys configured, not implemented |

### Web Admin Portal (`apps/admin`)

| Layer | Current Choice | Notes |
|-------|---------------|-------|
| Framework | React 18.3 + Vite | ✅ |
| Routing | React Router | ✅ |
| Styling | Tailwind CSS + Radix UI | ✅ |
| State | Zustand + TanStack Query | ✅ |
| Forms | React Hook Form + Zod | ✅ |
| Charts | Recharts | ✅ |
| Tables | TanStack Table | ✅ |
| Rich Text | — | Not yet added |
| Drag & Drop | — | Not yet added (needed for timetable builder) |
| Deployment | Local dev only (Vite) | ⬜ Future: Railway or Vercel |

### Backend Services (`backend/services/`)

| Layer | Current Choice | Notes |
|-------|---------------|-------|
| Framework | NestJS 10.4 (TypeScript) | ✅ |
| ORM | TypeORM | ✅ (not Prisma — use TypeORM consistently) |
| Database | PostgreSQL 16 | ✅ Docker local, Railway prod |
| Cache / Sessions | Redis 7 | ✅ |
| Auth | Custom NestJS service — OTP + JWT | ✅ Deployed & working |
| WhatsApp/OTP | Twilio WhatsApp API | ✅ 1 verified sender (dev limitation) |
| SMS (India) | MSG91 | 🔶 Keys in env, not implemented |
| Email | SendGrid | 🔶 Keys in env, not implemented |
| Push | Firebase FCM | 🔶 Keys in env, not wired |
| File storage | AWS S3 (`ap-south-1`, bucket: `schoolos-files`) | 🔶 Keys configured, no service built |
| CDN | AWS CloudFront | 🔶 Domain configured, not active |
| Payments | Razorpay (India) + Stripe (international) | 🔶 Keys configured, no routes built |
| AI | Anthropic Claude (claude-sonnet-4-6) | 🔶 Key configured, `ai` service scaffolded |
| API docs | Swagger/OpenAPI (auto, disabled in prod) | ✅ |
| Hosting | Railway.app | ✅ `auth` service live |
| Events/Queue | Redis only (no BullMQ yet) | ⬜ Future: BullMQ for async jobs |
| Real-time | — | ⬜ Future: Socket.io WebSocket |
| Monitoring | Sentry | 🔶 DSN configured, not instrumented |
| Analytics | Amplitude | 🔶 Key configured, not wired |

**Legend:** ✅ Working | 🔶 Configured/scaffolded, not implemented | ⬜ Future, don't build yet

---

## 3. Monorepo Structure

```
SchoolOS/
├── apps/
│   ├── mobile/                     ✅ Expo app — single app, all roles
│   │   ├── app/
│   │   │   ├── (auth)/             ✅ Login, OTP screens
│   │   │   ├── (parent)/           🔶 Layout exists, screens stub
│   │   │   ├── (teacher)/          🔶 Layout exists, screens stub
│   │   │   ├── (admin)/            🔶 Layout exists, screens stub
│   │   │   └── _layout.tsx         ✅ Root layout, auth guard, role router
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/                  ✅ Zustand slices
│   │   ├── app.json                ✅ Expo config (EAS project linked)
│   │   └── eas.json                ✅ Build profiles: dev, staging, prod
│   │
│   └── admin/                      🔶 React SPA — pages scaffolded, no backend wired
│       ├── src/pages/              (Dashboard, Students, Teachers, Attendance,
│       │                            Timetable, Finance, Communication, Settings)
│       └── vite.config.ts
│
├── packages/
│   ├── ui/                         🔶 Component library (peer deps configured)
│   ├── api/                        ✅ Axios client + token refresh interceptor
│   ├── types/                      ✅ TypeScript types + Zod schemas for all entities
│   ├── utils/                      ✅ Shared helpers (date, currency, validation)
│   └── config/                     ✅ Zod-validated env schema, constants
│
├── backend/
│   ├── services/
│   │   ├── auth/                   ✅ DEPLOYED on Railway — OTP, JWT, sessions
│   │   ├── student/                🔶 Scaffolded — no routes yet
│   │   ├── attendance/             🔶 Scaffolded — no routes yet
│   │   ├── academic/               🔶 Scaffolded — no routes yet
│   │   ├── finance/                🔶 Scaffolded — no routes yet
│   │   ├── notification/           🔶 Scaffolded — no routes yet
│   │   ├── communication/          🔶 Scaffolded — no routes yet
│   │   ├── timetable/              🔶 Scaffolded — no routes yet
│   │   ├── reporting/              🔶 Scaffolded — no routes yet
│   │   └── ai/                     🔶 Scaffolded — no routes yet
│   ├── libs/                       ✅ Shared guards, filters, interceptors
│   └── migrations/                 🔶 Only auth tables migrated
│
├── infra/                          ⬜ Terraform (future AWS)
├── .github/workflows/              ✅ GitHub Actions CI
├── docker-compose.yml              ✅ Local dev: Postgres 16 + Redis 7 + pgAdmin
├── turbo.json                      ✅ Turborepo task graph
└── pnpm-workspace.yaml             ✅
```

---

## 4. User Roles & Role Switching

### Roles in System

| Role | Code | Mobile | Admin Web | Status |
|------|------|--------|-----------|--------|
| Parent | `PARENT` | Full access | No | 🔶 Layout exists |
| Class Teacher | `CLASS_TEACHER` | Full access | No | 🔶 Layout exists |
| Subject Teacher | `SUBJECT_TEACHER` | Limited | No | 🔶 Layout exists |
| School Admin | `SCHOOL_ADMIN` | Quick view | Full access | 🔶 Layout exists |
| Academic Coordinator | `ACADEMIC_COORD` | Limited | Partial | ⬜ Future |
| Super Admin | `SUPER_ADMIN` | No | Internal tool | ⬜ Future |

### Role-Based Routing (Mobile)
```typescript
// _layout.tsx
const { role } = useAuthStore();

if (!isLoggedIn) return <Redirect href="/(auth)/login" />;

switch (role) {
  case 'PARENT':        return <Redirect href="/(parent)/" />;
  case 'CLASS_TEACHER':
  case 'SUBJECT_TEACHER': return <Redirect href="/(teacher)/" />;
  case 'SCHOOL_ADMIN':  return <Redirect href="/(admin)/" />;
}
```

### Multi-Role
- User entity has `roles: Role[]` array
- If user has multiple roles → show role picker on login or in profile settings
- Each role renders its own tab bar and screen set

---

## 5. Feature Modules

### 5.1 Auth & Onboarding

**Priority:** P0 — ✅ Auth service deployed. OTP working via Twilio WhatsApp.

#### What's Working Now
- `POST /api/v1/auth/otp/send` — generates OTP, sends via Twilio WhatsApp
- `POST /api/v1/auth/otp/verify` — verifies OTP, creates user + session, returns JWT
- `POST /api/v1/auth/refresh` — silent token refresh (interceptor in `@schoolos/api`)
- `POST /api/v1/auth/logout` — revokes session
- OTP stored in Redis, 5-min TTL, max 5 attempts
- Biometric auth (Face ID / Fingerprint) via expo-local-authentication on mobile

#### What to Build Next
- Mobile: wire up login screens to the working API (screens exist, API calls need to be added)
- Mobile: first-time profile setup screen (name, photo, language preference)
- Mobile: role switcher screen (when user has multiple roles)
- Backend: `PATCH /api/v1/auth/profile` — update name, photo
- Backend: `POST /api/v1/auth/sso/google` — Google SSO ⬜ Future

#### Twilio WhatsApp Limitation
- **Dev/testing:** Only pre-verified phone numbers can receive WhatsApp messages on a Twilio trial account
- **Workaround:** OTP is logged to server console in `APP_ENV=development` — read it from Railway logs
- **Production path:** Apply for WhatsApp Business API approval or switch to MSG91 SMS

#### Backend (auth service — already exists)
```
POST   /api/v1/auth/otp/send       Send OTP
POST   /api/v1/auth/otp/verify     Verify OTP → JWT
POST   /api/v1/auth/refresh        Refresh access token
POST   /api/v1/auth/logout         Revoke session
GET    /api/v1/auth/me             Get current user
GET    /api/v1/health              Health check
```

---

### 5.2 Dashboard (Role-Aware Home)

**Priority:** P0 — Build after each service's first endpoints are up.

#### Parent Dashboard — 5 Cards
1. Attendance Today (present / absent / not marked)
2. Next Class (subject, teacher, time)
3. Pending Homework (count)
4. Recent Grade (last graded assessment)
5. Fee Alert (overdue amount or next due date)

#### Teacher Dashboard — 5 Cards
1. Today's Classes (period schedule)
2. Attendance Status (which classes marked / pending)
3. Pending Submissions (awaiting grading)
4. Unread Parent Messages
5. Upcoming Events (exams, PTM)

#### School Admin Dashboard (Mobile — read-only)
1. Today's Attendance % (school-wide)
2. Fee Collection Today
3. Pending Approvals (leave requests)
4. Recent Announcements

**Implementation note:** Dashboard queries multiple services. Build it incrementally — start with static/mock data, replace each card with real API calls as services are built.

---

### 5.3 Student Information System (SIS)

**Priority:** P0 (enrollment, profile) | P1 (transfers) | P2 (health, IEP)

#### Data per Student
```
Basic:     name, DOB, gender, photo, student code (auto: 2025-6-001)
Academic:  gradeId, sectionId, rollNumber, admissionDate, status
Contact:   address, emergency contacts
Guardians: up to 4 (name, relationship, phone, email)
Health:    blood group, allergies, IEP flag [P2]
Docs:      stored in S3 [when S3 is built]
```

#### Admin Web — Build Order
1. School setup: grades + sections + subjects (needed before students can be enrolled)
2. Individual student enrollment form
3. Bulk CSV import (template: name, DOB, grade, section, guardian phone)
4. Student list with grade/section filter
5. Student profile edit
6. Guardian linkage (link parent phone → creates User + PARENT role)
7. Student promote to next grade (end-of-year batch)

#### Mobile (Parent)
- Multi-child switcher: persistent dropdown, stores last-selected `childId` in Zustand
- Child profile: read-only view

#### Mobile (Teacher)
- Class roster: list of students in assigned class
- Student profile: photo, name, attendance %, grades, IEP flag (read-only)
- Tap to call / WhatsApp parent

#### Backend (student service — scaffolded, needs routes)
```
POST   /api/v1/schools              Create school (super admin)
GET    /api/v1/schools/:id          Get school
PATCH  /api/v1/schools/:id          Update school profile

POST   /api/v1/grades               Create grade
GET    /api/v1/grades               List grades (with sections)
POST   /api/v1/sections             Create section

POST   /api/v1/students             Enroll student
GET    /api/v1/students             List (filter: gradeId, sectionId, status)
GET    /api/v1/students/:id         Student profile
PATCH  /api/v1/students/:id         Update student
POST   /api/v1/students/bulk        CSV bulk import
POST   /api/v1/students/:id/promote Promote to next grade

POST   /api/v1/guardians            Link guardian to student
GET    /api/v1/guardians/me/children My children (for parent role)
```

---

### 5.4 Attendance

**Priority:** P0

#### Teacher — Mark Attendance Flow
1. Select class from today's timetable (or quick action)
2. Roster loads with previous status pre-filled
3. One-tap toggle: Present / Absent / Late
4. "Mark All Present" button → tap exceptions
5. Submit → locked after EOD; edits require reason + audit log
6. **Offline:** save to SQLite → auto-sync when online; server-wins on conflict

#### Rules
- Editable until 11:59 PM same day
- Late edits: reason required, stored in `attendance_audit_log`
- Leave-approved students auto-show as "On Leave" (not Absent)

#### Parent — Attendance View
- Monthly calendar: green=present, red=absent, orange=late, grey=holiday
- Attendance % with threshold warning (e.g., below 75%)
- Absence push notification within 5 min of teacher submission *(when FCM is wired)*
- Leave request: date range, reason, doc upload

#### Admin Web
- Live attendance dashboard (school-wide %) — start with polling, add WebSocket later
- Class drill-down
- Leave request approval (approve / reject with reason)
- Daily/weekly/monthly reports (CSV + PDF)
- Chronic absence alerts (configurable threshold)

#### Backend (attendance service — scaffolded, needs routes)
```
POST   /api/v1/attendance                 Mark attendance (bulk)
GET    /api/v1/attendance/:classId/:date  Get class attendance for date
GET    /api/v1/attendance/student/:id     Student's attendance history
PATCH  /api/v1/attendance/:id            Edit with reason (audit logged)
GET    /api/v1/attendance/school/summary  School-wide summary (live)
POST   /api/v1/attendance/leave          Submit leave request
PATCH  /api/v1/attendance/leave/:id      Approve / reject
GET    /api/v1/attendance/reports        Filtered reports
```

---

### 5.5 Academic — Assignments & Grades

**Priority:** P0 (assignments, grades) | P1 (gradebook) | P2 (lesson plans, AI)

#### Teacher — Assignments
- Create: title, rich text, due date, class targets, file attachments (3 × 10 MB)
- Submission tracker: per-student status, timestamp
- Grade entry: score + text feedback per student
- **Publish** action: draft → published (parents notified)
- Offline: assignment list cached in SQLite

#### Parent — Assignments
- List by due date, grouped by subject, status badges
- File attachment download
- "Reviewed" acknowledgment (records `parent_ack_at`, visible to teacher)

#### Teacher — Gradebook [P1]
- Marks entry grid (rows = students, columns = assessments), auto-save every 30s
- Auto-calculate: weighted average, %, GPA
- Class analytics: average, min, max, distribution
- Export: CSV / PDF

#### AI Homework Feedback [P2]
- Teacher pastes student's submission text
- Claude returns detailed, structured feedback
- Teacher edits before sending

#### Backend (academic service — scaffolded, needs routes)
```
POST   /api/v1/subjects              Create subject
GET    /api/v1/subjects              List subjects

POST   /api/v1/assignments           Create assignment
GET    /api/v1/assignments           List (filter: classId, status, teacherId)
GET    /api/v1/assignments/:id       Assignment detail
PATCH  /api/v1/assignments/:id       Update
POST   /api/v1/assignments/:id/publish  Notify parents

GET    /api/v1/assignments/:id/submissions  Submission list
POST   /api/v1/assignments/:id/grade        Bulk grade entry

GET    /api/v1/gradebook/:classId    Full gradebook
GET    /api/v1/gradebook/student/:id Student's grades
```

---

### 5.6 Timetable & Calendar

**Priority:** P0 (view) | P1 (builder, substitutions)

#### Current Approach
- Build timetable data manually via admin web first (simple form, no drag-and-drop yet)
- Drag-and-drop builder is a P1 enhancement

#### Teacher Mobile — Views
- Daily: period, subject, class, room — offline-cached 7 days
- Weekly: horizontal scroll

#### Parent Mobile — Views
- Child's daily timetable, swipe navigation
- School calendar: month view, color-coded events
- Exam tab with schedule

#### Admin Web — Timetable Builder [P1]
- Grid interface (periods × days × classes)
- Conflict detection (double-booked teacher/room)
- Substitute teacher assignment
- Publish → push notifications to teachers + parents

#### Backend (timetable service — scaffolded, needs routes)
```
POST   /api/v1/periods              Define bell schedule
POST   /api/v1/timetable            Create/update timetable entry
GET    /api/v1/timetable            Query (classId, teacherId, week)
POST   /api/v1/timetable/substitute Assign substitute

POST   /api/v1/calendar/events      Create school event
GET    /api/v1/calendar             Month view (school + exams)
```

---

### 5.7 Fee Management & Payments

**Priority:** P0 (structure + view) | P0 (online payment — Razorpay)

#### Current State
Razorpay and Stripe keys are configured in `.env`. No payment routes built yet.

#### Admin Web — Setup
- Fee structure per grade: up to 20 fee heads
- Discounts / scholarships per student
- Due dates, late fee rules
- Bulk fee posting (generate invoices at term start)
- Manual payment entry (cash, cheque, bank transfer)

#### Parent Mobile — Payment Flow
1. View fee schedule: heads, amounts, due dates, outstanding
2. Tap "Pay Now" → Razorpay React Native SDK
3. On success: receipt PDF (when S3 is up) + push notification + email

#### Admin Web — Collection Dashboard
- Today's collection, MTD, YTD
- Student ledger (all transactions)
- Overdue list (filter by grade, amount)
- Defaulters report (CSV)

#### Backend (finance service — scaffolded, needs routes)
```
POST   /api/v1/fees/structure        Create fee structure for grade
GET    /api/v1/fees/structure        Get fee structure
GET    /api/v1/fees/student/:id      Student's ledger

POST   /api/v1/fees/payment/initiate  Create Razorpay order
POST   /api/v1/fees/payment/webhook   Razorpay webhook (verify signature, idempotent)
GET    /api/v1/fees/payment/:id       Payment status

POST   /api/v1/fees/manual            Record offline payment (admin)
GET    /api/v1/fees/reports           Collection summary, defaulters
```

**Razorpay webhook:** Must verify `x-razorpay-signature` header using HMAC-SHA256 with `RAZORPAY_WEBHOOK_SECRET`.

---

### 5.8 Communication & Announcements

**Priority:** P0 (messaging, announcements) | P1 (scheduling, read receipts)

#### Direct Messaging (Teacher ↔ Parent)
- Thread-based: one thread per teacher–parent pair per student
- Parent can only message their child's teachers
- Read receipts: sent → delivered → read
- File attachments (images, PDFs up to 5 MB) — needs S3

#### Announcements
- Admin: target School / Grade / Section / Individual
- Teacher: target own class parents only
- Scheduled sends (store in DB, cron fires at scheduled time) [P1]
- Pinned announcements
- Emergency alert: overrides preferences, SMS fallback via Twilio
- Circular acknowledgment (parent taps "Acknowledged" → timestamp logged)

#### Backend (communication service — scaffolded, needs routes)
```
GET    /api/v1/messages/threads        My threads
GET    /api/v1/messages/threads/:id    Thread messages
POST   /api/v1/messages                Send message
PATCH  /api/v1/messages/:id/read       Mark read

POST   /api/v1/announcements           Create (with optional scheduledAt)
GET    /api/v1/announcements           List (paginated)
PATCH  /api/v1/announcements/:id/ack   Parent acknowledges
GET    /api/v1/announcements/:id/stats Admin: ack stats
```

---

### 5.9 Report Cards & Progress Reports

**Priority:** P1

#### Flow
1. Admin configures report card template (fields, layout, school branding)
2. Admin triggers bulk generation → background job creates PDFs (needs BullMQ or simple sync for small schools)
3. Admin publishes → parents notified → PDF available in app
4. For early phase: generate on-demand per student (no background queue needed)

#### AI Summary [P2]
- Input: student's marks + attendance data
- Claude generates 2–3 sentence narrative per student
- Admin reviews + edits before printing

#### Backend (reporting service — scaffolded, needs routes)
```
POST   /api/v1/report-cards/template   Save template
POST   /api/v1/report-cards/generate   Generate (studentId or bulk by classId)
GET    /api/v1/report-cards/:studentId/:termId  Get report card PDF URL
POST   /api/v1/report-cards/publish    Notify parents
POST   /api/v1/report-cards/ai-summary [P2]
```

---

### 5.10 AI Features

**All AI calls: server-side only.** API key is in backend `.env` only — never expose to client.

Current state: `ai` service is scaffolded, Anthropic key configured, no endpoints yet.

| # | Feature | Who | Priority | Description |
|---|---------|-----|----------|-------------|
| 1 | **Homework Feedback** | Teacher | P2 | Paste student text → Claude returns detailed feedback |
| 2 | **Report Card Summaries** | Admin/Teacher | P2 | Marks + attendance → 2-3 sentence narrative per student |
| 3 | **Parent Message Templates** | Teacher | P2 | Context (absence, concern, praise) → draft message |
| 4 | **Curriculum Planner** | Admin/Teacher | P2 | Subject + grade + dates → topic sequence + pacing |
| 5 | **Attendance Pattern Analysis** | Admin | P2 | 30-day data → at-risk students, chronic absence flags |
| 6 | **Predictive Analytics** | Admin | P3 | Performance + fee default scoring |

#### Backend (ai service — scaffolded, needs routes)
```
POST   /api/v1/ai/homework-feedback    { submissionText, context } → streamed response
POST   /api/v1/ai/report-summary       { studentId, termId } → narrative
POST   /api/v1/ai/message-template     { context, studentId } → draft
POST   /api/v1/ai/curriculum-plan      { subject, grade, termDates } → plan
POST   /api/v1/ai/attendance-analysis  { classId, days } → insights
```

Rate limit: 10 req/min per school. Use Claude `claude-sonnet-4-6`.

---

### 5.11 Transport (Bus Tracking)

**Priority:** P2

#### Parent Mobile
- Live bus location map (react-native-maps already installed)
- Bus arrival push notification (500m geofence)
- Pick-up / drop-off confirmation

#### Admin Web
- Route & stop management
- Driver management
- Live fleet map

**Note:** Requires real-time GPS updates from a driver-side interface (could be a simple web page or extend the mobile app with a driver role).

---

### 5.12 Parent-Teacher Meetings (PTM)

**Priority:** P1

- Teacher sets available slots
- Parent books one-tap
- Reminders: 24hr + 1hr before
- Teacher marks complete + adds notes (optional visibility to parent)

---

### 5.13 Notifications

**Priority:** P0 (infrastructure) | P0 (absence alert) | P1 (all other types)

#### Current State
Firebase FCM keys are configured. Expo Notifications is installed. **Not wired up yet.**

#### What to Build
1. **Backend:** `notification` service — send FCM push via Firebase Admin SDK
2. **Mobile:** Register FCM token on login → `PATCH /api/v1/auth/fcm-token`
3. **Trigger points:** wire up each event (attendance marked → notify parent)

#### Non-Opt-Out (always deliver)
- Emergency Alert (push + Twilio WhatsApp)
- Absence Alert (push)

#### Opt-Out Allowed
- Fee Due, New Grade, New Message, Announcement, Assignment, Bus Alert, PTM Reminder

#### Future: Topic Subscriptions
- `school-{schoolId}` topic for school-wide broadcasts (avoids sending 1000 individual pushes)
- Subscribe/unsubscribe on enrollment/withdrawal

---

### 5.14 Documents & Media

**Priority:** P1 — Depends on S3 being set up first.

#### When S3 is ready
- Upload pattern: client calls `POST /api/v1/upload/presign` → gets pre-signed S3 URL → uploads directly to S3 → sends S3 key to API
- S3 path: `{schoolId}/{type}/{entityId}/{uuid}.{ext}`
- Download: pre-signed URL (24hr expiry) via CloudFront (when active)

#### Parent Mobile
- Document library: school-issued docs (ID card, bonafide, TC)
- Event photo gallery

#### Before S3 is up
- Store files as base64 in PostgreSQL (for early testing only, remove before scale)
- Or use a free Cloudinary account as a bridge

---

### 5.15 Admissions

**Priority:** P2

- Application form builder (admin web)
- Public application URL (no auth required)
- Kanban pipeline: Applied → Shortlisted → Assessment → Interview → Offered → Enrolled
- Offer letter PDF [P3]
- Waitlist [P3]

---

### 5.16 Library

**Priority:** P2

- Book catalog, issue/return, fines, search

---

### 5.17 Surveys & Feedback

**Priority:** P2

- Builder: multiple choice, rating, open text
- Target by grade/class
- Anonymous by default
- Response analytics

---

## 6. Web Admin Portal

The React SPA at `apps/admin`. Pages are scaffolded (Dashboard, Students, Teachers, Attendance, Timetable, Finance, Communication, Settings). No backend calls wired yet.

### Sidebar Navigation (Current + Future)

```
Dashboard                    ← Connect to real APIs as services are built
Students
  ├── All Students
  ├── Enroll Student
  ├── Bulk Import
  └── Promotions
Teachers / Staff
  ├── All Staff
  └── Roles & Permissions
Attendance
  ├── Live View
  ├── Reports
  └── Leave Requests
Academics
  ├── Assignments
  ├── Gradebook
  ├── Timetable Builder     [P1]
  └── Report Cards          [P1]
Finance
  ├── Fee Structures
  ├── Collection Dashboard
  ├── Payments
  └── Reports
Communication
  ├── Announcements
  ├── Messages
  └── Notification Stats
Transport                    [P2]
Admissions                   [P2]
Library                      [P2]
Surveys                      [P2]
Settings
  ├── School Profile
  ├── Academic Years & Terms
  ├── Grades & Sections
  ├── Subjects & Bell Schedule
  ├── Holidays & Calendar
  └── Payment Gateway
AI Analytics                 [P3]
```

---

## 7. Backend Architecture

### Services Map

| Service | Status | Railway Deployed | Key Responsibility |
|---------|--------|-----------------|-------------------|
| `auth` | ✅ Working | ✅ Yes | OTP, JWT, sessions, roles |
| `student` | 🔶 Scaffolded | No | SIS, profiles, guardian linkage |
| `attendance` | 🔶 Scaffolded | No | Marking, reports, leave |
| `academic` | 🔶 Scaffolded | No | Assignments, grades, gradebook |
| `finance` | 🔶 Scaffolded | No | Fees, payments, receipts |
| `notification` | 🔶 Scaffolded | No | FCM, WhatsApp, email dispatch |
| `communication` | 🔶 Scaffolded | No | Messaging, announcements |
| `timetable` | 🔶 Scaffolded | No | Schedule, calendar |
| `reporting` | 🔶 Scaffolded | No | PDF gen, analytics |
| `ai` | 🔶 Scaffolded | No | Claude API endpoints |

### Deploying New Services to Railway
Each service has its own `railway.toml`. To deploy a new service:
1. Add routes to the service
2. Add TypeORM entity + migration
3. Create a new Railway service pointing to the service directory
4. Set the same env vars as `auth` service + service-specific ones

### Shared Backend Libraries (`backend/libs/`)
- Global exception filter (consistent error format)
- Logging interceptor (request/response logging)
- JWT auth guard (`@UseGuards(JwtAuthGuard)`)
- Roles guard (`@Roles('SCHOOL_ADMIN')`)
- Validation pipe (Zod or class-validator)

### Database
- **Local dev:** Docker Compose — `postgresql://postgres:postgres@localhost:5432/schoolos`
- **Production:** Railway PostgreSQL — connection string in `DATABASE_URL` env
- **ORM:** TypeORM with `synchronize: true` in dev (auto-creates tables), `synchronize: false` in prod (use migrations)
- **Existing tables:** `users`, `schools`, `sessions` (from auth service)
- **Add tables:** Create TypeORM entity → add to service's `entities[]` array → restart in dev (auto-syncs) → write migration for prod

### Redis
- **Local dev:** Docker Compose — `redis://localhost:6379`
- **Production:** Railway Redis (add Redis plugin to Railway project)
- **Uses:** OTP storage (5-min TTL), session token hash validation, future: BullMQ queues

---

## 8. Infrastructure & Hosting

### Current Setup

```
┌─────────────────────────────────────────────────────┐
│                    CURRENT                          │
│                                                     │
│  Mobile App ──────────────────→ Railway.app         │
│  (Expo, built locally/EAS)     ├── auth service     │
│                                └── PostgreSQL       │
│  Admin Web ──────────────────→ localhost:5173        │
│  (Vite, local only)            └── (not deployed)   │
│                                                     │
│  OTP/WhatsApp ───────────────→ Twilio               │
│  (1 verified sender)           (trial account)      │
│                                                     │
│  Mobile Builds ──────────────→ EAS (Expo cloud)     │
│                                or local build       │
└─────────────────────────────────────────────────────┘
```

### Future Setup (don't build infra for this yet — just be aware)

```
┌─────────────────────────────────────────────────────┐
│                    FUTURE                           │
│                                                     │
│  Mobile App ──────────────────→ AWS EKS             │
│  Admin Web ───────────────────→ (all 10 services)   │
│                                └── AWS RDS (PG)     │
│                                                     │
│  Files ───────────────────────→ AWS S3 + CloudFront │
│  Queue ───────────────────────→ BullMQ + Redis      │
│  Real-time ───────────────────→ Socket.io           │
│  SMS (India) ─────────────────→ MSG91 (DLT)         │
│  WhatsApp (scale) ────────────→ WhatsApp Biz API    │
│  Monitoring ──────────────────→ Sentry + Amplitude  │
└─────────────────────────────────────────────────────┘
```

### Railway Deployment (Current)

- **Auth service:** Live at `https://{railway-domain}/api/v1`
- `railway.toml` at `backend/services/auth/railway.toml`
- Health check: `GET /api/v1/health`
- To deploy a new service: add its own `railway.toml`, create Railway service, set env vars

### EAS Build (Mobile)

```json
// eas.json profiles:
development  → debug APK/IPA, development server
staging      → release APK, internal distribution
production   → AAB (Android) / IPA (iOS), store submission
```

OTA update channel: `u.expo.dev/e0da3dc6-ba93-492f-b7b2-1e408d205cf4`

Local APK build: `node apps/mobile/scripts/android-local-build.mjs apk`

### Environment Variables (What's needed per service)

**All services need:**
```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
APP_ENV=development|production
```

**Auth service additionally:**
```env
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+1...
TWILIO_WHATSAPP_CONTENT_SID=...   # approved message template SID
```

**Finance service (when built):**
```env
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

**Notification service (when built):**
```env
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
SENDGRID_API_KEY=...
MSG91_API_KEY=...          # future
MSG91_SENDER_ID=SCHLOS     # future
```

**AI service (when built):**
```env
ANTHROPIC_API_KEY=...      # NEVER on mobile/client
```

**File service (when S3 is set up):**
```env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1
AWS_S3_BUCKET=schoolos-files
AWS_CLOUDFRONT_DOMAIN=...
```

---

## 9. Data Models (Key Entities)

These are the TypeORM entities to build (auth entities already exist in `backend/services/auth/`):

```typescript
// Already exists in auth service:
// User, School, Session

// Add to student service:
@Entity('grades')
class Grade {
  id: string;
  schoolId: string;
  name: string;           // "Grade 6"
  order: number;          // for sorting
  sections: Section[];
}

@Entity('sections')
class Section {
  id: string;
  gradeId: string;
  name: string;           // "A", "B"
}

@Entity('students')
class Student {
  id: string;
  schoolId: string;
  studentCode: string;    // auto: "2025-6-001"
  userId?: string;        // if student has their own login [future]
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'M' | 'F' | 'Other';
  photoUrl?: string;
  gradeId: string;
  sectionId: string;
  rollNumber: number;
  admissionDate: Date;
  status: 'active' | 'transferred' | 'withdrawn';
  iepFlag: boolean;
  deletedAt?: Date;       // soft delete
}

@Entity('guardians')
class Guardian {
  id: string;
  studentId: string;
  userId: string;         // links to User (with PARENT role)
  relationship: string;   // "mother", "father", "guardian"
  isPrimary: boolean;
  canPickup: boolean;
}

// Add to attendance service:
@Entity('attendance_records')
class AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;        // section in timetable context
  date: Date;
  status: 'present' | 'absent' | 'late' | 'on_leave';
  markedByUserId: string;
  markedAt: Date;
  editedAt?: Date;
  editReason?: string;
}

@Entity('leave_requests')
class LeaveRequest {
  id: string;
  studentId: string;
  requestedByUserId: string;
  fromDate: Date;
  toDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedByUserId?: string;
  reviewedAt?: Date;
}

// Add to academic service:
@Entity('assignments')
class Assignment {
  id: string;
  schoolId: string;
  sectionId: string;
  subjectId: string;
  teacherUserId: string;
  title: string;
  description: string;    // HTML rich text
  dueDate: Date;
  attachmentKeys: string[]; // S3 keys
  status: 'draft' | 'published';
  publishedAt?: Date;
  deletedAt?: Date;
}

@Entity('grade_records')
class GradeRecord {
  id: string;
  studentId: string;
  assignmentId: string;
  score: number;
  maxScore: number;
  feedback?: string;
  gradedByUserId: string;
  publishedAt?: Date;
  parentAckAt?: Date;
}

// Add to finance service:
@Entity('fee_items')
class FeeItem {
  id: string;
  gradeId: string;
  academicYear: string;   // "2025-26"
  name: string;
  amount: number;         // in paise (INR) or cents (USD)
  currency: string;
  dueDate: Date;
  lateFeeType: 'fixed' | 'percentage';
  lateFeeValue: number;
  lateFeeAfterDays: number;
}

@Entity('payments')
class Payment {
  id: string;
  studentId: string;
  feeItemId: string;
  amount: number;
  method: 'online' | 'cash' | 'cheque' | 'bank_transfer';
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  receiptKey?: string;    // S3 key
  paidAt?: Date;
  createdByUserId: string; // for manual payments
}

// Add to communication service:
@Entity('message_threads')
class MessageThread {
  id: string;
  schoolId: string;
  teacherUserId: string;
  parentUserId: string;
  studentId: string;
  lastMessageAt: Date;
}

@Entity('messages')
class Message {
  id: string;
  threadId: string;
  senderUserId: string;
  content: string;
  attachmentKeys: string[];
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
}

@Entity('announcements')
class Announcement {
  id: string;
  schoolId: string;
  title: string;
  body: string;
  targetType: 'school' | 'grade' | 'section' | 'individual';
  targetIds: string[];
  isEmergency: boolean;
  isPinned: boolean;
  scheduledAt?: Date;
  sentAt?: Date;
  createdByUserId: string;
  deletedAt?: Date;
}
```

---

## 10. API Design Conventions

- **Base URL:** `https://{railway-domain}/api/v1` (current) → `https://api.schoolos.app/v1` (future)
- **Auth:** `Authorization: Bearer {accessToken}` on all protected routes
- **School context:** Injected from JWT claims (`schoolId`) — no need for separate header currently
- **Pagination:** `?page=1&limit=20` → `{ data: [], total, page, limit, hasNext }`
- **Error format:** `{ statusCode, message, code, timestamp }` — `code` is machine-readable (e.g., `ATTENDANCE_ALREADY_MARKED`)
- **Dates:** ISO 8601 UTC strings everywhere (`2025-06-15T09:00:00.000Z`)
- **Money:** Store in smallest unit (paise for INR, cents for USD) — format on client
- **File uploads:** `POST /api/v1/upload/presign { filename, mimeType }` → `{ uploadUrl, key }` → client uploads to S3 → sends `key` to API
- **Soft deletes:** All student/financial data uses `deletedAt` — never hard delete
- **Audit trail:** Every attendance edit, grade publish, payment records who + when

---

## 11. Build Phases & Priorities

### P0 — MVP (First Working School)

**Goal:** One real school can use the system end-to-end.

- [x] Auth service deployed (OTP + JWT)
- [x] Mobile app builds (APK working)
- [ ] Wire mobile auth screens to live API
- [ ] School setup (grades, sections, subjects) — admin web
- [ ] Student enrollment + guardian linkage — admin web + backend
- [ ] Multi-child switcher on mobile (parent)
- [ ] Teacher: mark attendance (online) — mobile + backend
- [ ] Parent: view attendance — mobile + backend
- [ ] Absence push notification — wire FCM
- [ ] Teacher: create assignment + grade — mobile + backend
- [ ] Parent: view assignments + grades — mobile
- [ ] Admin: fee structure setup — admin web + backend
- [ ] Admin: bulk invoice generation — backend
- [ ] Parent: view fees — mobile
- [ ] Parent: pay online (Razorpay) — mobile + backend
- [ ] Admin: announcement broadcast — admin web + backend
- [ ] Parent: announcement center — mobile
- [ ] Teacher ↔ Parent: direct messaging — mobile + backend
- [ ] Admin web: live attendance dashboard
- [ ] Admin web: fee collection dashboard

### P1 — Growth (10+ Schools)

- [ ] Timetable builder (admin web, drag-and-drop)
- [ ] Substitute teacher assignment
- [ ] Report card template builder + PDF generation
- [ ] PTM slot booking (mobile + admin)
- [ ] Scheduled announcements
- [ ] Circular acknowledgment tracking
- [ ] Leave request workflow (mobile + admin)
- [ ] Gradebook full view + export
- [ ] Fee reports (defaulters, collection summary)
- [ ] Document library (when S3 is set up)
- [ ] Admin web: deploy to Railway/Vercel

### P2 — Scale (AI + Transport + Admissions)

- [ ] AI: Homework Feedback (claude-sonnet-4-6)
- [ ] AI: Report Card Summaries
- [ ] AI: Parent Message Templates
- [ ] AI: Curriculum Planner
- [ ] AI: Attendance Pattern Analysis
- [ ] Transport: Bus tracking (GPS + geofencing)
- [ ] Admissions: application form + pipeline
- [ ] Surveys & Feedback
- [ ] Library management
- [ ] WhatsApp Business API approval (scale OTP delivery)
- [ ] MSG91 as India SMS primary channel
- [ ] S3 file storage + CloudFront CDN
- [ ] BullMQ async job queue (PDF gen, bulk notifications)
- [ ] Socket.io real-time (attendance dashboard, bus tracking)
- [ ] Sentry error monitoring
- [ ] Student health records + IEP flags

### P3 — Enterprise

- [ ] AI: Predictive Analytics (performance + fee default)
- [ ] Admissions: offer letters + waitlist
- [ ] Alumni management
- [ ] Multi-school chain admin
- [ ] Schema-per-tenant isolation
- [ ] AWS EKS migration
- [ ] Stripe international payments
- [ ] RTL language support (Arabic)
- [ ] Google Workspace / Azure AD SSO for staff

---

## 12. Screen Inventory

### Mobile — Parent Role

| Screen | Route | Priority | Status |
|--------|-------|----------|--------|
| Splash / auth check | `/` | P0 | 🔶 |
| Phone entry | `/(auth)/login` | P0 | 🔶 |
| OTP verify | `/(auth)/otp` | P0 | 🔶 |
| Dashboard | `/(parent)/` | P0 | 🔶 stub |
| Attendance calendar | `/(parent)/attendance` | P0 | 🔶 stub |
| Leave request | `/(parent)/attendance/leave` | P0 | ⬜ |
| Assignments list | `/(parent)/academics` | P0 | 🔶 stub |
| Assignment detail | `/(parent)/academics/[id]` | P0 | ⬜ |
| Gradebook | `/(parent)/academics/grades` | P0 | ⬜ |
| Report card viewer | `/(parent)/academics/report-card` | P1 | ⬜ |
| Fee schedule | `/(parent)/fees` | P0 | 🔶 stub |
| Fee payment | `/(parent)/fees/pay` | P0 | ⬜ |
| Payment receipt | `/(parent)/fees/receipt/[id]` | P0 | ⬜ |
| Messages list | `/(parent)/messages` | P0 | 🔶 stub |
| Message thread | `/(parent)/messages/[threadId]` | P0 | ⬜ |
| Announcements | `/(parent)/more/announcements` | P0 | ⬜ |
| Timetable | `/(parent)/more/timetable` | P0 | ⬜ |
| Calendar | `/(parent)/more/calendar` | P1 | ⬜ |
| Bus tracking | `/(parent)/more/bus` | P2 | ⬜ |
| PTM booking | `/(parent)/more/ptm` | P1 | ⬜ |
| Document library | `/(parent)/more/documents` | P1 | ⬜ |
| Notifications | `/(parent)/more/notifications` | P0 | ⬜ |
| Profile & settings | `/(parent)/more/profile` | P0 | 🔶 stub |

### Mobile — Teacher Role

| Screen | Route | Priority | Status |
|--------|-------|----------|--------|
| Dashboard | `/(teacher)/` | P0 | 🔶 stub |
| Mark attendance | `/(teacher)/attendance` | P0 | 🔶 stub |
| Attendance history | `/(teacher)/attendance/history` | P0 | ⬜ |
| Assignments list | `/(teacher)/assignments` | P0 | 🔶 stub |
| Create assignment | `/(teacher)/assignments/create` | P0 | ⬜ |
| Assignment + grading | `/(teacher)/assignments/[id]` | P0 | ⬜ |
| Gradebook | `/(teacher)/grades` | P1 | ⬜ |
| Grade entry grid | `/(teacher)/grades/[classId]` | P1 | ⬜ |
| Student profile | `/(teacher)/classes/student/[id]` | P0 | ⬜ |
| Messages | `/(teacher)/messages` | P0 | 🔶 stub |
| Message thread | `/(teacher)/messages/[threadId]` | P0 | ⬜ |
| AI feedback | `/(teacher)/assignments/[id]/ai-feedback` | P2 | ⬜ |
| Timetable | `/(teacher)/more/timetable` | P0 | ⬜ |
| Leave application | `/(teacher)/more/leave` | P1 | ⬜ |
| PTM slots | `/(teacher)/more/ptm` | P1 | ⬜ |
| Notifications | `/(teacher)/more/notifications` | P0 | ⬜ |
| Profile | `/(teacher)/more/profile` | P0 | 🔶 stub |

### Mobile — School Admin Role

| Screen | Route | Priority | Status |
|--------|-------|----------|--------|
| Quick stats dashboard | `/(admin)/` | P0 | 🔶 stub |
| Live attendance | `/(admin)/attendance` | P0 | ⬜ |
| Fee snapshot | `/(admin)/fees` | P0 | ⬜ |
| Send announcement | `/(admin)/announcements/create` | P0 | ⬜ |
| Profile | `/(admin)/profile` | P0 | 🔶 stub |

### Admin Web — Pages

| Page | Status | Priority |
|------|--------|----------|
| Login | 🔶 UI exists, not wired | P0 |
| Dashboard | 🔶 UI exists, not wired | P0 |
| Students list | 🔶 UI exists, not wired | P0 |
| Student enroll | 🔶 UI exists, not wired | P0 |
| Bulk CSV import | ⬜ | P0 |
| Teachers list | 🔶 UI exists, not wired | P0 |
| Attendance live | 🔶 UI exists, not wired | P0 |
| Attendance reports | ⬜ | P1 |
| Leave requests | ⬜ | P1 |
| Assignments overview | 🔶 UI exists, not wired | P0 |
| Timetable builder | ⬜ | P1 |
| Report cards | ⬜ | P1 |
| Fee structures | 🔶 UI exists, not wired | P0 |
| Collection dashboard | 🔶 UI exists, not wired | P0 |
| Announcements | 🔶 UI exists, not wired | P0 |
| Settings: school profile | 🔶 UI exists, not wired | P0 |
| Settings: grades & sections | ⬜ | P0 |

**Legend:** ✅ Working | 🔶 Scaffolded/stubbed | ⬜ Not started

---

*Build end-to-end per feature: backend routes → admin web wired → mobile screens wired. Don't build all backend first then all frontend. Go feature by feature.*
