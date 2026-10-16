# Algorithms

## DFA model and validation

A DFA is `M = (Q, Σ, δ, q0, F)`: finite states `Q`, finite non-empty alphabet `Σ`, total transition function `δ: Q × Σ → Q`, initial state `q0`, and accepting set `F`. AutomataLab accepts only complete DFAs. `validateDFA` rejects duplicate/blank states, empty/duplicate symbols, invalid initial/final states, and invalid or missing transition destinations; it never invents a transition.

## Reachability

`getReachableStates` performs breadth-first exploration from `startState`, following every symbol from each visited state. It returns reachable states in source-array order. Conceptually, for `n = |Q|` and `k = |Σ|`, reachability takes `O(nk)` time and `O(n)` auxiliary space. The current JavaScript queue uses `shift()`, which can add array-operation overhead for unusually large inputs.

## Partition-refinement minimization

`minimizeDFA` implements iterative partition refinement.

1. Validate and find reachable/unreachable states.
2. Form reachable accepting and non-accepting groups.
3. For each state, compute its signature: the current destination partition index for every symbol.
4. Bucket a group by equal signatures; different signatures split it.
5. Repeat until an iteration has no split.
6. Construct one minimized state per stable group; its transition follows the representative state’s destination group.

At most `n - 1` splitting rounds occur. Because this readable implementation linearly searches partitions while creating signatures, a conservative worst-case running-time bound is `O(k n^3)`. It is not Hopcroft’s optimized `O(k n log n)` algorithm. The returned result also contains reachability data, partitions, walkthrough steps, state counts, and reduction percentage.

Minimized state names use set notation such as `{q1,q2}`. When state punctuation would make two group strings collide, the implementation suffixes a colliding name (for example, `#2`) to maintain unique identifiers.

## Walkthrough metadata

The minimizer records computed—not hardcoded—metadata for reachability, initial partitions, refinement partitions, split buckets/signatures, and completion. The walkthrough renders those records.

## String simulation

`simulateDFA` validates, tokenizes, and follows transitions from the initial state. It returns the visited states, each transition, final state, and acceptance result.

- Empty input is epsilon and is accepted iff the start state is final.
- A multi-character alphabet requires comma-separated tokens.
- With `m` input tokens, simulation time and trace storage are `O(m)` after validation.

`compareSimulations` compares runs for one input. It is useful for teaching but cannot prove two machines equivalent.

## Exact language equivalence

`verifyLanguageEquivalence(leftDFA, rightDFA)` is independent of the minimizer:

1. Validate both DFAs and require the same alphabet as a set.
2. Breadth-first search the reachable product automaton from `(q0-left, q0-right)`.
3. Compare accepting status at each pair.
4. On a mismatch, return the stored path as a shortest distinguishing token sequence.
5. If all reachable pairs agree, return exact equivalence.

`[]` represents epsilon. Symbols such as `go` remain atomic tokens. For state counts `n1`, `n2` and common alphabet size `k`, product exploration takes `O(k n1 n2)` time and `O(n1 n2)` state storage, plus counterexample paths. Breadth-first order gives minimum token length for a returned counterexample.

