import * as cryptojs from "crypto-js";
import * as msgpack from "msgpack-lite";

import * as Errors from "./Errors";

export class Depot<T> {
  private depot: Map<string, T> | null;

  constructor() {
    this.depot = new Map<string, T>();
  }

  public setItem = (key: string, value: T): void => {
    if (!this.depot) throw new Errors.NullDepotError();
    if (this.depot.has(key))
      throw new Errors.KeyConflictError(key);
    try {
      msgpack.encode(value);
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
      msgpack.encode(value);
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

  public _serialize = (key?: string): Buffer => {
    if (!this.depot) throw new Errors.NullDepotError();
    const object = Object.fromEntries(this.depot);
    const buffer = msgpack.encode(object);
    if (key) {
      const encrypted = cryptojs.AES.encrypt(
        buffer.toString("base64"),
        key
      ).toString();
      return Buffer.from(encrypted);
    }
    return buffer;
  };

  public _deserialize = (data: Buffer, key?: string) => {
    if (key) {
      const decrypted = cryptojs.AES.decrypt(data.toString(), key).toString(
        cryptojs.enc.Utf8
      );
      data = Buffer.from(decrypted, "base64");
    }
    const object = msgpack.decode(data);
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