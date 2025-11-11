module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "airbnb",
    "airbnb/hooks",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "prettier",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 15,
    sourceType: "module",
  },
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        moduleDirectory: ["src/", "node_modules"],
      },
    },
  },
  plugins: ["react", "prettier", "react-hooks"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "jsx-a11y/no-autofocus": "off",
    "import/prefer-default-export": "off",
    "jsx-a11y/mouse-events-have-key-events": "off",
    "array-callback-return": "off",
    "react-hooks/exhaustive-deps": "off",
    "react/no-array-index-key": "off",
    "jsx-a11y/no-static-element-interactions": "off",
    "import/no-named-as-default": "off",
    "import/no-named-as-default-member": "off",
    "jsx-a11y/label-has-associated-control": "off",
    "jsx-a11y/click-events-have-key-events": "off",
    "jsx-a11y/interactive-supports-focus": "off",
    "jsx-a11y/alt-text": "off",
    "class-methods-use-this": "off",
    "consistent-return": "off",
    "linebreak-style": "off",
    semi: "error",
    camelcase: "off",
    "default-param-last": "off",
    "react/function-component-definition": "off",
    // "no-noninteractive-element-to-interactive-role": "off",
    "jsx-a11y/no-noninteractive-element-interactions": "off",
    "max-len": [
      "error",
      {
        code: 150,
      },
    ],
    "prefer-destructuring": [
      "error",
      {
        object: true,
        array: false,
      },
    ],
    "react/jsx-filename-extension": [
      1,
      {
        extensions: [".js", ".jsx"],
      },
    ],
    "react/prop-types": 0,
    // "indent": ["error", 2],
    quotes: ["error", "double", { avoidEscape: true }],
    "prettier/prettier": [
      "off",
      {
        singleQuote: true,
        parser: "flow",
      },
      {
        usePrettierrc: true,
        endOfLine: "auto",
      },
    ],
    "no-console": "error",
    "array-bracket-spacing": ["error", "never"],
    "comma-dangle": "off",
    "react/jsx-props-no-spreading": "off",
    "no-param-reassign": [
      0,
      {
        props: false,
      },
    ],
    "comma-spacing": [
      "error",
      {
        before: false,
        after: true,
      },
    ],
    "no-trailing-spaces": "error",
    "no-multiple-empty-lines": "error",
    "no-unused-vars": "warn",
    "react/display-name": "off",
    "react/destructuring-assignment": "off",
    "no-empty": "off",
    "no-shadow": "off",
  },
};
