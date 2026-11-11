> **Version 2.0, draft for trustee ratification, 11 November 2026.** This is the full text the trustees are asked to ratify. It is built from the Markdown copy of v1.0 (VA `staging`, `6851f79`), converted on 2 October 2026 from `Non-Housing-Pathway-Endpoints-Contract-v1.0.docx`. v1.0 was never ratified, so this is a new version, not an amendment. The specifications are re-cut by V4 parent (Managing Director, 11 November 2026). Contacts were checked at their primary sources on 11 November 2026.

Street Support Network Virtual Assistant

**Governance Contract**

**Non-Housing Pathway Endpoints Contract**

**Status: Draft for trustee ratification** • Date: 11 November 2026 • Version: 2.0

**Purpose**

This contract defines how the Virtual Assistant responds to non-housing support needs, specifying the guaranteed floor for each support category, the conditions under which dynamic service matching is used, and the standards for honest acknowledgement when local services are absent.

It specifies:

- which non-housing categories have a guaranteed national floor and what that floor is

- which categories are inherently physical and therefore have no credible national resource

- how the LGBTQ+ profile modifier applies across non-housing categories

- what the VA must say when no local services are found

- what analytics signals are required for zero-match outcomes

- how service gaps are reported to the WMCA partnership

This contract governs routing for every V4 parent outside Housing and Safety from harm. It is the companion document to the Housing Pathway Endpoints Contract, which governs housing routing, and to the Safeguarding Contract, which governs the Safety from harm route.

**Scope**

This contract applies to:

- Routing for the V4 parents Activities, Addiction, Employment, Essentials, Finance, Food, Health and Immigration

- The floor content for each of those parents

- Dynamic service matching for non-housing categories

- Zero-match handling and honest acknowledgement language

- LGBTQ+ modifier for non-housing categories

- Zero-match analytics signals and gap reporting

This contract does not cover:

- Housing and emergency accommodation routing (governed by Housing Pathway Endpoints Contract v1.0)

- Safeguarding crisis exits (governed by Safeguarding Contract)

- Service matching logic and eligibility filtering (governed by Service Matching Contract)

- Data enrichment and confidence scoring (governed by Data Enrichment Contract v2)

- Analytics and logging detail (governed by Analytics Contract)

- Prevention pathway: tenancy sustainment, debt, and financial risk routing (separate workstream — out of scope for this version)

**Design Principles**

|                                         |                                                                                                                                                                                                                                                   |
|-----------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Honesty over false comfort              | A category with no local services and no credible national resource is acknowledged honestly. The VA does not surface a national number that cannot fulfil the need. An honest acknowledgement is more dignified than a placeholder.              |
| Physical needs are local by nature      | Food, clothing, showers, drop-in spaces and similar physical provisions can only be provided locally. No national service can substitute for physical access. These categories have honest acknowledgement as their floor, not a national number. |
| National floors where genuinely useful  | Categories where a national resource provides real, remote value — advice, financial navigation, health triage, employment support — have a verified national floor that is always shown, regardless of local match results.                      |
| Dynamic matching surfaces what is there | The SSN catalogue is the source of local service results. Results surface automatically as the database grows. The VA does not curate or hardcode local service results for non-housing categories.                                               |
| Identity-aware where relevant           | LGBTQ+ identity modifies routing where the nature of the need is materially affected. It does not modify routing for categories where identity is irrelevant to what the service provides.                                                        |
| Gaps are signals, not failures          | A zero-match outcome where no national floor exists is a commissioning signal. The VA acknowledges the gap honestly to the user and generates an analytics event that informs WMCA partnership reporting.                                                  |
| Connector, not assessor                 | The VA connects people to services. It does not assess eligibility, make recommendations about which service to use, or advise on entitlements.                                                                                                   |

**Floors by V4 parent**

The floor for each parent is stated directly. The A, B and C category types of v1.0 are retired. **The parent sets the minimum.** A contact that depends on the kind of need, or on the person's circumstances, is shown only where that need or circumstance applies, in line with the Service Matching Contract's rule on fixed contacts. Identity-specific contacts are shown only where the person has said they are relevant. Each floor shows its hours where it is not open around the clock.

| V4 parent | Always shown, whatever the local results | Shown only where it applies | When nothing local matches |
|---|---|---|---|
| **Activities** | None: activities are local by nature | None | Honest acknowledgement, a link to browse Street Support, and the zero-match signal |
| **Addiction** | By subcategory: FRANK for drugs; the National Gambling Helpline for gambling. Alcohol: no floor until a national contact is verified | None | The subcategory's national line stays, and the zero-match signal is logged |
| **Employment** | Jobcentre Plus, framed as the local entry point: "Your local Jobcentre can connect you with employment support". The National Careers Service, framed as navigation to local training | None | The entry points stay, and the zero-match signal is logged |
| **Essentials** | None: items, showers, laundry, drop-ins and phone or internet access need physical access | None | Honest acknowledgement, a link to browse Street Support, and the zero-match signal |
| **Finance** | The Citizens Advice Adviceline. Turn2us's benefits calculator and grants search, as a website only | None | The floor stays |
| **Food** | None. National food schemes need local referral and collection, so a national number would mislead | None | Honest acknowledgement, a link to browse Street Support, and the zero-match signal |
| **Health** | NHS 111 | LGBT Foundation, where the person has said LGBTQ+ is relevant. Rationale: documented barriers to mainstream healthcare | NHS 111 stays |
| **Immigration** | Migrant Help's asylum helpline, for people seeking asylum. *To be confirmed by the Managing Director* | Project 17, where the person has said they have no recourse to public funds (website) | The floor stays |

Where an old category's services now sit in more than one parent (Drop In, Advice), the floor follows the parent the person chose.

**Zero-Match Handling**

**Honest Acknowledgement Language Principles**

Zero-match acknowledgement language must:

- Acknowledge the gap directly — not apologise, not deflect

- Not suggest the user has done anything wrong or asked the wrong question

- Leave a door open — “If you want to let us know, we’ll try to fill the gap”

- Not reference the local council as a general fallback (people experiencing homelessness are often wary of LA systems)

- Not over-promise — no “we’ll find you something”

Approved language pattern:

> “We’re not finding \[category\] support showing up in \[LA\] right now. That’s something we want to know about — if you’re able to, you can let us know via the link below and we’ll try to fill the gap. In the meantime, you can browse everything available in your area on Street Support.”

**Analytics Signal**

Every zero-match outcome, including a zero-match in the local layer where a national floor is shown, must emit a NO_SUITABLE_PATHWAY analytics event containing:

- terminalOutcome: 'NO_SUITABLE_PATHWAY'

- supportNeed: the V4 parent selected

- localAuthority: the user’s LA

These three fields are already permitted under the Analytics Contract (enumerated state values, high-level location). No new data collection is required.

**WMCA Gap Reporting**

Zero-match signals for parents with no national floor (Activities, Essentials, Food) represent genuine commissioning intelligence — they identify where physical services are absent from the WMCA area. This data should route to SSN and WMCA partnership reporting.

Pending: the routing for gap reports — whether directly to a named contact, a dedicated inbox, or a periodic digest — is to be confirmed with Eliz at WMCA before implementation. A separate inbox (e.g. gaps@streetsupport.net) with a weekly digest is the recommended model to prevent volume overwhelming a personal inbox. This decision is parked pending that conversation.

**Hardcoded National Organisations**

The following national organisations are referenced in non-housing pathway floors. They are hardcoded and cannot be substituted by service matching results.

| Organisation | Contact / URL | Parent | Shown |
|---|---|---|---|
| NHS 111 | 111 (free, 24/7) / 111.nhs.uk | Health | Always |
| LGBT Foundation | 0345 3 30 30 30 (Monday to Friday, 9am to 6pm) / lgbt.foundation | Health | Where the person has said LGBTQ+ is relevant |
| FRANK | 0300 123 6600 (24/7); text 82111 / talktofrank.com | Addiction: drugs | For drugs |
| National Gambling Helpline | 0808 8020 133 (24/7) | Addiction: gambling | For gambling |
| Citizens Advice Adviceline (England) | 0800 144 8848 (usually 9am to 5pm, Monday to Friday) / citizensadvice.org.uk | Finance | Always |
| Turn2us | turn2us.org.uk (website only: its helpline has closed) | Finance | Always |
| Jobcentre Plus | gov.uk/contact-jobcentre-plus | Employment | Always |
| National Careers Service | 0800 072 0288 (DWP careers adviser, 18 and over in England, 8am to 6pm, Monday to Friday) / nationalcareers.service.gov.uk | Employment | Always; the website for under-18s |
| Migrant Help | 0808 8010 503 (free, 24/7/365) / migranthelpuk.org | Immigration | For people seeking asylum (*to be confirmed*) |
| Project 17 | project17.org.uk | Immigration | Where the person has said they have no recourse to public funds |

Every contact above was checked at its primary source on 11 November 2026, except NHS 111 and Jobcentre Plus. FRANK and the National Gambling Helpline are new. Turn2us is now website only, because its helpline has closed. The National Careers Service number replaces 0800 100 900, which the service's own page no longer gives. Each is re-checked at source before launch.

**What the VA Must Not Do**

Within non-housing category pathways, the VA must not:

- Surface a national phone number for Activities, Essentials or Food: this creates false hope for a need that requires physical access

- Omit the honest acknowledgement for a zero-match in a parent with no national floor

- Frame the national floor as a guarantee that support will be provided — it navigates, it does not promise

- Show an identity-specific contact where the person has not said it is relevant

- Generate category-specific advice or information in its own words — all signposting uses phrasebank content

- Present a zero-match as an error — it is a valid, honest outcome

- Omit the NO_SUITABLE_PATHWAY analytics signal for zero-match outcomes

**Governance**

This contract must not be overridden by convenience, automation goals, or service matching defaults.

Changes that require governance review:

- Adding or removing a national floor organisation

- Changing which parents have a national floor

- Changing the honest acknowledgement language pattern

- Adding or removing an identity-specific contact for any parent

- Changing the zero-match analytics signal specification

Authority rests with the Managing Director. Changes affecting user-facing content require phrasebank review. Changes affecting routing logic require a corresponding code change and test update.

Review triggers: at least annually, after any material change to the national organisations listed, or following a pattern of zero-match signals indicating a sustained service gap.

**Version history**

| Version | Date | Change |
|---|---|---|
| 1.0 | February 2026 | Initial contract, over the 11 old support categories. Not ratified |
| 2.0 | November 2026 | Re-cut by V4 parent; A, B and C types retired; Addiction and Immigration floors added; identity-specific contacts only where the person has said they are relevant; Turn2us website only; National Careers Service number updated; contacts checked at source, 11 November 2026 (Managing Director, 11 November 2026) |

Street Support Network VA • Non-Housing Pathway Endpoints Contract v2.0 • November 2026
