import { ReactFlowProvider } from "@xyflow/react";
import DFAVisualization from "./DFAVisualization";

export default function DFAVisualizationPanels({ dfa, result }) {
  const original = result?.originalDFA || dfa;
  return <section className="visualization-section"><div className="section-title"><h2>DFA visualization</h2><p>Transition table data is the source of truth for both diagrams.</p></div><div className="graph-legend" aria-label="Graph legend"><span><i className="legend-state" /> Normal</span><span><i className="legend-state legend-initial">→</i> Initial</span><span><i className="legend-state legend-accepting" /> Accepting</span>{result && <span><i className="legend-equivalent">≡</i> Equivalent group</span>}</div><div className="grid xl:grid-cols-2 gap-5"><ReactFlowProvider><DFAVisualization dfa={original} title="Original DFA" partitions={result?.partitions || []} /></ReactFlowProvider>{result ? <ReactFlowProvider><DFAVisualization dfa={result.minimizedDFA} title="Minimized DFA" /></ReactFlowProvider> : <section className="panel graph-placeholder"><h2>Minimized DFA</h2><p>Run minimization to generate the second graph.</p></section>}</div></section>;
}
