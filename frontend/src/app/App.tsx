import { useEffect, useState } from "react";
import { ThemeProvider } from "./providers/ThemeProvider";
import { SessionProvider, useSession, roleHome } from "./providers/SessionProvider";
import { ToastProvider } from "./components/Toast";
import { Router, useHashRoute, matchRoute } from "./router";
import { NavBar } from "./components/NavBar";
import { Footer } from "./components/Footer";

import Home from "./pages/Home";
import Universities from "./pages/Universities";
import UniversityDetail from "./pages/UniversityDetail";
import Programs from "./pages/Programs";
import ProgramDetail from "./pages/ProgramDetail";
import Scholarships from "./pages/Scholarships";
import ScholarshipDetail from "./pages/ScholarshipDetail";
import Research from "./pages/Research";
import ResearchDetail from "./pages/ResearchDetail";
import Resources from "./pages/Resources";
import ResourceDetail from "./pages/ResourceDetail";
import Forums from "./pages/Forums";
import ThreadDetail from "./pages/ThreadDetail";
import Webinars from "./pages/Webinars";
import WebinarDetail from "./pages/WebinarDetail";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import { Login, Register } from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Counsellor from "./pages/Counsellor";
import Matchmaker from "./pages/Matchmaker";
import Librarian from "./pages/Librarian";
import Digest from "./pages/Digest";
import Messages from "./pages/Messages";
import Researcher from "./pages/Researcher";
import UniversityRep from "./pages/UniversityRep";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const ROUTES = [
  { pattern: "/", Component: Home },
  { pattern: "/universities", Component: Universities },
  { pattern: "/universities/:id", Component: UniversityDetail },
  { pattern: "/programs", Component: Programs },
  { pattern: "/programs/:id", Component: ProgramDetail },
  { pattern: "/scholarships", Component: Scholarships },
  { pattern: "/scholarships/:id", Component: ScholarshipDetail },
  { pattern: "/research", Component: Research },
  { pattern: "/research/matchmaker", Component: Matchmaker },
  { pattern: "/research/:id", Component: ResearchDetail },
  { pattern: "/resources", Component: Resources },
  { pattern: "/resources/librarian", Component: Librarian },
  { pattern: "/resources/:id", Component: ResourceDetail },
  { pattern: "/forums", Component: Forums },
  { pattern: "/forums/:id", Component: ThreadDetail },
  { pattern: "/webinars", Component: Webinars },
  { pattern: "/webinars/:id", Component: WebinarDetail },
  { pattern: "/contact", Component: Contact },
  { pattern: "/faq", Component: FAQ },
  { pattern: "/login", Component: Login },
  { pattern: "/register", Component: Register },
  { pattern: "/dashboard", Component: Dashboard },
  { pattern: "/counsellor", Component: Counsellor },
  { pattern: "/digest", Component: Digest },
  { pattern: "/messages", Component: Messages },
  { pattern: "/messages/:id", Component: Messages },
  { pattern: "/researcher", Component: Researcher },
  { pattern: "/rep", Component: UniversityRep },
  { pattern: "/admin", Component: Admin },
  { pattern: "/admin/:section", Component: Admin },
  { pattern: "/profile", Component: Profile },
  { pattern: "/profile/:id", Component: Profile },
  { pattern: "/settings", Component: Settings },
];

const FULL_BLEED = new Set(["/login", "/register"]);

export default function App() {
  const { path, query } = useHashRoute();
  const match = matchRoute(path, ROUTES) ?? { Component: NotFound, params: {} };
  const Page = match.Component;
  const fullBleed = FULL_BLEED.has(path);

  return (
    <ThemeProvider>
      <SessionProvider>
        <ToastProvider>
          <Router value={{ path, params: match.params, query }}>
            <ReadingProgress />
            <NavBar />
            <RouteGuard path={path}>
              <div key={path} className="page-fade">
                <Page />
              </div>
            </RouteGuard>
            {!fullBleed && <Footer />}
            <style>{`
              .page-fade { animation: pageFadeIn 0.5s cubic-bezier(0.22,1,0.36,1); }
              @keyframes pageFadeIn { from { opacity: 0; } to { opacity: 1; } }
              @media (prefers-reduced-motion: reduce) { .page-fade { animation: none; } }
            `}</style>
          </Router>
        </ToastProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

/** Routes that require sign-in */
const PROTECTED = [
  "/dashboard",
  "/messages",
  "/researcher",
  "/rep",
  "/admin",
  "/counsellor",
  "/digest",
  "/settings",
  "/profile/me",
];

/** Role-restricted routes (bug 3):
 * /researcher → Faculty (and Admin)
 * /rep        → Rep (and Admin)
 * /admin      → Admin only
 */
const ROLE_REQUIRED: { prefix: string; roles: string[] }[] = [
  { prefix: "/researcher", roles: ["Faculty", "Admin"] },
  { prefix: "/rep",        roles: ["Rep", "Admin"] },
  { prefix: "/admin",      roles: ["Admin"] },
];

function RouteGuard({ path, children }: { path: string; children: React.ReactNode }) {
  const { session } = useSession();

  const needsAuth = PROTECTED.some(p => path === p || path.startsWith(p + "/"));

  if (needsAuth && !session.signedIn) {
    return <SignInWall path={path} />;
  }

  if (session.signedIn) {
    for (const { prefix, roles } of ROLE_REQUIRED) {
      if (path === prefix || path.startsWith(prefix + "/")) {
        if (!roles.includes(session.role)) {
          // Redirect to own home (bug 3)
          const home = roleHome(session.role);
          window.location.hash = home;
          return null;
        }
      }
    }
  }

  return <>{children}</>;
}

function SignInWall({ path }: { path: string }) {
  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-10 pt-40 pb-32 grid grid-cols-12 gap-10">
      <div className="col-span-12 md:col-span-7">
        <span className="intro-rule" style={{ width: 96 }} />
        <div className="mt-6 mono" style={{ color: "var(--gold)" }}>PRIVATE — A FOLIO IS REQUIRED</div>
        <h1 className="serif mt-6" style={{ fontWeight: 300, fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1 }}>
          Sign in to enter this room.
        </h1>
        <p className="serif mt-6 max-w-[55ch]" style={{ color: "var(--ink-soft)", fontSize: "clamp(1.0625rem, 1.4vw, 1.25rem)", fontWeight: 300, lineHeight: 1.6 }}>
          The page you requested — <span className="mono" style={{ color: "var(--ink)" }}>{path}</span> — is part of your private correspondence
          and is only available to signed-in folios.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a href={`#/login?next=${encodeURIComponent(path)}`} className="btn-ink btn-gold"><span>Sign in</span></a>
          <a href="#/register" className="btn-ink btn-ghost"><span>Open an account</span></a>
        </div>
      </div>
      <aside className="col-span-12 md:col-span-4 md:col-start-9 border border-[var(--rule-strong)] p-6">
        <div className="mono pb-3 border-b border-[var(--rule)]" style={{ color: "var(--gold)" }}>WHY A FOLIO?</div>
        <ul className="mt-4 space-y-3" style={{ color: "var(--ink-soft)" }}>
          <li>· Save programmes, scholarships and openings.</li>
          <li>· Write directly to admissions officers and supervisors.</li>
          <li>· File and follow applications from one page.</li>
          <li>· Receive the weekly Sentinel digest.</li>
        </ul>
      </aside>
    </main>
  );
}

function ReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max <= 0 ? 0 : Math.min(1, window.scrollY / max));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-[70] pointer-events-none">
      <div className="h-full origin-left" style={{ background: "var(--gold)", transform: `scaleX(${p})`, transition: "transform 0.1s linear" }} />
    </div>
  );
}
