import { defaultDownloadsDir } from "./bootstrap.js";
import { z } from "zod";
import { configError } from "./errors.js";

// ---------------------------------------------------------------------------
// Schema — only user-facing variables are read from the environment.
// Internal/infra settings are hardcoded below.
// ---------------------------------------------------------------------------

const schema = z.object({
  BACKLOG_BASE_URL: z
    .string()
    .url("BACKLOG_BASE_URL must be a valid URL (e.g. https://yourspace.backlog.com)"),

  BACKLOG_API_KEY: z
    .string()
    .min(1, "BACKLOG_API_KEY must not be empty"),
});

// ---------------------------------------------------------------------------
// Hardcoded defaults — not configurable via .env
// ---------------------------------------------------------------------------

const DEFAULTS = {
  ATTACHMENT_WORKSPACE: defaultDownloadsDir, // absolute path
} as const;

export type Config = z.infer<typeof schema> & typeof DEFAULTS;

// ---------------------------------------------------------------------------
// Parse once at startup — callers import `config` directly
// ---------------------------------------------------------------------------

function loadConfig(): Config {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const messages = result.error.errors
      .map((e) => `  ${e.path.join(".")}: ${e.message}`)
      .join("\n");
    throw configError(`Invalid configuration:\n${messages}`, result.error);
  }
  return { ...DEFAULTS, ...result.data };
}

export const config: Config = loadConfig();
