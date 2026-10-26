import { lazy, Suspense, useEffect, useState } from "react";
import API from "./services/api";
import Login from "./pages/Login/Login";
import RoleSelection from "./pages/RoleSelection";
const App = lazy(() => import("./AppShell"));

export default function AuthShell() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(sessionStorage.getItem("dora_access_token")));

  useEffect(() => {
    if (!sessionStorage.getItem("dora_access_token")) return;
    API.get("/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => sessionStorage.removeItem("dora_access_token"))
      .finally(() => setChecking(false));
  }, []);

  const signIn = (account, token) => {
    sessionStorage.setItem("dora_access_token", token);
    setUser(account);
  };

  const signOut = async () => {
    try { await API.post("/auth/logout"); } catch { /* Clear local access even when offline. */ }
    sessionStorage.removeItem("dora_access_token");
    setUser(null);
  };

  if (checking) return <main className="auth-loading"><span className="loader" /><p>Checking your session…</p></main>;
  if (!user) return <Login onAuthenticated={signIn} />;
  if (!user.role) return <RoleSelection user={user} onRoleSelected={setUser} onSignOut={signOut} />;
  return <Suspense fallback={<main className="auth-loading" role="status"><span className="loader" /><p>Opening your project studio…</p></main>}><App user={user} onUserUpdate={setUser} onSignOut={signOut} /></Suspense>;
}
