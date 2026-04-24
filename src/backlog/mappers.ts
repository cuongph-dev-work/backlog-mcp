import type {
  BacklogRawIssue,
  BacklogRawComment,
  BacklogRawStatus,
  BacklogRawPriority,
  BacklogRawCategory,
  BacklogRawMilestone,
} from "../types/backlog-api.js";
import type {
  BacklogIssue,
  BacklogIssueSummary,
  BacklogComment,
  BacklogCommentChangeLog,
  BacklogStatus,
  BacklogPriority,
  BacklogCategory,
  BacklogMilestone,
} from "../types.js";
import { issueViewUrl } from "./endpoints.js";

// ---------------------------------------------------------------------------
// Issue mappers
// ---------------------------------------------------------------------------

/**
 * Maps a raw Backlog issue payload to the full BacklogIssue domain type.
 */
export function mapIssue(raw: BacklogRawIssue, baseUrl: string): BacklogIssue {
  return {
    ...mapIssueSummary(raw, baseUrl),
    description: raw.description ?? null,
    reporter: raw.createdUser?.name ?? null,
  };
}

/**
 * Maps a raw Backlog issue payload to the compact BacklogIssueSummary domain type.
 * Used for list responses where we want less data per issue.
 */
export function mapIssueSummary(
  raw: BacklogRawIssue,
  baseUrl: string
): BacklogIssueSummary {
  return {
    id: raw.id,
    issueKey: raw.issueKey,
    issueType: raw.issueType?.name ?? "Unknown",
    summary: raw.summary ?? "(no summary)",
    status: raw.status?.name ?? "Unknown",
    priority: raw.priority?.name ?? null,
    resolution: raw.resolution?.name ?? null,
    assignee: raw.assignee?.name ?? null,
    categories: (raw.category ?? []).map((c) => c.name).filter(Boolean),
    versions: (raw.versions ?? []).map((v) => v.name).filter(Boolean),
    milestones: (raw.milestone ?? []).map((m) => m.name).filter(Boolean),
    startDate: raw.startDate ?? null,
    dueDate: raw.dueDate ?? null,
    estimatedHours: raw.estimatedHours ?? null,
    actualHours: raw.actualHours ?? null,
    parentIssueId: raw.parentIssueId ?? null,
    created: raw.created ?? "",
    updated: raw.updated ?? "",
    url: issueViewUrl(baseUrl, raw.issueKey),
  };
}

// ---------------------------------------------------------------------------
// Comment mapper
// ---------------------------------------------------------------------------

/**
 * Maps a raw Backlog comment to the BacklogComment domain type.
 */
export function mapComment(raw: BacklogRawComment): BacklogComment {
  const changeLog: BacklogCommentChangeLog[] = (raw.changeLog ?? []).map((cl) => ({
    field: cl.field,
    originalValue: cl.originalValue ?? null,
    newValue: cl.newValue ?? null,
  }));

  return {
    id: raw.id,
    author: raw.createdUser?.name ?? null,
    content: raw.content ?? null,
    created: raw.created ?? "",
    updated: raw.updated ?? "",
    changeLog,
  };
}

// ---------------------------------------------------------------------------
// Metadata mappers
// ---------------------------------------------------------------------------

/** Maps a raw Backlog status to the BacklogStatus domain type. */
export function mapStatus(raw: BacklogRawStatus): BacklogStatus {
  return {
    id: raw.id,
    name: raw.name,
    color: raw.color,
    displayOrder: raw.displayOrder,
  };
}

/** Maps a raw Backlog priority to the BacklogPriority domain type. */
export function mapPriority(raw: BacklogRawPriority): BacklogPriority {
  return {
    id: raw.id,
    name: raw.name,
  };
}

/** Maps a raw Backlog category to the BacklogCategory domain type. */
export function mapCategory(raw: BacklogRawCategory): BacklogCategory {
  return {
    id: raw.id,
    name: raw.name,
    displayOrder: raw.displayOrder ?? null,
  };
}

/** Maps a raw Backlog version (milestone) to the BacklogMilestone domain type. */
export function mapMilestone(raw: BacklogRawMilestone): BacklogMilestone {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? null,
    startDate: raw.startDate ?? null,
    releaseDueDate: raw.releaseDueDate ?? null,
    archived: raw.archived,
    displayOrder: raw.displayOrder,
  };
}
