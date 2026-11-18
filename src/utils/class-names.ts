type ClassValue = string | false | null | undefined;

/** Joins truthy class names. CSS-module lookups are `string | undefined`. */
export const cx = (...values: ClassValue[]): string =>
  values.filter(Boolean).join(' ');
