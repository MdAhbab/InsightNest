import { useCallback, useEffect, useState } from "react";
import { PageIntro } from "../components/PageIntro";
import { ApiError } from "../api/client";
import { fmtDate } from "../api/format";
import { useSession } from "../providers/SessionProvider";
import { useToast } from "../components/Toast";
import {
  forumThreadsList,
  forumThreadsCreate,
  ForumThreadDto,
} from "../api/endpoints";

function Skeleton() {
  return (
    <div className="col-span-12 md:col-span-9 py-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="my-6 h-4 rounded" style={{ background: "var(--rule-strong)", width: `${80 - i * 8}%`, opacity: 0.5 }} />
      ))}
    </div>
  );
}

export default function Forums() {
  const { session } = useSession();
  const toast = useToast();

  const [items, setItems] = useState<ForumThreadDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Compose drawer state
  const [composing, setComposing] = useState(false);
  const [composeTitle, setComposeTitle] = useState("");
  const [composeCategory, setComposeCategory] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composePending, setComposePending] = useState(false);
  const [composeError, setComposeError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await forumThreadsList({ page: 0, size: 50 });
      setItems(data.content);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load threads.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Bug 2: scrollIntoView instead of bare # anchors
  const scrollToThread = (id: number) => {
    const el = document.getElementById(`thread-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleCompose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTitle.trim() || !composeBody.trim()) {
      setComposeError("Title and body are required.");
      return;
    }
    setComposePending(true);
    setComposeError("");
    try {
      await forumThreadsCreate({
        title: composeTitle.trim(),
        body: composeBody.trim(),
        category: composeCategory.trim() || undefined,
      });
      toast("Thread posted.", "ok");
      setComposing(false);
      setComposeTitle("");
      setComposeCategory("");
      setComposeBody("");
      load();
    } catch (e) {
      setComposeError(e instanceof ApiError ? e.message : "Failed to post thread.");
    } finally {
      setComposePending(false);
    }
  };

  return (
    <>
      <PageIntro
        index="06"
        kicker="THE CORRESPONDENCE"
        title={<>Letters between candidates.</>}
        lede="A long-form forum kept in the manner of a printed letters page — attribution required, brevity preferred."
        meta={loading ? "LOADING…" : `${items.length} OPEN THREADS`}
      />
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-32 grid grid-cols-12 gap-6 md:gap-10">
        <aside className="col-span-12 md:col-span-3 md:sticky md:top-28 self-start">
          <div className="mono" style={{ color: "var(--ink-faint)" }}>INDEX</div>
          <ul className="mt-3 space-y-2">
            {/* Bug 2: use <button> + scrollIntoView, never bare # anchors */}
            {items.map((t, i) => (
              <li key={t.id} className="text-sm">
                <button
                  className="flex gap-3 hover:text-[var(--gold)] w-full text-left"
                  onClick={() => scrollToThread(t.id)}
                >
                  <span className="mono tabular" style={{ color: "var(--gold)" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="truncate">{t.title}</span>
                </button>
              </li>
            ))}
          </ul>
          {session.signedIn ? (
            <button
              onClick={() => setComposing(c => !c)}
              className="btn-ink mt-8 w-full justify-center"
            >
              <span>{composing ? "Close compose" : "Compose letter"}</span>
            </button>
          ) : (
            <a href="#/login?next=/forums" className="btn-ink mt-8 w-full justify-center"><span>Compose letter</span></a>
          )}
        </aside>

        <div className="col-span-12 md:col-span-9">
          {/* Compose drawer — signed-in only */}
          {composing && session.signedIn && (
            <div className="mb-8 p-6 border border-[var(--rule-strong)]" style={{ background: "var(--paper-raised)" }}>
              <div className="mono mb-4" style={{ color: "var(--gold)" }}>NEW THREAD</div>
              <form className="space-y-4" onSubmit={handleCompose}>
                <ComposeField label="Title" value={composeTitle} onChange={setComposeTitle} />
                <ComposeField label="Category (optional)" value={composeCategory} onChange={setComposeCategory} />
                <ComposeField label="Body" value={composeBody} onChange={setComposeBody} textarea />
                {composeError && (
                  <div className="mono" style={{ color: "var(--oxblood)", fontSize: 10 }}>{composeError}</div>
                )}
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setComposing(false)} className="btn-ink btn-ghost"><span>Cancel</span></button>
                  <button
                    type="submit"
                    disabled={composePending}
                    className="btn-ink btn-gold"
                    style={{ opacity: composePending ? 0.65 : 1 }}
                  >
                    <span>{composePending ? "Posting…" : "Post thread"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading && <Skeleton />}

          {!loading && error && (
            <div className="py-10 flex flex-col items-center gap-4">
              <div className="mono" style={{ color: "var(--oxblood)", fontSize: 11 }}>{error}</div>
              <button onClick={load} className="btn-ink btn-ghost"><span>Retry</span></button>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="py-12 text-center mono" style={{ color: "var(--ink-faint)" }}>
              No threads yet. Be the first to write in.
            </div>
          )}

          <ul className="-mt-6">
            {items.map((t, i) => (
              <li id={`thread-${t.id}`} key={t.id}>
                <a href={`#/forums/${t.id}`} className="py-8 border-b border-[var(--rule)] grid grid-cols-12 gap-6 group" style={{ display: "grid" }}>
                  <div className="col-span-1 mono tabular" style={{ color: "var(--gold)" }}>{String(i + 1).padStart(2, "0")}</div>
                  <div className="col-span-12 md:col-span-9 -mt-1">
                    {t.category && (
                      <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{t.category.toUpperCase()}</div>
                    )}
                    <h3 className="serif mt-2 group-hover:text-[var(--gold)] transition-colors" style={{ fontSize: "clamp(1.375rem, 2.2vw, 1.875rem)", fontWeight: 300, lineHeight: 1.15 }}>
                      {t.title}
                    </h3>
                    <p className="mt-3 max-w-[60ch]" style={{ color: "var(--ink-soft)" }}>
                      Opened by <em>{t.author?.fullName ?? "—"}</em>. Last reply on {fmtDate(t.lastReplyAt ?? t.createdAt)}. {t.replyCount ?? 0} candidates have written in.
                    </p>
                  </div>
                  <div className="col-span-12 md:col-span-2 md:text-right mono space-y-1" style={{ color: "var(--ink-soft)", fontSize: 11 }}>
                    <div className="tabular" style={{ color: "var(--ink)" }}>{t.replyCount ?? 0} REPLIES</div>
                    <div>{fmtDate(t.lastReplyAt ?? t.createdAt)}</div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

function ComposeField({
  label,
  value,
  onChange,
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  textarea?: boolean;
}) {
  return (
    <div className={"field-underline " + (value ? "has-value" : "")}>
      <label>{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={6} style={{ resize: "vertical", fontFamily: "var(--font-serif)", fontSize: "1.0625rem" }} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}
