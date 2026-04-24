# backlog_get_comments

Fetch comments for a Backlog issue, including text content and field change history (changelog).

## When to Use

- User asks "what's the latest update on BLG-42?"
- You need to see the discussion history of an issue
- You need to understand what fields were changed and when
- You want to track the resolution history of a bug
- As a follow-up to `backlog_get_issue` to read the conversation thread

## Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `issueIdOrKey` | `string` | ✅ | — | Issue key (e.g. `BLG-123`) or numeric issue ID |
| `count` | `number` | ❌ | `20` | Number of comments to return (1–100) |
| `order` | `asc\|desc` | ❌ | `desc` | `asc` = oldest first, `desc` = newest first |
| `minId` | `number` | ❌ | — | Return comments with ID >= `minId` (pagination forward) |
| `maxId` | `number` | ❌ | — | Return comments with ID <= `maxId` (pagination backward) |

### Validation Rules

- `issueIdOrKey` must be a non-empty string
- `count` must be between 1 and 100
- `minId` and `maxId` must be positive integers if provided

## Output

Returns a markdown-formatted text block listing comments in order.

### Header
| Field | Description |
|-------|-------------|
| `Total returned` | Number of comments in this response |
| `Order` | "newest first" or "oldest first" |

### Each Comment
| Field | Description |
|-------|-------------|
| `id` | Unique comment ID |
| `author` | Display name of the commenter |
| `created` | Timestamp of the comment |
| `updated` | Timestamp of last edit (shown only if different from created) |
| `content` | Text body of the comment (if any) |
| `changeLog` | Table of field changes made in this activity entry (if any) |

> **Note:** Backlog activity entries can be either text comments, field changes, or both. The `changeLog` table shows `field`, `From`, and `To` columns.

## Pagination

Backlog paginates comments by ID, not offset. To page through comments:

**Newest-first (desc, default):**
- First page: `{ order: "desc", count: 20 }`
- Next page: `{ order: "desc", count: 20, maxId: <lowest comment ID from previous page - 1> }`

**Oldest-first (asc):**
- First page: `{ order: "asc", count: 20 }`
- Next page: `{ order: "asc", count: 20, minId: <highest comment ID from previous page + 1> }`

## Error Cases

| Error Code | Meaning | Action |
|------------|---------|--------|
| `BACKLOG_HTTP_ERROR` | Backlog returned non-2xx — 404 = issue not found, 401/403 = bad API key | Check issue key or `BACKLOG_API_KEY` |
| `BACKLOG_RESPONSE_ERROR` | Unexpected response shape | Report to maintainer |
| `INVALID_INPUT` | `issueIdOrKey` is empty or `count`/`minId`/`maxId` out of range | Check input values |

All errors return `isError: true` in the MCP response.

## Examples

### Latest comments (default)

```json
{
  "name": "backlog_get_comments",
  "arguments": {
    "issueIdOrKey": "BLG-42"
  }
}
```

### Oldest first (chronological)

```json
{
  "name": "backlog_get_comments",
  "arguments": {
    "issueIdOrKey": "BLG-42",
    "order": "asc",
    "count": 50
  }
}
```

### Next page (desc pagination)

```json
{
  "name": "backlog_get_comments",
  "arguments": {
    "issueIdOrKey": "BLG-42",
    "order": "desc",
    "count": 20,
    "maxId": 6585
  }
}
```

### Example Output

```markdown
# Comments — BLG-42

**Total returned:** 2 | **Order:** newest first

---
**Comment #6586** by **Alice Smith** — 16 Jan 2024, 09:00

Reproduced the issue on mobile Safari 17.1. The refresh token endpoint returns 401 silently.

---
**Comment #6585** by **Bob Jones** — 15 Jan 2024, 14:30

**Field changes:**

| Field | From | To |
|-------|------|----|
| status | Open | InProgress |
| assignee | — | Alice Smith |
```
