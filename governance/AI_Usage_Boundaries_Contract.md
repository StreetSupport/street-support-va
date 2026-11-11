> Source copy, converted 11 November 2026 from `governance/AI_Usage_Boundaries_Contract.pdf` in the pipeline repository (sha256 `33f7da254abad282…`). Content unchanged.

# AI Usage Boundaries: Contract

Document type: Governance Contract

Status: Draft

Last updated: February 2026

## Purpose

This file defines where AI (Claude) is and is not permitted to operate within the Virtual Assistant.

It specifies:

- what AI may do
- what AI must not do
- how AI behaviour is constrained in sensitive contexts
- how failures are handled

This file exists to ensure AI usage remains bounded, transparent, and aligned with Street Support Network values.

## Design Principles

These principles govern all AI usage within the Virtual Assistant:

| Principle | Application |
|---|---|
| Transparency | Users understand what is happening; no hidden inference |
| Explainability | We can state why the system behaved as it did |
| Robustness | System behaves predictably; handles edge cases safely |
| Privacy | No data captured beyond stated scope; no profiling |
| Fairness | No assumptions; declined answers respected; no discrimination |

AI authority is designed out of the system by default, then allowed back in only where risk is low and value is clear.

## Scope

This contract applies to:

- All AI (Claude) usage within the Virtual Assistant
- Conversation handling, interpretation, and routing
- Data enrichment and eligibility extraction
- Language handling and translation
- Failure and fallback behaviour

This contract does not cover:

- Service matching logic (governed by Service Matching Contract)
- Analytics and logging (governed by Analytics Contract)
- Safeguarding exits (hard-coded; bypass AI entirely)

## Where AI Is Used

AI is permitted for the following functions:

### Conversation Handling

- Interpreting user inputs (typed and selected)
- Following prescribed routing logic
- Presenting phrasebank content appropriately

### Data Enrichment

- Interpreting scraped website text
- Extracting eligibility criteria from unstructured sources
- Supporting confidence scoring (data preparation only)

### Comprehension Support

- Helping users understand advice content
- Explaining what approved text means
- Answering clarifying questions about presented information

Comprehension support explains presented content; it does not introduce new information.

## Where AI Is Constrained

### Free-Text Handling

Boundary: AI may interpret user inputs but must not infer sensitive circumstances without confirmation.

Rules:

- Free text may signal risk but does not constitute disclosure
- AI may reflect emotion but must not assign cause or diagnosis
- High-risk routing (DV, self-harm, crisis) only occurs after user confirmation
- For routine inputs (location, need type), gentle mapping is acceptable
- For safeguarding-adjacent language, clarification is mandatory

Rationale: Mapping free text directly to high-risk intent creates silent inference. Clarification preserves responsiveness and user agency.

### Advice Mode

Boundary: All advice content must originate from approved sources. AI may support comprehension but must not generate advice.

Rules:

- Advice text comes from phrasebank entries only
- AI may help explain what the advice means
- AI must not restate, reinterpret, or synthesise advice
- AI must not combine multiple advice sources into new content
- If no approved advice exists for a question, AI must acknowledge this and offer routing to support

Rationale: Housing and eviction advice carries legal and safety implications. Generated advice is hard to audit and defend if challenged.

### Language Translation

Boundary: Translation method is determined by content risk, not convenience.

Rules:

- Safeguarding, rights, crisis, and consent content must use human-approved translations
- AI translation is permitted for conversational glue and navigation
- If critical content is unavailable in a user's language, the system must say so plainly
- AI must not translate and present critical content as if it were approved

Content classification:

| Content Type | Translation Method |
|---|---|
| Safeguarding exits | Human-approved only |
| Crisis information | Human-approved only |
| Rights and legal information | Human-approved only |
| Consent language | Human-approved only |
| Conversational navigation | AI translation permitted |
| Clarifying questions | AI translation permitted |
| Routing prompts | AI translation permitted |

Rationale: Full pre-translation does not scale, but critical content must be accurate. Risk-based differentiation is proportionate.

### Failure and Fallback

Boundary: AI must fail transparently and safely when unavailable.

Rules:

- When AI capability is unavailable, the system must not simulate understanding
- Fallback must acknowledge limitation clearly
- Fallback must provide actionable next steps (helpline numbers, council contact)
- A fallback outcome is treated as a valid system outcome, not an error
- Partial or cached continuation is not permitted

Fallback content must include:

- Acknowledgement that the service is temporarily limited
- Shelter helpline: 0808 800 4444
- Local council Housing Options signposting
- Samaritans (if session involved self-harm pathway): 116 123

Rationale: Pretending continuity undermines trust. A safe landing is better than a broken conversation.

## Conversational Behaviour

Within permitted boundaries, AI conversational behaviour is governed by the Street Support Network voice and rules files. These encode interaction standards, language preferences, tone, reassurance patterns, and dignity-preserving defaults.

Conversational standards govern tone and interaction style only; they do not permit the introduction of new content, advice, or decision logic.

These files are integrated once and remain stable. Changes to conversational standards constitute a governance review trigger.

## Where AI Is Not Permitted

AI must not:

| Prohibition | Rationale |
|---|---|
| Make final service matching decisions | Matching is algorithmic and auditable |
| Override safeguarding routing | Safeguarding exits are hard-coded |
| Override escalation thresholds | Escalation logic is prescribed |
| Infer characteristics not stated by user | Protects dignity and prevents discrimination |
| Generate advice content | Advice must be auditable and approved |
| Assign cause or diagnosis to user statements | Reflection permitted; interpretation prohibited |
| Translate critical content without approval | Safeguarding content requires human-approved language |
| Simulate capability during failure | Honest fallback required |

## Explicit Exclusions

The following must never occur:

- AI inferring DV, self-harm, or crisis without user confirmation
- AI generating housing, legal, or rights advice in its own words
- AI translating safeguarding or crisis content on the fly
- AI continuing conversation when API is unavailable
- AI overriding any hard-coded routing or escalation
- AI profiling users based on conversation patterns
- AI retaining or learning from individual session content

## Accountability

- All AI behaviour is traceable to explicit rules in this contract
- No human review exists in the live conversation loop; the system must stand on its own within these boundaries
- AI decisions that affect routing can be explained by reference to this contract
- If AI behaviour is questioned, the answer must be findable here

Future development (out of scope for this version):

- Automated monitoring and exception reporting
- Drift detection against these boundaries
- Periodic review triggers

## Governance

This contract:

- Must not be overridden by convenience or optimisation goals
- Takes precedence over "helpful" AI behaviour
- Must be reviewed if AI capabilities or usage are proposed to expand

Review triggers:

- Any proposal to allow AI to generate advice content
- Any proposal to allow AI translation of critical content
- Any proposal to allow AI to route without user confirmation in sensitive contexts
- Any proposal to allow AI to continue during API failure
- Any expansion of AI authority not covered by this contract

Material changes to AI boundaries require explicit trustee review.

## Summary

AI is a tool for interpretation and comprehension, not decision-making or authority.

The system is designed so that AI helps users navigate, but humans (through approved content and prescribed logic) determine what users see and are told.

## Status

Status: Draft

Approved by: [Pending]

Date: [Pending]
