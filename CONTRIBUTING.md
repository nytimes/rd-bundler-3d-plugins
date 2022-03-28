# Contributing

Local development within this repository requires Yarn (but plugin users may use any client). 
Production `dependencies` must be installed separately for individual workspace packages, but development `devDependencies` can be shared in the workspace root. Yarn installs everything with `yarn install`, and will resolve dependencies in the workspace root when working with sub-packages.

- /
    - `/package.json` ... contains shared `devDependencies`
    - `/packages/` ... contains production `dependencies`
        - `/packages/core/package.json`
        - `/packages/rollup/package.json`
        - `/packages/vite/package.json`

To clone the repository, install dependencies, build, and run tests:

```bash
git clone <repo_url>
yarn install
yarn build
yarn test
```

To add a development dependency:

```bash
yarn add -D some-dev-dependency
```

To add a production dependency:

```bash
cd packages/some-package
yarn add some-prod-dependency
```

To publish a new release (maintainers only), run one of the following:

```bash
yarn publish:patch
yarn publish:minor
yarn publish:major
```
