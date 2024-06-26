/* eslint-disable @typescript-eslint/no-var-requires */
const { DataDepot, Depot } = require("datadepot");
const { largeFile } = require("./temp/large-file.json");

// const URL = "https://cdn.jsdelivr.net/gh/json-iterator/test-data/large-file.json";


describe("stress-test", () => {
  let store;
  // const largeFile = await fetch(URL).then((res) => res.json());

  beforeEach(() => {
    store = new Depot();
  });

  afterEach(() => {
    store.clear();
    store.destory();
  });

  test("stress-test", () => {
    store.setItem("data", largeFile);

    expect(store.getItem("data")).toEqual(largeFile);

    DataDepot.write(store, "temp/", {
      chunkName: "StressTest",
      key: "StressTest",
      maxChunkSize: 1000,
    });

    store.clear();

    DataDepot.load(store, "temp/", "StressTest", "StressTest");

    // console.log(store.getItem("data"));

    expect(store.getItem("data")).toEqual(largeFile);
  });
});
