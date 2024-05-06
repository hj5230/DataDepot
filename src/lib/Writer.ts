import * as fs from "fs";
import * as path from "path";
import * as zstd from "zstd.ts";

import * as Errors from "./Errors";

abstract class Writer {
  public abstract write(data: string): void;
}

export class ChunkWriter extends Writer {
  private basePath: string;
  private chunkName: string;
  private maxChunkSize: number | null = null;
  private maxChunkCount: number | null = null;
  private totalSize: number = 0;

  constructor(
    basePath: string,
    option?: {
      chunkName?: string;
      maxChunkSize?: number;
      maxChunkCount?: number;
    }
  ) {
    super();
    if (!option) {
      this.basePath = basePath;
      this.chunkName = Date.now().toString();
      return;
    }
    if (option.maxChunkSize && option.maxChunkCount) {
      throw new Errors.IllegalParameterError(
        "You can only specify either maxChunkSize or maxChunkCount"
      );
    }
    this.basePath = basePath;
    this.chunkName =
      option.chunkName || Date.now().toString();
    this.maxChunkSize = option.maxChunkSize || null;
    this.maxChunkCount = option.maxChunkCount || null;
  }

  private getChunkFileName = (index: number): string => {
    return path.join(
      this.basePath,
      `${this.chunkName}-${index}.cdu`
    );
  };

  public write = async (data: string): Promise<void> => {
    const buffer = Buffer.from(data, "utf-8");
    // const compressed = zstd.compressSync({ input: buffer });
    const compressed = await zstd.compress({
      input: buffer,
    });
    this.totalSize = compressed.length;
    if (this.maxChunkSize !== null) {
      const chunkCount = Math.ceil(
        this.totalSize / this.maxChunkSize
      );
      for (let i = 0; i < chunkCount; i++) {
        const start = i * this.maxChunkSize;
        const end = Math.min(
          start + this.maxChunkSize,
          this.totalSize
        );
        const chunk = compressed.subarray(start, end);
        fs.writeFileSync(this.getChunkFileName(i), chunk);
      }
    } else if (this.maxChunkCount !== null) {
      const chunkSize = Math.ceil(
        this.totalSize / this.maxChunkCount
      );
      for (let i = 0; i < this.maxChunkCount; i++) {
        const start = i * chunkSize;
        const end = Math.min(
          start + chunkSize,
          this.totalSize
        );
        const chunk = compressed.subarray(start, end);
        fs.writeFileSync(this.getChunkFileName(i), chunk);
      }
    } else {
      fs.writeFileSync(
        this.getChunkFileName(0),
        compressed
      );
    }
  };
}

export class JsonWriter extends Writer {
  private fileName: string;

  constructor(fileName: string) {
    super();
    this.fileName = fileName;
  }

  public write = (data: string): void => {
    fs.writeFileSync(this.fileName, data);
  };
}

export class DirectoryWriter extends Writer {
  private dirPath: string;
  private toPath: string;

  constructor(dirPath: string, toPath: string) {
    super();
    this.dirPath = dirPath;
    this.toPath = toPath;
  }

  public write(data: string): void {
    if (!fs.existsSync(this.toPath)) {
      fs.mkdirSync(this.toPath, { recursive: true });
    }
    for (const [filePath, content] of Object.entries(
      data
    )) {
      if (filePath.startsWith(this.dirPath)) {
        const relativePath = path.relative(
          this.dirPath,
          filePath
        );
        const fullPath = path.join(
          this.toPath,
          relativePath
        );
        const fileDir = path.dirname(fullPath);
        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true });
        }
        fs.writeFileSync(fullPath, JSON.stringify(content));
      }
    }
  }
}
