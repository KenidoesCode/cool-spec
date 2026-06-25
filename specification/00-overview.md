# CooL Specification — 00 Overview

> **What this proves:** The specification set defines how a CooL receipt records *what was computed* (which model, input, output, and time) and how a verifier checks, offline, that the record was not forged or altered.
> **What this does NOT prove:** Nothing in this specification establishes that an output is correct, fair, unbiased, safe, or policy-compliant. Conformance to CooL is conformance to an *evidentiary* format, not a quality or safety certification.

*An open standard by NorthWind Cipher Pvt Ltd. Specification version **v1**; this build is **v0.1.0**.*

---

## 1. Purpose

The CooL specification defines a self-contained, offline-verifiable receipt that binds a single computation to an unforgeable cryptographic record. It standardizes the receipt format, the signature scheme, the transparency log, and the (planned) attestation and anchoring layers, plus the profiles that describe what kind of computation a record represents.

The receipt schema id is `cool.receipt.v1`; the core inference record is `cool.inference.v1`.

## 2. Document map

| Doc | Title | Status |
|-----|-------|--------|
| `00-overview.md` | This document | Informative |
| `01-record-format.md` | Receipt and core record structure, canonical CBOR, binding hash, commitments | Normative |
| `02-signatures.md` | Hybrid ML-DSA-65 (FIPS 204) + Ed25519 signing and verification | Normative — **IMPLEMENTED** |
| `03-transparency-log.md` | RFC 6962 Merkle log, inclusion proofs, signed tree heads | Normative — **IMPLEMENTED** (external witnessing PLANNED) |
| `04-attestation.md` | TEE attestation (RATS/EAT-style runtime block) | **PLANNED** — not implemented |
| `05-anchor.md` | CoolAnchor on-chain anchoring to Base L2 | **PLANNED** — not implemented |
| `06-profiles.md` | Record profiles: `cool.inference.v1` (real); agent/provenance profiles (PLANNED) | Mixed |

Supporting references:
- Current build status: `../STATUS.md`
- Machine-readable receipt schema: `../receipt-format/receipt.schema.json`
- End-to-end verification procedure: `../verification-flow/verification-flow.md`

## 3. Normative language

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this specification set are to be interpreted as described in RFC 2119 and RFC 8174 when, and only when, they appear in all capitals.

Sections or documents marked **PLANNED** are informative descriptions of intended future design. They impose **no** implementation requirement on v0.1.0 and MUST NOT be read as describing existing behavior.

## 4. The layered model

CooL is structured as four independent trust domains. Each domain binds *the same fact* — that a given computation produced a given record — through a different mechanism, so that breaking one domain still leaves tampering detectable by the others.

| Layer | Domain | What it establishes | v0.1.0 |
|-------|--------|---------------------|--------|
| 1 | TEE attestation | Computation ran in a measured genuine enclave | **MOCK** (`runtime.mode = "mock"`) |
| 2 | Hybrid signature | Record authored unforgeably (PQ + classical) | **REAL** |
| 3 | Transparency log | Record committed append-only, cannot be silently removed/reordered | **REAL** log/inclusion/STH; external witnesses **PLANNED** |
| 4 | On-chain anchor | Log state independently timestamped/immutable | **ABSENT / PLANNED** (`anchor = null`) |

The data layer underneath all four is the **core record** (`cool.inference.v1`), serialized with RFC 8949 §4.2 Core Deterministic Encoding (canonical CBOR). Input, output, parameters, and weights are committed as **salted SHA-256 hashes** and are NEVER placed in plaintext in the receipt. The receipt carries `binding_hash = mh:sha256(canonicalCBOR(core))`, and records are signed over `canonicalCBOR(core) ‖ binding_digest`.

Encoding conventions used throughout:
- Hashes are multihash-tagged: `mh:sha256:<64 hex>`.
- Salts are 16 random bytes encoded as `hex:<32 hex>`.
- Keys and signatures are encoded as `base64:<...>`.
- `record_id` is a ULID.

A receipt is **self-contained**: it embeds a `key_directory` of the public keys needed to verify it, so verification requires no network and no trust in CooL or the operator.

## 5. Conformance posture

A **conformant v1 verifier** operating on a v0.1.0 receipt MUST:

1. **Recompute the binding.** Re-encode the core record with canonical CBOR (RFC 8949 §4.2 CDE) and verify that `binding_hash` equals `mh:sha256(canonicalCBOR(core))`.
2. **Verify both signatures.** Verify the hybrid signature over `canonicalCBOR(core) ‖ binding_digest` using the keys in the embedded `key_directory`. **Both** the ML-DSA-65 and the Ed25519 signature MUST verify; if either fails, verification fails.
3. **Verify log inclusion.** Recompute the RFC 6962 Merkle inclusion proof (leaf = `SHA256(0x00 ‖ x)`, node = `SHA256(0x01 ‖ L ‖ R)`) up to the STH root, and verify the STH's CooL self-signature.
4. **Report attestation honestly.** Observe that `runtime.mode = "mock"` and report attestation as **mock/absent**. The verifier MUST NEVER mark attestation as verified.
5. **Report anchoring honestly.** Observe that `anchor` is `null` and report **not anchored**. The verifier MUST NEVER mark the record as anchored or independently timestamped.

A verifier MUST treat the STH self-signature as **structural only** — a single CooL signature over the tree head — and MUST NOT count it as an independent witness. v0.1.0 contains **no** external witnesses.

A verifier SHOULD surface, in any summary it presents to a user, the narrow scope of what verified: that the record is authentic and log-included, and that attestation and anchoring are not in force. A verifier MUST NOT present a passing result as evidence that the computed output is correct, fair, safe, or compliant.

See `../verification-flow/verification-flow.md` for the concrete step-by-step procedure and `../STATUS.md` for the authoritative list of what is built versus planned.
