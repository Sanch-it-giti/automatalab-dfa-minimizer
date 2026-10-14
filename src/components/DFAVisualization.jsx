import { memo, useCallback, useEffect, useMemo } from "react";
import {
  Background, Controls, Handle, MiniMap, Position, ReactFlow, useEdgesState, useNodesState, useReactFlow,
} from "@xyflow/react";
import { Maximize2, RotateCcw } from "lucide-react";
import { buildGraphElements } from "../utils/dfaGraph";

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

export default function DFAVisualization({ dfa, title, partitions = [] }) {
  const graph = useMemo(() => buildGraphElements(dfa, partitions), [dfa, partitions]);
  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);
  const { fitView } = useReactFlow();

  useEffect(() => { setNodes(graph.nodes); setEdges(graph.edges); }, [graph, setNodes, setEdges]);
  const resetPositions = useCallback(() => { setNodes(graph.nodes); requestAnimationFrame(() => fitView({ padding: 0.25, duration: 250 })); }, [fitView, graph.nodes, setNodes]);

  return <section className="panel graph-panel"><div className="panel-heading"><div><h2>{title}</h2><p>Drag states, scroll to zoom, and drag the canvas to pan.</p></div><GraphToolbar reset={resetPositions} fitView={fitView} /></div><div className="graph-canvas"><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView fitViewOptions={{ padding: 0.25 }} minZoom={0.35} maxZoom={2.2} colorMode="dark" nodesConnectable={false} edgesFocusable={false}><Background color="#334155" gap={20} size={1} /><Controls showInteractive={false} /><MiniMap nodeColor={(node) => node.data?.equivalent ? "#a78bfa" : node.data?.accepting ? "#34d399" : "#38bdf8"} maskColor="rgba(9, 14, 27, 0.75)" /></ReactFlow></div></section>;
}
