// @ts-check

import eslint from "@eslint/js";
import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    ignores: ["**/node_modules/*", "**/dist/*", "**/script/dev.mjs"],
  },
  {
    rules: {
      "no-unused-vars": "off",
      "no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    files: ["firebase/function/**/*.{ts,js}"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ["extension/src/**/*.{js,jsx,ts,tsx}"],
    ...react.configs.flat.recommended,
    plugins: {
      "react-hooks": reactHooks,
      "ts-eslint": tsEslintPlugin,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
    languageOptions: {
      ...react.configs.flat.recommended.languageOptions,
      globals: globals.browser,
    },
  }
);
