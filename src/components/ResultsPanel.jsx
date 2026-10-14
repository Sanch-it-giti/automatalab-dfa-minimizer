import { ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { TransitionTable } from "./DFAEditor";
export default function ResultsPanel({ result }) {
  if (!result) return <section className="panel empty-results"><CheckCircle2 size={24} /><div><h2>Ready to minimize</h2><p>Complete every transition, then run the minimizer to compare both DFAs.</p></div></section>;
  const { originalDFA, minimizedDFA, originalStateCount, minimizedStateCount, reductionPercentage, unreachable } = result;
  return <section className="space-y-5"><div className="result-summary"><div><span>Original states</span><strong>{originalStateCount}</strong></div><ArrowRight className="text-sky-400" /><div><span>Minimized states</span><strong>{minimizedStateCount}</strong></div><div className="reduction"><span>Reduction</span><strong>{reductionPercentage.toFixed(1)}%</strong></div></div>{unreachable.length > 0 && <div className="notice"><AlertTriangle size={18} /> Unreachable states removed: {unreachable.join(", ")}</div>}<div className="grid xl:grid-cols-2 gap-5"><TransitionTable dfa={originalDFA} title="Original DFA" readOnly /><TransitionTable dfa={minimizedDFA} title="Minimized DFA" readOnly /></div></section>;
}
