import { useCallback, useEffect, useMemo, useState } from "react";
import { PageIntro } from "../components/PageIntro";
import { LedgerRow, RowBadge } from "../components/LedgerRow";
import { ApiError } from "../api/client";
import { universitiesList, UniversityDto } from "../api/endpoints";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function Skeleton() {
  return (
    <div className="py-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="my-4 h-4 rounded" style={{ background: "var(--rule-strong)", width: `${85 - i * 8}%`, opacity: 0.5 }} />
      ))}
    </div>
  );
}

export default function Universities() {
  const [active, setActive] = useState(0);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<UniversityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Load large page for A-Z rail; server-side search if q provided
      const data = await universitiesList({ page: 0, size: 100 });
      setItems(data.content);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load universities.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const lq = q.toLowerCase();
    const list = items.filter((u) =>
      !q ||
      u.name.toLowerCase().includes(lq) ||
      u.country.toLowerCase().includes(lq) ||
      (u.city ?? "").toLowerCase().includes(lq)
    );
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [items, q]);

  const presentLetters = new Set(filtered.map((u) => u.name[0]?.toUpperCase()));

  return (
    <>
      <PageIntro
        index="01"
        kicker="THE INDEX"
        title={<>An atlas of universities, by letter.</>}
        lede="Sorted A–Z, with the year of founding rendered behind each entry as a marker of pedigree, not promotion."
        meta={loading ? "LOADING…" : `${filtered.length} ENTRIES`}
      />

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-32">
        <div className="grid grid-cols-12 gap-6">
          {/* Letter rail */}
          <aside className="hidden md:block col-span-1 sticky top-28 self-start">
            <ul className="mono space-y-1" style={{ fontSize: 12 }}>
              {LETTERS.map((L) => {
                const has = presentLetters.has(L);
                const isActive = filtered[active]?.name[0]?.toUpperCase() === L;
                return (
                  <li key={L}>
                    <button
                      disabled={!has}
                      onClick={() => {
                        const i = filtered.findIndex((u) => u.name[0]?.toUpperCase() === L);
                        if (i >= 0) {
                          setActive(i);
                          document.getElementById(`u-${filtered[i].id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }
                      }}
                      className="tabular block"
                      style={{
                        color: isActive ? "var(--gold)" : has ? "var(--ink)" : "var(--ink-faint)",
                        opacity: has ? 1 : 0.4,
                      }}
                    >{L}</button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Giant founding-year backdrop */}
          <div className="relative col-span-12 md:col-span-11">
            <div
              aria-hidden
              className="hidden md:block absolute right-0 top-12 select-none pointer-events-none tabular"
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 300,
                fontSize: "clamp(8rem, 26vw, 22rem)",
                color: "var(--paper-deep)",
                lineHeight: 0.85,
                letterSpacing: "-0.04em",
              }}
            >
              {filtered[active]?.foundedYear ?? ""}
            </div>

            <div className="relative">
              <div className="field-underline mb-6" style={{ paddingTop: 0 }}>
                <input
                  placeholder="Search by name or country"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  style={{ fontSize: "1.25rem" }}
                />
              </div>

              {loading && <Skeleton />}

              {!loading && error && (
                <div className="py-10 flex flex-col items-center gap-4">
                  <div className="mono" style={{ color: "var(--oxblood)", fontSize: 11 }}>{error}</div>
                  <button onClick={load} className="btn-ink btn-ghost"><span>Retry</span></button>
                </div>
              )}

              {!loading && !error && filtered.length === 0 && (
                <div className="py-12 text-center mono" style={{ color: "var(--ink-faint)" }}>
                  No universities found{q ? ` matching "${q}"` : ""}.
                </div>
              )}

              <ul>
                {filtered.map((u, i) => (
                  <li id={`u-${u.id}`} key={u.id} onMouseEnter={() => setActive(i)}>
                    <LedgerRow
                      index={String(i + 1).padStart(3, "0")}
                      title={<>{u.name}</>}
                      subtitle={<>{u.city} · {u.country}</>}
                      meta={<>FOUNDED · {u.foundedYear ?? "—"} · {u.ranking != null ? `#${u.ranking}` : "—"}</>}
                      href={`#/universities/${u.id}`}
                      badges={(u.tags ?? []).slice(0, 1).map((t) => (
                        <RowBadge key={t}>{t}</RowBadge>
                      ))}
                      expandable={true}
                      detail={
                        <div className="grid grid-cols-12 gap-6">
                          <div className="col-span-12 md:col-span-7">
                            <div className="serif" style={{ fontSize: "1.5rem", fontWeight: 300 }}>About {u.name}</div>
                            <p className="mt-3" style={{ color: "var(--ink-soft)" }}>
                              {u.description ?? `${u.name}${u.foundedYear ? `, founded ${u.foundedYear}` : ""} in ${u.city}, hosts approximately ${u.studentCount != null ? u.studentCount.toLocaleString() : "—"} students across its faculties. It maintains active research collaborations and admits postgraduates annually.`}
                            </p>
                          </div>
                          <div className="col-span-12 md:col-span-4 md:col-start-9 flex flex-col gap-3 mono" style={{ color: "var(--ink-soft)", fontSize: 11 }}>
                            <div>FOUNDED — <span style={{ color: "var(--ink)" }}>{u.foundedYear ?? "—"}</span></div>
                            <div>STUDENTS — <span style={{ color: "var(--ink)" }} className="tabular">{u.studentCount != null ? u.studentCount.toLocaleString() : "—"}</span></div>
                            <div>RANK — <span style={{ color: "var(--gold)" }} className="tabular">{u.ranking != null ? `#${u.ranking}` : "—"}</span></div>
                            <div className="pt-4"><a href={`#/programs?universityId=${u.id}`} className="btn-ink"><span>View programmes</span></a></div>
                          </div>
                        </div>
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
