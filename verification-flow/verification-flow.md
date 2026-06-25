# Verification Flow

> **What this proves:** that following this exact, ordered, offline algorithm yields
> a faithful per-domain verdict for a `cool.receipt.v1` receipt — and that the
> verdict is `ok` only when the record is authentic and unaltered.
> **What this does NOT prove:** anything beyond the receipt's own contents. A passing
> verdict never asserts correctness, fairness, safety, independent witnessing, real
> attestation, or anchoring.

This document is normative and self-contained: an independent engineer can implement
an interoperable verifier from it plus the schema. The reference implementation lives
in `cool-sdk` (`verifyReceipt`) and is shared verbatim by `cool-verifier`.

## Inputs

A single receipt (parsed JSON). No network access. No trust in CooL or the operator.
The receipt carries every public key needed to verify it.

## Algorithm (ordered)

1. **Schema** — Parse and validate against `receipt.schema.json`. If invalid, the
   receipt is malformed: return `ok: false` with the `binding` and `signature`
   domains marked FAILED and the schema errors in `reasons`. Stop.

2. **Binding** — Recompute `binding_hash` as
   `mh:sha256(canonicalCBOR(core))` where `core` is the record without its
   `signature`. Compare to the receipt's `binding_hash`.
   - equal → `binding: pass`
   - not equal → `binding: fail`

3. **Signature** — Resolve `record.signature.key_id` in `key_directory`. Reconstruct
   `message = canonicalCBOR(core) ‖ multihashDigest(binding_hash)`. Verify **both**
   ML-DSA-65 and Ed25519.
   - both verify → `signature: pass`
   - missing key, or either signature fails → `signature: fail` (naming which scheme)

4. **Inclusion** — If `inclusion` and `sth` are both present:
   - check `inclusion.tree_size == sth.tree_size` and `0 ≤ leaf_index < tree_size`;
   - recompute the Merkle root from `leafHash(multihashDigest(binding_hash))`,
     `leaf_index`, `tree_size`, and `audit_path`; compare to `sth.root_hash`;
   - verify the STH signature (key from `key_directory`) over
     `canonicalCBOR({log_id, tree_size, root_hash, timestamp})`;
   - all hold → `inclusion: pass`; any fails → `inclusion: fail`.
   - If both `inclusion` and `sth` are absent → `inclusion: absent`.
   - If exactly one is present → `inclusion: fail` (malformed).

5. **Witnesses** — From `sth.witnesses`, count `external: true` co-signatures that
   verify over the STH core, against the threshold (default 0). Self-signatures
   (`external: false`) are shown but never counted. In `v0.1.0` this is `0 independent`
   → `witnesses: absent`. The witnesses domain is `pass` only when enough external
   witnesses verify — which cannot happen in this build.

6. **Attestation** — `runtime.mode` is `"mock"` → `attestation: mock`. **Never pass.**

7. **Anchor** — `anchor` is `null` → `anchor: absent`. **Never pass.**

8. **Verdict** —
   ```
   ok = (binding == pass) AND (signature == pass) AND (inclusion ∈ {pass, absent})
   ```
   Mock/absent domains are reported but never cause `ok` to be true on their own, and
   are never rendered as a pass.

## Per-domain status semantics

| Status | Glyph | Meaning |
|---|---|---|
| `pass` | `✓` | The domain was checked and holds. |
| `fail` | `✗` | The domain was checked and does not hold. Forces `ok: false`. |
| `mock` | `—` | A real implementation is mocked in this build (attestation). Never a pass. |
| `absent` | `—` | Not present / not applicable (inclusion when unlogged, anchor, witnesses). Never a pass. |

**The one rule (N3):** attestation and anchor MUST render as `—` (mock/absent) and
MUST NEVER render as `✓` in this build.

## Verdict shape

```jsonc
{
  "ok": true,
  "schema": "cool.receipt.v1",
  "subject": { "model": "…", "version": "…", "issued_at": "…", "record_id": "…", "key_id": "…" },
  "checks": {
    "binding":     { "status": "pass",   "detail": "recomputed from record, matches" },
    "signature":   { "status": "pass",   "detail": "ML-DSA-65 + Ed25519 valid (key …)" },
    "inclusion":   { "status": "pass",   "detail": "leaf 0 ∈ tree(3); STH signature valid" },
    "witnesses":   { "status": "absent", "detail": "0 independent (1 self-signature, not counted)" },
    "attestation": { "status": "mock",   "detail": "MOCK — no hardware quote present (planned)" },
    "anchor":      { "status": "absent", "detail": "NONE — not anchored to a public chain (planned)" }
  },
  "reasons": []
}
```

## CLI exit codes (`cool verify`)

| Code | Meaning |
|---|---|
| `0` | `ok: true` — including legitimately mock/absent domains. |
| `2` | REJECTED — a required domain (binding, signature, or inclusion-when-present) FAILED. |
| `1` | Operational error — file not found, invalid JSON, or usage error. |

`--strict` keeps sterner wording about mock/absent domains but does not change exit
codes for known-absent domains; any `✗` still exits non-zero. `--json` emits the
verdict shape above.
