# Virtual assistant: design status and plan to launch

*Proposal for the technical lead, 1 November 2026. The national milestone dates await his confirmation.*

**What this is.** The single place to see where the VA design has landed, what is next, who it waits on, and which milestone it serves.

**How it relates to other documents.**
- **`VA_BACKLOG.md`** stays the record of individual work items. This paper groups and sequences them.
- **The national go-live plan (#192)** sets the milestones. The dates here are proposed, to be checked against that plan. If the milestones move, this paper follows.
- **Authority.** This is a working management tool. It holds no authority over the national plan or over existing governance decisions. Where they differ, they win.
- **Built on:** the VA pathway review, the question purpose register, the paper on trans answers, the gender filter verification, the routing engine exploration, the decisions of 31 October and 1 November, and the live website's card design (read from `streetsupport-platform-web` at `33202ae`, 1 November 2026).

**Code base read:** `dd10813`, which stacks #26 and #30.

**The launch baseline.** The VA launches on its current architecture. The routing engine (F) is not part of the launch unless the MD and the technical lead separately decide to adopt it. If no decision is made, the answer is "not yet".

**Status key**
- **Done**
- **Ready for go:** built and previewed, waiting on the MD's go
- **With James:** in review
- **Decision:** waiting on a decision
- **Input:** waiting on information from someone else
- **Next:** can start now
- **Later:** after launch

**Launch class key**
- **Critical:** the VA cannot go live without it.
- **Dependent:** planned for launch. If it is not ready, launch can go ahead on the named fallback, **once that fallback is verified for launch** (section 2A). A fallback is not safe merely because it is already in use.
- **Deferrable:** can follow launch without risk to users.

**Tests go with each change.** Every routing or safeguarding change ships with its own scenario tests and passes the full suite before merge. G4 is the final run on the launch commit, not the first time tests are written.

---

## 1. Where we have landed

### 1.1 Design principles (decided 31 October 2026 unless stated)

1. **Surfaces facts, does not apply them.** The VA never tells anyone they are in priority need or entitled to anything.
2. **Pathways.** Each housing outcome is a pathway ending in a **useful set of next steps**, not a single destination.
3. **Every question has a documented purpose.** That purpose can be routing, safeguarding, accessibility or another agreed operational reason, including reach and insight. Routing necessity is the necessity test for data protection. The lawful basis is established separately.
4. **The quick route has two purposes:** data minimisation and completion. The simple case must stay simple.
5. **Exclusion only on explicit rules.** The Service Matching Contract's hard gates are a closed list. A service's focus, name or population tag is not a restriction.
6. **Neutrality.** SSN surfaces what exists. It does not decide access on a provider's behalf beyond the agreed hard gates.
7. **Launch on the current VA.** Explore the engine alongside; adopting it for launch is a separate decision with the technical lead.

### 1.2 Decisions taken

| Date | Decision | Where recorded |
|---|---|---|
| 22 Oct | 16 and 17 year olds are shown only what they can reach themselves: the statutory route, the youth front door and direct services | #26 |
| 29 Oct | The prevention pathway is built before launch (WMCA work) | Delivery plan 4.5 |
| 30 Oct | Children's Services first for 16 and 17 year olds, on both routes | #30, #31 |
| 31 Oct | Young Persons Team shown provisionally as Wolverhampton Homes' team, without the email, pending Eliz | Pathway review 2 |
| 31 Oct | Domestic abuse location uses the standard share-location or postcode step | Pathway review 6.4 |
| 31 Oct | A settled WMCA places to start list is assumed at go-live. Places to start are offered early in prevention, and as a choice that does not depend on counting pressures | Pathway review 8 |
| 31 Oct | Scottish routing is a gate on the first Scottish area, not a WMCA launch item | Pathway review 1.1 |
| 31 Oct | Explore the routing engine first, in the background; adoption decided separately with the technical lead | Pathway review 4.4, 9 |
| 31 Oct | The quick route stays until any replacement has been tested with users | Pathway review 3.4 |
| 31 Oct | Fix the gender filter's substring fault now, as its own pull request; trans handling interim | Gender fix verification; trans paper |
| 1 Nov | Service matching selects the most tailored and relevant services; a cut-off is needed; five at most, after statutory and hard-coded routes | This paper, 1.3 |
| 1 Nov | Organisation-level cards mirroring the website, each matched service shown recognisably | This paper, 1.3 |
| 1 Nov | Population tags become a website search feature, so the website reads them as the VA will | This paper, section 8 |
| 1 Nov | Completion is a design goal; an added step to record it is an acceptable trade-off. Direction: a "Get in touch" button | This paper, 1.3 |
| 1 Nov | Neither the platform nor V4 holds a restriction field; before the VA there was no use for one | This paper, section 8 |

### 1.3 Service matching: where it has landed (1 November 2026)

**Decided by the MD.**
- **Purpose.** The VA asks questions so that it can find the services that, on the face of what they say and who they serve, are most tailored and relevant to the person. Selecting the most relevant is not hiding the rest, and it is not treating organisations differently.
- **A cut-off is needed.** A conversation cannot show twenty listings without overwhelming the person.
- **Five service results at most.** This is the current setting. It comes after the statutory routes and hard-coded endpoints, so the person already sees a fair amount.
- **Cards mirror the website's, as far as possible.** The website's cards are per organisation (read 1 November). The VA's are too.
- **Each matched service is shown within the organisation's card**, in a format visibly recognisable from the website. The website's own multi-service card drops service text and opening times, so this is a deliberate departure from an exact copy.
- **Completion matters.** As an infrastructure charity, SSN struggles to show impact and outcomes. The VA should record, as far as it can, that a person acted on what it gave them. A small added step is a real but necessary trade-off.
- **Direction: a "Get in touch" button on each service.** Tapping it shows or opens the contact routes, and the tap is recorded. It works the same on desktop and mobile. Most website use is on desktop, where a tap on a phone link is not a call.

**Proposed, for confirmation in the design note.**
- **Completion defined as:** the person asked to contact at least one service. This measures a step towards contact, not proof of it.
- **The button wording** says what happens ("Get in touch", "Contact this service"), not "put in touch", which suggests a referral.
- **No button on crisis or safeguarding exits.** Their numbers stay shown directly.
- **"See all on Street Support"** after the five cards, linking to the website's Find Help list with the category filled in. The rest stay one tap away.
- **Order:** fit to the person's answers first, then distance.
- **Restrictions and tags (principle 5).** A service is left out only where its listing plainly states a restriction that the person's answer meets. The Three Test Framework places enforcement of stated eligibility with the VA (PLATFORM-STATES-VA-GATES). The VA does so only through the Service Matching Contract's hard gates, at high confidence. Where a restriction cannot be established with confidence, nothing is excluded. A population tag is the main sign of relevance; the proposal is that it only ever raises a service (section 8).

**What the governance record already says.**
- Service Matching Contract v2.0: output limits are "parked for future specification". Five plus a see-all link specifies them.
- The same contract: "a low-ranked service is still shown". This needs rewording to say where it is shown. Matching logic changes go to trustee review.
- Analytics Contract v2.0 already lists "service card expanded" and "service link clicked" (link type phone or website). "Contact requested" is a new event in the same category, so it needs a small amendment.

---

## 2. The critical path

**What actually sets the launch date** is narrower than the full list of decisions. Five things are on it:

1. **The technical lead's review capacity.** Every routing and safeguarding change passes through it: A1 to A3, A6 and A7, C1 to C4, and G3 to G5. Small pull requests, each ready to review.
2. **The platform data interface.** The week-1 answers on what the platform exposes, then B1a at M4a, then B1b, B2 and B3 by M4. Without these the VA has no V4 data to read at the switch.
3. **M4a integration.** The first end-to-end slice proves the connection (B1a). It is the leading indicator of whether the dates hold.
4. **Safeguarding-sensitive pathway changes.**
   - Care leavers (C1).
   - The 16-17 fixes (A1 to A3).
   - The age defect on the full route (D4).
   - The prevention pathway (C5), decided for launch on 29 October.

   Domestic abuse (C2 to C4) is launch-dependent: the current exits stay if the review is not done.
5. **Verified routes and data protection cover.** Statutory routes and contact data verified (C6, C8). The data protection notes covering every question actually asked (D2, D3, E4). Accessibility (G1). Tests on the launch commit (G4, G5).

Everything marked Dependent or Deferrable in section 3 sits off this path.

### What happens if a critical item is unfinished

Critical items do not all carry the same consequence. This table records the consequence so the M6 go or no-go discussion has it in front of it. It does not make the decision.

| Item | If unfinished at M6 |
|---|---|
| A1 to A3, D4 (age defect) | A known routing defect for 16 and 17 year olds remains. Correct it, or launch scope changes |
| A6, A7 | A known matching defect remains: women hidden from women's services. Correct it |
| B1a, B1b, B2, B3 | The VA cannot read V4 data, so it cannot function as intended after the migration. No fallback exists, because the fixed file goes out of date at the switch |
| C1 | A committed pathway, and a backlog launch blocker, is incomplete. Complete it, or change launch scope explicitly |
| C5 | A committed pathway (29 October) is incomplete. Complete it, or change launch scope explicitly |
| C6, C8 | M6 requires statutory routes verified for every live area, and contact data verified at source. Not met |
| C7 | A delivery plan launch item is incomplete. Complete it, or change launch scope explicitly |
| D1, D2, D3, E4 | Questions asked without documented purpose, lawful basis or a prefer-not-to-say option. A data protection compliance gap |
| D8 | Text that applies the law to the person stays live, against principle 1. A correction needed |
| G1 | Accessibility issues remain. Assess them against the applicable launch requirements |
| G4, G5 | The launch commit is not shown to pass the safeguarding tests and type check. Release is blocked under the Governance Decision Framework |
| H1 | Feeds C5. As C5 |

### 2A. Fallback verification

Each fallback named in section 3 is listed here with its verification status. **Existing** means it is in use today. **Verified for launch** means checked by every route that applies to it: contact data at source through C8; routing behaviour through the safeguarding and routing tests; a question it asks through the data protection notes (E4). No fallback is yet verified for launch.

| Fallback | Used by | Status | Evidence today |
|---|---|---|---|
| Current domestic abuse exits | C2, C3 | Existing | Covered by the safeguarding test suite. National and local contacts last audited February 2026. Galop's number differs between the contract and the code. The crisis-gate route shows no local services (pathway review 6.2) |
| Current local DA list (`safeguarding-endpoints.json`) | C4 | Existing | Last audited February 2026. Disagrees with a second dataset for Coventry, the Black Country and Birmingham (pathway review 6.2) |
| Find-your-council line and Housing Options | C1 | Existing | Housing Options contacts audited February 2026. Wolverhampton's matched the council site on 31 October. Others not re-checked |
| Children's Services and Housing Options for 16-17 in Wolverhampton | A4 | Existing | Both matched the council site and leaflet on 31 October 2026 |
| Provisional Young Persons Team entry, with website | A5 | Existing | Website confirmed on the council site on 31 October 2026. Direct contact route unconfirmed |
| Current live self-harm wording | G3 | Existing | Covered by the safeguarding test suite; with the technical lead (backlog 72) |
| Current quick route choice screen | D6 | Existing | No verification needed beyond the test suite |
| Current question on the housing route | E3 | Existing | Depends on E4 documenting it |
| Current session-end log | G2 | Existing | No contact data involved |

**Rule.** Any fallback relied on at M6 must be verified for launch first, by each route that applies to it (above). C8 covers only the contact data.

---

## 3. Tracker

**Milestones**, from the national go-live plan:
- M1: week of 2 Nov
- M2: 9 Nov
- M3: all parents ruled, forecast 13 Nov
- M4a: first end-to-end slice, 16 Nov
- M4: built on the copy of the site, 30 Nov
- M5: WMCA trial, 30 Nov
- M6: go or no-go, 7 Dec
- M7: the switch, 14 Dec or 4 Jan

The "by" column is proposed. It is the latest an item can land without putting its milestone at risk.

### A. Routing fixes already in progress

| ID | Item | Class | Status | Waits on | Owner | By |
|---|---|---|---|---|---|---|
| A1 | #26 youth route for 16 and 17 year olds | Critical | With James | Re-review of 30 Oct replies | James | M1 |
| A2 | #30 quick route asks age for housing; under-16 exit; Children's Services first | Critical | With James | Review | James | M1 |
| A3 | #31 Endpoints Contract: 16-17 already involved see their worker first | Critical | With James | Review | James | M1 |
| A4 | Young Persons Team entry: Wolverhampton Homes, no email, provisional | Dependent. *Fallback: Children's Services and Housing Options already cover 16-17 in Wolverhampton* | With James | Review, in #26 | James | M1 |
| A5 | Young Persons Team direct contact route | Dependent. *Fallback: provisional entry with website* | Input | Eliz | Eliz | M5 |
| A6 | Gender filter substring fix, own pull request (#32). Women are currently hidden from women's services | Critical | With James | Review | James | M2 |
| A7 | Gender fix: description wording rule and double-labelled services | Critical (gates A6's merge) | Decision | James | James | M2 |
| A8 | Three double-labelled services corrected at source | Deferrable. *Shown to everyone meanwhile* | Input | Eliz or platform admin | Eliz | M5 |

### B. Data and platform (go-live plan workstream D, data)

| ID | Item | Class | Status | Waits on | Owner | By |
|---|---|---|---|---|---|---|
| B1a | **Prove the connection.** The VA reads a representative V4 service from the copy of the site, end to end, for one council and a few categories | Critical | Input | Week-1 answers on what the platform exposes | James, Claude | M4a |
| B1b | **Complete the live read.** All needs, all seven councils, error handling and fallback if the platform is unavailable, tested on the copy. B1a passing does not complete this | Critical | Next after B1a | B1a | Claude, James | M4 |
| B2 | Category maps moved to V4 | Critical | Next | Mapping can start now; live data needs B1b | Claude | M4 |
| B3 | Age gates and population factors moved to V4 | Critical | Next | B1b | Claude | M4 |
| B4 | Backlog item 80 corrected to "read the live platform" | Deferrable | Next | MD go | Claude | M1 |

### C. Pathways

| ID | Item | Class | Status | Waits on | Owner | By |
|---|---|---|---|---|---|---|
| C1 | **Care leavers 16-24**: two questions, routing table, leaving care endpoints | Critical (backlog C1 launch blocker) | Decision | MD on the questions; leaving care contacts verified via the statutory routes map (WMCA, week of 9 Nov); review | MD, Claude, James | M4 |
| C2 | **Domestic abuse:** help first, then location, then local services and housing. All three lines when gender is declined | Dependent. *Fallback: current DA exits, unchanged* | Decision | MD (sequence); safeguarding review | MD, James | M4 |
| C3 | Domestic abuse quick exit button | Dependent. *Fallback: none needed* | Decision | MD on option A, B or C; safeguarding review | MD, James | M4 |
| C4 | Local DA services from platform Safety listings, filtered only by stated restriction | Dependent. *Fallback: current local DA list* | Input | B1b | Claude | M4 |
| C5 | **Prevention with places to start** | Critical (decided for launch, 29 Oct) | Decision | MD on the five open points; design note v2.1 located (H1) | MD, Claude, James | M4 |
| C6 | Statutory access routes findable in the VA | Critical (M6 condition) | Input | Workstream F map (WMCA week of 9 Nov) | Claude | M5 |
| C7 | Hospital, prison and rehab as sleeping situations (backlog 65) | Critical (delivery plan, consequential) | Next | None | Claude | M4 |
| C8 | Contact data re-verified at source before launch, **including the contact data in every fallback relied on at M6** (section 2A) | Critical | Input | Statutory routes map; Eliz | Claude, Eliz | M6 |

### D. Questions and routes

| ID | Item | Class | Status | Waits on | Owner | By |
|---|---|---|---|---|---|---|
| D1 | Question purpose register: confirm purposes. Three of the eight also settle population tag questions (section 8) | Critical (feeds D2, E4, I2) | Decision | MD on the 8 open questions | MD | M2 |
| D2 | For each question: remove it, or record its purpose and lawful basis in the data protection notes. Special category first | Critical. *Every question asked at launch must be covered* | Next after D1 | D1 | Claude | M4 |
| D3 | Add "prefer not to say" where missing (about ten questions) | Critical (required by the Data Minimisation Note and Service Matching Contract) | Next | None | Claude | M4 |
| D4 | Confirmed defects. **Full-route age missed for prevention and declined consent** (a 16-17 year old is not recognised). Typed organisation names rejected (B12A). Preferred name not stored | Critical for the age defect; Dependent for the other two. *Fallback: B12A falls back to escalation as now* | Next | B12A design needs D1 | Claude | M4 |
| D5 | Circumstances screen: user testing and data protection check | Deferrable. *Current quick route stays* | Decision | MD to commission; Appropriate Policy Document check | MD | Later |
| D6 | Quick route choice screen lists its assumptions (backlog 62) | Dependent. *Fallback: current screen* | Next | None | Claude | M4 |
| D7 | Worker sitting beside someone: new answer option | Deferrable | Decision | MD; language review (backlog 69) | MD | Later |
| D8 | Statements that apply the law to the person: fire and flood, 16-20 guidance and others | Critical (principle 1) | Decision | MD on which go or are reworded | MD | M4 |

### E. Gender and trans answers

| ID | Item | Class | Status | Waits on | Owner | By |
|---|---|---|---|---|---|---|
| E1 | Confirm non-exclusion as the reading of hard gate B for trans answers (#33) | Dependent. *Interim: the contract's own outcome, already in A6* | Decision | Service matching review | MD, James | M4 |
| E2 | A+ (show stated restrictions) or another option | Deferrable. *Interim as E1* | Decision | Service matching review; authority confirmed | MD, James | Later |
| E3 | Option D: drop gender from the housing route; ask directly about pregnancy | Dependent. *Fallback: current question, covered by E4* | Decision | Question review (D1) | MD | M4 |
| E4 | Data Minimisation Note and Appropriate Policy Document cover gender identity. **Start now:** the current VA already asks questions that can disclose gender identity or history. Update again if E1 or E3 changes what is collected | Critical (part of D2) | Next | None | Claude | M6 |

### F. Routing engine

| ID | Item | Class | Status | Waits on | Owner | By |
|---|---|---|---|---|---|---|
| F1 | Exploration on a branch: same results, about half the questions | Deferrable | Done | None | Claude | Done |
| F2 | Branch labels corrected to the question register's purposes | Deferrable | Next | D1 | Claude | Later |
| F3 | Whether to adopt the engine for launch | Deferrable. *Default: not yet; launch on the current VA* | Decision | MD and James, only if they choose to | MD, James | Before M4a, if at all |

### G. Functional and readiness

| ID | Item | Class | Status | Waits on | Owner | By |
|---|---|---|---|---|---|---|
| G1 | Remaining accessibility fixes (backlog 41) | Critical | Next | None | Claude | M4 |
| G2 | Session analytics, with its contract amendment; log the reach and outcome questions | Dependent. *Fallback: launch with the current session-end log* | Decision | MD on purposes (D1); Analytics Contract amendment | MD, Claude | M5 |
| G3 | Self-harm wording (backlog 72) | Dependent. *Fallback: current live wording* | With James | James | James | M4 |
| G4 | Final run of safeguarding and routing tests on the launch commit. Each change carries its own tests before merge | Critical | Later | All critical items | James | M6 |
| G5 | Full project type check where dependencies install | Critical | Input | An environment with npm access | James | M6 |

### H. Housekeeping

| ID | Item | Class | Status | Waits on | Owner | By |
|---|---|---|---|---|---|---|
| H1 | Design note v2.1 (prevention) into the repo; it is not on any branch | Critical (feeds C5) | Input | MD to locate | MD | M2 |
| H2 | Supporter and Professional Language Review into the repo as Markdown | Deferrable | Next | MD go | Claude | Later |
| H3 | Old places to start working note on the national housing branch aligned | Deferrable | Next | Pipeline thread | Claude | Before that branch merges |

### I. Service matching

| ID | Item | Launch class | Status | Waits on | Owner | By |
|---|---|---|---|---|---|---|
| I1 | Service matching design note: principles, card format, cut-off, see-all link, completion, tags and restrictions. *Basis: implementation dependency for I3 to I5* | Critical (feeds I2 to I6) | Next | Population tag questions (section 8, 1 to 8) | Claude, MD | M2 |
| I2 | Population tag questions settled (section 8, 1 to 8). Question 2: no restriction field (MD, 1 November); the reading rule is open. *Basis: dependency for I4* | Critical (feeds I1, I4) | Decision | MD | MD, Claude | M2 |
| I3a | Service Matching Contract: output limit specified and "still shown" reworded to say where the rest are shown. *Basis: MD decision (five, cut-off); fills a parked item.* The authority needed is identified from what actually changes, not assumed | Critical (launch runs five) | Next after I1 | I1; authority identified | MD, James | M6 |
| I3b | Service Matching Contract: the already-supporting omission recorded. *Basis: MD statement of purpose (31 Oct).* It adds a reason to withhold, which is the contract's named review trigger | Dependent. *Fallback: shown as now* | Next after I1 | I1; contract review | MD, James | M6 |
| I4 | Matcher: stated restrictions excluded, tags ranked, five per organisation card, order by fit then distance. *Basis: established rules (hard gates) and V4 dependency; tag weighting and order are MD decisions pending section 8* | Critical | Next after I1 | I1, B1b, B3 | Claude | M4 |
| I5 | Card restructured: organisation card with each matched service; "Get in touch"; see-all link. *Basis: MD decisions (1 Nov)* | Critical (MD decision for launch) | Next after I1 | I1 | Claude | M4 |
| I6 | Analytics: completion defined, "contact requested" event, contract amendment; click events wired | Dependent. *Fallback: the current session-end log* | Decision | Analytics review; G2 | MD, Claude | M5 |
| I7 | Exclude the organisation already supporting someone (B12, B12A buttons) | Dependent. *Fallback: shown as now* | Next after I3b | D4, I3b | Claude | M4 |
| I8 | Behaviour when fewer than five or no services match. *Basis: established rule; must not tell someone there is no support when there is* | Critical | Next | B2 | Claude | M4 |
| I9 | See-all link reliably opens the right category **and area** on the website. *Basis: the five-card limit is compatible with "still shown" only if the rest are genuinely reachable* | Critical (condition of I3a and I5). *If it cannot, an alternative route to the rest is needed before launch* | Next | A read of the website code | Claude | M2 |

---

## 4. Decisions waiting

### On the critical path, in the order they unblock work

1. **The week-1 answers** on what the platform exposes. They unblock B1a.
2. **Question register: the 8 open questions (D1).** They unblock D2 and E4.
3. **Care leaver questions (C1).** Ready to build once WMCA leaving care contacts are verified.
4. **Places to start: the five points (C5), with design note v2.1 located (H1).**
5. **Statements applying the law (D8).**
6. **Population tag questions (I2, section 8).** They shape the design note (I1), the matcher (I4) and the question register (D1).
7. **The rule for reading restrictions from listing text (section 8, question 2).** There is no restriction field; whether to add one is open.

### Launch-dependent: decide in time, or launch on the fallback

8. Domestic abuse sequence and exit button (C2, C3).
9. Trans answers, E1 and E3, in the service matching review.
10. Completion definition and the analytics amendment (I6).

### Can follow launch

11. Engine adoption (F3), if wanted.
12. Worker beside someone (D7).
13. Testing the circumstances screen (D5).
14. Option A+ (E2).

---

## 5. Milestone view

*Proposed. To be checked against the national go-live plan.*

| Week of | What the VA needs to reach | Critical items |
|---|---|---|
| 2 Nov (M1) | Fixes reviewed. Week-1 answers. Decisions 1 and 2 | A1 to A3, A6 |
| 9 Nov (M2) | WMCA leaving care contacts verified. Question purposes settled. Gender fix decisions. Population tag questions settled; service matching design note | D1, A7, H1, I1, I2, I9 |
| 16 Nov (M4a) | **Connection proved** on a representative slice. This is not the full live read | B1a |
| 23 Nov | Critical pathways and question fixes built, each with its tests | C1, C5, C7, D2 to D4, D8, G1, I5, I8 |
| 30 Nov (M4, M5) | Live read complete on the copy; V4 categories and age gates; matcher on V4; WMCA trial | B1b, B2, B3, C6, I4 |
| 7 Dec (M6) | Contact data and fallbacks verified for launch; data protection notes complete; Service Matching Contract amended; final test run and type check | C8, E4, G4, G5, I3a |
| 14 Dec or 4 Jan (M7) | VA live in the West Midlands; Watsonx off | |

---

## 6. Risks to the VA dates

| Risk | Effect | Guard |
|---|---|---|
| The review queue | Every critical routing and safeguarding change waits | Small pull requests, each with its own tests. The technical lead's part is tentative and his to shape |
| The platform interface is not ready, or exposes less than needed | B1 cannot finish; the VA has no V4 data at the switch | Week-1 answers. Prove the connection early (B1a) on a representative slice |
| A successful M4a read as B1 complete | False confidence at M4 | B1a and B1b tracked separately |
| The domestic abuse safeguarding review takes longer | C2 to C4 slip | Launch-dependent: the current exits remain, once verified for launch (section 2A) |
| Leaving care contacts hard to verify | C1 launches with fallbacks only | The find-your-council line and Housing Options, once verified for launch (section 2A, C8) |
| The prevention pathway's open points not settled | C5, a critical item, slips | Decision 4 is on the critical path, with H1 |
| Decisions pile up | Building stalls | Section 4 separates what is on the critical path from what can wait |
| A contract amendment (I3a, I3b) needs trustee review | The matcher is built but its rules are not approved at M6 | Identify the authority for each change once I1 is agreed, and raise any that need trustees straight away |
| Restrictions read from free text become a general detector | A new exclusion mechanism appears without being recognised as one | The three-part test in section 8, question 2, tied to the hard gates and carried into I1 |

---

## 7. Keeping this current

- Update status as items move. New items go in the right section with the next ID and a launch class.
- When an item finishes, record it in `VA_BACKLOG.md`'s completed list as well.
- If the go-live plan's milestones change, change the "by" column here to match.

---

## 8. Open questions to work through

*All open service matching and question register questions, in one place. Answers go into the design note (I1) and the register.*

### Population tags

1. **What does a tag do?** It means "designed for" (Shaping a Service Listing). Agreed so far: it raises a service for someone in the group. Still open:
   - Should a service designed for one group take one of the five places for someone outside it, or sit only behind "See all"?
   - How much does a tag outweigh a closer fit on need, or distance?
   - *Proposed:* tags only raise a service for someone in the group. They never lower a service for someone outside it. A penalty would act much like an exclusion under a five-result cut-off, even with "See all" available. Test before adopting: a person outside the group, in an area where most relevant services carry a tag that does not match them.
2. **How does the VA tell "designed for" from "open only to"?**
   - **Answered.** Neither the platform nor V4 holds a restriction field. Before the VA there was no use for one (MD, 1 November 2026). Population tags mean "designed for". Restrictions are stated in the listing text: "the listing states plainly who the service is for… Enforcement sits with the Virtual Assistant" (Three Test Framework 3.4, PLATFORM-STATES-VA-GATES; Shaping a Service Listing, "Be clear about restrictions"). The handover listing packs agree: they carry tags and no restriction field.
   - *Open, MD:* the VA is what creates the need for a structured field. Whether to add one, and when, is not decided. Until there is one, the VA reads the text under the rule below.
   - **Still open: the reading rule.** Free text is not a structured field. The record says a strict restriction is stated "in terms" and a soft one as "especially". *Proposed:* only a statement in terms can support a hard gate, such as "women only", "for women only" or "open only to". Anything weaker excludes nothing and stays visible as the organisation's information: "especially", "mainly", "designed for", "welcomes".
   - **The three-part test.** A statement in terms is only one part of it. A service is excluded only where all three hold:
     - an established hard gate applies;
     - the listing states the restriction in terms;
     - the person's answer clearly meets it.

     This is the boundary in section 1.3. It is not a general text detector, and it creates no new reason to exclude. I1 carries it into the design note.
   - **Cases to test before the rule is adopted:** a women-only session inside a wider service; a service mainly for young people; an age limit on one activity only.
   - Carried listings keep the organisations' own words, so many will not follow the record's convention yet. The rule must hold on that text, not on the convention. This does not reopen the hard-gate principle.
3. **Where do tags sit in the data the VA will read?** They are on `GroupedProvidedServices`, not the `ProvidedServices` rows the website reads today. Population tags are to become a website search feature (MD, 1 November), so the website will need to read that layer too. The VA's live read (B1) should read it the same way.
4. **Tags with no question.** People with dogs, sex workers and veterans have no question, so their tags cannot raise anything. Is that intended for each? A veterans question is drafted in the backlog. Older people is kept by Platform Scope v4 and dropped by the Population Factor Note.
5. **Questions with no route on the quick route.** Immigration, ethnicity and others are not asked there, so their tags have no effect for quick route users. This follows from the quick route's purpose, but should be stated.
6. **Ask only where it can change the result.** Proposal: a population question is asked only where the person's area and need include services tagged for that group. This applies the pathway principle (principle 3) to tags.
7. **Should the card say why a service was chosen** ("Designed for care leavers")? The old website showed "Suitable for". The live one shows nothing.
8. **Ethnicity as a routing input.** Using it to raise ethnic minority community services makes it special category data used for routing. That needs its Article 9 basis in the data protection notes (register question 1).

### Other matching questions

9. **Age restrictions.** The matcher infers age from focus words and ignores explicit labels such as "18+ only". The three-part test in question 2 decides the fix (B3).
10. **Distance: a design choice.** Ranking by distance needs the person's coordinates for the session. The register proposes dropping coordinates once the area is known. The options: rank within the area without distance; keep coordinates for the session only, used for ranking and then discarded; or use a coarser point such as the postcode district. Whether area-level ranking is enough is not yet established.
11. **Leaving out the organisation already supporting someone (B12).** The purpose is the MD's (31 October): the organisation is removed from the list of suggestions. It is a reason to withhold that is not a hard gate, so it needs recording in the contract (I3b). Open: whether the card says so, for example "You're already in touch with X", rather than the organisation silently disappearing.
12. **Ranking weights.** Today's are unspecified (a base of 50, plus fixed boosts). The design note should state what raises a service, and by how much in broad terms.
13. **Fewer than five, or none.** What the VA says when few services match. It must never say there is no local support when the categories simply are not mapped (B2).
14. **Services covering two councils** (71 in the current file). How cover is held in V4 (service data proposal, section 8).
15. **Physical health and access barriers** (hard gate D). The question is asked; the gate is not built.
16. **Trans answers (E1, E2) and the gender fix questions (A7).**
17. **The see-all link.** Whether the website's Find Help address can carry the person's location as well as the category. Cannot be established from the card findings.
18. **The analytics review.** The completion definition, the "contact requested" amendment, and how organisation names in click events are handled for domestic abuse services under the contract's small-numbers limits.

### The question register's open questions (D1)

Still to be worked through. Those marked * also affect the population tag questions above.
- \*Ethnicity: routing, analysis or both (question 8 above).
- Preferred name: keep or remove.
- Access location: record the reach and marketing purpose.
- Duration, income, employment: routing, analysis or both.
- Consent screen: notice and choice, or align with the March removal.
- \*Domestic abuse and sexual assault: orientation or gender.
- \*Care leavers: "ever been in care", 16-24.
- The engine branch's labels.
