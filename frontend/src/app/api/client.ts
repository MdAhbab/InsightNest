// Fetch-based API client for InsightNest
// Base URL from VITE_API_URL env var (default: http://localhost:8080/api/v1)

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8080/api/v1";

const AUTH_KEY = "insightnest.auth.v2";

/** Normalized error thrown by all API calls */
export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/** Shape stored in localStorage */
export interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    roles: string[];
  };
}

function loadAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    // Shape validation (bug 10)
    if (
      parsed &&
      typeof parsed === "object" &&
      "accessToken" in parsed &&
      "refreshToken" in parsed &&
      "user" in parsed &&
      typeof (parsed as StoredAuth).accessToken === "string" &&
      typeof (parsed as StoredAuth).refreshToken === "string" &&
      typeof (parsed as StoredAuth).user === "object" &&
      (parsed as StoredAuth).user !== null &&
      typeof (parsed as StoredAuth).user.id === "number" &&
      typeof (parsed as StoredAuth).user.fullName === "string" &&
      typeof (parsed as StoredAuth).user.email === "string" &&
      Array.isArray((parsed as StoredAuth).user.roles)
    ) {
      return parsed as StoredAuth;
    }
    return null;
  } catch {
    return null;
  }
}

function saveAuth(auth: StoredAuth) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  // Drop legacy key (bug 10)
  localStorage.removeItem("insightnest.session");
}

export function getStoredAuth(): StoredAuth | null {
  return loadAuth();
}

/** Parse backend error shape {timestamp,status,error,message,path,errors?} */
async function parseError(res: Response): Promise<ApiError> {
  let status = res.status;
  let message = res.statusText || "Request failed";
  let fieldErrors: Record<string, string> | undefined;
  try {
    const body = await res.json() as {
      status?: number;
      message?: string;
      errors?: { field: string; defaultMessage: string }[];
    };
    if (body.status) status = body.status;
    if (body.message) message = body.message;
    if (Array.isArray(body.errors) && body.errors.length > 0) {
      fieldErrors = {};
      for (const e of body.errors) {
        if (e.field) fieldErrors[e.field] = e.defaultMessage ?? "Invalid";
      }
    }
  } catch {
    // keep defaults
  }
  return new ApiError(status, message, fieldErrors);
}

/** Core fetch wrapper — attaches Bearer token, handles 401 auto-refresh */
let isRefreshing = false;
let refreshFailedCallbacks: (() => void)[] = [];

async function apiFetch(path: string, init: RequestInit = {}, _retry = false): Promise<Response> {
  const auth = loadAuth();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };

  // Don't set Content-Type for FormData (browser sets boundary automatically)
  if (init.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  if (auth?.accessToken) {
    headers["Authorization"] = `Bearer ${auth.accessToken}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  if (res.status === 401 && !_retry) {
    const stored = loadAuth();
    if (stored?.refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${BASE}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: stored.refreshToken }),
          });
          if (refreshRes.ok) {
            const data = await refreshRes.json() as StoredAuth;
            saveAuth(data);
            isRefreshing = false;
            refreshFailedCallbacks = [];
            // Replay original request with new token
            return apiFetch(path, init, true);
          } else {
            isRefreshing = false;
            refreshFailedCallbacks.forEach(cb => cb());
            refreshFailedCallbacks = [];
            clearAuth();
            const next = encodeURIComponent(window.location.hash.replace(/^#/, "") || "/");
            window.location.hash = `#/login?next=${next}`;
            throw new ApiError(401, "Session expired. Please sign in again.");
          }
        } catch (err) {
          isRefreshing = false;
          refreshFailedCallbacks.forEach(cb => cb());
          refreshFailedCallbacks = [];
          if (err instanceof ApiError) throw err;
          clearAuth();
          const next = encodeURIComponent(window.location.hash.replace(/^#/, "") || "/");
          window.location.hash = `#/login?next=${next}`;
          throw new ApiError(401, "Session expired. Please sign in again.");
        }
      } else {
        // Another refresh is in flight — queue and wait
        return new Promise<Response>((resolve, reject) => {
          refreshFailedCallbacks.push(() => reject(new ApiError(401, "Session expired.")));
          // On success the refresh above will re-try; but since we can't chain easily,
          // just redirect on failure callback
        });
      }
    } else {
      clearAuth();
      const next = encodeURIComponent(window.location.hash.replace(/^#/, "") || "/");
      window.location.hash = `#/login?next=${next}`;
      throw new ApiError(401, "Please sign in to continue.");
    }
  }

  return res;
}

/** GET */
export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(path, { method: "GET" });
  if (!res.ok) throw await parseError(res);
  // Handle 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** POST */
export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const init: RequestInit = {
    method: "POST",
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  };
  const res = await apiFetch(path, init);
  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** PUT */
export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const init: RequestInit = {
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };
  const res = await apiFetch(path, init);
  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** PATCH */
export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const init: RequestInit = {
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };
  const res = await apiFetch(path, init);
  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** DELETE */
export async function apiDelete<T = void>(path: string): Promise<T> {
  const res = await apiFetch(path, { method: "DELETE" });
  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** Upload multipart/form-data */
export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const res = await apiFetch(path, { method: "POST", body: formData });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}

/** Download a file (auth-gated). Returns object URL. */
export async function apiDownloadUrl(path: string): Promise<string> {
  const auth = loadAuth();
  const headers: Record<string, string> = {};
  if (auth?.accessToken) headers["Authorization"] = `Bearer ${auth.accessToken}`;
  const res = await fetch(`${BASE}${path}`, { headers });
  if (!res.ok) throw await parseError(res);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

/** Backend pagination shape */
export interface PageResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

/** Unwrap paginated response */
export function unwrapPage<T>(data: PageResponse<T>): { items: T[]; meta: PageResponse<T>["page"] } {
  return { items: data.content, meta: data.page };
}

/** Direct auth fetch (no token — used for login/register/refresh) */
export async function apiAuthPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}
