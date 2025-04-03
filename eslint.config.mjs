// @ts-check

import eslint from "@eslint/js";
import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import noRelativeImportPaths from "eslint-plugin-no-relative-import-paths";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    ignores: ["**/node_modules/*", "**/dist/*"],
  },
  {
    rules: {
      "no-unused-vars": "off",
      "no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
    plugins: {
      "no-relative-import-paths": noRelativeImportPaths,
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
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "firebase/auth",
              message:
                "firebase/auth is not supported for extension manifest v3. Please use firebase/auth/web-extension instead.",
            },
          ],
        },
      ],
      "no-relative-import-paths/no-relative-import-paths": [
        "error",
        {
          allowSameFolder: true,
          rootDir: "extension/src",
          prefix: "@cb",
        },
      ],
    },
    languageOptions: {
      ...react.configs.flat.recommended.languageOptions,
      globals: globals.browser,
    },
  }
);
