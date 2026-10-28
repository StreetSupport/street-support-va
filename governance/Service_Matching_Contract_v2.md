> Source copy, converted 2 October 2026 from `Service_Matching_Contract_v2.docx` (sha256 3e93a51c53c06fcd4781e7fd4d552cbe6747e93b84c6385111183415e214cff4), supplied by the Managing Director. This Markdown file is the source under the repository's direction rule; the Word file was the only previous copy and is now a derived record. Content unchanged.

**Service Matching: Contract**

**Document type:** Governance Contract **Status:** Draft **Last updated:** March 2026

**Purpose**

This file defines how the Virtual Assistant matches user profiles to support services and determines what users are shown.

It specifies:

- the two-layer output architecture applied across all support categories

- the category typology governing what a national floor looks like for each category

- the LGBTQ+ modifier scope

- what exclusion rules apply

- what confidence thresholds govern decisions

- what is explicitly prohibited

- how edge cases are handled

This file exists to ensure service matching remains transparent, accountable, and aligned with Street Support Network values.

**Design Principles**

|                |                                                                                             |
|----------------|---------------------------------------------------------------------------------------------|
| **Principle**  | **Application**                                                                             |
| Transparency   | Users understand what is happening; no hidden inference                                     |
| Explainability | We can state why the system behaved as it did                                               |
| Robustness     | System behaves predictably; handles edge cases safely                                       |
| Privacy        | No data captured beyond stated scope; no profiling                                          |
| Fairness       | No assumptions; declined answers respected; no discrimination                               |
| No dead ends   | Every user leaves with at least one credible next step, even when local services are absent |

A service may only be definitively excluded where there is explicit, high-confidence evidence that the service cannot support the person.

Exclusion is an exception, not a default. When uncertain, include and rank lower.

The matcher does not infer characteristics. It acts only on information the user has chosen to provide.

Safeguarding pathways override the matcher entirely.

Any proposal to expand exclusion rules constitutes a governance change and requires explicit review.

**Scope**

This contract applies to:

- The service matching function within the Virtual Assistant

- Decisions about which services are shown or hidden

- The ordering of services presented to users

- The output architecture for each support category

This contract does not cover:

- Safeguarding routing (governed separately; bypasses matcher entirely)

- Data enrichment and confidence scoring (governed by Data Enrichment Contract)

- Analytics and logging (governed by Analytics Contract)

- Per-category floor content and local endpoint data (governed by Housing Pathway Endpoints Contract v1.0 and Non-Housing Pathway Endpoints Contract v1.0)

**Two-Layer Output Architecture**

All support categories use a consistent two-layer output structure:

|                                  |                                                                                                                                                                                                                                                                                                                         |
|----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Layer**                        | **Definition**                                                                                                                                                                                                                                                                                                          |
| **Layer 1: Minimum signposting** | A nationally verified contact, honest acknowledgement, or navigation entry point that is always shown for the category, regardless of local match results. For categories with no credible national resource, an honest acknowledgement of the gap is the minimum output — not a placeholder number.                    |
| **Layer 2: Dynamic matching**    | SSN service catalogue results for the category, filtered by the user’s local authority and eligibility profile. Surfaces local organisations automatically as the SSN database grows. Never hardcoded. A zero-match in this layer does not produce a zero-match experience if the minimum signposting layer is present. |

The minimum signposting layer is shown first. Dynamic results follow. This pattern applies across all 12 B5 support categories.

The housing pathway already follows this pattern and is not changed by this contract.

**Category Typology**

Categories are classified into three types based on whether a national resource meaningfully helps the user or creates false hope.

|          |                                                                                    |                                                                              |                                                                                                     |
|----------|------------------------------------------------------------------------------------|------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| **Type** | **Definition**                                                                     | **Categories**                                                               | **Minimum signposting**                                                                             |
| **A**    | Inherently physical — must be local. A national reference cannot fulfil the need.  | Food, Personal Items, Personal Services, Drop In, Activities, Communications | Honest acknowledgement. Zero-match signal to WMCA. No national number.                              |
| **B**    | Nationally navigable — a remote resource genuinely helps regardless of location.   | Health, Financial Help, Advice Services                                      | National floor always shown. Local dynamic results above it.                                        |
| **C**    | National navigation — a national entry point exists but resolution is still local. | Work / Employment, Training                                                  | National entry point framed as ‘will connect you to local support’. Local dynamic results above it. |

Type A honest acknowledgement is not a failure state. It is the honest, dignified response when physical support must be found locally. It is paired with a zero-match analytics signal that routes gap data to SSN and WMCA partnership reporting.

Per-category floor content is specified in the Non-Housing Pathway Endpoints Contract v1.0. This contract defines the typology; that contract defines the content.

**LGBTQ+ as a Cross-Cutting Modifier**

LGBTQ+ identity is collected as a profiling variable. It modifies service matching only where the nature of the need is materially affected by that identity. It does not modify service matching for categories where identity is irrelevant to what the service provides.

|                                                                              |                       |                                                                                                                                                                                                          |
|------------------------------------------------------------------------------|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Category / pathway**                                                       | **Modifier applies?** | **Rationale**                                                                                                                                                                                            |
| Housing                                                                      | **Yes**               | LGBTQ+ people face specific barriers including family rejection, hostile landlords, and unsafe tenancy situations. AKT and Stonewall Housing are hardcoded. Local specialist and dynamic matching apply. |
| Domestic violence                                                            | **Yes**               | Galop provides specialist LGBTQ+ DV support.                                                                                                                                                             |
| Sexual assault                                                               | **Yes**               | Galop and SurvivorsUK cover LGBTQ+ SA.                                                                                                                                                                   |
| Health                                                                       | **Yes**               | LGBTQ+ people face documented barriers accessing healthcare. LGBT Foundation (0345 3 30 30 30) surfaces alongside NHS 111 for LGBTQ+ users.                                                              |
| Food, Personal Items, Personal Services, Drop In, Activities, Communications | No                    | The nature of the need is not affected by identity. Applying the modifier here would complicate matching without benefit.                                                                                |
| Financial Help, Advice, Work, Training                                       | No                    | National resources (Turn2Us, Citizens Advice, Jobcentre Plus, National Careers Service) serve everyone without identity-specific barriers at the level of signposting.                                   |

**Hard Gate Exclusion Rules**

A closed list. Services may only be excluded under the following conditions.

Hard gate rules are the only matcher behaviours permitted to withhold services from view. All other logic operates solely on ordering.

**A. Age Incompatibility**

Exclude if:

- User age is below the minimum age explicitly stated by the service

- User age is above the maximum age explicitly stated by the service

Conditions:

- Service age limits must be explicit (e.g. ‘18–25’, ‘over 65 only’)

- Inferred or implied age groups do not qualify

- Confidence must be HIGH

**B. Explicit Gender Restriction**

Exclude if:

- Service is explicitly ‘women only’ AND user has explicitly stated male

- Service is explicitly ‘men only’ AND user has explicitly stated female

Conditions:

- User must have chosen to answer the gender question

- Service restriction must be explicit, not implied

- Confidence must be HIGH

Governance boundaries:

- ‘Prefer not to say’ — never exclude

- Non-binary or inclusive phrasing — never exclude

- Gendered focus does not equal gendered restriction

**C. Jurisdictional Incompatibility**

Exclude if the service is legally or operationally restricted to a jurisdiction the user is not in.

Conditions:

- Jurisdiction rule must be explicit in service data

- Used sparingly

- Confidence must be HIGH

**D. Explicit Access Barriers**

Exclude if the user has explicitly confirmed a barrier and the service explicitly states it cannot support people with that barrier.

Conditions:

- Both user answer and service data must be explicit

- Confidence must be HIGH

- If unclear on either side — do not exclude

**E. Safeguarding Override**

Safeguarding pathways bypass the matcher entirely. When a safeguarding route is triggered, the matcher does not run. This is not an exclusion; it is a complete bypass.

**Confidence Thresholds**

|                      |                                         |
|----------------------|-----------------------------------------|
| **Confidence level** | **Permitted use**                       |
| HIGH                 | May be used for hard-gate exclusion     |
| MEDIUM               | May influence ranking; must not exclude |
| LOW                  | Ignored for eligibility decisions       |

Only HIGH confidence service data may be used for definitive exclusion.

**Explicit Exclusions (What Must Not Exclude)**

A service must not be excluded solely because of:

- LOW or MEDIUM confidence data

- ‘Unclear’ eligibility fields

- User selecting ‘prefer not to say’

- Lack of information on either side

- Perceived relevance or ‘fit’

- Ranking score

- Optimisation or performance goals

This list protects against inference and scope creep.

**Ranking Layer**

Services that pass hard gates are ordered, not filtered.

Ranking may consider:

- Match to stated support need

- Match to location (local authority)

- Self-referral availability

- Specialism flags (e.g. DV, mental health, LGBTQ+)

- Accessibility factors (e.g. no ID required)

Ranking does not exclude. A low-ranked service is still shown.

Parked for future specification: relative weighting of ranking factors, output limits, display ordering rules.

**Zero-Match Handling**

If no services pass the hard gates:

- User receives the minimum signposting for that category (Layer 1)

- Type A categories receive honest acknowledgement plus SSN browse link

- Type B categories receive national floor contact

- Type C categories receive national entry point contact

- A zero-match analytics signal is logged per category and local authority

A zero-match in Layer 2 is a valid system outcome, not an error. The minimum signposting layer ensures no user leaves without somewhere to turn.

**User Declined Answers**

When a user selects ‘prefer not to say’ for any field:

- That field is treated as unknown

- No exclusion may be based on that field

- Services are filtered only on fields the user has chosen to answer

- Ranking may be broader (more services shown, less targeted ordering)

**Accountability**

- No human review exists in the matching loop

- The system must stand on its own

- All exclusion decisions are traceable to explicit rules and explicit data

- If a service is excluded, the reason can be stated

- The two-layer architecture and category typology are non-negotiable; changes require governance review

**Governance**

This contract:

- Must not be overridden by convenience or optimisation goals

- Takes precedence over ‘helpful’ filtering

- Must be reviewed if exclusion rules are proposed to change or expand

- Must be reviewed if the category typology or LGBTQ+ modifier scope is proposed to change

Review triggers:

- Any proposal to add a new exclusion rule (expanding system authority)

- Any proposal to change the two-layer architecture

- Any proposal to change category typology classifications

- Any proposal to expand or restrict the LGBTQ+ modifier scope

- Material change to the Non-Housing Pathway Endpoints Contract

Material changes to service matching logic require explicit trustee review.

**Document History**

|             |               |                                                                                                                                                                                               |
|-------------|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Version** | **Date**      | **Change**                                                                                                                                                                                    |
| 1.0         | February 2026 | Initial contract.                                                                                                                                                                             |
| 2.0         | March 2026    | Incorporated two-layer output architecture, category typology (Type A/B/C), and LGBTQ+ modifier scope from ADR-001 v1.1. ADR-001 retired as a working document. Zero-match handling expanded. |

**Status: Draft**

Approved by: \[Pending\]

Date: \[Pending\]

*Governance contract │ Version 2.0 │ March 2026*
