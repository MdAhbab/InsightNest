import type { ReactNode } from "react";

/** Editorial detail-page shell: kicker → giant title → 8/4 column body with sticky rail. */
export function DetailShell({
  back,
  kicker,
  index,
  title,
  lede,
  hero,
  meta,
  body,
  rail,
}: {
  back: { href: string; label: string };
  kicker: string;
  index?: string;
  title: ReactNode;
  lede?: ReactNode;
  hero?: ReactNode;
  meta?: ReactNode;
  body: ReactNode;
  rail: ReactNode;
}) {
  return (
    <main>
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pt-28 md:pt-36 pb-10 md:pb-12">
        <a href={back.href} className="mono inline-flex items-center gap-2" style={{ color: "var(--ink-soft)" }}>
          <span style={{ color: "var(--gold)" }}>←</span> {back.label}
        </a>
        <div className="mt-8 flex items-baseline gap-5">
          {index && <span className="section-index">{index}</span>}
          <span className="mono" style={{ color: "var(--ink-faint)" }}>{kicker}</span>
          {meta && <span className="mono ml-auto hidden md:inline" style={{ color: "var(--ink-faint)" }}>{meta}</span>}
        </div>
        <h1 className="serif mt-6 text-balance" style={{ fontWeight: 300, fontSize: "clamp(2rem, 6.5vw, 5.5rem)", lineHeight: 1.0, letterSpacing: "-0.025em" }}>
          <span className="intro-line-wrap"><span className="intro-line">{title}</span></span>
        </h1>
        {lede && (
          <p className="intro-rise mt-8 max-w-[60ch] serif" style={{ color: "var(--ink-soft)", fontSize: "clamp(1.125rem, 1.5vw, 1.375rem)", fontWeight: 300, lineHeight: 1.5, animationDelay: "0.35s" }}>
            {lede}
          </p>
        )}
      </section>

      {hero && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-10 md:pb-12">
          {hero}
        </section>
      )}

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-32 grid grid-cols-12 gap-6 md:gap-10">
        <article className="col-span-12 md:col-span-8 space-y-12">{body}</article>
        <aside className="col-span-12 md:col-span-4 md:sticky md:top-28 self-start space-y-6">{rail}</aside>
      </section>
    </main>
  );
}

export function DataList({ rows }: { rows: { k: string; v: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-y-3">
      {rows.map((r) => (
        <div key={r.k} className="col-span-2 grid grid-cols-2 gap-3 py-3 border-b border-[var(--rule)]">
          <dt className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{r.k}</dt>
          <dd className="text-right" style={{ color: "var(--ink)" }}>{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function H2({ children, index }: { children: ReactNode; index?: string }) {
  return (
    <div>
      <div className="flex items-baseline gap-4 pb-3 border-b border-[var(--rule)]">
        {index && <span className="section-index">{index}</span>}
        <h2 className="serif" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)", fontWeight: 300 }}>{children}</h2>
      </div>
    </div>
  );
}

export function Para({ children }: { children: ReactNode }) {
  return <p className="serif" style={{ fontSize: "1.125rem", fontWeight: 300, lineHeight: 1.7, color: "var(--ink)" }}>{children}</p>;
}
