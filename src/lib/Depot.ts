import * as Errors from "./Errors";

class Depot<T> {
  private depot: Map<string, T>;

  constructor() {
    this.depot = new Map<string, T>();
  }

  setItem = (key: string, value: T): void => {
    if (this.depot.has(key))
      throw new Errors.KeyConflictError(key);
    try {
      JSON.stringify(value);
    } catch {
      throw new Errors.ValueMalformedError(value);
    }
    this.depot.set(key, value);
  };

  getItem = (key: string): T | undefined => {
    if (!this.depot.has(key))
      throw new Errors.KeyNotFoundError(key);
    return this.depot.get(key);
  };

  updateItem = (key: string, value: T): void => {
    if (!this.depot.has(key))
      throw new Errors.KeyNotFoundError(key);
    try {
      JSON.stringify(value);
    } catch {
      throw new Errors.ValueMalformedError(value);
    }
    this.depot.set(key, value);
  };

  removeItem = (key: string): void => {
    if (!this.depot.has(key))
      throw new Errors.KeyNotFoundError(key);
    this.depot.delete(key);
  };

  load = (stringData: string): void => {
    const object = JSON.parse(stringData);
    this.depot = new Map(Object.entries(object));
  };

  serialize = (): string => {
    const object = Object.fromEntries(this.depot);
    return JSON.stringify(object);
  };

  free = (): void => {
    this.depot.clear();
  };
}

export default Depot;
