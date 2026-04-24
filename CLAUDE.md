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

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **backlog-mcp** (437 symbols, 799 relationships, 35 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/backlog-mcp/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/backlog-mcp/context` | Codebase overview, check index freshness |
| `gitnexus://repo/backlog-mcp/clusters` | All functional areas |
| `gitnexus://repo/backlog-mcp/processes` | All execution flows |
| `gitnexus://repo/backlog-mcp/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
