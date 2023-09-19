import resolve from "@rollup/plugin-node-resolve";
import fs from "node:fs/promises";

const pkg = JSON.parse(await fs.readFile("./package.json"));

export default {
  input: "./vite.js",
  output: [
    { file: pkg.main, format: "cjs", exports: "default" },
    { file: pkg.module, format: "es", exports: "default" },
  ],
  plugins: [resolve()],
  external: [
    "path",
    "crypto",
    ...Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies }),
  ],
};
