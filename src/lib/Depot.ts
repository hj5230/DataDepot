import * as cryptojs from "crypto-js";

import * as Errors from "./Errors";

class Depot<T> {
  private depot: Map<string, T> | null;

  constructor() {
    this.depot = new Map<string, T>();
  }

  public setItem = (key: string, value: T): void => {
    if (!this.depot) throw new Errors.NullDepotError();
    if (this.depot.has(key))
      throw new Errors.KeyConflictError(key);
    try {
      JSON.stringify(value);
    } catch {
      throw new Errors.ValueMalformedError(value);
    }
    this.depot.set(key, value);
  };

  public getItem = (key: string): T | undefined => {
    if (!this.depot) throw new Errors.NullDepotError();
    if (!this.depot.has(key))
      throw new Errors.KeyNotFoundError(key);
    return this.depot.get(key);
  };

  public updateItem = (key: string, value: T): void => {
    if (!this.depot) throw new Errors.NullDepotError();
    if (!this.depot.has(key))
      throw new Errors.KeyNotFoundError(key);
    try {
      JSON.stringify(value);
    } catch {
      throw new Errors.ValueMalformedError(value);
    }
    this.depot.set(key, value);
  };

  public removeItem = (key: string): void => {
    if (!this.depot) throw new Errors.NullDepotError();
    if (!this.depot.has(key))
      throw new Errors.KeyNotFoundError(key);
    this.depot.delete(key);
  };

  public export = (): Record<string, T> => {
    if (!this.depot) throw new Errors.NullDepotError();
    return Object.fromEntries(this.depot);
  };

  public load = (data: Record<string, T>): void => {
    this.depot = new Map<string, T>(Object.entries(data));
  };

  public serialize = (key?: string): string => {
    if (!this.depot) throw new Errors.NullDepotError();
    const object = Object.fromEntries(this.depot);
    const string = JSON.stringify(object);
    if (key) {
      const encrypted = cryptojs.AES.encrypt(
        string,
        key
      ).toString();
      return encrypted;
    }
    return string;
  };

  public deserialize = (data: string, key?: string) => {
    if (key)
      data = cryptojs.AES.decrypt(data, key).toString(
        cryptojs.enc.Utf8
      );
    const object = JSON.parse(data);
    this.depot = new Map<string, T>(Object.entries(object));
  };

  public clear = (): void => {
    if (!this.depot) throw new Errors.NullDepotError();
    this.depot.clear();
  };

  public destory = (): void => {
    this.depot = null;
  };
}

export default Depot;
