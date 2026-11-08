> Source copy, converted 2 October 2026 from `Safeguarding_Governance_Note_v3_3.docx` (sha256 aa5e86d3a5a0e55a3144503f389ff19d4ec49b11f846e4325c2d5f74f69c006f), supplied by the Managing Director. This Markdown file is the source under the repository's direction rule; the Word file was the only previous copy and is now a derived record. Content unchanged.

**Virtual Assistant Safeguarding: Governance Alignment**

*One-page governance note*

Purpose

To explain how safeguarding is embedded in the Virtual Assistant by design, the principles that govern safeguarding behaviour, and how this is tested and maintained. For full specification, see the Safeguarding Contract v3.1.

Context

People using the Virtual Assistant may be in crisis, fleeing harm, or disclosing sensitive information. The system must protect vulnerable users without requiring them to navigate complexity or repeat themselves. Safeguarding is not a feature added to the VA. It is a foundational constraint that shapes every other decision.

Core Governance Position

- Safeguarding behaviour is hard-coded and cannot be overridden by AI, user input, or system state.

- Safeguarding behaviour is not subject to optimisation, experimentation, or performance trade-offs.

Seven global invariants govern all safeguarding behaviour:

|                                    |                                                                                                  |
|------------------------------------|--------------------------------------------------------------------------------------------------|
| **Invariant**                      | **Meaning**                                                                                      |
| **Safeguarding overrides state**   | A disclosure at any point resets the flow. Previous answers do not influence safeguarding exits. |
| **Silence is failure**             | If something breaks, the user must still receive help. Dead-ends are never acceptable.           |
| **Defaults are not facts**         | The VA does not assume anything the user has not explicitly stated.                              |
| **Crisis gate cannot be bypassed** | Every session and every restart begins with the crisis gate.                                     |
| **Confidence matches data**        | The VA never sounds more certain than the information allows.                                    |
| **Ethics over completion**         | It is better to stop and signpost than complete a journey that causes harm.                      |
| **Exits preserve dignity**         | Safeguarding exits must not feel like rejection. Users must feel able to return.                 |

*These invariants are non-negotiable and apply across all paths.*

How Safeguarding Is Protected

Hard-Coded Routes

Safeguarding exits bypass the service matcher and AI entirely:

- Immediate physical danger (option 1) → 999 signposting

- Under-16 disclosure (option 2) → Children’s Services exit

- Self-harm indication (option 3) → Samaritans and support pathway

- Domestic abuse disclosure (option 4) → DV-specific exit (gender-appropriate)

- Sexual violence disclosure (option 5) → SARC and Rape Crisis exit

- Fire/flood displacement (option 6) → Council emergency contacts

These routes are prescribed, not inferred. Crisis gate option order updated March 2026 to prioritise Under-16 disclosure immediately after immediate danger.

AI Boundaries

AI (Claude) handles conversation flow but:

- Cannot override safeguarding routing

- Cannot infer crisis, abuse, or diagnosis without user confirmation

- Cannot generate safeguarding advice

- Is reviewed for tone drift, overconfidence, and hidden assumptions

Safeguarding decisions are human-defined, not AI-generated.

Testing Approach

Safeguarding behaviour is tested through 96 defined test cases across 21 critical paths:

|                                             |           |                                                                                                                                                                                                                |
|---------------------------------------------|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Path**                                    | **Tests** | **Coverage**                                                                                                                                                                                                   |
| **Crisis Gate**                             | 9         | Option ordering, position checks, routing                                                                                                                                                                      |
| **Under 16**                                | 5         | Children’s Services exit, Childline fallback                                                                                                                                                                   |
| **16-17 Year Olds**                         | 6         | Age-appropriate routing, navigator filtering, care status                                                                                                                                                      |
| **Domestic Abuse Disclosure**               | 6         | Gender-specific DV exits, Shelter housing advice                                                                                                                                                               |
| **DV Pregnancy Path**                       | 2         | Pregnant DV survivor gets children-specific resources                                                                                                                                                          |
| **Self-Harm Pathway**                       | 3         | Samaritans routing, support pathway                                                                                                                                                                            |
| **Gender Filtering at Terminal**            | 2         | Gendered service exclusion                                                                                                                                                                                     |
| **Prevention Escalation**                   | 1         | Escalation to Housing Options                                                                                                                                                                                  |
| **Fire/Flood Emergency**                    | 2         | Council emergency contacts                                                                                                                                                                                     |
| **Fire/Flood Council Numbers**              | 2         | LA-specific OOH numbers                                                                                                                                                                                        |
| **Critical Content Exists**                 | 4         | Essential content presence checks                                                                                                                                                                              |
| **Supporter Mode Exits**                    | 2         | Supporter language variants                                                                                                                                                                                    |
| **Non-Housing Terminal Path**               | 3         | Non-housing category routing, zero-match handling                                                                                                                                                              |
| **NRPF Family Support**                     | 1         | Section 17 framing for NRPF families                                                                                                                                                                           |
| **Advice Subcategory Routing**              | 1         | Subcategory selector and national floor                                                                                                                                                                        |
| **Detailed Age/Gender Fallback**            | 4         | Fallback when detail not provided                                                                                                                                                                              |
| **Immigration Status Derives Public Funds** | 5         | Correct public funds derivation from status                                                                                                                                                                    |
| **LGBTQ+ Specialist Follow-up**             | 3         | Specialist preference routing                                                                                                                                                                                  |
| **Null-Check Gate Fix**                     | 3         | Boolean gate progression, infinite loop prevention                                                                                                                                                             |
| **Housing Options Involvement**             | 9         | Housing options question routing and storage                                                                                                                                                                   |
| **Mid-Conversation Age Detection**          | 23        | Numeric age triggers (10–15), school year triggers (7–10), boundary conditions, ambiguous phrase negatives, contextual qualifier handling, mid-conversation override, session termination, audit log PII check |

**Testing philosophy:** tests are mechanical routing checks that verify specific harms cannot reappear.

**Decision ownership:** hard stops and regression failures block deployment automatically.

**Change control:** changes to safeguarding tests are logged and notified to maintain trustee visibility.

Test Scope

Safeguarding tests do not cover:

- Service quality assessment (SSN database responsibility)

- Individual eligibility determination (human/service decision)

- Legal advice accuracy (VA signposts, does not advise)

New safeguarding tests are triggered by: new vulnerable populations, new crisis pathways, regulatory changes, incidents, or trustee request.

Accountability and Review

The safeguarding framework is owned by Street Support Network.

- Review: at least annually, and after any safeguarding incident or material change

- Failures: treated as learning signals, not blame events

- Changes: any proposal to modify safeguarding logic triggers governance review

Summary

Safeguarding is embedded by design, not added as a feature. Hard-coded routes, AI boundaries, and rigorous testing ensure that vulnerable users are protected without relying on system intelligence or user navigation.

**These protections are non-negotiable.**

*Governance note \| v3.3 \| April 2026*
