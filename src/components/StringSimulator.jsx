import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { compareSimulations, simulateDFA } from "../algorithms/dfaSimulator";
import "./stringSimulator.css";

const speeds = [0.5, 1, 2];

function highlightFor(run, position) {
  if (!run?.valid) return null;
  const activeStep = position > 0 ? run.steps[position - 1] : null;
  return { activeState: run.visitedStates[position], visitedStates: run.visitedStates.slice(0, position + 1), activeTransition: activeStep ? { source: activeStep.from, target: activeStep.to } : null };
}

export default function StringSimulator({ dfa, minimizedDFA, onHighlightsChange }) {
  const [input, setInput] = useState("");
  const [tokenized, setTokenized] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const activeComparison = comparison?.source === dfa ? comparison : null;
  const requiresTokens = dfa.alphabet.some((symbol) => [...symbol].length !== 1);
  const originalRun = activeComparison?.originalRun;
  const symbolCount = originalRun?.symbols.length || 0;
  const completed = activeComparison?.valid && position === symbolCount;
  const highlights = useMemo(() => activeComparison?.valid ? { original: highlightFor(originalRun, position), minimized: minimizedDFA ? highlightFor(activeComparison.minimizedRun, position) : null } : null, [activeComparison, minimizedDFA, originalRun, position]);

  useEffect(() => { onHighlightsChange(highlights); }, [highlights, onHighlightsChange]);
  useEffect(() => {
    if (!playing || !activeComparison?.valid) return undefined;
    const timer = window.setInterval(() => setPosition((current) => {
      if (current >= symbolCount) { setPlaying(false); return current; }
      return current + 1;
    }), 1200 / speed);
    return () => window.clearInterval(timer);
  }, [activeComparison, playing, speed, symbolCount]);

  const run = () => { const next = minimizedDFA ? compareSimulations(dfa, minimizedDFA, input, { tokenized: tokenized || requiresTokens }) : { originalRun: simulateDFA(dfa, input, { tokenized: tokenized || requiresTokens }), minimizedRun: null, valid: true, equivalent: true }; next.valid = next.originalRun.valid && (!next.minimizedRun || next.minimizedRun.valid); next.source = dfa; setComparison(next); setPosition(0); setPlaying(false); };
  const resetInput = (value) => { setInput(value); setComparison(null); setPosition(0); setPlaying(false); };
  const move = (amount) => { setPlaying(false); setPosition((current) => Math.max(0, Math.min(symbolCount, current + amount))); };
  const status = !activeComparison ? null : !activeComparison.valid ? activeComparison.originalRun.error : completed ? activeComparison.equivalent ? "Both DFAs agree on the result." : "Diagnostic: DFA results do not match." : `Ready at ${originalRun.visitedStates[position]}; ${symbolCount - position} symbol(s) remain.`;
  return <section className="string-simulator panel"><div className="simulator-head"><div><span className="kicker">String acceptance</span><h2>Test an input string</h2><p>Trace the original DFA and, when available, its minimized equivalent.</p></div></div><div className="simulator-input"><label>Input sequence<input value={input} onChange={(event) => resetInput(event.target.value)} placeholder={requiresTokens ? "token1, token2" : "0101 (leave blank for ε)"} /></label>{!requiresTokens && <label className="token-toggle"><input type="checkbox" checked={tokenized} onChange={(event) => { setTokenized(event.target.checked); setComparison(null); }} /> Comma-separated tokens</label>}<button onClick={run}>Run simulation</button></div>{requiresTokens && <p className="token-note">This alphabet contains multi-character symbols. Enter comma-separated tokens; ε is an empty input.</p>}{activeComparison && <div className="simulation-body">{activeComparison.valid ? <><div className="symbol-progress"><span>Input</span><div>{originalRun.symbols.length ? originalRun.symbols.map((symbol, index) => <b className={index < position ? "consumed" : index === position ? "current" : ""} key={`${symbol}-${index}`}>{symbol}</b>) : <b className="current">ε</b>}</div></div><p className={`simulation-status ${completed && !activeComparison.equivalent ? "mismatch" : ""}`}>{status}</p><div className="simulation-trace"><article><span>Original path</span><strong>{originalRun.visitedStates.slice(0, position + 1).join(" → ")}</strong></article>{activeComparison.minimizedRun && <article><span>Minimized path</span><strong>{activeComparison.minimizedRun.visitedStates.slice(0, position + 1).join(" → ")}</strong></article>}</div>{completed && <div className="simulation-results"><article className={originalRun.accepted ? "accepted" : "rejected"}><span>Original DFA</span><strong>{originalRun.accepted ? "Accepted" : "Rejected"}</strong><small>Final state: {originalRun.finalState}</small></article>{activeComparison.minimizedRun && <article className={activeComparison.minimizedRun.accepted ? "accepted" : "rejected"}><span>Minimized DFA</span><strong>{activeComparison.minimizedRun.accepted ? "Accepted" : "Rejected"}</strong><small>Final state: {activeComparison.minimizedRun.finalState}</small></article>}</div>}</> : <p className="simulation-error">{status}</p>}</div>}<div className="simulation-controls"><button onClick={() => move(-1)} disabled={!activeComparison?.valid || position === 0}><ChevronLeft size={16} /> Previous</button><button className="play-button" onClick={() => setPlaying((value) => !value)} disabled={!activeComparison?.valid || completed}>{playing ? <Pause size={16} /> : <Play size={16} />}{playing ? "Pause" : "Play"}</button><button onClick={() => move(1)} disabled={!activeComparison?.valid || completed}>Next <ChevronRight size={16} /></button><button onClick={() => { setPlaying(false); setPosition(0); }} disabled={!activeComparison?.valid} title="Restart"><RotateCcw size={16} /></button><label>Speed<select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>{speeds.map((value) => <option key={value} value={value}>{value}×</option>)}</select></label></div></section>;
}
