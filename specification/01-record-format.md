# 01 — Record Format

> **What this proves:** that the hashed *core* of an inference record is a
> deterministic, canonical commitment to exactly which model claims to have run, on
> which committed input, with which parameters, producing which committed output, at
> which claimed time.
> **What this does NOT prove:** that the model truly produced that output, that the
> output is correct/fair/safe, or the plaintext of the input/output — the core
> stores salted hashes (commitments), never plaintext.

Normative keywords (MUST/SHOULD/MAY) follow RFC 2119.

## 1.1 The inference core (`cool.inference.v1`)

The **core** is the object that is canonicalized and hashed to produce the
`binding_hash`. The detached signature is **not** part of the core.

```jsonc
{
  "schema": "cool.inference.v1",
  "record_id": "01J6XR7K8M2Q3N5P7R9TVWXYZ0",          // ULID
  "time":    { "issued_at": "2026-06-22T10:14:07.221Z", "seq": 1048576 },
  "model":   { "id": "acme/credit-scorer", "version": "2026.06.0",
               "weights_hash": "mh:sha256:…", "provider": "mock-local" },
  "request": { "input_hash": "mh:sha256:…", "input_salt": "hex:…",
               "params_hash": "mh:sha256:…" },
  "response":{ "output_hash": "mh:sha256:…", "output_salt": "hex:…" },
  "runtime": { "tee_vendor": "none", "mode": "mock",
               "enclave_measurement": null, "tee_quote": null }
}
```

### Fields

| Field | Type | Meaning |
|---|---|---|
| `schema` | const `"cool.inference.v1"` | Core schema identifier. |
| `record_id` | ULID | Unique record id (Crockford base32, 26 chars). |
| `time.issued_at` | RFC 3339 string | Claimed issue time. Informational; not independently trusted in v0.1.0. |
| `time.seq` | integer ≥ 0 | Monotone sequence number assigned by the issuer. |
| `model.id` | string | Model identifier (e.g. `acme/credit-scorer`). |
| `model.version` | string | Model version. |
| `model.weights_hash` | multihash | Commitment to the model weights (see §1.4). MAY be a labelled mock when the backend supplies none. |
| `model.provider` | string | Backend label (e.g. `mock-local`). Informational. |
| `request.input_hash` | multihash | Salted commitment to the input (§1.4). |
| `request.input_salt` | `hex:` field | 16-byte salt for `input_hash`. |
| `request.params_hash` | multihash | Hash of the canonical CBOR of the inference parameters (unsalted). |
| `response.output_hash` | multihash | Salted commitment to the output (§1.4). |
| `response.output_salt` | `hex:` field | 16-byte salt for `output_hash`. |
| `runtime.tee_vendor` | const `"none"` | No TEE vendor in this build. |
| `runtime.mode` | const `"mock"` | Always `mock` — there is no hardware attestation. |
| `runtime.enclave_measurement` | null | No measurement in this build. |
| `runtime.tee_quote` | null | No quote in this build. |

A verifier MUST reject a core containing any field not listed above
(`additionalProperties: false`), and MUST treat `runtime.mode` other than `"mock"`
as non-conformant for `v0.1.0`.

## 1.2 Multihash

All digests are written as multihash-tagged strings so the algorithm is explicit
(crypto-agility):

```
mh:sha256:<64 lowercase hex chars>
```

`sha384` is reserved for future use and MUST NOT appear in `v0.1.0` receipts.

## 1.3 Salts and prefixed encodings

- Salts are **16 random bytes**, encoded as `hex:<32 hex chars>`, stored as explicit
  fields. They raise the cost of guessing low-entropy inputs and enable later
  selective disclosure. They are part of the hashed core.
- Public keys and signatures are `base64:<standard base64>`.

## 1.4 Salted commitments

For a value `v` with salt `s` (the raw 16 salt bytes):

```
commitment(v) = mh:sha256( s ‖ utf8(v) )
```

This is used for `input_hash` (salt = `input_salt`) and `output_hash`
(salt = `output_salt`). `params_hash` is the unsalted `mh:sha256(canonicalCBOR(params))`.
`weights_hash`, when supplied by a backend, follows the same multihash convention; a
labelled mock weights commitment is used when no real one is available.

The receipt stores **only** commitments — never the plaintext input or output (N6).

## 1.5 Canonical CBOR (binding)

The `binding_hash` is computed over the **canonical CBOR** encoding of the core:

```
binding_hash = "mh:sha256:" + hex( SHA256( canonicalCBOR(core) ) )
```

Canonical CBOR is **RFC 8949 §4.2 Core Deterministic Encoding (CDE)**:

- Map keys are sorted by their encoded byte order.
- Integers and lengths use the shortest possible form.
- No indefinite-length items.
- No original-encoding hints are honoured; the same logical value always encodes to
  the same bytes.

Because keys are sorted deterministically, **the order of fields in a JSON
projection is irrelevant** — reordering keys cannot change the `binding_hash`. Any
change to a *value*, or the addition/removal of a field, changes the bytes and thus
the `binding_hash`. This makes the binding a self-check against naive edits; the
signature (§02) is the unforgeable seal that catches sophisticated edits.

## 1.6 Determinism requirements (R4)

Implementations MUST NOT introduce randomness or timestamps into the hashed bytes
beyond the declared fields (salts, `issued_at`, `seq`). Given identical inputs,
salts, ids and times, two implementations MUST produce identical canonical CBOR
bytes and identical `binding_hash`.
