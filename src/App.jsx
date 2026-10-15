import { useMemo, useState } from "react";
import { CircleHelp, GitMerge, Moon, Network, Sun } from "lucide-react";
import { minimizeDFA, validateDFA } from "./algorithms/dfaMinimizer";
import AnalyticsCards from "./components/AnalyticsCards";
import DFAVisualizationPanels from "./components/DFAVisualizationPanels";
import ResultsPanel from "./components/ResultsPanel";
import MinimizationWalkthrough from "./components/MinimizationWalkthrough";
import StringSimulator from "./components/StringSimulator";
import WorkspaceSidebar from "./components/WorkspaceSidebar";
import { createBlankDFA, examples } from "./data/examples";
import "./App.css";

const clone = (value) => structuredClone(value);

function getValidationError(dfa) { try { validateDFA(dfa); return ""; } catch (caught) { return caught.message; } }

function App() {
  const [dfa, setDfa] = useState(() => clone(examples.equivalent.dfa));
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [exampleName, setExampleName] = useState("equivalent");
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [walkthroughHighlight, setWalkthroughHighlight] = useState(null);
  const [showMinimized, setShowMinimized] = useState(false);
  const [walkthroughRun, setWalkthroughRun] = useState(0);
  const [simulationHighlights, setSimulationHighlights] = useState(null);
  const validationError = useMemo(() => getValidationError(dfa), [dfa]);
  const update = (callback) => { setDfa((current) => callback(clone(current))); setResult(null); setWalkthroughHighlight(null); setSimulationHighlights(null); setShowMinimized(false); setError(""); };
  const addState = () => update((next) => { let n = next.states.length; let name = `q${n}`; while (next.states.includes(name)) name = `q${++n}`; next.states.push(name); next.transitions[name] = Object.fromEntries(next.alphabet.map((symbol) => [symbol, ""])); return next; });
  const renameState = (oldName, newName) => update((next) => { const name = newName.trim(); if (!name) { setError("A state name cannot be empty."); return next; } if (name !== oldName && next.states.includes(name)) { setError(`State “${name}” already exists.`); return next; } next.states[next.states.indexOf(oldName)] = name; next.transitions[name] = next.transitions[oldName]; delete next.transitions[oldName]; Object.values(next.transitions).forEach((row) => Object.keys(row).forEach((symbol) => { if (row[symbol] === oldName) row[symbol] = name; })); if (next.startState === oldName) next.startState = name; next.finalStates = next.finalStates.map((state) => state === oldName ? name : state); return next; });
  const deleteState = (state) => update((next) => { next.states = next.states.filter((item) => item !== state); delete next.transitions[state]; Object.values(next.transitions).forEach((row) => Object.keys(row).forEach((symbol) => { if (row[symbol] === state) row[symbol] = ""; })); next.finalStates = next.finalStates.filter((item) => item !== state); if (next.startState === state) next.startState = next.states[0]; return next; });
  const updateAlphabet = (text) => update((next) => { const alphabet = text.split(",").map((symbol) => symbol.trim()).filter(Boolean); next.alphabet = alphabet; next.states.forEach((state) => { const old = next.transitions[state] || {}; next.transitions[state] = Object.fromEntries(alphabet.map((symbol) => [symbol, old[symbol] || ""])); }); return next; });
  const minimize = () => { try { validateDFA(dfa); setWalkthroughHighlight(null); setSimulationHighlights(null); setShowMinimized(false); setResult(minimizeDFA(clone(dfa))); setWalkthroughRun((run) => run + 1); setError(""); } catch (caught) { setResult(null); setWalkthroughHighlight(null); setSimulationHighlights(null); setShowMinimized(false); setError(caught.message || "Please correct the DFA and try again."); } };
  const reset = () => { setDfa(createBlankDFA()); setResult(null); setWalkthroughHighlight(null); setSimulationHighlights(null); setShowMinimized(false); setError(""); };
  const loadExample = () => { setDfa(clone(examples[exampleName].dfa)); setResult(null); setWalkthroughHighlight(null); setSimulationHighlights(null); setShowMinimized(false); setError(""); };
  const editorProps = { dfa, onAdd: addState, onRename: renameState, onDelete: deleteState, onStartChange: (state) => update((next) => ({ ...next, startState: state })), onFinalChange: (state) => update((next) => ({ ...next, finalStates: next.finalStates.includes(state) ? next.finalStates.filter((item) => item !== state) : [...next.finalStates, state] })), onAlphabetChange: updateAlphabet, onTransitionChange: (state, symbol, destination) => update((next) => { next.transitions[state][symbol] = destination; return next; }) };
  return <div className={`app-shell ${darkMode ? "theme-dark" : "theme-light"}`}><header className="top-nav"><div className="brand"><div className="brand-mark"><Network size={20} /></div><div><strong>AutomataLab</strong><span>Visual DFA workspace</span></div></div><div className="workspace-name"><span>Workspace</span><strong>Untitled DFA</strong></div><div className="nav-actions"><span className={`validation-pill ${validationError ? "warning" : "success"}`}><i />{validationError ? "Needs validation" : "DFA valid"}</span><button className="nav-button" onClick={() => setDarkMode((value) => !value)} aria-label="Toggle color theme">{darkMode ? <Sun size={17} /> : <Moon size={17} />}<span>{darkMode ? "Light" : "Dark"}</span></button><button className="nav-button" title="Use the editor to define every transition, then minimize the DFA."><CircleHelp size={17} /><span>Help</span></button></div></header><div className="workspace-layout"><WorkspaceSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((value) => !value)} exampleName={exampleName} onExampleChange={setExampleName} onLoadExample={loadExample} onReset={reset} editorProps={editorProps} /><main className="main-workspace"><section className="workspace-hero"><div><p className="kicker">DFA minimization lab</p><h1>Build, inspect, and simplify automata.</h1><p>Model your DFA in the editor, explore it visually, then compare its minimized equivalent.</p></div><button className="minimize-button" onClick={minimize}><GitMerge size={18} /> Minimize DFA</button></section>{error && <div role="alert" className="error"><span>{error}</span></div>}<AnalyticsCards dfa={dfa} result={result} validationError={validationError} /><StringSimulator key={`${dfa.states.join("|")}-${result?.minimizedStateCount || "original"}`} dfa={dfa} minimizedDFA={result?.minimizedDFA || null} onHighlightsChange={setSimulationHighlights} />{result && <MinimizationWalkthrough key={walkthroughRun} result={result} onHighlightChange={setWalkthroughHighlight} onMinimizedVisibilityChange={setShowMinimized} />}<DFAVisualizationPanels dfa={dfa} result={result} walkthroughHighlight={walkthroughHighlight} simulationHighlights={simulationHighlights} showMinimized={showMinimized} darkMode={darkMode} /><ResultsPanel result={result} /></main></div></div>;
}
export default App;
