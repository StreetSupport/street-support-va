# VA question purpose register

*Working draft, 31 October 2026. Prepared by Claude for the Managing Director.*

**What this is.** It covers every question the VA can ask: why it is asked, what it does today, what is still to be built, and whether it is defensible.

**The starting assumption.** Every question was put there for a reason (Managing Director, 31 October 2026). Not changing today's output is not the same as having no purpose. Where the record is silent, the likely purpose is marked *inferred, for confirmation*.

**What was read.**
- VA code at `dd10813`. VA governance at `4ec0de2`.
- Pipeline: Population Factor Note (blob `e18ba90`, `align/safety-learning-housing-imm-2026-10-29`) and Platform Scope v4 (blob `347b5f3`, `feat/national-housing-2026-10-30`).
- The Appropriate Policy Document, Terms and Conditions and Language Review are on no repo ref, so they were not checked.

**Purposes.**
- **RN:** routing now.
- **RI:** routing intended, not yet built.
- **POP:** population factor or specialist services.
- **SG:** safeguarding or protective.
- **AN:** analytical or strategic: reach, marketing, commissioning, systems insight.
- **OP:** operational.

**Other abbreviations.**
- **(inf.)** = inferred, for confirmation.
- **PNTS** = prefer not to say.
- **DMN** = Data Minimisation Note.
- **HPEC** = Housing Pathway Endpoints Contract.
- **AC** = Analytics Contract.
- **BL** = VA backlog.

**What happens to answers.** Answers are held in the session only, not saved on the server. At session end one log line records: area, user type, age band, need, homeless, safeguarding, escalation, duration and route.

---

## Early flow

| Question | Purpose | Today | Gap or issue |
|---|---|---|---|
| Crisis or danger | SG | Exits | None |
| Location (share, postcode, pick area) | RN, AN | Area drives every local contact; logged | Coordinates are kept but unused; drop once the area is known |
| What are you looking for | OP | Navigation | Stored value unused |
| Full or quicker route | RN, informed choice | Logged | The assumptions list is incomplete (BL 62) and there is no switch |
| Preferred name | OP (inf.): personalisation | **Never stored, because of a defect.** A typed name can reach the interpreter | DMN says the VA asks no names. Decide whether to keep it |
| Where are you accessing this from | **AN: reach and marketing (MD).** OP: accessibility (DMN) | Stored, not logged | Not in the log yet (BL session analytics). Options differ from AC. No skip |
| Used Street Support before | AN (DMN) | Stored, not logged | Duplicated later at B11 |
| Did last time help | AN: outcome proxy | Stored, not logged | Options differ from AC |
| Who is it for | OP, AN, RI | Wording; logged | BL 60, 69 |

## Non-housing needs

| Question | Need | Purpose | Today | Gap or issue |
|---|---|---|---|---|
| Main need | All | RN | Picks the pathway | None |
| Advice type | Advice | RN | Filters | None |
| Age | Health, Work, Training, Activities, Drop In, quick housing | SG, RN, POP | Under-16 exit; youth filtering | Not saved for non-housing (BL 59) |
| Gender | Health, Activities, Drop In | RN, POP | Gender-restricted services | **Defect: women are excluded from women-only services**, because "female" contains "male" |
| LGBTQ+ | Health | RN, POP | LGBT Foundation shown | None |
| LGBTQ+ specialist preference | Health | RI | No effect on Health | BL 22, 14 |
| Convictions | Work | RN (ranking), POP | Boosts ex-offender services | Article 10 basis not documented |
| Immigration status (10 options) | Work, Financial | RN, POP | Works out public funds access | The clearest status question; reuse it in housing |
| Children | Financial | RN, POP | Family services boost | None |

## Housing core

| Question | Purpose | Today | Gap or issue |
|---|---|---|---|
| Homeless or not | RN, SG | Branches | None |
| In touch with Housing Options | **RI:** code note says lead with navigators where already in touch | Stored, unused | Not built. Housing Options can be reordered but never removed (HPEC) |
| Housed situation | RN, AN (inf.) | Non-home answers re-routed as homeless | None |
| Prevention gate | RN, SG | Opens prevention | None |
| Sleeping situation | RN | Rough sleeping adds StreetLink | BL 65, 66 add options |
| How long (B8) | AN (logged); RI (inf.): entrenched rough sleeping | The one profile field in the log | Routing use not recorded |
| Main reason (B9) | SG (DA exit); RI: Section 21 (BL 64), prison and hospital (BL 65); AN (inf.) | DA exit; mental health acknowledgement | Health options are not in DMN's Article 9 table |
| Income (B10) | Inf.: RI (financial help) and AN | Stored, unused | No backlog item; overlaps prevention employment |
| Used Street Support before (B11) | AN | Stored, unused | Duplicates the early-flow question |
| Already supported (B12) | **RI: avoid suggesting them back (MD)** | Stored, unused | Exclusion not built |
| Which organisation (B12A) | **RI**, as above | **Defect: typed names are rejected** and the user is escalated | Replace the free text with buttons of the organisations the results would show. AC forbids free text |

## Prevention (housed, at risk)

| Question | Purpose | Today | Gap or issue |
|---|---|---|---|
| Reason | SG, RN | Legal emergency exit | BL 24 |
| Urgency | SG, RN | Escalations | BL 24 |
| Children | SG, RN, POP | Children-at-risk exit | Not fed into the shared children field |
| Employment and income | Inf.: RI, AN | Stored, unused | BL 24; overlaps B10 |
| Prior support | RI: don't suggest what was tried | Stored, unused | BL 24 |
| Anything else going on | SG: a moment to disclose | Follow-up | None |
| Follow-up (DA, health, substance, child, other) | SG | Exits | Substance use leads nowhere specific; addiction services (inf.) |

## Section C (full route, homeless)

| Question | Purpose | Today | Gap or issue |
|---|---|---|---|
| Consent screen | Informed choice | No skips Section C | Contradicts the March removal of consent gates; reword as notice and choice |
| Immigration status | RN, POP | NRPF organisations | Leave-to-remain holders are never asked about public funds. Replace with the 10-option question |
| EU Settlement Scheme follow-up | RN | Opens the public funds question | Folds into the above |
| Public funds | RN | NRPF layers | None |
| Children | RN, POP | NRPF family layer | No PNTS |
| Age | SG, RN, POP | Exits and youth layers | **The only age question on the full route.** Prevention users and those who decline consent are never asked |
| Gender | RN (opens pregnancy), POP | Not read by housing | No PNTS, no non-binary option |
| Pregnancy | RN, POP | Counts as children | Men never asked; no PNTS; Article 9 |
| **Ethnicity** | **POP: ethnic minority communities (MD)**; Article 9 analysis | Stored, unused, not logged | Highest risk: Article 9, not in DMN, no PNTS, incomplete options. Needs a use built or moving to an optional end section |
| Physical health | OP and RI (inf.): access barriers (SMC hard gate D) | Unused | No PNTS; access barriers not built |
| Mental health | RN (ranking in later needs) | Housing does not use it | Has PNTS |
| **Convictions** | **RI: arson, which excludes from most services (MD, HPEC, BL C2)**; POP | Nothing: the answer values never match what the matcher looks for | Arson pathway not built; no "other"; Article 10 basis undocumented |
| **LGBTQ+** | **RN, POP: specialist services (MD)** | AKT and Stonewall | No PNTS; BL 22 |
| LGBTQ+ preference | RN | "Local only" removes nationals | None |
| Currently in care | RI: care leavers (BL C1) | Redundant: age already triggers the block | Wrong tense; becomes the care leaver question |
| Social services | RN, SG | 16-17 layout and guidance | None |

## Safeguarding gates

| Question | Purpose | Note |
|---|---|---|
| Under-16 and fire or flood area | SG | Fine |
| DA gender | SG, POP | PNTS falls through to Galop. DMN says orientation is asked; the code uses gender |
| DA children | SG, POP | Changes nothing today; no PNTS |
| SA gender | SG, POP | As DA |

---

## Population factors (Platform Scope v4)

| Factor | Identified by |
|---|---|
| Refugees, asylum seekers, migrants | Immigration questions (not on the quick route) |
| Ethnic minority communities | Ethnicity (collected, unused) |
| Care leavers | "Currently in care" (wrong tense, 16-20 only) |
| Criminal records | Convictions (Work, housing), reason "leaving prison" |
| LGBTQ+ | LGBTQ+ questions; the gender proxy on DA and SA |
| Men, women | Gender questions |
| Young people | Age questions |
| Parents and families | Children and pregnancy questions |
| Older people, people with dogs, sex workers, veterans | **No question.** Veterans has a drafted question in the backlog. Sex workers is likely deliberate (inf.). Older people is a tag the Population Factor Note drops but Platform Scope keeps |

---

## Intended but not yet built

1. Leave out the organisation already supporting someone (B12, B12A). No backlog build item.
2. Reorder results when already in touch with Housing Options. Code note only.
3. The arson and convictions pathway. BL C2; HPEC.
4. Care leavers 18-20 (BL C1, launch blocker) and 21-24 (future).
5. Prison, hospital and rehab discharge. BL 65; prison pathway.
6. Veterans. Backlog; question drafted.
7. Section 21. BL 64.
8. LGBTQ+ local specialists and specialist-first order. BL 22, 14.
9. Prevention prior support and employment. BL 24.
10. Physical health access barriers. SMC; no backlog item.
11. Ethnic minority community services. No backlog item.
12. Logging of the reach and outcome questions. BL session analytics.
13. Supporter relationship and professional type. BL 60, 69.

## Defects found

Each was confirmed by reading the code on 31 October.
- **Gender filter.** Women are excluded from women-only services, because "female" contains "male".
- **Which organisation (B12A).** Typed names are rejected.
- **Preferred name.** It is never stored.
- **Full-route age.** Prevention users, and anyone declining the consent screen, are never asked their age.

## Where the documents and the code disagree

1. **Names.** DMN says none are asked; the VA asks for a preferred name.
2. **Core fields.** DMN says age, gender and area are always collected. In code, age and gender are asked on some needs only.
3. **Non-housing fields.** DMN lists none for Work, Financial, Training, Activities and Drop In. The code asks age, convictions, immigration, children and gender.
4. **Article 9 scope.** DMN covers orientation and health only. The code also asks ethnicity, pregnancy and the health reasons at B9.
5. **Article 10.** No VA document read covers convictions.
6. **DA and SA.** DMN says orientation is asked; the code asks gender.
7. **Consent gate.** Removed in March according to DMN and the decision log; still live in Section C.
8. **Prefer not to say.** Missing on about ten questions where DMN and the Service Matching Contract require it.
9. **Analytics options.** The Analytics Contract's options for reach and outcome differ from the code.
10. **Care leavers.** HPEC says "previously in care"; the code says "currently".
11. **Older people.** Kept by Platform Scope; dropped by the Population Factor Note.

## Open questions for the Managing Director

1. **Ethnicity.** For routing to ethnic minority services, analysis, or both? If analysis only, should it move to an optional end section with PNTS and into DMN?
2. **Preferred name.** Keep it for personalisation, or remove it to match DMN?
3. **Access location.** Should DMN record the reach and marketing purpose as well as accessibility?
4. **Duration, income, employment.** Intended for routing, analysis, or both?
5. **Consent screen.** Keep it as notice and choice, or align it with the March removal?
6. **DA and SA.** Ask orientation as DMN says, or confirm gender as the decided proxy?
7. **Care leavers.** Change the in-care question to "ever been in care", 16-24, ahead of C1?
8. **The referee branch.** Its labels mark 12 questions as having no purpose. They are corrected here and need correcting there before that work continues.
