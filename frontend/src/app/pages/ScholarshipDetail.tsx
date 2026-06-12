import { useCallback, useEffect, useState } from "react";
import { useRouter } from "../router";
import { DetailShell, DataList, H2, Para } from "../components/DetailShell";
import { ApplyFlow } from "../components/ApplyFlow";
import { ApiError } from "../api/client";
import { fmtDate, fmtMoney } from "../api/format";
import { useSession } from "../providers/SessionProvider";
import { useToast } from "../components/Toast";
import {
  scholarshipsGet,
  scholarshipApply,
  savedItemsList,
  savedItemsCreate,
  savedItemsDelete,
  ScholarshipDto,
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

export default function ScholarshipDetail() {
  const { params } = useRouter();
  const { session } = useSession();
  const toast = useToast();
  const id = Number(params.id);

  const [s, setS] = useState<ScholarshipDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ status?: number; message: string } | null>(null);
  const [apply, setApply] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applyPending, setApplyPending] = useState(false);

  const [savedId, setSavedId] = useState<number | null>(null);
  const [savePending, setSavePending] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!id || isNaN(id)) {
      setError({ status: 404, message: "Invalid scholarship ID." });
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await scholarshipsGet(id);
      setS(data);
      if (session.signedIn) {
        const saved = await savedItemsList();
        const found = saved.find(sv => sv.itemType === "SCHOLARSHIP" && sv.itemId === id);
        setSavedId(found?.id ?? null);
      }
    } catch (e) {
      if (e instanceof ApiError) {
        setError({ status: e.status, message: e.message });
      } else {
        setError({ message: "Failed to load scholarship." });
      }
    } finally {
      setLoading(false);
    }
  }, [id, session.signedIn]);

  useEffect(() => { loadDetail(); }, [loadDetail]);

  const handleApplySubmit = async (answers: Record<string, string>) => {
    if (!s) return;
    setApplyPending(true);
    setApplyError("");
    try {
      const statement = [
        `Particulars: ${answers.name ?? ""}, DOB: ${answers.dob ?? ""}, Nationality: ${answers.nat ?? ""}`,
        `Eligibility: Degree: ${answers.deg ?? ""}, Year: ${answers.year ?? ""}, Confirm: ${answers.elig ?? ""}`,
        `Personal statement: ${answers.stmt ?? ""}`,
        `Proposed project: ${answers.proj ?? ""}`,
        `References: ${answers.ref1 ?? ""}, ${answers.ref2 ?? ""}`,
      ].join("\n\n");
      await scholarshipApply(s.id, { statement });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Submission failed.";
      setApplyError(msg);
      throw new Error(msg);
    } finally {
      setApplyPending(false);
    }
  };

  const handleSave = async () => {
    if (!s) return;
    if (!session.signedIn) {
      window.location.hash = `#/login?next=/scholarships/${s.id}`;
      return;
    }
    setSavePending(true);
    try {
      if (savedId != null) {
        await savedItemsDelete(savedId);
        setSavedId(null);
        toast("Removed from folio", "info");
      } else {
        const saved = await savedItemsCreate({ itemType: "SCHOLARSHIP", itemId: s.id });
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
        <a href="#/scholarships" className="mono inline-flex items-center gap-2" style={{ color: "var(--ink-soft)" }}>
          <span style={{ color: "var(--gold)" }}>←</span> Scholarship ledger
        </a>
        <div className="mt-20 text-center">
          {error.status === 404 ? (
            <>
              <div className="mono" style={{ color: "var(--gold)", fontSize: 11 }}>404 — NOT FOUND</div>
              <h1 className="serif mt-6" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 300 }}>Scholarship not found.</h1>
              <a href="#/scholarships" className="btn-ink mt-8 inline-flex"><span>Back to ledger</span></a>
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

  if (!s) return null;

  const deadlineYear = s.deadline ? parseInt(s.deadline.split("-")[0] || s.deadline.split(".")[0] || "2026") : 2026;

  return (
    <>
      <DetailShell
        back={{ href: "#/scholarships", label: "Scholarship ledger" }}
        kicker={`SCHOLARSHIP · SC-${String(s.id).padStart(4, "0")}`}
        title={s.title}
        meta={`DEADLINE · ${fmtDate(s.deadline)}`}
        lede={<>An award of {fmtMoney(s.amount, s.currency)} per year, offered by {s.funder ?? "—"} to {(s.level ?? "eligible").toLowerCase()} candidates {(s.region ?? "").toLowerCase() === "worldwide" ? "anywhere in the world" : s.region ? `from ${s.region.toLowerCase()}` : "globally"}.</>}
        body={
          <>
            <H2 index="01">About the award</H2>
            {s.description ? (
              <Para>{s.description}</Para>
            ) : (
              <Para>
                The {s.title} has been awarded annually since the foundation of the {s.funder ?? "—"}. It covers full tuition,
                an unrestricted living stipend, a return airfare, and a one-off settling allowance. Recipients are
                expected to participate in the trust's standing programme of seminars during their tenure.
              </Para>
            )}

            <H2 index="02">Eligibility</H2>
            {s.eligibility ? (
              <Para>{s.eligibility}</Para>
            ) : null}
            <ul className="space-y-3">
              {[
                `Be a national of an eligible country${s.region ? ` in the ${s.region.toLowerCase()} region` : ""}.`,
                `Hold (or expect to hold) an honours undergraduate degree by 1 October ${deadlineYear + 1}.`,
                "Be 28 years of age or younger at the closing of the round.",
                "Not have previously held a comparable award from the same funder.",
              ].map((t, i) => (
                <li key={i} className="grid grid-cols-12 gap-3 py-3 border-b border-[var(--rule)]">
                  <span className="col-span-1 mono tabular" style={{ color: "var(--gold)" }}>{String(i+1).padStart(2,"0")}</span>
                  <span className="col-span-11">{t}</span>
                </li>
              ))}
            </ul>

            <H2 index="03">Selection</H2>
            <ol className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: "var(--rule)" }}>
              {["Written round","Written examination","Regional interview","Final panel"].map((t, i) => (
                <li key={t} className="p-6" style={{ background: "var(--paper-raised)" }}>
                  <div className="mono" style={{ color: "var(--gold)", fontSize: 10 }}>{String(i+1).padStart(2,"0")}</div>
                  <div className="serif mt-2" style={{ fontSize: "1.125rem" }}>{t}</div>
                  <p className="mt-1" style={{ color: "var(--ink-soft)" }}>
                    Conducted across {i+1} sittings between {fmtDate(s.deadline)} and the end of the panel round.
                  </p>
                </li>
              ))}
            </ol>

            <H2 index="04">Apply</H2>
            <Para>
              File a single application; the trust will request supplementary materials should you progress
              to interview. Letters of reference may be submitted up to two weeks after the written round.
            </Para>
          </>
        }
        rail={
          <>
            <div className="border border-[var(--rule-strong)] p-6">
              <div className="mono pb-3 border-b border-[var(--rule)]" style={{ color: "var(--gold)" }}>AWARD</div>
              <div className="serif tabular mt-3" style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)", fontWeight: 300, color: "var(--ink)" }}>
                {fmtMoney(s.amount, s.currency)}
              </div>
              <div className="mono mt-1" style={{ color: "var(--ink-soft)" }}>per annum, all costs included</div>
              <div className="mt-6">
                <DataList rows={[
                  { k: "REF",      v: <span className="tabular">SC-{String(s.id).padStart(4,"0")}</span> },
                  { k: "FUNDER",   v: s.funder ?? "—" },
                  { k: "REGION",   v: s.region ?? "—" },
                  { k: "LEVEL",    v: s.level ?? "—" },
                  { k: "DEADLINE", v: <span className="mono" style={{ color: "var(--gold)" }}>{fmtDate(s.deadline)}</span> },
                ]} />
              </div>
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
                    <span>{applyPending ? "Submitting…" : "Begin application"}</span>
                  </button>
                ) : (
                  <a href={`#/login?next=/scholarships/${s.id}`} className="btn-ink btn-gold w-full justify-center"><span>Sign in to apply</span></a>
                )}
                <button
                  onClick={handleSave}
                  disabled={savePending}
                  className="btn-ink w-full justify-center"
                  style={{ opacity: savePending ? 0.65 : 1 }}
                >
                  <span>{savedId != null ? "Saved to folio ✓" : "Save to folio"}</span>
                </button>
                <a href="#/digest" className="btn-ink btn-ghost w-full justify-center"><span>Add to Sentinel</span></a>
              </div>
            </div>
          </>
        }
      />
      {apply && (
        <ApplyFlow
          title={s.title}
          refCode={`SC-${String(s.id).padStart(4, "0")}`}
          onClose={() => { setApply(false); setApplyError(""); }}
          submitError={applyError}
          onSubmit={handleApplySubmit}
          steps={[
            { title: "I — Particulars", fields: [{ key: "name", label: "Full name" }, { key: "dob", label: "Date of birth" }, { key: "nat", label: "Nationality" }] },
            { title: "II — Eligibility", fields: [{ key: "deg", label: "Awarded degree" }, { key: "year", label: "Year of award" }, { key: "elig", label: "Confirm eligibility statement", type: "select", options: ["Yes", "Need clarification"] }] },
            { title: "III — Written round", fields: [{ key: "stmt", label: "Personal statement (1,000 words)", type: "long" }, { key: "proj", label: "Proposed project (500 words)", type: "long" }] },
            { title: "IV — References", fields: [{ key: "ref1", label: "Referee one (name & address)" }, { key: "ref2", label: "Referee two (name & address)" }] },
            { title: "V — File & submit", fields: [{ key: "cv", label: "Curriculum vitae", type: "file" }, { key: "agree", label: "I confirm the above is accurate", type: "select", options: ["Yes", "No"] }] },
          ]}
        />
      )}
    </>
  );
}
