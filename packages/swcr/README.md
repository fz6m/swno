# swcr

Swc register for node.js. Efficient typescript runtime.

## Install

```bash
npm i -D swcr @swc/core regenerator-runtime
# or
yarn add -D swcr @swc/core regenerator-runtime
# or
pnpm add -D swcr @swc/core regenerator-runtime
```

## Usage

```bash
node -r swcr file.ts
```

You can custom `jsxFactory`, `jsxFragmentFactory`, `target` in your `tsconfig.json`.

## Methods

```ts
const { register } = require('swcr/dist/node')

const { unregister } = register({
  // ...options
})

// Unregister the require hook if you don't need it anymore
unregister()
```

## Thanks/Inspiration

- [esbuild-register](https://github.com/egoist/esbuild-register) - This project most ideas are based on esbuild-register.

## License

MIT
