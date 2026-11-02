# VA decisions and delivery extract

2 November 2026 · Matt Lambert

*Exported from the working copy at https://claude.ai/artifact/2WBdV7XmQ9tZg59vDE1HDj (revision 16), 2 November 2026. This file is the repo record.*

## What this is

The 2 November working note is a target, not a description of the build. This extract turns it into delivery: what changes, from what the code does today, on whose authority, in which review round. It is for the technical lead, and it holds no authority over the VA plan, the national go-live plan or any governance decision; where they differ, they win.

**Sources.** VA `staging` at `cd67b68` (1 November), audited on 2 November (four audit files: conversation, matching, analytics, pipeline records); PRs #36 and #37; the working note at its evening state; the modern slavery paper; the VA design status and plan on `docs/va-review-2026-10-31` at `2dd1bae` (item IDs below are that plan's).

**Classes.**

1. **Corrections:** confirmed defects, or code that breaks a settled decision. Small, evidenced, each with tests. Every one cites the audit.
2. **Launch requirements:** what a safe, functioning launch needs. Dependencies, owners, review and milestone shown.
3. **Extensions:** new capability. Feasibility, and now or later.

**Columns.** Code today · Decided (MD) · Still proposed · Authority. Then the plan item and review round.

**Rules.** Placement does not confer readiness: a safeguarding item in class 2 is not launch-ready because it sits there. A stated purpose does not by itself make collecting an answer necessary or lawful. Dates are the VA plan's review rounds (weeks of 9, 16, 23 and 30 November, and 7 December).

## 1. Corrections to the existing launch design

Twenty corrections: three already built (#36, #37), the rest small, each with tests where it touches routing. A larger redesign that follows from a settled decision, such as the crisis housing conversation, sits in class 2 even where the current code contradicts it. Audit refs: A conversation, B matching, C analytics, D pipeline records.

### Code

| # | Correction | Code today (audit) | Decided (MD) | Still proposed | Authority | Plan, round |
| --- | --- | --- | --- | --- | --- | --- |
| 1.1 | Age asked on every housing route | Full route asks age only in Section C after consent; prevention never asks it (A §H, §A4) | Fix, not an escalation | None | Tier 2, PR | D4; **built, #36**; 9 Nov |
| 1.2 | No coordinates in the location log | Raw latitude and longitude logged (C §1, route.ts:224) against the Analytics Contract's LA-only limit | Log LA only | None | Tier 2, PR | **Built, #36**; 9 Nov |
| 1.3 | No duty, must or entitlement language | About 20 places, including "legal duty to assess" on the housing terminal (A §I) | Never state what a service must do; keep "duty team" and Shelter's "explain your rights" | None | Tier 2, PR | D8; **built, #37**; 9 Nov |
| 1.4 | Out-of-hours Housing Options number shown in housing results | Held for 6 of 7 councils, shown only in the fire and flood exit (B §4, serviceMatcher.ts:176-183) | Show it beside the daytime number; no time logic | None | Tier 2, PR | New; 9 Nov |
| 1.5 | Prison and hospital discharge as sleeping situations | Only a B9 reason, full route only (A §C) | Options within where-sleeping | None | Tier 2, PR | C7; 9 Nov |
| 1.6 | Plain social services question for 16 and 17 | Two legal questions, "Children's Act 1989" misnamed; quick route never asks (A §E, §H) | Asked on every route, for routing | Wording: "Are you in care, or in touch with a social worker at the moment?" | Tier 2, PR; safeguarding-adjacent | A1 to A3; 9 Nov |
| 1.7 | Gender question stops mixing sex and gender | Asks "current biological gender" under "What is your gender?"; no non-binary or prefer not to say (A §E) | Gender stays; wording must stop mixing | A+ handling for trans answers | Tier 2, PR; E1 with James | E1, E3; 16 Nov |
| 1.8 | Prefer not to say where missing | Absent on ethnicity, physical health, access location and used-before (A §E, C §2) | Required by the Data Minimisation Note and Service Matching Contract | None | Tier 2, PR | D3; 9 Nov |
| 1.9 | Typed answers reach the handler | route.ts:342 passes the option number, so a typed name or organisation is lost; a typed name is sent to the Anthropic API and never stored (A notes, C §1) | None yet | Remove preferred name (register Q2) | MD on Q2, then Tier 2, PR | D4; 9 Nov |
| 1.10 | "Not sure" at who-is-it-for kept, not turned into "myself" | Silently set to SELF (A §G) | A place to start is recommended when someone is not sure | Wire to the place-to-start recommendation | Tier 2, PR | C5; 16 Nov |
| 1.11 | Prevention early exits keep the housing floor | Urgent eviction or children ends with Shelter and Citizens Advice only, no Housing Options or local services (A §G) | Housing Options for everyone; once housing is in view, Housing Options, a housing-factor specialist and Shelter | None | Tier 2, PR | C5; 16 Nov |
| 1.12 | Domestic abuse from the crisis gate shows local services | Location is collected after the gate, so no local DA service shows (A §J, B §4) | Standard share-location step (31 Oct) | None | Tier 2, PR; safeguarding review | C2; 16 Nov |
| 1.13 | Unreachable DA block on the housing terminal | Gated on a flag only set by an exit that ends the session (A §I, B §4) | None | Remove, or wire through the Safety pathway | Tier 2, PR | C2, C9; 16 Nov |
| 1.14 | Domestic abuse and sexual assault route on what the APD says | Routed on gender only; a lesbian or gay user choosing Female or Male never sees Galop (A §J) | None yet | Orientation as the routing input (register Q6) | MD, then James for safeguarding review | D1; 16 Nov |
| 1.15 | Youth labels stop acting as a hard filter | Youth client groups hide services from other ages; "18+ only" and similar not read; elderly filter matches nothing (B §2) | Exclusion only on explicit rules; a tag is not a restriction | The three-part reading rule (plan §8, Q2) | MD on the rule, then Tier 2, PR | B3, I4; 23 Nov |
| 1.16 | Questions asked but never used | Housing Options involvement (TODO), used-before asked twice, access location and return outcome stored, never logged (A §C, §E; C §1) | Every question has a documented purpose | Use or remove each, through the register | MD via D1 | D1, D2; 16 Nov |
| 1.17 | Known handler defect | stateUpdates not propagated in four B5 handlers: age, gender, convictions, children (C §6, backlog 59) | None | Fix | Tier 2, PR | New; 9 Nov |

### Governing documents

| # | Correction | What the record says | What is true | Authority | Round |
| --- | --- | --- | --- | --- | --- |
| 1.18 | Galop and ManKind numbers | Endpoints Contract gives both 0808 800 1170 | Code holds distinct numbers: ManKind 0808 800 1170, Galop 0800 999 5428 (B §5) | MD; verify at source (C8) | With C9 amendments, 16 Nov |
| 1.19 | Sexual violence endpoints | In the Safeguarding Contract crisis exit, missing from the Endpoints Contract table | SARC, Rape Crisis, Galop and SurvivorsUK are all in code (B §5) | MD; contract alignment | With C9 amendments, 16 Nov |
| 1.20 | Data protection notes | APD: no logs of individual profiling data. Data Minimisation Note omits ethnicity, duration, income and employment | The session-end log records age, need, area and route; all four are asked (C §1, §4) | MD; James review of the notes | D2, E4; by M6 |

**Housekeeping, deferrable.** `profiling.ts` is dead code; `TERMINAL_CHECKIN` is never referenced; a duplicate organisations file is unused; the Migrant Advice Portal is named in endpoint metadata but not in code; the Shape Fields Note's status line says shape is not in the data, but the 28 October baseline carries it (A notes, §K; B §1, §4; D §2).

## 2. Requirements for a safe, functioning launch

Eighteen requirements. Most have their design decided and wait only on wording or one named decision; the live read is the hardest dependency, because it needs the copy of the site. Being in this class does not make an item launch-ready.

| # | Requirement | Code today (audit) | Decided (MD) | Still proposed or open | Authority | Plan, round |
| --- | --- | --- | --- | --- | --- | --- |
| 2.1 | **Live read of V4 data** | January 2026 file of 1,323 services, old taxonomy, no V4 fields (B §1); the delivery plan counts 500 no longer current | Read the platform database as the website does, with a weekly review (31 Oct) | Settled by lookup (website main at 33202ae): search by distance from the person, 5 km default, as Find Help does; council kept only for statutory routes. Open: widening when few match; how stated area restrictions are shown (about 24 of 301 WMCA organisations state one, mostly food and money advice; no accommodation listing does; count of 2 November) | James, PR; MD on the two open points | B1a 16 Nov; B1b 23 Nov |
| 2.2 | **V4 needs on the main menu, category maps, age gates** | Old 12-item menu; no Addiction, Immigration, Essentials or Safety (A §A3, B §2) | Safety from harm on the menu in plain words; Employment and Activities not prevention entries | Non-housing floors per V4 parent, below | Tier 2, PR | B2, B3; 23 Nov |
| 2.3 | **Crisis housing conversation** | "Are you currently experiencing homelessness?"; no safety question on the homeless branch; no armed forces question (A §C, §D, §E) | Branch on materialisation, not 56 days; safety early and plainly, including exploitation; order: branch, safety, age, care leaver, armed forces, immigration, household and gender, LGBTQ+, convictions; pregnancy and children asked of everyone; no Addiction pointer; Shelter always present, never called a fallback | Branch question wording; Shelter framing wording | Tier 2, PR; the safety question is safeguarding-adjacent | New; 9 Nov |
| 2.4 | **16 and 17 route** | All of Section C asked, ethnicity and convictions included (A §H) | Keep social services, pregnancy and children, LGBTQ+, immigration; drop convictions and armed forces | Skip non-routing Section C questions; immigration on every route; the "something different" line | Tier 2, PR; safeguarding-adjacent | A1 to A3; 9 Nov |
| 2.5 | **Food: one optional question** | Asks nothing; location only (A §A6) | One skippable question, "Just show me food near me" as a first-class choice; voucher route shown where needed | Wording | Tier 2, PR; a sizeable routing change, for James | C5; 9 Nov |
| 2.6 | **Safety route, including modern slavery (C9)** | No exploitation option anywhere; modern slavery only via a narrow advice path; DA routed on gender alone (A §B, §D, §J; B §5) | Open to everyone; type-of-harm question (six options plus the debt line); OK to carry on, reusing gate exits; outcomes: access to safe accommodation, someone to talk to, advice on what I can do; modern slavery: getting out safely, advice; no reporting option; no new gate option; helpline in open hours, Salvation Army 24-hour line, 999 | Advice mechanism; multiple-harm exits; aftermath listings lookup | Tier 2, PR; contract changes under explicit trustee review by email | C9; 16 Nov |
| 2.7 | **Domestic abuse within the Safety pathway** | Gender then children then exit; children change wording only (A §J, B §4) | Help first, then location, then services and housing (31 Oct); no stay-or-move question, shown as information | Quick exit button option A, B or C | MD on C3; safeguarding review | C2 to C4; 16 Nov, or current exits stay |
| 2.8 | **Prevention with places to start (C5)** | Single-choice profiling; no noticing step, no place to start, no "not sure" (A §G) | Position worked out, not asked; housing in view divides positions; entry from Housing, Finance, Food, Essentials, Health, Addiction; noticing step; awareness line (MD wording); place to start recommended when not sure; Citizens Advice a specialist by subject | Rows for Essentials, Health, Finance crisis entry, Housing after loss; fallback wording; phrasebank approval | Tier 2, PR; James on phrasebank wording | C5; 16 Nov |
| 2.9 | **Young people's prevention route (C10)** | None | Before launch; St Basils family mediation is a confirmed listing | Its shape | Tier 2, PR | C10; 30 Nov |
| 2.10 | **Care leavers 16 to 24** | Asks only "currently looked after", 16 to 20 (A §E) | Age, then care leaver if 16 to 24; "ever been in care" | Leaving care contacts | Tier 2, PR | C1; 30 Nov |
| 2.11 | **Statutory routes and verified contacts** | Children's Services out-of-hours not held for Solihull or Walsall; no modern slavery endpoints (B §4, §5) | Contact data verified at source; helpline hours rechecked before launch | WMCA routes map | MD; Eliz for local knowledge | C6, C8; by M6 |
| 2.12 | **Non-housing floors aligned to V4** | Floors on the old categories; Food and five others have none (B §6) | Citizens Advice surfaced by subject | Debt floor; Addiction and Immigration types and floors | Tier 2, PR; contract amendment | B2; 23 Nov |
| 2.13 | **Matching and cards** | Points ranking, dedupe, five per need, phone and website inline (B §2; C §1) | Five tailored services after statutory routes; organisation cards; "Get in touch"; see-all link | I1 design note; I2 tag questions; the reading rule | MD; contract changes to trustees | I1 to I9; 23 Nov |
| 2.14 | **Questions documented** | Ethnicity, duration, income, employment asked but not in the notes (C §4) | There has to be a reason to ask | Register Q1, Q2, Q5, Q6 | MD; James reviews the notes | D1, D2, E4; by M6 |
| 2.15 | **Analytics at launch** | Console logs only; no feedback, no click events (C §1, §2) | Completion is a design goal | Completion measure: "Get in touch" tap, closing intention question, or both | MD; Analytics Contract amendment | G2, I6; fallback the session-end log |
| 2.16 | **Website advice on modern slavery** | None on the website | Write it, modelled on Unseen's FAQs; does not explain who refers | Draft | MD approval | New; by M6 |
| 2.17 | **Contract amendments** | Passive-only signposting in the Endpoints Contract; no Safety route in the Safeguarding Contract | Amend both; explicit trustee review by email, responses recorded | Drafts | Trustees, then James via PR | C9; drafts 16 Nov, review before M6 |
| 2.18 | **Accessibility and the launch commit** | Backlog 41 open | Tests ship with each change | None | James | G1 23 Nov; G4, G5 7 Dec |

## 3. New capabilities and design extensions

None of these blocks launch. Three are worth deciding now because a launch item leans on them; the rest follow launch.

| # | Extension | Code or data today | Decided (MD) | Still proposed or open | Authority | Now or later |
| --- | --- | --- | --- | --- | --- | --- |
| 3.1 | **One organisation that fits, by shape** | Shape is free text on 301 WMCA organisations, about 80 values; six are housing broader remit; none in the national baseline (D §2) | One organisation that fits, not a specialist per pressure; factor never routes | Normalising, authority to use shape (Data Enrichment and Service Matching Contracts), the data interface | MD; James; contract amendments | **Now, as a decision:** launch on the fallback wording; build later |
| 3.2 | **Closing intention question** | No next-step or feedback question (A §K) | Measure what we value: noticing, connection, visibility | "What feels like your next step?"; a fourth intelligence field, a material change to the Data Minimisation Note and Analytics Contract | MD; contract amendment | **Now, as a decision,** paired with the completion measure (2.15) |
| 3.3 | **Aftermath listings under "someone to talk to"** | Not surfaced; moved mainly to Health by the migration | Find them by lookup, not inference; the migration does not change | Fields and count; listings added after migration carry no history | Claude Code read; MD | **Now, as a read,** feeding C9 |
| 3.4 | Durable analytics, feedback, click events | Console logs only (C §1) | Analytics is a loop, not a report | CSV or store; "Was this helpful?"; prevention events from design note v2.0 | MD; Analytics Contract | Later; launch on the session-end log |
| 3.5 | Theory of Change mapping | No Theory of Change on any ref (D §4) | Map analytics against version 3, then revisit for prevention | Runs after the narrative and Brand Review settle | MD; Mara | Later |
| 3.6 | Local contact line, the human touch point | None identified | Criteria drafted; consent is not a criterion | Dataset read; whether anyone meets the criteria | MD; Eliz | Later |
| 3.7 | Ethnicity as a routing input | Asked, no prefer not to say, not in the notes (A §E, C §4) | None | Ask everyone, framed around routing, or targeted (register Q1); Article 9 basis | MD | Decide now (D1); routing use later |
| 3.8 | Duration as a routing input | Asked on the full route, logged (A §E, C §1) | Kept, in broad bands | Listings check for stated restrictions | Claude Code read; MD | Later |
| 3.9 | A restriction field in the data | None; restrictions live in listing text (plan §8) | Neither platform nor V4 holds one | Whether to add one, and when | MD | Later |
| 3.10 | Routing engine | Exploration branch only | Launch on the current VA | Adoption | MD and James | Later, unless chosen by 13 Nov |
| 3.11 | Sex work, honour-based violence | No routes | Parked | Test wording with specialists; reconsider honour-based violence as for modern slavery | MD | Later |
| 3.12 | Position by need beyond prevention | Not designed | Parked, Immigration first | None | MD | Later |
| 3.13 | Helper access | None | A separate design process, hoped to be commissioned by WMCA | None | MD | Later, long term |
| 3.14 | Circumstances screen, worker beside someone, A+ for trans answers | None | Parked to after launch | User testing; language review | MD; James | Later |

## 4. Open decisions, in the order they unblock review

Fifteen open items. Eleven are the Managing Director's, most minutes each; two are James's; two are shared. Design and decisions should close by about 13 November for the 16 and 23 November rounds to hold.

| Needed by round | Decision or input | Whose | Unblocks |
| --- | --- | --- | --- |
| 9 Nov | Two 16 and 17 wording sign-offs: the social services question, the "something different" line | MD | 1.6, 2.4 |
| 9 Nov | Register Q2, preferred name: remove or keep | MD | 1.9 |
| 9 Nov | Register Q5, consent screen: notice and choice, not a gate | MD to confirm | 2.14 |
| 9 Nov | Crisis branch question wording, on materialisation | MD | 2.3 |
| 9 Nov | Settled by lookup: the website searches by distance (5 km default; 1 to 25 km offered), never by council. Left: whether the VA offers "look further away" when few match; services stating a local connection requirement (services outside WMCA: none in the data, MD) | MD | 2.1 |
| 16 Nov | Advice mechanism: pull into the VA, link to the website, or summary plus link | MD | 2.6, 2.7 |
| 16 Nov | Multiple-harm exits specified against the Safeguarding Contract | James | 2.6 |
| 16 Nov | Domestic abuse quick exit button: option A, B or C | MD | 2.7 |
| 16 Nov | Register Q6: orientation as the routing input to Galop | MD, then James | 1.14 |
| 16 Nov | Remaining prevention rows, the fallback wording, the "not sure" option | MD | 2.8, 3.1 |
| 16 Nov | Completion measure, with the closing intention question | MD | 2.15, 3.2 |
| 16 Nov | Register Q1, ethnicity: ask everyone or targeted | MD | 2.14, 3.7 |
| 23 Nov | Population tag questions and the reading rule for restrictions | MD | 1.15, 2.13 |
| 30 Nov | Services open to under-18s (pipeline #132) | James | 2.9 |
| By M6 | Analytics Contract status: the governance overview calls it an approved baseline; the file in the repo is a draft with a blank approval table. **Cannot establish** which holds | MD to confirm | 2.15, 3.2 |

**Sources.** Audit files A to D, 2 November 2026 (`governance/audit_2026-11-02/`); VA `staging` at `cd67b68`; PRs #36 and #37; the [working note](https://claude.ai/artifact/GkTktNmFXsNTbRem2v9Ym4); the [modern slavery paper](https://claude.ai/artifact/K71R5qAPpfEJRnn1X3NVHz); the VA design status and plan on `docs/va-review-2026-10-31` at `2dd1bae`; the national go-live plan on PR #192 at `9794b68`.
