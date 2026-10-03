> Source copy, converted 2 October 2026 from `VA_Analytics_Contract_v2_0.docx` (sha256 8a1b8f7549c9a9c719298238581579f9eedee54b5a825c044d6527e1c2e2d084), supplied by the Managing Director. This Markdown file is the source under the repository's direction rule; the Word file was the only previous copy and is now a derived record. Content unchanged.

**Street Support Network Virtual Assistant**

**Analytics Contract**

*Document type: Governance Contract*

*Status: Draft*

*Version: 2.0*

*Last updated: March 2026*

**Purpose**

This contract defines what the Virtual Assistant may and may not capture, store, and analyse.

It specifies:

- what events must be logged

- what data is permitted

- what data is explicitly forbidden

- how user feedback is handled

- what operational intelligence is collected and why

This contract exists to ensure analytics remain safe, proportionate, and aligned with Street Support Network values.

**Design Principles**

- Homelessness is understood as the end point of accumulated risk, not a binary state. Analytics are used to understand patterns of pressure, access barriers and system strain, not to classify, score or predict individuals.

- Analytics operate on aggregate patterns only. No individual profiling, cross-session linkage or person-level analytics is permitted.

- Session identifiers are single-use and non-linkable by design. Any change to this architecture constitutes a material governance change.

- Free-text inputs, disclosures and conversational content are not captured or analysed, except where explicitly permitted under the feedback exception (see section below). Learning is derived from paths taken and outcomes reached.

- Where small numbers or rare pathways increase inference risk, analysis is intentionally constrained. This is a design principle, not a technical accident.

- Geographic analysis is intentionally limited to local authority level. Any move to finer granularity (e.g. ward level) triggers governance review.

- Access to analytics outputs is treated as a risk-bearing design choice and is set deliberately, not by tooling defaults.

- Any material change to scope, granularity, linkage or use requires explicit review against these principles.

**Analytics Scope**

Analytics operate at:

- session level only

- no cross-session linkage

- no user identification

**Required Event Types**

**Routing Events**

- Route selected (Generic / Tailored)

- Route switched (with reason flag)

- Decision tree endpoint reached

**State Resolution Events**

- Routing-critical variables resolved (YES / NO / UNCLEAR)

**Mode Events**

- Advice Mode entered

- Advice Mode exited

**Safeguarding Events**

- Safeguarding pathway triggered

- Safeguarding exit completed

**Terminal Outcome Events (exactly one per session)**

- Support pathway delivered

- Safeguarding exit

- No suitable pathway

- User exited early

- Consent declined

**Service Engagement Events**

- Service card expanded (category, LA, org name, service name, section header, position)

- Service link clicked (category, LA, org name, service name, link type: phone or website, position)

**System Events**

- API failure (stage-level flag only, no content)

- Session timeout

- Unexpected system state (for reliability and debugging only)

**Permitted Data Fields**

- Enumerated state values

- Boolean flags

- High-level location category (local authority)

- Timestamp (session-relative)

- Service engagement variables (org name, service name, category, position)

- Operational intelligence variables (enumerated, session-only, as defined below)

- Structured feedback rating (enumerated, as defined below)

**Operational Intelligence**

The following operational intelligence fields are permitted as session-level variables. They do not affect routing. They are collected under a separate lawful basis (legitimate interests for operational improvement) documented in the Data Minimisation and Lawful Basis Note v1.1.

|                |                                                                                     |                                                                                                                                                      |
|----------------|-------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Field**      | **Permitted values**                                                                | **Purpose**                                                                                                                                          |
| accessLocation | Enumerated: home, library, day centre, hostel, street, other                        | Accessibility monitoring. Ensures service works across devices and contexts used by the target population.                                           |
| returnUser     | Enumerated: first time, used before, not sure                                       | Reach intelligence. Self-reported, not tracked. No cross-session linkage. Answers WMCA reach question without building individual tracking.          |
| returnOutcome  | Enumerated: contacted a service, did not contact, not applicable, prefer not to say | Outcome measurement. Asked of returning users only. Closest available proxy for system effectiveness. No service names or contact details collected. |

All operational intelligence fields are subject to the following constraints:

- **Session-only:** values exist within a single session and are not retained beyond aggregate analytics.

- **Enumerated:** values must be selected from the defined options. Free-text responses are not permitted.

- **Non-linkable:** operational intelligence fields must not be cross-referenced with profiling variables in a way that could reconstruct individual journeys. Individual-level queries combining operational intelligence with pathway data are not permitted. Aggregate queries are permitted.

- **Optional:** all three questions can be declined or skipped without affecting routing or service quality.

Operational intelligence data may be used in aggregate reporting and shared with WMCA and LA partners in aggregate form only. Individual-level operational intelligence must not be shared externally.

Adding further operational intelligence fields requires a new amendment with documented purpose and lawful basis.

**Feedback Collection**

At session completion (terminal output or safeguarding exit delivered), users may optionally provide feedback about service quality. Two forms of feedback are permitted.

**Structured Feedback**

A post-session rating may be collected:

*"Was this helpful?"*

- Yes — I found what I needed

- Partly — I got some useful information

- No — I couldn’t find what I needed

This structured response may be stored with session data as it contains no free text and presents minimal inference risk.

**Free-Text Feedback**

Users may optionally provide free-text feedback about service quality. This is a bounded exception to the general prohibition on free-text capture. It is permitted because at the feedback stage routing is complete, the user is commenting on the tool rather than their situation, and explicit opt-in restores user agency.

**Explicit opt-in required**

Feedback must not be requested by default. The user must actively choose to provide feedback after being presented with the option. If the user declines or does not respond, no feedback prompt is shown.

**Purpose transparency**

If the user opts in, the purpose must be stated before the input field.

**De-linked storage**

Free-text feedback must be stored in a separate data store from session pathway data. The feedback record may contain: timestamp, local authority (area-level only), terminal type reached, feedback text (after PII scrubbing), and structured rating if provided.

The feedback record must not contain: session ID, profile variables, gates visited or pathway taken, or any field that could link feedback to a specific session.

**Automated PII scrubbing**

Before storage, feedback text must be processed to remove patterns matching: UK postcodes, phone numbers, email addresses, URLs, names (common name dictionary matching), National Insurance numbers, and dates of birth. Scrubbing is applied automatically before write. Scrubbed content is replaced with \[REDACTED\].

**No cross-referencing**

It must not be possible to query feedback by session characteristics. Feedback is analysed in aggregate only, or as individual comments without session context.

**Retention**

Feedback data follows the same retention period as aggregate analytics, with annual review.

**Access control**

Feedback data access is limited to Street Support Network staff responsible for service improvement. Aggregate summaries (not raw feedback) may be shared with WMCA and LA partners. Raw feedback text must not be shared externally without review and redaction.

**Feedback Data Architecture**

|                   |                                                    |                    |
|-------------------|----------------------------------------------------|--------------------|
| **Data store**    | **Contains**                                       | **Can link to**    |
| Session analytics | Pathway, profile flags, outcome, structured rating | Nothing external   |
| Feedback store    | Timestamp, LA, terminal type, scrubbed text        | Nothing — isolated |

Technical controls: feedback API endpoint must not accept session ID; feedback database table must have no foreign key to sessions; PII scrubbing must run server-side before write; audit log must record any access to raw feedback.

**Explicit Exclusions**

The following must never be captured:

- free-text input (except under the feedback exception above)

- names or contact details

- full postcodes or addresses

- conversation transcripts

- inferred characteristics

**Governance**

This contract:

- must not be overridden by convenience or tooling defaults

- takes precedence over ‘helpful’ logging

- must be reviewed if scope or functionality expands

- reflects Street Support Network’s role as neutral infrastructure, not a monitoring system

Any proposal to link feedback to session data, to change operational intelligence fields from enumerated to free text, to add new operational intelligence fields, or to cross-reference operational intelligence with profiling data at the individual level must be treated as a material governance change requiring explicit review against the design principles.

Monitoring: quarterly review of feedback volume by LA and terminal type (aggregate), PII scrubbing effectiveness (sample review), actionable insights extracted, and any incidents or near-misses.

**Approval**

|                   |          |          |               |
|-------------------|----------|----------|---------------|
| **Role**          | **Name** | **Date** | **Signature** |
| Data Controller   |          |          |               |
| Technical Lead    |          |          |               |
| Safeguarding Lead |          |          |               |

**Document History**

|             |               |                                                                                                                                                                                                                                                     |
|-------------|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Version** | **Date**      | **Change**                                                                                                                                                                                                                                          |
| 1.0         | February 2026 | Initial contract. Session-only analytics, no personal narrative retention. Approved baseline.                                                                                                                                                       |
| 1.1         | February 2026 | Amendment 1: Feedback Collection Exception. Bounded exception for post-session free-text feedback with de-linked storage, PII scrubbing, and access controls. Structured feedback (post-session rating) confirmed as permitted within session data. |
| 1.2         | March 2026    | Amendment 2: Operational Intelligence Exception. Three enumerated session-level fields (accessLocation, returnUser, returnOutcome) added with documented purpose and lawful basis.                                                                  |
| 2.0         | March 2026    | Consolidated contract. Baseline and both amendments merged into single document. Service engagement events added (card expand tracking, link click tracking). PII scrubbing appendix absorbed into feedback section.                                |

*Governance contract │ Version 2.0 │ March 2026*
