# Profile DRAFT — `cool.model-provenance.v1` (PLANNED, NOT IMPLEMENTED)

> **Status: PLANNED / DRAFT.** Exploratory sketch only — not frozen, not implemented,
> decision-gated. Confers no capability; must not be cited as something CooL does today.

> **What this profile would prove:** that a model's claimed *lineage* — its base
> model, the dataset(s) and recipe it was trained/fine-tuned with, and the resulting
> weights — is sealed and internally consistent, so the operator could not later
> misrepresent how the model came to be.
> **What it would NOT prove:** that the model is accurate, safe, unbiased, license-
> clean, or fit for any purpose. It seals a *provenance claim*, not the model's quality
> or the legality of its training data.

## Motivation

`cool.inference.v1` commits to *which* model ran (`model.weights_hash`). It says
nothing about *where that model came from*. A provenance profile would let a producer
publish a sealed record binding a weights hash to its training lineage, so a receipt's
`weights_hash` can be traced back to a committed origin.

## Sketch (illustrative only)

```jsonc
{
  "schema": "cool.model-provenance.v1",
  "model": { "id": "acme/credit-scorer", "version": "2026.06.0",
             "weights_hash": "mh:sha256:..." },
  "lineage": {
    "base_model_hash": "mh:sha256:..." | null,   // null for from-scratch
    "training_data": [ "mh:sha256:..." ],          // cool.dataset.v1 roots (see that profile)
    "recipe_hash": "mh:sha256:...",                // hyperparams / training config, committed
    "toolchain_hash": "mh:sha256:..."              // framework/version, committed
  },
  "signature": { /* hybrid signature over core ‖ binding */ }
}
```

## Open questions

- Granularity: full reproducibility (pinned data + deterministic kernels) vs a
  lighter "declared lineage" commitment.
- How a verifier would (optionally) check that a `weights_hash` in an inference
  receipt resolves to a published provenance record.
- Privacy: training data is usually not disclosable — commitments (hashes/Merkle
  roots) keep it sealed but unrevealed, as elsewhere in CooL.

## Status

**Not implemented. Not frozen. Decision-gated.** See `../../STATUS.md`.
