import * as path from "path";
import * as fs from "fs";
import * as zstd from "zstd.ts";
import * as cryptojs from "crypto-js";

import * as Errors from "./Errors";

abstract class Reader<T> {
  public abstract read(key?: string): Record<string, T>;
}

export class ChunkReader<T> extends Reader<T> {
  private basePath: string;
  private chunkName: string;

  constructor(basePath: string, chunkName: string) {
    super();
    this.basePath = basePath;
    this.chunkName = chunkName;
  }

  private getChunkFileName = (index: number): string => {
    return path.join(
      this.basePath,
      `${this.chunkName}-${index}.cdu`
    );
  };

  private readWithoutParse = (): string => {
    const chunks = [];
    let i = 0;
    while (fs.existsSync(this.getChunkFileName(i))) {
      const chunk = fs.readFileSync(
        this.getChunkFileName(i)
      );
      chunks.push(chunk);
      i++;
    }
    if (i === 0)
      throw new Errors.ChunkDoesNotExistError(
        this.chunkName
      );
    const concated = Buffer.concat(chunks);
    const stringData = zstd
      .decompressSync({ input: concated })
      .toString("utf-8");
    return stringData;
  };

  private readWithKey = (
    key: string
  ): Record<string, T> => {
    const data = cryptojs.AES.decrypt(
      this.readWithoutParse(),
      key
    ).toString(cryptojs.enc.Utf8);
    return JSON.parse(data);
  };

  public read = (key?: string): Record<string, T> => {
    if (key) return this.readWithKey(key);
    return JSON.parse(this.readWithoutParse());
  };
}

export class JsonReader<T> extends Reader<T> {
  private filePath: string;
  private encoding: BufferEncoding;

  constructor(filePath: string, encoding?: BufferEncoding) {
    super();
    this.filePath = filePath;
    this.encoding = encoding || "utf8";
  }

  public read = (): Record<string, T> => {
    const content = fs.readFileSync(
      this.filePath,
      this.encoding
    );
    return JSON.parse(content);
  };
}

export class ObjectReader<T> extends Reader<T> {
  private object: object;

  constructor(object: object) {
    super();
    this.object = object;
  }

  public read = (): Record<string, T> => {
    return JSON.parse(JSON.stringify(this.object));
  };
}

export class FileReader<T> extends Reader<T> {
  private filePath: string;
  private encoding: BufferEncoding;

  constructor(filePath: string, encoding?: BufferEncoding) {
    super();
    this.filePath = filePath;
    this.encoding = encoding || "utf8";
  }

  public read = (): Record<string, T> => {
    if (!fs.existsSync(this.filePath)) {
      throw new Error(
        `File does not exist: ${this.filePath}`
      );
    }
    const content = fs.readFileSync(
      this.filePath,
      this.encoding
    );
    return { [this.filePath]: content as T };
  };
}

export class DirectoryReader<T> extends Reader<T> {
  private dirPath: string;
  private encoding: BufferEncoding;

  constructor(dirPath: string, encoding?: BufferEncoding) {
    super();
    this.dirPath = dirPath;
    this.encoding = encoding || "utf8";
  }

  private readDirectory = (
    currentPath: string
  ): Record<string, T> => {
    const entries = fs.readdirSync(currentPath, {
      withFileTypes: true,
    });
    const result: Record<string, T> = {};

    for (const entry of entries) {
      const entryPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        Object.assign(
          result,
          this.readDirectory(entryPath)
        );
      } else {
        const content = fs.readFileSync(
          entryPath,
          this.encoding
        );
        result[entryPath] = content as T;
      }
    }
    return result;
  };

  public read = (): Record<string, T> => {
    if (!fs.existsSync(this.dirPath)) {
      throw new Error(
        `Directory does not exist: ${this.dirPath}`
      );
    }
    return this.readDirectory(this.dirPath);
  };
}
