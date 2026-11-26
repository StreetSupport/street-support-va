> Converted on 2 October 2026 from `Early_Prevention_Pathway_Design_Note_v2_0.docx` (sha256 7076d3cca2830c8a6e7f60f887b05a4da3963de54639afb6252c131aeb17a3a1), supplied by the Managing Director. This Markdown file is the source under the repository's direction rule; the Word file was the only previous copy and is now a derived record.

> **Note, 2 October 2026 (Managing Director): this design needs an overhaul once the WMCA work is complete.** It feeds prevention cards from the old classifier's output, using phase and finding status. Since it was written, the 23 September decision (Pathway Position, Not Phase, PR #115) set prevention surfacing by whether a service helps people who are pre-crisis, with phase as analysis only, and the V4 migration replaces classifier output with determinations. The architecture carried from v1.1 (single gate, four modes, question minimisation, buttons and text) is not in question. What feeds the cards, and how they are chosen, is. Do not build from sections 3 and 6 as they stand.

Street Support Network Virtual Assistant

*Design Note*

**Early Prevention Pathway Design Note**

|                       |                                                                                                                                                                                                                                                                                                                                                                   |
|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Status**            | Working draft for James sign-off                                                                                                                                                                                                                                                                                                                                  |
| **Version**           | 2.0                                                                                                                                                                                                                                                                                                                                                               |
| **Date**              | 2 July 2026                                                                                                                                                                                                                                                                                                                                                       |
| **Author**            | Matt Lambert                                                                                                                                                                                                                                                                                                                                                      |
| **Review required**   | James Cross                                                                                                                                                                                                                                                                                                                                                       |
| **Supersedes**        | Prevention Pathway Design Note v1.1 (30 April 2026). Retitled at v2.0 to Early Prevention Pathway Design Note. Same lineage, same v1.0 and v1.1 history.                                                                                                                                                                                                          |
| **Related documents** | v1.1 (settled architecture, carried forward), Service Matching Contract v2, VA Analytics Contract v2.0, AI Usage Boundaries Contract, Safeguarding Contract v3.2, Prevention Classification Architecture Note v1.0, Housing Stability and Pathway Role Model Reference, Neutrality Principle Note (June 2026), Board Report (June 2026, place-to-start principle) |

**Purpose**

This note updates the design for the early prevention pathway in the Virtual Assistant. Version 2.0 carries forward the architecture settled in v1.1 and applies the corrections reached in the 26 June review and the 1 July pathway role work. It is a design proposal for James, not a governance contract.

The architecture proposed in v1.1 stands. The single gate, the four modes, the question minimisation, the buttons-and-text pattern, the reduced AI layer, the card surfacing and the phasing are unchanged. What changes is narrower: how routing is framed, what the pathway surfaces, the data contract that feeds it, the addition of place to start, and the weight given to analytics. One shift proposed at review is withdrawn because v1.1 already carried it.

One framing point carries through this version. The VA is not fundamentally surfacing services. It is helping a person take the next step in their housing stability journey. The services surfaced are the means to that step, not the end. This aligns the design with the pathway role model and changes wording, not architecture.

**Scope: what early prevention means here**

Prevention is a broad idea across SSN's model. It runs through the whole pathway and includes preventing repeat homelessness, which is a Rebuild function. This note is narrower. It covers early prevention only, the work before crisis. In the risk trajectory that is the Strengthen phase and the at-risk boundary into Respond.

So two things sit outside this note by design. Crisis routing, which the VA already handles and this note only hands off to. And the Rebuild end, including repeat-homelessness prevention, which is a different part of the journey. Naming this keeps the two senses of prevention apart, so a reader does not expect the Rebuild work here.

A naming note to avoid confusion. The VA feature this designs is still called the prevention pathway in code, and the gate is still PREVENTION_CONVERSATION. The document is titled early prevention because that is its scope. The feature name in the codebase is unchanged.

**What changed from v1.1**

Six items. Five reshape the design. One is a flag now resolved. Each is set out below with what it corrects.

**1. Protective factor is metadata, not a routing input (correction)**

v1.1 named three governing questions: pathway position, protective factor, and housing imminency. In practice only pathway position and imminency decide the mode. The factor question captures what the user wants help with. It does not route.

The correction is to make that explicit and to hold one further line. Matching within the prevention pool runs on service category, through the existing service matcher. It does not join on the classifier's primary_factor field. primary_factor stays analytical metadata. It never becomes the join between a user and a service.

This matters for the governance tier. The key rule holds that making primary_factor a VA routing input would be a Tier 3 decision. Because nothing here routes or joins on factor, the pathway stays Tier 2.

**Withdrawn:** the proposal to reduce the factor list from seven to five. v1.1 already made that change on 30 April. The five factors, finance, mental health, physical health, housing and safety, stand as the framing for the need question, with relationships underneath. They are metadata, not a routing spine.

**2. The surfaced pool is Strengthen plus targeted, human-determined (appropriateness gate)**

The prevention pathway surfaces only organisations that human review has placed in the Strengthen phase with targeted intentionality. This is read from finding_status in the operational schema. It is the filter we were already exploring, now stated as a rule.

Strengthen phase alone is not the filter. Universal provision that happens to sit in Strengthen is out. Targeted intentionality is the line, and it is a person's determination, not the classifier's. The classifier proposes a placement. Human review disposes. The pathway reads the disposed result, not the classifier output.

Intentionality is determined through the platform governance process. It reflects the service's primary purpose, not its self-description or the classifier output. This ties the prevention pathway back to the same scope test used across the platform, so the VA and the wider governance framework read intentionality the same way.

**3. The operational schema is the data contract feeding the cards**

v1.1 referred loosely to strengthen-phase findings-status services. There is now a named operational schema carrying phase, primary_factor, intentionality and finding_status. v2.0 names it as the contract that feeds the cards.

Untested services are excluded. A service with no finding_status is not surfaced. The pathway shows only what a person has reviewed.

**4. Place to start surfaces in prevention upstream (new)**

v1.1 predates the place-to-start role, so it did not carry it. Place to start is the relational entry point for someone who arrives not yet knowing what they need. It belongs in prevention upstream mode, above the targeted specialists, because that is where entry points sit on the pathway.

It is confirmed, not detected. It is established by conversation with Eliz and held in the confirmed place-to-start register. It reaches the VA as a curated designation, not something the data computes. It is a navigation marker, not a quality mark, so neutrality holds. We show who holds the role. We do not rank.

There is a data-flow question underneath this. The confirmed register sits outside the VA repository, and the VA endpoint files are governed by the Housing Pathway Endpoints Contract. How the designation reaches the VA without the two sources drifting is a cross-repo dependency to design deliberately. It is flagged here, not solved.

**5. Analytics is part of the design's purpose, not a follow-on**

v1.0 listed prevention analytics as a later governance document. The board now rests the funder and WMCA conversations on measuring behaviour, not activity. Prevention is where behaviour change would show. So the events are designed in from the start, not bolted on afterwards.

Events to capture: mode entered, need disclosed, mode transitions, place to start surfaced and engaged, card expand, and exit mode. These extend the VA Analytics Contract v2.0 events list.

**6. The prevention precedent-log question is resolved**

No separate prevention precedent log is needed. The determination register is the binding artefact for phase. Because factor never routes, the Tier 3 factor-as-routing question does not arise. The pathway reads review-corrected operational output, so the design does not need a new log instantiated.

**The routing spine, corrected**

Two questions route. Pathway position and housing imminency decide the mode. The need question captures the user's situation, maps it to service categories for matching, and helps the user order their own thinking. It does not decide the mode and does not join on primary_factor.

The four modes are unchanged from v1.1. Mode is determined by pathway position and imminency, as below.

| **Mode**            | **Pathway position** | **Imminency** | **Response shape**                                                                                                              |
|---------------------|----------------------|---------------|---------------------------------------------------------------------------------------------------------------------------------|
| Prevention upstream | Pre-risk             | Not relevant  | Support the next step. Surface place to start plus targeted Strengthen services for the need named. No housing framing imposed. |
| Prevention at-risk  | Risk emerging        | Not imminent  | Support the next step. Surface targeted Strengthen services plus the housing prevention floor. Offered, not pushed.             |
| Crisis              | Imminent             | Imminent      | Hand off to existing crisis routing. No new architecture.                                                                       |
| Post-housing        | Post-loss            | Not relevant  | Existing housing pathway. Unchanged. Rebuild pathway out of scope for this note.                                                |

Everything else in v1.1's routing stands unchanged: question minimisation, the user-facing question framing, the buttons-and-text pattern, and the reduced AI layer scoped to clarity assessment and phrasebank selection only.

**The surfaced pool and matching**

Within a mode, the pathway supports the user's next step by surfacing services from the human-determined pool: Strengthen phase, targeted intentionality, finding_status present. Matching to the user's stated need runs on service category, through the existing service matcher. The matcher is not changed and does not read primary_factor as a join key.

In prevention at-risk mode, three universal endpoints form a baseline: Citizens Advice, the council Housing Options for the user's local authority, and Shelter. In prevention upstream mode, no housing endpoints surface unless the user raises housing, because that mode is for people whose housing is not yet in view.

**Place to start surfacing**

Place to start is a navigation role, not a specialist intervention. It is surfaced first because its purpose is to help someone who cannot yet name their need begin their journey. That is what distinguishes it from the targeted specialists, which work a named factor.

In prevention upstream mode, place-to-start organisations surface as relational entry points, drawn from the confirmed register for the user's local authority. They sit above the targeted specialists in the response, as the first thing offered to someone who does not yet know what they need. Where a borough has no confirmed place to start, none is surfaced, and that absence is a finding for the completeness work, not something the VA invents.

**Relationship to the pathway role model**

The pathway role model defines the full set of roles a complete journey needs, across Strengthen, Respond and Rebuild. This design uses those roles only at the point they are surfaced to a user in prevention. It does not implement the completeness model inside the conversation flow.

So the absence of, for example, move-on or relational reintegration handling in this note is scope, not a gap. Those roles live in the mapping and completeness work, which reads the same journey for a different purpose. This note is prevention routing only.

**Governance and tier**

The pathway stays Tier 2. James signs off the platform work. The board settled the place-to-start principle through Catherine, recorded in the June board report. Nothing in this design routes or joins on protective factor, so no Tier 3 trigger arises.

Contracts touched: the Service Matching Contract for matching within the pool, the VA Analytics Contract v2.0 for the new events, and the AI Usage Boundaries Contract for the clarity-assessment amendment already flagged in v1.1. If a place-to-start designation is written into the VA endpoint files, the Housing Pathway Endpoints Contract and the Safeguarding Contract apply to that data. Safeguarding triggers are unchanged and fire from prevention as from any gate.

**Dependencies and sequencing**

The design decisions in this note do not need the determination writeback. The build does. Any pool count or figure must run off corrected phase, not the classifier spine. The writeback lands the reviewed phase into the migration precedent log. So implementation waits on the writeback, the design does not.

The cross-repo data flow for place to start, from the confirmed register to the VA endpoint layer, is the other dependency and is carried as an open question below.

**What stands unchanged from v1.1**

Carried forward without change: the single PREVENTION_CONVERSATION gate, the four-mode state model, the turn shape, the exit conditions, the buttons-and-text input pattern, the AI layer scope and limits, the endpoint card behaviour, the compatibility checks against existing VA design, and the three-phase implementation plan. Refer to v1.1 for the detail of each.

**Open questions for James**

**1. Phrasebank library structure**

Carried from v1.1. The library holds user-facing wording, situational button options, clarification prompts, and mappings to technical state. James to direct on the data shape and on whether it lives in the existing phrasebank file or alongside it.

**2. Mid-conversation step-back**

Carried from v1.1. Letting the user revisit an earlier turn, and how that interacts with the append-only disclosure pattern. May be deferred if loop-back comes naturally from the conversation cycle.

**3. Place-to-start data flow across repositories (new)**

The confirmed place-to-start register sits in the pipeline side. The VA endpoint files sit in the VA repository under contract. How the designation reaches the VA as a single source of truth, without the two drifting, needs a deliberate design. A shared reference or a governed copy, not an ad hoc export.

**Document history**

| **Version** | **Date**      | **Change**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|-------------|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 2.0         | 2 July 2026   | Retitled from Prevention Pathway Design Note to Early Prevention Pathway Design Note, to separate early prevention from the broader prevention idea including repeat-homelessness prevention. Added a scope section naming that boundary. Carries v1.1 architecture forward. Corrects the routing framing: protective factor is metadata, matching runs on category, primary_factor is never a join or routing input, pathway stays Tier 2. Withdraws the seven-to-five factor change as already made in v1.1. Names the surfaced pool as Strengthen plus targeted, human-determined via finding_status. Names the operational schema as the data contract and excludes untested services. Adds place to start surfacing in prevention upstream as a curated navigation role. Elevates analytics to part of the design's purpose. Records the prevention precedent-log question as resolved. Flags the cross-repo place-to-start data flow as an open question. |
| 1.1         | 30 April 2026 | Protective factor list reduced from seven to five. Access and social removed. Q2 button options adjusted to match.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 1.0         | 28 April 2026 | Initial draft. Three governing questions, four routing modes, question minimisation, user-facing framing, buttons-and-text pattern, reduced AI layer, card surfacing, three-phase implementation, two open questions for James.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

Design note \| Version 2.0 \| Working draft \| 2 July 2026
