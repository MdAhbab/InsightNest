# InsightNest — Production-Readiness & Agentic Integration Plan

> Author: senior engineering pass. Status snapshot date: **2026-06-15**.
> This plan is the source of truth for the remaining work. Each task carries a short
> **briefing** (what + why) so it can be picked up without re-deriving context.
> Checkboxes track progress; do not delete completed items — strike-through or check them.

---

## 0. Executive Summary

InsightNest is **much further along than a greenfield project**. Contrary to a "lots of
missing pages" assumption, the audit shows:

- **Frontend:** all 31 pages exist and are wired through a custom hash router with auth +
  role guards. Typed API client (`endpoints.ts`) fully mirrors the backend contract. Two
  hand-built themes, loading/empty/error states present in the data views sampled.
- **Backend:** every documented feature module is present (auth, user, profile, university,
  program, scholarship, application, research, resource, forum, webinar, contact, faq,
  notification, audit, saved, messaging, admin, agent) with Controller→Service→Repository→DTO
  layering and an event-driven notification/audit bus.
- **Seed:** real volume — 20 universities, 18 programs, 14 scholarships, 9 research projects,
  8 webinars, 8 forum threads, 7 users.

**The single biggest gap is exactly the one called out by the stakeholder: the agentic LLM
layer is specified but never implemented.** `agents.md` promises a Gemma-pluggable brain; the
code ships only a deterministic `HeuristicBrain`. `AgentConfig` reads `agent.gemma.*`
properties, but **no class consumes `AgentConfig`** — `isGemmaEnabled()` is dead code, there
is no `GemmaBrain`, and there is no HTTP/LLM client of any kind in the backend. `run.py` has
no awareness of Ollama. The default model id is stale (`gemma-3b`).

Therefore this plan front-loads two things the stakeholder explicitly asked for:
1. **Make the agentic features actually run on the local Ollama `gemma` model, with
   ChatGPT/Gemini API fallbacks**, while never breaking the out-of-the-box experience.
2. **Verify every stakeholder dashboard (Learner, Faculty, Rep, Admin) is 100% working**,
   fixing whatever the verification pass turns up.

---

## 1. Architecture & Documentation Analysis (done)

| Source | Key takeaways |
|---|---|
| `Project_details.md` | The canonical spec: roles, permission matrix, page requirements, full normalized MySQL schema, REST plan under `/api/v1`, validation rules, seed requirements. |
| `agents.md` | Four agents (Counsellor, Matchmaker, Librarian, Sentinel). Crucially states the shipped default is `HeuristicBrain`; a Gemma brain "can replace it without changing controllers or the frontend." SSE token streaming + multi-step tool-call loop are described as the **target Gemma design, not the current state**. |
| `README.md` | Confirms 4 roles (`LEARNER`, `FACULTY`, `UNIVERSITY_REP`, `ADMIN`), JSON agent endpoints with client-side typewriter, env conventions, seed logins (all `Admin@123`). |

### Architecture drift noted (not necessarily bugs)
- **Schema drift:** runtime JPA entities diverge from the `Project_details.md` SQL (e.g.
  scholarships carry `funder/region/level/amount/currency`; research projects carry
  `field/tags/requiredSkills`; learner profile uses `educationHistory/cgpa` as strings;
  table names like `contact_requests`, join table `user_roles`). **The JPA entities + the
  seed SQL are the source of truth now**; the markdown schema is historical. Do not "fix"
  entities to match the old SQL.
- **Roles:** spec listed 3 roles; implementation has a 4th (`UNIVERSITY_REP` / "Rep"). The
  Rep portal (`/rep`) and console exist. Treat 4 roles as canonical.
- **Agent transport:** spec/agents.md aspire to SSE; implementation is plain JSON +
  front-end typewriter. This is acceptable for MVP; SSE is an optional enhancement (§6.6).

---

## 2. Completeness & Flow Audit

### 2.1 Backend gaps (ranked)

- [ ] **A1 — Gemma/LLM brain is unimplemented (CRITICAL, the headline ask).**
  Only `HeuristicBrain` is a bean. `AgentConfig` is never injected. There is no LLM client,
  no provider fallback, no `GemmaBrain`. *Why it matters:* the platform's marquee "AI
  advisory" features are keyword-overlap heuristics, not the promised Gemma agents. Full
  design in **§6**.

- [ ] **A2 — Agent config plumbing is incomplete.** `application.yml` has no `agent.*` block;
  `.env.example` has no LLM vars; default model `gemma-3b` is wrong for the user's Ollama
  `gemma` install. *Why:* even if a brain existed, it could not be configured. Fixed as part
  of §6.

- [ ] **A3 — Deadline Sentinel has no scheduled job and never writes notifications.**
  `agents.md` specifies a weekly Mon 07:00 job that calls `create_notification`
  (idempotency key `SENTINEL-{userId}-{isoWeek}`). Only the on-demand `GET /agent/digest`
  exists. *Why:* "proactive digest" is currently not proactive. (Medium priority — see §6.5.)

- [ ] **A4 — Librarian semantic pipeline is heuristic-only.** No text extraction, no
  embeddings/vector store, no upload-time auto-summary/tagging. *Why:* acceptable for now —
  the LLM brain will narrate over the existing token-overlap retrieval and still cite real
  resources. True embeddings are a **future** item (§9), not blocking.

- [ ] **A5 — Matchmaker `draft_join_request` is absent.** agents.md describes the agent
  drafting a personalized join message; submission already works via the research
  join-request workflow. *Why:* a nice-to-have that the LLM brain makes trivial (§6.4).

- [ ] **A6 — Verify endpoint/role coverage end-to-end.** Confirm every function in
  `frontend/src/app/api/endpoints.ts` has a matching backend route + role guard, and that
  the `SecurityConfig` matchers agree with `@PreAuthorize`. *Why:* API mismatches are the
  most common cause of "dead" dashboard buttons. (Verification task, §4.)

### 2.2 Frontend gaps (ranked)

- [ ] **F1 — Dashboard behavioral verification (CRITICAL ask).** All four portals
  (`Dashboard.tsx` learner, `Researcher.tsx` faculty, `UniversityRep.tsx` rep, `Admin.tsx`)
  render, but the stakeholder wants **every feature working**. Needs a click-through pass per
  role against the live API to catch broken loads, no-op buttons, and unhandled errors.
  Sub-checklist in **§5**.
- [ ] **F2 — Agent pages must reflect the new LLM brain.** `Counsellor.tsx`, `Matchmaker.tsx`,
  `Librarian.tsx`, `Digest.tsx` already render citations + a typewriter effect over JSON. They
  should keep working unchanged when the brain swaps to Gemma; verify the response shapes
  (`reply/citations`, `answer/sources`, score/rationale, urgent/approaching/webinars) are
  preserved by `GemmaBrain`. Add a subtle "answered by Gemma / heuristic" indicator (optional).
- [ ] **F3 — Prototype-only controls.** README lists intentionally device-local controls (2FA,
  data export, account deletion, third-party connections, exam-template builder, the
  WebinarDetail "question for the speaker" box has no handler). *Why:* these are labelled
  prototypes — confirm each is clearly labelled and does not look like a broken real feature.
- [ ] **F4 — Unhandled-promise / race-condition sweep.** Check async effects for missing
  `catch`, missing abort on unmount, and double-submit guards on apply/save/register actions.

### 2.3 Flow / logic checks
- [ ] Auth: register → role-correct landing (`roleHome`), `401` → single refresh → redirect.
- [ ] Apply flows: profile-completeness gate, duplicate-application 409 surfaced to UI.
- [ ] Research: join-request → faculty notification → approve/reject → member visibility.
- [ ] Webinar: register/cancel, capacity + post-start blocking surfaced.
- [ ] Saved items + notifications + messaging round-trips per role.

---

## 3. Data Seeding Strategy

**Goal:** seed data diverse enough to exercise all four agents and every dashboard, while
remaining repeatable and idempotent.

**Corrected assessment (after row-level inspection).** The seed is actually well-populated —
the earlier "≈1 row each" reading was an artifact of counting multi-row INSERT *statements*.
Real volume: **10 diverse resources**, **all 3 learner profiles**, **2 faculty profiles**,
plus program/scholarship applications, research join-requests, webinar registrations, forums
and FAQs. So Librarian, Matchmaker and Counsellor already have rich grounding data. The only
genuine gap was `saved_items` (**0 rows**).

### Tasks
- [x] **S1 — Resources** — already ≥10 across fields (Earth Sciences, Applications, Funding,
  Economics, Philosophy of Education, Admissions, …). No action needed.
- [x] **S2 — Learner profiles** — already present for all three learners (Nusrat, Rafiul,
  Tanjila) with rich education/projects/bio/hobbies text. No action needed.
- [x] **S3 — Saved items** — **added** (14 rows across the 3 learners: programmes,
  scholarships, universities, webinars, research projects), deleted-then-inserted so the
  seed stays idempotent. This populates the learner dashboard saved shelf and the Digest
  "saved" path. *(Webinar registrations and a spread of applications already existed in the
  seed.)*
- [ ] **S4 — Ensure near-future deadlines exist** (programs + scholarships within 30 / 90 days
  of the snapshot date) so Counsellor `deadlineAfter` filters and the Digest urgent/approaching
  buckets populate.
- [ ] **S5 — Keep the seed idempotent & repeatable.** Verify `insightnest_seed.sql` can be
  re-imported cleanly (or document the drop/recreate path in `run.py`); keep
  `reset_demo_passwords.sql` aligned. *Why:* local dev must be one command.
- [ ] **S6 — Validate FK/enariums against current JPA entities** (not the legacy markdown
  schema) before importing, to avoid import failures.

---

## 4. API ↔ Frontend Contract Verification

- [ ] **V1 — Generate the live route list** (`mvn` run + Swagger at
  `/swagger-ui/index.html`) and diff against `endpoints.ts`. Confirm paths, verbs, request
  bodies, and pagination envelope (`{content, page:{...}}`).
- [ ] **V2 — Role-guard parity:** every `@PreAuthorize` must be reachable by the role the UI
  assumes; every protected UI action must hit an endpoint that permits that role.
- [ ] **V3 — Error contract:** confirm 400/401/403/404/409/413 produce the standard shape and
  that the client surfaces `message` (and `errors` map) to toasts/inline validation.

---

## 5. Dashboard Verification Checklist ("100% working" gate)

Run each as the seeded demo user; every row must load live data and every button must do
something real (or be explicitly labelled prototype).

**Learner (`/dashboard`, `nusrat.jahan@insightnest.com`)**
- [ ] Profile completion + edit profile round-trip
- [ ] Program applications list + status + withdraw
- [ ] Scholarship applications list + status + withdraw
- [ ] Research join-request tracking
- [ ] Saved items render + unsave
- [ ] Webinar registrations + cancel
- [ ] Notifications list + mark read / read-all
- [ ] Counsellor / Matchmaker / Librarian / Digest reachable and answering

**Faculty (`/researcher`, `farhan.rahman@insightnest.com`)**
- [ ] Faculty profile edit round-trip
- [ ] Create / edit / open-close research project
- [ ] Review (approve/reject) inbound join requests → learner notified
- [ ] Upload resource (PDF/DOC… ≤20MB) + download
- [ ] Create / manage webinar + registrations
- [ ] Forums post/comment

**Rep (`/rep`, `rep.demo@insightnest.com`)**
- [ ] University/program management within rep scope
- [ ] Scholarship management
- [ ] Webinar / open-day management
- [ ] Contact/inbox reply flow

**Admin (`/admin`, `admin@insightnest.com`)**
- [ ] Stats dashboard counts correct
- [ ] User management (suspend/reactivate)
- [ ] University / program / scholarship CRUD + archive
- [ ] Program + scholarship application review queues
- [ ] Research / resource / forum moderation
- [ ] Webinar management, FAQ CRUD, contact resolution
- [ ] Audit logs (incl. `AGENT_RUN`) render

---

## 6. Agentic LLM Integration — Detailed Design (the headline work)

**Objective:** route the four agents through the local Ollama `gemma` model, with
**OpenAI (ChatGPT) and Gemini API fallbacks**, and a final **heuristic fallback** so the app
never dead-ends. Preserve existing JSON response contracts so the frontend needs no rewrite.

**Design principle — grounded narration, not blind generation.** Keep `HeuristicBrain`'s
repository retrieval as the *tool layer* (it already does program/scholarship/research/resource
retrieval + deadline aggregation). The LLM's job is to **reason over the retrieved, real data
and write the prose / rationale / ranking**, while citations and scores stay grounded in
actual DB rows. This is robust on a small local model and structurally prevents hallucinated
programs/scholarships/resources.

### 6.1 Provider abstraction
- [ ] **G1 — `ChatModel` interface** in `com.insightnest.agent.llm`:
  `String complete(ChatRequest)` and (optional later) `Stream<String> stream(...)`.
- [ ] **G2 — `OllamaChatModel`** (primary): POST to `${ollama.base-url}/api/chat`
  (or the OpenAI-compatible `/v1/chat/completions`) with model `${ollama.model}`. Use
  `java.net.http.HttpClient` (no new heavy deps) with per-call timeout `AGENT_TIMEOUT_SECONDS`.
- [ ] **G3 — `OpenAiChatModel`** (fallback): `https://api.openai.com/v1/chat/completions`,
  bearer `OPENAI_API_KEY`, model `OPENAI_MODEL` (default `gpt-4o-mini`).
- [ ] **G4 — `GeminiChatModel`** (fallback): Google Generative Language
  `:generateContent`, key `GEMINI_API_KEY`, model `GEMINI_MODEL` (default `gemini-2.0-flash`).
- [ ] **G5 — `ResilientChatModel`**: tries providers in `AGENT_LLM_PROVIDERS` order
  (default `ollama,openai,gemini`); on exception/timeout/empty, advances; logs which provider
  served the call. Skips providers with no key/base-url configured.

### 6.2 Brain wiring
- [ ] **G6 — `GemmaBrain implements AgentBrain`**, constructed with the existing repositories
  (reuse retrieval) + `ResilientChatModel` + a reference to `HeuristicBrain` as the **last-resort
  fallback**. For each method: retrieve grounded candidates → build a compact prompt → call LLM →
  parse/wrap into the existing DTOs (`CounsellorResponse`, `List<MatchmakerItem>`,
  `LibrarianResponse`, `DigestResponse`). If the LLM layer fails entirely, return
  `heuristicBrain.<method>(...)`.
- [ ] **G7 — Bean selection without breaking defaults.** Make `GemmaBrain` the `@Primary`
  `AgentBrain` only when `agent.llm.enabled=true` (use `@ConditionalOnProperty`); otherwise the
  existing `HeuristicBrain` remains the sole bean. `AgentService` keeps injecting `AgentBrain`
  unchanged. *Why:* zero-config installs still run heuristically (per agents.md promise);
  enabling the LLM is a single flag.

### 6.3 Configuration & secrets
- [ ] **G8 — `application.yml` `agent` block:**
  ```yaml
  agent:
    llm:
      enabled: ${AGENT_LLM_ENABLED:false}
      providers: ${AGENT_LLM_PROVIDERS:ollama,openai,gemini}
      max-tool-calls: ${AGENT_MAX_TOOL_CALLS:8}
      timeout-seconds: ${AGENT_TIMEOUT_SECONDS:60}
    ollama:
      base-url: ${OLLAMA_BASE_URL:http://localhost:11434}
      model: ${OLLAMA_MODEL:gemma3}        # set to the EXACT local tag, see G10
    openai:
      api-key: ${OPENAI_API_KEY:}
      model: ${OPENAI_MODEL:gpt-4o-mini}
    gemini:
      api-key: ${GEMINI_API_KEY:}
      model: ${GEMINI_MODEL:gemini-2.0-flash}
  ```
  Replaces the stale `agent.gemma.*` keys (keep `AgentConfig` mapping the new keys, or retire it).
- [ ] **G9 — Secrets hygiene.** Real keys go only in `backend/.env` (gitignored). Add blank
  placeholders + comments to `backend/.env.example`. **Never commit keys.**
- [ ] **G10 — Confirm the exact Ollama tag.** Stakeholder says "gemma4". Ollama publishes
  `gemma`, `gemma2`, `gemma3` (no `gemma4` tag as of this writing). Run `ollama list` and set
  `OLLAMA_MODEL` to the exact installed tag during setup. (Open question — see §10.)

### 6.4 Per-agent prompt contracts
- [ ] **G11 — Counsellor:** input message + profile + top retrieved programs/scholarships →
  LLM writes advice; **citations array is built from the retrieved rows, not the LLM** (the LLM
  may only reference them by the titles we pass). Keep `{reply, citations}`.
- [ ] **G12 — Matchmaker:** profile + open projects → LLM produces a 0–100 score + 1–2 sentence
  rationale per project; clamp/sanitize scores; preserve `{project, score, rationale}` and sort.
- [ ] **G13 — Librarian:** question + top token-matched resources → LLM answers **only from the
  provided chunks**, every claim cited `[n]`; if nothing retrieved, say the archive has no answer
  (no improvisation). Keep `{answer, sources}`.
- [ ] **G14 — Digest:** reuse the heuristic deadline aggregation; LLM writes the short personal
  summary text; keep `{generatedAt, urgent, approaching, webinars}`.
- [ ] **G15 — (optional) Matchmaker draft message (A5):** add `draft_join_request`-style helper
  used by the UI before submit; pure generation, no side effect.

### 6.5 Deadline Sentinel proactivity (A3, medium)
- [ ] **G16 — Scheduled weekly job** (`@Scheduled`, Mon 07:00 server time) iterating active
  users → compute digest → `create_notification` with idempotency key
  `SENTINEL-{userId}-{isoWeek}` (replace, never duplicate). Gate behind a config flag so it's
  off by default in dev.

### 6.6 Optional: SSE streaming (enhancement, not MVP)
- [ ] **G17 — SSE endpoints + tool-status lines** to match agents.md's target UX. Deferred;
  the existing client-side typewriter over JSON is sufficient to ship.

### 6.7 Launcher support
- [ ] **G18 — `run.py`:** detect Ollama reachability at `OLLAMA_BASE_URL`; if `AGENT_LLM_ENABLED`
  and Ollama is down, warn (don't fail — heuristic fallback covers it). Surface the chosen
  model/provider in startup output.

---

## 7. UI/UX & Reliability Audit (post-implementation)

- [ ] Visual consistency: typography scale, spacing rhythm, status-color usage across new/edited
  surfaces (deep blue / green / gold / red / cyan per spec §3).
- [ ] Every async view: explicit loading, empty, and error+retry states (spot-check agent pages
  under a forced provider failure → must degrade to heuristic gracefully).
- [ ] Keyboard focus states + form labels on agent inputs and any new controls.
- [ ] Mobile/tablet/desktop check on the four agent pages and any touched dashboard panels.
- [ ] Double-submit guards on Counsellor/Librarian send and Matchmaker run.

---

## 8. Execution Strategy (phased, prioritized)

> Each phase ends with a build/typecheck + a focused manual check, then a modular commit.
> No "Generated with AI" / "Co-authored-by" trailers in commits or code.

**Phase 1 — Critical logical/flow fixes & contract verification**
- V1–V3 (§4), F4 unhandled-promise sweep, any broken routes/guards found.

**Phase 2 — Data seeding (unblocks everything else)**
- S1–S6 (§3). Re-import, confirm dashboards + agents have data to chew on.

**Phase 3 — Agentic LLM integration (headline)**
- G1–G14 (§6.1–6.4): provider abstraction, `GemmaBrain`, config, secrets, per-agent prompts.
- Verify all four agents answer via Ollama, fall back to OpenAI/Gemini on failure, and to the
  heuristic if all LLMs are unreachable. F2 (§2.2) frontend verification.

**Phase 4 — Dashboard completeness pass**
- F1 + the §5 per-role checklist; fix whatever is broken or no-op.

**Phase 5 — Proactive Sentinel + optional polish**
- G16 (scheduled digest), G15 (draft message), G18 (launcher), then §7 UI/UX audit.
- Optional: G17 SSE streaming.

**Phase 6 — Final audit, cleanup, commit & push**
- §10 production-readiness review; remove dead code (e.g. retire stale `agent.gemma.*` /
  `AgentConfig` if superseded); modular commits; push.

---

## 9. Out of Scope / Future (explicitly deferred)
- True semantic embeddings + vector store + upload-time text extraction for Librarian (A4).
- Job board, academic-loan and textbook-loan workflows (spec Phase 2).
- Gamification, newsfeed, advanced analytics, publisher partnerships (spec Future).
- Real email delivery for notifications (in-app only for now).

---

## 10. Open Questions / Decisions Needed
1. **Exact Ollama model tag** for "gemma4" — confirm via `ollama list` and set `OLLAMA_MODEL`
   (Ollama ships `gemma`/`gemma2`/`gemma3`, not `gemma4`). *(blocks G10)*
2. **Which fallback provider(s) to actually wire keys for** — OpenAI, Gemini, or both? Keys must
   be supplied by the stakeholder into `backend/.env` (never committed).
3. **Turn the LLM on by default in dev?** Recommended: `AGENT_LLM_ENABLED=true` locally,
   `false` in the committed default so a fresh clone still runs without Ollama.
4. **SSE streaming now or later?** Recommended later (current typewriter UX is sufficient).

---

## 11. Final Production-Readiness Review (run at the end)
- [ ] Hidden bugs / logical flow errors across the touched paths.
- [ ] Seed edge cases (idempotent re-import, FK integrity, near-future deadline coverage).
- [ ] UI inconsistencies on new/edited surfaces.
- [ ] Agent reliability: Ollama up, Ollama down→OpenAI, all LLMs down→heuristic; timeouts;
      empty-corpus Librarian; no-profile Matchmaker.
- [ ] `mvn test` + frontend `npm run build` (typecheck) green.
- [ ] No secrets committed; clean, modular git history; pushed.

---

## 12. Implementation Progress & Verification (live log)

**Branch:** `feat/agentic-llm-integration` (3 modular commits; not pushed — awaiting review).

**Phase 3 — Agentic LLM integration: DONE & VERIFIED END-TO-END.**
- Built `com.insightnest.agent.llm` (ChatModel + Ollama/OpenAI/Gemini providers over JDK
  HttpClient + `ResilientChatModel` fallback chain) and `GemmaBrain` (grounded narration over
  `HeuristicBrain` retrieval, `@Primary` + `@ConditionalOnProperty agent.llm.enabled`).
  Config via `AgentLlmProperties` + `application.yml` `agent` block; env documented; stale
  `AgentConfig` retired. Local model confirmed: **`gemma4:e4b`** (`qwen3.5:4b` also available).
- Verified: `mvn compile` green; live Ollama `/api/chat` round-trip; backend boots with
  `GemmaBrain active` logged (context wiring correct, no bean conflicts).
- Verified end-to-end via the live API (logged in as the seeded learner):
  - **Counsellor** → personalised, profile-grounded advice citing real programmes +
    scholarships (5 citations), asked a clarifying question, no hallucination.
  - **Matchmaker** → score + LLM rationale grounded in the learner's actual projects
    (the `n| rationale` parse path works).
  - **Librarian** → grounded answer; correctly *refused* when retrieval was weak (no improvising).
- Fallback chain proven by design: providers tried in order, then heuristic if all fail, so
  endpoints never hard-fail. OpenAI/Gemini activate when their keys are added to `backend/.env`.

**Phase 2 — Seeding: DONE** (`saved_items` added; resources/profiles already rich — see §3).

### Known data-state action (not a code issue)
- The **running MySQL DB holds a stale partial seed (3 resources vs the 10 in
  `seed/insightnest_seed.sql`)**, and the new `saved_items` aren't loaded yet. Re-import to
  fix — this makes the Librarian cite the full corpus (incl. the SOP guide) and populates the
  dashboard saved shelf + Digest saved path:
  ```bash
  mysql -u root -proot insightnest < seed/insightnest_seed.sql
  ```

### Still open (per phases 1, 4, 5)
- Full dashboard click-through per role (§5) — backend boots and core endpoints return 200;
  per-feature UI verification not yet run.
- Proactive Sentinel scheduled job (A3/G16), optional draft-join-request (A5/G15),
  launcher Ollama awareness (G18), SSE streaming (G17, optional).
- Push after review.
