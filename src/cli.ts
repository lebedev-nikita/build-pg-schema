#!/usr/bin/env node
import { cli } from "cleye";
import { buildSchema } from "./index.js";

const argv = cli({
  name: "build-schema",
  flags: {
    startToken: {
      type: String,
      alias: "s",
    },
    endToken: {
      type: String,
      alias: "e",
    },
    migrations: {
      type: String,
      alias: "m",
      default: "./db/migrations",
    },
  },
});

console.log(
  await buildSchema({
    migrationsDir: argv.flags.migrations,
    startToken: argv.flags.startToken,
    endToken: argv.flags.endToken,
  })
);
