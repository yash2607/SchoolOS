# SchoolOS Product Reference

Single source of truth for product scope, current implementation, MVP definition, and future roadmap.

Version: 3.0  
Last updated: 2026-04-14  
Primary markets: India first, then Southeast Asia and Middle East

## 1. Product Summary

SchoolOS is a cloud-native school ERP for K-12 institutions. It combines:

- one role-aware mobile app for parents, teachers, and admin quick access
- one premium web portal for school administration and parent or student web access
- a NestJS microservice backend

The product goal is to replace fragmented workflows across attendance, academics, fees, communication, and school operations with a single connected platform.

## 2. Product Vision

SchoolOS should feel like the operating system for a modern school:

- admin teams run setup, reporting, fees, and oversight from the web
- teachers handle day-to-day classroom workflows from mobile
- parents stay informed through a simple mobile-first experience
- every major workflow shares one data model, one auth system, and one school context

## 3. Current Reality

This section describes what exists now in the repo and what is actually usable.

### 3.1 Platforms

| Surface | Location | Current state |
|---|---|---|
| Mobile app | `apps/mobile` | Working Expo app with role routing, live auth, parent experience partly wired, teacher and admin areas partly implemented |
| Web app | `apps/admin` | Premium ERP shell and multiple pages exist; mix of scaffolded and wired screens |
| Backend | `backend/services/*` | Multi-service NestJS setup exists and runs behind nginx/supervisord |

### 3.2 Backend Services Present

The repo currently contains these backend services:

- `academic`
- `ai`
- `attendance`
- `auth`
- `communication`
- `finance`
- `notification`
- `reporting`
- `student`
- `timetable`

### 3.3 Hosting and Infra

Current operating direction:

- backend deployed on Railway
- PostgreSQL and Redis used for runtime data
- admin frontend deployed separately
- mobile builds produced via Expo / EAS and local Android build scripts

Current practical architecture:

- Railway hosts the containerized backend
- nginx fronts internal services
- Supervisor runs the NestJS services
- mobile and web clients point at `https://api.vidyalay.online`

### 3.4 Recently Confirmed Working Areas

Based on the current codebase and recent updates:

- OTP auth flow is wired in mobile and backend
- parent mobile login and OTP screens are now premium-styled and connected
- parent mobile dashboard has a premium redesign
- parent mobile fees and academics screens have upgraded UI
- parent mobile tabs have an upgraded premium shell
- admin web shell has a premium ERP redesign
- backend auth startup path was fixed
- Railway internal port conflicts were fixed

### 3.5 Known Partial Areas

- some teacher mobile flows exist but are still uneven in completeness
- some admin web pages are scaffolded but not fully wired to live APIs
- AI, reporting, and some advanced workflows are still mostly planned
- notifications, storage, and payment infrastructure are only partly wired

## 4. Core Personas

### 4.1 School Admin

Needs:

- school setup
- student and teacher management
- fee configuration and collection visibility
- communication control
- reporting and oversight

### 4.2 Teacher

Needs:

- quick attendance
- assignments and grade entry
- class and student visibility
- direct parent communication

### 4.3 Parent

Needs:

- daily attendance visibility
- homework and grade awareness
- fee visibility and payment
- simple school communication

### 4.4 Student

Currently a secondary persona. Student-facing capability is partly represented on web and roadmap, but not yet a full independent product surface.

## 5. Product Surfaces

### 5.1 Mobile App

Location: `apps/mobile`

Current structure is role-aware:

- `(auth)` for login and OTP
- `(parent)` for parent routes
- `(teacher)` for teacher routes
- `(admin)` for mobile admin quick access

Current direction:

- one shared app
- role-based route groups after auth
- shared API client and auth store

### 5.2 Web App

Location: `apps/admin`

Current page inventory includes:

- admin pages: dashboard, students, teachers, attendance, timetable, academics, finance, communication, settings, login
- parent web pages: dashboard, attendance, academics, fees, messages, timetable
- student web pages: dashboard, attendance, academics, timetable

Current direction:

- premium ERP visual language
- desktop-first school operations
- parent and student companion web experiences where useful

### 5.3 Backend

Location: `backend/services`

Current direction:

- service-per-domain
- shared auth and school context
- internal service routing through nginx
- TypeORM-backed NestJS services

## 6. Current Feature State

Status legend:

- `Live`: implemented and meaningfully usable
- `Partial`: exists and is partly wired or incomplete
- `Planned`: documented direction but not meaningfully implemented yet

| Module | Status | Notes |
|---|---|---|
| Auth and OTP | Live | WhatsApp OTP flow exists, JWT session flow exists |
| Parent mobile auth UI | Live | Recently upgraded premium UI |
| Parent mobile dashboard | Live | Premium redesign and wired data flow |
| Parent mobile academics | Partial | Exists and styled, depth still limited |
| Parent mobile fees | Partial | Exists and styled, depends on backend completeness |
| Parent mobile attendance | Partial | Route exists |
| Parent mobile messages | Partial | Route exists |
| Parent mobile timetable | Partial | Route exists |
| Teacher mobile dashboard | Partial | Screens exist |
| Teacher attendance | Partial | Multiple teacher attendance routes exist |
| Teacher assignments and gradebook | Partial | Routes exist, maturity still uneven |
| Admin mobile quick access | Partial | Basic route structure exists |
| Admin web shell and core pages | Partial | Premium shell exists, page completeness varies |
| Parent web portal | Partial | Multiple pages exist |
| Student web portal | Partial | Multiple pages exist |
| Student information system | Partial | Student service exists, feature completeness still growing |
| Attendance backend | Partial | Service exists |
| Academics backend | Partial | Service exists |
| Finance backend | Partial | Service exists |
| Communication backend | Partial | Service exists |
| Notifications | Partial | Service exists; full delivery workflows still growing |
| AI features | Planned | AI service exists, product features still mostly roadmap |
| Reporting | Planned | Service exists, advanced product layer still roadmap |
| Admissions | Planned | Product requirement only |
| Library | Planned | Product requirement only |
| Transport | Planned | Product requirement only |

## 7. MVP Definition

The MVP is not "all modules." The MVP is the smallest end-to-end school operating loop that a real school can use.

### 7.1 MVP Goal

One school should be able to:

- onboard school structure
- enroll students and link guardians
- let parents authenticate with OTP
- let teachers mark attendance
- let parents view attendance
- publish basic academics data
- let parents view grades and assignments
- publish fee information
- let parents see fee status and make payment
- send announcements and direct messages

### 7.2 MVP Must-Haves

- authentication and session management
- school and class setup
- student enrollment and guardian linkage
- parent child linkage
- attendance mark and view
- assignments and grades
- fee structure and installment visibility
- communication and announcements
- basic dashboards for parent and admin

### 7.3 MVP Nice-to-Haves

- polished analytics
- AI summaries
- advanced reporting
- PTM workflows
- transport tracking
- admissions funnel

## 8. Current MVP Progress Snapshot

### 8.1 Already in Place

- monorepo structure for product surfaces and shared packages
- shared API and type packages
- live auth foundation
- role-aware mobile app routing
- backend service split by domain
- premium UI direction established on web and parent mobile

### 8.2 Still Needed for a Fully Usable First-School MVP

- stronger admin web wiring for school setup and operational workflows
- consistent teacher workflow completion
- full guardian and child linkage confidence
- production-ready fee and payment flow depth
- better messaging completeness
- end-to-end testing for critical school flows

## 9. Product Modules

### 9.1 Authentication

Scope:

- phone-based OTP login
- refresh tokens
- session handling
- role-based routing

Current state:

- implemented
- active across mobile and backend

Future additions:

- SSO for admin and teacher
- richer profile onboarding
- role switcher UX for multi-role users

### 9.2 SIS

Scope:

- school profile
- grades and sections
- subjects
- students
- guardians
- teacher mappings

Current state:

- foundational structure exists
- still needs stronger end-to-end admin workflows

### 9.3 Attendance

Scope:

- teacher marks attendance
- parent views attendance
- summaries and reports

Current state:

- routes and service structure exist
- still needs deeper operational maturity

### 9.4 Academics

Scope:

- assignments
- grade entry
- gradebook
- parent academic visibility

Current state:

- parent and teacher surfaces exist
- still a partial module overall

### 9.5 Fees

Scope:

- fee structures
- installments
- outstanding balances
- payment collection
- receipts and reports

Current state:

- parent surfaces exist
- finance service exists
- full payment and reconciliation maturity still in progress

### 9.6 Communication

Scope:

- announcements
- parent-teacher messaging
- notification routing

Current state:

- service and UI surfaces exist
- full product depth is still incomplete

### 9.7 Timetable and Calendar

Scope:

- class schedules
- daily visibility
- school calendar

Current state:

- routes and services exist
- still needs more complete authoring and management flows

### 9.8 AI

Planned feature family:

- parent weekly summaries
- teacher feedback assistance
- academic insights
- operational summaries

Current state:

- infrastructure and service placeholder exist
- not yet a mature product capability

## 10. UX Direction

SchoolOS should present as premium, calm, and operationally trustworthy.

Design principles:

- premium school ERP, not generic dashboard software
- desktop web for control and oversight
- mobile-first clarity for teachers and parents
- warm, polished surfaces instead of default enterprise UI
- strong information hierarchy
- fast access to daily workflows

Recent visual direction already established:

- premium admin web shell
- premium parent mobile auth flow
- premium parent mobile dashboard and key screens

## 11. Technical Decisions

These are the active product engineering defaults in this repo.

| Area | Decision |
|---|---|
| Monorepo | `pnpm` workspace + Turborepo |
| Mobile | Expo + Expo Router + React Native |
| Web | React + Vite |
| Backend | NestJS microservices |
| ORM | TypeORM |
| Database | PostgreSQL |
| Cache / session support | Redis |
| State management | Zustand + TanStack Query |
| Shared packages | `packages/ui`, `packages/api`, `packages/types`, `packages/utils`, `packages/config` |
| Mobile builds | Expo / EAS + local Android build scripts |
| Backend runtime | nginx + Supervisor + multi-service container |

## 12. Repo Map

```text
SchoolOS/
+-- apps/
¦   +-- admin/
¦   +-- mobile/
+-- backend/
¦   +-- services/
¦       +-- academic/
¦       +-- ai/
¦       +-- attendance/
¦       +-- auth/
¦       +-- communication/
¦       +-- finance/
¦       +-- notification/
¦       +-- reporting/
¦       +-- student/
¦       +-- timetable/
+-- packages/
¦   +-- api/
¦   +-- config/
¦   +-- types/
¦   +-- ui/
¦   +-- utils/
+-- docker/
```

## 13. Release and Deployment Notes

### 13.1 Mobile

Useful commands:

```bash
pnpm --dir apps/mobile typecheck
pnpm --dir apps/mobile run android:local:apk
pnpm --dir apps/mobile run android:local:apk:clean
```

### 13.2 Web

Useful commands:

```bash
pnpm --dir apps/admin build
```

### 13.3 Backend

Operational notes:

- backend runs multiple services in one container
- nginx exposes the public port
- internal services should not bind to the same port as Railway's external `PORT`

## 14. Near-Term Roadmap

These are the next most valuable product steps.

### Phase A: Finish First-School Core

- complete school setup and SIS workflows in admin web
- finish teacher daily workflows end to end
- harden parent attendance, fees, and messages
- improve guardian-child linking and demo data quality
- add critical testing around auth, attendance, and payments

### Phase B: Deepen Operations

- timetable builder improvements
- richer reporting
- better admin dashboards
- PTM and leave workflows
- stronger notifications and delivery tracking

### Phase C: Differentiate

- AI summaries and assistant workflows
- advanced communication automation
- transport
- admissions
- document workflows
- multi-school management

## 15. Longer-Term Roadmap

Potential expansion areas after the first strong school operating loop:

- AI report comments and performance insights
- WhatsApp and multichannel communication scale-up
- advanced finance analytics
- chain school management
- student-facing portal or app
- deeper localization and RTL support
- ecosystem integrations and marketplace

## 16. Product Prioritization Rules

When making roadmap or implementation decisions:

- prefer end-to-end usable workflows over more scaffolding
- prefer parent, teacher, and admin daily loops before expansion modules
- avoid building future infra before the product loop needs it
- keep product state in this file, not spread across multiple reference docs

## 17. Open Questions

These are still active product decisions:

- what exact admin web workflows define "school setup complete"
- how much of student web should be part of MVP versus later
- whether teacher and admin should get SSO before deeper operations modules
- whether payment completion should prioritize Razorpay-only first or multi-gateway abstraction immediately
- when AI moves from internal experiment to customer-facing feature family

## 18. Documentation Rule

`PRODUCT_REFERENCE.md` is the only tracked product reference document in the repo.

Use this file for:

- product summary
- current state
- MVP scope
- feature status
- roadmap
- implementation direction

Do not create separate tracked PRD or roadmap markdown files unless this file is intentionally split in the future.
