# backlog_get_users

## When to Use

Use this tool when you need to:

- **Discover who is a member** of a Backlog project
- **Find a user's numeric ID** to use as `assigneeId` in `backlog_get_issue_list`
- **Search for a specific user** by name or userId within a project

> **Note:** This tool is project-scoped. It calls `GET /api/v2/projects/:projectIdOrKey/users`
> which is accessible to all roles (no admin required).

---

## Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectIdOrKey` | `string` | **Required** | Project key (e.g. `"MYPROJ"`) or numeric project ID (e.g. `"12345"`). Use `backlog_get_projects` to discover available project keys. |
| `keyword` | `string` | Optional | Filter users client-side by display name or userId (case-insensitive). E.g. `"nguyen"` or `"john.doe"`. |

---

## Output

A Markdown table of project members:

```
# Backlog Project Members

**Project:** MYPROJ
**Total:** 3 user(s)

| ID  | User ID      | Name          | Email           | Role          |
|-----|--------------|---------------|-----------------|---------------|
| 101 | nguyen.van.a | Nguyễn Văn A  | a@company.com   | Normal User   |
| 102 | john.doe     | John Doe      | john@company.com| Administrator |
| 103 | tran.b       | Trần B        | —               | Reporter      |

> Use the **ID** column value as `assigneeId` in `backlog_get_issue_list`.
```

### Role values

| roleType | roleName |
|----------|----------|
| 1 | Administrator |
| 2 | Normal User |
| 3 | Reporter |
| 4 | Viewer |
| 5 | Guest Reporter |
| 6 | Guest Viewer |

---

## Error Cases

| Error | Cause |
|-------|-------|
| `Invalid input: ...` | `projectIdOrKey` is missing or empty |
| `[BACKLOG_HTTP_ERROR] ...` | Project not found (404), access denied (403), or network issue |

---

## Examples

### List all members of a project

**Request:**
```json
{
  "projectIdOrKey": "MYPROJ"
}
```

**Output:**
```
# Backlog Project Members

**Project:** MYPROJ
**Total:** 2 user(s)

| ID  | User ID  | Name     | Email            | Role          |
|-----|----------|----------|------------------|---------------|
| 101 | alice    | Alice    | alice@example.com| Administrator |
| 102 | bob.tran | Bob Trần | bob@example.com  | Normal User   |

> Use the **ID** column value as `assigneeId` in `backlog_get_issue_list`.
```

---

### Find a user by name keyword

**Request:**
```json
{
  "projectIdOrKey": "MYPROJ",
  "keyword": "alice"
}
```

**Output:**
```
# Backlog Project Members

**Project:** MYPROJ
**Filter:** keyword="alice"
**Total:** 1 user(s)

| ID  | User ID | Name  | Email            | Role          |
|-----|---------|-------|------------------|---------------|
| 101 | alice   | Alice | alice@example.com| Administrator |

> Use the **ID** column value as `assigneeId` in `backlog_get_issue_list`.
```

---

### Use result with backlog_get_issue_list

After getting user ID `101` for Alice:
```json
{
  "projectIdOrKey": "MYPROJ",
  "assigneeId": "101",
  "statusId": "1,2"
}
```
