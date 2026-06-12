import { useTheme } from "../providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="relative w-10 h-10 inline-flex items-center justify-center border border-[var(--rule-strong)] transition-colors hover:border-[var(--gold)]"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" style={{ transform: `rotate(${dark ? 180 : 0}deg)`, transition: "transform 0.5s cubic-bezier(0.65,0,0.35,1)", color: "var(--ink)" }}>
        {dark ? (
          // crescent moon — engraved
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M16.5 13.2A6.5 6.5 0 1 1 10.8 7.5a5 5 0 0 0 5.7 5.7Z" />
            <circle cx="6" cy="6" r="0.7" fill="currentColor" />
            <circle cx="18" cy="18" r="0.5" fill="currentColor" />
          </g>
        ) : (
          // sun — engraved spokes
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="12" cy="12" r="4" />
            <g strokeLinecap="round">
              <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M5.5 5.5l1.5 1.5M17 17l1.5 1.5M18.5 5.5L17 7M7 17l-1.5 1.5"/>
            </g>
          </g>
        )}
      </svg>
    </button>
  );
}
