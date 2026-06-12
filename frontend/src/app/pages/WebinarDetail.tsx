import { useCallback, useEffect, useState } from "react";
import { useRouter } from "../router";
import { DetailShell, DataList, H2, Para } from "../components/DetailShell";
import { ApiError } from "../api/client";
import { fmtDate } from "../api/format";
import { useSession } from "../providers/SessionProvider";
import { useToast } from "../components/Toast";
import {
  webinarsGet,
  webinarsRegister,
  webinarsCancel,
  webinarRegistrationsMe,
  WebinarDto,
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

export default function WebinarDetail() {
  const { params } = useRouter();
  const { session } = useSession();
  const toast = useToast();
  const id = Number(params.id);

  const [w, setW] = useState<WebinarDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ status?: number; message: string } | null>(null);

  // Registration state
  const [registrationId, setRegistrationId] = useState<number | null>(null);
  const [regPending, setRegPending] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!id || isNaN(id)) {
      setError({ status: 404, message: "Invalid webinar ID." });
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await webinarsGet(id);
      setW(data);
      // Check if signed-in user already registered
      if (session.signedIn) {
        try {
          const regs = await webinarRegistrationsMe();
          const found = regs.find(r => r.webinar.id === id && r.status === "REGISTERED");
          setRegistrationId(found?.id ?? null);
        } catch {
          // Silent — not critical
        }
      }
    } catch (e) {
      if (e instanceof ApiError) {
        setError({ status: e.status, message: e.message });
      } else {
        setError({ message: "Failed to load webinar." });
      }
    } finally {
      setLoading(false);
    }
  }, [id, session.signedIn]);

  useEffect(() => { loadDetail(); }, [loadDetail]);

  const isUpcoming = w
    ? (w.status === "UPCOMING" || (w as any).displayStatus === "UPCOMING" ||
       (!w.status?.includes("PAST") && w.scheduledAt ? new Date(w.scheduledAt) > new Date() : false))
    : false;

  const handleReserve = async () => {
    if (!w) return;
    if (!session.signedIn) {
      window.location.hash = `#/login?next=/webinars/${w.id}`;
      return;
    }
    setRegPending(true);
    try {
      const reg = await webinarsRegister(w.id);
      setRegistrationId(reg.id);
      toast("Seat reserved.", "ok");
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Reservation failed.", "err");
    } finally {
      setRegPending(false);
    }
  };

  const handleCancel = async () => {
    if (!w || registrationId == null) return;
    setRegPending(true);
    try {
      await webinarsCancel(w.id);
      setRegistrationId(null);
      toast("Reservation cancelled.", "info");
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Cancellation failed.", "err");
    } finally {
      setRegPending(false);
    }
  };

  if (loading) return <Skeleton />;

  // Bug 8: Proper not-found state
  if (error) {
    return (
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pt-36 pb-32">
        <a href="#/webinars" className="mono inline-flex items-center gap-2" style={{ color: "var(--ink-soft)" }}>
          <span style={{ color: "var(--gold)" }}>←</span> Standing programme
        </a>
        <div className="mt-20 text-center">
          {error.status === 404 ? (
            <>
              <div className="mono" style={{ color: "var(--gold)", fontSize: 11 }}>404 — NOT FOUND</div>
              <h1 className="serif mt-6" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 300 }}>Webinar not found.</h1>
              <a href="#/webinars" className="btn-ink mt-8 inline-flex"><span>Back to programme</span></a>
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

  if (!w) return null;

  const refCode = `WB-${String(w.id).padStart(4, "0")}`;
  const durationLabel = w.durationMinutes ? `${w.durationMinutes} min` : "—";
  const speakerName = w.host?.fullName ?? "—";

  return (
    <DetailShell
      back={{ href: "#/webinars", label: "Standing programme" }}
      kicker={`WEBINAR · ${refCode}`}
      title={w.title}
      meta={`${fmtDate(w.scheduledAt)} · ${durationLabel}`}
      lede={<>A conversation with <em>{speakerName}</em>{w.speakerAffiliation ? `, ${w.speakerAffiliation}` : ""}. {isUpcoming ? "Open for reservations." : "Recording available to subscribers."}</>}
      body={
        <>
          <H2 index="01">About the conversation</H2>
          <Para>
            {w.description
              ? w.description
              : "The standing programme is unscripted; the speaker is asked to bring three reading recommendations and a short prepared statement, after which the floor is opened to candidates' questions. Recordings are archived under the same reference and may be cited."}
          </Para>
          <H2 index="02">Agenda</H2>
          <ol className="space-y-3">
            {[["Opening", "10 min — speaker's prepared remarks."],
              ["Conversation", "30 min — host's questions, with reading recommendations."],
              ["Floor questions", "15 min — submitted in advance, taken in order."],
              ["Off-record close", "5 min — for those staying behind."]].map(([t, d], i) => (
              <li key={t} className="grid grid-cols-12 gap-3 py-3 border-b border-[var(--rule)]">
                <span className="col-span-1 mono tabular" style={{ color: "var(--gold)" }}>{String(i + 1).padStart(2, "0")}</span>
                <span className="col-span-3 serif" style={{ fontSize: "1.0625rem" }}>{t}</span>
                <span className="col-span-8" style={{ color: "var(--ink-soft)" }}>{d}</span>
              </li>
            ))}
          </ol>
          <H2 index="03">Submit a question</H2>
          {/* Question submission is UI-local only — no backend endpoint for pre-submitted questions */}
          <div className="p-6 border border-[var(--rule-strong)]">
            <div className="field-underline" style={{ paddingTop: 0 }}>
              <textarea rows={3} placeholder="Your question for the speaker…" />
            </div>
            <div className="mt-4 text-right">
              <button
                className="btn-ink"
                onClick={() => {
                  // UI-local toast only — no backend submission for pre-submitted questions
                  toast("Question noted. The chair will review before the session.", "ok");
                }}
              >
                <span>Send to chair</span>
              </button>
            </div>
          </div>
        </>
      }
      rail={
        <>
          <div className="border border-[var(--rule-strong)] p-6">
            <div className="mono pb-3 border-b border-[var(--rule)]" style={{ color: "var(--gold)" }}>WHEN</div>
            {/* Bug 6: use fmtDate, never new Date on dotted strings */}
            <div className="serif tabular mt-3" style={{ fontSize: "1.875rem", fontWeight: 300 }}>{fmtDate(w.scheduledAt)}</div>
            <div className="mono mt-1" style={{ color: "var(--ink-soft)" }}>{durationLabel} · {isUpcoming ? "UPCOMING" : "PAST"}</div>
            <div className="mt-6">
              <DataList rows={[
                { k: "REF",         v: <span className="tabular">{refCode}</span> },
                { k: "SPEAKER",     v: speakerName },
                { k: "AFFILIATION", v: w.speakerAffiliation ?? "—" },
                { k: "STATUS",      v: <span style={{ color: isUpcoming ? "var(--gold)" : "var(--ink-faint)" }}>{isUpcoming ? "UPCOMING" : "PAST"}</span> },
              ]} />
            </div>
          </div>
          <div className="border border-[var(--rule-strong)] p-6">
            <div className="mono pb-3 border-b border-[var(--rule)]" style={{ color: "var(--gold)" }}>ACTIONS</div>
            <div className="space-y-3 mt-4">
              {isUpcoming ? (
                session.signedIn ? (
                  registrationId != null ? (
                    // Already reserved — show RESERVED + allow cancel
                    <>
                      <button
                        disabled
                        className="btn-ink w-full justify-center"
                        style={{ opacity: 0.65 }}
                      >
                        <span>Seat reserved ✓</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={regPending}
                        className="btn-ink btn-ghost w-full justify-center"
                        style={{ opacity: regPending ? 0.65 : 1 }}
                      >
                        <span>{regPending ? "Cancelling…" : "Cancel reservation"}</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleReserve}
                      disabled={regPending}
                      className="btn-ink btn-gold w-full justify-center"
                      style={{ opacity: regPending ? 0.65 : 1 }}
                    >
                      <span>{regPending ? "Reserving…" : "Reserve a seat"}</span>
                    </button>
                  )
                ) : (
                  <a href={`#/login?next=/webinars/${w.id}`} className="btn-ink btn-gold w-full justify-center"><span>Sign in to reserve</span></a>
                )
              ) : (
                // Past webinar — "Watch recording" links to meetingLink if present
                w.meetingLink ? (
                  <a href={w.meetingLink} target="_blank" rel="noopener noreferrer" className="btn-ink btn-gold w-full justify-center"><span>Watch recording</span></a>
                ) : (
                  <button disabled className="btn-ink w-full justify-center" style={{ opacity: 0.5 }}><span>Recording unavailable</span></button>
                )
              )}
              <button
                className="btn-ink w-full justify-center"
                onClick={() => toast("Added to Sentinel.", "ok")}
              >
                <span>Add to Sentinel</span>
              </button>
            </div>
          </div>
        </>
      }
    />
  );
}
