import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, CircleAlert } from "lucide-react";
import { TransitionTable } from "./DFAEditor";

export default function ResultsPanel({ result }) {
  const [open, setOpen] = useState(true);
  if (!result) return <section className="results-empty"><CheckCircle2 size={19} /><span>Run minimization to unlock the detailed comparison workspace.</span></section>;
  const groups = result.partitions.filter((group) => group.length > 1);
  return <section className="results-workspace"><button className="results-heading" onClick={() => setOpen((value) => !value)} aria-expanded={open}><div><span className="kicker">Comparison workspace</span><h2>Detailed DFA results</h2><p>Inspect transition tables, removed states, and equivalent-state groups.</p></div>{open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</button>{open && <div className="results-content"><div className="result-notes"><article><CircleAlert size={18} /><div><strong>Unreachable states</strong><p>{result.unreachable.length ? result.unreachable.join(", ") : "None removed"}</p></div></article><article><CheckCircle2 size={18} /><div><strong>Equivalent-state groups</strong><p>{groups.length ? groups.map((group) => `{${group.join(", ")}}`).join(" · ") : "No states merged"}</p></div></article></div><div className="result-tables"><TransitionTable dfa={result.originalDFA} title="Original transition table" readOnly /><TransitionTable dfa={result.minimizedDFA} title="Minimized transition table" readOnly /></div></div>}</section>;
}
