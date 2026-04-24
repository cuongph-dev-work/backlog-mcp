# `backlog_get_projects`

## When to Use

Call this tool when you need to discover available Backlog projects and their numeric IDs or project keys. Use the returned `ID` as input to `projectId[]` in `backlog_get_issue_list`, or the `Key` as input to project-scoped tools like `backlog_get_statuses`, `backlog_get_categories`, and `backlog_get_milestones`.

This is typically the **first tool to call** when the user mentions a project by name but you don't know its numeric ID or key.

---

## Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `archived` | `boolean` | No | _(omit for all)_ | `false` = active projects only, `true` = archived projects only, omit = all projects |

---

## Output

A Markdown table listing projects.

```
# All Projects

| ID | Key    | Name           | Archived |
|----|--------|----------------|----------|
| 1  | TEST   | Test Project   |          |
| 2  | DEMO   | Demo Project   | ✓        |
```

When `archived: false` (active only), the heading becomes `# Active Projects`.
When `archived: true`, the heading becomes `# Archived Projects`.

---

## Error Cases

| Error Code | Cause | Example Message |
|------------|-------|-----------------|
| `INVALID_INPUT` | `archived` is not a boolean | `Invalid input: Expected boolean, received string` |
| `BACKLOG_HTTP_ERROR` | Invalid API key | `Backlog HTTP 401 from .../projects` |
| `BACKLOG_HTTP_ERROR` | Server error | `Backlog HTTP 500 from .../projects` |

---

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

### Expected Output (all projects)

```
# All Projects

| ID | Key      | Name             | Archived |
|----|----------|------------------|----------|
| 1  | MYPROJ   | My Project       |          |
| 2  | OLDPROJ  | Old Project      | ✓        |
```

### Using the result

**Filter issues by project numeric ID:**
```json
{
  "projectId": [1],
  "statusId": [1, 2]
}
```

**Use project key in metadata tools:**
```json
{
  "projectIdOrKey": "MYPROJ"
}
```
