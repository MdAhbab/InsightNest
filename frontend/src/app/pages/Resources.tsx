import { useCallback, useEffect, useState } from "react";
import { PageIntro } from "../components/PageIntro";
import { ArchiveScene } from "../scenes/ArchiveScene";
import { ApiError } from "../api/client";
import { useSession } from "../providers/SessionProvider";
import {
  resourcesList,
  resourceDownloadUrl,
  ResourceDto,
} from "../api/endpoints";

const TYPES = ["PDF", "DATASET", "VIDEO", "PAPER", "BOOK"] as const;

/** Format raw bytes to human-readable string (e.g. 1.4 MB, 320 KB) */
function fmtSize(bytes: number | null | undefined): string {
  if (bytes == null) return "—";
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024) return `${Math.round(bytes / 1_024)} KB`;
  return `${bytes} B`;
}

function Skeleton() {
  return (
    <div className="col-span-12 md:col-span-9 py-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="my-5 h-4 rounded" style={{ background: "var(--rule-strong)", width: `${80 - i * 6}%`, opacity: 0.5 }} />
      ))}
    </div>
  );
}

export default function Resources() {
  const { session } = useSession();
  const [activeType, setActiveType] = useState<string | null>(null);
  const [items, setItems] = useState<ResourceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await resourcesList({ page: 0, size: 100 });
      setItems(data.content);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load resources.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = activeType ? items.filter(r => r.resourceType === activeType) : items;

  const handleDownload = (r: ResourceDto) => {
    if (!session.signedIn && !r.publicAccess) {
      window.location.hash = `#/login?next=/resources/${r.id}`;
      return;
    }
    // Use auth-gated download URL (browser will follow with token via link)
    const url = resourceDownloadUrl(r.id);
    const a = document.createElement("a");
    a.href = url;
    a.download = r.fileName ?? r.title;
    a.click();
  };

  return (
    <>
      <section className="relative" style={{ height: "80vh" }}>
        <div className="absolute inset-0" aria-hidden>
          <ArchiveScene />
        </div>
        <PageIntro
          index="05"
          kicker="THE ARCHIVE"
          title={<>A small library, kept open.</>}
          lede="Papers, datasets, films and editorials — for download, with citation."
          meta={loading ? "LOADING…" : `${items.length} ITEMS`}
        />
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-32 grid grid-cols-12 gap-6 md:gap-10 -mt-10 md:-mt-16 relative">
        <aside className="col-span-12 md:col-span-3 md:sticky md:top-28 self-start space-y-6">
          <div className="mono" style={{ color: "var(--ink-faint)" }}>FILETYPE</div>
          <ul className="space-y-2">
            {TYPES.map((t) => (
              <li key={t}>
                <button
                  className="mono flex justify-between w-full pb-1 border-b border-[var(--rule)] hover:text-[var(--gold)]"
                  style={{ color: activeType === t ? "var(--gold)" : undefined }}
                  onClick={() => setActiveType(activeType === t ? null : t)}
                >
                  <span>{t}</span>
                  <span style={{ color: "var(--ink-faint)" }} className="tabular">
                    {items.filter(r => r.resourceType === t).length}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {loading && <Skeleton />}

        {!loading && error && (
          <div className="col-span-12 md:col-span-9 py-10 flex flex-col items-center gap-4">
            <div className="mono" style={{ color: "var(--oxblood)", fontSize: 11 }}>{error}</div>
            <button onClick={load} className="btn-ink btn-ghost"><span>Retry</span></button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="col-span-12 md:col-span-9 py-12 text-center mono" style={{ color: "var(--ink-faint)" }}>
            No resources found.
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <ul className="col-span-12 md:col-span-9">
            {filtered.map((r, i) => (
              <li key={r.id}>
                <div className="grid grid-cols-12 gap-6 py-6 border-b border-[var(--rule)] items-baseline group" style={{ display: "grid" }}>
                  <div className="col-span-1 mono tabular" style={{ color: "var(--gold)", fontSize: 11 }}>{String(i + 1).padStart(3, "0")}</div>
                  <div className="col-span-12 md:col-span-7 -mt-2 md:mt-0">
                    <a href={`#/resources/${r.id}`} className="serif hover:text-[var(--gold)]" style={{ fontSize: "clamp(1.125rem, 1.6vw, 1.5rem)" }}>{r.title}</a>
                    <div className="mono mt-1" style={{ color: "var(--ink-soft)" }}>
                      {r.author ?? "—"} · {r.year ?? "—"}{r.pages ? ` · ${r.pages} pp.` : ""}
                    </div>
                    {r.field && (
                      <div className="mono mt-1" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{r.field}</div>
                    )}
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <span className="mono inline-block px-2 py-1 border border-[var(--rule-strong)]" style={{ fontSize: 10 }}>
                      {r.resourceType ?? "—"}
                    </span>
                  </div>
                  <div className="col-span-9 md:col-span-2 text-right">
                    <button
                      onClick={() => handleDownload(r)}
                      className="mono inline-flex items-baseline gap-2 hover:text-[var(--gold)] group-hover:text-[var(--gold)]"
                      style={{ fontSize: 11 }}
                    >
                      <span>{fmtSize(r.fileSize)}</span>
                      <span aria-hidden style={{ color: "var(--gold)" }}>↓</span>
                    </button>
                    <div className="mt-1 h-px w-full" style={{ background: "var(--rule)" }} />
                    <div className="mt-1 h-px w-full origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-500" style={{ background: "var(--gold)" }} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
