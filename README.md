# Build PG Schema

A cli for creating human-readable database schema from migrations. This schema is intended to be committed to git.

This tool does not `pg_dump` a real database, instead it creates an empty [in-memory postgres db](https://github.com/electric-sql/pglite), applies all migrations to it and then dumps it.

Works only with Postgres.

## Usage

```sh
npx build-schema --migrations=./db/migrations > ./db/schema.sql
npx build-schema -m ./db/migrations > ./db/schema.sql
npx build-schema -m ./db/migrations -s '-- migrate:up' -e '-- migrate:down' > ./db/schema.sql
```

## Flags

| flag              | default value   | description                                                        |
| ----------------- | --------------- | ------------------------------------------------------------------ |
| --migrations, -m  | ./db/migrations | path to migrations                                                 |
| --start-token, -s |                 | skip all text before this token in each migration (and this token) |
| --end-token, -e   |                 | skip all text after this token in each migration (and this token)  |

## Output

The output looks like a cleaner version pg_dump. It does not include data, initial SET statements, comments, owners and "set statistics"
