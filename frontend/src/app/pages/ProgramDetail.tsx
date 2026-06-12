import { useCallback, useEffect, useState } from "react";
import { useRouter } from "../router";
import { DetailShell, DataList, H2, Para } from "../components/DetailShell";
import { ApplyFlow } from "../components/ApplyFlow";
import { ApiError } from "../api/client";
import { fmtDate } from "../api/format";
import { useSession } from "../providers/SessionProvider";
import { useToast } from "../components/Toast";
import {
  programsGet,
  programApply,
  savedItemsList,
  savedItemsCreate,
  savedItemsDelete,
  ProgramDto,
} from "../api/endpoints";

function Skeleton() {
  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pt-36 pb-32">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="my-4 h-4 rounded" style={{ background: "var(--rule-strong)", width: `${80 - i * 10}%`, opacity: 0.5 }} />
      ))}
    </main>
  );
}

export default function ProgramDetail() {
  const { params } = useRouter();
  const { session } = useSession();
  const toast = useToast();
  const id = Number(params.id);

  const [p, setP] = useState<ProgramDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ status?: number; message: string } | null>(null);
  const [apply, setApply] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applyPending, setApplyPending] = useState(false);

  const [savedId, setSavedId] = useState<number | null>(null);
  const [savePending, setSavePending] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!id || isNaN(id)) {
      setError({ status: 404, message: "Invalid programme ID." });
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await programsGet(id);
      setP(data);
      // Check if already saved
      if (session.signedIn) {
        const saved = await savedItemsList();
        const found = saved.find(s => s.itemType === "PROGRAM" && s.itemId === id);
        setSavedId(found?.id ?? null);
      }
    } catch (e) {
      if (e instanceof ApiError) {
        setError({ status: e.status, message: e.message });
      } else {
        setError({ message: "Failed to load programme." });
      }
    } finally {
      setLoading(false);
    }
  }, [id, session.signedIn]);

  useEffect(() => { loadDetail(); }, [loadDetail]);

  const handleApplySubmit = async (answers: Record<string, string>) => {
    if (!p) return;
    setApplyPending(true);
    setApplyError("");
    try {
      // Build readable statement from all step answers
      const statement = [
        `Identification: ${answers.name ?? ""}, ${answers.email ?? ""}, ${answers.nat ?? ""}`,
        `Prior study: ${answers.degree ?? ""} at ${answers.inst ?? ""}, GPA/mark: ${answers.gpa ?? ""}`,
        `Research proposal: ${answers.title ?? ""}\nAbstract: ${answers.abstract ?? ""}\nSupervisor: ${answers.sup ?? ""}`,
        `Statement of purpose: ${answers.statement ?? ""}`,
      ].join("\n\n");
      await programApply(p.id, { statement });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Submission failed.";
      setApplyError(msg);
      throw new Error(msg); // Propagate to ApplyFlow to show in modal
    } finally {
      setApplyPending(false);
    }
  };

  const handleSave = async () => {
    if (!p) return;
    if (!session.signedIn) {
      window.location.hash = `#/login?next=/programs/${p.id}`;
      return;
    }
    setSavePending(true);
    try {
      if (savedId != null) {
        await savedItemsDelete(savedId);
        setSavedId(null);
        toast("Removed from folio", "info");
      } else {
        const saved = await savedItemsCreate({ itemType: "PROGRAM", itemId: p.id });
        setSavedId(saved.id);
        toast("Saved to folio", "ok");
      }
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Save failed.", "error" as any);
    } finally {
      setSavePending(false);
    }
  };

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pt-36 pb-32">
        <a href="#/programs" className="mono inline-flex items-center gap-2" style={{ color: "var(--ink-soft)" }}>
          <span style={{ color: "var(--gold)" }}>←</span> Course catalogue
        </a>
        <div className="mt-20 text-center">
          {error.status === 404 ? (
            <>
              <div className="mono" style={{ color: "var(--gold)", fontSize: 11 }}>404 — NOT FOUND</div>
              <h1 className="serif mt-6" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 300 }}>Programme not found.</h1>
              <a href="#/programs" className="btn-ink mt-8 inline-flex"><span>Back to catalogue</span></a>
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

  if (!p) return null;

  return (
    <>
      <DetailShell
        back={{ href: "#/programs", label: "Course catalogue" }}
        kicker={`PROGRAMME · ${p.department ?? "—"}`}
        index={p.type ?? "—"}
        title={p.name}
        meta={`DEADLINE · ${fmtDate(p.applicationDeadline)}`}
        lede={<>A {(p.duration ?? "—").toLowerCase()} programme in {(p.department ?? "—").toLowerCase()} at {p.university?.name ?? "—"}, with thesis component and electives drawn from adjacent departments.</>}
        body={
          <>
            <H2 index="01">Outline</H2>
            {p.description ? (
              <Para>{p.description}</Para>
            ) : (
              <Para>
                The programme is structured around a research dissertation supported by a sequence of taught modules in the
                first year. Students undertake one term abroad if their topic permits, and are expected to present
                at the departmental colloquium in the second year.
              </Para>
            )}
            <Para>
              Faculty are drawn primarily from the {p.department ?? "—"} department, with cross-appointments from
              adjacent groups. The thesis is examined orally by an internal and external panel.
            </Para>

            <H2 index="02">Curriculum</H2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: "var(--rule)" }}>
              {[
                { t: "Foundations", d: "Core methods in the discipline; mandatory in term I." },
                { t: "Research methods", d: "Quantitative and archival; chosen with supervisor." },
                { t: "Elective stream", d: "Two papers from a list of fifteen, including cross-faculty." },
                { t: "Dissertation", d: "20,000–30,000 words; six-month supervised programme." },
              ].map((c, i) => (
                <li key={c.t} className="p-6" style={{ background: "var(--paper-raised)" }}>
                  <div className="mono" style={{ color: "var(--gold)", fontSize: 10 }}>{String(i+1).padStart(2,"0")}</div>
                  <div className="serif mt-2" style={{ fontSize: "1.125rem" }}>{c.t}</div>
                  <div className="mt-1" style={{ color: "var(--ink-soft)" }}>{c.d}</div>
                </li>
              ))}
            </ul>

            <H2 index="03">Entry requirements</H2>
            <ul className="space-y-3">
              {[
                "An honours degree in a related discipline, normally 2:1 or international equivalent.",
                "A research proposal of 1,500–2,500 words, prepared in conversation with a prospective supervisor.",
                "Two academic letters of reference; industry references admissible with explanation.",
                "Evidence of English-language competence where required by national policy.",
              ].map((s, i) => (
                <li key={i} className="grid grid-cols-12 gap-3 py-3 border-b border-[var(--rule)]">
                  <span className="col-span-1 mono tabular" style={{ color: "var(--gold)" }}>{String(i+1).padStart(2,"0")}</span>
                  <span className="col-span-11 serif" style={{ fontSize: "1.0625rem" }}>{s}</span>
                </li>
              ))}
            </ul>

            <H2 index="04">How to apply</H2>
            <ol className="space-y-3">
              {[
                "Open an account on InsightNest and link your folio.",
                "Save this programme to your folio and review the supervisor list.",
                "Draft the research proposal; the resource library provides a framework.",
                "File the application via the green button — five steps, twenty minutes.",
              ].map((s, i) => (
                <li key={i} className="grid grid-cols-12 gap-3 py-3 border-b border-[var(--rule)]">
                  <span className="col-span-1 mono tabular" style={{ color: "var(--gold)" }}>{String(i+1).padStart(2,"0")}</span>
                  <span className="col-span-11" style={{ color: "var(--ink)" }}>{s}</span>
                </li>
              ))}
            </ol>
          </>
        }
        rail={
          <>
            <div className="border border-[var(--rule-strong)] p-6">
              <div className="mono pb-3 border-b border-[var(--rule)]" style={{ color: "var(--gold)" }}>RECORD</div>
              <DataList rows={[
                { k: "LEVEL", v: p.type ?? "—" },
                { k: "INSTITUTION", v: <a href={p.university?.id ? `#/universities/${p.university.id}` : "#/universities"} className="hover:text-[var(--gold)]">{p.university?.name ?? "—"}</a> },
                { k: "COUNTRY", v: p.university?.country ?? "—" },
                { k: "DISCIPLINE", v: p.department ?? "—" },
                { k: "DURATION", v: p.duration ?? "—" },
                { k: "TUITION", v: p.tuition ?? "—" },
                { k: "DEADLINE", v: <span className="mono" style={{ color: "var(--gold)" }}>{fmtDate(p.applicationDeadline)}</span> },
              ]} />
            </div>
            <div className="border border-[var(--rule-strong)] p-6">
              <div className="mono pb-3 border-b border-[var(--rule)]" style={{ color: "var(--gold)" }}>ACTIONS</div>
              <div className="space-y-3 mt-4">
                {session.signedIn ? (
                  <button
                    onClick={() => { setApplyError(""); setApply(true); }}
                    disabled={applyPending}
                    className="btn-ink btn-gold w-full justify-center"
                  >
                    <span>{applyPending ? "Submitting…" : "Apply now"}</span>
                  </button>
                ) : (
                  <a href={`#/login?next=/programs/${p.id}`} className="btn-ink btn-gold w-full justify-center"><span>Sign in to apply</span></a>
                )}
                <button
                  onClick={handleSave}
                  disabled={savePending}
                  className="btn-ink w-full justify-center"
                  style={{ opacity: savePending ? 0.65 : 1 }}
                >
                  <span>{savedId != null ? "Saved to folio ✓" : "Save to folio"}</span>
                </button>
                <a href="#/messages" className="btn-ink btn-ghost w-full justify-center"><span>Ask admissions</span></a>
              </div>
            </div>
          </>
        }
      />
      {apply && (
        <ApplyFlow
          title={p.name}
          refCode={`AP-${String(p.id).padStart(3, "0")}`}
          onClose={() => { setApply(false); setApplyError(""); }}
          submitError={applyError}
          onSubmit={handleApplySubmit}
          steps={[
            { title: "I — Identification", fields: [
              { key: "name", label: "Full name" },
              { key: "email", label: "Return address", type: "short" },
              { key: "nat", label: "Nationality" },
            ]},
            { title: "II — Prior study", fields: [
              { key: "degree", label: "Most recent degree" },
              { key: "inst", label: "Awarding institution" },
              { key: "gpa", label: "Final mark / GPA" },
            ]},
            { title: "III — Research proposal", fields: [
              { key: "title", label: "Proposed title" },
              { key: "abstract", label: "Abstract (300 words)", type: "long" },
              { key: "sup", label: "Preferred supervisor" },
            ]},
            { title: "IV — Documents", fields: [
              { key: "cv", label: "Curriculum vitae", type: "file" },
              { key: "transcript", label: "Transcript", type: "file" },
              { key: "letters", label: "Two reference letters", type: "file" },
            ]},
            { title: "V — Statement & review", fields: [
              { key: "statement", label: "Statement of purpose", type: "long" },
              { key: "agree", label: "I have read the regulations", type: "select", options: ["Yes", "No"] },
            ]},
          ]}
        />
      )}
    </>
  );
}
