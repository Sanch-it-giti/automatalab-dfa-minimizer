# Architecture

## Overview

AutomataLab is a single-page React application. `src/App.jsx` owns shared workspace state; the DFA transition table, not React Flow nodes/edges, is the source of truth.

## Core DFA model

```js
{
  states: ["q0", "q1"], alphabet: ["0", "1"], startState: "q0",
  finalStates: ["q1"],
  transitions: { q0: { 0: "q0", 1: "q1" }, q1: { 0: "q0", 1: "q1" } }
}
```

`validateDFA` requires unique nonblank states, a non-empty unique alphabet, valid initial/final states, and one valid destination for every transition.

## Data flow

```text
Editor / import / examples / reset → App DFA state
                                      ├→ validation
                                      ├→ minimizer → result + walkthrough metadata
                                      ├→ simulator → trace highlights
                                      └→ graph generator → React Flow elements
```

Editing calls `update`, which replaces a cloned DFA and clears stale minimization, walkthrough, and simulation state. Import validates its full document before committing it. Persistence is debounced in `App.jsx` and serializes valid workspace documents.

## Components

| Component | Responsibility |
| --- | --- |
| `WorkspaceSidebar`, `DFAEditor` | DFA construction, examples, reset, state roles, alphabet, transition table. |
| `WorkspaceTabs` | Displays DFA Designer, Minimization, String Simulator, and Results using shared state. |
| `AnalyticsCards` | Validation and state-count summaries. |
| `MinimizationWalkthrough` | Computed reachability/refinement steps, playback, and highlights. |
| `StringSimulator` | Input tokenization, simulation trace, controls, and graph highlights. |
| `DFAVisualizationPanels`, `DFAVisualization` | Original/minimized diagrams and diagram exports. |
| `ResultsPanel` | Unreachable states, equivalence groups, and read-only transition tables. |

## Visualization pipeline

`dfaGraph.js` creates nodes with state-name IDs and stable edge IDs from source/target names. It groups symbols that share endpoints. Self-loops use `smoothstep`; other edges use React Flow’s built-in `default` type.

`DFAVisualization` memoizes graph elements and derives a content fingerprint from the DFA, partitions, and highlights. A guarded effect updates React Flow nodes/edges only when that fingerprint changes, then fits the measured custom nodes. `EMPTY_PARTITIONS`, memoization, and the applied-fingerprint guard avoid the prior render/update-loop pattern.

## Persistence and exports

`workspaceIO.js` creates/parses versioned workspace documents, validates imports atomically, uses browser localStorage, and creates result reports. `diagramExport.js` generates a separate static SVG and rasterizes it to PNG. Neither export serializes React Flow internal state.

## Boundaries

- No server, database, authentication, or deployment is included.
- Browser storage is tied to a browser profile.
- Algorithm modules do not depend on React or React Flow.
- The equivalence utility is separate from minimization to avoid circular verification.

