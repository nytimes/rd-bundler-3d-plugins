# bundler-plugin-gltf

Bundler plugins for optimizing glTF 3D models (.gltf and .glb files).

_Created by [R&D @ The New York Times](https://rd.nytimes.com/)._

## Overview

Monorepo containing plugins for two popular bundlers (Vite and Rollup) allowing each to process and optimize 3D models used by a web application. While bundlers can process traditional web content — like CSS or images — out of the box or with existing plugins, bundlers lack any understanding of 3D content. This project orchestrates processing of models using the [glTF-Transform](https://gltf-transform.donmccurdy.com/) library, and includes configuration flexible enough to select among existing processing stages or to define and add new methods.

Dependencies:

- [glTF Transform](https://gltf-transform.donmccurdy.com/): general-purpose glTF processing library
- [Draco](https://github.com/google/draco/): compression for mesh geometry
- [Meshoptimizer](https://github.com/zeux/meshoptimizer): compression for mesh geometry, point geometry, animation, and morph targets

## Quickstart

Rollup:

```shell
npm install --save-dev @nyt/rollup-plugin-gltf
```

Vite:

```shell
npm install --save-dev @nyt/vite-plugin-gltf
```

## Examples

The plugin is unopinionated about which optimizations should be applied to your glTF models. Many optimizations are available off the shelf from [`@gltf-transform/functions`](https://gltf-transform.donmccurdy.com/functions.html):

```js
// *.config.js
import gltf from '@nyt/rollup-plugin-gltf'; // (a) Rollup
import gltf from '@nyt/vite-plugin-gltf'; // (b) Vite

import { dedup, draco, prune, textureResize, mozjpeg, oxipng } from "@gltf-transform/functions";
import * as squoosh from "@squoosh/lib";

return {
  // ...
  plugins: [
    gltf({
      transforms: [
        // remove unused resources
        prune(),
        // combine duplicated resources
        dedup(),
        // keep textures under 2048x2048
        textureResize({ size: [2048, 2048] }),
        // optimize images
        mozjpeg({ squoosh }),
        oxipng({ squoosh }),
        // compress mesh geometry
        draco(),
      ]
    })
  ]
}
```

Other types of processing can be customized to the needs of your project. For example, the custom transform below converts double-sided materials to single-sided materials, helping to improve [fillrate](https://en.wikipedia.org/wiki/Fillrate):

```js
// *.config.js
import gltf from '@nyt/rollup-plugin-gltf'; // (a) Rollup
import gltf from '@nyt/vite-plugin-gltf'; // (b) Vite

const frontSide = (options) => {
  return async (document) => {
    for (const material of document.getRoot().listMaterials()) {
      material.setDoubleSided(false);
    }
  };
};

return {
  // ...
  plugins: [
    gltf({ transforms: [ frontSide() ] })
  ]
}
```

## Roadmap

We believe this is the first open source project bringing optimization of 3D scenes into the standard build tools used for modern web application development. As such, the boundaries of the project's scope are likely to evolve. The Q&A below tries to address some likely questions about scope, but please feel free to open issues or discussions on GitHub with questions.

**Will you support other bundlers?**

Yes, but only with your help. We hope this project is structured to make extension to other web-related build tools possible. But we aren't currently working with other build tools ourselves, and would prefer that development for those tools be driven by users who are. If that's you, please file an issue or PR on GitHub!

**Will you support _&lt;specific optimization&gt;_?**

Yes, but requests for particular optimization features are best directed to the optimization tools we already use. We configure bundlers to process 3D assets with existing optimization tools. New optimizations will become available here as those tools evolve.

**Will you support other optimization tools?**

Maybe. We're using glTF-Transform because it's compatible with a JavaScript runtime, provides integrations with other optimization tools (Draco, Meshopt, Squoosh), and is extensible enough to allow end-users to define new processing stages easily. We'd encourage you to see if your processing goals can be implemented within that framework, but would be glad to hear from you if not.

**Will you support other file formats _as input_?**

Probably not. Conversions between arbitrary file formats are not clean 1:1 mappings, and often require significant adjustments, making this a process better handled offline, with a human in the loop, rather than at build time. As the tooling and file format ecosystems evolve, we may reconsider.

At present, we support only glTF (.gltf, .glb) files as input.

**Will you support other file formats _as output_?**

Maybe, in cases where the feature mappings between file formats can be clearly defined (see above), and the output format has significant advantages as a last-mile format for runtime delivery. Many file formats do not support the types of optimizations that motivate the creation of this project, and we consider such formats out of scope. Formats like 3D Tiles or USDZ may be worth discussing.

At present, we support only glTF (.gltf, .glb) files as output.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Apache License, Version 2.0. See [LICENSE](./LICENSE).
