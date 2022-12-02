import pkg from "./package.json" assert { type: "json" };

export default {
  input: "core.js",
  output: [
    { file: pkg.main, format: "cjs", exports: "default" },
    { file: pkg.module, format: "es", exports: "default" },
  ],
  external: [
    "path",
    "crypto",
    ...Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies }),
  ],
};
