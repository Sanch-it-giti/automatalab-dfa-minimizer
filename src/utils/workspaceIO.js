import { validateDFA } from "../algorithms/dfaMinimizer.js";

export const WORKSPACE_STORAGE_KEY = "automatalab.workspace.v1";
export const WORKSPACE_FORMAT = "automatalab-dfa";
export const WORKSPACE_VERSION = 1;
const MAX_FILE_BYTES = 1_000_000;
const MAX_STATES = 100;
const MAX_ALPHABET = 30;

export function createWorkspaceDocument(dfa, workspaceName = "Untitled DFA") {
  validateDFA(dfa);
  return { format: WORKSPACE_FORMAT, version: WORKSPACE_VERSION, workspaceName: workspaceName.trim() || "Untitled DFA", dfa: structuredClone(dfa) };
}

export function parseWorkspaceDocument(text) {
  if (typeof text !== "string" || text.length > MAX_FILE_BYTES) throw new Error("The import file is empty or exceeds the 1 MB limit.");
  let document;
  try { document = JSON.parse(text); } catch { throw new Error("The selected file is not valid JSON."); }
  if (!document || document.format !== WORKSPACE_FORMAT || document.version !== WORKSPACE_VERSION || !document.dfa) throw new Error("This file is not an AutomataLab DFA export (format version 1).");
  if (typeof document.workspaceName !== "string") throw new Error("The workspace name is invalid.");
  if (!Array.isArray(document.dfa.states) || document.dfa.states.length > MAX_STATES) throw new Error(`A workspace may contain at most ${MAX_STATES} states.`);
  if (!Array.isArray(document.dfa.alphabet) || document.dfa.alphabet.length > MAX_ALPHABET) throw new Error(`A workspace may contain at most ${MAX_ALPHABET} alphabet symbols.`);
  validateDFA(document.dfa);
  return { dfa: structuredClone(document.dfa), workspaceName: document.workspaceName.trim() || "Untitled DFA" };
}

export function restoreWorkspace() {
  try {
    const saved = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    return saved ? parseWorkspaceDocument(saved) : null;
  } catch { return null; }
}

export function persistWorkspace(dfa, workspaceName) {
  try { window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(createWorkspaceDocument(dfa, workspaceName))); return true; } catch { return false; }
}

export function clearPersistedWorkspace() {
  try { window.localStorage.removeItem(WORKSPACE_STORAGE_KEY); } catch { /* storage can be unavailable */ }
}

export function resultReport(result, workspaceName) {
  return {
    format: "automatalab-minimization-report",
    version: 1,
    workspaceName: workspaceName || "Untitled DFA",
    generatedAt: new Date().toISOString(),
    originalDFA: result.originalDFA,
    minimizedDFA: result.minimizedDFA,
    reachable: result.reachable,
    unreachable: result.unreachable,
    equivalenceClasses: result.partitions,
    originalStateCount: result.originalStateCount,
    minimizedStateCount: result.minimizedStateCount,
    reductionPercentage: result.reductionPercentage,
  };
}

export function downloadText(filename, content, type = "application/json") {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function safeFileName(name) { return (name || "automatalab-dfa").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "automatalab-dfa"; }
