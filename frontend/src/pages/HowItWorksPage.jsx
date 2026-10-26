import { ArrowRight, Check, ClipboardList, FileText, FlaskConical, Layers3, Search, ShieldCheck, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  { icon: Search, title: "Project analysis", detail: "Define the user, problem, scope, requirements, and constraints." },
  { icon: FlaskConical, title: "Research brief", detail: "Identify useful keywords, research gaps, datasets, and current trends." },
  { icon: Layers3, title: "Technology stack", detail: "Choose one coherent stack that fits the project and student resources." },
  { icon: Wallet, title: "Project budget estimate", detail: "Estimate relevant costs such as hosting, domains, printing, licenses, components, and optional IP filing." },
  { icon: ClipboardList, title: "Development plan", detail: "Turn the scope into architecture, milestones, and weekly deliverables." },
  { icon: ShieldCheck, title: "Feasibility review", detail: "Review effort, cost assumptions, risks, and practical improvements." },
  { icon: FileText, title: "Project synopsis", detail: "Compile the approved work into a concise academic synopsis and PDF." },
];

export default function HowItWorksPage() {
  return <div className="route-page guide-page">
    <section className="page-intro guide-intro"><span className="eyebrow">THE DORA WORKFLOW</span><h1>A plan you can<br /><em>actually follow.</em></h1><p>Move one step at a time. Each agent builds on the completed work, so the final plan stays connected to the original project.</p></section>
    <section className="workflow-steps" aria-label="Seven project workflow stages">{steps.map(({ icon: Icon, title, detail }, index) => <article className="workflow-step" key={title} style={{ "--card-index": index }}><div className="workflow-step-count">{String(index + 1).padStart(2, "0")}</div><div className="workflow-step-icon"><Icon size={19} strokeWidth={1.7} /></div><div className="workflow-step-copy"><h2>{title}</h2><p>{detail}</p></div><Check className="workflow-step-check" size={16} aria-hidden="true" /></article>)}</section>
    <section className="guide-note"><div><span className="eyebrow">BUILT FOR REALISTIC PROJECTS</span><h2>Keep scope, time, and resources in view.</h2><p>Dora encourages practical deliverables, explicit assumptions, and source links for external evidence. Review each output and adjust it to your institution’s requirements.</p></div><Link className="button button-primary" to="/discover">Start with an idea <ArrowRight size={15} /></Link></section>
  </div>;
}
