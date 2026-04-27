# backlog_get_attachments

List all files attached to a Backlog issue.

## When to Use

- See what files are attached to a Backlog issue
- Find the attachment ID needed to download a specific file with `backlog_download_attachment`
- Check file sizes before deciding to download
- As a follow-up to `backlog_get_issue` when you notice attachments are mentioned

## Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issueIdOrKey` | `string` | **Required** | Issue key (e.g. `"BLG-123"`) or numeric issue ID (e.g. `"12345"`) |

## Output

A Markdown table of issue attachments:

| Field | Description |
|-------|-------------|
| `ID` | Numeric attachment ID (use with `backlog_download_attachment`) |
| `Name` | File name |
| `Size` | Human-readable file size (e.g. `191.6 KB`) |
| `Uploaded By` | Display name of uploader, or `—` |
| `Created At` | Upload date (YYYY-MM-DD) |

### Navigation Hints

The output ends with a `💡 **Next:**` block (when attachments are found):

- `` `backlog_download_attachment(issueIdOrKey: "<key>", attachmentId: <id>)` `` — download the first file (dynamic: uses actual first attachment ID)
- `` `backlog_export_issue_context(issueIdOrKey: "<key>")` `` — export full issue bundle (all attachments + comments)

## Error Cases

| Error | Cause |
|-------|-------|
| `Invalid input: ...` | `issueIdOrKey` is missing or empty |
| `[BACKLOG_HTTP_ERROR] ...` | Issue not found (404), access denied (403), or network issue |

## Examples

### List attachments on an issue

**Request:**
```json
{
  "issueIdOrKey": "BLG-123"
}
```

**Output:**
```markdown
# Attachments — BLG-123

**Issue:** BLG-123
**Total:** 2 attachment(s)

| ID | Name              | Size     | Uploaded By | Created At |
|----|-------------------|----------|-------------|------------|
| 42 | design-mockup.png | 954.2 KB | Bob         | 2024-02-01 |
| 43 | report.pdf        | 2.3 MB   | Alice       | 2024-02-02 |

---
💡 **Next:**
- `backlog_download_attachment(issueIdOrKey: "BLG-123", attachmentId: 42)` — download the first file
- `backlog_export_issue_context(issueIdOrKey: "BLG-123")` — export full issue bundle (all attachments + comments)
```

### Then download a specific attachment

```json
{
  "issueIdOrKey": "BLG-123",
  "attachmentId": 42
}
```
