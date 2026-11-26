> Source copy, converted 2 October 2026 from `Non-Housing-Pathway-Endpoints-Contract-v1.0.docx` (sha256 148dbcd3b398d7d1cae1419913ed1794c0ad19dbfd9b9193e3d80df6b699bd76), supplied by the Managing Director. This Markdown file is the source under the repository's direction rule; the Word file was the only previous copy and is now a derived record. Content unchanged.

Street Support Network Virtual Assistant

**Governance Contract**

**Non-Housing Pathway Endpoints Contract**

**Status: Accepted — Pending trustee ratification** • Date: 28 February 2026 • Version: 1.0

**Purpose**

This contract defines how the Virtual Assistant responds to non-housing support needs, specifying the guaranteed floor for each support category, the conditions under which dynamic service matching is used, and the standards for honest acknowledgement when local services are absent.

It specifies:

- which non-housing categories have a guaranteed national floor and what that floor is

- which categories are inherently physical and therefore have no credible national resource

- how the LGBTQ+ profile modifier applies across non-housing categories

- what the VA must say when no local services are found

- what analytics signals are required for zero-match outcomes

- how service gaps are reported to the WMCA partnership

This contract governs all B5 non-housing category routing in the VA codebase. It is the companion document to the Housing Pathway Endpoints Contract v1.0, which governs housing-specific routing.

**Scope**

This contract applies to:

- All non-housing B5 category routing within the Virtual Assistant

- The floor content for each of the 11 non-housing support categories

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
| Gaps are signals, not failures          | A zero-match outcome for a Type A category is a commissioning signal. The VA acknowledges the gap honestly to the user and generates an analytics event that informs WMCA partnership reporting.                                                  |
| Connector, not assessor                 | The VA connects people to services. It does not assess eligibility, make recommendations about which service to use, or advise on entitlements.                                                                                                   |

**Category Typology**

Each of the 11 non-housing B5 categories is classified as one of three types:

|          |                                                                                                                                                    |                                                                                                                               |                                                                              |
|----------|----------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| **Type** | **Definition**                                                                                                                                     | **Floor**                                                                                                                     | **Categories**                                                               |
| **A**    | Inherently physical. The need can only be met by physical access to a local resource. A national reference would create false hope.                | Honest acknowledgement of the gap. Zero-match analytics signal. Invitation for the user to tell SSN about the gap.            | Food, Personal Items, Personal Services, Drop In, Activities, Communications |
| **B**    | Nationally navigable. A remote national resource provides genuine value regardless of the user’s location.                                         | Verified national resource always shown. Local dynamic results above it. Zero-match in local layer does not remove the floor. | Health, Financial Help, Advice Services                                      |
| **C**    | National navigation. A national entry point exists but resolution requires local engagement. The national resource navigates, it does not resolve. | National entry point shown with explicit framing that it will connect to local support. Local dynamic results above it.       | Work / Employment, Training                                                  |

**Category Specifications**

Each category is specified below with its type, guaranteed floor, national organisations (where applicable), dynamic layer, and LGBTQ+ modifier status.

**Health Services B — Nationally navigable**

|                        |                                                                                                                                                                                                                            |
|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Guaranteed floor       | NHS 111 is always shown as the floor for Health. It provides free remote triage, advice, and referral for non-emergency health needs, and is genuine national infrastructure available to everyone regardless of location. |
| National organisations | NHS 111: 111 (free, 24/7) or 111.nhs.uk LGBT Foundation: 0345 3 30 30 30 / lgbt.foundation — shown additionally for LGBTQ+ users (see LGBTQ+ modifier section)                                                             |
| Dynamic layer          | SSN catalogue health results for the user’s LA. Includes GP registration support, mental health services, sexual health clinics, specialist health services.                                                               |
| LGBTQ+ modifier        | Yes. LGBT Foundation surfaces alongside NHS 111 for users who have confirmed LGBTQ+ identity. Rationale: documented barriers to mainstream healthcare for LGBTQ+ people make specialist navigation genuinely useful.       |
| Zero-match handling    | Zero-match in local layer: NHS 111 floor remains. No separate zero-match acknowledgement required — NHS 111 is a real referral pathway.                                                                                    |

**Financial Help B — Nationally navigable**

|                        |                                                                                                                                                                               |
|------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Guaranteed floor       | Turn2Us is always shown as the floor for Financial Help. Its benefit calculator and emergency grants search are genuinely useful remotely and have no geographic restriction. |
| National organisations | Turn2Us: 0808 802 2000 / turn2us.org.uk — benefit entitlement calculator, emergency grants search                                                                             |
| Dynamic layer          | SSN catalogue financial and benefits results for the user’s LA.                                                                                                               |
| LGBTQ+ modifier        | No. Turn2Us serves everyone. LGBTQ+ identity is not a relevant modifier for financial navigation.                                                                             |
| Zero-match handling    | Zero-match in local layer: Turn2Us floor remains.                                                                                                                             |

**Advice Services B — Nationally navigable**

|                        |                                                                                                                                                                                  |
|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Guaranteed floor       | Citizens Advice is always shown as the floor for Advice. The national helpline provides real advice remotely on benefits, housing rights, debt, employment, and consumer issues. |
| National organisations | Citizens Advice: 0800 144 8848 / citizensadvice.org.uk                                                                                                                           |
| Dynamic layer          | SSN catalogue advice and legal results for the user’s LA.                                                                                                                        |
| LGBTQ+ modifier        | No. Citizens Advice serves everyone.                                                                                                                                             |
| Zero-match handling    | Zero-match in local layer: Citizens Advice floor remains.                                                                                                                        |

**Work / Employment C — National navigation**

|                        |                                                                                                                                                                                                                                                                                                                                               |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Guaranteed floor       | Jobcentre Plus is shown as the national entry point for employment support. It is the gateway to Universal Credit claims, work coaches, and job search support. Every LA has a Jobcentre. The VA frames it as a navigation entry point, not a resolution: “Your local Jobcentre can connect you with employment support and benefits advice.” |
| National organisations | Jobcentre Plus: gov.uk/contact-jobcentre-plus — framed as local entry point                                                                                                                                                                                                                                                                   |
| Dynamic layer          | SSN catalogue employment results for the user’s LA.                                                                                                                                                                                                                                                                                           |
| LGBTQ+ modifier        | No. Jobcentre Plus serves everyone.                                                                                                                                                                                                                                                                                                           |
| Zero-match handling    | Zero-match in local layer: Jobcentre Plus navigation floor remains. Zero-match signal emitted for the category and LA.                                                                                                                                                                                                                        |

**Training C — National navigation**

|                        |                                                                                                                                                                                                                                                                                                                                                                   |
|------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Guaranteed floor       | National Careers Service is shown as the national entry point for training and skills. It provides free, remote skills guidance and navigates to local training provision including Skills Bootcamps and adult education. The VA frames it as navigation: “The National Careers Service can help you explore training options and find what’s available locally.” |
| National organisations | National Careers Service: 0800 100 900 / nationalcareers.service.gov.uk — framed as navigation to local provision                                                                                                                                                                                                                                                 |
| Dynamic layer          | SSN catalogue training and education results for the user’s LA.                                                                                                                                                                                                                                                                                                   |
| LGBTQ+ modifier        | No.                                                                                                                                                                                                                                                                                                                                                               |
| Zero-match handling    | Zero-match in local layer: National Careers Service floor remains. Zero-match signal emitted.                                                                                                                                                                                                                                                                     |

**Food A — Inherently physical**

|                        |                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Guaranteed floor       | Honest acknowledgement. No national resource can provide food remotely. The VA acknowledges the gap directly and generates a zero-match signal. Language: “We’re not finding food support showing up for \[LA\] right now. That’s something we want to know about — if you’re able to, you can let us know and we’ll try to fill the gap.” SSN browse link included. |
| National organisations | None. Trussell Trust and similar organisations require local referral and physical collection. Surfacing a national number would be misleading.                                                                                                                                                                                                                      |
| Dynamic layer          | SSN catalogue food and meals results for the user’s LA.                                                                                                                                                                                                                                                                                                              |
| LGBTQ+ modifier        | No.                                                                                                                                                                                                                                                                                                                                                                  |
| Zero-match handling    | Full zero-match experience: honest acknowledgement + SSN browse link + NO_SUITABLE_PATHWAY analytics signal.                                                                                                                                                                                                                                                         |

**Personal Items A — Inherently physical**

|                        |                                                                                                                   |
|------------------------|-------------------------------------------------------------------------------------------------------------------|
| Guaranteed floor       | Honest acknowledgement. Clothing, sleeping bags, and similar items require physical access. Same pattern as Food. |
| National organisations | None.                                                                                                             |
| Dynamic layer          | SSN catalogue personal items results for the user’s LA.                                                           |
| LGBTQ+ modifier        | No.                                                                                                               |
| Zero-match handling    | Full zero-match experience: honest acknowledgement + SSN browse link + NO_SUITABLE_PATHWAY signal.                |

**Personal Services A — Inherently physical**

|                        |                                                                                                                 |
|------------------------|-----------------------------------------------------------------------------------------------------------------|
| Guaranteed floor       | Honest acknowledgement. Showers, laundry, and similar services require physical presence. Same pattern as Food. |
| National organisations | None.                                                                                                           |
| Dynamic layer          | SSN catalogue personal services results for the user’s LA.                                                      |
| LGBTQ+ modifier        | No.                                                                                                             |
| Zero-match handling    | Full zero-match experience: honest acknowledgement + SSN browse link + NO_SUITABLE_PATHWAY signal.              |

**Drop In A — Inherently physical**

|                        |                                                                                                    |
|------------------------|----------------------------------------------------------------------------------------------------|
| Guaranteed floor       | Honest acknowledgement. Drop-in services are definitionally local. Same pattern as Food.           |
| National organisations | None.                                                                                              |
| Dynamic layer          | SSN catalogue drop-in results for the user’s LA.                                                   |
| LGBTQ+ modifier        | No.                                                                                                |
| Zero-match handling    | Full zero-match experience: honest acknowledgement + SSN browse link + NO_SUITABLE_PATHWAY signal. |

**Activities A — Inherently physical**

|                        |                                                                                                    |
|------------------------|----------------------------------------------------------------------------------------------------|
| Guaranteed floor       | Honest acknowledgement. Activities are local by nature. Same pattern as Food.                      |
| National organisations | None.                                                                                              |
| Dynamic layer          | SSN catalogue activities results for the user’s LA.                                                |
| LGBTQ+ modifier        | No.                                                                                                |
| Zero-match handling    | Full zero-match experience: honest acknowledgement + SSN browse link + NO_SUITABLE_PATHWAY signal. |

**Communications A — Inherently physical**

|                        |                                                                                                                                                                              |
|------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Guaranteed floor       | Honest acknowledgement. Access to phones, computers, and internet requires physical access to a device and location. No remote service can substitute. Same pattern as Food. |
| National organisations | None. Digital inclusion schemes (e.g. Good Things Foundation) are locally delivered and cannot be signposted nationally without a local referral point.                      |
| Dynamic layer          | SSN catalogue communications and digital access results for the user’s LA.                                                                                                   |
| LGBTQ+ modifier        | No.                                                                                                                                                                          |
| Zero-match handling    | Full zero-match experience: honest acknowledgement + SSN browse link + NO_SUITABLE_PATHWAY signal.                                                                           |

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

Every zero-match outcome — including zero-match in the local dynamic layer for Type B and C categories — must emit a NO_SUITABLE_PATHWAY analytics event containing:

- terminalOutcome: 'NO_SUITABLE_PATHWAY'

- supportNeed: the B5 category selected

- localAuthority: the user’s LA

These three fields are already permitted under the Analytics Contract (enumerated state values, high-level location). No new data collection is required.

**WMCA Gap Reporting**

Zero-match signals for Type A categories represent genuine commissioning intelligence — they identify where physical services are absent from the WMCA area. This data should route to SSN and WMCA partnership reporting.

Pending: the routing for gap reports — whether directly to a named contact, a dedicated inbox, or a periodic digest — is to be confirmed with Eliz at WMCA before implementation. A separate inbox (e.g. gaps@streetsupport.net) with a weekly digest is the recommended model to prevent volume overwhelming a personal inbox. This decision is parked pending that conversation.

**Hardcoded National Organisations**

The following national organisations are referenced in non-housing pathway floors. They are hardcoded and cannot be substituted by service matching results.

|                          |                                               |                   |                         |
|--------------------------|-----------------------------------------------|-------------------|-------------------------|
| **Organisation**         | **Contact / URL**                             | **Category**      | **LGBTQ+ modifier**     |
| NHS 111                  | 111 (phone) / 111.nhs.uk                      | Health            | No (universal)          |
| LGBT Foundation          | 0345 3 30 30 30 / lgbt.foundation             | Health            | Yes — LGBTQ+ users only |
| Turn2Us                  | 0808 802 2000 / turn2us.org.uk                | Financial Help    | No                      |
| Citizens Advice          | 0800 144 8848 / citizensadvice.org.uk         | Advice Services   | No                      |
| Jobcentre Plus           | gov.uk/contact-jobcentre-plus                 | Work / Employment | No                      |
| National Careers Service | 0800 100 900 / nationalcareers.service.gov.uk | Training          | No                      |

**What the VA Must Not Do**

Within non-housing category pathways, the VA must not:

- Surface a national phone number for a Type A category — this creates false hope for a need that requires physical access

- Omit the honest acknowledgement for a Type A category zero-match

- Frame the national floor as a guarantee that support will be provided — it navigates, it does not promise

- Apply the LGBTQ+ modifier to categories where it is marked as not applicable

- Generate category-specific advice or information in its own words — all signposting uses phrasebank content

- Present a zero-match as an error — it is a valid, honest outcome

- Omit the NO_SUITABLE_PATHWAY analytics signal for zero-match outcomes

**Governance**

This contract must not be overridden by convenience, automation goals, or service matching defaults.

Changes that require governance review:

- Adding or removing a national floor organisation

- Reclassifying a category between types A, B, and C

- Changing the honest acknowledgement language pattern

- Adding or removing an LGBTQ+ modifier for any category

- Changing the zero-match analytics signal specification

Authority rests with the Managing Director. Changes affecting user-facing content require phrasebank review. Changes affecting routing logic require a corresponding code change and test update.

Review triggers: at least annually, after any material change to the national organisations listed, or following a pattern of zero-match signals indicating a sustained service gap.

Street Support Network VA • Non-Housing Pathway Endpoints Contract v1.0 • 28 February 2026
