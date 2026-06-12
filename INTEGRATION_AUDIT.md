# InsightNest — Frontend/Backend Integration Audit & Contract

Date: 2026-06-11. Scope: integrate `Frontend_updated/` (design prototype, fully mocked) with the Spring Boot backend (`/api/v1`), implement missing pieces on both sides, then replace `frontend/` with the new app.

## 1. State found

### New frontend (`Frontend_updated/`)
- React 18 + TS + Vite 6 + Tailwind v4 (shadcn/Radix component kit), custom **hash router** (`#/route`), `motion`, recharts, sonner, etc.
- **Zero live data**: every page renders hardcoded data from `src/app/api/mock.ts` and `src/app/api/extras.ts`; every action is local state + toast.
- **Fake auth**: `SessionProvider` "signs in" by picking a role (Learner/Faculty/Rep/Admin) with hardcoded names; persisted in localStorage; NavBar has a demo role switcher.
- 33 routes including pages the backend never supported: Messages, Researcher portal, Rep portal, Admin CMS, Profile (self + public), Settings (747 lines of preference UI), Counsellor, Matchmaker, Librarian, Digest, plus detail pages for every entity.
- Packaging bugs: `react`/`react-dom` only in `peerDependencies`; stray `pnpm-workspace.yaml`; no `.env.example`; placeholder `<title>`; `src/imports/` contains design-time leftovers.

### Backend
- Modules: auth (JWT + rotating refresh), user, profile (learner/faculty), university, program (+applications), scholarship (+applications), research (+join requests), resource, forum, webinar (+registrations), contact, faq, notification, audit, saved, admin bootstrap.
- Pagination `{content, page}`, error shape `{timestamp,status,error,message,path,errors?}`.
- Roles: `ADMIN, LEARNER, FACULTY` only.

## 2. Gap matrix

### FE features with NO backend (must build)
| # | Feature | Resolution |
|---|---|---|
| G1 | Messages/correspondence (conversations, replies, unread) | New `messaging` module |
| G2 | Rep role + rep portal | New `UNIVERSITY_REP` role; reuse program/scholarship/webinar CRUD with rep permission; enquiries = messaging |
| G3 | Counsellor / Matchmaker / Librarian / Digest agent pages | New `agent` module (deterministic heuristics over live data, Gemma-pluggable; matches root `agents.md`) |
| G4 | Admin overview stats | `GET /api/v1/admin/stats` |
| G5 | Withdraw application (dashboard) | Add `WITHDRAWN` status + owner withdraw endpoints |
| G6 | Password change (Settings) | `POST /api/v1/users/me/password` |
| G7 | Public profile page (`/profile/:id`) | `GET /api/v1/users/{id}/public` |
| G8 | Researcher applicant review | Map to existing research join requests (`/research/requests/owned`, `PATCH /research/requests/{id}`) |
| G9 | Display fields missing on entities (founded, students, tags, tuition, funder/amount/currency/region/level, lab/institution/openings/field/deadline, webinar duration, thread category, resource author/year/pages/field) | Extend entities + DTOs (`ddl-auto: update` migrates) |

### FE elements that stay UI-local (prototype-only, out of integration scope)
Connected services (ORCID/GitHub…), passkeys/2FA toggles, data exports (PDF/CSV), account deletion, admin media library (maps loosely to resources), admin site-settings, faculty exam-template builder (persists to localStorage; submitted answers ride in the join-request message), digest snooze (localStorage). These render and work locally; wiring them would require OAuth/integration work with no backend counterpart. Documented in README.

### Backend features the FE prototype ignored (must surface)
Real login/register/refresh/logout; paginated lists; saved-items API; notifications API; FAQ from API; contact POST; forum comments POST; webinar register/cancel + my registrations; resource upload + download (auth-gated); learner/faculty profile GET/PUT; admin: user list + suspend/enable, audit logs, contact inbox, FAQ CRUD; university/program/scholarship CRUD for admin drawer forms.

## 3. Backend contract (what WP-1 builds — FE codes against this)

### 3.1 Entity/DTO extensions (all optional/nullable; update request+response DTOs and validation)
- `University`: `foundedYear int`, `studentCount int`, `tags varchar` (comma-separated; DTO exposes `tags: string[]`).
- `Program`: `tuition varchar`. (FE "level" = existing `type`; "discipline" = existing `department`.)
- `Scholarship`: `funder varchar`, `amount decimal(12,2)`, `currency varchar(3)`, `region varchar`, `level varchar`.
- `ResearchProject`: `lab varchar`, `institution varchar`, `openings int`, `field varchar`, `deadline date`. (`pi` = `createdBy.fullName`; expose in DTO.)
- `Webinar`: `durationMinutes int`, `speakerAffiliation varchar` (speaker name = host fullName). DTO adds derived `status: UPCOMING|PAST` from `scheduledAt`.
- `ForumThread`: `category varchar`. Thread list DTO adds `replyCount` and `lastReplyAt`.
- `LibraryResource`: `author varchar`, `year int`, `pages int`, `field varchar`, `resourceType varchar` (PDF/DATASET/VIDEO/PAPER/BOOK; default derived from file extension).

### 3.2 New role
`UNIVERSITY_REP` in `Role` enum. Registration accepts it (ADMIN still blocked from self-registration). Permissions: program/scholarship/webinar create+update and application review endpoints widen from `hasRole('ADMIN')` to `hasAnyRole('ADMIN','UNIVERSITY_REP')`; webinar create currently FACULTY/ADMIN → add UNIVERSITY_REP.

### 3.3 Application withdraw
Add `WITHDRAWN` to both application status enums. `POST /api/v1/programs/applications/{id}/withdraw` and `POST /api/v1/scholarships/applications/{id}/withdraw` — owner-only; only from `PENDING`/`NEEDS_INFO`; emits status-changed event (notification + audit ride along).

### 3.4 Messaging module (`com.insightnest.messaging`)
Entities: `Conversation(id, subject, initiator→User, recipient→User, createdAt, lastMessageAt)`, `ConversationMessage(id, conversation, sender→User, body text, sentAt, readByRecipient bool)`.
- `GET /api/v1/messages` — my conversations (paginated, newest first; each: id, subject, otherParty{id,fullName,roles}, unreadCount, lastMessageAt, lastPreview).
- `POST /api/v1/messages` `{recipientId? , recipientEmail?, subject, body}` → conversation DTO (404 if recipient unknown; 422 if both/neither recipient keys).
- `GET /api/v1/messages/{id}` — full thread (participant-only) + marks incoming as read.
- `POST /api/v1/messages/{id}/reply` `{body}` (participant-only).
- New-message → notification event for the other party. All auth roles allowed.

### 3.5 Agent module (`com.insightnest.agent`) — heuristic now, Gemma-ready
Optional env `GEMMA_BASE_URL`/`GEMMA_MODEL`; when unset (default) use deterministic logic over live repositories. All endpoints authenticated; runs audit-logged as `AGENT_RUN`.
- `POST /api/v1/agent/counsellor` `{message, history?: [{role,text}]}` → `{reply: string, citations: [{type: PROGRAM|SCHOLARSHIP, id, title, subtitle, deadline?}]}`. Heuristic: keyword-match message tokens against program name/type/department and scholarship title/region/level; compose a readable reply citing top 3–6.
- `GET /api/v1/agent/matchmaker` (LEARNER) → `[{project: ResearchProjectDto, score: 0..100, rationale: string}]` ranked. Heuristic: token overlap between learner profile (interests/education/skills) and project tags/field/requiredSkills/title; deterministic tie-break by id.
- `POST /api/v1/agent/librarian` `{question}` → `{answer, sources: [{resourceId, title, author?, year?, relevance}]}`. Heuristic: rank resources by token overlap (title/description/field); answer summarizes matched descriptions; if nothing relevant: honest "no answer in the archive" with empty sources.
- `GET /api/v1/agent/digest` → `{generatedAt, urgent: [...], approaching: [...], webinars: [...]}` from the user's saved items + webinar registrations + soonest-deadline catalogue items (≤30 days urgent, ≤90 approaching), each `{type, id, title, subtitle, deadline}`.

### 3.6 Misc endpoints
- `GET /api/v1/admin/stats` (ADMIN): `{users, universities, programs, scholarships, researchProjects, resources, webinars, threads, pendingProgramApplications, pendingScholarshipApplications, pendingJoinRequests, newContactMessages}`.
- `POST /api/v1/users/me/password` `{currentPassword, newPassword(min 8)}` — 422 wrong current password; revokes refresh tokens.
- `GET /api/v1/users/{id}/public` — `{id, fullName, roles, joinedAt, learnerProfile?{interests,educationHistory…}, facultyProfile?{title,department,researchAreas…}}` (only public-safe fields; 404 for suspended/disabled).

### 3.7 Seed data
Extend `seed/insightnest_seed.sql`: populate new columns for existing rows, and add the international catalogue from the FE mock (20 universities, 12 programs, 9 scholarships, 6 research projects, 5 webinars, 6 threads, 7 resources) with the same idempotent delete-then-insert pattern. Add one `UNIVERSITY_REP` demo user (`rep.demo@insightnest.com` / `Admin@123`, pattern from `reset_demo_passwords.sql`).

## 4. Frontend contract (WP-2/3/4)

- `src/app/api/client.ts`: fetch wrapper — `VITE_API_URL` base (default `http://localhost:8080/api/v1`), JSON, bearer token, single auto-refresh on 401 then redirect to `#/login?next=…`, normalized `ApiError{status,message,fieldErrors}`; unwraps `{content,page}`.
- `src/app/api/endpoints.ts` (or per-domain files): typed functions for EVERY endpoint in §3 + existing ones. Mock files are deleted at the end of WP-4.
- `SessionProvider`: real login/register/logout; stores `{accessToken, refreshToken, user{id,fullName,email,roles}}`; FE role labels map `LEARNER→Learner, FACULTY→Faculty, UNIVERSITY_REP→Rep, ADMIN→Admin`; remove demo role-switcher everywhere; login picks no role (comes from server); register offers Learner/Faculty/Rep only.
- Every data view: loading skeleton, error state with retry, empty state (the design's components, not new ones).
- Status label mapping in one helper: `PENDING→UNDER REVIEW`, `APPROVED→ACCEPTED`, `NEEDS_INFO→NEEDS INFO`, `REJECTED`, `WITHDRAWN`.
- ApplyFlow submits real `POST .../apply` on the final step (program/scholarship: statement assembled from step fields; research: join request whose message includes the written-exam answers). Errors surface in the modal; duplicate-application 409/422 shows the API message.
- Packaging: move react/react-dom to `dependencies`; delete `pnpm-workspace.yaml`, `default_shadcn_theme.css` (if unused), `src/imports/`; add `.env.example`; fix `index.html` title to "InsightNest — Insight for your higher studies."; add `npm run preview`; keep port 5173.

## 5. Bugs & corner cases found in the prototype (fix during wiring)

1. **`peerDependencies` react** — breaks clean `npm install` on npm <7 and confuses tooling. Move to `dependencies`.
2. **Hash-router scroll reset** runs on every hash change including same-page anchors (`#thread-{id}` links in Forums sidebar conflict with route hashes — `#/forums` + `#thread-x` is not a route; anchor links inside a hash router silently navigate to NotFound). Fix: use element scrolling, not bare anchors.
3. **RouteGuard** protects `/researcher`, `/rep`, `/admin` only by sign-in, not by role — a Learner can open the Admin CMS. Add role checks (redirect to own roleHome).
4. **`Messages` unread pip** in NavBar is hardcoded `true`; wire to real unread count; poll or refetch on route change.
5. **Dashboard digest tab** mixes scholarships/programs with `as any` and `s.name ?? s.title` — replace with typed agent digest data.
6. **Date handling**: mock dates are strings `2026.08.01`; API returns ISO. One `fmtDate` helper; never `new Date("2026.08.01")` (invalid in Safari).
7. **`fmtMoney`** falls back silently; currency may be null from API — guard.
8. **Detail pages** `find(x => x.id === params.id)` with NO not-found handling → blank page on bad id. Use API fetch + 404 state.
9. **Login `next` redirect** is unvalidated — restrict to internal `#/` paths.
10. **`localStorage` JSON.parse** of session without shape validation — a stale prototype session (`role: "Rep"`) must not survive into the real auth world; namespace the new key (`insightnest.auth.v2`) and drop legacy keys.
11. **Counsellor streaming** uses `setTimeout` typewriter on mock text — keep the typewriter as presentation, but over real `reply` text; disable input while pending; handle agent endpoint failure.
12. **Forms lack validation** (register accepts empty email/password) — mirror backend validation client-side, surface `fieldErrors`.
13. **Withdraw button** shows for `ACCEPTED` apps (backend will reject) — hide unless PENDING/NEEDS_INFO.
14. **`index.html` title/description** are Figma-export placeholders.
15. **A11y**: drawers/modals lack focus trap & `aria-modal` in custom ActionDrawer; Escape handled but focus restoration missing — acceptable to fix minimally (focus close button on open, restore on close).
16. **`useScrollProgress`/scenes** attach window listeners — verify cleanup to avoid leaks across hash navigations (most do; ReadingProgress OK).
17. **Old `frontend/` axios client expected `VITE_API_URL`; new app must read the same var so `run.py` and `.env` flows keep working.**

## 6. Execution plan

- **WP-1 (backend, Sonnet)**: §3 entirely + `mvn test` green.
- **WP-2 (frontend core, Sonnet)**: client + endpoints + session/auth + NavBar + Dashboard + packaging fixes (§4, bugs 1,3,4,9,10,12,13).
- **WP-3 (frontend catalogue, Sonnet)**: Home stats, Universities/Programs/Scholarships/Research/Resources/Forums/Webinars + all detail pages + ApplyFlow + saves + registrations + Contact + FAQ (bugs 2,6,7,8).
- **WP-4 (frontend portals, Sonnet)**: Messages, Counsellor, Matchmaker, Librarian, Digest, Researcher, Rep, Admin, Profile, Settings (bugs 5,11) + delete mock files.
- **Verify**: `mvn -q test`, `npm run build`, end-to-end smoke with `run.py` stack against MySQL; fix fallout.
- **Swap**: delete `frontend/`, rename `Frontend_updated` → `frontend`.
- **Root files**: README (stack, features, credentials, agent endpoints), `agents.md` (implemented-status), `Project_details.md` untouched, `run.py` (verify compatibility; npm install path).
