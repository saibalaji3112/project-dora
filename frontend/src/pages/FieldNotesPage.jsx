import { useState } from "react";
import { ArrowRight, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";

const notes = [
  {
    number: "01",
    category: "SHAPE THE PROBLEM",
    title: "Start with the person, not the feature list.",
    summary: "A project brief gets clearer when it names one user, one recurring problem, and one result you can measure.",
    readTime: "4 min read",
    points: ["Who runs into the problem today?", "What do they use or do instead?", "What small outcome could your prototype improve?"],
    action: "Explore project directions",
    to: "/discover",
  },
  {
    number: "02",
    category: "CHECK THE LANDSCAPE",
    title: "Look for overlap before you commit.",
    summary: "Search products and open repositories, then compare what they solve with the constraint your project is designed around.",
    readTime: "5 min read",
    points: ["Search with the user's task and the core technology.", "Record sources and what each solution actually offers.", "Describe your difference as a testable improvement."],
    action: "Check an idea",
    to: "/idea-check",
  },
  {
    number: "03",
    category: "PLAN A REAL BUILD",
    title: "Scope the version you can finish.",
    summary: "A credible student project has a small end-to-end path, a stack you can run, and milestones that produce visible work.",
    readTime: "6 min read",
    points: ["Choose one complete user journey.", "Keep tools, datasets, and hosting within reach.", "Set milestones around working outputs, not vague activity."],
    action: "See the Dora workflow",
    to: "/how-it-works",
  },
];

const filters = ["All notes", "Shape the problem", "Check the landscape", "Plan a real build"];

export default function FieldNotesPage() {
  const [filter, setFilter] = useState("All notes");
  const visibleNotes = filter === "All notes"
    ? notes
    : notes.filter((note) => note.category.toLowerCase() === filter.toLowerCase());

  return <div className="route-page field-notes-page">
    <section className="page-intro field-notes-intro">
      <span className="eyebrow">FIELD NOTES · PROJECT DORA</span>
      <h1>Build with<br /><em>better questions.</em></h1>
      <p>Short, practical guides for choosing a project, checking the landscape, and turning a promising direction into work you can complete.</p>
    </section>
    <div className="field-note-filters" role="group" aria-label="Filter field notes">
      {filters.map((item) => <button type="button" key={item} className={filter === item ? "active" : ""} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}
    </div>
    <section className="field-notes-grid" aria-label="Project planning guides" aria-live="polite">
      {visibleNotes.map((note, index) => <article className="field-note-card" key={note.number} style={{ "--note-index": index }}>
        <div className="field-note-top"><span>{note.category}</span><span><Clock3 size={13} />{note.readTime}</span></div>
        <span className="field-note-number">{note.number}</span>
        <h2>{note.title}</h2>
        <p className="field-note-summary">{note.summary}</p>
        <ul>{note.points.map((point) => <li key={point}>{point}</li>)}</ul>
        <Link className="field-note-link" to={note.to}>{note.action}<ArrowRight size={15} /></Link>
      </article>)}
    </section>
  </div>;
}