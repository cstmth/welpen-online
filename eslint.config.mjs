/**
 * Root flat ESLint config to lint both client (Next.js) and shared/server TypeScript.
 * - Uses typescript-eslint recommended rules (no type-checking required)
 * - Enforces unused import cleanup and basic import ordering
 * - Ignores Next.js build output and node_modules
 */
import eslintPluginImport from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

export default [
  // Ignores
  {
    ignores: [
      "node_modules/**",
      "client/.next/**",
      "client/.turbo/**",
      "client/.vercel/**",
      "client/dist/**",
      "client/types/validator.ts",
      "**/*.d.ts",
    ],
  },

  // Base TypeScript recommendations (non-type-aware)
  ...tseslint.configs.recommended,

  // Project rules
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      import: eslintPluginImport,
      "unused-imports": unusedImports,
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // Prefer removing unused imports over unused vars (handled by TS anyway)
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",

      // Reasonable import ordering
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],

      // Stylistic preferences kept minimal to defer to Prettier
      "no-console": "off",
    },
  },
];
