// ---------------------------------------------------------------------------
// Bootstrap — load .env and resolve paths relative to project root.
// Automatically triggered via config.ts import chain.
//
// Strategy:
//   Local dev (tsx src/server.ts):  downloads stored in <project>/downloads/
//   Published npm (npx pkg):        downloads stored in ~/backlog-mcp/downloads/
// ---------------------------------------------------------------------------
import { resolve, dirname, join } from "path";
import { homedir } from "os";
import { fileURLToPath } from "url";
import { config as loadDotenv } from "dotenv";

const thisFile =
  typeof __filename !== "undefined"
    ? __filename
    : fileURLToPath(import.meta.url);

export const projectRoot = dirname(dirname(thisFile));
export const fromRoot = (p: string): string => resolve(projectRoot, p);

const isNpmInstall = projectRoot.includes("node_modules");

if (!isNpmInstall) {
  loadDotenv({ path: fromRoot(".env") });
}

export const defaultDownloadsDir = isNpmInstall
  ? join(homedir(), "backlog-mcp", "downloads")
  : fromRoot("downloads");
