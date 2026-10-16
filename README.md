# AutomataLab

AutomataLab is a browser-based Deterministic Finite Automaton (DFA) minimizer for a Theory of Automata college project. It lets a student construct a complete DFA, validate it, minimize it by partition refinement, inspect the result visually, and test strings against the original and minimized machines.

It is a client-side React application. This repository includes no backend, database, login, or live deployment.

## Problem statement

Manual DFA minimization is useful for learning, but repeated reachability and partition-refinement calculations are error-prone. AutomataLab keeps the transition table as the source of truth and makes the construction, minimization, and verification stages inspectable.

## Objectives

- Model and validate complete DFAs.
- Remove unreachable states and minimize by partition refinement.
- Visualize original/minimized automata and explain intermediate partitions.
- Simulate strings and compare acceptance.
- Support portable JSON workspaces, local persistence, and report-oriented exports.

## Main features

- State, alphabet, initial/final-state, and transition-table editing.
- Structural validation without silently filling missing transitions.
- Reachability analysis and iterative partition-refinement minimization.
- Guided walkthrough with playback, actual partition groups, and graph highlights.
- React Flow graphs with draggable nodes, zoom, pan, fit view, loops, curved reverse edges, grouped labels, start arrows, and accepting double circles.
- String simulation for epsilon, single-character alphabets, and comma-separated multi-character tokens.
- Exact language-equivalence verification with a product automaton.
- JSON DFA import/export, localStorage restoration, minimization report export, and PNG/SVG diagram export.
- Light/dark theme and four workspaces: DFA Designer, Minimization, String Simulator, and Results.

## Technology stack

- React 19 and Vite
- Tailwind CSS tooling and project CSS
- `@xyflow/react` for interactive diagrams
- `lucide-react` for icons
- Node built-in assertions and Oxlint

## Installation and local run

Prerequisites: a current Node.js LTS release and npm.

```bash
git clone <your-repository-url>
cd automatalab
npm install
npm run dev
```

Vite prints the local URL in the terminal (normally `http://localhost:5173`). For a production build and local preview:

```bash
npm run build
npm run preview
```

## Using the four workspaces

### DFA Designer

Use the left editor to define states, alphabet symbols, initial state, accepting states, and every transition. The original graph appears here. A DFA must have unique nonblank states/symbols, a valid initial state, and a destination in the state set for every state/symbol pair. Built-in examples demonstrate equivalent and unreachable states. Reset intentionally creates blank transitions, so complete them before minimizing.

### Minimization

Select **Minimize DFA** after validation succeeds. The walkthrough shows reachability, accepting/non-accepting initialization, each actual refinement, and final classes. Previous, Next, Play/Pause, Restart, and speed controls are available. The final graph is revealed at the final step or through **Preview final result**.

### String Simulator

Enter an input and select **Run simulation**. Single-character alphabets use character input such as `0101`. Multi-character alphabets require comma-separated tokens such as `go, stop`. Blank input represents epsilon. After minimization, the view compares original/minimized traces for that selected input.

### Results

After minimization, inspect counts, reduction percentage, unreachable states, equivalent groups, and original/minimized transition tables. The header exposes minimization-report export when a result exists.

## DFA minimization algorithm

AutomataLab uses iterative partition refinement, not an implementation of optimized Hopcroft minimization.

1. Validate the DFA and identify reachable states.
2. Exclude unreachable states from the minimization relation.
3. Partition reachable states into accepting and non-accepting groups.
4. Split a group when member states have different vectors of destination partition indices across the alphabet.
5. Stop when no group splits.
6. Make one minimized state per stable partition and derive its transitions from a representative.

See [Algorithms](docs/ALGORITHMS.md) for correctness context and complexity discussion.

## String acceptance and exact equivalence

The simulator records a trace for one selected input. That is educational evidence, not a proof that two DFAs have the same language. `verifyLanguageEquivalence` separately explores the reachable product automaton breadth-first. It either proves exact language equivalence or returns a shortest distinguishing sequence of atomic alphabet tokens; `[]` represents epsilon.

## Import, export, and persistence

- DFA files use a versioned `automatalab-dfa` JSON document with workspace name and formal DFA data.
- Valid workspaces are restored from browser `localStorage` under `automatalab.workspace.v1`.
- Graph panels export static, light-background SVG or PNG diagrams.
- A minimization report JSON is available only after valid minimization.

Imports are validated before replacing the workspace. The current limits are 1 MB, 100 states, and 30 alphabet symbols.

## Automated testing

```bash
npm test
npm run lint
npm run build
```

Tests cover minimization edge cases, validation failures, exact equivalence, simulation behavior, workspace JSON/localStorage recovery, and graph-element data. Details are in [Testing](docs/TESTING.md).

## Project structure

```text
src/
  algorithms/       validation, minimization, simulation, equivalence
  components/       editor, diagrams, walkthrough, simulator, results, navigation
  data/             built-in DFA examples
  utils/            graph generation, diagram export, workspace I/O
  App.jsx           shared application state and workspace composition
tests/              Node-based automated regression tests
docs/               architecture, algorithms, testing, user, and report material
```

## Screenshots

No repository screenshots have been captured. Add real current screenshots before academic submission; do not substitute mockups.

- `docs/screenshots/designer.png` — placeholder; not currently present.
- `docs/screenshots/minimization.png` — placeholder; not currently present.
- `docs/screenshots/simulator.png` — placeholder; not currently present.

## Known limitations

- Complete DFAs only; no NFA or epsilon-transition support.
- Workspaces are browser-local unless exported.
- Graph layout is heuristic; dragged positions are not persisted.
- Static SVG/PNG exports do not mirror arbitrary dragged React Flow positions.
- Browser rendering, downloads, and interaction require manual browser checks.
- Partition refinement is intentionally educational rather than optimized Hopcroft minimization.

## Future enhancements

- Browser-level visual/accessibility regression tests.
- Saved graph positions and additional layouts.
- Exportable walkthrough notes.
- Carefully scoped support for additional automata models.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Algorithms](docs/ALGORITHMS.md)
- [Testing](docs/TESTING.md)
- [User guide](docs/USER_GUIDE.md)
- [Viva preparation](docs/VIVA_PREPARATION.md)
- [Academic project report](docs/PROJECT_REPORT.md)
