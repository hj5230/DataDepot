import * as fs from "fs";
import * as path from "path";
import * as zlib from "zlib";
import * as Errors from "./Errors";

class Writer {
  private basePath: string;
  private depotName: string;
  private maxChunkSize: number | null = null;
  private maxChunkCount: number | null = null;
  private totalSize: number = 0;

  constructor(
    basePath: string,
    params?: {
      depotName?: string;
      maxChunkSize?: number;
      maxChunkCount?: number;
    }
  ) {
    if (!params) {
      this.basePath = basePath;
      this.depotName = Date.now().toString();
      return;
    }
    if (params.maxChunkSize && params.maxChunkCount) {
      throw new Errors.IllegalParameterError(
        "You can only specify either maxChunkSize or maxChunkCount"
      );
    }
    this.basePath = basePath;
    this.depotName =
      params.depotName || Date.now().toString();
    this.maxChunkSize = params.maxChunkSize || null;
    this.maxChunkCount = params.maxChunkCount || null;
  }

  private getChunkName(index: number): string {
    return path.join(
      this.basePath,
      `${this.depotName}-${index}.bdc`
    );
  }

  write(data: string): void {
    const buffer = Buffer.from(data, "utf-8");
    const gzipped = zlib.gzipSync(buffer);
    this.totalSize = gzipped.length;
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
        const chunk = gzipped.subarray(start, end);
        fs.writeFileSync(this.getChunkName(i), chunk);
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
        const chunk = gzipped.subarray(start, end);
        fs.writeFileSync(this.getChunkName(i), chunk);
      }
    } else {
      fs.writeFileSync(this.getChunkName(0), gzipped);
    }
  }
}

export default Writer;
