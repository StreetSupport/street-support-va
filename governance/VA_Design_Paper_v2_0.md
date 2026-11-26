# Virtual Assistant Design Paper

*Version 2.0, draft for review, 26 November 2026. From the Managing Director. Replaces the Service Matching and Questions Design Note v1.1 (13 November 2026, updated to 23 November), which is carried in full as Part C.*

This paper is the single place where the virtual assistant's design is recorded. It brings together the design work held across the assistant repository, the pipeline repository and the original phrasebank, and checks it against the Phase Framework v0.3 and the WMCA report of 6 October 2026.

It records design: what the assistant asks, what it shows and why. It does not replace the contracts, which carry their own approval routes (section A.1). Where the design needs a contract change, the paper says so and the change goes through that contract's route.

Each decision carries its source. Anything marked *proposed* is not yet decided. Section numbers in Part C are Part C's own, as they were in the design note, so earlier references to "section 3.5" and so on still hold.

---

# Part A. About this paper

## A.1. What it covers, and what governs alongside it

**This paper covers:**

- purpose, principles and how the assistant places a person (Part B);
- what it asks and how it chooses services (Part C);
- the routes designed in their own notes: crisis and safeguarding exits, the safety disclosure check, age, the quick route, immigration, children and pregnancy, care leavers (Part D);
- live service data, area restrictions and fixed contacts (Part E);
- how the design got here (Part F);
- the check against the Phase Framework and the WMCA report (Part G);
- outstanding items, grouped by status (Part H).

**Governed separately, each by its own approval route:**

- the Safeguarding Contract (v3.3 for trustee ratification, 11 November 2026) and the Safeguarding Governance Note v3.3;
- the Service Matching Contract (newest v3.2, 22 November 2026, on `align/adults-18-contract-2026-11-23`);
- the Housing and Non-Housing Pathway Endpoints Contracts;
- the VA Analytics Contract v2.0 and its amendments;
- the Data Minimisation and Lawful Basis Note v2.0, the GDPR Implementation Map and the AI Usage Boundaries Contract;
- the AI Policy v3.0 and the Governance Overview v3;
- the Accessibility Alignment Note v1.0, with Part C section 14.

The contracts are the technical lead's to maintain. Four of them await board ratification (Part C, work item 7).

## A.2. Where the design stands against the build

The design runs ahead of the code. Readers should not take a design statement here as a description of what the assistant does today. Two examples matter most:

- **The housing situation question** (Part C, section 2) is built on branches (`fix/housing-situation-2026-11-03` and later branches that carry it) but is not on `staging`, the repository's default branch, as at 26 November 2026. Until it lands, the assistant still asks "Are you currently experiencing homelessness?" and sends everyone who is housed down one prevention route.
- **The prevention route in the code** still asks "How urgent does this feel right now?" and treats an eviction notice as a reason for prevention. Under this design, someone who is going to lose their home is in crisis while still housed (Part B, section B.3). Part G records this as a gap between the build and the design.

## A.3. Documents this paper absorbs

These documents are carried into this paper. Each stays in the repository as the record of how a decision was reached. Where this paper and one of them disagree, this paper governs. Where the new parts of this paper and Part C disagree, A.4 settles it; neither is resolved silently.

| Document | Newest copy (26 November 2026) | Where it now sits |
|---|---|---|
| Service Matching and Questions Design Note v1.1 | `align/adults-18-design-note-2026-11-23` | Part C, in full |
| VA V4 Redesign Design Note (4 November) | `align/population-asking-redesign-2026-11-08` | Decisions carried in Part C; who the assistant is talking to, and safety in a facilitated conversation, in B.4. Its design check and variants review stay as working records |
| VA Pathway Review (31 October) | `align/population-asking-proposal-2026-11-08` | Decisions in B.2, D.1 and D.4; its open items in Part H |
| VA Design and Service Matching Proposal (1 November) | same branch | Its orientation map in B.1 and B.2; its tracker is replaced by Part C's work list |
| VA Decisions and Delivery Extract (2 November) | same branch | Superseded by Part C's work list (section 12). Its parked items (3.2 closing intention question; 3.3 aftermath listings; 3.6 local contact line; 3.8 duration as a routing input) are carried in Part H |
| VA Question Purpose Register (31 October) | same branch | Answers recorded in Part C, section 10. Its "Prevention (housed, at risk)" heading is superseded by B.3 |
| VA Service Data Proposal (31 October) | same branch | E.1 |
| VA Area Restrictions Proposal (2 November) | same branch | E.2 |
| VA Trans Answers papers (31 October) | same branch | Part C, section 5: trans and non-binary answers exclude nothing until decided. Fixed: the assistant never shows whether an organisation accepts trans people (Decision Paper, point 3) |
| Safety Disclosure Check Design Note v1.0 | `docs/safety-disclosure-check-note-2026-11-19` | D.2 summarises; the note keeps the trigger list (Appendix A) |
| Mid-Conversation Age Detection Design Note v1.3 | `align/adults-18-contract-2026-11-23` | D.3 summarises; the note keeps the triggers and tests |
| Immigration Questions Redesign (12 November) | `docs/immigration-redesign-2026-11-12` | D.5 |
| Quick Route Design Note v1.1 (March) | `staging` | D.4 |
| Early Prevention Pathway Design Note v2.0 (July) | `staging` | Superseded, except its architecture: its own note of 2 October says the single gate, four modes, question minimisation and buttons and text are "not in question", and not to build from its sections 3 and 6. Part C, section 10 records what replaced those |
| Virtual Assistant Principles in Practice (March) | `staging` | B.2 |
| VA Prevention Pathway: Service Pool note (May, pipeline) | pipeline `main` | Superseded on routing: it says phase routing is for the assistant at runtime. Phase is not the routing proposition (B.3) |
| VA matching: redesign proposal (11 November, pipeline) | pipeline `records/wmca-reading-pass-2026-11-11` | The build plan for Part C. Its decisions of 11 November are carried in B.2. Stays a working record |
| VA routes and follow-ups (12 November, pipeline) | pipeline `records/wmca-gaps-2026-11-12` | Hospital, prison and veterans routes, now in Part C sections 2 and 3.3 |
| VA go-live readiness technical paper (pipeline) | pipeline `align/rules-readiness-2026-11-10` | Not design. Stays as the go-live audit method |
| Children and pregnancy write-up (26 November) | Claude Docs, outside the repositories | D.6 |
| Care leavers living in a different area (20 November) | Claude artifact, outside the repositories | D.7: the reasoning for the out-of-area decision |
| CHAR_VA_Phrasebank_v7.md, with its v7.1 "Watson Feature Parity" changes (1 February 2026) | Committed unchanged to `governance/` with this paper (Managing Director, 26 November 2026) | Part F: the design record of the original |
| CHAR_VA_RoutingLogic_v7.md, routing logic for the phrasebank (v7.1, 1 February 2026; its closing line reads v6.8) | Committed unchanged to `governance/` with this paper (Managing Director, 26 November 2026) | Part F: the routing record of the original |
| Phase Framework v0.3 (adopted 28 September 2026) | pipeline `align/break-at-loss-of-home-2026-10-06`; pipeline `main` carries only v0.1 | Not absorbed: it is the framework this paper is checked against (B.3, Part G) |

`VA_BACKLOG.md` stays the open-work log. It is not a design source.

## A.4. Decisions of 26 November 2026 that amend Part C

Part C is carried word for word, so these amendments are recorded here and govern where Part C says otherwise. All are the Managing Director's, 26 November 2026.

1. **The position "Prevention" is renamed "Before a crisis"** in the design and in code comments. The words people see are unchanged. Prevention is an outcome, not a position (PH-M06; B.3).
2. **"The materialisation check"** (Part C, section 3.5) means the housing situation question: "going to lose it" is crisis, still housed.
3. **The question test in Part C, section 3.1 is widened** to the principle in B.2: ask a question only when its answer makes a meaningful difference to the support, guidance or explanation the person receives.
4. **Household and gender** (Part C, section 3.3, item 7) are asked as separate questions on the same step, one topic each.
5. **People leaving prison or hospital** (Part C, section 2) are labelled "Crisis, leaving with nowhere to go: the loss has materialised", not "Crisis, home lost". The answer assumes they have not yet left and can still reach prison or hospital staff. Someone who has already left is in a different situation and would describe it differently, for example as sleeping rough. Routing is unchanged.
6. **The eviction and family reasons inside prevention** come out, or are reworded, once the housing situation question lands. "Going to lose it" is answered once, at that question (G2.1, G2.2).
7. **The prevention route's dependants question** asks about dependent children only. Pregnancy is not part of that trigger (G2.10).

---

# Part B. Foundations

## B.1. What the assistant is for

Street Support Network runs the platform that lists local services, so that people, and the services themselves, can find help. The assistant is one way into that platform: it helps a person, or someone helping them, reach the right local help through a conversation instead of a search.

The WMCA report of 6 October 2026 sets out the part a platform can play (Evidence report, "The platform's part"). In short:

- people do the noticing and the connecting, and keeping a person's whole situation in view is always a person's work;
- the assistant can support the conversation in which noticing happens, helping someone describe more than one pressure, including on another person's behalf;
- it can carry some of the connecting, by showing the next step at each point on the journey;
- it does not assess risk, and it cannot look after anyone.

That is the assistant's remit. The design lens of 4 November 2026 turns it into four outcomes: noticing, visibility, connection and holding (VA V4 Redesign Design Note, "The design lens"). Part C, section 3.5 carries the noticing step. Holding, which is about transition, is parked for the assistant (Part H, H1).

## B.2. Principles

**The eight governing principles** (Virtual Assistant Principles in Practice, March 2026) still hold: AI supports but does not decide; safeguarding is non-negotiable; no inference without the person's confirmation; uncertainty is acknowledged, not hidden; the system stands alone if AI is unavailable; privacy and dignity are preserved by design; safety is not traded for performance; and every person leaves with somewhere to turn.

**Decided since** (Managing Director, 31 October 2026, unless stated):

- **The assistant surfaces facts and never applies them.** It never tells anyone they are in priority need or entitled to anything, and it never says a council must do something, has to, or has a duty. Softer words such as "should", "may" and "will" are deliberate and stay: "may" is deliberately vague and commits nothing (Managing Director, 26 November 2026, keeping the original's "The council should assess your situation", "local support services may prioritise your case" and the leaving care line "They will look at your situation with you"). Where the council is the right route, it makes the council prominent and presents it as a helpful first place to explore options, in the original phrasebank's voice: "usually", "often" and "may", and something practical to tell them. (Managing Director, 26 November 2026.)
- **Street Support Network points people to other organisations.** It never gives its own phone number or contact details, and never contacts people directly. (Managing Director, 26 November 2026.)
- **The assistant is a set of pathways.** Each housing outcome has a complete pathway ending in a useful set of next steps.
- **Questions.** Ask a question only when its answer makes a meaningful difference to the support, guidance or explanation the person receives. That can include helping someone understand why a circumstance matters, or making an existing route more visible. Do not ask only to personalise the tone. (Managing Director, 26 November 2026, refining the 31 October test that a question is asked only while it still changes which next steps are shown.) Every question needs a documented purpose; that is the necessity test for data protection, and the lawful basis is established separately (Part C, section 3.1). Part C, section 3.1's narrower test, that an answer "adds an endpoint or changes the local match", is widened to match (A.4).
- **One topic per question.** No combined questions. (Managing Director, 26 November 2026; the original phrasebank's rule against "any compound question combining two topics".) Part C, section 3.3 item 7's "household and gender together" becomes two questions on the same step (A.4).
- **Restore first, redesign second.** Functions the original design had and the rebuild lost go back first; redesign follows. (Managing Director, 26 November 2026.)
- **Live data, like the website** (Managing Director, 31 October 2026; E.1). **Search by distance, not by council**, with council kept only for statutory routes (Managing Director, 2 November 2026).
- **Groups and restrictions** (Managing Director, 11 November 2026; VA matching redesign proposal): the quick route assumes nothing likely to reduce someone's options and shows open-access, unrestricted services only; a service designed for or restricted to a group is selected only where the person has said the group is relevant; fixed contacts for a group appear only on the same basis; sensitive questions ask whether something is relevant, not who someone is; and a neutral line says that services set their own criteria.

## B.3. Where the person is: position, not phase

Checked against the Phase Framework v0.3, CURRENT, adopted 28 September 2026 (pipeline `align/break-at-loss-of-home-2026-10-06`; pipeline `main` still carries v0.1).

**Phase belongs to services and is not the routing proposition.** Where a journey needs to know whether a service is available before, during or after a crisis, the proposition is the service's established pathway and access position, not its Phase label (PH-R01). Phase, relevance and routing are kept distinct (PH-R02). The assistant places a person by their position on the pathway, from what they say. Nobody is asked to pick prevention. (Pathway Position, Not Phase, pipeline #115, 23 September 2026; Managing Director, 2 November 2026; Part C, section 2.)

**Being housed does not mean before a crisis.** "Being still housed does not establish Strengthen" (Phase Framework v0.3, section 3). A crisis may be materialised before its final adverse consequence occurs. The WMCA report reached the same point from the listings: "We once read crisis response as beginning when the home is gone; the listings showed a crisis can materialise while someone is still housed" (Evidence report, "How the thinking developed"). Crisis help "starts earlier, when a crisis becomes real, while the home can still be saved and often before anyone leaves it" (Main report, 3.5).

**Prevention is an outcome, not a position.** A service can aim to prevent homelessness while operating within Respond, because the crisis has already materialised (PH-M06). So the word "prevention" says nothing on its own about where someone is, and the assistant's position for someone housed and wanting to keep things steady is called "Before a crisis" (A.4).

**The position is set once, at the housing situation question.** That question is reached from the first screen, or from the noticing step (Part C, section 3.5). It places the person from their own answer: before a crisis, crisis still housed, crisis home lost or rebuilding. Everything after it follows from that position. It is not asked again, and the design does not ask questions part way through to re-sort people; the old prevention route's "How urgent does this feel?" exists only because that route had no housing situation question. If the person discloses something new later, the position may need to be re-evaluated, as the safety disclosure check does for safety (D.2). That is expected to be rare. (Managing Director, 26 November 2026.)

**The person's position is not a service's Phase.** Materialisation "establishes something about the person's circumstances. It does not automatically make every service used by that person Respond" (v0.3, section 3). The materialisation test is "an evidence test for reasoning about represented service circumstances", not a statutory assessment, an assessment of vulnerability, a homelessness prediction or a safeguarding assessment (PH-M04 limits). The assistant applies no such test to a person. It uses the person's own answer to the housing situation question.

**How the person's answers line up with the framework's six positions.** For reading the design against the framework only; the assistant does not classify anyone:

| The person's answer (Part C, section 2) | Position in the assistant | Framework position (v0.3, section 17) |
|---|---|---|
| Not sure where to start; cannot yet name what is wrong | Early, before housing is in view | Places to Start (PH-C01), which carries Strengthen |
| One need named, nothing else, where the need is a pressure on stability | Early, before housing is in view | Identified single-factor instability (PH-C02). Not every need is such a pressure: Part C, section 3.7 places most activities at Rebuild |
| Several pressures named at the noticing step | Early; housing may be coming into view | Interacting or accumulated instability (PH-C03) |
| Somewhere to live, want help to keep things steady | Before a crisis | PH-C02 or PH-C03 |
| Somewhere to live, but going to lose it | Crisis, still housed: the loss has materialised | Materialised or imminent crisis before the final adverse outcome (position 4), on the person's own account |
| Leaving prison or hospital, not yet left, with nowhere to go | Crisis, leaving with nowhere to go: the loss has materialised (A.4) | Position 4: a release or discharge date with nowhere to go is a crisis that has materialised (2 November 2026, prison ruling; VA routes and follow-ups, 12 November) |
| Staying somewhere for now; sleeping rough or nowhere tonight (including someone who has already left prison or hospital, who would answer here) | Crisis, home lost | Acute realised crisis (position 5) |
| In a hostel or supported housing, or recently moved in after being homeless | After: rebuilding | Rebuilding towards ordinary stability (position 6) |

## B.4. Who the assistant is talking to

"Who is it for" answers two separate questions. Is the person here? That decides who the assistant speaks to. Is the helper a professional? That decides the tone towards the helper. (Managing Director, 4 November 2026; VA V4 Redesign Design Note, Decision 5.)

| Situation | Speaks to | Tone |
|---|---|---|
| Myself | The person, "you" | Warm |
| Helping someone who is here with me (friend, family or professional) | The person, "you" | Warm, as for myself |
| Looking for someone who is not here: friend or family | The helper, "they" | Warm and reassuring |
| Looking for someone who is not here: professional | The helper, "they" | Plain and direct, no reassurance |
| Not sure, or just trying to find the right place | The person, "you" | Warm |

**Tone can differ; information never does.** Every number, opening hour and option appears in every version (Managing Director, 4 November 2026). Two exceptions stand, from the Supporter and Professional Language Review v1.1: the professional safeguarding exits leave out the NSPCC adult helpline, which is for non-professionals worried about a child, and in one exit word Childline for the professional to pass on to the young person. The variants review of 4 November records that the rule does not reach these and proposes no change. 999 is on every safeguarding exit (VA Pathway Review, 7.1).

**Safety in a facilitated conversation.** The person may not be able to speak freely in front of whoever is typing. The Safety route and the early safety question need a deliberate answer for this, such as a line saying they can come back on their own, or a discreet way to reach help. To be designed with the Safety route, through the Safeguarding Contract. (VA V4 Redesign Design Note, Decision 5.)

**As built today** there are three variants: Self, Supporter and Professional. The facilitated answer, "I'm helping someone who is here with me", was decided on 4 November 2026 (Decision 5, settling the Pathway Review's option C) but is not built.

---

# Part C. Service matching and questions

*Carried in full from the Service Matching and Questions Design Note v1.1 (newest copy, `align/adults-18-design-note-2026-11-23`). Its section numbers are kept. In this part, "this note" means that design note, now Part C of this paper, and "D2" means the data protection notes, not section D.2 of this paper. Nothing below has been reworded for this paper. The decisions of 26 November 2026 in A.4 amend it where they differ, and a note beside sections 2, 3.1, 3.3 and 3.5 points to the amendments that govern them, so that someone building from Part C alone applies the amended rule.*

*Version 1.1, draft for review, 13 November 2026 (version 1.0, 8 November 2026). Tracker item I1 (VA #34). From the Managing Director.*

*Version 1.1 adds when a place to start is offered and when it is not, the onward offer for each need, Employment's noticing step, what "not sure" leads to, the housing-factor specialists for the at-risk route, youth organisations for 16 and 17 year olds, user testing against the narrative, and corrections to earlier records (Managing Director, 12 and 13 November 2026). Section 15 lists the changes.*

This note brings together, in one place, what the virtual assistant asks and how it chooses which local services to show. It gathers decisions already recorded across several documents and pull requests, adds the decisions of 8 November, and corrects earlier records where they now conflict. Section 11 lists what is still open, section 12 the work to complete, and section 13 the review of 8 November.

It creates no new reason to hide a service: exclusion stays within the Service Matching Contract's hard gates. The contract changes it needs (I3a, I3b) go through the contract's own approval.

Each decision carries its source. Anything marked *proposed* is not yet decided.

---

## 1. Purpose

The assistant asks questions so it can offer proper tailored solutions: services that, on the face of what they say and who they serve, fit the person and the point they have reached. It shows a few so the person is not overwhelmed. The rest stay one tap away, so selecting is not hiding and is not treating organisations differently.

Matching aims for a good fit, not the single best fit. It is not an exact science. (MD, 1 November 2026.)

---

## 2. Where the person is: position, not phase

> **Amended by A.4:** item 1, the position "Prevention" is renamed "Before a crisis"; item 5, people leaving prison or hospital are labelled "Crisis, leaving with nowhere to go: the loss has materialised".

**Phase belongs to services, is analytical only and does not route.** For a person, the assistant works out their position on the pathway from what they say. Nobody is asked to pick prevention. (MD, 2 November 2026; Pathway Position, Not Phase, pipeline #115.)

**The first question** offers eight grouped options, each with a second screen: Housing; Safety; Food, clothes or everyday things; Money, debt, benefits or work; Health, drugs, alcohol or gambling; Immigration or asylum; Things to do; Not sure where to start. (VA V4 Redesign Design Note, Decision 1, 4 November 2026.) Safety from harm is on the main menu in plain words. (MD, 2 November 2026.)

**Not sure** leads first to the assistant helping the person work it out, through the noticing step, with the choice to explore it here or with someone in person at a place to start. The assistant does not simply pass people on where it can help now. (MD, 13 November 2026; Design Note, Decision 4.) A place to start is a recommendation, not a need or an entry point. Where an area has none, nothing is offered in its place. (MD, 2 November 2026.)

**Housing positions** are set by the housing situation question, "Which of these is closest to your housing situation at the moment?" (MD, 3 November 2026; VA #40):

| Answer | Position | Housing subcategories matched |
|---|---|---|
| Somewhere to live, want help to keep things steady | Prevention | Advice, through the prevention conversation (section 3.5) |
| Somewhere to live, but going to lose it | Crisis, still housed: the loss has materialised | Advice: local housing and legal advice (Endpoints Contract 1.2) |
| Staying somewhere for now | Crisis, home lost | Emergency accommodation and Supported housing; standard housing endpoints |
| Sleeping rough or nowhere tonight | Crisis, home lost | Emergency accommodation and Supported housing; StreetLink offered, marked urgent |
| Leaving prison | Crisis, home lost | Local services for people leaving prison first, where any, referral-only ones with the line naming the probation officer or the prison's release and housing team; Emergency accommodation and Supported housing; the line that staff there can refer them to the council's housing team; no StreetLink |
| Leaving hospital | Crisis, home lost | Local services for people leaving hospital first, where any, referral-only ones with the line naming the staff looking after them at the hospital; Emergency accommodation and Supported housing; the line that staff there can refer them to the council's housing team; no StreetLink |
| In a hostel or supported housing, or recently moved in after being homeless (new answer) | After: rebuilding | Move-on accommodation and Tenancy setup; Tenancy setup for someone recently moved in |
| Not sure, or something else | Not assumed | Housing Options, the navigator and Shelter |

The rebuilding answer is one answer, not two, to keep the question short; a follow-up can split it if testing shows people do not recognise themselves in it. Housing Options and Shelter stay on the floor. (MD, 8 November 2026.) It changes the question every housing conversation starts with, so it is safeguarding-adjacent and goes to the technical lead with tests for each answer, including each of the rebuilding answer's two cases.

Answers that share subcategories keep their own endpoints, as the Endpoints Contract 1.2 sets them; each is tested on its own (VA #40).

Choosing subcategories by position is required, otherwise the assistant offers services that only appear to match: before loss of home and after loss of home need different help. It is a rule in the assistant, read from the subcategory, with no new platform field. It selects; it hides nothing, and the rest stay behind "See all". (MD, 8 November 2026.)
**Within prevention**, the line is whether housing has come into view, not how many pressures there are. It changes only on what the person states. (MD, 2 November 2026.)

---

## 3. The questions

### 3.1 The test for a question

> **Amended by A.4, item 3:** the question test is widened to the principle in B.2.

**A question belongs if its answer adds an endpoint or changes the local match.** (Working note, 2 November 2026, applied to crisis housing.) There has to be a reason to ask a question. (MD, 2 November 2026.)

Whether a question is worth asking depends on what the answer means for the person, not only on what listings say. An arson conviction matters even though no listing mentions arson, because it adds specialist endpoints. (MD, 8 November 2026; C11.) So the test is not whether tagged services exist in the area (section 10).

**Applied by parent, nationally.** A need asks a question if its parent holds services designed for that group anywhere, or if the answer adds an endpoint. Every area asks the same questions for the same need. (MD, 8 November 2026.)

**Optional, and ordered by consequence.** The extra questions stay a choice. Within each need, questions that add an endpoint or meet a stated restriction come first, then those that only lift a designed-for service. (MD, 8 November 2026.)

**Data protection first.** LGBTQ+, health and ethnicity are special category data and convictions are criminal offence data. Each question on each pathway is written into the data protection notes (D2) before it is built. (MD, 8 November 2026.) The rule above proposes a question; D2 decides whether it is asked. A question whose necessity on a pathway cannot be recorded there is not asked on that pathway. The extra-questions screen is a choice about the conversation, not consent, and is never relied on as a lawful basis.

**Ethnicity** is asked among the extra questions on every pathway that asks population questions, introduced by why it is asked, with both purposes stated: "Some services are run by and for particular communities. If you tell us your ethnicity, we can show you those, and it helps us check we're reaching every community. It's up to you." (Data Minimisation and Lawful Basis Note v2.0, VA #63: consent, both purposes stated; MD, 22 November 2026.) Answers use the five census high-level groups with a short list beneath each (MD, 9 November 2026). Any answer except White British lifts services tagged "Ethnic minority communities"; Prefer not to say lifts nothing (MD, 9 November 2026, superseding the 8 November named-community rule, under which a tagged service was lifted only where the community it names includes the person's census group). The named-community rule was dropped because recording the community each listing names was too much work. Whether an "Ethnic minority communities" lift can really work, when communities cannot be told apart, is to be explored with the technical lead before it is built further. (MD, 22 November 2026.) Reach and equity analysis is aggregate only, under the Analytics Contract's small-numbers limits. (MD, 8 November 2026; register Q1.)

The map is reviewed once the national baseline lands, since national data will add groups to parents.

Prevention may ask more than crisis, because understanding the situation is its purpose. Each exploratory question still carries a documented purpose in the question register. (MD, 2 November 2026.)

### 3.2 Before any pathway

- **Who it is for:** asked early because it sets the framing of every question. (MD, 2 November 2026.) "Not sure" is kept, not silently turned into "myself" (extract 1.10). The conversation carries on in neutral wording, and the person gets the same choice as in section 2: work it out here, or with someone in person (MD, 13 November 2026).
- **Preferred name:** kept, for conversational purposes. Never sent to Claude for interpretation; the under-16 check runs first. (MD, 3 November 2026; VA #38.)
- **Extra questions:** offered as a choice, not a consent gate: "Would you like to answer a few more questions so I can find services that fit you better?" (MD, 3 November 2026; VA #38.)
- **Prefer not to say** is offered throughout and stores nothing. (VA #38.)
- **Route choice:** the quicker route says which circumstances it does not ask about. (MD, 6 November 2026; VA #47.) A targeting question added later goes on the full route only and is named on the route screen; the quick route asks none of them (MD, 20 November 2026).

### 3.3 Crisis housing

> **Amended by A.4, item 4:** household and gender are asked as separate questions on the same step.

In this order (MD, 2 November 2026):

1. The housing situation question (section 2).
2. Safety, early and plainly, including exploitation. A yes moves the person to the Safety pathway, and Housing Options travels with them: the council's housing team is a fixed contact on the domestic abuse results (3.6), and its Safety listing is extra.
3. Age.
4. Care: asked of everyone aged 16 to 24. (MD, 6 November 2026; VA #46.) Worded as "ever been in care". (MD, 2 and 8 November 2026.)
5. "Have you ever served in the armed forces?" (MD, 2 November 2026.) A yes shows Op FORTITUDE, the national route, always, with local services for veterans where any and the standard housing endpoints (MD, 20 November 2026; Endpoints Contract).
6. Immigration status.
7. Household and gender together; pregnancy and children asked of everyone, pregnancy covering a partner.
8. LGBTQ+.
9. Convictions, last.

**Dogs:** "Do you have a dog with you?", with Yes, No and Prefer not to say. Asked inside the household moment, after household and gender, only where the result is accommodation (home lost). It lifts services that take dogs and hides nothing, because "no dogs" is not an established hard gate. On a yes, the assistant shows Dogs Trust's Together Through Homelessness scheme (free vet care and a directory of dog-friendly homelessness services; 020 7833 7611, tth@dogstrust.org.uk, checked at dogstrust.org.uk on 8 November 2026) and one line: "Many places to stay can't take dogs, so it's worth checking with each one before you go." Local vet care is not promised until West Midlands coverage is confirmed. (MD, 8 November 2026.)

**Not asked in crisis housing:** health and disability (listings say too little, so asking would over-promise; recorded as a possible gap in listings and provision); substance use (it would not filter, and Addiction is reached as its own need). (MD, 2 November 2026.)

### 3.4 Sixteen and seventeen

They stay under safeguarding, in a conversation with choice, not a hard exit. (MD, 2 November 2026.)

- One plain question on every housing route: "Are you in care, or in touch with a social worker at the moment?" (MD, 2 and 3 November 2026; VA #39.)
- Asked: children's services involvement, pregnancy and children, LGBTQ+ and immigration. Not asked: convictions and armed forces. (MD, 2 November 2026.)
- Where already involved: "If you need something different, or more help alongside that, these can help too." (VA #39.)
- A young people's prevention route before launch, built around family mediation. (MD, 2 November 2026; C10.)
- **Who they can talk to depends on the borough** (MD, 13 November 2026). Where a youth organisation is commissioned or holds a significant position in the borough, it is the local person to talk to: the youth navigators in the endpoints file (St Basil's in Birmingham, Coventry and Solihull, the last commissioned by Solihull Housing Options; the Young Persons Team at Wolverhampton Homes). Children's services come first where they are already involved, as above. Where a borough has none (Dudley, Sandwell and Walsall at present; Sandwell has St Basil's family mediation), the gap is recorded as for adults (work item 22).

### 3.5 Prevention

> **Amended by A.4:** item 1, "Before a crisis"; item 2, "the materialisation check" means the housing situation question; items 6 and 7, the eviction and family reasons and the children-only dependants question.

- **The noticing step:** after the need, the assistant asks what else is putting pressure on the person, keeps the pressures they name in view together and reflects the link back in approved wording. It rests only on what the person states. (MD, 2 November 2026.) The wording (MD, 8 November 2026): "Thanks. Sometimes one thing is tied up with others. Is anything else putting pressure on you at the moment?" Multi-select, leaving out the need already chosen (health, including how I'm feeling, is left out only for someone who came about mental health: a physical or sexual health need is not the same need; MD, 20 November 2026): money, work or bills; health, including how I'm feeling; family or relationships; drink, drugs or gambling; keeping my home or paying rent; I don't have a settled place to live; feeling unsafe; nothing else; I'm not sure. A skip, "Just show me help with [need]", so declining still gets what they came for. Asked once a conversation (MD, 19 November 2026).
- **The awareness line** is the Managing Director's wording of 2 November 2026. Until the matcher can find one organisation that fits across pressures (it needs the shape field), it ends with a fallback instead (MD, 8 November 2026):
  - *Area with a place to start:* "Thanks for telling me. When a few things are pressing at once, they can start to affect each other, including impacting your housing situation. Here's help with [their need]. If you'd like someone to look at the wider picture with you, [place to start] is a good place to start."
  - *Area without:* "Thanks for telling me. When a few things are pressing at once, they can start to affect each other, including impacting your housing situation. Here's help with [their need]. When you speak to them, it's worth mentioning the other things going on, so they can see the wider picture too."
- **"I don't have a settled place to live"** is an option in the noticing step for every need, leading to the housing situation question. Offered among the pressures, never asked of everyone. (MD, 8 November 2026.) The results for the need they came with come first; housing is then offered as a choice, not entered automatically: "You also mentioned that you don't have a settled place to live. Would you like to look at housing support too?", with "Look at housing support" and "Stay with these results" (MD, 19 November 2026).
- **Essentials and Health** run like Food: one optional noticing step, results either way. For dignity items such as showers and laundry, results come first. (MD, 8 November 2026.) The Clothes choice counts as emergency clothing, so it follows the dignity route (MD, 19 November 2026).
- **Finance crisis entry:** no separate entry. A person whose home is at risk names it at the noticing step, which leads to the materialisation check and the housing situation question. (MD, 8 November 2026, adopting the proposal of 2 November.) As for a settled place to live, their results come first and housing is offered as a choice, worded "You also mentioned that keeping your home or paying rent is putting pressure on you. Would you like to look at housing support too?" (results first and the offer, MD, 19 November 2026; this wording, MD, 20 November 2026.)
- **Once housing is in view:** Housing Options, a housing-factor specialist and Shelter. (MD, 2 November 2026.) The housing-factor specialists are the navigator organisations in the endpoints file (`navigatorOrgs`, `lib/data/housing-pathway-endpoints.json`), shown as fixed contacts for each council. Nothing reads organisation shape at run time; matching more widely by shape stays after launch. (MD, 4 and 13 November 2026.) Someone at risk who would rather talk to someone is offered the local specialist first, then Shelter. The list starts with the organisations clearly in for each borough, and completeness is considered only if a need shows up. Showing an organisation for what it exists to do needs no separate agreement. (MD, 13 November 2026.) Where a borough has none, the gap is recorded in the file, as it is for Dudley and Sandwell, and for adults in Solihull. Additions are listed in section 12, work item 19.
- **Places to start sit on the early side only**, before housing has come into view (places to start crib, section 1, and its rule PTS-PH03, "an accessible crisis way-in is not a place to start"; the crib is not on main: newest copy on the pipeline branch `align/pts-crib-2026-11-10`). They are not offered once someone has come in through housing, or once housing has come into view, because that person has already named the factor that is wobbling (MD, 13 November 2026).
- **When a place to start is offered** (VA V4 Redesign Design Note, Decision 4, 4 November 2026): the person would rather talk to someone; they cannot yet name what is wrong after the noticing step; or they have named something the assistant cannot connect them on for, early in their journey. The awareness line above is the wording for the last two. Places to start count within the five results.
- **When it is not:** in crisis, at any safeguarding exit or for anyone under 16 (PTS-PH03, on the crib branch above, not on main); for 16 and 17 year olds where the borough has a youth organisation, which is offered instead (3.4); on the housing route; and because a search found nothing nearby. Someone who asked for food, said nothing else is going on and found none gets the honest acknowledgement (section 9), not a place to start, because they have told us what they need. (MD, 13 November 2026.)
- **Which places to start:** only those marked "show at the switch" in the handover file (MD, 12 November 2026), read from the places to start collection by organisation and address. Those marked "confirm first" become available as they confirm. The assistant's database login does not yet include the collection (work item 20).
- **How far:** a place to start is offered only within the search radius the assistant already uses for services (`DEFAULT_RADIUS_KM`, 5 km in the code on `staging`). Beyond it, none is offered, and the search for a place to start is not widened as the service search is (section 4). (MD, 13 November 2026; he is checking the distance with the regional coordinator.) In Coventry, the place to start shown at the switch is Bardsley Youth Project, for 16 to 25 year olds; FWT, a Centre for Women, and Canley Community Centre are awaiting confirmation. The regional coordinator is working through the confirmations before the switch, starting where cover is thinnest.
- **Entries:** Finance goes straight to prevention. Addiction gets a full exploration, and the person can always step out and get the addiction services they came for. Activities is not a prevention entry. Essentials is, where the link is financial difficulty. (MD, 2 November 2026.) Employment takes the noticing step, like Finance and Health, because job loss often sits behind money and housing pressure (MD, 13 November 2026: "whatever helps the most with noticing"). This replaces the 2 November line that Employment is not a prevention entry.

### 3.6 Safety from harm

Reached from the crisis gate, the safety question in housing, the main menu or a disclosure. Once on it, the conversation is the same, and nothing already answered is asked again. (MD, 2 November 2026.)

**Safeguarding comes first.** Reusing answers never suppresses a safeguarding exit or reset. The Safeguarding Contract's requirements hold on every entry: prescribed exits bypass the matcher and the AI, a safeguarding signal overrides existing state, the crisis gate runs on every new session or restart, and no failure ends in a dead end. Each entry route is tested for these before the Safety pathway is released, and the technical lead reviews it for safeguarding.

- **Type of harm,** multi-select in plain words: someone close hurting, threatening or controlling me; being forced to marry; FGM; sexual assault; being made to work, having money or documents taken, or being controlled where I live or go; being made to work to pay off a debt; something else. (MD, 2 November 2026.)
- **Then:** whether the person is OK to carry on. A no reuses the matching crisis gate exit exactly as written. (MD, 2 November 2026.)
- **Domestic abuse and sexual violence:** outcomes are access to safe accommodation, someone to talk to, and advice on what I can do. Gender and LGBTQ+ are asked wherever an outcome lists organisations, because orientation or gender changes the organisations and the endpoints. (MD, 2 and 8 November 2026; register Q6.) Access to safe accommodation also asks children and immigration status, because the domestic abuse layer routes on children and no recourse to public funds limits refuge access. (MD, 8 November 2026.)
- **The council's housing team, always:** shown on the domestic abuse results as a fixed contact, from housing-pathway-endpoints.json (number and out of hours, as the fire and flood exit uses), so it never depends on a listing or on the live read of local Safety listings. The council's Safety listing, where it exists, is extra. (MD, 22 November 2026; review on VA #50.)
- **Where age is not known:** no question is put in front of help. The domestic abuse and sexual violence results show both the under-18 sexual assault centre and Children's Services ("if you're under 18"), each saying who it is for, alongside the adult routes, as the general exit does. Age may be asked after "OK to carry on". (MD, 22 November 2026; review on VA #50.)
- **Modern slavery and trafficking:** open to everyone. Outcomes are getting out safely, and advice on what I can do. Age and immigration are asked; gender and LGBTQ+ are not, because support runs through the National Referral Mechanism. (MD, 2 November 2026.)
- **Sex work:** reached through the Safety pathway, where its listings sit with no subcategory. (MD, 2 November 2026.) The assistant never identifies anyone as a sex worker: the person chooses. (MD, 8 November 2026):
  - "Support for people who sell or swap sex" sits on the Safety second screen, not in the type-of-harm list, so it is not framed as harm.
  - Then "What would help most?": staying safe while working (tagged services and sexual health); help to make changes (tagged services and exit support); something has happened to me (the type-of-harm question).
  - Gender is the only population question.
  - The sexual violence route also includes these listings as candidates.
  - The option stays out of the launch build until its wording has been tested with the organisations whose listings carry the tag. Until then those services are reached through "See all" and the sexual violence route. (MD, 8 November 2026.)
- **Advice on what I can do:** a link to the website's advice page, opened in a new tab, with one approved line saying what the page covers. No second copy of the advice. (MD, 8 November 2026.)

### 3.7 Other needs

- **Food:** one optional question, with "Just show me food near me" as a first-class choice. Where a service needs a voucher, show how to get one. (MD, 2 November 2026.)
- **The onward offer, by need.** Connection is always offered; where and how follows the need. (MD, 4 November 2026; Employment, 13 November 2026.) An answer, or a yes to the offer, hands off to the noticing step in 3.5, so there is one noticing design, not two.

| Need | Onward offer |
|---|---|
| Food | The optional question explores what sits underneath and offers onward connection, unless the person declines |
| Dignity provision: showers, laundry, toiletries, period products, emergency clothing | Results first, no question. After them, one offer: "If you need somewhere to stay tonight, or other help, I can help with that too." |
| Finance, Health, Addiction, Employment | The noticing step before results, with the skip |
| Housing | The housing situation question (section 2) |
| Safety from harm | The Safety route (3.6) |
| Activities | None. An activity is listed only where it shows connection, so the onward route is in what surfaces. Someone looking for an activity has not said anything else is going on, and most activities sit at Rebuild: the connection is there in case things start to wobble again, not because they already are (MD, 13 November 2026) |
| Immigration | The specialist organisation's own wider help. Immigration organisations largely provide that help themselves, placed under Immigration (Resettlement and Integration): housing, money and work, food, therapy, English classes. That is the nature of the parent, not of an area (MD, 13 November 2026). Routing is by status first, under the Immigration Questions Redesign (VA #66) |

Which Essentials items count as dignity provision follows the Essentials crib. This is the change the platform switch update told trustees was coming: "so that results for food and everyday essentials can also offer a route on to wider help". It goes into the Non-Housing Pathway Endpoints Contract (work item 9).
- **Population questions by need,** under the rule in 3.1 (MD, 8 November 2026), subject to D2. Ethnicity is added to each list except Food:

| Need | Questions |
|---|---|
| Finance | Age, care (16 to 24), armed forces, immigration, children, gender |
| Health | Age, gender, LGBTQ+, children, immigration, care, convictions |
| Addiction | Age, gender, LGBTQ+ |
| Immigration | Status, gender, LGBTQ+ |
| Employment | Age, gender, care, convictions, immigration, armed forces, children |
| Essentials | Dogs, gender, children |
| Activities | Age, gender |

Drawn from the WMCA listing packs of 1 November 2026, the only data read so far.

---

## 4. How services are chosen

1. **Need, kind of help and area.** Services in the V4 category, and the subcategory set by the person's position, near them. Near means the website's distance search, widened when nothing is found within 5 km. (MD, 6 November 2026.)
2. **Hard gates.** Leave out only services whose listing plainly says the person cannot use them (section 5).
3. **One per organisation.** An organisation appears once, on one card, with each of its matched services inside it (I5). Its fit is the fit of its best-matching service, not the sum across its services, so the same answer is never counted twice.
4. **Five or fewer: show them all.**
5. **More than five: order by fit** (section 6), and show the first five.
6. **"See all on Street Support"** after the cards. It opens the website's listing for the category and area. That page applies none of the assistant's choices about the person: it is not narrowed by position and applies no hard gates, so it shows broader platform results, not the assistant's filtered set. Every service the assistant did not exclude is reachable there. Today the link goes to the council area's page for an old category (`buildSSNBrowseLink`, VA `staging`); it moves to the V4 category with the matcher build.

These come in addition to the statutory routes and fixed contacts, which are always shown. (MD, 1 November 2026.)

---

## 5. When a service is left out

Only where all three hold:

- an established hard gate in the Service Matching Contract applies (age, gender, jurisdiction, access barrier);
- the listing states the restriction **in terms**, such as "women only", "open only to", "Female only" or "16-25 only", or is for "adults" (18 and over: MD, 23 November 2026);
- the person's answer clearly falls outside it.

**Trans and non-binary answers exclude nothing** until this is decided, so "clearly falls outside" never reads a non-binary answer as outside "women only". (Service Matching Contract v3.1, section 11; MD, 11 November 2026.)

Anything weaker excludes nothing: "especially", "mainly", "designed for", "welcomes". (MD, 8 November 2026.) **Where the restriction is read from:** in the West Midlands, a reviewed record of restrictions and age ranges, each entry resting on a quotation from the service's own text and checked by a named person; elsewhere, only a statement in terms in the listing text (Service Matching Contract v3.1, section 5; MD, 11 November 2026, superseding this note's reading of the listing's words alone). Neither the platform nor V4 holds a restriction field (MD, 1 November 2026). Population tags mean "designed for" and never exclude a service.

**Declined and unasked answers** (Service Matching Contract v3.1, section 6; MD, 11 November 2026, superseding this note's 8 November position that a tag never holds a service back): an answer not given is treated as not stated. It never excludes. But a service designed for a group is not selected unless the person has said the group is relevant to them; it stays available through "See all on Street Support".

**Where it is unclear, the service is shown.** An overlapping age band, a declined answer, or a restriction on one session of a wider service excludes nothing. In a combined listing, a restriction in one section does not exclude the whole record.

**Already in place:** the gender filter (VA #32) and the age fix (VA #49) apply this rule to labels.

**To test before the text rule is relied on:** a women-only session inside a wider service; a service mainly for young people; an age limit on one activity only.

---

## 6. Ordering: tailoring by fit

When more than five remain, each is ordered by how many of the person's answers it fits. Each criterion counts once and every criterion counts the same. A criterion counts only where the person has said something **and** the listing states the matching thing explicitly; a blank never counts, for or against. Equal fits rotate, so no organisation always comes first. (MD, 8 November 2026.)

**Not favouritism.** An organisation whose listing states more of what someone needs has given better evidence that it fits. The same rule applies to every service. (MD, 8 November 2026.) Completeness alone lifts nothing: a tag counts only where the person has given the matching answer.

**Not the old points system,** which used fixed weights chosen by us and scored empty boxes. Here there are no weights, and nothing counts unless both sides have stated it.

| Person's answer | Listing evidence |
|---|---|
| Age | "Young people" tag |
| Gender | "Women" or "Men" tag |
| LGBTQ+ | "LGBTQ+" tag |
| Children or pregnancy | "Parents and families" tag |
| Care | "Care leavers" tag |
| Armed forces | "Veterans" tag |
| Dogs | "People with dogs" tag |
| Immigration status | "Refugees", "Asylum seekers" or "Migrants" tag |
| Convictions | "People with criminal records" tag |
| Ethnicity | "Ethnic minority communities" tag: any answer except White British lifts it; Prefer not to say lifts nothing (MD, 9 November 2026, superseding the 8 November named-community rule). Article 9 basis recorded in D2 |

"Sex workers" and "Survivors of modern slavery" are reached through the Safety pathway rather than ordered by a question.

**Tests,** on controlled fixtures with repeated runs:

- A service designed for the person's situation comes ahead of one that is not, where they otherwise fit equally.
- Equal fits rotate, and no organisation comes first more often than the others over many runs.
- A blank never moves a service, and extra tags with no matching answer move nothing.
- An organisation with several matched services is ordered by its best one.
- A declined or changed answer never excludes a service, so an optional question never becomes an eligibility condition.
- "See all" opens the V4 category page for the person's area, and every service the assistant did not exclude appears there.

How often equal fits arise, and whether rotation needs more definition, is reviewed once the matcher runs. (MD, 8 November 2026.)

---

## 7. The organisation already supporting someone

Where the person says an organisation is already supporting them, it is left out of their suggestions, silently. (MD, 8 November 2026.) This is not yet a reason the contract records, so it goes through I3b with the contract amendments to trustees by email. It is not built until that approval is recorded.

---

## 8. The card

It follows the website's card as far as possible: one per organisation, with each matched service inside it (I5). Where a service was raised because it is designed for the person's situation, the card says "Designed for …". The hide button in the domestic abuse pathway covers the case where someone else may see the screen. (MD, 8 November 2026.)

---

## 9. Few or no matches

The person always receives a response: matched services, or the fallback for their need. The assistant never says there is no local support.

- **One to four:** show them, then "See all on Street Support".
- **None, after widening:** depends on the parent. (MD, 8 November 2026.)

The contract's typology (Non-Housing Pathway Endpoints Contract v1.0) carried to V4 (MD, 8 November 2026; tracker B2). On 11 November the types A, B and C were dropped as a classification, and what each parent shows when nothing local matches is stated for that parent directly (Non-Housing Pathway Endpoints Contract 2.0). The outcomes below are unchanged, except for Finance and Immigration on 19 and 20 November 2026; the Type column is kept for traceability. Nothing found nearby does not by itself bring a place to start (3.5).

| V4 parent | Type | When nothing matches |
|---|---|---|
| Housing | Own pathway | The council route and fixed contacts |
| Safety from harm | Own pathway | The safeguarding routes, emergency numbers and the Modern Slavery Helpline |
| Health | B | NHS 111; LGBT Foundation for LGBTQ+ users |
| Finance | B | Citizens Advice and Turn2us for every money need, each shown with what it is best for: Turn2us for benefits and grants; Citizens Advice for debt and money advice (MD, 19 November 2026). For bills and energy, National Energy Action's Energy Advice and Support Service first, then the Citizens Advice energy line (MD, 19 November 2026) |
| Employment | C | Jobcentre Plus for jobs; National Careers Service for skills |
| Addiction | B (new) | By subject: FRANK for drugs, 0300 123 6600 (nhs.uk); the National Gambling Helpline, 0808 8020 133, free, 24 hours (gamcare.org.uk); alcohol floor not yet verified at source |
| Immigration | C (new) | Shown every time, whatever the local results (MD, 20 November 2026). Asylum seekers: Migrant Help's asylum helpline, 0808 8010 503, free, 24/7 (migranthelpuk.org). Everyone else: the Citizens Advice Adviceline, 0800 144 8848, so there is always someone to speak to; its advisers are registered with the Immigration Advice Authority. Where the status is not given, both. Where the person has said they have no status: also the JCWI Irregular Migrants Helpline, 0800 160 1004, free, Mondays, Tuesdays and Thursdays, 10am to 1pm (MD, 20 November 2026). Project 17, website only, for families with children who have no recourse to public funds, its speciality: shown for leave to remain with no recourse to public funds, no status, or no status given, worded so that people decide whether it fits them; not for people waiting for an asylum decision (MD, 20 November 2026). The Adviser Finder is not shown while it is unavailable (GOV.UK notice, updated 18 November 2026); the free advisers it would find are mostly already listed (MD, 20 November 2026) |
| Food, Essentials, Activities | A | Honest acknowledgement, "See all", gap signal |
| Place to start | None | Nothing offered in its place (MD, 2 November 2026). An honest line and the main menu again (MD, 8 November 2026): "There isn't a drop-in near you that we know of. Choosing what's closest from these will help me find the right support." |

**Three cases kept apart.** No match for this search is a fact the assistant can state. No service known locally is what the honest acknowledgement says ("that we know of"). No service existing cannot be inferred, so the assistant never says it. The search failing and the location being missing are handled and tested separately from a search that returns nothing.

Immigration is type C, not B, because immigration advice can only come from a regulated adviser; a national number that gives no advice would be false comfort. **Open:** since 20 November 2026 Immigration has national lines whose advisers are regulated, so whether the C label still describes it is not settled. Contacts checked on 8 November 2026, the two bills and energy contacts on 19 November 2026, the two immigration lines on 20 November 2026, and all rechecked before build. A typology change is a contract review trigger, so this goes to trustees by email with the C9 amendments.

---

## 10. Corrections to earlier records

| Record | What it says | Now |
|---|---|---|
| VA Design and Service Matching Proposal (1 Nov), section 3.8, section 4 and section 8 question 6; VA V4 Redesign Design Note (4 Nov), Population | A population question is asked only where area and need include services tagged for that group | Replaced by the test in 3.1 (MD, 8 November 2026) |
| Working note (2 Nov), crisis housing | Pets left out for now | Dogs question added for accommodation (MD, 8 November 2026) |
| Question register, Q1 | Ethnicity: ask everyone or targeted | Asked among the extra questions on every pathway asking population questions; census groups (MD, 9 November 2026). Any answer except White British lifts services tagged "Ethnic minority communities" (MD, 9 November 2026, superseding the 8 November named-community rule; 3.1) |
| Question register, Q2 | Preferred name: remove or keep | Kept, for conversation (MD, 3 November 2026; VA #38) |
| Question register, Q5 | Consent screen | A choice, not a gate (MD, 3 November 2026; VA #38) |
| Question register, Q6 | Orientation as the routing input in domestic abuse and sexual assault: proposal | Confirmed (MD, 8 November 2026); for safeguarding review |
| Question register, Q7; VA #46 | Care asked as "currently in care" and "in contact with social services" | Wording to become "ever been in care" (MD, 2 and 8 November 2026) |
| Service Matching Design Note draft v1.0 | Veterans, people with dogs and sex workers have no question | Corrected in sections 3 and 6 |
| This note, version 1.0, 3.5 | Employment is not a prevention entry (MD, 2 November 2026) | Employment takes the noticing step (MD, 13 November 2026) |
| This note, version 1.0, section 9 | Types A, B and C carried to V4 | Dropped on 11 November; outcomes unchanged |
| Early Prevention Pathway Design Note v2.0 (July) | Places to start surfaced first, above the targeted specialists; the at-risk floor includes Citizens Advice | Places to start are the assistant's fallback (Decision 4, 4 November 2026); once housing is in view the floor is Housing Options, a housing-factor specialist and Shelter (MD, 2 November 2026) |
| VA Pathway Review (31 October), 8.3 | "Would you rather talk to someone?" offered once at the start of prevention, on any entry | Places to start on the early side only; on the at-risk side, the local specialist (3.5; MD, 13 November 2026) |
| This note, version 1.0, section 2 and 3.2 | "Not sure where to start" and "not sure" who the help is for lead to a place to start | The assistant helps the person work it out first, with the choice of exploring here or with someone in person (MD, 13 November 2026) |

---

## 11. Left to explore (Managing Director)

1. **Quick exit:** designed, 19 November 2026 ("Quick exit: proposal for review", Managing Director). It is on every screen of the assistant and every page of the website, which covers the pages the assistant links to, including the advice pages (3.6).
2. **Rotation of equal fits:** reviewed in practice once the matcher runs.
3. **Alcohol floor for Addiction:** left open for now; no national alcohol helpline has been verified at source. (MD, 8 November 2026.)
4. **Leaving prison or hospital:** two answers, each its own pathway (MD, 20 November 2026; Endpoints Contract). The option wording is to be confirmed.

**Parked by decision**

- Completion and the "Get in touch" button: its own session, with the Analytics Contract amendment. (MD, 8 November 2026.)
- Honour-based violence, helper access, and the routing engine. (MD, 2 November 2026.)

---

## 12. Work to be completed

Things this design needs that do not yet exist. Rounds are the VA plan's review weeks. Where the record gives a round, it is cited; the others were set by the Managing Director on 8 November 2026. Each row closes on the evidence in its "Test evidence" column and, where needed, the approval named, cited by the pull request or record that closes it. This gives trustees the control position without a second register.

| # | Work | Owner | When | Test evidence | Approval needed |
|---|---|---|---|---|---|
| 1 | Quick exit design, covering the assistant and linked website pages. A release gate for the journeys it covers | MD; James | Week of 16 November (extract: C3) | Works from every Safety screen and linked page | Safeguarding review, James |
| 2 | Safety pathway: every entry route preserves the prescribed exits, state reset and restart (3.6), and a safeguarding disclosure at any question, on any pathway, interrupts the sequence at once | Claude Code; James | With the Safety build | One test per entry route; one per question for interruption | Safeguarding review, James |
| 3 | Website advice: check the domestic abuse and sexual violence pages; write the modern slavery page from official guidance | MD | Before launch (extract 2.16: by M6) | Page read against its approved line | MD |
| 4 | One approved line per advice page, in the phrasebank | MD drafts; James reviews | With each page; Safety lines week of 16 November | Phrasebank entry | James |
| 5 | Data protection (D2): for every question on every pathway, its purpose, necessity there, lawful basis, special category or criminal offence condition, data flow, retention, effect on matching and what happens on a decline. Ethnicity under Article 9; LGBTQ+, health and convictions beyond domestic abuse and sexual violence; dogs. Correct the Appropriate Policy Document's "no logs" line. Record that the extra-questions screen is not consent | MD; James reviews the notes | By M6 (extract 2.14, 2.20) | Each built question has a D2 row | As the D2 notes require |
| 6 | Ethnicity: superseded. No community is recorded per listing, because any answer except White British lifts services tagged "Ethnic minority communities" (MD, 9 November 2026, superseding the 8 November named-community rule; 3.1) | MD | None | None | None |
| 7 | Four VA contracts for board ratification: Housing Pathway Endpoints, Non-Housing Pathway Endpoints, Service Matching v2 and VA Analytics v2. The VA works to all four, but none has been ratified. The technical lead checks each against the code first, and the VA Governance Overview's "Approved baseline" lines are corrected in the same pass. Already recorded: pipeline `reports/board_preparation/JAMES_VA_CONTRACTS_FOR_RATIFICATION.md` and `PIPELINE_BACKLOG.md`, both on main. Other status lines that read draft are wording not yet updated (MD, 8 November 2026) | James, then MD | As the backlog item sets it: before the board papers | Each contract checked against the code | Board ratification |
| 8 | Endpoints Contract: endpoints for the rebuilding position; Dogs Trust on a dogs yes | MD | Drafts week of 16 November (extract 2.17) | Endpoints tested per answer | Trustees by email, with the C9 amendments |
| 9 | Non-Housing Endpoints Contract amended for the V4 typology, including the alcohol floor verified at source, and the onward offer for each parent (3.7) | MD | Drafts week of 16 November (extract 2.12, 2.17) | Each floor's source, audience, coverage and wording recorded; the onward offer for each parent stated | Trustees by email, with the C9 amendments |
| 10 | Service Matching Contract: the already-supporting exclusion (I3b). Not built until approved | MD | With the C9 amendments | Approval recorded | Trustees by email |
| 11 | Dogs Trust: confirm which West Midlands towns the vet scheme covers | MD | Week of 9 November | Reply from Dogs Trust | None |
| 12 | Sex work wording tested with the organisations whose listings carry the tag; the option is added only after | MD | After launch | Their responses recorded | MD |
| 13 | Phrasebank wording: the rebuilding answer, the dogs line, both fallback lines, "I don't have a settled place to live", the sex work option and question, the ethnicity introduction | MD drafts; James reviews | With the build that uses each | Phrasebank entries | James |
| 14 | Care question worded as "ever been in care" (VA #46 still asks "currently in care") | Claude Code; James | Week of 16 November | Tests for 16 to 24 | Safeguarding review, James |
| 15 | Route choice screen lists ethnicity (VA #47) | Claude Code; James | With #47 | Screen test | James |
| 16 | Matcher and question map built in V4 terms, replacing `needProfileRequirements`: the housing situation question's new answer, dogs, ethnicity, organisation fit, rotation. Not the sex work option, which is outside launch scope (work item 12) | Claude Code; James | Week of 23 November, with the matcher (extract 2.13: I1 to I9) | The fixture and repeated-run tests in section 6; zero results, search failure and missing location tested separately (section 9); the immigration answers kept apart as the Immigration Questions Redesign sets them (VA #66), including a refused asylum claim as distinct from other no recourse to public funds circumstances | James |
| 17 | Mark what this note supersedes: the tag-presence rule in the 1 November proposal and the 4 November design note; the reading rule and the no-question tags in the 4 November note; answers to the question register's questions 1, 2, 5, 6 and 7 | Claude Code; James | With this note's PR | Diff | James |
| 18 | Review the question map against the national baseline, including whether people recognise themselves in the wording | MD | When the national baseline lands | Map compared with national populations and endpoints | MD |
| 19 | Navigator additions: Crisis Skylight Birmingham (homelessness specialist, self-referral), checked at source. St George's House, Preventing homelessness (Wolverhampton), waits: it is for men only, the Service Matching Contract shows a group's contact only where the person has said the group applies, and the endpoints file records age but not gender. A gender field changes the file's structure, which the Housing Pathway Endpoints Contract reserves for trustees. Read and left out, because housing is not the organisation's specialism: Spitfire Services, Aquarius Settle, Topchurch Training, Kaleidoscope's Independent Living Service (MD, 13 November 2026) | MD; Claude Code | Before launch | Contact checked at source; entry in the file | None: adding a navigator entry is an operational change under the Housing Pathway Endpoints Contract |
| 20 | The places to start collection added to the assistant's database login, and the assistant reading it, "show at the switch" only (3.5) | James; Claude Code | Week of 16 November, with the live read | A place to start offered in a test area; none for "confirm first" or beyond the radius | James |
| 21 | Service Matching Contract: the place-to-start fallback, its triggers, the exclusions, "show at the switch" only, the radius, and counting within the five (3.5) | MD | With the C9 amendments | Contract text | Trustees by email |
| 22 | Youth organisations by borough for 16 and 17 year olds (3.4): confirm the commissioned or established organisation in each borough, and record the gaps | MD; regional coordinator | Before launch | Entry or gap recorded for each borough | None: operational, as for navigator entries |
| 23 | User testing against the narrative, in the West Midlands trial: can someone start with the problem they recognise, without knowing the homelessness system; can someone helping another person reach a useful next step without knowing everything about them; does the result make the next connection clear, not just show relevant services; do people understand the awareness line (3.5) | MD | Trial, week of 30 November | Findings recorded per question | MD |

---

## 13. Review of 8 November 2026

An AI-assisted documentary review of this note (draft, not adopted) found the design coherent and suitable for continued development and testing, with release dependent on the work above. Its findings and where each is handled:

| Finding | Handled in |
|---|---|
| A1 Safeguarding routing and quick exit | 3.6; work items 1 and 2 |
| A2 Sensitive questions and data protection | 3.1, including the ethnicity lift: any answer except White British lifts services tagged "Ethnic minority communities" (MD, 9 November 2026, superseding the 8 November named-community rule); work item 5 (work item 6 superseded) |
| A3 Contract amendments and authority | Section 7; work items 7 to 10. The Governance Decision Framework is adopted (board authority register, May 2026); the review had a draft copy. Four VA contracts await board ratification, as the technical lead recorded in October (work item 7); other draft status lines are wording not yet updated |
| A4 Matching and neutrality | Sections 4 and 6. Fuller listings ranking higher is a settled decision (MD, 8 November 2026); completeness alone lifts nothing |
| A5 Housing position mapping | Section 2 table split; tests per answer |
| A6 Missing matches and fallback | Section 9; work items 9 and 16 |
| A7 Question consistency | Section 6 tests; work item 18 |
| A8 Traceability | Section 12's evidence and approval columns |

**Second review, 8 November 2026.** A second documentary review found the design "substantially satisfied", with implementation assurance outstanding, and no wholesale revision indicated. Its three observations are handled: the ethnicity row in section 6 now says the named community controls the lift; section 4 says "See all" shows broader platform results, not the assistant's filtered set; work item 2 covers a safeguarding disclosure interrupting any question. The next review should check the evidence in section 12 rather than repeat the design review. The named-community lift was superseded on 9 November 2026: any answer except White British lifts services tagged "Ethnic minority communities" (MD).

**Third review, 8 November 2026.** A third, targeted review found no new contradiction and no governance issue requiring the design to be reopened, and treats the note as the working design specification, subject to its approval arrangements. Its two wording points are applied: section 9 now says the person always receives a response or a fallback, and work item 16 states that the sex work option is outside launch scope.

---

## 14. Accessibility

The assistant meets WCAG 2.2 level AA, as the website does, and follows the W3C's cognitive accessibility guidance. The brand green is #236c58 (6.25:1 against white), shared with the website. (Managing Director, 8 November 2026; VA Accessibility Proposal, 8 November 2026.)

**Every screen:**

- Colours come from one shared setting, never a colour typed in.
- Every control is a real button or link, and its visible words begin its accessible name.
- Buttons are at least 44 by 44 pixels (good practice for phone use; the AA minimum is 24 by 24), with a visible focus outline.
- Text at 4.5:1 and control edges at 3:1. Colour is never the only signal.
- After each answer, focus moves to the new reply, so its question and any context, including crisis numbers, are read in full before the person responds.
- The person can see how many services were found, move between them easily, and see that more are on Street Support.
- A request for reduced motion is respected.

**Offer questions** ("Yes, include them" / "No thanks"): the buttons are grouped with the question, so they make sense read alone, and the choice is echoed back as text, not shown by colour.

**"Designed for" on cards:** written words, after the service name and within the same card, worded as who the service is shaped for, never as an exclusion.

**Advice links:** say they open in a new tab, are named after the organisation or page, and are underlined.

**The quick exit, when designed:**

- A visible button with words, in the same place on every screen of the pathway.
- Reached in one or two presses of Tab, at least 44 by 44 pixels, and usable by mouse, touch, keyboard and switch access.
- No confirmation step and no time limit.
- Any keyboard shortcut must not be a single letter and must not use Escape, which closes the chat.

Where the quick exit goes and what it clears are safeguarding decisions, made separately. They were made on 19 November 2026: it goes to BBC Weather, and it clears the conversation and any half-typed message (Managing Director).

**Before launch:** the interface fixes in the VA Accessibility Proposal; checks in a browser and with the main screen readers; contrast of every component in every state; and a few realistic journeys end to end on a phone and by keyboard or screen reader. Testing with people who use assistive technology is recommended where it can be arranged.

---

## 15. Changes in version 1.1 (13 November 2026)

- Section 2 and 3.2: "not sure" leads to the assistant helping, with the choice of exploring here or in person.
- 3.4: youth organisations by borough for 16 and 17 year olds.
- 3.5: the noticing step "keeps the pressures they name in view together", in place of "holds", so it is not read as the narrative's holding through a transition; Employment takes the noticing step; the housing-factor specialists named as the navigators in the endpoints file; places to start on the early side only, when they are offered and when not, which ones, and the radius, which is not widened.
- 3.7: the onward offer for each need, including none for Activities and the organisation's own wider help for Immigration.
- Section 9: the 11 November change to the typology.
- Section 10: five corrections.
- Section 11: leaving prison or hospital, one answer or two, added.
- Section 12: work items 9 and 16 widened; work items 19 to 23 added.

---

## 16. Review of 22 November 2026 (VA #50)

The technical lead's review on VA #50, answered by the Managing Director on 22 November 2026:

- 3.1: the ethnicity question uses the wording of the Data Minimisation and Lawful Basis Note (VA #63), which states both purposes, so the consent covers the counting; the reason the named-community rule was dropped, and the open question on the lift.
- 3.3 and 3.6: the council's housing team is a fixed contact on the domestic abuse results, not dependent on a listing.
- 3.6: where age is not known, the domestic abuse and sexual violence results show both the under-18 and adult routes.
- Section 5: trans and non-binary answers exclude nothing until decided; where restrictions are read from, and declined answers, now follow the Service Matching Contract v3.1 (11 November 2026).
- Ordering (section 6), when a question is asked (3.1) and the organisation already supporting someone (section 7) stand as written here (8 November 2026). The Service Matching Contract is brought into line with them.

## Sources

- VA analytics and questions working note, 2 November 2026 (Claude Docs; no repo copy).
- VA Decisions and Delivery Extract, 2 November 2026 (`docs/va-review-2026-10-31`).
- VA V4 Redesign Design Note, 4 November 2026 (VA #42).
- VA #34, Design and Service Matching Proposal, with the technical lead's answers of 5 November 2026.
- VA #38, #39, #40, #46 and #47: decisions of 3 and 6 November 2026.
- Housing Pathway Endpoints Contract 1.2 (VA #45).
- Service Matching Contract v2.0; Three Test Framework 3.4; Shaping a Service Listing.
- Managing Director decisions in conversation, 8 November 2026.
- Managing Director decisions in conversation, 12 and 13 November 2026.
- Early Prevention Pathway Design Note v2.0 (`staging`); VA Pathway Review, 31 October 2026, section 8.
- Housing Pathway Endpoints Contract 1.3 (VA #62), Governance; Non-Housing Pathway Endpoints Contract 2.0 (VA #61).
- Platform switch: update for trustees, November 2026.

---

# Part D. Routes designed in their own notes

These routes sit outside the matcher. Their prescribed exits are fixed in code, bypass the matcher and the AI, and are governed by the Safeguarding Contract. This part records their design; the contract and each note keep the detail.

## D.1. The crisis gate and the safeguarding exits

**The crisis gate** runs at the start of every new session or restart, before anything else. Its exits for immediate danger, domestic abuse, sexual violence, self-harm, under-16s and fire or flood are written in the phrasebank, not by the AI. (Safeguarding Contract; Principles in Practice.) Location is asked straight after the gate, so the council is known from then on (Mid-Conversation Age Detection Design Note, decision approved by the technical lead, April 2026; this restores the WatsonX order).

**Unclear answers** at the strict crisis questions are read by code only. A second unclear answer at the domestic abuse children question is treated as Yes, so the person also gets Children's Services (Managing Director, 25 November 2026; kept, 26 November 2026).

**Domestic abuse.** After the exit, the person is asked their gender, then whether they have dependent children (D.6). Read from `feat/children-restore-2026-11-26` (local commit 74fbaa2, not yet pushed or merged; `staging` has none of these restorations). Each exit gives:

- the national line for their gender, or all three national lines where gender is declined or not recognised;
- Shelter's domestic abuse advice;
- the council's Housing Options team, on every exit, as all twelve of the original's exits had (restored, Managing Director, 26 November 2026);
- the council's Children's Services, where there are children (restored, same decision);
- local domestic abuse services, where known;
- 999.

The council contacts sit with the other contacts, before any sign-off line and the closing 999 line.

**Proposed, not yet decided** (VA Pathway Review, 6.4, its decision D5): the exit first; then location, by the same step as everyone else; then local services from the live platform's Safety listings, Housing Options, the Shelter helpline and Children's Services where there are children. Status: provisional, pending the safeguarding and technical review. Its 6.4 already proposed keeping the children question because Children's Services now changes the result, and dropping pregnancy.

**The Safety from harm route** (Part C, section 3.6) is reached from the crisis gate, the safety question in housing, the main menu or a disclosure (D.2). Once on it, the conversation is the same.

## D.2. The safety disclosure check

A person can say something about their safety in their own words at any point. The Safeguarding Contract's Free-Text Disclosure Rule says such disclosures "must be treated as authoritative". (Safety Disclosure Check Design Note v1.0, 19 November 2026.)

- **What it does:** on every typed message, after the under-16 check, fixed patterns look for a first-person statement about safety. On a match, the assistant asks one fixed question, with help first: "If you're in immediate danger, call 999. It sounds like you might not be safe at the moment. Would you like to see help with staying safe?"
- **Yes** goes to the Safety from harm route and stays there. **No** carries on. **Unclear** goes back to where the person was.
- **No AI.** Patterns only. The answer is read by code. Nothing new is sent to the AI provider.
- **Not run** where the person is already on a safeguarding route or the conversation has ended. The design lists these steps in code, each with a test.
- **Not yet built.** The note is a draft design.
- **Nothing is recorded** for the check itself.
- **Status:** the trigger list and four further points are approved by the Managing Director, pending the technical lead's review.

## D.3. Age

**Under 16.** A hard exit to Children's Services and Childline, fixed in code. Age stated mid-conversation, as a number or a school year, triggers the same exit through fixed patterns, never AI judgement. (Mid-Conversation Age Detection Design Note v1.3.)

**Sixteen and seventeen.** They stay under safeguarding, in a conversation with choice, not a hard exit; Children's Services first where already involved (Part C, section 3.4).

**Eighteen and over.** A listing for "adults" means 18 and over (Managing Director, 23 November 2026; Part C, section 5).

## D.4. The quick route and the circumstances screen

**The original.** WatsonX showed a list of circumstances before detailed questions and asked whether any applied: significant health or mental health concerns; immigration status not straightforward; pregnant or have children; LGBTQ+; previous convictions; aged 16 to 20 and previously looked after. If none applied, the person took the quick route. The February 2026 rebuild lost the screen. (Quick Route Design Note v1.1, March 2026.)

**Now.** A route choice: the quicker route says which circumstances it does not ask about (Managing Director, 6 November 2026; VA #47). A targeting question added later goes on the full route only and is named on the route screen (Managing Director, 20 November 2026). The crisis gate is never skipped on either route.

**The quick route has two purposes:** data minimisation and completion, because the simple case must not be made to answer a run of "no" questions (Managing Director, 31 October 2026).

**Later.** One circumstances screen in place of two routes was proposed on 31 October and is to be tested with users first (VA Pathway Review, 3.4, its decision D2). It is a redesign step, after the restorations (B.2).

## D.5. Immigration

Start from the endpoints and ask only what separates them. A gate, "Are you a British or Irish citizen, or settled in the UK?", then, only after No or Not sure, "Which of these is closest to your situation?", with six answers. Each answer points to its own help: resettlement services; Hope Projects (proposed in the note) and local immigration advice for a refused claim; local advice and accommodation that accepts people with no recourse; Migrant Help for someone waiting for an asylum decision. The assistant never tells anyone what they are entitled to. (Immigration Questions Redesign, 12 November 2026; VA #66; Part C, sections 3.7 and 9.)

Families with no recourse see the family support block: the council's Children's Services, Project 17 and Migrant Help.

## D.6. Children and pregnancy

**The law.** In England, priority need includes a pregnant woman or anyone who lives with her, and anyone with dependent children who live with them or might reasonably be expected to (Housing Act 1996, s.189(1)(a) and (b)). A person homeless because of domestic abuse has priority need whatever their household (s.189(1)(e), Domestic Abuse Act 2021, s.78). The assistant surfaces this; it never applies it (B.2).

**Children and pregnancy follow the person's position** (B.3). Before a crisis, children bring the family advice (Turn2us; Family Fund) alongside the results. In crisis, still housed or home lost, children are part of the crisis route itself: a household with children has priority need, and the council's Housing Options team, with its out-of-hours number, is the first contact. What the crisis route shows a family is set out below. (Managing Director, 26 November 2026.)

**Families in crisis** (Managing Director, 26 November 2026). Where the person, or their partner, is pregnant, or there are children in the household, the crisis route shows a family phrase first, then the council's Housing Options team with its hours and out-of-hours number, then the local results with "Parents and families" services ranked higher, then Shelter where the family phrase does not already give it. Children's Services stays only for families with no recourse to public funds. Pregnancy and children each trigger it; they are separate answers.

- **Crisis, still housed:** the original `ESCALATION_LEVEL_2_CHILDREN_RISK` and its supporter variant, as restored, with pregnancy added to its opener and to its "You may want to tell them" list. This is where that phrase belongs: at the position the housing situation question sets, not as an urgent message inside prevention.
- **Crisis, home lost:** a sibling phrase built from the original's sentences. Draft:

  > It sounds like you or your partner are pregnant, or there are children in the household, and you have nowhere settled to stay.
  >
  > When children are involved, councils usually take extra care to understand what is happening and what support may be available.
  >
  > In most areas, the first step is contacting the local council's housing options or homelessness team and explaining your situation. Many councils have an out-of-hours service for emergencies outside office hours.
  >
  > You may want to tell them:
  > - that you or your partner are pregnant, or that children live with you
  > - where you are staying now
  > - that you need somewhere to stay

  The second sentence is the children-risk phrase's own, without "to help prevent homelessness"; the third is adapted from `ADVICE_SLEEP_TONIGHT`, with "and explaining your situation" added. The supporter version follows the children-risk phrase's supporter variant. Each line shows only what the person said: pregnancy, children or both. Not yet built.

**Decided, 26 November 2026 (Managing Director).** Built on `feat/children-restore-2026-11-26` (local commits 603ee64, 3bb8ca3 and 74fbaa2, on top of the local commit bcbc536 for pull request #93; none yet pushed); not on `staging`:

- **Domestic abuse** asks "Do you have dependent children?", children only, of everyone who gives a gender answer. Pregnancy is taken out of that question. A Yes adds the council's Children's Services.
- **The prevention route,** where there are children: if urgent, the original fuller message about telling the council, with the council's Housing Options contact shown directly and the conversation kept open; if not urgent, the family advice (Turn2us; Family Fund, described from Family Fund's own site as grants for families on a low income raising a disabled or seriously ill child). **The urgent message is interim.** It restores the original inside the old prevention route, and goes when the housing situation question lands and urgent families are on the crisis route (B.3). On the branch, an urgent case whose reason is an eviction notice or being asked to leave reaches the legal emergency message first and the conversation ends there, so that family does not see the children message. The housing situation question removes this too (A.4, item 6). Within the current prevention route, the Housing Options contact is shown after the restored message, which itself names Shelter.
- **The prevention route's dependants question** asks about dependent children only, with pregnancy out of that trigger (A.4). Not yet built.
- **A child safety concern** on the prevention route gives the council's Children's Services first, before NSPCC and 999.

**Crisis housing** asks about pregnancy and children of everyone, pregnancy covering a partner (Part C, section 3.3). The full route's children question and its pregnancy question are unchanged in the code for now: the pregnancy question is still tied to gender. Asking both of everyone is already decided; it is waiting to be built (Part H, H3).

**Write-up for a second opinion:** "Children and pregnancy in the virtual assistant", 26 November 2026, which sets out the audit, the law and the parity with the original phrasebank.

## D.7. Care leavers

**Decided and built** (Managing Director, 20 November 2026; VA Pathway Review, 5.2; built on `feat/care-leavers-safety-local-2026-11-20`, pull request #82, for James's review as safeguarding-adjacent; not on `staging`). Status from `VA_BACKLOG.md`, newest copy `align/hosp-prison-veterans-backlog-2026-11-20`, items C1 to C1c, as at 23 November 2026; the backlog does not yet record the decisions of 26 November below. The branch head is now a93f7d3.

- **Asked of everyone aged 16 to 24 on the full route:** whether they have ever been in care, with one line explaining what "in care" means; then, only if they have, which council looked after them. Never asked: how long, at what age or under which legal section, because those are eligibility tests and the leaving care team applies them. Not asked at 25 and over, because leaving care duties end at 25.
- **Each answer picks its first contact,** under the routing table in the Pathway Review, 5.2: the personal adviser; the leaving care team of the council that looked after them; Children's Services where they are now for 16 and 17 year olds; Housing Options where they are now; the youth navigator; Shelter. A declined answer still shows the local leaving care team.
- **Someone looked after outside the area** is shown local Housing Options, not the local leaving care team (Managing Director, 20 November 2026). The reasoning is in "Care leavers living in a different area". Showing the local team as optional extra support was considered again and not adopted: the duty stays with the council that looked after them, and it risks the person being passed between councils (Managing Director, 26 November 2026; backlog C1b closed).
- **Sixteen and seventeen year olds living outside the seven councils** are shown "Contact your local council and ask for Children's Services", with the find-your-council link, where no Children's Services number is held, instead of nothing (Managing Director, 26 November 2026; backlog C1c). No number is given, so no unverified number is shown. Not yet built; safeguarding-adjacent, for James with #82.
- **Contacts:** the seven councils' leaving care teams, each confirmed by the Managing Director from the council's or trust's own pages, with its source and date, in `lib/data/housing-pathway-endpoints.json` on the care leaver branch (backlog C1a).
- **Wording** presents the team as best placed to help, without saying what it must do: "Leaving care teams support young people who have been in care. Help with housing is part of what they do. They will look at your situation with you." The original phrasebank's "you may be entitled to support… They have a duty to help" is not used (B.2).

---

# Part E. Data and results

## E.1. Live service data

The assistant reads the platform live, the same way the public website does, under the same rules. Organisations are responsible for their own details; there is no approval step. A weekly review watches for consequential changes; it does not hold anything back. The fixed contacts (Housing Options, Children's Services, safeguarding and crisis lines) stay in their own files, so they are always there. Responsibility for what a person sees is shared between Street Support Network, for the assistant's rules, and the organisations, for their details. (Managing Director, 31 October 2026; VA Service Data Proposal.) When the database cannot be reached, the assistant says so and shows the national contacts (Managing Director, 4 November 2026).

## E.2. Area restrictions

Search is by distance, so some people will be shown services they cannot use because of where they live. Nothing is excluded on area. Where a listing states a restriction, the card shows it in the organisation's own words, attributed to it. A platform field for who a service is open to is agreed in principle, for after launch. (VA Area Restrictions Proposal, 2 November 2026.)

**How this sits with Part C, section 5.** Part C lists jurisdiction among the Service Matching Contract's hard gates. In the contract (v3.2, gate C) that gate is for a service "legally or operationally restricted to a jurisdiction the person is not in", explicit in service data and used sparingly. A council area, local connection or postcode restriction is shown on the card and excludes nothing, under the decision of 2 November. This creates no new exclusion rule.

## E.3. Fixed contacts

The council's Housing Options and Children's Services contacts come from `lib/data/housing-pathway-endpoints.json`, with each number's hours, menu option and notes. Children's Services numbers are shown without a menu option, so the number stays right if the menu changes (Managing Director, 26 November 2026, on Walsall). Every contact is checked at source before it is added. The Housing and Non-Housing Pathway Endpoints Contracts govern what is fixed and what each parent shows when nothing local matches (Part C, section 9).

---

# Part F. How the design got here

1. **WatsonX** (to early 2026). The first assistant, built one question and one answer at a time. It had the circumstances screen (D.4), asked children as its own question and used the answer in the domestic abuse exits.
2. **The phrasebank** (1 February 2026). `CHAR_VA_Phrasebank_v7.md`, with its v7.1 "Watson Feature Parity" changes, recorded every phrase for the rebuild. Its companion, `CHAR_VA_RoutingLogic_v7.md`, holds the routing: which question follows which and what triggers each phrase. It confirms two triggers that were inferred before it was found: the children-at-risk message ran when the situation was "happening now or very soon" and there were children; the family advice ran for families whose situation was not urgent, after the reason-specific advice. It also shows the original already treated housing as crisis once the person had nowhere safe to sleep that night (its B7A1, "Do you have somewhere safe to sleep tonight?", routing to crisis and skipping the rest of prevention), and already forbade combined questions and determining eligibility. Two things it did are not carried forward: its children escalation flagged "children's services notification" and a "priority need check", which would now break B.2; and its prevention urgency question, which the housing situation question replaces (B.3).
3. **The February 2026 rebuild** in code. The circumstances screen, Children's Services in the domestic abuse exits, Housing Options in the domestic abuse exits, the prevention family advice, the fuller children-at-risk message and Children's Services in the child-at-risk exit were lost. The young people's guidance survived inside the housing results. The children and Housing Options outputs were restored on 26 November 2026, on a branch not yet merged (D.1, D.6).
4. **Governance notes, March to July 2026:** Principles in Practice, the Quick Route Design Note, the age detection note, the Early Prevention Pathway Design Note.
5. **The WMCA mapping, May to October 2026,** and the Phase Framework. Pathway Position, Not Phase (23 September) took phase out of routing.
6. **The redesign, 31 October to 23 November 2026:** the pathway review, the design and service matching proposal, the V4 redesign note and the Service Matching and Questions Design Note, now Part C.
7. **This paper** (26 November 2026).

---

# Part G. Check against the Phase Framework and the WMCA report

Checked on 26 November 2026 against:

- the Phase Framework v0.3, CURRENT, adopted 28 September 2026 (pipeline `align/break-at-loss-of-home-2026-10-06`). Pipeline `main` carries only v0.1, which describes itself as proposed and not adopted, so a reader on `main` will find the wrong version;
- Shaping a Service Listing;
- the WMCA Main and Evidence reports of 6 October 2026 (pipeline `main`, `reports/wmca/report_drafts_2026-10-06/final/`).

Each finding says whether it is in the design or in the build.

## G.1. Where the design and the framework agree

| Point | Framework or report | Design |
|---|---|---|
| Being housed does not mean before a crisis | v0.3 section 3; Evidence report, "How the thinking developed"; Main report 3.5 | B.3; Part C, section 2: "going to lose it" is crisis, still housed |
| Phase is not the routing proposition; phase, relevance and routing stay distinct | PH-R01, PH-R02; Pathway Position, Not Phase | B.3; Part C, section 2: subcategories chosen by the person's position, read from the subcategory, with no Phase field |
| Places to Start come before a factor is named, and are not a crisis way-in | PH-C01; places to start crib, PTS-PH03; Main report 3.4 | Part C, section 3.5: places to start on the early side only |
| Noticing: one pressure wobbling, or several | Main report, sections 3.2 and 4 | Part C, section 3.5: the noticing step and the awareness line |
| Showing the next step at each point | Evidence report, "The platform's part" | Part C, section 3.7: the onward offer for every need |
| Crisis help quick to find for someone with no earlier contact | Main report 3.5 | Part C, section 2: housing is the first option on the first screen, and the housing situation question is its second screen |
| Rebuilding is part of the pathway | Main report 3.5 and 4; v0.3 section 7 | Part C, section 2: the rebuilding answer |
| Provider language does not settle where someone is | v0.3 section 3; PH-M06; Shaping | B.3: placed by the person's answer, not by any service's label |
| The assistant does not assess risk | Evidence report, "The platform's part"; PH-M04 limits | B.1, B.2, B.3 |

## G.2. Gaps and contradictions

| # | Finding | Where | Severity | Proposed |
|---|---|---|---|---|
| G2.1 | The prevention route on `staging` asks "How urgent does this feel?" and offers "Eviction notice or landlord wants me to leave" as a reason for being at risk. Under v0.3 section 3 and the housing situation question, someone with a notice and a date may be in crisis while still housed. The urgent eviction message gives Shelter and Citizens Advice but no council contact, and ends the conversation | Build | Must fix before launch | Land the housing situation question (VA #40). Then remove or reword the eviction reason inside prevention, so that "going to lose it" is answered once, at the housing situation question. *Decision for the Managing Director* |
| G2.2 | "Notice to leave from family or friends" is a prevention reason on `staging`. Being told to leave can materialise overnight | Build | Must fix with G2.1 | The same: the housing situation question decides it |
| G2.3 | Part C, section 3.5 refers to "the materialisation check" on the finance route and attributes it to the proposal of 2 November. That proposal is a working note outside the repositories, and no document read for this paper defines the check | Design | Should fix | Define it here as the housing situation question, or drop the term. *Decision for the Managing Director* |
| G2.4 | The position label "Prevention" sits beside "Crisis" and "After: rebuilding". Prevention is an outcome, not a position: a service can aim to prevent homelessness while operating within Respond (PH-M06). The WMCA report treats rebuilding as prevention too, and the Positive Pathway calls crisis-stage help "crisis prevention". The label invites reading "anyone still housed" | Design | Should fix | Rename the position "Before a crisis" in the design and code comments; phrasebank wording unchanged. *Decision for the Managing Director* |
| G2.5 | The pipeline's `main` carries Phase Framework v0.1, not v0.3. Documents citing v0.3 rules, such as PH-R01 in the VA V4 Redesign Design Note, cannot be checked on `main` | Records | Note | Merge v0.3 to the pipeline's `main` when its branch goes forward. A pipeline matter, not this paper's |
| G2.6 | The May service pool note says phase routing "is a responsibility for the VA layer at runtime". This contradicts PH-R01 | Design (superseded record) | Note | Marked superseded on routing (A.3) |
| G2.7 | The question register heads its prevention section "Prevention (housed, at risk)" | Design (superseded record) | Note | Superseded by B.3 (A.3) |
| G2.8 | The report names "when formal support ends" as a key point in the journey. The rebuilding answer covers someone in a hostel or recently moved in, not someone whose support is ending | Design | For the redesign step | Whether the rebuilding answer, or the onward offer, should cover support ending. Linked to holding (B.1). *Decision for the Managing Director* |
| G2.9 | The housing situation answers are the person's own reading. Someone with a notice may still choose "keep things steady". The materialisation test is for services (PH-M04 limits), so the assistant cannot apply it to a person | Design | For user testing | Test whether people with a notice recognise themselves in "going to lose it" (Part C, work item 23) |
| G2.10 | On the restoration branch, the prevention route's children question asks about "children or other people who depend on you", but a Yes brings text written only about children; and pregnancy counts as children there, so someone pregnant with no children is told "Because you have children" | Build (unmerged branch) | Should fix | Ask about dependent children only; give pregnancy its own wording or leave it out of that trigger. *Decision for the Managing Director* |
| G2.11 | People leaving prison or hospital are labelled "Crisis, home lost" in Part C, section 2. The answer assumes they have not yet left, which on the framework's positions is a materialised crisis before the final outcome (position 4), not a realised one | Design (label) | Note | Relabel (A.4, item 5) |

**Decided, 26 November 2026 (Managing Director):** G2.1 and G2.2, the housing situation question decides; G2.3, the check is the housing situation question; G2.4, renamed "Before a crisis"; G2.10, children only; G2.11, relabelled (A.4). G2.8 is parked, with holding: not for now. Places to Start belong at the start of the journey, not the end of support, and the space between is Maintain, universal prevention, which is not Street Support Network's responsibility.

## G.3. Not checked

- The places to start crib and the housing stability and pathway role model were not re-read for this check; Part C already cites the crib's rules.
- The Positive Pathway framework for young people is cited by the report but is not in the repositories.
- The contracts were not checked against the framework; they are the technical lead's (A.1).

---

# Part H. Outstanding items by status

Part C, section 11 keeps its own list, and section 12 the work to complete. These are the items this paper adds. Decisions settled on 26 November 2026 are in A.4 and G.2. Each item keeps its number wherever it sits, so earlier references still hold. Unfinished building is not unfinished design: only H10 needs a decision.

## Open decision

- **H10. A local contact line** (Decisions and Delivery Extract, 3.6): which local organisation, at each stage of the pathway, is best placed to take phone calls. Street Support Network never gives its own contact details or contacts people directly; it only points people to other organisations (B.2). For the Managing Director, to finalise in the week of 30 November 2026. The working shape: Places to Start at the early part of the pathway; housing factor organisations at the later part of Strengthen; who it is at the point of materialisation is still to be thought through; the housing navigator after crisis. What is open is how this changes the options shown in the Endpoints Contracts. It does not change routing within the assistant.

## Decided, waiting to be built

- **H2. The family phrases on the crisis route** (D.6).
- **H3. Pregnancy and children asked of everyone on the full route,** pregnancy covering a partner: decided in Part C, section 3.3; the code still ties pregnancy to gender.
- **H6. Care leavers:** decided and built on #82 (D.7); the C1c fix is decided and waiting to be built, and backlog C1b is closed (26 November 2026).
- **H7. The facilitated answer:** decided on 4 November (B.4). Its safety design goes with the Safety route, through the Safeguarding Contract.

## Waiting on user testing or review

Carried from the VA Pathway Review (31 October), by its own decision numbers; their status has not been re-checked for this paper.

- **H4. The circumstances screen,** tested with users first (its D2 and D11; D.4).
- **H5. Domestic abuse sequence:** exit, then location, then local services and housing (its D5); the exit button (its D7); statements that apply the law to the person (its D8). Pending the safeguarding and technical review. A declined gender already shows all three national lines, as built (D.1).

## Separate work

- **H8. A closing intention question,** "What feels like your next step?", paired with the completion measure (Decisions and Delivery Extract, 3.2). A separate piece of work, done with the analytics before launch, not left until after it (Managing Director, 26 November 2026).

## Parked

- **H1. Support ending, and holding** (G2.8, B.1). Not for now (Managing Director, 26 November 2026). Places to Start are for the start of someone's journey, when things start to wobble, not for the end of support. What sits between the end of rebuilding and a new wobble is Maintain, universal prevention, which is not Street Support Network's responsibility.

## Closed, 26 November 2026

- **H9. Aftermath listings under "someone to talk to"** (Decisions and Delivery Extract, 3.3): listings that support people after abuse, such as counselling and courses. On 28 October 2026 the Managing Director moved two of them from Safety from harm to Health > Mental health; they surface where the taxonomy places them, found by lookup.
- **H11. Duration as a routing input** (Decisions and Delivery Extract, 3.8): dropped. The position is set at the housing situation question (B.3).
- **H12. The original routing file,** `CHAR_VA_RoutingLogic_v7.md`: found (supplied by the Managing Director) and committed with this paper (Part F).
