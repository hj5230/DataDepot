import * as path from "path";
import * as fs from "fs";
import * as zstd from "zstd.ts";
import * as cryptojs from "crypto-js";

abstract class Reader<T> {
  public abstract read(key?: string): Record<string, T>;
}

export class ChunkReader<T> extends Reader<T> {
  private basePath: string;
  private depotName: string;

  constructor(basePath: string, depotName: string) {
    super();
    this.basePath = basePath;
    this.depotName = depotName;
  }

  private getChunkName = (index: number): string => {
    return path.join(
      this.basePath,
      `${this.depotName}-${index}.cdu`
    );
  };

  private readWithoutParse = (): string => {
    const chunks = [];
    let i = 0;
    while (fs.existsSync(this.getChunkName(i))) {
      const chunk = fs.readFileSync(this.getChunkName(i));
      chunks.push(chunk);
      i++;
    }
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
