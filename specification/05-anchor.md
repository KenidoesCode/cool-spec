# CooL Specification — 05 Anchor (CoolAnchor)

# ⚠️ PLANNED — NOT IMPLEMENTED IN v0.1.0 ⚠️

**This entire document describes an *intended* future design. No blockchain code exists in build v0.1.0.** In v0.1.0, the `anchor` field is **always** `null`. A verifier MUST report the record as **not anchored** and MUST NEVER mark anchoring as verified.

> **What this proves:** Nothing yet. When fully built, on-chain anchoring would provide independent timestamping and immutability for the transparency log's state by publishing it to a public chain not controlled by the operator. In v0.1.0 it provides nothing — there is no anchor.
> **What this does NOT prove:** Even when built, anchoring would not prove that any output is correct, fair, unbiased, safe, or policy-compliant. It would only provide an independent, hard-to-rewrite timestamp for the log's *state*.

*An open standard by NorthWind Cipher Pvt Ltd.*

---

## 1. Status

This is trust domain 4 of four. It is **ABSENT / PLANNED** in build v0.1.0:

- `anchor` is always `null`.
- There is **no** blockchain integration, no wallet, no transaction submission, and no on-chain verification code.

Everything below documents the design CooL intends to implement. It is **PLANNED**.

## 2. Intended purpose

The transparency log (domain 3) is, in v0.1.0, signed only by CooL itself — its signed tree heads (STH) carry a single structural self-signature and **no** external witnesses. That leaves two outsider-detectable gaps unaddressed: an operator could in principle present a **forked** view of the log, or could **backdate** the log's history, and a verifier with only the receipt could not independently contradict the claimed time.

The intended "**CoolAnchor**" mechanism would close part of that gap by **periodically publishing STH roots to a public blockchain** — specifically **Base L2**. Once an STH root is recorded in a public chain block, the block's consensus timestamp provides an *independent* "this state existed no later than time T" witness, and the chain's immutability makes silently rewriting that history infeasible for the operator alone.

## 3. Intended `anchor` envelope

The intended shape of the `anchor` envelope (always `null` in v0.1.0):

| Field | Type | Intended meaning |
|-------|------|------------------|
| `chain_id` | string/int | Identifier of the target chain (e.g. Base L2). |
| `tx_ref` | string | Reference to the on-chain transaction that recorded the root. |
| `anchored_root` | `mh:sha256:<...>` | The STH Merkle root that was published on chain. |
| `sth` | object | The signed tree head whose root was anchored, so a verifier can confirm the anchored root corresponds to the STH covering the record. |

The design intent is that `anchored_root` MUST equal the root of the STH under which the record's inclusion proof was verified, so the anchor demonstrably covers *this* record's log state.

## 4. Intended verification

A future real implementation would, at minimum:

1. Resolve `tx_ref` on the named chain and read back the published root.
2. Confirm the published root equals `anchored_root` and matches the STH root used for inclusion verification.
3. Read the block's consensus timestamp as an independent upper bound on when the log state existed.

Anchoring is periodic, so a record's *individual* timestamp would be bounded by the anchoring interval, not pinned to the second — this is a coarse, independent time witness, not a precise clock.

## 5. Verifier requirements in v0.1.0

For the avoidance of any doubt:

- A conformant v0.1.0 verifier MUST observe that `anchor` is `null`.
- It MUST report the record as **not anchored**.
- It MUST NEVER mark anchoring as verified, satisfied, or passing.
- It MUST NOT claim any independent timestamp or on-chain immutability for the record.

**None of the verification in Section 4 exists yet.** Sections 2–4 are PLANNED design only.
