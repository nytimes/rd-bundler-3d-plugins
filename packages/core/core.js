import { createFilter, normalizePath } from "@rollup/pluginutils";
import { Logger, NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";
import draco3d from "draco3dgltf";
import crypto from "crypto";
import path from "path";

const PLUGIN_NAME = "gltf";

const HASH_LENGTH = 8;

const DEFAULT_PLUGIN_OPTIONS = {
  include: "**/*.{glb,gltf}",
  exclude: "",
  publicPath: "",
  transforms: [],
  extensions: ALL_EXTENSIONS,
  dependencies: null, // see plugin.buildStart()
  hash: true,
  verbose: false,
};

/**
 * Import and optimize glTF/GLB assets.
 *
 * @param {Object} pluginOptions
 * @param {string | string[]} pluginOptions.include Minimatch pattern, or array of patterns, specifying included files. Default: all.
 * @param {string | string[]} pluginOptions.exclude Minimatch pattern, or array of patterns, specifying excluded files. Default: none.
 * @param {string} pluginOptions.publicPath Path to prepend to all assets in the HTML output. Default: "".
 * @param {Transform[]} pluginOptions.transforms Array of transforms (see: @gltf-transform/functions) applied to all assets. Default: [].
 * @param {Extension[]} pluginOptions.extensions Array of extensions (see: @gltf-transform/extensions) registered for processing. Default: ALL_EXTENSIONS.
 * @param {Object} pluginOptions.dependencies Dictionary of extension dependencies (see: https://gltf-transform.donmccurdy.com/classes/core.platformio.html#registerdependencies). Default: Draco and Meshopt libraries.
 * @param {boolean} pluginOptions.hash Appends a unique hash to output files, e.g. 'scene.[hash].glb'. Default: true.
 * @param {boolean} pluginOptions.verbose Enables verbose logging while reading, optimizing, ard writing assets. Default: false.
 * @returns
 */
export default function gltf(pluginOptions = {}) {
  pluginOptions = { ...DEFAULT_PLUGIN_OPTIONS, ...pluginOptions };

  const filter = createFilter(pluginOptions.include, pluginOptions.exclude);

  const logger = pluginOptions.verbose
    ? new Logger(Logger.Verbosity.DEBUG)
    : new Logger(Logger.Verbosity.WARN);

  /** Singleton NodeIO instance reused for all reads/writes. */
  let io;

  /** Public path prepended to asset URLs. Does *not* affect the output location on disk. */
  let publicPath = pluginOptions.publicPath;

  /** Output location on disk. Inferred from Vite/Rollup configuration. */
  let outputPath = "";

  /** Vite configuration. Undefined in Rollup. */
  let viteConfig;

  return {
    name: PLUGIN_NAME,

    /* Type: (options: InputOptions) => InputOptions | null */
    /* Kind: sync, sequential                               */
    options(options) {},

    /* Type: (options: InputOptions) => void */
    /* Kind: async, parallel                 */
    async buildStart(options) {
      await MeshoptDecoder.ready;
      await MeshoptEncoder.ready;
      const DracoDecoder = await draco3d.createDecoderModule();
      const DracoEncoder = await draco3d.createEncoderModule();
      io = await new NodeIO()
        .setLogger(logger)
        .registerExtensions(pluginOptions.extensions)
        .registerDependencies(
          pluginOptions.dependencies || {
            "draco3d.decoder": DracoDecoder,
            "draco3d.encoder": DracoEncoder,
            "meshopt.decoder": MeshoptDecoder,
            "meshopt.encoder": MeshoptEncoder,
          }
        );
    },

    configResolved(config) {
      if (!publicPath) {
        if (config.base) {
          // https://vitejs.dev/guide/build.html#public-base-path
          publicPath = isAbsoluteURI(config.base)
            ? new URL(config.build.assetsDir, new URL(config.base)).href
            : normalizePath(path.join(config.base, config.build.assetsDir));
        } else {
          publicPath = config.build.assetsDir;
        }
      }

      outputPath = config.build.assetsDir;
      viteConfig = config;
    },

    /* Type: (id: string) =>
         string |
         null |
         { code: string, map?: string | SourceMap, ast?: ESTree.Program, moduleSideEffects?: boolean | null } */
    /* Kind: async, first */
    async load(id) {
      id = normalizePath(id);
      if (!filter(id)) return null;

      if (viteConfig && viteConfig.command !== "build") {
        // Don't use .emitFiles() in development mode.
        const servePath =
          "/" + path.relative(viteConfig.root, id).replaceAll(/\\/g, "/");
        return `export default new URL("${servePath}", location.href).href;`;
      }

      const t0 = performance.now();
      const { json, resources } = await io.readAsJSON(id);
      const inBytes = io.lastReadBytes;

      const hash = generateHash(json, resources);
      const extname = path.extname(id);
      let basename = path.basename(id, extname);
      if (pluginOptions.hash) basename += `.${hash}`;

      const publicAssetPath = publicPath + "/" + `${basename}.glb`;
      const outputAssetPath = path.join(outputPath, `${basename}.glb`);

      const document = await io.readJSON({ json, resources });
      await document.setLogger(logger).transform(...pluginOptions.transforms);

      this.emitFile({
        type: "asset",
        fileName: outputAssetPath,
        source: await io.writeBinary(document),
      });

      const outBytes = io.lastWriteBytes;
      const totalMS = performance.now() - t0;

      // Vite logs assets automatically, Rollup doesn't.
      if (!viteConfig) {
        console.log(
          "" +
            green("created ") +
            greenBold(path.join("dist", outputAssetPath)) +
            green(" in ") +
            greenBold(Math.round(totalMS) + "ms")
        );
      }

      return `export default new URL("${publicAssetPath}", location.href).href;`;
    },

    // TODO: https://github.com/nytimes/bundler-plugin-gltf/issues/7
    async writeBundle() {},
    async generateBundle() {},
  };
}

// Utilities.

function generateHash(json, resources) {
  const hash = crypto.createHash("sha1");

  // TODO: https://github.com/nytimes/bundler-plugin-gltf/issues/8
  hash.update(JSON.stringify(json));
  for (const path of Object.keys(resources).sort()) {
    hash.update(path);
    hash.update(resources[path]);
  }

  return hash.digest("hex").substring(0, HASH_LENGTH);
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function isAbsoluteURI(uri) {
  return (
    new URL(uri, "https://example.com").origin !==
    new URL("https://example.com").origin
  );
}

// CLI utilities.

const _reset = "\x1b[0m";
const _green = "\x1b[32m";
const _greenBold = "\x1b[1;32m";
const green = (text) => `${_green}${text}${_reset}`;
const greenBold = (text) => `${_greenBold}${text}${_reset}`;
