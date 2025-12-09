module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },

  // Recommended ESLint + Prettier setup
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:prettier/recommended", // enables eslint-plugin-prettier
  ],

  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },

  plugins: [
    "import",
    "my-library", // 👈 custom plugin namespace for your library rules
  ],

  rules: {
    // --- General Best Practices ---
    "no-unused-vars": "warn",
    "no-console": "off",

    // --- Import Rules (ES Modules) ---
    "import/no-unresolved": "error",
    "import/no-absolute-path": "error",

    // --- Prettier Formatting Errors ---
    "prettier/prettier": ["error"],

    // --- Your Custom Rule Example ---
    // Example: enforce that all library files must use named exports only
    "my-library/enforce-named-exports": "warn",
  },
};
