# backlog_get_categories

List categories defined in a Backlog project.

## When to Use

- Discover which categories are defined in a project and obtain their IDs
- Use the returned IDs in the `categoryId` parameter of `backlog_get_issue_list`

## Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `projectIdOrKey` | `string` | ✅ Yes | — | Project key (e.g. `MYPROJ`) or numeric project ID |

## Output

A Markdown table listing all categories for the project.

| Field | Description |
|-------|-------------|
| `ID` | Numeric category ID (use with `categoryId` in `backlog_get_issue_list`) |
| `Name` | Category display name |

### Navigation Hints

The output ends with a `💡 **Next:**` block (when categories are found):

- `` `backlog_get_issue_list(projectIdOrKey: "<key>", categoryId: [<id>])` `` — filter issues by the first category (dynamic: uses actual first category ID)

## Error Cases

| Error Code | Cause | Example Message |
|------------|-------|-----------------|
| `INVALID_INPUT` | Missing or empty `projectIdOrKey` | `Invalid input: projectIdOrKey is required` |
| `BACKLOG_HTTP_ERROR` | Project not found or no access | `Backlog HTTP 404 from .../categories` |
| `BACKLOG_HTTP_ERROR` | Invalid API key | `Backlog HTTP 401 from .../categories` |

## Examples

### Request

```json
{
  "projectIdOrKey": "MYPROJ"
}
```

### Expected Output

```markdown
# Categories — MYPROJ

| ID  | Name     |
|-----|----------|
| 101 | Frontend |
| 102 | Backend  |
| 103 | Infra    |

---
💡 **Next:**
- `backlog_get_issue_list(projectIdOrKey: "MYPROJ", categoryId: [101])` — filter issues by the first category
```

### Using the result

Pass the `ID` values to `backlog_get_issue_list`:
```json
{
  "projectIdOrKey": "MYPROJ",
  "categoryId": [101, 102]
}
```
