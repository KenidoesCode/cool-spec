# Changelog

All notable changes to the **cool-spec** standard are documented here. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] — 2026-06-25

### Changed
- Attribution/NOTICE updated to reflect pre-incorporation status: "© 2026 Pranauv
  Shrinaath S. · NorthWind Cipher (in incorporation)"; `CooL™` trademark pending. No
  changes to the receipt format, schema, or verification flow.

## [0.1.0] — 2026-06-22

First public freeze of the CooL standard.

### Added

- `cool.receipt.v1` receipt envelope and `cool.inference.v1` record core.
- Authoritative JSON Schema (`receipt-format/receipt.schema.json`).
- Specification set: record format, hybrid signatures, RFC 6962 transparency log,
  attestation (PLANNED), anchor (PLANNED), and profiles.
- Threat model, verification-flow algorithm, whitepaper, and `STATUS.md`.
- Golden conformance vectors (`examples/`) with a manifest, consumed by the SDK and
  verifier.

### Honest scope (please read)

> This freeze makes the **signature** and **transparency-log** domains real. TEE
> attestation is **mocked**, on-chain anchoring is **planned/absent**, there are **no
> external witnesses**, and the `cool.agent.v1` profile is **planned only**. CooL
> proves execution and integrity — **not** correctness, fairness, or safety. See
> [`STATUS.md`](STATUS.md).

[0.1.0]: https://github.com/northwind-cipher/cool-spec/releases/tag/v0.1.0
