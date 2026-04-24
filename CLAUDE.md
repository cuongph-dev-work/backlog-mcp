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
12. **Verify against `docs/tools-quality-checklist.md`** — every new tool MUST pass:

    | Area | Mandatory Check |
    |------|----------------|
    | **Input Schema** | Zod schema with `.describe()` on every field; required vs optional explicit |
    | **Output Design** | Structured Markdown output; `isError: true` on all error paths; no raw HTML/blobs |
    | **Tool Description** | `server.tool()` description explains when to use, key inputs, and output format |
    | **Security** | No credentials in input/output; API key handled server-side via `config` only |
    | **Error Handling** | All errors use `McpError` (never `new Error()`); all catch paths return `isError: true` |
    | **LLM Compatibility** | Field names are semantic; enum/option values documented inline in `.describe()` |


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
