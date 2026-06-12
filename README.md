# InsightNest

InsightNest is an academic opportunity platform for learners, faculty, university representatives, and admins: university and program discovery, program and scholarship applications, research collaboration, a resource library, community forums, webinars, saved items, in-app notifications, private messaging, and four AI advisory features.

## Architecture

| Layer | Stack |
| --- | --- |
| Frontend | React 18 + TypeScript + Vite 6, Tailwind CSS v4, Radix UI, GSAP/Motion + Three.js, fetch-based API client |
| Backend | Spring Boot 3 (Java 17), Spring Security (JWT), Spring Data JPA |
| Database | MySQL 8 |
| File storage | Local `storage/` directory (configurable via `STORAGE_PATH`) |

Repository layout:

- [backend/](backend/) — Spring Boot API (`com.insightnest.*` feature modules: auth, user, profile, university, program, scholarship, research, resource, forum, webinar, contact, faq, notification, audit, saved, admin, **messaging**, **agent**)
- [frontend/](frontend/) — React UI (editorial redesign; hash-routed pages, shared components, typed API client, auth/session context)
- [seed/](seed/) — MySQL seed data (tracked in git on purpose; do not gitignore)
- [run.py](run.py) — one-command local launcher
- [agents.md](agents.md) — the four Gemma-pluggable agent features and their tool contracts
- [Project_details.md](Project_details.md) — full product specification

Roles: `LEARNER`, `FACULTY`, `UNIVERSITY_REP`, `ADMIN`. The frontend presents these as Learner, Faculty, Rep, and Admin, each with its own portal (dashboard, researcher console, rep console, admin CMS).

Cross-cutting concerns are decoupled through in-process domain events (Spring `ApplicationEventPublisher`): services publish events such as application-status changes, join-request activity, logins, and admin actions; the notification and audit modules consume them via `@EventListener`. Swapping the in-process bus for an external broker later requires changing only the publish/listen edges, not the domain services.

## Backend setup

1. Create a MySQL database named `insightnest`.
2. Copy [backend/.env.example](backend/.env.example) to `backend/.env` and update credentials. `JWT_SECRET` must be at least 32 characters.
3. From the `backend` folder, run:

```bash
mvn spring-boot:run
```

Requires JDK 17–21 (newer JDKs are not yet supported by this Spring Boot generation; `run.py` handles this automatically). The API runs on `http://localhost:8080` and Swagger UI is available at `http://localhost:8080/swagger-ui/index.html`.

Run the unit tests with `mvn test` (auth rules, JWT issuing/validation, application deadline/duplicate rules, notification ownership).

### API conventions

- Base path is `/api/v1`; protected endpoints require a `Bearer` access token from `POST /api/v1/auth/login`.
- Controllers return response DTOs (Java records with `from(entity)` factories), never JPA entities; embedded users expose only `id`, `fullName`, and `roles`.
- List endpoints are paginated: `?page=0&size=20` (default size 20, max 100). Responses use the shape `{ "content": [...], "page": { "size", "number", "totalElements", "totalPages" } }`.
- Errors use a standard shape: `{ "timestamp", "status", "error", "message", "path" }` (plus an `errors` field map for validation failures).
- Refresh tokens rotate on use (`POST /api/v1/auth/refresh`); expired and revoked tokens are purged by a daily scheduled job.
- Resource uploads accept PDF, DOC, DOCX, PPT, PPTX up to 20 MB. Non-public resources require authentication to download.
- CORS origins are configurable via `CORS_ALLOWED_ORIGINS` (comma-separated; defaults to `http://localhost:5173`).

### Feature endpoints beyond the basics

- `GET/PATCH/POST /api/v1/notifications`, `/{id}/read`, `/read-all` — per-user notifications, emitted on application reviews, research join-request activity, and new messages.
- `GET/POST/DELETE /api/v1/saved-items` — save universities, programs, scholarships, research projects, webinars, or resources.
- `POST /api/v1/programs/applications/{id}/withdraw`, `POST /api/v1/scholarships/applications/{id}/withdraw` — applicant withdraws a pending application.
- `GET /api/v1/admin/stats` (admin) — dashboard counts (users, catalogue sizes, pending applications/join-requests, new contact messages).
- `GET /api/v1/admin/audit-logs` (admin) — audit trail of logins, registrations, admin CRUD, application reviews, uploads, and agent runs.
- `POST /api/v1/users/me/password` — change password (revokes refresh tokens). `GET /api/v1/users/{id}/public` — public profile.

### Messaging

- `GET /api/v1/messages` — my conversations (unread counts, last preview). `POST /api/v1/messages` `{recipientId|recipientEmail, subject, body}` opens a conversation.
- `GET /api/v1/messages/{id}` returns the thread (marks incoming read); `POST /api/v1/messages/{id}/reply` `{body}`. Participants only; a new message notifies the other party.

### AI features (Gemma-pluggable agents)

Four advisory features run on a deterministic heuristic over live data by default, and switch to **Gemma 4** when `GEMMA_BASE_URL`/`GEMMA_MODEL` are configured (see [agents.md](agents.md)). All are authenticated and audit-logged as `AGENT_RUN`.

- `POST /api/v1/agent/counsellor` `{message, history?}` — study-path advice with program/scholarship citations.
- `GET /api/v1/agent/matchmaker` (learner) — open research projects ranked against the learner profile with a score and rationale.
- `POST /api/v1/agent/librarian` `{question}` — semantic Q&A over the resource library with citations.
- `GET /api/v1/agent/digest` — personalised deadline bulletin (saved items, registrations, soonest catalogue deadlines).

## Frontend setup

1. Copy [frontend/.env.example](frontend/.env.example) to `frontend/.env` if you need a custom API URL (`VITE_API_URL`, defaults to `http://localhost:8080/api/v1`).
2. From the `frontend` folder, run:

```bash
npm install
npm run dev        # Vite dev server on http://localhost:5173
npm run build      # type-checks (tsc --noEmit) then builds for production
npm run typecheck  # type-check only
npm run preview    # preview the production build
```

Every data view loads live API data with explicit loading, error (with retry), and empty states. Auth uses JWT access + rotating refresh tokens, refreshed automatically once on a `401` before redirecting to login. Role determines the landing portal: learners → dashboard, faculty → researcher console, reps → rep console, admins → CMS. Logged-in users can save items, message faculty/admissions, apply to programmes/scholarships/research, register for webinars, and use the four AI features.

### Theme & design

The frontend is an editorial redesign with two hand-built themes — **Manuscript** (warm-paper light) and **Observatory** (near-black dark) — toggled in the navigation and persisted to `localStorage` (defaults to the system preference). Motion uses GSAP/Motion scroll choreography with Three.js accent scenes; design tokens live in [frontend/src/styles/](frontend/src/styles/). The classic palette from [Project_details.md](Project_details.md) remains the product's reference brand.

## One-command local run

From the workspace root, run:

```bash
python run.py
```

The launcher checks Java (17–21; an unsupported system JDK triggers a portable JDK 17 download), Maven, Node, npm, `.env` files, and MySQL reachability. Missing runtimes are downloaded into `.tools/`, frontend packages are installed when needed, both servers are started, and the browser opens automatically.

## Seeded login credentials

After importing [seed/insightnest_seed.sql](seed/insightnest_seed.sql), use these demo accounts:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@insightnest.com` | `Admin@123` |
| Learner | `nusrat.jahan@insightnest.com` | `Admin@123` |
| Learner | `rafiul.islam@insightnest.com` | `Admin@123` |
| Faculty | `farhan.rahman@insightnest.com` | `Admin@123` |
| Faculty | `sabina.yasmin@insightnest.com` | `Admin@123` |
| Rep | `rep.demo@insightnest.com` | `Admin@123` |

If login returns `500`, restart the backend and confirm `JWT_SECRET` is at least 32 characters. If the seeded emails exist but credentials fail, re-run [seed/reset_demo_passwords.sql](seed/reset_demo_passwords.sql) to reset demo passwords back to `Admin@123`.

## Notes

- One-time admin setup is available at `POST /api/v1/admin/bootstrap` when `BOOTSTRAP_SECRET` is configured and no admin user exists.
- Suspended or disabled accounts cannot log in, refresh tokens, or use existing access tokens.
- Sample data in [seed/insightnest_seed.sql](seed/insightnest_seed.sql) covers users, an international catalogue of universities, programs, scholarships, research projects, resources, forums, and webinars, plus applications, contacts, and FAQs.
- The AI features default to a deterministic heuristic over live data; set `GEMMA_BASE_URL` (default `http://localhost:11434/v1`, Ollama-compatible) and `GEMMA_MODEL` to route them through Gemma 4. See [agents.md](agents.md).
- A few prototype-only controls (third-party connections, 2FA/passkeys, data export, account deletion, admin media delete, faculty exam-template builder) are intentionally device-local and labelled as such in the UI.
- File uploads are stored locally in `storage/` by default (gitignored).
