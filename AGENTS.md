# AGENTS.md — Agent Instructions for backlog-mcp

> This file is the canonical instruction set for any AI agent working on this project.
> Read this file in full before starting any task.

---

## What Is This Project?

`backlog-mcp` is a TypeScript MCP (Model Context Protocol) server that provides AI agents with read access to a Backlog (Nulab) space. Authentication uses a static **API Key** stored in `.env` — no browser or Playwright session required.

## Architecture Rules

1. **Server uses factory pattern.** Each incoming MCP request gets a new `McpServer` + `StreamableHTTPServerTransport` pair. Never reuse a server instance across requests.

2. **Auth is a config concern, not a tool concern.** The `BacklogHttpClient` receives `apiKey` from `config` at construction time. Tool handlers never touch auth directly.

3. **HTTP-first for Backlog access.** All Backlog REST API calls go through `src/backlog/http-client.ts` using Axios. The API Key is injected automatically via `axios.create({ params: { apiKey } })`.

4. **Zod validates everything.** Environment variables (`src/config.ts`) and tool inputs (each tool's schema) are all validated with Zod before use.

5. **Two-layer type system.** Raw Backlog API response types live in `src/types/backlog-api.ts`. Normalized domain types used by handlers live in `src/types.ts`. Mappers in `src/backlog/mappers.ts` bridge the two. Never use raw types outside of `http-client.ts` and `mappers.ts`.

## Coding Standards

- **TypeScript strict mode.** No `any`. No implicit types.
- **ESM with `.js` extensions.** All imports must end in `.js` (NodeNext module resolution).
- **Errors use `McpError`.** Every business error must use the `McpError` class with a typed code. Use factory helpers from `src/errors.ts`.
- **Tool errors set `isError: true`.** MCP clients rely on this flag. Never return an error as normal content.
- **401/403 from Backlog = invalid API key.** `assertOk()` in the HTTP client handles this — tool handlers just catch `McpError`.
- **Utility functions in `src/utils.ts`.** Shared helpers (e.g. date formatting, string manipulation) must live in `src/utils.ts`, not inline in tool or handler files.
- **Prefer libraries over hand-rolled code.** For common tasks (date formatting, etc.), use well-known npm packages instead of writing custom implementations.
- **Raw API response types in `src/types/backlog-api.ts`.** Types that mirror the exact shape of Backlog REST API responses must live there, separate from the normalized application interfaces in `src/types.ts`.

## File Conventions

| Area | Location | Notes |
|------|----------|-------|
| MCP server entry | `src/server.ts` | Factory pattern, tool registration |
| Tool handlers | `src/tools/*.ts` | One file per tool |
| Tool documentation | `docs/tools/*.md` | One doc per tool — required for every tool |
| Backlog HTTP layer | `src/backlog/` | endpoints, mappers, http-client |
| Tests | `src/tests/` | Vitest, `vi.mock()` hoisted |
| Config | `src/config.ts` | Zod schema, env vars |
| Types (domain) | `src/types.ts` | Normalized domain interfaces |
| Types (raw API) | `src/types/backlog-api.ts` | Raw Backlog API response shapes |
| Errors | `src/errors.ts` | McpError class, factory helpers |
| Utilities | `src/utils.ts` | Shared helpers (dates, strings, etc.) |

## Testing Requirements

- Run `npx tsc --noEmit` after every code change.
- Run `npx vitest run` before every commit.
- When adding a new tool, add corresponding tests in `src/tests/`.
- Mocks: use `vi.mock()` at file top level (Vitest hoists them). Set per-test behavior with `mockImplementation()`.

## Documentation Requirements

- **Every tool must have a doc file** at `docs/tools/<tool_name>.md`.
- Doc must include: **When to Use**, **Input** (table), **Output** (described), **Error Cases** (table), **Examples** (at least 1 request + expected output).
- Keep the doc in sync with the tool's Zod schema — any param added/removed must be reflected in the doc.


## Adding a New Tool

1. Create `src/tools/<name>.ts` — export a Zod schema + async handler.
2. Handler signature: `async function handle<Name>(rawInput: unknown, cfg: Config): Promise<{ content: [...], isError?: boolean }>`.
3. Handler returns `{ content: [{ type: "text", text }] }` on success, `{ content: [...], isError: true }` on failure.
4. Register in `createMcpServer()` in `src/server.ts`.
5. Write docs at `docs/tools/<tool_name>.md` — include When to Use, Input, Output, Error Cases, Examples.
6. Add tests in `src/tests/<name>.test.ts`.
7. Update `README.md` with the new tool.
8. Verify: `npx tsc --noEmit && npx vitest run`.
9. **Run the quality checklist** at `docs/tools-quality-checklist.md` and confirm the tool passes all mandatory checks:
   - **Input Schema:** Zod schema present, required/optional fields correct, `.describe()` on every field.
   - **Output Design:** Structured Markdown, `isError: true` on errors, no raw HTML/blobs.
   - **Tool Description:** Registered description explains _when to use_, inputs, and outputs clearly.
   - **Security:** No credentials in input/output, auth handled server-side via `config`.
   - **Error Handling:** All error paths return `{ isError: true }` with `McpError` (never plain `Error`).
   - **LLM Compatibility:** Field names are semantic, enums/options are documented inline in `.describe()`.


## Common Pitfalls

| Mistake | Correct Approach |
|---------|----------------|
| Reusing a single McpServer for concurrent requests | Create a new one per request via factory |
| Returning errors as normal `content` | Always include `isError: true` |
| Using `import "./foo"` without `.js` | Must use `import "./foo.js"` (NodeNext) |
| Throwing `new Error(...)` for business logic | Use `McpError` with typed code |
| Using raw Backlog types in tool handlers | Map through `mappers.ts` first; handlers only see domain types |
| Mocking inside `vi.mock()` factory with outer variables | Vitest hoists mocks — keep factories self-contained |
| Sending array params as `projectId: [1]` | Backlog requires `projectId[]: [1]` — use the `[]` suffix in query params |

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
