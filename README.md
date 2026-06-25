# cool-spec — The CooL Standard

**CooL (Cryptographic Observability and On-chain Ledger)** is an independent,
post-quantum, tamper-evident **evidentiary record of exactly what an AI system
computed**: which model ran, on which input, producing which output, and when —
sealed so the operator could not have forged the record.

> **What CooL proves:** *what* was computed and that the record is **unforged**.
> **What CooL does NOT prove:** that the output is correct, fair, unbiased, safe, or
> policy-compliant. CooL is about execution and integrity — never about the quality
> of an answer.

This repository is the **standard** — documents and example artefacts only, no
runnable CooL logic. It defines the receipt format, the threat model, and the
offline verification flow precisely enough that an independent engineer can build
an interoperable verifier from this repo alone.

## Implementation status (read this first)

The honest, canonical status of every trust domain and profile lives in
[STATUS.md](STATUS.md). In short, for `v0.1.0`:

- **REAL:** hybrid post-quantum signature (ML-DSA-65 + Ed25519); RFC 6962
  transparency log with inclusion proofs and signed tree heads.
- **STRUCTURAL ONLY:** witness co-signatures (a single CooL self-signature, never
  counted as independent — there are no external witnesses).
- **MOCK:** TEE attestation (`runtime.mode = "mock"`, no hardware quote).
- **PLANNED / ABSENT:** on-chain anchor (`anchor: null`); the `cool.agent.v1`
  profile.

## Repository map

| Path | Contents |
|---|---|
| [whitepaper/cool-whitepaper.md](whitepaper/cool-whitepaper.md) | The trust gap, the four domains, the evidentiary (not correctness) claim |
| [specification/00-overview.md](specification/00-overview.md) | Specification overview and document map |
| [specification/01-record-format.md](specification/01-record-format.md) | The inference record core, canonical CBOR, multihash, salted commitments |
| [specification/02-signatures.md](specification/02-signatures.md) | The hybrid signature scheme, key directory, crypto-agility |
| [specification/03-transparency-log.md](specification/03-transparency-log.md) | RFC 6962 hashing, inclusion, consistency, STH, witnesses |
| [specification/04-attestation.md](specification/04-attestation.md) | TEE attestation — **PLANNED** |
| [specification/05-anchor.md](specification/05-anchor.md) | On-chain anchor — **PLANNED** |
| [specification/06-profiles.md](specification/06-profiles.md) | The inference profile (real) and agent/dataset profiles (planned) |
| [threat-model/threat-model.md](threat-model/threat-model.md) | Adversary → defending domain; non-guarantees; residual risks |
| [receipt-format/receipt.schema.json](receipt-format/receipt.schema.json) | **Authoritative** JSON Schema for `cool.receipt.v1` |
| [receipt-format/receipt-format.md](receipt-format/receipt-format.md) | The receipt envelope, field by field |
| [verification-flow/verification-flow.md](verification-flow/verification-flow.md) | The ordered offline verification algorithm and verdict semantics |
| [examples/](examples/) | Golden conformance vectors: valid, valid-with-inclusion, and one tampered file per attack |

## Conformance vectors

[examples/](examples/) holds the shared golden vectors consumed by both code
repos (`cool-sdk`, `cool-verifier`). [examples/index.json](examples/index.json) is
the manifest: each valid vector must verify (`ok: true`) and each `tampered/` vector
must fail with the named failing domain. A vector that disagrees between the SDK and
the verifier is release-blocking.

## Reference implementation

- [`cool-sdk`](../cool-sdk) — produce signed receipts and verify them (`verifyReceipt`).
- [`cool-verifier`](../cool-verifier) — `cool verify <receipt>`, the honest CLI.

## Licence

[Apache-2.0](LICENSE). © NorthWind Cipher Pvt Ltd.
