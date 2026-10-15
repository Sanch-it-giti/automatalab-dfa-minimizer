import assert from "node:assert/strict";
import { simulateDFA, compareSimulations } from "../src/algorithms/dfaSimulator.js";
import { minimizeDFA } from "../src/algorithms/dfaMinimizer.js";

const dfa = { states: ["q0", "q1"], alphabet: ["0", "1"], startState: "q0", finalStates: ["q1"], transitions: { q0: { 0: "q0", 1: "q1" }, q1: { 0: "q0", 1: "q1" } } };
assert.equal(simulateDFA(dfa, "01").accepted, true);
assert.equal(simulateDFA(dfa, "00").accepted, false);
assert.equal(simulateDFA({ ...dfa, finalStates: ["q0"] }, "").accepted, true);
assert.equal(simulateDFA(dfa, "").accepted, false);
assert.match(simulateDFA(dfa, "2").error, /not in the alphabet/);

const multi = { states: ["a"], alphabet: ["go"], startState: "a", finalStates: ["a"], transitions: { a: { go: "a" } } };
assert.match(simulateDFA(multi, "go").error, /multi-character/);
assert.equal(simulateDFA(multi, "go", { tokenized: true }).accepted, true);
assert.equal(compareSimulations(dfa, minimizeDFA(dfa).minimizedDFA, "01").equivalent, true);
assert.equal(simulateDFA({ states: ["s"], alphabet: ["x"], startState: "s", finalStates: ["s"], transitions: { s: { x: "s" } } }, "x").accepted, true);
assert.deepEqual(simulateDFA(dfa, "01"), simulateDFA(dfa, "01"));
console.log("dfaSimulator tests passed");
