import fs from "node:fs/promises";

const pkg = JSON.parse(await fs.readFile("./package.json"));

export default {
  input: "./core.js",
  output: [
    { file: pkg.main, format: "cjs", exports: "default" },
    { file: pkg.exports.default, format: "es", exports: "default" },
  ],
  external: [
    "path",
    "crypto",
    ...Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies }),
  ],
};
