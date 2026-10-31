# Virtual assistant: design status and plan to launch

*Working draft, revision 3, 31 October 2026. Prepared by Claude for the Managing Director. Suitable for operational use; the national milestone dates await James's confirmation.*

**What this is.** The single place to see where the VA design has landed, what is next, who it waits on, and which milestone it serves. Update it as items move.

**What it consolidates.**
- The VA pathway review, revision 4.
- The question purpose register.
- The paper on trans answers, revision 4.
- The gender filter verification, revision 2.
- The routing engine exploration.
- The 31 October decisions.

**How it relates to other documents.**
- **`VA_BACKLOG.md`** stays the record of individual work items. This paper groups and sequences them.
- **The national delivery plan (#192)** sets the milestones and is with James. The dates here are proposed and are to be checked with James against that plan. If the milestones move, this paper follows.
- **Authority.** This is a working management tool. It holds no authority over the national delivery plan or over existing governance decisions. Where they differ, they win.

**Code base read:** `dd10813`, which stacks #26 and #30.

**What revision 2 changes.**
- Every item now has a launch class.
- B1 is split into proving the connection and completing it.
- The current VA is stated as the launch baseline.
- Tests now go with each change, not only the final gate.
- A critical path section has been added.

**What revision 3 changes.**
- Fallbacks are marked as existing or verified for launch (section 2A).
- E4 starts now, without waiting on E1 or E3.
- Each critical item now states its launch consequence if unfinished (section 2).

**The launch baseline.** The VA launches on its current architecture. The routing engine (F) is not part of the launch unless the MD and James separately decide to adopt it. If no decision is made, the answer is "not yet".

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
- **Dependent:** planned for launch. If it is not ready, launch can proceed on the named fallback, **once that fallback is verified for launch** (section 2A). A fallback is not safe merely because it is already in use.
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
7. **Launch on the current VA.** Explore the engine alongside; adopting it for launch is a separate decision with James.

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
| 31 Oct | Explore the routing engine first, in the background; adoption decided separately with James | Pathway review 4.4, 9 |
| 31 Oct | The quick route stays until any replacement has been tested with users | Pathway review 3.4 |
| 31 Oct | Fix the gender filter's substring fault now, as its own pull request; trans handling interim | Gender fix verification; trans paper |

---

## 2. The critical path

**What actually sets the launch date** is narrower than the full list of decisions. Five things are on it:

1. **James's review capacity.** Every routing and safeguarding change passes through it: A1 to A3, A6 and A7, C1 to C4, and G3 to G5. Small pull requests, each ready to review.
2. **The platform data interface.** James's week-1 answers on what the platform exposes, then B1a at M4a, then B1b, B2 and B3 by M4. Without these the VA has no V4 data to read at the switch.
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

Each fallback named in section 3 is listed here with its verification status. **Existing** means it is in use today. **Verified for launch** means checked at source, and its tests passing, within the C8 re-verification before M6. No fallback is yet verified for launch.

| Fallback | Used by | Status | Evidence today |
|---|---|---|---|
| Current domestic abuse exits | C2, C3 | Existing | Covered by the safeguarding test suite. National and local contacts last audited February 2026. Galop's number differs between the contract and the code. The crisis-gate route shows no local services (pathway review 6.2) |
| Current local DA list (`safeguarding-endpoints.json`) | C4 | Existing | Last audited February 2026. Disagrees with a second dataset for Coventry, the Black Country and Birmingham (pathway review 6.2) |
| Find-your-council line and Housing Options | C1 | Existing | Housing Options contacts audited February 2026. Wolverhampton's matched the council site on 31 October. Others not re-checked |
| Children's Services and Housing Options for 16-17 in Wolverhampton | A4 | Existing | Both matched the council site and leaflet on 31 October 2026 |
| Provisional Young Persons Team entry, with website | A5 | Existing | Website confirmed on the council site on 31 October 2026. Direct contact route unconfirmed |
| Current live self-harm wording | G3 | Existing | Covered by the safeguarding test suite; with James (backlog 72) |
| Current quick route choice screen | D6 | Existing | No verification needed beyond the test suite |
| Current question on the housing route | E3 | Existing | Depends on E4 documenting it |
| Current session-end log | G2 | Existing | No contact data involved |

**Rule.** Any fallback relied on at M6 must be verified for launch through C8 first.

---

## 3. Tracker

**Milestones**, from the national delivery plan:
- M1: week of 2 Nov
- M2: 9 Nov
- M4a: first end-to-end slice, 16 Nov
- M3: 23 Nov
- M4: built on staging, 30 Nov
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
| A4 | Young Persons Team entry: Wolverhampton Homes, no email, provisional | Dependent. *Fallback: Children's Services and Housing Options already cover 16-17 in Wolverhampton* | Ready for go | MD go; then joins #26 | MD | M1 |
| A5 | Young Persons Team direct contact route | Dependent. *Fallback: provisional entry with website* | Input | Eliz | Eliz | M5 |
| A6 | Gender filter substring fix, own pull request. Women are currently hidden from women's services | Critical | Ready for go | MD go; then James | MD, James | M2 |
| A7 | Gender fix: description wording rule and double-labelled services | Critical (gates A6's merge) | Decision | James | James | M2 |
| A8 | Three double-labelled services corrected at source | Deferrable. *Shown to everyone meanwhile* | Input | Eliz or platform admin | Eliz | M5 |

### B. Data and platform (delivery plan workstream D, data)

| ID | Item | Class | Status | Waits on | Owner | By |
|---|---|---|---|---|---|---|
| B1a | **Prove the connection.** The VA reads a representative V4 service from staging, end to end, for one council and a few categories | Critical | Input | James's week-1 answers on what the platform exposes | James, Claude | M4a |
| B1b | **Complete the live read.** All needs, all seven councils, error handling and fallback if the platform is unavailable, tested on staging. B1a passing does not complete this | Critical | Next after B1a | B1a | Claude, James | M4 |
| B2 | Category maps moved to V4 | Critical | Next | Mapping can start now; live data needs B1b | Claude | M4 |
| B3 | Age gates and population factors moved to V4 | Critical | Next | B1b | Claude | M4 |
| B4 | Backlog item 80 corrected to "read the live platform" | Deferrable | Next | MD go | Claude | M1 |

### C. Pathways

| ID | Item | Class | Status | Waits on | Owner | By |
|---|---|---|---|---|---|---|
| C1 | **Care leavers 16-24**: two questions, routing table, leaving care endpoints | Critical (backlog C1 launch blocker) | Decision | MD on the questions; leaving care contacts verified via the statutory routes map (WMCA, week of 9 Nov); James review | MD, Claude, James | M4 |
| C2 | **Domestic abuse:** help first, then location, then local services and housing. All three lines when gender is declined | Dependent. *Fallback: current DA exits, unchanged* | Decision | MD (sequence); safeguarding review with James | MD, James | M4 |
| C3 | Domestic abuse quick exit button | Dependent. *Fallback: none needed* | Decision | MD on option A, B or C; safeguarding review | MD, James | M4 |
| C4 | Local DA services from platform Safety listings, filtered only by stated restriction | Dependent. *Fallback: current local DA list* | Input | B1b | Claude | M4 |
| C5 | **Prevention with places to start** | Critical (decided for launch, 29 Oct) | Decision | MD on the five open points; design note v2.1 located (H1) | MD, Claude, James | M4 |
| C6 | Statutory access routes findable in the VA | Critical (M6 condition) | Input | Workstream F map (WMCA week of 9 Nov) | Claude | M5 |
| C7 | Hospital, prison and rehab as sleeping situations (backlog 65) | Critical (delivery plan, consequential) | Next | None | Claude | M4 |
| C8 | Contact data re-verified at source before launch, **including every fallback relied on at M6** (section 2A) | Critical | Input | Statutory routes map; Eliz | Claude, Eliz | M6 |

### D. Questions and routes

| ID | Item | Class | Status | Waits on | Owner | By |
|---|---|---|---|---|---|---|
| D1 | Question purpose register: confirm purposes | Critical (feeds D2, E4) | Decision | MD on the 8 open questions | MD | M2 |
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
| E1 | Confirm non-exclusion as the reading of hard gate B for trans answers | Dependent. *Interim: the contract's own outcome, already in A6* | Decision | MD, in the service matching review | MD | M4 |
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
| H4 | This paper, the pathway review, the question register and the trans paper committed to the VA repo as working drafts | Deferrable | Ready for go | MD go | MD | M1 |

---

## 4. Decisions waiting

### On the critical path, in the order they unblock work

1. **Go on A4 and A6.** Gets them into James's queue.
2. **James's week-1 answers** on what the platform exposes. They unblock B1a.
3. **Question register: the 8 open questions (D1).** They unblock D2 and E4.
4. **Care leaver questions (C1).** Ready to build once WMCA leaving care contacts are verified.
5. **Places to start: the five points (C5), with design note v2.1 located (H1).**
6. **Statements applying the law (D8).**

### Launch-dependent: decide in time, or launch on the fallback

7. Domestic abuse sequence and exit button (C2, C3).
8. Trans answers, E1 and E3, in the service matching review.

### Can follow launch

9. Engine adoption (F3), if wanted.
10. Worker beside someone (D7).
11. Testing the circumstances screen (D5).
12. Option A+ (E2).

---

## 5. Milestone view

*Proposed. To be checked with James against the national delivery plan.*

| Week of | What the VA needs to reach | Critical items |
|---|---|---|
| 2 Nov (M1) | Fixes in James's queue. Week-1 answers. Decisions 1 to 3 | A1 to A3, A6 |
| 9 Nov (M2) | WMCA leaving care contacts verified. Question purposes settled. Gender fix decisions | D1, A7, H1 |
| 16 Nov (M4a) | **Connection proved** on a representative slice. This is not the full live read | B1a |
| 23 Nov | Critical pathways and question fixes built, each with its tests | C1, C5, C7, D2 to D4, D8, G1 |
| 30 Nov (M4, M5) | Live read complete on staging; V4 categories and age gates; WMCA trial | B1b, B2, B3, C6 |
| 7 Dec (M6) | Contact data and fallbacks verified for launch; data protection notes complete; final test run and type check | C8, E4, G4, G5 |
| 14 Dec or 4 Jan (M7) | VA live in the West Midlands; Watsonx off | |

---

## 6. Risks to the VA dates

| Risk | Effect | Guard |
|---|---|---|
| James's review queue | Every critical routing and safeguarding change waits | Small pull requests, each with its own tests. His part is tentative and his to shape |
| The platform interface is not ready, or exposes less than needed | B1 cannot finish; the VA has no V4 data at the switch | Week-1 answers. Prove the connection early (B1a) on a representative slice |
| A successful M4a read as B1 complete | False confidence at M4 | B1a and B1b tracked separately |
| The domestic abuse safeguarding review takes longer | C2 to C4 slip | Launch-dependent: the current exits remain, once verified for launch (section 2A) |
| Leaving care contacts hard to verify | C1 launches with fallbacks only | The find-your-council line and Housing Options, once verified for launch (section 2A, C8) |
| The prevention pathway's open points not settled | C5, a critical item, slips | Decision 5 is on the critical path, with H1 |
| Decisions pile up | Building stalls | Section 4 separates what is on the critical path from what can wait |

---

## 7. Keeping this current

- Update status as items move. New items go in the right section with the next ID and a launch class.
- When an item finishes, record it in `VA_BACKLOG.md`'s completed list as well.
- If the delivery plan's milestones change after the review with James, change the "by" column here to match.
