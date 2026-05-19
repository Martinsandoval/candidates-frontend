import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Upgrade from next's default "warn" to "error" with sensible options.
      // Prefixing with _ opts out intentionally-unused args/vars (e.g. `_event`).
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Disable the base rule — the TS-aware version above supersedes it.
      "no-unused-vars": "off",
      // Enforce `import type` for imports only used as types.
      // Keeps value imports and type imports visually distinct and helps bundlers
      // tree-shake type-only references.
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
    },
  },
  // Disable all ESLint rules that would conflict with Prettier formatting.
  prettier,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "coverage/**"]),
]);

export default eslintConfig;
