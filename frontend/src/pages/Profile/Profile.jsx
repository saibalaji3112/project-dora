import { useState } from "react";
import { BookOpen, Braces, Check, GraduationCap, LockKeyhole, Rocket, UserRound } from "lucide-react";
import API from "../../services/api";

const ROLES = [
  { id: "student", label: "Student", Icon: GraduationCap },
  { id: "professor", label: "Professor", Icon: BookOpen },
  { id: "developer", label: "Developer", Icon: Braces },
  { id: "founder", label: "Founder", Icon: Rocket },
  { id: "other", label: "Other", Icon: UserRound },
];

export default function Profile({ user, onUserUpdate, motionEnabled, onToggleMotion, reducedMotion }) {
  const [role, setRole] = useState(user?.role || "other");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const saveRole = async () => {
    if (role === user?.role || saving) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const { data } = await API.put("/auth/role", { role });
      onUserUpdate(data.user);
      setNotice("Your project perspective has been updated.");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "We couldn't update your profile. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return <div className="route-page profile-page">
    <section className="page-intro profile-intro">
      <span className="eyebrow">ACCOUNT & PREFERENCES</span>
      <h1>Your studio,<br /><em>your perspective.</em></h1>
      <p>Manage the perspective Dora uses to shape project ideas and your workspace preferences.</p>
    </section>

    {error && <div className="banner banner-error" role="alert">{error}</div>}
    {notice && <div className="banner" role="status">{notice}</div>}

    <section className="profile-panel" aria-labelledby="profile-account-heading">
      <div className="profile-panel-heading"><div><span className="eyebrow">ACCOUNT</span><h2 id="profile-account-heading">Your details</h2></div><span className="profile-avatar" aria-hidden="true">{user?.name?.slice(0, 1)?.toUpperCase() || "D"}</span></div>
      <dl className="profile-details"><div><dt>Name</dt><dd>{user?.name || "Dora user"}</dd></div><div><dt>Email</dt><dd>{user?.email || "Not available"}</dd></div><div><dt>Current role</dt><dd>{ROLES.find((item) => item.id === user?.role)?.label || "Other"}</dd></div></dl>
    </section>

    <section className="profile-panel" aria-labelledby="profile-role-heading">
      <div className="profile-panel-heading"><div><span className="eyebrow">PERSONALIZATION</span><h2 id="profile-role-heading">Choose your project perspective</h2><p>This changes the context Dora uses when suggesting new project ideas.</p></div></div>
      <div className="profile-role-options" role="group" aria-label="Project perspective">
        {ROLES.map(({ id, label, Icon }) => <button key={id} type="button" className={role === id ? "selected" : ""} aria-pressed={role === id} onClick={() => { setRole(id); setNotice(""); setError(""); }}><Icon size={17} aria-hidden="true" /><span>{label}</span>{role === id && <Check size={15} aria-hidden="true" />}</button>)}
      </div>
      <button className="button button-primary profile-save" type="button" onClick={saveRole} disabled={saving || role === user?.role}>{saving ? "Saving…" : "Save perspective"}</button>
    </section>

    <section className="profile-panel profile-preferences" aria-labelledby="profile-preferences-heading">
      <div><span className="eyebrow">PREFERENCES</span><h2 id="profile-preferences-heading">Motion and privacy</h2><p>Choose the visual motion used across the studio. Your browser manages saved passwords; Dora stores only an optional remembered email on this device.</p></div>
      <button type="button" className="motion-toggle profile-motion-toggle" role="switch" aria-checked={motionEnabled} aria-label={motionEnabled ? "Turn ambient motion off" : "Turn ambient motion on"} disabled={reducedMotion} onClick={onToggleMotion}><span className="motion-toggle-label">Ambient motion</span><span className="motion-toggle-track"><span /></span></button>
    </section>

    <p className="profile-security-note"><LockKeyhole size={14} aria-hidden="true" /> Passwords are protected by your sign-in provider and are never stored in Dora's profile settings.</p>
  </div>;
}
