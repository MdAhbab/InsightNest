# InsightNest

InsightNest is an academic opportunity platform for learners, faculty, and admins: university and program discovery, program and scholarship applications, research collaboration, a resource library, community forums, webinars, saved items, and in-app notifications.

## Architecture

| Layer | Stack |
| --- | --- |
| Frontend | React 18 + TypeScript + Vite, React Router, Axios |
| Backend | Spring Boot 3 (Java 17), Spring Security (JWT), Spring Data JPA |
| Database | MySQL 8 |
| File storage | Local `storage/` directory (configurable via `STORAGE_PATH`) |

Repository layout:

- [backend/](backend/) — Spring Boot API (`com.insightnest.*` feature modules: auth, user, profile, university, program, scholarship, research, resource, forum, webinar, contact, faq, notification, audit, saved, admin)
- [frontend/](frontend/) — React UI (pages, shared components, API client, auth context)
- [seed/](seed/) — MySQL seed data (tracked in git on purpose; do not gitignore)
- [run.py](run.py) — one-command local launcher
- [Project_details.md](Project_details.md) — full product specification

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

- `GET/PATCH/POST /api/v1/notifications`, `/{id}/read`, `/read-all` — per-user notifications, emitted on application reviews and research join-request activity.
- `GET/POST/DELETE /api/v1/saved-items` — save universities, programs, scholarships, research projects, or webinars.
- `GET /api/v1/admin/audit-logs` (admin) — audit trail of logins, registrations, admin CRUD, application reviews, and uploads.

## Frontend setup

1. Copy [frontend/.env.example](frontend/.env.example) to `frontend/.env` if you need a custom API URL (`VITE_API_URL`, defaults to `http://localhost:8080/api/v1`).
2. From the `frontend` folder, run:

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173`. Routes are code-split (lazy-loaded) and all data pages load live API data with explicit loading, error, and empty states. Expired access tokens are refreshed automatically once before redirecting to login. Logged-in users can save items from the directory pages and see notifications plus saved-item summaries on the dashboard.

### Theme

The UI follows the palette defined in [Project_details.md](Project_details.md): Deep Blue `#2B3A67` (navigation, primary actions), Soft White `#F9FAFB` (backgrounds), Vibrant Green `#3CB371` (success states), Golden Yellow `#F9A825` (highlights), Steel Grey `#6C757D` (secondary text), Crisp Red `#E13946` (errors), Cool Cyan `#00BFFF` (focus states). Tokens live in [frontend/src/styles/theme.css](frontend/src/styles/theme.css).

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

If login returns `500`, restart the backend and confirm `JWT_SECRET` is at least 32 characters. If the seeded emails exist but credentials fail, re-run [seed/reset_demo_passwords.sql](seed/reset_demo_passwords.sql) to reset demo passwords back to `Admin@123`.

## Notes

- One-time admin setup is available at `POST /api/v1/admin/bootstrap` when `BOOTSTRAP_SECRET` is configured and no admin user exists.
- Suspended or disabled accounts cannot log in, refresh tokens, or use existing access tokens.
- Bangladesh-focused sample data lives in [seed/insightnest_seed.sql](seed/insightnest_seed.sql), covering users, universities, programs, scholarships, applications, research, resources, forums, webinars, contacts, and FAQs.
- File uploads are stored locally in `storage/` by default (gitignored).
