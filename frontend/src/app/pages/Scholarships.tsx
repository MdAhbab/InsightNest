import { useCallback, useEffect, useState } from "react";
import { PageIntro } from "../components/PageIntro";
import { useInView } from "../hooks/useScrollProgress";
import { ApiError } from "../api/client";
import { fmtDate, fmtMoney } from "../api/format";
import { scholarshipsList, ScholarshipDto } from "../api/endpoints";

function Skeleton() {
  return (
    <div className="py-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="my-6 h-4 rounded" style={{ background: "var(--rule-strong)", width: `${80 - i * 8}%`, opacity: 0.5 }} />
      ))}
    </div>
  );
}

export default function Scholarships() {
  const [items, setItems] = useState<ScholarshipDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await scholarshipsList({ page: 0, size: 100 });
      setItems(data.content);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load scholarships.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Running tally — only non-null amounts; guard null currency (bug 7)
  const total = items.reduce((acc, s) => acc + (s.amount ?? 0), 0);
  // For display: sum in thousands
  const totalDisplay = total > 0 ? `≈ ${fmtMoney(Math.round(total / 1000) * 1000, items[0]?.currency ?? "USD")}+` : "—";

  return (
    <>
      <PageIntro
        index="03"
        kicker="THE LEDGER"
        title={<>Funding, ruled and totalled.</>}
        lede="Each award appears as a single ledger line. The sum is drawn beneath the visible rows — a column running in gold."
        meta={loading ? "LOADING…" : `${items.length} OPEN`}
      />
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-32">
        <header className="grid grid-cols-12 gap-6 py-4 border-b border-[var(--rule-strong)] mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>
          <div className="col-span-1">REF</div>
          <div className="col-span-5">AWARD &amp; FUNDER</div>
          <div className="col-span-2">REGION</div>
          <div className="col-span-2">DEADLINE</div>
          <div className="col-span-2 text-right">AMOUNT</div>
        </header>

        {loading && <Skeleton />}

        {!loading && error && (
          <div className="py-10 flex flex-col items-center gap-4">
            <div className="mono" style={{ color: "var(--oxblood)", fontSize: 11 }}>{error}</div>
            <button onClick={load} className="btn-ink btn-ghost"><span>Retry</span></button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="py-12 text-center mono" style={{ color: "var(--ink-faint)" }}>
            No scholarships found.
          </div>
        )}

        <ul>
          {items.map((s, i) => (
            <ScholarshipRow key={s.id} s={s} i={i} />
          ))}
        </ul>

        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-12 gap-6 py-6 mt-2 border-t border-[var(--gold)]">
            <div className="col-span-10 mono" style={{ color: "var(--gold)" }}>SUM OF VISIBLE LINES</div>
            <div className="col-span-2 text-right serif tabular" style={{ fontSize: "1.5rem", color: "var(--gold)" }}>
              {total > 0 ? totalDisplay : "—"}
            </div>
          </div>
        )}

        <div className="mt-16 max-w-[60ch] serif" style={{ fontSize: "clamp(1.25rem, 1.8vw, 1.625rem)", fontWeight: 300, lineHeight: 1.4, color: "var(--ink-soft)" }}>
          Funding is uneven, deadlines stagger across the year, and the same award sometimes appears under
          two names. We try to keep the ledger straight.
        </div>
      </section>
    </>
  );
}

function ScholarshipRow({ s, i }: { s: ScholarshipDto; i: number }) {
  const { ref, inView } = useInView<HTMLLIElement>(0.4);
  return (
    <li ref={ref}>
      <a href={`#/scholarships/${s.id}`} className="grid grid-cols-12 gap-6 py-6 border-b border-[var(--rule)] items-baseline group hover:[&_.tally]:text-[var(--gold)]" style={{ display: "grid" }}>
        <div className="col-span-1 mono tabular" style={{ color: "var(--gold)", fontSize: 11 }}>{String(i + 1).padStart(3, "0")}</div>
        <div className="col-span-12 md:col-span-5 -mt-2 md:mt-0">
          <div className="serif" style={{ fontSize: "clamp(1.125rem, 1.5vw, 1.375rem)" }}>{s.title}</div>
          <div className="mono mt-1" style={{ color: "var(--ink-soft)" }}>{s.funder ?? "—"} · SC-{String(s.id).padStart(4, "0")}</div>
        </div>
        <div className="col-span-6 md:col-span-2 mono" style={{ color: "var(--ink-soft)", fontSize: 11 }}>{s.region ?? "—"}</div>
        {/* Bug 6: Use fmtDate for deadline */}
        <div className="col-span-6 md:col-span-2 mono" style={{ color: "var(--gold)", fontSize: 11 }}>{fmtDate(s.deadline)}</div>
        <div className="col-span-12 md:col-span-2 text-right">
          {/* Bug 7: fmtMoney guards null amount/currency */}
          <span className="serif tabular tally" style={{ fontSize: "clamp(1.125rem, 1.6vw, 1.5rem)", color: inView ? "var(--ink)" : "var(--ink-faint)", transition: "color 0.8s ease" }}>
            {fmtMoney(s.amount, s.currency)}
          </span>
          <div className="mono mt-1" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{s.level ?? "—"}</div>
        </div>
      </a>
    </li>
  );
}
