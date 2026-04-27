# backlog_get_users

List members of a Backlog project with optional keyword filter.

## When to Use

- Discover who is a member of a Backlog project
- Find a user's numeric ID to use as `assigneeId` in `backlog_get_issue_list`
- Search for a specific user by name or userId within a project

> **Note:** This tool is project-scoped. It calls `GET /api/v2/projects/:projectIdOrKey/users`
> which is accessible to all roles (no admin required).

## Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectIdOrKey` | `string` | **Required** | Project key (e.g. `"MYPROJ"`) or numeric project ID (e.g. `"12345"`). Use `backlog_get_projects` to discover available project keys. |
| `keyword` | `string` | Optional | Filter users client-side by display name or userId (case-insensitive). E.g. `"nguyen"` or `"john.doe"`. |

## Output

A Markdown table of project members:

| Field | Description |
|-------|-------------|
| `ID` | Numeric user ID (use as `assigneeId` in `backlog_get_issue_list`) |
| `User ID` | Login name / username |
| `Name` | Display name |
| `Email` | Email address, or `—` |
| `Role` | Role name |

### Role Values

| roleType | roleName |
|----------|----------|
| 1 | Administrator |
| 2 | Normal User |
| 3 | Reporter |
| 4 | Viewer |
| 5 | Guest Reporter |
| 6 | Guest Viewer |

### Navigation Hints

The output ends with a `💡 **Next:**` block (when users are found):

- `` `backlog_get_issue_list(projectIdOrKey: "<key>", assigneeId: [<id>])` `` — filter issues assigned to the first user (dynamic: uses actual first user ID)
- `` `backlog_get_issue_list(projectIdOrKey: "<key>")` `` — browse all issues in this project

## Error Cases

| Error | Cause |
|-------|-------|
| `Invalid input: ...` | `projectIdOrKey` is missing or empty |
| `[BACKLOG_HTTP_ERROR] ...` | Project not found (404), access denied (403), or network issue |

## Examples

### List all members of a project

**Request:**
```json
{
  "projectIdOrKey": "MYPROJ"
}
```

**Output:**
```markdown
# Backlog Project Members

**Project:** MYPROJ
**Total:** 2 user(s)

| ID  | User ID  | Name     | Email             | Role          |
|-----|----------|----------|-------------------|---------------|
| 101 | alice    | Alice    | alice@example.com | Administrator |
| 102 | bob.tran | Bob Trần | bob@example.com   | Normal User   |

---
💡 **Next:**
- `backlog_get_issue_list(projectIdOrKey: "MYPROJ", assigneeId: [101])` — filter issues assigned to the first user
- `backlog_get_issue_list(projectIdOrKey: "MYPROJ")` — browse all issues in this project
```

### Find a user by name keyword

**Request:**
```json
{
  "projectIdOrKey": "MYPROJ",
  "keyword": "alice"
}
```

**Output:**
```markdown
# Backlog Project Members

**Project:** MYPROJ
**Filter:** keyword="alice"
**Total:** 1 user(s)

| ID  | User ID | Name  | Email             | Role          |
|-----|---------|-------|-------------------|---------------|
| 101 | alice   | Alice | alice@example.com | Administrator |

---
💡 **Next:**
- `backlog_get_issue_list(projectIdOrKey: "MYPROJ", assigneeId: [101])` — filter issues assigned to the first user
- `backlog_get_issue_list(projectIdOrKey: "MYPROJ")` — browse all issues in this project
```

### Use result with backlog_get_issue_list

After getting user ID `101` for Alice:
```json
{
  "projectIdOrKey": "MYPROJ",
  "assigneeId": [101],
  "statusId": [1, 2]
}
```
