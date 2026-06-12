import { useEffect, useRef, useState } from "react";
import { Wordmark } from "./Wordmark";
import { ThemeToggle } from "./ThemeToggle";
import { useSession, roleHome } from "../providers/SessionProvider";
import { messagesUnreadCount, notificationsList } from "../api/endpoints";

const links = [
  { to: "#/universities", label: "Universities", idx: "01" },
  { to: "#/programs", label: "Programs", idx: "02" },
  { to: "#/scholarships", label: "Scholarships", idx: "03" },
  { to: "#/research", label: "Research", idx: "04" },
  { to: "#/resources", label: "Resources", idx: "05" },
  { to: "#/forums", label: "Forums", idx: "06" },
  { to: "#/webinars", label: "Webinars", idx: "07" },
];

export function NavBar() {
  const { session, logout } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [up, setUp] = useState(true);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [hash, setHash] = useState(typeof window !== "undefined" ? window.location.hash : "");
  const menuRef = useRef<HTMLDivElement>(null);

  // Real unread counts (bug 4)
  const [msgUnread, setMsgUnread] = useState(0);
  const [notifUnread, setNotifUnread] = useState(0);

  const fetchUnread = async () => {
    if (!session.signedIn) return;
    try {
      const [msgCount, notifData] = await Promise.all([
        messagesUnreadCount(),
        notificationsList({ page: 0, size: 50 }),
      ]);
      setMsgUnread(msgCount);
      setNotifUnread(notifData.content.filter(n => !n.readAt).length);
    } catch {
      // Tolerate errors silently (bug 4)
    }
  };

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setUp(y < lastY || y < 80);
      lastY = y;
    };
    const onHash = () => {
      setHash(window.location.hash);
      setOpen(false);
      setMenu(false);
      // Refetch unread on route change (bug 4)
      fetchUnread();
    };
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", onHash);
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("mousedown", onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.signedIn]);

  // Fetch on sign-in
  useEffect(() => {
    fetchUnread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.signedIn]);

  const height = scrolled ? 60 : 88;
  const dashboardHref = roleHome(session.role);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all"
        style={{
          height,
          background: scrolled ? "color-mix(in srgb, var(--paper) 92%, transparent)" : "transparent",
          backdropFilter: scrolled ? "blur(4px)" : "none",
          transform: up ? "translateY(0)" : "translateY(-100%)",
          transition: "height 0.5s cubic-bezier(0.65,0,0.35,1), transform 0.45s cubic-bezier(0.65,0,0.35,1), background 0.4s ease",
          borderBottom: scrolled ? "1px solid var(--rule)" : "1px solid transparent",
        }}
      >
        <div className="max-w-[1440px] mx-auto h-full px-4 sm:px-6 md:px-10 flex items-center justify-between gap-4 md:gap-8">
          <Wordmark size={scrolled ? 15 : 18} />

          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {links.map((l) => {
              const active = hash.startsWith(l.to);
              return (
                <a
                  key={l.to}
                  href={l.to}
                  className="group relative inline-flex items-baseline gap-[6px] py-2"
                  style={{ color: active ? "var(--ink)" : "var(--ink-soft)" }}
                >
                  <span className="mono" style={{ color: active ? "var(--gold)" : "var(--ink-faint)", fontSize: 9 }}>{l.idx}</span>
                  <span style={{ fontSize: 13 }}>{l.label}</span>
                  <span
                    className="absolute left-0 right-0 -bottom-[2px] h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                    style={{ background: "var(--gold)" }}
                  />
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            {session.signedIn ? (
              <>
                {/* Dashboard quick link */}
                <a href={dashboardHref} className="hidden md:inline-flex mono items-center gap-2" style={{ fontSize: 11, color: hash.startsWith(dashboardHref.slice(1)) ? "var(--gold)" : "var(--ink-soft)" }}>
                  <span>Dashboard</span>
                  {notifUnread > 0 && (
                    <span className="mono" style={{ background: "var(--gold)", color: "var(--paper)", fontSize: 9, padding: "0 4px", lineHeight: "16px" }}>
                      {notifUnread}
                    </span>
                  )}
                </a>
                {/* Messages */}
                <a href="#/messages" className="hidden md:inline-flex relative items-center mono" aria-label="Inbox" style={{ fontSize: 11, color: hash.startsWith("#/messages") ? "var(--gold)" : "var(--ink-soft)" }}>
                  <svg width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="currentColor" strokeWidth="1"><rect x="0.5" y="0.5" width="15" height="13"/><path d="M0.5 0.5l7.5 7 7.5-7"/></svg>
                  {msgUnread > 0 && (
                    <span aria-hidden style={{ background: "var(--gold)", display: "inline-block", width: 6, height: 6, marginLeft: 6 }} />
                  )}
                </a>

                {/* Avatar menu */}
                <div ref={menuRef} className="relative">
                  <button
                    onClick={() => setMenu((m) => !m)}
                    aria-label="Account menu"
                    className="w-10 h-10 inline-flex items-center justify-center border border-[var(--rule-strong)] serif hover:border-[var(--gold)]"
                    style={{ fontSize: 14 }}
                  >
                    {session.initial}
                  </button>
                  {menu && (
                    <div className="absolute right-0 mt-2 w-72" style={{ background: "var(--paper-raised)", border: "1px solid var(--rule-strong)" }}>
                      <div className="p-4 border-b border-[var(--rule)]">
                        <div className="mono" style={{ color: "var(--gold)", fontSize: 10 }}>{session.role.toUpperCase()} · FOLIO</div>
                        <div className="serif mt-1" style={{ fontSize: "1.0625rem" }}>{session.name}</div>
                        <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{session.email}</div>
                      </div>
                      <ul className="p-2">
                        <li><a href={dashboardHref} className="block px-3 py-2 hover:bg-[var(--paper-deep)]">Dashboard</a></li>
                        <li><a href="#/profile/me" className="block px-3 py-2 hover:bg-[var(--paper-deep)]">View public profile</a></li>
                        <li>
                          <a href="#/messages" className="flex items-center justify-between px-3 py-2 hover:bg-[var(--paper-deep)]">
                            <span>Messages</span>
                            {msgUnread > 0 && <span className="mono" style={{ background: "var(--gold)", color: "var(--paper)", fontSize: 9, padding: "0 4px" }}>{msgUnread}</span>}
                          </a>
                        </li>
                        <li><a href="#/settings" className="block px-3 py-2 hover:bg-[var(--paper-deep)]">Settings</a></li>
                        {session.role === "Learner" && <li><a href="#/digest" className="block px-3 py-2 hover:bg-[var(--paper-deep)]">Sentinel digest</a></li>}
                        {session.role === "Learner" && <li><a href="#/counsellor" className="block px-3 py-2 hover:bg-[var(--paper-deep)]">Nest Counsellor</a></li>}
                      </ul>
                      {/* No role-switcher (demo removed) */}
                      <button
                        onClick={async () => { await logout(); setMenu(false); window.location.hash = "#/"; }}
                        className="w-full text-left px-4 py-3 mono border-t border-[var(--rule)] hover:text-[var(--oxblood)]"
                        style={{ fontSize: 11 }}
                      >
                        SIGN OUT →
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <a href="#/login" className="hidden md:inline-flex mono items-center gap-2" style={{ fontSize: 11 }}>
                <span>Sign In</span><span style={{ color: "var(--gold)" }}>↗</span>
              </a>
            )}

            <ThemeToggle />
            <button
              className="lg:hidden w-10 h-10 inline-flex items-center justify-center border border-[var(--rule-strong)]"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <svg width="18" height="14" viewBox="0 0 18 14"><g stroke="currentColor" strokeWidth="1"><line x1="0" y1="1" x2="18" y2="1"/><line x1="0" y1="7" x2="18" y2="7"/><line x1="0" y1="13" x2="18" y2="13"/></g></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu */}
      <div
        className={"fixed inset-0 z-[60] transition-opacity duration-500 " + (open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}
        style={{ background: "var(--paper)" }}
        aria-hidden={!open}
      >
        <div className="h-full max-w-[1440px] mx-auto px-5 md:px-10 flex flex-col">
          <div className="flex items-center justify-between" style={{ height: 80 }}>
            <Wordmark size={17} />
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="w-10 h-10 inline-flex items-center justify-center border border-[var(--rule-strong)]">
              <svg width="16" height="16" viewBox="0 0 16 16"><g stroke="currentColor" strokeWidth="1"><line x1="2" y1="2" x2="14" y2="14"/><line x1="14" y1="2" x2="2" y2="14"/></g></svg>
            </button>
          </div>
          <div className="hairline mt-2" />

          {session.signedIn && (
            <div className="pt-5 pb-3 flex items-center gap-3 border-b border-[var(--rule)]">
              <div className="w-12 h-12 border border-[var(--ink)] flex items-center justify-center serif" style={{ fontSize: 22 }}>{session.initial}</div>
              <div className="min-w-0">
                <div className="mono" style={{ color: "var(--gold)", fontSize: 10 }}>{session.role.toUpperCase()}</div>
                <div className="serif truncate" style={{ fontSize: "1.0625rem" }}>{session.name}</div>
              </div>
              <a href={dashboardHref} className="ml-auto mono" style={{ color: "var(--gold)", fontSize: 11 }}>DASHBOARD →</a>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1">
            {session.signedIn && [
              { to: dashboardHref, label: "Dashboard", idx: "00" },
              { to: "#/profile/me", label: "Profile", idx: "◉" },
              { to: "#/messages", label: "Messages", idx: "✉︎" },
              { to: "#/settings", label: "Settings", idx: "⚙︎" },
            ].map((l, i) => (
              <a
                key={l.to}
                href={l.to}
                className="flex items-baseline gap-5 py-3 border-b border-[var(--rule)]"
                style={{ animation: open ? `riseIn 0.6s cubic-bezier(0.22,1,0.36,1) ${0.05 * i + 0.05}s backwards` : "none" }}
              >
                <span className="mono" style={{ color: "var(--gold)", minWidth: 24 }}>{l.idx}</span>
                <span className="serif" style={{ fontSize: "clamp(1.5rem, 5.5vw, 2.25rem)", fontWeight: 300 }}>{l.label}</span>
                <span className="ml-auto mono" style={{ color: "var(--ink-faint)" }}>→</span>
              </a>
            ))}
            {links.map((l, i) => (
              <a
                key={l.to}
                href={l.to}
                className="group flex items-baseline gap-5 py-3 border-b border-[var(--rule)]"
                style={{ animation: open ? `riseIn 0.6s cubic-bezier(0.22,1,0.36,1) ${0.05 * i + 0.15}s backwards` : "none" }}
              >
                <span className="mono" style={{ color: "var(--gold)", minWidth: 24 }}>{l.idx}</span>
                <span className="serif" style={{ fontSize: "clamp(1.5rem, 5.5vw, 2.25rem)", fontWeight: 300 }}>{l.label}</span>
                <span className="ml-auto mono" style={{ color: "var(--ink-faint)" }}>→</span>
              </a>
            ))}
          </nav>

          <div className="py-5 grid grid-cols-2 gap-3 border-t border-[var(--rule-strong)]">
            {session.signedIn ? (
              <>
                <a href="#/messages" className="btn-ink"><span>Open inbox</span></a>
                <button onClick={async () => { await logout(); window.location.hash = "#/"; setOpen(false); }} className="btn-ink btn-ghost"><span>Sign out</span></button>
              </>
            ) : (
              <>
                <a href="#/login" className="btn-ink"><span>Sign In</span></a>
                <a href="#/register" className="btn-ink btn-gold"><span>Join</span></a>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
