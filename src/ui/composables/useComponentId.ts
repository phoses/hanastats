let counter = 0;

/**
 * Stable, unique DOM ids for wiring labels to controls (aria-labelledby, for/id).
 */
export function useComponentId(prefix = 'ui'): string {
  counter += 1;
  return `${prefix}-${counter}`;
}
