import { createContext, useCallback, useContext, useEffect, useState } from "react";

type T = { id: number; text: string; kind: "ok" | "info" | "err" };
const Ctx = createContext<(text: string, kind?: T["kind"]) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<T[]>([]);
  const push = useCallback((text: string, kind: T["kind"] = "ok") => {
    const id = Date.now() + Math.random();
    setList((l) => [...l, { id, text, kind }]);
    setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="fixed bottom-6 right-6 z-[90] flex flex-col gap-2 max-w-[90vw]">
        {list.map((t) => <ToastItem key={t.id} t={t} />)}
      </div>
    </Ctx.Provider>
  );
}

function ToastItem({ t }: { t: T }) {
  const [shown, setShown] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setShown(true)); return () => cancelAnimationFrame(id); }, []);
  const accent = t.kind === "err" ? "var(--oxblood)" : t.kind === "info" ? "var(--oxford)" : "var(--gold)";
  return (
    <div
      className="px-4 py-3 flex items-center gap-3 min-w-[260px]"
      style={{
        background: "var(--paper-raised)",
        border: "1px solid var(--rule-strong)",
        borderLeft: `2px solid ${accent}`,
        transform: shown ? "translateX(0)" : "translateX(20px)",
        opacity: shown ? 1 : 0,
        transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <span className="mono" style={{ color: accent, fontSize: 10 }}>{t.kind === "err" ? "✕" : t.kind === "info" ? "i" : "✓"}</span>
      <span className="serif" style={{ fontSize: "0.95rem" }}>{t.text}</span>
    </div>
  );
}

export const useToast = () => useContext(Ctx);
