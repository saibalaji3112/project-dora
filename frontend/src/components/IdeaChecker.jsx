import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, SearchCheck } from "lucide-react";
import API from "../services/api";

function SearchSource({ title, source }) {
  const results = Array.isArray(source?.results) ? source.results : [];
  const state = source?.status || "unavailable";
  return <section className="check-source">
    <div className="check-source-heading"><h3>{title}</h3><span>{state === "available" ? `${results.length} ${results.length === 1 ? "result" : "results"}` : state.replaceAll("_", " ")}</span></div>
    {source?.message && <p className="source-message">{source.message}</p>}
    {results.length ? <div className="match-list">{results.map((match, index) => <article className="match-card" key={match.url || `${match.title || "match"}-${index}`}>
      {match.url ? <a href={match.url} target="_blank" rel="noreferrer">{match.title || "Open source"}<ArrowUpRight size={13} aria-hidden="true" /></a> : <strong>{match.title || "Untitled source"}</strong>}
      {match.description && <p>{match.description}</p>}
      <div className="match-meta">
        {match.publisher && <span>{match.publisher_kind || "Publisher"}: {match.publisher}</span>}
        {match.date && <span>{match.date_label || "Date"}: {match.date}</span>}
        {match.updated && <span>Updated: {match.updated}</span>}
        {match.metrics && <span>{match.metrics}</span>}
      </div>
    </article>)}</div> : state === "available" ? <p className="source-empty">No matches surfaced from this source for this search.</p> : null}
  </section>;
}

export default function IdeaChecker() {
  const [idea, setIdea] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (idea.trim().length < 10) { setError("Add a little more detail (at least 10 characters) so Dora can search meaningfully."); return; }
    setLoading(true);
    setError("");
    setReport(null);
    try {
      const { data } = await API.post("/check-idea", { idea: idea.trim() });
      setReport(data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Could not check this idea. Please try again.");
    } finally { setLoading(false); }
  };

  return <section className="idea-checker" id="idea-check" aria-labelledby="idea-check-title" aria-busy={loading}>
    <div className="checker-heading"><span className="eyebrow">ALREADY HAVE A PROJECT IDEA?</span><h2 id="idea-check-title">Check what already exists</h2><p>Search public products and open-source projects. Compare the linked evidence before choosing your scope.</p></div>
    <form className="checker-form" onSubmit={submit}>
      <label htmlFor="idea-check-input">Describe the project you plan to build</label>
      <textarea id="idea-check-input" value={idea} onChange={(event) => { setIdea(event.target.value); if (error) setError(""); }} maxLength={1000} minLength={10} rows={4} placeholder="Example: a campus app that predicts cafeteria demand and reduces food waste using meal bookings and past sales" aria-invalid={Boolean(error)} aria-describedby={error ? "idea-check-error idea-check-help" : "idea-check-help"} />
      <div className="checker-actions"><span id="idea-check-help">{idea.length}/1000 · Specific details improve matching</span><button className="button button-primary" disabled={loading}>{loading ? <><span className="button-spinner" /> Searching public sources</> : <>Check my idea <ArrowUpRight size={15} aria-hidden="true" /></>}</button></div>
    </form>
    <AnimatePresence initial={false}>
      {error && <motion.p id="idea-check-error" className="checker-error" role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>{error}</motion.p>}
      {loading && <motion.div className="checker-wait" role="status" aria-live="polite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SearchCheck size={16} aria-hidden="true" /><span>Checking public web results and open-source repositories…</span></motion.div>}
      {report && <motion.div className="checker-report" key="report" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28 }}>
        <div className={`checker-summary ${report.status || "unavailable"}`}><strong>{report.status === "matches_found" ? "Potential matches found" : report.status === "partial" ? "Partial search results" : report.status === "unavailable" ? "Search sources unavailable" : "No matches surfaced"}</strong><p>{report.summary || "Review the source results below and compare their scope with your idea."}</p></div>
        {report.sources?.web && <SearchSource title="Web products and organizations" source={report.sources.web} />}
        {report.sources?.github && <SearchSource title="Open-source projects" source={report.sources.github} />}
        {report.scope_note && <p className="scope-note">{report.scope_note}</p>}
        <p className="evidence-note">Search matches are research signals, not proof that an idea is unique or a legal ownership assessment. Open the sources and verify details before deciding.</p>
      </motion.div>}
    </AnimatePresence>
  </section>;
}
