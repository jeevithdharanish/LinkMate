import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

// Flat-config equivalent of the previous .eslintrc.json ("extends": "next/core-web-vitals").
const eslintConfig = defineConfig([
  ...nextVitals,
  {
    // Rules that are new (eslint-plugin-react-hooks v7 React Compiler rules) or newly
    // applied to App Router routes in eslint-config-next 16. They flag pre-existing
    // code, so they are reported as warnings to keep the previous lint gate; fixing
    // them changes runtime behaviour and is tracked as follow-up work.
    rules: {
      "react-hooks/error-boundaries": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
      "@next/next/no-html-link-for-pages": "warn",
    },
  },
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local tool output, never source:
    ".playwright-mcp/**",
  ]),
]);

export default eslintConfig;
