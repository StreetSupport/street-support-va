# The VA's service data from the live platform: a proposal

*Draft 5, 31 October 2026. For the technical lead. Decisions are marked as the Managing Director's; everything else is proposed. Drafts 1 to 3 proposed a scheduled copy; the Managing Director decided on a live read on 31 October, and drafts 4 and 5 are built around that. Draft 5 adds three points from a review of draft 4. Section 10 shows how the earlier reviews carry over.*

## 1. Summary

- **The VA reads the platform live, the same way the public website does,** and follows the same rules the website already follows. It stops reading the fixed file built into its code in January 2026.
- **There is no approval step on data.** Organisations are responsible for their own details, as they are on the website.
- **A weekly review watches what matters.** A scheduled check looks for consequential changes and runs a set of routing rules. It reports for a weekly review; it does not hold anything back.
- **What stays as it is.** The hard-coded endpoints (Housing Options, children's services, safeguarding and crisis lines) remain in their own files, so they are always there and maintained.
- **What the service matching review carries.** When the VA may hide a service, and the tests that show matching gives the right results, are designed there, not here.
- **The question for the technical lead** is whether this can be built and assured within the December window.

## 2. Decisions (Managing Director, 31 October 2026)

1. **Live, like the website.** The VA links to the database in the same way the website does, and follows the same rules already in place for the live website.
2. **No verification of organisations' own details.** If an organisation updates its own details, that is its responsibility. SSN is not required to check it has done so correctly.
3. **Weekly review, not weekly update.** Where the contracts refer to a weekly cycle, it is read as ongoing weekly review of the system for the things that matter, not a weekly refresh of the data. A check of the VA for consequential changes may be built in.
4. **Hard-coded endpoints stay as they are.**
5. **Exclusion and routing tests belong to the service matching review.** If matching is designed properly, when a service may be hidden and how that is tested are settled there in advance.

6. **Shared responsibility.** SSN is responsible for the VA's rules. Because organisations go on updating their own data and the whole arrangement is live, responsibility for what a person sees is in a form shared between SSN and the organisations.

## 3. Where things stand

Read on 31 October 2026 from `street-support-va`, branch `staging` (`d29d7eb`; `main` at `600d776` has the same tree), and from the platform audit of the same day.

- **The VA's service data** is `lib/data/wmca_services_v7.json`, generated on 31 January 2026: 1,252 services in 1,323 rows, as 71 services appear once for each of two local authorities. Organisations are in `wmca_organizations_v7.json` (263). Both are built into the code.
- **The matcher** (`lib/serviceMatcher.ts`) filters an in-memory list by local authority, old category and subcategory, gender and age; ranks; keeps one service per organisation; and returns the top five.
- **What the VA shows** from a match: the organisation name, a shortened description, the organisation's phone and website, and whether it is appointment-only or a telephone service.
- **How the website reads the platform** (audit): server-side routes query MongoDB directly through a read-only user. Categories and client groups are fetched at build time into JSON files, with a fallback file. Services are read live, by location and radius, up to 500 per search.

## 4. How the live read works

**The pattern is the website's.** A server-side route in the VA holds a read-only database connection, as the website's routes do. Nothing reaches the browser except the results.

1. **What it reads.** Published services and their organisations in the seven WMCA local authorities, with only the fields the VA uses: the service key, organisation key and name, description, local authority cover, V4 category and subcategory, place-to-start marker, population factors, any explicit restrictions, appointment-only and telephone flags, and phone and website.
2. **How the matcher uses it.** The matcher already works on a list in memory. The simplest change is to load the area's published services from the database and pass that list in, keeping the matching code's shape. Whether to read once per conversation or keep the list for a short time is a technical choice for the technical lead; a short cache keeps conversations fast and the load on the database low. **A live read must not quietly become a stale one.** Any cache is measured in minutes, not hours, so that a service unpublished or closed on the platform leaves the VA within that time, and the duration is written down. Whether the website itself caches service reads cannot be established from the code read so far; the VA should be no slower than the website to reflect a change.
3. **Categories and population factors** can follow the website's build-time pattern, since they change only with a taxonomy change.
4. **If the database does not answer.** The website shows an error. The VA serves people in crisis, so a fallback is proposed: the hard-coded endpoints always show, as they do today, and the VA says plainly that local results are unavailable and offers the website. Whether to also keep a recent copy as a fallback for local results is for the technical lead.

Before the switch the VA reads the clone, so M4a and the WMCA trial run on the same path as after it.

## 5. What the platform decides, and what the VA decides

The VA does not reclassify anything. It reads the platform's placements, markers and restrictions as they are, and applies its own governed rules.

| Platform information | The VA's own rule | Governed by |
|---|---|---|
| Place-to-start marker | Offered in the prevention pathway, early, as a choice | Plan 4.5; VA pathway review, section 8 |
| Statutory access routes listed on the platform | The hard-coded endpoints govern these. Matched results do not show the same council again underneath | Housing and Non-Housing Pathway Endpoints Contracts |
| Explicit restrictions and population factors | As designed in the service matching review | Service Matching Contract |
| Safety listings | Safeguarding routing bypasses the matcher | Safeguarding Contract |
| Local authority cover | Local results filtered by the person's local authority | Service Matching Contract |
| Ranking | Need, location, self-referral, specialism and accessibility; never provider quality | Service Matching Contract; neutral infrastructure |

## 6. The weekly review

The website is not checked on a regular basis. The VA routes people in crisis, so a light check is proposed for the things that are consequential. It reports; it does not block.

**A scheduled check, run weekly** (or more often at no extra cost), reports:
- changes to Safety listings in the WMCA area;
- changes to explicit restrictions;
- services removed or unpublished in numbers out of the ordinary;
- whether the routing rules from the service matching review still hold on the live data;
- any local authority and need where the VA now returns nothing but returned results the week before.

**The weekly review** reads the report. Most weeks it should show nothing that needs action. Who carries it is for the Managing Director.

**A data change and a routing defect are treated differently.** A change to an organisation's own information is reported and left to the organisation. A failure of the routing rules, such as services being wrongly hidden, is a defect in SSN's own system and does not wait for the next review. Proposed:
- the check that finds it alerts the Managing Director and the technical lead the same day;
- where the defect could hide services from people, the affected need falls back to the hard-coded endpoints and the plain statement that local results are unavailable, until it is fixed;
- the fix goes through the normal review, as a priority;
- a defect touching safeguarding routing follows the Safeguarding Contract.

The routing rules also run on every change to the VA's code, before it merges, so most defects are caught before they reach anyone.

## 7. Severe weather (SWEP)

On the website, the SWEP banner appears prominently when severe weather provision is active, before a person reaches the VA (Managing Director, 31 October 2026). The question is whether the VA can show the same notice.

**How it works** (read of the platform code, 31 October 2026, from the Managing Director's local Claude Code; `SWEP.md`, sha256 `b4b49974…`; summary seen, full file not yet read here):
- **Status** is held in the database, collection `SwepBanners`, one document per SSN location (`LocationSlug`), with `IsActive` and a schedule (`SwepActiveFrom`, `SwepActiveUntil`).
- **Set by a person** in admin, or by a midnight job in production acting on the schedule. Nothing reads weather data.
- **Shown** on the matching location page only. The website reads `SwepBanners` directly and checks `IsActive` only.

**Proposed for the VA.** Since the VA will already read the database live, it reads `SwepBanners` for the person's area through its read-only user, and when it is active shows the same notice early in the conversation, with the same link. No new mechanism and no second source of truth.

**Three things to handle:**
- **Unknown is not off.** A missing document and a failed read both come back as "not active". The VA must treat a failed read as unknown and say nothing either way, rather than imply there is no provision.
- **A stale status.** If the midnight job misses a night it never catches up, so a banner can stay on past its end, and "Activate Immediately" stays on until someone turns it off. The VA would repeat whatever the website shows. That is a platform fault for the website and the VA alike, and belongs with the technical lead.
- **Locations and local authorities.** Each SSN location is a local authority by design (Managing Director, 31 October 2026), so the VA reads the document for the person's local authority. All seven WMCA authorities have SWEP coverage (Managing Director, 31 October 2026). A document missing or unreadable at run time still reads as unknown.

## 8. Open questions for the technical lead

| Question | Why it matters |
|---|---|
| Where does a service's local authority cover live: per service, per organisation, or per SSN location? | The VA filters local results by local authority. 71 services in the current file cover two. If cover is held per SSN location, it is already by local authority, since each location is one by design |
| The SWEP midnight job never catches up a missed night | A banner can stay on past its end, on the website and in the VA |
| Read per conversation, or a short cache? | Speed and database load |
| A fallback copy of local results, or the endpoints alone when the database is down? | Section 4, step 4 |
| The read-only database user for the VA, and Atlas network access from where the VA is hosted | The credential and the connection |
| Which branch the VA deploys from | Where the change lands |
| How cross-boundary determinations reach the platform | The 88 strong cross-boundary matches found under the Data Enrichment Contract v2.1 amendment were sent to Eliz for decision in March |
| Do the contracts need amending for a live read? | The Data Enrichment Contract names the SSN database API as its source; the website reads the database directly. Most VA contracts are drafts pending trustee approval |

## 9. Effort and dependencies

The live read follows a pattern that already exists in the website, so the build is small: a server-side route, the query, and passing the list to the matcher. The weekly check is a scheduled script and a report. Neither can be sized fully until section 8 is answered, above all local authority cover.

**Dependencies:**
- **The re-keyed matcher.** V4 categories must reach the VA together with a matcher that knows them. Otherwise every non-housing need returns nothing, and for Food or Drop In a person is told there is no local support when there is. The delivery plan has the matcher's category maps in the week of 23 November, after M4a in the week of 16 November. Either they move forward a week, or M4a tests the VA on the old keys.

**What M4a proves depends on that choice.** On old keys, M4a proves the live connection and the data flow only. It must not be described as proving V4 integration, and M4 must then prove V4 matching end to end. The delivery plan defines M4a as a V4 service "found by the VA reading staging", which needs the re-keyed matcher. So moving the category maps forward keeps M4a as defined; staying on old keys changes the milestone. That is a decision for the plan.
- **The platform reflecting the determinations.** Of the 752 services in the fixed file that are current in the migration baseline, 159 are not separate listings in V4. The VA shows them correctly only if the website import unpublishes or consolidates them.
- **The clone and its read-only access**, in the week of 2 November.
- **The service matching review**, for exclusion and the routing tests.

**Outside this proposal, named for the matching review:** the VA's gender filter hides women-only services from women. It looks for "male" in the person's answer, and "female" contains "male". On the current file, none of the 74 "Female only" rows reaches a woman. It is not on the VA backlog.

## 10. How the earlier reviews carry over

| Finding | Now |
|---|---|
| A copy can show a closed service for days | Live read |
| Holding changes for approval would create a weekly workload | No approval step (decision 2); weekly review reports only |
| Data accuracy is not routing accuracy | Routing rules designed in the matching review; checked weekly on live data |
| Platform publication is not VA inclusion | Section 5 |
| V4 data before the re-keyed matcher | Section 9 |
| Population tags are not grounds to hide a service | Service matching review (decision 5) |
| Contact data unverified | Organisations' own responsibility (decision 2) |
| SWEP | Section 7: the VA reads the same status the banner reads |
| Services covering two local authorities | Section 8 |
| Statutory routes shown twice | Section 5 |
| Credential in a public repo | A server-side credential, as the website holds it; no scheduled job in the repo |
| Estimates were component estimates | Section 9 |
| Draft 4: a cache could make a live read stale | Section 4: minutes, written down, no slower than the website |
| Draft 4: a routing defect is not a data change | Section 6: same-day alert, fallback to endpoints, priority fix |
| Draft 4: M4a on old keys must not be described as proving V4 | Section 9 |
| Draft 4: organisations' responsibility does not remove SSN's for its rules | Section 2, decision 6 |

## Sources

- `street-support-va`, `staging` at `d29d7eb`: `lib/serviceMatcher.ts`, `lib/data/wmca_services_v7.json`, `lib/data/wmca_organizations_v7.json`, `VA_BACKLOG.md`.
- Platform audit, 31 October 2026 (`PLATFORM_AUDIT.md`, sha256 `721282c6…`).
- Service Matching Contract v2.0; Data Enrichment Contract v2.0; Housing and Non-Housing Pathway Endpoints Contracts v1.0 (project copies, 31 October 2026).
- National V4 Delivery Plan, 29 October 2026, sections 4.4 to 4.6.
- Independent review of draft 1 (`REVIEW.md`); review of draft 2, supplied by the Managing Director, 31 October 2026.
- The Managing Director's decisions of 31 October 2026 (section 2).
