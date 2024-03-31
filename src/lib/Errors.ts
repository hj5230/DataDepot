class ErrorTemplate extends Error {
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
    super(`Value ${value} is not a legal json instance`);
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
