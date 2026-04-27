# backlog_get_issue_list

Fetch a list of Backlog issues with optional filters. Returns a compact table and detailed summaries per issue.

## When to Use

- User asks for all open issues in a project
- You need to find issues assigned to a specific person
- User asks "what bugs are in milestone v2.0?"
- You need an overview of the project backlog before taking action
- You need to search for issues by keyword in summary or description
- Before creating or updating issues, to check for duplicates

## Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `projectIdOrKey` | `string` | ❌ | — | Filter by project key(s) or numeric ID(s). Accepts a single value or comma-separated list (e.g. `"MYPROJ"`, `"12345"`, `"MYPROJ,OTHER"`). Project keys are automatically resolved to numeric IDs. **Highly recommended** — omitting fetches all visible issues. |
| `statusId` | `number[]` | ❌ | — | Filter by status: `1`=Open, `2`=InProgress, `3`=Resolved, `4`=Closed |
| `priorityId` | `number[]` | ❌ | — | Filter by priority: `2`=High, `3`=Normal, `4`=Low |
| `assigneeId` | `number[]` | ❌ | — | Filter by assignee user ID(s) |
| `categoryId` | `number[]` | ❌ | — | Filter by category ID(s) |
| `milestoneId` | `number[]` | ❌ | — | Filter by milestone ID(s) |
| `keyword` | `string` | ❌ | — | Full-text search in issue summary and description |
| `parentChild` | `0\|1\|2\|3\|4` | ❌ | — | `0`=all, `1`=child only, `2`=parent only, `3`=no parent, `4`=no child |
| `count` | `number` | ❌ | `20` | Number of issues to return (1–100) |
| `offset` | `number` | ❌ | `0` | Pagination offset (0-based) |
| `sort` | `string` | ❌ | `created` | Sort field: `created`, `updated`, `status`, `priority`, `dueDate`, `assignee`, `startDate`, `estimatedHours`, `actualHours`, ... |
| `order` | `asc\|desc` | ❌ | `desc` | Sort order |

> **Note:** `statusId`, `priorityId`, `assigneeId`, `categoryId`, `milestoneId` accept either a JSON array (`[1, 2]`) or a comma-separated string (`"1,2"`).

### Validation Rules

- `count` must be between 1 and 100
- `offset` must be >= 0
- `parentChild` must be 0–4
- `sort` must be one of the predefined enum values

## Output

Returns a markdown-formatted text block with:

### Summary Header
| Field | Description |
|-------|-------------|
| `Showing` | Number of issues returned and offset |

### Compact Table
Columns: Key, Type, Status, Priority, Assignee, Due, Updated

### Detailed Summaries
For each issue:
| Field | Description |
|-------|-------------|
| `issueKey` | Issue key (e.g. `BLG-42`) with link |
| `issueType` | Issue type name (e.g. Bug, Task, Feature) |
| `status` | Current status name |
| `priority` | Priority name or `—` |
| `assignee` | Assignee display name or `Unassigned` |
| `categories` | Category names joined |
| `milestones` | Milestone names joined |
| `startDate / dueDate` | Date range if set |
| `estimatedHours / actualHours` | Hours if set |
| `created / updated` | Timestamps |

### Navigation Hints

The output ends with a `💡 **Next:**` block:

- `` `backlog_get_issue(issueIdOrKey: "<firstKey>")` `` — view full details of the first issue (dynamic: uses actual first issue key)
- `` `backlog_get_issue_list(offset: N)` `` — load next page (only shown when `issues.length === count`, meaning more results may exist)

## Pagination

To page through results, use `offset` + `count`:
- Page 1: `{ count: 20, offset: 0 }`
- Page 2: `{ count: 20, offset: 20 }`
- Page 3: `{ count: 20, offset: 40 }`

The navigation hint auto-calculates the next offset when the page is full.

## Error Cases

| Error Code | Meaning | Action |
|------------|---------|--------|
| `BACKLOG_HTTP_ERROR` | Backlog returned non-2xx (e.g. 401/403 = bad API key) | Check `BACKLOG_API_KEY` in `.env` |
| `BACKLOG_RESPONSE_ERROR` | Unexpected response shape | Report to maintainer |
| `INVALID_INPUT` | Schema validation failed | Check input values |

All errors return `isError: true` in the MCP response.

## Examples

### Open issues in a project

```json
{
  "name": "backlog_get_issue_list",
  "arguments": {
    "projectIdOrKey": "MYPROJ",
    "statusId": [1, 2],
    "count": 20
  }
}
```

### High priority bugs in a milestone

```json
{
  "name": "backlog_get_issue_list",
  "arguments": {
    "projectIdOrKey": "MYPROJ",
    "priorityId": [2],
    "milestoneId": [67],
    "sort": "dueDate",
    "order": "asc"
  }
}
```

### Keyword search

```json
{
  "name": "backlog_get_issue_list",
  "arguments": {
    "projectIdOrKey": "MYPROJ",
    "keyword": "login timeout",
    "count": 10
  }
}
```

### Example Output

```markdown
# Backlog Issue List

**Showing:** 2 issue(s) (offset: 0)

| Key | Type | Status | Priority | Assignee | Due | Updated |
|-----|------|--------|----------|----------|-----|---------|
| [BLG-42](https://space.backlog.com/view/BLG-42) | Bug | Open | High | Alice Smith | 2024-01-31 | 20 Jan 2024, 15:30 |
| [BLG-41](https://space.backlog.com/view/BLG-41) | Task | InProgress | Normal | Bob Jones | — | 19 Jan 2024, 09:00 |

## Issue Summaries

### [BLG-42] Fix login bug

- **URL:** https://space.backlog.com/view/BLG-42
- **Status:** Open | **Priority:** High | **Type:** Bug
- **Assignee:** Alice Smith
- **Milestone:** v2.0
- **Dates:** 2024-01-15 → 2024-01-31
- **Hours:** Estimated 8h / Actual 3h
- **Created:** 15 Jan 2024, 10:00 | **Updated:** 20 Jan 2024, 15:30

...

---
💡 **Next:**
- `backlog_get_issue(issueIdOrKey: "BLG-42")` — view full details of the first issue
- `backlog_get_issue_list(offset: 20)` — load the next page (20 more results possible)
```
