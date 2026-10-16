# Viva Preparation

## What is a DFA?

A DFA is `(Q, Σ, δ, q0, F)`: finite states, alphabet, total deterministic transition function, one initial state, and accepting states. Each state/symbol pair has exactly one next state.

## Why require complete transitions?

The project implements total DFA semantics. Missing transitions make `δ` undefined, so it reports an error rather than guessing a destination.

## What is an unreachable state?

No input string reaches it from the start state. Removing it cannot affect the language accepted from the start state.

## When are states equivalent?

States `p` and `q` are equivalent when every suffix is accepted from `p` exactly when it is accepted from `q`; equivalently, they have the same right language.

## How does AutomataLab minimize a DFA?

It removes unreachable states, separates reachable final/non-final states, then repeatedly splits groups whose members transition to different current groups on some symbol. Stable groups are minimized states.

## Is the project using Hopcroft’s algorithm?

No. It uses educational iterative partition refinement and records intermediate groups for the walkthrough. It does not claim Hopcroft’s optimized worklist complexity.

## Why separate final and non-final states first?

Epsilon distinguishes them: it is accepted from a final state and rejected from a non-final state.

## How are minimized transitions well-defined?

Members of a stable partition have the same destination partition for every symbol. Thus any representative produces the same target group.

## How does exact equivalence work?

It breadth-first searches state pairs in the product automaton. An accepting-status mismatch gives a distinguishing string; exhausting reachable pairs proves equal languages. BFS makes the returned witness shortest in token length.

## Does testing a few strings prove equivalence?

No. It gives examples only. Product-automaton exploration is exact for finite complete DFAs.

## Why require commas for multi-character symbols?

`go` must be one token, not characters `g` and `o`; comma separation preserves alphabet-token boundaries.

## What does React Flow do here?

It provides drag, zoom, pan, and diagram controls. Formal DFA data remains in the transition table, not in React Flow state.

