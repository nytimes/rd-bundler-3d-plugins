const assert = require("assert");
const rollupPlugin = require("@nyt/rollup-plugin-gltf");
const vitePlugin = require("@nyt/vite-plugin-gltf");

assert.strictEqual(rollupPlugin().name, "gltf");
assert.strictEqual(vitePlugin().name, "gltf");

console.log("✅ Passed");
