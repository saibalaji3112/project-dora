import { useMemo, useState } from "react";
import { ArrowRight, Bookmark, Clock3, FolderOpen, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const STAGES = ["analysis", "research", "tech_stack", "budget_estimation", "planner", "evaluation", "synopsis"];

export default function SavedProjectsPage({ projects, loading, error, onRefresh, onOpen, onRemove }) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState("all");
  const visible = useMemo(() => projects.filter((item) => {
    const title = item.project?.["Project Title"] || "";
    const description = item.project?.["Short Description"] || "";
    const matchesQuery = `${title} ${description}`.toLowerCase().includes(query.trim().toLowerCase());
    const count = STAGES.filter((stage) => item.outputs?.[stage] && Object.keys(item.outputs[stage]).length).length;
    return matchesQuery && (view === "all" || (view === "complete" ? count === STAGES.length : count < STAGES.length));
  }), [projects, query, view]);

  return <div className="route-page saved-projects-page">
    <section className="page-intro saved-projects-intro">
      <span className="eyebrow"><Bookmark size={13} aria-hidden="true" /> YOUR PROJECT LIBRARY</span>
      <h1>Good work,<br /><em>kept together.</em></h1>
      <p>Saved ideas and project plans stay in your account. Pick up a workflow where you left off, or remove a project you no longer need.</p>
    </section>

    <section className="saved-library" aria-labelledby="saved-library-title" aria-busy={loading}>
      <div className="saved-library-heading">
        <div><span className="eyebrow">PERSONAL WORKSPACE</span><h2 id="saved-library-title">My projects <span>{projects.length}</span></h2></div>
        <Link className="button button-secondary" to="/discover">Find an idea <ArrowRight size={15} aria-hidden="true" /></Link>
      </div>
      {error && <div className="banner banner-error" role="alert">{error}</div>}
      {projects.length > 0 && <div className="saved-project-controls">
        <label className="saved-project-search"><Search size={16} aria-hidden="true" /><span className="sr-only">Search saved projects</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your projects" /></label>
        <div className="saved-project-tabs" role="group" aria-label="Filter saved projects">
          {[ ["all", "All projects"], ["active", "In progress"], ["complete", "Complete"] ].map(([id, label]) => <button type="button" key={id} className={view === id ? "active" : ""} aria-pressed={view === id} onClick={() => setView(id)}>{label}</button>)}
        </div>
      </div>}

      {loading ? <div className="saved-project-empty" role="status"><span className="loader" /><strong>Loading your project library…</strong></div>
        : error ? <div className="saved-project-empty"><span className="saved-project-empty-icon"><FolderOpen size={20} aria-hidden="true" /></span><strong>Your library could not be loaded</strong><p>Check your connection and try again.</p><button type="button" className="button button-primary" onClick={onRefresh}>Try again <ArrowRight size={15} aria-hidden="true" /></button></div>
        : visible.length ? <div className="saved-project-grid">{visible.map((item) => {
          const project = item.project || {};
          const complete = STAGES.filter((stage) => item.outputs?.[stage] && Object.keys(item.outputs[stage]).length).length;
          const format = project["Project Format"] || "Project";
          return <article className="saved-project-card" key={item.id}>
            <div className="saved-project-card-top"><span>{format}</span><button type="button" className="saved-project-remove" aria-label={`Remove ${project["Project Title"] || "project"} from your library`} title="Remove project" onClick={() => onRemove(item.id)}><Trash2 size={15} aria-hidden="true" /></button></div>
            <h3>{project["Project Title"] || "Untitled project"}</h3>
            <p>{project["Short Description"] || "No project description was saved."}</p>
            <div className="saved-project-progress"><span><strong>{complete}</strong> of {STAGES.length} steps complete</span><span className="saved-project-updated"><Clock3 size={12} aria-hidden="true" /> Updated {new Date(item.updated_at * 1000).toLocaleDateString()}</span></div>
            <div className="saved-project-track" aria-label={`${complete} of ${STAGES.length} steps complete`}><span style={{ width: `${complete / STAGES.length * 100}%` }} /></div>
            <button type="button" className="text-button" onClick={() => onOpen(item)}>{complete ? "Continue project" : "Open project"}<ArrowRight size={15} aria-hidden="true" /></button>
          </article>;
        })}</div>
        : <div className="saved-project-empty">
          <span className="saved-project-empty-icon"><FolderOpen size={20} aria-hidden="true" /></span>
          <strong>{projects.length ? "No projects match this view" : "Your project library is ready"}</strong>
          <p>{projects.length ? "Try a different search or filter." : "Save a discovery idea or start its workflow; Dora will keep your progress here."}</p>
          {!projects.length && <Link className="button button-primary" to="/discover">Explore project ideas <ArrowRight size={15} aria-hidden="true" /></Link>}
        </div>}
    </section>
  </div>;
}
