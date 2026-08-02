<p align="center">
  <img src="assets/catbox-node.png">
</p>

![NPM Version](https://img.shields.io/npm/v/catbox-node)

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
  - [Catbox Album](#catbox-album)
    - [Create Catbox album](#create-catbox-album)
    - [Delete Catbox album](#delete-catbox-album)
    - [Edit Catbox album](#edit-catbox-album)
    - [Add to Catbox album](#add-to-catbox-album)
    - [Remove from Catbox album](#remove-from-catbox-album)
- [Litterbox](#litterbox)
  - [Upload to Litterbox from a File](#upload-to-litterbox-from-a-file)

---

### Catbox

`catbox-node` - main module with Catbox upload functions.

#### Upload to Catbox from a URL

```js
import { uploadUrl } from "catbox-node";

const catboxFileURL = await uploadUrl("https://example.com/file.txt");
```

#### Upload to Catbox from a File

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

---

#### Catbox Album

`catbox-node/album` - sub-module with Catbox album functions.

##### Create Catbox album

Albums created without a `userhash` are **anonymous**.

Albums created anonymously **CANNOT** be **edited** or **deleted**.

Albums are limited to `500` files.

Use `toFilename` utility to trim the filename from the Catbox URL.

```js
import { uploadFile } from "catbox-node";
import { toFilename } from "catbox-node/utils";
import { createAlbum } from "catbox-node/album";

// Upload a file to Catbox
const file = new File(["content"], "test.txt", { type: "text/plain" });
const catboxFileURL = await uploadFile(file);

// Extract the filename from the Catbox URL
const catboxFilename = toFilename(catboxFileURL);
const catboxFilenames = [catboxFilename];

// Create album with the uploaded file
const albumURL = await createAlbum("Title Here", "Description Here", catboxFilenames, {
  userhash: "####",
});

// Create anonymous album with the uploaded file
const anonAlbumURL = await createAlbum("Title Here", "Description Here", catboxFilenames);
```

##### Delete Catbox album

Only albums created with a `userhash` can be **deleted**.

Anonymous albums created without a `userhash` **CANNOT** be **deleted**.

Use `toShort` utility to get album `short` from the Catbox album URL.

```js
import { uploadFile } from "catbox-node";
import { toFilename, toShort } from "catbox-node/utils";
import { createAlbum, deleteAlbum } from "catbox-node/album";

// Upload a file to Catbox
const file = new File(["content"], "test.txt", { type: "text/plain" });
const catboxFileURL = await uploadFile(file);

// Extract filename from the Catbox URL
const catboxFilename = toFilename(catboxFileURL);
const catboxFilenames = [catboxFilename];

// Create album with the uploaded file
const myUserhash = "####";
const albumURL = await createAlbum("Title Here", "Description Here", catboxFilenames, {
  userhash: myUserhash,
});

// Delete created album
const albumShort = toShort(albumURL);
await deleteAlbum(albumShort, { userhash: myUserhash });
```

##### Edit Catbox album

Only albums created with a `userhash` can be **edited**.

Anonymous albums created without a `userhash` **CANNOT** be **edited**.

To only add new files, use [Add to Catbox album](#add-to-catbox-album).

Or if you just want to remove the files, use [Remove from Catbox album](#remove-from-catbox-album) instead.

```js
import { uploadFile } from "catbox-node";
import { toFilename, toShort } from "catbox-node/utils";
import { createAlbum, editAlbum } from "catbox-node/album";

const myUserhash = "####";
const catboxFileURL = new File(["content"], "a.txt", { type: "text/plain" });
const catboxFilename = toFilename(catboxFileURL);
const catboxFilenames = [catboxFilename];
const albumURL = await createAlbum("Title Here", "Description Here", catboxFilenames, {
  userhash: myUserhash,
});

const newCatboxFileURL = new File(["content"], "b.txt", { type: "text/plain" });
const newCatboxFilename = toFilename(newCatboxFileURL);
const newCatboxFilenames = [newCatboxFilename];
const albumShort = toShort(albumURL);

await editAlbum(albumShort, "New Title Here", "New Description Here", [newCatboxFilenames], {
  userhash: myUserhash,
});
```

##### Add to Catbox album

Only albums created with a `userhash` can **add** new files.

Anonymous albums created without a `userhash` **CANNOT** **add** new files.

```js
import { uploadFile } from "catbox-node";
import { toFilename, toShort } from "catbox-node/utils";
import { createAlbum, addToAlbum } from "catbox-node/album";

const myUserhash = "####";
const firstFileURL = new File(["content"], "a.txt", { type: "text/plain" });
const firstFilename = toFilename(firstFileURL);
const albumURL = await createAlbum("Title Here", "Description Here", [firstFilename], {
  userhash: myUserhash,
});

const secondFileURL = new File(["content"], "b.txt", { type: "text/plain" });
const secondFilename = toFilename(secondFileURL);
const albumShort = toShort(albumURL);

await addToAlbum(albumShort, [secondFilename], { userhash: myUserhash });
```

##### Remove from Catbox album

Only albums created with a `userhash` can **remove** files from the album.

Anonymous albums created without a `userhash` **CANNOT** **remove** files from the album.

```js
import { uploadFile } from "catbox-node";
import { toFilename, toShort } from "catbox-node/utils";
import { createAlbum, removeFromAlbum } from "catbox-node/album";

const myUserhash = "####";
const catboxFileURL = new File(["content"], "file.txt", { type: "text/plain" });
const catboxFilename = toFilename(catboxFileURL);
const albumURL = await createAlbum("Title Here", "Description Here", [catboxFilename], {
  userhash: myUserhash,
});
const albumShort = toShort(albumURL);

await removeFromAlbum(albumShort, [catboxFilename], { userhash: myUserhash });
```

### Litterbox

`catbox-node/litterbox` - sub-module with Litterbox upload functions.

#### Upload to Litterbox from a File

```js
import { uploadFile } from "catbox-node/litterbox";

const file = new File(["content"], "file.txt", { type: "text/plain" });

const litterboxURL = await uploadFile(file);
```
