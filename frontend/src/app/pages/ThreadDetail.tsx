import { useCallback, useEffect, useState } from "react";
import { useRouter } from "../router";
import { DetailShell, DataList, H2 } from "../components/DetailShell";
import { ApiError } from "../api/client";
import { fmtDate } from "../api/format";
import { useSession } from "../providers/SessionProvider";
import { useToast } from "../components/Toast";
import {
  forumThreadsGet,
  forumCommentsList,
  forumCommentsCreate,
  ForumThreadDto,
  ForumCommentDto,
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

export default function ThreadDetail() {
  const { params } = useRouter();
  const { session } = useSession();
  const toast = useToast();
  const id = Number(params.id);

  const [thread, setThread] = useState<ForumThreadDto | null>(null);
  const [comments, setComments] = useState<ForumCommentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ status?: number; message: string } | null>(null);

  const [reply, setReply] = useState("");
  const [replyPending, setReplyPending] = useState(false);
  const [replyError, setReplyError] = useState("");

  const loadDetail = useCallback(async () => {
    if (!id || isNaN(id)) {
      setError({ status: 404, message: "Invalid thread ID." });
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [t, c] = await Promise.all([
        forumThreadsGet(id),
        forumCommentsList(id, { page: 0, size: 100 }),
      ]);
      setThread(t);
      setComments(c.content);
    } catch (e) {
      if (e instanceof ApiError) {
        setError({ status: e.status, message: e.message });
      } else {
        setError({ message: "Failed to load thread." });
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadDetail(); }, [loadDetail]);

  const handleReply = async () => {
    if (!reply.trim()) return;
    if (!session.signedIn) {
      window.location.hash = `#/login?next=/forums/${id}`;
      return;
    }
    setReplyPending(true);
    setReplyError("");
    try {
      const newComment = await forumCommentsCreate(id, { body: reply.trim() });
      setComments(prev => [...prev, newComment]);
      setReply("");
      toast("Reply posted.", "ok");
    } catch (e) {
      setReplyError(e instanceof ApiError ? e.message : "Failed to post reply.");
    } finally {
      setReplyPending(false);
    }
  };

  if (loading) return <Skeleton />;

  // Bug 8: Proper not-found state
  if (error) {
    return (
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pt-36 pb-32">
        <a href="#/forums" className="mono inline-flex items-center gap-2" style={{ color: "var(--ink-soft)" }}>
          <span style={{ color: "var(--gold)" }}>←</span> The correspondence
        </a>
        <div className="mt-20 text-center">
          {error.status === 404 ? (
            <>
              <div className="mono" style={{ color: "var(--gold)", fontSize: 11 }}>404 — NOT FOUND</div>
              <h1 className="serif mt-6" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 300 }}>Thread not found.</h1>
              <a href="#/forums" className="btn-ink mt-8 inline-flex"><span>Back to correspondence</span></a>
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

  if (!thread) return null;

  const totalReplies = comments.length;
  const refCode = `TH-${String(thread.id).padStart(4, "0")}`;

  return (
    <DetailShell
      back={{ href: "#/forums", label: "The correspondence" }}
      kicker={`THREAD · ${refCode}`}
      index={thread.category ?? "GENERAL"}
      title={thread.title}
      meta={`${totalReplies} REPLIES`}
      lede={<>Opened by <em>{thread.author?.fullName ?? "—"}</em> on {fmtDate(thread.createdAt)}. Read clockwise.</>}
      body={
        <>
          <H2 index="01">Opening letter</H2>
          <article className="p-6 border border-[var(--rule-strong)]" style={{ background: "var(--paper-raised)" }}>
            <div className="flex items-baseline justify-between mono" style={{ color: "var(--ink-faint)" }}>
              <span>{thread.author?.fullName ?? "—"} · AUTHOR</span>
              <span>{fmtDate(thread.createdAt)}</span>
            </div>
            <p className="serif mt-4" style={{ fontSize: "1.125rem", fontWeight: 300, lineHeight: 1.7 }}>
              {thread.body ?? "—"}
            </p>
          </article>

          <H2 index="02">Replies</H2>
          {comments.length === 0 ? (
            <div className="py-6 mono" style={{ color: "var(--ink-faint)" }}>No replies yet.</div>
          ) : (
            <ul className="space-y-6">
              {comments.map((r, i) => {
                // Faculty replies are highlighted; author.roles comes from the API UserSummary.
                const isFac = !!r.author?.roles?.includes("FACULTY");
                return (
                  <li key={r.id ?? i} className="p-6" style={{
                    background: isFac ? "color-mix(in srgb, var(--gold) 6%, var(--paper-raised))" : "var(--paper-raised)",
                    border: "1px solid var(--rule)",
                  }}>
                    <div className="flex items-baseline justify-between mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>
                      <span>
                        <span style={{ color: isFac ? "var(--gold)" : "var(--ink)" }}>{r.author?.fullName ?? "—"}</span>
                        {isFac && " · FACULTY"}
                      </span>
                      <span>{fmtDate(r.createdAt)}</span>
                    </div>
                    <p className="serif mt-3" style={{ fontSize: "1.0625rem", fontWeight: 300, lineHeight: 1.65 }}>{r.body}</p>
                  </li>
                );
              })}
            </ul>
          )}

          <H2 index="03">Write back</H2>
          {session.signedIn ? (
            <div className="p-6 border border-[var(--rule-strong)]">
              <div className="field-underline" style={{ paddingTop: 0 }}>
                <textarea
                  rows={6}
                  placeholder="Your reply…"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  style={{ resize: "vertical", fontFamily: "var(--font-serif)", fontSize: "1.0625rem" }}
                />
              </div>
              {replyError && (
                <div className="mt-2 mono" style={{ color: "var(--oxblood)", fontSize: 10 }}>{replyError}</div>
              )}
              <div className="mt-4 flex items-center justify-between">
                <div className="mono" style={{ color: "var(--ink-faint)" }}>SIGN AS · {session.name.toUpperCase()} · {session.role.toUpperCase()}</div>
                <button
                  onClick={handleReply}
                  disabled={replyPending || !reply.trim()}
                  className="btn-ink"
                  style={{ opacity: replyPending ? 0.65 : 1 }}
                >
                  <span>{replyPending ? "Posting…" : "Post reply"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 border border-[var(--rule-strong)] text-center">
              <p className="serif" style={{ color: "var(--ink-soft)" }}>Sign in to write a reply.</p>
              <a href={`#/login?next=/forums/${id}`} className="btn-ink mt-4 inline-flex"><span>Sign in</span></a>
            </div>
          )}
        </>
      }
      rail={
        <>
          <div className="border border-[var(--rule-strong)] p-6">
            <div className="mono pb-3 border-b border-[var(--rule)]" style={{ color: "var(--gold)" }}>THREAD</div>
            <DataList rows={[
              { k: "REF",      v: <span className="tabular">{refCode}</span> },
              { k: "OPENED",   v: fmtDate(thread.createdAt) },
              { k: "REPLIES",  v: <span className="tabular">{totalReplies}</span> },
              { k: "CATEGORY", v: thread.category ?? "—" },
              { k: "AUTHOR",   v: thread.author?.fullName ?? "—" },
            ]} />
          </div>
          <div className="border border-[var(--rule-strong)] p-6">
            <div className="mono pb-3 border-b border-[var(--rule)]" style={{ color: "var(--gold)" }}>ACTIONS</div>
            <div className="space-y-3 mt-4">
              {/* Follow/Save/Report are UI-local — no backend endpoint yet */}
              <button
                className="btn-ink btn-gold w-full justify-center"
                onClick={() => toast("Following this thread.", "ok")}
              >
                <span>Follow thread</span>
              </button>
              <button
                className="btn-ink w-full justify-center"
                onClick={() => toast("Saved to folio.", "ok")}
              >
                <span>Save</span>
              </button>
              <button
                className="btn-ink btn-ghost w-full justify-center"
                onClick={() => toast("Report filed. Our team will review.", "info")}
              >
                <span>Report</span>
              </button>
            </div>
          </div>
        </>
      }
    />
  );
}
