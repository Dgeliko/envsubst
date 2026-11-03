# Fast Envsubst

> A lightweight GitHub Action for environment variable substitution,
> running directly in the GitHub Actions Node.js runtime.

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

## Experimental substitution engine

The `experimental` branch replaces `envsub` with a single-pass substitution
engine and removes its dependency tree. To try it, use
`Dgeliko/envsubst@experimental`.

- `${NAME}` uses the environment value, or an empty string if it is missing.
- `${NAME:-default}` uses the default only when the variable is missing.
  An existing empty value stays empty, matching the previous Action behavior.
- Variable names use letters, digits and underscores and cannot start with a digit.
  Spaces around names are accepted, for example `${ NAME }`.
- `$NAME` without braces is left unchanged.
- Values are inserted literally, including dollar signs and backslashes.
  Inserted placeholders are not expanded again. This deliberately fixes the old
  engine's handling of replacement tokens and accidental repeated expansion.
- Existing environment variables take precedence over values from `env-file`.
- Both `in-file` and `out-file` are required. `out-file: stdout` writes the
  substituted template to standard output instead of a file.

The `out-file-created` output is the string `true` on successful substitution
(including stdout), and `false` on failure; failures also fail the Action.
