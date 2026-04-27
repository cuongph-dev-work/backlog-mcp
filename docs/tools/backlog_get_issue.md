# backlog_get_issue

Fetch a single Backlog issue by key or numeric ID and return its full details.

## When to Use

- User asks about a specific Backlog issue (e.g. "what's the status of BLG-42?")
- You need to understand the description, requirements, or current state of an issue
- You need to check assignee, reporter, dates, or hours before updating
- Before making code changes related to a ticket, to understand requirements
- As a follow-up to `backlog_get_issue_list` to get full detail on one issue

## Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `issueIdOrKey` | `string` | ✅ | — | Issue key (e.g. `BLG-123`) or numeric issue ID (e.g. `12345`) |

### Validation Rules

- `issueIdOrKey` must be a non-empty string
- Accepts both issue key format (e.g. `PROJ-123`, `BLG-1`) and numeric ID (e.g. `42`)

## Output

Returns a markdown-formatted text block with the following sections:

### Header

| Field | Description |
|-------|-------------|
| `issueKey` | Issue key (e.g. `BLG-42`) |
| `summary` | Issue title |
| `url` | Direct browser link |

### Details Table

| Field | Description |
|-------|-------------|
| `issueType` | Issue type (e.g. Bug, Task, Feature, Story) |
| `status` | Current status (e.g. Open, InProgress, Resolved, Closed) |
| `resolution` | Resolution name if resolved |
| `priority` | Priority (e.g. High, Normal, Low) |
| `parentIssueId` | Parent issue ID if this is a child issue |
| `categories` | Category names |
| `versions` | Version names |
| `milestones` | Milestone names |

### People Table

| Field | Description |
|-------|-------------|
| `assignee` | Display name or `Unassigned` |
| `reporter` | Display name of issue creator |

### Dates Table

| Field | Description |
|-------|-------------|
| `created` | Creation timestamp |
| `updated` | Last update timestamp |
| `startDate` | Planned start date (if set) |
| `dueDate` | Due date (if set) |

### Time Section (shown only if hours exist)

| Field | Description |
|-------|-------------|
| `estimatedHours` | Estimated hours (e.g. `8h`) |
| `actualHours` | Actual hours logged (e.g. `3h`) |

### Description

Full issue description text.

### Navigation Hints

The output ends with a `💡 **Next:**` block suggesting follow-up tools:

- `` `backlog_get_comments(issueIdOrKey: "<key>")` `` — read discussion & change history
- `` `backlog_get_attachments(issueIdOrKey: "<key>")` `` — list attached files
- `` `backlog_export_issue_context(issueIdOrKey: "<key>")` `` — export full context bundle (comments + attachments)

## Error Cases

| Error Code | Meaning | Action |
|------------|---------|--------|
| `BACKLOG_HTTP_ERROR` | Backlog returned non-2xx — 404 = issue not found, 401/403 = bad API key | Check issue key or `BACKLOG_API_KEY` |
| `BACKLOG_RESPONSE_ERROR` | Unexpected response shape | Report to maintainer |
| `INVALID_INPUT` | `issueIdOrKey` is empty or missing | Provide a valid key |

All errors return `isError: true` in the MCP response.

## Examples

### By issue key

```json
{
  "name": "backlog_get_issue",
  "arguments": {
    "issueIdOrKey": "BLG-42"
  }
}
```

### By numeric ID

```json
{
  "name": "backlog_get_issue",
  "arguments": {
    "issueIdOrKey": "12345"
  }
}
```

### Example Output

```markdown
# [BLG-42] Fix login bug

**URL:** https://yourspace.backlog.com/view/BLG-42

## Details

| Field | Value |
|-------|-------|
| **Type** | Bug |
| **Status** | Open |
| **Priority** | High |
| **Categories** | Backend |
| **Milestones** | v2.0 |

## People

| Role | Name |
|------|------|
| **Assignee** | Alice Smith |
| **Reporter** | Bob Jones |

## Dates

| Field | Value |
|-------|-------|
| **Created** | 15 Jan 2024, 10:00 |
| **Updated** | 20 Jan 2024, 15:30 |
| **Start Date** | 2024-01-15 |
| **Due Date** | 2024-01-31 |

## Time

| Field | Value |
|-------|-------|
| **Estimated** | 8h |
| **Actual** | 3h |

## Description

Users cannot log in after session expires.
The token refresh flow fails silently on mobile Safari.

---
💡 **Next:**
- `backlog_get_comments(issueIdOrKey: "BLG-42")` — read discussion & change history
- `backlog_get_attachments(issueIdOrKey: "BLG-42")` — list attached files
- `backlog_export_issue_context(issueIdOrKey: "BLG-42")` — export full context bundle (comments + attachments)
```
