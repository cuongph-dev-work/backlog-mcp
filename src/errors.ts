// ---------------------------------------------------------------------------
// Internal error taxonomy for the Backlog MCP server
// ---------------------------------------------------------------------------

export type ErrorCode =
  | "API_KEY_MISSING"
  | "BACKLOG_HTTP_ERROR"
  | "BACKLOG_RESPONSE_ERROR"
  | "CONFIG_ERROR"
  | "INVALID_INPUT";

/**
 * Structured internal error. All layers throw this instead of plain Error
 * so callers can discriminate on `code` without string-matching messages.
 */
export class McpError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "McpError";
    this.code = code;
    this.details = details;
    // Maintain proper prototype chain in ES2022 + TS
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ---------------------------------------------------------------------------
// Factory helpers — keeps call sites concise
// ---------------------------------------------------------------------------

export function apiKeyMissing(message = "BACKLOG_API_KEY is not configured."): McpError {
  return new McpError("API_KEY_MISSING", message);
}

export function backlogHttpError(status: number, url: string, body?: string): McpError {
  return new McpError(
    "BACKLOG_HTTP_ERROR",
    `Backlog HTTP ${status} from ${url}`,
    { status, url, body }
  );
}

export function backlogResponseError(message: string, raw?: unknown): McpError {
  return new McpError("BACKLOG_RESPONSE_ERROR", message, raw);
}

export function configError(message: string, details?: unknown): McpError {
  return new McpError("CONFIG_ERROR", message, details);
}

export function invalidInput(message: string, details?: unknown): McpError {
  return new McpError("INVALID_INPUT", message, details);
}

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

export function isMcpError(err: unknown): err is McpError {
  return err instanceof McpError;
}
