import * as Errors from "./Errors";
import { Depot } from "./Depot";
import {
  ChunkReader,
  JsonReader,
  ObjectReader,
  FileReader,
  DirectoryReader,
} from "./Reader";
import {
  ChunkWriter,
  DirectoryWriter,
  JsonWriter,
} from "./Writer";

export class DataDepot {
  private constructor() {
    throw new Errors.InstantiateStaticClassError(
      "DataDepot"
    );
  }

  public static load = async <T>(
    depot: Depot<T>,
    basePath: string,
    chunkName: string,
    key?: string
  ): Promise<void> => {
    depot.load(
      await new ChunkReader<T>(basePath, chunkName).read(
        key
      )
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

  public static loadFromFile = <T>(
    depot: Depot<T>,
    filePath: string,
    encoding?: BufferEncoding
  ): void => {
    depot.load(
      new FileReader<T>(filePath, encoding).read()
    );
  };

  public static loadFromDirectory = <T>(
    depot: Depot<T>,
    dirPath: string,
    encoding?: BufferEncoding
  ): void => {
    depot.load(
      new DirectoryReader<T>(dirPath, encoding).read()
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
        ? depot._serialize(option.key)
        : depot._serialize();
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
    new JsonWriter(fileName).write(depot._serialize());
  };

  public static restoreDirectory = <T>(
    depot: Depot<T>,
    dirPath: string,
    toPath: string
  ): void => {
    new DirectoryWriter(dirPath, toPath).write(
      depot._serialize()
    );
  };
}