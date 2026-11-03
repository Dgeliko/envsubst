# Fast Envsubst

> A GitHub Action which is a light wrapper around the
> [envsub](https://github.com/danday74/envsub) package, providing a GitHub
> Actions native runtime (Node.js) for envsubst-like activities.

## Usage

```yaml
- uses: Dgeliko/envsubst@v2
  env:
    FOO_VALUE: cat good
    BAR_VALUE: dog food
  with:
    env-file: __tests__/fixtures/example.env
    in-file: __tests__/fixtures/example.yaml.in
    out-file: __tests__/runner/example.yaml
```

input: **example.env**

```
ROGER=RABBIT
```

input: **example.yaml.in**

```yaml
example:
  foo: ${FOO_VALUE}
  bar: ${BAR_VALUE}
  roger: ${ROGER}
```

output: **example.yaml**

```yaml
example:
  foo: cat good
  bar: dog food
  roger: RABBIT
```

## Features

- Fast, runs in the GitHub Actions node.js runtime; no Docker pull needed.
- Provide an env file and have it loaded into your substitution environment

## Development

Version 1.0.2 uses the GitHub Actions Node.js 24 runtime. Self-hosted runners
must support `node24`. Use Node.js 24 locally (`nvm use`), then run:

```sh
npm ci
npm run lint
npm test -- --runInBand
npm run build
```

Commit the generated `dist` directory together with source changes.
