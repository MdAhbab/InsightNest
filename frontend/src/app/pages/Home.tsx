import { useEffect, useRef, useState } from "react";
import { ConstellationScene } from "../scenes/ConstellationScene";
import { SplitFlap } from "../components/SplitFlap";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { fmtDate } from "../api/format";
import {
  universitiesList,
  programsList,
  scholarshipsList,
  researchList,
  webinarsList,
  ProgramDto,
  WebinarDto,
} from "../api/endpoints";

const PILLARS: { idx: string; title: string; lede: string; href: string }[] = [
  { idx: "01", title: "Universities", lede: "An atlas of institutions — from Bologna to Singapore — indexed by year, discipline and intent.", href: "#/universities" },
  { idx: "02", title: "Programs", lede: "Fourteen thousand postgraduate courses, catalogued like a printed prospectus.", href: "#/programs" },
  { idx: "03", title: "Scholarships", lede: "A ledger of funding — read by tally, not by banner.", href: "#/scholarships" },
  { idx: "04", title: "Research", lede: "Open positions in laboratories accepting collaborators this season.", href: "#/research" },
  { idx: "05", title: "Resources", lede: "An archive of writing on how to write, propose, and present yourself.", href: "#/resources" },
  { idx: "06", title: "Forums", lede: "Correspondence between candidates — long-form, attributable, archived.", href: "#/forums" },
  { idx: "07", title: "Webinars", lede: "A standing programme of conversations with admissions and faculty.", href: "#/webinars" },
];

export default function Home() {
  return (
    <main>
      <Hero />
      <DiscoverScene />
      <NumbersStrip />
      <Pillars />
      <WebinarsTeaser />
      <Closing />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative" style={{ minHeight: "92vh" }}>
      {/* Constellation in background */}
      <div className="absolute inset-0 z-0" aria-hidden>
        <ConstellationScene />
      </div>
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pt-32 md:pt-44">
        <div className="flex items-baseline gap-4">
          <span className="intro-rule" style={{ width: 80 }} />
          <span className="section-index">EST. MMXXVI — ACADEMIC ATLAS</span>
        </div>
        <h1 className="serif mt-10 max-w-[12ch]" style={{ fontWeight: 300, lineHeight: 0.98 }}>
          <span className="intro-line-wrap"><span className="intro-line" style={{ animationDelay: "0.15s" }}>Insight for your</span></span>
          <span className="intro-line-wrap"><span className="intro-line" style={{ animationDelay: "0.28s", fontStyle: "italic", color: "var(--ink)" }}>higher studies.</span></span>
        </h1>
        <p className="intro-rise mt-8 max-w-[52ch]" style={{ color: "var(--ink-soft)", animationDelay: "0.55s" }}>
          A quiet, editorial atlas of universities, programs, scholarships and research collaborations —
          made for the candidate who reads before they apply.
        </p>
        <div className="intro-rise mt-10 flex flex-wrap items-center gap-4" style={{ animationDelay: "0.7s" }}>
          <a href="#/universities" className="btn-ink"><span>Explore the atlas</span><span aria-hidden style={{ color: "var(--gold)" }}>→</span></a>
          <a href="#/register" className="btn-ink btn-ghost"><span>Join as Learner</span></a>
        </div>

        <div className="absolute right-6 md:right-10 bottom-10 hidden md:flex items-center gap-3 mono" style={{ color: "var(--ink-faint)" }}>
          <span>Scroll</span>
          <span style={{ display: "inline-block", width: 1, height: 36, background: "var(--gold)", animation: "lineMaskUp 1.4s ease-in-out infinite alternate" }} />
        </div>
      </div>
    </section>
  );
}

function DiscoverScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = wrap.current; if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.9, end = -rect.height + vh * 0.1;
      const k = 1 - Math.min(1, Math.max(0, (rect.top - end) / (start - end)));
      setProgress(k);
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    update(); window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); };
  }, []);

  const reveal = Math.min(1, progress * 1.4);
  const scale = 1 + progress * 0.18;
  const tx = -progress * 6;

  return (
    <section ref={wrap} className="relative" style={{ height: "140vh", background: "var(--paper)" }}>
      <div className="sticky top-0 h-screen overflow-hidden flex items-center" style={{ background: "var(--paper)" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="relative select-none"
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 300,
              fontSize: "clamp(7rem, 22vw, 22rem)",
              letterSpacing: "-0.04em",
              transform: `translateX(${tx}vw) scale(${scale})`,
              transition: "transform 0.05s linear",
              lineHeight: 0.85,
            }}
          >
            <span
              aria-hidden
              className="absolute inset-0"
              style={{
                color: "transparent",
                WebkitTextStroke: "1px var(--rule-strong)",
              }}
            >
              DISCOVER
            </span>
            <span
              style={{
                position: "relative",
                background: "linear-gradient(180deg, var(--oxford) 0%, var(--gold) 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                clipPath: `inset(${(1 - reveal) * 100}% 0 0 0)`,
                transition: "clip-path 0.05s linear",
              }}
            >
              DISCOVER
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto w-full px-4 sm:px-6 md:px-10 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4">
            <span className="section-index">01 — ATLAS</span>
            <p className="serif mt-6" style={{ fontSize: "clamp(1.25rem, 2vw, 1.875rem)", fontWeight: 300, lineHeight: 1.2 }}>
              A scholar's atlas, drawn by hand and updated nightly — universities, programmes, funding bodies
              and laboratories, arranged like a printed table of contents.
            </p>
          </div>
          <div className="col-span-12 md:col-start-9 md:col-span-4 mt-8 md:mt-auto pb-6 md:pb-0">
            <div className="mono mb-3" style={{ color: "var(--ink-faint)" }}>READING TIME — 4 min</div>
            <p style={{ color: "var(--ink-soft)" }}>
              Designed for the candidate who treats application season as research, not as marketing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function NumbersStrip() {
  const [counts, setCounts] = useState({ universities: 0, programs: 0, scholarships: 0, researchers: 0 });

  useEffect(() => {
    // Fetch each list with size=1 to get totalElements from page metadata
    Promise.all([
      universitiesList({ page: 0, size: 1 }),
      programsList({ page: 0, size: 1 }),
      scholarshipsList({ page: 0, size: 1 }),
      researchList({ page: 0, size: 1 }),
    ]).then(([u, p, s, r]) => {
      setCounts({
        universities: u.page.totalElements,
        programs: p.page.totalElements,
        scholarships: s.page.totalElements,
        researchers: r.page.totalElements,
      });
    }).catch(() => {
      // Keep zeros on error — non-critical
    });
  }, []);

  return (
    <section className="relative" style={{ background: "var(--ink)", color: "var(--paper)" }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 py-16 md:py-36">
        <div className="flex items-baseline gap-5">
          <span className="section-index">02 — VOLUMETRIC</span>
          <span className="mono" style={{ color: "var(--paper)", opacity: 0.55 }}>As of this morning</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 mt-12">
          {[
            { label: "Universities", n: counts.universities, pad: 4 },
            { label: "Programmes", n: counts.programs, pad: 5 },
            { label: "Scholarships", n: counts.scholarships, pad: 4 },
            { label: "Researchers", n: counts.researchers, pad: 4 },
          ].map((s, i) => (
            <div key={s.label}>
              <div className="mono" style={{ color: "var(--gold-soft)", fontSize: 11 }}>{String(i + 1).padStart(2, "0")}</div>
              <div className="serif tabular mt-3" style={{ fontSize: "clamp(2.75rem, 6vw, 5rem)", fontWeight: 300, lineHeight: 1, color: "var(--paper)" }}>
                <SplitFlap value={s.n} pad={s.pad} />
              </div>
              <div className="mono mt-3" style={{ color: "var(--paper)", opacity: 0.6 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-20 max-w-[60ch] serif" style={{ fontSize: "clamp(1.25rem, 1.8vw, 1.625rem)", fontWeight: 300, lineHeight: 1.4 }}>
          The numbers are the smallest part of the story — but they are kept here for the record, as in
          any decent journal of correspondence.
        </div>
      </div>
    </section>
  );
}

function Pillars() {
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pt-20 md:pt-32 pb-12">
      <div className="flex flex-wrap items-baseline gap-3 md:gap-5 pb-8 md:pb-10 border-b border-[var(--rule-strong)]">
        <span className="section-index">03 — TABLE OF CONTENTS</span>
        <h2 className="serif ml-auto md:ml-0" style={{ fontWeight: 300 }}>What is collected here</h2>
      </div>
      <div>
        {PILLARS.map((p, i) => (
          <PillarRow key={p.idx} p={p} flip={i % 2 === 1} i={i} />
        ))}
      </div>
    </section>
  );
}

function PillarRow({ p, flip, i }: { p: typeof PILLARS[number]; flip: boolean; i: number }) {
  const { ref, p: prog } = useScrollProgress<HTMLDivElement>();
  const inkX = Math.min(1, Math.max(0, (prog - 0.2) * 2));
  return (
    <div ref={ref} className="relative grid grid-cols-12 gap-6 py-12 md:py-20 border-b border-[var(--rule)]">
      <div className={"col-span-12 md:col-span-5 " + (flip ? "md:col-start-8 md:order-2" : "")}>
        <div className="aspect-[4/5] md:aspect-[5/6] relative overflow-hidden" style={{ background: "var(--paper-deep)" }}>
          <div className="absolute inset-0 duotone" style={{ backgroundImage: `url(${campusImg(i)})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="absolute left-4 bottom-4 mono" style={{ color: "var(--paper)" }}>PLATE — {String(i + 1).padStart(2, "0")}</div>
        </div>
      </div>
      <div className={"col-span-12 md:col-span-6 flex flex-col justify-center " + (flip ? "md:col-start-1 md:order-1" : "md:col-start-7")}>
        <div className="flex items-baseline gap-4">
          <span className="section-index" style={{ fontSize: 16 }}>{p.idx}</span>
          <span className="mono" style={{ color: "var(--ink-faint)" }}>—</span>
          <h3 className="serif" style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)", fontWeight: 300, letterSpacing: "-0.02em" }}>
            {p.title}
          </h3>
        </div>
        <p className="serif mt-6 max-w-[40ch]" style={{ fontSize: "clamp(1.125rem, 1.6vw, 1.5rem)", fontWeight: 300, lineHeight: 1.35 }}>
          {p.lede}
        </p>
        <div className="mt-8 flex items-center gap-4">
          <a href={p.href} className="btn-ink"><span>Open chapter</span><span aria-hidden style={{ color: "var(--gold)" }}>↗</span></a>
          <div className="hidden md:block flex-1 h-px" style={{ background: "var(--gold)", transformOrigin: "left", transform: `scaleX(${inkX})`, transition: "transform 0.6s ease" }} />
        </div>
      </div>
    </div>
  );
}

function campusImg(i: number) {
  const arr = [
    "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1400&q=80",
  ];
  return arr[i % arr.length];
}

function WebinarsTeaser() {
  const [upcoming, setUpcoming] = useState<WebinarDto[]>([]);

  useEffect(() => {
    webinarsList({ page: 0, size: 20 }).then((data) => {
      const now = Date.now();
      const future = data.content.filter((w) => {
        // Determine upcoming: use status field if present, else compare scheduledAt
        if (w.status === "UPCOMING" || w.status === "SCHEDULED") return true;
        if (w.status === "PAST" || w.status === "COMPLETED" || w.status === "CANCELED") return false;
        // Fallback: compare scheduledAt
        if (w.scheduledAt) return new Date(w.scheduledAt).getTime() > now;
        return false;
      });
      setUpcoming(future.slice(0, 3));
    }).catch(() => {});
  }, []);

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pt-20 md:pt-32 pb-12">
      <div className="flex items-end justify-between gap-4 pb-6 md:pb-8 border-b border-[var(--rule)] flex-wrap">
        <div className="flex items-baseline gap-5">
          <span className="section-index">04 — STANDING PROGRAMME</span>
          <h2 className="serif" style={{ fontWeight: 300 }}>The next conversations</h2>
        </div>
        <a href="#/webinars" className="mono" style={{ color: "var(--gold)" }}>VIEW ALL ↗</a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px mt-8" style={{ background: "var(--rule)" }}>
        {upcoming.length === 0 && (
          <div className="col-span-3 py-12 text-center mono" style={{ color: "var(--ink-faint)", background: "var(--paper)" }}>
            No upcoming webinars scheduled. <a href="#/webinars" style={{ color: "var(--gold)" }}>Browse all →</a>
          </div>
        )}
        {upcoming.map((w, i) => (
          <article key={w.id} className="p-8 md:p-10" style={{ background: "var(--paper)" }}>
            <div className="flex items-baseline justify-between mono" style={{ color: "var(--ink-faint)" }}>
              <span style={{ color: "var(--gold)" }}>W-{String(w.id).padStart(3, "0")}</span>
              <span>{fmtDate(w.scheduledAt)}</span>
            </div>
            <h3 className="serif mt-5" style={{ fontSize: "clamp(1.375rem, 2vw, 1.75rem)", fontWeight: 300, lineHeight: 1.2 }}>
              {w.title}
            </h3>
            <div className="mt-6 pt-4 border-t border-[var(--rule)] flex justify-between mono" style={{ color: "var(--ink-soft)", fontSize: 10 }}>
              <span>{w.host?.fullName ?? "—"}</span>
              <span>{w.durationMinutes ? `${w.durationMinutes} min` : "—"}</span>
            </div>
            <div className="mt-6">
              <a href={`#/webinars/${w.id}`} className="mono hover:text-[var(--gold)]">RESERVE A SEAT →</a>
            </div>
            <div className="serif mt-8 tabular" style={{ fontSize: 64, fontWeight: 300, color: "var(--rule-strong)", lineHeight: 1 }}>0{i+1}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Closing() {
  const [featured, setFeatured] = useState<ProgramDto[]>([]);

  useEffect(() => {
    programsList({ page: 0, size: 4 }).then((data) => {
      setFeatured(data.content.slice(0, 4));
    }).catch(() => {});
  }, []);

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pt-20 md:pt-32 pb-24 md:pb-32">
      <div className="grid grid-cols-12 gap-6 items-end pb-8 border-b border-[var(--rule)]">
        <div className="col-span-12 md:col-span-7">
          <span className="section-index">05 — INVITATION</span>
          <h2 className="serif mt-4" style={{ fontSize: "clamp(2.25rem, 5vw, 4.25rem)", fontWeight: 300, lineHeight: 1.05 }}>
            Begin where the previous reader left off.
          </h2>
        </div>
        <div className="col-span-12 md:col-span-4 md:col-start-9">
          <p style={{ color: "var(--ink-soft)" }}>
            Or browse a few programmes opened this morning by candidates whose interests overlap with yours.
          </p>
          <div className="mt-6"><a href="#/programs" className="btn-ink"><span>Browse programmes</span></a></div>
        </div>
      </div>
      <ul className="mt-2">
        {featured.map((p, i) => (
          <li key={p.id} className="grid grid-cols-[64px_minmax(0,1fr)_auto] md:grid-cols-[88px_minmax(0,1fr)_220px_28px] gap-6 py-6 border-b border-[var(--rule)]">
            <span className="mono tabular" style={{ color: "var(--gold)" }}>{String(i + 1).padStart(3, "0")}</span>
            <div className="min-w-0">
              <div className="serif truncate" style={{ fontSize: "clamp(1.125rem, 1.6vw, 1.5rem)" }}>{p.name}</div>
              <div className="mono mt-1" style={{ color: "var(--ink-soft)" }}>{p.university?.name ?? "—"} · {p.university?.country ?? "—"}</div>
            </div>
            <div className="hidden md:flex flex-col items-end mono" style={{ color: "var(--ink-soft)" }}>
              <span style={{ color: "var(--gold)" }}>DL · {fmtDate(p.applicationDeadline)}</span>
              <span>{p.duration ?? "—"} · {p.tuition ?? "—"}</span>
            </div>
            <span className="hidden md:inline mono" style={{ color: "var(--ink-faint)" }}>›</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
