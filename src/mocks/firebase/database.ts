// Mock of the `firebase/database` (and `@firebase/database`) surface the app
// uses: getDatabase, ref, child, get, push, set, update.
import { getNode, setNode, generateKey } from './store';

class MockDatabase {}

let dbSingleton: MockDatabase | null = null;

export function getDatabase(): MockDatabase {
  return (dbSingleton ??= new MockDatabase());
}

export interface MockRef {
  _db: MockDatabase;
  path: string;
}

const join = (base: string, path: string) => {
  const trimmed = base.replace(/\/$/, '');
  return trimmed ? `${trimmed}/${path}` : path;
};

export function ref(db: MockDatabase, path = ''): MockRef {
  return { _db: db, path };
}

export function child(parent: MockRef, path: string): MockRef {
  return { _db: parent._db, path: join(parent.path, path) };
}

export async function get(reference: MockRef) {
  const value = getNode(reference.path);
  return {
    exists: () => value !== undefined && value !== null,
    val: () => value,
  };
}

export async function push(reference: MockRef, value: any) {
  const key = generateKey();
  setNode(join(reference.path, key), value);
  return { key };
}

export async function set(reference: MockRef, value: any) {
  setNode(reference.path, value);
}

export async function update(reference: MockRef, partial: Record<string, any>) {
  for (const key of Object.keys(partial)) {
    setNode(join(reference.path, key), partial[key]);
  }
}
