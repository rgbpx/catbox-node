<p align="center">
  <img src="assets/catbox-node.png">
</p>

# catbox-node

Lightweight Catbox.moe client for Node.js (and Bun) written in TypeScript with zero dependencies.

## Requirements

- Node.js version: `>= 20` (Apr 17, 2023)
- Bun version: `>= 1.0.36` (Mar 29, 2024)

## Installation

Install the package via `npm`:

```sh
npm install catbox-node
```

Install the package via `bun`:

```sh
bun add catbox-node
```

## Documentation

- [Catbox](#catbox)
  - [Upload to Catbox from a URL](#upload-to-catbox-from-a-url)
  - [Upload to Catbox from a File](#upload-to-catbox-from-a-file)
- [Litterbox](#litterbox)
  - [Upload to Litterbox from a File](#upload-to-litterbox-from-a-file)

---

### [Catbox](https://catbox.moe)

`catbox-node` - main module with [Catbox](#catbox) upload functions.

#### Upload to [Catbox](#catbox) from a `URL`

```js
import { uploadUrl } from "catbox-node";

const catboxFileURL = await uploadUrl("https://example.com/file.txt");
```

#### Upload to [Catbox](#catbox) from a `File`

```js
import { uploadFile } from "catbox-node";

const file = new File(["content"], "file.txt", { type: "text/plain" });

const catboxFileURL = await uploadFile(file);
```

or from a local path

```js
import path from "node:path";
import { readFile } from "node:fs/promises";
import { uploadFile } from "catbox-node";

const filePath = "/path/to/file";
const fileData = await readFile(filePath);
const fileName = path.basename(filePath);
const file = new File([fileData], fileName);

const catboxFileURL = await uploadFile(file);
```

or from a blob

```js
import { uploadFile } from "catbox-node";

const blob = new Blob(["content"], { type: "text/plain" });
const file = new File([blob], "text.txt");

const catboxFileURL = await uploadFile(file);
```

### [Litterbox](https://litterbox.catbox.moe)

`catbox-node/litterbox` - sub-module with [Litterbox](#litterbox) upload functions.

#### Upload to [Litterbox](#litterbox) from a `File`

```js
import { uploadFile } from "catbox-node/litterbox";

const file = new File(["content"], "file.txt", { type: "text/plain" });

const litterboxURL = await uploadFile(file);
```

## Development Requirements

- Node.js version: `>= 22.18.0`
- npm version: `>= 10.9.4`
  - Or with npm version: `>= 10.9.3` (bundled with Node.js `22.18.0`) with `npm install --legacy-peer-deps` to resolve `tsdown` install dependencies.
- Bun version: `>= 1.0.36`
