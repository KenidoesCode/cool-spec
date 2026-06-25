# 02 — Signatures

> **What this proves:** that the exact bytes of the record core (and its binding
> commitment) were sealed by a holder of BOTH secret keys named by `key_id`, under
> two independent signature schemes — one post-quantum, one classical. Any later
> edit to the core breaks the signature.
> **What this does NOT prove:** the real-world identity behind a key (there is no
> PKI here — `key_id` is an operator-chosen label), nor anything about the quality of
> the signed content.

## 2.1 Hybrid scheme

CooL v1 signs with a **hybrid** of:

- **ML-DSA-65** (FIPS 204) — post-quantum, lattice-based.
- **Ed25519** — classical, widely deployed.

The signature block:

```jsonc
"signature": {
  "alg": "ml-dsa-65+ed25519",
  "key_id": "cool-sign-2026Q2-01",
  "ml_dsa":  "base64:…",
  "ed25519": "base64:…"
}
```

**Both** signatures MUST verify. If either fails, the `signature` domain FAILS. This
gives post-quantum assurance for the future while retaining the maturity of Ed25519
today: an adversary must break *both* schemes to forge a record.

## 2.2 The signed message

The signature covers the canonical core bytes concatenated with the 32-byte binding
digest:

```
message = canonicalCBOR(core)  ‖  SHA256(canonicalCBOR(core))
        = canonicalCBOR(core)  ‖  multihashDigest(binding_hash)
```

Signing the binding digest in addition to the core bytes binds the signature to the
commitment as well as the raw bytes. A verifier reconstructs this message from the
record it holds (recomputing `canonicalCBOR(core)` and taking the 32-byte digest of
the receipt's `binding_hash`) and verifies both signatures.

## 2.3 Key directory

A receipt is self-contained: it embeds the public keys needed to verify it.

```jsonc
"key_directory": {
  "cool-sign-2026Q2-01": { "ml_dsa_pub": "base64:…", "ed25519_pub": "base64:…" },
  "cool-log-demo-01":    { "ml_dsa_pub": "base64:…", "ed25519_pub": "base64:…" }
}
```

- The record signature's `key_id` MUST resolve to an entry in `key_directory`; if it
  does not, the `signature` domain FAILS.
- The STH signature (§03) and any witnesses resolve their keys from the same
  directory.

> **Trust note.** Embedding the public key means a receipt verifies offline, but it
> does **not** by itself tell you *who* controls that key. Binding a `key_id` to a
> real-world identity is an out-of-band concern (key transparency, organizational
> attestation) and is out of scope for `v0.1.0`. See the threat model.

## 2.4 Crypto-agility (R3)

Every hash and signature carries its algorithm explicitly: multihash prefixes
(`mh:sha256:`) for digests and the `alg` field (`ml-dsa-65+ed25519`) for signatures.
A future revision can introduce, e.g., `mh:sha384:` or a new `alg` without ambiguity.
Verifiers MUST check that `alg` is exactly `ml-dsa-65+ed25519` for `v0.1.0` receipts.

## 2.5 What may NOT be done

- No bespoke or "optimised" cryptography (N2). Only the named standard primitives.
- A single signature (only ML-DSA or only Ed25519) MUST NOT be accepted as valid.
- The example keys shipped with this project are throwaway demo material and MUST NOT
  be reused to protect anything real.
