# 03 — Transparency Log

> **What this proves:** that a record is committed at a specific position in an
> append-only Merkle log whose root is signed (a Signed Tree Head), so the operator
> cannot silently remove or reorder logged records without changing the root.
> **What this does NOT prove (in v0.1.0):** that the log was witnessed by any
> independent party or anchored to a public chain. The only co-signature present is a
> CooL self-signature, which is shown but NEVER counted as independent.

## 3.1 RFC 6962 hashing

CooL uses the RFC 6962 Merkle Tree Hash exactly:

```
empty tree:  MTH({})       = SHA256("")
leaf:        MTH({d0})     = SHA256(0x00 ‖ d0)
node:        MTH(D[0:n])   = SHA256(0x01 ‖ MTH(D[0:k]) ‖ MTH(D[k:n]))
             where k is the largest power of two strictly less than n
```

The `0x00` leaf prefix and `0x01` node prefix provide second-preimage resistance
between leaves and interior nodes.

## 3.2 Leaf contents

The leaf input for a record is the **32-byte digest referenced by its
`binding_hash`** (i.e. `multihashDigest(binding_hash)`). Because a verifier recomputes
`binding_hash` from the record's core, log inclusion is bound to the exact bytes the
signature seals — not to some unrelated value chosen by the operator.

## 3.3 Inclusion proofs

An inclusion proof (RFC 6962 audit path) is the list of sibling node hashes, bottom
to top, that lets a verifier recompute the tree root from a leaf:

```jsonc
"inclusion": {
  "leaf_index": 0,
  "tree_size": 3,
  "audit_path": ["mh:sha256:…", "mh:sha256:…"]
}
```

A verifier reconstructs the root from `leafHash(leafData)`, `leaf_index`,
`tree_size`, and `audit_path`, then compares it to the STH `root_hash`. `leaf_index`
MUST be `< tree_size`, and `inclusion.tree_size` MUST equal `sth.tree_size`.

## 3.4 Signed Tree Head (STH)

```jsonc
"sth": {
  "log_id": "demo",
  "tree_size": 3,
  "root_hash": "mh:sha256:…",
  "timestamp": "2026-06-22T10:14:07.300Z",
  "signature": { "alg": "ml-dsa-65+ed25519", "key_id": "cool-log-demo-01", "ml_dsa": "…", "ed25519": "…" },
  "witnesses": [
    { "id": "cool-self", "external": false, "alg": "ml-dsa-65+ed25519", "ml_dsa": "…", "ed25519": "…" }
  ]
}
```

The STH **signature** and each **witness** co-signature are computed over the
canonical CBOR of the STH *core* — exactly the fields `{ log_id, tree_size,
root_hash, timestamp }`:

```
sthMessage = canonicalCBOR({ log_id, tree_size, root_hash, timestamp })
```

The STH signature's `key_id` MUST resolve in the receipt's `key_directory`. If the
inclusion proof reconstructs the root AND the STH signature verifies, the `inclusion`
domain passes.

## 3.5 Witnesses (structural only in v0.1.0)

The `witnesses` array MAY carry co-signatures over the same STH core. A verifier:

- Counts only witnesses with `external: true` whose co-signature verifies, toward a
  configured independence threshold (default 0).
- Shows but **never counts** a CooL self-signature (`external: false`, e.g.
  `id: "cool-self"`). A self-signature is not independent evidence — the entity that
  signed the record also signed the witness statement.

In `v0.1.0` there are **no external witnesses**, so the witnesses domain is reported
as absent ("0 independent"). A future deployment would gossip the STH to a network of
independent witnesses; that network is **PLANNED**, not built.

## 3.6 Consistency proofs

The reference implementation also provides RFC 6962 **consistency proofs** (that a
larger tree is an append-only extension of a smaller one). Consistency is not carried
inside a single `cool.receipt.v1` envelope in `v0.1.0`, but the primitive exists for
auditors comparing two STHs and for future anchoring/witnessing.
