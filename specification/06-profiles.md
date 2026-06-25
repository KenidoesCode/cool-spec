# CooL Specification — 06 Profiles

> **What this proves:** A profile defines what *kind* of computation a CooL record describes. A conformant record proves what was computed (which model, input, output, time) under that profile and that the record is unforged.
> **What this does NOT prove:** No profile makes CooL prove that an output is correct, fair, unbiased, safe, or policy-compliant. Profiles shape the *evidence*, not a judgement of its quality.

*An open standard by NorthWind Cipher Pvt Ltd. This build is **v0.1.0**.*

---

## 1. What a profile is

A profile specifies the structure and semantics of a CooL core record for a particular use case — what fields it carries, what is committed, and how records relate to one another. Each profile has a stable schema id. A receipt always wraps a profile-specific core record.

| Profile id | Use case | Status |
|------------|----------|--------|
| `cool.inference.v1` | One model call → one record | **REAL / IMPLEMENTED** |
| `cool.agent.v1` | One agent action step → one linked record | **PLANNED — not implemented** |
| model-provenance / dataset profiles | Provenance of models and training/eval datasets | **PLANNED — not implemented** |

## 2. The `inference` profile (`cool.inference.v1`) — REAL / IMPLEMENTED

This is the implemented profile in v0.1.0. Its purpose is narrow and concrete: **one model call produces one record.**

A record captures a single inference event:

- **Which model** ran (committed via a salted hash; weights committed as a salted SHA-256 hash, never plaintext).
- **Which input** was provided (committed as a salted SHA-256 hash, never plaintext).
- **Which output** was produced (committed as a salted SHA-256 hash, never plaintext).
- **Which parameters** were used (committed as a salted SHA-256 hash).
- **When** it occurred, with a `record_id` that is a ULID.

The core record is serialized with canonical CBOR (RFC 8949 §4.2 CDE), the receipt carries `binding_hash = mh:sha256(canonicalCBOR(core))`, and the record is signed with the hybrid ML-DSA-65 + Ed25519 scheme over `canonicalCBOR(core) ‖ binding_digest`. See `01-record-format.md` and `02-signatures.md`.

What `cool.inference.v1` lets a verifier conclude: that a specific model produced a specific output for a specific (committed) input at a recorded time, and that this record was not forged or altered. It does **not** let anyone conclude the output was good.

## 3. The `agent` profile (`cool.agent.v1`) — PLANNED, NOT BUILT

**This profile is not implemented in v0.1.0. The following describes intended design only.**

Where `cool.inference.v1` covers a single model call, the planned `cool.agent.v1` profile would cover **a single step in an agent's action sequence** — one record per action — so that a multi-step agent run becomes a **verifiable action chain**.

Intended chaining fields:

| Field | Type | Intended meaning |
|-------|------|------------------|
| `trace_id` | identifier | Groups all step records belonging to one agent run. |
| `prev_record_id` | ULID / null | The `record_id` of the preceding step in the same trace; `null` for the first step. |

Each step record would commit its own action input/output as salted hashes and be individually signed and logged like an inference record. By linking `prev_record_id` to the prior step within a shared `trace_id`, the steps would form an ordered, tamper-evident chain: altering or omitting a step would break the chain or fail an inclusion check.

To be plain: **none of this is built.** There are no agent records, no trace chaining, and no agent verification in v0.1.0. "Agent receipts" are PLANNED.

## 4. Model-provenance / dataset profiles — PLANNED, NOT BUILT

Also **PLANNED and not implemented**: profiles intended to record the provenance of a model (e.g. how it was produced, what it derives from) and of datasets (e.g. training or evaluation corpora), again as salted commitments rather than plaintext. The intent would be to let an inference record reference a provenance record so a chain of custody from data to model to output could be assembled. **This design does not exist in v0.1.0.**

## 5. Verifier note

A verifier MUST identify the profile from its schema id and apply the corresponding rules. In v0.1.0, only `cool.inference.v1` is defined and implemented; encountering any other profile id means the record was produced against an unimplemented (PLANNED) profile and MUST NOT be treated as conformant to this build.
