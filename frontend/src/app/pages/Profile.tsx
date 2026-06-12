import { useCallback, useEffect, useState } from "react";
import { useRouter } from "../router";
import { useSession, type Role } from "../providers/SessionProvider";
import { useToast } from "../components/Toast";
import { ApiError } from "../api/client";
import { fmtDate } from "../api/format";
import {
  usersMe,
  usersGetPublic,
  learnerProfileGet,
  facultyProfileGet,
  UserDto,
  PublicUserDto,
  LearnerProfileDto,
  FacultyProfileDto,
} from "../api/endpoints";
import { Seal, CornerMark } from "../components/Seal";

// ─── Cover images by role ──────────────────────────────────────────────────────

const COVERS: Record<Role, string> = {
  Learner: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=2000&q=80",
  Faculty: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&w=2000&q=80",
  Rep:     "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=2000&q=80",
  Admin:   "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=2000&q=80",
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3 py-4">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 rounded" style={{ background: "var(--rule-strong)", width: `${85 - i * 12}%`, opacity: 0.6 }} />
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roleFromRoles(roles: string[]): Role {
  if (roles.includes("ADMIN")) return "Admin";
  if (roles.includes("UNIVERSITY_REP")) return "Rep";
  if (roles.includes("FACULTY")) return "Faculty";
  return "Learner";
}

function refLabel(role: Role, id: number | string): string {
  const pad = String(id).padStart(4, "0");
  switch (role) {
    case "Learner": return `LRN-${pad}`;
    case "Faculty": return `FAC-${pad}`;
    case "Rep":     return `REP-${pad}`;
    default:        return `ADM-${pad}`;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Profile() {
  const { params } = useRouter();
  const { session } = useSession();
  const id = params.id;

  // Determine if we're viewing our own profile or a public one
  const isMe = !id || id === "me";

  if (isMe) {
    return <MyProfile />;
  } else {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return <NotFound />;
    }
    return <PublicProfile userId={numId} />;
  }
}

// ─── My Profile ──────────────────────────────────────────────────────────────

function MyProfile() {
  const { session } = useSession();
  const toast = useToast();
  const [meLoading, setMeLoading] = useState(true);
  const [meError, setMeError] = useState("");
  const [me, setMe] = useState<UserDto | null>(null);
  const [learner, setLearner] = useState<LearnerProfileDto | null>(null);
  const [faculty, setFaculty] = useState<FacultyProfileDto | null>(null);

  const load = useCallback(async () => {
    setMeLoading(true); setMeError("");
    try {
      const user = await usersMe();
      setMe(user);
      // Load profile based on role
      if (user.roles.includes("FACULTY") || user.roles.includes("ADMIN")) {
        try { setFaculty(await facultyProfileGet()); } catch { /* optional */ }
      }
      if (user.roles.includes("LEARNER") || (!user.roles.includes("FACULTY") && !user.roles.includes("ADMIN") && !user.roles.includes("UNIVERSITY_REP"))) {
        try { setLearner(await learnerProfileGet()); } catch { /* optional */ }
      }
    } catch (e) {
      setMeError(e instanceof ApiError ? e.message : "Failed to load profile.");
    } finally {
      setMeLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (meLoading) return (
    <main className="pt-32 max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-20">
      <Skeleton lines={5} />
    </main>
  );

  if (meError) return (
    <main className="pt-32 max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-20">
      <div className="mono" style={{ color: "var(--oxblood)" }}>{meError}</div>
      <button onClick={load} className="mono mt-3 hover:text-[var(--gold)]">RETRY →</button>
    </main>
  );

  const role = session.role;
  const name = me?.fullName || session.name || "—";
  const email = me?.email || session.email || "—";
  const joinedDisplay = fmtDate(me?.createdAt);
  const ref = refLabel(role, me?.id ?? 0);
  const bio = faculty?.bio || learner?.bio || "";
  const cover = COVERS[role];

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: "var(--paper-deep)", minHeight: "60vh" }}>
        <div className="absolute inset-0 duotone" style={{ backgroundImage: `url(${cover})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--ink) 30%, transparent), color-mix(in srgb, var(--ink) 88%, transparent))" }} />
        <div className="absolute top-6 left-6"><CornerMark /></div>
        <div className="absolute top-6 right-6"><CornerMark rotate={90} /></div>
        <div className="absolute bottom-6 left-6"><CornerMark rotate={-90} /></div>
        <div className="absolute bottom-6 right-6"><CornerMark rotate={180} /></div>

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pt-32 md:pt-40 pb-12 md:pb-16 grid grid-cols-12 gap-6 md:gap-10 items-end" style={{ color: "var(--paper)" }}>
          <div className="col-span-12 md:col-span-9">
            <div className="mono flex flex-wrap items-center gap-3" style={{ color: "var(--gold-soft)", fontSize: 11 }}>
              <span style={{ display: "inline-block", width: 32, height: 1, background: "var(--gold)" }} />
              <span>{role === "Learner" ? "FOLIO · LEARNER" : role === "Faculty" ? "FOLIO · FACULTY" : role === "Rep" ? "FOLIO · UNIVERSITY REP" : "FOLIO · EDITOR"}</span>
              <span>·</span>
              <span>REF {ref}</span>
            </div>
            <h1 className="serif mt-5" style={{ color: "var(--paper)", fontSize: "clamp(2.5rem, 7vw, 5.75rem)", fontWeight: 300, lineHeight: 0.98, letterSpacing: "-0.02em" }}>
              {name}
            </h1>
            {bio && (
              <p className="serif mt-6 max-w-[55ch]" style={{ color: "color-mix(in srgb, var(--paper) 78%, transparent)", fontSize: "clamp(1.0625rem, 1.4vw, 1.25rem)", fontWeight: 300, lineHeight: 1.55 }}>
                {bio}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#/settings" className="btn-ink btn-gold" style={{ borderColor: "var(--gold)" }}><span>Edit profile</span></a>
              <button onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}${window.location.pathname}#/profile/${me?.id ?? "me"}`); toast("Profile link copied", "ok"); }} className="btn-ink"><span>Copy link</span></button>
            </div>
          </div>
          <div className="hidden md:col-span-3 md:flex justify-end">
            <Seal size={140} label={role.toUpperCase()} year="MMXXVI" />
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 py-14 md:py-20 grid grid-cols-12 gap-6 md:gap-10">
        <article className="col-span-12 md:col-span-8 space-y-12">
          {role === "Learner" && <LearnerBody learner={learner} isMe />}
          {role === "Faculty" && <FacultyBody faculty={faculty} isMe />}
          {role === "Rep"     && <RepBodyLive isMe />}
          {role === "Admin"   && <AdminBodyLive me={me} isMe />}
        </article>

        <aside className="col-span-12 md:col-span-4 md:sticky md:top-28 self-start space-y-6">
          <Card title="Record">
            <DList rows={[
              ["NAME", name],
              ["ROLE", role],
              ["JOINED", joinedDisplay],
              ["REF", ref],
              ...(learner?.nationality ? [["NATIONALITY", learner.nationality] as [string, string]] : []),
            ]} />
          </Card>

          <Card title="Contact">
            <ul className="space-y-3 mt-2">
              <li className="flex items-center justify-between gap-3">
                <span className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>EMAIL</span>
                <span className="mono truncate" style={{ color: "var(--ink-soft)", fontSize: 11 }}>{email}</span>
              </li>
            </ul>
          </Card>

          <Card title="Cite this profile">
            <p className="serif mt-2" style={{ fontSize: "0.95rem", color: "var(--ink-soft)" }}>
              {name} ({joinedDisplay.split(".")[0]}). <em>InsightNest folio</em>, ref. {ref}.
            </p>
            <button onClick={() => { navigator.clipboard?.writeText(`${name} (${joinedDisplay.split(".")[0]}). InsightNest folio, ref. ${ref}.`); toast("Citation copied", "ok"); }} className="mt-3 mono hover:text-[var(--gold)]" style={{ fontSize: 11 }}>COPY CITATION →</button>
          </Card>
        </aside>
      </section>
    </main>
  );
}

// ─── Public Profile ──────────────────────────────────────────────────────────

function PublicProfile({ userId }: { userId: number }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [data, setData] = useState<PublicUserDto | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(""); setNotFound(false);
    try {
      const pub = await usersGetPublic(userId);
      setData(pub);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setNotFound(true);
      } else {
        setError(e instanceof ApiError ? e.message : "Failed to load profile.");
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <main className="pt-32 max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-20">
      <Skeleton lines={5} />
    </main>
  );

  if (notFound) return <NotFound />;

  if (error) return (
    <main className="pt-32 max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-20">
      <div className="mono" style={{ color: "var(--oxblood)" }}>{error}</div>
      <button onClick={load} className="mono mt-3 hover:text-[var(--gold)]">RETRY →</button>
    </main>
  );

  const pub = data!;
  const role = roleFromRoles(pub.roles);
  const joinedDisplay = fmtDate(pub.joinedAt);
  const ref = refLabel(role, pub.id);
  const lp = pub.learnerProfile;
  const fp = pub.facultyProfile;
  const bio = fp?.bio || lp?.bio || "";
  const cover = COVERS[role];

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: "var(--paper-deep)", minHeight: "60vh" }}>
        <div className="absolute inset-0 duotone" style={{ backgroundImage: `url(${cover})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--ink) 30%, transparent), color-mix(in srgb, var(--ink) 88%, transparent))" }} />
        <div className="absolute top-6 left-6"><CornerMark /></div>
        <div className="absolute top-6 right-6"><CornerMark rotate={90} /></div>
        <div className="absolute bottom-6 left-6"><CornerMark rotate={-90} /></div>
        <div className="absolute bottom-6 right-6"><CornerMark rotate={180} /></div>

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pt-32 md:pt-40 pb-12 md:pb-16 grid grid-cols-12 gap-6 md:gap-10 items-end" style={{ color: "var(--paper)" }}>
          <div className="col-span-12 md:col-span-9">
            <div className="mono flex flex-wrap items-center gap-3" style={{ color: "var(--gold-soft)", fontSize: 11 }}>
              <span style={{ display: "inline-block", width: 32, height: 1, background: "var(--gold)" }} />
              <span>{role === "Learner" ? "FOLIO · LEARNER" : role === "Faculty" ? "FOLIO · FACULTY" : role === "Rep" ? "FOLIO · UNIVERSITY REP" : "FOLIO · EDITOR"}</span>
              <span>·</span>
              <span>REF {ref}</span>
            </div>
            <h1 className="serif mt-5" style={{ color: "var(--paper)", fontSize: "clamp(2.5rem, 7vw, 5.75rem)", fontWeight: 300, lineHeight: 0.98, letterSpacing: "-0.02em" }}>
              {pub.fullName}
            </h1>
            {bio && (
              <p className="serif mt-6 max-w-[55ch]" style={{ color: "color-mix(in srgb, var(--paper) 78%, transparent)", fontSize: "clamp(1.0625rem, 1.4vw, 1.25rem)", fontWeight: 300, lineHeight: 1.55 }}>
                {bio}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`#/messages/new`} className="btn-ink btn-gold"><span>Write a letter</span></a>
              <button onClick={() => toast("Added to your contacts (UI-local)")} className="btn-ink" style={{ color: "var(--paper)", borderColor: "color-mix(in srgb, var(--paper) 60%, transparent)" }}><span>Add to contacts</span></button>
            </div>
          </div>
          <div className="hidden md:col-span-3 md:flex justify-end">
            <Seal size={140} label={role.toUpperCase()} year="MMXXVI" />
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 py-14 md:py-20 grid grid-cols-12 gap-6 md:gap-10">
        <article className="col-span-12 md:col-span-8 space-y-12">
          {role === "Learner" && lp && <LearnerBody learner={lp} isMe={false} />}
          {role === "Faculty" && fp && <FacultyBody faculty={fp} isMe={false} />}
          {(role === "Learner" && !lp) || (role === "Faculty" && !fp) ? (
            <section>
              <div className="mono py-12 text-center" style={{ color: "var(--ink-faint)" }}>No profile details available.</div>
            </section>
          ) : null}
        </article>

        <aside className="col-span-12 md:col-span-4 md:sticky md:top-28 self-start space-y-6">
          <Card title="Record">
            <DList rows={[
              ["NAME", pub.fullName],
              ["ROLE", role],
              ["JOINED", joinedDisplay],
              ["REF", ref],
              ...(lp?.nationality ? [["NATIONALITY", lp.nationality] as [string, string]] : []),
            ]} />
          </Card>

          <Card title="Contact">
            <ul className="space-y-3 mt-2">
              <li className="flex items-center justify-between">
                <span className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>LETTER</span>
                <a href={`#/messages/new`} className="mono" style={{ color: "var(--gold)" }}>WRITE →</a>
              </li>
            </ul>
          </Card>

          <Card title="Cite this profile">
            <p className="serif mt-2" style={{ fontSize: "0.95rem", color: "var(--ink-soft)" }}>
              {pub.fullName} ({joinedDisplay.split(".")[0]}). <em>InsightNest folio</em>, ref. {ref}.
            </p>
            <button onClick={() => { navigator.clipboard?.writeText(`${pub.fullName} (${joinedDisplay.split(".")[0]}). InsightNest folio, ref. ${ref}.`); toast("Citation copied", "ok"); }} className="mt-3 mono hover:text-[var(--gold)]" style={{ fontSize: 11 }}>COPY CITATION →</button>
          </Card>

          <Card title="Report">
            <button onClick={() => toast("Flagged for the editors", "info")} className="mono hover:text-[var(--oxblood)]" style={{ fontSize: 11 }}>FLAG THIS PROFILE →</button>
          </Card>
        </aside>
      </section>
    </main>
  );
}

// ─── Not Found ────────────────────────────────────────────────────────────────

function NotFound() {
  return (
    <main className="pt-32 max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-32">
      <div className="mono" style={{ color: "var(--gold)" }}>FOLIO · 404</div>
      <h1 className="serif mt-4" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 300 }}>No folio at this address.</h1>
      <p className="serif mt-4 max-w-[55ch]" style={{ color: "var(--ink-soft)", fontSize: "1.125rem", fontWeight: 300 }}>
        The folio you requested does not exist, has been removed, or belongs to a suspended account.
      </p>
      <a href="#/universities" className="mt-8 inline-block mono hover:text-[var(--gold)]">← RETURN TO ATLAS</a>
    </main>
  );
}

/* ——— Role-specific body sections ——— */

function LearnerBody({ learner, isMe }: { learner: LearnerProfileDto | null; isMe: boolean }) {
  return (
    <>
      {learner?.bio && (
        <section>
          <H index="01">A short statement</H>
          <p className="serif mt-4" style={{ fontSize: "1.0625rem", lineHeight: 1.7, fontWeight: 300 }}>
            {learner.bio}
          </p>
        </section>
      )}

      {learner?.educationHistory && (
        <section>
          <H index="02">Education</H>
          <p className="serif mt-4 whitespace-pre-wrap" style={{ fontSize: "1.0625rem", lineHeight: 1.7, fontWeight: 300 }}>
            {learner.educationHistory}
          </p>
        </section>
      )}

      {learner?.hobbies && (
        <section>
          <H index="03">Interests</H>
          <div className="mt-4 flex flex-wrap gap-2">
            {learner.hobbies.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
              <Pill key={t}>{t}</Pill>
            ))}
          </div>
        </section>
      )}

      {learner?.cgpa && (
        <section>
          <H index="04">Academic standing</H>
          <div className="mt-4 flex flex-wrap gap-2">
            <Pill>{learner.cgpa}</Pill>
          </div>
        </section>
      )}

      {isMe && (
        <section>
          <H index="05" action={<a href="#/dashboard" className="mono" style={{ color: "var(--gold)" }}>FULL DASHBOARD →</a>}>Private — your activity</H>
          <div className="mono mt-4" style={{ color: "var(--ink-faint)", fontSize: 10 }}>This section is only visible when previewing your own profile.</div>
        </section>
      )}
    </>
  );
}

function FacultyBody({ faculty, isMe }: { faculty: FacultyProfileDto | null; isMe: boolean }) {
  return (
    <>
      {faculty?.bio && (
        <section>
          <H index="01">About the lab</H>
          <p className="serif mt-4" style={{ fontSize: "1.0625rem", lineHeight: 1.7, fontWeight: 300 }}>
            {faculty.bio}
          </p>
        </section>
      )}

      {faculty?.researchInterests && (
        <section>
          <H index="02" action={isMe ? <a href="#/researcher" className="mono" style={{ color: "var(--gold)" }}>MANAGE →</a> : undefined}>Research interests</H>
          <div className="mt-4 flex flex-wrap gap-2">
            {faculty.researchInterests.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
              <Pill key={t}>{t}</Pill>
            ))}
          </div>
        </section>
      )}

      {faculty?.expertise && (
        <section>
          <H index="03">Expertise</H>
          <p className="serif mt-4" style={{ fontSize: "1.0625rem", fontWeight: 300 }}>{faculty.expertise}</p>
        </section>
      )}

      {faculty?.department && (
        <section>
          <H index="04">Department</H>
          <p className="serif mt-4" style={{ fontSize: "1.0625rem", fontWeight: 300 }}>{faculty.department}</p>
        </section>
      )}

      {faculty?.website && (
        <section>
          <H index="05">Website</H>
          <a href={faculty.website} target="_blank" rel="noreferrer" className="serif mt-4 inline-block" style={{ fontSize: "1.0625rem", fontWeight: 300, color: "var(--gold)" }}>{faculty.website}</a>
        </section>
      )}
    </>
  );
}

function RepBodyLive({ isMe }: { isMe: boolean }) {
  return (
    <section>
      <H index="01">About the institution</H>
      <p className="serif mt-4" style={{ fontSize: "1.0625rem", lineHeight: 1.7, fontWeight: 300 }}>
        University representative. Managing programmes, scholarships, and enquiries from candidates.
      </p>
      {isMe && (
        <div className="mt-4">
          <a href="#/rep" className="mono hover:text-[var(--gold)]" style={{ fontSize: 11 }}>OPEN REP DESK →</a>
        </div>
      )}
    </section>
  );
}

function AdminBodyLive({ me, isMe }: { me: UserDto | null; isMe: boolean }) {
  return (
    <>
      <section>
        <H index="01">Editor's note</H>
        <p className="serif mt-4" style={{ fontSize: "1.0625rem", lineHeight: 1.7, fontWeight: 300 }}>
          Site administrator. Manages every entry that appears in the public atlas.
        </p>
      </section>
      {isMe && (
        <section>
          <H index="02">Quick links</H>
          <ul className="mt-4 space-y-2">
            <li><a href="#/admin" className="mono hover:text-[var(--gold)]" style={{ fontSize: 11 }}>OPEN ADMIN CMS →</a></li>
            <li><a href="#/admin/users" className="mono hover:text-[var(--gold)]" style={{ fontSize: 11 }}>MANAGE USERS →</a></li>
          </ul>
        </section>
      )}
    </>
  );
}

/* ——— Reusable bits ——— */

function H({ index, children, action }: { index: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <header className="flex items-end justify-between pb-3 border-b border-[var(--rule)] gap-3 flex-wrap">
      <div className="flex items-baseline gap-4">
        <span className="section-index">{index}</span>
        <h2 className="serif" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)", fontWeight: 300 }}>{children}</h2>
      </div>
      {action}
    </header>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[var(--rule-strong)] p-5 md:p-6">
      <div className="mono pb-3 border-b border-[var(--rule)]" style={{ color: "var(--gold)" }}>{title.toUpperCase()}</div>
      {children}
    </div>
  );
}

function DList({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-2 gap-y-1 mt-3">
      {rows.map(([k, v]) => (
        <div key={k} className="col-span-2 grid grid-cols-2 gap-3 py-2 border-b border-[var(--rule)]">
          <dt className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{k}</dt>
          <dd className="text-right" style={{ color: "var(--ink)" }}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="mono px-3 py-1 border border-[var(--rule-strong)]" style={{ fontSize: 10 }}>{children}</span>;
}
