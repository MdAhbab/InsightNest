import { useCallback, useEffect, useState } from "react";
import { useRouter } from "../router";
import { DetailShell, DataList, H2, Para } from "../components/DetailShell";
import { ApiError } from "../api/client";
import { fmtDate } from "../api/format";
import { useSession } from "../providers/SessionProvider";
import { useToast } from "../components/Toast";
import {
  resourcesGet,
  resourceDownloadUrl,
  savedItemsList,
  savedItemsCreate,
  savedItemsDelete,
  ResourceDto,
} from "../api/endpoints";

/** Format raw bytes to human-readable string */
function fmtSize(bytes: number | null | undefined): string {
  if (bytes == null) return "—";
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024) return `${Math.round(bytes / 1_024)} KB`;
  return `${bytes} B`;
}

function Skeleton() {
  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pt-36 pb-32">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="my-4 h-4 rounded" style={{ background: "var(--rule-strong)", width: `${80 - i * 10}%`, opacity: 0.5 }} />
      ))}
    </main>
  );
}

export default function ResourceDetail() {
  const { params } = useRouter();
  const { session } = useSession();
  const toast = useToast();
  const id = Number(params.id);

  const [r, setR] = useState<ResourceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ status?: number; message: string } | null>(null);

  const [savedId, setSavedId] = useState<number | null>(null);
  const [savePending, setSavePending] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!id || isNaN(id)) {
      setError({ status: 404, message: "Invalid resource ID." });
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await resourcesGet(id);
      setR(data);
      if (session.signedIn) {
        const saved = await savedItemsList();
        const mine = saved.find((s) => s.itemType === "RESOURCE" && s.itemId === id);
        setSavedId(mine ? mine.id : null);
      }
    } catch (e) {
      if (e instanceof ApiError) {
        setError({ status: e.status, message: e.message });
      } else {
        setError({ message: "Failed to load resource." });
      }
    } finally {
      setLoading(false);
    }
  }, [id, session.signedIn]);

  useEffect(() => { loadDetail(); }, [loadDetail]);

  const handleDownload = () => {
    if (!r) return;
    if (!session.signedIn && !r.publicAccess) {
      window.location.hash = `#/login?next=/resources/${r.id}`;
      return;
    }
    const url = resourceDownloadUrl(r.id);
    const a = document.createElement("a");
    a.href = url;
    a.download = r.fileName ?? r.title;
    a.click();
  };

  const handleSave = async () => {
    if (!r) return;
    if (!session.signedIn) {
      window.location.hash = `#/login?next=/resources/${r.id}`;
      return;
    }
    setSavePending(true);
    try {
      if (savedId != null) {
        await savedItemsDelete(savedId);
        setSavedId(null);
        toast("Removed from folio", "info");
      } else {
        const created = await savedItemsCreate({ itemType: "RESOURCE", itemId: r.id });
        setSavedId(created.id);
        toast("Saved to folio", "ok");
      }
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Save failed.", "err");
    } finally {
      setSavePending(false);
    }
  };

  const handleCopyCitation = () => {
    if (!r) return;
    const citation = `${r.author ?? "Unknown"} (${r.year ?? "n.d."}). ${r.title}. InsightNest Library.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(citation).then(() => toast("Citation copied.", "ok")).catch(() => toast("Copy failed.", "err"));
    } else {
      toast("Citation: " + citation, "info");
    }
  };

  if (loading) return <Skeleton />;

  // Bug 8: Proper not-found state
  if (error) {
    return (
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pt-36 pb-32">
        <a href="#/resources" className="mono inline-flex items-center gap-2" style={{ color: "var(--ink-soft)" }}>
          <span style={{ color: "var(--gold)" }}>←</span> The archive
        </a>
        <div className="mt-20 text-center">
          {error.status === 404 ? (
            <>
              <div className="mono" style={{ color: "var(--gold)", fontSize: 11 }}>404 — NOT FOUND</div>
              <h1 className="serif mt-6" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 300 }}>Resource not found.</h1>
              <a href="#/resources" className="btn-ink mt-8 inline-flex"><span>Back to archive</span></a>
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

  const refCode = `RES-${String(r.id).padStart(4, "0")}`;
  const sizeLabel = fmtSize(r.fileSize);

  return (
    <DetailShell
      back={{ href: "#/resources", label: "The archive" }}
      kicker={`RESOURCE · ${refCode}`}
      index={r.resourceType ?? "—"}
      title={r.title}
      meta={`${sizeLabel} · ${r.year ?? "—"}`}
      lede={<>By {r.author ?? "—"}, {r.year ?? "—"}. A primary resource catalogued under {(r.field ?? "general").toLowerCase()}. {r.pages ? `${r.pages} pages, available for download below.` : "Available for download below."}</>}
      body={
        <>
          <H2 index="01">Précis</H2>
          <Para>
            {r.description
              ? r.description
              : `This ${(r.resourceType ?? "resource").toLowerCase()} is part of the InsightNest standing library and is held under terms that permit personal academic use. Citations should follow the conventions of the discipline; a suggested form appears in the right-hand rail.`}
          </Para>

          <H2 index="02">Contents</H2>
          <ul className="space-y-2">
            {(r.pages ? Array.from({ length: 6 }) : ["Description", "Provenance", "Suggested use"]).map((_, i, arr) => (
              <li key={i} className="grid grid-cols-12 py-3 border-b border-[var(--rule)]">
                <span className="col-span-1 mono tabular" style={{ color: "var(--gold)" }}>{String(i + 1).padStart(2, "0")}</span>
                <span className="col-span-9 serif" style={{ fontSize: "1.0625rem" }}>{typeof arr[i] === "string" ? arr[i] : `Chapter ${i + 1} — opening notes`}</span>
                {r.pages && <span className="col-span-2 text-right mono" style={{ color: "var(--ink-faint)" }}>p. {(i + 1) * 4}</span>}
              </li>
            ))}
          </ul>

          <H2 index="03">Added</H2>
          <Para>
            Catalogued on {fmtDate(r.createdAt)}{r.uploader ? ` by ${r.uploader.fullName}` : ""}.
          </Para>
        </>
      }
      rail={
        <>
          <div className="border border-[var(--rule-strong)] p-6">
            <div className="mono pb-3 border-b border-[var(--rule)]" style={{ color: "var(--gold)" }}>RECORD</div>
            <DataList rows={[
              { k: "REF",    v: <span className="tabular">{refCode}</span> },
              { k: "TYPE",   v: r.resourceType ?? "—" },
              { k: "AUTHOR", v: r.author ?? "—" },
              { k: "YEAR",   v: r.year != null ? String(r.year) : "—" },
              { k: "FIELD",  v: r.field ?? "—" },
              { k: "SIZE",   v: sizeLabel },
              ...(r.pages != null ? [{ k: "PAGES", v: <span className="tabular">{r.pages}</span> }] : []),
              ...(r.publicAccess != null ? [{ k: "ACCESS", v: r.publicAccess ? "Public" : "Members" }] : []),
            ]} />
          </div>
          <div className="border border-[var(--rule-strong)] p-6">
            <div className="mono pb-3 border-b border-[var(--rule)]" style={{ color: "var(--gold)" }}>ACTIONS</div>
            <div className="space-y-3 mt-4">
              <button
                onClick={handleDownload}
                className="btn-ink btn-gold w-full justify-center"
              >
                <span>Download ↓</span>
              </button>
              <button
                onClick={handleSave}
                disabled={savePending}
                className="btn-ink w-full justify-center"
                style={{ opacity: savePending ? 0.65 : 1 }}
              >
                <span>{savedId != null ? "Saved to folio ✓" : "Save to folio"}</span>
              </button>
              <button
                onClick={handleCopyCitation}
                className="btn-ink btn-ghost w-full justify-center"
              >
                <span>Copy citation</span>
              </button>
            </div>
          </div>
          <div className="p-6" style={{ background: "var(--paper-raised)" }}>
            <div className="mono mb-2" style={{ color: "var(--ink-faint)", fontSize: 10 }}>SUGGESTED CITATION</div>
            <p className="serif" style={{ fontSize: "0.95rem", color: "var(--ink-soft)" }}>
              {r.author ?? "Unknown"} ({r.year ?? "n.d."}). <em>{r.title}</em>. InsightNest Library, ref. {refCode}.
            </p>
          </div>
        </>
      }
    />
  );
}
