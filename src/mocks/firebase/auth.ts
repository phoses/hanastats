// Mock of the `firebase/auth` surface the app uses. Sign-in resolves instantly
// as a seeded admin user (uid matches the 'users' node in the mock store, so
// userStore.isAdmin becomes true and the addmatch view unlocks).
const AUTH_KEY = 'hanastats-mock-auth';

const MOCK_USER = {
  uid: 'mock-admin-uid',
  email: 'pasi.tiihonen@gofore.com',
  displayName: 'Mock Admin',
};

class MockAuth {
  currentUser: any = null;

  constructor() {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      this.currentUser = raw ? JSON.parse(raw) : null;
    } catch {
      this.currentUser = null;
    }
  }

  signOut() {
    this.currentUser = null;
    localStorage.removeItem(AUTH_KEY);
  }
}

let authSingleton: MockAuth | null = null;

export function getAuth(): MockAuth {
  return (authSingleton ??= new MockAuth());
}

export const browserLocalPersistence = 'LOCAL';

export async function setPersistence() {
  // no-op: the mock always persists to localStorage
}

export class GoogleAuthProvider {
  static credentialFromResult() {
    return null;
  }
}

export async function signInWithPopup(auth: MockAuth) {
  auth.currentUser = MOCK_USER;
  localStorage.setItem(AUTH_KEY, JSON.stringify(MOCK_USER));
  return { user: MOCK_USER };
}
