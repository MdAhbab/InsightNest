import { useCallback, useEffect, useState } from "react";
import { useRouter } from "../router";
import { DetailShell, DataList, H2, Para } from "../components/DetailShell";
import { ApplyFlow } from "../components/ApplyFlow";
import { ApiError } from "../api/client";
import { fmtDate } from "../api/format";
import { useSession } from "../providers/SessionProvider";
import { useToast } from "../components/Toast";
import {
  researchGet,
  researchJoin,
  savedItemsList,
  savedItemsCreate,
  savedItemsDelete,
  ResearchProjectDto,
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

export default function ResearchDetail() {
  const { params } = useRouter();
  const { session } = useSession();
  const toast = useToast();
  const id = Number(params.id);

  const [r, setR] = useState<ResearchProjectDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ status?: number; message: string } | null>(null);
  const [apply, setApply] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applyPending, setApplyPending] = useState(false);

  const [savedId, setSavedId] = useState<number | null>(null);
  const [savePending, setSavePending] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!id || isNaN(id)) {
      setError({ status: 404, message: "Invalid project ID." });
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await researchGet(id);
      setR(data);
      if (session.signedIn) {
        const saved = await savedItemsList();
        const found = saved.find(sv => sv.itemType === "RESEARCH_PROJECT" && sv.itemId === id);
        setSavedId(found?.id ?? null);
      }
    } catch (e) {
      if (e instanceof ApiError) {
        setError({ status: e.status, message: e.message });
      } else {
        setError({ message: "Failed to load research project." });
      }
    } finally {
      setLoading(false);
    }
  }, [id, session.signedIn]);

  useEffect(() => { loadDetail(); }, [loadDetail]);

  // ApplyFlow submit — serializes exam-step answers into a join-request message
  const handleApplySubmit = async (answers: Record<string, string>) => {
    if (!r) return;
    setApplyPending(true);
    setApplyError("");
    try {
      const message = [
        `Particulars: ${answers.name ?? ""}, Return address: ${answers.email ?? ""}`,
        `Background — Recent project: ${answers.exp ?? ""}`,
        `Background — Methodology: ${answers.method ?? ""}`,
        `Reading — Paper response: ${answers.paper ?? ""}`,
        `Reading — Confidence with method: ${answers.conf ?? ""}`,
        `Intent — Publication goal: ${answers.pub ?? ""}`,
        `Intent — Availability: ${answers.when ?? ""}`,
      ].join("\n\n");
      await researchJoin(r.id, { message });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Submission failed.";
      setApplyError(msg);
      throw new Error(msg);
    } finally {
      setApplyPending(false);
    }
  };

  const handleSave = async () => {
    if (!r) return;
    if (!session.signedIn) {
      window.location.hash = `#/login?next=/research/${r.id}`;
      return;
    }
    setSavePending(true);
    try {
      if (savedId != null) {
        await savedItemsDelete(savedId);
        setSavedId(null);
        toast("Removed from folio", "info");
      } else {
        const saved = await savedItemsCreate({ itemType: "RESEARCH_PROJECT", itemId: r.id });
        setSavedId(saved.id);
        toast("Saved to folio", "ok");
      }
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Save failed.", "err");
    } finally {
      setSavePending(false);
    }
  };

  if (loading) return <Skeleton />;

  // Bug 8: Proper not-found state
  if (error) {
    return (
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pt-36 pb-32">
        <a href="#/research" className="mono inline-flex items-center gap-2" style={{ color: "var(--ink-soft)" }}>
          <span style={{ color: "var(--gold)" }}>←</span> Research orbit
        </a>
        <div className="mt-20 text-center">
          {error.status === 404 ? (
            <>
              <div className="mono" style={{ color: "var(--gold)", fontSize: 11 }}>404 — NOT FOUND</div>
              <h1 className="serif mt-6" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 300 }}>Project not found.</h1>
              <a href="#/research" className="btn-ink mt-8 inline-flex"><span>Back to orbit</span></a>
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

  if (!r) return null;

  const refCode = `RX-${String(r.id).padStart(4, "0")}`;
  const tags = r.tags ? r.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
  const piName = r.pi ?? r.createdBy?.fullName ?? "—";
  const piLastName = piName.split(" ").slice(-1)[0];

  // Learner-only apply; Faculty/Rep see disabled note
  const canApply = session.signedIn && session.role === "Learner";
  const isNonLearner = session.signedIn && session.role !== "Learner";

  return (
    <>
      <DetailShell
        back={{ href: "#/research", label: "Research orbit" }}
        kicker={`PROJECT · ${refCode}`}
        title={r.title}
        meta={`${r.status ?? "OPEN"} · ${r.openings != null ? `${r.openings} POSITIONS` : "POSITIONS OPEN"}`}
        lede={<>An open collaboration position with {r.lab ?? "the laboratory"} at {r.institution ?? "the institution"}, supervised by {piName}, in the field of {(r.field ?? "research").toLowerCase()}.</>}
        body={
          <>
            <H2 index="01">The project</H2>
            <Para>
              {r.description
                ? r.description
                : `${r.title}. The group seeks ${r.openings ?? "several"} doctoral or post-doctoral collaborators with backgrounds spanning ${tags.length ? tags.join(", ") : r.requiredSkills ?? "relevant disciplines"}. The project produces deliverables including a public dataset, a methodology paper, and a doctoral chapter for each contributor.`}
            </Para>

            {r.requiredSkills && (
              <>
                <H2 index="02">Required skills</H2>
                <Para>{r.requiredSkills}</Para>
              </>
            )}

            <H2 index={r.requiredSkills ? "03" : "02"}>Who we are looking for</H2>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((t) => (
                  <span key={t} className="mono px-3 py-2 border border-[var(--ink)]" style={{ fontSize: 11 }}>{t}</span>
                ))}
              </div>
            )}
            <Para>
              We will look for evidence of methodological independence — a published preprint, a maintained piece of code,
              or a thesis chapter. Industry experience is welcome where it bears on the methods.
            </Para>

            <H2 index={r.requiredSkills ? "04" : "03"}>Process</H2>
            <ol className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: "var(--rule)" }}>
              {[
                ["Written examination", "Three short questions; one paper to respond to."],
                ["Conversation with PI", "Thirty minutes; held by video."],
                ["Lab visit (optional)", "Travel supported for shortlisted candidates."],
                ["Offer & start date", "Decision within ten working days of visit."],
              ].map(([t, d], i) => (
                <li key={t} className="p-6" style={{ background: "var(--paper-raised)" }}>
                  <div className="mono" style={{ color: "var(--gold)", fontSize: 10 }}>{String(i + 1).padStart(2, "0")}</div>
                  <div className="serif mt-2" style={{ fontSize: "1.125rem" }}>{t}</div>
                  <div className="mt-1" style={{ color: "var(--ink-soft)" }}>{d}</div>
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
                { k: "REF", v: <span className="tabular">{refCode}</span> },
                { k: "LAB", v: r.lab ?? "—" },
                { k: "INSTITUTION", v: r.institution ?? "—" },
                { k: "PI", v: piName },
                { k: "FIELD", v: r.field ?? "—" },
                { k: "OPENINGS", v: <span className="tabular serif" style={{ fontSize: "1.25rem" }}>{r.openings ?? "—"}</span> },
                { k: "STATUS", v: r.status ?? "—" },
                { k: "DEADLINE", v: <span className="mono" style={{ color: "var(--gold)" }}>{fmtDate(r.deadline)}</span> },
              ]} />
            </div>
            <div className="border border-[var(--rule-strong)] p-6">
              <div className="mono pb-3 border-b border-[var(--rule)]" style={{ color: "var(--gold)" }}>ACTIONS</div>
              <div className="space-y-3 mt-4">
                {!session.signedIn && (
                  <a href={`#/login?next=/research/${r.id}`} className="btn-ink btn-gold w-full justify-center"><span>Sign in to apply</span></a>
                )}
                {canApply && (
                  <button
                    onClick={() => { setApplyError(""); setApply(true); }}
                    disabled={applyPending}
                    className="btn-ink btn-gold w-full justify-center"
                    style={{ opacity: applyPending ? 0.65 : 1 }}
                  >
                    <span>{applyPending ? "Submitting…" : "Sit examination & apply"}</span>
                  </button>
                )}
                {isNonLearner && (
                  <div className="mono p-3 border border-[var(--rule-strong)] text-center" style={{ color: "var(--ink-faint)", fontSize: 10 }}>
                    Applications are open to Learner accounts only.
                  </div>
                )}
                <a href="#/messages" className="btn-ink w-full justify-center"><span>Write to {piLastName}</span></a>
                <button
                  onClick={handleSave}
                  disabled={savePending}
                  className="btn-ink btn-ghost w-full justify-center"
                  style={{ opacity: savePending ? 0.65 : 1 }}
                >
                  <span>{savedId != null ? "Saved to folio ✓" : "Save to folio"}</span>
                </button>
              </div>
            </div>
          </>
        }
      />
      {apply && (
        <ApplyFlow
          title={r.title}
          refCode={refCode}
          onClose={() => { setApply(false); setApplyError(""); }}
          submitError={applyError}
          onSubmit={handleApplySubmit}
          steps={[
            { title: "I — Particulars", fields: [{ key: "name", label: "Full name" }, { key: "email", label: "Return address" }] },
            { title: "II — Written examination · Background", fields: [
              { key: "exp", label: "Describe your most recent research project in 200 words.", type: "long" },
              { key: "method", label: "Which methodology do you bring to this group?" },
            ]},
            { title: "III — Written examination · Reading", fields: [
              { key: "paper", label: "Choose one paper from the lab's last six and respond.", type: "long" },
              { key: "conf", label: "Confidence with the method (1–5)", type: "select", options: ["1","2","3","4","5"] },
            ]},
            { title: "IV — Intent", fields: [
              { key: "pub", label: "What do you hope to publish during your stay?", type: "long" },
              { key: "when", label: "Availability window", type: "select", options: ["Fall 2026","Spring 2027","Fall 2027"] },
            ]},
            { title: "V — Documents", fields: [
              { key: "cv", label: "Curriculum vitae", type: "file" },
              { key: "writing", label: "Writing sample", type: "file" },
            ]},
          ]}
        />
      )}
    </>
  );
}
