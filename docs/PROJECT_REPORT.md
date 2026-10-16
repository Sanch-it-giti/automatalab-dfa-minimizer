# AutomataLab: Interactive DFA Minimizer Simulator

## 1. Abstract

AutomataLab is a web-based educational tool for constructing, validating, minimizing, visualizing, and simulating deterministic finite automata. The system applies reachability analysis followed by iterative partition refinement to construct a minimized DFA. It provides a guided walkthrough, interactive diagrams, input-string traces, JSON portability, and an independent product-automaton equivalence verifier. It is implemented as a client-side React application for Theory of Automata learning and demonstration.

## 2. Introduction

Finite automata are foundational computational models. DFA minimization demonstrates that distinct state graphs can accept the same regular language and that a regular language has a minimal reachable DFA unique up to isomorphism. Manual calculations are educational but repetitive; an interactive system can make each formal step visible while preserving the transition table as the mathematical source of truth.

## 3. Problem statement

Students need a reliable way to define a complete DFA, identify unreachable states, refine state partitions, and verify that minimization preserves acceptance. The system must reject invalid input rather than silently repair it and must keep the relationship among tables, graphs, and computed results clear.

## 4. Objectives

- Build and validate complete DFAs interactively.
- Apply reachability analysis and partition refinement.
- Display original/minimized graphs and transition tables.
- Explain intermediate equivalence partitions.
- Simulate strings on original and minimized machines.
- Provide portable exports and local workspace restoration.
- Verify language equivalence by product-automaton exploration.

## 5. Background theory

A DFA is `M = (Q, Σ, δ, q0, F)`, where `δ` is total and deterministic. States are equivalent when they accept exactly the same suffix language. Final and non-final states differ on epsilon, so they begin in separate classes. Repeatedly separating states by the classes reached on each input symbol eventually produces stable equivalence classes; these form the minimal reachable DFA.

## 6. Proposed system

AutomataLab has four shared-state workspaces:

1. **DFA Designer**: state/alphabet/transition editing and original graph.
2. **Minimization**: reachability/refinement walkthrough and graph comparison.
3. **String Simulator**: input trace and highlighted graphs.
4. **Results**: metrics, groups, and transition-table comparison.

The graph is derived from the transition table. Moving a graph node therefore changes only its display position, not the formal DFA.

## 7. System architecture

`App.jsx` owns the current DFA and derived UI state. Editor/import/reset actions replace the DFA and clear stale results. The minimizer emits a minimized DFA and walkthrough metadata; the simulator and walkthrough emit highlight descriptions used by visualization. Browser persistence stores a versioned workspace document. Client-side utilities create JSON and static diagram exports.

For detailed data flow, see [ARCHITECTURE.md](ARCHITECTURE.md).

## 8. Algorithms and methodology

### 8.1 Validation and reachability

Validation rejects duplicate/blank names, invalid initial/final states, empty/duplicate symbols, and missing/invalid destinations. Breadth-first reachability starts at `q0` and follows all symbols.

### 8.2 Partition refinement

Reachable final/non-final states make the initial partition. Each refinement calculates the current destination-partition vector for every state and symbol, then separates states with unequal vectors. Once no split occurs, each class becomes one minimized state. This is iterative partition refinement, not optimized Hopcroft minimization.

### 8.3 Simulation and exact equivalence

Simulation follows one selected token sequence and records a trace. Exact equivalence instead searches the product automaton of two complete DFAs, comparing acceptance status at each reachable pair. It reports exact equivalence or a shortest distinguishing sequence.

## 9. Implementation details

The project uses React, Vite, `@xyflow/react`, Lucide icons, project CSS/Tailwind tooling, and browser APIs. React Flow renders circles, accepting double circles, start arrows, labelled edges, loops, and curves. Workspace files use a versioned JSON schema. Static SVG is generated in-browser and can be rasterized to PNG.

## 10. Testing and results

Node assertion suites cover simulation, workspace import/export/localStorage recovery, and minimization reliability. Valid minimization fixtures are structurally validated, checked with the independent exact-equivalence utility, checked for reachable minimized states, and checked for pairwise distinguishability of remaining states.

The repository provides `npm test`, `npm run lint`, and `npm run build`. Record actual output from the submission environment rather than adding unverified performance or visual-testing claims. Browser visual/export checks remain manual.

## 11. Limitations

- The project supports complete DFAs only, not NFAs or epsilon transitions.
- Persistence is local to a browser profile unless JSON is exported.
- Graph layout is heuristic; dragged positions are not saved.
- Static exports do not reproduce arbitrary dragged graph positions.
- The minimizer is educational partition refinement, not an optimized Hopcroft implementation.
- No backend or deployment is included.

## 12. Conclusion

AutomataLab connects DFA theory to an inspectable workflow: validate input, identify reachability, refine partitions, construct a minimized machine, and verify language preservation independently. It is appropriate for a classroom demonstration when accompanied by current screenshots and manual browser checks.

## 13. Future scope

- Browser-based UI/accessibility regression tests.
- Saved graph positions and more layout choices.
- Exportable walkthrough notes for lab reports.
- Carefully separated support for additional automata models.
- Interoperability with other formal automata file formats after a documented schema decision.

## 14. References

1. J. E. Hopcroft, R. Motwani, and J. D. Ullman, *Introduction to Automata Theory, Languages, and Computation*, 3rd ed. Pearson, 2006.
2. M. Sipser, *Introduction to the Theory of Computation*, 3rd ed. Cengage Learning, 2013.
3. React documentation, [react.dev](https://react.dev/).
4. React Flow documentation, [reactflow.dev](https://reactflow.dev/).
5. Vite documentation, [vite.dev](https://vite.dev/).

