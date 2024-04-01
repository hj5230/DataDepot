import Depot from "./lib/Depot";
import { ChunkWriter } from "./lib/Writer";
import { ChunkReader } from "./lib/Reader";

import { example } from "./assets/example";

const depot = new Depot();
// const writer = new Writer("./temp", { maxChunkSize: 1000 });
// const writer = new Writer("./temp", { maxChunkCount: 3 });
const writer = new ChunkWriter("./temp", {
  depotName: "lababa",
});
depot.setItem("user", {
  name: "shangqi",
  surname: "zhao",
  age: 22,
  bio: "A programmer, and always a learner",
});
depot.setItem("example", example);
const str = depot.serialize();
writer.write(str);

const reader = new ChunkReader("./temp", "lababa");
depot.load(reader.read());
console.log(depot.getItem("user"));
console.log(depot.getItem("example"));

// class User {
//   private username: string;
//   private data: Record<string, unknown>;

//   constructor(
//     username: string,
//     data: Record<string, unknown>
//   ) {
//     this.username = username;
//     this.data = data;
//   }
// }

// const user = new User("bruh", {
//   age: 17,
//   gender: "M",
// });
// console.log(typeof user, user); // object User {...}

// const strUsr = JSON.stringify(user); // string
// console.log(strUsr);
// console.log(typeof JSON.parse(strUsr)); // object (Record)
