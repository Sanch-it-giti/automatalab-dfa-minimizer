import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Background, Controls, Handle, Position, ReactFlow, useEdgesState, useNodesState, useReactFlow,
} from "@xyflow/react";
import { Maximize2, RotateCcw } from "lucide-react";
import { buildGraphElements, EMPTY_PARTITIONS, graphFingerprint } from "../utils/dfaGraph";
import "./dfaVisualization.css";

const StateNode = memo(({ data }) => <>
  <Handle type="target" position={Position.Left} className="dfa-handle" />
  <Handle type="target" position={Position.Top} id="top-target" className="dfa-handle" />
  <Handle type="source" position={Position.Top} id="top-source" className="dfa-handle" />
  <div className={`dfa-node ${data.accepting ? "is-accepting" : ""} ${data.equivalent ? "is-equivalent" : ""}`}>
    {data.initial && <span className="start-arrow" aria-label="Initial state">→</span>}
    <span>{data.label}</span>
  </div>
  {data.equivalent && <span className="equivalence-badge" title={`Equivalent state group ${data.groupLabel}`}>≡</span>}
  <Handle type="source" position={Position.Right} className="dfa-handle" />
  <Handle type="target" position={Position.Bottom} id="bottom-target" className="dfa-handle" />
  <Handle type="source" position={Position.Bottom} id="bottom-source" className="dfa-handle" />
</>);

const nodeTypes = { dfaState: StateNode };

function GraphToolbar({ reset, fitView }) {
  return <div className="graph-toolbar"><button className="icon-button" onClick={reset} title="Reset node positions" aria-label="Reset node positions"><RotateCcw size={16} /></button><button className="icon-button" onClick={() => fitView({ padding: 0.25, duration: 250 })} title="Fit graph to view" aria-label="Fit graph to view"><Maximize2 size={16} /></button></div>;
}

export default function DFAVisualization({ dfa, title, partitions = EMPTY_PARTITIONS, darkMode = false }) {
  // A content key prevents React Flow state from being reset on theme/UI-only renders.
  const graphKey = useMemo(() => graphFingerprint(dfa, partitions), [dfa, partitions]);
  const graph = useMemo(() => buildGraphElements(dfa, partitions), [dfa, partitions]);
  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);
  const { fitView } = useReactFlow();
  const appliedGraphKey = useRef(null);

  useEffect(() => {
    if (appliedGraphKey.current === graphKey) return undefined;
    appliedGraphKey.current = graphKey;
    setNodes(graph.nodes);
    setEdges(graph.edges);
    // Wait for React Flow to measure custom state nodes before fitting their outer rings/arrows.
    const frame = requestAnimationFrame(() => fitView({ padding: 0.38, duration: 180 }));
    return () => cancelAnimationFrame(frame);
  }, [fitView, graphKey, graph.edges, graph.nodes, setEdges, setNodes]);
  const resetPositions = useCallback(() => { setNodes(graph.nodes); requestAnimationFrame(() => fitView({ padding: 0.38, duration: 250 })); }, [fitView, graph.nodes, setNodes]);

  return <section className="panel graph-panel"><div className="panel-heading"><div><h2>{title}</h2><p>Drag states, scroll to zoom, and drag the canvas to pan.</p></div><GraphToolbar reset={resetPositions} fitView={fitView} /></div><div className="graph-canvas"><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView fitViewOptions={{ padding: 0.38 }} minZoom={0.3} maxZoom={2.2} colorMode={darkMode ? "dark" : "light"} nodesConnectable={false} edgesFocusable={false}><Background color={darkMode ? "#334155" : "#cbd5e1"} gap={24} size={1} /><Controls showInteractive={false} /></ReactFlow></div></section>;
}
