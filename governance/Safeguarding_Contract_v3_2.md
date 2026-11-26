> Source copy, converted 2 October 2026 from `Safeguarding_Contract_v3_2.docx` (sha256 21348b88b2ac4a49b9dbaea69bfbf4fa583a348df52ac636e2fa9f6e407615c3), supplied by the Managing Director. This Markdown file is the source under the repository's direction rule; the Word file was the only previous copy and is now a derived record. Content unchanged.

# Safeguarding: Contract

Document type: Governance Contract

Status: Approved Baseline

Last updated: April 2026

## Purpose

This file defines how the Virtual Assistant protects vulnerable users through safeguarding behaviour.

It specifies:

• what safeguarding invariants apply across all paths

• what routes are hard-coded and cannot be overridden

• what AI is and is not permitted to do in safeguarding contexts

• how safeguarding behaviour is tested and maintained

This file exists to ensure safeguarding remains the foundational constraint shaping all other system behaviour.

## Design Principles

• Safeguarding is embedded by design, not added as a feature.

• Safeguarding behaviour is hard-coded and cannot be overridden by AI, user input, or system state.

• Safeguarding behaviour is not subject to optimisation, experimentation, or performance trade-offs.

• Safeguarding behaviour must not be weakened, deferred, or rebalanced for throughput, performance, or user completion metrics.

• Ethical behaviour takes priority over flow completion.

• Simplicity protects users; complexity introduces risk.

• Every safeguarding exit must preserve dignity and offer a way back.

## Scope

This contract applies to:

• All safeguarding-related routing within the Virtual Assistant

• Crisis gate behaviour

• Safeguarding exits (under-16, DV, self-harm, immediate danger)

• AI behaviour in safeguarding-adjacent contexts

• Testing of safeguarding behaviour

This contract does not cover:

• Service matching logic (governed by Service Matching Contract)

• Analytics and logging (governed by Analytics Contract)

• Data enrichment (governed by Data Enrichment Contract)

Safeguarding exits bypass these other systems entirely.

## Global Safeguarding Invariants

These rules cut across all paths and guide every future decision.

**Invariant 1: Safeguarding Signals Override All State**

A disclosure at any point resets the flow. Previously collected data does not influence safeguarding exits.

**Invariant 2: Silence Is a Safeguarding Failure**

If something breaks, the user must still receive help. Empty responses, dead-ends, and unhandled errors are never acceptable.

Fallback behaviour must always honour safeguarding exits and never present generic failure messaging in place of safeguarding content.

**Invariant 3: Defaults Are Not Consent or Confirmed Fact**

The VA must not assume anything the user has not explicitly stated. &#x201C;Prefer not to say&#x201D; is not &#x201C;No&#x201D;.

**Invariant 4: Restart or Replay Must Not Bypass Safeguarding**

The crisis gate appears on every new session and every restart, without exception.

**Invariant 5: Confidence Must Match Data**

The VA must never sound more confident than the data allows. Uncertain eligibility requires uncertain language.

**Invariant 6: Ethics Over Completion**

It is better to stop and signpost than to complete a journey that causes harm.

**Invariant 7: Exits Preserve Dignity**

Safeguarding exits must not feel like rejection or shutdown. Users must feel able to return.

## Hard-Coded Safeguarding Routes

The following routes are prescribed, not inferred. They bypass the service matcher and AI entirely.

| **Trigger**                          | **Route**                       | **Key Content**                                       |
|--------------------------------------|---------------------------------|-------------------------------------------------------|
| Immediate danger (option 1)          | 999 signposting                 | Emergency services, full stop                         |
| Self-harm indication (option 3)      | Samaritans pathway              | 116 123, warm handoff, continued support offered      |
| Fire/flood displacement (option 6)   | Priority need pathway           | Local council, Shelter                                |
| Fleeing domestic abuse (option 4)    | DV-specific exit                | Gender-appropriate resources, National DV Helpline    |
| Under-16 disclosure (option 2)       | Children&#x2019;s Services exit | Childline 0800 1111, local Children&#x2019;s Services |
| Sexual assault disclosure (option 5) | SARC pathway                    | Relevant support services                             |

*Note: Crisis gate option order updated March 2026 to prioritise Under-16 disclosure (option 2) immediately after immediate danger. Approved by James Cross, 2 March 2026. Implemented in PR \#6, March 2026. Option numbers above reflect the implemented order.*

## Crisis Gate Requirement

The crisis gate is always the first user-visible output in any session. No other text, greeting, or content may appear before it.

After restart, the crisis gate appears again.

## Free-Text Disclosure Rule

Safeguarding disclosures may occur via free text at any point and must be treated as authoritative.

Users may disclose safeguarding information outside structured gates. Free text disclosures are potentially higher priority than structured answers.

This requires:

• Recognition that disclosure can happen anywhere

• Override capability when it does

• No assumption that &#x201C;the UI prevents this&#x201D;

## AI Usage in Safeguarding Contexts

**AI Is Not Permitted To:**

| **Prohibition**                                             | **Rationale**                                  |
|-------------------------------------------------------------|------------------------------------------------|
| Override safeguarding routing                               | Routes are hard-coded                          |
| Infer crisis, abuse, or diagnosis without user confirmation | Prevents silent inference                      |
| Generate safeguarding advice                                | Advice must come from approved sources         |
| Bypass or soften safeguarding exits                         | Exits are prescribed                           |
| Add &#x201C;fallback to normal flow&#x201D; logic           | Safeguarding is not recoverable to normal flow |

**AI Output Is Reviewed For:**

• Tone drift (clinical, cold, directive language)

• Overconfidence (certainty where uncertainty exists)

• Hidden assumptions (defaults treated as facts)

• Logic that bypasses safeguarding

## Claude Usage Rules

1\. Claude generates patterns, not ethics. We supply the values.

2\. Claude must not invent new behaviour. Tests and flows come from human-defined requirements.

3\. Tests come after values, never before.

4\. If Claude adds cleverness, we cut it. Simplicity protects users.

5\. We do not ask Claude to &#x201C;write safeguarding tests&#x201D;. We ask Claude to propose minimal tests that would fail if specific harm reappeared.

## Testing Requirements

Safeguarding behaviour is tested through 96 defined test cases across 21 critical paths.

**Test Coverage**

| **Path/Area**                           | **Tests** | **Primary Focus**                                         |
|-----------------------------------------|-----------|-----------------------------------------------------------|
| Crisis Gate                             | 9         | First contact routing, option verification                |
| Under 16                                | 5         | Child safeguarding exit, appropriate resources            |
| 16-17 Year Olds                         | 6         | Age-appropriate routing, navigator filtering, care status |
| Domestic Abuse Disclosure               | 6         | Gender-appropriate helplines, Shelter housing advice      |
| Self-Harm Pathway                       | 3         | Crisis support, safeguarding exit                         |
| Gender Filtering at Terminal            | 2         | Service appropriateness                                   |
| Prevention Escalation                   | 1         | Health crisis routing                                     |
| Fire/Flood Emergency                    | 2         | Priority need routing                                     |
| Critical Content Exists                 | 4         | Non-empty safeguarding responses                          |
| Supporter Mode Exits                    | 2         | Third-person phrasing for supporters                      |
| Fire/Flood Council Numbers              | 2         | Correct LA-specific contact data                          |
| Non-Housing Terminal Path               | 3         | Category routing, zero-match handling                     |
| DV Pregnancy Path                       | 2         | Pregnancy equivalence in DV routing                       |
| NRPF Family Support                     | 1         | Section 17 framing for NRPF families                      |
| Advice Subcategory Routing              | 1         | Advice category selection flow                            |
| Detailed Age/Gender Fallback            | 4         | Profile field priority and fallback behaviour             |
| Immigration Status Derives Public Funds | 5         | Correct public funds derivation from status               |
| LGBTQ+ Specialist Follow-up             | 3         | Specialist preference routing                             |
| Null-Check Gate Fix                     | 3         | Boolean gate progression, infinite loop prevention        |
| Housing Options Involvement             | 9         | Housing options question routing and storage              |
| **Total**                               | **73**    |                                                           |

**Test Layers**

| **Layer**         | **Purpose**          | **Failure Response** |
|-------------------|----------------------|----------------------|
| Hard stops        | Must always pass     | Deployment blocked   |
| Regression safety | Content still exists | Deployment blocked   |
| Values assertions | Behavioural checks   | Review required      |

## Testing Philosophy

Tests verify that specific harms cannot reappear, not that the system is &#x201C;clever&#x201D;.

We define what must happen (values), then what could go wrong (failures), then tests.

Tests are mechanical routing checks: given input, assert output. They are not values assessments or tone evaluations.

## Test Decision Ownership

When tests fail, clear accountability applies:

| **Test Layer**    | **Failure Response**             | **Decision Owner**                        |
|-------------------|----------------------------------|-------------------------------------------|
| Hard stops        | Deployment blocked automatically | No override without code change           |
| Regression safety | Deployment blocked automatically | No override without code change           |
| Values assertions | Review required                  | Matt reviews, documents in commit message |

**Escalation path:**

Any values assertion failure where Matt is uncertain → James reviews before deploy

Decision rationale captured in commit message (GitHub history is the audit trail)

## Change Control

When safeguarding tests change, visibility is required:

• Maintain a record of safeguarding-related changes in the VA backlog completed record. Format: Date, what changed, why, who decided.

• Format: Date, what changed, why, who decided

• James notified when VA backlog is update (practice, not automated)

• Quarterly summary available if requested

This ensures trustees can know when safeguarding tests themselves have been modified.

## Test Scope and Triggers

**Intentionally Out of Scope**

The following are not covered by safeguarding tests:

| **Area**                             | **Reason**                       |
|--------------------------------------|----------------------------------|
| Service quality assessment           | SSN database responsibility      |
| Individual eligibility determination | Always human/service decision    |
| Legal advice accuracy                | VA signposts, does not advise    |
| API uptime/performance               | Infrastructure, not safeguarding |
| Tone or warmth evaluation            | Requires human judgement         |

**Triggers for New Safeguarding Test Classes**

New safeguarding tests are required when:

• New vulnerable population identified in user research

• New crisis pathway added to routing logic

• Regulatory or legal change affecting housing rights

• Incident or near-miss in production

• Trustee request following review

These triggers ensure test coverage evolves with the system, not ahead of it.

## Future Considerations (Parked)

**Accumulated Risk**

Safeguarding risk may accumulate across answers. A single moderate factor may not trigger escalation, but multiple moderate factors together may require it.

Current state: Not implemented

Future iteration: May escalate based on combinations of factors

**Enrichment-Aware Safeguarding**

When enriched eligibility data is in use, confidence levels must influence language.

Current state: Not implemented (enrichment not yet live)

Future iteration: Eligibility confidence integrated into output language

These are explicitly parked and will require governance review before implementation.

## Accountability

• The safeguarding framework is owned by Street Support Network

• Review: at least annually, and after any safeguarding incident or material change

• Failures are treated as learning signals, not blame events

• All safeguarding exits are traceable to this contract

• Changes to safeguarding logic trigger governance review

## Governance

This contract:

• Must not be overridden by convenience, optimisation, or automation goals

• Takes precedence over all other contracts where safeguarding is implicated

• Must be reviewed if safeguarding exits or testing approach change

**Review triggers:**

• Any safeguarding incident

• Any proposal to modify hard-coded routes

• Any proposal to allow AI to influence safeguarding routing

• Any proposal to reduce testing coverage

• Material change to the Virtual Assistant

Safeguarding is non-negotiable. Changes require explicit trustee review.

## Governed Data Files

The following data files are governed by this contract. Each contains safeguarding-adjacent contact data and is subject to the change control, verification, and audit requirements set out herein.

**safeguarding-endpoints.json**

Scope: SARC contacts (Horizon SARC, all 7 WMCA LAs), local DV crisis lines per LA, CYPSAS routing for under-16 and 16–17 users.

Verification method: Cross-audited against primary sources (organisation websites, council contacts) February 2026. Wired into codebase March 2026 (PR \#5).

Change control: Any update to this file requires a pull request, review by James Cross, and a corresponding backlog entry. The file is not edited directly outside the PR process.

Authority: Matt Lambert (Managing Director, Street Support Network).

Note: Blue Sky Centre (Coventry) DV crisis line is marked NEEDS VERIFICATION and is not surfaced until a verified number is confirmed.

**housing-pathway-endpoints.json (safeguarding-relevant scope)**

Scope: Housing Options, Children’s Services, and out-of-hours emergency numbers for all 7 WMCA LAs. Used at crisis gate and safeguarding exits. This file also contains non-safeguarding data (navigator orgs, DV orgs, immigration orgs) governed by the Housing Pathway Endpoints Contract. Only the safeguarding-relevant fields listed here fall under this contract.

Verification method: Cross-audited against council websites February 2026. Consolidated from la-contacts.json into housing-pathway-endpoints.json in PR \#6, March 2026, with James Cross sign-off.

Change control: Same as above. la-contacts.json no longer exists as a separate file.

## Implemented Design Changes

The following changes were approved and implemented. They are documented here as a record of design decisions and governance approvals.

**Crisis Gate Option Reordering**

Approved by James Cross, 2 March 2026. Condition: test assertions around option positions must be updated in the same PR. Implemented in PR \#6, March 2026. The Hard-Coded Safeguarding Routes table above reflects the implemented order.

**Mid-Conversation Age Detection**

Direction of travel approved by James Cross, 2 March 2026. Design note produced (“Mid-Conversation Age Detection Design Note v1.2”, March 2026, updated April 2026). Implemented and signed off by James Cross via PR \#16, April 2026. 96/96 tests passing.

Key design decisions: binary (not probabilistic) trigger threshold; explicit disclosure only (numeric age under 16, or school years 7–10 in England/Wales/Northern Ireland); silent escalation with visible explanation; session termination on trigger with no re-entry; deterministic pattern matching (not LLM interpretation); categorical audit logging only (no raw user text retained); contextual qualifiers do not suppress escalation (“I’m 14 but asking for my mum” still triggers).

Trustee-accessible summary: “Trustee Accessible Safeguarding Boundary Summary”, March 2026.

## Status

Status: Approved Baseline

Approved by: \[Name\]

Date: \[Date\]
