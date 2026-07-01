module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  env: {
    browser: true,
    es2020: true,
  },
  ignorePatterns: ["dist", "node_modules", "*.cjs", "scripts", "test/e2e"],
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "no-console": "off",
  },
};
