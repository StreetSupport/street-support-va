> Source copy, converted 2 October 2026 from `Governance_Overview_v3.docx` (sha256 12f0c3ef56a9ac8cc37a21333b54fc278538dbac3c221c4dc73c27e4c2e45bfd), supplied by the Managing Director. This Markdown file is the source under the repository's direction rule; the Word file was the only previous copy and is now a derived record. Content unchanged.

**Virtual Assistant Governance Framework: Overview**

*Introductory governance note*

**Purpose**

This note provides an overview of the governance framework for the Street Support Network Virtual Assistant and explains how the accompanying contracts and briefing notes should be read together.

It is intended to support trustee oversight by:

Clarifying the scope and intent of the governance documentation

Explaining how design principles are applied consistently

Distinguishing between governance decisions and operational implementation

Identifying how AI risk is treated proportionately across different system functions

This note does not introduce new decisions or requirements.

**Context**

The Virtual Assistant supports people experiencing housing insecurity and related risks. Given the vulnerability of users and the complexity of the system, Street Support Network has chosen to govern the Virtual Assistant through a set of explicit contracts and companion governance notes, rather than relying on informal practice or technical convention.

These documents are designed to:

Constrain authority

Reduce risk

Preserve dignity

Remain robust under pressure

**How the Governance Framework Is Structured**

The governance framework is organised as paired artefacts:

|                          |                                                                                                |
|--------------------------|------------------------------------------------------------------------------------------------|
| **Type**                 | **Purpose**                                                                                    |
| **Governance contracts** | Define non-negotiable boundaries, authority limits, confidence thresholds, and review triggers |
| **Governance notes**     | Explain intent, trade-offs, and alignment with values in trustee-readable language             |

Each contract governs a specific area:

|                                   |                                                                                |
|-----------------------------------|--------------------------------------------------------------------------------|
| **Contract**                      | **Scope**                                                                      |
| **Safeguarding**                  | Hard-coded exits, invariants, testing, decision ownership                      |
| **AI Usage Boundaries**           | Where AI is/isn't permitted, conversational behaviour, fallback                |
| **Service Matching**              | Exclusion rules, ranking, confidence thresholds                                |
| **Analytics**                     | What is logged, what is excluded, privacy by design                            |
| **Data Enrichment**               | Authority hierarchy, confidence scoring, human review (DRAFT)                  |
| **Housing Pathway Endpoints**     | Council contact data, navigator orgs, DV orgs, immigration orgs per LA         |
| **Non-Housing Pathway Endpoints** | Category typology, national floors, zero-match handling, LGBTQ+ modifier scope |

Together, these documents define how the system is allowed to behave.

**Design Principles vs Operational Process**

The governance framework intentionally distinguishes between:

|                           |                                                                                                                                             |                           |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|---------------------------|
| **Category**              | **Description**                                                                                                                             | **Documentation**         |
| **Design principles**     | Constrain power, risk, and authority. Stable. Subject to trustee review if changed.                                                         | Documented in contracts   |
| **Operational processes** | How approved principles are implemented (e.g. phrasebank workflows, escalation thresholds, tooling choices). May evolve within constraints. | Not all redocumented here |

This distinction is deliberate. The documentation focuses on what must not change, rather than prescribing every implementation detail.

**Design Principles Status**

The core design principles governing the Virtual Assistant are considered complete.

They include, but are not limited to:

AI supports but does not decide

Safeguarding is non-negotiable

No inference without user confirmation

Uncertainty is acknowledged, not hidden

The system must stand alone without live human intervention

Privacy and dignity are preserved by design

Safety is not traded off for optimisation or performance

These principles are embedded across the contracts and do not rely on a single document.

**Proportionality and AI Risk Pathways**

The Virtual Assistant uses AI in several distinct functions. These carry materially different levels of risk. Treating all AI use as a single governance question would result in either over-governing low-risk activity or under-governing high-risk activity. Neither serves users well.

Street Support Network's governance framework treats AI risk proportionately: controls scale with the potential for harm, not with the presence of AI. This aligns with UK Government AI regulatory principles, ICO guidance, and the Jannaways Governance Principles for AI in Charity Organisations (Principle 5: governance must be proportionate to risk).

**AI Pathways Within the Virtual Assistant**

The VA's AI usage falls into three pathways, each with a distinct harm profile:

|                                                 |                |                                                                                                           |                                                                                                                                                            |
|-------------------------------------------------|----------------|-----------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **AI Pathway**                                  | **Harm Level** | **What AI Does**                                                                                          | **What Could Go Wrong**                                                                                                                                    |
| **Safeguarding-adjacent interpretation**        | **HIGH**       | Interprets free-text input that may contain crisis disclosures, domestic abuse signals, or age indicators | Missed disclosure leads to vulnerable person not receiving safeguarding exit. Silent inference leads to inappropriate routing without user confirmation.   |
| **Enrichment and service matching preparation** | **MEDIUM**     | Interprets service descriptions to extract structured eligibility criteria (age, gender, access barriers) | Incorrect extraction causes relevant service to be excluded or irrelevant service to be shown. Language variation in descriptions creates unintended bias. |
| **Conversational navigation**                   | **LOW**        | Helps users understand presented content, follows prescribed routing, provides conversational flow        | Tone drift, overconfidence, or unclear language. Low severity because AI has no authority: it presents approved content and follows prescribed logic.      |

**Controls Applied by Pathway**

Each pathway receives controls proportionate to its harm level:

**High harm: safeguarding-adjacent interpretation**

|                                 |                                                                                                                                            |
|---------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| **Control**                     | **Detail**                                                                                                                                 |
| **Hard-coded overrides**        | Safeguarding routes bypass AI entirely. Crisis, DV, under-16, self-harm, and immediate danger exits are prescribed, not inferred.          |
| **Mandatory user confirmation** | AI may reflect emotion but must not assign cause or diagnosis. High-risk routing only occurs after explicit user confirmation.             |
| **No AI authority**             | AI cannot override safeguarding routing, generate safeguarding advice, or bypass escalation thresholds.                                    |
| **Automated testing**           | 53 safeguarding tests across 19 critical paths run on every code commit and deployment. Hard stop failures block deployment automatically. |
| **Governing contract**          | Safeguarding Contract (approved baseline)                                                                                                  |

**Medium harm: enrichment and service matching preparation**

|                              |                                                                                                                                                                        |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Control**                  | **Detail**                                                                                                                                                             |
| **Extraction not inference** | AI may only extract explicit eligibility statements. Inference from product type, category, or context is prohibited.                                                  |
| **Confidence scoring**       | Three-tier model (HIGH, MEDIUM, LOW). Only HIGH confidence data may trigger service exclusion. MEDIUM informs ranking only. LOW is not used.                           |
| **Human review**             | Safeguarding-adjacent fields (accepts under-18s, DV specialism, mental health) require human verification before use.                                                  |
| **Normalisation standards**  | Varied language in service descriptions must map to standardised criteria values, preventing language quality from becoming a bias factor. (In development.)           |
| **Deterministic matching**   | Final matching is rule-based and auditable. AI prepares data; algorithm decides. Match scoring is derived from explicit criteria, not AI interpretation at match time. |
| **Governing contract**       | Data Enrichment Contract v2.0 (draft), Service Matching Contract v2.0 (approved baseline)                                                                              |

**Low harm: conversational navigation**

|                                       |                                                                                                                                                           |
|---------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Control**                           | **Detail**                                                                                                                                                |
| **No AI authority**                   | AI presents approved content and follows prescribed routing. It does not introduce new information, generate advice, or make decisions.                   |
| **Approved conversational standards** | Voice, tone, and interaction style governed by Street Support Network standards. Changes constitute a governance review trigger.                          |
| **Safe failure**                      | If AI is unavailable, the system fails transparently with actionable fallback (helpline numbers, council contact). Partial continuation is not permitted. |
| **Governing contract**                | AI Usage Boundaries Contract (draft)                                                                                                                      |

**Why This Matters for Governance**

This proportionality model ensures that:

High-risk AI functions receive the highest scrutiny, including hard-coded overrides, automated testing, and deployment gates

Medium-risk AI functions are bounded by confidence thresholds, human review, and explicit extraction rules

Low-risk AI functions operate within approved standards without requiring the same intensity of oversight

Trustees can see that AI risk is being treated as a set of distinct harm pathways, not as a single undifferentiated concern. Each pathway has named controls, a governing contract, and clear review triggers if boundaries are proposed to change.

This approach aligns with Principle 5 of the Jannaways Governance Principles for AI in Charity Organisations: governance must be proportionate to risk. Proportionate governance depends on separating risk into distinct harm pathways. Treating AI risk as a single object obscures material differences in severity, reversibility, and exposure.

**Ethical AI Alignment**

The governance framework has been reviewed against IBM's five pillars of ethical AI (Explainability, Transparency, Fairness, Robustness, Privacy) and the Jannaways Governance Principles for AI in Charity Organisations. The current position is summarised below.

|                    |                                                                                                                      |                                                                                                                                         |                                      |
|--------------------|----------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------|
| **Pillar**         | **Current Position**                                                                                                 | **Priority Gap**                                                                                                                        | **Status**                           |
| **Explainability** | Hard-gate exclusion traceable to explicit rules. Hybrid model: AI prepares, rules decide.                            | Ranking logic (when built) needs same rigour as exclusion logic.                                                                        | Watch brief                          |
| **Transparency**   | Users told why questions are asked, offered route choice, informed no personal data collected.                       | Consider user-facing matching explanation when ranking is implemented.                                                                  | Strong; future consideration noted   |
| **Fairness**       | No inference permitted. 'Prefer not to say' respected everywhere. Explicit/inference boundary defined.               | Enrichment normalisation layer needed to prevent language variation bias. Match scoring for fair ordering.                              | In development                       |
| **Robustness**     | 53 safeguarding tests across 19 paths on every commit. Prescribed fallback behaviour. Seven global invariants.       | Under-18 flag and gender contradiction detection (backlog items 9/10). Mid-conversation age detection approved, pending implementation. | Known gaps tracked in backlog        |
| **Privacy**        | Session-only, no identifiers, no cross-session linkage, aggregate patterns only. Controls exceed legal requirements. | Data Protection Policy requires update for current platform.                                                                            | Strong; documentation update pending |

This review confirms alignment with external ethical AI frameworks. Where gaps exist, they are tracked in the implementation backlog with clear dependencies and priorities.

**Review and Evolution**

The framework is designed to evolve only through explicit review.

Each contract defines clear review triggers, including:

Expansion of system authority

Changes to confidence thresholds

Changes to safeguarding behaviour

Changes to data sources or AI role

Changes to AI risk classification or proportionality controls

Operational refinement within existing boundaries does not require trustee re-approval. Material changes to boundaries do.

**Document Index**

|                                        |                 |                   |
|----------------------------------------|-----------------|-------------------|
| **Document**                           | **Type**        | **Status**        |
| **Safeguarding**                       | Contract        | Approved baseline |
| **Safeguarding**                       | Note            | Complete          |
| **AI Usage Boundaries**                | Contract        | Draft             |
| **AI Usage Boundaries**                | Note            | Complete          |
| **Service Matching**                   | Contract        | Approved baseline |
| **Service Matching**                   | Note            | Complete          |
| **Analytics**                          | Contract        | Approved baseline |
| **Analytics**                          | Note            | Complete          |
| **Data Enrichment**                    | Contract        | DRAFT             |
| **Data Enrichment**                    | Note            | DRAFT             |
| **Governance Review Triggers**         | Note            | Complete          |
| **Data Management Plan**               | Plan            | Draft             |
| **Housing Pathway Endpoints**          | Contract        | Approved baseline |
| **Non-Housing Pathway Endpoints**      | Contract        | Approved baseline |
| **Data Minimisation and Lawful Basis** | Note            | Draft             |
| **Appropriate Policy Document**        | Policy document | Draft             |

**Summary**

This governance framework is intended to:

Make system behaviour explainable

Prevent silent drift

Protect users under pressure

Support trustee oversight without requiring micromanagement

Treat AI risk proportionately, with controls that match the potential for harm

It represents a deliberate decision to govern by constraints and clarity, rather than by aspiration or after-the-fact review.

*Governance framework overview \| March 2026*
