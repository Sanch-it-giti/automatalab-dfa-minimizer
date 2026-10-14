import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import "./minimizationWalkthrough.css";
import "./walkthroughRefinements.css";

const speeds = [0.5, 1, 2];

function explanation(step, result) {
  if (step.kind === "reachability") return step.unreachable.length
    ? `Starting at ${result.originalDFA.startState}, the states ${step.unreachable.join(", ")} cannot be reached and are excluded from minimization.`
    : "Every state can be reached from the initial state, so none are removed.";
  if (step.kind === "initial") {
    const finals = result.originalDFA.finalStates;
    const nonFinals = result.reachable.filter((state) => !finals.includes(state));
    return `Create the first partition: final states {${finals.join(", ") || "∅"}} and reachable non-final states {${nonFinals.join(", ") || "∅"}}.`;
  }
  if (step.kind === "refinement" && step.splits.length) return `For each candidate group, compare the destination partition for every symbol in {${result.originalDFA.alphabet.join(", ")}}. Different destination patterns split a group.`;
  if (step.kind === "refinement") return "Every state in each group has the same destination-partition pattern. The partition is stable.";
  const merged = step.partitions.filter((group) => group.length > 1);
  return merged.length ? `The states in ${merged.map((group) => `{${group.join(", ")}}`).join(" and ")} merge into single minimized states.` : "No states merge: the reachable DFA is already minimal.";
}

export default function MinimizationWalkthrough({ result, onHighlightChange, onMinimizedVisibilityChange }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [preview, setPreview] = useState(false);
  const lastIndex = result.steps.length - 1;
  const currentIndex = Math.min(stepIndex, lastIndex);
  const step = result.steps[currentIndex];
  const highlight = useMemo(() => ({ partitions: step.partitions, unreachable: step.unreachable || [] }), [step]);

  useEffect(() => { onHighlightChange(highlight); }, [highlight, onHighlightChange]);
  useEffect(() => { onMinimizedVisibilityChange(preview || currentIndex === lastIndex); }, [currentIndex, lastIndex, onMinimizedVisibilityChange, preview]);
  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => {
      setStepIndex((current) => {
        if (current >= lastIndex) { setPlaying(false); return current; }
        return current + 1;
      });
    }, 1400 / speed);
    return () => window.clearInterval(timer);
  }, [lastIndex, playing, speed]);

  const move = (direction) => { setPlaying(false); setStepIndex((current) => Math.min(lastIndex, Math.max(0, current + direction))); };
  const groups = step.partitions.map((group) => `{${group.join(", ")}}`);
  return <section className="walkthrough panel"><div className="walkthrough-head"><div><span className="kicker">Guided minimization</span><h2>{step.title}</h2><p>{step.description}</p></div><span className="step-count">Step {currentIndex + 1} / {result.steps.length}</span></div><div className="walkthrough-progress"><i style={{ width: `${((currentIndex + 1) / result.steps.length) * 100}%` }} /></div><div className="walkthrough-body"><p className="walkthrough-explanation">{explanation(step, result)}</p>{step.kind === "reachability" ? <div className="reachability-groups"><p><b>Reachable</b> {step.reachable.join(", ")}</p><p><b>Unreachable</b> {step.unreachable.length ? step.unreachable.join(", ") : "None"}</p></div> : <div className="partition-list"><span>Current partitions</span><div>{groups.map((group, index) => <b className={`partition-chip partition-${index % 6}`} key={`${group}-${index}`}>{group}</b>)}</div></div>}{step.splits?.length > 0 && <div className="split-details">{step.splits.map((split, index) => <p key={index}>Split <b>{`{${split.from.join(", ")}}`}</b> into {split.buckets.map((bucket) => `{${bucket.states.join(", ")}}`).join(" and ")} because their transition signatures differ.</p>)}</div>}</div><div className="walkthrough-controls"><button onClick={() => move(-1)} disabled={currentIndex === 0}><ChevronLeft size={17} /> Previous</button><button className="play-button" onClick={() => setPlaying((value) => !value)} disabled={currentIndex === lastIndex}>{playing ? <Pause size={17} /> : <Play size={17} />}{playing ? "Pause" : "Play"}</button><button onClick={() => move(1)} disabled={currentIndex === lastIndex}>Next <ChevronRight size={17} /></button><button onClick={() => { setPlaying(false); setStepIndex(0); setPreview(false); }} title="Restart walkthrough"><RotateCcw size={16} /></button>{currentIndex !== lastIndex && <button onClick={() => setPreview((value) => !value)}>{preview ? "Hide final preview" : "Preview final result"}</button>}<label>Speed<select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>{speeds.map((value) => <option key={value} value={value}>{value}×</option>)}</select></label></div></section>;
}
