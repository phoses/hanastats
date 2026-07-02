// In-memory Realtime-Database stand-in, persisted to localStorage so data
// survives reloads. Used only when VITE_USE_MOCK=true (see vite.config.ts).
//
// The shape mirrors what the real database holds: child collections are keyed
// by their generated id, and the value does NOT repeat the id (the stores read
// the id from the key — see getPlayers/getGames/getMatches).

const STORAGE_KEY = 'hanastats-mock-db';

const DAY = 24 * 60 * 60 * 1000;

function seedData() {
  const now = Date.now();

  const games = {
    g1: { name: 'Air Hockey', pointsForWin: 3, pointsForOTWin: 2, pointsForOTLose: 1, pointsForDraw: 0, disabled: false },
    g2: { name: 'Foosball', pointsForWin: 3, pointsForOTWin: 2, pointsForOTLose: 1, pointsForDraw: 0, disabled: false },
  };

  // game objects as embedded in matches (stores keep match.game as-is)
  const g1 = { id: 'g1', ...games.g1 };
  const g2 = { id: 'g2', ...games.g2 };

  const match = (
    game: any,
    home: string[],
    away: string[],
    homeScore: number,
    awayScore: number,
    overtime: boolean,
    daysAgo: number,
  ) => ({
    game,
    homePlayers: home.map((id) => ({ id })),
    awayPlayers: away.map((id) => ({ id })),
    homeScore,
    awayScore,
    overtime,
    played: now - daysAgo * DAY,
  });

  return {
    users: {
      'mock-admin-uid': { email: 'pasi.tiihonen@gofore.com', role: 'admin' },
    },
    players: {
      p1: { username: 'Alice', ownedGames: ['g1'] },
      p2: { username: 'Bob', ownedGames: [] },
      p3: { username: 'Carol', ownedGames: [] },
      p4: { username: 'Dave', ownedGames: [] },
      p5: { username: 'Erin', ownedGames: [] },
      p6: { username: 'Frank', ownedGames: [] },
    },
    games,
    matches: {
      m1: match(g1, ['p1'], ['p2'], 10, 7, false, 9),
      m2: match(g1, ['p3'], ['p4'], 8, 10, false, 8),
      m3: match(g2, ['p1', 'p2'], ['p3', 'p4'], 5, 4, true, 6),
      m4: match(g2, ['p5', 'p6'], ['p1', 'p3'], 3, 5, false, 4),
      m5: match(g1, ['p2'], ['p5'], 10, 9, true, 2),
      m6: match(g2, ['p4', 'p6'], ['p2', 'p5'], 6, 2, false, 1),
    },
  } as Record<string, any>;
}

function load(): Record<string, any> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to seeding
  }
  const data = seedData();
  persist(data);
  return data;
}

let root = load();

function persist(data: Record<string, any> = root) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function segments(path: string): string[] {
  return path.split('/').filter(Boolean);
}

export function getNode(path: string): any {
  let node: any = root;
  for (const seg of segments(path)) {
    if (node == null) return undefined;
    node = node[seg];
  }
  return node;
}

export function setNode(path: string, value: any) {
  const segs = segments(path);
  if (segs.length === 0) {
    root = value;
    persist();
    return;
  }
  let node: any = root;
  for (let i = 0; i < segs.length - 1; i++) {
    if (node[segs[i]] == null) node[segs[i]] = {};
    node = node[segs[i]];
  }
  node[segs[segs.length - 1]] = value;
  persist();
}

export function generateKey(): string {
  return '-mock-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e6).toString(36);
}

// Wipe persisted data and re-seed. Exposed on window as __resetMockDb().
export function resetMockDb() {
  root = seedData();
  persist();
}
