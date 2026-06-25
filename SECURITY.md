# Security Policy

## Status: pre-audit

CooL (`v0.1.0`) is **pre-audit** software. The cryptographic constructions use only
standard primitives — ML-DSA-65 (FIPS 204), Ed25519, SHA-256, and RFC 6962 Merkle —
but the implementation has **not** undergone an independent security audit. Do not
rely on it to protect anything of real value until it has been audited.

## What CooL does and does not claim

CooL proves *what was computed and that the record is unforged*. It does **not** prove
that an output is correct, fair, unbiased, safe, or policy-compliant, and it does not
establish the real-world identity behind a signing key. See
[`STATUS.md`](STATUS.md) for the honest per-domain status. In `v0.1.0`, TEE
attestation is mocked and on-chain anchoring is absent.

## Keys and secrets

- No secrets are committed to these repositories.
- Any example keys are **throwaway demo material** generated for tests and vectors.
  They are not secret and MUST NOT be reused to protect anything real.

## Reporting a vulnerability

Please report suspected vulnerabilities privately to **security@northwindcipher.dev**.

- Do **not** open a public issue for security reports.
- Include a description, reproduction steps, and impact assessment.
- We aim to acknowledge within 5 business days and to coordinate a fix and disclosure
  timeline with you.

Thank you for helping keep CooL honest and safe.
