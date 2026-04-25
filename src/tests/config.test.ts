import { describe, it, expect, afterEach, vi } from "vitest";

// We test config validation by manipulating process.env
// and re-importing the module via dynamic import.

describe("config", () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  it("parses valid configuration with defaults applied", async () => {
    process.env.BACKLOG_BASE_URL = "https://yourspace.backlog.com";
    process.env.BACKLOG_API_KEY = "test-api-key";
    const { config } = await import("../config.js");

    expect(config.BACKLOG_BASE_URL).toBe("https://yourspace.backlog.com");
    expect(config.BACKLOG_API_KEY).toBe("test-api-key");
    expect(config.ATTACHMENT_WORKSPACE).toBe("./downloads");
  });

  it("accepts overridden ATTACHMENT_WORKSPACE", async () => {
    process.env.BACKLOG_BASE_URL = "https://space.backlog.com";
    process.env.BACKLOG_API_KEY = "my-key";
    process.env.ATTACHMENT_WORKSPACE = "/home/user/exports";

    const { config } = await import("../config.js");

    expect(config.ATTACHMENT_WORKSPACE).toBe("/home/user/exports");
  });

  it("throws CONFIG_ERROR when BACKLOG_BASE_URL is missing", async () => {
    delete process.env.BACKLOG_BASE_URL;
    process.env.BACKLOG_API_KEY = "some-key";

    await expect(import("../config.js")).rejects.toMatchObject({
      code: "CONFIG_ERROR",
    });
  });

  it("throws CONFIG_ERROR when BACKLOG_BASE_URL is not a valid URL", async () => {
    process.env.BACKLOG_BASE_URL = "not-a-url";
    process.env.BACKLOG_API_KEY = "some-key";

    await expect(import("../config.js")).rejects.toMatchObject({
      code: "CONFIG_ERROR",
    });
  });

  it("throws CONFIG_ERROR when BACKLOG_API_KEY is missing", async () => {
    process.env.BACKLOG_BASE_URL = "https://space.backlog.com";
    delete process.env.BACKLOG_API_KEY;

    await expect(import("../config.js")).rejects.toMatchObject({
      code: "CONFIG_ERROR",
    });
  });
});
