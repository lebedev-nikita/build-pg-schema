import dedent from "dedent-js";
import { describe, expect, test } from "vitest";
import { buildSchemaFromQueries, normalizeMigration, normalizeSchema } from "../src/index.js";

describe("normalize migration", () => {
  test("start token, end token", async () => {
    const exampleMigration = dedent`
      -- migrate:up

      CREATE TABLE feedback(
        message     text        NOT NULL,
        contacts    text            NULL,
        account_id  integer         NULL REFERENCES account(account_id),
        created_at  timestamptz NOT NULL DEFAULT now()
      );

      -- migrate:down

      DROP TABLE feedback;
    `;

    const normalized = normalizeMigration(exampleMigration, {
      startToken: "-- migrate:up",
      endToken: "-- migrate:down",
    });

    expect(normalized).toBe(dedent`
      CREATE TABLE feedback(
        message     text        NOT NULL,
        contacts    text            NULL,
        account_id  integer         NULL REFERENCES account(account_id),
        created_at  timestamptz NOT NULL DEFAULT now()
      );
    `);
  });
});

describe("normalize migration", () => {
  test("skip 'set statistics'", async () => {
    const exampleSchema = dedent`
      CREATE TABLE public.feedback (
          message text NOT NULL,
          contacts text,
          account_id integer,
          created_at timestamp with time zone DEFAULT now() NOT NULL
      );
      ALTER TABLE ONLY public.feedback ALTER COLUMN message SET STATISTICS 0;
      ALTER TABLE ONLY public.feedback ALTER COLUMN contacts SET STATISTICS 0;
      ALTER TABLE ONLY public.feedback ALTER COLUMN account_id SET STATISTICS 0;
      ALTER TABLE ONLY public.feedback ALTER COLUMN created_at SET STATISTICS 0;
    `;

    const normalized = await normalizeSchema(exampleSchema);

    expect(normalized).toBe(dedent`
      CREATE TABLE public.feedback (
          message text NOT NULL,
          contacts text,
          account_id integer,
          created_at timestamp with time zone DEFAULT now() NOT NULL
      );
    `);
  });
});

describe("build schema", () => {
  test("empty schema has no comments", async () => {
    const schema = await buildSchemaFromQueries([]);
    expect(schema).not.includes("--");
  });

  test("empty schema has no sets", async () => {
    const schema = await buildSchemaFromQueries([]);
    expect(schema).not.includes("set");
  });
});
