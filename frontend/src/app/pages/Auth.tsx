import { useState } from "react";
import { Seal, CornerMark } from "../components/Seal";
import { useSession, roleHome } from "../providers/SessionProvider";
import { useRouter } from "../router";
import { ApiError } from "../api/client";

export function Login() { return <AuthPanel mode="login" />; }
export function Register() { return <AuthPanel mode="register" />; }

const PLATE = "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=2000&q=80";

type RegRole = "Learner" | "Faculty" | "Rep";
const ROLE_MAP: Record<RegRole, "LEARNER" | "FACULTY" | "UNIVERSITY_REP"> = {
  Learner: "LEARNER",
  Faculty: "FACULTY",
  Rep: "UNIVERSITY_REP",
};

function validate(isReg: boolean, values: {
  name: string;
  email: string;
  pw: string;
}): Record<string, string> {
  const errs: Record<string, string> = {};
  if (isReg && !values.name.trim()) {
    errs.fullName = "Name is required.";
  }
  if (!values.email.trim()) {
    errs.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errs.email = "Enter a valid email address.";
  }
  if (!values.pw) {
    errs.password = "Password is required.";
  } else if (values.pw.length < 8) {
    errs.password = "Password must be at least 8 characters.";
  }
  return errs;
}

function AuthPanel({ mode }: { mode: "login" | "register" }) {
  const isReg = mode === "register";
  const { login, register, session } = useSession();
  const { query } = useRouter();
  const nextRaw = query.get("next") ?? "";
  // Bug 9: only accept internal paths matching /^\/[a-z]/
  const next = /^\/[a-z]/.test(nextRaw) ? nextRaw : "";

  const [v, setV] = useState<{ name: string; email: string; pw: string; regRole: RegRole }>({
    name: "",
    email: "",
    pw: "",
    regRole: "Learner",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [pending, setPending] = useState(false);

  // Already signed in
  if (session.signedIn) {
    window.location.hash = next ? `#${next}` : roleHome(session.role);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    // Client-side validation
    const clientErrs = validate(isReg, v);
    if (Object.keys(clientErrs).length > 0) {
      setFieldErrors(clientErrs);
      return;
    }
    setFieldErrors({});
    setPending(true);

    try {
      if (isReg) {
        await register(v.name.trim(), v.email.trim(), v.pw, ROLE_MAP[v.regRole]);
      } else {
        await login(v.email.trim(), v.pw);
      }
      // session is now set; redirect
      // We need the new role — read from context happens async,
      // so re-read the stored value directly
      const stored = localStorage.getItem("insightnest.auth.v2");
      if (stored) {
        const parsed = JSON.parse(stored) as { user: { roles: string[] } };
        const roles = parsed.user?.roles ?? [];
        const role =
          roles.includes("ADMIN") ? "Admin" :
          roles.includes("UNIVERSITY_REP") ? "Rep" :
          roles.includes("FACULTY") ? "Faculty" :
          "Learner";
        window.location.hash = next ? `#${next}` : roleHome(role as "Learner" | "Faculty" | "Rep" | "Admin");
      } else {
        window.location.hash = next ? `#${next}` : "#/dashboard";
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          setFieldErrors(err.fieldErrors);
        } else {
          setGeneralError(err.message || "Something went wrong. Please try again.");
        }
      } else {
        setGeneralError("Network error. Please check your connection and try again.");
      }
    } finally {
      setPending(false);
    }
  };

  const fieldErr = (key: string) => fieldErrors[key] || fieldErrors[key.toLowerCase()];

  return (
    <main className="grid grid-cols-12 md:min-h-screen" style={{ background: "var(--paper)" }}>
      {/* LEFT — editorial plate */}
      <aside className="relative col-span-12 md:col-span-7 overflow-hidden" style={{ background: "var(--paper-deep)", minHeight: 280 }}>
        <div
          className="absolute inset-0 duotone"
          style={{ backgroundImage: `url(${PLATE})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        {/* gradient wash so text reads */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, color-mix(in srgb, var(--ink) 60%, transparent), color-mix(in srgb, var(--ink) 88%, transparent))"
        }} />

        {/* corner marks */}
        <div className="absolute top-6 left-6"><CornerMark /></div>
        <div className="absolute top-6 right-6"><CornerMark rotate={90} /></div>
        <div className="absolute bottom-6 left-6"><CornerMark rotate={-90} /></div>
        <div className="absolute bottom-6 right-6"><CornerMark rotate={180} /></div>

        <div className="relative h-full p-6 md:p-12 flex flex-col justify-between gap-8 md:gap-0" style={{ color: "var(--paper)", minHeight: 280 }}>
          <div className="flex items-center justify-between mono" style={{ color: "var(--gold-soft)", fontSize: 11 }}>
            <span>EST. MMXXVI · INSIGHTNEST</span>
            <span>VOLUME I · {isReg ? "II — JOIN" : "I — RETURN"}</span>
          </div>

          <div className="grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 md:col-span-8">
              <div className="mono mb-4" style={{ color: "var(--gold-soft)" }}>
                <span style={{ display: "inline-block", width: 32, height: 1, background: "var(--gold)", verticalAlign: "middle", marginRight: 12 }} />
                A QUIET ENTRANCE
              </div>
              <h1 className="serif" style={{ color: "var(--paper)", fontSize: "clamp(2.75rem, 6vw, 5.5rem)", fontWeight: 300, lineHeight: 0.95 }}>
                The reading<br/><em style={{ color: "var(--gold-soft)" }}>room</em> awaits.
              </h1>
              <blockquote className="serif mt-8 max-w-[42ch]" style={{ color: "color-mix(in srgb, var(--paper) 80%, transparent)", fontSize: "clamp(1.0625rem, 1.4vw, 1.25rem)", fontWeight: 300, lineHeight: 1.6, borderLeft: "2px solid var(--gold)", paddingLeft: 18 }}>
                "The university is, before anything else, a place to read carefully — and to be read carefully in return."
              </blockquote>
              <div className="mono mt-3 ml-[20px]" style={{ color: "var(--gold-soft)", fontSize: 10 }}>— EDITORIAL, VOL. I №1</div>
            </div>
            <div className="col-span-12 md:col-span-4 hidden md:flex justify-end">
              <Seal size={180} />
            </div>
          </div>

          <div className="mono flex items-center justify-between" style={{ color: "color-mix(in srgb, var(--paper) 50%, transparent)", fontSize: 10 }}>
            <span>PLATE 014 · INTERIOR, BODLEIAN LIBRARY</span>
            <span>FOLIO {isReg ? "002" : "001"} / IV</span>
          </div>
        </div>
      </aside>

      {/* RIGHT — form panel */}
      <section className="col-span-12 md:col-span-5 flex items-center justify-center p-4 sm:p-6 md:p-10 py-10">
        <div className="relative w-full max-w-md p-6 sm:p-8 md:p-10" style={{ background: "var(--paper-raised)", border: "1px solid var(--rule-strong)" }}>
          {/* SVG border that draws on mount */}
          <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%" preserveAspectRatio="none">
            <rect x="0.5" y="0.5" width="100%" height="100%" fill="none" stroke="var(--gold)" strokeWidth="1"
              style={{
                strokeDasharray: 4000, strokeDashoffset: 4000,
                animation: "drawArc 1.4s cubic-bezier(0.65,0,0.35,1) 0.3s forwards",
              }} />
          </svg>

          <div className="flex items-baseline justify-between">
            <div className="mono" style={{ color: "var(--gold)" }}>{isReg ? "02 — JOIN" : "01 — RETURN"}</div>
            <div className="mono" style={{ color: "var(--ink-faint)" }}>EST. MMXXVI</div>
          </div>
          <h2 className="serif mt-3" style={{ fontSize: "clamp(2rem, 3vw, 2.5rem)", fontWeight: 300 }}>
            {isReg ? "Open an account." : "Welcome back."}
          </h2>
          <p className="mt-2" style={{ color: "var(--ink-soft)" }}>
            {isReg ? "A name, an address, a password." : "Sign in to continue your atlas."}
          </p>

          {/* General error */}
          {generalError && (
            <div className="mt-4 mono" style={{ color: "var(--oxblood)", fontSize: 11 }}>
              {generalError}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            {isReg && (
              <>
                <div>
                  <div className={"field-underline " + (v.name ? "has-value" : "")}>
                    <label>Name</label>
                    <input
                      value={v.name}
                      onChange={(e) => { setV({ ...v, name: e.target.value }); setFieldErrors(prev => { const n = { ...prev }; delete n.fullName; return n; }); }}
                      autoComplete="name"
                    />
                  </div>
                  {fieldErr("fullName") && (
                    <div className="mono mt-1" style={{ color: "var(--oxblood)", fontSize: 10 }}>{fieldErr("fullName")}</div>
                  )}
                </div>

                <div>
                  <div className="mono mb-3" style={{ color: "var(--ink-faint)", fontSize: 10 }}>I AM JOINING AS</div>
                  <div className="grid grid-cols-3 gap-px" style={{ background: "var(--rule)" }}>
                    {(["Learner", "Faculty", "Rep"] as RegRole[]).map(r => (
                      <button type="button" key={r} onClick={() => setV({ ...v, regRole: r })}
                        className="py-3 mono"
                        style={{
                          background: v.regRole === r ? "var(--ink)" : "var(--paper-raised)",
                          color: v.regRole === r ? "var(--paper)" : "var(--ink-soft)",
                          fontSize: 10,
                        }}>{r}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <div className={"field-underline " + (v.email ? "has-value" : "")}>
                <label>Email</label>
                <input
                  type="email"
                  value={v.email}
                  onChange={(e) => { setV({ ...v, email: e.target.value }); setFieldErrors(prev => { const n = { ...prev }; delete n.email; return n; }); }}
                  autoComplete="email"
                />
              </div>
              {fieldErr("email") && (
                <div className="mono mt-1" style={{ color: "var(--oxblood)", fontSize: 10 }}>{fieldErr("email")}</div>
              )}
            </div>

            <div>
              <div className={"field-underline " + (v.pw ? "has-value" : "")}>
                <label>Password</label>
                <input
                  type="password"
                  value={v.pw}
                  onChange={(e) => { setV({ ...v, pw: e.target.value }); setFieldErrors(prev => { const n = { ...prev }; delete n.password; return n; }); }}
                  autoComplete={isReg ? "new-password" : "current-password"}
                />
              </div>
              {fieldErr("password") && (
                <div className="mono mt-1" style={{ color: "var(--oxblood)", fontSize: 10 }}>{fieldErr("password")}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn-ink w-full justify-center"
              disabled={pending}
              style={{ opacity: pending ? 0.65 : 1 }}
            >
              <span>{pending ? (isReg ? "Creating…" : "Signing in…") : (isReg ? "Create account" : "Sign in")}</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[var(--rule)] mono flex items-center justify-between" style={{ fontSize: 11 }}>
            <span style={{ color: "var(--ink-faint)" }}>{isReg ? "Already registered?" : "New here?"}</span>
            <a href={isReg ? "#/login" : "#/register"} style={{ color: "var(--gold)" }}>
              {isReg ? "Sign in →" : "Open an account →"}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
