import { validateDFA } from "./dfaMinimizer.js";

export function tokenizeInput(dfa, input, tokenized = false) {
  const value = input.trim();
  if (!value) return { symbols: [] };
  const requiresTokens = dfa.alphabet.some((symbol) => [...symbol].length !== 1);
  if (requiresTokens && !tokenized) return { error: "This alphabet contains multi-character symbols. Use comma-separated tokens (for example: ab, token)." };
  const symbols = tokenized ? value.split(",").map((symbol) => symbol.trim()).filter(Boolean) : [...value];
  const invalid = symbols.find((symbol) => !dfa.alphabet.includes(symbol));
  return invalid ? { error: `“${invalid}” is not in the alphabet {${dfa.alphabet.join(", ")}}.` } : { symbols };
}

export function simulateDFA(dfa, input, options = {}) {
  try { validateDFA(dfa); } catch (caught) { return { valid: false, error: caught.message, symbols: [], steps: [] }; }
  const tokenized = options.tokenized || false;
  const parsed = tokenizeInput(dfa, input, tokenized);
  if (parsed.error) return { valid: false, error: parsed.error, symbols: [], steps: [] };
  let currentState = dfa.startState;
  const visitedStates = [currentState];
  const steps = parsed.symbols.map((symbol, index) => {
    const from = currentState;
    const to = dfa.transitions[from][symbol];
    currentState = to;
    visitedStates.push(to);
    return { index, symbol, from, to };
  });
  return {
    valid: true,
    error: "",
    startState: dfa.startState,
    symbols: parsed.symbols,
    visitedStates,
    steps,
    finalState: currentState,
    accepted: dfa.finalStates.includes(currentState),
    isEpsilon: parsed.symbols.length === 0,
  };
}

export function compareSimulations(original, minimized, input, options) {
  const originalRun = simulateDFA(original, input, options);
  const minimizedRun = simulateDFA(minimized, input, options);
  const valid = originalRun.valid && minimizedRun.valid;
  return { originalRun, minimizedRun, valid, equivalent: valid && originalRun.accepted === minimizedRun.accepted };
}
