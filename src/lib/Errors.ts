abstract class ErrorTemplate extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ErrorTemplate";
  }
}

export class KeyConflictError extends ErrorTemplate {
  constructor(key: string) {
    super(`Key '${key}' already exists in Depot`);
    this.name = "KeyConflictError";
  }
}

export class KeyNotFoundError extends ErrorTemplate {
  constructor(key: string) {
    super(`Key ${key} does not exist in Depot`);
    this.name = "KeyNotFoundError";
  }
}

export class ValueMalformedError<T> extends ErrorTemplate {
  constructor(value: T) {
    super(
      `Value ${value} is not or cannot convert to a legal json instance`
    );
    this.name = "ValueMalformedError";
  }
}

export class IllegalParameterError extends ErrorTemplate {
  constructor(message: string) {
    super(message);
    this.name = "IllegalParameter";
  }
}

export class IllegalStateError extends ErrorTemplate {
  constructor(message: string) {
    super(message);
    this.name = "IllegalStateError";
  }
}

export class InstantiateStaticClassError extends ErrorTemplate {
  constructor(className: string) {
    super(
      `${className} is a static class and shall not be instantiated.`
    );
    this.name = "InstantiateStaticClassError";
  }
}

export class NullDepotError extends ErrorTemplate {
  constructor() {
    super(
      "Depot has been destroyed and can no longer be accessed"
    );
    this.name = "NullDepotError";
  }
}

export class ChunkDoesNotExistError extends ErrorTemplate {
  constructor(chunkName: string) {
    super(`Chunk ${chunkName} does not exist`);
    this.name = "ChunkDoesNotExistError";
  }
}

export class FileDoesNotExistError extends ErrorTemplate {
  constructor(fileName: string) {
    super(`File ${fileName} does not exist`);
    this.name = "FileDoesNotExistError";
  }
}

export class DirectoryDoesNotExistError extends ErrorTemplate {
  constructor(dirName: string) {
    super(`Directory ${dirName} does not exist`);
    this.name = "DirectoryDoesNotExistError";
  }
}
