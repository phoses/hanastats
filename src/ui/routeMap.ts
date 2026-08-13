/**
 * The two UI modes have separate route trees so that the URL always tells which
 * UI is in use. These maps keep the user on the same content when switching.
 */
export const classicToModernRoute: Record<string, string> = {
  stats: 'modern-standings',
  addmatch: 'modern-add',
  config: 'modern-more',
};

export const modernToClassicRoute: Record<string, string> = {
  'modern-standings': 'stats',
  'modern-matches': 'stats',
  'modern-add': 'addmatch',
  'modern-trends': 'stats',
  'modern-more': 'config',
  'modern-kitchen-sink': 'stats',
};

export function isModernRouteName(name: unknown): boolean {
  return typeof name === 'string' && name.startsWith('modern-');
}
