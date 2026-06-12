import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  authLogin,
  authLogout,
  authRegister,
  AuthResponse,
} from "../api/endpoints";
import {
  clearAuth,
  getStoredAuth,
  StoredAuth,
} from "../api/client";

const AUTH_KEY = "insightnest.auth.v2";

function persistAuth(data: AuthResponse) {
  const stored: StoredAuth = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: {
      id: data.user.id,
      fullName: data.user.fullName,
      email: data.user.email,
      roles: data.user.roles,
    },
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(stored));
}

// FE display role
export type Role = "Learner" | "Faculty" | "Rep" | "Admin";

/** Map backend role strings to FE Role label.
 * Picks highest-privilege if multiple: Admin > Rep > Faculty > Learner
 */
export function mapRoles(roles: string[]): Role {
  if (roles.includes("ADMIN")) return "Admin";
  if (roles.includes("UNIVERSITY_REP")) return "Rep";
  if (roles.includes("FACULTY")) return "Faculty";
  return "Learner";
}

export function roleHome(role: Role): string {
  switch (role) {
    case "Admin":   return "#/admin";
    case "Rep":     return "#/rep";
    case "Faculty": return "#/researcher";
    default:        return "#/dashboard";
  }
}

// ─── Session shape ────────────────────────────────────────────────────────────

type Session = {
  signedIn: boolean;
  role: Role;
  name: string;
  email: string;
  initial: string;
  /** @deprecated kept for compatibility; affiliation always empty in live mode */
  affiliation?: string;
  /** Internal: full user data */
  user?: {
    id: number;
    fullName: string;
    email: string;
    roles: string[];
  };
};

const DEFAULT_SESSION: Session = {
  signedIn: false,
  role: "Learner",
  name: "",
  email: "",
  initial: "—",
};

function sessionFromAuth(stored: StoredAuth): Session {
  const role = mapRoles(stored.user.roles);
  const initial = stored.user.fullName.trim().charAt(0).toUpperCase() || "?";
  return {
    signedIn: true,
    role,
    name: stored.user.fullName,
    email: stored.user.email,
    initial,
    affiliation: "",
    user: stored.user,
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

type SessionCtx = {
  session: Session;
  /** Sign in with email + password. Throws ApiError on failure. */
  login: (email: string, password: string) => Promise<void>;
  /** Register + auto sign in. Throws ApiError on failure. */
  register: (
    fullName: string,
    email: string,
    password: string,
    role: "LEARNER" | "FACULTY" | "UNIVERSITY_REP"
  ) => Promise<void>;
  /** Sign out — calls POST /auth/logout, clears storage */
  logout: () => Promise<void>;
  /**
   * @deprecated Demo role-switcher removed. No-op kept so other files that
   * still reference setRole compile without changes.
   */
  setRole: (role: Role) => void;
  /** Legacy alias kept for pages that call signIn(role). @deprecated */
  signIn: (role: Role) => void;
  /** Legacy alias kept for pages that call signOut(). @deprecated */
  signOut: () => void;
};

const Ctx = createContext<SessionCtx>({
  session: DEFAULT_SESSION,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  setRole: () => {},
  signIn: () => {},
  signOut: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>(() => {
    // Drop legacy key (bug 10)
    localStorage.removeItem("insightnest.session");
    const stored = getStoredAuth();
    if (stored) return sessionFromAuth(stored);
    return DEFAULT_SESSION;
  });

  // Keep localStorage in sync when session changes
  useEffect(() => {
    if (!session.signedIn) {
      clearAuth();
    }
  }, [session.signedIn]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authLogin({ email, password });
    persistAuth(data);
    setSession(sessionFromAuth({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    }));
  }, []);

  const register = useCallback(
    async (
      fullName: string,
      email: string,
      password: string,
      role: "LEARNER" | "FACULTY" | "UNIVERSITY_REP"
    ) => {
      const data = await authRegister({ fullName, email, password, role });
      persistAuth(data);
      setSession(sessionFromAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      }));
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      const stored = getStoredAuth();
      if (stored?.refreshToken) {
        await authLogout({ refreshToken: stored.refreshToken });
      }
    } catch {
      // Best-effort; always clear locally
    } finally {
      clearAuth();
      setSession(DEFAULT_SESSION);
    }
  }, []);

  // @deprecated — no-op
  const setRole = useCallback((_role: Role) => {
    // intentional no-op: role comes from server
  }, []);

  // @deprecated — no-op (kept for compile compat)
  const signIn = useCallback((_role: Role) => {
    // no-op
  }, []);

  const signOut = useCallback(async () => {
    await logout();
  }, [logout]);

  return (
    <Ctx.Provider value={{ session, login, register, logout, setRole, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSession() {
  return useContext(Ctx);
}
