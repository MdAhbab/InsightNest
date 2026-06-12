import { useScrollProgress } from "../hooks/useScrollProgress";

export function Footer() {
  const { ref, p } = useScrollProgress<HTMLElement>();
  const ty = (1 - p) * 80; // parallax slide

  return (
    <footer ref={ref} className="relative mt-24 overflow-hidden" style={{ borderTop: "1px solid var(--rule)" }}>
      {/* outlined wordmark — parallax */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 -bottom-6 md:-bottom-12 select-none whitespace-nowrap"
        style={{
          transform: `translateY(${ty}px)`,
          fontFamily: "var(--font-serif)",
          fontWeight: 300,
          fontSize: "clamp(7rem, 22vw, 22rem)",
          lineHeight: 0.9,
          letterSpacing: "-0.04em",
          color: "transparent",
          WebkitTextStroke: "1px var(--rule-strong)",
        }}
      >
        InsightNest
      </div>

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pt-14 md:pt-20 pb-28 md:pb-40">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-5">
            <div className="section-index">EST. MMXXVI — VOLUME I</div>
            <p className="serif mt-4" style={{ fontSize: "clamp(1.5rem, 2.6vw, 2.25rem)", fontWeight: 300, lineHeight: 1.15 }}>
              Insight for your higher studies.
            </p>
            <p className="mt-6 max-w-md" style={{ color: "var(--ink-soft)" }}>
              An editorial atlas of universities, programs, scholarships, research collaborations
              and the people who write to them.
            </p>
          </div>
          <div className="col-span-6 md:col-span-2">
            <div className="mono" style={{ color: "var(--ink-faint)" }}>Discover</div>
            <ul className="mt-4 space-y-2">
              <li><a href="#/universities" className="hover:text-[var(--gold)]">Universities</a></li>
              <li><a href="#/programs" className="hover:text-[var(--gold)]">Programs</a></li>
              <li><a href="#/scholarships" className="hover:text-[var(--gold)]">Scholarships</a></li>
              <li><a href="#/research" className="hover:text-[var(--gold)]">Research</a></li>
            </ul>
          </div>
          <div className="col-span-6 md:col-span-2">
            <div className="mono" style={{ color: "var(--ink-faint)" }}>Practice</div>
            <ul className="mt-4 space-y-2">
              <li><a href="#/resources" className="hover:text-[var(--gold)]">Resources</a></li>
              <li><a href="#/forums" className="hover:text-[var(--gold)]">Forums</a></li>
              <li><a href="#/webinars" className="hover:text-[var(--gold)]">Webinars</a></li>
              <li><a href="#/counsellor" className="hover:text-[var(--gold)]">Nest Counsellor</a></li>
            </ul>
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="mono" style={{ color: "var(--ink-faint)" }}>Correspondence</div>
            <ul className="mt-4 space-y-2">
              <li><a href="#/contact" className="hover:text-[var(--gold)]">Contact the editors</a></li>
              <li><a href="#/faq" className="hover:text-[var(--gold)]">Frequently asked</a></li>
              <li><a href="#/digest">Deadline Sentinel · <span style={{ color: "var(--gold)" }}>subscribe</span></a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-[var(--rule)] flex flex-wrap items-center justify-between gap-4 mono" style={{ color: "var(--ink-faint)" }}>
          <span>© MMXXVI · InsightNest Press, Volume I</span>
          <span>Set in Fraunces, General Sans &amp; JetBrains Mono</span>
          <span>Printed on the open web</span>
        </div>
      </div>
    </footer>
  );
}
