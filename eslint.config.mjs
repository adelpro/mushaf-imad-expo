import { defineConfig } from "eslint/config";
import { fixupPluginRules } from "@eslint/compat";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintReact from "@eslint-react/eslint-plugin";
import pluginReactNative from "eslint-plugin-react-native";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";
import globals from "globals";

export default defineConfig([
  // ── Global ignores ───────────────────────────────────────────────────
  {
    ignores: [
      "node_modules/",
      "dist/",
      ".expo/",
      "web-build/",
      "ios/",
      "android/",
      "assets/",
      "scripts/",
      "coverage/",
      "*.realm",
      "**/*.generated.*",
    ],
  },

  // ── Base JS recommended rules ────────────────────────────────────────
  js.configs.recommended,

  // ── TypeScript recommended rules ─────────────────────────────────────
  ...tseslint.configs.recommended,

  // ── React (eslint-react — ESLint 10 compatible) ──────────────────────
  {
    ...eslintReact.configs["recommended-typescript"],
    files: ["**/*.{ts,tsx}"],
  },

  // ── React Native (wrapped with compat for ESLint 10) ─────────────────
  {
    plugins: {
      "react-native": fixupPluginRules(pluginReactNative),
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "react-native/no-unused-styles": "warn",
      "react-native/no-inline-styles": "warn",
      "react-native/no-raw-text": "off",
      "react-native/no-color-literals": "warn",
    },
  },

  // ── Prettier (must be last to override formatting rules) ─────────────
  eslintConfigPrettier,
  {
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      "prettier/prettier": ["warn", { endOfLine: "auto" }],
    },
  },

  // ── Project-wide language options ────────────────────────────────────
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },

  // ── CommonJS files (metro.config.js, etc.) ───────────────────────────
  {
    files: ["*.config.js", "*.config.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);
