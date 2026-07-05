export const AVATAR_COLORS = [
  '#50fa7b',
  '#8be9fd',
  '#f1fa8c',
  '#ff5555',
  '#bd93f9',
  '#ffb86c',
  '#ff79c6',
  '#6272a4',
  '#a9b0d6',
  '#44475a',
] as const;

export const MEDAL_COLORS = ['#f1fa8c', '#a9b0d6', '#ffb86c'] as const;

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function getShortName(name: string): string {
  return name.split(/\s+/)[0];
}

export function getPlayerColor(playerId: string, playerIds: string[]): string {
  const index = playerIds.indexOf(playerId);
  return AVATAR_COLORS[(index >= 0 ? index : 0) % AVATAR_COLORS.length];
}
