> Source copy, converted 2 October 2026 from `6. Virtual_Assistant_Principles_in_Practice.docx` (sha256 4af66fb11e72220b9d9363ba884fe8dce99d88c654e912c3c9d72650ca2cb77e), supplied by the Managing Director. This Markdown file is the source under the repository's direction rule; the Word file was the only previous copy and is now a derived record. Content unchanged.

Street Support Network

Virtual Assistant: Principles in Practice

*How the governance principles are embedded in the current build*

*The governing principles and the framework that protects them are set out in the accompanying documents. This note completes the picture by showing those principles already at work in the Virtual Assistant as it currently operates.*

*This is not a document index. It is a demonstration. Each principle is shown alongside where it is visible in the current build.*

The Principles, Shown in the Current Build

These eight principles govern the Virtual Assistant. The right-hand column shows how each is implemented and enforced in the system as it currently operates.

| Principle                                       | How it is active in the current build                                                                                                                                                                                                     |
|-------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **AI supports but does not decide**             | AI assists with context and navigation. It cannot determine eligibility for support, override routing decisions, or generate safeguarding advice. All routing is rule-based and auditable.                                                |
| **Safeguarding is non-negotiable**              | Crisis, domestic violence, under-16, self-harm, sexual assault and immediate danger exits are hard-coded. AI cannot influence them. 39 automated tests across 13 paths run on every code change. Failure blocks deployment automatically. |
| **No inference without user confirmation**      | AI may reflect emotional content in a response but must not assign cause or diagnosis. High-risk routing only occurs after explicit user confirmation. The system will not act on what it infers.                                         |
| **Uncertainty is acknowledged, not hidden**     | A three-tier confidence model (HIGH/MEDIUM/LOW) governs how AI-extracted data is used. Only HIGH confidence data may trigger service exclusion. LOW confidence data is not used. The system does not act on weak signals.                 |
| **The system must stand alone**                 | Prescribed fallback behaviour is in place if AI is unavailable. The system fails transparently with actionable contacts (helplines, council). Partial continuation is not permitted: if the system cannot operate safely, it stops.       |
| **Privacy and dignity are preserved by design** | Session-only. No identifiers collected. No cross-session linkage. ‘Prefer not to say’ is respected everywhere. Controls exceed legal requirements. Analytics are aggregate only.                                                          |
| **Safety is not traded for performance**        | Safeguarding routes bypass AI entirely. No vulnerable person in a crisis scenario is routed through AI-mediated logic, even at cost to conversational smoothness. The system will never optimise its way around a safeguarding boundary.  |
| **Every user leaves with somewhere to turn**    | No dead ends by design. Non-housing pathways have honest acknowledgement content. Housing pathways have hard-coded national organisations. The system guarantees a meaningful exit for every user.                                        |

Proportionate Controls by Harm Level

Not all AI use carries the same risk. Controls scale with the potential for harm, not with the presence of AI.

| AI function                          | Harm level | What AI does                                                            | Key controls                                                                                                              |
|--------------------------------------|------------|-------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| Safeguarding-adjacent interpretation | HIGH       | Interprets free-text for crisis signals, age indicators, domestic abuse | Hard-coded exits. Mandatory user confirmation. No AI authority over routing. 39 automated safeguarding tests.             |
| Enrichment and service matching      | MEDIUM     | Extracts eligibility criteria from service descriptions                 | Extraction only, no inference. Confidence scoring. Human review for safeguarding-adjacent fields. Deterministic matching. |
| Conversational navigation            | LOW        | Helps users understand content and follow prescribed routing            | No AI authority. Approved voice and tone standards. Safe failure with fallback contacts.                                  |

The Safeguarding Test Suite

39 automated safeguarding tests run across 13 paths on every code change. Failure blocks deployment automatically. Tests are not advisory: the system cannot be released with a failing test.

Tests cover: crisis disclosure detection, domestic violence routing, under-16 identification, self-harm response, sexual assault exits, immediate danger handling, and age-indication mid-conversation. Each test verifies that the correct safeguarding exit is triggered and that AI has not influenced the outcome.

The test suite is documented in the Safeguarding Contract, which is maintained by the technical lead. Trustees are not required to read the contract. What matters for governance is that it exists, that it runs automatically, and that it cannot be bypassed.

Where the Build Currently Stands

The governance framework is active and the core principles are in place. A small number of known gaps are being tracked and addressed:

| Area                                | Current position                                               | Status         |
|-------------------------------------|----------------------------------------------------------------|----------------|
| Under-18 mid-conversation detection | Design approved. Implementation pending.                       | In development |
| Enrichment normalisation layer      | Needed to prevent language variation bias in service matching. | In development |
| Data Protection Policy update       | Requires update for current platform.                          | Backlog        |
| Analytics Contract Amendment        | Bounded exception for post-session feedback. Draft.            | Draft          |

None of these gaps affect the safeguarding principles or the controls that are currently active. They are being tracked and will return to trustees if any gap affects a governing principle.

For Trustees

The principles are not aspirational. They are already embedded in how the system works. The governance framework exists to ensure they stay that way: that changes to these principles require trustee approval, and that everything else has a named owner and a clear audit trail.

The technical contracts that implement these principles are maintained by the technical lead. Trustees do not need to read them. The principles themselves and the framework that protects them are the board’s territory.

Document Reference

For reference, the technical documentation underpinning this framework is listed below. These documents are maintained by the technical lead and do not require trustee approval unless a governing principle changes.

| Document                                    | Status            | Notes                                                     |
|---------------------------------------------|-------------------|-----------------------------------------------------------|
| Safeguarding Contract v3.0                  | Approved Baseline | 39 tests, 13 paths.                                       |
| Analytics Contract                          | Approved Baseline | Session-only analytics.                                   |
| AI Usage Boundaries Contract                | Draft             | Governs where AI is and is not permitted.                 |
| Service Matching Contract v2.0              | Draft             | Two-layer output architecture.                            |
| Data Enrichment Contract v2.0               | Draft             | Extraction confidence model.                              |
| Housing Pathway Endpoints Contract v1.0     | Draft             | Hardcoded national orgs, navigator matrix.                |
| Non-Housing Pathway Endpoints Contract v1.0 | Draft             | National floor content for all 11 non-housing categories. |

*Virtual Assistant: Principles in Practice \| Version 1.0 \| March 2026*
