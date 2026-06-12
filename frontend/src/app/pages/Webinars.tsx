import { useCallback, useEffect, useRef, useState } from "react";
import { PageIntro } from "../components/PageIntro";
import { ApiError } from "../api/client";
import { fmtDate } from "../api/format";
import { webinarsList, WebinarDto } from "../api/endpoints";

function Skeleton() {
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-32">
      <div className="py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="my-10 h-5 rounded" style={{ background: "var(--rule-strong)", width: `${70 - i * 8}%`, opacity: 0.5 }} />
        ))}
      </div>
    </section>
  );
}

export default function Webinars() {
  const [items, setItems] = useState<WebinarDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await webinarsList({ page: 0, size: 100 });
      setItems(data.content);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load webinars.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <PageIntro
        index="07"
        kicker="THE TIMELINE"
        title={<>A standing programme of talks.</>}
        lede="Conversations with admissions officers, scholarship trustees and faculty — past and forthcoming."
        meta={loading ? "LOADING…" : `${items.length} ENTRIES`}
      />

      {loading && <Skeleton />}

      {!loading && error && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-32">
          <div className="py-10 flex flex-col items-center gap-4">
            <div className="mono" style={{ color: "var(--oxblood)", fontSize: 11 }}>{error}</div>
            <button onClick={load} className="btn-ink btn-ghost"><span>Retry</span></button>
          </div>
        </section>
      )}

      {!loading && !error && items.length === 0 && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-32">
          <div className="py-12 text-center mono" style={{ color: "var(--ink-faint)" }}>
            No webinars on the schedule.
          </div>
        </section>
      )}

      {!loading && !error && items.length > 0 && (
        <Timeline items={items} />
      )}
    </>
  );
}

function Timeline({ items }: { items: WebinarDto[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = wrap.current; if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const k = Math.min(1, Math.max(0, (vh * 0.7 - rect.top) / (rect.height + vh * 0.2)));
      setProgress(k);
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    update(); window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); };
  }, []);

  // Split by displayStatus field; fall back to comparing scheduledAt with today
  const upcoming = items.filter(w => {
    if (w.status === "UPCOMING" || (w as any).displayStatus === "UPCOMING") return true;
    if (w.status === "PAST" || (w as any).displayStatus === "PAST") return false;
    // Fallback: compare scheduledAt
    if (w.scheduledAt) {
      const d = new Date(w.scheduledAt);
      return !isNaN(d.getTime()) && d > new Date();
    }
    return false;
  });

  const past = items.filter(w => {
    if (w.status === "PAST" || (w as any).displayStatus === "PAST") return true;
    if (w.status === "UPCOMING" || (w as any).displayStatus === "UPCOMING") return false;
    if (w.scheduledAt) {
      const d = new Date(w.scheduledAt);
      return !isNaN(d.getTime()) && d <= new Date();
    }
    return false;
  });

  const ordered: (WebinarDto | { divider: true })[] = [...upcoming, { divider: true }, ...past];

  return (
    <section ref={wrap} className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-32 relative">
      <div className="grid grid-cols-12 gap-6 relative">
        {/* Spine */}
        <div className="absolute left-[calc(50%-0.5px)] md:left-[24%] top-0 bottom-0 w-px" style={{ background: "var(--rule)" }} />
        <div
          className="absolute left-[calc(50%-0.5px)] md:left-[24%] top-0 w-px"
          style={{ background: "var(--gold)", height: `${progress * 100}%`, transition: "height 0.2s linear" }}
        />

        <ol className="col-span-12 space-y-16 md:space-y-24">
          {ordered.map((w, i) => {
            if ((w as any).divider) {
              return (
                <li key="today" className="grid grid-cols-12 gap-6 items-center">
                  <div className="col-span-2 md:col-span-3 text-right">
                    <div className="mono" style={{ color: "var(--gold)" }}>TODAY</div>
                  </div>
                  <div className="col-span-10 md:col-span-9 flex items-center gap-2">
                    <span className="block w-3 h-3 rounded-full" style={{ background: "var(--gold)" }} />
                    <span className="block flex-1 h-px" style={{
                      backgroundImage: "linear-gradient(to right, var(--gold) 50%, transparent 50%)",
                      backgroundSize: "8px 1px",
                    }} />
                  </div>
                </li>
              );
            }
            const wb = w as WebinarDto;
            const isUpcoming = upcoming.some(u => u.id === wb.id);
            const refCode = `WB-${String(wb.id).padStart(4, "0")}`;
            const durationLabel = wb.durationMinutes ? `${wb.durationMinutes} min` : "—";

            return (
              <li key={wb.id} className="grid grid-cols-12 gap-6 items-start">
                <div className="col-span-2 md:col-span-3 text-right">
                  {/* Bug 6: use fmtDate, never new Date() on dotted strings */}
                  <div className="mono tabular" style={{ color: "var(--gold)", fontSize: 11 }}>{fmtDate(wb.scheduledAt)}</div>
                  <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{durationLabel}</div>
                </div>
                <div className="col-span-10 md:col-span-9 relative">
                  <span className="absolute -left-[7px] md:-left-[33px] top-3 w-3 h-3 rounded-full" style={{ background: isUpcoming ? "var(--ink)" : "var(--rule-strong)" }} />
                  <div className="mono mb-2" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{refCode} · {isUpcoming ? "FORTHCOMING" : "ARCHIVED"}</div>
                  <h3 className="serif" style={{ fontSize: "clamp(1.5rem, 2.6vw, 2.25rem)", fontWeight: 300, lineHeight: 1.15 }}>
                    {wb.title}
                  </h3>
                  <p className="mt-3 max-w-[60ch]" style={{ color: "var(--ink-soft)" }}>
                    With <em>{wb.host?.fullName ?? "—"}</em>{wb.speakerAffiliation ? `, ${wb.speakerAffiliation}` : ""}. {isUpcoming ? "Open for reservations." : "Recording available to subscribers."}
                  </p>
                  <div className="mt-4">
                    <a className="mono" href={`#/webinars/${wb.id}`} style={{ color: "var(--gold)" }}>
                      {isUpcoming ? "RESERVE A SEAT →" : "WATCH RECORDING →"}
                    </a>
                  </div>
                </div>
                <div className="hidden">{i}</div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
