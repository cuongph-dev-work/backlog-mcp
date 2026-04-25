import { z } from "zod";
import { configError } from "./errors.js";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const schema = z.object({
  BACKLOG_BASE_URL: z
    .string()
    .url("BACKLOG_BASE_URL must be a valid URL (e.g. https://yourspace.backlog.com)"),

  BACKLOG_API_KEY: z
    .string()
    .min(1, "BACKLOG_API_KEY must not be empty"),

  ATTACHMENT_WORKSPACE: z
    .string()
    .default("./downloads")
    .describe("Directory where downloaded attachments are saved (created if missing)"),
});

export type Config = z.infer<typeof schema>;

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
  return result.data;
}

export const config: Config = loadConfig();

