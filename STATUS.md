# CooL — Implementation Status

This file is the **single source of truth** for what is implemented versus mocked
versus planned in the open-core build (`v0.1.0`). The SDK and verifier READMEs link
here, and their wording must match this table. When in doubt, this file wins.

> **The one rule:** a mocked or absent domain is **never** presented as verified.
> The verifier shows three states — `✓ verified`, `✗ FAILED`, `— mock/absent` — and
> attestation and anchor can only ever be `—` in this build.

## Trust domains

| Domain | Status | What that means here |
|---|---|---|
| **2 · Post-quantum + classical signature** (ML-DSA-65 / FIPS 204 + Ed25519, hybrid) | **REAL** | Fully implemented. Both signatures must verify or the `signature` check FAILS. |
| **3 · Transparency log + inclusion** (RFC 6962 Merkle, STH) | **REAL** | Real in-memory append-only log, real inclusion proofs, real signed tree heads. Verified fully offline. |
| **3b · Witnesses** | **STRUCTURAL ONLY** | The STH can carry witness co-signatures, and the verifier checks them — but there are **no external witnesses** in this build. The single CooL self-signature (`external: false`) is shown and **never counted as independent**. |
| **1 · TEE attestation** (hardware quote) | **MOCK** | `runtime.mode` is always `"mock"`; there is no hardware quote. The verifier reports it as mock and never as verified. |
| **4 · On-chain anchor** (Base L2) | **PLANNED / ABSENT** | `anchor` is always `null`. The verifier reports "not anchored" and never as verified. No blockchain code exists. |

## Profiles

| Profile | Status |
|---|---|
| `cool.inference.v1` (one model call → one record) | **REAL** |
| `cool.agent.v1` (per-step action chain) | **PLANNED** — documented only, not implemented |
| model-provenance / dataset profiles | **PLANNED** — not documented in detail, not implemented |

## What a v0.1.0 receipt proves / does not prove

- **Proves:** which model id/version claims to have run, on which committed input,
  producing which committed output, at which claimed time — and that the record
  has not been forged or edited by the operator (hybrid signature), and, when an
  inclusion proof is present, that the record is committed in a signed Merkle log.
- **Does NOT prove:** that the output is correct, fair, unbiased, safe, or
  policy-compliant; the real-world identity behind a signing key; the plaintext of
  the input or output (only salted commitments are stored); independent witnessing;
  real hardware attestation; or on-chain timestamping.

## Honest summary for release notes

> TEE attestation is mocked; on-chain anchoring is not yet present; there are no
> external witnesses. The signature and transparency-log layers are real. CooL
> proves execution and integrity — not correctness, fairness, or safety.
