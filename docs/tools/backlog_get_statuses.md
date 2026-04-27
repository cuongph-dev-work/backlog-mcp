# backlog_get_statuses

List statuses defined in a Backlog project.

## When to Use

- Discover which statuses exist in a project and obtain their IDs before filtering issues
- Use the returned IDs in the `statusId` parameter of `backlog_get_issue_list`

## Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `projectIdOrKey` | `string` | ✅ Yes | — | Project key (e.g. `MYPROJ`) or numeric project ID |

## Output

A Markdown table listing all statuses for the project.

| Field | Description |
|-------|-------------|
| `ID` | Numeric status ID (use with `statusId` in `backlog_get_issue_list`) |
| `Name` | Status display name |
| `Color` | Hex color code |
| `Display Order` | Sort order in the Backlog UI |

### Navigation Hints

The output ends with a `💡 **Next:**` block (when statuses are found):

- `` `backlog_get_issue_list(projectIdOrKey: "<key>", statusId: [<id>])` `` — filter issues by the first status (dynamic: uses actual first status ID)
- `` `backlog_get_categories(projectIdOrKey: "<key>")` `` — get categories for further filtering
- `` `backlog_get_milestones(projectIdOrKey: "<key>")` `` — get milestones for further filtering

## Error Cases

| Error Code | Cause | Example Message |
|------------|-------|-----------------|
| `INVALID_INPUT` | Missing or empty `projectIdOrKey` | `Invalid input: projectIdOrKey is required` |
| `BACKLOG_HTTP_ERROR` | Project not found or no access | `Backlog HTTP 404 from .../statuses` |
| `BACKLOG_HTTP_ERROR` | Invalid API key | `Backlog HTTP 401 from .../statuses` |

## Examples

### Request

```json
{
  "projectIdOrKey": "MYPROJ"
}
```

### Expected Output

```markdown
# Statuses — MYPROJ

| ID | Name        | Color   | Display Order |
|----|-------------|---------|---------------|
| 1  | Open        | #ed8077 | 1000          |
| 2  | In Progress | #7ea8d8 | 2000          |
| 3  | Resolved    | #8fde97 | 3000          |
| 4  | Closed      | #b0b0b0 | 4000          |

---
💡 **Next:**
- `backlog_get_issue_list(projectIdOrKey: "MYPROJ", statusId: [1])` — filter issues by the first status
- `backlog_get_categories(projectIdOrKey: "MYPROJ")` — get categories for further filtering
- `backlog_get_milestones(projectIdOrKey: "MYPROJ")` — get milestones for further filtering
```

### Using the result

Pass the `ID` values to `backlog_get_issue_list`:
```json
{
  "projectIdOrKey": "MYPROJ",
  "statusId": [1, 2]
}
```
