# backlog_download_attachment

Download a file attached to a Backlog issue and save it to the local filesystem.

## When to Use

- Download a file attached to a Backlog issue to your local machine
- Save attachments for further processing (reading content, sharing, etc.)

> **Workflow:** Call `backlog_get_attachments` first to get the list of attachment IDs, then use this tool to download a specific one.

## Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issueIdOrKey` | `string` | **Required** | Issue key (e.g. `"BLG-123"`) or numeric issue ID |
| `attachmentId` | `number` | **Required** | Numeric attachment ID from `backlog_get_attachments`. Must be a positive integer. |

> **Output directory** is configured server-side via `ATTACHMENT_WORKSPACE` in `.env` (default: `./downloads`).
> The directory is created automatically if it doesn't exist.

## Output

```
# Download Complete

**File:** design-mockup.png
**Size:** 954.2 KB (977112 bytes)
**Saved to:** /absolute/path/to/downloads/design-mockup.png
**Issue:** BLG-123
**Attachment ID:** 42
```

### Navigation Hints

The output ends with a `💡 **Next:**` block:

- `` `backlog_get_attachments(issueIdOrKey: "<key>")` `` — view all attachments on this issue
- `` `backlog_get_issue(issueIdOrKey: "<key>")` `` — go back to issue overview

## Error Cases

| Error | Cause |
|-------|-------|
| `Invalid input: ...` | Required fields missing, `attachmentId` is not a positive integer |
| `[BACKLOG_HTTP_ERROR] ...` | Issue or attachment not found (404), access denied (403), or network issue |
| `EACCES` / `ENOENT` | Filesystem permission denied or invalid path |

## Examples

### Download an attachment

**Request:**
```json
{
  "issueIdOrKey": "BLG-123",
  "attachmentId": 42
}
```

**Output:**
```markdown
# Download Complete

**File:** design-mockup.png
**Size:** 954.2 KB (977112 bytes)
**Saved to:** /Users/you/project/downloads/design-mockup.png
**Issue:** BLG-123
**Attachment ID:** 42

---
💡 **Next:**
- `backlog_get_attachments(issueIdOrKey: "BLG-123")` — view all attachments on this issue
- `backlog_get_issue(issueIdOrKey: "BLG-123")` — go back to issue overview
```

## Typical Workflow

```
1. backlog_get_issue { issueIdOrKey: "BLG-123" }
   → See issue details, note there are 2 attachments

2. backlog_get_attachments { issueIdOrKey: "BLG-123" }
   → Get attachment list: ID=42 "report.pdf", ID=43 "screenshot.png"

3. backlog_download_attachment { issueIdOrKey: "BLG-123", attachmentId: 42 }
   → File saved to ./downloads/report.pdf
```
