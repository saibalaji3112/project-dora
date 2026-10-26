import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Cpu, Layers3, Search, SlidersHorizontal, Sparkles, Monitor } from "lucide-react";
import ProjectCard from "../components/cards/ProjectCard";

const TOPICS = ["AI & data", "Healthcare", "Cybersecurity", "Sustainability"];
const emptyTransitions = { duration: 0.22, ease: [0.22, 1, 0.36, 1] };

const PROJECT_TYPES = [  { id: "software", title: "Software", detail: "Apps, platforms, AI and data systems", Icon: Monitor },  { id: "hardware", title: "Hardware", detail: "Devices, electronics and embedded systems", Icon: Cpu },  { id: "combined", title: "Combined", detail: "A connected hardware and software solution", Icon: Layers3 },];export default function DiscoveryPage({ topic, setTopic, projects, loading, history, onDiscover, onRepeatSearch, onRemoveSearch, onClearHistory, onOpenProject, onSaveProject, isProjectSaved, isProjectSaving, pendingQuery, projectType, setProjectType, onStartDiscovery, onCancelDiscovery }) {
  const [resultQuery, setResultQuery] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const visibleProjects = useMemo(() => {
    const query = resultQuery.trim().toLowerCase();
    const filtered = projects.filter((project) => {
      if (!query) return true;
      const searchable = [project["Project Title"], project["Short Description"], project["Major Modules"], project["Recommended Tech Stack"]]
        .flatMap((item) => Array.isArray(item) ? item : [item ?? ""]).join(" ").toLowerCase();
      return searchable.includes(query);
    });
    if (sortBy === "title") return [...filtered].sort((a, b) => (a["Project Title"] || "").localeCompare(b["Project Title"] || ""));
    return filtered;
  }, [projects, resultQuery, sortBy]);

  return <div className="route-page discovery-page">
    <section className="page-intro">
      <span className="eyebrow"><span className="status-dot" /> PROJECT DISCOVERY</span>
      <h1>Find a direction<br /><em>worth exploring.</em></h1>
      <p>Start with a domain, challenge, or real-world problem. Dora will suggest practical project concepts to build on.</p>
    </section>

    <section className="discovery-search-panel" aria-label="Search project ideas">
      <form className="search-form" onSubmit={onDiscover}>
        <Search className="search-icon" size={18} aria-hidden="true" />
        <label className="sr-only" htmlFor="topic">Project domain or problem</label>
        <input id="topic" value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Try: climate technology, fintech, computer vision" maxLength={120} autoComplete="off" />
        <button className="button button-primary" type="submit" disabled={loading || !topic.trim()}>{loading ? <><span className="button-spinner" /> Exploring</> : <>Explore ideas <ArrowRight size={15} /></>}</button>
      </form>
      <div className="topic-hints"><span>Start with a domain</span>{TOPICS.map((item) => <button key={item} type="button" onClick={() => setTopic(item)}>{item}</button>)}</div>      {pendingQuery && <section className="project-type-picker" aria-labelledby="project-type-heading">        <div className="project-type-heading"><span className="eyebrow">ONE QUICK CHOICE</span><h2 id="project-type-heading">What kind of project should we find?</h2><p>For <strong>{pendingQuery}</strong>, choose a format before Dora starts generating ideas.</p></div>        <div className="project-type-options" role="group" aria-label="Project format">          {PROJECT_TYPES.map(({ id, title, detail, Icon }) => <button key={id} type="button" className={`project-type-option${projectType === id ? " is-selected" : ""}`} aria-pressed={projectType === id} onClick={() => setProjectType(id)}><span className="project-type-icon"><Icon size={19} /></span><span className="project-type-copy"><strong>{title}</strong><small>{detail}</small></span><span className="project-type-check" aria-hidden="true" /></button>)}        </div>        <div className="project-type-actions"><button type="button" className="quiet-link" onClick={onCancelDiscovery}>Cancel</button><button type="button" className="button button-primary" onClick={onStartDiscovery} disabled={!projectType || loading}>Find project ideas <ArrowRight size={15} /></button></div>      </section>}
      {history.length > 0 && <div className="history-panel"><div className="history-heading"><span>Recent searches</span><button type="button" onClick={onClearHistory}>Clear history</button></div><div className="history-list">{history.map((item) => <span className="history-chip" key={item.id}><button type="button" title={`Search again: ${item.query}`} onClick={() => onRepeatSearch(item.query)}>{item.query}</button><button type="button" aria-label={`Remove ${item.query}`} onClick={() => onRemoveSearch(item.id)}>×</button></span>)}</div></div>}
    </section>

    <section className="results-section" aria-live="polite" aria-busy={loading}>
      <div className="section-heading"><div><span className="eyebrow">IDEA LIBRARY</span><h2>{projects.length ? "Ideas for your domain" : "What will you make useful?"}</h2></div><span className="result-count">{projects.length ? `${visibleProjects.length} of ${projects.length} ${projects.length === 1 ? "idea" : "ideas"}` : "Ideas are tailored to your search"}</span></div>
      {projects.length > 0 && !loading && <div className="idea-controls">
        <label className="idea-filter"><Search size={16} aria-hidden="true" /><span className="sr-only">Filter project ideas</span><input value={resultQuery} onChange={(event) => setResultQuery(event.target.value)} placeholder="Filter these ideas" /></label>
        <label className="idea-sort"><SlidersHorizontal size={15} aria-hidden="true" /><span>Sort</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort project ideas"><option value="recommended">Recommended</option><option value="title">Project name</option></select></label>
      </div>}
      <AnimatePresence mode="wait" initial={false}>
        {loading ? <motion.div className="discovery-loading" key="loading" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={emptyTransitions} role="status" aria-live="polite">
          <div className="loading-panel"><span className="loader" /><div><strong>Finding useful project directions</strong><span>Checking the brief and shaping a practical set of ideas…</span></div></div>
          <div className="project-skeleton-grid" aria-hidden="true">{[0, 1, 2].map((item) => <div className="project-skeleton" key={item}><i /><i /><i /><i /></div>)}</div>
        </motion.div> : projects.length === 0 ? <motion.div className="empty-state" key="empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={emptyTransitions}>
          <div className="empty-icon"><Sparkles size={18} aria-hidden="true" /></div><div><strong>Start with a domain you care about</strong><p>Each result includes a focused problem, achievable scope, and a path to start building.</p></div>
        </motion.div> : visibleProjects.length === 0 ? <motion.div className="empty-state filter-empty" key="no-filter-results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={emptyTransitions}>
          <div className="empty-icon"><Search size={17} aria-hidden="true" /></div><div><strong>No ideas match “{resultQuery}”</strong><p>Try a shorter keyword or clear the filter to see every idea again.</p></div><button className="quiet-link" type="button" onClick={() => setResultQuery("")}>Clear filter</button>
        </motion.div> : <motion.div className="project-grid" key="results" layout>
          <AnimatePresence initial={false}>
            {visibleProjects.map((project) => <ProjectCard key={project.id || `${project["Project Title"] || "idea"}-${projects.indexOf(project)}`} project={project} index={projects.indexOf(project)} onOpen={() => onOpenProject(project)} onSave={onSaveProject} isSaved={isProjectSaved(project)} isSaving={isProjectSaving(project)} />)}
          </AnimatePresence>
        </motion.div>}
      </AnimatePresence>
      {projects.length > 0 && <p className="source-caveat">Generated project ideas are starting points. Review the scope, available tools, and evidence before committing.</p>}
    </section>
  </div>;
}
