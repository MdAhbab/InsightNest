import { useCallback, useEffect, useState } from "react";
import { useRouter } from "../router";
import { DetailShell, DataList, H2, Para } from "../components/DetailShell";
import { CornerMark } from "../components/Seal";
import { ApiError } from "../api/client";
import { fmtDate } from "../api/format";
import {
  universitiesGet,
  programsList,
  researchList,
  UniversityDto,
  ProgramDto,
  ResearchProjectDto,
} from "../api/endpoints";

const PHOTOS: Record<string, string> = {
  default: "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=2000&q=80",
};

function Skeleton() {
  return (
    <div className="py-6 space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-4 rounded" style={{ background: "var(--rule-strong)", width: `${80 - i * 10}%`, opacity: 0.5 }} />
      ))}
    </div>
  );
}

export default function UniversityDetail() {
  const { params } = useRouter();
  const id = Number(params.id);

  const [u, setU] = useState<UniversityDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ status?: number; message: string } | null>(null);

  const [tab, setTab] = useState<"about" | "programs" | "research" | "rep">("about");

  const [inProgs, setInProgs] = useState<ProgramDto[]>([]);
  const [inResearch, setInResearch] = useState<ResearchProjectDto[]>([]);

  const loadDetail = useCallback(async () => {
    if (!id || isNaN(id)) {
      setError({ status: 404, message: "Invalid university ID." });
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await universitiesGet(id);
      setU(data);
      // Load related programs and research in parallel
      const [progsData, resData] = await Promise.all([
        programsList({ page: 0, size: 50, universityId: id }),
        researchList({ page: 0, size: 50 }),
      ]);
      setInProgs(progsData.content);
      // Filter research by institution name match (client-side, no universityId param)
      const institutionName = data.name;
      const resFiltered = resData.content.filter(r =>
        r.institution && r.institution.toLowerCase().includes(institutionName.split(" ")[0].toLowerCase())
      );
      setInResearch(resFiltered);
    } catch (e) {
      if (e instanceof ApiError) {
        setError({ status: e.status, message: e.message });
      } else {
        setError({ message: "Failed to load university." });
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadDetail(); }, [loadDetail]);

  if (loading) {
    return (
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pt-36 pb-32">
        <Skeleton />
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pt-36 pb-32">
        <a href="#/universities" className="mono inline-flex items-center gap-2" style={{ color: "var(--ink-soft)" }}>
          <span style={{ color: "var(--gold)" }}>←</span> Index of universities
        </a>
        <div className="mt-20 text-center">
          {error.status === 404 ? (
            <>
              <div className="mono" style={{ color: "var(--gold)", fontSize: 11 }}>404 — NOT FOUND</div>
              <h1 className="serif mt-6" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 300 }}>University not found.</h1>
              <p className="mt-4" style={{ color: "var(--ink-soft)" }}>This entry may have been removed from the atlas.</p>
              <a href="#/universities" className="btn-ink mt-8 inline-flex"><span>Back to index</span></a>
            </>
          ) : (
            <>
              <div className="mono" style={{ color: "var(--oxblood)", fontSize: 11 }}>{error.message}</div>
              <button onClick={loadDetail} className="btn-ink mt-6"><span>Retry</span></button>
            </>
          )}
        </div>
      </main>
    );
  }

  if (!u) return null;

  return (
    <DetailShell
      back={{ href: "#/universities", label: "Index of universities" }}
      kicker="UNIVERSITY · PROFILE"
      index={`№ ${String(u.id).padStart(3, "0")}`}
      title={u.name}
      meta={u.foundedYear ? `FOUNDED · ${u.foundedYear}` : undefined}
      lede={<>{u.name}{u.foundedYear ? `, founded in ${u.foundedYear}` : ""} in {u.city}, hosts approximately {u.studentCount != null ? u.studentCount.toLocaleString() : "—"} students across its faculties and admits postgraduates annually.</>}
      hero={
        <div className="relative aspect-[21/9] overflow-hidden" style={{ background: "var(--paper-deep)" }}>
          <div className="absolute inset-0 duotone" style={{ backgroundImage: `url(${PHOTOS.default})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="absolute top-4 left-4"><CornerMark /></div>
          <div className="absolute bottom-4 right-4 mono" style={{ color: "var(--paper)" }}>PLATE · {u.name.split(" ").slice(-1)[0].toUpperCase()} · INSTITUTION</div>
        </div>
      }
      body={
        <>
          <nav className="flex gap-px" style={{ background: "var(--rule)" }}>
            {(["about","programs","research","rep"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className="flex-1 py-3 mono" style={{
                background: tab === t ? "var(--ink)" : "var(--paper)",
                color: tab === t ? "var(--paper)" : "var(--ink-soft)",
                fontSize: 11,
              }}>
                {t === "about" ? "I — About" : t === "programs" ? `II — Programmes (${inProgs.length})` : t === "research" ? `III — Research (${inResearch.length})` : "IV — Representative"}
              </button>
            ))}
          </nav>

          {tab === "about" && (
            <>
              <H2 index="01">A reading on the institution</H2>
              <Para>
                {u.description ?? `${u.name} retains the character of ${!u.foundedYear ? "an established" : u.foundedYear < 1700 ? "an early-modern" : u.foundedYear < 1900 ? "a long-established" : "a modern"} university — its faculty composition, library holdings, and admissions conventions reflect that heritage. Postgraduate applications are read by faculty committees during the autumn round; supervision is allocated thereafter.`}
              </Para>
              {u.tags && u.tags.length > 0 && (
                <Para>
                  The institution is associated with {u.tags.join(", ").toLowerCase()}. Its current academic head is named in the annual register; correspondence concerning programmes should be directed to the relevant department.
                </Para>
              )}

              <H2 index="02">Faculties &amp; admissions</H2>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-px" style={{ background: "var(--rule)" }}>
                {["Humanities","Sciences","Engineering","Social Sciences","Life Sciences","Medicine"].map((f, i) => (
                  <li key={f} className="p-5" style={{ background: "var(--paper-raised)" }}>
                    <div className="mono" style={{ color: "var(--gold)", fontSize: 10 }}>{String(i+1).padStart(2,"0")}</div>
                    <div className="serif mt-2" style={{ fontSize: "1.0625rem" }}>{f}</div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {tab === "programs" && (
            <>
              <H2 index="01">Programmes at {u.name}</H2>
              {inProgs.length === 0 ? (
                <div className="py-8 mono" style={{ color: "var(--ink-faint)" }}>No programmes listed for this university. <a href="#/programs" style={{ color: "var(--gold)" }}>Browse all →</a></div>
              ) : (
                <ul>
                  {inProgs.map((p, i) => (
                    <li key={p.id} className="grid grid-cols-12 gap-4 py-5 border-b border-[var(--rule)] items-baseline">
                      <span className="col-span-1 mono tabular" style={{ color: "var(--gold)" }}>{String(i+1).padStart(2,"0")}</span>
                      <div className="col-span-8">
                        <a href={`#/programs/${p.id}`} className="serif hover:text-[var(--gold)]" style={{ fontSize: "1.125rem" }}>{p.name}</a>
                        <div className="mono mt-1" style={{ color: "var(--ink-soft)" }}>{p.type ?? "—"} · {p.duration ?? "—"} · {p.tuition ?? "—"}</div>
                      </div>
                      <div className="col-span-3 mono text-right" style={{ color: "var(--gold)" }}>DL {fmtDate(p.applicationDeadline)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {tab === "research" && (
            <>
              <H2 index="01">Open research positions</H2>
              {inResearch.length === 0 ? (
                <div className="py-8 mono" style={{ color: "var(--ink-faint)" }}>No research projects found for this institution. <a href="#/research" style={{ color: "var(--gold)" }}>Browse all →</a></div>
              ) : (
                <ul>
                  {inResearch.map((r, i) => (
                    <li key={r.id} className="grid grid-cols-12 gap-4 py-5 border-b border-[var(--rule)] items-baseline">
                      <span className="col-span-1 mono tabular" style={{ color: "var(--gold)" }}>{String(i+1).padStart(2,"0")}</span>
                      <div className="col-span-8">
                        <a href={`#/research/${r.id}`} className="serif hover:text-[var(--gold)]" style={{ fontSize: "1.125rem" }}>{r.title}</a>
                        <div className="mono mt-1" style={{ color: "var(--ink-soft)" }}>{r.lab ?? "—"} · {r.pi ?? r.createdBy?.fullName ?? "—"}</div>
                      </div>
                      <div className="col-span-3 mono text-right tabular">{r.openings ?? "—"} open</div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {tab === "rep" && (
            <>
              <H2 index="01">University representative</H2>
              <div className="p-6 border border-[var(--rule-strong)]">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 border border-[var(--ink)] flex items-center justify-center serif" style={{ fontSize: 22 }}>D</div>
                  <div>
                    <div className="serif" style={{ fontSize: "1.25rem" }}>Admissions Office</div>
                    <div className="mono mt-1" style={{ color: "var(--ink-soft)" }}>Head of Outreach · {u.name}</div>
                    <div className="mono mt-1" style={{ color: "var(--ink-faint)" }}>OPEN OFFICE · WED 14:00 — 16:00</div>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  {/* Link to messages (no specific admissions email — link to messages list) */}
                  <a href="#/messages" className="btn-ink"><span>Send a letter</span></a>
                  <a href="#/webinars" className="btn-ink btn-ghost"><span>Open offices</span></a>
                </div>
              </div>
            </>
          )}
        </>
      }
      rail={
        <>
          <div className="border border-[var(--rule-strong)] p-6">
            <div className="mono pb-3 border-b border-[var(--rule)]" style={{ color: "var(--gold)" }}>RECORD</div>
            <DataList rows={[
              { k: "FOUNDED",  v: <span className="tabular serif" style={{ fontSize: "1.25rem" }}>{u.foundedYear ?? "—"}</span> },
              { k: "RANKING",  v: <span className="tabular">{u.ranking != null ? `#${u.ranking}` : "—"}</span> },
              { k: "STUDENTS", v: <span className="tabular">{u.studentCount != null ? u.studentCount.toLocaleString() : "—"}</span> },
              { k: "CITY",     v: u.city },
              { k: "COUNTRY",  v: u.country },
              ...(u.tags && u.tags.length > 0 ? [{ k: "AFFIL.", v: u.tags.join(", ") }] : []),
            ]} />
          </div>

          <div className="border border-[var(--rule-strong)] p-6">
            <div className="mono pb-3 border-b border-[var(--rule)]" style={{ color: "var(--gold)" }}>ACTIONS</div>
            <div className="space-y-3 mt-4">
              <a href={`#/programs?universityId=${u.id}`} className="btn-ink w-full justify-center"><span>Browse programmes</span></a>
              <a href={`#/research`} className="btn-ink btn-ghost w-full justify-center"><span>Open research</span></a>
              <a href="#/messages" className="btn-ink btn-ghost w-full justify-center"><span>Write to admissions</span></a>
              {u.website && (
                <a href={u.website} target="_blank" rel="noopener noreferrer" className="btn-ink btn-ghost w-full justify-center"><span>Visit website ↗</span></a>
              )}
            </div>
          </div>
        </>
      }
    />
  );
}
