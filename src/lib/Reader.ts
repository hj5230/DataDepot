import * as path from "path";
import * as fs from "fs";
import * as zlib from "zlib";

abstract class Reader {
  abstract read(): Record<string, unknown>;
}

export class ChunkReader extends Reader {
  private basePath: string;
  private depotName: string;

  constructor(basePath: string, depotName: string) {
    super();
    this.basePath = basePath;
    this.depotName = depotName;
  }

  private getChunkName(index: number): string {
    return path.join(
      this.basePath,
      `${this.depotName}-${index}.bdc`
    );
  }

  read(): Record<string, unknown> {
    const chunks = [];
    let i = 0;
    while (fs.existsSync(this.getChunkName(i))) {
      const chunk = fs.readFileSync(this.getChunkName(i));
      chunks.push(zlib.gunzipSync(chunk));
      i++;
    }
    const stringData =
      Buffer.concat(chunks).toString("utf-8");
    return JSON.parse(stringData);
  }
}

type BufferEncoding =
  | "ascii"
  | "utf8"
  | "utf-8"
  | "utf16le"
  | "utf-16le"
  | "ucs2"
  | "ucs-2"
  | "base64"
  | "base64url"
  | "latin1"
  | "binary"
  | "hex";

export class JsonReader extends Reader {
  private filePath: string;
  private encoding: BufferEncoding;

  constructor(filePath: string, encoding?: BufferEncoding) {
    super();
    this.filePath = filePath;
    this.encoding = encoding || "utf8";
  }

  read = (): Record<string, unknown> => {
    const content = fs.readFileSync(
      this.filePath,
      this.encoding
    );
    return JSON.parse(content);
  };
}

export class ObjectReader extends Reader {
  private object: object;

  constructor(object: object) {
    super();
    this.object = object;
  }

  read = (): Record<string, unknown> => {
    return JSON.parse(JSON.stringify(this.object));
  };
}
