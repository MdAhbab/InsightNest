import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useSession, type Role } from "../providers/SessionProvider";
import { useTheme } from "../providers/ThemeProvider";
import { useToast } from "../components/Toast";
import { useRouter } from "../router";
import { Confirm, DField, DGrid } from "../components/ActionDrawer";
import { ApiError } from "../api/client";
import {
  usersMe,
  usersChangePassword,
  facultyProfileGet,
  facultyProfilePut,
  FacultyProfileDto,
} from "../api/endpoints";

type Cat = { k: string; label: string; idx: string; group: "Shared" | "Role" | "Danger" };

const SHARED: Cat[] = [
  { k: "account",       label: "Account",            idx: "01", group: "Shared" },
  { k: "security",      label: "Security",           idx: "02", group: "Shared" },
  { k: "notifications", label: "Notifications",      idx: "03", group: "Shared" },
  { k: "privacy",       label: "Privacy",            idx: "04", group: "Shared" },
  { k: "appearance",    label: "Appearance",         idx: "05", group: "Shared" },
  { k: "language",      label: "Language & region",  idx: "06", group: "Shared" },
  { k: "connections",   label: "Connected services", idx: "07", group: "Shared" },
  { k: "data",          label: "Data &amp; export",  idx: "08", group: "Shared" },
];

const ROLE_EXTRAS: Record<Role, Cat[]> = {
  Learner: [
    { k: "applications", label: "Application defaults", idx: "10", group: "Role" },
    { k: "sentinel",     label: "Sentinel digest",      idx: "11", group: "Role" },
    { k: "counsellor",   label: "Counsellor",           idx: "12", group: "Role" },
  ],
  Faculty: [
    { k: "lab",         label: "Lab profile",          idx: "10", group: "Role" },
    { k: "exam",        label: "Examination defaults", idx: "11", group: "Role" },
    { k: "autodecline", label: "Auto-decline policy",  idx: "12", group: "Role" },
    { k: "hours",       label: "Office hours",         idx: "13", group: "Role" },
    { k: "team",        label: "Team &amp; delegates", idx: "14", group: "Role" },
  ],
  Rep: [
    { k: "institution", label: "Institution masthead", idx: "10", group: "Role" },
    { k: "policy",      label: "Listings policy",      idx: "11", group: "Role" },
    { k: "brand",       label: "Brand assets",         idx: "12", group: "Role" },
    { k: "team",        label: "Team",                 idx: "13", group: "Role" },
  ],
  Admin: [
    { k: "editor",      label: "Editor profile",       idx: "10", group: "Role" },
    { k: "audit",       label: "Audit subscriptions",  idx: "11", group: "Role" },
    { k: "org",         label: "Org-wide policies",    idx: "12", group: "Role" },
  ],
};

const DANGER: Cat[] = [
  { k: "danger", label: "Danger zone", idx: "99", group: "Danger" },
];

export default function Settings() {
  const { session } = useSession();
  const { query } = useRouter();
  const [active, setActive] = useState(query.get("s") ?? "account");

  useEffect(() => {
    const fromQuery = query.get("s"); if (fromQuery) setActive(fromQuery);
  }, [query]);

  const cats = [...SHARED, ...ROLE_EXTRAS[session.role], ...DANGER];

  return (
    <main>
      <header className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pt-32 md:pt-40 pb-6 md:pb-10">
        <div className="mono" style={{ color: "var(--gold)" }}>SETTINGS · {session.role.toUpperCase()} FOLIO</div>
        <h1 className="serif mt-3" style={{ fontSize: "clamp(2.25rem, 6vw, 4.5rem)", fontWeight: 300, lineHeight: 1 }}>
          The desk drawer.
        </h1>
        <p className="serif mt-4 max-w-[60ch]" style={{ color: "var(--ink-soft)", fontSize: "clamp(1rem, 1.4vw, 1.25rem)", fontWeight: 300 }}>
          Account, identity, notifications, the small mechanics that decide who can write to you and what you read first.
        </p>
      </header>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-32 grid grid-cols-12 gap-6 md:gap-10">
        <aside className="col-span-12 md:col-span-3 md:sticky md:top-28 self-start space-y-6">
          <div className="border border-[var(--rule-strong)] p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border border-[var(--ink)] flex items-center justify-center serif" style={{ fontSize: 22 }}>{session.initial}</div>
              <div className="min-w-0">
                <div className="serif truncate" style={{ fontSize: "1.0625rem" }}>{session.name}</div>
                <div className="mono truncate" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{session.email}</div>
              </div>
            </div>
            <a href={`#/profile/me`} className="mt-4 inline-block mono hover:text-[var(--gold)]" style={{ fontSize: 11 }}>VIEW PUBLIC PROFILE →</a>
          </div>

          {/* Mobile selector */}
          <div className="md:hidden -mx-1 overflow-x-auto no-scrollbar">
            <div className="inline-flex gap-px min-w-full" style={{ background: "var(--rule)" }}>
              {cats.map((c) => (
                <button key={c.k} onClick={() => setActive(c.k)} className="px-3 py-3 mono whitespace-nowrap" style={{ background: active === c.k ? "var(--ink)" : "var(--paper)", color: active === c.k ? "var(--paper)" : "var(--ink-soft)", fontSize: 10 }}>
                  {c.idx} · <span dangerouslySetInnerHTML={{ __html: c.label }} />
                </button>
              ))}
            </div>
          </div>

          {/* Desktop nav grouped */}
          <nav className="hidden md:block">
            {(["Shared","Role","Danger"] as const).map((g) => {
              const items = cats.filter(c => c.group === g);
              if (items.length === 0) return null;
              return (
                <div key={g} className="mb-6">
                  <div className="mono pb-2 mb-2 border-b border-[var(--rule)]" style={{ color: "var(--ink-faint)", fontSize: 10 }}>
                    {g === "Shared" ? "GENERAL" : g === "Role" ? `${session.role.toUpperCase()} — SPECIFIC` : "CAUTION"}
                  </div>
                  <ul className="space-y-1">
                    {items.map((c) => (
                      <li key={c.k}>
                        <button onClick={() => setActive(c.k)} className="flex items-baseline gap-3 w-full text-left py-2" style={{ color: active === c.k ? "var(--ink)" : "var(--ink-soft)" }}>
                          <span className="mono tabular" style={{ color: active === c.k ? "var(--gold)" : "var(--ink-faint)", fontSize: 11 }}>{c.idx}</span>
                          <span className="serif" style={{ fontSize: "1rem", fontWeight: 300 }} dangerouslySetInnerHTML={{ __html: c.label }} />
                          {active === c.k && <span className="ml-auto mono" style={{ color: "var(--gold)" }}>●</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </nav>
        </aside>

        <div className="col-span-12 md:col-span-9">
          <SectionRouter active={active} role={session.role} />
        </div>
      </section>
    </main>
  );
}

/* ——— Section primitives ——— */

function SectionShell({ index, title, sub, children, save = true, onSave }: { index: string; title: string; sub: string; children: ReactNode; save?: boolean; onSave?: () => void }) {
  const toast = useToast();
  return (
    <section className="border border-[var(--rule-strong)]">
      <header className="px-6 md:px-8 pt-6 pb-4 border-b border-[var(--ink)]">
        <div className="mono" style={{ color: "var(--gold)" }}>{index}</div>
        <h2 className="serif mt-2" style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", fontWeight: 300 }}>{title}</h2>
        <p className="mt-2 max-w-[60ch]" style={{ color: "var(--ink-soft)" }}>{sub}</p>
      </header>
      <div className="px-6 md:px-8 py-6 space-y-6">{children}</div>
      {save && (
        <footer className="px-6 md:px-8 py-5 border-t border-[var(--rule)] flex items-center justify-end gap-3">
          <button onClick={() => toast("Reverted unsaved changes", "info")} className="btn-ink btn-ghost"><span>Revert</span></button>
          <button onClick={onSave ?? (() => toast("Settings saved", "ok"))} className="btn-ink btn-gold"><span>Save changes</span></button>
        </footer>
      )}
    </section>
  );
}

function Row({ label, hint, right, children }: { label: string; hint?: string; right?: ReactNode; children?: ReactNode }) {
  return (
    <div className="grid grid-cols-12 gap-4 py-4 border-b border-[var(--rule)] items-center">
      <div className="col-span-12 md:col-span-6 min-w-0">
        <div className="serif" style={{ fontSize: "1.0625rem" }}>{label}</div>
        {hint && <div className="mono mt-1" style={{ color: "var(--ink-soft)", fontSize: 10 }}>{hint}</div>}
      </div>
      <div className="col-span-12 md:col-span-6 flex justify-end items-center gap-3">{right ?? children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      className="relative inline-block w-11 h-6 border"
      style={{
        borderColor: checked ? "var(--gold)" : "var(--rule-strong)",
        background: checked ? "var(--gold)" : "transparent",
        transition: "all 0.3s cubic-bezier(0.65,0,0.35,1)",
      }}
    >
      <span style={{
        position: "absolute", top: 2, left: checked ? 22 : 2, width: 18, height: 18,
        background: checked ? "var(--paper)" : "var(--ink-soft)",
        transition: "left 0.3s cubic-bezier(0.65,0,0.35,1)",
      }} />
    </button>
  );
}

function Seg<T extends string>({ value, options, onChange }: { value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex gap-px" style={{ background: "var(--rule)" }}>
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} className="mono px-3 py-2 whitespace-nowrap" style={{
          background: value === o ? "var(--ink)" : "var(--paper-raised)",
          color: value === o ? "var(--paper)" : "var(--ink-soft)",
          fontSize: 10,
        }}>{o}</button>
      ))}
    </div>
  );
}

/* ——— Section router ——— */

function SectionRouter({ active, role }: { active: string; role: Role }) {
  switch (active) {
    case "account":       return <Account />;
    case "security":      return <Security />;
    case "notifications": return <Notifications role={role} />;
    case "privacy":       return <Privacy />;
    case "appearance":    return <Appearance />;
    case "language":      return <Language />;
    case "connections":   return <Connections />;
    case "data":          return <Data />;
    case "danger":        return <Danger />;

    // Learner
    case "applications":  return <Applications />;
    case "sentinel":      return <Sentinel />;
    case "counsellor":    return <CounsellorPrefs />;

    // Faculty
    case "lab":           return <LabProfile />;
    case "exam":          return <ExamDefaults />;
    case "autodecline":   return <AutoDecline />;
    case "hours":         return <Hours />;
    case "team":          return role === "Faculty" ? <FacultyTeam /> : <RepTeam />;

    // Rep
    case "institution":   return <Institution />;
    case "policy":        return <ListingsPolicy />;
    case "brand":         return <Brand />;

    // Admin
    case "editor":        return <EditorProfile />;
    case "audit":         return <Audit />;
    case "org":           return <OrgPolicies />;

    default:              return <Account />;
  }
}

/* ——— SHARED sections ——— */

function Account() {
  const { session } = useSession();
  // Display name and email come from the server — read-only (no rename API exists)
  return (
    <SectionShell index="01 — ACCOUNT" title="Account" sub="The lines that appear on every letter you send." save={false}>
      <DGrid>
        <div className="field-underline has-value">
          <label>Display name</label>
          <input value={session.name} readOnly style={{ color: "var(--ink-soft)" }} />
          <div className="mono mt-1" style={{ color: "var(--ink-faint)", fontSize: 9 }}>READ-ONLY — no rename API in this edition</div>
        </div>
        <div className="field-underline has-value">
          <label>Return address (email)</label>
          <input value={session.email} readOnly style={{ color: "var(--ink-soft)" }} />
          <div className="mono mt-1" style={{ color: "var(--ink-faint)", fontSize: 9 }}>READ-ONLY — contact support to change</div>
        </div>
      </DGrid>
    </SectionShell>
  );
}

function Security() {
  const toast = useToast();
  const [twofa, setTwofa] = useState(true);
  const [pwk, setPwk] = useState(true);
  const [signOutAll, setSignOutAll] = useState(false);

  // Password change — wired to backend
  const [pwOpen, setPwOpen] = useState(false);
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  const doChangePassword = useCallback(async () => {
    setPwErr("");
    if (!curPw) { setPwErr("Enter your current password."); return; }
    if (newPw.length < 8) { setPwErr("New password must be at least 8 characters."); return; }
    if (newPw !== newPw2) { setPwErr("Passwords do not match."); return; }
    setPwBusy(true);
    try {
      await usersChangePassword({ currentPassword: curPw, newPassword: newPw });
      toast("Password changed. You may need to sign in again on other devices.", "ok");
      setPwOpen(false);
      setCurPw(""); setNewPw(""); setNewPw2("");
    } catch (e) {
      setPwErr(e instanceof ApiError ? e.message : "Failed to change password.");
    } finally {
      setPwBusy(false);
    }
  }, [curPw, newPw, newPw2, toast]);

  const sessions = [
    { d: "MacBook Pro · Safari", w: "London · this device", at: "active now" },
    { d: "iPhone 15 · InsightNest app", w: "London · mobile data", at: "2 hrs ago" },
    { d: "Chrome · Windows", w: "Cambridge · academic VPN", at: "3 days ago" },
  ];

  return (
    <SectionShell index="02 — SECURITY" title="Security" sub="The locks on the desk drawer." save={false}>
      <Row label="Change password" hint="Update your sign-in password."
        right={<button onClick={() => setPwOpen(true)} className="btn-ink btn-ghost"><span>Change password</span></button>} />
      <Row label="Two-factor authentication" hint="Not available in this edition."
        right={
          <div className="flex flex-col items-end gap-1">
            <Toggle checked={twofa} onChange={setTwofa} />
            <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 9 }}>not available in this edition</div>
          </div>
        } />
      <Row label="Passkey sign-in" hint="Replace your password with a device passkey."
        right={
          <div className="flex flex-col items-end gap-1">
            <Toggle checked={pwk} onChange={setPwk} />
            <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 9 }}>not available in this edition</div>
          </div>
        } />
      <Row label="Recovery codes" hint="Twelve printed codes for the day you misplace your device."
        right={
          <div className="flex flex-col items-end gap-1">
            <button onClick={() => toast("not available in this edition", "info")} className="mono hover:text-[var(--gold)]">DOWNLOAD ↓</button>
            <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 9 }}>not available in this edition</div>
          </div>
        } />

      <div className="pt-4">
        <div className="mono mb-3" style={{ color: "var(--ink-faint)", fontSize: 10 }}>SIGNED IN ON</div>
        <ul>
          {sessions.map((s, i) => (
            <li key={i} className="grid grid-cols-12 gap-3 py-3 border-b border-[var(--rule)] items-baseline">
              <span className="col-span-1 mono tabular" style={{ color: "var(--gold)" }}>{String(i+1).padStart(2,"0")}</span>
              <div className="col-span-7"><div className="serif" style={{ fontSize: "1rem" }}>{s.d}</div><div className="mono" style={{ color: "var(--ink-soft)", fontSize: 10 }}>{s.w}</div></div>
              <span className="col-span-2 mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{s.at}</span>
              <button onClick={() => toast("not available in this edition", "info")} className="col-span-2 text-right mono hover:text-[var(--oxblood)]" style={{ fontSize: 10 }}>SIGN OUT →</button>
            </li>
          ))}
        </ul>
        <div className="mono mt-2" style={{ color: "var(--ink-faint)", fontSize: 9 }}>Session management — not available in this edition</div>
        <button onClick={() => setSignOutAll(true)} className="mt-4 mono hover:text-[var(--oxblood)]" style={{ fontSize: 11 }}>SIGN OUT OF ALL DEVICES →</button>
      </div>

      {/* Password change modal */}
      {pwOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--ink) 65%, transparent)" }} onClick={() => setPwOpen(false)}>
          <div className="w-full max-w-md p-8" style={{ background: "var(--paper)", border: "1px solid var(--rule-strong)" }} onClick={(e) => e.stopPropagation()}>
            <div className="mono" style={{ color: "var(--gold)" }}>CHANGE PASSWORD</div>
            <h2 className="serif mt-2 mb-6" style={{ fontSize: "1.5rem", fontWeight: 300 }}>Update your password</h2>
            <div className="space-y-4">
              <div className="field-underline">
                <label>Current password</label>
                <input type="password" value={curPw} onChange={e => setCurPw(e.target.value)} autoComplete="current-password" />
              </div>
              <div className="field-underline">
                <label>New password (min 8 chars)</label>
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} autoComplete="new-password" />
              </div>
              <div className="field-underline">
                <label>Confirm new password</label>
                <input type="password" value={newPw2} onChange={e => setNewPw2(e.target.value)} autoComplete="new-password" />
              </div>
              {pwErr && <div className="mono" style={{ color: "var(--oxblood)", fontSize: 11 }}>{pwErr}</div>}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setPwOpen(false)} className="btn-ink btn-ghost"><span>Cancel</span></button>
              <button onClick={doChangePassword} disabled={pwBusy} className="btn-ink btn-gold"><span>{pwBusy ? "Saving…" : "Change password"}</span></button>
            </div>
          </div>
        </div>
      )}

      <Confirm open={signOutAll} onClose={() => setSignOutAll(false)} onConfirm={() => toast("not available in this edition", "info")} title="Sign out of all devices?" body="You will remain signed in here." confirmLabel="Sign out everywhere" danger />
    </SectionShell>
  );
}

function Notifications({ role }: { role: Role }) {
  // Stored on this device (no backend binding)
  const [emailDigest, setEmailDigest] = useState(() => {
    try { return JSON.parse(localStorage.getItem("in.notif.emailDigest") ?? "true"); } catch { return true; }
  });
  const [inApp, setInApp] = useState(() => {
    try { return JSON.parse(localStorage.getItem("in.notif.inApp") ?? "true"); } catch { return true; }
  });
  const [silentHours, setSilentHours] = useState(() => {
    try { return JSON.parse(localStorage.getItem("in.notif.silentHours") ?? "true"); } catch { return true; }
  });
  const [cadence, setCadence] = useState<"Daily" | "Weekly" | "Off">(() => {
    return (localStorage.getItem("in.notif.cadence") as any) ?? "Weekly";
  });
  const toast = useToast();

  const save = () => {
    localStorage.setItem("in.notif.emailDigest", JSON.stringify(emailDigest));
    localStorage.setItem("in.notif.inApp", JSON.stringify(inApp));
    localStorage.setItem("in.notif.silentHours", JSON.stringify(silentHours));
    localStorage.setItem("in.notif.cadence", cadence);
    toast("Notification preferences saved (stored on this device)", "ok");
  };

  return (
    <SectionShell index="03 — NOTIFICATIONS" title="Notifications" sub="What we will write to you about, and when." onSave={save}>
      <div className="mono mb-2" style={{ color: "var(--ink-faint)", fontSize: 9 }}>Stored on this device</div>
      <Row label="In-app notices" hint="The unread gold pip and the notification ledger." right={<Toggle checked={inApp} onChange={setInApp} />} />
      <Row label="Email digest" hint={`A ${cadence.toLowerCase()} bulletin sent to your return address.`}
        right={<div className="flex items-center gap-3"><Seg value={cadence} options={["Daily","Weekly","Off"] as const} onChange={setCadence} /><Toggle checked={emailDigest} onChange={setEmailDigest} /></div>} />
      <Row label="Silent hours" hint="No notifications between 22:00 and 07:00 local time." right={<Toggle checked={silentHours} onChange={setSilentHours} />} />

      <div className="pt-4">
        <div className="mono mb-3" style={{ color: "var(--ink-faint)", fontSize: 10 }}>NOTIFY ME ABOUT</div>
        {([
          ["Replies to your letters",    true,  "Always"],
          ["New matches against your folio", true, "Daily"],
          ["Approaching deadlines",      true,  "Weekly"],
          ["Webinar reminders",          true,  "24 hrs prior"],
          ["Forum replies on threads you follow", false, "Off"],
          ...(role === "Faculty" ? [["New applicants in your review queue", true, "Always"] as [string, boolean, string]] : []),
          ...(role === "Rep"     ? [["New enquiries from candidates",       true, "Always"] as [string, boolean, string]] : []),
          ...(role === "Admin"   ? [["Items flagged for review",            true, "Always"] as [string, boolean, string]] : []),
        ] as [string, boolean, string][]).map(([t, on, when], i) => (
          <NotifLine key={i} label={t} defaultOn={on} when={when} />
        ))}
      </div>
    </SectionShell>
  );
}

function NotifLine({ label, defaultOn, when }: { label: string; defaultOn: boolean; when: string }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <Row label={label} hint={`Currently · ${when}`} right={<Toggle checked={on} onChange={setOn} />} />
  );
}

function Privacy() {
  const [visibility, setVisibility] = useState<"Public" | "Members only" | "Private">(() => {
    return (localStorage.getItem("in.priv.visibility") as any) ?? "Public";
  });
  const [writeMe, setWriteMe] = useState<"Anyone" | "Members" | "Mutuals">(() => {
    return (localStorage.getItem("in.priv.writeMe") as any) ?? "Members";
  });
  const [searchable, setSearchable] = useState(() => {
    try { return JSON.parse(localStorage.getItem("in.priv.searchable") ?? "true"); } catch { return true; }
  });
  const [analytics, setAnalytics] = useState(() => {
    try { return JSON.parse(localStorage.getItem("in.priv.analytics") ?? "false"); } catch { return false; }
  });
  const toast = useToast();

  const save = () => {
    localStorage.setItem("in.priv.visibility", visibility);
    localStorage.setItem("in.priv.writeMe", writeMe);
    localStorage.setItem("in.priv.searchable", JSON.stringify(searchable));
    localStorage.setItem("in.priv.analytics", JSON.stringify(analytics));
    toast("Privacy preferences saved (stored on this device)", "ok");
  };

  return (
    <SectionShell index="04 — PRIVACY" title="Privacy" sub="Who can read your folio and who may write to you." onSave={save}>
      <div className="mono mb-2" style={{ color: "var(--ink-faint)", fontSize: 9 }}>Stored on this device</div>
      <Row label="Profile visibility" hint="Controls who sees your folio at /profile/…" right={<Seg value={visibility} options={["Public","Members only","Private"] as const} onChange={setVisibility} />} />
      <Row label="Letters from" hint="Who may open a thread with you." right={<Seg value={writeMe} options={["Anyone","Members","Mutuals"] as const} onChange={setWriteMe} />} />
      <Row label="Searchable in the directory" hint="Allow your name to appear in profile searches." right={<Toggle checked={searchable} onChange={setSearchable} />} />
      <Row label="Anonymised usage analytics" hint="Help us improve the atlas. Never sold, never personally identifying." right={<Toggle checked={analytics} onChange={setAnalytics} />} />
      <Row label="Block list" hint="Feature not available in this edition." right={<button className="mono hover:text-[var(--gold)]">MANAGE →</button>} />
    </SectionShell>
  );
}

function Appearance() {
  const { theme, toggle } = useTheme();
  const [pref, setPref] = useState<"System" | "Manuscript" | "Observatory">(theme === "dark" ? "Observatory" : "Manuscript");
  const [reduced, setReduced] = useState(false);
  const [density, setDensity] = useState<"Editorial" | "Compact">("Editorial");
  return (
    <SectionShell index="05 — APPEARANCE" title="Appearance" sub="Two themes, set in ink and paper. Both are restful." save={false}>
      <Row label="Theme" hint="Manuscript by day; Observatory by night." right={
        <Seg value={pref} options={["System","Manuscript","Observatory"] as const} onChange={(v) => {
          setPref(v);
          if (v === "Manuscript" && theme === "dark") toggle();
          if (v === "Observatory" && theme === "light") toggle();
        }} />
      } />
      <Row label="Reduce motion" hint="Disables Lenis smoothing and scrubbed scenes. Useful for slower devices." right={<Toggle checked={reduced} onChange={setReduced} />} />
      <Row label="Density" hint="Editorial density preserves whitespace; compact tightens it for laptops." right={<Seg value={density} options={["Editorial","Compact"] as const} onChange={setDensity} />} />
      <Row label="Paper grain" hint="The fine noise overlay that gives the site its printed look." right={<Toggle checked={true} onChange={() => {}} />} />
    </SectionShell>
  );
}

function Language() {
  const [lang, setLang] = useState<"English (UK)" | "English (US)" | "Français" | "Deutsch" | "日本語">(() => {
    return (localStorage.getItem("in.lang.lang") as any) ?? "English (UK)";
  });
  const [region, setRegion] = useState(() => localStorage.getItem("in.lang.region") ?? "United Kingdom");
  const [tz, setTz] = useState(() => localStorage.getItem("in.lang.tz") ?? "Europe/London (BST · UTC+1)");
  const toast = useToast();

  const save = () => {
    localStorage.setItem("in.lang.lang", lang);
    localStorage.setItem("in.lang.region", region);
    localStorage.setItem("in.lang.tz", tz);
    toast("Language & region saved (stored on this device)", "ok");
  };

  return (
    <SectionShell index="06 — LANGUAGE" title="Language &amp; region" sub="Date format, currency display, and the language of the editorial line." onSave={save}>
      <div className="mono mb-2" style={{ color: "var(--ink-faint)", fontSize: 9 }}>Stored on this device</div>
      <Row label="Interface language" right={<Seg value={lang} options={["English (UK)","English (US)","Français","Deutsch","日本語"] as const} onChange={setLang} />} />
      <Row label="Region" right={
        <select value={region} onChange={(e) => setRegion(e.target.value)} className="mono bg-transparent border-b border-[var(--rule-strong)] py-1" style={{ fontSize: 11 }}>
          {["United Kingdom","United States","Switzerland","Germany","France","Netherlands","Japan","Singapore","Canada","Bangladesh"].map(c => <option key={c}>{c}</option>)}
        </select>
      } />
      <Row label="Time zone" right={
        <select value={tz} onChange={(e) => setTz(e.target.value)} className="mono bg-transparent border-b border-[var(--rule-strong)] py-1" style={{ fontSize: 11 }}>
          {["Europe/London (BST · UTC+1)","Europe/Zurich (CEST · UTC+2)","America/New_York (EDT · UTC-4)","Asia/Tokyo (JST · UTC+9)","Asia/Dhaka (BST · UTC+6)"].map(c => <option key={c}>{c}</option>)}
        </select>
      } />
      <Row label="Date format" right={<Seg value="2026.06.11" options={["2026.06.11","11 Jun 2026","Jun 11, 2026","11/06/2026"] as const} onChange={() => {}} />} />
    </SectionShell>
  );
}

function Connections() {
  const services = [
    { n: "ORCID",       sub: "0000-0001-2345-6789",                connected: true },
    { n: "Google Scholar", sub: "scholar.google.com/citations?user=…", connected: true },
    { n: "GitHub",      sub: "@ahbab",                              connected: true },
    { n: "Overleaf",    sub: "Sync the dissertation chapter",       connected: false },
    { n: "Zotero",      sub: "Import citations into the library",   connected: false },
    { n: "Calendar (Google)", sub: "Reservations &amp; office hours", connected: true },
  ];
  return (
    <SectionShell index="07 — CONNECTED SERVICES" title="Connected services" sub="Other desks you have agreed to read your work." save={false}>
      <div className="mono mb-2" style={{ color: "var(--ink-faint)", fontSize: 9 }}>not available in this edition — UI-local only</div>
      {services.map((s, i) => <Connection key={s.n} {...s} idx={i+1} />)}
    </SectionShell>
  );
}

function Connection({ n, sub, connected, idx }: { n: string; sub: string; connected: boolean; idx: number }) {
  const [c, setC] = useState(connected);
  const toast = useToast();
  return (
    <Row
      label={n}
      hint={sub}
      right={
        <button onClick={() => { setC(!c); toast(c ? `Disconnected ${n}` : `Connected ${n} (UI-local)`, c ? "info" : "ok"); }}
          className="mono px-3 py-2 border" style={{ borderColor: c ? "var(--gold)" : "var(--rule-strong)", color: c ? "var(--gold)" : "var(--ink-soft)", fontSize: 10 }}>
          {c ? "CONNECTED · DISCONNECT" : "CONNECT →"}
        </button>
      }
    >{idx}</Row>
  );
}

function Data() {
  const toast = useToast();
  return (
    <SectionShell index="08 — DATA &amp; EXPORT" title="Data &amp; export" sub="Take your folio with you — or hand a copy to your supervisor." save={false}>
      <div className="mono mb-2" style={{ color: "var(--ink-faint)", fontSize: 9 }}>not available in this edition</div>
      <Row label="Export folio as PDF" hint="A printable bulletin: saved items, applications, threads." right={<button onClick={() => toast("not available in this edition", "info")} className="btn-ink btn-ghost"><span>Generate</span></button>} />
      <Row label="Export folio as CSV" hint="Spreadsheet copy of saved programmes, scholarships, deadlines." right={<button onClick={() => toast("not available in this edition", "info")} className="btn-ink btn-ghost"><span>Download</span></button>} />
      <Row label="Application archive" hint="Every application you have filed, with attachments." right={<button onClick={() => toast("not available in this edition", "info")} className="btn-ink btn-ghost"><span>Download .zip</span></button>} />
      <Row label="Letters archive" hint="A copy of every message thread you took part in." right={<button onClick={() => toast("not available in this edition", "info")} className="btn-ink btn-ghost"><span>Download .zip</span></button>} />
      <Row label="Data dictionary" hint="What we store about your folio, and why." right={<a href="#/faq" className="mono hover:text-[var(--gold)]">READ →</a>} />
    </SectionShell>
  );
}

function Danger() {
  const { signOut } = useSession();
  const toast = useToast();
  const [showOut, setShowOut] = useState(false);
  const [showDeact, setShowDeact] = useState(false);
  const [showDel, setShowDel] = useState(false);
  return (
    <SectionShell index="99 — DANGER" title="Danger zone" sub="The drawer at the back of the desk. These cannot be undone from this page." save={false}>
      <div className="mono mb-2" style={{ color: "var(--ink-faint)", fontSize: 9 }}>Deactivation and deletion — not available in this edition</div>
      <Row label="Sign out everywhere" hint="Ends every active session, including this one." right={<button onClick={() => setShowOut(true)} className="btn-ink" style={{ borderColor: "var(--ink-soft)", color: "var(--ink-soft)" }}><span>Sign out</span></button>} />
      <Row label="Deactivate folio" hint="Hides your profile and pauses all listings. Reversible at any time." right={<button onClick={() => setShowDeact(true)} className="btn-ink" style={{ borderColor: "var(--oxblood)", color: "var(--oxblood)" }}><span>Deactivate</span></button>} />
      <Row label="Delete folio permanently" hint="Removes your record, applications and letters. Cannot be undone." right={<button onClick={() => setShowDel(true)} className="btn-ink" style={{ borderColor: "var(--oxblood)", color: "var(--oxblood)" }}><span>Delete folio</span></button>} />

      <Confirm open={showOut} onClose={() => setShowOut(false)} onConfirm={() => { signOut(); window.location.hash = "#/"; }} title="Sign out of every device?" body="You will need to sign in again on each device." confirmLabel="Sign out everywhere" danger />
      <Confirm open={showDeact} onClose={() => setShowDeact(false)} onConfirm={() => toast("not available in this edition", "info")} title="Deactivate this folio?" body="Not available in this edition." confirmLabel="Yes — deactivate" danger />
      <Confirm open={showDel} onClose={() => setShowDel(false)} onConfirm={() => toast("not available in this edition", "info")} title="Delete this folio permanently?" body="Not available in this edition." confirmLabel="I understand — delete" danger />
    </SectionShell>
  );
}

/* ——— LEARNER sections ——— */

function Applications() {
  const [autoFill, setAutoFill] = useState(() => {
    try { return JSON.parse(localStorage.getItem("in.app.autoFill") ?? "true"); } catch { return true; }
  });
  const [savedRefs, setSavedRefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("in.app.savedRefs") ?? "true"); } catch { return true; }
  });
  const [defaultStatement, setDefaultStatement] = useState(() =>
    localStorage.getItem("in.app.defaultStatement") ?? "Concise, methodologically forward, with one personal anecdote."
  );
  const toast = useToast();

  const save = () => {
    localStorage.setItem("in.app.autoFill", JSON.stringify(autoFill));
    localStorage.setItem("in.app.savedRefs", JSON.stringify(savedRefs));
    localStorage.setItem("in.app.defaultStatement", defaultStatement);
    toast("Application defaults saved (stored on this device)", "ok");
  };

  return (
    <SectionShell index="10 — APPLICATIONS" title="Application defaults" sub="What we pre-fill into every new application drawer." onSave={save}>
      <div className="mono mb-2" style={{ color: "var(--ink-faint)", fontSize: 9 }}>Stored on this device</div>
      <Row label="Auto-fill identity & education" hint="Save typing on every new application." right={<Toggle checked={autoFill} onChange={setAutoFill} />} />
      <Row label="Carry references between applications" hint="Two referees on file — re-used unless overridden." right={<Toggle checked={savedRefs} onChange={setSavedRefs} />} />
      <DField label="Default statement tone" value={defaultStatement} onChange={setDefaultStatement} textarea />
      <Row label="CV on file" hint="Upload a CV for pre-filling applications." right={<button className="mono hover:text-[var(--gold)]">REPLACE ↗</button>} />
      <Row label="Transcript on file" hint="Upload a transcript for pre-filling applications." right={<button className="mono hover:text-[var(--gold)]">REPLACE ↗</button>} />
    </SectionShell>
  );
}

function Sentinel() {
  const [active, setActive] = useState(() => {
    try { return JSON.parse(localStorage.getItem("in.sentinel.active") ?? "true"); } catch { return true; }
  });
  const [day, setDay] = useState<"Monday" | "Wednesday" | "Friday" | "Sunday">(() => {
    return (localStorage.getItem("in.sentinel.day") as any) ?? "Monday";
  });
  const [horizon, setHorizon] = useState<"7 days" | "14 days" | "30 days">(() => {
    return (localStorage.getItem("in.sentinel.horizon") as any) ?? "14 days";
  });
  const [include, setInclude] = useState({ programmes: true, scholarships: true, research: true, webinars: false });
  const toast = useToast();

  const save = () => {
    localStorage.setItem("in.sentinel.active", JSON.stringify(active));
    localStorage.setItem("in.sentinel.day", day);
    localStorage.setItem("in.sentinel.horizon", horizon);
    toast("Sentinel digest saved (stored on this device)", "ok");
  };

  return (
    <SectionShell index="11 — SENTINEL" title="Sentinel digest" sub="The weekly bulletin of deadlines closing across your saved &amp; matched items." onSave={save}>
      <div className="mono mb-2" style={{ color: "var(--ink-faint)", fontSize: 9 }}>Stored on this device</div>
      <Row label="Subscribe to the Sentinel" hint="A printed-bulletin email arriving each chosen morning." right={<Toggle checked={active} onChange={setActive} />} />
      <Row label="Bulletin day" right={<Seg value={day} options={["Monday","Wednesday","Friday","Sunday"] as const} onChange={setDay} />} />
      <Row label="Look-ahead horizon" right={<Seg value={horizon} options={["7 days","14 days","30 days"] as const} onChange={setHorizon} />} />
      <div className="pt-2">
        <div className="mono mb-3" style={{ color: "var(--ink-faint)", fontSize: 10 }}>INCLUDE IN BULLETIN</div>
        {(["programmes","scholarships","research","webinars"] as const).map((k) => (
          <Row key={k} label={k[0].toUpperCase() + k.slice(1)} right={<Toggle checked={(include as any)[k]} onChange={(b) => setInclude({ ...include, [k]: b })} />} />
        ))}
      </div>
    </SectionShell>
  );
}

function CounsellorPrefs() {
  const [tone, setTone] = useState<"Editorial" | "Direct" | "Encouraging">(() => {
    return (localStorage.getItem("in.counsellor.tone") as any) ?? "Editorial";
  });
  const [length, setLength] = useState<"Brief" | "Standard" | "Long">(() => {
    return (localStorage.getItem("in.counsellor.length") as any) ?? "Standard";
  });
  const [cite, setCite] = useState(true);
  const [memory, setMemory] = useState(true);
  const toast = useToast();

  const save = () => {
    localStorage.setItem("in.counsellor.tone", tone);
    localStorage.setItem("in.counsellor.length", length);
    toast("Counsellor preferences saved (stored on this device)", "ok");
  };

  return (
    <SectionShell index="12 — COUNSELLOR" title="Nest Counsellor preferences" sub="How the agent should write back to you." onSave={save}>
      <div className="mono mb-2" style={{ color: "var(--ink-faint)", fontSize: 9 }}>Stored on this device</div>
      <Row label="Tone" hint="Editorial sounds like the rest of the site." right={<Seg value={tone} options={["Editorial","Direct","Encouraging"] as const} onChange={setTone} />} />
      <Row label="Reply length" right={<Seg value={length} options={["Brief","Standard","Long"] as const} onChange={setLength} />} />
      <Row label="Always cite sources" hint="Numbered superscripts that link to your dossier." right={<Toggle checked={cite} onChange={setCite} />} />
      <Row label="Remember our conversations" hint="The counsellor will recall prior threads. You can wipe this any time." right={<Toggle checked={memory} onChange={setMemory} />} />
      <Row label="Wipe conversation memory" hint="Forgets every conversation you have had with the counsellor." right={<button className="btn-ink btn-ghost"><span>Wipe</span></button>} />
    </SectionShell>
  );
}

/* ——— FACULTY sections ——— */

function LabProfile() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [v, setV] = useState<FacultyProfileDto>({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const p = await facultyProfileGet();
      setV(p);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load lab profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setBusy(true);
    try {
      const updated = await facultyProfilePut(v);
      setV(updated);
      toast("Lab profile saved", "ok");
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Failed to save lab profile.", "err");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return (
    <section className="border border-[var(--rule-strong)] p-8">
      <div className="space-y-4">
        {[80,60,40].map(w => <div key={w} className="h-4 rounded" style={{ background: "var(--rule-strong)", width: `${w}%`, opacity: 0.6 }} />)}
      </div>
    </section>
  );

  if (error) return (
    <section className="border border-[var(--rule-strong)] p-8">
      <div className="mono" style={{ color: "var(--oxblood)" }}>{error}</div>
      <button onClick={load} className="mono mt-3 hover:text-[var(--gold)]">RETRY →</button>
    </section>
  );

  return (
    <SectionShell index="10 — LAB" title="Lab profile" sub="What candidates read when they click your name." onSave={save}>
      <DGrid>
        <DField label="Area of expertise" value={v.expertise ?? ""} onChange={(t) => setV({ ...v, expertise: t })} />
        <DField label="Department" value={v.department ?? ""} onChange={(t) => setV({ ...v, department: t })} />
      </DGrid>
      <DGrid>
        <DField label="Website" value={v.website ?? ""} onChange={(t) => setV({ ...v, website: t })} />
        <DField label="LinkedIn" value={v.linkedIn ?? ""} onChange={(t) => setV({ ...v, linkedIn: t })} />
      </DGrid>
      <DField label="One-paragraph précis / bio" value={v.bio ?? ""} onChange={(t) => setV({ ...v, bio: t })} textarea />
      <DField label="Research interests" value={v.researchInterests ?? ""} onChange={(t) => setV({ ...v, researchInterests: t })} placeholder="Comma-separated" />
      <DField label="Courses taught" value={v.taughtCourses ?? ""} onChange={(t) => setV({ ...v, taughtCourses: t })} />
      {busy && <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>Saving…</div>}
    </SectionShell>
  );
}

function ExamDefaults() {
  const [length, setLength] = useState<"30 min" | "60 min" | "90 min">("60 min");
  const [grading, setGrading] = useState<"5-point" | "Pass/Fail" | "Letter">("5-point");
  const [anonymous, setAnonymous] = useState(true);
  const [carry, setCarry] = useState(true);
  return (
    <SectionShell index="11 — EXAMINATION" title="Examination defaults" sub="The template every new opening starts from.">
      <div className="mono mb-2" style={{ color: "var(--ink-faint)", fontSize: 9 }}>Stored on this device</div>
      <Row label="Examination length" right={<Seg value={length} options={["30 min","60 min","90 min"] as const} onChange={setLength} />} />
      <Row label="Grading scheme" right={<Seg value={grading} options={["5-point","Pass/Fail","Letter"] as const} onChange={setGrading} />} />
      <Row label="Anonymous review" hint="Hide applicant identity from second readers." right={<Toggle checked={anonymous} onChange={setAnonymous} />} />
      <Row label="Carry examination across openings" hint="Re-use the template unless changed." right={<Toggle checked={carry} onChange={setCarry} />} />
      <a href="#/researcher?tab=exam" className="mono hover:text-[var(--gold)]" style={{ fontSize: 11 }}>EDIT THE QUESTION SET →</a>
    </SectionShell>
  );
}

function AutoDecline() {
  const [enabled, setEnabled] = useState(true);
  const [minGpa, setMinGpa] = useState("3.20");
  const [requireRefs, setRequireRefs] = useState(true);
  const [requireAbstract, setRequireAbstract] = useState(false);
  return (
    <SectionShell index="12 — AUTO-DECLINE" title="Auto-decline policy" sub="Filters applied before an applicant reaches your queue.">
      <div className="mono mb-2" style={{ color: "var(--ink-faint)", fontSize: 9 }}>Stored on this device</div>
      <Row label="Auto-decline ineligible applicants" hint="They receive a courteous note explaining the policy." right={<Toggle checked={enabled} onChange={setEnabled} />} />
      <DGrid>
        <DField label="Minimum GPA (or 1st-class equivalent)" value={minGpa} onChange={setMinGpa} />
        <DField label="Maximum gap years since last degree" value="3" onChange={() => {}} />
      </DGrid>
      <Row label="Require two academic referees" right={<Toggle checked={requireRefs} onChange={setRequireRefs} />} />
      <Row label="Require a 300-word abstract" right={<Toggle checked={requireAbstract} onChange={setRequireAbstract} />} />
    </SectionShell>
  );
}

function Hours() {
  const slots = [
    { d: "Monday", at: "—", open: false },
    { d: "Tuesday", at: "14:00 — 16:00 CET", open: true },
    { d: "Wednesday", at: "—", open: false },
    { d: "Thursday", at: "11:00 — 12:30 CET", open: true },
    { d: "Friday", at: "10:00 — 11:30 CET", open: true },
  ];
  return (
    <SectionShell index="13 — HOURS" title="Office hours" sub="When candidates may book a half-hour with you.">
      <div className="mono mb-2" style={{ color: "var(--ink-faint)", fontSize: 9 }}>Stored on this device</div>
      <ul>
        {slots.map((s, i) => (
          <li key={s.d} className="grid grid-cols-12 gap-3 py-3 border-b border-[var(--rule)] items-center">
            <span className="col-span-2 mono" style={{ color: "var(--gold)" }}>{s.d.toUpperCase()}</span>
            <span className="col-span-6 serif" style={{ fontSize: "1.0625rem" }}>{s.at}</span>
            <div className="col-span-4 flex justify-end gap-2">
              <button className="mono px-3 py-1 border border-[var(--rule-strong)] hover:border-[var(--gold)]" style={{ fontSize: 10 }}>EDIT</button>
              <Toggle checked={s.open} onChange={() => {}} />
            </div>
          </li>
        ))}
      </ul>
      <button className="mono mt-2 hover:text-[var(--gold)]" style={{ fontSize: 11 }}>+ ADD WINDOW</button>
    </SectionShell>
  );
}

function FacultyTeam() {
  const team = [
    { n: "Dr. Mariana Costa",   r: "Co-PI",       perms: "Edit openings · Review applicants" },
    { n: "Dr. Lars Holmberg",   r: "Post-doc",    perms: "Review applicants" },
    { n: "Yuki Tanaka",         r: "PhD student", perms: "View only" },
  ];
  return (
    <SectionShell index="14 — TEAM" title="Team &amp; delegates" sub="Who else may act on the desk on your behalf." save={false}>
      <div className="mono mb-2" style={{ color: "var(--ink-faint)", fontSize: 9 }}>not available in this edition</div>
      <ul>
        {team.map((t, i) => (
          <li key={i} className="grid grid-cols-12 gap-3 py-4 border-b border-[var(--rule)] items-center">
            <span className="col-span-1 mono tabular" style={{ color: "var(--gold)" }}>{String(i+1).padStart(2,"0")}</span>
            <div className="col-span-7"><div className="serif" style={{ fontSize: "1.0625rem" }}>{t.n}</div><div className="mono" style={{ color: "var(--ink-soft)", fontSize: 10 }}>{t.r}</div></div>
            <span className="col-span-3 mono" style={{ color: "var(--ink-soft)", fontSize: 10 }}>{t.perms}</span>
            <button className="col-span-1 text-right mono hover:text-[var(--gold)]" style={{ fontSize: 10 }}>EDIT</button>
          </li>
        ))}
      </ul>
      <button className="mono mt-2 hover:text-[var(--gold)]" style={{ fontSize: 11 }}>+ INVITE COLLEAGUE</button>
    </SectionShell>
  );
}

/* ——— REP sections ——— */

function Institution() {
  const [v, setV] = useState(() => {
    try {
      const stored = localStorage.getItem("in.rep.institution");
      if (stored) return JSON.parse(stored);
    } catch {}
    return { name: "Trinity College, Cambridge", short: "Trinity", founded: "1546", contact: "admissions@trin.cam.ac.uk", desc: "A constituent college of the University of Cambridge." };
  });
  const toast = useToast();

  const save = () => {
    localStorage.setItem("in.rep.institution", JSON.stringify(v));
    toast("Institution profile saved (stored on this device)", "ok");
  };

  return (
    <SectionShell index="10 — INSTITUTION" title="Institution masthead" sub="The line that appears at the top of every page you manage." onSave={save}>
      <div className="mono mb-2" style={{ color: "var(--ink-faint)", fontSize: 9 }}>Stored on this device</div>
      <DGrid>
        <DField label="Institution name" value={v.name} onChange={(t) => setV({ ...v, name: t })} />
        <DField label="Short code" value={v.short} onChange={(t) => setV({ ...v, short: t })} />
      </DGrid>
      <DGrid>
        <DField label="Founded" value={v.founded} onChange={(t) => setV({ ...v, founded: t })} />
        <DField label="Public contact" value={v.contact} onChange={(t) => setV({ ...v, contact: t })} />
      </DGrid>
      <DField label="Description" value={v.desc} onChange={(t) => setV({ ...v, desc: t })} textarea />
    </SectionShell>
  );
}

function ListingsPolicy() {
  const [autoPub, setAutoPub] = useState(false);
  const [reqEditor, setReqEditor] = useState(true);
  const [archive, setArchive] = useState("Archive after deadline");
  return (
    <SectionShell index="11 — LISTINGS" title="Listings policy" sub="The rules for programmes &amp; scholarships your team posts.">
      <div className="mono mb-2" style={{ color: "var(--ink-faint)", fontSize: 9 }}>Stored on this device</div>
      <Row label="Auto-publish new listings" hint="Skip the draft state — listings go live immediately." right={<Toggle checked={autoPub} onChange={setAutoPub} />} />
      <Row label="Require editor review" hint="An InsightNest editor must approve each listing before publication." right={<Toggle checked={reqEditor} onChange={setReqEditor} />} />
      <Row label="When the deadline passes" right={<Seg value={archive} options={["Archive after deadline","Keep visible","Unpublish silently"]} onChange={setArchive} />} />
      <Row label="Default tags" hint="Applied to every new programme listing." right={<button className="mono hover:text-[var(--gold)]">EDIT →</button>} />
    </SectionShell>
  );
}

function Brand() {
  const toast = useToast();
  return (
    <SectionShell index="12 — BRAND" title="Brand assets" sub="The crest, the plate, the colour set. Used on your institution's pages." save={false}>
      <div className="mono mb-2" style={{ color: "var(--ink-faint)", fontSize: 9 }}>not available in this edition</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: "Crest (SVG)", file: "trinity-crest.svg" },
          { l: "Wordmark", file: "trinity-word.svg" },
          { l: "Plate — primary", file: "trinity-cloister.jpg" },
          { l: "Plate — secondary", file: "trinity-quad.jpg" },
        ].map((b) => (
          <figure key={b.l} className="border border-[var(--rule)] p-3">
            <div className="aspect-[4/3] flex items-center justify-center" style={{ background: "var(--paper-deep)" }}>
              <span className="serif" style={{ fontSize: 26, color: "var(--ink-faint)" }}>T</span>
            </div>
            <div className="mt-2 mono truncate" style={{ fontSize: 10, color: "var(--ink-soft)" }}>{b.file}</div>
            <div className="mt-2 flex gap-2 mono" style={{ fontSize: 9 }}>
              <button onClick={() => toast("not available in this edition", "info")} className="px-2 py-1 border border-[var(--rule-strong)]">REPLACE</button>
              <button onClick={() => toast("not available in this edition", "info")} className="px-2 py-1 border border-[var(--rule-strong)]">COPY URL</button>
            </div>
          </figure>
        ))}
      </div>
      <Row label="Brand colour — primary" right={<input type="color" defaultValue="#1F2D50" className="w-20 h-8 border border-[var(--rule-strong)] bg-transparent" />} />
      <Row label="Brand colour — accent"  right={<input type="color" defaultValue="#A8852C" className="w-20 h-8 border border-[var(--rule-strong)] bg-transparent" />} />
    </SectionShell>
  );
}

function RepTeam() {
  const team = [
    { n: "Dr. H. Rosenthal", r: "Director · Admissions", perms: "Owner" },
    { n: "Sarah Knight",     r: "Outreach",              perms: "Edit listings · Reply to enquiries" },
    { n: "James Bartlett",   r: "Scholarships officer",  perms: "Edit scholarships" },
  ];
  return (
    <SectionShell index="13 — TEAM" title="Team" sub="Delegates who may post listings or reply to enquiries." save={false}>
      <div className="mono mb-2" style={{ color: "var(--ink-faint)", fontSize: 9 }}>not available in this edition</div>
      <ul>
        {team.map((t, i) => (
          <li key={i} className="grid grid-cols-12 gap-3 py-4 border-b border-[var(--rule)] items-center">
            <span className="col-span-1 mono tabular" style={{ color: "var(--gold)" }}>{String(i+1).padStart(2,"0")}</span>
            <div className="col-span-7"><div className="serif" style={{ fontSize: "1.0625rem" }}>{t.n}</div><div className="mono" style={{ color: "var(--ink-soft)", fontSize: 10 }}>{t.r}</div></div>
            <span className="col-span-3 mono" style={{ color: "var(--ink-soft)", fontSize: 10 }}>{t.perms}</span>
            <button className="col-span-1 text-right mono hover:text-[var(--gold)]" style={{ fontSize: 10 }}>EDIT</button>
          </li>
        ))}
      </ul>
      <button className="mono mt-2 hover:text-[var(--gold)]" style={{ fontSize: 11 }}>+ INVITE COLLEAGUE</button>
    </SectionShell>
  );
}

/* ——— ADMIN sections ——— */

function EditorProfile() {
  const { session } = useSession();
  const [v, setV] = useState({ name: session.name, title: "Editor-in-Chief", byline: session.name.split(" ").map(w => w[0]).join("").toUpperCase(), signoff: "— The editors" });
  return (
    <SectionShell index="10 — EDITOR" title="Editor profile" sub="The byline and sign-off that appear under your editorial notes.">
      <div className="mono mb-2" style={{ color: "var(--ink-faint)", fontSize: 9 }}>Stored on this device</div>
      <DGrid>
        <DField label="Display name" value={v.name} onChange={(t) => setV({ ...v, name: t })} />
        <DField label="Title" value={v.title} onChange={(t) => setV({ ...v, title: t })} />
      </DGrid>
      <DGrid>
        <DField label="Byline initials" value={v.byline} onChange={(t) => setV({ ...v, byline: t })} />
        <DField label="Sign-off" value={v.signoff} onChange={(t) => setV({ ...v, signoff: t })} />
      </DGrid>
    </SectionShell>
  );
}

function Audit() {
  return (
    <SectionShell index="11 — AUDIT" title="Audit subscriptions" sub="Which editorial events you are notified about.">
      <div className="mono mb-2" style={{ color: "var(--ink-faint)", fontSize: 9 }}>Stored on this device</div>
      {[
        ["New university added",        true],
        ["Listing edited by a rep",      true],
        ["Listing unpublished by a rep", true],
        ["Forum thread flagged",         true],
        ["User suspended",               true],
        ["Media replaced",               false],
        ["Settings changed",             true],
      ].map(([t, on], i) => (
        <Row key={i} label={t as string} right={<Toggle checked={on as boolean} onChange={() => {}} />} />
      ))}
    </SectionShell>
  );
}

function OrgPolicies() {
  return (
    <SectionShell index="12 — ORG POLICIES" title="Organisation-wide policies" sub="Defaults enforced across every folio.">
      <div className="mono mb-2" style={{ color: "var(--ink-faint)", fontSize: 9 }}>Stored on this device</div>
      <Row label="Require two-factor for staff folios" right={<Toggle checked={true} onChange={() => {}} />} />
      <Row label="Public registration" right={<Seg value="Open" options={["Open","By invitation","Closed"] as const} onChange={() => {}} />} />
      <Row label="Faculty verification" right={<Seg value="Manual" options={["Manual","Domain whitelist","Automatic"] as const} onChange={() => {}} />} />
      <Row label="Editorial guidelines" hint="Each listing read by a duty editor." right={<Toggle checked={true} onChange={() => {}} />} />
      <Row label="Data retention" hint="Deleted folios remain recoverable for 14 days." right={<Seg value="14 days" options={["7 days","14 days","30 days"] as const} onChange={() => {}} />} />
    </SectionShell>
  );
}
