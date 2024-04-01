import * as Errors from "./lib/Errors";
import Depot from "./lib/Depot";
import {
  ChunkReader,
  JsonReader,
  ObjectReader,
} from "./lib/Reader";
import { ChunkWriter, JsonWriter } from "./lib/Writer";

export class DataDepot {
  private constructor() {
    throw new Errors.InstantiateStaticClassError(
      "DataDepot"
    );
  }

  public static load = <T>(
    depot: Depot<T>,
    basePath: string,
    chunkName: string,
    key?: string
  ): void => {
    depot.load(
      new ChunkReader<T>(basePath, chunkName).read(key)
    );
  };

  public static loadFromJson = <T>(
    depot: Depot<T>,
    filePath: string,
    encoding?: BufferEncoding
  ): void => {
    depot.load(
      new JsonReader<T>(filePath, encoding).read()
    );
  };

  public static loadFromObject = <T>(
    depot: Depot<T>,
    object: object
  ) => {
    depot.load(new ObjectReader<T>(object).read());
  };

  public static insertAnObject = <T>(
    depot: Depot<T>,
    key: string,
    object: object
  ) => {
    depot.setItem(
      key,
      new ObjectReader<T>(object).read() as unknown as T
    );
  };

  public static write = <T>(
    depot: Depot<T>,
    basePath: string,
    option?: {
      chunkName?: string;
      key?: string;
      maxChunkSize?: number;
      maxChunkCount?: number;
    }
  ): void => {
    const serialized =
      option?.key !== undefined
        ? depot.serialize(option.key)
        : depot.serialize();
    if (option) {
      const { chunkName, maxChunkSize, maxChunkCount } =
        option;
      new ChunkWriter(basePath, {
        chunkName,
        maxChunkSize,
        maxChunkCount,
      }).write(serialized);
    } else {
      new ChunkWriter(basePath).write(serialized);
    }
  };

  public static writeToJson = <T>(
    depot: Depot<T>,
    fileName: string
  ): void => {
    new JsonWriter(fileName).write(depot.serialize());
  };
}

export * from "./lib/Depot";
