import { Position } from "@xyflow/react";

const columnsFor = (count) => Math.max(1, Math.ceil(Math.sqrt(count)));

export function buildGraphElements(dfa, partitions = []) {
  const columns = columnsFor(dfa.states.length);
  const groupByState = new Map();
  partitions.forEach((group) => group.forEach((state) => groupByState.set(state, group)));

  const nodes = dfa.states.map((state, index) => {
    const group = groupByState.get(state);
    return {
      id: state,
      type: "dfaState",
      position: { x: (index % columns) * 220 + 65, y: Math.floor(index / columns) * 160 + 75 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        label: state,
        initial: dfa.startState === state,
        accepting: dfa.finalStates.includes(state),
        equivalent: group?.length > 1,
        groupLabel: group?.length > 1 ? `{${group.join(", ")}}` : null,
      },
    };
  });

  // A DFA table has one row per symbol. Grouping identical endpoints keeps graphs readable.
  const grouped = new Map();
  dfa.states.forEach((source) => dfa.alphabet.forEach((symbol) => {
    const target = dfa.transitions[source]?.[symbol];
    if (!dfa.states.includes(target)) return;
    const key = `${source}\u0000${target}`;
    const transition = grouped.get(key) || { source, target, symbols: [] };
    transition.symbols.push(symbol);
    grouped.set(key, transition);
  }));

  return { nodes, edges: [...grouped.values()].map(({ source, target, symbols }) => {
    const isLoop = source === target;
    const reverseExists = grouped.has(`${target}\u0000${source}`) && !isLoop;
    // Put opposite directions on opposite sides so their curves and labels do not overlap.
    const useLowerLane = reverseExists && source.localeCompare(target) < 0;
    const useUpperLane = reverseExists && !useLowerLane;
    return {
      id: `edge:${source}->${target}`,
      source,
      target,
      type: isLoop ? "smoothstep" : "bezier",
      label: symbols.join(", "),
      animated: false,
      sourcePosition: isLoop || useUpperLane ? Position.Top : useLowerLane ? Position.Bottom : Position.Right,
      targetPosition: isLoop || useUpperLane ? Position.Top : useLowerLane ? Position.Bottom : Position.Left,
      sourceHandle: isLoop || useUpperLane ? "top-source" : useLowerLane ? "bottom-source" : null,
      targetHandle: isLoop || useUpperLane ? "top-target" : useLowerLane ? "bottom-target" : null,
      data: { isLoop },
      style: { stroke: "#38bdf8", strokeWidth: 2 },
      markerEnd: { type: "arrowclosed", color: "#38bdf8" },
      labelStyle: { fill: "#e2e8f0", fontWeight: 700, fontSize: 12 },
      labelBgStyle: { fill: "#0f172a", fillOpacity: 0.92 },
      labelBgPadding: [4, 3],
      labelBgBorderRadius: 4,
    };
  }) };
}
