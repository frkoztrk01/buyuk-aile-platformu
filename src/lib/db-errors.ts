/** Walk nested Drizzle / node-postgres errors for Postgres error codes. */
export function postgresErrorCode(err: unknown): string | undefined {
  let current: unknown = err;
  for (let depth = 0; depth < 6 && current && typeof current === 'object'; depth++) {
    const code = (current as { code?: unknown }).code;
    if (typeof code === 'string') return code;
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}

export function rootErrorMessage(err: unknown): string | undefined {
  let current: unknown = err;
  for (let depth = 0; depth < 6 && current; depth++) {
    if (typeof current === 'object' && current !== null && 'message' in current) {
      const m = (current as { message: unknown }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
    current =
      typeof current === 'object' && current !== null && 'cause' in current
        ? (current as { cause: unknown }).cause
        : undefined;
  }
  return undefined;
}
