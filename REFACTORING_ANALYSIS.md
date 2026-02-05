# Street Support VA v7 - Refactoring Analysis

**Date:** 2026-02-05
**Codebase:** street-support-va-v2
**Prepared for:** Technical review

---

## Summary

The codebase consists of 8 TypeScript source files totalling ~4,200 lines of logic. The architecture is sound for a v1 — a finite state machine with a phrasebank and service matcher — but several patterns have emerged that will make maintenance harder as the system grows.

This document catalogues 14 refactoring opportunities. Items are numbered in implementation order across 5 phases, where each phase builds on foundations laid by earlier phases. A developer can follow the numbering straight through.

**Risk levels** reflect proximity to safeguarding logic. A "high risk" refactor means the change touches code that directly routes vulnerable users (crisis exits, DV pathways, under-16 exits). These require extra review and test coverage before merging.

---

## Implementation Phases

**Phase 1 — Cleanup** (items 1–2): Remove code that shouldn't be there. No dependencies, no risk. Do these first to reduce noise for everything that follows.

**Phase 2 — Small extractions** (items 3–6): Extract reusable helpers and consolidate types. These are independent of each other and establish foundations that later phases build on.

**Phase 3 — Data consolidation** (items 7–9): Move reference data (LA lists, contact numbers, exit resources) from code into shared constants or JSON files. Items 8 and 9 share infrastructure patterns.

**Phase 4 — Deduplication** (items 10–11): Eliminate repeated patterns in the state machine. These are easier and safer after Phase 2 helpers exist.

**Phase 5 — Architecture** (items 12–14): Larger structural changes that touch multiple files and require expanded test coverage. Each depends on foundations from earlier phases.

---

## Implementation Plan

| # | Item | Phase | Depends on | Risk | When this pays off |
|---|------|-------|------------|------|--------------------|
| 1 | Delete duplicate route file | 1 | — | Low | Modifying location logic — no risk of editing the wrong file |
| 2 | Remove dead code | 1 | — | Low | Searching for active code — less noise, clearer picture |
| 3 | Extract pronoun helper | 2 | — | Low | Adding a pronoun form (e.g., neopronouns) — 1 edit instead of 4 functions |
| 4 | Extract org-rendering helper | 2 | — | Low | Changing org display format (e.g., adding hours) — 1 edit instead of 7 |
| 5 | Fix section header duplication | 2 | — | Low | Adding a new service category — 1 edit instead of 2 |
| 6 | Consolidate type definitions | 2 | — | Low | Changing org data shape — 1 definition instead of 3 |
| 7 | Consolidate LA data | 3 | — | Medium | A new LA joins WMCA — 1 edit instead of 8 across 4 files |
| 8 | Move contact data to JSON | 3 | — | Low | A council updates their phone number — JSON edit, no TypeScript |
| 9 | Exit resources to JSON | 3 | #8 | Medium* | A crisis helpline changes — JSON edit with deploy-blocking validation |
| 10 | Extract terminal-building helper | 4 | #3 | Medium | Terminal output format changes — 1 edit instead of 11 |
| 11 | Deduplicate option arrays | 4 | #7 | Medium | An option label is renamed — 1 edit instead of 2 per gate |
| 12 | Phrasebank pronoun templating | 5 | #3 | Medium | Profiling question wording changes — 1 edit instead of 2 |
| 13 | Split processInput switch | 5 | #7, #10 | High | Reviewing or modifying a pathway — read 200 lines instead of 2,000 |
| 14 | Structured API responses | 5 | #4, #6 | Medium | Adding a field to service cards — change the data, not the parser |

\* Risk is MEDIUM only if startup validation is implemented as specified. Without it, risk would be HIGH. See item #9 details.

---

## Table of Contents

1. [Delete duplicate route file](#1-delete-duplicate-route-file)
2. [Remove dead code](#2-remove-dead-code)
3. [Extract pronoun helper](#3-extract-pronoun-helper)
4. [Extract org-rendering helper](#4-extract-org-rendering-helper)
5. [Fix section header duplication](#5-fix-section-header-duplication)
6. [Consolidate type definitions](#6-consolidate-type-definitions)
7. [Consolidate LA data](#7-consolidate-la-data)
8. [Move contact data to JSON](#8-move-contact-data-to-json)
9. [Exit resources to JSON](#9-exit-resources-to-json)
10. [Extract terminal-building helper](#10-extract-terminal-building-helper)
11. [Deduplicate option arrays](#11-deduplicate-option-arrays)
12. [Phrasebank pronoun templating](#12-phrasebank-pronoun-templating)
13. [Split processInput switch](#13-split-processinput-switch)
14. [Structured API responses](#14-structured-api-responses)

---

## Phase 1 — Cleanup

---

## 1. Delete duplicate route file

### What
Two files serve the same location/postcode API endpoint at different URL paths:
- `app/api/location/route.ts` (178 lines) - the primary, enhanced version with terminated postcode fallback, outcode fallback, and caching headers
- `app/location/route.ts` (87 lines) - a simplified duplicate with no fallbacks

The ChatWidget calls `/api/location` (line 559), so `app/location/route.ts` is unreachable dead code.

### Where

| File | Lines | Has terminated postcode fallback | Has outcode fallback | Has caching |
|---|---|---|---|---|
| `app/api/location/route.ts` | 178 | Yes | Yes | Yes |
| `app/location/route.ts` | 87 | No | No | No |

### Suggested solution
Delete `app/location/route.ts`.

### Benefit
Eliminates confusion about which endpoint is canonical when modifying location logic.

### Risk: LOW
The widget only calls `/api/location`. No other code references `/location`.

---

## 2. Remove dead code

### What
Functions, constants, and types that are defined but never called or referenced. Identified in the previous unused code analysis.

### Where

| Item | File | Lines | Type |
|---|---|---|---|
| `getDefaultOrgs()` | `lib/serviceMatcher.ts` | 271-275 | Exported function |
| `needsYouthServicesFlag()` | `lib/serviceMatcher.ts` | 331-334 | Exported function |
| `matchServices()` | `lib/serviceMatcher.ts` | 340-353 | Exported function (stub) |
| `formatPhoneNumber()` | `lib/serviceMatcher.ts` | 390-393 | Exported function |
| `formatPhone()` | `lib/serviceMatcher.ts` | 252-261 | Internal function |
| `isCouncilAdjacent()` | `lib/serviceMatcher.ts` | 238-241 | Internal function |
| `councilAdjacentOrgNames` | `lib/serviceMatcher.ts` | 231-236 | Internal constant |
| `womensAidOrgs` | `lib/serviceMatcher.ts` | 192-205 | Internal constant |
| `MatchedService` | `lib/serviceMatcher.ts` | 14-24 | Exported interface |
| `processOutsideWMCAResponse()` | `lib/stateMachine.ts` | 2010-2030 | Exported function |
| `LauncherBubble` | `components/ChatWidget.tsx` | 58-105 | Exported component |
| `LauncherBubbleProps` | `components/ChatWidget.tsx` | 54-56 | Interface |
| Entire file | `app/location/route.ts` | 1-87 | Duplicate route (covered by #1) |

**Note:** Several of these (`matchServices`, `womensAidOrgs`, `isCouncilAdjacent`, `formatPhone`) appear to be scaffolding for future service database integration rather than abandoned code. They should be either completed and wired up, or removed and re-added when needed.

### Suggested solution
Remove items that are genuinely dead. For future-integration items, either:
- Keep them but add a `// TODO: Wire up when service DB is integrated` comment
- Remove them and track the work as a separate ticket

### Benefit
Reduces noise when searching for active code paths. ~180 lines removed.

### Risk: LOW
None of these are called, so removing them has no behavioural impact. The `LauncherBubble` component is superseded by `ChatLauncher.tsx`.

---

## Phase 2 — Small Extractions

---

## 3. Extract pronoun helper

### What
The pronoun variables (`pronoun`, `possessive`, `they`, `theyve`, `theyre`) are set up identically in `buildTerminalServices` and appear in slightly different forms in `buildUnder16Exit`, `buildFireFloodExit`, and `buildSelfHarmExit`.

### Where

| Function | File | Lines |
|---|---|---|
| `buildTerminalServices` | `lib/stateMachine.ts` | 710-714 |
| `buildUnder16Exit` | `lib/stateMachine.ts` | 333, 339-342, 366-380 |
| `buildFireFloodExit` | `lib/stateMachine.ts` | 459-460, 465-493 |
| `buildSelfHarmExit` | `lib/stateMachine.ts` | 509-540 |

### Suggested solution
Extract a pronoun helper:

```typescript
function getPronouns(isSupporter: boolean) {
  return {
    subject: isSupporter ? 'they' : 'you',
    object: isSupporter ? 'them' : 'you',
    possessive: isSupporter ? 'their' : 'your',
    subjectVe: isSupporter ? "they've" : "you've",
    subjectRe: isSupporter ? "they're" : "you're",
    reflexive: isSupporter ? 'themselves' : 'yourself',
  };
}
```

### Benefit
Adding a new pronoun form (e.g., neopronouns) becomes a one-line change instead of editing 4 functions. Also ensures consistency — currently `buildTerminalServices` uses 5 pronoun variables while the exit builders inline them differently.

### Risk: LOW
No routing logic affected.

### Enables
Items #10 (terminal helper uses pronouns) and #12 (phrasebank templating needs pronoun definitions).

---

## 4. Extract org-rendering helper

### What
The terminal builder (`buildTerminalServices`) and the exit builders (`buildUnder16Exit`, `buildFireFloodExit`, `buildSelfHarmExit`) all follow the same pattern for rendering organisation details:

```typescript
text += `${org.name}\n`;
if (org.phone) {
  text += `${org.phone}\n`;
}
if (org.website) {
  text += `${org.website}\n`;
}
if (org.description) {
  text += `${org.description}\n`;
}
text += `\n`;
```

This block appears 5 times in `buildTerminalServices` (lines 755-818, 806-818, 828-840, 857-869, 893-896) and with slight variations in the exit builders.

### Where
`lib/stateMachine.ts`:
- `buildTerminalServices()`: lines 701-906, 5 instances
- `buildUnder16Exit()`: lines 332-392, 1 instance
- `buildFireFloodExit()`: lines 458-505, 1 instance

### Suggested solution
Extract a helper:

```typescript
function formatOrg(org: DefaultOrg, contextLine?: string): string {
  let text = `${org.name}\n`;
  if (org.phone) text += `${org.phone}\n`;
  if (org.website) text += `${org.website}\n`;
  if (contextLine) text += `${contextLine}\n`;
  else if (org.description) text += `${org.description}\n`;
  return text + '\n';
}
```

### Benefit
Changing org display format (e.g., adding opening hours) requires 1 edit instead of 7. Consistent formatting across all org displays.

### Risk: LOW
Display formatting only, no routing logic affected.

### Enables
Item #14 (structured API responses can use this helper to generate text output).

---

## 5. Fix section header duplication

### What
The section header list (`YOUR FIRST STEP`, `OUTREACH SUPPORT`, `LOCAL SUPPORT`, etc.) appears twice in `ChatWidget.tsx` - once in the `parseServiceContent` function (line 224-238) and again in the `ServiceCardComponent` as a label mapping (lines 403-418).

### Where
`components/ChatWidget.tsx`:
- `sectionHeaders` array: lines 224-238
- `categoryLabel` mapping: lines 403-418

### Suggested solution
Define a single `SECTION_CONFIG` object that maps header strings to their display labels, then derive both the detection list and the label mapping from it.

### Benefit
Adding a new service category requires 1 edit instead of 2. Headers stay in sync.

### Risk: LOW
UI presentation only.

---

## 6. Consolidate type definitions

### What
Several type definitions overlap or could be unified:

| Type | File | Used by |
|---|---|---|
| `DefaultOrg` | `lib/serviceMatcher.ts` | Terminal builder, exit builders |
| `ServiceCard` | `components/ChatWidget.tsx` | UI rendering |
| `MatchedService` | `lib/serviceMatcher.ts` | Unused |

`DefaultOrg` and `ServiceCard` describe essentially the same thing (an organisation with name, phone, website, description) but with different optional fields. `MatchedService` adds `matchScore` and `organizationId` for future database integration.

The `UserProfile` type in `serviceMatcher.ts` also overlaps heavily with `SessionState` in `stateMachine.ts` - the `buildTerminalServices` function manually maps between them (lines 717-731).

### Where
- `lib/serviceMatcher.ts`: lines 14-24 (`MatchedService`), 26-33 (`DefaultOrg`), 35-49 (`UserProfile`)
- `components/ChatWidget.tsx`: lines 35-43 (`ServiceCard`)
- `lib/stateMachine.ts`: lines 98-178 (`SessionState`)

### Suggested solution
Create `lib/types.ts` with shared types. Make `UserProfile` a mapped type derived from `SessionState` rather than a manually maintained subset.

### Benefit
Changing org data shape requires updating 1 definition instead of 3. Eliminates type drift between files. The manual mapping in `buildTerminalServices` could be replaced with a utility function.

### Risk: LOW
Type changes only, no runtime behaviour affected.

### Enables
Item #14 (structured API responses need a shared org type for the response shape).

---

## Phase 3 — Data Consolidation

---

## 7. Consolidate LA data

### What
The WMCA Local Authority list appears in at least 8 separate locations across 4 files. Each is a slight variation (different casing, different ordering, some with "Other" appended). If a new LA joins the WMCA combined authority, every instance must be updated.

### Where

| Location | File | Line(s) | Format |
|---|---|---|---|
| `WMCA_NAMES` constant | `app/api/location/route.ts` | 23 | lowercase array |
| `WMCA_NAMES` constant | `app/location/route.ts` | 9 | lowercase array (duplicate file) |
| `childrenServicesData` keys | `lib/stateMachine.ts` | 287-329 | lowercase Record keys |
| `councilHousingData` keys | `lib/stateMachine.ts` | 412-455 | lowercase Record keys |
| `under16LAs` array | `lib/stateMachine.ts` | 998 | Title case array |
| `fireFloodLAs` array | `lib/stateMachine.ts` | 1009 | Title case array |
| `laOptions` array | `lib/stateMachine.ts` | 1226 | Title case array + "Other" |
| `defaultOrgsByLA` keys | `lib/serviceMatcher.ts` | 56-148 | lowercase Record keys |

### Suggested solution
Single source of truth: `lib/constants.ts` exporting `WMCA_LOCAL_AUTHORITIES` as a typed array. All other locations import and derive from it. The phrasebank location options should be generated from this array rather than hardcoded.

### Benefit
A new LA joins WMCA — 1 edit instead of 8 across 4 files. Eliminates 7 redundant definitions.

### Risk: MEDIUM
The crisis location gates (`CRISIS_UNDER16_LOCATION`, `CRISIS_FIRE_FLOOD_LOCATION`) use these arrays for index-based routing to safeguarding exits. The mapping between array index and LA name must stay consistent. Tests cover this.

### Enables
Items #11 (option array deduplication uses shared LA source) and #13 (splitting processInput is cleaner when LA data is centralised).

---

## 8. Move contact data to JSON

### What
Three blocks of hardcoded contact data are embedded directly in `stateMachine.ts` as TypeScript `Record` objects. These are reference data (phone numbers, URLs, names) that will change when councils update their contact details, not routing logic.

### Where

| Data block | File | Lines | Records |
|---|---|---|---|
| `childrenServicesData` | `lib/stateMachine.ts` | 286-329 | 7 LAs, ~44 lines |
| `councilHousingData` | `lib/stateMachine.ts` | 412-455 | 7 LAs, ~44 lines |
| `defaultOrgsByLA` | `lib/serviceMatcher.ts` | 56-148 | 7 LAs, ~92 lines |
| `servicesByNeed` | `lib/stateMachine.ts` | 601-654 | 12 categories, ~54 lines |
| `adviceTopics` | `app/api/chat/route.ts` | 32-69 | 9 topics, ~38 lines |

### Suggested solution
Create `data/wmca-contacts.json` containing all LA-specific contact data (children's services, council housing, default orgs). Import and type-check at build time. Advice topics and service-by-need data can go in `data/advice-topics.json` and `data/services-by-need.json`.

### Benefit
A council updates their phone number — JSON edit, no TypeScript knowledge required. Non-developers on the team can update contact details. ~270 lines moved out of logic files.

### Risk: LOW
These data blocks are consumed by exit builders and terminal builders but don't control routing decisions themselves.

---

## 9. Exit resources to JSON

**Depends on:** #8 (shared JSON infrastructure patterns)

### What
Safeguarding exit builders (`buildUnder16Exit`, `buildFireFloodExit`, `buildSelfHarmExit`) and phrasebank DV/SA exits contain hardcoded phone numbers, URLs, and organisation names for crisis services (Childline, Samaritans, NSPCC, ManKind, Galop, Rape Crisis, etc.). These are reference data that may change independently of the surrounding phrasing.

### Where

| Exit type | Data items | Location |
|---|---|---|
| Under-16 | Childline number, NSPCC number, Children's Services per LA | `lib/stateMachine.ts` lines 362-374, `childrenServicesData` lines 286-329 |
| Self-harm | Samaritans number, NHS 111, Mind number | `lib/stateMachine.ts` lines 516-534 |
| Fire/flood | Council housing per LA, Shelter number | `lib/stateMachine.ts` lines 468-489, `councilHousingData` lines 412-455 |
| DV exits | National DA Helpline, ManKind, Galop, Shelter | `lib/phrasebank.ts` lines 1207-1685 |
| SA exits | Rape Crisis, SurvivorsUK, Galop | `lib/phrasebank.ts` lines 1519-1685 |

### Clarification: what moves, what stays

**Moves to JSON:** Contact data only — organisation names, phone numbers, URLs, and short factual descriptions (e.g., "24-hour helpline for women experiencing domestic abuse").

**Stays in code:** All phrasing, framing, and trauma-informed language. The sentences that wrap around the contact data (e.g., "I'm really sorry this is happening. You deserve support, and you don't have to face this alone.") remain in the phrasebank or exit builder functions. These are carefully reviewed language that should not be editable without code review.

### Suggested solution
Create `data/exit-resources.json`:

```json
{
  "selfHarm": {
    "samaritans": { "name": "Samaritans", "phone": "116 123", "url": "https://www.samaritans.org" },
    "nhs": { "name": "NHS Mental Health Helpline", "phone": "111", "url": "https://www.nhs.uk/mental-health/" },
    "mind": { "name": "Mind", "phone": "0300 123 3393", "url": "https://www.mind.org.uk/information-support/helplines/" }
  },
  "under16": {
    "childline": { "name": "Childline", "phone": "0800 1111", "url": "https://www.childline.org.uk" },
    "nspcc": { "name": "NSPCC Helpline", "phone": "0808 800 5000", "url": "https://www.nspcc.org.uk/keeping-children-safe/reporting-abuse/" }
  },
  "dvFemale": {
    "helpline": { "name": "National Domestic Violence Helpline", "phone": "0808 2000 247", "url": "https://nationaldahelpline.org.uk" }
  },
  "dvMale": {
    "helpline": { "name": "ManKind Initiative", "phone": "0808 800 1170", "url": "https://mankind.org.uk" }
  }
}
```

### Requirement: Startup validation

The application **must** validate that all required exit resources exist and are non-empty when the server starts. If any safeguarding contact is missing (no phone number, no URL, no name), the app must refuse to start and log a clear error identifying the missing field.

```typescript
function validateExitResources(resources: ExitResources): void {
  const required = [
    'selfHarm.samaritans.phone',
    'selfHarm.samaritans.url',
    'under16.childline.phone',
    'under16.childline.url',
    'dvFemale.helpline.phone',
    'dvMale.helpline.phone',
    // ... all required fields
  ];

  for (const path of required) {
    const value = getNestedValue(resources, path);
    if (!value || (typeof value === 'string' && !value.trim())) {
      throw new Error(`FATAL: Missing required safeguarding resource: ${path}. App cannot start.`);
    }
  }
}
```

This validation should also be covered by a test (see Testing Notes).

### Benefit
A crisis helpline changes their number — JSON edit with deploy-blocking validation. Non-developers can update phone numbers without touching code. ~100 lines of contact data moved to JSON.

### Risk: MEDIUM (conditional on startup validation)
The data is consumed by safeguarding exit builders. Moving it is mechanically straightforward. Risk is MEDIUM only if startup validation is implemented as specified. Without validation, risk would be HIGH: missing data could silently break safeguarding exits at runtime. The phrasing that wraps the data stays in code and continues to go through code review.

---

## Phase 4 — Deduplication

---

## 10. Extract terminal-building helper

**Depends on:** #3 (pronoun helper used in terminal output)

### What
The pattern of building terminal output and appending the "additional needs" prompt is repeated 11 times across `processInput()`. Each instance follows the same structure:

```typescript
const services = buildTerminalServices(session);
const additionalNeeds = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
return {
  text: services + '\n' + additionalNeeds?.text,
  options: additionalNeeds?.options,
  stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', ...extraUpdates },
  sessionEnded: false
};
```

### Where

| Gate | Lines |
|---|---|
| `B5_MAIN_SUPPORT_NEED` (non-housing) | 1310-1318 |
| `B7A_PREVENTION_GATE` (just info) | 1361-1368 |
| `B7_HOMELESS_SLEEPING_SITUATION` (quick) | 1381-1396 |
| `B7D_4_PREVENTION_SAFEGUARDING_SIGNALS` (normal) | 1488-1495 |
| `B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP` (default) | 1514-1521 |
| `B12_ALREADY_SUPPORTED` (no, quick route) | 1596-1603 |
| `B12A_WHICH_ORG` (quick route) | 1614-1621 |
| `C2_CONSENT_GATE` (no consent) | 1639-1646 |
| `C3Q10_LGBTQ` (skip social services) | 1807-1814 |
| `C3Q10A_LGBTQ_SERVICE_PREFERENCE` (skip) | 1830-1837 |
| `C3Q12_SOCIAL_SERVICES` | 1853-1860 |

### Suggested solution
Extract a helper:

```typescript
function terminalResult(session: SessionState, extraUpdates: Partial<SessionState> = {}): RoutingResult {
  const services = buildTerminalServices(session);
  const additional = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
  return {
    text: services + '\n' + additional?.text,
    options: additional?.options,
    stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS' as GateType, ...extraUpdates },
    sessionEnded: false
  };
}
```

### Benefit
Terminal output format changes — 1 edit instead of 11. Each terminal exit becomes a one-liner. The StreetLink-specific case at `B7_HOMELESS_SLEEPING_SITUATION` (lines 1386-1388) prepends extra content, so the helper needs an optional `prependText` parameter.

### Risk: MEDIUM
Terminal outputs are the final thing users see before contacting services. The helper must preserve the exact same behaviour.

### Enables
Item #13 (splitting processInput is cleaner when terminal exits are single lines).

---

## 11. Deduplicate option arrays

**Depends on:** #7 (LA consolidation provides shared LA source for `B1_LOCAL_AUTHORITY` options)

### What
Several gates define their option arrays twice: once in the phrasebank (as the `options` property of the `PhraseEntry`) and again in the `processInput` switch case as a local array used for mapping choice numbers to values.

### Where

| Gate | Phrasebank options | stateMachine array | Lines (stateMachine) |
|---|---|---|---|
| `B3_AGE_CATEGORY` | `["Under 16", "16-17", "18-24", "25 or over"]` | `['Under 16', '16-17', '18-24', '25 or over']` | 1260 |
| `B4_GENDER` | `["Male", "Female", "Non-binary or other", "Prefer not to say"]` | `['Male', 'Female', 'Non-binary or other', 'Prefer not to say']` | 1285 |
| `DV_GENDER_ASK` | `["Female", "Male", "Non-binary or other", "Prefer not to say"]` | `['Female', 'Male', 'Non-binary or other', 'Prefer not to say']` | 1022 |
| `B1_LOCAL_AUTHORITY` | `["Wolverhampton", "Coventry", ...]` | `['Wolverhampton', 'Coventry', ...]` | 1226 |
| All Section C questions | Similar pattern | Similar pattern | 1650-1850 |

This creates ~15 instances where changing an option label requires updating two files.

### Suggested solution
Use the phrasebank options as the single source. In `processInput`, retrieve the current gate's phrase and index into its `options` array:

```typescript
case 'B3_AGE_CATEGORY':
  const age = p?.options?.[choice - 1] ?? null;
```

This pattern is already partially used (the `choice` variable is parsed against `p?.options`) but then ignored in favour of a local array.

### Benefit
An option label is renamed — 1 edit instead of 2 per gate. Eliminates ~15 duplicated arrays (~45 lines). Option labels become single-source in the phrasebank.

### Risk: MEDIUM
The local arrays sometimes use shorter labels than the phrasebank options (e.g., phrasebank has `"Emergency Housing or Other Accommodation"` while the state machine maps to `"Emergency Housing"`). These display-vs-state differences would need to be handled, possibly with a separate mapping.

**Safeguarding note:** In `B3_AGE_CATEGORY`, option 1 ("Under 16") triggers the Under-16 safeguarding exit (`buildUnder16Exit`). The routing depends on array index — if the option order changes, a child could be routed into adult profiling instead of Children's Services. Any deduplication of this gate's options must preserve array order exactly. The existing safeguarding test suite catches this (`Under 16 > routes to child safeguarding exit`), but the constraint must be understood by anyone modifying the shared options source.

---

## Phase 5 — Architecture

---

## 12. Phrasebank pronoun templating

**Depends on:** #3 (pronoun helper provides the substitution definitions)

### What
The phrasebank contains ~50 entries where the `__SUPPORTER` variant is an almost-identical copy of the base entry with pronouns swapped ("you" -> "they", "your" -> "their", etc.). This means every content change must be made twice, and inconsistencies between variants are easy to introduce.

### Where
`lib/phrasebank.ts` - throughout the entire file. Examples:

| Base key | Lines (approx) | Supporter key | Difference |
|---|---|---|---|
| `GATE0_CRISIS_DANGER` | 29-43 | `GATE0_CRISIS_DANGER__SUPPORTER` | 45-58 | Pronoun swap only |
| `B6_HOMELESSNESS_STATUS` | 353-361 | `B6_HOMELESSNESS_STATUS__SUPPORTER` | 363-371 | Pronoun swap only |
| `B7_HOUSED_SITUATION` | 373-383 | `B7_HOUSED_SITUATION__SUPPORTER` | 385-395 | Pronoun swap only |

All 12 DV/SA exit entries follow this same pattern (lines 1207-1685).

### Suggested solution
Store only the base text with pronoun placeholders:

```typescript
text: `Are {{PRONOUN_SUBJECT}} currently experiencing homelessness?`
```

Then resolve at runtime:
```typescript
const pronouns = isSupporter
  ? { PRONOUN_SUBJECT: 'they', PRONOUN_OBJECT: 'them', PRONOUN_POSSESSIVE: 'their' }
  : { PRONOUN_SUBJECT: 'you', PRONOUN_OBJECT: 'you', PRONOUN_POSSESSIVE: 'your' };
```

### Benefit
Profiling question wording changes — 1 edit instead of 2 (base + supporter). Eliminates ~30 duplicate entries from non-safeguarding phrases. Estimated ~600 lines saved from phrasebank.ts.

### Caveat: Safeguarding phrases must remain verbatim

Pronoun templating should **only** be applied to non-safeguarding phrases (profiling questions, advice content, terminal prompts, escalation messages). The following categories must retain both variants as separate, fully written-out entries:

- **Crisis exits:** `IMMEDIATE_PHYSICAL_DANGER_EXIT`
- **DV exits:** `DV_FEMALE_CHILDREN_YES`, `DV_FEMALE_CHILDREN_NO`, `DV_MALE_CHILDREN_YES`, `DV_MALE_CHILDREN_NO`, `DV_LGBTQ_CHILDREN_YES`, `DV_LGBTQ_CHILDREN_NO`
- **SA exits:** `SA_FEMALE_16PLUS`, `SA_MALE_16PLUS`, `SA_LGBTQ_OR_NONBINARY`
- **Under-16 exits:** `UNDER_16_EXIT`
- **Self-harm exits:** `SELF_HARM_EXIT`
- **Child-at-risk exit:** `CHILD_AT_RISK_EXIT`
- **Fire/flood exit:** `FIRE_FLOOD_EXIT`

These contain exact language that has been reviewed for trauma-informed phrasing. Automated pronoun substitution risks altering nuance in crisis-facing content. The supporter variant of `UNDER_16_EXIT` also adds the NSPCC helpline, which is not a simple pronoun swap.

### Risk: MEDIUM (revised from HIGH)
With safeguarding phrases excluded from templating, the risk drops. The pronoun substitution only applies to profiling and navigation phrases where the variants are mechanically identical. Edge cases still apply:
- "you've" -> "they've" (contractions)
- "yourself" -> "themselves" (reflexive)
- "I" vs "we" in supporter context ("I need to ask" -> unchanged)
- Options arrays also have pronoun differences

---

## 13. Split processInput switch

**Depends on:** #7 (LA data centralised), #10 (terminal helper reduces per-case bulk)

### What
`processInput()` is a single function containing a ~970-line switch statement (lines 962-1932) with 40+ case blocks. Each case handles one gate's routing logic. This makes the function difficult to navigate, review, and test in isolation.

### Where
`lib/stateMachine.ts`, lines 957-1933

### Suggested solution
Extract each logical section into its own handler function or module:

| Section | Lines | Gates | Proposed module |
|---|---|---|---|
| Crisis routing | 967-1041 | `GATE0_CRISIS_DANGER`, `CRISIS_*`, `DV_*`, `SA_*` | `handlers/crisis.ts` |
| Location flow | 1123-1220 | `LOCATION_*` | `handlers/location.ts` |
| Core profiling | 1225-1402 | `B1`-`B7`, `B7A` | `handlers/profiling.ts` |
| Prevention pathway | 1407-1522 | `B7B`-`B7D_4A` | `handlers/prevention.ts` |
| Homeless continuation | 1527-1622 | `B8`-`B12A` | `handlers/homeless.ts` |
| Section C profiling | 1627-1860 | `C2`-`C3Q12` | `handlers/sectionC.ts` |
| Terminal + escalation | 1865-1932 | `TERMINAL_*`, `ESCALATION_*` | `handlers/terminal.ts` |

Each handler would be a function `(session, choice) => RoutingResult` and the main switch would become a dispatch table.

### Benefit
Reviewing or modifying a pathway — read 200 lines instead of 2,000. Each handler can be understood, tested, and reviewed independently.

### Risk: HIGH
This is the core routing engine. Every gate transition is a potential safeguarding pathway. Requires the full safeguarding test suite to pass after refactoring, plus additional handler-level unit tests.

---

## 14. Structured API responses

**Depends on:** #4 (org-rendering helper), #6 (consolidated types)

### What
`ChatWidget.tsx` contains ~213 lines of text-parsing logic (`parseServiceContent`, lines 196-395) that reverse-engineers structured service data from formatted plain text. The API returns a single text string containing section headers (`YOUR FIRST STEP`, `LOCAL SUPPORT`, etc.), organisation names, phone numbers, and URLs. The widget then parses this text back into structured `ServiceCard` objects for rendering.

This is fragile: if the text format changes slightly (e.g., a new section header, a different line ordering, an org name that doesn't match the heuristic at line 330-355), the parser silently produces incorrect cards.

### Where
- **Text generation:** `lib/stateMachine.ts`, `buildTerminalServices()` (lines 701-906) and exit builders (`buildUnder16Exit`, `buildFireFloodExit`, `buildSelfHarmExit`)
- **Text parsing:** `components/ChatWidget.tsx`, `parseServiceContent()` (lines 196-395)

### Suggested solution
Have the API return structured JSON alongside the text:

```typescript
// API response shape
{
  m: "plain text fallback",
  o: ["option 1", "option 2"],
  services?: {
    intro: string;
    cards: Array<{
      name: string;
      phone?: string;
      website?: string;
      description?: string;
      category: string;
      isVerified?: boolean;
      isDropIn?: boolean;
    }>;
    outro: string;
  }
}
```

The widget renders `services` directly when present, falling back to the current text parser for backward compatibility during migration.

### Benefit
Adding a field to service cards — change the data, not the parser. 150-200 lines of parsing logic removed from ChatWidget. Eliminates an entire class of silent rendering bugs. Service cards become testable at the API level.

### Risk: MEDIUM
Touches terminal output structure. The `buildTerminalServices` function and exit builders would need to return both structured data and formatted text. The text version is still needed for accessibility, logging, and the plain-text session transcript. Requires changes across `stateMachine.ts`, `route.ts`, and `ChatWidget.tsx`.

---

## Testing Notes

The existing safeguarding test suite (`__tests__/safeguarding.test.ts`, 27 tests) covers the critical routing paths. Before any refactoring:

1. Ensure all 27 tests pass (`npm test`)
2. For items touching routing (#10, #11, #13): add handler-level unit tests first
3. For the phrasebank refactor (#12): add tests verifying each supporter variant produces the same output as the current hardcoded version. Only template non-safeguarding phrases.
4. For LA data consolidation (#7): add a test that verifies all 7 LAs appear in every location they're expected
5. For any refactor that moves safeguarding data to JSON (#9, and the safeguarding-adjacent parts of #8): add a **startup validation test** that loads the JSON file and confirms every required exit resource exists and is non-empty. The test should check:
   - All crisis exit phone numbers are present and match expected format
   - All crisis exit URLs are present and resolve to valid hostnames
   - All organisation names are non-empty strings
   - No required field is `null`, `undefined`, or whitespace-only
   - The test should fail loudly with a message identifying exactly which resource is missing (e.g., `"Missing: selfHarm.samaritans.phone"`)

---

*Generated with Claude Code*
