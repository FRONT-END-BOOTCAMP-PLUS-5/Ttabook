export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Recursively converts snake_case object keys to camelCase.
 * @param input - The value to convert.
 * @returns The converted value.
 */
export function mapKeysToCamelCase(input: unknown): unknown {
  if (Array.isArray(input)) {
    return input.map(mapKeysToCamelCase);
  }

  if (input !== null && typeof input === 'object') {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(input)) {
      const value = (input as Record<string, unknown>)[key];
      const newKey = snakeToCamel(key);
      result[newKey] = mapKeysToCamelCase(value);
    }
    return result;
  }

  return input;
}

/**
 * Recursively converts camelCase object keys to snake_case.
 * @param input - The value to convert.
 * @returns The converted value.
 */
export function mapKeysToSnakeCase(input: unknown): unknown {
  if (Array.isArray(input)) {
    return input.map(mapKeysToSnakeCase);
  }

  if (input !== null && typeof input === 'object') {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(input)) {
      const value = (input as Record<string, unknown>)[key];
      const newKey = camelToSnake(key);
      result[newKey] = mapKeysToSnakeCase(value);
    }
    return result;
  }

  return input;
}