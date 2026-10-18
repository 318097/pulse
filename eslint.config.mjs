import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";

export default [
  { ignores: ["dist/", ".turbo/"] },

  js.configs.recommended,

  // Extension source: React app + background service worker
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        // process.env.* is replaced at build time by webpack's DefinePlugin
        process: "readonly",
      },
    },
    settings: { react: { version: "detect" } },
  },
  { files: ["src/**/*.{js,jsx}"], ...react.configs.flat.recommended },
  { files: ["src/**/*.{js,jsx}"], ...react.configs.flat["jsx-runtime"] },
  { files: ["src/**/*.{js,jsx}"], ...reactHooks.configs.flat.recommended },
  {
    files: ["src/**/*.{js,jsx}"],
    rules: {
      "react/prop-types": "off",
    },
  },

  // Build tooling configs run in Node as CommonJS
  {
    files: ["*.config.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node,
    },
  },

  // Must stay last: turns off rules that conflict with Prettier
  prettier,
];
