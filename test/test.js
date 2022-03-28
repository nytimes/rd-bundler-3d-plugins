const assert = require("assert");
const rollupPlugin = require("rollup-plugin-gltf");
const vitePlugin = require("vite-plugin-gltf");

assert.strictEqual(rollupPlugin().name, "gltf");
assert.strictEqual(vitePlugin().name, "gltf");

console.log("✅ Passed");
