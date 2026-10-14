import { CheckCircle2, CircleAlert, GitMerge, Minimize2, Trash2 } from "lucide-react";

export default function AnalyticsCards({ dfa, result, validationError }) {
  const cards = result ? [
    ["Original states", result.originalStateCount, GitMerge, "blue"],
    ["Minimized states", result.minimizedStateCount, Minimize2, "indigo"],
    ["States eliminated", result.originalStateCount - result.minimizedStateCount, Trash2, "orange"],
    ["Reduction", `${result.reductionPercentage.toFixed(1)}%`, Minimize2, "green"],
  ] : [["Current states", dfa.states.length, GitMerge, "blue"]];
  return <div className="analytics-row">{cards.map(([label, value, Icon, tone]) => <article className="analytics-card" key={label}><div className={`analytics-icon ${tone}`}><Icon size={17} /></div><div><span>{label}</span><strong>{value}</strong></div></article>)}<article className={`analytics-card validation-card ${validationError ? "invalid" : "valid"}`}><div className={`analytics-icon ${validationError ? "orange" : "green"}`}>{validationError ? <CircleAlert size={17} /> : <CheckCircle2 size={17} />}</div><div><span>DFA validation</span><strong>{validationError ? "Needs attention" : "Complete"}</strong></div></article></div>;
}
