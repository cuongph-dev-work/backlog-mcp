# backlog_get_projects

List all Backlog projects the API key has access to.

## When to Use

- Discover available Backlog projects and their keys or numeric IDs
- Find a project key to use with other project-scoped tools (`backlog_get_statuses`, `backlog_get_categories`, `backlog_get_milestones`, `backlog_get_users`)
- Find a project numeric ID to use as `projectIdOrKey` in `backlog_get_issue_list`
- This is typically the **first tool to call** when the user mentions a project by name but you don't know its key or ID

## Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `archived` | `boolean` | ❌ | _(omit for all)_ | `false` = active projects only, `true` = archived projects only, omit = all projects |

## Output

A Markdown table listing projects.

| Field | Description |
|-------|-------------|
| `ID` | Numeric project ID |
| `Key` | Project key (e.g. `MYPROJ`) |
| `Name` | Project display name |
| `Archived` | `✓` if archived, empty if active |

When `archived: false`, the heading becomes `# Active Projects`.
When `archived: true`, the heading becomes `# Archived Projects`.

### Navigation Hints

The output ends with a `💡 **Next:**` block (when results are found):

- `` `backlog_get_issue_list(projectIdOrKey: "<key>")` `` — browse issues in this project
- `` `backlog_get_users(projectIdOrKey: "<key>")` `` — list project members
- `` `backlog_get_statuses(projectIdOrKey: "<key>")` `` — get available statuses for filtering

The `<key>` is the first project key from the result.

## Error Cases

| Error Code | Cause | Example Message |
|------------|-------|-----------------|
| `INVALID_INPUT` | `archived` is not a boolean | `Invalid input: Expected boolean, received string` |
| `BACKLOG_HTTP_ERROR` | Invalid API key | `Backlog HTTP 401 from .../projects` |
| `BACKLOG_HTTP_ERROR` | Server error | `Backlog HTTP 500 from .../projects` |

## Examples

### Request — all projects

```json
{}
```

### Request — active projects only

```json
{
  "archived": false
}
```

### Request — archived projects only

```json
{
  "archived": true
}
```

### Example Output (all projects)

```markdown
# All Projects

| ID | Key     | Name           | Archived |
|----|---------|----------------|----------|
| 1  | MYPROJ  | My Project     |          |
| 2  | OLDPROJ | Old Project    | ✓        |

---
💡 **Next:**
- `backlog_get_issue_list(projectIdOrKey: "MYPROJ")` — browse issues in this project
- `backlog_get_users(projectIdOrKey: "MYPROJ")` — list project members
- `backlog_get_statuses(projectIdOrKey: "MYPROJ")` — get available statuses for filtering
```
