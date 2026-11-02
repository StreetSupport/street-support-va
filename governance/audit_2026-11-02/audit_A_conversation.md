# VA conversation audit: what the code does today

Read-only. Repo `/home/claude/streetsupport/street-support-va`, branch `staging`, HEAD `cd67b68c` (2026-11-01, merge of PR #32 fix/gender-filter-2026-10-31). Remote `StreetSupport/street-support-va`. Working tree clean.

Files read in full: `lib/stateMachine.ts`, `lib/handlers/{crisis,homeless,location,prevention,sectionC,shared,terminal}.ts`, `app/api/chat/route.ts`, relevant parts of `lib/phrasebank.ts`, `lib/serviceMatcher.ts`, `lib/types.ts`.

Structural notes that affect everything below:

- `lib/handlers/profiling.ts` is **dead code**. No file imports it (grep for `handlers/profiling` across lib, app, __tests__: no hits). Its B1/B2/B3/B4 handlers are superseded by inline cases in `stateMachine.ts`.
- `B3_AGE_CATEGORY` and `B4_GENDER` have case handlers (stateMachine.ts:1231, 1262) but **nothing routes to them** in live code. Only `profiling.ts:75` sets `B4_GENDER`, and nothing sets `B3_AGE_CATEGORY`. Age on the live path comes from `B5_PROFILE_AGE` or `C3Q3_AGE`.
- `route.ts:342` passes `String(parsed)` (the option number) into `processInput`, never the raw text. Any gate that expects free text receives a number or nothing. See E (preferred name) and E (which organisation).
- Audience: most calls pass `session.isSupporter` (boolean), so PROFESSIONAL users get `__SUPPORTER` variants except in crisis/DV/SA/under-16 handlers that pass `session.userType` (phrasebank.ts:2709-2726).

---

## A. Overall flow

### A1. Opening and crisis gate
- `getFirstMessage` (stateMachine.ts:876-889): OPENING_LINE + LANG_HINT_LINE + GATE0_CRISIS_DANGER, always the SELF variant (`getPhrase(..., false)`, :879). The crisis gate comes before "who is this for", so a supporter always sees the self wording first.
- `handleCrisisDanger` (crisis.ts:212-241). Options 1-6 exit or branch (see B). Option 7 goes to `LOCATION_CONSENT` (:236-237).

### A2. Location, intent, route, early questions (live order)
1. `LOCATION_CONSENT`: share location / postcode / don't share (location.ts:21-47). Postcode and geolocation go via the widget and `processLocationInput` (stateMachine.ts:1665-1722). Manual fallback is `B1_LOCAL_AUTHORITY`: 7 WMCA LAs plus "Other / not sure". "Other" **ends the session** with WMCA_ONLY_SCOPE_NOTICE (stateMachine.ts:1153-1159).
2. `LOCATION_CONFIRM` / `LOCATION_OUTSIDE_WMCA` then go to `GATE1_INTENT` (location.ts:81-86, 104-109).
3. `GATE1_INTENT` (stateMachine.ts:1055-1074; phrasebank.ts:64-71) has three options:
   1. Advice → `B4_ADVICE_TOPIC_SELECTION`, then advice content and `ADVICE_BRIDGE`.
   2. Help connecting → `GATE2_ROUTE_SELECTION`.
   3. Details for a specific organisation → `PREFERRED_NAME_ASK` with `intentType: 'ORGANISATION'`. There is **no org lookup**. It joins the services flow with `routeType` null (see A4).
4. `GATE2_ROUTE_SELECTION` (stateMachine.ts:1121-1126): option 1 = FULL, anything else = QUICK.
5. `PREFERRED_NAME_ASK` → `ACCESS_LOCATION_ASK` → `RETURN_USER_ASK` → (`RETURN_USER_FOLLOWUP` if yes) → `B2_WHO_FOR` → `B5_MAIN_SUPPORT_NEED` (stateMachine.ts:1170-1229).

### A3. B5 need question (phrasebank.ts:345-361; values at stateMachine.ts:1272)
In order:
1. Emergency Housing or Other Accommodation (`Emergency Housing`)
2. Food
3. Work
4. Health Services (`Health`)
5. Advice Services (`Advice`)
6. Drop In
7. Financial Help (`Financial`)
8. Personal Items (`Items`)
9. Personal Services (`Services`)
10. Communications (`Comms`)
11. Training
12. Activities

There is no "not sure" option. There is no Addiction, Immigration or Essentials option at B5. Immigration appears only as an Advice subtype.

### A4. Housing route
- Only `Emergency Housing` takes the housing route (stateMachine.ts:1284-1301).
- QUICK, age unknown: `B5_PROFILE_AGE` first (:1290-1295), then `B6_HOMELESSNESS_STATUS` (:1339-1344).
- FULL: straight to `B6_HOMELESSNESS_STATUS`. No age is asked at this point.
- `B6_HOMELESSNESS_STATUS` → `HOUSING_OPTIONS_INVOLVEMENT_ASK` (:1435-1440) → homeless: `B7_HOMELESS_SLEEPING_SITUATION`; not homeless: `B7_HOUSED_SITUATION` (:1444-1457).
- Housed branch, `B7_HOUSED_SITUATION` (:1459-1475): options 2-4 (friends/family, council temp, other temp) set `homeless: true` and go to the sleeping question. Option 1 (at home) goes to `B7A_PREVENTION_GATE`.
- `B7A_PREVENTION_GATE` (:1477-1497): 1 at risk → prevention (G); 2 just info → housing terminal; 3 change answer → B6.
- Homeless branch, `B7_HOMELESS_SLEEPING_SITUATION` (:1499-1526):
  - QUICK → terminal. If rough sleeping, the STREETLINK_SIGNPOST text is prepended (:1504-1520).
  - Otherwise → `B8_DURATION` → `B9_REASON` → `B10_INCOME` → `B11_PRIOR_USE` → `B12_ALREADY_SUPPORTED` → (`B12A_WHICH_ORG`) (homeless.ts).
  - Then FULL → `C2_CONSENT_GATE` → Section C → terminal. Non-FULL → terminal (homeless.ts:94-108, 117-131).
- **routeType null** (intent option 3): it is not QUICK, so it gets no early age and goes through B8-B12. It is not FULL, so Section C is skipped and it goes to terminal.

### A5. Quick vs full
The trigger is GATE2 option 1 (FULL) vs 2 (QUICK) (stateMachine.ts:1122). The phrase text says the quicker route "will assume the answers are 'no' or 'none'" (phrasebank.ts:126).

Differences in code:
- QUICK asks age before B6 on the housing route.
- QUICK homeless ends after the sleeping question.
- FULL homeless asks B8-B12 then the consent gate and Section C.
- Route type has **no effect on non-housing needs or the prevention branch**. On the prevention branch neither route reaches Section C. Only QUICK asks age.

### A6. Non-housing needs
`routeToNextProfileQuestion` uses `needProfileRequirements` (stateMachine.ts:195-222, 229-318):

| Need | Questions before results |
|---|---|
| Food | **none** (`'Food': []`, :218). Straight to terminal. |
| Items (Personal Items) | none |
| Services (Personal Services) | none |
| Comms | none |
| Health | age (B5_PROFILE_AGE), gender (B5_PROFILE_GENDER), LGBTQ+ (B5_PROFILE_LGBTQ), plus LGBTQ_SPECIALIST_ASK if yes |
| Work | age, convictions (B5_PROFILE_CONVICTIONS), immigration (IMMIGRATION_STATUS_ASK, 10 options) |
| Financial | immigration, children (B5_PROFILE_CHILDREN) |
| Training | age |
| Activities | age, gender |
| Drop In | age, gender |
| Advice | B5A_ADVICE_TYPE subtype only (7 options: Benefits, Debt, Employment, Immigration/asylum, Health, Legal, General; stateMachine.ts:1308-1312) |

**Food asks nothing about hot meals vs groceries.** It also asks nothing about area beyond the location already collected after the crisis gate. Food maps to the whole `foodbank` parent (serviceMatcher.ts:117) and is location-only (:154). The dataset does carry Food subcategories that the VA does not ask about: meals, community-grocers, dry-food-parcels, food-vouchers, vouchers, food-hub, food-delivery, general (counted from `lib/data/wmca_services_v7.json`). Food has no national fallback (stateMachine.ts:330), so a zero match shows the "not finding … listed" text plus a browse link (:400-431).

Non-housing terminal: `buildNonHousingTerminal` (stateMachine.ts:433-507). It shows local matched services, then the national fallbacks block, then LGBT Foundation (Health + LGBTQ+ only), then a Street Support browse link.

---

## B. Crisis gate (GATE0_CRISIS_DANGER, self variant, phrasebank.ts:29-43)
1. Immediate physical danger → IMMEDIATE_PHYSICAL_DANGER_EXIT (crisis.ts:214-215)
2. Under 16 and need protection → CRISIS_UNDER16_LOCATION (crisis.ts:216-224). **Confirmed option 2** in both self (:36) and supporter (:51) variants.
3. Thoughts of harming myself → self-harm exit (crisis.ts:225-226)
4. Domestic abuse → DV_GENDER_ASK
5. Sexual violence → SA_GENDER_ASK
6. Lost home due to fire, flood, or emergency → CRISIS_FIRE_FLOOD_LOCATION → fire/flood exit (crisis.ts:231-235, 264-274)
7. None of these apply → LOCATION_CONSENT

**No option covers modern slavery, trafficking, exploitation or forced labour.**
- How checked: case-insensitive grep for `traffick`, `slavery`, `exploit`, `forced labour`, `forced labor` across `lib/phrasebank.ts`, `lib/stateMachine.ts` and `lib/handlers/`: zero hits.
- The only hits in the repo are org names in `lib/data/wmca_organizations_v7.json` (West Midlands Anti-Slavery Network; Changing Lives IRIS Project).

Fire/flood is option 6, the last substantive option before "None".

---

## C. Housing split question
`B6_HOMELESSNESS_STATUS` (phrasebank.ts:604-612) asks "Are you currently experiencing homelessness?" with Yes/No. The inclusion line lists temporary accommodation, hospital, prison, or "somewhere that isn't your permanent home".

- No 56-day framing, no "how soon" framing and no "something has happened" framing in the split. "56 days" appears only in advice content (phrasebank.ts:2468, 2491, 2618).
- The only timing question is prevention urgency B7C: "happening now or very soon (days or weeks)" / "months away" / "Not sure" (phrasebank.ts:730-737).
- Between B6 and B7 the VA also asks HOUSING_OPTIONS_INVOLVEMENT_ASK (Yes/No/Not sure). The answer is stored but not used: there is a TODO at stateMachine.ts:1442-1443.

Housed situation B7_HOUSED_SITUATION (phrasebank.ts:634-644) has four options: at home (own tenancy/ownership); staying temporarily with friends or family; council temporary accommodation; other temporary. Options 2-4 re-route as homeless.

Sleeping situation B7_HOMELESS_SLEEPING_SITUATION (phrasebank.ts:658-669) has five options: rough sleeping; emergency accommodation (hostel/shelter/night shelter); sofa surfing; council temporary accommodation; other temporary situation.

**Leaving prison and hospital discharge are not sleeping-situation options.** "Leaving prison or hospital" exists only as B9_REASON option 6 (phrasebank.ts:886), on the full and null routes only. Prison and hospital are also named in the B6 inclusion text.

---

## D. Safety question inside the housing route
- **Homeless branch:** no "is home unsafe" or safety question. The only safety-related item is B9_REASON option 2 "Domestic abuse", which routes to DV_GENDER_ASK (homeless.ts:38-41). That is full or null route only.
- **Prevention branch:** B7D_4_PREVENTION_SAFEGUARDING_SIGNALS "Is there anything else going on that might be important…" with Yes / No / Prefer not (phrasebank.ts:808-815). The follow-up B7D_4A has six options: Domestic abuse or violence; Health or mental health crisis; Substance use concerns; Child safety concerns; Something else; Prefer not to say (phrasebank.ts:826-836).
- **Exploitation is not mentioned anywhere** (grep as in B).

---

## E. Profiling on the homeless housing route (as built)

Live order on the FULL homeless route: crisis gate → location → GATE1 → GATE2 → PREFERRED_NAME_ASK → ACCESS_LOCATION_ASK → RETURN_USER_ASK (→ RETURN_USER_FOLLOWUP) → B2_WHO_FOR → B5 → B6 → HOUSING_OPTIONS_INVOLVEMENT_ASK → B7_HOMELESS_SLEEPING_SITUATION → B8_DURATION → B9_REASON → B10_INCOME → B11_PRIOR_USE → B12_ALREADY_SUPPORTED (→ B12A_WHICH_ORG) → C2_CONSENT_GATE → C3Q1 → (C3Q1A / C3Q1B) → C3Q2 → C3Q3 → C3Q4 → (C3Q5) → C3Q6 → C3Q7 → C3Q8 → C3Q9 → C3Q10 → (C3Q10A) → (C3Q11 → C3Q12 for ages 16-17 and 18-20) → terminal.

QUICK homeless route: same up to B5, then B5_PROFILE_AGE → B6 → HO involvement → sleeping situation → terminal.

| Item | Key | Present? / notes |
|---|---|---|
| Age | QUICK: `B5_PROFILE_AGE` (Under 16 / 16-17 / 18-24 / 25+). FULL: `C3Q3_AGE` (Under 16 / 16-17 / 18-20 / 21-24 / 25+) | Yes. FULL asks age only inside Section C, so only after consent (sectionC.ts:136-155). |
| Care leaver | `C3Q11_CURRENTLY_IN_CARE` | Wording asks if *currently being looked after by social services under the Children's Act 1989* (phrasebank.ts:1339). Asked only for 16-17 and 18-20 (sectionC.ts:32-35). There is no care-leaver question as such. "Care leaver" appears only in terminal guidance text. |
| Armed forces / veteran | none | Absent. Grep `armed forces`, `veteran`, `Forces`: no hits. |
| Immigration status | `C3Q1_IMMIGRATION_STATUS` | **7 options** (phrasebank.ts:1036-1047). The non-housing `IMMIGRATION_STATUS_ASK` has 10 options. |
| Public funds | `C3Q1B_PUBLIC_FUNDS_FOLLOWUP` | Only after "No immigration status" (with NRPF acknowledgement) or EUSS → Pre-settled (sectionC.ts:80-90, 103-109). |
| Household / children | `C3Q2_DEPENDENT_CHILDREN` | Yes/No. No other household question. |
| Pregnancy | `C3Q5_PREGNANCY` | Asked only if C3Q4 = Female or Trans Female (sectionC.ts:161-167). Wording: "pregnant, or living with someone who is pregnant" (phrasebank.ts:1173), so it covers another person without saying "partner". |
| Gender | `C3Q4_GENDER` | Options: Male, Female, Trans Female (male to female), Trans Male (female to male). The text asks for "current biological gender" while titled "What is your gender?" (phrasebank.ts:1144-1156), so it **mixes sex and gender**. No non-binary option and no prefer-not-to-say. |
| LGBTQ+ | `C3Q10_LGBTQ` | Yes/No only (phrasebank.ts:1304-1310). |
| LGBTQ+ specialist preference | `C3Q10A_LGBTQ_SERVICE_PREFERENCE` | Specialist first / Local only / Show both. |
| Convictions | `C3Q9_CRIMINAL_CONVICTIONS` | None / Arson / Sexual / Violent / Prefer not, with Unlock links. |
| Health / disability | `C3Q7_PHYSICAL_HEALTH` (6 options, no PNTS); `C3Q8_MENTAL_HEALTH` (9 options) | Yes |
| Pets | none | Absent. Grep `pet`/`dog` hits only data org names. |
| Substance use | none as its own question | Only B9_REASON option 8 and prevention follow-up option 3, which has no specific handling and falls to the default terminal (prevention.ts:147). |
| Duration | `B8_DURATION` | "How long has this been going on?", 5 bands. FULL and null route only. |
| Ethnicity | `C3Q6_ETHNICITY` | 6 options. **No prefer-not-to-say option.** |
| Source of income | `B10_INCOME` | Employment / Benefits / Family-friends / No income / Prefer not. FULL and null route only. |
| Employment | none on homeless route | Only on prevention (B7D_2). |
| Preferred name | `PREFERRED_NAME_ASK` | Asked (options: ["Skip"]). The handler would store the text (stateMachine.ts:1170-1179) but receives `String(parsed)` from route.ts:342. A typed name either fails parsing (escalation / "please reply with a number") or parses to 1, which means Skip. **Effectively never stored, and never read anywhere.** Grep `preferredName`: only init, set and type. |
| Access location | `ACCESS_LOCATION_ASK` | Library / Community centre / Council office / At home / On my phone / Other. Stored, never read (not in session-end log, route.ts:349-360). |
| Used Street Support before | `RETURN_USER_ASK` | Yes/No, early. **Asked again** as `B11_PRIOR_USE` (Yes/No/Not sure) on FULL/null homeless. Neither is read downstream. |
| Did last time help | `RETURN_USER_FOLLOWUP` | 4 options. Stored, never read. |
| Who is it for | `B2_WHO_FOR` | Myself / Someone I'm supporting / Professional / Not sure (maps to SELF) (stateMachine.ts:1215-1229) |
| In touch with Housing Options | `HOUSING_OPTIONS_INVOLVEMENT_ASK` | Yes/No/Not sure. Stored, not used (TODO, stateMachine.ts:1442). |
| Already supported / which org | `B12_ALREADY_SUPPORTED`, `B12A_WHICH_ORG` | B12A is free text with no options. route.ts:293-336 cannot parse free text without options, so a typed org name triggers the unclear/escalation path. Only a bare number advances, and it is stored as that number. Not used in matching. |

---

## F. Consent
`C2_CONSENT_GATE` (phrasebank.ts:990-1006; sectionC.ts:41-66).
- It explains that the questions may cover health, ethnicity and sexual orientation. It says nothing personally identifying is collected or stored, answers are used only for matching, and any question can be skipped. It links to the privacy page and asks "Do you give your consent…" Yes/No. The supporter variant adds "Please check with them before you answer."
- **Yes** → C2A acknowledgement + C3Q1.
- **No** → skips all of Section C to the housing terminal.
- It is reached **only** on the FULL route, homeless branch, after B12/B12A (homeless.ts:94-98, 117-121).
- QUICK, null route, prevention and all non-housing needs never see a consent screen. Non-housing profiling (age, gender, LGBTQ+, convictions, immigration, children) is asked with no consent gate.

---

## G. Prevention branch (lib/handlers/prevention.ts)
Entry is B7_HOUSED_SITUATION = At home, then B7A option 1.

1. `B7B_PREVENTION_REASON`: Rent arrears / Eviction notice / Mortgage arrears / Notice from family or friends / Other financial difficulties / Prefer not (prevention.ts:25-33; phrasebank.ts:706-716). Single select.
2. `B7C_PREVENTION_URGENCY`: Now or very soon / Months away / Not sure (:35-43).
3. `B7D_1_PREVENTION_CHILDREN_DEPENDENTS`: Yes / No / Prefer not (:45-53).
4. `B7D_2_PREVENTION_EMPLOYMENT_INCOME`: Employed / Unemployed / Benefits / Self-employed / Not working / Prefer not (:55-63).
5. `B7D_3_PREVENTION_PRIOR_SUPPORT`: spoken to someone / not yet / not sure who (:65-73).
6. `B7D_4_PREVENTION_SAFEGUARDING_SIGNALS`: anything else? Yes / No / Prefer not (:80-128).
   - Yes → `B7D_4A` follow-up (:130-157):
     - 1 DA → DV_GENDER_ASK.
     - 2 Health crisis → ESCALATION_LEVEL_2_HEALTH_CRISIS, **session ends**.
     - 4 Child safety → CHILD_AT_RISK_EXIT, session ends.
     - 3 substance, 5 something else, 6 prefer not → housing terminal.
   - No / Prefer not exits:
     - Urgent + reason contains "Eviction" → ESCALATION_LEVEL_2_LEGAL_EMERGENCY (Shelter + Citizens Advice), **session ends with no local services** (:101-108).
     - Urgent + children (`preventionChildren === 'Yes'` or `session.pregnant`, which is never set on this branch) → ESCALATION_LEVEL_2_CHILDREN_RISK, session ends (:110-117).
     - Otherwise → housing terminal (:120-127).

So the claimed sequence "reason, urgency, children, employment and income, prior support, anything else" **matches the code**. Note that "employment and income" is one question.

Other checks:
- **No multi-select "what else is putting pressure on you" question.** Every gate is single choice via `parseUserInput` (stateMachine.ts:895-915). Grep for `pressure` and `multi` found only the B7D_4 "no pressure to share" wording and unrelated hits.
- **"Not sure what I need": absent.** Grep `not sure what`, `Not sure what I need`: only the Childline line (phrasebank.ts:2290). Other "not sure" options do exist: B2_WHO_FOR option 4 ("Not sure / just trying to find the right place", which silently becomes SELF), B1 "Other / not sure" (which ends the session), B7C urgency, HO involvement, B11, EUSS, public funds.
- **Place-to-start: absent from the code.** Grep `place to start`, `placeToStart`, `PLACE_TO_START`, `places-to-start` across lib, app, components and data JSON: zero hits.

---

## H. 16 and 17 year olds
- **Quick route, housing:** asks B5_PROFILE_AGE before B6 (stateMachine.ts:1288-1295), sets youthServicesFlag, and no questions are dropped. Terminal (stateMachine.ts:636-640) opens with Children's Services framing and the LA duty team, including the OOH number where held (:549-565), then the Housing Options header.
- **Full route, housing:** age is known only from C3Q3, after consent. If consent is declined, **age is never asked** and the 16-17 year old gets the adult terminal. With consent, all of Section C is asked (ethnicity, convictions and so on are not dropped), plus C3Q11 and C3Q12.
  - socialServices = Yes → special layout: Children's Services as first step, age-filtered navigators or Childline reinforcement, Housing Options, Shelter (:567-621).
  - Otherwise → Children's Services first, then Housing Options, plus "IMPORTANT FOR YOUNG PEOPLE" if socialServices = No (:839-850).
- **Prevention branch:** QUICK asks age at B5_PROFILE_AGE; FULL never asks age, so 16-17 is not recognised.
- **Under 16:** crisis option 2 → CRISIS_UNDER16_LOCATION (7 LAs + Somewhere else) → `buildUnder16Exit` (shared.ts:47-115), which shows Children's Services with OOH, next steps, Childline, NSPCC and sign-off (not for professionals), and 999. "Somewhere else" gives the Childline exit (crisis.ts:250-261). The same exit fires from B5_PROFILE_AGE option 1 (stateMachine.ts:1323-1331), C3Q3 option 1 (sectionC.ts:141-149) and the mid-conversation regex intercept (stateMachine.ts:941-1012; route.ts:242-251), which runs before any Claude classifier.

---

## I. Housing terminal (`buildTerminalServices`, stateMachine.ts:514-870)
Order of sections:
1. "I've found some services…"
2. **YOUR FIRST STEP**: for 16-17, Children's Services first, then a HOUSING OPTIONS sub-header. Council Housing Options name/phone/website plus a "legal duty to assess" line, varied by situation (rough sleeping / homeless / prevention).
3. **OUTREACH SUPPORT**: StreetLink, only if rough sleeping. The QUICK route also prepends STREETLINK_SIGNPOST.
4. **LOCAL SUPPORT**: navigator orgs. `getLocalSupportOrgs` returns non-council default orgs, but the defaults contain only the council (serviceMatcher.ts:172-187), so this section is navigators only.
5. **SPECIALIST SUPPORT**: akt and Stonewall Housing if LGBTQ+ and not "Local only"; Migrant Help etc. and local immigration orgs if NRPF.
6. **FAMILY & IMMIGRATION SUPPORT**: NRPF or uncertain, with dependants. Shows Children's Services, Project 17 and Migrant Help.
7. **DOMESTIC ABUSE SUPPORT**: gated on `profile.dv`, which means `safeguardingType === 'DOMESTIC_ABUSE'` (types.ts:290). Every DV route ends the session at the DV exit, so this block appears **unreachable**.
8. **YOUNG PEOPLE'S SUPPORT**: ages 16-24.
9. **IMPORTANT FOR YOUNG PEOPLE**: social services guidance.
10. **IF YOU NEED MORE HELP**: Shelter, always last.
11. Warm close.

Shelter is introduced as: "If you're finding it hard to get through to services, or you'd like to talk through your options with someone, Shelter's helpline is there for you" (stateMachine.ts:857). It is followed by 0808 800 4444 (free, 8am-8pm weekdays, 9am-5pm weekends).

**Out-of-hours number:**
- The Housing Options OOH number is **not shown** in the housing terminal. `defaultOrgsByLA` builds the council org without `phoneOOH` (serviceMatcher.ts:176-183), although the endpoints JSON holds it (e.g. housing-pathway-endpoints.json:20).
- OOH numbers appear only in the fire/flood exit (crisis.ts:51-53) and for Children's Services (stateMachine.ts:558-560; shared.ts:77-78).

---

## J. Domestic abuse
Entries: crisis option 4, B9 reason 2, prevention follow-up 1.

Flow: DV_GENDER_ASK (Female / Male / Non-binary or other / Prefer not) → DV_CHILDREN_ASK ("dependent children, or are you currently pregnant?") → exit (crisis.ts:276-291).

Exit key, from `getDVExitKey` (crisis.ts:132-139):
- Female → National DA Helpline.
- Male → ManKind.
- **Anything else (Non-binary/other or Prefer not to say) → Galop.**

Routing is **on gender only, not sexual orientation**. A lesbian or gay user who picks Female or Male gets the national helpline or ManKind. Prefer-not-to-say goes to Galop.

All variants show the Shelter DA housing advice link and 999. The children answer does not change the services shown, only the key name.

Location: **not asked**. A local DV org is appended only if `localAuthority` is already set (crisis.ts:178-206, 289-290). From the crisis gate the LA is not yet known, because location is collected after option 7, so no local DV service is shown. From B9 or prevention the LA is known, so the local DV org is appended. The session ends at the exit (shared.ts:26-38).

---

## K. End of session
- `TERMINAL_ADDITIONAL_NEEDS`: "Is there anything else you're looking for help with today?" (phrasebank.ts:2217-2223). "Yes" returns to B5 while `needCount < 3`. Otherwise it shows TERMINAL_GOODBYE and ends (terminal.ts:21-37).
- **No "Was this helpful?", no "did you contact a service", and no next-step question.** Grep `helpful` and `feedback`: no such prompt.
- `TERMINAL_CHECKIN` ("I hope this helps…") is defined (phrasebank.ts:2209-2215) but never referenced in code.
- Outcome is asked only at the *start* of a later visit (RETURN_USER_FOLLOWUP) and is not used.
- The session-end analytics log (route.ts:349-360) records la, userType, age, need, homeless, safeguarding, escalation, duration and routeType.
- Safeguarding exits, prevention escalations, B1 "Other" and ADVICE_BRIDGE "done" end the session directly with no additional-needs prompt.
