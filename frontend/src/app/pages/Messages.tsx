import { useCallback, useEffect, useRef, useState } from "react";
import { PageIntro } from "../components/PageIntro";
import { useRouter } from "../router";
import { useSession } from "../providers/SessionProvider";
import { useToast } from "../components/Toast";
import { ApiError } from "../api/client";
import { fmtDate } from "../api/format";
import {
  messagesList,
  messagesGet,
  messagesCreate,
  messagesReply,
  ConversationDto,
  ConversationDetailDto,
  ConversationMessageDto,
} from "../api/endpoints";

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="py-4">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="my-3 h-4 rounded" style={{ background: "var(--rule-strong)", width: `${85 - i * 12}%`, opacity: 0.6 }} />
      ))}
    </div>
  );
}

// ─── Main Messages ────────────────────────────────────────────────────────────

export default function Messages() {
  const { params, query } = useRouter();
  const compose = params.id === "new";
  const convId = (!params.id || params.id === "new") ? null : parseInt(params.id, 10);
  const presetTo = query.get("to") ?? "";

  const [convList, setConvList] = useState<ConversationDto[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [totalUnread, setTotalUnread] = useState(0);

  const loadList = useCallback(async () => {
    setListLoading(true);
    setListError("");
    try {
      const data = await messagesList({ page: 0, size: 50 });
      setConvList(data.content);
      setTotalUnread(data.content.reduce((s, c) => s + (c.unreadCount ?? 0), 0));
    } catch (e) {
      setListError(e instanceof ApiError ? e.message : "Failed to load inbox.");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => { loadList(); }, [loadList]);

  const activeConv = convId != null ? convList.find(c => c.id === convId) ?? null : null;

  return (
    <>
      <PageIntro
        index="✍︎"
        kicker="CORRESPONDENCE · INBOX"
        title={<>Letters in &amp; out.</>}
        lede="A typewritten record of every message between you and the institutions, researchers and editors you have written to."
        meta={`${totalUnread} UNREAD`}
      />
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-32 grid grid-cols-12 gap-px" style={{ background: "var(--rule)" }}>
        {/* Inbox list */}
        <aside className="col-span-12 md:col-span-4" style={{ background: "var(--paper)" }}>
          <div className="p-5 flex items-center justify-between mono border-b border-[var(--rule-strong)]" style={{ color: "var(--ink-faint)" }}>
            <span>INBOX</span>
            <a href="#/messages/new" style={{ color: "var(--gold)" }}>+ NEW LETTER</a>
          </div>

          {listLoading && <Skeleton lines={4} />}
          {!listLoading && listError && (
            <div className="p-5 mono" style={{ color: "var(--oxblood)", fontSize: 11 }}>{listError}</div>
          )}
          {!listLoading && !listError && convList.length === 0 && (
            <div className="p-8 text-center mono" style={{ color: "var(--ink-faint)" }}>
              NO MESSAGES YET<br />
              <a href="#/messages/new" style={{ color: "var(--gold)" }} className="mt-3 inline-block">Write your first letter →</a>
            </div>
          )}

          <ul>
            {convList.map((c) => {
              const sel = c.id === convId && !compose;
              const roles = c.otherParty?.roles ?? [];
              const roleLabel = roles.includes("ADMIN") ? "ADMIN" :
                roles.includes("UNIVERSITY_REP") ? "REP" :
                roles.includes("FACULTY") ? "FACULTY" : "LEARNER";
              return (
                <li key={c.id}>
                  <a
                    href={`#/messages/${c.id}`}
                    className="block p-5 border-b border-[var(--rule)]"
                    style={{ background: sel ? "var(--paper-raised)" : "transparent" }}
                  >
                    <div className="flex items-baseline justify-between mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>
                      <span>
                        <span style={{ color: roleLabel === "FACULTY" ? "var(--gold)" : "var(--ink-soft)" }}>
                          {roleLabel}
                        </span>
                        {" · "}{c.otherParty?.fullName ?? "Unknown"}
                      </span>
                      <span>{fmtDate(c.lastMessageAt)}</span>
                    </div>
                    <div className="serif mt-2" style={{ fontSize: "1.0625rem", color: "var(--ink)" }}>{c.subject ?? "(no subject)"}</div>
                    {c.lastPreview && (
                      <div className="mono mt-1 truncate" style={{ color: "var(--ink-soft)", fontSize: 10 }}>{c.lastPreview}</div>
                    )}
                    {(c.unreadCount ?? 0) > 0 && (
                      <div className="mono mt-2 inline-flex items-center gap-2" style={{ color: "var(--gold)", fontSize: 10 }}>
                        <span className="w-2 h-2" style={{ background: "var(--gold)", display: "inline-block" }} />
                        {c.unreadCount} UNREAD
                      </div>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Conversation OR compose */}
        <section className="col-span-12 md:col-span-8 min-h-[60vh]" style={{ background: "var(--paper)" }}>
          {compose
            ? <Compose preset={presetTo} onSent={loadList} />
            : convId != null
              ? <ConversationView convId={convId} convMeta={activeConv} onRefresh={loadList} />
              : (
                <div className="flex items-center justify-center h-full py-20 mono" style={{ color: "var(--ink-faint)" }}>
                  SELECT A LETTER FROM THE INBOX OR{" "}
                  <a href="#/messages/new" style={{ color: "var(--gold)", marginLeft: 4 }}>COMPOSE A NEW ONE →</a>
                </div>
              )
          }
        </section>
      </section>
    </>
  );
}

// ─── Conversation viewer ──────────────────────────────────────────────────────

function ConversationView({ convId, convMeta, onRefresh }: {
  convId: number;
  convMeta: ConversationDto | null;
  onRefresh: () => void;
}) {
  const { session } = useSession();
  const toast = useToast();
  const [detail, setDetail] = useState<ConversationDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [body, setBody] = useState("");
  const [replying, setReplying] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const d = await messagesGet(convId);
      setDetail(d);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load conversation.");
    } finally {
      setLoading(false);
    }
  }, [convId]);

  useEffect(() => { loadDetail(); }, [loadDetail]);

  useEffect(() => {
    if (detail) scrollRef.current?.scrollTo({ top: 9e6 });
  }, [detail]);

  const handleReply = async () => {
    if (!body.trim() || replying) return;
    setReplying(true);
    try {
      await messagesReply(convId, { body: body.trim() });
      setBody("");
      await loadDetail();
      onRefresh();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Failed to send reply.", "error" as any);
    } finally {
      setReplying(false);
    }
  };

  if (loading) return <div className="p-8"><Skeleton lines={5} /></div>;
  if (error) return (
    <div className="p-8 flex flex-col gap-4">
      <div className="mono" style={{ color: "var(--oxblood)", fontSize: 11 }}>{error}</div>
      <button onClick={loadDetail} className="btn-ink btn-ghost self-start"><span>Retry</span></button>
    </div>
  );
  if (!detail) return null;

  const messages: ConversationMessageDto[] = detail.messages ?? [];
  const otherParty = detail.otherParty;

  return (
    <div className="flex flex-col h-full" style={{ minHeight: "60vh" }}>
      <header className="p-6 border-b border-[var(--rule-strong)] flex items-baseline justify-between">
        <div>
          <div className="mono" style={{ color: "var(--gold)" }}>
            {(otherParty?.roles ?? []).includes("FACULTY") ? "FACULTY" :
              (otherParty?.roles ?? []).includes("UNIVERSITY_REP") ? "REP" :
              (otherParty?.roles ?? []).includes("ADMIN") ? "ADMIN" : "LEARNER"}
          </div>
          <div className="serif mt-2" style={{ fontSize: "1.5rem", fontWeight: 300 }}>{detail.subject ?? "(no subject)"}</div>
          <div className="mono mt-1" style={{ color: "var(--ink-soft)" }}>WITH · {otherParty?.fullName ?? "Unknown"}</div>
        </div>
        <div className="mono text-right" style={{ color: "var(--ink-faint)", fontSize: 10 }}>
          {messages.length > 0 && <>OPENED · {fmtDate(messages[0].sentAt)}</>}
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8">
        {messages.length === 0 && (
          <div className="mono text-center py-8" style={{ color: "var(--ink-faint)" }}>NO MESSAGES YET</div>
        )}
        {messages.map((m) => {
          const fromMe = m.sender?.id === session.user?.id;
          return (
            <div key={m.id} className={fromMe ? "ml-auto max-w-[70%]" : "max-w-[80%]"}>
              <div className="mono mb-2" style={{
                color: fromMe ? "var(--gold)" : "var(--ink-faint)",
                textAlign: fromMe ? "right" : "left",
                fontSize: 10,
              }}>
                {fromMe
                  ? `YOU — ${fmtDate(m.sentAt)}`
                  : `${(m.sender?.fullName ?? "UNKNOWN").toUpperCase()} — ${fmtDate(m.sentAt)}`}
              </div>
              <div className="p-4" style={{
                background: fromMe ? "var(--ink)" : "var(--paper-raised)",
                color: fromMe ? "var(--paper)" : "var(--ink)",
                border: fromMe ? "1px solid var(--ink)" : "1px solid var(--rule)",
              }}>
                <p className={fromMe ? "mono" : "serif"} style={{ fontSize: fromMe ? 13 : "1.0625rem", lineHeight: fromMe ? 1.6 : 1.65, fontWeight: 300 }}>
                  {m.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="p-6 border-t border-[var(--rule-strong)]">
        <div className="field-underline" style={{ paddingTop: 0 }}>
          <textarea
            rows={3}
            placeholder="Write a reply…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleReply(); }}
            disabled={replying}
            style={{ resize: "vertical", fontFamily: "var(--font-serif)", fontSize: "1.0625rem" }}
          />
        </div>
        <div className="mt-4 flex items-center justify-end">
          <button
            onClick={handleReply}
            disabled={replying || !body.trim()}
            className="btn-ink"
            style={{ opacity: replying ? 0.65 : 1 }}
          >
            <span>{replying ? "Sending…" : "Send reply"}</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

// ─── Compose ──────────────────────────────────────────────────────────────────

function Compose({ preset, onSent }: { preset: string; onSent: () => void }) {
  const toast = useToast();
  const [v, setV] = useState({ to: preset, subject: "", body: "" });
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  // Save draft to localStorage
  const saveDraft = () => {
    try {
      localStorage.setItem("insightnest.draft.compose", JSON.stringify(v));
      toast("Draft saved to this device", "info");
    } catch {
      toast("Could not save draft", "error" as any);
    }
  };

  const handleSend = async () => {
    if (sending) return;
    setFieldErr({});
    if (!v.to.trim()) { setFieldErr({ to: "Recipient is required." }); return; }
    if (!v.subject.trim()) { setFieldErr({ subject: "Subject is required." }); return; }
    if (!v.body.trim()) { setFieldErr({ body: "Message body is required." }); return; }

    setSending(true);
    try {
      await messagesCreate({
        recipientEmail: v.to.trim(),
        subject: v.subject.trim(),
        body: v.body.trim(),
      });
      toast("Letter sent", "ok");
      localStorage.removeItem("insightnest.draft.compose");
      onSent();
      window.location.hash = "#/messages";
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 404) {
          setFieldErr({ to: "No folio under that address." });
        } else if (e.fieldErrors) {
          setFieldErr(e.fieldErrors);
        } else {
          toast(e.message, "error" as any);
        }
      } else {
        toast("Failed to send letter.", "error" as any);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8 md:p-10">
      <div className="mono" style={{ color: "var(--gold)" }}>NEW LETTER · DRAFT</div>
      <h2 className="serif mt-3" style={{ fontSize: "clamp(1.875rem, 3vw, 2.5rem)", fontWeight: 300 }}>Compose</h2>
      <p className="mt-2" style={{ color: "var(--ink-soft)" }}>
        Letters are sent under your folio's name. Replies are typically returned within five working days.
      </p>

      <div className="mt-8 space-y-6">
        <div className={"field-underline " + (v.to ? "has-value" : "")}>
          <label>To (email address)</label>
          <input
            value={v.to}
            onChange={(e) => setV({ ...v, to: e.target.value })}
            placeholder="recipient@example.com"
            type="email"
          />
          {fieldErr.to && <div className="mono mt-1" style={{ color: "var(--oxblood)", fontSize: 10 }}>{fieldErr.to}</div>}
        </div>
        <div className={"field-underline " + (v.subject ? "has-value" : "")}>
          <label>Subject</label>
          <input value={v.subject} onChange={(e) => setV({ ...v, subject: e.target.value })} />
          {fieldErr.subject && <div className="mono mt-1" style={{ color: "var(--oxblood)", fontSize: 10 }}>{fieldErr.subject}</div>}
        </div>
        <div className={"field-underline " + (v.body ? "has-value" : "")}>
          <label>Letter</label>
          <textarea
            rows={10}
            value={v.body}
            onChange={(e) => setV({ ...v, body: e.target.value })}
            style={{ resize: "vertical", fontFamily: "var(--font-serif)", fontSize: "1.0625rem" }}
          />
          {fieldErr.body && <div className="mono mt-1" style={{ color: "var(--oxblood)", fontSize: 10 }}>{fieldErr.body}</div>}
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-[var(--rule)] flex items-center justify-between">
        <a href="#/messages" className="mono" style={{ color: "var(--ink-soft)" }}>← BACK TO INBOX</a>
        <div className="flex gap-3">
          {/* Save draft stays local — per §2 audit "stays UI-local" */}
          <button onClick={saveDraft} className="btn-ink btn-ghost"><span>Save draft</span></button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="btn-ink btn-gold"
            style={{ opacity: sending ? 0.65 : 1 }}
          >
            <span>{sending ? "Sending…" : "Send letter"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
