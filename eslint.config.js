/* eslint-env node */

module.exports = {
  ignores: ["node_modules/**", ".turbo/**", ".next/**", "dist/**"],
  rules: {
    // Basic ESLint recommended rules
    "no-unused-vars": "warn",
    "no-undef": "error",
    "prefer-const": "warn",
  }
};