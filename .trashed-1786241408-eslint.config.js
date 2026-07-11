import js from "@eslint/js";
import tseslint from "typescript-eslint";
import firebaseRulesPlugin from "@firebase/eslint-plugin-security-rules";

export default tseslint.config(
  {
    ignores: ["dist/**/*", "node_modules/**/*", "app/**/*", "test-mock.js", "**/*.rules", "**/*.mjs"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.rules"],
    plugins: {
      "@firebase/security-rules": firebaseRulesPlugin,
    },
    rules: {
      ...firebaseRulesPlugin.configs.recommended.rules,
      "@firebase/security-rules/no-open-reads": "off"
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-unused-vars": "off"
    }
  }
);
