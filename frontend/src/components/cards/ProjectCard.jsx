import { motion } from "framer-motion";
import { ArrowUpRight, Bookmark, Check } from "lucide-react";

const ProjectCard = ({ project, index, onOpen, onSave, isSaved, isSaving }) => {
  const scores = [
    ["Difficulty", project.Difficulty],
    ["Innovation", project["Innovation Score"]],
    ["Career value", project["Resume Value"]],
  ].filter(([, value]) => value !== undefined && value !== "");

  return <motion.article className="project-card" style={{ "--card-index": index }} layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} whileHover={{ y: -4 }} transition={{ duration: 0.32, delay: Math.min(index, 5) * 0.045, ease: [0.22, 1, 0.36, 1], layout: { type: "spring", stiffness: 340, damping: 30 } }}>
    <div className="card-topline"><span className="idea-number">IDEA {String(index + 1).padStart(2, "0")}</span><button type="button" className={`project-save-button${isSaved ? " is-saved" : ""}`} aria-label={isSaved ? "Project saved to My projects" : isSaving ? "Saving project" : `Save ${project["Project Title"] || "project"} to My projects`} aria-pressed={Boolean(isSaved)} aria-busy={Boolean(isSaving)} disabled={isSaved || isSaving} onClick={() => onSave(project)}>{isSaved ? <Check size={14} aria-hidden="true" /> : <Bookmark size={14} aria-hidden="true" />}<span>{isSaved ? "Saved" : isSaving ? "Saving…" : "Save"}</span></button><ArrowUpRight className="card-arrow" size={18} aria-hidden="true" /></div>
    <h3>{project["Project Title"] || "Untitled project"}</h3>
    <p className="project-description">{project["Short Description"] || "No project description was provided."}</p>
    {scores.length > 0 && <div className="score-row">{scores.map(([label, value]) => <div className="score-pill" key={label}><span>{label}</span><strong>{value}<small>/10</small></strong></div>)}</div>}
    {Array.isArray(project["Major Modules"]) && project["Major Modules"].length > 0 && <div className="module-row">{project["Major Modules"].slice(0, 3).map((module, moduleIndex) => <span className="module-tag" key={`${module}-${moduleIndex}`}>{module}</span>)}</div>}
    <button className="text-button" type="button" onClick={onOpen}>Build this project <span aria-hidden="true">→</span></button>
  </motion.article>;
};

export default ProjectCard;
