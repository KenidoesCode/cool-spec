# CooL Threat Model

> **What this proves:** This document analyzes which CooL trust domain stops which adversary, given a receipt that exists. It is about defending the integrity of the *record of what was computed* — which model, input, output, and time — against forgery and silent alteration.
> **What this does NOT prove:** This document does not claim CooL proves any output is correct, fair, unbiased, safe, or policy-compliant. CooL stops record-tampering adversaries; it does not adjudicate the quality of the underlying decision.

*An open standard by NorthWind Cipher (in incorporation). This build is **v0.1.0**.*

---

## 1. Adversary model

The primary adversary is a **dishonest operator** — the party that runs the model and produces receipts — who wishes to misrepresent what was computed. Secondary adversaries include outside parties attempting to forge or alter records. We assume strong cryptographic primitives (SHA-256, Ed25519, ML-DSA-65) hold, and we assess each adversary against the four trust domains. We are explicit where v0.1.0 does **not** defend.

## 2. Adversaries and the domains that stop them

### (a) Operator edits the input/output/model after the fact

**Attack:** After producing a receipt, the operator changes the recorded input, output, or model to tell a different story.

**Stopped by:** Domains 2 + 3 (binding + signature). The core record is committed via `binding_hash = mh:sha256(canonicalCBOR(core))`, and the record is signed with the hybrid ML-DSA-65 + Ed25519 scheme over `canonicalCBOR(core) ‖ binding_digest`. Any edit changes the canonical CBOR, hence the binding hash, hence invalidates **both** signatures. A verifier recomputing the binding and checking both signatures detects the tampering. **REAL in v0.1.0.**

### (b) Operator fabricates a whole record

**Attack:** The operator invents an entirely new receipt for a computation that never happened, or with values they prefer.

**Stopped by:** Domain 2 (signature). A valid receipt requires valid ML-DSA-65 **and** Ed25519 signatures over the bound core. Without the corresponding private signing keys, the operator cannot produce signatures that verify against the public keys in the embedded `key_directory`. **REAL in v0.1.0.**

*Caveat (out of scope):* this stops fabrication by a party that lacks the keys. It does **not** establish *whose* keys these are in the real world — key-to-identity binding is out of scope. See Residual risks.

### (c) Selective deletion / omission from the log

**Attack:** The operator quietly drops or hides a record it would rather not show.

**Partially stopped by:** Domain 3 (transparency log). Records are committed to an RFC 6962 append-only Merkle log (leaf = `SHA256(0x00 ‖ x)`, node = `SHA256(0x01 ‖ L ‖ R)`), and inclusion proofs against a signed tree head (STH) are **REAL** in v0.1.0 — a verifier can confirm a given record is included. **However**, detecting that the log itself was *forked, truncated, or rolled back* requires **consistency proofs** and **external witnesses**, both of which are **PLANNED**, not built. In v0.1.0 the STH carries only a single CooL self-signature (structural, never counted as independent) and there are **no** external witnesses. So v0.1.0 detects "this record's claimed inclusion is false," but a determined operator presenting a self-consistent alternate log view is **not** fully defended against until witnessing/consistency ships.

### (d) Backdating

**Attack:** The operator claims a record was created earlier than it actually was.

**Honest assessment:** This is **NOT mitigated by v0.1.0 alone.** Defending against backdating requires an *independent* time witness — the **PLANNED** on-chain anchor (CoolAnchor, domain 4, `anchor` always `null` today) and/or **PLANNED** external witnesses (domain 3). The timestamps in a v0.1.0 receipt and STH are asserted by CooL/operator-side signing, not independently corroborated. A verifier MUST NOT treat a v0.1.0 record's time as independently established.

### Summary

| Adversary | Domain(s) | v0.1.0 status |
|-----------|-----------|---------------|
| (a) Post-hoc edit | 2 + 3 (binding + signature) | **Stopped — REAL** |
| (b) Whole-record fabrication | 2 (signature) | **Stopped — REAL** (key identity out of scope) |
| (c) Deletion / omission | 3 (inclusion now; consistency + witnesses PLANNED) | **Partially stopped** |
| (d) Backdating | 4 anchor + 3 witnesses, both **PLANNED** | **NOT mitigated by v0.1.0 alone** |

## 3. Non-guarantees

CooL does **NOT** prove, and MUST NEVER be presented as proving, any of the following:

- It does **not** prove the output is **correct** or accurate.
- It does **not** prove the output is **fair**.
- It does **not** prove the **absence of bias**.
- It does **not** prove the output is **safe**.
- It does **not** prove the output is **policy-compliant**.
- It does **not** establish the **real-world identity** behind a signing key (it proves a record was signed by a key, not who controls that key).
- It does **not** prove the **plaintext** of the input or output — only their salted commitments (hashes).

Additionally, **in v0.1.0 specifically**, CooL does **NOT** provide:

- **Independent witnessing** — the STH self-signature is structural only and is never counted as an external witness; there are no external witnesses (PLANNED).
- **Real hardware attestation** — `runtime.mode` is always `"mock"`; there is no TEE quote (PLANNED).
- **On-chain timestamping** — `anchor` is always `null`; no chain is written (PLANNED).

## 4. Residual risks (honest)

Even within its narrow claims, CooL carries real residual risks:

- **Compromise of signing keys.** If an adversary obtains the private ML-DSA-65 and Ed25519 keys, they can produce records that verify. CooL's integrity reduces to the secrecy of these keys; their management and revocation are outside what a single receipt can attest.
- **An operator that never issues a receipt.** CooL speaks **only to receipts that exist.** An operator who simply declines to produce a record for a computation defeats observability entirely — there is nothing for CooL to verify, and CooL cannot compel issuance.
- **Low-entropy inputs.** Inputs are committed as salted SHA-256 hashes (16-byte random salt, `hex:<32 hex>`). Salting raises the cost of confirming a guessed input, but for very low-entropy or small input spaces a determined party may still be able to test candidates against the commitment. Salting **mitigates but does not eliminate** this.
- **Pre-audit cryptography-implementation risk.** The cryptographic implementation in v0.1.0 has not completed independent security audit. Correctly chosen primitives can still be undermined by implementation defects; treat the build accordingly until audited.

---

*See `../specification/00-overview.md` for the layered model, `../STATUS.md` for the authoritative built-vs-planned status, and `../verification-flow/verification-flow.md` for the verification procedure.*
