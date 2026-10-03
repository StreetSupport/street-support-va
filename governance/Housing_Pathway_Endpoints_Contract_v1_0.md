> Source copy, converted 2 October 2026 from `Housing_Pathway_Endpoints_Contract_v1.0.docx` (sha256 74b669405e472844e683df8ed7da7cc3d54755a70f051dc9fc94e3fb0d393d07), supplied by the Managing Director. This Markdown file is the source under the repository's direction rule; the Word file was the only previous copy and is now a derived record. Content unchanged.

**Housing Pathway Endpoints: Contract**

Document type: Governance Contract

Status: Draft – Pending trustee review

Version: 1.0 │ Last updated: February 2026

**Purpose**

This contract defines how the Virtual Assistant routes people who are experiencing or at risk of homelessness, specifying the endpoints surfaced for each identified circumstance, the national organisations hardcoded into the system, and the conditions under which each pathway is triggered.

It specifies:

- which housing pathways exist and what triggers each

- which organisations are hardcoded and cannot be substituted by service matching

- what the VA is and is not permitted to do within each pathway

- the escalation safety net that ensures no housing query ends without a next step

- what requires governance review if it changes

This contract governs the housing-pathway-endpoints.json file and all housing routing logic in the VA codebase. It is the authoritative reference for anyone building, auditing, or reviewing housing pathway code.

**Design Principles**

|                              |                                                                                                                                                                                                                        |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Principle**                | **Application**                                                                                                                                                                                                        |
| Connector, not assessor      | The VA profiles circumstances and connects to appropriate organisations. It does not assess eligibility, confirm that criteria are met, or state what any organisation or council must do. It identifies and connects. |
| No dead ends                 | Housing is the one category where the system must always have somewhere to point someone. Every housing pathway ends with at least one actionable next step. The Shelter helpline is the unconditional floor.          |
| Hardcoded where specialist   | Certain circumstances require specific national organisations that cannot be reliably discovered through service matching. These are named in this contract and hardcoded into the system.                             |
| Circumstance, not inference  | Pathways are triggered only by circumstances the user has confirmed. The VA does not infer crisis, vulnerability, or eligibility from conversational signals.                                                          |
| Age-differentiated messaging | Where legal entitlements differ by age, the VA’s language reflects the appropriate level of entitlement for that age group. It does not overstate what a person is owed.                                               |
| Dignity in every exit        | Every pathway endpoint must feel like a forward step, not a rejection. Language is warm, practical, and leaves the door open.                                                                                          |

**Scope**

This contract applies to:

- All housing and emergency accommodation routing within the Virtual Assistant

- The housing-pathway-endpoints.json data file

- All hardcoded national organisation references within housing pathways

- Age-based routing within the housing pathway

This contract does not cover:

- Service matching logic for the general service catalogue (governed by Service Matching Contract)

- Analytics and logging (governed by Analytics Contract)

- Data enrichment and confidence scoring (governed by Data Enrichment Contract)

- Crisis gate and safeguarding exits (governed by Safeguarding Contract) — those pathways bypass this contract entirely

- Non-housing support needs (food, health, work, training etc.)

**Foundational Constraint: The Safety Net**

Every housing pathway must include, at minimum:

- The relevant council Housing Options contact (always, for all housing queries)

- The Shelter helpline as the final fallback (always, unconditionally)

These two elements are the floor. Additional pathway-specific endpoints are layered above them. No pathway may omit either.

Housing Options is a statutory gateway. The VA surfaces it as a first step for everyone, not because it will help everyone, but because it is every person’s right to approach it. For users where Housing Options cannot help (for example, due to NRPF status), subsequent pathway layers address this.

The Shelter helpline (England) is included at every housing pathway output. It is not reserved for zero-match scenarios. It is always present.

**Housing Pathway Map**

The following pathways are defined. Each has a trigger condition, a set of required endpoints, and any national organisations that must be hardcoded.

**Standard Housing Pathway**

Trigger: user selects housing/accommodation as their support need, and no specific circumstance triggers a specialist pathway.

Required endpoints:

- Council Housing Options contact (LA-specific, from housing-pathway-endpoints.json)

- Housing navigator organisation where one exists for the LA (from housing-pathway-endpoints.json)

- SSN service catalogue matching results

- Shelter helpline

If no navigator organisation exists for the LA, this is documented as a system gap in housing-pathway-endpoints.json and shared with the local partnership. The pathway continues with the remaining endpoints.

**Rough Sleeping / Sofa Surfing**

Trigger: user confirms they are sleeping rough, in a tent, or sofa surfing without a stable arrangement.

Required endpoints:

- StreetLink alert offered (national, hardcoded): allows user to alert a local outreach team to their location

- Standard housing pathway endpoints as above

StreetLink is offered, not required. The user is told what it does and given the option. It does not replace other endpoints.

**Fire or Flood Displacement**

Trigger: user confirms they have lost accommodation due to fire, flood, or equivalent disaster.

Required endpoints:

- Council Housing Options contact (LA-specific) — signposted as the immediate route for emergency rehousing

- Shelter helpline

Note: This pathway is distinct from arson conviction (see below). Fire/flood is an event that happened to the person. Arson is a complicating factor in the person’s history that affects which organisations can help them.

**Under 16**

Trigger: user confirms they are under 16. \[Note: this pathway is also governed by the Safeguarding Contract, which takes precedence.\]

Required endpoints:

- Children’s Services contact (LA-specific, from housing-pathway-endpoints.json)

- Childline: 0800 1111 (national, hardcoded)

The VA does not provide housing advice to under-16s. It connects them to the appropriate services and exits the housing pathway.

**16 and 17 Year Olds**

Trigger: user confirms they are 16 or 17.

Two sub-pathways depending on social services involvement:

**16–17, not currently involved with social services**

Required endpoints:

- Social services (Children’s Services) recommended as first step — the VA surfaces this as the appropriate primary route without stating what social services must do

- Housing navigator organisation (e.g. St Basil’s) surfaced alongside as additional option

- Council Housing Options contact

- Shelter helpline

The VA signposts the Shelter legal page on 16–17 year olds and housing rights for users who want further information. It does not explain the legal position itself.

**16–17, currently involved with social services**

Required endpoints:

- Housing navigator organisation (e.g. St Basil’s)

- Council Housing Options contact

- Shelter helpline

Social services is not surfaced as a recommendation because the user is already engaged with them and is seeking additional support beyond what social services is providing.

**Care Leavers: 18–20**

Trigger: user confirms they are 18, 19, or 20 AND confirms they were previously in local authority care.

Legal position: automatic priority need under Housing Act 1996. Children’s Services have a duty to accommodate under s.23C Children Act 1989.

Required endpoints:

- Children’s Services contact (LA-specific, from housing-pathway-endpoints.json)

- Housing navigator organisation (e.g. St Basil’s, which specialises in this age group)

- Council Housing Options contact

- Shelter helpline

Language: reflects the stronger entitlement without stating what any organisation must do. Frames Children’s Services as the primary route.

**Care Leavers: 21–24**

Trigger: user confirms they are 21–24 AND confirms they were previously in local authority care.

Legal position: entitlement to advice, support, and a Personal Adviser on request (s.23CZB Children and Social Work Act 2017). Duty to accommodate only if in full-time education or training (s.23CA) or assessed as vulnerable. No automatic accommodation right.

Required endpoints:

- Children’s Services contact (LA-specific) — framed as ‘may be entitled to support and a Personal Adviser’

- Housing navigator organisation

- Council Housing Options contact

- Shelter helpline

Language: age-differentiated from 18–20. Does not imply automatic accommodation entitlement. Uses ‘explore your options with Children’s Services’ framing.

**Pending legislation:** The Children’s Wellbeing and Schools Bill (progressing through Parliament at February 2026) will prevent certain care leavers from being classed as intentionally homeless and introduce a Staying Close duty to age 25. When enacted, this pathway requires review.

**LGBTQ+ Housing Need**

Trigger: user has confirmed LGBTQ+ identity AND housing is the identified support need.

Required endpoints (national, hardcoded):

- AKT (Albert Kennedy Trust): national charity supporting LGBTQ+ young people facing homelessness

- Stonewall Housing: national charity supporting LGBTQ+ people of all ages experiencing homelessness or unsafe living situations

Additional endpoints:

- Local LGBTQ+-friendly housing organisation where identified in housing-pathway-endpoints.json for the LA

- Standard housing pathway endpoints

LGBTQ+ identity is a general profiling question across the VA. In the housing pathway it triggers these additional national endpoints on top of the standard pathway.

**Domestic Violence: Housing Pathway**

Trigger: user has confirmed they are experiencing or fleeing domestic violence AND housing is the identified support need. \[Note: the DV crisis exit is governed by the Safeguarding Contract. This pathway covers the housing-specific layer that runs alongside or after safeguarding signposting.\]

The pathway operates as a matrix: LA × gender × presence of children. All combinations are explicitly mapped.

Required endpoints for all DV housing queries:

- Shelter legal page: ‘Priority need due to domestic abuse’ (shelterengland.org.uk) — surfaced for anyone who wants to understand the legal position. The VA does not explain the legal position; it points to Shelter.

- Local DV organisation (from housing-pathway-endpoints.json, LA-specific)

- Council Housing Options contact

- Shelter helpline

Additional hardcoded endpoints by circumstance:

- Female user: local Women’s Aid organisation (LA-specific from housing-pathway-endpoints.json) + National Domestic Abuse Helpline

- Male user: ManKind Initiative (national, hardcoded): 0808 800 1170

- LGBTQ+ user: Galop (national, hardcoded): 0808 800 1170 — confidential LGBTQ+ domestic abuse support

- Children present: children’s services contact included alongside DV endpoints

Honour-based violence: treated within the DV matrix. The VA does not ask a separate question. Local DV organisations are expected to have HBV-aware capacity. This is a known limitation documented as a service quality gap, not a routing gap.

**NRPF: No or Unclear Access to Public Funds**

Trigger: user confirms unclear or no access to public funds.

Trigger basis: NRPF status creates a specific access barrier that Housing Options alone cannot address for some users. The trigger is the access barrier (public funds status), not nationality. EU residents with settled status are entitled to public funds and are not routed to this pathway.

Required endpoints (national, hardcoded):

- Project 17: advice and support for people with No Recourse to Public Funds

- Migrant Help: 0808 8010 503 — immigration, housing, asylum and trafficking-related support

Additional endpoints:

- Local immigration support organisation (from housing-pathway-endpoints.json, LA-specific)

- Standard housing pathway endpoints

Modern slavery / trafficking: surfaced passively within NRPF pathway output rather than as a separate question. Migrant Help covers trafficking referrals. A direct question creates risk for users who may be under control. This is a deliberate design decision.

**NRPF with Dependent Children**

Trigger: user confirms unclear or no access to public funds AND confirms presence of dependent children.

Legal position: Children’s Services have a duty under s.17 Children Act 1989 to safeguard and promote the welfare of children in need, which may include providing accommodation and financial support regardless of immigration status.

Required endpoints:

- Project 17 and Migrant Help (as NRPF pathway above)

- Children’s Services contact (LA-specific) — signposted with reference to s.17 Children Act duty. The VA surfaces the route; it does not state what Children’s Services must do.

- Local immigration support organisation

- Shelter helpline

**Arson Conviction**

Trigger: user confirms they have an arson conviction.

Context: arson is a complicating factor, not a priority need pathway. Most housing organisations and hostels cannot accommodate people with arson convictions due to insurance restrictions. The VA has identified one organisation able to assist.

Required endpoints:

- Hardcoded Coventry-based organisation (the only identified provider with capacity and appropriate insurance — named in housing-pathway-endpoints.json)

- Shelter helpline

This pathway reflects a genuine system gap. The single-org situation is documented. If additional organisations are identified through future service development, this pathway requires updating.

**Arson Conviction with LGBTQ+ Identity**

Trigger: user confirms arson conviction AND has confirmed LGBTQ+ identity.

Required endpoints:

- LGBTQ+ specialist housing organisation (AKT, Stonewall Housing, or LA-specific LGBTQ+ org)

- Shelter helpline

Rationale: LGBTQ+ specialist organisations have both the knowledge of the user’s housing circumstances and the flexibility to navigate the arson complication on their own terms. The arson pathway’s single-org limitation does not apply in the same way when a specialist service is handling the case. The VA routes to the specialist and does not attempt to route both pathways simultaneously.

**Pregnancy**

Trigger: user confirms pregnancy.

Routing: pregnancy is treated equivalently to the presence of dependent children for housing pathway purposes. The same endpoints apply as for users with dependent children. This reflects housing law treatment of pregnant applicants under priority need provisions.

**What the VA Does Not Do**

Within housing pathways, the VA must not:

- State that a user qualifies for any housing provision or priority need category

- Tell a user what a council, Children’s Services, or any other organisation must do

- Assess vulnerability, local connection, intentional homelessness, or any other statutory test

- Generate housing or legal advice in its own words — all housing-related information comes from approved phrasebank content or hardcoded signposting

- Infer immigration status, NRPF status, care leaver status, or any other circumstance not explicitly confirmed by the user

- Route to ethnicity-specific or community-specific organisations based on profiling variables not collected by the VA

- Present service matching results as the only option where hardcoded national orgs also apply

- Omit Housing Options or the Shelter helpline from any housing pathway output

**The housing-pathway-endpoints.json File**

housing-pathway-endpoints.json is the authoritative data source for all LA-specific housing contacts surfaced by the VA. It is maintained separately from the SSN service catalogue.

The file contains:

- Council Housing Options contacts by LA (phone, website, out-of-hours)

- Children’s Services contacts by LA

- Housing navigator organisations by LA (where identified; system gap documented where not)

- Local immigration support organisations by LA

- Local DV organisations by LA

Entries are verified against primary sources as part of the pre-rollout audit for each LA. The SSN API is not used as the source for this file due to contact data quality issues identified in the February 2026 audit.

Authority rests with the Managing Director. Changes to the file that affect pathway routing require a corresponding update to this contract.

**Hardcoded National Organisations**

The following national organisations are hardcoded into the VA and cannot be substituted or replaced by service matching results. They are named here as the authoritative reference.

|                                          |                                                              |                                   |
|------------------------------------------|--------------------------------------------------------------|-----------------------------------|
| **Organisation**                         | **Contact / URL**                                            | **Pathway(s)**                    |
| StreetLink                               | streetlink.org.uk                                            | Rough sleeping                    |
| AKT (Albert Kennedy Trust)               | akt.org.uk                                                   | LGBTQ+ housing                    |
| Stonewall Housing                        | stonewallhousing.org                                         | LGBTQ+ housing                    |
| Galop                                    | 0808 800 1170 / galop.org.uk                                 | LGBTQ+ domestic violence          |
| ManKind Initiative                       | 0808 800 1170 / mankind.org.uk                               | Male domestic violence            |
| National Domestic Abuse Helpline         | 0808 2000 247 / nationaldahelpline.org.uk                    | Female domestic violence          |
| Project 17                               | project17.org.uk                                             | NRPF / immigration housing        |
| Migrant Help                             | 0808 8010 503 / migranthelpuk.org                            | NRPF / immigration / trafficking  |
| Childline                                | 0800 1111 / childline.org.uk                                 | Under 16                          |
| Shelter helpline (England)               | 0808 800 4444 / england.shelter.org.uk                       | All housing pathways (floor)      |
| Shelter legal page: DV and priority need | england.shelter.org.uk (Priority need due to domestic abuse) | Domestic violence housing pathway |

Any proposal to replace, remove, or add to this list requires governance review. These organisations are hardcoded because they serve needs that cannot be reliably met through service matching of the local SSN catalogue.

**Relationship to Enrichment Pipeline**

The enrichment pipeline extracts structured eligibility data from SSN service descriptions. It does not govern housing pathway endpoints.

A future enhancement (logged in the VA Backlog) would have the enrichment pipeline flag SSN services that appear to meet housing navigator criteria for human review. This would assist in identifying navigator organisations not already captured in housing-pathway-endpoints.json. Until implemented, the file is populated through the pre-rollout audit process only.

**Governance**

This contract must not be overridden by convenience, automation goals, or service matching defaults.

Changes requiring explicit trustee approval:

- Any proposal to allow AI to generate housing or legal advice

- Any proposal to remove Housing Options or the Shelter helpline from a pathway

- Any proposal to add inference-based pathway triggers (as opposed to user-confirmed circumstances)

- Any material change to the hardcoded national organisation list

Changes requiring governance review (trustees informed, decision documented):

- Addition of a new housing pathway

- Change to trigger conditions for an existing pathway

- Change to age boundaries in care leaver pathways

- Change to the housing-pathway-endpoints.json structure or authority model

- Children’s Wellbeing and Schools Bill receiving Royal Assent (care leaver pathway review required)

- New LA added to the WMCA rollout

Operational changes within existing rules (no governance review required):

- Updating contact details in housing-pathway-endpoints.json where the pathway logic is unchanged

- Adding or updating a navigator organisation entry in housing-pathway-endpoints.json

**Document History**

|             |               |                                                                                            |            |
|-------------|---------------|--------------------------------------------------------------------------------------------|------------|
| **Version** | **Date**      | **Change**                                                                                 | **Author** |
| 1.0         | February 2026 | Initial draft following WatsonX pathway audit and legal review of care leaver entitlements | SSN        |

**Status: Draft – Pending trustee review**

Approved by: \[Pending\]

Date: \[Pending\]

Governance contract │ Version 1.0 │ February 2026
