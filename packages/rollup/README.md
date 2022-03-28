# @nyt/rollup-plugin-gltf

[Rollup](https://rollupjs.org/) plugin for optimizing glTF 3D models.

## Quickstart

Install:

```bash
npm install --save-dev @nyt/rollup-plugin-gltf
```

Build:

```js
// rollup.config.js
import gltf from '@nyt/rollup-plugin-gltf';
import { textureResize } from '@gltf-transform/functions';

export default {
  plugins: [ 
    gltf({
      transforms: [ textureResize({ size: [ 1024, 1024 ] }) ]
    }) 
  ]
  // ...
};
```
