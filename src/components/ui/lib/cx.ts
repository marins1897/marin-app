type ClassValue = string | false | null | undefined;

/** Joins truthy class names. Lives inside ui/ so the layer stays self-contained. */
export const cx = (...values: ClassValue[]): string =>
  values.filter(Boolean).join(' ');
