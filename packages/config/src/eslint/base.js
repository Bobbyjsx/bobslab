import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

/**
 * Shared base ESLint configuration for Bobslab.
 * @type {import("eslint").Linter.Config[]}
 */
export const base = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    ignores: [
      "**/dist/**",
      "**/.turbo/**",
      "**/node_modules/**",
      "**/coverage/**",
      "**/.next/**",
      "**/out/**",
      "**/.agents/**",
      "**/.codex/**",
      "**/.claude/**",
      "**/.cursor/**",
      "**/.factory/**",
      "**/patches/**",
      "**/next-env.d.ts",
      "packages/cli/skills/**",
      ".github/**",
    ],
  },
];

export const config = base;
export default base;
