/** Replace placeholders in the original template; inserted values stay literal. */
export const substitute = (
  template: string,
  env: NodeJS.ProcessEnv = process.env,
): string => template.replace(
  /\$\{ *([a-zA-Z_][a-zA-Z0-9_]*)(?::-([^}]*))? *\}/g,
  (_match: string, name: string, fallback: string | undefined): string =>
    (Object.prototype.hasOwnProperty.call(env, name) ? env[name] : undefined) ?? fallback ?? '',
)
