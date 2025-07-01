import { PGlite } from "@electric-sql/pglite";
import { pgDump } from "@electric-sql/pglite-tools";
import fs from "node:fs";
import path from "node:path";

export function readMigrations(dir: string) {
  return fs
    .readdirSync(dir)
    .filter((file) => path.extname(file) == ".sql")
    .sort();
}

export function normalizeMigration(
  mig: string,
  options?: {
    startToken?: string;
    endToken?: string;
  }
) {
  let start = 0;
  if (options?.startToken) {
    const newStart = mig.indexOf(options.startToken);
    if (newStart != -1) start = newStart + options.startToken.length;
  }

  let end = mig.length;
  if (options?.endToken) {
    const newEnd = mig.indexOf(options.endToken);
    if (newEnd != -1) end = newEnd;
  }

  return mig
    .slice(start, end)
    .split(";")
    .filter((stmt) => !stmt.toLowerCase().includes("create extension"))
    .join(";")
    .trim();
}

export async function normalizeSchema(schema: string) {
  return schema
    .split("\n")
    .filter((line) => !line.startsWith("--"))
    .join("\n")
    .split(";")
    .map((stmt) => stmt.trim())
    .filter((stmt) => !stmt.toLowerCase().startsWith("set "))
    .filter((stmt) => !stmt.toLowerCase().includes("pg_catalog.set_config"))
    .filter((stmt) => !stmt.toLowerCase().includes(" owner to "))
    .filter((stmt) => !stmt.toLowerCase().includes(" set statistics "))
    .join(";\n\n")
    .trim();
}

async function dumpSchema(pg: PGlite) {
  const file = await pgDump({ pg, args: ["--schema-only"] });
  const text = await file.text();
  return normalizeSchema(text);
}

export async function buildSchemaFromQueries(queries: string[]) {
  const pg = await PGlite.create();

  for (const query of queries) {
    await pg.exec(query);
  }

  const schema = await dumpSchema(pg);
  await pg.close();

  return schema;
}

export async function buildSchema(options: {
  migrationsDir: string;
  startToken?: string;
  endToken?: string;
}) {
  const queries = readMigrations(options.migrationsDir).map((file) => {
    const filepath = path.resolve(options.migrationsDir, file);
    const migration = fs.readFileSync(filepath, { encoding: "utf-8" });

    const query = normalizeMigration(migration, {
      startToken: options.startToken,
      endToken: options.endToken,
    });

    return query;
  });

  const schema = buildSchemaFromQueries(queries);

  return schema;
}
