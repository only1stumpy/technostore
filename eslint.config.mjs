import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Claude worktrees:
    ".claude/**",
    // Document generators (legacy CommonJS, not maintained):
    "docs/create_diploma_speech_docx.js",
    "docs/create_prediploma_presentation.js",
  ]),
]);

export default eslintConfig;
