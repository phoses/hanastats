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

type QueryConstraint =
  | { type: 'orderByKey' }
  | { type: 'startAfter'; value: string };

export interface MockQuery {
  _db: MockDatabase;
  path: string;
  constraints: QueryConstraint[];
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

export function query(reference: MockRef, ...constraints: QueryConstraint[]): MockQuery {
  return { _db: reference._db, path: reference.path, constraints };
}

export function orderByKey(): QueryConstraint {
  return { type: 'orderByKey' };
}

export function startAfter(value: string): QueryConstraint {
  return { type: 'startAfter', value };
}

function applyConstraints(value: any, constraints: QueryConstraint[]) {
  if (value === undefined || value === null || typeof value !== 'object') {
    return value;
  }

  const startAfterConstraint = constraints.find(
    (c): c is Extract<QueryConstraint, { type: 'startAfter' }> => c.type === 'startAfter',
  );

  const compareKeys = (a: string, b: string) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  };
  let keys = Object.keys(value).sort(compareKeys);
  if (startAfterConstraint) {
    keys = keys.filter((key) => key > startAfterConstraint.value);
  }

  const result: Record<string, any> = {};
  for (const key of keys) {
    result[key] = value[key];
  }
  return result;
}

export async function get(reference: MockRef | MockQuery) {
  const constraints = 'constraints' in reference ? reference.constraints : [];
  let value = getNode(reference.path);
  if (constraints.length > 0) {
    value = applyConstraints(value, constraints);
  }
  return {
    exists: () =>
      value !== undefined &&
      value !== null &&
      !(typeof value === 'object' && Object.keys(value).length === 0),
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
