# Audit B: how the VA selects and shows services and fixed endpoints

Read-only. Repo `/home/claude/streetsupport/street-support-va`, branch `staging`, head `cd67b68` (2026-11-01, merge of PR #32 fix/gender-filter-2026-10-31). Nothing edited.

Note on scope: the terminal builders live in `lib/stateMachine.ts`, not `lib/handlers/terminal.ts`. `terminal.ts` only handles the additional-needs and escalation gates and receives `buildTerminalServices` as a callback (terminal.ts:39-92). Safeguarding exits are built in `lib/handlers/crisis.ts`.

---

## 1. Service data (`lib/data/wmca_services_v7.json`)

- Structure: `{metadata, services}`. metadata version "7.0", generated_at 2026-01-31T12:17:24, total 1323.
- Services per LA: birmingham 348, wolverhampton 242, coventry 239, walsall 163, sandwell 162, dudley 112, solihull 57.
- **Fields on every record (all 1323 carry exactly these 10):** `service_id`, `organization_id`, `local_authority`, `name`, `description`, `category{parent, sub}`, `access{appointment_only, telephone_service}`, `location{latitude, longitude, has_location}`, `opening_times[]`, `client_groups[]`.
- **Taxonomy: the old Street Support API taxonomy, not V4.** Parent keys and counts:

| parent | n |
|---|---|
| support | 573 |
| items | 243 |
| foodbank | 132 |
| medical | 97 |
| activities | 72 |
| training | 58 |
| dropin | 48 |
| accom | 45 |
| employment | 29 |
| services | 10 |
| communications | 9 |
| financial | 7 |

- Sample subs: support > housing (93), debt-financial-problems (41), employment (38), benefits (34), domestic-abuse (30), mental-health (29), refugees/asylum (28 each), dependency (24), immigration (18), lgbt (14), sexual-abuse (13), ex-offender (11), modern-slavery (8). foodbank > community-grocers (40), general (49), meals (24). accom > supported (25), rented (8), social (4), emergency (3), hostel (2). medical > counselling (22), drug-alcohol (12), sexual (8). items > nappies, toiletries, socks, clothes etc.
- None of the V4 parents (Housing, Finance, Employment, Essentials, Food with Hot meals/Groceries, Health, Addiction, Immigration, Safety from harm, Activities) exist as keys.
- **V4 fields absent.** Checked by (a) the key census above (only 10 keys exist on any record) and (b) case-insensitive substring counts over the serialised file: `phase` 0, `primary_factor` 0, `intentionality` 0, `finding_status` 0, `place_to_start`/`place-to-start` 0, `nrpf` 0. Hits for `shape` (2), `population` (1), `restriction` (3), `focus` (43), `recourse` (1) are all inside free-text descriptions, not field names.
- `client_groups`: 30 distinct values. 374 services have none; 150 have 14. Most common: Families 430, Refugees 418, Asylum seekers 370, Bisexual 314, Lesbian 314, LGBT+ 312, Transgender 310, BAME 304, Gay 293, Rough sleepers 284, Sex workers 269, Ex-Offenders 263, EEA residents 259, Armed forces veterans 251. Age/gender labels: 18+ only 114, Female only 75, 16-25 only 52, Male only 39, 16+ only 31, 25+ only 21, Under 18s only 15, plus smaller age bands. 5 services carry both Female only and Male only.
- `opening_times` populated on 951 services; `appointment_only` true on 518, `telephone_service` true on 192.
- Orgs file `wmca_organizations_v7.json`: `{metadata, organizations}`, 263 orgs, fields `organization_id, name, verified, contact{email, phone, website, all_emails, all_phones, all_websites, quality}, areas_served, num_areas`. 113 of 263 have a primary phone. quality LOW 125 / HIGH 98 / MEDIUM 40; verified true 158. Every service's `organization_id` resolves to an org record.
- `wmca_la_organizations_v7` (no extension) is byte-identical to `wmca_organizations_v7.json` apart from a trailing newline. No `.ts` file imports it (grep for the filename across `*.ts/*.tsx/*.js/*.mjs` excluding node_modules found only the `.json` imports).

## 2. serviceMatcher (`lib/serviceMatcher.ts`, header "v7.1.3")

Entry: `buildNonHousingTerminal` (stateMachine.ts:433) calls `getServicesForNeed(need, profile)` (serviceMatcher.ts:547). Housing (`Emergency Housing`) never calls the catalogue matcher; it uses fixed endpoints only (stateMachine.ts:514-519).

**Need to category** (serviceMatcher.ts:115-128). Needs come from the B5 menu (stateMachine.ts:1272; phrasebank.ts:345-360), the old 12-item menu.

| Need | parents |
|---|---|
| Emergency Housing | accom (mapped but not used, housing bypasses matcher) |
| Food | foodbank |
| Work | employment, support (support restricted to `employment`) |
| Health | medical, support (support restricted to `mental-health`) |
| Advice | support (sub chosen at B5A) |
| Drop In | dropin |
| Financial | financial, support (support restricted to `debt-financial-problems`, `money-management`) |
| Items / Services / Comms / Training / Activities | items / services / communications / training / activities |

Advice subs (serviceMatcher.ts:131-139): Benefits, Debt, Employment, Immigration (immigration+asylum+refugees), Health (health+mental-health), Legal, General. Per-parent constraints at :144-148, merged at :551-566.

**Filters applied** (`getServicesByCategory` :442-471, `filterByProfile` :476-492):
- LA: exact match on normalised `local_authority` (:450-455). No distance or lat/long use anywhere.
- Category parent and sub as above.
- Profile filters only for `Health, Work, Financial, Training, Activities, Drop In` (:151, :571). `Food, Items, Services, Comms` and `Advice` get no profile filter (:154; Advice is in neither list).
- Gender (:277-336): hides a service only for an exact `male`/`female` answer, when the service carries the `Female only`/`Male only` label or its description opens with "women/female/men/male only" (excluding "... only sessions/groups/days" etc). Conflicting labels hide from no one. Other answers exclude nothing.
- Age (:341-362): substring match of client_groups against youth keywords `Young People, Youth, 16-25, Young Adults` (52 services match) and elderly keywords `Older people, Elderly, Over 50` (0 services match). Youth services shown only to 16-17/18-24/18-20/21-24. Other age labels (`18+ only`, `Under 18s only`, `25+ only` etc) are not read.
- **Not filters:** LGBTQ+, NRPF/public funds, immigration status, convictions, children. These are boosts only. No eligibility exclusion on NRPF.

**Ranking** (`calculateMatchScore` :367-433): base 50; +20 LGBTQ+ client group if user lgbtq; +15 youth group if young; +15 family group if hasChildren (pregnant folded in, types.ts:283); +20 ex-offender group and +10 description terms if convictions = Yes; +20 refugee/asylum group and +15 description terms (nrpf, asylum, refugee, migrant) if publicFunds No; +15 mental-health group (0 services carry that label); +10 if not appointment_only; +5 if telephone_service. Sort descending, dedupe by organization_id keeping the top, take 5 (:497-518). Output phone/website from the org record, description truncated to 150 chars (:521-541). Ties keep file order (JS stable sort).

**Fields not read:** no `phase`, `primary_factor`, `intentionality`, population tags or place-to-start (none exist in data; grep of lib/app found no such identifiers). `opening_times` and `location` are typed but unused in matching.

**Restriction vs focus:** no explicit two-field distinction. The only restriction concept is gender (comment cites Service Matching Contract, :292-304). Youth client groups act as a hard restriction via `matchesAge`; every other population label acts as a boost (focus) or is ignored.

## 3. Zero-match handling (stateMachine.ts:400-431, 447-450)

- If `getServicesForNeed` returns nothing: `buildZeroMatchTerminal`, outcome `NO_SUITABLE_PATHWAY`.
- If the need has national fallbacks: "I haven't found specific {x} in {la} yet, but these national services can help" plus the fallback block.
- If not (Food, and Drop In/Items/Services/Comms/Activities which have no entry): phrase `TERMINAL_ZERO_MATCH_NO_FALLBACK` (phrasebank.ts:2241-2247).
- Both append a Street Support browse link `https://streetsupport.net/{la-slug}/find-help/category/?category={first parent key}` (:381-384, :424-428), skipped when LA is unknown.
- No widening (no neighbouring LA, no relaxing of filters).

## 4. `housing-pathway-endpoints.json`

Metadata: version 1.0, governed by Housing Pathway Endpoints Contract v1.0, verified February 2026, MD authority. Notes say national orgs (Shelter, Project 17, Migrant Help, AKT, Stonewall Housing, ManKind, Galop, National DV Helpline) are hardcoded, not in this file.

Per-LA keys: `name, housingOptions, childrenServices, navigatorOrgs, dvOrgs, immigrationOrgs`, plus `_navigatorGap` (dudley, sandwell), `_navigatorNote` (sandwell), `_immigrationGap` (solihull).

| LA | Housing Options OOH | Children's Services OOH | Navigators (age) | dvOrgs | immigrationOrgs |
|---|---|---|---|---|---|
| Birmingham | 0121 303 2296 (+ note: 18+ only, under-18 0121 675 4806) | 0121 675 4806 | SIFA Fireside (25+), St Basil's Birmingham (16-24) | womensAid: B&S Women's Aid | RMC, Brushstrokes |
| Coventry | 024 7683 2222 | 024 7683 2222 | P3 Coventry (25+), St Basil's Coventry Youth Hub (16-24) | womensAid: Coventry Haven; allGenders: Valley House | Coventry RMC |
| Dudley | 0300 555 8283 | 0300 555 8574 | none (`_navigatorGap`, json:153) | womensAid: BCWA | RMC |
| Sandwell | 01323 690856 | 0121 569 2355 | none (`_navigatorGap` json:188) | womensAid: BCWA | Brushstrokes |
| Solihull | no `phoneOOH`; `phoneNote` "Automatically transfers to out-of-hours service" (json:214) | **none held** | St Basil's Solihull Youth Hub (16-24) | womensAid: B&S Women's Aid | none (`_immigrationGap` json:244) |
| Walsall | 01922 650000 | **none held** | Glebe Centre / YMCA Black Country (18+) | womensAid: BCWA | RMC |
| Wolverhampton | 01902 552999 | 01902 552999 | Young Persons Team (Wolverhampton Homes) (16-24, no phone, provisional per `_canonicalNote` json:308-315), P3 Wolverhampton (18+, phoneOOH 0800 107 6753) | womensAid: The Haven | RMC |

- A Housing Options out-of-hours number is held as `phoneOOH` for 6 of 7 councils; Solihull holds only the transfer note.
- **Young persons team** exists only as a Wolverhampton navigator entry.
- **StreetLink and Shelter are not in this file.** They are hardcoded in serviceMatcher.ts:670-694 (Shelter 0808 800 4444; StreetLink 0300 500 0914).
- **Which endpoint fields the housing terminal actually renders:** `housingOptions.name/phone/website` only (serviceMatcher.ts:172-188, stateMachine.ts:642-649). Housing Options `phoneOOH`, `phoneHours`, `phoneOption`, `phoneOOHNote` are not shown on the housing terminal. `phoneOOH` for Housing Options is read only by the fire/flood exit (crisis.ts:51-52). Children's Services `phoneOOH` is shown on the 16-17 first step (stateMachine.ts:558-560) and under-16 exit (shared.ts:77-78). Navigator `phoneHours`/`phoneOOH` are not rendered (only `availabilityNote`, which no record carries). `_navigatorGap`/`_immigrationGap` are typed (serviceMatcher.ts:103-104) but never read. The Migrant Advice Portal named in metadata as "shown for all LAs on NRPF pathway" has no reference in code (grep `migrantadvice` in lib: none outside data).
- `getLocalSupportOrgs` (serviceMatcher.ts:618-621) filters non-council entries from `defaultOrgsByLA`, which only ever contains the council (:172-188), so it always returns an empty list.
- Navigator age filter: `getNavigatorOrgs` (:700-720) uses the lower bound of the age band (`ageCategoryToNumber`, :250-254); "25 or over" reads as 25.

**DV layer.** Two parallel sources:
1. `housing-pathway-endpoints.json` `dvOrgs` keyed `womensAid` (+ `allGenders` Coventry only). Rendered by `getDVOrgs` (serviceMatcher.ts:722-737) in the housing terminal only when `profile.dv` is true (stateMachine.ts:782-802). `profile.dv` = `safeguardingType === 'DOMESTIC_ABUSE'` (types.ts:290), which is set only by the DV safeguarding exit that ends the session (crisis.ts:284-289, shared.ts:26-37). I found no path that sets it and then reaches `buildTerminalServices`, so this block appears unreachable (checked by grep for `DOMESTIC_ABUSE` across lib: two hits only).
2. `safeguarding-endpoints.json` `dv_local` per LA (one org each; Coventry an array of Valley House + Coventry Haven). Rendered by `buildLocalDVInfo` (crisis.ts:178-) appended to every DV exit regardless of gender. Returns empty when LA is unset (crisis.ts:180), which is the case on the Gate 0 route since location is collected after Gate 0 (crisis.ts:237-238); LA is set on the B9 "Domestic abuse" route (homeless.ts:39-41).

Is it an area x gender x children matrix? Partly. National floor is a gender x children matrix of phrases: `DV_{FEMALE|MALE|LGBTQ}_CHILDREN_{YES|NO}` x SELF/SUPPORTER/PROFESSIONAL (phrasebank.ts ~1600-1885; key builder crisis.ts:132-139; non-binary/PNTS route to LGBTQ). Female -> National DV Helpline 0808 2000 247; Male -> ManKind; LGBTQ -> Galop. The children dimension changes framing text, not the contacts. The local area layer is one list per LA, not varied by gender or children; gender guidance exists only as prose in `routing_notes` (safeguarding-endpoints.json:147-) and is not read by code.

## 5. Phone numbers

- **Galop and ManKind do not share a number.** ManKind 0808 800 1170 (phrasebank.ts:1689, 1705, 1723, 1741, 1756, 1773); Galop 0800 999 5428 (phrasebank.ts:1790, 1806, 1824, 1842, 1857, 1874, 1982, 1998, 2016). Both also named in the `dv_local._note` (safeguarding-endpoints.json:52), with the same distinct numbers.
- Method: normalised every phone in the three JSON files (all `phone*` keys, org `phone` + `all_phones`) and every UK-format number in phrasebank.ts, serviceMatcher.ts, stateMachine.ts, crisis.ts, shared.ts; grouped by digits.
- Shared numbers across differently named organisations found:
  - Horizon SARC and CYPSAS both 0330 223 0099 (safeguarding-endpoints.json sarc.adult / sarc.under_18; documented as intentional in its `_note`).
  - Birmingham Housing Options OOH 0121 303 2296 is also the primary phone of org `sifa-fireside` and `birminghamhousingoptions` in the orgs file.
  - Orgs file primary-phone duplicates: `coventry-city-council-homeless-prevention-service` and `st-basil39s---youth-hub` (0121 269 1940, which is also St Basil's Coventry Youth Hub in endpoints); `homes-in-the-city---wolverhampton` and `the-solace-community` (01902 556789, which is Wolverhampton Housing Options); CAP UK, kccoldbury, loveyourneighbourbirmingham (0800 328 0006); seven Trussell foodbanks (0808 208 2138, a shared Trussell line).
  - Coventry Housing Options OOH and Coventry Children's Services OOH both 024 7683 2222; Wolverhampton Housing Options OOH and Children's Services OOH both 01902 552999 (council emergency lines).
- **SARC:** Horizon SARC (adult) and West Midlands CYPSAS (under 18) in safeguarding-endpoints.json:12-38, rendered by `buildSARCInfo` (crisis.ts:153-165) on every SA exit (crisis.ts:294-300). Under-18 chosen when ageCategory is `Under 16` or `16-17`. Blue Sky Centre held as `coventry_secondary`, status NEEDS VERIFICATION, phone null, not read by code.
- **Rape Crisis E&W** 0808 500 2222: phrasebank.ts:1891, 1902, 1924 (`SA_FEMALE_16PLUS*`).
- **SurvivorsUK** 020 3598 3898: phrasebank.ts:1936-1938 onward (`SA_MALE_16PLUS*`, and `SA_LGBTQ_OR_NONBINARY*` alongside Galop, :1972-2017).
- **Modern slavery / trafficking:** no fixed endpoint. Grep of lib/*.ts and the two endpoint JSONs for slavery, trafficking, Salvation Army, NRM, National Referral Mechanism found nothing. Only presence is in catalogue data: 8 services with sub `modern-slavery` (e.g. West Midlands Anti-Slavery Network, Adavu, BCWA, Central England Law Centre). No B5 need or advice sub maps to `modern-slavery`. Work, Health, Financial and the seven Advice subs all constrain `support` to other subs. The one exception is Advice when B5A yields no recognised choice: `adviceSubcategory` is null, no constraint is set (serviceMatcher.ts:555-560), and all 573 `support` services in the LA become candidates, modern-slavery included, ranked like any other.

## 6. Non-housing fixed floors

`nationalFallbacks` (stateMachine.ts:329-379), shown after local results or as the zero-match floor:

| Need | Floor |
|---|---|
| Food | none (empty array) |
| Health | NHS 111; Find NHS Services |
| Financial | Turn2us Benefits Calculator; Turn2us Grants Search |
| Work | Jobcentre Plus (website only) |
| Training | National Careers Service 0800 100 900 |
| Advice (every sub) | Citizens Advice 0800 144 8848 |
| Drop In, Items, Services, Comms, Activities | no entry, so none |

Other hardcoded non-housing additions: LGBT Foundation 0345 3 30 30 30 for LGBTQ+ users on Health (stateMachine.ts:489-497). Citizens Advice's national number 0800 144 8848 is also the primary phone of org `citizens-advice-coventry` in the orgs file.

Phrasebank also carries StepChange, Citizens Advice and Turn2us links in prevention/advice phrases (`DEBT_HELP_NATIONAL` phrasebank.ts:189-198; `ADVICE_EVICTION_RISK_PREVENTION` :2485; `ADVICE_RENT_ARREARS_EARLY_HELP_ENGLAND` :2512; `ADVICE_LANDLORD_PRESSURE_OR_NOTICE_ENGLAND` :2541; `ADVICE_MORTGAGE_ARREARS_ENGLAND` :2576; `ADVICE_FINANCIAL_HARDSHIP_ENGLAND/SCOTLAND` :2641, :2657). Escalation level 3 exit: Shelter + Crisis (phrasebank.ts:2409-2421).

Housing floors: Shelter always last; StreetLink when sleeping situation contains "rough"; Centrepoint (16-24) and AKT/Stonewall Housing (LGBTQ+, unless "Local only"); Migrant Help + Project 17 for NRPF/no status/asylum seeker (serviceMatcher.ts:194-233, 623-668); National DV Helpline in the (apparently unreachable) DV block.

## 7. Places to start

Not represented. No field in services or orgs data (key census, section 1). No identifier in code: case-insensitive grep for `place.to.start`, `placeToStart`, `place_to_start`, `places to start` across the repo excluding node_modules/.git/.next found nothing. The nearest functional analogue is the navigatorOrgs list in the endpoints file, which is a fixed per-LA list, not a service-level flag.
