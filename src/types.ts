// ---------------------------------------------------------------------------
// Domain types — normalized, stable output shapes
// Used by tool handlers and returned to the MCP client.
// These are intentionally free of Backlog API internals.
// ---------------------------------------------------------------------------

// ── Metadata types ──────────────────────────────────────────────────────────

export interface BacklogStatus {
  id: number;
  name: string;
  color: string;
  displayOrder: number;
}

export interface BacklogPriority {
  id: number;
  name: string;
}

export interface BacklogCategory {
  id: number;
  name: string;
  displayOrder: number | null;
}

export interface BacklogMilestone {
  id: number;
  name: string;
  description: string | null;
  startDate: string | null;
  releaseDueDate: string | null;
  archived: boolean;
  displayOrder: number;
}

/**
 * Compact issue summary — returned inside backlog_get_issue_list.
 */
export interface BacklogIssueSummary {
  id: number;
  issueKey: string;
  issueType: string;
  summary: string;
  status: string;
  priority: string | null;
  resolution: string | null;
  assignee: string | null;
  categories: string[];
  versions: string[];
  milestones: string[];
  startDate: string | null;
  dueDate: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  parentIssueId: number | null;
  created: string;
  updated: string;
  /** Constructed URL: {baseUrl}/view/{issueKey} */
  url: string;
}

/**
 * Full issue detail — returned by backlog_get_issue.
 * Extends BacklogIssueSummary with description and reporter.
 */
export interface BacklogIssue extends BacklogIssueSummary {
  description: string | null;
  /** createdUser.name */
  reporter: string | null;
}

/**
 * Comment entry — returned inside backlog_get_comments.
 */
export interface BacklogComment {
  id: number;
  /** createdUser.name */
  author: string | null;
  content: string | null;
  created: string;
  updated: string;
  /** Summarized changelog entries (field changes), if any */
  changeLog: BacklogCommentChangeLog[];
}

export interface BacklogCommentChangeLog {
  field: string;
  originalValue: string | null;
  newValue: string | null;
}
