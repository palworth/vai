import { dirname } from "path"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [

  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Disable globally
    },
  },
  {
    files: ["**/firebaseRulesTest.ts", "**/firebaseRulesTest.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
]

export default eslintConfig
