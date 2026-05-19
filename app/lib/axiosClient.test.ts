import { describe, it, expect, vi } from "vitest";

describe("axiosClient", () => {
  it("exports an axios instance configured with the base URL", async () => {
    const { default: client } = await import("./axiosClient");
    expect(client).toBeDefined();
    expect(client.defaults.baseURL).toBe("http://localhost:3000");
  });

  it("throws when NEXT_PUBLIC_API_URL is not defined", async () => {
    vi.resetModules();
    const saved = process.env.NEXT_PUBLIC_API_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
    await expect(import("./axiosClient")).rejects.toThrow("NEXT_PUBLIC_API_URL is not defined");
    process.env.NEXT_PUBLIC_API_URL = saved;
  });
});
