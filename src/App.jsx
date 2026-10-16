import { useEffect, useMemo, useRef, useState } from "react";
import { CircleHelp, Download, FileDown, FileUp, GitMerge, Moon, Network, Sun } from "lucide-react";
import { minimizeDFA, validateDFA } from "./algorithms/dfaMinimizer";
import AnalyticsCards from "./components/AnalyticsCards";
import DFAVisualizationPanels from "./components/DFAVisualizationPanels";
import ResultsPanel from "./components/ResultsPanel";
import MinimizationWalkthrough from "./components/MinimizationWalkthrough";
import StringSimulator from "./components/StringSimulator";
import WorkspaceSidebar from "./components/WorkspaceSidebar";
import WorkspaceTabs from "./components/WorkspaceTabs";
import { createBlankDFA, examples } from "./data/examples";
import { createWorkspaceDocument, downloadText, parseWorkspaceDocument, persistWorkspace, restoreWorkspace, resultReport, safeFileName } from "./utils/workspaceIO";
import "./App.css";
import "./workspaceIO.css";

const clone = (value) => structuredClone(value);
const initialWorkspace = typeof window !== "undefined" ? restoreWorkspace() || { dfa: examples.equivalent.dfa, workspaceName: "Untitled DFA" } : { dfa: examples.equivalent.dfa, workspaceName: "Untitled DFA" };
function getValidationError(dfa) { try { validateDFA(dfa); return ""; } catch (caught) { return caught.message; } }

function App() {
  const [dfa, setDfa] = useState(() => clone(initialWorkspace.dfa));
  const [workspaceName, setWorkspaceName] = useState(initialWorkspace.workspaceName);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [exampleName, setExampleName] = useState("equivalent");
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [walkthroughHighlight, setWalkthroughHighlight] = useState(null);
  const [showMinimized, setShowMinimized] = useState(false);
  const [walkthroughRun, setWalkthroughRun] = useState(0);
  const [simulationHighlights, setSimulationHighlights] = useState(null);
  const [workspaceView, setWorkspaceView] = useState("designer");
  const importRef = useRef(null);
  const validationError = useMemo(() => getValidationError(dfa), [dfa]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSaveStatus(persistWorkspace(dfa, workspaceName) ? "Saved" : "Save unavailable"), 450);
    return () => window.clearTimeout(timer);
  }, [dfa, workspaceName]);

  const clearDerived = () => { setResult(null); setWalkthroughHighlight(null); setSimulationHighlights(null); setShowMinimized(false); };
  const update = (callback) => { setDfa((current) => callback(clone(current))); clearDerived(); setError(""); setNotice(""); };
  const addState = () => update((next) => { let n = next.states.length; let name = `q${n}`; while (next.states.includes(name)) name = `q${++n}`; next.states.push(name); next.transitions[name] = Object.fromEntries(next.alphabet.map((symbol) => [symbol, ""])); return next; });
  const renameState = (oldName, newName) => update((next) => { const name = newName.trim(); if (!name) { setError("A state name cannot be empty."); return next; } if (name !== oldName && next.states.includes(name)) { setError(`State “${name}” already exists.`); return next; } next.states[next.states.indexOf(oldName)] = name; next.transitions[name] = next.transitions[oldName]; delete next.transitions[oldName]; Object.values(next.transitions).forEach((row) => Object.keys(row).forEach((symbol) => { if (row[symbol] === oldName) row[symbol] = name; })); if (next.startState === oldName) next.startState = name; next.finalStates = next.finalStates.map((state) => state === oldName ? name : state); return next; });
  const deleteState = (state) => update((next) => { next.states = next.states.filter((item) => item !== state); delete next.transitions[state]; Object.values(next.transitions).forEach((row) => Object.keys(row).forEach((symbol) => { if (row[symbol] === state) row[symbol] = ""; })); next.finalStates = next.finalStates.filter((item) => item !== state); if (next.startState === state) next.startState = next.states[0]; return next; });
  const updateAlphabet = (text) => update((next) => { const alphabet = text.split(",").map((symbol) => symbol.trim()).filter(Boolean); next.alphabet = alphabet; next.states.forEach((state) => { const old = next.transitions[state] || {}; next.transitions[state] = Object.fromEntries(alphabet.map((symbol) => [symbol, old[symbol] || ""])); }); return next; });
  const minimize = () => { try { validateDFA(dfa); clearDerived(); setResult(minimizeDFA(clone(dfa))); setWalkthroughRun((run) => run + 1); setWorkspaceView("minimization"); setError(""); setNotice("Minimization complete. Follow the guided walkthrough or preview the final DFA."); } catch (caught) { clearDerived(); setError(caught.message || "Please correct the DFA and try again."); } };
  const reset = () => { setDfa(createBlankDFA()); setWorkspaceName("Untitled DFA"); clearDerived(); setError(""); setNotice("Workspace reset."); };
  const loadExample = () => { setDfa(clone(examples[exampleName].dfa)); clearDerived(); setError(""); setNotice("Example loaded."); };
  const exportDfa = () => { try { downloadText(`${safeFileName(workspaceName)}.json`, JSON.stringify(createWorkspaceDocument(dfa, workspaceName), null, 2)); setNotice("DFA JSON downloaded."); } catch (caught) { setError(caught.message); } };
  const exportResult = () => { if (!result) return; downloadText(`${safeFileName(workspaceName)}-minimization.json`, JSON.stringify(resultReport(result, workspaceName), null, 2)); setNotice("Minimization report downloaded."); };
  const importDfa = async (event) => { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; if (file.size > 1_000_000) { setError("Import files must be smaller than 1 MB."); return; } try { const next = parseWorkspaceDocument(await file.text()); setDfa(next.dfa); setWorkspaceName(next.workspaceName); clearDerived(); setError(""); setNotice("Workspace imported successfully."); } catch (caught) { setError(caught.message || "The file could not be imported."); } };
  const editorProps = { dfa, onAdd: addState, onRename: renameState, onDelete: deleteState, onStartChange: (state) => update((next) => ({ ...next, startState: state })), onFinalChange: (state) => update((next) => ({ ...next, finalStates: next.finalStates.includes(state) ? next.finalStates.filter((item) => item !== state) : [...next.finalStates, state] })), onAlphabetChange: updateAlphabet, onTransitionChange: (state, symbol, destination) => update((next) => { next.transitions[state][symbol] = destination; return next; }) };

  return <div className={`app-shell ${darkMode ? "theme-dark" : "theme-light"}`}><header className="top-nav"><div className="brand"><div className="brand-mark"><Network size={20} /></div><div><strong>AutomataLab</strong><span>Visual DFA workspace</span></div></div><label className="workspace-name"><span>Workspace</span><input value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} aria-label="Workspace name" /></label><div className="nav-actions"><span className="save-status">{saveStatus}</span><span className={`validation-pill ${validationError ? "warning" : "success"}`}><i />{validationError ? "Needs validation" : "DFA valid"}</span><button className="nav-button" onClick={() => importRef.current?.click()}><FileUp size={16} /><span>Import</span></button><button className="nav-button" onClick={exportDfa}><Download size={16} /><span>Export</span></button>{result && <button className="nav-button" onClick={exportResult}><FileDown size={16} /><span>Report</span></button>}<input ref={importRef} className="file-input" type="file" accept="application/json,.json" onChange={importDfa} /><button className="nav-button" onClick={() => setDarkMode((value) => !value)} aria-label="Toggle color theme">{darkMode ? <Sun size={17} /> : <Moon size={17} />}<span>{darkMode ? "Light" : "Dark"}</span></button><button className="nav-button" title="Use the editor to define every transition, then minimize the DFA."><CircleHelp size={17} /><span>Help</span></button></div></header><div className="workspace-layout"><WorkspaceSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((value) => !value)} exampleName={exampleName} onExampleChange={setExampleName} onLoadExample={loadExample} onReset={reset} editorProps={editorProps} /><main className={`main-workspace workspace-view-${workspaceView}`}><section className="workspace-hero"><div><p className="kicker">DFA minimization lab</p><h1>{workspaceView === "designer" ? "Build a precise DFA." : workspaceView === "minimization" ? "Understand every minimization step." : workspaceView === "simulator" ? "Trace exactly what your DFA accepts." : "Review the minimized automaton."}</h1><p>All workspace areas use the same DFA, validation state, and saved project.</p></div><button className="minimize-button" onClick={minimize}><GitMerge size={18} /> Minimize DFA</button></section><WorkspaceTabs activeTab={workspaceView} onChange={setWorkspaceView} hasResult={Boolean(result)} />{error && <div role="alert" className="error"><span>{error}</span></div>}{notice && <div role="status" className="notice"><span>{notice}</span></div>}<section id="workspace-panel-designer" role="tabpanel" aria-labelledby="workspace-tab-designer" className="workspace-section workspace-section-analytics"><AnalyticsCards dfa={dfa} result={result} validationError={validationError} /></section><section id="workspace-panel-simulator" role="tabpanel" aria-labelledby="workspace-tab-simulator" className="workspace-section workspace-section-simulator"><StringSimulator key={`${JSON.stringify(dfa)}-${walkthroughRun}`} dfa={dfa} minimizedDFA={result?.minimizedDFA || null} onHighlightsChange={setSimulationHighlights} /></section><section id="workspace-panel-minimization" role="tabpanel" aria-labelledby="workspace-tab-minimization" className="workspace-section workspace-section-minimization">{result ? <MinimizationWalkthrough key={walkthroughRun} result={result} onHighlightChange={setWalkthroughHighlight} onMinimizedVisibilityChange={setShowMinimized} /> : <div className="workspace-empty panel"><GitMerge size={22} /><h2>Minimization is ready when your DFA is complete.</h2><p>Finish every transition in the designer, then select Minimize DFA to inspect reachability and partition refinement.</p><button className="minimize-button" onClick={minimize}>Minimize DFA</button></div>}</section><section className="workspace-section workspace-section-visualization"><DFAVisualizationPanels dfa={dfa} result={result} walkthroughHighlight={walkthroughHighlight} simulationHighlights={simulationHighlights} showMinimized={showMinimized} darkMode={darkMode} workspaceView={workspaceView} /></section><section id="workspace-panel-results" role="tabpanel" aria-labelledby="workspace-tab-results" className="workspace-section workspace-section-results"><AnalyticsCards dfa={dfa} result={result} validationError={validationError} /><ResultsPanel result={result} /></section></main></div></div>;
}
export default App;
