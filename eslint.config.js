// ═══════════════════════════════════════════════════════════
//  DevForge — eslint.config.js
//  Flat config format (ESLint v9+)
// ═══════════════════════════════════════════════════════════

import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    // Files to lint
    files: ["app.js", "curriculum.js"],

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script", // plain scripts, not ES modules
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        getComputedStyle: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        requestAnimationFrame: "readonly",
        fetch: "readonly",
        URL: "readonly",
        Date: "readonly",
        JSON: "readonly",
        Math: "readonly",
        Array: "readonly",
        Object: "readonly",
        String: "readonly",
        Number: "readonly",
        Boolean: "readonly",
        Promise: "readonly",
        Set: "readonly",
        Map: "readonly",
        localStorage: "readonly",
        // DevForge globals — CURRICULUM is defined in curriculum.js
        // and used by app.js, so we declare it here
        CURRICULUM: "readonly",
      },
    },

    rules: {
      // ── Errors ──────────────────────────────────────────
      "no-undef": "error", // catch undefined variables
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": "off", // console.log is fine in this project
      "no-debugger": "error",

      // ── Best practices ───────────────────────────────────
      eqeqeq: ["error", "always"], // always use === not ==
      "no-var": "error", // use const/let only
      "prefer-const": "warn",
      "no-duplicate-case": "error",
      "no-empty": "error",
      "no-extra-semi": "error",
      "no-unreachable": "error",

      // ── Style (warnings only, Prettier handles formatting) ─
      semi: ["warn", "always"],
      "no-trailing-spaces": "warn",
    },
  },
];
