> Source copy, converted 2 October 2026 from `GDPR_Implementation_Map_v1_0.docx` (sha256 2a3c81981ed48df20e1b9dc398432f7f2fec07d0dadd606cc7178c04739b00aa), supplied by the Managing Director. This Markdown file is the source under the repository's direction rule; the Word file was the only previous copy and is now a derived record. Content unchanged.

**Street Support Network Virtual Assistant**

**Implementation Note**

**GDPR Data Minimisation: Code Impact Map**

|                       |                                                                                                              |
|-----------------------|--------------------------------------------------------------------------------------------------------------|
| **Status**            | For review                                                                                                   |
| **Date**              | March 2026                                                                                                   |
| **Version**           | 1.0                                                                                                          |
| **Author**            | Matt Lambert                                                                                                 |
| **For**               | James Cross                                                                                                  |
| **Related documents** | Data Minimisation and Lawful Basis Note v1.0, Appropriate Policy Document v1.0, Quick Route Design Note v1.1 |

**Context**

While working through your PR \#7 feedback (immigration value mismatch, test coverage, dead code), we identified that the special category consent gate is not the right GDPR approach. The correct approach is data minimisation by design: don’t collect the data unless routing requires it.

This is exactly what the quick route architecture (items 32 + 33) already does. It determines the user’s support need first, then asks only the questions that pathway requires. That makes it the GDPR compliance architecture, not just a UX improvement.

The accompanying governance documents (Data Minimisation and Lawful Basis Note, Appropriate Policy Document) formalise the legal position. This document maps the governance position to specific code changes, so you can see exactly what needs to happen and where.

**PR \#7: Current Feedback Items + Consent Gate Removal**

These changes address your PR review feedback plus removal of the consent gate. Single PR.

|                                                                                                                    |                                            |                                          |
|--------------------------------------------------------------------------------------------------------------------|--------------------------------------------|------------------------------------------|
| **Change**                                                                                                         | **Driver**                                 | **Code location**                        |
| Remove SPECIAL_CATEGORY_CONSENT gate and all references                                                            | GDPR: over-collection anti-pattern         | stateMachine.ts, phrasebank.ts, types.ts |
| Remove dead B5_PROFILE_NRPF from GateType union and phrasebank                                                     | Dead code (your PR feedback)               | types.ts, phrasebank.ts                  |
| Fix immigration value mismatch: align immigrationMap values with serviceMatcher checks, or extract shared constant | Correctness (your PR feedback, blocking)   | stateMachine.ts, serviceMatcher.ts       |
| Fix immigration tests to verify publicFunds derivation, not just gate advancement                                  | Test coverage (your PR feedback, blocking) | safeguarding.test.ts                     |
| Add LGBTQ ‘Prefer not to say’ test (option 3 at B5_PROFILE_LGBTQ) verifying no infinite loop                       | Test coverage (your PR feedback)           | safeguarding.test.ts                     |
| Add LGBTQ ‘No’ test (option 2) verifying skip of LGBTQ_SPECIALIST_ASK                                              | Test coverage (your PR feedback)           | safeguarding.test.ts                     |

The consent gate removal is the GDPR-driven change. Everything else is from your review. They sit in the same PR because the consent gate touches the same files.

**Items 32 + 33: Gate Bug Fix + Quick Route**

This is the data minimisation architecture. Single PR, as scoped in Quick Route Design Note v1.1.

**Core Changes**

|                                                                                         |                                                                                  |                                             |
|-----------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|---------------------------------------------|
| **Change**                                                                              | **GDPR driver**                                                                  | **Code location**                           |
| Fix three === undefined checks to == null (lgbtq, publicFunds, hasChildren)             | Bug fix (enables the rest)                                                       | stateMachine.ts: routeToNextProfileQuestion |
| Add routeType field to Session interface (‘guided’, ‘quick’, ‘quick_then_guided’)       | Article 5(1)(c): audit trail for collection method                               | types.ts                                    |
| Route field declarations: config object defining which fields each B5 category requires | Article 5(1)(c): data minimisation mechanism. This is the load-bearing new code. | New file or section in stateMachine.ts      |
| Quick route gate with informed consent screen (user and supporter variants)             | Article 25: data protection by design                                            | stateMachine.ts, phrasebank.ts              |
| Quick-to-guided switch mechanism                                                        | User correction right                                                            | stateMachine.ts                             |
| Skipped fields stay null; routeType carries context (no sentinel strings)               | Type safety + GDPR                                                               | Routing logic throughout                    |

**Pathway-Specific Collection Rules**

These rules flow from the route field declarations. The declaration says what each pathway needs; the routing logic enforces it.

|                                                                                          |                                                                                |                            |
|------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------|----------------------------|
| **Rule**                                                                                 | **GDPR driver**                                                                | **Code location**          |
| Housing pathway asks convictions; non-housing pathways do not                            | Purpose limitation: convictions affect housing placement, not food bank access | routeToNextProfileQuestion |
| Health/mental health: guided route only                                                  | Article 5(1)(c): only collected when it changes output                         | routeToNextProfileQuestion |
| Sleeping situation / housed status: housing routes only                                  | Purpose limitation: determines pathway shape and StreetLink trigger            | routeToNextProfileQuestion |
| LGBTQ+: Housing, Health, DV, SA only. Not asked on Food, Work, Training, Advice, etc.    | Article 5(1)(c) + Article 9: not needed for routing on those pathways          | routeToNextProfileQuestion |
| Immigration: Housing only (and DV/SA where NRPF + children triggers Children’s Services) | Article 5(1)(c): immigration status is irrelevant to food, training, etc.      | routeToNextProfileQuestion |

**Tests**

Minimum test coverage for this PR:

- Gate fires on null (the three fixed fields)

- Quick route: user confirming no complicating factors skips all specialist fields

- Guided route: user confirming complicating factors is asked the full set

- Switch mid-session: quick-to-guided re-evaluates correctly

- Housing pathway asks convictions; Food pathway does not

- LGBTQ+ asked on Housing; not asked on Food

- routeType is set correctly for each path

**Verification Needed (May Already Be Correct)**

These are assumptions in the governance documents that need checking against the current codebase before or during implementation.

|                                                              |                                                                     |                                       |
|--------------------------------------------------------------|---------------------------------------------------------------------|---------------------------------------|
| **Check**                                                    | **Why it matters**                                                  | **Where to look**                     |
| Age category: no ‘prefer not to say’ option                  | Core mandatory field. System cannot route without it.               | phrasebank.ts: B5_PROFILE_AGE options |
| Gender: no skip on DV/SA pathways                            | Core field on safeguarding routes. Determines specialist provision. | crisis.ts, phrasebank.ts              |
| Location: no skip                                            | Core mandatory field. Determines LA-specific services.              | location.ts                           |
| LGBTQ+ ‘prefer not to say’ works on all pathways where asked | Explicit consent mechanism: declining must not exclude user         | profiling.ts, stateMachine.ts         |
| Health ‘prefer not to say’ works                             | Explicit consent mechanism: declining must not exclude user         | profiling.ts                          |

**Not Code Changes**

|                                                 |                                                                                      |                                 |
|-------------------------------------------------|--------------------------------------------------------------------------------------|---------------------------------|
| **Item**                                        | **What**                                                                             | **When**                        |
| Verify governance tables against implementation | Confirm routing table and Article 9 table in Data Minimisation note match built code | After items 32 + 33 merge       |
| Update Data Protection Policy                   | Remove WatsonX references, align with route-based model                              | Backlog item 16, lower priority |

**The Load-Bearing Design Decision**

The route field declarations are the single most important new piece of code. Everything else in the quick route implementation flows from this config: which questions get asked, which get skipped, what the tests verify, and what the governance tables document.

A reasonable shape for this might be a config object keyed by B5 category, with each entry declaring its required fields:

|                                        |                                                                                                |
|----------------------------------------|------------------------------------------------------------------------------------------------|
| **Category**                           | **Fields required (beyond core)**                                                              |
| Emergency Housing                      | homelessStatus, criminalConvictions, publicFunds (via immigration), hasChildren, lgbtq, health |
| Domestic abuse                         | hasChildren, lgbtq                                                                             |
| Sexual assault                         | lgbtq                                                                                          |
| Health                                 | lgbtq                                                                                          |
| Advice Services                        | subcategory                                                                                    |
| Financial Help                         | (none beyond core)                                                                             |
| Work                                   | (none beyond core)                                                                             |
| Training                               | (none beyond core)                                                                             |
| Food                                   | (none beyond core)                                                                             |
| Type A (Drop In, Personal Items, etc.) | (none beyond core)                                                                             |

Core fields (age, gender, LA) are always collected. The crisis gate is always run. This table governs what else gets asked. The implementation detail (where this config lives, how routeToNextProfileQuestion reads it) is yours to decide.

**Sequencing**

PR \#7 first (your current review feedback + consent gate removal). Then items 32 + 33 as a single PR (gate bug fix + quick route). The consent gate needs to come out before the quick route goes in, because the quick route replaces what the consent gate was trying to do.

*Implementation note │ Version 1.0 │ March 2026*
