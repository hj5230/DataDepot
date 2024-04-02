# DataDepot

A file-based database system designed for storage, retrieval, and management of data. It offers multiple ways to read and store data, along with encryption functionality. DataDepot is an ideal solution for small to medium-sized projects that require a lightweight yet powerful data storage option without the overhead of traditional databases.

# Usage

### Installation

**npm**

```bash
npm install datadepot
```

**yarn**

```bash
yarn add datadepot
```

**pnpm**

```bash
pnpm add datadepot
```

### Importing

**cjs**

```javascript
const { DataDepot, Depot } = require("datadepot");
```

**esm**

```javascript
import { DataDepot, Depot } from "datadepot";
```

### Creating a db / storage container

```javascript
const store = new Depot();
```

**With TypeScript, you may declare storage type**

```typescript
const store = new Depot<Record<string, unknown>>();
```

### CURD Operations

```javascript
store.setItem("data", { foo: "foo", bar: "bar" });
store.updateItem("data", { foo: "bar" });
store.getItem("data"); // { foo: 'bar' }
store.removeItem("data");
```

One may not duplicate setting keys, update, get or remove a non-existent key, otherwise an exception will be thrown to force the program terminates.

### Exporting and loading

```javascript
store.load({ data: { foo: "foo", bar: "bar" } });
const json = store.export(); // { data: { foo: 'foo', bar: 'bar' } }
```

The method `load()` will load data and overwrite all data in the db/storage container.

The method `export()` will export all the keys and their data in json form.

These two operations shall not be often used unless necessary.

### Clear & destroy

```javascript
store.clear();
```

After calling the member method clear(), the db/storage container will be cleared.

```javascript
store.destory();
```

After calling the member method destory(), the db/storage container will be destroyed, accessing the db/storage container afterwards in any way will lead to an exception.

### Writting and Reading

**Write into a chunk file with default options**

```javascript
DataDepot.write(store, ".");
```

All the data in the db/storage container will be serialized, compressed and save into a single chunk file with the specified directory. The chunk name would be an unix timestamp.

**Specifying options**

```javascript
DataDepot.write(store, ".", {
    chunkName: "sampleChunk",
    key: "sampleKey",
});
```

The above example will save the data in a file named sampleChunk. And the file is symmetrically encrypted by the AES algorithm, and the key will be needed when reading the file.

**Dump into multiple files**

```javascript
DataDepot.write(store, ".", {
    chunkName: "sampleChunk",
    key: "sampleKey",
    maxChunkCount: 3
});
```

With `maxChunkCount` option, the data will be evenly save into `n` chunk files.

```javascript
DataDepot.write(store, ".", {
    chunkName: "sampleChunk",
    key: "sampleKey",
    maxChunkSize: 1000,
});
```

With `maxChunkSize` option, the max size of a chunk file can be specified, when the max size is reached, it will move on to next chunk file.

However, you may only specify one of the `maxChunkCount` or `maxChunkSize` option, or  an exception will be thrown.

**Read from chunk file(s)**

```javascript
DataDepot.load(store, ".", "sampleChunk", "sampleKey");
```

One don't need to worries about multiple file, it will find all chunk files belong to the same chunk name. Key can be omitted if it is not specified when writing.

**write and read from json file**

```javascript
DataDepot.writeToJson(store, "sample.json");
DataDepot.loadFromJson(store, "sample.json");
```

### About object

```javascript
class SampleClass {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
}

DataDepot.insertAnObject(store, "object", new SampleClass("a", "b"));
store.getItem("object"); // { a: 'a', b: 'b' }

DataDepot.loadFromObject(store, new SampleClass("a", "b"));
store.getItem("a"); // a
```

One may directly insert an object into the db/storage container, or use an object as data (overwritting all the data in db/storage container).
