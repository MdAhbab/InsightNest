# InsightNest

InsightNest is an academic opportunity platform for learners, faculty, and admins. This workspace contains a Spring Boot API and a React (Vite) frontend.

## Workspace layout

- backend: Spring Boot 3 API (Java 17, MySQL, JWT)
- frontend: React + TypeScript UI

## Backend setup

1. Create a MySQL database named `insightnest`.
2. Copy [backend/.env.example](backend/.env.example) to `backend/.env` and update credentials.
3. From the backend folder, run:

```bash
mvn spring-boot:run
```

The API runs on `http://localhost:8080` and Swagger UI is available at `http://localhost:8080/swagger-ui/index.html`.

## Frontend setup

1. Copy [frontend/.env.example](frontend/.env.example) to `frontend/.env` if you need a custom API URL.
2. From the frontend folder, run:

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

## One-command local run

From the workspace root, run:

```bash
python run.py
```

The launcher checks Java, Maven, Node, npm, `.env` files, and MySQL reachability. Missing Java/Maven/Node runtimes are downloaded into `.tools/`, frontend packages are installed when needed, both servers are started, and the browser opens automatically.

## Seeded login credentials

After importing [seed/insightnest_seed.sql](seed/insightnest_seed.sql), use these demo accounts:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@insightnest.com` | `Admin@123` |
| Learner | `nusrat.jahan@insightnest.com` | `Admin@123` |
| Learner | `rafiul.islam@insightnest.com` | `Admin@123` |
| Faculty | `farhan.rahman@insightnest.com` | `Admin@123` |
| Faculty | `sabina.yasmin@insightnest.com` | `Admin@123` |

If login returns `500`, restart the backend and confirm `JWT_SECRET` is at least 32 characters. The dev `.env` and default config already use a valid local secret.
If the seeded emails exist but still say bad credentials, re-run [seed/reset_demo_passwords.sql](seed/reset_demo_passwords.sql) or the full seed file to reset demo passwords back to `Admin@123`.

## Notes

- One-time admin setup is available at `POST /api/admin/bootstrap` when `BOOTSTRAP_SECRET` is configured and no admin user exists.
- Bangladesh-focused sample data is available in [seed/insightnest_seed.sql](seed/insightnest_seed.sql). It includes admin, learner, faculty, university, program, scholarship, application, research, resource, forum, webinar, contact, and FAQ records.
- File uploads are stored locally in `storage/` by default.
