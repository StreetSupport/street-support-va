> Source copy, converted 2 October 2026 from `Quick_Route_Design_Note_v1_1_updated.docx` (sha256 fb18d3ac001831f8f43ef3baa24e7a42c46f7a35cda20a467fd3940a0278953d), supplied by the Managing Director. This Markdown file is the source under the repository's direction rule; the Word file was the only previous copy and is now a derived record. Content unchanged.

**Street Support Network Virtual Assistant**

**Design Note**

**Quick Route and Gate Bug Fix**

|                       |                                                                                                                |
|-----------------------|----------------------------------------------------------------------------------------------------------------|
| **Status**            | Proposal                                                                                                       |
| **Date**              | 13 March 2026                                                                                                  |
| **Version**           | 1.1                                                                                                            |
| **Author**            | Matt Lambert                                                                                                   |
| **Review required**   | James Cross                                                                                                    |
| **Related documents** | Data Minimisation and Lawful Basis Note v1.0, Appropriate Policy Document v1.0, Service Matching Contract v2.0 |

The Bug

You flagged in your PR \#6 review that routeToNextProfileQuestion uses === undefined checks where createSession initialises to null. We confirmed the scope: exactly three fields affected (lgbtq, publicFunds, hasChildren). The other three gates (ageCategory, gender, criminalConvictions) use falsy checks and work correctly.

This means the LGBTQ+, NRPF and children profiling questions have never fired. Fixing them is three lines of code. But switching them on means every user hits three new questions that most users will answer "no" to.

The Missing Pattern

The previous WatsonX build included a quick route that we lost in the migration. Before detailed profiling, users were shown a list of circumstances and asked whether any applied:

- significant health or mental health concerns

- immigration status is not straightforward

- pregnant or have children

- identify as LGBTQ+

- have previous convictions

- young person (16-20) previously looked after by social services

If none applied, the user chose the quicker route and went straight to core profiling. If any applied, they chose the guided route and answered the full question set. The system exists to handle multiple disadvantage well, but the majority of users have no complicating factors and should not be penalised for that.

Proposal

Fix the gate bug and reinstate the quick route in the same PR, so that users are never asked questions without being offered the choice to skip them.

Quick route

After the crisis gate clears and location is established, users are shown the informed consent screen with the list above. If they confirm none apply, they answer only: age, gender, support need, and homeless/housed status (housing pathway only). This produces a functional output: Housing Options, Shelter helpline, navigator orgs, SSN catalogue results, national floors.

If they confirm any do apply, they proceed through the full guided route as currently built.

The crisis gate is never skipped regardless of route.

Boundary fields

Some fields need path-specific treatment rather than a blanket quick/guided split:

- Criminal convictions: asked on housing pathways only. A conviction that affects housing placement is common; one that affects food bank access is not.

- Sleeping situation / housed situation: core on housing routes (determines pathway shape and StreetLink trigger), not asked for non-housing.

- Health / mental health: guided route only. These currently improve matching quality but do not open distinct pathways. Reclassify if specialist health endpoints are introduced.

Governance Reasoning

This is not a compromise on data quality or user protection. It is alignment with our data governance position.

If a question is not relevant to someone's routing pathway, we have no governance basis for asking it. Asking it to complete a dataset is data collection that serves analytical interests, not the person's needs. Our governing principles are clear: we act on what is confirmed (Principle 5), controls are proportionate to harm (Principle 2), and privacy protections serve people, not organisational convenience (Principle 8).

This principle applies to routing questions: questions whose answers determine which services and pathways are shown to the user. A small number of operational intelligence questions (access context, return status, outcome action) serve a separate purpose: ensuring the service is accessible, measuring reach, and tracking whether the VA leads to meaningful contact with services. These have their own governance basis documented in the Data Minimisation and Lawful Basis Note v1.1, and are governed by the Analytics Contract (Amendment 2). They do not affect the user's pathway and are clearly framed as optional.

The informed consent screen is doing critical work. The user reads the list of circumstances. They confirm none apply. That is user-confirmed information provided through an explicit, informed choice. It is not inference. The system told them what would be assumed, and they agreed.

This architecture also implements GDPR data minimisation by design (Article 5(1)(c) and Article 25). The formal lawful basis position, including the Article 9 conditions for special category data, is documented separately in the Data Minimisation and Lawful Basis Note v1.0 and the accompanying Appropriate Policy Document v1.0.

Session State and Data

Three session-level additions:

- routeType: 'guided', 'quick', or 'quick_then_guided' (for users who switch mid-session)

- Skipped boolean fields (lgbtq, hasChildren) remain null. String fields (publicFunds, criminalConvictions) remain null. Boolean fields stay boolean: no sentinel strings. The routeType field carries the collection context, so downstream logic can distinguish ‘user chose quick route and confirmed no complicating factors’ from ‘question was never asked’.

- Routing logic treats null specialist fields as non-triggering for specialist pathways. Where routeType is ‘quick’, a null value means the user confirmed the circumstance does not apply. Where routeType is ‘guided’, a null value means the question has not yet been reached.

For reporting purposes, quick route users who confirmed no complicating factors are treated equivalently to guided route users who answered "no" to each individual question. The routeType field makes this distinction explicit and auditable. Any report on Tier 2 fields should note the methodology.

Mid-Session Correction

Users who chose the quick route must be able to switch to the guided route if they realise a complicating factor does apply. The informed consent screen should include language like "you can switch to the guided route at any time."

When a user indicates a correction, the system re-evaluates at the point of change: what endpoint modifications result from the new answer, and what additional questions need to be asked to complete routing for the relevant pathway. This is forward re-evaluation, not rollback. The corrected session variable overwrites the previous value.

Future Considerations (Not in Scope for This PR)

Two related design questions have been identified during this work. They do not block this proposal but the implementation should not close them off:

- Progressive data capture: writing session variables as they are confirmed rather than only at session end. This would enable dropoff analysis, incomplete session data, and cleaner mid-session correction. Requires scoping.

- General session variable correction: allowing users to go back and change any answer, with forward re-evaluation of routing implications. Broader than the quick route switch and architecturally more complex.

The session state model proposed here (routeType, null-with-context, variable-level values) is designed to support both of these if they are built later.

Implementation

Single PR combining:

- Gate bug fix (three === undefined checks changed to == null)

- Quick route gate with informed consent screen (user and supporter variants)

- routeType session field

- Quick-to-guided switch mechanism

- Phrasebank entries for informed consent screen and switch prompt

- Tests: gate fires on null, quick route skips Tier 2 questions, guided route asks them, switch mid-session re-evaluates correctly

*Design note \| March 2026*
