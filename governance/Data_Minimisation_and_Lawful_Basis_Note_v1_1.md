> Source copy, converted 2 October 2026 from `Data_Minimisation_and_Lawful_Basis_Note_v1_1.docx` (sha256 fb56efca792bb497fc07ef098dfcde197470b80f930ece92746cc513bf7462b7), supplied by the Managing Director. This Markdown file is the source under the repository's direction rule; the Word file was the only previous copy and is now a derived record. Content unchanged.

**Street Support Network Virtual Assistant**

**Governance Note**

**Data Minimisation and Lawful Basis**

|                       |                                                                                                                                                                                |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Status**            | Draft                                                                                                                                                                          |
| **Date**              | March 2026                                                                                                                                                                     |
| **Version**           | 1.1                                                                                                                                                                            |
| **Author**            | Matt Lambert                                                                                                                                                                   |
| **Review required**   | James Cross                                                                                                                                                                    |
| **Related documents** | Quick Route Design Note v1.1, Service Matching Contract v2.0, Appropriate Policy Document v1.0, Data Protection Policy (update pending), How We Work: Our Governing Principles |

**Purpose**

This note documents the lawful basis for data collection and processing within the Virtual Assistant, and explains how the system architecture implements GDPR data protection principles by design.

It is intended to provide a defensible, auditable position that can be presented to regulators, funders, or partners if asked how the VA handles personal data. It does not introduce new rules. The rules it describes are embedded in the system architecture and governed by existing contracts.

**What the VA Collects**

The Virtual Assistant collects no identifying personal data. It does not ask for names, addresses, dates of birth, contact details, or any information that could identify a specific individual. Nothing is stored between sessions. There is no user account, no login, and no cross-session linkage.

What it does collect, within a single session, is a set of profiling variables used to route the person to appropriate support services. These fall into three categories:

- **Core fields** (required for routing, cannot be skipped): age category, gender, local authority. These are mandatory because the system cannot function without them. Age determines safeguarding pathways and service eligibility. Gender determines routing on DV and SA pathways. Local authority determines which council services and local organisations are shown.

- **Pathway fields** (asked where the selected pathway requires them, can be declined): support need, homeless or housed status, LGBTQ+ identity, immigration status, children or pregnancy, criminal convictions, health or mental health concerns, care leaver status. Users can select ‘prefer not to say’ on any of these without being excluded from the service.

- **Crisis fields** (always asked, non-skippable): whether the person is in immediate danger, experiencing domestic abuse, self-harm, sexual violence, or is under 16. These are safeguarding gates and cannot be bypassed.

Two of the pathway fields are GDPR special category data (Article 9): sexual orientation (the LGBTQ+ question) and health status. Gender is not special category data under GDPR. The handling of special category fields is addressed in section 4.

**Data Minimisation by Design**

GDPR Article 5(1)(c) requires that personal data be adequate, relevant, and limited to what is necessary for the stated purpose. Article 25 requires that data protection be embedded in system design, not applied after the fact.

The VA implements data minimisation structurally through its route-based architecture. The system does not collect a standard set of profiling data and then decide what to do with it. Instead, it determines the user’s support need first, then asks only the questions required to route them within that category.

This means:

- A person selecting Food is not asked about sexual orientation, immigration status, or criminal convictions. None of these affect food bank routing.

- A person selecting Housing is asked about immigration status because it materially changes the services available to them and the pathway they follow.

- A person selecting Health who identifies as LGBTQ+ sees LGBT Foundation alongside NHS 111. A person selecting Health who does not identify as LGBTQ+ sees NHS 111 only. The question is asked because it changes the output.

- The crisis gate is the single exception. It is asked of everyone regardless of pathway because safeguarding disclosures can occur at any point and the consequences of missing one are severe.

The mechanism for this is the quick route architecture (documented in Quick Route Design Note v1.1). After the crisis gate clears and the user’s support need is established, the system determines which profiling questions are necessary for that pathway and asks only those. Users whose pathway requires no specialist fields answer only core questions: age, gender, and location.

This is not a UX convenience feature. It is the data minimisation mechanism. Collecting data that the pathway does not require would violate Article 5(1)(c) regardless of whether the user consented to providing it.

**Why a Consent Gate Was Not the Right Approach**

An earlier iteration of the VA included a special category consent gate: a screen before profiling that referenced data protection law and asked the user to consent to answering questions about sexual orientation, health, and ethnicity.

This approach was removed because it created a common GDPR anti-pattern: over-collection masked by consent. The problems were:

- Consent cannot legitimise unnecessary data collection. If a question is not needed for routing, no consent basis makes it lawful under Article 5(1)(c).

- Consent must be freely given. When consent is bundled with service access, regulators treat it with scepticism (ICO guidance is explicit on this point).

- The wording did not meet the ICO’s requirements for explicit consent: it did not identify the data controller, state the processing purpose, mention the right to withdraw, or confirm no detriment from refusal.

- The gate implied legal compliance without meeting it, which is worse than having no gate at all.

The correct solution is not better consent wording. It is not collecting the data in the first place unless routing requires it. That is what the route-based architecture achieves.

**Lawful Basis for Processing**

**Article 6: General Processing**

The VA collects non-identifying profiling data within a single session to route people to support services. The most appropriate Article 6 lawful basis is legitimate interests (Article 6(1)(f)). This applies to all fields on all pathways.

- **Legitimate interest:** Street Support Network has a legitimate interest in collecting the minimum profiling data necessary to route vulnerable people to appropriate support services. This is the core charitable purpose.

- **Necessity:** The route-based architecture ensures that only data necessary for the selected pathway is collected. Core fields (age, gender, location) are necessary for the system to function at all. Pathway fields are necessary for the specific route selected. No data is collected beyond what routing requires.

- **Balancing test:** The data is non-identifying, session-only, not stored, and not shared. Core fields are required for the system to route effectively; users who prefer not to provide them can browse services directly through the Street Support website and map, which require no personal information. Pathway fields can be declined without consequence. The impact on the individual is minimal; the benefit is being connected to appropriate support.

An alternative basis would be task carried out in the public interest (Article 6(1)(e)), given the VA’s role in supporting public service delivery across the WMCA region. Either basis is defensible. The key point is that the route-based architecture satisfies the necessity test for both.

**Article 9: Special Category Data**

Two fields collected by the VA are GDPR special category data: sexual orientation (the LGBTQ+ identity question) and health status. Gender is not special category data under GDPR and is handled under Article 6 only.

Where a pathway collects special category data, an Article 9 condition is needed in addition to the Article 6 basis. The route-based architecture means Article 9 is only invoked when the data genuinely changes the routing output. This is materially easier to justify than a system that collects special category data from everyone.

The applicable Article 9 condition depends on whether the user would be disadvantaged by declining:

- **Substantial public interest** (Article 9(2)(g), DPA 2018 Schedule 1 Part 2): used where the special category data is necessary for safeguarding routing and declining could mean missing specialist crisis support. In this context, consent cannot be considered freely given because the user may be in crisis. An Appropriate Policy Document is required and is provided as a companion document (Appropriate Policy Document v1.0).

- **Explicit consent** (Article 9(2)(a)): used where the field is genuinely optional and declining does not exclude the user from any service. Declining results in broader (not narrower) results. The user is not disadvantaged. The consent mechanism is the question itself: the user chooses to answer or selects ‘prefer not to say’.

The specific condition for each field on each pathway is mapped in the Article 9 table in section 5.

**Route, Purpose, and Data Field Mapping**

**Routing Table (Article 6)**

This table maps each support category to its routing purpose and the fields collected. Article 6 lawful basis is legitimate interests for all routes.

|                   |                                               |                     |                                                                     |
|-------------------|-----------------------------------------------|---------------------|---------------------------------------------------------------------|
| **Route**         | **Purpose**                                   | **Required fields** | **Optional fields**                                                 |
| Emergency Housing | Route to Housing Options, navigators, Shelter | Age, gender, LA     | Homeless status, convictions, immigration, children, LGBTQ+, health |
| Domestic abuse    | Route to specialist DV provision              | Gender, LA          | Children                                                            |
| Sexual assault    | Route to SARC and specialist support          | Gender, LA          | LGBTQ+                                                              |
| Health            | Route to health services                      | LA                  | LGBTQ+                                                              |
| Advice Services   | Route to advice provision by subcategory      | LA                  | Subcategory                                                         |
| Financial Help    | Route to financial support                    | LA                  | None                                                                |
| Work              | Route to employment support                   | LA                  | None                                                                |
| Training          | Route to training and careers                 | LA                  | None                                                                |
| Food              | Route to food banks                           | LA                  | None                                                                |
| Type A categories | Route to local provision                      | LA                  | None                                                                |
| Crisis gate       | Safeguarding screening                        | Crisis indicators   | None (non-skippable)                                                |

The pattern is clear: simpler pathways collect less data. Most pathways require only location. The crisis gate collects no profiling data; it asks only whether an immediate safeguarding concern exists.

**Article 9 Table (Special Category Data Only)**

This table maps each special category field to the pathways where it is collected, the Article 9 condition relied upon, and the rationale. Only two fields trigger Article 9: sexual orientation and health status.

|                             |                        |                                                           |                                                                                                                                       |
|-----------------------------|------------------------|-----------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| **Field**                   | **Pathway**            | **Article 9 condition**                                   | **Rationale**                                                                                                                         |
| Sexual orientation (LGBTQ+) | Domestic violence      | Substantial public interest (Sch 1 para 12: safeguarding) | Routes to Galop. Declining could mean missing specialist LGBTQ+ DV support in crisis.                                                 |
| Sexual orientation (LGBTQ+) | Sexual assault         | Substantial public interest (Sch 1 para 12: safeguarding) | Routes to Galop and SurvivorsUK. Declining could mean missing specialist LGBTQ+ SA support.                                           |
| Sexual orientation (LGBTQ+) | Housing                | Explicit consent                                          | Surfaces AKT and Stonewall Housing. Declining gives broader results (Housing Options, Shelter, navigators still shown). No exclusion. |
| Sexual orientation (LGBTQ+) | Health                 | Explicit consent                                          | Surfaces LGBT Foundation alongside NHS 111. Declining gives NHS 111 only. No exclusion.                                               |
| Health status               | Housing (guided route) | Explicit consent                                          | Improves matching quality for specialist health services. Declining does not gate access to any service.                              |

The substantial public interest condition applies only on safeguarding pathways (DV, SA) where declining could result in the user missing specialist crisis support. On all other pathways, the field is genuinely optional and explicit consent applies. This distinction is the reason the Article 9 table is separate from the routing table: the same field can require different conditions on different pathways.

**Purpose Limitation**

GDPR Article 5(1)(b) requires that data be collected for specified, explicit purposes and not processed beyond those purposes.

The route-based architecture creates natural purpose-scoping. Each pathway has a defined purpose (route to housing support, route to DV provision, route to food banks) and the data collected within that pathway is used solely for that purpose within the same session.

No data is retained after the session ends. No data is used for secondary purposes such as analytics profiling, cross-session comparison, or aggregate analysis at the individual level. Session-level aggregate analytics (how many people selected each pathway, zero-match rates by local authority) are governed separately by the Analytics Contract and do not use profiling data.

**Operational Intelligence Fields**

The route-based architecture described above governs data collected for routing purposes. The VA also collects a small number of operational intelligence fields that do not affect routing but serve distinct, documented purposes related to service accessibility, reach measurement, and outcome tracking.

These fields are governed separately from routing fields because their purpose is different. Routing fields exist to connect the person to the right service. Operational intelligence fields exist to help SSN understand whether the service is working and whether it is accessible to everyone who needs it. Both purposes are legitimate, but they must not be conflated.

The following fields are collected under this separate operational intelligence basis:

**accessLocation** (enumerated: e.g. home, library, day centre, hostel, street, other). Tells SSN where people are using the VA so that accessibility can be ensured across devices and contexts. If usage is concentrated in libraries, the service needs to work well on shared desktop browsers. If usage is predominantly on mobile in outdoor settings, screen readability and data usage matter. This directly supports the accessibility obligations documented in the Accessibility Alignment Note v1.0. The field does not identify a location more specific than context type. It is not a geographic field.

**returnUser** (enumerated: first time, used before, not sure). Tells SSN whether the VA is reaching new people or whether the same population is returning. This is a reach intelligence question, not individual tracking. No cross-session linkage exists or is possible; the field records only what the user self-reports. WMCA have specifically asked whether SSN can track reach versus repeat usage. This field answers that question without building any mechanism that could identify or link individuals across sessions.

**returnOutcome** (enumerated: contacted a service, did not contact, not applicable, prefer not to say). For returning users only. Tells SSN whether the VA led to contact with a service. This is the closest available proxy for whether the system is working. Without it, SSN can measure that people complete sessions but not whether anyone acted on the results. The field is asked only of users who self-report as returning, and only in enumerated form. No service names, dates, or details of the contact are collected.

**Lawful basis**

The lawful basis for all three fields is legitimate interests (Article 6(1)(f)), the same basis used for routing fields.

**Legitimate interest:** SSN has a legitimate interest in understanding whether its service is accessible, whether it reaches the people who need it, and whether it leads to meaningful contact with support services. These are core operational questions for any charity delivering a digital service to vulnerable people.

**Necessity:** Each field collects the minimum data needed for its stated purpose. Access context is collected as a broad category, not a specific address. Return status is self-reported, not tracked. Outcome is enumerated, not described. None of the fields could be further minimised without losing the operational intelligence they provide.

**Balancing test:** The data is non-identifying, session-only, enumerated, and not shared externally in individual form. The questions are clearly framed as optional and can be declined. The impact on the individual is negligible. The benefit to the service and its users is direct and proportionate.

None of these fields are special category data under Article 9. No additional condition is required.

**Governance constraints**

Operational intelligence fields are subject to the same session-only, non-linkable, aggregate-only constraints as all other VA data. They are stored as enumerated session variables and governed by the Analytics Contract. The Analytics Contract has been amended (Amendment 2) to explicitly cover operational intelligence as a permitted collection purpose.

Any proposal to expand the operational intelligence fields beyond the three documented here, or to change their enumerated values to free text, constitutes a material change requiring review against this note and the Analytics Contract.

**Outstanding Governance Actions**

The route-based architecture provides a strong GDPR foundation. Two governance items remain:

1.  **Data Protection Policy update:** The existing Data Protection Policy still references WatsonX and does not reflect the current architecture. It should be updated to align with this note and the route-based data collection model. This is already logged as backlog item 16.

2.  **Verify tables against implementation:** Both the routing table and Article 9 table should be verified against the implemented quick route field declarations once that work is built and tested. The tables are then confirmed as the canonical reference for what data is collected and why.

**Regulatory Alignment**

The current design aligns with three regulatory expectations:

- **Data protection by design (Article 25):** The system is designed to minimise data collection structurally, not through policy or consent mechanisms applied after collection.

- **Necessity before consent:** The ICO’s position is that organisations should ask whether they need the data before asking for consent. The route-based architecture asks exactly this question at the system level.

- **Clear purpose mapping:** Route-based collection naturally creates a purpose-to-data mapping, which simplifies DPIA work and makes the system’s data practices auditable.

**Relationship to Governing Principles**

This note is not introducing a new governance position. It is documenting how existing governing principles already address GDPR requirements:

- **Principle 5 (we act on what is confirmed, not what we infer)**: the system collects only what the user provides and acts only on confirmed information. No inference, no secondary processing.

- **Principle 8 (privacy and dignity are protected throughout)**: no identifying data is collected, nothing is stored, nothing is linked across sessions. The VA requires a minimum of information (age, gender, location) to route effectively. All other questions can be declined without consequence. People who prefer not to provide this information can browse services directly through the Street Support website and map.

- **Principle 2 (controls are proportionate to the potential for harm)**: data collection scales with pathway complexity. Simple routes collect minimal data. Complex routes collect what they need and nothing more.

The GDPR position described in this note is a natural consequence of these principles, not an additional compliance layer.

**Document History**

|             |            |                                                                                                                                                                                                                                                                                                  |
|-------------|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Version** | **Date**   | **Change**                                                                                                                                                                                                                                                                                       |
| 1.0         | March 2026 | Initial note. Documents route-based data minimisation architecture, lawful basis position, and Article 9 conditions by pathway. Gender removed from Article 9 scope (not special category data). Consent gate removal rationale documented. Companion Appropriate Policy Document v1.0 produced. |
| 1.1         | March 2026 | Added Operational Intelligence Fields section: accessLocation, returnUser, returnOutcome. Separate lawful basis (legitimate interests) documented for operational intelligence purpose distinct from routing. Analytics Contract Amendment 2 cross-referenced.                                   |

*Governance note │ Version 1.1 │ March 2026*
