export const examples = {
  equivalent: { title: "Equivalent states example", dfa: { states: ["q0", "q1", "q2", "q3"], alphabet: ["0", "1"], startState: "q0", finalStates: ["q3"], transitions: { q0: { 0: "q1", 1: "q2" }, q1: { 0: "q3", 1: "q1" }, q2: { 0: "q3", 1: "q2" }, q3: { 0: "q3", 1: "q3" } } } },
  unreachable: { title: "Unreachable states example", dfa: { states: ["q0", "q1", "q2", "q3", "q4", "q5"], alphabet: ["0", "1"], startState: "q0", finalStates: ["q3", "q5"], transitions: { q0: { 0: "q1", 1: "q0" }, q1: { 0: "q2", 1: "q1" }, q2: { 0: "q3", 1: "q2" }, q3: { 0: "q3", 1: "q3" }, q4: { 0: "q5", 1: "q4" }, q5: { 0: "q4", 1: "q5" } } } },
};

export const createBlankDFA = () => ({ states: ["q0"], alphabet: ["0", "1"], startState: "q0", finalStates: [], transitions: { q0: { 0: "", 1: "" } } });
