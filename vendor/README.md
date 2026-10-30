# Vendored third-party code

These packages are kept in the repository so they don't need to be installed at runtime. Do not edit them except as listed below. Lint and typecheck ignore this folder.

| Folder | Package | Version | License | Source |
| --- | --- | --- | --- | --- |
| `zxing-library/` | `@zxing/library` | 0.23.0 | Apache-2.0 (`zxing-library/LICENSE`) | https://github.com/zxing-js/library, npm tarball `esm/` build |
| `ts-custom-error/` | `ts-custom-error` (runtime dependency of `@zxing/library`) | 3.3.1 | MIT (`ts-custom-error/LICENSE`) | https://github.com/adriengibrat/ts-custom-error, npm tarball `dist/custom-error.mjs` and `custom-error.d.ts` |

Used only by `src/components/barcode-scanner-dialog/barcodeDecoder.ts`. It's loaded with a dynamic `import()`, so it stays a separate lazily loaded chunk that loads when a scan starts. It is the default decoder, and `decoder="native"` opts into the browser `BarcodeDetector` instead.

## Local modifications

- `zxing-library/esm/core/Exception.{js,d.ts}`: the `ts-custom-error` import points to `../../../ts-custom-error/custom-error.mjs`.
- `ts-custom-error/custom-error.d.ts` is renamed to `custom-error.d.mts`, and the `sourceMappingURL` comment is removed (source maps aren't vendored).
- Only the ESM build and its `.d.ts` files are copied. The tests, CJS/UMD/ES2015 builds and source maps are omitted.

## Updating

```sh
V=<new version>
tmp=$(mktemp -d) && cd "$tmp"
npm pack @zxing/library@$V ts-custom-error@<compatible version>
tar xzf zxing-library-$V.tgz && mv package zxing && tar xzf ts-custom-error-*.tgz && mv package tce
cd - && rm -rf vendor/zxing-library/esm
cp -r "$tmp/zxing/esm" vendor/zxing-library/esm && cp "$tmp/zxing/LICENSE" vendor/zxing-library/LICENSE
cp "$tmp/tce/dist/custom-error.mjs" vendor/ts-custom-error/ && cp "$tmp/tce/dist/custom-error.d.ts" vendor/ts-custom-error/custom-error.d.mts && cp "$tmp/tce/LICENSE" vendor/ts-custom-error/
sed -i "s#from 'ts-custom-error'#from '../../../ts-custom-error/custom-error.mjs'#" vendor/zxing-library/esm/core/Exception.js vendor/zxing-library/esm/core/Exception.d.ts
sed -i '/sourceMappingURL/d' vendor/ts-custom-error/custom-error.mjs
```

Then update the versions in this file and run `npm run check && npm run build && npm run test:consumer`.
