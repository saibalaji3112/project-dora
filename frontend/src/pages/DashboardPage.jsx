import { useState } from "react";
import { ArrowRight, Bookmark, Clock3, Compass, FileCheck2, Search, SearchCheck } from "lucide-react";
import { Link } from "react-router-dom";

const capabilities = [
  { icon: Compass, label: "Find a direction", detail: "Explore distinct project ideas shaped around your domain.", to: "/discover" },
  { icon: SearchCheck, label: "Check the landscape", detail: "Compare your own idea with public products and repositories.", to: "/idea-check" },
  { icon: Bookmark, label: "Keep your work together", detail: "Save ideas and resume each project plan from your personal library.", to: "/my-projects" },
  { icon: FileCheck2, label: "Plan the build", detail: "Move from project analysis to milestones and a clear synopsis.", to: "/how-it-works" },
];

export default function DashboardPage({ history, onRepeatSearch, onStartDiscovery, loading }) {
  const [query, setQuery] = useState("");
  const startSearch = (event) => {
    event.preventDefault();
    if (!query.trim() || loading) return;
    onStartDiscovery(query.trim());
  };

  return <div className="route-page dashboard-page">
    <section className="dashboard-hero">
      <div className="dashboard-copy">
        <span className="eyebrow"><span className="status-dot" /> YOUR PROJECT STUDIO</span>
        <h1>Good ideas deserve<br /><em>a clear way forward.</em></h1>
        <p>Explore project directions, check what already exists, and build a practical plan at your own pace.</p>
        <form className="dashboard-quick-search" onSubmit={startSearch}>
          <Search size={18} aria-hidden="true" />
          <label className="sr-only" htmlFor="dashboard-topic">Enter a project domain</label>
          <input id="dashboard-topic" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="What do you want to build? Try a domain…" maxLength={120} />
          <button type="submit" aria-label="Explore this project domain" disabled={loading || !query.trim()}>{loading ? <span className="button-spinner" /> : <ArrowRight size={17} aria-hidden="true" />}</button>
        </form>
        <div className="dashboard-actions"><Link className="quiet-link" to="/idea-check">I already have an idea to check <ArrowRight size={14} /></Link><Link className="quiet-link" to="/how-it-works">See how the project plan works <ArrowRight size={14} /></Link></div>
      </div>

      <div className="dashboard-showcase" aria-label="Illustrative preview of the project discovery workspace">
        <div className="showcase-back-window" aria-hidden="true">
          <div className="showcase-window-bar"><i /><i /><i /><span>PROJECT DORA / WORKSPACE</span></div>
          <div className="showcase-back-content"><span>YOUR NEXT PROJECT</span><b>From question<br />to first milestone.</b><div className="showcase-lines"><i /><i /><i /></div></div>
        </div>
        <div className="showcase-paper-card" aria-hidden="true">
          <span className="showcase-paper-label">A CLEAR WAY FORWARD</span>
          <b>Ideas<br /><em>with a plan.</em></b>
          <div className="showcase-paper-steps"><span>01&nbsp; Discover</span><span>02&nbsp; Validate</span><span>03&nbsp; Build</span></div>
        </div>
        <div className="showcase-float-note" aria-hidden="true"><span className="showcase-spark">✳</span><span><b>Project studio</b><small>Ideas · Evidence · Execution</small></span></div>
        <span className="showcase-caption">A workspace for your next good question <ArrowRight size={13} /></span>
      </div>
    </section>

    <section className="capabilities-section">
      <div className="route-heading"><div><span className="eyebrow">A PRACTICAL PLACE TO START</span><h2>Explore the idea before you build it.</h2></div><p>Use one tool or follow the full path from discovery to a buildable outline.</p></div>
      <div className="capability-grid">{capabilities.map(({ icon: Icon, label, detail, to }, index) => <Link className="capability-card" to={to} key={label} style={{ "--card-index": index }}><span className="capability-icon"><Icon size={19} strokeWidth={1.8} /></span><span className="capability-index">0{index + 1}</span><h3>{label}</h3><p>{detail}</p><span className="capability-link">Open <ArrowRight size={14} /></span></Link>)}</div>
    </section>

    <section className="recent-section">
      <div className="route-heading recent-heading"><div><span className="eyebrow"><Clock3 size={13} /> RECENT SEARCHES</span><h2>Pick up where you left off.</h2></div><Link className="quiet-link" to="/discover">All searches <ArrowRight size={14} /></Link></div>
      {history.length ? <div className="recent-list">{history.slice(0, 4).map((item, index) => <button type="button" className="recent-item" key={item.id} onClick={() => onRepeatSearch(item.query)}><span className="recent-index">{String(index + 1).padStart(2, "0")}</span><span className="recent-query">{item.query}</span><ArrowRight className="recent-arrow" size={16} /></button>)}</div> : <div className="recent-empty"><span className="recent-empty-icon"><Clock3 size={17} /></span><span><strong>Your search history will appear here</strong><small>Start by exploring a domain that interests you.</small></span><Link to="/discover">Explore now <ArrowRight size={13} /></Link></div>}
    </section>
  </div>;
}
