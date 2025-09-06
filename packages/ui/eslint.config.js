import { config } from "@repo/eslint-config/react-internal";

export default [
  {
    ignores: ["**/tailwind.config.js", "**/postcss.config.js", "**/*.config.mjs"],
  },
  ...config,
  {
    languageOptions: {
      globals: {
        module: "readonly",
      },
    },
  },
];