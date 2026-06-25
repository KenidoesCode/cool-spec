# Contributing to CooL

Thanks for your interest in CooL (Cryptographic Observability and On-chain Ledger).

## The honesty principle (read first)

CooL's value is that it is **honest by construction**. Contributions must uphold:

- **Narrow claim only.** CooL proves *what was computed and that the record is
  unforged*. Never claim or imply it proves correctness, fairness, safety, or
  policy-compliance — in code, comments, schema, docs, or CLI text.
- **Never fake a green check.** A mocked or absent trust domain (TEE attestation,
  on-chain anchor, external witnesses) must never be presented as verified.
- **No bespoke cryptography.** Use only the standard primitives: ML-DSA-65 (FIPS
  204), Ed25519, SHA-256, and RFC 6962 Merkle.
- **One canonical core.** The SDK and verifier share a single verification
  implementation. Do not fork it.

See [`STATUS.md`](STATUS.md) for the canonical implemented-vs-planned status; keep it
in sync with any change to what is real.

## Workflow

1. Open an issue describing the change before large work.
2. Keep PRs focused. Add or update tests and conformance vectors.
3. For the code repos: `npm ci && npm run typecheck && npm test` must pass on Node 22,
   and `npm run vectors` must produce no diff. The SDK and verifier must agree on every
   conformance vector — a disagreement is release-blocking.
4. New normative behaviour must be reflected in `cool-spec` (the standard) first.

## Code style

- TypeScript, ESM, `strict: true`, no `any` in public APIs.
- Every public function documents **what it proves and what it does not prove**.

## Licence of contributions

By contributing you agree your contributions are licensed under [Apache-2.0](LICENSE).
