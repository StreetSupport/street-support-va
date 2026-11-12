# Service Matching: Contract

**Document type:** Governance contract
**Version:** 3.0, draft for trustee ratification
**Date:** 11 November 2026
**Replaces:** Service Matching Contract v2.0 (March 2026, Draft, approval pending), read from the VA repository's `staging` branch, last changed in commit `6851f79`

**Sources.** Every rule below traces to one of these, or is marked *Proposed*:
- v2.0: rules carried forward from the contract this replaces.
- Part 3: Part 3 of *The virtual assistant: design and service matching* (1 November 2026, VA #34).
- MD, 1 November 2026: the Managing Director's service matching decisions.
- MD, 11 November 2026: the Managing Director's decisions on declined answers, the quick route and group services.

---

## 1. Purpose

The matcher finds services that are a good fit for the person. It works from what the person has said and what services say about who they serve. It shows a few, tailored to the person, in addition to the statutory routes and fixed contacts. The rest stay available. Matching is fit for purpose, not perfect. (Part 3, 3.1; MD, 1 November 2026)

The aim is a good fit, not the best fit. Every service shown should be tailored enough to be a sound recommendation. (MD, 1 November 2026)

This contract exists so that matching stays transparent, accountable and aligned with Street Support Network's values. (v2.0)

## 2. Scope

This contract applies to:
- the service matching function within the Virtual Assistant;
- which services are excluded, selected or left available;
- the order in which selected services are presented;
- the output structure for each support category. (v2.0, restated for three outcomes)

It does not cover:
- **Safeguarding routing.** It is governed separately and bypasses the matcher entirely (v2.0). This includes the crisis exits for domestic abuse and sexual assault.
- **Data enrichment.** It is governed by the Data Enrichment Contract. (v2.0)
- **Analytics and logging.** These are governed by the Analytics Contract. (v2.0)
- **Floor content and local endpoint data.** These are governed by the Housing Pathway Endpoints Contract and the Non-Housing Pathway Endpoints Contract. (v2.0)

## 3. Design principles

These are carried from v2.0, with fairness restated.

| Principle | Application |
|---|---|
| Transparency | People understand what is happening. There is no hidden inference |
| Explainability | We can state why the system behaved as it did |
| Robustness | The system behaves predictably and handles edge cases safely |
| Privacy | No data is captured beyond the stated scope. There is no profiling |
| Fairness | No assumptions about the person. What the person chooses not to say is respected as their choice (section 6). The same rules apply to every service |
| No dead ends | Everyone leaves with at least one credible next step, even when local services are absent |

**No inference.** The matcher does not infer characteristics. It acts only on information the person has chosen to provide. (v2.0)

**Neutrality.** The same rules apply to every service, and no judgement is made of organisations. (Part 3, objective O5, citing the Neutrality Principle Note)

## 4. Three outcomes

Every eligible service has one of three outcomes. (Part 3, 3.2)

| Outcome | Meaning | Where the person finds it |
|---|---|---|
| **Excluded** | The service has said it cannot serve someone in the person's stated situation (section 5) | Nowhere in the VA's results. It stays on the platform |
| **Selected** | Among the services shown on the VA's cards (section 7) | On the VA's cards |
| **Available** | Eligible, but not selected | Through "See all on Street Support" |

**Selection is not exclusion.** The rules against hiding services apply to exclusion. (Part 3, 3.2)

A service that is not selected is not hidden. It stays one tap away. (Part 3, objective O7; MD, 1 November 2026)

## 5. Exclusion: applying a service's stated criteria

The VA applies a service's own stated eligibility. (Part 3, objective O4, citing PLATFORM-STATES-VA-GATES)

**A service is excluded only where all three hold:**
1. an established hard gate applies, and the service states the restriction in terms;
2. the person has answered the matching question;
3. the answer clearly falls outside the restriction. (Part 3, 3.3)

**The hard gates** are a closed list. Only they may exclude. (v2.0)

- **A. Age.** The person's age is below a minimum, or above a maximum, the service states explicitly. Inferred or implied age groups do not qualify. (v2.0)
- **B. Gender.** The service is explicitly women only and the person has said male, or explicitly men only and the person has said female. Gendered focus is not a gendered restriction. (v2.0)
- **C. Jurisdiction.** The service is legally or operationally restricted to a jurisdiction the person is not in. The rule must be explicit in service data, and is used sparingly. (v2.0)
- **D. Access barriers.** The person has confirmed a barrier, and the service states it cannot support people with that barrier. If either side is unclear, nothing is excluded. (v2.0)

**Where restrictions come from:**
- **In the West Midlands:** from population tags and a reviewed record of restrictions and age ranges, produced before launch. Each entry rests on a quotation from the service's own text and is checked by a named person. (MD, 11 November 2026)
- **Elsewhere:** only a statement in terms in the listing text, under an established hard gate, counts. (MD, 11 November 2026; Part 3, 3.3)
- "Women only" and "open only to" are statements in terms. "Especially", "mainly" and "designed for" never exclude. A focus tag never excludes. (Part 3, 3.3)
- A restriction applies only where it covers the whole service. In a combined V4 record, a restriction in one section does not exclude the record. Different provision is its own listing (DELIVERY-NOT-A-SERVICE). (Part 3, section 4)

**What counts as a restriction** (MD, 11 November 2026, from the West Midlands reading pass). A service's stated relationship to a group is one of four kinds. Its own words decide which:

| Kind | Example | Effect |
|---|---|---|
| **Only for** | "rough sleepers only", "women only" | Selected only where the person has said it applies. Excluded where a hard gate applies and the person's answer falls outside it |
| **Designed for** | A housing service for LGBTQ+ young people | Selected only where the person has said the group is relevant (section 6). Never excluded: it stays available |
| **Welcomes or focus** | "Any vulnerable adult (18+) can apply", in a service tagged Women | No limiting effect. Lifted where the person has said the group is relevant |
| **Accepts** | People with dogs | Lifted for someone who has said it applies. Never held back from anyone else |

A population tag alone does not say which kind applies. The reviewed record does, from the service's own text.

**Conditions outside the population tags** (MD, 11 November 2026):
- Conditions such as "rough sleepers only", one landlord's tenants, people on means-tested benefits and pensioners are held in the reviewed restriction record, not as new population tags. Each also has a "How to get it" line.
- They follow the same selection rule. A service with a condition is selected only where the person has said they meet it. Where the VA does not ask about a condition, the service is not selected, and stays available with its condition shown.
- An either-or condition ("over 25, or families with children") is held as either-or. It is never split into separate gates.
- Where a condition differs by location, it is held for each location.
- **A condition recorded outside the established hard gates may affect selection, but does not create a new ground for exclusion.** The hard gates in this section stay a closed list.
- **A condition that cannot be represented reliably is not applied.** Its wording is shown in "How to get it", and it is listed for review. It is never simplified into a different rule.
- An implied age ("adults", "by the age of 18") is not a stated age and is not applied.

**Confidence.** Only explicit, stated service data may exclude. Anything weaker excludes nothing. (v2.0, simplified as Part 3 section 2 proposed: problem 9)

**Must not exclude.** A service must not be excluded solely because of:
- unclear or implied eligibility;
- a lack of information on the service's side;
- ranking or rotation order;
- optimisation or performance goals. (v2.0)

*Removed from v2.0's list:* "perceived relevance or fit". Under a five-result limit, that line forbade selection itself (Part 3, section 2, problem 4). Relevance now governs selection (section 7), never exclusion.

## 6. What the person chooses not to say

**The rule** (MD, 11 November 2026):
- Where the person prefers not to say, or is not asked, the answer is **treated as not stated**. The VA assumes nothing, and services that depend on that answer are not selected. The decision, in the Managing Director's words: "If they prefer not to say then for the time being we have to equate that to being a no. That is their choice." The wording keeps to the Safeguarding Contract's Invariant 3: "'Prefer not to say' is not 'No'" (wording confirmed, Managing Director, 11 November 2026).
- This applies question by question on the full route, and to every population tag.

**What it means:**
- **A declined or unasked answer never excludes.** A service restricted to a group is not selected for someone who has not said the group is relevant. It stays available through "See all on Street Support".
- **Gender not given:** services restricted to a gender are not selected.
- **Age not given:** services restricted by age are not selected.
- **A group question not answered:** services designed for that group are not selected.

**Sensitive questions** ask whether something is relevant to the person, not for the person to state their identity. LGBTQ+ is the example. (MD, 11 November 2026)

**A population question is asked** only where the person's area and need include services tagged for that group. (Part 3, 3.8)

**The trade-off, stated plainly.** Under this rule, some services will never appear among the five for a person they could help, because the person did not say, or was not asked, the thing that would select them. They remain available through "See all on Street Support", with their conditions shown. This is a deliberate trade-off for tailored results, not an error to correct.

**Change from v2.0:** v2.0 said a declined answer widens results ("Ranking may be broader (more services shown…)") and that "prefer not to say" never excludes. A declined answer still never excludes. But it no longer widens the results: it is treated as not stated, so services that depend on it are not selected. This is a deliberate change of position (MD, 11 November 2026).

## 7. Selection: choosing what is shown

The matching design (MD, 1 November 2026; Part 3, 3.5):
1. Services for the person's need and the specific kind of help, in their area.
2. Leave out only those excluded under section 5.
3. Leave out services for a group the person has not said is relevant to them (section 6).
4. One service per organisation.
5. Five or fewer left: show them all.
6. More than five: services designed for someone in the person's situation go first. The rest fill the remaining places in a rotating order, so no organisation always comes first.
7. "See all on Street Support" follows the cards.

Step 3 carries the Managing Director's decision of 11 November 2026: a service designed for a group is selected only where the person has expressly said the group is relevant to them.

**No points and no weights.** A population tag lifts a service to the front only for someone who has said the group is relevant. An empty appointment or telephone box is not evidence of anything and does not affect selection. (Part 3, 3.5)

**At most five service results,** in addition to the statutory routes and fixed contacts. (MD, 1 November 2026)

**The person's own instruction.** Leaving out the organisation the person says already supports them is not an eligibility gate. The card can say so. (Part 3, 3.6)

## 8. The quick route

The quick route assumes nothing about the person that is likely to reduce their options. It surfaces services that are open access and not restricted. (MD, 11 November 2026)

**In practice:**
- No question on the quick route is answered, so every answer is treated as not stated (section 6). Services restricted to a group are not selected.
- Services designed for a group are not selected.
- They stay available through "See all on Street Support".

**The wording people see changes too.** The VA now tells people that the quicker route "will assume the answers are 'no' or 'none'", which is not the same as "not stated". *Proposed:* it tells them instead that the VA won't assume anything they haven't said. So services that depend on something they haven't said won't be among the five, and everything stays available on Street Support.

## 9. Output structure

**Two layers** (v2.0):

| Layer | Definition |
|---|---|
| **Layer 1: minimum signposting** | A nationally verified contact, honest acknowledgement or navigation entry point, always shown for the category, whatever the local results. Where no credible national resource exists, an honest acknowledgement of the gap is the minimum output, not a placeholder number |
| **Layer 2: matched services** | Platform results for the category, in the person's area, selected under section 7. Never hard-coded |

The minimum signposting layer is shown first, and matched services follow. A zero match in Layer 2 does not produce a zero-match experience when Layer 1 is present. (v2.0)

**Fixed contacts for a group** appear only where the person has said the group is relevant. This includes the national LGBTQ+ contacts in housing, domestic abuse, sexual assault and health. (MD, 11 November 2026; v2.0 for the contacts themselves)

**Minimum signposting is set parent by parent** (MD, 11 November 2026). Each V4 parent has its own minimum signposting and zero-match response: national numbers, floors and fallbacks, drawn from that parent's crib. The specifics are set in the Non-Housing Pathway Endpoints Contract v2.0, which re-cuts them by V4 parent (section 13, point 3). Every national contact is confirmed at its primary source before use.

**LGBTQ+.** The v2.0 modifier, which applied only in housing, domestic abuse, sexual assault and health, is replaced. LGBTQ+ becomes one population tag among the rest, under the same rules. (Part 3, 3.7) The fixed national LGBTQ+ contacts stay, under the condition above.

## 10. Zero-match handling

This is carried from v2.0. If no service is selected:
- the person receives the minimum signposting for the category (Layer 1);
- the parent's own zero-match response applies, as set in the Non-Housing Pathway Endpoints Contract (an honest acknowledgement and a link to browse Street Support, a national floor, or a national entry point);
- a zero-match signal is logged by category and local authority.

A zero match in Layer 2 is a valid outcome, not an error. (v2.0)

"See all on Street Support" also applies where services are available but none is selected. (Part 3, section 4, which names the see-all link as a launch condition)

## 11. Trans and non-binary answers

This is parked (MD, 11 November 2026). Until it is decided, trans and non-binary answers exclude nothing, as now.

Services set their own criteria for who they can support. SSN's mitigation is wording, not matching: a neutral statement that services set their own criteria and that every option stays on Street Support. (MD, 11 November 2026)

## 12. Safeguarding

Safeguarding pathways bypass the matcher entirely. When a safeguarding route is triggered, the matcher does not run. This is a bypass, not an exclusion. (v2.0)

The crisis exits for domestic abuse and sexual assault therefore sit outside this contract. One finding about them is recorded as an open point (section 13, point 1).

## 13. Open points

1. **Crisis exits for declined gender.** Settled in the Safeguarding Contract v3.3, which governs these routes (Managing Director, 11 November 2026). A declined or missing answer is not treated as LGBTQ+. Where gender is not given, the domestic abuse and sexual assault routes show a general exit, open to everyone: 999 first, the local domestic abuse organisation, and every national line with a note of who it is for and when it is open. Today such an answer goes to the LGBTQ+ exit (`lib/handlers/crisis.ts`, staging `ee27535`), so the code changes under that contract's release conditions.
2. **A structured restriction flag and age range on the platform.** Whether to add them, and when, is open (Part 3, section 6, decision 3). Until then, the West Midlands record and listing text serve.
3. **The Non-Housing Pathway Endpoints Contract by V4 parent.** It is written over the old support categories, as Types A, B and C. A re-cut by V4 parent (v2.0) is drafted for ratification alongside this contract, with its contacts desk-checked at source on 11 November 2026 (MD, 11 November 2026).
4. **Council routes and either-or conditions.** The Housing Pathway Endpoints Contract shows the council's Housing Options contact for every housing query. So for a council route such as Birmingham Housing Solutions ("over 25, or families with children"), the either-or condition matters only where the council's service is also matched as a listing. This was checked against the Housing Pathway Endpoints Contract v1.0 (staging).
5. **Completion and the "Get in touch" button.** These are recorded in Part 3, section 1.3 as proposed for the design note. They are not matching rules and are left to the Analytics Contract amendment.
6. **Trans and non-binary answers.** Parked (section 11).

## 14. Failure modes and edge cases

| Risk | Effect | Guard |
|---|---|---|
| A restriction read wrongly from text | A service is excluded from people it could serve | Only a statement in terms, under a hard gate, with a clear answer. Anything weaker excludes nothing (Part 3) |
| A restriction missed | A service is selected for someone it cannot serve | The reviewed West Midlands record. Elsewhere, until each area's audit, the risk remains |
| A tag or record goes stale | As either row above | The text fingerprint flags changed listings for review |
| Thin results when answers are not stated | Fewer than five shown, occasionally none, on the quick route or after declined answers | Layer 1 always shows. "See all" carries everything available. Test area by area |
| A person declines and misses a service meant for them | It is not among the five | Their choice (MD, 11 November 2026). It stays available |
| Questions asked only to unlock services | More questions, against asking only what is needed | Ask a group question only where tagged services exist (Part 3, 3.8) |
| A restriction on part of a service | A mixed service is wrongly excluded | A restriction applies only to the whole service (Part 3) |
| See-all cannot carry the area | "Available" is not genuinely reachable | A launch condition (Part 3, plan I9) |
| Neutrality | SSN appears to decide who is eligible | Only the provider's stated criteria are applied. The same rule applies to every service. Rotation means no organisation always comes first (Part 3) |

## 15. Accountability and governance

Carried from v2.0:
- There is no human review in the matching loop. The system must stand on its own.
- Every exclusion traces to an explicit rule and explicit data, and the reason can be stated.
- This contract must not be overridden by convenience or optimisation goals.

**Changes requiring trustee review** (v2.0, restated):
- any new exclusion rule or hard gate;
- any change to the three outcomes, the two layers, the four kinds of restriction or the parent-by-parent minimum signposting;
- any change to the rule on declined and unasked answers (section 6);
- a material change to the Non-Housing Pathway Endpoints Contract;
- any material change to matching logic.

## 16. Change log against v2.0

| Area | v2.0 | v3.0 | Source |
|---|---|---|---|
| Purpose | Defined how matching works, not what it is for | States what matching is for | Part 3, 3.1 |
| Outcomes | Two: shown or hidden | Three: excluded, selected, available | Part 3, 3.2 |
| Output limit | Parked | Five at most, plus "See all on Street Support" | MD, 1 Nov |
| Ranking | Ranking factors; "a low-ranked service is still shown" | Selection steps, with no points or weights and a rotating order | MD, 1 Nov; Part 3, 3.5 |
| "Perceived relevance or fit" | Must not exclude, which read literally forbade a limit | Governs selection, never exclusion | Part 3, problem 4 |
| Declined answers | Widen the results; never exclude | Still never exclude; treated as not stated, so dependent services are not selected | MD, 11 Nov |
| Quick route | Not addressed | Open-access, unrestricted services | MD, 11 Nov |
| Group services | LGBTQ+ ranking only | Selected only where the person has said the group is relevant | MD, 11 Nov |
| LGBTQ+ | A modifier in four categories | One population tag; fixed contacts only where said relevant | Part 3, 3.7; MD, 11 Nov |
| Hard gates | Age, gender, jurisdiction, access | The same. A population gate was proposed and withdrawn: the selection rule covers it | MD, 11 Nov |
| Restrictions | One kind | Four kinds: only for, designed for, welcomes or focus, accepts | MD, 11 Nov |
| Conditions outside tags | Not addressed | A reviewed record; either-or kept; per location; unreliable conditions not applied | MD, 11 Nov |
| Category typology | Types A, B and C | Minimum signposting set parent by parent | MD, 11 Nov |
| Confidence | High, medium, low | Explicit, stated data only | Part 3, problem 9 |
| Trans and non-binary answers | Never exclude | Parked; exclude nothing until decided | MD, 11 Nov |

---

**Status:** Draft for trustee ratification
**Approved by:** [Pending]
**Date:** [Pending]
