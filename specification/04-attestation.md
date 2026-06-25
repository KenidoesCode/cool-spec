# CooL Specification — 04 Attestation

# ⚠️ PLANNED — NOT IMPLEMENTED IN v0.1.0 ⚠️

**This entire document describes an *intended* future design. None of the verification described here exists in build v0.1.0.** In v0.1.0, `runtime.mode` is **always** `"mock"`, there is **no** hardware quote, and **no** attestation verification of any kind is performed. A verifier MUST report attestation as mock/absent and MUST NEVER mark it verified.

> **What this proves:** Nothing yet. When fully built, TEE attestation would prove that the computation ran inside a measured, genuine secure enclave whose code identity matches an expected measurement. In v0.1.0 it proves nothing — it is mock.
> **What this does NOT prove:** Even when built, attestation would not prove that the output is correct, fair, unbiased, safe, or policy-compliant. It would only attest to the *execution environment*, not the *quality* of the result.

*An open standard by NorthWind Cipher (in incorporation).*

---

## 1. Status

This is trust domain 1 of four. It is **MOCK** in build v0.1.0:

- `runtime.mode` is always `"mock"`.
- No TEE quote is collected, embedded, or checked.
- No vendor root certificates, measurement allowlists, or quote-verification logic exist in the codebase.

Everything below documents the design CooL intends to implement. It is **PLANNED**.

## 2. Intended purpose

A Trusted Execution Environment (TEE) — such as an Intel TDX, AMD SEV-SNP, or AWS Nitro enclave — can produce a signed **quote** (attestation evidence) describing the environment in which code ran, including a **measurement** of the loaded code and a signature chaining to the hardware vendor's roots of trust. The intended goal is to let a verifier confirm that a CooL computation ran inside a genuine, measured enclave rather than on arbitrary operator-controlled infrastructure.

## 3. Intended `runtime` block

The intended shape of the `runtime` block in the core record:

| Field | Type | Intended meaning |
|-------|------|------------------|
| `tee_vendor` | string | Identifier of the TEE technology / vendor (e.g. an enum for TDX, SEV-SNP, Nitro). |
| `mode` | string | `"mock"` (v0.1.0, always) or, when built, an indicator of real attestation. |
| `enclave_measurement` | `mh:sha256:<...>` | Expected/measured code identity of the enclave. |
| `tee_quote` | `base64:<...>` | The raw signed attestation evidence from the hardware. **Absent / null in v0.1.0.** |

In v0.1.0, `mode` is `"mock"` and `tee_quote` is not present. A conformant verifier MUST detect this and report attestation as mock/absent.

## 4. Intended verification (RATS/EAT-style normalization)

The planned design follows the IETF RATS architecture and EAT (Entity Attestation Token) style: raw vendor-specific **evidence** would be normalized into a set of structured **claims**.

```
TEE quote (vendor-specific evidence)
        │  normalize
        ▼
EAT-style claims  { measurement, vendor, freshness/nonce, … }
        │  appraise
        ▼
Verdict: { genuine-hardware?, measurement-in-allowlist?, fresh? }
```

A future real implementation would, at minimum:

1. **Verify the quote signature chain** up to the hardware vendor's published root(s) of trust, confirming the quote was produced by genuine attestation hardware.
2. **Check the enclave measurement against an allowlist** of approved code identities, so that only the intended CooL workload is accepted.
3. **Check freshness** (e.g. a nonce or timestamp binding) to prevent replay of an old quote.
4. Bind the attested measurement to the CooL core record so that the attestation covers the *same* computation the signature and log cover.

## 5. Verifier requirements in v0.1.0

To be crystal clear, for the avoidance of any doubt:

- A conformant v0.1.0 verifier MUST observe `runtime.mode == "mock"`.
- It MUST report attestation status as **mock / absent**.
- It MUST NEVER mark attestation as verified, satisfied, or passing.
- It MUST NOT treat the presence of a `runtime` block as evidence that any enclave actually ran the computation.

**None of the verification in Section 4 exists yet.** Sections 2–4 are PLANNED design only.
