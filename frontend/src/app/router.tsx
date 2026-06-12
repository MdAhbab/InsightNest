import { createContext, useContext, useEffect, useState } from "react";

type RouteCtx = { path: string; params: Record<string, string>; query: URLSearchParams };
const Ctx = createContext<RouteCtx>({ path: "/", params: {}, query: new URLSearchParams() });

export function useRouter() { return useContext(Ctx); }
export const Router = Ctx.Provider;

function parseHash(h: string) {
  const raw = (h || "#/").replace(/^#/, "");
  const [path, qs = ""] = raw.split("?");
  return { path: path || "/", query: new URLSearchParams(qs) };
}

type Match = { Component: React.ComponentType; params: Record<string, string> };

export function matchRoute(path: string, routes: { pattern: string; Component: React.ComponentType }[]): Match | null {
  for (const r of routes) {
    const parts = r.pattern.split("/").filter(Boolean);
    const segs = path.split("/").filter(Boolean);
    if (parts.length !== segs.length && !r.pattern.endsWith("/*")) continue;
    const params: Record<string, string> = {};
    let ok = true;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (p === "*") break;
      if (p.startsWith(":")) { params[p.slice(1)] = decodeURIComponent(segs[i] ?? ""); continue; }
      if (p !== segs[i]) { ok = false; break; }
    }
    if (ok) return { Component: r.Component, params };
  }
  return null;
}

export function useHashRoute() {
  const [{ path, query }, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    if (!window.location.hash) window.location.hash = "#/";
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return { path, query };
}
