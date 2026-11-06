# Audit D: ssn-enrichment-pipeline (read-only), 2 November 2026

## Method

- 181 remote refs (180 distinct tips), shallow depth 30. `gh` GraphQL is blocked (HTTP 403). The REST API (`gh api repos/...`) works and was used.
- Shallow caveat. Commit d26434a (27 Oct, "feat(national): Safety from harm pass") is a shallow boundary. `git log -1 -- <path>` reports it as the last touch for many files on the national branches, which is a clone artefact. So the newest copy was picked by **distinct blob**: list each blob held across all refs, take the date of the commit that introduced it (`git log --find-object`). Helper scripts: `newestblob.sh` and `blobs.sh`, both in this scratchpad.
- Absence checks: every path in every ref tip went into `allpaths.txt` (8,702 unique paths, this scratchpad). I grepped it case-insensitively, then ran `git grep -i -l -F` across all 180 tips.

## 1. PR #115, Pathway Position, Not Phase

- PR #115 "docs(governance): pathway position, not phase, as the prevention routing criterion". Head `docs/pathway-position-not-phase-2026-09-23`. **Merged 2026-10-02T09:51:52Z** into main. It changes one file, `governance/Pathway_Position_Not_Phase_2026-09-23.md`.
- Newest copy: blob ca38593, the same on 44 refs including origin/docs/national-v4-delivery-plan-2026-10-29. The main copy was last touched 23 Sep (8061dc0), and its content matches.
- What it decides (§1). The VA routes people to prevention services on one criterion: does the service help people who are pre-crisis? It does not route by phase. Phase stays as an analytical tool, applied afterwards. It plays no part in placement, taxonomy migration or routing. The order of work is placement, then taxonomy, then migration, then phase as analysis.
- Phase in the VA today (§3). Phase is used only in the prevention pathway, to surface services tagged strengthen. The crisis gate and safeguarding exits come first and do not use phase.
- What decides prevention surfacing: whether the service serves people pre-crisis. Pre-crisis is measured against losing a safe home, not against the harm. A service counts if it serves people pre-crisis, whether or not it also serves people in crisis (§5).
- Status. The document is a design decision and is "not yet implemented". Its build goes to James for sign-off against the §5 acceptance tests. Merging the record does not authorise the build. It was carried into `governance/migration_rules_register.md` as rule **PATHWAY-POSITION-PLACES**, status provisional, "Carried to the register on the Managing Director's decision, 2 October 2026". The Implementation line says it is "a build change. It is not implemented." The newest register blob is 00ec519, 30 Oct, origin/align/safety-learning-shaping-register-2026-10-29.
- Five points are left open by §5: pre-crisis relative to what; spanning services; two fields that can drift; the phase-includes-strengthen proxy being lossy; and phase as a granularity cut in Shaping §4.

## 2. Organisation shape

- Governing note: `governance/Population_Factor_and_Shape_Fields_Note_2026-10-01.md`. Newest blob e18ba90 (181773b, 21 Oct), origin/align/consolidated-2026-10-21. Its status line reads: "None of them is yet carried in the baseline or the enriched data." **The data contradicts that line.** The latest WMCA baseline does carry shape (see below). The note's status line is stale.
- §6 values: single factor; single primary factor with others behind it; co-equal factors; general advice; population specialist; factor specialist with a broader remit. Place to start can be added alongside any of them. The note says shape is set by a person and never machine-derived.
- **Baseline (structured data).** `governance/assurance/source_first/wmca_baseline_hardened_2026-10-28_aftermath/organisations.jsonl` on origin/align/wmca-aftermath-2026-10-28 (only ref holding it; latest WMCA baseline found). 301 orgs. Field `v4_reconciliation.shape` is present on all 301 and is **free text, not an enum**. There are about 80 distinct strings. Main buckets as written:
  - "single factor (financial)" 78; "(safety)" 22; "(housing)" 20; "(mental health)" 14; "(physical health, mental health)" 6; "(physical health)" 5; bare "single factor" 4; "(none)" 4; "(Activities)" 2; "(relationships)" 1; plus provisional or population variants, about 9.
  - "place to start" 21, plus about 8 variants.
  - null 17. "general advice" 12, plus 1 variant. "immigration-shaped" 10, plus about 7 variants.
  - Population specialist: 6 (women, care leavers, LGBTQ+, young people, sex workers; one is "factor specialist (substance use), young people").
  - Co-equal or two factors: about 7 strings. Single primary with others behind: about 8 strings. Held, out of scope, duplicate or system level: about 15.
- **Housing factor specialist with a broader remit, baseline: 6.**
  - "housing-factor specialist with a broader remit" (4): good-shepherd-wolverhampton, sifa-fireside, the-glebe-centre-ymca-black-country, trident-reach.
  - "factor specialist with a broader remit (housing)" (2): p3-wolverhampton and st-george-s-house-charity.
  - Two near cases sit outside the six. cranstoun-birmingham reads "housing-factor specialist with safety". suit-service-user-involvement-team reads "addiction specialist with a broader remit", which is not housing.
  - Five are explicitly "housing itself, not a housing-factor specialist": coventry-cyrenians, chadd, springhousingassociation, walsall-housing-group-whg, pioneergroup.
- **Determination register.** The same six appear in the Notes prose of `governance/WMCA_Migration_Determination_Register.md`, newest blob 809780c (84bd67c, 22 Oct, origin/align/consolidated-2026-10-21). Cranstoun appears as "with safety" and p3-coventry as "not". There is no shape column. The register header (6 Oct) says it is no longer added to, and that the baseline governs.
- National: `national_baseline_hardened_2026-10-27_finance/*.jsonl` (origin/feat/national-builder-2026-10-27) contains no `shape` key. Searches for `org_shape`, `organisation_shape` and `,shape,` found no hits in any CSV.

## 3. Places to start

- No single confirmed register file was found. These exist:
  - WMCA baseline (same file as §2): `v4_reconciliation.place_to_start` reads true 34, false 138, null 129. 26 listing records are `carried_by_place_to_start`, and 3 listings are placed at "Place to start (help the helpers)". The org records hold **no local authority field**, so a per-LA split would need a join to the source packages. That join was not done.
  - National: `governance/assurance/source_first/national_working_records_2026-10-31/running_lists/PLACES_TO_START_LIST.md` with `places_to_start_candidates.jsonl` (21 lines). Ref: origin/feat/national-housing-2026-10-30, 228af66, 31 Oct. The file calls itself a "provisional list (read-only compilation)". It lists **8 confirmed**, 1 carried, 4 not, 1 out-of-scope location and 7 not addressed. By location: cambridgeshire 3, then islington, leeds, bury and manchester 1 each, and 1 that cannot be established.
  - Pending ledger: `national_baseline_hardened_2026-10-27_finance/places_to_start_pending.jsonl`, 6 entries, each pending the organisation's agreement.
  - Doctrine: `governance/A_Place_To_Start_Working_Note.md`. Newest by last touch is 47ea2ca, 31 Oct, origin/feat/national-housing-2026-10-30. This was not cross-checked by blob.
- The Delivery Plan §3 decision (29 Oct) says places to start are found bit by bit, with a provisional list drawn together as the work goes.

## 4. Theory of Change

- **Absent as a document on every ref.** Checked by listing paths across all tips (`theory`, `toc`: no ToC file) and by content grep. Only passing mentions exist. `governance/Digital_Audit_Review.md` says data collection aligns to Theory of Change development, supported by CHRP. `reports/wmca/report_drafts_2026-10-06/final/WMCA_Evidence_Report.md` line 138 refers to "two outcomes in the regional Theory of Change", and the Part A draft also mentions it.

## 5. Prevention Pathway Design Note v1.0 and v1.1

- **No file is present on any ref.** Path listing with `design_note`, `pathway_design` and `early_prevention` matched only `Determination_Writer_Design_Note.md`. Content grep on origin/docs/national-v4-delivery-plan-2026-10-29 found no filename for it, though it is cited many times by name ("v1.1 is the source of truth for…"; "the duplicate Prevention Pathway Design Note v1.0" listed for removal). The full all-refs content grep for the version string timed out; the path listing is the absence evidence.
- Nearby files:
  - `governance/va_prevention_pathway_note_v2.md` (origin/docs/governance-markdown-2026-10-31, 363b64b) is the "VA Prevention Pathway: Service Pool" note of 8 May 2026, classifier v3.6.1. It is a different document. It states that phase-based routing is the VA layer's job.
  - The Delivery Plan says "The Early Prevention Pathway Design Note goes to version 2.1. It is ready, and waits for the GitHub app". That puts it in the VA repo, outside this one.

## 6. WMCA report, Report 9, prevention mapping

- Final WMCA report: `reports/wmca/report_drafts_2026-10-06/final/WMCA_Evidence_Report.md` and `WMCA_Main_Report.md`, both **dated 6 October 2026**. Blob a252b4d was introduced at 442e7ce, "final main and evidence reports". It is the same on 35 refs, for example origin/docs/national-v4-delivery-plan-2026-10-29. The companion docx is `reports/wmca/Making_Homelessness_Prevention_More_Visible.docx` (99 refs).
- Report 9: `governance/assurance/source_first/Report_9_WMCA_Stopping_Condition_Consequential_Controls_and_Completion_Review_WORKING_DRAFT.md`. Newest blob 6ae752e (e0568c8, 21 Oct, "records: freeze Report 9"), 30 refs. It reads "Status: frozen, 21 October 2026": the board decided on 20 Oct that the stopping condition is met.
- `governance/Prevention_Pathway_Mapping_Working_Log.md`: only one copy exists, from 23 Jul (origin/fix/register-record-settled-determinations).

## 7. VA-facing export

- **No VA-facing export exists.** Checked by path listing (`export`, `va_`, `feed`, `publish`) and by content grep for "VA-facing", "va_export", "VA export" and "consumed by the VA". The only exports are `scripts/build_master_decisions_export.py` and a report CSV script.
- The governed baseline is a set of JSONL records, not an export. `listing_decisions.jsonl` (aftermath, 977 records, 498 of them listings) carries: placements (parent and subcategories), phases, primary_factors, supporting_factors, population_tags, notes, determining_act and review_status. `organisations.jsonl` carries shape, place_to_start and place_to_start_basis.
- **Item 80 is superseded.** `governance/National_V4_Delivery_Plan_2026-10-29.md` §4.4 (blob 138c2a3, origin/docs/national-v4-delivery-plan-2026-10-29; **PR #192, open, not merged**) records a decision of 29 Oct. The VA reads the live platform, and the baseline "is not a source to run from". VA backlog item 80 and pipeline backlog item 3 "are corrected". §4.5 says the VA needs only placements, the place-to-start marker and population tags from the platform, and that phase is not needed.

## 8. Phase is analytical, does not route

- No `PHASE-NOT-ROUTING` key exists, by content grep across all tips. The statement does appear in these places:
  - PR #115 doc §1.
  - Rule PATHWAY-POSITION-PLACES in `migration_rules_register.md` (provisional).
  - `governance/taxonomy/Phase_Framework_v0_3.md` §11 "Routing and relevance" and **PH-R01 "Phase is not the routing proposition"**. Newest blob 74634a3 (efcdcaf, 23 Oct), origin/align/consolidated-2026-10-21.
  - `governance/taxonomy/application/parents/immigration.md`: "Phase is analytical. It plays no part in routing or placement."
  - `reports/wmca/report_drafts_2026-10-06/working/notes/PHASE_REVIEW_closeout_2026-10-05.md`.
  - Delivery Plan §4.5.
  - The shape fields note says the same for factor, population and shape, which "play no part in routing".
- "does not route" in `Data_Enrichment_Contract_Field_Addendum_v1_0.md` refers to an accessor, not to phase.
