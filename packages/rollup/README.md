# rollup-plugin-gltf

[Rollup](https://rollupjs.org/) plugin for optimizing glTF 3D models.

## Quickstart

Install:

```bash
npm install --save-dev rollup-plugin-gltf
```

Build:

```js
// rollup.config.js
import gltf from 'rollup-plugin-gltf';
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

## License

Apache License, Version 2.0.

> This repository is maintained by the Research & Development team at The New York Times and is provided as-is for your own use. For more information about R&D at the Times visit [rd.nytimes.com](https://rd.nytimes.com).
