# InsightNest — Agentic Features (Gemma 4 + Tools)

This document specifies the four agentic features added to InsightNest. Each is an autonomous workflow that wraps existing InsightNest services, designed to be executed by **Gemma 4** (served locally via Ollama/vLLM or a hosted endpoint — configurable via `GEMMA_BASE_URL` + `GEMMA_MODEL`) using **function-calling tools**. The agent runtime lives in the Spring Boot backend as the `com.insightnest.agent` module; the frontend talks to it through `/api/v1/agent/*` endpoints.

> **Implementation status (shipped).** The `agent` module is built behind an `AgentBrain` interface. The default `HeuristicBrain` answers deterministically over the live repositories (token-overlap ranking of programs/scholarships/research/resources, plus deadline aggregation for the digest) — no LLM required, so the platform runs out of the box. When `GEMMA_BASE_URL`/`GEMMA_MODEL` are set, a Gemma-backed brain can replace it without changing controllers or the frontend. Endpoints return **JSON** (the Counsellor and Librarian UIs render a client-side typewriter effect over the returned text); the token-by-token SSE and multi-step tool-call loop below describe the target Gemma design, not the current heuristic. Every call is authenticated and audit-logged as `AGENT_RUN`. The tool tables below are the contract a Gemma brain implements; the heuristic brain calls the same underlying repositories directly.

**Shared rules for all agents**

- Tools are the ONLY way agents touch data — agents never get raw DB access. Every tool call runs under the requesting user's identity and role permissions (a learner's agent cannot read another user's profile).
- Every agent run is recorded in the existing audit-log module (`AGENT_RUN` action, tool-call trace as payload).
- Write-actions (saving items, sending join requests, creating notifications) require either an explicit user confirmation in the UI or are limited to the user's own data.
- All agent responses stream token-by-token over SSE; tool-call steps are surfaced to the UI as status lines ("Searching scholarships…") so the work is visible.
- Max 8 tool calls per run; hard timeout 60s; on failure the UI shows the standard error state with a retry.

---

## Agent 1 — Nest Counsellor (study-path advisor)

**Route:** `/counsellor` · **Endpoint:** `POST /api/v1/agent/counsellor` (SSE)

**Job:** A conversational advisor that interviews the learner about goals (field, level, budget, region, timeline), then searches the live catalogue and recommends concrete programs and scholarships with reasoning, accumulating citations into the UI "Dossier" panel.

**Agentic loop:** read profile → ask/infer missing preferences → iterative tool search (programs ↔ scholarships, refining filters from results) → rank → present with rationale → offer to save shortlisted items.

**Tools (Gemma 4 function declarations):**

| Tool | Signature | Wraps |
|---|---|---|
| `get_my_profile` | `() → {education, interests, gpa, country}` | profile module |
| `search_programs` | `(query?, discipline?, level?, country?, maxTuition?, deadlineAfter?, page?) → paginated program DTOs` | program module |
| `search_scholarships` | `(query?, level?, country?, minAmount?, deadlineAfter?, page?) → paginated scholarship DTOs` | scholarship module |
| `get_university` | `(universityId) → university DTO` | university module |
| `save_item` | `(itemType, itemId) → saved-item DTO` — only after user confirms in UI | saved module |

**Example trace:** user: "I want a funded ML master's in Europe, deadline after August" → `get_my_profile` → `search_programs(discipline="machine learning", level="MSC", country=null, deadlineAfter="2026-08-01")` → `search_scholarships(query="machine learning", level="MSC", minAmount=10000)` → streams a ranked recommendation citing 4 programs + 2 scholarships → user clicks save on two → `save_item` ×2.

---

## Agent 2 — Research Matchmaker

**Route:** `/research/matchmaker` · **Endpoint:** `POST /api/v1/agent/matchmaker` (SSE)

**Job:** Scores every OPEN research project against the learner's profile (skills, interests, education), returns a ranked list with a 0–100 match score and a written "why this matches" rationale per project, and drafts a personalized join-request message on demand.

**Agentic loop:** `get_my_profile` → `list_open_research(page…)` (paginate until exhausted or 50 projects) → for top candidates `get_research_details` → score + rationale generation → on user action `draft_join_request` → user edits → `submit_join_request` (explicit confirm only).

**Tools:**

| Tool | Signature | Wraps |
|---|---|---|
| `get_my_profile` | shared with Agent 1 | profile module |
| `list_open_research` | `(field?, page?) → paginated research DTOs` | research module |
| `get_research_details` | `(projectId) → full DTO incl. requirements, faculty` | research module |
| `draft_join_request` | `(projectId, angle?) → {draftMessage}` — pure generation, no side effect | agent-local |
| `submit_join_request` | `(projectId, message) → join-request DTO` — UI-confirmed only | research join-request workflow |

**Side effects:** a submitted join request flows through the existing event bus, so faculty notifications and audit entries fire exactly as with a manual request.

---

## Agent 3 — Ask the Library (resource librarian)

**Route:** `/resources/librarian` · **Endpoint:** `POST /api/v1/agent/librarian` (SSE)

**Job:** Semantic Q&A over the resource library (PDF/DOC/PPT uploads). Answers questions with numbered citations pointing to specific documents (and page hints when extractable), respecting resource visibility — private resources are only searchable by users allowed to download them.

**Pipeline it owns (background agentic work):** on every resource upload, an ingestion task runs: `extract_text` → chunk → embed (local embedding model) → store vectors. Gemma 4 also **auto-generates a summary and 3–6 topic tags** for each uploaded resource (visible on the resource ledger rows — this replaces manual tagging).

**Tools:**

| Tool | Signature | Wraps |
|---|---|---|
| `semantic_search` | `(query, topK=8) → [{resourceId, chunk, pageHint, score}]` | vector store (visibility-filtered) |
| `get_resource_meta` | `(resourceId) → resource DTO` | resource module |
| `extract_text` | `(resourceId, pageRange?) → text` | storage/text-extraction service |
| `tag_resource` | `(resourceId, summary, tags[]) → updated DTO` — ingestion-time only | resource module |

**Answer contract:** every factual claim must carry a citation `[n]`; if `semantic_search` returns nothing above the score threshold, the agent must say the archive has no answer rather than improvise.

---

## Agent 4 — Deadline Sentinel (proactive digest)

**Route:** `/digest` · **Trigger:** scheduled job (weekly, Mon 07:00 server time) + on-demand `POST /api/v1/agent/sentinel/run` for the current user.

**Job:** For each active user, gathers approaching deadlines (saved programs/scholarships, registered webinars, plus *new* catalogue items matching their profile), prioritizes by urgency and fit, and writes a short personalized weekly digest. Delivered as an in-app notification linking to the `/digest` bulletin page.

**Agentic loop (per user):** `get_saved_items` → `get_upcoming_deadlines` → `search_programs`/`search_scholarships` constrained to the profile for *new-since-last-digest* matches → compose bulletin (urgent / this month / worth a look sections) → `create_notification`.

**Tools:**

| Tool | Signature | Wraps |
|---|---|---|
| `get_saved_items` | `(userId) → saved DTOs with deadline fields` | saved module |
| `get_upcoming_deadlines` | `(userId, withinDays=30) → merged deadline list (applications, webinars)` | program/scholarship/webinar modules |
| `search_programs` / `search_scholarships` | shared with Agent 1, plus `createdAfter` filter | catalogue modules |
| `create_notification` | `(userId, title, body, link) → notification DTO` — own-user only | notification module |

**Idempotency:** one digest per user per ISO week, keyed `SENTINEL-{userId}-{isoWeek}`; reruns replace, never duplicate, the notification.

---

## Configuration & ops summary

| Env var | Purpose | Default |
|---|---|---|
| `GEMMA_BASE_URL` | OpenAI-compatible endpoint serving Gemma 4 | `http://localhost:11434/v1` (Ollama) |
| `GEMMA_MODEL` | model id | `gemma-4` |
| `AGENT_MAX_TOOL_CALLS` | loop cap per run | `8` |
| `AGENT_TIMEOUT_SECONDS` | hard run timeout | `60` |
| `EMBEDDING_MODEL` | librarian embeddings | local sentence-transformer |

Frontend integration points (built in design Step 8 with mocked streams): SSE client, tool-status line rendering, confirm-before-write modals, and the four page UIs specified in design-instructions.md §9.
