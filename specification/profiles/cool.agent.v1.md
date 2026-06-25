# Profile DRAFT — `cool.agent.v1` (PLANNED, NOT IMPLEMENTED)

> **Status: PLANNED / DRAFT.** This is an exploratory sketch, not a frozen format
> and not implemented in any CooL code. It is **decision-gated**: whether agent
> receipts are CooL's wedge is an open product decision (see the master to-do). This
> document exists so the *shape* can be discussed; it confers no capability and must
> not be cited as something CooL does today.

> **What this profile would prove:** that a sequence (chain or DAG) of agent steps
> was computed in a specific order, each step sealed and linked to its predecessor, so
> the operator could not silently insert, drop, reorder, or edit a step after the fact.
> **What it would NOT prove:** that the agent's actions were correct, safe, aligned,
> authorized, or wise. It seals *what the agent did and in what order* — never whether
> doing it was a good idea.

## Motivation

A single `cool.inference.v1` receipt covers one model call. An agent run is *many*
calls, plus tool invocations, in a causal order. `cool.agent.v1` would let each step
carry its own sealed record and link into a verifiable **action chain** (linear) or
**action DAG** (branching/parallel), so the whole trajectory is tamper-evident, not
just the individual steps.

## Sketch of the linking fields (illustrative only)

Each step reuses the `cool.inference.v1` core (model, salted input/output hashes,
params, time, runtime) and adds a linking block:

```jsonc
{
  "schema": "cool.agent.v1",
  "trace_id": "01J6...",            // stable id for the whole agent run
  "step_index": 3,                   // monotone position within the trace
  "prev_record_ids": [               // [] for the first step; >1 for a DAG join
    "mh:sha256:..."                  // the binding_hash of each parent step
  ],
  "step_kind": "model" | "tool",     // a model call or a tool/action invocation
  "action": {                        // committed, never plaintext
    "name_hash": "mh:sha256:...",    // e.g. tool name
    "args_hash": "mh:sha256:...",
    "args_salt": "hex:...",
    "result_hash": "mh:sha256:...",
    "result_salt": "hex:..."
  },
  "inference": { /* cool.inference.v1 core, present when step_kind = "model" */ },
  "signature": { /* hybrid signature over this step's core ‖ binding */ }
}
```

## How tamper-evidence would work

- Each step's `binding_hash` commits to its own core **and** to `prev_record_ids`
  (the parents' binding hashes), so editing any earlier step changes every later
  step's binding — the chain/DAG is only valid if the whole lineage is intact.
- The terminal step(s) of a trace can be logged (RFC 6962) and, once Domains 1/4
  exist, attested and anchored — giving the whole run the same four-domain backing as
  a single inference receipt.

## Open questions (must be resolved before this is frozen)

- Linear chain vs full DAG (parallel tool calls / fan-in) — which does the first real
  use case actually need?
- Whether `prev_record_ids` references `record_id` (ULID) or `binding_hash`
  (cryptographic) — the latter is tamper-evident, the former is just a pointer.
- Replay/branching semantics (an agent that retries a step).

## Status

**Not implemented. Not frozen. Decision-gated.** Do not build until a design partner
needs agent receipts and the wedge decision is made. See `../../STATUS.md`.
