# backlog_get_priorities

List issue priorities available in the Backlog space.

## When to Use

- Discover the priority IDs available in your Backlog space
- Priorities are **global** (not project-specific) — they apply to all projects
- Use the returned IDs in the `priorityId` parameter of `backlog_get_issue_list`

## Input

This tool takes **no input parameters**.

## Output

A Markdown table listing all available priorities.

| Field | Description |
|-------|-------------|
| `ID` | Numeric priority ID (use with `priorityId` in `backlog_get_issue_list`) |
| `Name` | Priority display name |

> Priorities are space-wide and apply to all projects.

### Navigation Hints

The output ends with a `💡 **Next:**` block (when priorities are found):

- `` `backlog_get_issue_list(priorityId: [<id>])` `` — filter issues by the first priority; add `projectIdOrKey` to scope by project (dynamic: uses actual first priority ID)
- `` `backlog_get_projects()` `` — list projects to use with issue filtering

## Error Cases

| Error Code | Cause | Example Message |
|------------|-------|-----------------|
| `BACKLOG_HTTP_ERROR` | Invalid API key | `Backlog HTTP 401 from .../priorities` |
| `BACKLOG_HTTP_ERROR` | Server error | `Backlog HTTP 500 from .../priorities` |

## Examples

### Request

```json
{}
```

### Expected Output

```markdown
# Priorities (Global)

> Priorities are space-wide and apply to all projects.

| ID | Name   |
|----|--------|
| 2  | High   |
| 3  | Normal |
| 4  | Low    |

---
💡 **Next:**
- `backlog_get_issue_list(priorityId: [2])` — filter issues by the first priority (add `projectIdOrKey` to scope by project)
- `backlog_get_projects()` — list projects to use with issue filtering
```

### Using the result

Pass the `ID` values to `backlog_get_issue_list`:
```json
{
  "projectIdOrKey": "MYPROJ",
  "priorityId": [2]
}
```
