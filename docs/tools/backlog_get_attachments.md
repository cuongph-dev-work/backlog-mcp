# backlog_get_attachments

## When to Use

Use this tool when you need to:
- **See what files are attached** to a Backlog issue
- **Find the attachment ID** needed to download a specific file with `backlog_download_attachment`
- **Check file sizes** before deciding to download

---

## Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issueIdOrKey` | `string` | **Required** | Issue key (e.g. `"BLG-123"`) or numeric issue ID (e.g. `"12345"`) |

---

## Output

A Markdown table of issue attachments:

```
# Attachments — BLG-123

**Issue:** BLG-123
**Total:** 2 attachment(s)

| ID | Name | Size | Uploaded By | Created At |
|----|------|------|-------------|------------|
| 1  | screenshot.png | 191.6 KB | Alice | 2024-01-15 |
| 2  | report.pdf     | 2.3 MB   | —     | 2024-01-16 |

> Use **ID** with `backlog_download_attachment` to download a file.
```

---

## Error Cases

| Error | Cause |
|-------|-------|
| `Invalid input: ...` | `issueIdOrKey` is missing or empty |
| `[BACKLOG_HTTP_ERROR] ...` | Issue not found (404), access denied (403), or network issue |

---

## Examples

### List attachments on an issue

**Request:**
```json
{
  "issueIdOrKey": "BLG-123"
}
```

**Output:**
```
# Attachments — BLG-123

**Issue:** BLG-123
**Total:** 1 attachment(s)

| ID | Name | Size | Uploaded By | Created At |
|----|------|------|-------------|------------|
| 42 | design-mockup.png | 954.2 KB | Bob | 2024-02-01 |

> Use **ID** with `backlog_download_attachment` to download a file.
```

### Then download the attachment

```json
{
  "issueIdOrKey": "BLG-123",
  "attachmentId": 42
}
```
