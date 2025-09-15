import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".sst/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
  ]),
]);

export default eslintConfig;

// import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
// import nextTypescript from "eslint-config-next/typescript";
// import { dirname } from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const eslintConfig = [...nextCoreWebVitals, ...nextTypescript, {
//   ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
// }];

// export default eslintConfig;
