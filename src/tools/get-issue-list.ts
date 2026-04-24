import { z } from "zod";
import { BacklogHttpClient } from "../backlog/http-client.js";
import { isMcpError } from "../errors.js";
import { formatDate, formatHours } from "../utils.js";
import type { Config } from "../config.js";
import type { BacklogIssueSummary } from "../types.js";

// ---------------------------------------------------------------------------
// Input schema
// ---------------------------------------------------------------------------

export const getIssueListSchema = z.object({
  projectId: z
    .array(z.number().int().positive())
    .optional()
    .describe("Filter by project ID(s). Highly recommended — omitting fetches all visible issues."),
  statusId: z
    .array(z.number().int().min(1).max(4))
    .optional()
    .describe("Filter by status ID: 1=Open, 2=InProgress, 3=Resolved, 4=Closed"),
  priorityId: z
    .array(z.number().int())
    .optional()
    .describe("Filter by priority ID: 2=High, 3=Normal, 4=Low"),
  assigneeId: z
    .array(z.number().int().positive())
    .optional()
    .describe("Filter by assignee user ID(s)"),
  categoryId: z
    .array(z.number().int().positive())
    .optional()
    .describe("Filter by category ID(s)"),
  milestoneId: z
    .array(z.number().int().positive())
    .optional()
    .describe("Filter by milestone ID(s)"),
  keyword: z
    .string()
    .optional()
    .describe("Search keyword — matches against issue summary and description"),
  parentChild: z
    .union([
      z.literal(0),
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
    ])
    .optional()
    .describe("Parent/child filter: 0=all, 1=child only, 2=parent only, 3=no parent, 4=no child"),
  count: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .describe("Number of issues to return (1–100, default 20)"),
  offset: z
    .number()
    .int()
    .min(0)
    .optional()
    .default(0)
    .describe("Pagination offset (0-based, default 0)"),
  sort: z
    .enum([
      "issueType",
      "category",
      "version",
      "milestone",
      "summary",
      "status",
      "priority",
      "attachment",
      "sharedFile",
      "created",
      "createdUser",
      "updated",
      "updatedUser",
      "assignee",
      "startDate",
      "dueDate",
      "estimatedHours",
      "actualHours",
      "childIssue",
    ])
    .optional()
    .describe("Sort field (default: created)"),
  order: z
    .enum(["asc", "desc"])
    .optional()
    .default("desc")
    .describe("Sort order: asc or desc (default desc)"),
});

export type GetIssueListInput = z.infer<typeof getIssueListSchema>;

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function handleGetIssueList(
  rawInput: unknown,
  cfg: Config
): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }> {
  const parsed = getIssueListSchema.safeParse(rawInput);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join("; ");
    return errorContent(`Invalid input: ${msg}`);
  }

  const { projectId, statusId, priorityId, assigneeId, categoryId, milestoneId,
    keyword, parentChild, count, offset, sort, order } = parsed.data;

  const client = new BacklogHttpClient(cfg.BACKLOG_BASE_URL, cfg.BACKLOG_API_KEY);

  try {
    const issues = await client.getIssueList({
      projectId,
      statusId,
      priorityId,
      assigneeId,
      categoryId,
      milestoneId,
      keyword,
      parentChild,
      count,
      offset,
      sort,
      order,
    });

    return { content: [{ type: "text", text: formatIssueList(issues, offset ?? 0) }] };
  } catch (err: unknown) {
    if (isMcpError(err)) return errorContent(`[${err.code}] ${err.message}`);
    if (err instanceof Error) return errorContent(err.message);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

function formatIssueList(issues: BacklogIssueSummary[], offset: number): string {
  const lines: string[] = [];

  lines.push(`# Backlog Issue List`);
  lines.push(``);
  lines.push(`**Showing:** ${issues.length} issue(s) (offset: ${offset})`);
  lines.push(``);

  if (issues.length === 0) {
    lines.push("_No issues found matching your filters._");
    return lines.join("\n");
  }

  lines.push(`| Key | Type | Status | Priority | Assignee | Due | Updated |`);
  lines.push(`|-----|------|--------|----------|----------|-----|---------|`);

  for (const issue of issues) {
    const due = issue.dueDate ?? "—";
    const assignee = issue.assignee ?? "Unassigned";
    const priority = issue.priority ?? "—";
    const updated = formatDate(issue.updated);

    lines.push(
      `| [${issue.issueKey}](${issue.url}) | ${issue.issueType} | ${issue.status} | ${priority} | ${assignee} | ${due} | ${updated} |`
    );
  }

  lines.push(``);
  lines.push(`## Issue Summaries`);
  lines.push(``);

  for (const issue of issues) {
    lines.push(`### [${issue.issueKey}] ${issue.summary}`);
    lines.push(``);
    lines.push(`- **URL:** ${issue.url}`);
    lines.push(`- **Status:** ${issue.status} | **Priority:** ${issue.priority ?? "—"} | **Type:** ${issue.issueType}`);
    if (issue.assignee) lines.push(`- **Assignee:** ${issue.assignee}`);
    if (issue.milestones.length > 0) lines.push(`- **Milestone:** ${issue.milestones.join(", ")}`);
    if (issue.categories.length > 0) lines.push(`- **Category:** ${issue.categories.join(", ")}`);
    if (issue.startDate || issue.dueDate) {
      lines.push(`- **Dates:** ${issue.startDate ?? "—"} → ${issue.dueDate ?? "—"}`);
    }
    const est = formatHours(issue.estimatedHours);
    const act = formatHours(issue.actualHours);
    if (est || act) {
      lines.push(`- **Hours:** Estimated ${est ?? "—"} / Actual ${act ?? "—"}`);
    }
    lines.push(`- **Created:** ${formatDate(issue.created)} | **Updated:** ${formatDate(issue.updated)}`);
    lines.push(``);
  }

  return lines.join("\n");
}

function errorContent(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true as const };
}
