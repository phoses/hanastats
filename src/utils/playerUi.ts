export const AVATAR_COLORS = [
  '#C6FF3D',
  '#38A6FF',
  '#FFCB45',
  '#FF5B39',
  '#B98CFF',
  '#4FE0B0',
  '#FF8FB0',
  '#7FA6FF',
  '#E0C48A',
  '#9AA7B4',
] as const;

export const MEDAL_COLORS = ['#FFCB45', '#C9D2DC', '#E08A4B'] as const;

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
