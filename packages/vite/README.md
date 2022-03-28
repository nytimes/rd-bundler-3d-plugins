# @nyt/vite-plugin-gltf

[Vite](https://vitejs.dev/) plugin for optimizing glTF 3D models.

## Quickstart

Install:

```bash
npm install --save-dev @nyt/vite-plugin-gltf
```

Build:

```js
// vite.config.js
import gltf from '@nyt/vite-plugin-gltf';
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
