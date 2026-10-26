import { useEffect, useRef } from "react";
import { Bookmark, Check, X } from "lucide-react";
import { createPortal } from "react-dom";

const STAGES = [
  { key: "analysis", name: "Analysis", detail: "Understand the problem, users, and practical challenges." },
  { key: "research", name: "Research brief", detail: "Frame the research gap, trends, tools, and opportunities." },
  { key: "tech_stack", name: "Technology stack", detail: "Choose suitable technologies for this project." },
  { key: "budget_estimation", name: "Project budget estimate", detail: "Estimate relevant project costs, assumptions, and ways to save." },
  { key: "planner", name: "Development plan", detail: "Turn the idea into a sequence of buildable milestones." },
  { key: "evaluation", name: "Project evaluation", detail: "Review feasibility, risks, value, and next improvements." },
  { key: "synopsis", name: "Project synopsis", detail: "Compile a concise academic synopsis from the completed work." },
];

function ProjectModal({ project, outputs, completedCount, busyStage, error, notice, isSaved, saving, onSave, onNext, onDownload, onClose }) {
  const stages = STAGES;
  const nextStage = stages.find((stage) => !outputs[stage.key]);
  const busyLabel = stages.find((stage) => stage.key === busyStage)?.name;
  const dialogRef = useRef(null);
  const busyStageRef = useRef(busyStage);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    busyStageRef.current = busyStage;
    onCloseRef.current = onClose;
  }, [busyStage, onClose]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => dialogRef.current?.querySelector(".icon-button")?.focus());
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !busyStageRef.current) { event.preventDefault(); onCloseRef.current(); return; }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const controls = [...dialogRef.current.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])')];
      if (!controls.length) { event.preventDefault(); return; }
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
      else document.getElementById("topic")?.focus();
    };
  }, []);

  return createPortal(<div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busyStage) onClose(); }}>
    <section ref={dialogRef} className="workflow-modal" role="dialog" aria-modal="true" aria-labelledby="workflow-title" aria-describedby="workflow-description" aria-busy={Boolean(busyStage)}>
      <header className="modal-header">
        <div><span className="eyebrow">PROJECT WORKSPACE</span><h2 id="workflow-title">{project["Project Title"] || "Project details"}</h2></div>
        <div className="modal-header-actions">
          <button className={`button ${isSaved ? "button-saved" : "button-secondary"}`} type="button" onClick={onSave} disabled={Boolean(busyStage) || saving} aria-pressed={Boolean(isSaved)}>{saving ? <><span className="button-spinner" /> Saving…</> : isSaved ? <><Check size={15} aria-hidden="true" /> Saved to My projects</> : <><Bookmark size={15} aria-hidden="true" /> Save project</>}</button>
          <button className="icon-button" type="button" onClick={() => { if (!busyStage) onClose(); }} aria-disabled={Boolean(busyStage)} aria-label="Close project workspace"><X size={18} aria-hidden="true" /></button>
        </div>
      </header>

      <div className="modal-intro">
        <p id="workflow-description">{project["Short Description"]}</p>
        <div className="workflow-meta">
          {project["Estimated Development Time"] && <span><b>Timeline</b>{project["Estimated Development Time"]}</span>}
          {project["Recommended Tech Stack"] && <span><b>Suggested stack</b>{project["Recommended Tech Stack"]}</span>}
        </div>
      </div>

      <div className="workflow-progress" aria-label={`${completedCount} of ${stages.length} agent steps complete`}>
        <div className="progress-label"><span>Agent workflow</span><strong>{completedCount} <small>/ {stages.length} complete</small></strong></div>
        <div className="progress-track"><span style={{ width: `${(completedCount / stages.length) * 100}%` }} /></div>
        <ol className="step-list">{stages.map((stage, index) => {
          const complete = Boolean(outputs[stage.key]);
          const active = !complete && nextStage?.key === stage.key;
          return <li className={complete ? "step complete" : active ? "step active" : "step"} key={stage.key}>
            <span className="step-marker">{complete ? "✓" : String(index + 1).padStart(2, "0")}</span><span>{stage.name}</span>
          </li>;
        })}</ol>
      </div>

      <div className="workflow-action">
        <div><span className="eyebrow">{nextStage ? `UP NEXT · ${nextStage.name.toUpperCase()}` : "WORKFLOW COMPLETE"}</span><p>{nextStage ? nextStage.detail : "All seven agent outputs are ready. Download the complete report or the synopsis on its own."}</p></div>
        {nextStage && <button className="button button-primary" type="button" onClick={onNext} disabled={Boolean(busyStage)}>{busyStage ? <><span className="button-spinner" /> {busyLabel}…</> : <>Run next agent <span aria-hidden="true">→</span></>}</button>}
      </div>

      {(error || notice) && <div className={error ? "banner banner-error" : "banner"} role={error ? "alert" : "status"}>{error || notice}</div>}

      <div className="agent-results">
        {stages.map((stage, index) => <article className={`agent-card${outputs[stage.key] ? " is-complete" : " is-pending"}`} key={stage.key}>
          <div className="agent-card-head"><div><span className="agent-index">{String(index + 1).padStart(2, "0")}</span><div><h3>{stage.name}</h3><p>{stage.detail}</p></div></div><span className={outputs[stage.key] ? "stage-badge completed" : "stage-badge"}>{outputs[stage.key] ? "Complete" : "Waiting"}</span></div>
          {outputs[stage.key] && <ObjectFields value={outputs[stage.key]} />}
          {outputs[stage.key] && stages[index + 1] && <div className="agent-next-action">
            <button className="button button-primary" type="button" onClick={onNext} disabled={Boolean(busyStage)} aria-label={`Run ${stages[index + 1].name} agent`}>
              {busyStage ? <><span className="button-spinner" /> {busyLabel}…</> : <>Run {stages[index + 1].name} agent <span aria-hidden="true">→</span></>}
            </button>
          </div>}
        </article>)}
      </div>

      <footer className="modal-footer">
        <span>{busyStage ? `Dora is generating ${busyLabel?.toLowerCase()}…` : "Each step uses the outputs from the completed steps before it."}</span>
        <div className="download-actions">
          {outputs.synopsis && <button className="button button-secondary" type="button" onClick={() => onDownload("synopsis")}>Download synopsis PDF</button>}
          {completedCount === stages.length && <button className="button button-primary" type="button" onClick={() => onDownload("report")}>Download complete report</button>}
        </div>
      </footer>
    </section>
  </div>, document.body);
}

function ObjectFields({ value }) {
  if (!value || typeof value !== "object") return null;
  const entries = Object.entries(value).filter(([, item]) => hasContent(item));
  if (!entries.length) return <p className="empty-output">This agent returned no filled fields. You can retry this step.</p>;
  return <div className="output-grid">{entries.map(([key, item]) => <OutputField key={key} label={key.replace(/_/g, " ")} value={item} />)}</div>;
}

function OutputField({ label, value }) {
  if (Array.isArray(value)) {
    const items = value.filter(hasContent);
    if (!items.length) return null;
    return <div className="output-field"><h4>{label}</h4><ul>{items.map((item, index) => <li key={`${label}-${index}`}>{typeof item === "object" ? Object.entries(item).filter(([, nested]) => hasContent(nested)).map(([name, nested]) => `${name.replace(/_/g, " ")}: ${toText(nested)}`).join(" · ") : toText(item)}</li>)}</ul></div>;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value).filter(([, nested]) => hasContent(nested));
    if (!entries.length) return null;
    return <div className="output-field"><h4>{label}</h4><div className="nested-fields">{entries.map(([key, nested]) => <OutputField key={key} label={key.replace(/_/g, " ")} value={nested} />)}</div></div>;
  }
  if (!hasContent(value)) return null;
  return <div className="output-field"><h4>{label}</h4><p>{toText(value)}</p></div>;
}

function hasContent(value) {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.some(hasContent);
  if (typeof value === "object") return Object.values(value).some(hasContent);
  return true;
}

function toText(value) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default ProjectModal;
