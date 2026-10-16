import { validateDFA } from "./dfaMinimizer.js";

function invalidResult(error) {
  return {
    valid: false,
    equivalent: false,
    error,
    distinguishingInput: null,
    visitedPairCount: 0,
  };
}

function haveMatchingAlphabets(leftAlphabet, rightAlphabet) {
  if (leftAlphabet.length !== rightAlphabet.length) {
    return false;
  }

  const rightSymbols = new Set(rightAlphabet);
  return leftAlphabet.every((symbol) => rightSymbols.has(symbol));
}

function pairKey(leftState, rightState) {
  // JSON encoding keeps pairs unambiguous even when state names contain
  // punctuation that would make delimiter-based keys unsafe.
  return JSON.stringify([leftState, rightState]);
}

/**
 * Proves language equivalence (or finds a shortest counterexample) by walking
 * the reachable product automaton. Alphabet entries are intentionally treated
 * as atomic input tokens, so symbols such as "ab" are supported.
 */
export function verifyLanguageEquivalence(leftDFA, rightDFA) {
  try {
    validateDFA(leftDFA);
  } catch (error) {
    return invalidResult(`Left DFA is invalid: ${error.message}`);
  }

  try {
    validateDFA(rightDFA);
  } catch (error) {
    return invalidResult(`Right DFA is invalid: ${error.message}`);
  }

  if (!haveMatchingAlphabets(leftDFA.alphabet, rightDFA.alphabet)) {
    return invalidResult("DFAs must use the same alphabet to compare their languages.");
  }

  const leftFinals = new Set(leftDFA.finalStates);
  const rightFinals = new Set(rightDFA.finalStates);
  const queue = [
    {
      leftState: leftDFA.startState,
      rightState: rightDFA.startState,
      input: [],
    },
  ];
  const visited = new Set([
    pairKey(leftDFA.startState, rightDFA.startState),
  ]);

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    const leftAccepts = leftFinals.has(current.leftState);
    const rightAccepts = rightFinals.has(current.rightState);

    if (leftAccepts !== rightAccepts) {
      return {
        valid: true,
        equivalent: false,
        error: null,
        distinguishingInput: current.input,
        visitedPairCount: visited.size,
      };
    }

    for (const symbol of leftDFA.alphabet) {
      const nextLeft = leftDFA.transitions[current.leftState][symbol];
      const nextRight = rightDFA.transitions[current.rightState][symbol];
      const key = pairKey(nextLeft, nextRight);

      if (!visited.has(key)) {
        visited.add(key);
        queue.push({
          leftState: nextLeft,
          rightState: nextRight,
          input: [...current.input, symbol],
        });
      }
    }
  }

  return {
    valid: true,
    equivalent: true,
    error: null,
    distinguishingInput: null,
    visitedPairCount: visited.size,
  };
}
