import { ReactFlowProvider } from "@xyflow/react";
import DFAVisualization from "./DFAVisualization";
import { EMPTY_PARTITIONS } from "../utils/dfaGraph";

export default function DFAVisualizationPanels({ dfa, result, walkthroughHighlight = null, showMinimized = true, darkMode = false }) {
  const original = result?.originalDFA || dfa;
  return <section className="visualization-section"><div className="section-title"><div><span className="kicker">Interactive canvas</span><h2>DFA visualization</h2><p>Transition table data is the source of truth for both diagrams.</p></div></div><div className="graph-legend" aria-label="Graph legend"><span><i className="legend-state" /> Normal</span><span><i className="legend-state legend-initial">→</i> Initial</span><span><i className="legend-state legend-accepting" /> Accepting</span>{result && <span><i className="legend-equivalent">≡</i> Equivalent group</span>}</div><div className="graph-grid"><ReactFlowProvider><DFAVisualization dfa={original} title="Original DFA" partitions={result?.partitions || EMPTY_PARTITIONS} highlight={walkthroughHighlight} darkMode={darkMode} /></ReactFlowProvider>{result && showMinimized ? <ReactFlowProvider><DFAVisualization dfa={result.minimizedDFA} title="Minimized DFA" partitions={EMPTY_PARTITIONS} darkMode={darkMode} /></ReactFlowProvider> : <section className="panel graph-placeholder"><h2>Final DFA pending</h2><p>{result ? "Complete the walkthrough to reveal the minimized DFA, or choose Preview final result." : "Run minimization to generate the final DFA."}</p></section>}</div></section>;
}
