import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import react from "eslint-plugin-react";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    ignores: ["dist", "node_modules", "build"],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
      import: importPlugin,
      prettier,
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx"],
        },
      },
    },
    rules: {
      // React rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/jsx-filename-extension": ["warn", { extensions: [".js", ".jsx"] }],
      "react/function-component-definition": "off",
      "react/jsx-props-no-spreading": "off",
      "react/display-name": "off",
      "react/destructuring-assignment": "off",
      "react/no-array-index-key": "off",

      // React Hooks
      ...reactHooks.configs.recommended.rules,
      "react-hooks/exhaustive-deps": "off",

      // JSX A11y
      "jsx-a11y/no-autofocus": "off",
      "jsx-a11y/mouse-events-have-key-events": "off",
      "jsx-a11y/no-static-element-interactions": "off",
      "jsx-a11y/label-has-associated-control": "off",
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/interactive-supports-focus": "off",
      "jsx-a11y/alt-text": "off",
      "jsx-a11y/no-noninteractive-element-interactions": "off",

      // Import rules
      "import/prefer-default-export": "off",
      "import/no-named-as-default": "off",
      "import/no-named-as-default-member": "off",

      // General rules
      "no-console": "error",
      "no-unused-vars": "warn",
      "no-param-reassign": ["off", { props: false }],
      "no-shadow": "off",
      "no-empty": "off",
      "no-trailing-spaces": "error",
      "no-multiple-empty-lines": "error",

      // Code style
      semi: "error",
      quotes: ["error", "double", { avoidEscape: true }],
      camelcase: "off",
      "linebreak-style": "off",
      "array-callback-return": "off",
      "class-methods-use-this": "off",
      "consistent-return": "off",
      "default-param-last": "off",
      "array-bracket-spacing": ["error", "never"],
      "comma-dangle": "off",
      "comma-spacing": ["error", { before: false, after: true }],

      "max-len": ["error", { code: 150 }],
      "prefer-destructuring": ["error", { object: true, array: false }],

      // Prettier (turned off to avoid conflicts)
      "prettier/prettier": "off",
    },
  },
  prettierConfig,
];
