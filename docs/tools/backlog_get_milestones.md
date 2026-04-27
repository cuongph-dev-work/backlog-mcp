# backlog_get_milestones

List milestones (versions) defined in a Backlog project.

## When to Use

- Discover milestones for a project and obtain their IDs
- Use the returned IDs in the `milestoneId` parameter of `backlog_get_issue_list`

By default only **active** (non-archived) milestones are returned. Set `archived: true` to also include archived milestones.

## Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `projectIdOrKey` | `string` | ✅ Yes | — | Project key (e.g. `MYPROJ`) or numeric project ID |
| `archived` | `boolean` | No | `false` | `true` = include archived milestones; `false` = active only |

## Output

A Markdown table listing milestones for the project.

| Field | Description |
|-------|-------------|
| `ID` | Numeric milestone ID (use with `milestoneId` in `backlog_get_issue_list`) |
| `Name` | Milestone display name |
| `Start Date` | Start date (YYYY-MM-DD), or `—` |
| `Due Date` | Release due date (YYYY-MM-DD), or `—` |
| `Archived` | `✓` if archived, empty if active |

When `archived: false` (default), the heading is `# Active Milestones — <project>`.
When `archived: true`, the heading is `# All Milestones — <project>`.

### Navigation Hints

The output ends with a `💡 **Next:**` block (when milestones are found):

- `` `backlog_get_issue_list(projectIdOrKey: "<key>", milestoneId: [<id>])` `` — filter issues by the first milestone (dynamic: uses actual first milestone ID)

## Error Cases

| Error Code | Cause | Example Message |
|------------|-------|-----------------|
| `INVALID_INPUT` | Missing or empty `projectIdOrKey` | `Invalid input: projectIdOrKey is required` |
| `INVALID_INPUT` | Non-boolean value for `archived` | `Invalid input: ...` |
| `BACKLOG_HTTP_ERROR` | Project not found or no access | `Backlog HTTP 404 from .../versions` |
| `BACKLOG_HTTP_ERROR` | Invalid API key | `Backlog HTTP 401 from .../versions` |

## Examples

### Request — active milestones only (default)

```json
{
  "projectIdOrKey": "MYPROJ"
}
```

### Request — all milestones including archived

```json
{
  "projectIdOrKey": "MYPROJ",
  "archived": true
}
```

### Expected Output

```markdown
# Active Milestones — MYPROJ

| ID  | Name | Start Date | Due Date   | Archived |
|-----|------|------------|------------|----------|
| 201 | v1.0 | 2024-01-01 | 2024-03-31 |          |
| 202 | v1.1 | 2024-04-01 | —          |          |

---
💡 **Next:**
- `backlog_get_issue_list(projectIdOrKey: "MYPROJ", milestoneId: [201])` — filter issues by the first milestone
```

### Using the result

Pass the `ID` values to `backlog_get_issue_list`:
```json
{
  "projectIdOrKey": "MYPROJ",
  "milestoneId": [201]
}
```
