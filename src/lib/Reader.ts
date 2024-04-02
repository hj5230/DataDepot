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
