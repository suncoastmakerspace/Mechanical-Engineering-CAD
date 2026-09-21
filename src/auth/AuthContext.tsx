import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/**
 * Who is signed in, and what they have finished.
 *
 * The site has to work with no backend at all. Under `npm run dev` there are
 * no Pages Functions, and before the roster sheet exists there is nothing to
 * sign in to, so anything unreachable puts the app in guest mode with progress
 * in localStorage. Signing in later carries that guest progress up to the
 * sheet rather than throwing it away.
 */

export type Progress = { checkpoints: string[]; gates: string[] };
export type User = { username: string; displayName: string };

type Ctx = {
  user: User | null;
  /** True once the initial probe has finished, so the UI can avoid flicker. */
  ready: boolean;
  /** False when there is no reachable API, which is the normal local case. */
  online: boolean;
  progress: Progress;
  isCheckpointDone: (id: string) => boolean;
  isGateCleared: (id: string) => boolean;
  toggleCheckpoint: (id: string, done: boolean) => void;
  toggleGate: (id: string, done: boolean) => void;
  /** Resolves to an error message, or null on success. */
  signIn: (username: string, password: string) => Promise<string | null>;
  /** Same contract as signIn. Creates the account and signs straight in. */
  signUp: (
    username: string,
    password: string,
    displayName: string,
  ) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const GUEST_KEY = 'mecad.progress.v1';
const EMPTY: Progress = { checkpoints: [], gates: [] };

const AuthContext = createContext<Ctx | null>(null);

function readGuest(): Progress {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      checkpoints: Array.isArray(parsed.checkpoints) ? parsed.checkpoints : [],
      gates: Array.isArray(parsed.gates) ? parsed.gates : [],
    };
  } catch {
    return EMPTY;
  }
}

function writeGuest(progress: Progress) {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(progress));
  } catch {
    /* private browsing, quota, or storage blocked. Not worth surfacing. */
  }
}

/**
 * Under plain Vite an unknown path returns index.html with a 200, so a bare
 * `fetch` would hand back HTML and only fail at JSON.parse. Anything that is
 * not actually JSON is treated as "no API here".
 */
async function api(path: string, init?: RequestInit): Promise<Response | null> {
  try {
    const res = await fetch(path, { credentials: 'same-origin', ...init });
    const type = res.headers.get('Content-Type') || '';
    if (!type.includes('application/json')) return null;
    return res;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [online, setOnline] = useState(false);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState<Progress>(EMPTY);

  /** Guest work not yet pushed to the sheet, sent with the next write. */
  const pendingAdopt = useRef<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const guest = readGuest();
      const session = await api('/api/session');

      if (cancelled) return;

      if (!session) {
        // No Functions deployed. Guest mode, local storage only.
        setOnline(false);
        setProgress(guest);
        setReady(true);
        return;
      }

      setOnline(true);

      if (session.ok) {
        const me = (await session.json()) as User;
        if (cancelled) return;
        setUser({ username: me.username, displayName: me.displayName });
        pendingAdopt.current = guest.checkpoints;

        const res = await api('/api/progress');
        if (cancelled) return;
        if (res?.ok) {
          const data = (await res.json()) as Progress;
          setProgress({ checkpoints: data.checkpoints || [], gates: data.gates || [] });
        }
      } else {
        setProgress(guest);
      }

      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const apply = useCallback(
    (kind: 'checkpoints' | 'gates', id: string, done: boolean) => {
      setProgress((prev) => {
        const set = new Set(prev[kind]);
        if (done) set.add(id);
        else set.delete(id);
        const next = { ...prev, [kind]: [...set] };

        if (!user) writeGuest(next);
        return next;
      });

      if (!user) return;

      const adopt = pendingAdopt.current;
      pendingAdopt.current = [];

      void api('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: kind === 'gates' ? 'gate' : 'checkpoint',
          id,
          done,
          ...(adopt.length ? { adopt } : {}),
        }),
      }).then(async (res) => {
        // The server is the source of truth, so take its answer back.
        if (res?.ok) {
          const data = (await res.json()) as Progress;
          setProgress({ checkpoints: data.checkpoints || [], gates: data.gates || [] });
        }
      });
    },
    [user],
  );

  const signIn = useCallback(async (username: string, password: string) => {
    const res = await api('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res) return 'Sign-in is not available on this build.';

    const data = (await res.json()) as { error?: string } & User;
    if (!res.ok) return data.error || 'That did not work.';

    setUser({ username: data.username, displayName: data.displayName });
    pendingAdopt.current = readGuest().checkpoints;

    /*
     * Deliberately not awaited. The credentials are already accepted, so the
     * dialog should close now; waiting on the roster sheet as well left it
     * sitting there for about four seconds. Progress arrives a moment later
     * and the map updates when it does.
     */
    void api('/api/progress').then(async (got) => {
      if (got?.ok) {
        const fresh = (await got.json()) as Progress;
        setProgress({ checkpoints: fresh.checkpoints || [], gates: fresh.gates || [] });
      }
    });

    return null;
  }, []);

  const signUp = useCallback(
    async (username: string, password: string, displayName: string) => {
      const res = await api('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, displayName }),
      });

      if (!res) return 'Sign-up is not available on this build.';

      const data = (await res.json()) as { error?: string } & User;
      if (!res.ok) return data.error || 'That did not work.';

      setUser({ username: data.username, displayName: data.displayName });
      // A brand new account has nothing on the sheet, so whatever was done as
      // a guest is the starting point.
      const guest = readGuest();
      pendingAdopt.current = guest.checkpoints;
      setProgress(guest);
      return null;
    },
    [],
  );

  const signOut = useCallback(async () => {
    await api('/api/logout', { method: 'POST' });
    setUser(null);
    setProgress(readGuest());
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      user,
      ready,
      online,
      progress,
      isCheckpointDone: (id) => progress.checkpoints.includes(id),
      isGateCleared: (id) => progress.gates.includes(id),
      toggleCheckpoint: (id, done) => apply('checkpoints', id, done),
      toggleGate: (id, done) => apply('gates', id, done),
      signIn,
      signUp,
      signOut,
    }),
    [user, ready, online, progress, apply, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): Ctx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
