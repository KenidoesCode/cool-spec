# Profile DRAFT — `cool.dataset.v1` (PLANNED, NOT IMPLEMENTED)

> **Status: PLANNED / DRAFT.** Exploratory sketch only — not frozen, not implemented,
> decision-gated. Confers no capability; must not be cited as something CooL does today.

> **What this profile would prove:** that a dataset's exact content is committed (a
> Merkle root over its items), so the set cannot be altered after the fact and any
> single item's membership can be proven without revealing the rest.
> **What it would NOT prove:** that the data is accurate, lawfully collected, consented,
> unbiased, or appropriate for training. It seals *which bytes are in the set*, nothing
> about whether they should be.

## Motivation

`cool.model-provenance.v1` references training data by commitment. `cool.dataset.v1`
would define what that commitment *is*: a stable, tamper-evident manifest of a dataset
that a provenance record (or an external auditor) can point at and selectively prove
membership against — reusing CooL's existing RFC 6962 Merkle machinery.

## Sketch (illustrative only)

```jsonc
{
  "schema": "cool.dataset.v1",
  "dataset": { "id": "acme/credit-train", "version": "2026.05" },
  "manifest": {
    "item_count": 1048576,
    "merkle_root": "mh:sha256:...",   // RFC 6962 root over per-item leaf hashes
    "item_commitment": "salted-sha256" // how each item is hashed into a leaf
  },
  "signature": { /* hybrid signature over core ‖ binding */ }
}
```

Membership of any item would be shown with an ordinary RFC 6962 inclusion proof
against `manifest.merkle_root` — the same primitive `cool-sdk` already implements for
the transparency log, so no new cryptography is introduced.

## Open questions

- Item canonicalization (how a row/sample becomes a leaf) — must be deterministic.
- Whether order matters (sequence vs set) and how splits/shards compose.
- Reveal policy: commitments keep items sealed; selective disclosure would let a
  specific item be revealed and proven without exposing the dataset.

## Status

**Not implemented. Not frozen. Decision-gated.** See `../../STATUS.md`.
