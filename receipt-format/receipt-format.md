# Receipt Format — `cool.receipt.v1`

> **What this proves:** the envelope structure that makes a CooL receipt
> self-contained and offline-verifiable, and the honest status each domain carries.
> **What this does NOT prove:** correctness, fairness, or safety of the recorded
> output. The envelope is evidence of *what* was computed and that it is unforged.

The authoritative machine-readable definition is
[`receipt.schema.json`](receipt.schema.json). This document is the human companion.

## Envelope

```jsonc
{
  "schema": "cool.receipt.v1",
  "record": { /* inference core (01-record-format) + detached signature (02-signatures) */ },
  "binding_hash": "mh:sha256:…",
  "inclusion": { "leaf_index": 0, "tree_size": 3, "audit_path": ["mh:sha256:…"] } | null,
  "sth": { /* Signed Tree Head (03-transparency-log) */ } | null,
  "attestation": { "mode": "mock", "note": "no hardware quote in v0" },
  "anchor": null,
  "key_directory": {
    "cool-sign-2026Q2-01": { "ml_dsa_pub": "base64:…", "ed25519_pub": "base64:…" }
  }
}
```

## Fields and their status

| Field | Required | Status in v0.1.0 | Notes |
|---|---|---|---|
| `schema` | yes | — | Const `"cool.receipt.v1"`. |
| `record` | yes | **REAL** | The signed inference core. See `01-record-format`, `02-signatures`. |
| `binding_hash` | yes | **REAL** | `mh:sha256(canonicalCBOR(core))`. Recomputed and compared by the verifier. |
| `inclusion` | yes (nullable) | **REAL** | RFC 6962 audit path, or `null` if the receipt is not logged. |
| `sth` | yes (nullable) | **REAL** | Signed Tree Head, or `null`. Present iff `inclusion` is present. |
| `attestation` | yes | **MOCK** | `mode` is always `"mock"`; no hardware quote. Never reported as verified. |
| `anchor` | yes | **PLANNED/ABSENT** | Always `null`. Never reported as verified. |
| `key_directory` | yes | **REAL** | Embedded public keys (signing key, and log key when logged) so verification is offline. |

A conformant receipt MUST contain all of the above keys (the schema sets
`additionalProperties: false` throughout). `inclusion` and `sth` MUST both be present
or both be `null`. `anchor` MUST be `null` and `attestation.mode` MUST be `"mock"` in
`v0.1.0`.

## Self-contained verification

Because the receipt embeds `key_directory`, a verifier needs nothing but the file
itself — no network, no key server, no trust in CooL or the operator. See
[../verification-flow/verification-flow.md](../verification-flow/verification-flow.md)
for the exact algorithm and verdict semantics, and
[../examples/](../examples/) for golden vectors (`index.json` is the manifest).
