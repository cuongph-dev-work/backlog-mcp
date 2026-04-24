# CLAUDE.md — Instructions for Claude Code

> Read this file in full before working on this project.
> This is the canonical instruction set for Claude when working on `backlog-mcp`.

---

## Project Overview

`backlog-mcp` is a TypeScript MCP (Model Context Protocol) server providing AI agents with read access to a Backlog (Nulab) space. Authentication uses a static **API Key** in `.env` — no browser or OAuth required.

**Stack:** TypeScript (strict, ESM/NodeNext), Express, `@modelcontextprotocol/sdk`, Axios, Zod, Vitest.

---

## Architecture Rules

1. **Factory pattern per request.** Each MCP request creates a new `McpServer` + `StreamableHTTPServerTransport`. Never reuse across requests.
2. **Auth is a config concern.** `BacklogHttpClient` receives `apiKey` from `config` at construction. Tool handlers never handle auth directly.
3. **HTTP via `BacklogHttpClient`.** All Backlog REST API calls go through `src/backlog/http-client.ts` (Axios). API Key auto-appended via `axios.create({ params: { apiKey } })`.
4. **Zod validates everything.** Env vars (`src/config.ts`) and tool inputs (schema in each tool file) are Zod-validated before use.
5. **Two-layer type system.**
   - `src/types/backlog-api.ts` — raw Backlog REST response shapes (used only in `http-client.ts` and `mappers.ts`)
   - `src/types.ts` — normalized domain interfaces (used everywhere else)
   - `src/backlog/mappers.ts` — bridges raw → domain

---

## Coding Standards

- **No `any`.** TypeScript strict mode. All types must be explicit.
- **ESM `.js` extensions.** Every import: `import "./foo.js"` not `"./foo"`.
- **`McpError` for all errors.** Use factory helpers from `src/errors.ts`. Never `throw new Error(...)` for business logic.
- **`isError: true` on error responses.** MCP clients depend on this flag — never return errors as normal content.
- **401/403 = invalid API key.** `assertOk()` in the HTTP client handles this; tool handlers just `catch (McpError)`.
- **Shared helpers → `src/utils.ts`.** Date formatting, string manipulation, etc. go there — not inline in handlers.
- **Prefer npm packages over hand-rolled code.** Use established libraries for common tasks.
- **Raw types stay in `backlog-api.ts`.** Never leak raw Backlog API shapes into tool handlers.

---

## File Layout

| Area | Path | Notes |
|------|------|-------|
| Server entry | `src/server.ts` | Factory + tool registration |
| Tool handlers | `src/tools/*.ts` | One file per tool |
| Tool docs | `docs/tools/*.md` | Required for every tool |
| HTTP layer | `src/backlog/` | `endpoints.ts`, `mappers.ts`, `http-client.ts` |
| Tests | `src/tests/` | Vitest, `vi.mock()` at top level |
| Config | `src/config.ts` | Zod env schema |
| Domain types | `src/types.ts` | Normalized interfaces |
| Raw API types | `src/types/backlog-api.ts` | Backlog REST response shapes |
| Errors | `src/errors.ts` | `McpError` class + factory helpers |
| Utilities | `src/utils.ts` | Shared helpers |

---

## Testing & Verification

```bash
# After EVERY code change:
npx tsc --noEmit

# Before every commit:
npx vitest run
```

- Use `vi.mock()` at the **top level** of test files (Vitest hoists them).
- Set per-test mock behavior with `.mockImplementation()`.
- Keep `vi.mock()` factories self-contained — no references to outer-scope variables.

---

## Documentation Requirements

Every tool **must** have `docs/tools/<tool_name>.md` containing:
- **When to Use** — intended use case
- **Input** — parameter table (name, type, required, default, description)
- **Output** — format description + example
- **Error Cases** — table of error codes and causes
- **Examples** — at least 1 request + expected output

Keep docs in sync with the Zod schema — any added/removed param must be reflected.

---

## Available MCP Tools

### `backlog_get_issue_list`
- **Purpose:** Fetch a list of Backlog issues with optional filters.
- **Key inputs:** `projectId[]`, `statusId[]`, `priorityId[]`, `assigneeId[]`, `categoryId[]`, `milestoneId[]`, `keyword`, `count`, `offset`, `sort`, `order`
- **Output:** Markdown table + detailed summaries per issue.
- **Docs:** `docs/tools/backlog_get_issue_list.md`

### `backlog_get_issue`
- **Purpose:** Fetch full details for one issue by key or numeric ID.
- **Input:** `{ issueIdOrKey: string }` — e.g. `BLG-123` or `12345`.
- **Output:** Markdown with summary, description, status, priority, type, assignee, reporter, dates, hours, URL.
- **Docs:** `docs/tools/backlog_get_issue.md`

### `backlog_get_comments`
- **Purpose:** Fetch comments for an issue, including changelog (field change history).
- **Input:** `{ issueIdOrKey: string, count?, order?, minId?, maxId? }`
- **Output:** Markdown list of comments with author, date, text, and field changes.
- **Docs:** `docs/tools/backlog_get_comments.md`

### `backlog_get_statuses`
- **Purpose:** Fetch all statuses defined for a project. Use IDs to filter `backlog_get_issue_list`.
- **Input:** `{ projectIdOrKey: string }`
- **Output:** Markdown table with ID, name, color per status.
- **Docs:** `docs/tools/backlog_get_statuses.md`

### `backlog_get_priorities`
- **Purpose:** Fetch global issue priorities (space-wide, not project-specific). Use IDs to filter `backlog_get_issue_list`.
- **Input:** _(none)_
- **Output:** Markdown table with ID and name per priority.
- **Docs:** `docs/tools/backlog_get_priorities.md`

### `backlog_get_categories`
- **Purpose:** Fetch all categories defined for a project. Use IDs to filter `backlog_get_issue_list`.
- **Input:** `{ projectIdOrKey: string }`
- **Output:** Markdown table with ID and name per category.
- **Docs:** `docs/tools/backlog_get_categories.md`

### `backlog_get_milestones`
- **Purpose:** Fetch milestones (versions) for a project. Use IDs to filter `backlog_get_issue_list`.
- **Input:** `{ projectIdOrKey: string, archived?: boolean }` — `archived` defaults to `false` (active only).
- **Output:** Markdown table with ID, name, start date, due date, archived flag.
- **Docs:** `docs/tools/backlog_get_milestones.md`

---

## Adding a New Tool — Checklist

1. `src/types/backlog-api.ts` — add raw API response type(s) if needed.
2. `src/types.ts` — add normalized domain type(s).
3. `src/backlog/endpoints.ts` — add URL builder function(s).
4. `src/backlog/mappers.ts` — add mapper(s): raw → domain.
5. `src/backlog/http-client.ts` — add method(s) to `BacklogHttpClient`.
6. `src/tools/<name>.ts` — export Zod schema + async handler.
   - Handler signature: `async function handle<Name>(rawInput: unknown, cfg: Config): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }>`
   - Success: `{ content: [{ type: "text", text }] }`
   - Error: `{ content: [...], isError: true }`
7. `src/server.ts` — register tool in `createMcpServer()`.
8. `docs/tools/<tool_name>.md` — write tool documentation.
9. `src/tests/<name>.test.ts` — add tests (schema validation + error propagation).
10. `README.md` + `AGENTS.md` + `CLAUDE.md` — update tool lists.
11. Run: `npx tsc --noEmit && npx vitest run`.

---

## Common Pitfalls

| ❌ Mistake | ✅ Correct Approach |
|------------|---------------------|
| Reusing a single `McpServer` across requests | Create a new one per request (factory pattern) |
| Returning errors as normal `content` | Always set `isError: true` |
| `import "./foo"` without `.js` | Must be `import "./foo.js"` (NodeNext) |
| `throw new Error(...)` for business logic | Use `McpError` + factory helpers from `src/errors.ts` |
| Using raw Backlog types in tool handlers | Map first via `mappers.ts`; handlers see only domain types |
| Referencing outer vars in `vi.mock()` factory | Keep factories self-contained (hoisting) |
| Array params as `projectId: [1]` | Backlog requires `"projectId[]": [1]` (bracket suffix) |
