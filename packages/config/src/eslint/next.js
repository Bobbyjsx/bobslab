import nextPlugin from "@next/eslint-plugin-next";
import { reactInternal } from "./react-internal.js";

/**
 * Shared ESLint configuration for Next.js applications in Bobslab.
 * @type {import("eslint").Linter.Config[]}
 */
export const next = [
  ...reactInternal,
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
];

export const config = next;
export default next;
