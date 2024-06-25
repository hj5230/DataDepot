/* eslint-disable @typescript-eslint/no-var-requires */
const { DataDepot, Depot } = require("datadepot");

describe("test:cjs", () => {
  let store;

  beforeEach(() => {
    store = new Depot();
  });

  afterEach(() => {
    store.clear();
    store.destory();
  });

  test("CURD", () => {
    expect(() => {
      store.getItem("name");
    }).toThrow(new Error("Key name does not exist in Depot"));

    store.setItem("name", "John Doe");
    expect(store.getItem("name")).toBe("John Doe");

    store.setItem("age", 30);
    expect(store.getItem("age")).toBe(30);

    store.setItem("isAdult", true);
    expect(store.getItem("isAdult")).toBe(true);

    store.setItem("address", { city: "New York", country: "USA" });
    expect(store.getItem("address")).toEqual({ city: "New York", country: "USA" });

    store.updateItem("name", "Zhang San");
    expect(store.getItem("name")).toBe("Zhang San");

    store.removeItem("age");
    expect(() => {
      store.getItem("age");
    }).toThrow(new Error("Key age does not exist in Depot"));
  });

  test("Export & Load", () => {
    expect(store.export()).toEqual({});

    store.load({ data: { foo: "foo", bar: "bar" } });
    expect(store.export()).toEqual({ data: { foo: "foo", bar: "bar" } });

    store.removeItem("data");
    expect(store.export()).toEqual({});
  });

  test("Clear & Destory", () => {
    store.load({ data: { foo: "foo", bar: "bar" } });
    store.clear();
    expect(store.export()).toEqual({});

    store.load({ data: { foo: "foo", bar: "bar" } });
    store.destory();
    expect(() => {
      store.export();
    }).toThrow(new Error("Depot has been destroyed and can no longer be accessed"));

    store = new Depot();
    expect(store.export()).toEqual({});
  });

  test("Write & Read", async () => {
    store.load({ data: { foo: "foo", bar: "bar" } });
    DataDepot.write(store, "temp/", {
      chunkName: "TestChunk",
      key: "TestKey",
      maxChunkCount: 2,
    });
    store.clear();
    await DataDepot.load(store, "temp/", "TestChunk", "TestKey");
    expect(store.export()).toEqual({ data: { foo: "foo", bar: "bar" } });
  });
});
