# User Guide

## Build a DFA

1. Start with `npm run dev` and open Vite’s displayed URL.
2. In **DFA Designer**, use the persistent left editor to add and rename states.
3. Choose one Start radio button and zero or more Final checkboxes.
4. Enter comma-separated symbols, such as `0, 1` or `open, close`.
5. Select a destination in every transition cell.
6. Confirm the header says **DFA valid**.

**Load example** provides equivalent-state and unreachable-state DFAs. **Reset editor** deliberately creates blank transitions.

## View the graph

The Designer graph uses an incoming yellow arrow for the initial state and a green double circle for final states. Drag nodes, scroll to zoom, drag the canvas to pan, and use reset/fit controls. Per-panel SVG and PNG actions generate static exports.

## Minimize

1. Select **Minimize DFA**.
2. Read reachability first; unreachable states are excluded.
3. Inspect the accepting/non-accepting initial partition.
4. Step through refinements; different destination-partition signatures cause splits.
5. At completion, inspect merged classes and the minimized graph. **Preview final result** is available early.

An edit clears the old result and walkthrough.

## Simulate input

Open **String Simulator**, enter `0101` for single-character symbols or `go, stop` for multi-character symbols, then select **Run simulation**. Blank input is epsilon. Use trace controls and speed selection. After minimization, the simulator also compares the original/minimized runs for that selected input.

## Import, export, and restore

- **Import** accepts a version-1 AutomataLab JSON file and preserves the current DFA on import failure.
- **Export** downloads the current DFA JSON.
- **Report** downloads minimization JSON once a result exists.
- Valid workspaces save automatically to browser storage.

For transfer across browsers/devices, export JSON instead of relying on localStorage.

