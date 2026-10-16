import assert from "node:assert/strict";
import {
  getReachableStates,
  minimizeDFA,
  validateDFA,
} from "../src/algorithms/dfaMinimizer.js";
import { verifyLanguageEquivalence } from "../src/algorithms/dfaEquivalence.js";
import { buildGraphElements } from "../src/utils/dfaGraph.js";

const dfa = (states, alphabet, startState, finalStates, transitions) => ({
  states,
  alphabet,
  startState,
  finalStates,
  transitions,
});

function assertMinimizationIsCorrect(source, expectedStates, name) {
  const first = minimizeDFA(source);
  const second = minimizeDFA(source);
  const minimized = first.minimizedDFA;

  assert.equal(first.minimizedStateCount, expectedStates, `${name}: unexpected state count`);
  assert.doesNotThrow(() => validateDFA(minimized), `${name}: minimized DFA is invalid`);
  assert.deepEqual(first.partitions, second.partitions, `${name}: partition metadata is unstable`);

  const languageCheck = verifyLanguageEquivalence(source, minimized);
  assert.deepEqual(
    languageCheck,
    { valid: true, equivalent: true, error: null, distinguishingInput: null, visitedPairCount: languageCheck.visitedPairCount },
    `${name}: minimized DFA changed the language`,
  );

  assert.deepEqual(
    getReachableStates(minimized), minimized.states, `${name}: minimized DFA has unreachable states`);

  for (let index = 0; index < minimized.states.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < minimized.states.length; otherIndex += 1) {
      const left = { ...minimized, startState: minimized.states[index] };
      const right = { ...minimized, startState: minimized.states[otherIndex] };
      assert.equal(
        verifyLanguageEquivalence(left, right).equivalent,
        false,
        `${name}: remaining states ${left.startState} and ${right.startState} are equivalent`,
      );
    }
  }
}

const cases = [
  [
    "single state",
    dfa(["s"], ["x"], "s", ["s"], { s: { x: "s" } }),
    1,
  ],
  [
    "already minimal",
    dfa(["a", "b"], ["0"], "a", ["b"], {
      a: { 0: "b" },
      b: { 0: "a" },
    }),
    2,
  ],
  [
    "equivalent states",
    dfa(["q0", "q1", "q2", "q3"], ["0", "1"], "q0", ["q3"], {
      q0: { 0: "q1", 1: "q2" },
      q1: { 0: "q3", 1: "q3" },
      q2: { 0: "q3", 1: "q3" },
      q3: { 0: "q3", 1: "q3" },
    }),
    3,
  ],
  [
    "unreachable states",
    dfa(["q0", "q1", "dead"], ["0"], "q0", ["q1"], {
      q0: { 0: "q1" },
      q1: { 0: "q1" },
      dead: { 0: "dead" },
    }),
    2,
  ],
  [
    "all states accepting",
    dfa(["q0", "q1"], ["0"], "q0", ["q0", "q1"], {
      q0: { 0: "q1" },
      q1: { 0: "q0" },
    }),
    1,
  ],
  [
    "no accepting states",
    dfa(["q0", "q1"], ["0"], "q0", [], {
      q0: { 0: "q1" },
      q1: { 0: "q0" },
    }),
    1,
  ],
  [
    "self loops",
    dfa(["wait", "accept"], ["0", "1"], "wait", ["accept"], {
      wait: { 0: "wait", 1: "accept" },
      accept: { 0: "accept", 1: "accept" },
    }),
    2,
  ],
  [
    "cycles",
    dfa(["a", "b", "c"], ["0", "1"], "a", ["c"], {
      a: { 0: "b", 1: "a" },
      b: { 0: "c", 1: "a" },
      c: { 0: "a", 1: "c" },
    }),
    3,
  ],
  [
    "multiple alphabet symbols",
    dfa(["start", "left", "right", "done"], ["a", "b", "c"], "start", ["done"], {
      start: { a: "left", b: "right", c: "left" },
      left: { a: "done", b: "done", c: "done" },
      right: { a: "done", b: "done", c: "done" },
      done: { a: "done", b: "done", c: "done" },
    }),
    3,
  ],
  [
    "multiple refinement iterations",
    dfa(["a", "b", "c", "d", "e"], ["0", "1"], "a", ["e"], {
      a: { 0: "b", 1: "c" },
      b: { 0: "d", 1: "d" },
      c: { 0: "d", 1: "d" },
      d: { 0: "e", 1: "d" },
      e: { 0: "e", 1: "e" },
    }),
    4,
  ],
  [
    "unusual permitted state names",
    dfa(["a", "b", "a,b"], ["x", "y"], "a", ["a,b"], {
      a: { x: "b", y: "a,b" },
      b: { x: "b", y: "a,b" },
      "a,b": { x: "a,b", y: "a,b" },
    }),
    2,
  ],
];

for (const [name, source, expectedStates] of cases) {
  assertMinimizationIsCorrect(source, expectedStates, name);
}

assert.throws(
  () => validateDFA(dfa(["s"], [], "s", [], { s: {} })),
  /alphabet/,
);
assert.throws(
  () => validateDFA(dfa(["s"], ["x"], "s", [], { s: {} })),
  /missing transition/,
);
assert.throws(
  () => validateDFA(dfa(["s"], ["x"], "s", [], { s: { x: "missing" } })),
  /missing transition/,
);
assert.throws(
  () => validateDFA(dfa(["s"], ["x"], "missing", [], { s: { x: "s" } })),
  /initial state/,
);
assert.throws(
  () => validateDFA(dfa(["s", "s"], ["x"], "s", [], { s: { x: "s" } })),
  /unique/,
);

const acceptsEpsilon = dfa(["s"], ["go"], "s", ["s"], { s: { go: "s" } });
const rejectsEpsilon = dfa(["s"], ["go"], "s", [], { s: { go: "s" } });
assert.deepEqual(verifyLanguageEquivalence(acceptsEpsilon, rejectsEpsilon), {
  valid: true,
  equivalent: false,
  error: null,
  distinguishingInput: [],
  visitedPairCount: 1,
});

const oneGo = dfa(["s", "yes"], ["go"], "s", ["yes"], {
  s: { go: "yes" },
  yes: { go: "yes" },
});
assert.deepEqual(verifyLanguageEquivalence(rejectsEpsilon, oneGo).distinguishingInput, ["go"]);
assert.match(
  verifyLanguageEquivalence(acceptsEpsilon, dfa(["s"], ["stop"], "s", ["s"], { s: { stop: "s" } })).error,
  /same alphabet/,
);
assert.match(
  verifyLanguageEquivalence({ ...acceptsEpsilon, startState: "missing" }, acceptsEpsilon).error,
  /Left DFA is invalid/,
);

const graphDFA = dfa(["{q0}", "{q1,q2}"], ["a", "b"], "{q0}", ["{q1,q2}"], {
  "{q0}": { a: "{q1,q2}", b: "{q1,q2}" },
  "{q1,q2}": { a: "{q1,q2}", b: "{q0}" },
});
const graph = buildGraphElements(graphDFA);
assert.equal(graph.nodes.length, 2);
assert.equal(graph.edges.length, 3);
assert.equal(graph.edges.find((edge) => edge.source === "{q0}").label, "a, b");
assert.equal(graph.edges.find((edge) => edge.source === "{q1,q2}" && edge.target === "{q1,q2}").data.isLoop, true);
assert.equal(graph.edges.every((edge) => edge.type === "default" || edge.type === "smoothstep"), true);

console.log("DFA reliability tests passed");
