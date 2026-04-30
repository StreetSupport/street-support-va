# Street Support VA: Implementation Backlog

**Purpose:** Track what we should be considering working on next.
**Last updated:** 30 April 2026

---

## Current

### PR #16: Merged — 15 April 2026
**Status:** Merged to main 15 Apr 2026. 96/96 tests passing.
**URL:** https://github.com/StreetSupport/street-support-va/pull/16

### PR #17: Merged — 22 April 2026
**Status:** Merged to main. 97/97 tests passing.
**URL:** https://github.com/StreetSupport/street-support-va/pull/17

### PR #18: Merged — 29 April 2026
**Status:** Merged to main. 96/96 tests passing.
**URL:** https://github.com/StreetSupport/street-support-va/pull/18

### PR #19: Ready to commit — mechanical safeguarding changes
**Status:** Built and tested 30 Apr 2026. 96/96 tests passing. Not yet committed.
**Scope:**
- GATE0 case 2 (`Under 16`) missing `safeguardingTriggered: true` and `safeguardingType: 'UNDER_16'` — fixed in `crisis.ts`
- Phrasebank selector (`getPhrase` / `phrase`) widened to accept `userType` (`'SELF' | 'SUPPORTER' | 'PROFESSIONAL' | null | boolean`) — enables `__PROFESSIONAL` phrasebank variants. No `__PROFESSIONAL` entries added yet (language sign-off pending — see item 57 and language review document)
- `VA_BACKLOG.md` included in commit

---

## Governance Decisions Log

This log records Tier 2 and Tier 3 governance decisions for trustee visibility. Tier 2 decisions are implementation improvements approved by the technical lead (James) — trustees are notified at the next meeting. Tier 3 decisions are changes to governing principles requiring board approval. Both are recorded here so trustees have a complete picture at each meeting.

**Note:** This log was established 15 April 2026. Changes prior to this date have been reconstructed from PR history and conversation records. Historical recording was incomplete — this log formalises the process going forward.

### Tier 3 — Board decisions

| Date | Change | Approval record | PR |
|------|--------|----------------|----|
| Mar 2026 | Mid-conversation age detection: new safeguarding capability using deterministic pattern matching to detect under-16 disclosures at any gate and route to Children's Services exit. AI influences safeguarding pathway — Tier 3 by nature. | Trustee-Accessible Safeguarding Boundary Summary (Mar 2026) produced and sent to trustees. Design Note v1.1 governs implementation. | PR #16 (implementation, Apr 2026) |

### Tier 2 — Technical lead decisions (trustees notified at next meeting)

| Date | Change | Approved by | PR |
|------|--------|-------------|----|
| Mar 2026 | Crisis gate reordered: immediate danger moved to option 1, under-16 moved to option 2. Reordering within existing system function — Tier 2 per boundary rule (no option delayed or harder to reach). | James Cross | PR #6 |
| Mar 2026 | Special category consent gate removed. Data minimisation by design (quick route architecture) replaces consent gate as the GDPR compliance mechanism. Governed by GDPR Implementation Map v1.0, Data Minimisation and Lawful Basis Note v1.1, Appropriate Policy Document v1.0. | James Cross | PR #9 |
| Apr 2026 | Location gate moved immediately after GATE0 — LA known before profiling begins. Restores original WatsonX design. Tier 2 touching Tier 3 (affects crisis safeguarding path). | James Cross | PR #16 |
| Apr 2026 | "Prefer not to say" removed from CRISIS_UNDER16_LOCATION. Location is routing-critical in a child safeguarding exit — PNTS not appropriate. Framed as a correction rather than a principle change. Note: removing an option from a safeguarding gate is Tier 3 by default under boundary rules — recorded here for Catherine's awareness. | James Cross | PR #16 |

---

## Safeguarding Enhancements

### 3. Mid-conversation age detection
**Priority:** High
**Status:** Complete. PR #16 merged 15 Apr 2026. Post-merge governance docs updated 15 Apr 2026.
**Post-merge governance completed:** Design Note v1.2 produced (Section 14 implementation record added). Safeguarding Contract v3.2 produced (test count updated, mid-conversation age detection moved from pending to implemented). Safeguarding Governance Note v3.3 produced (test count updated, mid-conversation age detection row added to test table). Trustee-Accessible Safeguarding Boundary Summary remains a standalone approval paper.

---

## LGBTQ+ Pathway

**Scope note:** LGBTQ+ identity modifies routing only where the nature of the need is materially affected. It does not modify Food, Personal Items, Personal Services, Drop In, Activities, Communications, Financial Help, Advice, Work, or Training.

### 22. LGBTQ+ dynamic matching — local specialist layer for housing
**Priority:** Medium
**Issue:** AKT and Stonewall Housing are correctly hardcoded for LGBTQ+ housing. But local LGBTQ+ specialist orgs in the SSN catalogue (Micro Rainbow, Birmingham LGBT — 26 services total across 3 orgs per pipeline run 28 Feb 2026) are not surfaced dynamically.
**Required:**
- Wire `lgbtq_specialism = yes` (AUTO_VERIFY only) into housing service matching for LGBTQ+ users
- These results surface alongside AKT and Stonewall, not instead of them
- LA-filtered: Micro Rainbow appears for Birmingham users; results are LA-appropriate
**Depends on:** Enriched data with lgbtq_specialism classifications (available — pipeline run 28 Feb 2026)
**Tests needed:** LGBTQ+ housing user sees local specialist org where one exists; non-LGBTQ+ user does not; AKT and Stonewall still shown for all LGBTQ+ housing users

---

## Housing Pathway Gaps

**Source:** Housing pathway mapping audit (Feb 2026) cross-checked against TypeScript codebase via Claude Code. Reference document: Housing Pathway Endpoints Contract v1.0.

### Phase C: New profile fields and routing design required

#### C1. Care leavers (18–20): previously_looked_after field missing
**Priority:** High
**Status:** Not started. Scoped Feb 2026. Launch blocker — not yet progressed.
**Issue:** `previously_looked_after` field does not exist in the codebase. WatsonX had this as a routing variable. Codebase only has generic "contact Leaving Care team" text (stateMachine.ts:942) with no LA-specific lookup.
**Required:**
- Add `previously_looked_after` to UserProfile (types.ts)
- Ask the question when user age is 18–20 (age bracket already collected — question only fires within the relevant age window)
- `socialServices` question asked when age is 16–20 (covers both the 16-17 social services pathway and the 18-20 care leaver pathway)
- When `previously_looked_after = yes` + age 18–20: surface Children's Services (LA-specific), housing navigator (St Basil's), Housing Options, Shelter helpline
- Language reflects 18-20 entitlement (stronger) — see Housing Pathway Endpoints Contract for age-differentiated framing
**Files:** types.ts, sectionC.ts, stateMachine.ts / relevant handler, housing-pathway-endpoints.json
**Note:** Care leavers 21–24 is a separate future item (see Future section). This item covers 18–20 only.
**Tests needed:** 18-20 + previously looked after reaches Children's Services + navigator; 18-20 + not previously looked after does not

#### C2. Conviction routing: full redesign
**Priority:** Medium
**Status:** Not started. Fully scoped 15 Apr 2026 following WatsonX audit and research into available provision.
**Issue:** The current conviction question is Yes/No/PNTS and produces no conviction-specific routing. WatsonX collected conviction type but produced no differentiated output. Neither approach is adequate. This item replaces C2 and C3 entirely.

**Governance check required before building:** Service Matching Contract (routing logic change), Housing Pathway Endpoints Contract (new hardcoded orgs), Non-Housing Pathway Endpoints Contract (national advice floor addition).

**Question flow:**

Step 1: "Do you have any unspent convictions that might affect your housing options?" Yes / No. No PNTS — required for routing.

Step 2 (if Yes): "Which of these applies?" Arson / Sexual offences / Violent offences / Other. No PNTS — required for routing.

Step 3: "Do you know whether your conviction is spent?" Yes it is spent / Yes it is unspent / I'm not sure.
- Spent: surface guidance that spent convictions do not need to be disclosed (Shelter housing and criminal records page + Nacro CRSS guidance). Standard housing route.
- Not sure: surface link to Unlock Disclosure Calculator (opens in new window). User returns with answer and proceeds accordingly.
- Unspent: proceed to conviction-specific terminal.

**Conviction-specific terminals:**

**Arson (unspent):**
Honest framing — this creates particular barriers with most housing providers. Do not mention insurance. Warm, practical, does not make the person feel blamed.
Output: Housing Options (LA-specific), housing navigator (LA-specific), Langley Trust (Murray Lodge, Coventry — specialist provision for people with convictions including complex cases; self-referral accepted: 02476 587360 / referrals@langleytrust.org), Unlock housing guide (langleytrust.org), Nacro Criminal Record Support Service (0300 123 1999).
No dynamic service matcher results — honest acknowledgement that mainstream provision cannot accept arson convictions.
LGBTQ+ modifier: if lgbtq = true + age under 25: add AKT (akt.org.uk). If lgbtq = true + age 25 or over: add Stonewall Housing (stonewallhousing.org).

**Sexual offences or violent offences (unspent):**
Honest framing — options are more limited than for other convictions, but some providers assess on a case-by-case basis. You may need to disclose your conviction when approaching providers.
Output order: Housing Options (LA-specific), housing navigator (LA-specific), Langley Trust (as above), dynamic service matcher results with disclosure caveat, Unlock + Nacro CRSS as national advice floor.
Disclosure caveat on dynamic results: "These local services may be able to help, but you are likely to need to disclose your conviction. Your housing navigator or Housing Options team can help you work out the best approach."
LGBTQ+ modifier: same as arson — AKT under 25, Stonewall Housing 25 and over.

**Other conviction (unspent):**
Framing: this type of conviction may have little or no impact on your housing options, but it is worth understanding your position.
Surface Unlock Disclosure Calculator link and Shelter/Nacro disclosure guidance.
Standard housing route — no specialist framing, no Langley Trust.

**Contact data to verify before phrasebank entry:**
- Langley Trust referrals: 02476 587360, referrals@langleytrust.org (confirmed from 2022-23 brochure — verify current)
- Murray Lodge, Coventry: murraylodge@langleytrust.org, 02476 505 759 (confirmed from brochure — verify current)
- Nacro CRSS: 0300 123 1999 (confirmed from nacro.org.uk — verify current)
- Unlock Disclosure Calculator: unlock.org.uk/disclosure-calculator (verify URL live)
- Shelter housing and criminal records page: verify current URL

**Files:** types.ts, profiling.ts or relevant handler, housing-pathway-endpoints.json, phrasebank.ts, stateMachine.ts
**Tests needed:** Arson user reaches Langley Trust + no dynamic results; sexual/violent offences user reaches Langley Trust + dynamic results with caveat; other conviction user reaches standard route; spent conviction user reaches disclosure guidance only; LGBTQ+ + any unspent conviction + under 25 adds AKT; LGBTQ+ + any unspent conviction + 25 or over adds Stonewall Housing.

---

## Pipeline Pre-Rollout Validation (new, 12 Mar 2026)

**Context:** The enrichment pipeline, scraper, and classifier were built and tuned against WMCA data. When SSN expands to a new geographic area, the pipeline must be validated against that area's data before any enriched output is used. This section defines the validation procedure and the code required to support it.

**Depends on:** Git repo for pipeline (needs James's help). Current WMCA governance review completed (produces the baseline snapshot).

### 34. Baseline snapshot from current WMCA governance review
**Priority:** High (prerequisite for everything below)
**Status:** In progress. Unblocked once Eliz returns decisions on the 22-item safeguarding governance review (sent 28 Mar 2026) and cross-boundary findings are confirmed. Both feeds into the baseline before it is locked.
**Required:** When Matt completes the governance review (REVIEW items decided, AUTO_VERIFY/AUTO_REJECT spot-checked, rules confirmed), the approved enriched output file is saved as the baseline snapshot: `wmca_baseline_YYYY-MM-DD.json`. This is the anchoring artefact for all future regression checks. Must be version-controlled in the pipeline repo once it exists.
**Governance:** The baseline is a governance artefact, not just a data file. It represents "this is the approved state of enrichment for this area." Any future run that produces different verdicts for unchanged services must be explained.

### 35. Pipeline validation workflow
**Priority:** High (pipeline workstream)
**Status:** Not started. Blocked by items 34 (baseline) and git repo.
**Required:** A guided workflow script (`validate_pipeline_run.py`) that runs after every pipeline run. This is not a black-box pass/fail check. It is a structured human review process where automation prepares findings and the operator makes decisions at each step. Follows the Prepared Judgment pattern: automation surfaces, human decides, decisions are recorded.

The script must be usable by anyone with pipeline access without prior knowledge of the system. Each step presents findings, explains what they mean, prompts for a decision, and records the decision in the output report.

**Design principles:**
- Every automated finding is presented with enough context for the operator to make a judgment. No "3 items flagged" without showing what they are and why they were flagged.
- Every decision point states what the operator is being asked to decide and what the consequences are.
- The operator can record notes against any decision (e.g. "accepted because X", "needs follow-up with Y").
- The output is a complete record of what was checked, what was found, and what was decided. It is a governance artefact, not just a log.

**Workflow structure:**

**Phase 1 — Automated analysis (no human input needed):**
The script runs all checks and prepares a structured findings report. This phase is silent (or progress-only output). The operator does not need to interact until Phase 2.

Checks performed:
- Verdict stability: compare every service present in both the new run and the baseline. Identify any service where the verdict changed but the description, org name, and category did not. Expected cause: rule changes. Unexpected cause: bug or data corruption.
- Known org coverage: check every entry in KNOWN_MH_ORGS and KNOWN_DV_ORGS against the dataset. Report entries matching zero orgs (stale) and entries matching more than one org (potentially too generic), showing which orgs matched each entry.
- Proportion comparison: AUTO_VERIFY, AUTO_REJECT, and REVIEW proportions compared to baseline. Per-LA service counts compared to baseline.
- If new area data is present: unmapped client group tags, unmapped category keys, location restriction pattern gaps, radius coverage, new area review queue proportion vs baseline.

**Phase 2 — Guided review (operator works through findings):**
The script presents findings one section at a time and prompts the operator through decision points.

*Section 2a — Verdict changes:*
- For each service with a changed verdict: show service name, org, old verdict, new verdict, whether the description/category changed.
- Decision prompt: "Accept this change? (y/n/note)" for each item.
- If description changed: probably fine (data updated on SSN). If description unchanged but verdict changed: likely a rule change — operator confirms this was intentional.

*Section 2b — Known org health:*
- Show each known org entry with its match count and matched org names.
- Decision prompts for entries matching zero orgs: "This entry matched no orgs. Remove from list? (y/remove/keep with note)"
- Decision prompts for entries matching multiple orgs: "This entry matched N orgs: [list]. Are all matches genuine specialists? (y/n/note)"

*Section 2c — Proportion shifts:*
- Show current vs baseline proportions. Flag any shift > 5 percentage points.
- If flagged: "AUTO_VERIFY proportion shifted from X% to Y%. This may indicate [possible causes]. Investigate before proceeding? (y/accept/note)"

*Section 2d — New area checks (only when expanding):*
- Unmapped client group tags: show each unmapped tag with example services. Decision prompt: "Add to CLIENT_GROUP_MAP? (y/skip/note)" for each.
- Unmapped categories: show each unmapped category key with example services. Decision prompt: "Add to classifier category lists? (y/skip/note)" for each.
- Location restriction gaps: show any new LA names found in descriptions but missing from LOCATION_RESTRICTION_PATTERNS. Decision prompt: "Add to patterns? (y/skip/note)".
- Radius coverage: show services fetched vs total for each new LA. Flag where total exceeds fetched by >10%. Decision prompt: "Increase radius or add secondary search point? (y/accept/note)".
- Review queue proportion: show new area REVIEW rate vs baseline. If significantly higher: "New area REVIEW rate is X% vs baseline Y%. This suggests current rules may not fit the new area's data well. Investigate before proceeding? (y/accept/note)".

*Section 2e — VA endpoint checklist (only when expanding):*
- For each new LA: show which VA data slots are filled and which are empty (Housing Options, Children's Services, OOH, SARC, DV crisis line, navigator orgs, DV orgs, immigration orgs).
- Decision prompt for each empty slot: "This data requires manual verification against primary sources. Mark as: (todo/not-applicable/note)".

**Phase 3 — Report generation:**
The script compiles all findings and decisions into a validation report (markdown file). The report includes: run metadata (date, input file, baseline file, rules version), all automated findings, all operator decisions with notes, a summary of open items (anything marked for follow-up), and a final status (clear / has open items / blocked).

The report is saved alongside the pipeline output: `validation_report_YYYY-MM-DD.md`. It is a governance artefact and should be version-controlled alongside the pipeline output.

**Implementation note:** The interactive prompts should work in a terminal but the script should also support a `--non-interactive` mode that generates the findings report without prompts (for CI or batch processing). In non-interactive mode, any finding that would normally require a decision is flagged as "REQUIRES REVIEW" in the report.

### 36. New location onboarding procedure
**Priority:** Medium (governance, not code)
**Status:** Not started. Draft after validation script is built.
**Required:** A step-by-step procedure document for onboarding a new geographic area to the enrichment pipeline and VA. Written so that anyone with pipeline access can follow it without prior knowledge of the system. Each step specifies what to do, what the expected output is, and what decisions need to be made before proceeding.

This document is the operational companion to the validation script (item 35). The validation script implements the automated checks; this document provides the full context, rationale, and manual steps that sit around them.

**Step 1 — Scraper configuration:**
- Add new LA centre coordinates to `LA_CENTRES` in the scraper
- Assess whether `SEARCH_RADIUS_KM` is appropriate for the new area's geography (compact urban vs spread rural). For irregularly shaped or large LAs, consider multiple search points per LA.
- Add new LA names to `LOCATION_RESTRICTION_PATTERNS` in the pipeline
- **Decision:** Confirm radius strategy before running (single point vs multi-point per LA)

**Step 2 — Fresh scraper run:**
- Run scraper with new configuration
- Check per-LA service counts and radius coverage warnings
- Verify new area orgs are matching to service-providers (no orphaned services)
- **Decision:** Are service counts plausible for each new LA? Any warnings to investigate?

**Step 3 — Pipeline run with validation workflow:**
- Run enrichment pipeline on combined data (existing areas + new area)
- Run validation script (item 35)
- Work through the guided review: regression checks confirm existing area verdicts are stable; expansion checks surface unmapped tags, categories, and gaps
- **Decision points:** All handled within the validation workflow (item 35). Operator works through each finding and records decisions.

**Step 4 — Known org and rule updates:**
- Research specialist orgs for the new area: DV directories, MH provider lists, LA commissioning records, local specialist directories
- Add confirmed specialists to KNOWN_MH_ORGS and KNOWN_DV_ORGS. Each entry must be specific enough to avoid false positives (see comment in classifier code). Document rationale for every addition.
- Address any generic entries that false-positived against new data (from collision report in step 3)
- Add any new category mappings needed
- **Decision:** Are the known org lists complete for the new area? Any classifier rules that need adjustment?

**Step 5 — Re-run pipeline with validation:**
- Re-run pipeline with updated rules
- Re-run validation workflow
- Confirm regression check passes and expansion checks are clean
- **Decision:** Are all findings resolved, or do steps 4-5 need another iteration?

**Step 6 — VA endpoint population (manual, not automatable):**
- Populate `housing-pathway-endpoints.json` for each new LA: Housing Options (phone, URL), Children's Services (phone, OOH phone), navigator orgs, DV orgs, immigration orgs
- Populate `safeguarding-endpoints.json` for each new LA: SARC contact, DV crisis line
- Verify all contact data against primary sources (council websites, org websites). Do not trust any data that has not been checked against the primary source — the standing pattern from the Feb 2026 contact data audit applies.
- Run VA endpoint checklist from validation script to confirm all slots filled
- **Decision:** All slots filled and verified? Any slots marked not-applicable with documented rationale?

**Step 7 — Governance review:**
- Matt reviews REVIEW queue for new area (decide yes/no for each item)
- Matt spot-checks AUTO_VERIFY and AUTO_REJECT for new area
- If satisfactory, approved output becomes the new baseline snapshot (replaces previous)
- Update Data Enrichment Contract if any new rules or known orgs were added
- Update Safeguarding Contract if new safeguarding-adjacent orgs were added
- **Decision:** Approve new baseline? Document any exceptions or follow-up items.

**Note:** Steps 4-5 may iterate. The first run reveals what needs updating, the second confirms the updates work. This is expected and not a sign of problems.

**Governance home:** This procedure sits under the Data Enrichment Contract as a pre-rollout requirement. The contract should reference it once the procedure is finalised.

### 37. Audience check on specialism flags (watch brief)
**Priority:** Low (watch brief, not a gate)
**Status:** Noted 12 Mar 2026. Review after first live pipeline run.
**Context:** Specialism flags currently answer "is this service in domain X?" The VA needs "is this service appropriate to show to population Y?" In principle these can differ (e.g. a DV perpetrator programme is DV specialist but should not be shown to a survivor). In practice, SSN lists services for people seeking support — perpetrator programmes, employer MH services, and research studies are not in the dataset because they don't serve SSN's user population.
**What to check on first live run:** Scan all services classified as `dv_specialism = yes` and `mental_health_specialism = yes`. Confirm none are aimed at a different audience (perpetrators, employers, researchers, professionals). If any are found, scope audience sub-classification at that point.
**Edge case noted:** ISVA services (Independent Sexual Violence Advisers) may appear under DV orgs. A DV survivor being shown an ISVA service at an org that also does DV work is not a wrong match — the org can redirect internally. Only a concern if a standalone ISVA service with no DV provision gets flagged as DV specialist. Check for this on first run.
**Not a gate:** Does not block service matcher integration. The risk is theoretical given SSN's dataset. If the first run reveals genuine audience mismatches, upgrade to a blocking item at that point.

### 38. Feedback loop: human review decisions as classifier training data
**Priority:** Medium (pipeline workstream)
**Status:** Not started. Scoped 12 Mar 2026.
**Issue:** Every time a human reviews an item and decides "yes, this is a specialism" or "no, it isn't", that decision is signal. Currently these decisions are not stored in a way that feeds back into the classifier. The system stays the same quality rather than improving over time.

**Two uses for accumulated human decisions:**

**Rule refinement.** After enough human reviews, patterns emerge. If every service with phrase X in the description hits REVIEW and the human always says yes, that phrase is a candidate for a new AUTO_VERIFY signal word. If every service from org Y hits REVIEW and the human always says no, that org is a candidate for AUTO_REJECT. The review queue shrinks over time because the classifier learns from decisions. New rules still require documented rationale before addition (per classifier governance), but the feedback data tells you *which* rules to consider.

**Confidence validation.** The AUTO_VERIFY and AUTO_REJECT verdicts can be checked against accumulated human spot-check decisions. If the classifier auto-verified 50 MH services and 48 of the spot-checks agreed, that's 96% accuracy. If only 40 agreed, the rules need revisiting. This is the error rate signal the governance note says should trigger review (>5% threshold). Without the feedback loop, you can only measure this during a full review cycle. With it, accuracy accumulates passively.

**Mechanism:**
- Each human decision is stored as a record: service key, field, classifier verdict, human verdict, optional note, date, reviewer.
- Storage format: JSON file alongside pipeline output, one record per decision. Appended over time, not overwritten.
- A comparison script surfaces disagreements and patterns: "the classifier said AUTO_VERIFY on 12 items you reviewed — you agreed with 11 and disagreed on 1. Here's the disagreement: [details]." Also: "these 5 REVIEW items all have phrase X in the description and you said yes to all of them — consider adding X as an AUTO_VERIFY signal."
- The comparison script runs as an optional phase in the validation workflow (item 35), after the operator has completed their review. It does not run automatically — the operator chooses when to analyse accumulated feedback.

**What this is not:**
- Not automated rule changes. Human decisions inform rule *candidates*. Adding a rule still requires documented rationale and governance review.
- Not real-time. Feedback accumulates over review cycles and is analysed periodically. No live learning loop.
- Not dependent on volume. Even a single review cycle produces useful signal. The value compounds over time but the mechanism works from day one.

**Depends on:** Item 34 (baseline snapshot — the first review cycle produces the first feedback data). Git repo for pipeline (feedback files need version control).
**Files:** New: `review_decisions.json` (append-only feedback store), `analyse_feedback.py` (comparison script). Integration point: validation workflow (item 35) Phase 2 gains an optional "analyse accumulated feedback" step.

---

## Enrichment Code Fixes

### 9. Under-18 safeguarding flag not populating
**Priority:** High (safeguarding compliance)
**Issue:** No pre-computed `accepts_under_18s` boolean exists. `matchesAge()` only checks youth/elderly keywords, not "18+ only" or "Under 18s only". A service tagged "18+ only" in client_groups would still show to a 16-17 year old.
**Source:** Edge cases audit (Feb 2026). Confirmed by Claude Code (Feb 10).
**Status:** Scoped, not yet implemented.

### 10. Contradictory gender data not detected
**Priority:** High
**Issue:** `matchesGender()` uses two independent signals OR'd together with no conflict check. Examples: client_groups ["Men"] but description "women's refuge"; client_groups ["Women", "Men"] treated as both women-only AND men-only.
**Source:** Edge cases audit (Feb 2026). Confirmed by Claude Code (Feb 10).
**Status:** Scoped, not yet implemented.

### 10b. Gender substring matching lacks word-boundary awareness
**Priority:** High
**Issue:** `womenOnlyTerms` includes "mothers", "pregnancy" etc. Substring matching means "help for fathers and mothers" flags as women-only because "mothers" matches.
**Source:** Claude Code analysis (Feb 10).
**Status:** Not yet scoped.

---

## Refactoring: Ready to Implement (Low Risk)

### 46. 'Prefer not to say' responses should store `null`, not `false`
**Priority:** Low
**Status:** Complete — PR #17 merged 22 Apr 2026.
**Issue:** 'Prefer not to say' selections mapped to `false`, collapsing two distinct states: user said "no" vs user declined to answer. Broke the type integrity rule (boolean fields hold `true`, `false`, or `null` only).
**Audit findings (11 Apr 2026):** Two fields needed fixing: `lgbtq` (stateMachine.ts:1204) and `hasChildren` (stateMachine.ts:1276). `housingOptionsInvolvement` already correct. Fix exposed a routing bug: `routeToNextProfileQuestion` used `=== null` to decide whether to ask a question — PNTS `null` was indistinguishable from "never asked" `null`, causing hasChildren to re-ask on PNTS selection.
**James's direction (13 Apr 2026):** Pass `after: '<field>'` from the caller into `routeToNextProfileQuestion` so the router knows what was just handled rather than inferring from null state. Avoids need for a separate `askedGates` Set.
**Implementation:** 9 call sites audited. Call sites 3–9 pass `after: '<field>'` for the field just handled. Call sites 1–2 (initial routing) stay parameter-free. Both PNTS fields now store `null`. Regression test added: PNTS through B5_PROFILE_CHILDREN does not re-trigger the gate. `after` param subsequently typed as union (`'age' | 'gender' | 'lgbtq' | 'convictions' | 'nrpf' | 'children'`) in PR #18 — compile-time protection against typos.
**Issue:** 'Prefer not to say' selections currently map to `false`, collapsing two distinct states: user said "no" vs user declined to answer. No routing is affected today, but it breaks the type integrity rule (boolean fields hold `true`, `false`, or `null` only) and obscures the distinction if routing ever needs to differentiate.
**Audit findings (11 Apr 2026):** Two fields need fixing: `lgbtq` (stateMachine.ts:1204) and `hasChildren` (stateMachine.ts:1276). `housingOptionsInvolvement` already correct. String fields all correct.
**James's direction (13 Apr 2026):** Pass `after: '<field>'` from the caller into `routeToNextProfileQuestion`. Implemented: 9 call sites audited, call sites 3–9 pass `after`, call sites 1–2 stay parameter-free. Both PNTS fields now store `null`. Regression test added.

### Phase 1: Cleanup

#### 1.1 Delete duplicate route file
**Risk:** Low | **Lines saved:** 87
**File:** `app/location/route.ts`
ChatWidget calls `/api/location`, so this file is unreachable dead code. Confirmed by Claude Code.
**Tests needed:** No routing tests break after deletion.

#### 1.2 Consolidate duplicate phrasebank content
**Risk:** Low-Medium | **Lines saved:** ~200
**Issue:** Section C profiling questions and terminal building functions contain identical or near-identical text blocks. Some are duplicated across multiple handlers.
**Required:** Consolidate to shared phrasebank references. Reduces risk of content drift.
**Files:** phrasebank.ts and all handler files

### Phase 2: Handler simplification

#### 2.1 Extract B5 terminal builder
**Risk:** Medium | **Blocks:** Phase 3
**Issue:** `buildNonHousingTerminal` in stateMachine.ts is the remaining blocker for B5, B7, B7A handler extraction.
**Required:** Extract to shared.ts or terminal.ts, wire cleanly, all tests pass.
**Depends on:** shared.ts stable (PR #3 merged — completed).

#### 2.2 Extract B7 and B7A handlers
**Risk:** Medium | **Depends on:** 2.1
**Files:** stateMachine.ts → prevention.ts / homeless.ts as appropriate

### Phase 3: Data consolidation

#### 3.1 Move all LA contact data to housing-pathway-endpoints.json
**Risk:** High (safeguarding-adjacent) | **Depends on:** la-contacts.json consolidation ✅ complete (PR #6)
**Required:** Review stateMachine.ts for any remaining hardcoded LA numbers. National helplines correctly remain inline.
**Note:** la-contacts.json has been removed. housing-pathway-endpoints.json is now the single source. Safeguarding Contract reference updated in v3.1 (25 Mar 2026).

### Phase 4: Codebase audit cleanup (new, 12 Mar 2026)

**Priority:** Low (housekeeping, no user-facing impact)
**Status:** Audit complete 12 Mar 2026. Cleanup not started. Unblocked — PRs #7-#10 all merged.
**Risk:** Low. All items are dead code removal. No routing, safeguarding, or user-facing behaviour changes.

**Findings from comprehensive codebase audit:**

**Dead SessionState fields (20 written but never read):** `intentType`, `locationMethod`, `userType`, `housedSituation`, `duration`, `income`, `priorUse`, `alreadySupported`, `currentSupportingOrg`, `preventionEmployment`, `preventionPriorSupport`, `preventionSafeguardingSignals`, `consentGiven`, `eussStatus`, `ethnicity`, `inCare`, `youthServicesFlag`, `safeguardingTriggered`, `escalationLevel`, `terminalOutcome`. Plus 2 initialised but never written: `additionalNeeds`, `unclearCount`.
**Action:** Before removing, verify each against planned features. Keep fields needed for: analytics (`terminalOutcome`, `safeguardingTriggered`, `escalationLevel`), care leavers pathway (`inCare`, item C1), Article 9 (`ethnicity`, PR #7). Fields collected on FULL route (`housedSituation`, `duration`, `income`, `priorUse`, `alreadySupported`, `currentSupportingOrg`, prevention fields) may feed `buildTerminalServices` or `toUserProfile` indirectly — verify before removing. Genuinely dead candidates: `intentType`, `locationMethod`, `userType`, `consentGiven`, `eussStatus`, `unclearCount`, `additionalNeeds`, `youthServicesFlag`.

**Dead handler functions in profiling.ts (6 exported, never imported):** `handleB1LocalAuthority`, `handleB2WhoFor`, `handleB3AgeCategory`, `handleB4Gender`, `handleB6HomelessnessStatus`, `handleB7HousedSituation`. Same logic exists inline in stateMachine.ts processInput switch. Left over from incomplete handler extraction (PR #3).
**Action:** Remove all 6. The inline versions in stateMachine.ts are the active ones.

**Orphaned phrasebank entries (~21 defined, never referenced by any handler):** Full list to be confirmed during cleanup. Includes `B5_PROFILE_NRPF` (replaced by `IMMIGRATION_STATUS_ASK` in PR #7).
**Action:** Remove all confirmed orphans. Verify each is genuinely unreferenced before removal.

**Unused gate types:** `TERMINAL_SERVICES` defined but never used. `ESCALATION_LEVEL_3` has no handler.
**Action:** Remove if confirmed dead. `ESCALATION_LEVEL_3` may be planned future work — check backlog before removing.

**WatsonX patterns:** Clean. No legacy patterns found.

**Implementation:** Single cleanup PR. One commit per category (dead fields, dead handlers, dead phrasebank, dead gates). Easy review for James.

---

## Ethical AI Review (from IBM Five Pillars review, Feb 2026)

### 12. Service matching: deterministic algorithm design
**Priority:** High (design work)
**Issue:** Current matching uses hard gates with no scoring or ranking. When multiple services pass, there is no principled ordering — services appear in catalogue order, which is arbitrary.
**Required:** Develop a match scoring algorithm that produces a match percentage for each service based on explicit criteria alignment. Score is deterministic, not AI-interpreted at match time. Results ordered by score.
**Design principle:** Scoring is mechanical and auditable. Frontend stays simple. Backend enrichment makes inputs cleaner.
**Depends on:** Items 9/10/10b (enrichment fixes for clean criteria).
**Governance note:** Score must be derived from algorithm, not AI. Keeps it within Service Matching Contract.

### 13. Explainability: session-level transparency logging
**Priority:** Medium
**Issue:** No structured log exists of what routing decisions were made during a session and why. Makes audit and accountability harder.
**Required:** Session-level decision log (not user-facing) recording: which gates fired, which profile variables triggered which outcomes, which services were matched and why.
**Governance note:** Must stay within Analytics Contract scope — enumerated values only, no free text, no personal data.

### 14. Match scoring algorithm
**Priority:** High (design work)
**Issue:** No principled ordering of matching results.
**Proposed design:**
- Algorithm produces a match score (percentage) for each service based on how service criteria align with user profile
- Score derived from the same explicit criteria used for hard-gate checks (deterministic, not AI-interpreted at match time)
- Results ordered by match percentage
- Score not surfaced to user by default, but present in the system so it can be asked about, audited, and explained during the session
**Depends on:** Item 12 (matchServices), items 9/10/10b (enrichment fixes for clean criteria).
**Governance note:** Score must be derived from algorithm, not AI.

### 15. Fairness: enrichment normalisation layer
**Priority:** High (design work)
**Issue:** Service descriptions use varied language for the same eligibility criteria. Language quality becomes a bias factor if not normalised.
**Required:** Define a standardised vocabulary for each eligibility field. Enrichment instructions include explicit normalisation rules. This sits in the AI interpretation step (enrichment pipeline), not the matching algorithm.

### 16. ~~Robustness: Data Protection Policy platform update~~ RESOLVED
**Resolved:** Data Protection Policy v3 (March 2026) no longer references WatsonX.

### 17. Transparency: user-facing matching explanation (future consideration)
**Priority:** Low (watch brief)
**Issue:** Users see results but not the logic behind them. Currently defensible (logic is simple), but if matching becomes more sophisticated, a plain-language explanation could strengthen transparency.
**Note:** Not urgent. Parked as a future consideration. Revisit when ranking (item 14) is implemented.

---

## WMCA Reporting and Review Workflow

### 23/28/40. Reporting format and workflow for Eliz
**Priority:** Medium
**Status:** On Matt's to-do list (Apr 2026). Team meeting (31 Mar 2026) has passed — not yet progressed. To be explored as a priority conversation with Eliz.
**Scope:** Three things that converge into one conversation:
1. **Gap reporting** (was item 23): How NO_SUITABLE_PATHWAY signals (zero-match data by category and LA) reach Eliz. Format, frequency, delivery mechanism.
2. **Human review queue** (was item 28): Excel format built and ready (three-tab: Instructions, Review Queue, Summary). Confirming Eliz is the right reviewer, format works for her, delivery frequency.
3. **Gap intelligence reporting** (was item 40): Periodic analysis of accumulated zero-match and click tracking data producing a gap report by category and LA. Depends on session analytics being live.
**Upstream dependencies:** NO_SUITABLE_PATHWAY signal implemented (PR #6). Human review queue Excel built (Mar 2026). Session analytics (items in Future) needed for item 40.
**Note:** Eliz currently maintains a spreadsheet manually. The goal is to understand her current workflow and design SSN's outputs to fit or replace it.

---

## Prevention Pathway

### 24. Prevention pathway — conversational architecture
**Priority:** High (user-facing gap)
**Status:** Design note produced (Prevention Pathway Design Note v1.0, 28 April 2026). Awaiting James review before build begins. Original scoping (profiling-shaped terminal) superseded.
**Design document:** Prevention Pathway Design Note v1.0 — replaces the original `buildPreventionTerminal` scoping. Architecture is a single conversational gate (`PREVENTION_CONVERSATION`) with four routing modes, three governing questions, and a buttons-and-text input pattern at every turn.

**Architecture summary:**
Three governing questions form the routing spine — pathway position (pre-risk, risk-emerging, imminent, post-housing), protective factors (financial, mental health, physical health, housing, safety, access, social), and housing imminency (imminent/not imminent/not sure). These are a technical state model; user-facing wording uses grounded situational language. Questions are asked only when needed — the system asks the minimum to route.

Four routing modes:
- Prevention upstream — no housing in view, factor-specific service cards surfaced
- Prevention at-risk — housing in view but not imminent, factor cards plus universal floor (council, Citizens Advice, Shelter)
- Crisis — imminent housing loss, hands off to existing crisis routing unchanged
- Post-housing — hands off to existing housing pathway unchanged

AI layer is reduced to clarity assessment of free text and phrasebank selection only. All routing follows explicit user input (button or confirmed free text). AI never routes from inference.

Endpoint surfacing: cards alongside the conversation (not a terminal page), collapsible, persistent within the session.

**Implementation phasing (three PRs):**
- Phase 1: Architecture skeleton, button-only. Gate, four-mode state model, three questions, session state extensions, phrasebank library structure, entry/exit/mode transitions wired. No free text, no AI in this phase.
- Phase 2: Free text input with AI clarity check. Clear text routes as equivalent button; unclear text triggers clarification with buttons.
- Phase 3: Conversation polish. Acknowledgement/next-step/clarification libraries, card persistence, step-back if scoped, UI polish, accessibility re-audit.

**Two open questions for James:**
1. Phrasebank library structure — each entry needs user-facing label, technical mapping, and context. Does this live in the existing phrasebank file or alongside it?
2. Mid-conversation step-back — does the append-only `preventionFactorsDisclosed` pattern support revisiting an earlier turn? May defer if loop-back comes naturally from conversation cycling.

**Session state extensions needed:** `preventionPathwayPosition`, `preventionFactorsDisclosed`, `preventionHousingImminency`, `preventionMode`, `preventionFactorsEngaged`, `preventionFactorsDeclined`, `preventionTurnCount`, `preventionExitMode`. Existing prevention fields deprecated.

**Governance documents needed after Phase 1:**
- Prevention Pathway Endpoints Contract (revised — original draft is profiling-shaped, needs rewriting)
- AI Usage Boundaries Contract amendment (real-time clarity assessment and phrasebank selection — Tier 2 with trustee sight)
- Phrasebank library governance note
- VA Analytics Contract amendment (prevention-specific events)
- Safeguarding Contract review (confirm existing mid-conversation triggers cover prevention mode)

**Compatibility:** Crisis gate unchanged. No-typing-required preserved (buttons at every turn). Act-on-stated preserved (AI never routes from inference). Quick route compatible. Mid-conversation safeguarding triggers hold. ChatWidget requires material UI change (conversation foreground, cards alongside). WCAG re-audit needed.

---

## Advice Services Design (new, 10 Mar 2026)

### 30. Advice Services — routing review
**Priority:** Low (watch brief)
**Status:** Parked. Basic subcategory routing implemented in PR #6.
**Issue:** Advice Services was routing to the housing terminal in the original build (and in WatsonX, where it showed financial content under the "Advice Services" label). PR #6 rerouted it to non-housing terminal with a 7-option subcategory selector (benefit, debt, employment, immigration, health, legal, general). Some subcategories overlap with existing specialist pathways (DV, SA, immigration) but those should be caught at crisis gate before reaching Advice Services.
**Future consideration:** Whether any subcategory selections should redirect into existing specialist pathways rather than running a generic service matcher query. Not urgent — current implementation is functional and honest.

---

## Positive Pathway Mapping

**Moved out of VA backlog.** This is a separate exercise, not part of the VA build. Co-design meeting with WMCA scheduled 31 March 2026. Working documents: pathway_mapping_framework.docx, Data_Integrity_and_Prevention_Pathway_Methodology.docx.

---

## Governance Documentation Updates

### 29. ~~Governance Overview v3~~ RESOLVED
**Resolved:** Governance Overview v3.0 produced March 2026.

### 31. ~~Safeguarding Contract — update la-contacts.json reference~~ RESOLVED
**Resolved:** Safeguarding Contract v3.1 (25 Mar 2026). la-contacts.json section replaced with housing-pathway-endpoints.json (safeguarding-relevant scope). Test table rebuilt to 73 tests / 20 paths. Crisis gate implementation status updated. Matt Lee corrected to Matt Lambert. Safeguarding Governance Note v3.2 updated to match.

### 41. WCAG 2.1 AA and accessibility fixes — remaining
**Priority:** Medium
**Status:** 3 critical fixes merged (PR #13, 28 Mar 2026). Remaining fixes to be addressed before launch — on the list.
**Audit scope:** ChatWidget.tsx reviewed against WCAG 2.1 AA, WCAG 2.2 cognitive criteria, W3C COGA, Mencap Easy Read Guidelines, BS 8878:2010.
**Completed (PR #13):** aria-live on message container, dialog role + focus trap + Escape + focus return, send button aria-label.
**Remaining implementation:** Next PR: colour contrast (darker teal), focus states (keyboard visibility), structural (touch targets, headings, ARIA roles). Include item 43 (geolocation fallback) in same PR.
**Additional items for WCAG PR:** Plain English system prompt instruction for conversational LLM output (W3C COGA).
**Governance document:** Accessibility Alignment Note v1.0 (Mar 2026).

### 47. Restart and close buttons: missing `aria-label` and `aria-hidden` on SVG icons
**Priority:** Medium (accessibility follow-up)
**Status:** Completed (PR #15). aria-label="Start new conversation" added to restart button; aria-label="Close assistant" added to close button. All 73 tests pass.
**Issue:** Restart and close buttons have `title` attributes but no `aria-label`. `title` is not reliably announced by screen readers. SVG icons inside those buttons lack `aria-hidden="true"`, so assistive technology may announce icon content. The send button already uses the correct pattern.
**Required:** Add `aria-label` to restart and close buttons. Add `aria-hidden="true"` to their SVG icons. Mirror the send button pattern exactly.
**File:** `components/ChatWidget.tsx`
**Tests needed:** None — straightforward attribute fix. Visual QA against send button pattern is sufficient.
**Note:** Include in the remaining WCAG PR (item 41).

### 48. `governance/selfHarm.test.ts` imports from a non-existent path
**Priority:** Medium (test integrity)
**Status:** Closed — no fix needed. Audit (9 Apr 2026) confirmed the phrasebank import in `__tests__/safeguarding.test.ts` already resolves correctly. The filename in this backlog entry was incorrect; no file named `selfHarm.test.ts` exists in the codebase.
**Issue:** `governance/selfHarm.test.ts` fails because it imports from a path that does not exist. The file cannot run and its coverage is not active.
**Required:** Confirm whether the import path is wrong (source file exists elsewhere) or the source file was never created. Fix the import or create the missing file. Confirm tests pass once resolved.
**Note:** The 73 tests in `tests/safeguarding.test.ts` are unaffected. Test hygiene issue, not an immediate safety gap — but should not be left failing indefinitely.

### 42. Progress acknowledgement after B5
**Priority:** Low
**Status:** Not started. Scoped 12 Mar 2026.
**Issue:** Users go through crisis gate, location, age, gender, and support need before seeing any results. There is no indication of progress or acknowledgement that the end is approaching. For someone in a difficult situation, this can feel like an open-ended interrogation.
**Required:** A single phrasebank line inserted into the flow after B5 (support need selection). At that point the branch is known and the remaining question count is bounded. Something like: "Thanks. Just a couple more questions so I can show you what\u2019s available in your area." One line, no calculation, no dynamic progress bar.
**Implementation:** Phrasebank entry + insertion point in the relevant handler after B5. Copy change, not a feature.
**Note:** The quick route work (item 33) may reduce the number of remaining questions for some users, making this acknowledgement even more accurate. Not dependent on item 33 but complementary.

### 43. Geolocation failure fallback: scalable button-friendly pattern
**Priority:** Medium (include in WCAG PR, item 41)
**Status:** Scoped 12 Mar 2026.
**Issue:** When a user chooses "Share my location" and geolocation fails (denied, unsupported, timeout), ChatWidget.tsx (lines 589-596) handles the failure locally by setting `awaitingPostcode = true`. The user is silently switched from button mode to typing mode. They never chose to type. For someone with motor impairment, low literacy, or situational difficulty, this is a barrier they did not opt into. There is no button option visible to escape.
**Current state (7 LAs):** The state machine has B1_LOCAL_AUTHORITY with 7 LA buttons plus "Other / not sure". Falling back to this would work now.
**At scale (50+ LAs):** A flat list of 50 LA buttons does not work. The fallback needs to scale.

**Required: scalable two-option fallback.** On geolocation failure, present two buttons: "Enter my postcode" and "Select my region." Postcode path is short typing, auto-resolves to LA. Region path is two-step button selection: region first (5-8 buttons: West Midlands, Greater Manchester, etc.), then LA within that region (5-10 buttons). No typing required on the region path.

**Location resolution priority at scale:**
1. Geolocation: one tap, auto-resolves, works at any scale
2. Postcode: short typing, auto-resolves, works at any scale
3. Regional grouping: two button taps, no typing, works at any scale
4. Full LA list: only as a final fallback or browse option

**Implementation:** Move geolocation failure handling from ChatWidget.tsx to the state machine. On failure, state machine routes to a new LOCATION_FALLBACK gate offering the two-option choice. Regional grouping data structure (regions containing LAs) needed as a new data source. Build the scalable version now rather than fixing it twice.
**Note:** The flow audit confirmed two points require typing: LOCATION_POSTCODE (avoidable via other options) and B12A_WHICH_ORG (free-text org name on FULL route only, unavoidable but acceptable). With this fix, no user is ever forced into typing without having chosen it.

---

## Pre-Launch Data Audit (new, 25 Mar 2026)

### 44. Systematic gap audit of enriched services data
**Priority:** High (pre-launch)
**Status:** Complete — coverage review produced 27 March 2026. WMCA Service Coverage Review document circulated. Key findings: 44 services invisible due to category mapping (item 44a below), Walsall navigator phone number fixed (28 Mar), 22 governance review items with Eliz, Sandwell navigator gap confirmed, Solihull thin coverage addressed by cross-boundary work (item 49).
**Output:** WMCA_Service_Coverage_Review_2026-03-27.docx — category x LA heat map and detailed findings per pathway.

### 44a. serviceMatcher.ts category mapping fix
**Priority:** High (pre-launch)
**Status:** In PR #14. Awaiting James review.
**Issue:** `serviceMatcher.ts` category mappings did not align with API category keys for Health and Work. Caused 44 services to be invisible to users selecting those categories at B5.
**Changes (PR #14):** Health now matches `medical` parent plus `support>mental-health` subcategory. Work now matches `employment` parent plus `support>employment` subcategory. New `needSubcategoryConstraints` map prevents pulling unrelated support services. Duplicate `needToCategoryMap` removed from stateMachine.ts.
**Files:** `lib/serviceMatcher.ts`, `lib/stateMachine.ts`
**All 73 tests pass. No routing changes. No safeguarding impact.**

### 44b. Walsall navigator phone number
**Priority:** High (pre-launch, safeguarding-adjacent)
**Status:** Complete (PR #14, commit 1da6fad). Phone number 01922 625687 (Mon-Fri 10am-4pm), Glebe Centre / YMCA Black Country. Verified against primary sources. `phoneHours` renamed to `availabilityNote`; field now wired through to terminal output.

### 44c. Classifier decisions write-back to enriched data file
**Priority:** Medium (pipeline workstream)
**Status:** May be complete — needs verification. Previously blocked pending Eliz's response on the 22-item safeguarding governance review. Not a priority right now.
**Issue:** The safeguarding classifier produced AUTO_VERIFY, AUTO_REJECT and REVIEW verdicts. The 22 REVIEW items require human decisions before classifications can be finalised and written back to the enriched data file.
**Required:** Once Eliz returns decisions, write confirmed classifications back to the enriched services file. Update the baseline snapshot (item 34).
**Blocked by:** Eliz's 22-item governance review (sent 28 Mar 2026).

### 45. Solihull cross-boundary coverage: proof of concept scrape
**Status:** Complete — 28 Mar 2026. 201 candidates checked, 23 findings, 10 HIGH confidence. Approach validated. Full WMCA run completed same day. See item 49.

### Coverage review: pre-launch actions outstanding
**Source:** WMCA Service Coverage Review, 27 March 2026.

**Eliz conversations needed (Monday 31 Mar):**
- Cross-boundary findings review: 88 strong matches across 7 LAs require a decision before anything changes. Eliz Coverage Note v1.0 sent 28 Mar.
- 22-item safeguarding governance review: still outstanding.
- Solihull libraries: all offer free wifi and computer access with no library card needed — not listed on Street Support under Communications. Worth approaching Solihull Council.
- BeeHIVe Project, Dudley: LGBTQ+ support at The What? Centre. Check current listings.
- Gap reporting mechanism, human review queue format, gap intelligence reporting (items 23/28/40 consolidated).
- Veterans and prison/custody listings review.
- Positive Pathway co-design meeting 31 March.

**Future items (from coverage review):**
- Substance misuse pathway: 19 services on Street Support with no VA route to them. Design conversation needed before scoping.
- Ask Marc (Sandwell): DV support for men and forced marriage. Could be added to Sandwell DV entry in a future housing-pathway-endpoints.json update.

---

## Cross-Boundary Coverage (new workstream, 28 Mar 2026)

**Context:** The standard pipeline pulls services within a set distance of each LA's centre point. Services listed under a neighbouring LA that explicitly cover a given area are invisible to users in that area. The cross-boundary checker identifies and surfaces these. Developed outside the repo as a pipeline workstream — same pattern as the enrichment pipeline. Script: `wmca_cross_boundary_checker.py`.

### 49. Cross-boundary checker: integrate as standard pipeline step
**Priority:** High (pipeline workstream)
**Status:** Blocked. Governance question open — requires Data Enrichment Contract amendment and Tier 3 trustee approval before becoming standard pipeline.
**Background:** Script built and full WMCA run completed 28 Mar 2026. Coverage Methodology Note v1.0 sent to James. James confirmed (28 Mar) that website reading (BeautifulSoup scraping of org websites) crosses the agreed data source boundary in the Data Enrichment Contract, which restricts enrichment to SSN API endpoints only. The boundary was not checked before building. James is open to website reading as a governed exception for coverage checking specifically, with the mitigations described, but requires it to go through properly.
**What exists:** `wmca_cross_boundary_checker.py` — paginated fetch, 5km baseline vs 20km expanded radius, SSN description and website text checked for coverage signals, HIGH/MEDIUM/LOW confidence classification, structured review queue output. Run results: 374 findings, 88 strong matches across 7 LAs.
**Governance path required:**
1. Data Enrichment Contract amended to include website reading as a defined, bounded exception for coverage checking — with specific constraints (rate limiting, self-identification, read-only, no storage, coverage checking only)
2. Amendment reviewed and approved at Tier 3 (trustees) per Governance Decision Framework
3. AI Governance Plan checked for whether a new data source requires flagging under that document
4. Once approved: checker documented as a required pre-rollout step in item 54
**The findings (88 strong matches) remain valid** and can go to Eliz for review — the governance question is about whether website reading becomes standard pipeline methodology, not about whether the findings have value.
**Depends on:** Items 50 (contract amendment), Tier 3 trustee sign-off.

### 50. Data Enrichment Contract: amendment for website reading
**Priority:** High (governance — blocks item 49)
**Status:** Not started. Required before the cross-boundary checker can become standard pipeline.
**Required:** Draft an amendment to the Data Enrichment Contract v2 covering website reading as a defined, bounded exception for coverage checking. Amendment must specify: permitted use (coverage checking only, not general enrichment), technical constraints (rate-limited, self-identifying User-Agent, read-only, no storage of website content), confidence classification requirement (website-only findings flagged as such), human review requirement (nothing from website signals enters the VA without a recorded human decision), and review cadence.
**Then:** Data Integrity Methodology document updated from v2.2 to v3.0 to reflect the cross-boundary checker as an approved pipeline step (once amendment is signed off).
**Decision tier:** Tier 3 (trustees) per Governance Decision Framework. Change to a governing principle — the data source boundary defined in the Data Enrichment Contract.
**Depends on:** Contract drafted → James reviews → trustee sign-off (Catherine) → methodology updated.

### 51. Pipeline orchestration: sequenced workflow for multi-area operation
**Priority:** Medium (future workstream)
**Status:** Scoped 28 Mar 2026. Not a near-term item.
**Context:** The pipeline now has four steps that follow the same pattern: automation does the analytical work, findings go to a human reviewer, decisions are recorded. Scraper, cross-boundary checker, enrichment pipeline and validation workflow all work this way, but currently require manual handoffs between each step. At seven LAs running weekly this is manageable manually. At thirty or more LAs it is not.
**Required:** An orchestrated workflow that runs all four steps in sequence, pauses at each decision point, and resumes once decisions are recorded. Follows the same governing pattern throughout: automation surfaces, humans decide, decisions are recorded.
**Trigger for scoping:** When SSN expands to a second geography, or when the manual process becomes a bottleneck. Not a near-term item for WMCA alone.
**Note:** The scraper already paginates the service-providers endpoint. Pagination of the expanded radius pull (now built into the cross-boundary checker) is the same pattern. An orchestration layer handles this cleanly at scale.

### 52. "Judgment stays with people" — governing principle for trustee consideration
**Priority:** Medium (governance)
**Status:** Drafted 28 Mar 2026. Raise with James as aside in covering email. Then Catherine for trustee consideration as a proposed addition to the governing principles.
**Draft text:** Tasks can be delegated. Judgment cannot. The responsibility to weigh a situation, hold uncertainty and decide with full awareness of the consequences stays with the people accountable for it. This applies to consultants, to management recommendations and to AI. AI can prepare the ground for a decision: surfacing what needs thinking about, making assumptions visible, presenting what the evidence does and does not show. What it cannot do is make the judgment itself. AI should not tell boards what to think. It should help them see what needs thinking about before they decide.
**Context:** This is a governance principle that predates AI — applies to consultants and management as much as to AI. The AI application is one instance. Already implemented in practice throughout the pipeline and classifier workflow. Not yet surfaced to the board as a named principle. Would sit after "AI supports, people decide" in the governing principles framework.
**Sequence:** James (aside in email) → Catherine (informal) → board consideration alongside the principles not yet formally adopted.

### 53. Slug consistency investigation
**Priority:** Low (pipeline workstream)
**Status:** Noted 28 Mar 2026. Not started.
**Issue:** Org slugs from `/api/services` do not consistently match those from `/api/service-providers`. The published-org filter in the cross-boundary checker was removed because of this mismatch — unpublished orgs may appear in candidate sets, requiring manual filtering at review. Eliz's review will catch most of these in practice (she will know whether an org is active and listed), but the underlying inconsistency needs investigating before the checker becomes a standard pipeline step.
**Next step:** Sample a handful of mismatches, check against SSN platform admin, determine whether it is a data quality issue, a different identifier, or expected API behaviour.

### 54. Item 36 update: add cross-boundary check as required onboarding step
**Priority:** Medium (governance, follows from item 49)
**Status:** Not started. Update item 36 (new location onboarding procedure) once James approves item 49. Cross-boundary check sits between Step 2 (scraper run) and Step 3 (enrichment pipeline run) in the procedure.

---

### 55. Financial category: constrain unconstrained `support` mapping
**Priority:** Low (follow-up to PR #14)
**Status:** Complete — PR #18 merged 29 Apr 2026.

### 56. Missing `CRISIS_FIRE_FLOOD_LOCATION` phrasebank entry
**Priority:** Medium (safeguarding-adjacent)
**Status:** Complete — PR #18 merged 29 Apr 2026. `CRISIS_FIRE_FLOOD_LOCATION` and `CRISIS_FIRE_FLOOD_LOCATION__SUPPORTER` added to `lib/phrasebank.ts`.

### 57. Under-16 exit: supporter and professional pathway review
**Priority:** High (safeguarding)
**Status:** In progress — 30 Apr 2026. Mechanical changes built (PR #19). Language review document produced and with James for sign-off. PR #20 will implement language changes once approved.
**Work completed:**
- GATE0 case 2 `safeguardingTriggered` fix — built in PR #19
- Phrasebank selector widened to support `__PROFESSIONAL` variant — built in PR #19
- `B2_WHO_FOR` audit confirmed `userType` stored as `'SUPPORTER'` or `'PROFESSIONAL'` — distinction exists in session state, unused downstream
- Supporter and Professional Language Review v1.0 document produced — with James for sign-off
**Language changes proposed (pending James sign-off):**
- `UNDER16_INTERCEPT_PREFIX__SUPPORTER` updated; `__PROFESSIONAL` added
- `CRISIS_UNDER16_LOCATION__SUPPORTER` updated; `__PROFESSIONAL` added
- `CRISIS_UNDER16_SOMEWHERE_ELSE__SUPPORTER` updated; `__PROFESSIONAL` added
- `buildUnder16Exit` professional branch added
- DV exits: all `__SUPPORTER` openers updated; `__PROFESSIONAL` variants added
- SA exits: all `__SUPPORTER` openers updated; `__PROFESSIONAL` variants added
- `SELF_HARM_EXIT__SUPPORTER` updated; `__PROFESSIONAL` added
**Depends on:** James language sign-off → PR #20

### 58. Location gate fires too late in the flow
**Priority:** Medium
**Status:** Resolved in PR #16 (15 Apr 2026). Location gate moved immediately after GATE0_CRISIS_DANGER — LA is now known before profiling begins. Restores original WatsonX design. GATE2 and GATE1_INTENT choice 3 updated to skip redundant location routing.

### 59. stateUpdates propagation bug in B5 profiling handlers
**Priority:** Low
**Status:** Known. Flagged in PR #17 build (15 Apr 2026), visible to James via backlog in PR #18. Not yet built.
**Issue:** Four B5 profiling handlers return `routeToNextProfileQuestion()` directly without wrapping `stateUpdates`. The field just collected is not propagated back to the actual session via `stateUpdates`.
**Affected handlers:** `ageCategory`, `gender`, `criminalConvictions`, `hasChildren`.
**Working correctly:** `lgbtq`, `lgbtqServicePreference`, `immigrationStatus`, `publicFunds`.
**Required:** Wrap the four affected handlers to include the just-collected field in `stateUpdates`, mirroring the `lgbtq` handler pattern. Low risk, isolated change.

### 67. GATE0 end-to-end phrasebank regression test
**Priority:** Low
**Status:** Not started. Flagged by James in PR #18 review (29 Apr 2026).
**Issue:** The missing `CRISIS_FIRE_FLOOD_LOCATION` phrasebank entry (item 56) slipped past CI because existing fire/flood tests all start sessions at `CRISIS_FIRE_FLOOD_LOCATION` directly, bypassing the GATE0 → option 6 path. The same class of bug could recur for any safeguarding-adjacent phrase added to phrasebank without a full-path test.
**Required:** Add a regression test that starts at GATE0, selects option 6 (fire/flood), and asserts the rendered response does not contain `[Missing phrase:`. Low effort, high protective value for this class of bug. Candidate for next tidy-up PR.
**Files:** `__tests__/safeguarding.test.ts`

### 68. Lift profile field union to shared type alias
**Priority:** Low
**Status:** Not started. Flagged by James in PR #18 review (29 Apr 2026).
**Issue:** `needProfileRequirements` is typed as `Record<string, string[]>`, so a typo in any requirements array (e.g. `'agee'`) would silently produce a never-matching branch in `routeToNextProfileQuestion`. The `after` param union (`'age' | 'gender' | 'lgbtq' | 'convictions' | 'nrpf' | 'children'`) is defined inline on the function signature. Lifting this to a shared type alias and reusing it on both `needProfileRequirements` and the `after` param would give compile-time protection on both.
**Required:** Extract the union to a named type (e.g. `ProfileField`), apply it to both the `after` param and the `needProfileRequirements` value type. Small ergonomics change — same protective benefit as PR #18's union typing, extended to the requirements array.
**Files:** `lib/stateMachine.ts`

### 69. Supporter and professional language review — full VA audit
**Priority:** Medium
**Status:** Not started. Identified 29 Apr 2026 during item 57 (under-16 supporter pathway) work.
**Issue:** `isSupporter` collapses informal supporters and professionals into a single boolean, and phrasebank has only one `__SUPPORTER` variant per key. The distinction between an informal supporter (friend, family member) and a professional (social worker, housing worker, teacher) is meaningful — particularly in safeguarding exits where professionals have statutory reporting obligations that the VA should acknowledge. The under-16 path is being addressed in PR #19, but the same gap exists across DV, self-harm, and the wider conversation flow.
**Scope of full review:**
- DV exits: supporter/professional variants
- Self-harm exits: supporter/professional variants (highest risk — professional has duty of care obligations)
- Profiling gates: B5 questions asked on behalf of someone else read oddly ("Are you pregnant?")
- Terminal outputs: "here are services for you" framing wrong in supporter/professional mode
- General conversational framing throughout: PREFERRED_NAME_ASK, GATE2_ROUTE_SELECTION, B2_WHO_FOR follow-up
**Prerequisite:** Item 60 (B2_WHO_FOR follow-up gates for org type and relationship) should be built first so professional/supporter distinction is available downstream.
**Approach:** Design note recommended before build — scope is wide enough that a systematic approach is better than piecemeal fixes.
**Files:** `lib/phrasebank.ts`, `lib/handlers/`, `lib/stateMachine.ts`

### 60. B2_WHO_FOR: capture professional organisation type, supporter relationship, and person's name
**Priority:** Medium
**Status:** Not started. Identified during WatsonX audit 15 Apr 2026.
**Issue:** WatsonX asked professionals who they work for (Council, Street Outreach, Police, Local third sector), asked supporters their relationship to the person (family member, friend, member of public), and collected both the helper's name and the name of the person being helped. The new system records SUPPORTER or PROFESSIONAL but captures none of this. Relationship type will become load-bearing when the supporter route connects to prevention pathways.
**Required:**
- After B2_WHO_FOR selects PROFESSIONAL: add follow-up gate asking organisation type. Options: Council, Street outreach, Police, Local third sector organisation, Other.
- After B2_WHO_FOR selects SUPPORTER: add follow-up gate asking relationship. Options: Family member, Friend, Member of the public (concerned citizen).
- In supporter mode: after PREFERRED_NAME_ASK (helper's name), add a second name ask for the person being helped. WatsonX phrasing: "Hi [name], can I also ask what they want to be known as?"
- All answers stored on session state and available for downstream routing decisions.
- Professional and relationship gates not shown for SELF selection.
**Files:** stateMachine.ts, types.ts, phrasebank.ts
**Note:** Relationship type will become load-bearing when prevention pathway routing is extended to supporters. Do not defer this past prevention pathway build.
**Source:** WatsonX audit 15 Apr 2026 — restoration of functionality present in Self-Service action.
**Tests needed:** Professional selection followed by org type gate; supporter selection followed by relationship gate and second name ask; self selection skips all three.

### 61. Crisis gate option 7: soften label
**Priority:** Low
**Status:** Not started. Identified during WatsonX audit 15 Apr 2026.
**Issue:** Option 7 on GATE0_CRISIS_DANGER currently reads "None of these." This is functional but cold. Someone in difficulty who does not fit options 1-6 may feel their situation is being dismissed. WatsonX used "No, I am not in immediate danger."
**Required:** Change label to "I'm not in immediate danger" or equivalent. No routing change — phrasebank edit only. Tier 2.
**Files:** lib/phrasebank.ts
**Source:** WatsonX audit 15 Apr 2026.
**Tests needed:** Crisis gate option 7 position unchanged; routing unchanged.

### 62. GATE2_ROUTE_SELECTION phrasebank: incomplete assumptions list
**Priority:** Medium
**Status:** Not started. Identified during WatsonX audit 15 Apr 2026 — confirmed via Claude Code phrasebank check.
**Issue:** The quick route assumes a set of factors do not apply to the user. The current phrasebank entry lists: health conditions, immigration status, criminal convictions, and "other circumstances." Three factors present in the WatsonX assumption list are absent: pregnant or has children/dependents, LGBTQ+ identity, care leaver (young person previously looked after). A user choosing the quick route would not know they are opting out of LGBTQ+ specialist services, priority need framing for pregnancy and children, or care leaver pathways. The "things like" softening does not cover this — these are material omissions.
**Required:** Add the three missing items to the phrasebank text so the assumptions list is complete. User must have informed consent before choosing the quick route.
**Files:** lib/phrasebank.ts (GATE2_ROUTE_SELECTION entry)
**Source:** WatsonX audit 15 Apr 2026. WatsonX explicitly listed: health concerns, immigration not straightforward, pregnant or has children, LGBTQ+, previous convictions, young person 16-20 previously looked after.
**Tests needed:** No routing change — phrasebank edit only. No new tests required.

### 63. GATE2_ROUTE_SELECTION: missing supporter variant
**Priority:** Low
**Status:** Not started. Identified during WatsonX audit 15 Apr 2026 — confirmed via Claude Code phrasebank check.
**Issue:** `GATE2_ROUTE_SELECTION__SUPPORTER` does not exist in phrasebank.ts. The gate falls back to the non-supporter version, which uses "you" throughout. In supporter mode this is incorrect — the language should reflect that the route choice applies to the person being helped, not the supporter.
**Required:** Add `GATE2_ROUTE_SELECTION__SUPPORTER` to phrasebank.ts with supporter-appropriate language.
**Files:** lib/phrasebank.ts
**Source:** WatsonX audit 15 Apr 2026.
**Tests needed:** Supporter mode GATE2 uses supporter variant.

### 64. B9_REASON: add Section 21 as a named option
**Priority:** Medium
**Status:** Not started. Identified during WatsonX audit 15 Apr 2026 — confirmed via Claude Code handler check.
**Issue:** WatsonX had "Section 21 notice (eviction)" as an explicit reason option. The new system has "End of tenancy" which is broader and loses legal specificity. A Section 21 is a no-fault eviction with specific legal protections and prevention advice — a tenant in that situation has different rights and different advice available than someone whose tenancy ended through other means. The prevention advice pathway has Section 21-specific content that should be reachable from B9.
**Required:** Add "Section 21 notice" as a named option alongside "End of tenancy" (or replace it). Ensure the Section 21 option routes to Section 21-specific prevention advice. Verify against the prevention terminal design to confirm the downstream advice content exists.
**Files:** lib/handlers/homeless.ts (handleB9Reason), lib/phrasebank.ts
**Source:** WatsonX audit 15 Apr 2026 — restoration of WatsonX option.
**Tests needed:** Section 21 selection reaches Section 21-specific advice; other end-of-tenancy reasons do not.

### 65. Hospital/Prison/Rehab: sleeping situation pathway
**Priority:** Medium (pre-launch)
**Status:** Not started. Identified during WatsonX audit 15 Apr 2026.
**Issue:** WatsonX had "Hospital/Prison/Rehab" as a named sleeping situation option. The new system has no equivalent — these users would currently select "Other temp" and receive generic output. Each sub-population has specific needs and specific provision: prison leavers have through-the-gate services and a housing duty under the Homelessness Reduction Act 2017; hospital discharge has specific local provision (P3 hospital discharge service); rehab has specific recovery housing needs. These warrant dedicated routing and terminal content.
**Required:** Design decision needed on whether this is one option or three. Add as named sleeping situation option(s). Design routing and terminal content for each pathway. P3 is a confirmed local provider for hospital discharge — verify current referral details before adding to endpoints file. Prison leavers and rehab need equivalent endpoint research.
**Files:** stateMachine.ts, lib/phrasebank.ts, housing-pathway-endpoints.json
**Source:** WatsonX audit 15 Apr 2026 — restoration and extension of WatsonX option.
**Governance check required:** New pathway endpoints require Housing Pathway Endpoints Contract review before build.
**Tests needed:** Hospital/prison/rehab selection reaches appropriate pathway; does not reach generic rough sleeping output.

### 66. B9_REASON: sleeping options — vehicle and tent/campsite
**Priority:** Low
**Status:** Not started. Identified during WatsonX audit 15 Apr 2026.
**Issue:** WatsonX had "In a vehicle" and "Tent or campsite" as distinct sleeping situation options. The new system collapses these under "Rough sleeping." For routing purposes this is acceptable — both trigger StreetLink and route to the rough sleeping output. The issue is phrasebank: "Rough sleeping" as a label does not make clear to a user in a van or tent that it applies to them. They may not select it.
**Required:** Phrasebank edit only — update the "Rough sleeping" option label or description to make clear it includes vehicle, tent, and outdoor/improvised accommodation. No routing change needed.
**Files:** lib/phrasebank.ts
**Source:** WatsonX audit 15 Apr 2026.
**Tests needed:** No routing change — phrasebank edit only.

---

### Session analytics, click tracking, and CSV storage (pre-launch)
**Priority:** High (pre-launch)
Implement analytics event logging per Analytics Contract. CSV storage for aggregate reporting.

**Card expand tracking on terminal outputs (12 Mar 2026 design):**

The current `ServiceCardComponent` in `ChatWidget.tsx` (lines 356-447) shows all card content inline: badges, org name, phone, website, description all visible immediately. This means there is no user action to track — everything is passively displayed.

The revised design: cards show badges, org name, and a one-line description only. Phone number, website, and full description are hidden until the user taps the card to expand it. That expand action is the primary trackable event, works identically on mobile and desktop, and is a stronger signal than passive display.

**Why this is better than tracking link clicks alone:** On desktop, users read phone numbers off the screen and dial on their mobile — no click event fires. The expand pattern captures engagement regardless of how the user then contacts the service. If they expanded the card, they engaged with that service.

**Event structure:** `{ event: 'SERVICE_EXPAND', category, la, org_name, service_name, section_header, position }`. Position is the card's index within its section. Section header tracks which group the service was in (e.g. "Your First Step", "Local Support", "Specialist Support").

**Secondary events (phone/website clicks within expanded cards):** `{ event: 'SERVICE_CLICK', category, la, org_name, service_name, link_type: 'phone' | 'website', position }`. These fire when the user taps a `tel:` link or outbound website link. Partial signal (desktop phone reads are invisible) but still useful alongside expand data.

**Card design considerations:**
- All cards same size in collapsed state — reinforces neutral infrastructure principle (no service visually privileged over another)
- User's choice of which card to expand is their prioritisation, not ours
- If only one service matched: still use expand pattern (consistency, and the expand is still a meaningful "yes I want this" signal)
- National floor (e.g. Shelter helpline): visually distinct card style or position (always last, slightly different appearance) but same expand pattern — trackable, tells you whether users are falling through to the floor because local matches aren't right

**What the data gives you:**
- Which services people choose to explore (card expanded) vs ignore (never expanded)
- Whether people explore one option and stop, or scan several
- National floor expand rate vs matched services
- Per-LA, per-category engagement patterns
- Combined with zero-match data: where do results exist but nobody engages with them?

**Implementation:** Change to `ServiceCardComponent` in `ChatWidget.tsx`. Collapse phone, website, full description behind an expand toggle. Add state tracking per card. Fire analytics event on expand. No changes to routing, terminal building, phrasebank, or `parseServiceContent` — the data flowing into cards stays the same, only presentation changes.

**Governance note:** Including org/service name in events is a deliberate design decision (12 Mar 2026). It does not identify individuals (no PII, no session linkage) but does give per-service engagement data. The Analytics Contract should be updated to explicitly permit service-level engagement tracking when this is built.

### Feedback mechanism — user outcome data
**Approach (25 Mar 2026):** Lowest effort on user's behalf. Card expand tracking (above) is the primary feedback signal — fully automated, no user action beyond what they'd already do. Direct user feedback is sparse in crisis contexts and should not be depended on as the primary quality signal. Partner feedback (asking receiving organisations whether referrals are appropriate) is the longer-term reliable channel but requires organisational relationships.
Governed by Analytics Contract scope.

### 39. Weekly pipeline run cadence
**Priority:** Medium (operational)
**Status:** Not started. Scoped 12 Mar 2026.
**Required:** The scraper and enrichment pipeline run weekly on an automated schedule. The validation workflow (item 35) runs on the output. If nothing in the SSN data has changed, the regression check passes clean and no human action is needed. If services have been added, removed, or changed, the validation report flags what's different and the operator reviews.

**Rationale:** The cost of running is near-zero. The cost of stale data reaching a vulnerable person is not. Weekly cadence ensures data freshness is measured in days not months.

**Implementation:** Cron job or scheduled GitHub Action (once the pipeline has a repo). Runs scraper, then pipeline, then validation script. Emails the validation report summary to Matt. Full report saved alongside pipeline output for audit.

**Contact data verification (separate cadence):** `housing-pathway-endpoints.json` and `safeguarding-endpoints.json` contain council phone numbers and crisis line numbers verified against primary sources. These do not come from the pipeline — they are manually curated. A six-monthly verification check against council websites catches reorganisations and number changes. Add to the Data Enrichment Contract as an operational requirement.

**Governance home:** Data Enrichment Contract, operational requirements section.

### Extract shared dependencies
`buildTerminalServices` and `routeToNextProfileQuestion` need extracting to shared modules to unblock B5, B7, B7A handler extraction from stateMachine.ts.

### Internal SSN links and opening times for matched services
When the service matcher returns results from enriched data, terminal outputs should link to the org's SSN page (using org slug to construct URL) and surface opening times where available. The scraper currently does not capture `access` or `opening_times` from the API; these fields need adding to `parse_service()` before opening times can flow through to the VA.
**Parked until:** Service matcher and enrichment pipeline are active and wired into the VA.
**Depends on:** Pipeline integration, service matcher wiring.

### Veterans / ex-forces housing pathway
**Priority:** Medium (blocked on platform listings)
**Status:** Org research complete 25 Mar 2026. Platform listings review sent to Eliz. Blocked on her response before VA pathway can be built.
**Profiling question:** "Have you, or a close family member, served in the UK Armed Forces?" Family included because Armed Forces Covenant covers families and services (SSAFA, Haig Housing) accept family referrals. Asked only on housing pathway where the answer changes services shown.

**Platform audit (25 Mar 2026):** Searched all 936 enriched services. Only one dedicated veteran org on SSN: Royal British Legion covering Solihull and Wolverhampton. No SSAFA, no Op FORTITUDE, no Stoll, no Haig Housing.

**National landscape changes since 2020 WMCA report:**
- Veterans Gateway website retired September 2025; users redirected to GOV.UK
- VALOUR network announced November 2025: £50m for regional veteran support centres (housing, employment, health, welfare)
- Op FORTITUDE is now the government's single referral pathway for veteran homelessness (0800 952 0774, 24 hours, run by Riverside). Nearly 200 veterans housed and 400 into emergency accommodation in first nine months.
- Local connection exemption now statutory (November 2024) — veterans exempt from local connection rules for social housing

**Orgs for platform listing (pending Eliz review):** Op FORTITUDE, SSAFA (0800 260 6767), Stoll (supported housing + Veterans' Nomination Scheme), Haig Housing (1,500+ properties). RBL to expand from 2 LAs to all 7.

**VA pathway routing (when listings confirmed):** Op FORTITUDE as primary referral, SSAFA, council Housing Options with veteran-specific framing (local connection exemption, priority need factors), local veteran orgs from service matcher, Shelter as floor.

**Advice content:** One advice listing covering veteran housing rights — Armed Forces Covenant, priority need, local connection exemption, Defence Transition Service, Veterans' Nomination Scheme. Enough for someone in crisis to know their rights and reach the right channels.

**Research foundation (1 Mar 2026):** WMCA "Designing Out Veterans' Homelessness" report (2020). 21,661 working age veterans across seven WMCA LAs. North Warwickshire case study: 3 to 36 veteran housing cases in 4 months when dedicated worker introduced (suppressed demand).

### Prison / custody release housing pathway
**Priority:** Medium (blocked on platform listings)
**Status:** Org research complete 25 Mar 2026. Platform listings review sent to Eliz. Blocked on her response before VA pathway can be built. Some orgs may be affected by exempt accommodation regulatory concerns.
**Profiling question:** "Are you currently on probation, or have you recently been released from prison or custody?" Asked only on housing pathway where the answer changes services shown.

**Platform audit (25 Mar 2026):** Searched all 936 enriched services. Found 7 dedicated ex-offender services: Anawim (Birmingham, women), Birmingham Mind (Birmingham, all), WAITS (Birmingham, women), St Giles Trust Reflections (Coventry, women), Black Country Women's Aid New Chance (Dudley/Sandwell, women), Dudley Youth Justice (Dudley, young people), Coventry City Council (Coventry, all). Coverage gaps: 5 of 7 services are women-only; no dedicated provision for men in Walsall, Wolverhampton or Solihull.

**Orgs for platform listing (pending Eliz review):** Yellow Ribbon (mentoring + accommodation, Staffs/WM/Shrops), NACRO Accommodation Advice (WM, MOJ Dynamic Framework), Aspire Supported Living CIC (Birmingham, mixed quality feedback — raise verbally), CAS-3 / The Housing Network (84-night temp accommodation, government-commissioned — signpost or listing?), Langley Trust (national, specialist accommodation for people with convictions — needs verifying as general referral).

**VA pathway routing (when listings confirmed):** Dedicated ex-offender services from service matcher (category support > ex-offender), council Housing Options, Shelter as floor. Key complicating factor to surface (not assess): licence conditions may restrict where someone can live.

**Advice content:** One advice listing covering prison release housing rights — duty to refer, council obligations, maintaining tenancy during sentence, CAS-3 temporary accommodation. Enough for someone to know what to do and who to contact.

### Care leavers: extend pathway from 20 to 24
**Background:** Legal check (Feb 2026) confirmed care leaver housing entitlements continue beyond 20 but weaken:
- 18–20: Automatic priority need. Children's Services duty to accommodate (s.23C Children Act 1989). Current routing correct.
- 21–24: Right to advice, support, and a Personal Adviser on request (s.23CZB Children and Social Work Act 2017). Duty to accommodate only if in full-time education/training (s.23CA) or assessed as vulnerable. No automatic accommodation right.
- 25+: Leaving care housing duties end.

**Required:** Extend `previously_looked_after` pathway to age 24. Age-differentiated messaging: 18–20 message implies stronger entitlement; 21–24 message should frame as "you may be entitled to support and a Personal Adviser from Children's Services — contact them to explore your options." VA does not assess vulnerability or education status.

**Legislation update (25 Mar 2026):** Children's Wellbeing and Schools Bill completed Lords third reading 10 March 2026. Returned to Commons for consideration of Lords amendments (25 March 2026 event). Royal Assent likely within weeks. Key provision: care leavers aged 25 and under cannot be classed as intentionally homeless. Also introduces Staying Close duty and expands local offers to include financial support. Pathway messaging will need updating when enacted.
**Governance trigger:** Bill receiving Royal Assent → review pathway messaging, update platform advice content, update Safeguarding Contract if routing changes.
**Advice content:** One advice listing covering care leaver housing rights at each age bracket. Update when legislation takes effect.

### Enrichment-aware safeguarding
When enriched eligibility data is in use, confidence levels must influence language. Parked in Safeguarding Contract pending enrichment going live.

### Governance enhancements (from Jannaways audit)
1. Contestability position statement (Principle 9)
2. External feedback routes (Principles 9, 15)
3. Active fairness review of gender/age exclusions (Principle 13)

---

## Completed

| Item | Date |
|------|------|
| PR #1: Jest test infrastructure and safeguarding test suite | Feb 6 |
| PR #2: CI workflow (GitHub Actions, runs on PRs to main and staging) | Feb 6 |
| Safeguarding Contract updated (77 to 29 tests, accurate table) | Feb 6 |
| Governance consistency audit | Feb 6 |
| Handler extraction to domain modules with shared.ts | Feb 9 (PR #3 merged) |
| Edge cases audit on enrichment pipeline (263 orgs / 294 services) | Feb 9 |
| Profiling.ts docstring correction | Feb 10 |
| Watsonx contact data audit (verified all 7 LAs against council websites) | Feb 10 |
| Watsonx file contact data fixes (Sandwell DV, Walsall OOH, labels, typos) | Feb 10 |
| BYOCAI v3 audit and deployment files finalised | Feb 2026 |
| LGBTQ+ classifier fix (allowlist approach, 233 → 0 false positives) | Feb 28 |
| Safeguarding field classifier built (review queue 117 → 14 items) | Feb 28 |
| Enrichment pipeline v3.1 run: 936 services, 69 AUTO_VERIFY, 9 AUTO_REJECT, 22 review | Feb 28 |
| DV completeness check: 25 DV specialists identified across 7 LAs | Feb 28 |
| ADR-001 v1.1: Guaranteed Floor + Dynamic Matching Pattern | Feb 28 |
| Non-Housing Pathway Endpoints Contract v1.0 | Feb 28 |
| housing-pathway-endpoints.json built and audited (7 LAs, all slots filled, 2 fixes applied) | Feb 28 (afternoon) |
| la-contacts.json built and audited (7 LAs, Walsall Children's OOH added from primary source) | Feb 28 (afternoon) |
| safeguarding-endpoints.json audited against original file — confirmed complete, richer than rebuild | Feb 28 (afternoon) |
| Full cross-file audit: 14/14 shared numbers consistent across all three files | Feb 28 (afternoon) |
| PR #4: Comprehensive feedback resolution | Feb 2026 |
| JSON wiring: housing-pathway-endpoints.json into serviceMatcher (navigator, DV, immigration orgs) | Mar 2 (PR #5) |
| JSON wiring: safeguarding-endpoints.json into crisis.ts (SARC, DV crisis lines, CYPSAS) | Mar 2 (PR #5) |
| profile.dv wired from session safeguarding state (dvDisclosed removed, simplified) | Mar 2 (PR #5) |
| B1 (local immigration org by LA) complete via standalone getImmigrationOrgs() | Mar 2 (PR #5) |
| Crisis gate reordering: James sign-off received | Mar 2 |
| Mid-conversation age detection: direction of travel approved by James | Mar 2 |
| PR #5 review feedback resolved: isDropIn from JSON, P3 Coventry verified, Blue Sky Centre null, TypeScript interfaces | Mar 5 |
| Governance document audit (5 Mar 2026): version conflicts identified and resolved | Mar 5 |
| Safeguarding Contract v3.0 | Mar 5 |
| Safeguarding Governance Note v3.0 | Mar 5 |
| Service Matching Contract v2.0 (incorporates ADR-001 content) | Mar 5 |
| Service Matching Note v2.0 (ADR-001 retired) | Mar 5 |
| Data Enrichment Contract v2.0 confirmed as current version | Mar 5 |
| PR #5 merged | Mar 10 |
| Item 4: Crisis gate reordered (danger first, under-16 second) — test assertions updated | Mar 10 (PR #6) |
| Item 1c: la-contacts.json consolidated into housing-pathway-endpoints.json — single source of truth | Mar 10 (PR #6) |
| Item B2: Shelter DV housing advice link added to all 12 DV exits (was female-only) | Mar 10 (PR #6) |
| Item B3: 16-17 in care — Children's Services re-surfaced as escalation path with duty team framing, navigator orgs as secondary support, Childline fallback for LAs without navigator | Mar 10 (PR #6) |
| Navigator orgs age-filtered — 16-17 no longer sees adult-only orgs (SIFA Fireside, P3 Coventry) | Mar 10 (PR #6) |
| isDropIn sourced from JSON for navigator orgs — Lighthouse Dudley set false per restricted hours | Mar 10 (PR #6) |
| Advice Services rerouted from housing terminal to non-housing with 7-option subcategory selector | Mar 10 (PR #6) |
| nationalFallbacks aligned to contract typology: Trussell Trust removed from Food (Type A), Turn2Us split with specific page links for Financial, NCS removed from Work, Citizens Advice confirmed for Advice | Mar 10 (PR #6) |
| Item 5: buildZeroMatchTerminal with honest acknowledgement (Type A), national floors (Type B/C), SSN browse link | Mar 10 (PR #6) |
| Item 6: Need-aware fallback phrasebank content for all category types | Mar 10 (PR #6) |
| Item 7: NO_SUITABLE_PATHWAY analytics signal emitted on zero-match | Mar 10 (PR #6) |
| Items 18/19/20: National floors wired for Type B (NHS 111, Turn2Us, Citizens Advice) and Type C (Jobcentre Plus, NCS). Type A honest acknowledgement implemented. | Mar 10 (PR #6) |
| Item 21: LGBTQ+ Health modifier — LGBT Foundation surfaced alongside NHS 111 for LGBTQ+ users | Mar 10 (PR #6) |
| Item A1: Pregnancy wired as equivalent to hasChildren for routing (DV exits, prevention escalation, service matching) | Mar 10 (PR #6) |
| Item A2: NRPF + children — Children's Services with Section 17 framing, Project 17, Migrant Help | Mar 10 (PR #6) |
| Item 8: Housing navigation pivot — effectively complete, all 7 WMCA LAs have specific Housing Options data. Generic fallback is defensive code for non-WMCA users only. | Mar 10 |
| PR #6 merged: 12 commits, 48 tests. Crisis gate reorder, la-contacts consolidation, DV exits, navigator age filtering, advice subcategories, zero-match handling, pregnancy routing, NRPF+children, LGBTQ+ Health modifier. | Mar 11 |
| PR #7 merged then reverted (PR #8): gate bug fixes, Article 9 consent, immigration status, LGBTQ+ specialist preference. Content resubmitted in PR #9 with fixes. | Mar 12 |
| PR #9 merged: gate bug fix, Article 9 consent, immigration status flow, LGBTQ+ specialist preference, early flow gates, housing options involvement. 63 tests. | Mar 2026 |
| PR #10 merged: lint fixes | Mar 2026 |
| PRs #11 and #12 cancelled by James — work already on main via PRs #9 and #10 | Mar 2026 |
| Item 32+33: Gate bug investigation — null/undefined checks were already correct (== null throughout). hasChildren infinite loop found and fixed (PR #13). Quick route already built and functional. | Mar 25 |
| Item 16: Data Protection Policy v3 — no longer references WatsonX | Mar 25 |
| Item 29: Governance Overview v3.0 produced | Mar 2026 |
| Item 31: Safeguarding Contract v3.1 — la-contacts.json reference replaced with housing-pathway-endpoints.json, test table rebuilt (73/20), crisis gate status updated, Matt Lee corrected to Matt Lambert | Mar 25 |
| Safeguarding Governance Note v3.2 — test table rebuilt (73/20), contract reference updated to v3.1 | Mar 25 |
| WCAG critical fixes: aria-live, dialog role + focus trap, send button label (PR #13, merged 28 Mar 2026) | Mar 28 |
| AI Governance Plan v2 produced | Mar 2026 |
| AI Policy v3 produced | Mar 2026 |
| Data Protection Policy v3 produced | Mar 2026 |
| Safeguarding Policy v1 produced (draft for board) | Mar 2026 |
| Terms and Conditions v2 produced | Mar 2026 |
| Board paper on AI use and human judgement governance prepared for 26 Mar trustee meeting | Mar 25 |
| Veterans pathway org research: Op FORTITUDE, SSAFA, Stoll, Haig Housing identified. Platform audit: RBL only org (2 LAs). National landscape update (VALOUR, local connection exemption, Veterans Gateway retired). | Mar 25 |
| Prison/custody pathway org research: Yellow Ribbon, NACRO, Aspire, CAS-3, Langley Trust identified. Platform audit: 7 existing services (5 women-only), gaps in Walsall, Wolverhampton, Solihull for men. | Mar 25 |
| Care leavers legislation update: Children's Wellbeing Bill in final stages, Royal Assent imminent. | Mar 25 |
| Platform Listings Review for Eliz produced (veterans + prison/custody + care leavers note) | Mar 25 |
| Accumulated risk escalation removed from backlog (inference, not safeguarding, superseded by prevention terminal) | Mar 25 |
| Item 44: Systematic gap audit complete — WMCA Service Coverage Review produced 27 Mar 2026 | Mar 27 |
| fix(data): Walsall navigator phone number (01922 625687, verified against YMCA Black Country website and Walsall council listing) and Sandwell P3 annotation added to housing-pathway-endpoints.json | Mar 28 |
| Item 45: Solihull cross-boundary proof of concept — 201 candidates, 23 findings, 10 HIGH confidence. Approach validated. | Mar 28 |
| Full WMCA cross-boundary run — 374 findings, 88 strong matches across 7 LAs. Review queue produced for Eliz. | Mar 28 |
| API pagination implemented in wmca_cross_boundary_checker.py — no cap, full dataset. | Mar 28 |
| Layer 3 gap research (web): Dudley financial help, Solihull phone/internet, Dudley LGBTQ+. Findings incorporated into Coverage Methodology Note v1.0. | Mar 28 |
| Coverage Methodology Note v1.0 produced and sent to James. | Mar 28 |
| Eliz Coverage Note v1.0 produced — cross-boundary findings, what still needs resolving, three specific asks. | Mar 28 |
| "Judgment stays with people" governing principle drafted (item 52). | Mar 28 |
| Project instructions rebuilt — mandatory governance check section added, document inventory added, exploratory work exemption closed. | Mar 28 |

---

## Document History

| Date | Change |
|------|--------|
| 2026-02-06 | Initial backlog created |
| 2026-02-10 | Updated: removed completed CI/CD, added zero-match handling (items 5-7), enrichment fixes (9-10), contact data integrity (1-2), housing navigation pivot (8), Jannaways audit items. Added completed items log. |
| 2026-02-10 | Recreated from conversation history (file lost between sessions). |
| 2026-02-10 | Watsonx fixes moved to completed. Enrichment fixes flagged for verification. Zero-match handling marked as scoping in progress. |
| 2026-02-13 | Added Ethical AI Review section (items 13-17) from IBM Five Pillars review. Match scoring design, enrichment normalisation layer, Data Protection Policy update, explainability watch brief, user-facing matching explanation (parked). |
| 2026-02-25 | Added veterans and prison/custody release housing pathways to Future section following housing pathway mapping audit. |
| 2026-02-25 | Added care leavers age extension (18–20 → 21–24) with legal position and pending legislation trigger following legal check. |
| 2026-02-25 | Added Housing Pathway Gaps section (A1–A3, B1–B3, C1–C3) from WatsonX audit and Claude Code pathway check. |
| 2026-03-01 | Added Positive Pathway Mapping workstream (items 26-27): governance design principles, OSTD requirement, classification build. Added human review queue Excel format item (item 28). Updated veterans pathway entry with WMCA research findings from "Designing Out Veterans' Homelessness" report (2020). |
| 2026-03-02 | PR #5 raised: JSON wiring complete (items 1, 1b, B1 complete; B2 partially complete). Crisis gate reordering (item 4) signed off by James. Mid-conversation age detection (item 3) direction approved, design doc required before build. Phase B items unblocked. Item 8 unblocked. |
| 2026-03-05 | PR #5 review feedback resolved (commit 7). dvDisclosed removed, profile.dv simplified. isDropIn sourced from JSON. P3 Coventry phone verified and annotated. Blue Sky Centre phone set to null. any types replaced with proper interfaces. Added item 1c: la-contacts.json consolidation (follow-on, requires James sign-off). |
| 2026-03-05 | Item 3 updated: design documentation now complete (Design Note v1.1 and Trustee-Accessible Safeguarding Boundary Summary produced Mar 2026). Status changed to ready to build pending James implementation-level review. Post-implementation governance steps documented: Safeguarding Contract and note to be updated only after implementation is complete, tested, and James has signed off. |
| 2026-03-05 | Governance document audit session: ADR-001 retired and content absorbed into Service Matching Contract v2.0 and Note v2.0. All ADR-001 references in backlog updated. Item 25 closed (Safeguarding Contract v3.0 covers it). Item 29 added: Governance Overview v3 required. Completed log updated with all governance documents produced this session. |
| 2026-03-10 | PR #5 merged. PR #6 raised with 12 commits, 48 tests. Completed: items 4, 1c, B2, B3, 5, 6, 7, 8, 18, 19, 20, 21, A1, A2. Navigator age filtering added. Advice Services rerouted with subcategory selection. nationalFallbacks aligned to contract. Item 24 (prevention) parked pending WMCA conversation. Item 30 added (Advice Services routing review). Item 31 added (Safeguarding Contract la-contacts reference update). Removed completed items from active sections. |
| 2026-03-12 | Added internal SSN links and opening times item to Future (parked until pipeline wired in). Enrichment pipeline review session: scraper v2.2 fixes (version metadata, unmatched org name bug), classifier known org specificity fixes (mind, crisis centre, the haven), IAPT and talking therapies added to MH delivery signals. Added Pipeline Pre-Rollout Validation section (items 34-36): baseline snapshot, validation workflow, new location onboarding procedure. Item 37: audience check on specialism flags (watch brief, not a gate). Item 38: feedback loop for human review decisions as classifier training data. Classifier rules review completed: MH-R2 and dropin>general confirmed AUTO_REJECT. Item 39: weekly pipeline run cadence. Item 40: gap intelligence reporting. Session analytics and feedback mechanism items rescoped with card expand tracking design (org name included, governance decision recorded), measurement stack, and partner feedback framing. Item 41: WCAG 2.1 AA audit complete (47 issues), expanded to full accessibility scope (WCAG 2.1 AA, WCAG 2.2, W3C COGA, Mencap, BS 8878). Accessibility Alignment Note v1.0 produced. Item 42: progress acknowledgement after B5. Item 43: geolocation failure fallback scoped for scale (regional grouping pattern). Flow audit confirmed VA completable without typing. Profiling gate skip/PNTS audit confirmed: routing-critical questions correctly mandatory, all sensitive questions have PNTS. User-centred design principle drafted for governing principles consideration. |
| 2026-03-13 | PR #6 merged (11 Mar). PR #7 merged then reverted via PR #8. PR #9 raised (gate bug fix, Article 9 consent, immigration status, LGBTQ+ specialist, early flow gates — 63 tests). Blocker updated from PR #6 to PR #9. Item 31 unblocked. Phase 4 cleanup unblocked. Completed log updated. |
| 2026-03-25 | PRs #9 and #10 merged. PRs #11 and #12 cancelled (work already on main). Blocker section replaced with Current section (PR #13). Items 32+33 investigated: gate bug did not exist as described, hasChildren infinite loop found and fixed (PR #13), quick route already built. Items 16, 29, 31 resolved. Item 41 partially resolved (3 critical WCAG fixes in PR #13). Phase 4 confirmed unblocked. Item 3 (mid-conversation age detection) unblocked — James reviews via PR, not a pre-build gate. Item 24 (prevention terminal) fully scoped, Eliz/WMCA dependency removed. Items 23/28/40 consolidated into single Eliz reporting item (Monday team meeting). Positive Pathway Mapping (items 26/27) moved out of VA backlog — separate exercise, co-design meeting 31 March. Governance docs updated: Safeguarding Contract v3.1, Safeguarding Governance Note v3.2, plus five new policy documents. Completed log updated. |
| 2026-03-25 | Enriched services data audit: veteran and prison/custody pathways researched against 936 services. Veterans: only RBL (2 LAs) on platform; Op FORTITUDE, SSAFA, Stoll, Haig Housing identified for listing. Prison: 7 existing services (5 women-only); Yellow Ribbon, NACRO, Aspire, CAS-3, Langley Trust identified. Platform listings review document produced for Eliz. Accumulated risk escalation removed (inference, not safeguarding, superseded by prevention terminal design). Veterans and prison/custody backlog items updated with research findings and org details. Care leavers updated with legislation status (Royal Assent imminent). Session analytics moved to pre-launch. Feedback mechanism confirmed as card expand tracking (lowest effort). Item 44 added: pre-launch gap audit of enriched data. |
| 2026-03-28 | PR #13 merged. PR #14 raised: serviceMatcher category mapping fix (recovers 44 services for Health/Work), Walsall navigator phone number, Sandwell P3 annotation. Items 44a and 44b now in PR #14. Added Cross-Boundary Coverage section: items 49 (checker integration — now blocked on Data Enrichment Contract amendment and Tier 3 trustee approval following James's response), 50 (contract amendment — reframed from methodology update to governance task), 51 (pipeline orchestration — future), 52 ("Judgment stays with people" principle), 53 (slug consistency investigation), 54 (item 36 update). James confirmed website reading crosses agreed API-only data source boundary — Tier 3 decision required before checker becomes standard pipeline. The 88 strong matches remain valid and can proceed to Eliz review. Project instructions rebuilt with mandatory governance check section and document inventory. Missing documents identified: Safeguarding Contract v3.1, Governance Decision Framework v1.0, AI Governance Plan v2, and others. |
| 2026-04-09 | PR #14 merged. PR #15 raised: aria-label added to restart and close buttons (item 47), .gitignore updated to exclude local data dumps and Claude settings. Item 48 closed — no fix needed, backlog filename was incorrect. Items 47 and 48 marked complete/closed. |
| 2026-04-11 | PR #15 merged. Items 47 and 48 closed. Next: PR #16 (item 46, PNTS null/false refactor). |
| 2026-04-11 | Item 46 audit complete. PNTS null fix blocked — `routeToNextProfileQuestion` cannot distinguish PNTS `null` from "never asked" `null`. All changes reverted. Item 46 updated to blocked, needs James input and design note. |
| 2026-04-11 | PR #16 raised (https://github.com/StreetSupport/street-support-va/pull/16): mid-conversation age detection (item 3) + CRISIS_UNDER16_LOCATION phrasebank fix. 94/94 tests passing. CRISIS_FIRE_FLOOD_LOCATION missing phrase identified as side observation — added as item 56. |
| 2026-04-11 | Item 46 audit complete. Fix is mechanical but exposes routing bug: `routeToNextProfileQuestion` uses `=== null` to decide whether to ask a gate — PNTS `null` is indistinguishable from "never asked" `null`, causing hasChildren to re-ask on PNTS selection. Principled fix requires tracking asked state separately from answer value. All changes reverted. Item 46 status updated to blocked. Needs James input before proceeding. |
| 2026-04-13 | Item 46 unblocked. James provided design direction: pass `after: '<field>'` from caller into `routeToNextProfileQuestion` rather than inferring from null state. No `askedGates` Set required. Two pre-conditions: call-site audit and regression test. Item 46 updated. PR #17 scope confirmed as this change. |
| 2026-04-13 | PR #16 James review complete. Seven changes required before merge: intercept ordering (rule #25 violation), LA-aware routing on intercept (generic fallback is systematic, not an edge case), remove PNTS from CRISIS_UNDER16_LOCATION, remove generic fallback from buildUnder16Exit, move explanation strings to phrasebank, fix route.ts:207 log, drop logUnder16Trigger export. Item 3 status updated. Item 57 added: supporter pathway under-16 exit review (separate PR). |
| 2026-04-15 | PR #16 fixes in progress. Steps 1–4 complete (94/94 passing): route.ts:207 log fixed, logUnder16Trigger unexported, explanation strings moved to phrasebank, PNTS removed from CRISIS_UNDER16_LOCATION. Item 58 added: location gate fires too late in the flow — architectural question for James. |
| 2026-04-15 | PR #16 all changes complete. 96/96 passing. 6 commits pushed to staging. Item 3 complete pending merge. Item 58 resolved in PR #16 — location gate moved immediately after GATE0, restores WatsonX design. PR #16 awaiting James re-review. |
| 2026-04-15 | PR #16 merged. Item 3 marked complete. Governance decisions log added — records Tier 2 and Tier 3 decisions for trustee visibility. Four Tier 2 entries and one Tier 3 entry added, reconstructed from PR history. Log to be maintained going forward. Post-merge governance outstanding: Safeguarding Contract, Governance Note, Design Note updates. |
| 2026-04-15 | PR #17 build started (item 46). 97/97 tests passing. routeToNextProfileQuestion gains optional `after` param; lgbtq and hasChildren PNTS selections now store null; 9 call sites audited and updated; regression test added. Pre-existing stateUpdates propagation bug identified in 4 handlers — not in scope, logged as item 59. Awaiting commit and James review. |
| 2026-04-15 | Governance docs updated post PR #16 merge: Design Note v1.2 (Section 14 implementation record), Safeguarding Contract v3.2 (test count updated, mid-conversation age detection moved to implemented), Safeguarding Governance Note v3.3 (test count updated, mid-conversation age detection row added). |
| 2026-04-22 | PR #17 merged. PR #18 raised: after param typed as union, duplicate PNTS test removed, items 55 and 56 complete, backlog committed to repo. 96/96 tests. Awaiting James review. |
| 2026-04-29 | Item 24 architecture superseded. Prevention Pathway Design Note v1.0 produced (28 April 2026). Original profiling-shaped terminal scoping replaced by conversational architecture: single PREVENTION_CONVERSATION gate, four routing modes, three governing questions, buttons-and-text input pattern, reduced AI layer (clarity assessment only, no routing inference). Three-phase implementation. Two open questions for James. Five governance documents needed post-Phase 1. Item 24 updated in full. |
| 2026-04-29 | PR #18 merged. Items 55, 56 complete. Item 59 now visible to James via backlog. Items 67 and 68 added from James PR #18 review comments: GATE0 end-to-end phrasebank regression test (67), ProfileField shared type alias (68). Item 69 added: full VA supporter/professional language audit — wider scope identified during item 57 work. Items originally numbered 60/61 from PR #18 session corrected to 67/68 to avoid collision with WatsonX audit items. |
| 2026-04-30 | Item 57 in progress. B2_WHO_FOR audit: userType stored as SUPPORTER/PROFESSIONAL but collapsed to isSupporter boolean downstream — distinction unused. GATE0 case 2 safeguardingTriggered fix built. Phrasebank selector widened to support __PROFESSIONAL variant. Supporter and Professional Language Review v1.0 produced — with James for sign-off. PR #19 ready to commit (mechanical changes). PR #20 will follow once language approved. Items 46, 55, 56, 3 (governance docs) all marked complete. Backlog fully audited and updated. |
