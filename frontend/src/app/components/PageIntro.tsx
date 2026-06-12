import type { ReactNode } from "react";

/** Consistent page-intro grammar: gold rule + serif h1 + mono kicker. */
export function PageIntro({
  index,
  kicker,
  title,
  lede,
  meta,
}: {
  index: string;
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pt-32 md:pt-44 pb-10 md:pb-20">
      <span className="intro-rule" style={{ width: 96 }} />
      <div className="mt-6 flex items-baseline gap-5">
        <span className="section-index">{index}</span>
        <span className="mono" style={{ color: "var(--ink-faint)" }}>{kicker}</span>
        {meta && <span className="mono ml-auto hidden md:inline" style={{ color: "var(--ink-faint)" }}>{meta}</span>}
      </div>
      <h1 className="serif mt-6 md:mt-8 max-w-[18ch] text-balance" style={{ fontWeight: 300, fontSize: "clamp(2.25rem, 7vw, 6rem)", lineHeight: 1 }}>
        <span className="intro-line-wrap"><span className="intro-line">{title}</span></span>
      </h1>
      {lede && (
        <p className="intro-rise mt-8 max-w-[60ch]" style={{ color: "var(--ink-soft)", animationDelay: "0.4s" }}>
          {lede}
        </p>
      )}
    </section>
  );
}
