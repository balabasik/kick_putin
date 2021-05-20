module.exports = {
  parser: "babel-eslint",
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ["eslint:recommended", "plugin:react/recommended"],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
      ecmaFeatures: { modules: true },
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react", "react-native"],
  rules: {},
};
