import { Bot, ChartNoAxesCombined, GitMerge, PencilRuler } from "lucide-react";

const tabs = [
  { id: "designer", label: "DFA Designer", description: "Edit and inspect", Icon: PencilRuler },
  { id: "minimization", label: "Minimization", description: "Walk through the proof", Icon: GitMerge },
  { id: "simulator", label: "String Simulator", description: "Trace an input", Icon: Bot },
  { id: "results", label: "Results", description: "Compare output", Icon: ChartNoAxesCombined },
];

export default function WorkspaceTabs({ activeTab, onChange, hasResult }) {
  return <nav className="workspace-tabs" aria-label="AutomataLab workspace">
    <div className="workspace-tab-list" role="tablist" aria-label="Workspace areas">
      {tabs.map(({ id, label, description, Icon }) => {
        const active = activeTab === id;
        const needsResult = id === "minimization" || id === "results";
        return <button
          key={id}
          id={`workspace-tab-${id}`}
          type="button"
          role="tab"
          aria-selected={active}
          aria-controls={`workspace-panel-${id}`}
          className={`workspace-tab ${active ? "is-active" : ""}`}
          onClick={() => onChange(id)}
        >
          <Icon size={17} aria-hidden="true" />
          <span><strong>{label}</strong><small>{needsResult && !hasResult ? "Minimize to unlock" : description}</small></span>
        </button>;
      })}
    </div>
  </nav>;
}
