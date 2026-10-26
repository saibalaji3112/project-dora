import { useRef, useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, Sparkles, X } from "lucide-react";
import API from "../../services/api";

const SAVED_EMAILS_KEY = "dora_saved_emails";

function readSavedEmails() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED_EMAILS_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter((email) => typeof email === "string" && email.includes("@")) : [];
  } catch {
    return [];
  }
}

function writeSavedEmails(emails) {
  try {
    localStorage.setItem(SAVED_EMAILS_KEY, JSON.stringify(emails));
  } catch {
    // Sign-in must still work when browser storage is disabled.
  }
}

export default function Login({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [savedEmails, setSavedEmails] = useState(readSavedEmails);
  const [rememberEmail, setRememberEmail] = useState(() => readSavedEmails().length > 0);
  const [selectedSavedEmail, setSelectedSavedEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);
  const passwordInputRef = useRef(null);
  const matchingEmails = mode === "login" && email.trim().length >= 3 && selectedSavedEmail.toLowerCase() !== email.trim().toLowerCase()
    ? savedEmails.filter((saved) => saved.toLowerCase().startsWith(email.trim().toLowerCase()))
    : [];

  const removeSavedEmail = (target) => {
    const next = savedEmails.filter((saved) => saved !== target);
    setSavedEmails(next);
    writeSavedEmails(next);
    if (selectedSavedEmail === target) setSelectedSavedEmail("");
    if (next.length === 0) setRememberEmail(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const submittedEmail = String(formData.get("email") || email).trim().toLowerCase();
    const submittedPassword = String(formData.get("password") || password);
    try {
      const path = mode === "register" ? "/auth/register" : "/auth/login";
      const payload = mode === "register"
        ? { name: String(formData.get("name") || name), email: submittedEmail, password: submittedPassword }
        : { email: submittedEmail, password: submittedPassword };
      const { data } = await API.post(path, payload);
      const nextSavedEmails = rememberEmail
        ? [submittedEmail, ...savedEmails.filter((saved) => saved.toLowerCase() !== submittedEmail)].slice(0, 5)
        : mode === "login" ? savedEmails.filter((saved) => saved.toLowerCase() !== submittedEmail) : savedEmails;
      writeSavedEmails(nextSavedEmails);
      setSavedEmails(nextSavedEmails);
      if ("PasswordCredential" in window && navigator.credentials?.store) {
        try {
          const credential = new window.PasswordCredential({ id: submittedEmail, name: data.user?.name || submittedEmail, password: submittedPassword });
          void navigator.credentials.store(credential).catch(() => {});
        } catch {
          // Browser password managers remain the fallback when this API is unavailable.
        }
      }
      onAuthenticated(data.user, data.access_token);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Could not connect to Dora. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavedAccount = async (savedEmail) => {
    setEmail(savedEmail);
    setSelectedSavedEmail(savedEmail);
    setRememberEmail(true);
    setPassword("");
    requestAnimationFrame(() => passwordInputRef.current?.focus());

    if (!window.isSecureContext || !("PasswordCredential" in window) || !navigator.credentials?.get) return;
    try {
      const credential = await navigator.credentials.get({ password: true, mediation: "optional" });
      if (!(credential instanceof window.PasswordCredential) || credential.id?.toLowerCase() !== savedEmail.toLowerCase()) return;
      setPassword(credential.password);
      if (passwordInputRef.current) passwordInputRef.current.value = credential.password;
      requestAnimationFrame(() => formRef.current?.requestSubmit());
    } catch {
      // The user's browser may not expose stored passwords to this page. Keep manual/browser autofill available.
    }
  };

  return <main className="auth-shell">
    <section className="auth-story" aria-labelledby="auth-story-title">
      <span className="eyebrow auth-story-eyebrow"><span className="status-dot" /> PROJECT DISCOVERY STUDIO</span>
      <h2 id="auth-story-title">Ideas,<br />made <em>buildable.</em></h2>
      <p>Explore practical project directions, check the landscape, and turn the idea you choose into a plan you can follow.</p>
      <ol className="auth-story-steps" aria-label="The Dora project path">
        <li><span>01</span><b>Discover</b></li><li><span>02</span><b>Validate</b></li><li><span>03</span><b>Build</b></li>
      </ol>
      <div className="auth-preview" aria-label="Example project workspace preview">
        <div className="auth-preview-window">
          <div className="auth-preview-top"><span className="auth-preview-mark">D</span><span>PROJECT SNAPSHOT</span><span className="auth-preview-status"><i /> READY TO EXPLORE</span></div>
          <div className="auth-preview-body">
            <span className="auth-preview-label">DEMO PROJECT · 01</span>
            <h3>Campus energy map</h3>
            <p>Spot avoidable energy use across campus buildings.</p>
            <div className="auth-preview-bottom"><span><Check size={13} aria-hidden="true" /> Buildable first version</span><span>VIEW PLAN <ArrowRight size={13} aria-hidden="true" /></span></div>
          </div>
        </div>
        <div className="auth-preview-visual" aria-hidden="true">
          <div className="auth-scene-fallback"><span className="auth-scene-orbit auth-scene-orbit-one" /><span className="auth-scene-orbit auth-scene-orbit-two" /><span className="auth-scene-core">D</span></div>
          <span className="auth-scene-credit">Project Dora preview</span>
        </div>
        <div className="auth-preview-note"><span className="auth-preview-note-icon"><Sparkles size={15} aria-hidden="true" /></span><span><b>From idea to next step</b><small>Evidence · scope · milestones</small></span></div>
      </div>
    </section>
    <section className="auth-card">
      <a className="brand" href="#top"><span className="brand-mark">D</span><span>Dora<span className="brand-dot">.</span></span></a>
      <span className="eyebrow auth-eyebrow">PROJECT DISCOVERY STUDIO</span>
      <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
      <p className="auth-subtitle">Sign in to discover ideas and keep your recent searches.</p>
      <form ref={formRef} onSubmit={submit} className="auth-form">
        {mode === "register" && <label>Your name<input name="name" required minLength={2} maxLength={80} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} /></label>}
        <div className="auth-email-field"><label htmlFor="auth-email">Email</label><input id="auth-email" name="email" required type="email" maxLength={254} autoComplete="username" value={email} onChange={(event) => { setEmail(event.target.value); setSelectedSavedEmail(""); }} />
          {matchingEmails.length > 0 && <span className="saved-account-list" role="group" aria-label="Saved email accounts">
            {matchingEmails.map((saved) => <span className="saved-account-row" key={saved}>
              <button className="saved-account-pick" type="button" onClick={() => handleSavedAccount(saved)}>{saved}<small>Use saved account</small></button>
              <button className="saved-account-remove" type="button" aria-label={`Remove ${saved} from saved accounts`} title="Remove saved email" onClick={() => removeSavedEmail(saved)}><X size={14} /></button>
            </span>)}
          </span>}
        </div>
        <div className="auth-password-field"><label htmlFor="auth-password">Password</label><span className="auth-password-control"><input ref={passwordInputRef} id="auth-password" name="password" required type={showPassword ? "text" : "password"} minLength={mode === "register" ? 8 : 1} maxLength={128} autoComplete={mode === "register" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} /><button className="password-visibility-toggle" type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></span>{mode === "register" && <small>Use at least 8 characters.</small>}</div>
        <label className="remember-email"><input type="checkbox" checked={rememberEmail} onChange={(event) => setRememberEmail(event.target.checked)} /><span>Remember my email on this device</span></label>
        <small className="credential-helper">After sign-in, your browser may ask whether to save the password. Dora never stores it.</small>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="button button-primary auth-submit" type="submit" disabled={loading}>{loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
      </form>
      <p className="auth-switch">{mode === "login" ? "New to Dora?" : "Already have an account?"} <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Create an account" : "Sign in"}</button></p>
    </section>
  </main>;
}

