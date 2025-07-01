help:
  @just --list

dev:
  @npx tsx ./src/cli.ts

install:
  npm install

test:
  npx vitest --run

build: install test
  npx tsc

unlink:
  npm unlink build-schema
  
link: build unlink
  npm link

publish: build
  npm publish