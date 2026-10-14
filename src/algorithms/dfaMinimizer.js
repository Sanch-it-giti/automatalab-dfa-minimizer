
export function validateDFA(dfa) {
  const { states, alphabet, startState, finalStates, transitions } = dfa;

  if (!Array.isArray(states) || states.length === 0) {
    throw new Error("The DFA must contain at least one state.");
  }

  if (new Set(states).size !== states.length) {
    throw new Error("State names must be unique.");
  }

  if (states.some((state) => typeof state !== "string" || !state.trim())) {
    throw new Error("Every state must have a valid name.");
  }

  if (!Array.isArray(alphabet) || alphabet.length === 0) {
    throw new Error("The alphabet must contain at least one symbol.");
  }

  if (alphabet.some((symbol) => typeof symbol !== "string" || !symbol)) {
    throw new Error("Alphabet symbols must be non-empty strings.");
  }

  if (new Set(alphabet).size !== alphabet.length) {
    throw new Error("Alphabet symbols must be unique.");
  }

  if (!states.includes(startState)) {
    throw new Error("The initial state must exist in the DFA.");
  }

  if (!Array.isArray(finalStates)) {
    throw new Error("Final states must be an array.");
  }

  for (const state of finalStates) {
    if (!states.includes(state)) {
      throw new Error(`Unknown final state: ${state}`);
    }
  }

  if (!transitions || typeof transitions !== "object") {
    throw new Error("The DFA must have a transition table.");
  }

  for (const state of states) {
    for (const symbol of alphabet) {
      const destination = transitions[state]?.[symbol];

      if (!states.includes(destination)) {
        throw new Error(
          `Invalid or missing transition: δ(${state}, ${symbol})`
        );
      }
    }
  }

  return true;
}

export function getReachableStates(dfa) {
  validateDFA(dfa);

  const reachable = new Set([dfa.startState]);
  const queue = [dfa.startState];

  while (queue.length > 0) {
    const current = queue.shift();

    for (const symbol of dfa.alphabet) {
      const next = dfa.transitions[current][symbol];

      if (!reachable.has(next)) {
        reachable.add(next);
        queue.push(next);
      }
    }
  }

  return dfa.states.filter((state) => reachable.has(state));
}

function getSignature(state, partitions, dfa) {
  return JSON.stringify(
    dfa.alphabet.map((symbol) => {
      const destination = dfa.transitions[state][symbol];

      return partitions.findIndex((group) =>
        group.includes(destination)
      );
    })
  );
}

export function minimizeDFA(dfa) {
  validateDFA(dfa);

  const reachable = getReachableStates(dfa);
  const unreachable = dfa.states.filter(
    (state) => !reachable.includes(state)
  );

  const finalSet = new Set(dfa.finalStates);

  const nonFinal = reachable.filter(
    (state) => !finalSet.has(state)
  );

  const final = reachable.filter(
    (state) => finalSet.has(state)
  );

  let partitions = [nonFinal, final].filter(
    (group) => group.length > 0
  );

  const steps = [
    {
      title: "Remove unreachable states",
      description: `${unreachable.length} unreachable state(s) found.`,
      unreachable: [...unreachable],
      partitions: partitions.map((group) => [...group]),
    },
    {
      title: "Initial partition",
      description: "Separate accepting and non-accepting states.",
      partitions: partitions.map((group) => [...group]),
    },
  ];

  let changed = true;
  let iteration = 0;

  while (changed) {
    changed = false;
    iteration++;

    const nextPartitions = [];

    for (const group of partitions) {
      const buckets = new Map();

      for (const state of group) {
        const signature = getSignature(state, partitions, dfa);

        if (!buckets.has(signature)) {
          buckets.set(signature, []);
        }

        buckets.get(signature).push(state);
      }

      if (buckets.size > 1) {
        changed = true;
      }

      nextPartitions.push(...buckets.values());
    }

    partitions = nextPartitions;

    steps.push({
      title: `Refinement ${iteration}`,
      description: changed
        ? "Split states with different transition behavior."
        : "No more splits are required.",
      partitions: partitions.map((group) => [...group]),
    });
  }

  const groupNames = partitions.map((group) =>
    `{${group.join(",")}}`
  );

  const stateToGroup = new Map();

  partitions.forEach((group, index) => {
    for (const state of group) {
      stateToGroup.set(state, groupNames[index]);
    }
  });

  const minimizedTransitions = {};

  partitions.forEach((group, index) => {
    const representative = group[0];
    const name = groupNames[index];

    minimizedTransitions[name] = {};

    for (const symbol of dfa.alphabet) {
      const destination =
        dfa.transitions[representative][symbol];

      minimizedTransitions[name][symbol] =
        stateToGroup.get(destination);
    }
  });

  const minimizedDFA = {
    states: groupNames,
    alphabet: [...dfa.alphabet],
    startState: stateToGroup.get(dfa.startState),
    finalStates: groupNames.filter((name, index) =>
      partitions[index].some((state) => finalSet.has(state))
    ),
    transitions: minimizedTransitions,
  };

  steps.push({
    title: "Minimized DFA generated",
    description: `Reduced ${dfa.states.length} states to ${groupNames.length}.`,
    partitions: partitions.map((group) => [...group]),
  });

  return {
    originalDFA: dfa,
    minimizedDFA,
    reachable,
    unreachable,
    partitions,
    steps,
    originalStateCount: dfa.states.length,
    minimizedStateCount: groupNames.length,
    reductionPercentage:
      ((dfa.states.length - groupNames.length) /
        dfa.states.length) * 100,
  };
}
