# Audit C: VA analytics, data minimisation and backlog (read-only)

Date: 2 November 2026. Repo: `/home/claude/streetsupport/street-support-va`.

Refs read:
- Code: `staging` at `cd67b68` (checked out, equal to `origin/staging`).
- Governance: `origin/docs/va-review-2026-10-31` (abbreviated `REV`). Analytics Contract, DMN and Early Prevention note last touched at `6851f79` (3 Oct), identical blobs on four branches. Question Purpose Register last touched at `e6bb66f` (31 Oct), only on `REV`.
- Backlog: newest `VA_BACKLOG.md` by last commit across all refs is `origin/docs/backlog-v4-alignment-2026-10-23` (`8fdaf6b`, 23 Oct, blob `36d0ed6`; abbreviated `BL`). `REV` carries an older copy (`23aa0be`, 19 Oct). `staging` and `main` copies date from `6b7eaba` (2 July). Note: the file header still says "Last updated: 16 June 2026" (`BL:VA_BACKLOG.md:4`).

---

## 1. Analytics in code today

No analytics SDK, database, KV, file or CSV store exists. `package.json` dependencies are only `@anthropic-ai/sdk`, `next`, `react`, `react-dom`, `uuid`. No posthog, `@vercel/analytics`, localStorage or sessionStorage in `app/`, `lib/`, `components/`.

Session state is not stored server-side. It is base64 JSON round-tripped to the browser (`staging:app/api/chat/route.ts:20-30`) and held in React state (`staging:components/ChatWidget.tsx:467`). It is lost on close.

The only "recording" is `console.log` to server stdout. Persistence depends entirely on the host's log retention (e.g. Vercel runtime logs); nothing in the repo configures it.

| Log line | Where | Fields | Persisted? |
|---|---|---|---|
| `[VA] Gate: <gate>` every request | `staging:app/api/chat/route.ts:207` | current gate | stdout only |
| `[VA] Location result:` | `route.ts:224` | whole `locationData` object: success, localAuthority, **latitude, longitude**, isWMCA, isScotland | stdout only. Raw coordinates logged; finer than LA level (AC line 45) |
| `[VA] Advice tangent detected` | `route.ts:273` | phrase key | stdout |
| `[VA] -> Next gate ... Ended` | `route.ts:345` | next gate, ended flag | stdout |
| `[VA] SESSION END:` (commented "for analytics") | `route.ts:347-360` | id (sessionId), la, userType, age, need, homeless, safeguarding, escalation, duration, routeType | stdout. Only fires on the `processInput` path; sessions ending via other returns (e.g. under-16 intercept, advice "done" path is via processInput so included) or abandonment are not logged |
| `[VA] SAFEGUARDING_TRIGGER` | `staging:lib/stateMachine.ts:960-978` | event UNDER_16_DETECTED, type, code, sessionId, fromGate, timestamp, pathwayChange | stdout. Categorical, no raw input |
| `console.error` on API/Claude failures | `route.ts:113,167,192,372`; `app/api/location/route.ts:162`; `lib/handlers/shared.ts:56` (includes `localAuthority` and sessionId) | error objects | stdout |

Not logged: `terminalOutcome` (set in session, `lib/types.ts:187`, never logged), `accessLocation`, `returnUser`, `returnOutcome`, Section C fields.

**Operational intelligence questions are asked and held in session, never logged.**
- `ACCESS_LOCATION_ASK` (`lib/stateMachine.ts:1182-1188`; phrase `lib/phrasebank.ts:88-96`). Options: Library, Community centre, Council office, At home, On my phone, Other. No skip.
- `RETURN_USER_ASK` "Have you used Street Support before?" Yes/No (`stateMachine.ts:1191-1204`, `phrasebank.ts:97-105`).
- `RETURN_USER_FOLLOWUP` "Were you able to use any of the support we suggested last time?" Options: Yes, it helped / Some of it / No, it didn't work out / Prefer not to say (`stateMachine.ts:1206-1213`, `phrasebank.ts:107-115`). Stored as `returnOutcome`. This is the only "return outcome" question; it asks "did it help", not "did you contact a service".

**Was this helpful?** Not present. No rating UI, no feedback endpoint, no feedback store. Only `app/api/chat` and `app/api/location` exist.

**Service engagement events:** none. Service cards render phone and website inline (`components/ChatWidget.tsx:413`); no expand state, no click handler on `tel:` or website links.

**Other:** `preferredName` is asked (`stateMachine.ts:1170-1180`) but the gate's only option is "Skip", so typed text fails `parseUserInput` (`route.ts:293`) and goes to `interpretWithClaude` (`route.ts:296-297`, prompt at `route.ts:182`), meaning a typed name is sent to the Anthropic API and never stored. Matches the register's defect.

---

## 2. VA Analytics Contract v2.0 vs code

Source `REV:governance/VA_Analytics_Contract_v2_0.md`. Status Draft, approval table blank (`:246-253`).

| Defined event (line) | In code? |
|---|---|
| Route selected (Generic/Tailored) `:65` | Partial: `routeType` FULL/QUICK in SESSION END log only |
| Route switched with reason `:67` | No (no switch exists) |
| Decision tree endpoint reached `:69` | No (`terminalOutcome` not logged) |
| Routing-critical variables resolved YES/NO/UNCLEAR `:73` | No |
| Advice Mode entered / exited `:77-79` | No (only "advice tangent detected" phrase key) |
| Safeguarding pathway triggered `:83` | Partial: under-16 intercept only; `safeguardingType` in SESSION END |
| Safeguarding exit completed `:85` | Partial: via SESSION END `safeguarding` field |
| Terminal outcome, exactly one per session (support delivered, safeguarding exit, no suitable pathway, user exited early, consent declined) `:87-97` | No. `terminalOutcome` values partly set in state (e.g. `NO_SUITABLE_PATHWAY`, `stateMachine.ts:430`) but not logged; early exit undetectable |
| Service card expanded `:101` | No |
| Service link clicked `:103` | No |
| API failure, stage flag `:107` | Partial: `console.error` with error object, not a stage flag |
| Session timeout `:109` | No |
| Unexpected system state `:111` | Partial: `shared.ts:56` |

Permitted data fields (`:113-127`): enumerated state values, boolean flags, LA, session-relative timestamp, service engagement variables, operational intelligence variables, structured feedback rating.

Operational intelligence fields (named as such, `:129-152`):

| Field | Contract values | Code values | Logged? |
|---|---|---|---|
| accessLocation `:136` | home, library, day centre, hostel, street, other | Library, Community centre, Council office, At home, On my phone, Other | No |
| returnUser `:137` | first time, used before, not sure | Yes / No (boolean) | No |
| returnOutcome `:138` | contacted a service, did not contact, not applicable, prefer not to say | Yes it helped, Some of it, No it didn't work out, Prefer not to say | No |

Constraint "Optional: can be declined or skipped" (`:148`): not met for accessLocation and returnUser (no skip option).

Structured feedback "Was this helpful?" (`:160-170`): not implemented. Free-text feedback with de-linked store and PII scrubbing (`:172-214`): not implemented.

Explicit exclusions (`:216-228`): free text and transcripts are not logged. Contract tension: raw lat/long logged at `route.ts:224` versus "geographic analysis limited to LA level" (`:45`) and "no full postcodes or addresses" (`:224`).

No "contact requested" or completion event in the contract (confirmed by the Proposal, see section 7).

---

## 3. Early Prevention Pathway Design Note v2.0 events

Source `REV:governance/Early_Prevention_Pathway_Design_Note_v2_0.md:73-77`: "mode entered, need disclosed, mode transitions, place to start surfaced and engaged, card expand, and exit mode. These extend the VA Analytics Contract v2.0 events list." Header note (`:3`, MD, 2 Oct) says the design needs overhaul after WMCA work; do not build from sections 3 and 6.

In code: none. No `PREVENTION_CONVERSATION` gate, no `preventionMode`, no place-to-start fields. The current prevention flow is the older profiling-shaped `B7D_*` handlers (`lib/handlers/prevention.ts`). No contract amendment adding these events exists in the Analytics Contract.

---

## 4. Data Minimisation and Lawful Basis Note v1.1

Source `REV:governance/Data_Minimisation_and_Lawful_Basis_Note_v1_1.md`. Status Draft, review required James Cross (`:11-15`).

- **Names:** "does not ask for names, addresses, dates of birth, contact details" (`:26`). Code asks a preferred name.
- Core fields: age category, gender, LA (`:30`).
- Pathway fields: support need, homeless/housed, LGBTQ+, immigration, children or pregnancy, convictions, health or mental health, care leaver status (`:32`).
- Crisis fields: immediate danger, DA, self-harm, sexual violence, under 16 (`:34`).
- Article 9: sexual orientation and health only (`:36`, `:125-138`).
- Routing table (`:108-121`): Work, Training, Financial, Food list no optional fields.
- Operational intelligence: accessLocation, returnUser, returnOutcome (`:148-178`).
- Outstanding: verify tables against implementation (`:186`).

Keyword check:
- **Ethnicity:** only in the history of the removed consent gate (`:60`). Not listed as a collected field. Code asks it (`lib/handlers/sectionC.ts:190`).
- **Duration:** not mentioned. Code asks it (`lib/handlers/homeless.ts:25-30`) and logs it in SESSION END.
- **Income:** not mentioned. Code asks it (`homeless.ts:60-65`).
- **Employment:** only as the "Work" route (`:117`). Not as a field. Code asks `preventionEmployment` (`lib/handlers/prevention.ts:61`).
- **Access location:** yes, as an operational intelligence field with accessibility purpose (`:156`). Reach/marketing purpose not recorded.

---

## 5. Question Purpose Register open questions

Source `REV:governance/VA_Question_Purpose_Register_2026-10-31.md:176-185`. Eight, as expected.

1. Ethnicity: routing, analysis or both? If analysis only, move to an optional end section with PNTS and into DMN?
2. Preferred name: keep for personalisation, or remove to match DMN?
3. Access location: should DMN record the reach and marketing purpose as well as accessibility?
4. Duration, income, employment: intended for routing, analysis or both?
5. Consent screen: keep as notice and choice, or align with the March removal?
6. DA and SA: ask orientation as DMN says, or confirm gender as the decided proxy?
7. Care leavers: change the in-care question to "ever been in care", 16-24, ahead of C1?
8. The referee branch: its labels mark 12 questions as having no purpose; corrected here, need correcting there before that work continues.

Also relevant: register `:30` states the session-end log fields; `:42-44` mark access location, used-before and did-last-time-help as "Stored, not logged"; intended item 12 "Logging of the reach and outcome questions. BL session analytics" (`:151`); doc/code disagreement 9 "Analytics options differ" (`:172`).

---

## 6. VA_BACKLOG.md (BL)

| Item | Line | Summary | Status recorded |
|---|---|---|---|
| 13 | `:467` | Session-level transparency decision log (gates fired, variables, services matched) within AC scope | None (Medium) |
| 14 | `:473` | Match scoring algorithm, percentage, deterministic, not surfaced | None (High, design work) |
| 22 | `:94` | LGBTQ+ local specialist layer for housing (`lgbtq_specialism`) | None (Medium) |
| 24 | `:515` | Prevention pathway conversational architecture, `PREVENTION_CONVERSATION`, four modes, 3 PRs; lists AC amendment for prevention events as needed after Phase 1 | "Design note produced (v1.0, 28 April). Awaiting James review before build" (stale vs v2.0) |
| 33 | no own heading | Quick route. Referenced at `:610`, completed log `:1192` ("Quick route already built and functional", 25 Mar), history `:1242` | Done (25 Mar) |
| 42 | `:604` | Progress acknowledgement line after B5 | Not started, scoped 12 Mar |
| 59 | `:882` | stateUpdates propagation bug in four B5 handlers (age, gender, convictions, children) | Known, not yet built |
| 60 | `:918` | B2_WHO_FOR follow-ups: professional org type, supporter relationship, second name ask | Not started |
| 69 | `:904` | Supporter/professional language review, design note first; prereq item 60 | Not started |
| 80 | `:1106` | Align with V4 governed baseline: A1 categories, A2 service data (snapshot v7 vs baseline), A3 population/age gates, A4 phase as set split on `|`, A5 endpoint data (VA #26) | Not started; all needed before WMCA go-live |
| Session analytics, click tracking, CSV storage | `:990` | Implement AC events, CSV storage; card-expand redesign with `SERVICE_EXPAND` / `SERVICE_CLICK` event shapes | High (pre-launch); no status line |
| Feedback mechanism | `:1023` | Card expand as primary feedback signal; direct feedback not depended on | Approach note 25 Mar |
| Positive Pathway Mapping | `:565` | Moved out of VA backlog | Moved |

Places to start: only mentioned in item 80 A2 (`:1118`, "25 carried by a place to start"). No dedicated item. Phase: item 80 A4 (`:1127`) and item 24 phasing; no other phase-reading item.

---

## 7. Completion measure (I6) and D1/D2

No governance contract defines a completion measure. The Analytics Contract has none.

`REV:governance/VA_Design_and_Service_Matching_Proposal_2026-11-01.md` (proposal from MD to technical lead, 1 Nov):
- `:105-107` Why completion matters (MD, 1 Nov).
- `:252-253` Direction: "Get in touch" button per service; tap recorded.
- `:256` **Proposed, for confirmation in the design note:** "Completion defined as: the person asked to contact at least one service. This measures a step towards contact, not proof of it."
- `:265` "Contact requested" is a new event needing a small AC amendment.
- `:159` "Analytics Contract: has no completion measure (plan, I6)."
- `:438` I6: "Analytics: completion defined, 'contact requested' event, contract amendment; click events wired". Dependent; fallback the current session-end log; Decision; owners MD, Claude; M5.
- `:415` G2: session analytics with contract amendment; log reach and outcome questions. Fallback current session-end log; M5.
- `:551` analytics review item 18 (completion definition, contact-requested amendment, DA org names under small-numbers limits).

D1/D2 (plan decisions), same file:
- `:384` D1: Question purpose register, confirm purposes; MD on the 8 open questions; Critical; M2.
- `:385` D2: for each question remove it, or record purpose and lawful basis in data protection notes, special category first; Claude; M4.
- `:451` decision 3: the 8 open questions (D1) unblock D2 and E4.
- `:480` milestone 9 Nov (M2) includes D1.

Note: `REV:governance/VA_Pathway_Review_2026-10-31.md:25-26` uses D1/D2 for different decisions (Young Persons Team change; test circumstances screen). Also `VA_Pathway_Review:129` records completion as a quick-route purpose (MD, 31 Oct, "not yet in any document").
