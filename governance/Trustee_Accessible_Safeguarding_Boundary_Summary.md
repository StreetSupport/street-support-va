> Source copy, converted 2 October 2026 from `Trustee Accessible Safeguarding Boundary Summary.docx` (sha256 58b01d19a8b2ff6468572f95d95de92e028c732e8d7ba422a64d11e329944e73), supplied by the Managing Director. This Markdown file is the source under the repository's direction rule; the Word file was the only previous copy and is now a derived record. Content unchanged.

# Virtual Assistant Safeguarding Trigger Design

## Trustee-Accessible Summary for Review and Sign-Off

**Purpose of this document**  
This paper summarises recent refinements to the Virtual Assistant safeguarding trigger design. It is written for trustee review, with particular attention to governance boundaries, explainability, and long-term containment.

This document does not introduce new authority. It clarifies and strengthens existing boundaries.

# 1. Core Governance Position

The safeguarding trigger design prioritises:

- Deterministic behaviour over interpretive flexibility
- Governance containment over optimisation
- Explicit user disclosures over inferred characteristics
- Privacy preservation over expanded detection sensitivity

The system is intentionally designed **not** to maximise detection of possible under-16 users. It escalates only on explicit, clearly defined signals. This is a deliberate governance choice.

# 2. Explicit Trade-Off

The design explicitly prioritises governance boundary integrity over maximum detection sensitivity. This closes the door on future pressure to expand triggers “for safety” without formal governance review and anchors the system in trustee intent rather than technical optimisation.

# 3. Under-16 Trigger Logic

Escalation occurs when:

- A user explicitly states they are under 16 (e.g. “I am 14”)
- A user states a UK school year that corresponds to under-16 age

Trigger detection:

- Uses deterministic, rule-based pattern matching
- Does not rely on LLM semantic interpretation
- Does not predict age
- Does not infer age from context
- Does not apply probabilistic scoring

# 4. Bounded School-Year Interpretation

UK school year references are accepted as categorical age declarations within the UK education system.

This is defined as a bounded inference approved for this specific safeguarding purpose only.

This prevents:

- Conflict with the “explicit, not inferred” safeguarding principle
- School-year logic being used as precedent for broader inference elsewhere

The exception is narrow and non-generalisable.

# 5. Context Does Not Suppress Escalation

If a user states:

> “I’m 14 but just looking for information for my mum”

Escalation still occurs.

Intent or contextual qualifiers do not override explicit age disclosure. This preserves determinism and auditability.

# 6. Implementation Integrity and Logging Constraints

Trigger detection uses deterministic pattern matching only and is not handled by an LLM.

When a safeguarding trigger fires, the system logs:

- A categorical code only (e.g. AGE_NUMERIC_14, SCHOOL_YEAR_9)

It does not log:

- Raw user text
- Free-text disclosures
- Conversation transcripts

This maintains alignment with the Analytics Contract: no personal narrative retention, no profiling, and no cross-session linkage.

# 7. What Happens on Escalation

When an under-16 trigger fires, the session is immediately redirected to the Children’s Services safeguarding pathway. The standard journey is terminated and the user is signposted to appropriate statutory support.

# Summary for Trustee Review

The current design:

- Escalates on explicit under-16 disclosures only
- Uses deterministic pattern rule
- Prevents contextual suppression
- Logs categorical trigger codes only
- Prioritises governance integrity over detection expansion
- Redirects under-16 disclosures directly to the Children’s Services pathway

This is a minimal, bounded, and defensible safeguarding trigger model appropriate to Street Support Network’s governance posture.

Prepared for trustee review.  
Subject to formal approval where required.
