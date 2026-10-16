# Testing

## Commands

From the repository root:

```bash
npm test
npm run lint
npm run build
```

`npm test` runs the current Node assertion files sequentially and does not require a browser.

## Automated coverage

| File | Covered behavior |
| --- | --- |
| `tests/dfaSimulator.test.mjs` | Acceptance/rejection, epsilon, invalid symbols, multi-character tokens, and original/minimized run agreement. |
| `tests/workspaceIO.test.mjs` | JSON round trip, malformed JSON, missing transitions, invalid start, duplicate alphabet, report data, localStorage restoration, and corrupt-storage recovery. |
| `tests/dfaReliability.test.mjs` | Validation, reachability, minimization, exact equivalence, residual-state distinguishability, stable partitions, and graph-element generation. |

The minimization suite includes single-state, already-minimal, equivalent, unreachable, all/no-final, self-loop, cyclic, multi-symbol, multiple-refinement, and unusual valid-name DFAs. It also tests empty alphabets, invalid/missing transitions, invalid initial states, and duplicate state names.

For every valid minimization fixture, the test validates the minimized DFA, proves exact language equivalence with the independent product checker, verifies minimized-state reachability, and verifies that distinct minimized states have distinguishable right languages.

## Manual browser scenarios

These remain manual checks, not automated-test claims:

1. At desktop, tablet, and mobile widths, switch all four workspaces; check overflow and clipping.
2. Add, rename, delete, and mark states; verify transitions and stale-result clearing.
3. Load both built-in examples; minimize; step, play, pause, and restart the walkthrough.
4. Drag, pan, zoom, fit, and export graphs; check loops and reverse edges.
5. Simulate accepted/rejected strings, epsilon, and multi-character tokens.
6. Change light/dark modes before and after minimization.
7. Export/import a DFA and refresh to inspect restored workspace data.
8. Use keyboard navigation for tabs and controls.

## Coverage limitations

- No browser automation or screenshot-regression suite is present.
- Browser downloads, React Flow interactions, and CSS rendering require manual checks.
- Tests do not provide performance benchmarks or prove arbitrary-size behavior.

