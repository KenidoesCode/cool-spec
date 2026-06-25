# CooL Whitepaper — Cryptographic Observability and On-chain Ledger

> **What this proves:** That a specific computation occurred — which model ran, on which input, producing which output, and when — and that the resulting record could not have been forged or silently altered after the fact, using cryptography a third party can check offline.
> **What this does NOT prove:** That the output is correct, accurate, fair, unbiased, safe, or compliant with any policy. CooL is an evidentiary record of *what was computed*, not a judgement of *whether the result was good*.

*An open standard by NorthWind Cipher (in incorporation). This document describes build **v0.1.0**.*

---

## 1. The trust gap in AI systems

When an AI system produces an output, almost everyone downstream is asked to take the operator's word for three things at once:

1. **Which model** actually produced the output (and not a cheaper, different, or tampered one).
2. **What input** the model was actually given.
3. **What output** the model actually returned, and **when**.

Today there is essentially nothing forcing those claims to be true. An operator runs the model on their own infrastructure, records whatever they like in their own logs, and presents those logs as fact. Conventional logs are **operator-controlled and forgeable**: the same party that benefits from a particular story is the party that writes, stores, and can rewrite the record. A log line can be edited, back-dated, deleted, or invented wholesale, and nothing in the log itself reveals that this happened.

This is the trust gap. It is not a gap in model quality — it is a gap in *evidence*. An operator can, after the fact, claim that **any** model produced **any** output for **any** input, and a reviewer has no independent way to contradict them. As AI systems make consequential decisions — in finance, healthcare, hiring, content moderation, and autonomous agents — "trust us, here are our logs" is not a defensible position when something goes wrong.

## 2. CooL as an evidentiary record: the courtroom framing

CooL does not try to make AI outputs good. It tries to make them **accountable**. The right mental model is a courtroom, not a quality-assurance lab.

A CooL **receipt** answers two narrow questions a reviewer, auditor, or court would actually ask:

- **"What did this system actually compute?"** — which model, which input, which output, at what time.
- **"Could the operator have forged this record?"** — and if the cryptography verifies, the answer is no, not without breaking primitives that are designed to be infeasible to break.

It deliberately does **not** answer "was the answer good, fair, or safe?" — that is a separate question requiring human judgement, domain expertise, and policy. Conflating the two would be dishonest and dangerous. A forged-proof record of a *bad* decision is still a record of a bad decision. CooL's value is that it removes the operator's ability to *lie about what happened*, leaving the substantive question of quality to be argued on honest facts.

Concretely, a receipt commits to the computation without exposing it. Input, output, parameters, and model weights are each committed as **salted SHA-256 hashes** — never as plaintext in the receipt. The core record (schema `cool.inference.v1`) is serialized with RFC 8949 §4.2 Core Deterministic Encoding (canonical CBOR), and the receipt carries a `binding_hash = mh:sha256(canonicalCBOR(core))`. The record is signed over `canonicalCBOR(core) ‖ binding_digest`. Because the receipt embeds a `key_directory` of the relevant public keys, verification is **fully offline** — no network, no call to NorthWind Cipher, and no required trust in CooL or the operator.

## 3. Four independent trust domains

A single proof can be attacked at a single point. CooL's design instead binds *the same fact* — "this computation produced this record" — across **four independent trust domains**, so that breaking any one domain still leaves tampering detectable by the others. This is defense in depth, applied to evidence.

| # | Domain | What it independently establishes | Status in v0.1.0 |
|---|--------|-----------------------------------|------------------|
| 1 | **TEE attestation** (hardware quote) | The computation ran inside a measured, genuine secure enclave | **MOCK** — no hardware quote; `runtime.mode = "mock"` always |
| 2 | **Post-quantum + classical signature** (ML-DSA-65, FIPS 204 + Ed25519 hybrid) | The record was signed by the holder of the keys, unforgeably, with both a classical and a post-quantum guarantee | **REAL** — both signatures must verify |
| 3 | **Witnessed transparency log** (RFC 6962 Merkle tree) | The record was committed to an append-only log and cannot be silently removed or reordered | **REAL log + inclusion proofs + STH**; external witness network **PLANNED** |
| 4 | **On-chain anchor** (Base L2) | The log's state was independently timestamped and made immutable on a public chain | **ABSENT / PLANNED** — `anchor` is always `null` |

### Why independence matters

The domains are chosen so their failure modes do not overlap:

- A signature proves *authorship* but says nothing about whether the record was later hidden. The transparency log covers that.
- A transparency log proves *inclusion and ordering* but is run by, or on behalf of, the operator. An independent **anchor** and **external witnesses** are what would make backdating or a forked log detectable by outsiders.
- An enclave attestation would prove the *execution environment*, which neither signatures nor logs address.

No single domain is asked to do everything. An adversary who compromises one mechanism must still defeat the others to make tampering undetectable — and the others rest on different assumptions, different keys, and (when fully built) different operators.

### The post-quantum choice

Domain 2 uses a **hybrid** scheme: a record is signed with **both** ML-DSA-65 (FIPS 204, lattice-based, post-quantum) **and** Ed25519 (classical). Both signatures MUST verify. This means a verifier is protected if either family is broken — a future quantum attacker who breaks Ed25519 still faces ML-DSA-65, and any undiscovered weakness in the newer post-quantum scheme is backstopped by the long-studied classical one.

## 4. What v0.1.0 actually delivers — stated honestly

It would be easy, and wrong, to imply that all four domains are live. They are not. This release makes a deliberate, narrow claim:

- **Domain 2 (signatures): REAL.** The ML-DSA-65 + Ed25519 hybrid signing and verification are implemented and enforced.
- **Domain 3 (transparency log): REAL.** The RFC 6962 Merkle log (leaf = `SHA256(0x00 ‖ x)`, node = `SHA256(0x01 ‖ L ‖ R)`), inclusion proofs, and signed tree heads (STH) are implemented. **However**, "witnessing" in v0.1.0 is **structural only**: there is a single CooL self-signature over the STH, and it is **never** counted as an independent witness. There are **no external witnesses** in this build. The external witness network is **PLANNED**.
- **Domain 1 (TEE attestation): MOCK.** `runtime.mode` is always `"mock"`, there is no hardware quote, and no attestation verification exists. A conformant verifier MUST report attestation as mock/absent and MUST NEVER mark it verified. The real design is **PLANNED**.
- **Domain 4 (on-chain anchor): ABSENT / PLANNED.** `anchor` is always `null`. No blockchain code exists. A conformant verifier MUST report "not anchored." The "CoolAnchor" design is **PLANNED**.

So the honest one-sentence summary of v0.1.0 is: *CooL today gives you an unforgeable, offline-verifiable, append-only-logged record of which model produced which output for which committed input and when — and it is explicit that hardware attestation, independent witnessing, and on-chain timestamping are not yet built.*

## 5. Scope and limits

CooL speaks **only to receipts that exist**. It cannot compel an operator to issue one, and an operator who simply never produces a receipt is outside CooL's reach. CooL also does **not** establish the real-world identity behind a signing key — it proves a record was signed by a given key, not who controls that key; key-to-identity binding is out of scope. And it commits to inputs and outputs as salted hashes, so it proves *that a specific input/output was bound*, not their plaintext contents.

Within those limits, CooL converts "trust the operator's logs" into "check the cryptography yourself." That is a narrow guarantee — but it is a real one, and in a domain full of overclaiming, the narrowness is the point.

---

*For normative detail see the `specification/` set; for current build status see `../STATUS.md`; for the adversary analysis see `../threat-model/threat-model.md`.*
