import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, LogOut, Menu, UserRound, X } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import API, { downloadReport, downloadSynopsis } from "./services/api";
import useDoraMotion from "./components/DoraMotion";

const AmbientBackground = lazy(() => import("./components/AmbientBackground"));
const ProjectModal = lazy(() => import("./components/ProjectModal"));
const IdeaChecker = lazy(() => import("./components/IdeaChecker"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const DiscoveryPage = lazy(() => import("./pages/DiscoveryPage"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
const FieldNotesPage = lazy(() => import("./pages/FieldNotesPage"));
const SavedProjectsPage = lazy(() => import("./pages/SavedProjectsPage"));
const Profile = lazy(() => import("./pages/Profile/Profile"));

const EMPTY_OUTPUTS = { analysis: null, research: null, tech_stack: null, budget_estimation: null, planner: null, evaluation: null, synopsis: null };
const WORKFLOW_STAGES = ["analysis", "research", "tech_stack", "budget_estimation", "planner", "evaluation", "synopsis"];

const projectFingerprint = (project) => [project?.["Project Title"], project?.["Short Description"]]
  .map((value) => String(value || "").trim().replace(/\s+/g, " ").toLowerCase())
  .join("::");

export default function AppShell({ user, onUserUpdate, onSignOut }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [topic, setTopic] = useState("");
  const [pendingDiscoveryQuery, setPendingDiscoveryQuery] = useState("");
  const [projectType, setProjectType] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [outputs, setOutputs] = useState({ ...EMPTY_OUTPUTS });
  const [busyStage, setBusyStage] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [savedProjectsLoading, setSavedProjectsLoading] = useState(true);
  const [savedProjectsError, setSavedProjectsError] = useState("");
  const [workspaceId, setWorkspaceId] = useState(null);
  const [savingWorkspace, setSavingWorkspace] = useState(false);
  const [savingIdeas, setSavingIdeas] = useState([]);
  const savingIdeaKeys = useRef(new Set());
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const shellRef = useRef(null);
  const [systemReducedMotion, setSystemReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [motionEnabled, setMotionEnabled] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches && window.localStorage.getItem("dora-motion") !== "off");
  const routeMotion = motionEnabled && !systemReducedMotion;
  const lenisRef = useDoraMotion(motionEnabled, location.pathname, shellRef);

  useEffect(() => {
    const pageName = ({ "/": "Overview", "/discover": "Discover projects", "/idea-check": "Check an idea", "/how-it-works": "How it works", "/field-notes": "Field notes", "/my-projects": "My projects", "/profile": "Account and preferences", "/workspace": selectedProject?.["Project Title"] || "Project workspace" })[location.pathname] || "Project studio";
    document.title = `${pageName} · Project Dora`;
  }, [location.pathname, selectedProject]);

  useEffect(() => {
    API.get("/search-history").then(({ data }) => setSearchHistory(data)).catch(() => setSearchHistory([]));
    const loadSavedProjects = async () => {
      try {
        const { data } = await API.get("/saved-projects");
        setSavedProjects(Array.isArray(data) ? data : []);
        setSavedProjectsError("");
      } catch {
        setSavedProjectsError("Could not load your saved projects. Check your connection and retry.");
      } finally {
        setSavedProjectsLoading(false);
      }
    };
    loadSavedProjects();
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = (event) => {
      setSystemReducedMotion(event.matches);
      if (event.matches) setMotionEnabled(false);
    };
    media.addEventListener("change", syncMotionPreference);
    return () => media.removeEventListener("change", syncMotionPreference);
  }, []);

  useEffect(() => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { duration: 0.8 });
    else window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname, lenisRef]);

  const toggleMotion = () => {
    if (systemReducedMotion) return;
    setMotionEnabled((current) => {
      const next = !current;
      window.localStorage.setItem("dora-motion", next ? "on" : "off");
      return next;
    });
  };

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const closeOnEscape = (event) => { if (event.key === "Escape") setMobileNavOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileNavOpen]);

  const completedCount = useMemo(() => WORKFLOW_STAGES.filter((key) => outputs[key] && Object.keys(outputs[key]).length).length, [outputs]);

  const runDiscovery = async (searchTopic, selectedType) => {
    const query = searchTopic.trim();
    if (!query || loading || !selectedType) return;
    setTopic(query);
    setLoading(true);
    setError("");
    setNotice("");
    setProjects([]);
    try {
      const { data } = await API.post("/generate-project", { topic: query, project_type: selectedType }, { timeout: 45_000 });
      setProjects(Array.isArray(data.discovery) ? data.discovery : []);
      API.get("/search-history").then(({ data: history }) => setSearchHistory(history)).catch(() => {});
      if (!data.discovery?.length) setNotice("No project ideas came back. Try a broader topic.");
    } catch (requestError) {
      const status = requestError.response?.status;
      setError(requestError.response?.data?.detail || (requestError.code === "ECONNABORTED"
        ? "Project search timed out. Please try again in a moment."
        : status >= 500
            ? "The project search service is temporarily unavailable. Please try again."
            : status
              ? `The backend returned HTTP ${status}. Please try again or contact support.`
              : "Could not connect to Dora's backend. Start the backend and retry your search."));
    } finally {
      setLoading(false);
    }
  };

  const discoverProjects = (event) => {
    event.preventDefault();
    requestDiscovery(topic);
  };

  const requestDiscovery = (searchTopic) => {
    const query = searchTopic.trim();
    if (!query || loading) return;
    setTopic(query);
    setPendingDiscoveryQuery(query);
    setProjectType("");
    setProjects([]);
    setError("");
    setNotice("");
    navigate("/discover");
  };

  const startSelectedDiscovery = () => {
    if (!pendingDiscoveryQuery || !projectType || loading) return;
    const query = pendingDiscoveryQuery;
    const type = projectType;
    setPendingDiscoveryQuery("");
    runDiscovery(query, type);
  };

  const repeatSearch = (query) => {
    requestDiscovery(query);
  };

  const removeSearch = async (id) => {
    try {
      await API.delete(`/search-history/${id}`);
      setSearchHistory((items) => items.filter((item) => item.id !== id));
    } catch {
      setError("Could not remove that search. Please try again.");
    }
  };

  const clearSearchHistory = async () => {
    try {
      await API.delete("/search-history");
      setSearchHistory([]);
    } catch {
      setError("Could not clear search history. Please try again.");
    }
  };

  const openProject = (project) => {
    const existing = savedProjects.find((record) => projectFingerprint(record.project) === projectFingerprint(project));
    if (existing) {
      openSavedProject(existing);
      return;
    }
    setSelectedProject(project);
    setWorkspaceId(null);
    setOutputs({ ...EMPTY_OUTPUTS });
    setError("");
    setNotice("");
    navigate("/workspace");
  };

  const openSavedProject = (record) => {
    setSelectedProject(record.project);
    setWorkspaceId(record.id);
    setOutputs({ ...EMPTY_OUTPUTS, ...(record.outputs || {}) });
    setError("");
    setNotice("");
    navigate("/workspace");
  };

  const updateSavedProjects = (record) => {
    setSavedProjects((items) => [record, ...items.filter((item) => item.id !== record.id)]);
    setSavedProjectsError("");
  };

  const refreshSavedProjects = async () => {
    setSavedProjectsLoading(true);
    setSavedProjectsError("");
    try {
      const { data } = await API.get("/saved-projects");
      setSavedProjects(Array.isArray(data) ? data : []);
    } catch {
      setSavedProjectsError("Could not load your saved projects. Check your connection and retry.");
    } finally {
      setSavedProjectsLoading(false);
    }
  };

  const saveIdea = async (project) => {
    const fingerprint = projectFingerprint(project);
    if (savingIdeaKeys.current.has(fingerprint) || savedProjects.some((record) => projectFingerprint(record.project) === fingerprint)) return;
    savingIdeaKeys.current.add(fingerprint);
    setSavingIdeas((items) => [...items, fingerprint]);
    setError("");
    setNotice("");
    try {
      const { data } = await API.post("/saved-projects", { project, outputs: { ...EMPTY_OUTPUTS } });
      updateSavedProjects(data.project);
      setNotice(`${project["Project Title"] || "Project"} saved to My projects.`);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Could not save this project. Please try again.");
    } finally {
      savingIdeaKeys.current.delete(fingerprint);
      setSavingIdeas((items) => items.filter((item) => item !== fingerprint));
    }
  };

  const isProjectSaved = (project) => savedProjects.some((record) => projectFingerprint(record.project) === projectFingerprint(project));
  const isProjectSaving = (project) => savingIdeas.includes(projectFingerprint(project));

  const persistWorkspace = async (nextOutputs = outputs) => {
    if (!selectedProject) throw new Error("Choose a project before saving your workspace.");
    const payload = { project: selectedProject, outputs: nextOutputs };
    const { data } = workspaceId
      ? await API.put(`/saved-projects/${workspaceId}`, payload)
      : await API.post("/saved-projects", payload);
    setWorkspaceId(data.project.id);
    updateSavedProjects(data.project);
    return data.project;
  };

  const saveWorkspace = async () => {
    if (savingWorkspace) return;
    setSavingWorkspace(true);
    setError("");
    setNotice("");
    try {
      await persistWorkspace();
      setNotice("Workspace saved. You can continue it from My projects.");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.message || "Could not save this workspace. Please try again.");
    } finally {
      setSavingWorkspace(false);
    }
  };

  const removeSavedProject = async (projectId) => {
    const record = savedProjects.find((item) => item.id === projectId);
    if (!record || !window.confirm(`Remove “${record.project?.["Project Title"] || "this project"}” from My projects?`)) return;
    try {
      await API.delete(`/saved-projects/${projectId}`);
      setSavedProjects((items) => items.filter((item) => item.id !== projectId));
      setSavedProjectsError("");
      if (workspaceId === projectId) setWorkspaceId(null);
    } catch (requestError) {
      setSavedProjectsError(requestError.response?.data?.detail || "Could not remove that project. Please try again.");
    }
  };

  const closeWorkspace = () => {
    if (!busyStage) {
      setSelectedProject(null);
      setOutputs({ ...EMPTY_OUTPUTS });
      navigate("/discover");
    }
  };

  const nextAgent = async () => {
    const nextStage = WORKFLOW_STAGES.find((key) => !outputs[key]);
    if (!nextStage || busyStage) return;
    setBusyStage(nextStage);
    setError("");
    setNotice("");
    try {
      const { data } = await API.post("/next-agent", { stage: nextStage, project: selectedProject, ...outputs });
      if (data.stage !== nextStage || !data.result || typeof data.result !== "object") throw new Error("The agent returned an incomplete result. Please try again.");
      const nextOutputs = { ...outputs, [nextStage]: data.result };
      setOutputs(nextOutputs);
      try {
        await persistWorkspace(nextOutputs);
        setNotice(`${stageLabel(nextStage)} complete and saved.`);
      } catch {
        setError(`${stageLabel(nextStage)} completed, but Dora could not save it. Use “Save project” and try again.`);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.message || "The agent could not complete this step. Please try again.");
    } finally {
      setBusyStage(null);
    }
  };

  const exportPdf = async (kind) => {
    setError("");
    try {
      if (kind === "synopsis") {
        await downloadSynopsis(selectedProject, outputs.synopsis);
        setNotice("Synopsis PDF downloaded.");
      } else {
        await downloadReport(selectedProject, outputs);
        setNotice("Complete project report downloaded.");
      }
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "The PDF could not be generated. Please try again.");
    }
  };

  const workspaceProps = { project: selectedProject, outputs, completedCount, busyStage, error, notice, isSaved: Boolean(workspaceId), saving: savingWorkspace, onSave: saveWorkspace, onNext: nextAgent, onDownload: exportPdf, onClose: closeWorkspace };

  return <MotionConfig reducedMotion={routeMotion ? "never" : "always"}>
    <main ref={shellRef} className={"app-shell " + (motionEnabled ? "motion-enabled" : "motion-off")}>
    <span className="reading-progress" aria-hidden="true" />
    <Suspense fallback={null}>{motionEnabled && !systemReducedMotion && location.pathname !== "/" && <AmbientBackground enabled />}</Suspense>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="topbar">
      <Link className="brand" to="/" aria-label="Project Dora overview"><span className="brand-mark">D</span><span className="brand-lockup"><span>Dora<span className="brand-dot">.</span></span><small>PROJECT STUDIO</small></span></Link>
      <nav className="site-nav" aria-label="Main navigation">
        <NavigationLink to="/" end layoutId="desktop-nav-active">Overview</NavigationLink>
        <NavigationLink to="/discover" layoutId="desktop-nav-active" forceActive={location.pathname === "/workspace"}>Discover</NavigationLink>
        <NavigationLink to="/idea-check" layoutId="desktop-nav-active">Check an idea</NavigationLink>
        <NavigationLink to="/my-projects" layoutId="desktop-nav-active">My projects</NavigationLink>
        <NavigationLink to="/how-it-works" layoutId="desktop-nav-active">How it works</NavigationLink>
        <NavigationLink to="/field-notes" layoutId="desktop-nav-active">Field notes</NavigationLink>
      </nav>
      <div className="topbar-account">
        <button type="button" className="mobile-nav-toggle" aria-expanded={mobileNavOpen} aria-controls="mobile-navigation" aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"} onClick={() => setMobileNavOpen((open) => !open)}>{mobileNavOpen ? <X size={18} /> : <Menu size={18} />}</button>
        <button type="button" className="motion-toggle" role="switch" aria-checked={motionEnabled} aria-label={motionEnabled ? "Turn ambient motion off" : "Turn ambient motion on"} title={systemReducedMotion ? "Motion is disabled by your system setting" : "Toggle ambient motion"} onClick={toggleMotion} disabled={systemReducedMotion}><span className="motion-toggle-label">Motion</span><span className="motion-toggle-track"><span /></span></button><Link className="account-profile-link" to="/profile" aria-label="Account and preferences"><span className="account-avatar" aria-hidden="true">{user?.name?.slice(0, 1)?.toUpperCase() || "D"}</span><span className="topbar-note">{user?.name}</span><UserRound className="account-profile-icon" size={14} aria-hidden="true" /></Link><button type="button" className="signout-button" onClick={onSignOut} aria-label="Sign out"><LogOut size={15} /><span>Sign out</span></button>
      </div>
      <AnimatePresence>
        {mobileNavOpen && <motion.nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: routeMotion ? 0.2 : 0 }}>
          <NavigationLink to="/" end layoutId="mobile-nav-active" onNavigate={() => setMobileNavOpen(false)}>Overview</NavigationLink>
          <NavigationLink to="/discover" layoutId="mobile-nav-active" forceActive={location.pathname === "/workspace"} onNavigate={() => setMobileNavOpen(false)}>Discover</NavigationLink>
          <NavigationLink to="/idea-check" layoutId="mobile-nav-active" onNavigate={() => setMobileNavOpen(false)}>Check an idea</NavigationLink>
          <NavigationLink to="/my-projects" layoutId="mobile-nav-active" onNavigate={() => setMobileNavOpen(false)}>My projects</NavigationLink>
          <NavigationLink to="/profile" layoutId="mobile-nav-active" onNavigate={() => setMobileNavOpen(false)}>Account</NavigationLink>
          <NavigationLink to="/how-it-works" layoutId="mobile-nav-active" onNavigate={() => setMobileNavOpen(false)}>How it works</NavigationLink>
          <NavigationLink to="/field-notes" layoutId="mobile-nav-active" onNavigate={() => setMobileNavOpen(false)}>Field notes</NavigationLink>
        </motion.nav>}
      </AnimatePresence>
    </header>

    <div id="main-content" className="route-content">
      {(error || notice) && location.pathname === "/discover" && <div className={error ? "banner banner-error" : "banner"} role={error ? "alert" : "status"}>{error || notice}</div>}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={location.pathname} className="route-transition" initial={routeMotion ? { opacity: 0, y: 10 } : false} animate={{ opacity: 1, y: 0 }} exit={routeMotion ? { opacity: 0, y: -4 } : undefined} transition={{ duration: routeMotion ? 0.27 : 0, ease: [0.22, 1, 0.36, 1] }}>
      <Suspense fallback={<div className="route-loading" role="status"><span className="loader" /><span>Opening your project studio…</span></div>}>
      <Routes location={location}>
        <Route path="/" element={<DashboardPage history={searchHistory} onRepeatSearch={repeatSearch} onStartDiscovery={requestDiscovery} loading={loading} />} />
        <Route path="/discover" element={<DiscoveryPage topic={topic} setTopic={setTopic} projects={projects} loading={loading} history={searchHistory} onDiscover={discoverProjects} onRepeatSearch={repeatSearch} onRemoveSearch={removeSearch} onClearHistory={clearSearchHistory} onOpenProject={openProject} onSaveProject={saveIdea} isProjectSaved={isProjectSaved} isProjectSaving={isProjectSaving} pendingQuery={pendingDiscoveryQuery} projectType={projectType} setProjectType={setProjectType} onStartDiscovery={startSelectedDiscovery} onCancelDiscovery={() => setPendingDiscoveryQuery("")} />} />
        <Route path="/idea-check" element={<div className="route-page idea-route"><IdeaChecker /></div>} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/field-notes" element={<FieldNotesPage />} />
        <Route path="/my-projects" element={<SavedProjectsPage projects={savedProjects} loading={savedProjectsLoading} error={savedProjectsError} onRefresh={refreshSavedProjects} onOpen={openSavedProject} onRemove={removeSavedProject} />} />
        <Route path="/profile" element={<Profile user={user} onUserUpdate={onUserUpdate} motionEnabled={motionEnabled} onToggleMotion={toggleMotion} reducedMotion={systemReducedMotion} />} />
        <Route path="/workspace" element={selectedProject ? <ProjectModal {...workspaceProps} /> : <Navigate to="/discover" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>

    {location.pathname !== "/workspace" && <footer className="site-footer"><Link className="brand" to="/" aria-label="Project Dora home"><span className="brand-mark">D</span><span>Dora<span className="brand-dot">.</span></span></Link><span>Project discovery, with a plan to match.</span><Link className="footer-top" to="/">Back to overview <ArrowRight size={13} /></Link></footer>}
    </main>
  </MotionConfig>;
}

function NavigationLink({ to, end = false, layoutId, forceActive = false, onNavigate, children }) {
  return <NavLink to={to} end={end} onClick={onNavigate} className={({ isActive }) => isActive || forceActive ? "active" : ""}>
    {({ isActive }) => <>{(isActive || forceActive) && <motion.span className="nav-active-pill" layoutId={layoutId} transition={{ type: "spring", stiffness: 430, damping: 34 }} aria-hidden="true" />}<span className="nav-link-label">{children}</span></>}
  </NavLink>;
}

function stageLabel(stage) {
  return ({ analysis: "Analysis", research: "Research", tech_stack: "Technology stack", budget_estimation: "Budget estimate", planner: "Development plan", evaluation: "Feasibility review", synopsis: "Synopsis" })[stage] || stage;
}
