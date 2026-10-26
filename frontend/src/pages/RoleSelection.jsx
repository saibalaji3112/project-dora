import { useState } from "react";
import { BookOpen, Braces, GraduationCap, Rocket, UserRound } from "lucide-react";
import API from "../services/api";

const ROLES = [
  { id: "student", title: "Student", detail: "Semester-ready scope, affordable tools, and clear milestones.", Icon: GraduationCap },
  { id: "professor", title: "Professor", detail: "Research depth, reproducible work, and guidance for teams.", Icon: BookOpen },
  { id: "developer", title: "Developer", detail: "Engineering depth, practical architecture, and portfolio value.", Icon: Braces },
  { id: "founder", title: "Founder", detail: "Customer needs, MVP validation, and paths to adoption.", Icon: Rocket },
  { id: "other", title: "Other", detail: "Practical ideas shaped around your goals.", Icon: UserRound },
];

export default function RoleSelection({ user, onRoleSelected, onSignOut }) {
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const continueToDora = async () => {
    if (!role || saving) return;
    setError("");
    setSaving(true);
    try {
      const { data } = await API.put("/auth/role", { role });
      onRoleSelected(data.user);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "We couldn't save your choice. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return <main className="auth-shell role-selection-shell">
    <section className="auth-card role-selection-card" aria-labelledby="role-title">
      <a className="brand" href="#top" aria-label="Dora home"><span className="brand-mark">D</span><span>Dora<span className="brand-dot">.</span></span></a>
      <span className="eyebrow auth-eyebrow">PERSONALIZE YOUR PROJECT STUDIO</span>
      <h1 id="role-title">How do you use Dora?</h1>
      <p className="auth-subtitle">Hi {user.name}. Choose the perspective that best fits you.</p>
      <div className="role-options" role="group" aria-label="Choose your role">
        {ROLES.map(({ id, title, detail, Icon }) => <button key={id} type="button" className={`role-option${role === id ? " is-selected" : ""}`} aria-pressed={role === id} onClick={() => { setRole(id); setError(""); }}>
          <span className="role-option-icon"><Icon size={18} aria-hidden="true" /></span>
          <span className="role-option-copy"><strong>{title}</strong><small>{detail}</small></span>
          <span className="role-option-check" aria-hidden="true" />
        </button>)}
      </div>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="button button-primary auth-submit" type="button" disabled={!role || saving} onClick={continueToDora}>{saving ? "Saving your choice…" : "Continue to Dora"}</button>
      <p className="role-signout">Signed in as {user.email}. <button type="button" onClick={onSignOut}>Sign out</button></p>
    </section>
  </main>;
}
