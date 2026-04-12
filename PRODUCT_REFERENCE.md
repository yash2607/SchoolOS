# SchoolOS — Product Reference Document
> Single App + Web Admin + Backend | Living Reference for Feature-by-Feature Build

**Version:** 2.0 (Single-App Architecture)  
**Last Updated:** 2026-04-12  
**Markets:** India, Southeast Asia, Middle East  
**Goal:** Cloud-native, multi-tenant SaaS School ERP — one mobile app (role-aware) + web admin portal + powerful NestJS backend

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
8. [Data Models (Key Entities)](#8-data-models-key-entities)
9. [API Design Conventions](#9-api-design-conventions)
10. [Build Phases & Priorities](#10-build-phases--priorities)
11. [Screen Inventory](#11-screen-inventory)

---

## 1. Architecture Overview

### Single App Model (Why)
The original design had three separate apps (Parent App, Teacher App, Admin Web). This is now consolidated into:

| Surface | Description |
|---------|-------------|
| **Mobile App** (`apps/mobile`) | One Expo app, role-aware UI. After login, the user sees the right tabs/features for their role (Parent / Teacher / School Admin on mobile). |
| **Web Admin Portal** (`apps/admin`) | React SPA for School Administrators — full desktop-class school management. |
| **Backend** (`backend/`) | NestJS microservices on AWS EKS. Single API consumed by both surfaces. |

### Role-Aware Mobile
- After OTP/SSO login, the server returns a `role` + `permissions` payload
- The mobile app renders a completely different tab bar and screen set depending on role
- A user can have multiple roles (e.g., a teacher who is also a parent at the same school) — role switcher in profile
- All feature flags and permissions are server-driven (no client-side gating)

### Multi-Tenancy
- Schema-per-tenant PostgreSQL isolation
- Every API request carries a `X-School-ID` header (resolved from JWT claims)
- Tenant provisioning is handled by a super-admin dashboard (separate internal tool, not in scope here)

---

## 2. Tech Stack

### Mobile App

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Expo SDK 54, Managed Workflow | OTA updates via EAS, no custom native modules needed |
| Language | TypeScript 5.x, strict mode | Shared with backend via `packages/types` |
| Navigation | Expo Router v3 (file-based) | Role-based layout groups: `(parent)`, `(teacher)`, `(admin)` |
| State (local) | Zustand 4.x | One slice per module; no prop drilling |
| State (server) | TanStack Query v5 | Caching, background refetch, optimistic updates |
| Styling | NativeWind v4 (Tailwind) | Matches web admin token system |
| Forms | React Hook Form v7 + Zod v3 | Zod schemas shared with backend DTOs |
| Offline | expo-sqlite (SQLite) | Attendance, timetable, gradebook cached locally; encrypted |
| Push | Expo Notifications + FCM + APNs | Unified API, topic-based subscriptions |
| Storage | expo-secure-store | JWT tokens, sensitive prefs |
| File access | expo-document-picker, expo-image-picker | Assignment attachments, photo uploads |
| Maps | react-native-maps | Bus tracking screen |
| Payments | Razorpay React Native SDK / WebView | Fee payment flow |

### Web Admin Portal

| Layer | Choice |
|-------|--------|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS v3 |
| State | TanStack Query v5 + Zustand |
| Tables | TanStack Table v8 |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Rich Text | TipTap |
| Drag & Drop | @dnd-kit/core (timetable builder) |
| PDF Viewer | react-pdf |

### Backend

| Layer | Choice | Notes |
|-------|--------|-------|
| Runtime | Node.js 20 LTS | |
| Framework | NestJS 10 | DI, guards, interceptors, decorators |
| Database | PostgreSQL 15+ | Schema-per-tenant, pg_partman partitioning |
| ORM | Prisma | Per-tenant client instantiation |
| Queue | BullMQ + Redis | Async jobs: PDF gen, bulk notifications, report gen |
| Real-time | WebSocket (Socket.io) | Attendance live dashboard, bus location |
| Auth | Custom NestJS service | OTP via MSG91, Google/Microsoft OIDC, JWT |
| File Storage | AWS S3 + CloudFront CDN | Pre-signed URLs (24hr), versioned PDFs |
| Email | SendGrid | Receipts, report cards, weekly summaries |
| SMS/WhatsApp | MSG91 (India) + Twilio (fallback) | DLT-registered, OTP + bulk alerts |
| Payments | Razorpay + Stripe | India + International |
| AI | Claude claude-sonnet-4-6 via @anthropic-ai/sdk | Server-side only, streaming where needed |
| Infra | AWS EKS + RDS + S3 + CloudFront + MSK | Terraform IaC |
| CI/CD | GitHub Actions + EAS Build + EAS Submit | Lint, type-check, test gates on every PR |

---

## 3. Monorepo Structure

```
SchoolOS/
├── apps/
│   ├── mobile/                     # Single Expo app (Parent + Teacher + Admin roles)
│   │   ├── app/
│   │   │   ├── (auth)/             # Login, OTP, forgot password
│   │   │   ├── (parent)/           # Parent tab group
│   │   │   │   ├── _layout.tsx     # Parent tab bar
│   │   │   │   ├── index.tsx       # Dashboard
│   │   │   │   ├── attendance.tsx
│   │   │   │   ├── academics.tsx
│   │   │   │   ├── fees.tsx
│   │   │   │   ├── messages.tsx
│   │   │   │   └── more.tsx
│   │   │   ├── (teacher)/          # Teacher tab group
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── index.tsx       # Dashboard
│   │   │   │   ├── attendance.tsx
│   │   │   │   ├── classes.tsx
│   │   │   │   ├── assignments.tsx
│   │   │   │   ├── grades.tsx
│   │   │   │   └── messages.tsx
│   │   │   ├── (school-admin)/     # School admin mobile tab group
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── index.tsx       # Quick stats dashboard
│   │   │   │   ├── attendance.tsx
│   │   │   │   ├── fees.tsx
│   │   │   │   └── announcements.tsx
│   │   │   ├── _layout.tsx         # Root layout: auth guard, role router
│   │   │   └── +not-found.tsx
│   │   ├── components/             # App-level shared components
│   │   ├── hooks/                  # App-specific hooks
│   │   ├── store/                  # Zustand slices
│   │   ├── app.json
│   │   └── eas.json
│   │
│   └── admin/                      # React SPA — School Admin Web Portal
│       ├── src/
│       │   ├── pages/              # Route-level components
│       │   ├── components/         # Admin-specific components
│       │   ├── layouts/
│       │   └── store/
│       └── vite.config.ts
│
├── packages/
│   ├── ui/                         # Shared component library
│   │   └── src/components/         # Button, Card, Input, Badge, Modal, Avatar, etc.
│   ├── api/                        # API client + React Query hooks
│   │   ├── src/client.ts           # Axios instance with auth interceptors
│   │   ├── src/hooks/              # useAttendance, useFees, useGrades, useMessages…
│   │   └── src/mutations/          # React Query mutation hooks
│   ├── types/                      # Shared TypeScript + Zod schemas
│   │   ├── src/entities/           # Student, Teacher, Parent, Fee, Grade…
│   │   ├── src/api/                # Request/response types
│   │   └── src/zod/                # Zod schemas (shared with backend DTOs)
│   ├── utils/                      # Shared helpers
│   │   ├── src/date.ts             # dayjs wrappers, timezone
│   │   ├── src/currency.ts         # INR/USD formatting
│   │   └── src/validation.ts       # Phone, email, file validators
│   └── config/                     # Theme tokens, constants, env schema
│
├── backend/
│   ├── services/
│   │   ├── auth/                   # OTP, JWT, SSO, refresh tokens
│   │   ├── student/                # SIS: enrollment, profiles, guardians
│   │   ├── attendance/             # Marking, reports, leave workflow
│   │   ├── academic/               # Assignments, grades, gradebook, lesson plans
│   │   ├── finance/                # Fee structures, payments, receipts
│   │   ├── notification/           # FCM, MSG91, SendGrid dispatcher
│   │   ├── communication/          # Messaging, announcements, circulars
│   │   ├── timetable/              # Schedule builder, substitutions
│   │   ├── reporting/              # PDF generation, report cards, analytics
│   │   ├── transport/              # Bus routes, GPS tracking, geofencing
│   │   ├── admissions/             # Application forms, pipeline, offers [P2]
│   │   └── ai/                     # Claude API integration, all AI features
│   ├── libs/                       # Shared guards, decorators, interceptors
│   └── migrations/                 # Per-tenant schema migrations
│
├── infra/                          # Terraform (EKS, RDS, S3, CloudFront)
├── .github/workflows/              # GitHub Actions CI/CD
├── turbo.json
└── pnpm-workspace.yaml
```

---

## 4. User Roles & Role Switching

### Roles in the System

| Role | Mobile App | Web Admin | Description |
|------|-----------|-----------|-------------|
| `parent` | Yes | No | Views child's data only |
| `teacher` | Yes | No | Manages assigned classes |
| `school_admin` | Yes (limited) | Yes (full) | Full school management |
| `super_admin` | No | Internal tool | Platform-level (Saas ops) |

### Role-Based Routing (Mobile)
```
JWT login response → { role, permissions, schoolId, userId }
     ↓
_layout.tsx reads role from auth store
     ↓
Redirect to:
  role === 'parent'       → /(parent)/
  role === 'teacher'      → /(teacher)/
  role === 'school_admin' → /(school-admin)/
```

### Multi-Role Users
- A person can be both a teacher AND a parent (e.g., teacher whose child attends the same school)
- Profile screen shows **"Switch Role"** if user has multiple roles
- Role switch re-renders the tab bar without re-login
- Each role has its own Zustand slice and cached query namespace

---

## 5. Feature Modules

### 5.1 Auth & Onboarding

**Priority:** P0 — Build first, everything depends on it.

#### Screens
- Splash / App Load (check stored JWT, route to correct home)
- Phone Number Entry
- OTP Verify (6-digit, 5-min validity, 30-sec resend, max 5 attempts)
- Google / Microsoft SSO (OAuth 2.0 PKCE flow via expo-auth-session)
- First-Time Profile Setup (name, photo, language preference)
- Role Switcher (if multi-role)
- Logout + Token Revocation

#### Backend (auth service)
- `POST /auth/otp/send` — MSG91 DLT-registered OTP
- `POST /auth/otp/verify` — returns `{ accessToken, refreshToken, role, permissions }`
- `POST /auth/refresh` — silent token refresh
- `POST /auth/sso/google` — OIDC code exchange
- `POST /auth/sso/microsoft`
- `POST /auth/logout` — revoke refresh token
- JWT: 15-min access token, 30-day refresh token, stored in expo-secure-store
- RBAC guard on every protected route (NestJS `@Roles()` decorator)

---

### 5.2 Dashboard (Role-Aware Home)

**Priority:** P0

#### Parent Dashboard
Cards shown:
1. **Attendance Today** — Present / Absent / Not marked yet
2. **Next Class** — Subject, teacher, time
3. **Pending Homework** — Count of unsubmitted assignments
4. **Recent Grade** — Last graded assessment
5. **Fee Alert** — Overdue amount (red) or next due date

#### Teacher Dashboard
Cards shown:
1. **Today's Classes** — Period-by-period schedule
2. **Attendance Status** — Which classes marked / pending
3. **Pending Submissions** — Assignments awaiting grading
4. **Unread Parent Messages**
5. **Upcoming Events** — Exams, PTM, school events

#### School Admin Dashboard (Mobile — read-only quick view)
Cards shown:
1. **Today's Attendance %** — School-wide, live
2. **Fee Collection Today** — Amount collected
3. **Pending Approvals** — Leave requests, lesson plans
4. **Recent Announcements** — Last sent

---

### 5.3 Student Information System (SIS)

**Priority:** P0 (enrollment + profile) | P1 (transfers) | P2 (health, IEP) | P3 (alumni)

#### Data Captured per Student
- Basic: Full name, date of birth, gender, photo, student ID (auto-generated: `{YEAR}{GRADE}{SEQUENCE}`)
- Academic: Grade, section, roll number, admission date
- Contact: Address, emergency contacts
- Guardian linkage: Up to 4 guardians per student (name, relationship, phone, email, govt ID encrypted at rest)
- Health: Blood group, allergies, medical conditions, IEP flag [P2]
- Documents: Aadhaar, birth certificate, transfer certificate (S3 stored, pre-signed URL)

#### Admin Web Portal — SIS Features
- Individual student enrollment form
- Bulk CSV import (template provided, duplicate detection by phone/email)
- Student list with filter by grade/section/status
- Student profile edit
- Promote students to next grade (end-of-year batch action)
- Transfer & withdrawal management [P1]
- Alumni record (read-only post-withdrawal) [P3]

#### Teacher Mobile — Student Access
- View student list for assigned class
- Student profile: photo, name, attendance %, grades, IEP flag (read-only)
- Click-to-call / click-to-WhatsApp parent

#### Parent Mobile — Child Profile
- View own child's profile (read-only)
- Multi-child switcher: persistent header dropdown, remembers last selected child

---

### 5.4 Attendance

**Priority:** P0

#### Teacher — Marking Flow
1. Open class from timetable or "Mark Attendance" quick action
2. Class roster loads with last status pre-filled
3. **One-tap toggle:** Present (green) / Absent (red) / Late (orange)
4. **"Mark All Present"** baseline button — mark everyone, then tap exceptions
5. Submit (locked after EOD; edits require reason + audit trail)
6. Offline: marks saved to SQLite, synced on reconnect; server-wins conflict resolution

#### Rules
- Cut-off: Attendance editable until 11:59 PM on the same day
- Late edits: after EOD require a reason, stored in `attendance_audit_log`
- Leave-approved students show as "On Leave" (not Absent) — auto-populated

#### Parent — Attendance View
- Monthly calendar (color-coded: green=present, red=absent, orange=late, grey=holiday)
- Attendance % with warning if below school threshold (e.g., 75%)
- Absence push notification arrives within 5 min of teacher submission
- Leave request submission (date range, reason, supporting doc upload)

#### Admin Web Portal — Attendance
- School-wide live attendance dashboard (WebSocket, auto-refreshes)
- Class-level drill-down
- Leave request approval workflow (approve / reject with reason)
- Daily / weekly / monthly attendance reports (downloadable CSV + PDF)
- Chronic absence alert (configurable threshold: e.g., <80% triggers flag)
- Staff attendance tracking [P2]
- Attendance policy configuration (minimum %, working days) [P2]

#### Backend (attendance service)
- `POST /attendance` — bulk mark (classId, date, records[])
- `GET /attendance/:classId/:date` — get marks for a class
- `GET /attendance/student/:studentId` — student's attendance history
- `GET /attendance/school/live` — WebSocket channel
- `PATCH /attendance/:id` — edit with reason (audit logged)
- `POST /attendance/leave` — leave request
- `PATCH /attendance/leave/:id` — approve/reject
- `GET /attendance/reports` — aggregated reports with filters

---

### 5.5 Academic — Assignments & Grades

**Priority:** P0 (assignments, grades) | P1 (gradebook) | P2 (lesson plans, AI feedback)

#### Teacher — Assignments
- Create assignment: title, rich text description, due date, class targets, file attachments (up to 3 × 10 MB)
- Supported file types: PDF, DOCX, JPG, PNG, MP4
- Submission tracker: per-student status (submitted / not submitted / late), timestamp
- Grade entry: numerical score + text feedback per student
- Bulk grade entry grid (rows = students, columns = components)
- **Publish** action: draft → published (parents notified only on publish)
- AI homework feedback modal: paste student submission text → Claude generates detailed feedback [P2]

#### Parent — Assignments
- Assignment list sorted by due date, grouped by subject
- Status badges: Pending / Submitted / Graded
- File attachment download (in-app)
- Homework acknowledgment: tap "Reviewed" — records `parent_ack_at` timestamp, visible to teacher
- Grade details: score, feedback, teacher comments

#### Teacher — Gradebook
- Marks entry grid: rows = students, columns = assessments
- Auto-save drafts every 30 seconds
- Auto-calculate: weighted average, total %, GPA (configurable scheme)
- Class performance analytics: average, highest, lowest, distribution chart
- Export gradebook as CSV / PDF

#### Parent — Grades
- Subject gradebook view: assessment components, marks, grade
- Performance trend line chart: scores over time per subject
- Term-wise summary

#### Admin Web Portal — Academic
- Grading scheme configuration (marks, grades, GPA scale)
- Assignment overview across school
- Lesson plan approval workflow (teacher submits → admin approves/revises) [P2]
- Curriculum planner [P2]
- AI curriculum planner assistant (Claude-powered topic suggestions, pacing) [P2]

#### Backend (academic service)
- `POST /assignments` — create
- `GET /assignments?classId=&status=` — list
- `POST /assignments/:id/submissions` — student submit
- `PATCH /assignments/:id/grades` — bulk grade entry
- `POST /assignments/:id/publish` — notify parents
- `GET /gradebook/:classId` — gradebook data
- `GET /gradebook/student/:studentId` — student's full gradebook
- `POST /lesson-plans` — teacher submits [P2]
- `PATCH /lesson-plans/:id/approve` — admin approves [P2]

---

### 5.6 Timetable & Calendar

**Priority:** P0 (view) | P1 (builder, substitutions)

#### Teacher Mobile
- Daily timetable view: period, subject, class, room
- Weekly view (horizontal scroll)
- 7-day offline cache (SQLite)
- Substitute assignment notification (push)

#### Parent Mobile
- Child's timetable: daily card view, swipe for day navigation
- School & exam calendar: month view, color-coded event types
- Exam tab: upcoming exams with subject, date, syllabus
- Exam schedule PDF export

#### Admin Web Portal — Timetable Builder [P1]
- Drag-and-drop timetable grid
- Conflict detection (teacher double-booked, room clash)
- Bell schedule configuration (period start/end times)
- Substitute teacher assignment (quick-assign when teacher on leave)
- Timetable publish → all affected teachers and parents notified

#### Backend (timetable service)
- `GET /timetable?classId=&week=` — weekly schedule
- `GET /timetable/teacher/:teacherId` — teacher's schedule
- `POST /timetable` — admin creates/updates schedule
- `POST /timetable/substitute` — assign substitute
- `GET /calendar?schoolId=&month=` — school events calendar
- `POST /calendar/events` — admin creates event

---

### 5.7 Fee Management & Payments

**Priority:** P0

#### Admin Web Portal — Fee Setup
- Fee structure per grade: up to 20 fee heads (Tuition, Transport, Activity, etc.)
- Discount & scholarship management (fixed or % off per fee head)
- Due date configuration per fee head
- Late fee rules (% per day or fixed after X days overdue)
- Online payment gateway config (Razorpay / Stripe API keys, webhook URL)
- Overdue reminder schedule (auto-send at D-7, D-3, D-day, D+3)
- Bulk fee posting (generate invoices for all students at term start)

#### Parent Mobile — Fee Flow
1. Fee schedule: all heads, amounts, due dates
2. Balance view: paid, outstanding, late fees
3. Tap "Pay Now" → native Razorpay SDK / Stripe WebView
4. Payment receipt: in-app PDF, emailed, push notification on success
5. Fee due date reminder: parent sets X days before → push at 9 AM
6. Partial payment support (if school enabled)

#### Admin Web Portal — Collection
- Live fee collection dashboard: today's total, MTD, YTD
- Student-level ledger: all transactions
- Overdue list with filters (grade, amount range)
- Manual payment entry (cash/cheque/bank transfer)
- Receipt generation & print
- Fee reports: collection summary, defaulters list (CSV + PDF)

#### Backend (finance service)
- `GET /fees/structure?gradeId=` — fee schedule for a grade
- `GET /fees/student/:studentId` — student's ledger
- `POST /fees/payment/initiate` — create Razorpay/Stripe order
- `POST /fees/payment/webhook` — Razorpay/Stripe webhook (idempotent)
- `GET /fees/receipt/:paymentId` — PDF receipt (S3 pre-signed)
- `GET /fees/reports?type=&from=&to=` — collection reports
- `POST /fees/reminder` — trigger overdue reminders (BullMQ job)
- `POST /fees/manual-payment` — admin records offline payment

---

### 5.8 Communication & Announcements

**Priority:** P0 (messaging, announcements) | P1 (scheduled sends)

#### Direct Messaging (Teacher ↔ Parent)
- Thread-based (one thread per teacher-parent pair per student)
- Parent can only message their child's teachers
- Teacher can message any parent of their class students
- Read receipts: sent → delivered → read ticks
- File attachments (images, PDFs up to 5 MB)
- Push notification on new message
- No parent-to-parent or teacher-to-teacher messaging (keep it focused)

#### Announcements (School / Class / Individual)
- Admin: send to School / Grade / Section / Individual targets
- Teacher: send to own class parents only
- Scheduled announcements (up to 180 days ahead)
- Pinned announcements (stay at top of announcement center)
- Circular acknowledgment: parent taps "Acknowledged" → timestamp logged, admin sees completion rate
- Emergency alert: overrides notification preferences, SMS fallback via MSG91
- Announcement center: chronological list, unread badge, search

#### Backend (communication service)
- `GET /messages/threads` — list all threads for user
- `GET /messages/threads/:threadId` — thread messages
- `POST /messages` — send message
- `PATCH /messages/:id/read` — mark read
- `POST /announcements` — create (with scheduling)
- `GET /announcements?target=&page=` — paginated list
- `PATCH /announcements/:id/acknowledge` — parent ack
- `GET /announcements/:id/ack-stats` — admin: who acknowledged

---

### 5.9 Report Cards & Progress Reports

**Priority:** P1

#### Admin Web Portal
- Report card template builder (drag fields: student name, grade, marks, attendance %, teacher comment, principal sign)
- Term-wise report generation: bulk generate PDF for all students in a grade
- Customize header (school logo, name, academic year)
- Publish report cards → parents notified, PDF available in-app
- AI Report Card Summarization: Claude generates a 2–3 sentence narrative for each student based on grades and attendance [P2]

#### Parent Mobile
- In-app report card viewer (PDF rendered via react-native-pdf)
- Download as PDF
- Push notification when report card published

#### Backend (reporting service)
- `POST /report-cards/generate` — bulk PDF generation (BullMQ, background job)
- `GET /report-cards/:studentId/:termId` — student's report card (S3 pre-signed URL)
- `POST /report-cards/publish` — notify parents
- `POST /report-cards/ai-summary` — Claude generates narrative summaries [P2]

---

### 5.10 AI Features

All AI calls are server-side only (Claude API key never on client). Streaming where UX benefits.

| Feature | Role | Priority | Description |
|---------|------|----------|-------------|
| **AI Homework Feedback** | Teacher | P2 | Teacher pastes student's submission text → Claude returns detailed, constructive feedback the teacher can send as-is or edit |
| **AI Report Card Summaries** | Admin / Teacher | P2 | Given marks + attendance data → Claude writes a 2–3 sentence narrative per student for bulk report card generation |
| **AI Parent Communication Templates** | Teacher | P2 | Teacher selects context (absence follow-up, performance concern, appreciation) → Claude drafts a professional message template |
| **AI Curriculum Planner** | Admin / Teacher | P2 | Given subject, grade, term dates → Claude suggests topic sequence, pacing, resources |
| **AI Attendance Pattern Analysis** | Admin | P2 | Given 30-day attendance data → Claude identifies at-risk students, chronic absence patterns, anomalies with recommendations |
| **AI Predictive Analytics** | Admin | P3 | Broader academic performance prediction, fee default likelihood scoring, enrollment trend analysis |

#### Backend (ai service)
- `POST /ai/homework-feedback` — `{ submissionText, assignmentContext }` → streamed Claude response
- `POST /ai/report-summary` — `{ studentId, termId }` → generated narrative
- `POST /ai/message-template` — `{ context, studentId }` → draft message
- `POST /ai/curriculum-plan` — `{ subject, grade, termDates }` → plan
- `POST /ai/attendance-analysis` — `{ classId, period }` → insights

All endpoints: rate-limited (10 req/min/school), cost tracked per school (for future billing).

---

### 5.11 Transport (Bus Tracking)

**Priority:** P2

#### Parent Mobile
- Live bus location map (30-second GPS updates via WebSocket)
- Bus arrival push notification (500m geofence: "Bus is 5 min away")
- Pick-up / drop-off confirmation (driver marks boarded / alighted)
- Student's assigned bus route and stop

#### Admin Web Portal
- Bus route management: define routes, stops, assigned students
- Driver management: phone, license, vehicle number
- Live fleet map (all buses)
- Trip history

#### Backend (transport service)
- `GET /transport/routes` — all routes for school
- `GET /transport/student/:studentId/route` — student's route
- `POST /transport/location` — driver app posts GPS coordinates
- WebSocket `/transport/bus/:busId/location` — live stream to parents
- `PATCH /transport/trips/:tripId/boarding` — mark student boarded

---

### 5.12 Parent-Teacher Meetings (PTM)

**Priority:** P1

#### Parent Mobile
- View available PTM slots per teacher
- One-tap slot booking
- Cancel / reschedule
- Reminders: push 24hr before + 1hr before
- Post-meeting notes (if admin enables visibility)

#### Teacher Mobile
- Set available time slots for PTM
- View booked appointments
- Mark meeting complete + add notes

#### Admin Web Portal
- Schedule PTM event (date range, per-teacher slot duration)
- Override / manage bookings
- Completion stats (how many parents attended)

#### Backend (timetable/communication service)
- `GET /ptm/slots/:teacherId` — available slots
- `POST /ptm/book` — parent books a slot
- `DELETE /ptm/book/:id` — cancel
- `PATCH /ptm/complete` — teacher marks done + adds notes

---

### 5.13 Notifications

**Priority:** P0

#### Notification Categories

| Category | Opt-Out Allowed | Channels |
|----------|----------------|---------|
| Emergency Alert | No | Push + SMS |
| Absence Alert | No | Push |
| Fee Due | Yes | Push + SMS |
| New Grade Published | Yes | Push |
| New Message | Yes | Push |
| Announcement | Yes | Push |
| Assignment Posted | Yes | Push |
| Report Card Ready | Yes | Push |
| Bus Alert | Yes | Push |
| PTM Reminder | Yes | Push |

#### Parent Mobile
- 90-day notification history (searchable)
- Per-category preference toggles (except non-opt-outable)
- Deep links from notification tap (go to relevant screen directly)

#### Admin Web Portal
- Notification delivery stats (sent / delivered / opened per announcement)
- Overdue reminder scheduler
- Emergency alert broadcast (all-school, immediate)

#### Backend (notification service)
- Unified dispatcher: routes to FCM (Android), APNs (iOS), MSG91 (SMS), SendGrid (email)
- BullMQ queue: batch notifications dequeued at max 500/sec
- FCM topic subscriptions: `school-{schoolId}`, `grade-{gradeId}`, `class-{classId}`
- Delivery tracking: webhook callbacks from FCM/APNs store delivery status
- Scheduled notifications: stored in DB, cron fires at scheduled time

---

### 5.14 Documents & Media

**Priority:** P1

#### Parent Mobile
- Document library: school-issued docs (ID card, bonafide certificate, TC)
- Download individual documents (pre-signed S3 URL, 24hr expiry)
- Event photo gallery (school-watermarked, optional download if school permits)

#### Admin Web Portal
- Upload documents to student profiles
- Bulk document distribution (upload once, available to all parents in a class)
- Media gallery management: upload event photos, set download permission

#### Backend
- All files stored in S3 with path pattern: `{schoolId}/{tenantSchema}/{type}/{entityId}/{filename}`
- Pre-signed URL generation with 24hr expiry
- Virus scan on upload (ClamAV via Lambda)
- Image compression on upload (Sharp)

---

### 5.15 Admissions

**Priority:** P2 (form + pipeline) | P3 (offers, waitlist)

#### Admin Web Portal
- Online application form builder (custom fields drag-and-drop)
- Public-facing application URL per school
- Kanban admissions pipeline: Applied → Shortlisted → Assessment → Interview → Offered → Enrolled
- Bulk status update
- Offer letter PDF generation from template [P3]
- Waitlist management [P3]
- Application analytics (conversion rates per stage)

#### Backend (admissions service)
- `GET /admissions/form/:schoolId` — public form schema (no auth required)
- `POST /admissions/apply` — submit application
- `GET /admissions?stage=&gradeId=` — admin list with filters
- `PATCH /admissions/:id/stage` — move pipeline stage
- `POST /admissions/:id/offer` — generate offer letter [P3]

---

### 5.16 Library

**Priority:** P2

#### Admin Web Portal
- Book catalog management (title, author, ISBN, copies, category)
- Issue / return tracking
- Fine management (overdue books)
- Search catalog

#### Teacher / Parent Mobile
- Search library catalog
- View issued books and due dates

---

### 5.17 Surveys & Feedback

**Priority:** P2

#### Admin Web Portal
- Survey builder: multiple choice, rating (1–5), open text questions
- Target: all parents / specific grade / specific class
- Anonymous by default (toggle per survey)
- Response analytics dashboard
- Export responses as CSV

#### Parent Mobile
- Pending surveys notification
- Complete survey in-app
- View own past responses

---

## 6. Web Admin Portal

Full desktop-class School Admin interface. All the above modules have their admin-facing counterparts here. This section covers admin-only configuration features not mentioned above.

### School Setup (P0)
- School profile: name, logo, timezone, academic calendar
- Academic year & term configuration (start/end dates, term names)
- Grade & section hierarchy (up to 15 grades, 26 sections/grade)
- Subject catalog: subject name, code, type (core/elective)
- Bell schedule: period name, start time, end time, days applicable
- Working days & holidays calendar
- School branding: subdomain prefix, primary/accent colors [P2]

### Staff Management (P0)
- Teacher profiles: name, photo, subjects, classes assigned, contact
- Bulk teacher CSV import
- Role assignment & RBAC (custom role creation with granular permission toggles) [P1]
- Account activation / deactivation
- Staff leave management [P2]

### RBAC System
- Built-in roles: `school_admin`, `teacher`, `parent`, `accountant`, `reception`
- Custom role creation: admin picks from ~40 permission keys [P1]
- Permission keys examples: `attendance.mark`, `fees.view`, `fees.collect`, `grades.publish`, `announcements.send`, `reports.view`, `settings.edit`

### Analytics & Reporting (P1–P2)
- Custom report builder: choose metrics, filters, date range
- Scheduled report emails (daily attendance summary, weekly fee collection, monthly analytics)
- Downloadable formats: CSV, PDF
- AI Predictive Analytics dashboard [P3]

### Compliance & Security (P2)
- Audit logs: all actions logged (who, what, when, IP) — read-only view
- GDPR / India DPDP compliance portal: data export, right-to-erasure request handling
- Full tenant data export (ZIP of all student data, transaction records)
- SSO configuration (Google Workspace / Microsoft Azure AD for staff login)

---

## 7. Backend Architecture

### Microservices Map

| Service | Port | Responsibilities |
|---------|------|-----------------|
| `auth` | 3001 | OTP, JWT, SSO, refresh, RBAC |
| `student` | 3002 | SIS, profiles, guardian linkage |
| `attendance` | 3003 | Marking, reports, leave |
| `academic` | 3004 | Assignments, grades, gradebook, lesson plans |
| `finance` | 3005 | Fee structures, payments, receipts |
| `notification` | 3006 | FCM, APNs, SMS, email dispatcher |
| `communication` | 3007 | Messaging, announcements, circulars |
| `timetable` | 3008 | Schedule, calendar, substitutions |
| `reporting` | 3009 | PDF generation, analytics queries |
| `transport` | 3010 | Routes, GPS, geofencing |
| `admissions` | 3011 | Application forms, pipeline [P2] |
| `ai` | 3012 | Claude API integration, all AI endpoints |

### API Gateway
- Single entry point: `api.schoolos.app`
- Routes requests to services based on path prefix
- Auth middleware validates JWT on all routes except `/auth/*` and `/admissions/form/*`
- `X-School-ID` injected from JWT claims
- Rate limiting: 1000 req/min/school (global), 10 req/min/school for AI endpoints

### Database
- PostgreSQL 15+ on AWS RDS (Multi-AZ)
- **Schema-per-tenant:** each school has its own PostgreSQL schema (e.g., `school_42.students`)
- Prisma client instantiated with `schema=school_{id}` at request time
- Connection pooling: PgBouncer (transaction mode)
- Read replicas for reporting queries

### Queue (BullMQ + Redis)
- `pdf-generation` queue — report cards, receipts
- `notification-dispatch` queue — bulk push/SMS sends
- `ai-processing` queue — async AI jobs
- `report-email` queue — scheduled report emails
- Dead letter queue for failed jobs; retry with exponential backoff (3 attempts)

### Real-Time
- Socket.io on `notification` and `attendance` services
- Channels: `attendance:live:{schoolId}`, `transport:bus:{busId}`
- Parents subscribe to their child's bus channel on app open

### Storage
- AWS S3 bucket per region
- Path: `s3://schoolos-{region}/{schoolId}/{type}/{entityId}/{uuid}.{ext}`
- CloudFront CDN in front of S3 for all reads
- Pre-signed upload URLs (5 min) for direct client-to-S3 uploads
- Pre-signed download URLs (24 hr) for document access

---

## 8. Data Models (Key Entities)

```typescript
// Core entities — shared in packages/types

interface School {
  id: string;
  name: string;
  subdomain: string;
  logoUrl: string;
  timezone: string;
  currency: 'INR' | 'USD' | 'AED';
  activeAcademicYearId: string;
}

interface AcademicYear {
  id: string;
  schoolId: string;
  name: string;           // e.g., "2025-26"
  startDate: Date;
  endDate: Date;
  terms: Term[];
}

interface Grade {
  id: string;
  schoolId: string;
  name: string;           // e.g., "Grade 6"
  sections: Section[];
}

interface Student {
  id: string;
  schoolId: string;
  studentCode: string;    // Auto-generated: 2025-6-001
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'M' | 'F' | 'Other';
  photoUrl: string;
  gradeId: string;
  sectionId: string;
  rollNumber: number;
  admissionDate: Date;
  status: 'active' | 'transferred' | 'withdrawn';
  iepFlag: boolean;
  guardians: Guardian[];  // up to 4
}

interface Guardian {
  id: string;
  studentId: string;
  userId: string;         // links to auth user
  relationship: string;
  isPrimary: boolean;
  canPickup: boolean;
}

interface User {
  id: string;
  schoolId: string;
  phone: string;
  email?: string;
  name: string;
  photoUrl?: string;
  roles: Role[];
  preferredLanguage: 'en' | 'hi' | 'ar';
  fcmToken?: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'on_leave';
  markedByTeacherId: string;
  markedAt: Date;
  editedAt?: Date;
  editReason?: string;
}

interface Assignment {
  id: string;
  schoolId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  title: string;
  description: string;    // Rich text HTML
  dueDate: Date;
  attachments: S3File[];
  publishedAt?: Date;
  status: 'draft' | 'published';
}

interface Grade_Record {
  id: string;
  studentId: string;
  assignmentId: string;
  score: number;
  maxScore: number;
  feedback: string;
  gradedByTeacherId: string;
  publishedAt?: Date;
}

interface FeeStructure {
  id: string;
  gradeId: string;
  academicYearId: string;
  items: FeeItem[];
}

interface FeeItem {
  id: string;
  name: string;           // "Tuition Fee", "Transport", etc.
  amount: number;
  dueDate: Date;
  lateFeeType: 'fixed' | 'percentage';
  lateFeeValue: number;
  lateFeeAfterDays: number;
}

interface Payment {
  id: string;
  studentId: string;
  feeItemId: string;
  amount: number;
  method: 'online' | 'cash' | 'cheque' | 'bank_transfer';
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  receiptUrl?: string;
  paidAt?: Date;
}

interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  attachments: S3File[];
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
}

interface Announcement {
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
}
```

---

## 9. API Design Conventions

- **Base URL:** `https://api.schoolos.app/v1`
- **Auth:** `Authorization: Bearer {accessToken}` on all protected routes
- **Tenant:** `X-School-ID: {schoolId}` (auto-injected from JWT, but required in header too for proxy routing)
- **Pagination:** `?page=1&limit=20` → response includes `{ data, total, page, limit, hasNext }`
- **Errors:** `{ statusCode, message, code, timestamp }` — `code` is machine-readable (e.g., `ATTENDANCE_ALREADY_MARKED`)
- **Dates:** ISO 8601 UTC strings everywhere
- **File uploads:** Client gets pre-signed S3 URL via `POST /upload/presign`, uploads directly to S3, then sends S3 key to the relevant API
- **Soft deletes:** All entities use `deletedAt` (never hard delete student/financial data)
- **Audit:** Every mutation logs `{ userId, action, entityType, entityId, before, after, ip, timestamp }` to `audit_logs` table

---

## 10. Build Phases & Priorities

### P0 — MVP (Target: 10 schools, weeks 1–12)
Must work before first school goes live.

- [ ] Auth (OTP + SSO + JWT + role routing)
- [ ] Role-aware mobile home screen (all 3 roles)
- [ ] Student enrollment + parent guardian linkage (admin web)
- [ ] Teacher: mark attendance (online + offline)
- [ ] Parent: view attendance + absence push notification
- [ ] Teacher: create assignment + grade submissions
- [ ] Parent: view assignments + grades
- [ ] Admin: fee structure setup + invoice generation
- [ ] Parent: view fees + online payment (Razorpay)
- [ ] Admin: announcement broadcast
- [ ] Teacher ↔ Parent: direct messaging
- [ ] Push notification delivery (FCM + APNs)
- [ ] Multi-child switcher
- [ ] Basic admin web dashboard (attendance %, fee collection today)

### P1 — Growth (Weeks 13–24)
- [ ] Timetable builder (drag-and-drop, conflict detection)
- [ ] Substitute teacher assignment
- [ ] Report card template builder + bulk PDF generation
- [ ] PTM slot booking
- [ ] Scheduled announcements (up to 180 days)
- [ ] Circular acknowledgment tracking
- [ ] Custom RBAC roles (admin web)
- [ ] Custom report builder (admin web)
- [ ] Leave request workflow (teacher → admin)
- [ ] Staff management (admin web)
- [ ] Gradebook full view + CSV export
- [ ] Fee reports (defaulters, collection summary)
- [ ] Document library (parent mobile)

### P2 — Scale (Month 7–12)
- [ ] AI: Homework Feedback
- [ ] AI: Report Card Summaries
- [ ] AI: Parent Communication Templates
- [ ] AI: Curriculum Planner
- [ ] AI: Attendance Pattern Analysis
- [ ] Transport: Bus tracking (GPS + geofencing)
- [ ] Admissions: application form builder + pipeline
- [ ] Surveys & Feedback
- [ ] Library management
- [ ] Student health records + IEP flags
- [ ] Staff attendance tracking
- [ ] Audit logs UI (admin web)
- [ ] SSO config for schools (Google Workspace / Azure AD)
- [ ] GDPR/DPDP compliance portal
- [ ] WhatsApp notifications (MSG91 Business API)
- [ ] RTL language support (Arabic)

### P3 — Enterprise (Month 12+)
- [ ] AI: Predictive Analytics (performance + fee default scoring)
- [ ] Admissions: offer letters + waitlist
- [ ] Alumni management
- [ ] Multi-school network admin (chain of schools view)
- [ ] Custom subdomain + white-label branding
- [ ] Advanced analytics: cohort analysis, year-over-year trends
- [ ] Stripe International payments

---

## 11. Screen Inventory

### Mobile App — Parent Role

| Screen | Route | Priority |
|--------|-------|----------|
| Splash / Auth check | `/` | P0 |
| Phone entry | `/(auth)/login` | P0 |
| OTP verify | `/(auth)/otp` | P0 |
| Dashboard | `/(parent)/` | P0 |
| Attendance calendar | `/(parent)/attendance` | P0 |
| Leave request | `/(parent)/attendance/leave` | P0 |
| Assignments list | `/(parent)/academics` | P0 |
| Assignment detail | `/(parent)/academics/[id]` | P0 |
| Gradebook | `/(parent)/academics/grades` | P0 |
| Report card viewer | `/(parent)/academics/report-card` | P1 |
| Fee schedule | `/(parent)/fees` | P0 |
| Fee payment | `/(parent)/fees/pay` | P0 |
| Payment receipt | `/(parent)/fees/receipt/[id]` | P0 |
| Messages list | `/(parent)/messages` | P0 |
| Message thread | `/(parent)/messages/[threadId]` | P0 |
| Announcements | `/(parent)/more/announcements` | P0 |
| Timetable | `/(parent)/more/timetable` | P0 |
| Calendar | `/(parent)/more/calendar` | P1 |
| Bus tracking | `/(parent)/more/bus` | P2 |
| PTM booking | `/(parent)/more/ptm` | P1 |
| Document library | `/(parent)/more/documents` | P1 |
| Notifications | `/(parent)/more/notifications` | P0 |
| Profile & settings | `/(parent)/more/profile` | P0 |
| Child profile | `/(parent)/more/child` | P0 |

### Mobile App — Teacher Role

| Screen | Route | Priority |
|--------|-------|----------|
| Dashboard | `/(teacher)/` | P0 |
| Today's classes | `/(teacher)/` (inline) | P0 |
| Mark attendance | `/(teacher)/attendance` | P0 |
| Attendance history | `/(teacher)/attendance/history` | P0 |
| Assignments list | `/(teacher)/assignments` | P0 |
| Create assignment | `/(teacher)/assignments/create` | P0 |
| Assignment detail / grading | `/(teacher)/assignments/[id]` | P0 |
| Gradebook | `/(teacher)/grades` | P1 |
| Grade entry grid | `/(teacher)/grades/[classId]` | P1 |
| Student profile | `/(teacher)/classes/student/[id]` | P0 |
| Messages list | `/(teacher)/messages` | P0 |
| Message thread | `/(teacher)/messages/[threadId]` | P0 |
| AI homework feedback | `/(teacher)/assignments/[id]/ai-feedback` | P2 |
| Timetable | `/(teacher)/more/timetable` | P0 |
| Leave application | `/(teacher)/more/leave` | P1 |
| PTM slots | `/(teacher)/more/ptm` | P1 |
| Lesson plan submit | `/(teacher)/more/lesson-plan` | P2 |
| Notifications | `/(teacher)/more/notifications` | P0 |
| Profile & settings | `/(teacher)/more/profile` | P0 |

### Mobile App — School Admin Role (Quick Access)

| Screen | Route | Priority |
|--------|-------|----------|
| Quick stats dashboard | `/(school-admin)/` | P0 |
| Live attendance | `/(school-admin)/attendance` | P0 |
| Fee snapshot | `/(school-admin)/fees` | P0 |
| Send announcement | `/(school-admin)/announcements/create` | P0 |
| Notifications | `/(school-admin)/notifications` | P0 |
| Profile | `/(school-admin)/profile` | P0 |

### Web Admin Portal — Sidebar Navigation

```
Dashboard
Students
  ├── All Students
  ├── Enroll Student
  ├── Bulk Import
  └── Promotions
Teachers / Staff
  ├── All Staff
  ├── Add Teacher
  └── Roles & Permissions
Attendance
  ├── Live View
  ├── Reports
  └── Leave Requests
Academics
  ├── Assignments
  ├── Grades Overview
  ├── Lesson Plans
  ├── Timetable Builder
  └── Report Cards
Finance
  ├── Fee Structures
  ├── Collection Dashboard
  ├── Payments
  ├── Overdue / Defaulters
  └── Reports
Communication
  ├── Announcements
  ├── Messages
  └── Notification Stats
Transport              [P2]
  ├── Routes
  └── Live Fleet Map
Admissions             [P2]
  ├── Applications
  └── Pipeline
Library                [P2]
Surveys                [P2]
Settings
  ├── School Profile
  ├── Academic Years & Terms
  ├── Grades & Sections
  ├── Subjects & Bell Schedule
  ├── Holidays & Calendar
  ├── Payment Gateway
  ├── SSO Config          [P2]
  └── Audit Logs          [P2]
AI Analytics            [P3]
```

---

*This document is the single source of truth for building SchoolOS. Update it as features are completed or specifications change. Each feature section maps directly to a backend service, a set of API endpoints, and a set of screens — build end-to-end (screen + API + service) one module at a time.*
