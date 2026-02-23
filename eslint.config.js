const { FlatCompat } = require("@eslint/eslintrc");
const javascript = require("@eslint/js");
const tseslint = require("typescript-eslint");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const jsxA11y = require("eslint-plugin-jsx-a11y");

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.extends("universe", "universe/native"),
  {
    rules: {
      "@typescript-eslint/no-require-imports": ["error", { allow: [".svg", ".png", ".jpg", ".jpeg", ".gif", ".ttf", ".otf"] }],
    },
  },
];
