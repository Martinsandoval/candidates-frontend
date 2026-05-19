import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    css: false,
    env: {
      NEXT_PUBLIC_API_URL: "http://localhost:3000",
    },
    coverage: {
      provider: "v8",
      // Only measure source files, not tests, config, or generated files.
      include: ["app/**/*.{ts,tsx}"],
      exclude: [
        "app/**/*.test.{ts,tsx}",
        "app/**/*.stories.{ts,tsx}",
        "app/test-utils.tsx",
        // Next.js page/layout entry points — thin wrappers, no logic to branch-test.
        "app/page.tsx",
        "app/layout.tsx",
        "app/providers.tsx",
        "app/candidates/*/page.tsx",
        // Pure type/enum files have no executable branches.
        "app/**/types.ts",
        "app/**/enums.ts",
        "app/**/ToastAlertProps.ts",
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
