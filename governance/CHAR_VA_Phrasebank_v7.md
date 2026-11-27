# CHAR_VA_Phrasebank_v7 - Street Support Virtual Assistant (User-Facing Text)

---

## FILE TYPE

COPY-EXACT UI STRINGS (PHRASEBANK)

This file contains **all user-facing text** for the Street Support VA.

**Routing logic is in:** `CHAR_VA_RoutingLogic_v7.md`

---

## VERSION NOTES

**v7.1 Changes (Watson Feature Parity):**
- **NEW:** TERMINAL_ADDITIONAL_NEEDS - offers second/third need after services delivered
- **NEW:** B5A_ADDITIONAL_NEED_SELECTION - same 12 options as B5, for additional needs
- **NEW:** RESTART_OFFER - triggered by "start again", "made a mistake", etc.
- **NEW:** C3Q10A_LGBTQ_SERVICE_PREFERENCE - specialist vs local service choice (conditional on C3Q10=Yes)
- **NEW:** C3Q12_SOCIAL_SERVICES - social services involvement check
- **NEW:** TERMINAL_SOCIAL_SERVICES_GUIDANCE - conditional guidance for young people not engaged with SS
- **UPDATED:** B12A_WHICH_ORG - warmer text, captures org name for exclusion filtering
- **NEW:** B12A_WHICH_ORG__SUPPORTER - supporter variant (was missing)
- **13 new PHRASE_KEYs** added with SUPPORTER variants where appropriate

**v7 Changes (Presentation Standards + Version Alignment):**
- **VERSION ALIGNMENT:** All system files now v7 for consistency
- **ALL URLs now include https:// prefix** for guaranteed clickability across all interfaces
- **ASCII only** - removed all emojis, special characters, and curly quotes
- **Fixed encoding issues** in B7D prevention profiling section (curly quotes replaced with standard dashes)
- **Added URLs to advice keys** that previously lacked them (ADVICE_COUNCIL_PROCESS, ADVICE_PRIORITY_NEED)
- **NEW:** LOCAL_AUTHORITY_FALLBACK - universal fallback when API unavailable
- **NEW:** LOCAL_AUTHORITY_FALLBACK_EXTENDED - extended fallback with Shelter contact for crisis situations
- **Updated OUTPUT_PRESENTATION_SPEC** - removed emoji guidance, added ASCII-only formatting rules
- All actionable outputs now have clickable links or phone numbers
- Cross-references updated to v7 filenames

**v6.6 Changes (Prevention Pathway + Advice-First Path):**
- **CRITICAL LOGIC FIX:** Housed users no longer asked homelessness-profiling questions
- **NEW ADVICE FLOW:** B4_ADVICE_TOPIC_SELECTION and ADVICE_BRIDGE enable advice-first pathway
- **NEW:** B4_ADVICE_TOPIC_SELECTION - structured menu for advice topics (6 options)
- **NEW:** ADVICE_BRIDGE - continuation/service connection prompt after advice delivery
- **NEW:** B7_HOUSED_SITUATION - replaces B7 for users who answer "No" at B6
- **NEW:** B7A_PREVENTION_GATE - explicit question asking if user is at risk of losing home
- **NEW:** B7B_PREVENTION_REASON - collects reason for housing risk (rent arrears, eviction, etc.)
- **NEW:** B7C_PREVENTION_URGENCY - assesses urgency of prevention need
- **RENAMED:** B7_SLEEPING_SITUATION -> B7_HOMELESS_SLEEPING_SITUATION (only for B6="Yes" users)
- **ROUTING CHANGE:** B6="No" + B7="At home" now branches to prevention, not homeless questions
- **ROUTING CHANGE:** GATE1_INTENT "Advice" selection now routes to B4_ADVICE_TOPIC_SELECTION
- **ROUTING IMPROVEMENT:** Sofa surfing correctly routes to homelessness support even if B6="No"
- **12 new PHRASE_KEYs added** with full SUPPORTER variants (8 prevention + 4 advice flow)
- All existing v6.5 content preserved
- Links v6.5 prevention advice keys into active routing flow

## v6.5 note introduces **pre-crisis stabilisation advice** for users who are still housed but at risk of losing their accommodation.

These additions:
- are **additive only** and do not change existing flows
- sit after `ADVICE_EVICTION_RISK_PREVENTION`
- provide optional, non-directive early help
- do **not** reposition the assistant as a prevention tool
- do **not** introduce screening, scoring, or assessment
- preserve crisis-first safeguarding and user agency

All existing Phrasebank content and behaviour remain unchanged.

**v6.4 Changes (England + Scotland, URL-complete, Escalation Safety):**
- All URL additions from Organization_URLs_Ready_to_Implement.md and Organization_URL_Requirements_v6.1.md fully applied
- StreetLink phone number removed (web-only service)
- Canonical StreetLink URLs standardized (both main site and report form)
- Shelter, Citizens Advice, Crisis UK, Samaritans, DV, financial and immigration org URLs embedded
- **Scotland support added:**
  - 4 new Scotland-specific ADVICE_* keys (ADVICE_HOMELESSNESS_SCOTLAND, ADVICE_NO_PRIORITY_NEED_SCOTLAND, ADVICE_EVICTION_RISK_SCOTLAND, DOMESTIC_ABUSE_HOUSING_SCOTLAND)
  - England-only concepts (e.g. priority need) not used for Scotland
  - Shelter Scotland signposting
  - Jurisdiction note added for DV exits (routing must substitute scotland.shelter.org.uk for Scottish LAs)
  - Scotland-safe wording applied to FIRE_FLOOD exits (removes England-specific "priority" framing)
- **ESCALATION SAFETY SYSTEM added (NEW - deployment-critical):**
  - 9 new safety escalation PHRASE_KEYs (ESCALATION_LEVEL_1_BRIDGE, ESCALATION_LEVEL_2_INTERVENTION, ESCALATION_LEVEL_3_EXIT, CHECKPOINT_REGROUNDING, ESCALATION_SCOPE_CLARIFICATION + SUPPORTER variants)
  - Prevents harm from confusion loops, abandonment, and mismatched expectations
  - 3-level escalation system with conditional de-escalation
  - Re-grounding checkpoints to prevent user disengagement
  - Based on proven safety patterns from healthcare, benefits, and crisis chatbot sectors
  - See Escalation_Threshold_System_v1.0.md for full specification
  - **CRITICAL: This system is NOT OPTIONAL - required before deployment with vulnerable users**
- No changes to: Core routing order, safeguarding priority (safeguarding always overrides escalation)
- England remains default jurisdiction unless Scotland Local Authority detected

**v6.2 Changes:**
- Language-only revision following warmth, trauma-informed, and tone audit
- Softer human openings applied across all prompts
- Trauma-informed phrasing throughout
- Human-first sentence structure
- Consistent Street Support voice
- No changes to intent, routing, safeguards, placeholders, or PHRASE_KEY structure
- No changes to logic, analytics, or eligibility meaning

**v6.1 Changes:**
- Added WMCA_ONLY_SCOPE_NOTICE for geographic scope boundary handling
- Supports Pre-Gate Capture (language and advice intent detection before first response)
- Supports Post-Crisis Flush (deferred advice execution after crisis gate cleared)

**v6.0 Changes:**
- Added ADVICE MODE section with 10 intent-mapped ADVICE_* PHRASE_KEYs
- Advice content now integrated into phrasebank structure (consistent retrieval pattern)
- Each ADVICE_* key includes INTENT_PATTERNS for question matching
- Deprecates separate prep_advice_general_homelessness_v_1.md file
- Maintains all v5 content (40 __SUPPORTER variants)
- Translation infrastructure ready (advice content follows same pattern as other phrases)

**v5.0 Changes:**
- Added SUPPORTER mode variants for all relevant PHRASE_KEYs
- Added MODE ROUTING LOGIC section explaining when to use SELF vs SUPPORTER variants
- Total of 40 PHRASE_KEYs now have __SUPPORTER variants

---

## HOW THIS FILE IS USED

The routing logic file references PHRASE_KEYs like:
- `PROMPT_KEY: GATE0_CRISIS_DANGER`
- `PHRASE_KEY: TERMINAL_CHECKIN`

**When you see a PHRASE_KEY reference:**
1. Find the matching `## PHRASE_KEY:` section in this file
2. Determine whether to use SELF or SUPPORTER variant (see MODE ROUTING LOGIC below)
3. Locate `USER_TEXT (EXACT - copy/paste only):`
4. Output that text verbatim
5. Do NOT add wrappers, preambles, or modifications

---

## MODE ROUTING LOGIC

### Determining SELF vs SUPPORTER Mode

**Mode Variable: WHO_FOR**

The mode is determined by the user's answer to PHRASE_KEY: B2_WHO_FOR

**Mode Selection:**

| User answered B2_WHO_FOR with: | Mode to use | Variant suffix |
|--------------------------------|-------------|----------------|
| "Myself" | SELF | (none - use base PHRASE_KEY) |
| "Someone I'm supporting" | SUPPORTER | __SUPPORTER |
| "I'm a professional / organisation" | SUPPORTER | __SUPPORTER |
| "Not sure / just need help finding the right place" | SELF | (none - use base PHRASE_KEY) |

**How to apply mode:**

1. Store the WHO_FOR value as a session variable
2. For each subsequent PHRASE_KEY request:
   - Check if a `PHRASE_KEY__SUPPORTER` variant exists
   - If WHO_FOR indicates SUPPORTER mode AND `__SUPPORTER` variant exists -> use `PHRASE_KEY__SUPPORTER`
   - Otherwise -> use base `PHRASE_KEY`

**Example:**

```
User answered B2_WHO_FOR: "Someone I'm supporting"
Routing logic requests: GATE0_CRISIS_DANGER

Check: Does GATE0_CRISIS_DANGER__SUPPORTER exist? YES
Action: Use GATE0_CRISIS_DANGER__SUPPORTER
```

**PHRASE_KEYs with __SUPPORTER variants:**

The following 40 PHRASE_KEYs have SUPPORTER variants:
- GATE0_CRISIS_DANGER
- GATE1_INTENT
- B1_LOCAL_AUTHORITY
- B5_MAIN_SUPPORT_NEED
- B6_HOMELESSNESS_STATUS
- B7_HOUSED_SITUATION
- B7_HOMELESS_SLEEPING_SITUATION (formerly B7_SLEEPING_SITUATION)
- B7A_PREVENTION_GATE
- B7B_PREVENTION_REASON
- B7C_PREVENTION_URGENCY
- B8_DURATION
- B9_REASON
- B10_INCOME
- B11_PRIOR_USE
- B12_ALREADY_SUPPORTED
- B12B_WHAT_HELP
- C2_CONSENT_GATE
- C2A_CONSENT_ACKNOWLEDGED
- C3Q1_IMMIGRATION_STATUS
- C3Q1A_EUSS_FOLLOWUP
- C3Q1B_PUBLIC_FUNDS_FOLLOWUP
- C3Q2_DEPENDENT_CHILDREN
- C3Q3_AGE
- C3Q4_GENDER
- C3Q5_PREGNANCY
- C3Q6_ETHNICITY
- C3Q7_PHYSICAL_HEALTH
- C3Q8_MENTAL_HEALTH
- C3Q9_CRIMINAL_CONVICTIONS
- C3Q10_LGBTQ
- C3Q11_CURRENTLY_IN_CARE
- DV_FEMALE_CHILDREN_YES
- DV_FEMALE_CHILDREN_NO
- DV_MALE_CHILDREN_YES
- DV_MALE_CHILDREN_NO
- DV_LGBTQ_CHILDREN_YES
- DV_LGBTQ_CHILDREN_NO
- SA_FEMALE_16PLUS
- SA_MALE_16PLUS
- SA_LGBTQ_OR_NONBINARY
- SELF_HARM_EXIT
- CHILD_AT_RISK_EXIT
- FIRE_FLOOD_EXIT
- TERMINAL_CHECKIN
- ADVICE_BOUNDARY
- DEBT_HELP_NATIONAL

**PHRASE_KEYs with NO __SUPPORTER variant** (use base version for all modes):

All other PHRASE_KEYs including:
- OPENING_LINE, LANG_HINT_LINE
- B2_WHO_FOR (this is the gate question)
- B2A_CALL_YOU_OPTIONAL, B2B_CALL_THEM_OPTIONAL, B3_ACCESS_CONTEXT_OPTIONAL, B4_POLITE_NAME_OPTIONAL
- B12A_WHICH_ORG
- STREETLINK_SIGNPOST
- TERMINAL_GOODBYE
- All ADVICE_* keys (14 keys: ADVICE_COUNCIL_PROCESS, ADVICE_LEGALLY_HOMELESS, ADVICE_PRIORITY_NEED, ADVICE_SOFA_SURFING, ADVICE_EVICTION_RISK_PREVENTION, ADVICE_SLEEP_TONIGHT, ADVICE_COUNCIL_CANT_HELP_TODAY, ADVICE_REGISTER_SOCIAL_HOUSING, ADVICE_REPORT_ROUGH_SLEEPING, ADVICE_HOMELESSNESS_SCOTLAND, ADVICE_NO_PRIORITY_NEED_SCOTLAND, ADVICE_EVICTION_RISK_SCOTLAND, DOMESTIC_ABUSE_HOUSING_SCOTLAND)
- All ESCALATION_* keys (9 keys: ESCALATION_LEVEL_1_BRIDGE, ESCALATION_LEVEL_1_BRIDGE__SUPPORTER, ESCALATION_LEVEL_2_INTERVENTION, ESCALATION_LEVEL_2_INTERVENTION__SUPPORTER, ESCALATION_LEVEL_3_EXIT, CHECKPOINT_REGROUNDING, CHECKPOINT_REGROUNDING__SUPPORTER, ESCALATION_SCOPE_CLARIFICATION, ESCALATION_SCOPE_CLARIFICATION__SUPPORTER)
- All formatting/behavioral specs (OUTPUT_PRESENTATION_SPEC, ADVICE_MODE_RULES, NEVER_ASK_LIST, PRE_OUTPUT_CHECKLIST)
- All out-of-scope responses (OUT_OF_SCOPE_GENERAL, OUT_OF_SCOPE_AFTER_TERMINAL, WMCA_ONLY_SCOPE_NOTICE)

---

## ABSOLUTE RULES

- **NEVER paraphrase** any USER_TEXT
- **NEVER add wrappers** around USER_TEXT
- **NEVER modify** USER_TEXT for "tone" or "flow"
- **ALWAYS print exactly** what appears in USER_TEXT block
- **IF you paraphrased**, you MUST re-ask using exact USER_TEXT

**Training bleed detection:**
If you find yourself thinking:
- "I should make this sound warmer..."
- "Let me add a transition..."
- "I'll combine these for efficiency..."
- "The user would prefer if I..."

-> Stop. Return to protocol. Print USER_TEXT exactly.

---

## OUTPUT CONTRACT (APPLIES TO EVERY PHRASE_KEY)

Each PHRASE_KEY section specifies:
- `OUTPUT CONTRACT:` Requirements for this specific output
- `USER_TEXT (EXACT - copy/paste only):` The immutable text
- `NO EXTRA WRAPPERS:` Whether wrappers are forbidden (usually true)


**You must honor the OUTPUT CONTRACT for every PHRASE_KEY.**

---

# PHRASEBANK (COPY-EXACT UI STRINGS)

> All USER_TEXT below is immutable. Print it exactly as written.

---

## PHRASE_KEY: OPENING_LINE

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Hello. I'm here to help you find support in your area."

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: LANG_HINT_LINE

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"If you'd prefer to use a different language, just reply in that language and I'll do my best to continue."

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: GATE0_CRISIS_DANGER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Before continuing, I need to check something important.

Are you in crisis or danger right now?

Please reply with the number that fits best:
1. Immediate physical danger
2. Domestic abuse
3. Sexual violence
4. Thoughts of harming myself
5. Under 16 and need protection
6. Lost home due to fire, flood, or emergency
7. None of these apply"

ALLOWED_RESPONSES (enumerated):
1. Immediate physical danger
2. Domestic abuse
3. Sexual violence
4. Thoughts of harming myself
5. Under 16 and need protection
6. Lost home due to fire, flood, or emergency
7. None of these apply

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: GATE0_CRISIS_DANGER__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Before continuing, please check something important with them.

Which of these fits their situation best?

- Immediate physical danger
- Domestic abuse
- Sexual violence
- Thoughts of harming themselves
- Under 16 and need protection
- Lost home due to fire, flood, or emergency
- None of these apply"

ALLOWED_RESPONSES (enumerated):
1. Immediate physical danger
2. Domestic abuse
3. Sexual violence
4. Thoughts of harming themselves
5. Under 16 and need protection
6. Lost home due to fire, flood, or emergency
7. None of these apply

NO EXTRA WRAPPERS: true

---

## PHRASE_KEY: GATE1_INTENT

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"What are you looking for today?

- Advice (information or explanation)
- Help connecting to support (we'll guide you through)
- Details for a specific organisation"

ALLOWED_RESPONSES (enumerated):
1. Advice (information or explanation)
2. Help connecting to support (we'll guide you through)
3. Details for a specific organisation

NO EXTRA WRAPPERS: true


---

---

## PHRASE_KEY: B4_ADVICE_TOPIC_SELECTION

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"What would you like information about?

- Your rights and eligibility for housing help
- Preventing homelessness (keeping your home)
- How council housing processes work
- What support services are available
- Eviction, notices, and emergency situations
- Other housing or homelessness question"

ALLOWED_RESPONSES (enumerated):
1. Your rights and eligibility for housing help
2. Preventing homelessness (keeping your home)
3. How council housing processes work
4. What support services are available
5. Eviction, notices, and emergency situations
6. Other housing or homelessness question

INTENT_MAPPING:
- Option 1 -> ADVICE_HOMELESSNESS_RIGHTS, ADVICE_PRIORITY_NEED (or _SCOTLAND variants)
- Option 2 -> ADVICE_EVICTION_RISK_PREVENTION, ADVICE_PREVENTION_* keys
- Option 3 -> ADVICE_COUNCIL_DUTY, ADVICE_HOUSING_APPLICATION
- Option 4 -> General service overview (may require location)
- Option 5 -> ADVICE_EVICTION_IMMEDIATE, ADVICE_ILLEGAL_EVICTION
- Option 6 -> Open question matching via INTENT_PATTERNS

NO EXTRA WRAPPERS: true

---

## PHRASE_KEY: B4_ADVICE_TOPIC_SELECTION__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"What would they like information about?

- Their rights and eligibility for housing help
- Preventing homelessness (keeping their home)
- How council housing processes work
- What support services are available
- Eviction, notices, and emergency situations
- Other housing or homelessness question"

ALLOWED_RESPONSES (enumerated):
1. Their rights and eligibility for housing help
2. Preventing homelessness (keeping their home)
3. How council housing processes work
4. What support services are available
5. Eviction, notices, and emergency situations
6. Other housing or homelessness question

INTENT_MAPPING: (same as SELF variant)

NO EXTRA WRAPPERS: true

---

## PHRASE_KEY: ADVICE_BOUNDARY

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I can explain how things usually work, but for advice about your specific situation it's best to speak to a specialist service. I can help you find one."

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: ADVICE_BOUNDARY__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I can explain how things usually work, but for advice about their specific situation it's best to speak to a specialist service. I can help you find one."

NO EXTRA WRAPPERS: true


---


## PHRASE_KEY: DEBT_HELP_NATIONAL

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Financial struggles are tough.
We'll do everything we can to connect you with local support.
You might also find these resources helpful:

Money and debt advice | CAP UK - https://capuk.org/money-and-debt-advice

Debt Advice from StepChange - https://www.stepchange.org/

Support with Benefits and Grants | Turn2us - https://www.turn2us.org.uk/"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: DEBT_HELP_NATIONAL__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Financial struggles are tough.
We'll do everything we can to connect you with local support.
You might also find these resources helpful:

Money and debt advice | CAP UK - https://capuk.org/money-and-debt-advice

Debt Advice from StepChange - https://www.stepchange.org/

Support with Benefits and Grants | Turn2us - https://www.turn2us.org.uk/"

NO EXTRA WRAPPERS: true

---

## PHRASE_KEY: ADVICE_BRIDGE

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Is there anything else I can help with?

- Connect me to support services
- I have another question
- That's all I needed, thanks"

ALLOWED_RESPONSES (enumerated):
1. Connect me to support services
2. I have another question
3. That's all I needed, thanks

NO EXTRA WRAPPERS: true

---

## PHRASE_KEY: ADVICE_BRIDGE__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Is there anything else I can help with?

- Connect them to support services
- We have another question
- That's all we needed, thanks"

ALLOWED_RESPONSES (enumerated):
1. Connect them to support services
2. We have another question
3. That's all we needed, thanks

NO EXTRA WRAPPERS: true

---

## PHRASE_KEY: GATE1_INTENT__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"What are they looking for today?

- Advice (information or explanation)
- Help connecting to support (we'll guide you through)
- Details for a specific organisation"

ALLOWED_RESPONSES (enumerated):
1. Advice (information or explanation)
2. Help connecting to support (we'll guide you through)
3. Details for a specific organisation

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: GATE2_ROUTE_SELECTION

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I'll ask a few questions to understand what support might help most. It usually takes about five minutes.

The full guided route asks about things like health conditions, immigration status, criminal convictions, and other circumstances that might affect which services can help you. Some services are specifically designed for people in particular situations, so these questions help us find the best match.

If none of those apply to you, the quicker route will assume the answers are 'no' or 'none' and get you to relevant services faster.

This is entirely up to you.

Which would you prefer?

- Full Guided Route (tailored support)
- Quicker Route (general support)"

ALLOWED_RESPONSES (enumerated):
1. Full Guided Route (tailored support)
2. Quicker Route (general support)

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B1_LOCAL_AUTHORITY

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Which local authority are you in (or want to get support from)?

- Wolverhampton
- Coventry
- Birmingham
- Walsall
- Solihull
- Dudley
- Sandwell
- Other / not sure"

ALLOWED_RESPONSES (enumerated):
1. Wolverhampton
2. Coventry
3. Birmingham
4. Walsall
5. Solihull
6. Dudley
7. Sandwell
8. Other / not sure

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B1_LOCAL_AUTHORITY__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Which local authority are they in (or want to get support from)?

- Wolverhampton
- Coventry
- Birmingham
- Walsall
- Solihull
- Dudley
- Sandwell
- Other / not sure"

ALLOWED_RESPONSES (enumerated):
1. Wolverhampton
2. Coventry
3. Birmingham
4. Walsall
5. Solihull
6. Dudley
7. Sandwell
8. Other / not sure

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B2_WHO_FOR

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Are you looking for support for yourself, or for someone else?

- Myself
- Someone I'm supporting
- I'm a professional or organisation
- Not sure / just trying to find the right place"

ALLOWED_RESPONSES (enumerated):
1. Myself
2. Someone I'm supporting
3. I'm a professional or organisation
4. Not sure / just trying to find the right place

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B2A_CALL_YOU_OPTIONAL

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"What would you like me to call you?"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B2B_CALL_THEM_OPTIONAL

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"What would they like to be called?"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B3_ACCESS_CONTEXT_OPTIONAL

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Where are you accessing this from? (For example: home, library, community centre, phone, somewhere else)"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B4_POLITE_NAME_OPTIONAL

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"What would you like me to call you?"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B5_MAIN_SUPPORT_NEED

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"What kind of support are you looking for?

- Emergency Housing or Other Accommodation
- Food
- Work
- Health Services
- Advice Services
- Drop In
- Financial Help
- Personal Items
- Personal Services
- Communications
- Training
- Activities"

ALLOWED_RESPONSES (enumerated):
1. Emergency Housing or Other Accommodation
2. Food
3. Work
4. Health Services
5. Advice Services
6. Drop In
7. Financial Help
8. Personal Items
9. Personal Services
10. Communications
11. Training
12. Activities

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B5_MAIN_SUPPORT_NEED__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"What kind of support are they looking for?

- Emergency Housing or Other Accommodation
- Food
- Work
- Health Services
- Advice Services
- Drop In
- Financial Help
- Personal Items
- Personal Services
- Communications
- Training
- Activities"

ALLOWED_RESPONSES (enumerated):
1. Emergency Housing or Other Accommodation
2. Food
3. Work
4. Health Services
5. Advice Services
6. Drop In
7. Financial Help
8. Personal Items
9. Personal Services
10. Communications
11. Training
12. Activities

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B6_HOMELESSNESS_STATUS

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Are you currently experiencing homelessness?

That includes if you don't have your own place and you're staying in temporary accommodation, hospital, prison, or somewhere that isn't your permanent home.

- Yes
- No"

ALLOWED_RESPONSES (enumerated):
1. Yes
2. No

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B6_HOMELESSNESS_STATUS__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Are they currently experiencing homelessness?

That includes if they don't have their own place and they're staying in temporary accommodation, hospital, prison, or somewhere that isn't their permanent home.

- Yes
- No"

ALLOWED_RESPONSES (enumerated):
1. Yes
2. No

NO EXTRA WRAPPERS: true

## PHRASE_KEY: B7_HOUSED_SITUATION

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Thank you for reaching out. Whatever's brought you here, I'll do my best to help.

Where are you living at the moment?

- At home (your own tenancy or ownership)
- Staying temporarily with friends or family
- Temporary accommodation arranged by the council
- Other temporary situation"

ALLOWED_RESPONSES (enumerated):
1. At home (your own tenancy or ownership)
2. Staying temporarily with friends or family
3. Temporary accommodation arranged by the council
4. Other temporary situation

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B7_HOUSED_SITUATION__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Thank you for reaching out on their behalf. Whatever's brought you here, I'll do my best to help.

Where are they living at the moment?

- At home (their own tenancy or ownership)
- Staying temporarily with friends or family
- Temporary accommodation arranged by the council
- Other temporary situation"

ALLOWED_RESPONSES (enumerated):
1. At home (their own tenancy or ownership)
2. Staying temporarily with friends or family
3. Temporary accommodation arranged by the council
4. Other temporary situation

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B7A_PREVENTION_GATE

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"You mentioned you're at home right now. Are you worried about losing your accommodation, or are you looking for information about housing options?

- Yes, I'm at risk of losing my home
- No, I'm just looking for general information
- Actually, I need to change my previous answer"

ALLOWED_RESPONSES (enumerated):
1. Yes, I'm at risk of losing my home
2. No, I'm just looking for general information
3. Actually, I need to change my previous answer

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B7A_PREVENTION_GATE__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"You mentioned they're at home right now. Are they worried about losing their accommodation, or are you looking for information about housing options?

- Yes, they're at risk of losing their home
- No, just looking for general information
- Actually, I need to change the previous answer"

ALLOWED_RESPONSES (enumerated):
1. Yes, they're at risk of losing their home
2. No, just looking for general information
3. Actually, I need to change the previous answer

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B7B_PREVENTION_REASON

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"What's making you worried about losing your home?

- Rent arrears or struggling to pay rent
- Eviction notice or landlord wants me to leave
- Mortgage arrears
- Notice to leave from family or friends
- Other financial difficulties
- Prefer not to say"

ALLOWED_RESPONSES (enumerated):
1. Rent arrears or struggling to pay rent
2. Eviction notice or landlord wants me to leave
3. Mortgage arrears
4. Notice to leave from family or friends
5. Other financial difficulties
6. Prefer not to say

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B7B_PREVENTION_REASON__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"What's making them worried about losing their home?

- Rent arrears or struggling to pay rent
- Eviction notice or landlord wants them to leave
- Mortgage arrears
- Notice to leave from family or friends
- Other financial difficulties
- Prefer not to say"

ALLOWED_RESPONSES (enumerated):
1. Rent arrears or struggling to pay rent
2. Eviction notice or landlord wants them to leave
3. Mortgage arrears
4. Notice to leave from family or friends
5. Other financial difficulties
6. Prefer not to say

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B7C_PREVENTION_URGENCY

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"How urgent does this feel right now?

- It's happening now or very soon (days or weeks)
- It's a worry but not immediate (months away)
- Not sure / just want to understand my options"

ALLOWED_RESPONSES (enumerated):
1. It's happening now or very soon (days or weeks)
2. It's a worry but not immediate (months away)
3. Not sure / just want to understand my options

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B7C_PREVENTION_URGENCY__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"How urgent does this feel for them right now?

- It's happening now or very soon (days or weeks)
- It's a worry but not immediate (months away)
- Not sure / they just want to understand their options"

ALLOWED_RESPONSES (enumerated):
1. It's happening now or very soon (days or weeks)
2. It's a worry but not immediate (months away)
3. Not sure / they just want to understand their options

NO EXTRA WRAPPERS: true

---

## PHRASE_KEY: B7_HOMELESS_SLEEPING_SITUATION

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I'm sorry you're going through this. Let me ask a few more questions so I can find the right support for you.

Where are you sleeping at the moment? This helps us understand what kind of support might work for you.

- Rough sleeping (on the streets, in doorways, parks, or similar)
- Emergency accommodation (hostel, shelter, night shelter)
- Sofa surfing (staying temporarily with friends or family)
- Temporary accommodation arranged by the council
- Other temporary situation"

ALLOWED_RESPONSES (enumerated):
1. Rough sleeping (on the streets, in doorways, parks, or similar)
2. Emergency accommodation (hostel, shelter, night shelter)
3. Sofa surfing (staying temporarily with friends or family)
4. Temporary accommodation arranged by the council
5. Other temporary situation

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B7_HOMELESS_SLEEPING_SITUATION__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I'm sorry they're going through this. Let me ask a few more questions so I can find the right support for them.

Where are they sleeping at the moment? This helps us understand what kind of support might work for them.

- Rough sleeping (on the streets, in doorways, parks, or similar)
- Emergency accommodation (hostel, shelter, night shelter)
- Sofa surfing (staying temporarily with friends or family)
- Temporary accommodation arranged by the council
- Other temporary situation"

ALLOWED_RESPONSES (enumerated):
1. Rough sleeping (on the streets, in doorways, parks, or similar)
2. Emergency accommodation (hostel, shelter, night shelter)
3. Sofa surfing (staying temporarily with friends or family)
4. Temporary accommodation arranged by the council
5. Other temporary situation

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: STREETLINK_SIGNPOST

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"If you'd like to, you can make a StreetLink alert. This lets your local outreach team know where you are so they can try to find you and offer support. You can do that here:
https://streetlink.org.uk

Once you submit the alert, your information goes straight to a local outreach team. They'll do their best to find you, check in, and connect you with the right help.

StreetLink doesn't provide housing directly, but it helps link people sleeping rough with services that can.

In the meantime, keep chatting with me. I can help you look for more support now."

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B8_DURATION

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"How long has this been going on?

- Less than a week
- 1-4 weeks
- 1-6 months
- 6-12 months
- Over a year"

ALLOWED_RESPONSES (enumerated):
1. Less than a week
2. 1-4 weeks
3. 1-6 months
4. 6-12 months
5. Over a year

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B8_DURATION__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"How long has this been going on for them?

- Less than a week
- 1-4 weeks
- 1-6 months
- 6-12 months
- Over a year"

ALLOWED_RESPONSES (enumerated):
1. Less than a week
2. 1-4 weeks
3. 1-6 months
4. 6-12 months
5. Over a year

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B9_REASON

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"This next question is personal, and you can choose 'prefer not to say' if you'd rather skip it. Understanding what led to your situation helps me find the most relevant support.

What do you think is the main reason?

- Relationship breakdown
- Domestic abuse
- Lost job or financial difficulties
- Asked to leave by family or friends
- End of tenancy or eviction
- Leaving prison or hospital
- Mental health difficulties
- Substance use
- Other / prefer not to say"

ALLOWED_RESPONSES (enumerated):
1. Relationship breakdown
2. Domestic abuse
3. Lost job or financial difficulties
4. Asked to leave by family or friends
5. End of tenancy or eviction
6. Leaving prison or hospital
7. Mental health difficulties
8. Substance use
9. Other / prefer not to say

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B9_REASON__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"This next question is personal, and you can choose 'prefer not to say' if they'd rather skip it. Understanding what led to their situation helps me find the most relevant support.

What do they think is the main reason?

- Relationship breakdown
- Domestic abuse
- Lost job or financial difficulties
- Asked to leave by family or friends
- End of tenancy or eviction
- Leaving prison or hospital
- Mental health difficulties
- Substance use
- Other / prefer not to say"

ALLOWED_RESPONSES (enumerated):
1. Relationship breakdown
2. Domestic abuse
3. Lost job or financial difficulties
4. Asked to leave by family or friends
5. End of tenancy or eviction
6. Leaving prison or hospital
7. Mental health difficulties
8. Substance use
9. Other / prefer not to say

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B9C_MENTAL_HEALTH_ACKNOWLEDGMENT

CATEGORY: CONDITIONAL_ACKNOWLEDGMENT
TRIGGER: B9_REASON = "Mental health difficulties"

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Thank you for sharing that. Mental health can affect so many parts of life, and it takes courage to talk about it. I'll keep this in mind as I help you find support."

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B9C_MENTAL_HEALTH_ACKNOWLEDGMENT__SUPPORTER

CATEGORY: CONDITIONAL_ACKNOWLEDGMENT
TRIGGER: B9_REASON = "Mental health difficulties" AND SUPPORTER mode

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Thank you for sharing that. Mental health can affect so many parts of life. I'll keep this in mind as I help find support for them."

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B10_INCOME

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Do you currently have any income?

- Yes, through employment
- Yes, through benefits
- Yes, through family or friends
- No income at all
- Prefer not to say"

ALLOWED_RESPONSES (enumerated):
1. Yes, through employment
2. Yes, through benefits
3. Yes, through family or friends
4. No income at all
5. Prefer not to say

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B10_INCOME__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Do they currently have any income?

- Yes, through employment
- Yes, through benefits
- Yes, through family or friends
- No income at all
- Prefer not to say"

ALLOWED_RESPONSES (enumerated):
1. Yes, through employment
2. Yes, through benefits
3. Yes, through family or friends
4. No income at all
5. Prefer not to say

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B10_INCOME__JOB_LOSS

CATEGORY: CONDITIONAL_VARIANT
TRIGGER: B9_REASON = "Lost job or financial difficulties"

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Do you currently have any income?

- Yes, through benefits
- Yes, through family or friends
- Some income from occasional or part-time work
- No income at all
- Prefer not to say"

ALLOWED_RESPONSES (enumerated):
1. Yes, through benefits
2. Yes, through family or friends
3. Some income from occasional or part-time work
4. No income at all
5. Prefer not to say

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B10_INCOME__JOB_LOSS__SUPPORTER

CATEGORY: CONDITIONAL_VARIANT
TRIGGER: B9_REASON = "Lost job or financial difficulties" AND SUPPORTER mode

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Do they currently have any income?

- Yes, through benefits
- Yes, through family or friends
- Some income from occasional or part-time work
- No income at all
- Prefer not to say"

ALLOWED_RESPONSES (enumerated):
1. Yes, through benefits
2. Yes, through family or friends
3. Some income from occasional or part-time work
4. No income at all
5. Prefer not to say

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B11_PRIOR_USE

It's fine if you're not sure. We just want to understand how best to help.

- Yes
- No
- Not sure"

ALLOWED_RESPONSES (enumerated):
1. Yes
2. No
3. Not sure

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B11_PRIOR_USE__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Have they used Street Support Network before?

It's fine if they're not sure. We just want to understand how best to help.

- Yes
- No
- Not sure"

ALLOWED_RESPONSES (enumerated):
1. Yes
2. No
3. Not sure

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B12_ALREADY_SUPPORTED

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Are you currently getting support from any organisation? This helps me avoid recommending the same service you're already using.

- Yes
- No"

ALLOWED_RESPONSES (enumerated):
1. Yes
2. No

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B12_ALREADY_SUPPORTED__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Are they currently getting support from any organisation? This helps me avoid recommending the same service they're already using.

- Yes
- No"

ALLOWED_RESPONSES (enumerated):
1. Yes
2. No

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B12A_WHICH_ORG

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

PURPOSE: Capture name of current supporting organisation to exclude from recommendations.

USER_TEXT (EXACT - copy/paste only):

"Which organisation is supporting you? Just type the name if you know it, or describe them if you're not sure."

STORE: current_supporting_org (free text, used to filter service results)

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B12A_WHICH_ORG__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Which organisation is supporting them? Just type the name if you know it, or describe them if you're not sure."

STORE: current_supporting_org (free text)

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B12B_WHAT_HELP

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"What help are they offering you?"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B12B_WHAT_HELP__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"What help are they getting?"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C2_CONSENT_GATE

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Thanks for sharing that. To help you find the right support, I need to ask a few more questions.

Some of these might be about sensitive topics - like your health, ethnicity, or sexual orientation. I only ask because certain services are designed for people in particular circumstances, and this helps me guide you to the right places.

- We don't collect or store anything that can personally identify you
- Your answers are only used to match you with the right organisation
- You can skip any question or choose "Prefer not to say"

If you'd like to know more about how we handle privacy and data, you can read more here: https://streetsupport.net/about/privacy-and-data/

Do you give your consent for me to ask these additional questions? Your answers will only be used to match you with appropriate services and will not be stored with any personally identifying information.

- Yes, I consent
- No, I do not consent"

ALLOWED_RESPONSES (enumerated):
1. Yes, I consent
2. No, I do not consent

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C2_CONSENT_GATE__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Thanks for sharing that. To help them find the right support, I need to ask a few more questions.

Some of these might be about sensitive topics - like their health, ethnicity, or sexual orientation. I only ask because certain services are designed for people in particular circumstances, and this helps me guide them to the right places.

Please check with them before you answer.

- We don't collect or store anything that can personally identify them
- Their answers are only used to match them with the right organisation
- They can skip any question or choose "Prefer not to say"

If they'd like to know more about how we handle privacy and data, you can read more here: https://streetsupport.net/about/privacy-and-data/

Do they give their consent for me to ask these additional questions? Their answers will only be used to match them with appropriate services and will not be stored with any personally identifying information.

- Yes, they consent
- No, they do not consent"

ALLOWED_RESPONSES (enumerated):
1. Yes, they consent
2. No, they do not consent

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C2A_CONSENT_ACKNOWLEDGED

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Thank you. I'll ask about a few different topics now - health, background, and circumstances. Remember you can skip any question or say 'prefer not to say'."

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C2A_CONSENT_ACKNOWLEDGED__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Thank you. I'll ask about a few different topics now - health, background, and circumstances. Remember they can skip any question or say 'prefer not to say'."

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q1_IMMIGRATION_STATUS

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"What is your immigration status?

- British National
- EU Settlement Scheme (settled or pre-settled status)
- Refugee status
- Leave to remain
- Asylum seeker
- No immigration status
- Prefer not to say / Not sure"

ALLOWED_RESPONSES (enumerated):
1. British National
2. EU Settlement Scheme (settled or pre-settled status)
3. Refugee status
4. Leave to remain
5. Asylum seeker
6. No immigration status
7. Prefer not to say / Not sure

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q1_IMMIGRATION_STATUS__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"What is their immigration status?

- British National
- EU Settlement Scheme (settled or pre-settled status)
- Refugee status
- Leave to remain
- Asylum seeker
- No immigration status
- Prefer not to say / Not sure"

ALLOWED_RESPONSES (enumerated):
1. British National
2. EU Settlement Scheme (settled or pre-settled status)
3. Refugee status
4. Leave to remain
5. Asylum seeker
6. No immigration status
7. Prefer not to say / Not sure

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q1A_EUSS_FOLLOWUP

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Do you have settled status, pre-settled status, or are you unsure?"

ALLOWED_RESPONSES (enumerated):
1. Settled
2. Pre-settled
3. Unsure

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q1A_EUSS_FOLLOWUP__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Do they have settled status, pre-settled status, or are they unsure?"

ALLOWED_RESPONSES (enumerated):
1. Settled
2. Pre-settled
3. Unsure

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q1B_PUBLIC_FUNDS_FOLLOWUP

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Do you have access to public funds?"

ALLOWED_RESPONSES (enumerated):
1. Yes
2. No
3. Not sure

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q1B_PUBLIC_FUNDS_FOLLOWUP__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Do they have access to public funds?"

ALLOWED_RESPONSES (enumerated):
1. Yes
2. No
3. Not sure

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q1C_NRPF_ACKNOWLEDGMENT

CATEGORY: CONDITIONAL_ACKNOWLEDGMENT
TRIGGER: C3Q1_IMMIGRATION_STATUS = "No immigration status"

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Thank you for sharing that. I know this situation can be really difficult. There are still services that can help, and I'll do my best to find the right ones for you."

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q1C_NRPF_ACKNOWLEDGMENT__SUPPORTER

CATEGORY: CONDITIONAL_ACKNOWLEDGMENT
TRIGGER: C3Q1_IMMIGRATION_STATUS = "No immigration status" AND SUPPORTER mode

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Thank you for sharing that. I know this situation can be really difficult. There are still services that can help, and I'll do my best to find the right ones for them."

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q2_DEPENDENT_CHILDREN

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Do you have dependent children?

- Yes
- No"

ALLOWED_RESPONSES (enumerated):
1. Yes
2. No

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q2_DEPENDENT_CHILDREN__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Do they have dependent children?

- Yes
- No"

ALLOWED_RESPONSES (enumerated):
1. Yes
2. No

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q3_AGE

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"How old are you?

- Under 16
- 16-17
- 18-20
- 21-24
- 25+"

ALLOWED_RESPONSES (enumerated):
1. Under 16
2. 16-17
3. 18-20
4. 21-24
5. 25+

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q3_AGE__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"How old are they?

- Under 16
- 16-17
- 18-20
- 21-24
- 25+"

ALLOWED_RESPONSES (enumerated):
1. Under 16
2. 16-17
3. 18-20
4. 21-24
5. 25+

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q4_GENDER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"What is your gender?

Some support services - like accommodation and healthcare - are based on biological factors that affect safety, privacy, or medical needs. That's why we ask about your current biological gender. This helps us make the right recommendations to support you safely and effectively.

We fully respect and support all gender identities. We know this question might not fit perfectly for everyone.

- Male
- Female
- Trans Female (male to female)
- Trans Male (female to male)"

ALLOWED_RESPONSES (enumerated):
1. Male
2. Female
3. Trans Female (male to female)
4. Trans Male (female to male)

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q4_GENDER__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"What is their gender?

Some support services - like accommodation and healthcare - are based on biological factors that affect safety, privacy, or medical needs. That's why we ask about their current biological gender. This helps us make the right recommendations to support them safely and effectively.

We fully respect and support all gender identities. We know this question might not fit perfectly for everyone.

- Male
- Female
- Trans Female (male to female)
- Trans Male (female to male)"

ALLOWED_RESPONSES (enumerated):
1. Male
2. Female
3. Trans Female (male to female)
4. Trans Male (female to male)

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q5_PREGNANCY

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Are you pregnant, or living with someone who is pregnant?

- Yes
- No"

ALLOWED_RESPONSES (enumerated):
1. Yes
2. No

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q5_PREGNANCY__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Are they pregnant, or living with someone who is pregnant?

- Yes
- No"

ALLOWED_RESPONSES (enumerated):
1. Yes
2. No

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q6_ETHNICITY

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"What is your ethnicity?

- White (British)
- White (Other)
- Black (African)
- Black (Caribbean)
- Asian
- Mixed or Multiethnic Groups"

ALLOWED_RESPONSES (enumerated):
1. White (British)
2. White (Other)
3. Black (African)
4. Black (Caribbean)
5. Asian
6. Mixed or Multiethnic Groups

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q6_ETHNICITY__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"What is their ethnicity?

- White (British)
- White (Other)
- Black (African)
- Black (Caribbean)
- Asian
- Mixed or Multiethnic Groups"

ALLOWED_RESPONSES (enumerated):
1. White (British)
2. White (Other)
3. Black (African)
4. Black (Caribbean)
5. Asian
6. Mixed or Multiethnic Groups

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q7_PHYSICAL_HEALTH

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Do you have any physical health conditions we should know about that might affect how an organisation can support you?

- None
- Mobility impairment
- Visual impairment
- Hearing impairment
- Verbal impairment
- Neurological impairment (Parkinson's, Multiple Sclerosis, Stroke)"

ALLOWED_RESPONSES (enumerated):
1. None
2. Mobility impairment
3. Visual impairment
4. Hearing impairment
5. Verbal impairment
6. Neurological impairment (Parkinson's, Multiple Sclerosis, Stroke)

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q7_PHYSICAL_HEALTH__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Do they have any physical health conditions we should know about that might affect how an organisation can support them?

- None
- Mobility impairment
- Visual impairment
- Hearing impairment
- Verbal impairment
- Neurological impairment (Parkinson's, Multiple Sclerosis, Stroke)"

ALLOWED_RESPONSES (enumerated):
1. None
2. Mobility impairment
3. Visual impairment
4. Hearing impairment
5. Verbal impairment
6. Neurological impairment (Parkinson's, Multiple Sclerosis, Stroke)

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q8_MENTAL_HEALTH

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Some services offer specialist support for people with mental health conditions. You can skip this if you'd prefer.

Do you have any mental health conditions an organisation should know about?

- None
- Clinical depression
- Severe anxiety
- PTSD
- Bipolar
- Schizophrenia
- Neurodivergence (ADHD, Autism, OCD)
- Learning difficulties
- Prefer not to say"

ALLOWED_RESPONSES (enumerated):
1. None
2. Clinical depression
3. Severe anxiety
4. PTSD
5. Bipolar
6. Schizophrenia
7. Neurodivergence (ADHD, Autism, OCD)
8. Learning difficulties
9. Prefer not to say

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q8_MENTAL_HEALTH__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Some services offer specialist support for people with mental health conditions. You can skip this if they'd prefer.

Do they have any mental health conditions an organisation should know about?

- None
- Clinical depression
- Severe anxiety
- PTSD
- Bipolar
- Schizophrenia
- Neurodivergence (ADHD, Autism, OCD)
- Learning difficulties
- Prefer not to say"

ALLOWED_RESPONSES (enumerated):
1. None
2. Clinical depression
3. Severe anxiety
4. PTSD
5. Bipolar
6. Schizophrenia
7. Neurodivergence (ADHD, Autism, OCD)
8. Learning difficulties
9. Prefer not to say

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q9_CRIMINAL_CONVICTIONS

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Do you have any unspent criminal convictions? Some services have restrictions, so this helps me find the right ones for you.

If you're not sure whether a conviction is spent, you can find out more here: https://unlock.org.uk/disclosure-calculator/

If your conviction is spent, you don't need to tell us or your housing provider.

For any concerns about disclosing convictions when looking for housing, you can find helpful advice here: https://unlock.org.uk/guide/housing/

- None
- Arson
- Sexual Offences
- Violent Offences
- Prefer not to say"

ALLOWED_RESPONSES (enumerated):
1. None
2. Arson
3. Sexual Offences
4. Violent Offences
5. Prefer not to say

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q9_CRIMINAL_CONVICTIONS__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Do they have any unspent criminal convictions? Some services have restrictions, so this helps me find the right ones for them.

If they're not sure whether a conviction is spent, they can find out more here: https://unlock.org.uk/disclosure-calculator/

If their conviction is spent, they don't need to tell us or their housing provider.

For any concerns about disclosing convictions when looking for housing, they can find helpful advice here: https://unlock.org.uk/guide/housing/

- None
- Arson
- Sexual Offences
- Violent Offences
- Prefer not to say"

ALLOWED_RESPONSES (enumerated):
1. None
2. Arson
3. Sexual Offences
4. Violent Offences
5. Prefer not to say

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q10_LGBTQ

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Do you identify with the LGBTQ+ community?

- Yes
- No"

ALLOWED_RESPONSES (enumerated):
1. Yes
2. No

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q10_LGBTQ__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Do they identify with the LGBTQ+ community?

- Yes
- No"

ALLOWED_RESPONSES (enumerated):
1. Yes
2. No

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q10A_LGBTQ_SERVICE_PREFERENCE

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

PURPOSE: If user identifies as LGBTQ+, ask whether they prefer specialist services (may be less local) or local services.

TRIGGER: C3Q10_LGBTQ = "Yes"

USER_TEXT (EXACT - copy/paste only):

"Would you prefer services that specialise in supporting LGBTQ+ people? These may be further away but offer specific understanding and support.

1. Yes, show LGBTQ+ specialist services first
2. No, just show local services
3. Show me both"

ALLOWED_RESPONSES (enumerated):
1. Yes, show LGBTQ+ specialist services first
2. No, just show local services
3. Show me both

STORE: lgbtq_service_preference (used in terminal service filtering)

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q10A_LGBTQ_SERVICE_PREFERENCE__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

TRIGGER: C3Q10_LGBTQ = "Yes"

USER_TEXT (EXACT - copy/paste only):

"Would they prefer services that specialise in supporting LGBTQ+ people? These may be further away but offer specific understanding and support.

1. Yes, show LGBTQ+ specialist services first
2. No, just show local services
3. Show both"

ALLOWED_RESPONSES (enumerated):
1. Yes, show LGBTQ+ specialist services first
2. No, just show local services
3. Show both

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q11_CURRENTLY_IN_CARE

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Are you currently being looked after by social services under the Children's Act 1989?

- Yes
- No"

ALLOWED_RESPONSES (enumerated):
1. Yes
2. No

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q11_CURRENTLY_IN_CARE__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Are they currently being looked after by social services under the Children's Act 1989?

- Yes
- No"

ALLOWED_RESPONSES (enumerated):
1. Yes
2. No

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q12_SOCIAL_SERVICES

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

PURPOSE: Understand social services involvement for routing and conditional terminal guidance.

USER_TEXT (EXACT - copy/paste only):

"Are you currently in contact with social services or a social worker?

1. Yes
2. No
3. Prefer not to say"

ALLOWED_RESPONSES (enumerated):
1. Yes
2. No
3. Prefer not to say

STORE: social_services
TERMINAL LOGIC: If "No" AND (age 16-17 OR in_care = Yes) -> show TERMINAL_SOCIAL_SERVICES_GUIDANCE

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: C3Q12_SOCIAL_SERVICES__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Are they currently in contact with social services or a social worker?

1. Yes
2. No
3. Prefer not to say"

ALLOWED_RESPONSES (enumerated):
1. Yes
2. No
3. Prefer not to say

NO EXTRA WRAPPERS: true


---

# ============================================
# DOMESTIC ABUSE EXITS (JURISDICTION-AWARE)
# ============================================

**JURISDICTION NOTE:**
The Shelter URLs in DV exits below default to England Shelter (england.shelter.org.uk). 
Routing logic MUST substitute scotland.shelter.org.uk for users in Scottish Local Authorities 
(Edinburgh, Glasgow, Aberdeen, Dundee, etc.).

National DV helplines (National Domestic Abuse Helpline, Refuge, Galop, etc.) are UK-wide 
and remain unchanged regardless of jurisdiction.

---

## PHRASE_KEY: IMMEDIATE_PHYSICAL_DANGER_EXIT

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"If you are in immediate danger right now, please call 999.

The police can help keep you safe.

If you cannot speak safely, you can:
- Call 999, then press 55 (Silent Solution - alerts police you need help)
- Text 999 if you have registered for this service

Once you are safe, I can help you find support services."

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: IMMEDIATE_PHYSICAL_DANGER_EXIT__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"If they are in immediate danger right now, please call 999.

The police can help keep them safe.

If they cannot speak safely:
- Call 999, then press 55 (Silent Solution - alerts police they need help)
- Text 999 if registered for this service

Once they are safe, I can help you find support services for them."

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: DV_FEMALE_CHILDREN_YES

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I'm really sorry this is happening. You deserve support, and these services are here to help. They can talk through your options, help with safety planning, and connect you with emergency housing if needed. Everything is confidential.

- National Domestic Violence Helpline
0808 2000 247 (24/7, free, confidential)
https://nationaldahelpline.org.uk

[Local Women's Aid - lookup by Local_Authority from prep_knowledge_hardcoded_organisations_v_1_AMENDED.md]

- [Local Children's Services - lookup by Local_Authority]

[Local Housing Options - lookup by Local_Authority]

- Shelter - Domestic Violence Advice
https://england.shelter.org.uk/housing_advice/homelessness/priority_need/at_risk_of_domestic_abuse"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: DV_FEMALE_CHILDREN_YES__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I'm really sorry this is happening to them. They deserve support, and these services are here to help. They can talk through options, help with safety planning, and connect them with emergency housing if needed. Everything is confidential.

- National Domestic Violence Helpline
0808 2000 247 (24/7, free, confidential)
https://nationaldahelpline.org.uk

[Local Women's Aid - lookup by Local_Authority from prep_knowledge_hardcoded_organisations_v_1_AMENDED.md]

- [Local Children's Services - lookup by Local_Authority]

[Local Housing Options - lookup by Local_Authority]

- Shelter - Domestic Violence Advice
https://england.shelter.org.uk/housing_advice/homelessness/priority_need/at_risk_of_domestic_abuse"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: DV_FEMALE_CHILDREN_NO

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I'm really sorry this is happening. You deserve support, and these services are here to help. They can talk through your options, help with safety planning, and connect you with emergency housing if needed. Everything is confidential.

- National Domestic Violence Helpline
0808 2000 247 (24/7, free, confidential)
https://nationaldahelpline.org.uk

[Local Women's Aid]

[Local Housing Options]

- Shelter - Domestic Violence Advice
https://england.shelter.org.uk/housing_advice/homelessness/priority_need/at_risk_of_domestic_abuse"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: DV_FEMALE_CHILDREN_NO__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I'm really sorry this is happening to them. They deserve support, and these services are here to help. They can talk through options, help with safety planning, and connect them with emergency housing if needed. Everything is confidential.

- National Domestic Violence Helpline
0808 2000 247 (24/7, free, confidential)
https://nationaldahelpline.org.uk

[Local Women's Aid]

[Local Housing Options]

- Shelter - Domestic Violence Advice
https://england.shelter.org.uk/housing_advice/homelessness/priority_need/at_risk_of_domestic_abuse"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: DV_MALE_CHILDREN_YES

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I'm really sorry this is happening. You deserve support, and these services are here to help. They can talk through your options, help with safety planning, and connect you with emergency housing if needed. Everything is confidential.

ManKind Initiative
0808 800 1170
https://mankind.org.uk
Confidential support for men affected by domestic violence

- [Local Children's Services]

[Local Housing Options]"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: DV_MALE_CHILDREN_YES__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I'm really sorry this is happening to them. They deserve support, and these services are here to help. They can talk through options, help with safety planning, and connect them with emergency housing if needed. Everything is confidential.

ManKind Initiative
0808 800 1170
https://mankind.org.uk
Confidential support for men affected by domestic violence

- [Local Children's Services]

[Local Housing Options]"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: DV_MALE_CHILDREN_NO

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I'm really sorry this is happening. You need support from people who can help right now.

ManKind Initiative
0808 800 1170
https://mankind.org.uk

[Local Housing Options]"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: DV_MALE_CHILDREN_NO__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I'm really sorry this is happening to them. They need support from people who can help right now.

ManKind Initiative
0808 800 1170
https://mankind.org.uk

[Local Housing Options]"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: DV_LGBTQ_CHILDREN_YES

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I'm really sorry this is happening. You need support from people who can help right now.

Galop
0800 999 5428
https://galop.org.uk
National helpline for LGBTQ+ people affected by abuse or violence

- [Local Children's Services]

[Local Housing Options]"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: DV_LGBTQ_CHILDREN_YES__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I'm really sorry this is happening to them. They need support from people who can help right now.

Galop
0800 999 5428
https://galop.org.uk
National helpline for LGBTQ+ people affected by abuse or violence

- [Local Children's Services]

[Local Housing Options]"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: DV_LGBTQ_CHILDREN_NO

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I'm really sorry this is happening. You need support from people who can help right now.

Galop
0800 999 5428
https://galop.org.uk

[Local Housing Options]"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: DV_LGBTQ_CHILDREN_NO__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I'm really sorry this is happening to them. They need support from people who can help right now.

Galop
0800 999 5428
https://galop.org.uk

[Local Housing Options]"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: SA_FEMALE_16PLUS

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I'm really sorry this has happened. You need support from people who can help right now.

Rape Crisis England & Wales
0808 500 2222 (Free, confidential, 24/7)
https://rapecrisis.org.uk"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: SA_FEMALE_16PLUS__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I'm really sorry this has happened to them. They need support from people who can help right now.

Rape Crisis England & Wales
0808 500 2222 (Free, confidential, 24/7)
https://rapecrisis.org.uk"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: SA_MALE_16PLUS

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I'm really sorry this has happened. You need support from people who can help right now.

SurvivorsUK
020 3598 3898
https://survivorsuk.org
Specialist, confidential support for men and boys aged 16 and over"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: SA_MALE_16PLUS__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I'm really sorry this has happened to them. They need support from people who can help right now.

SurvivorsUK
020 3598 3898
https://survivorsuk.org
Specialist, confidential support for men and boys aged 16 and over"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: SA_LGBTQ_OR_NONBINARY

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I'm really sorry this has happened. You need support from people who can help right now.

SurvivorsUK
020 3598 3898
https://survivorsuk.org

Galop
0800 999 5428
https://galop.org.uk"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: SA_LGBTQ_OR_NONBINARY__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I'm really sorry this has happened to them. They need support from people who can help right now.

SurvivorsUK
020 3598 3898
https://survivorsuk.org

Galop
0800 999 5428
https://galop.org.uk"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: SELF_HARM_EXIT

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"You deserve support with this, and you do not have to go through it alone.

Samaritans: 116 123 (24 hours, free)
https://samaritans.org

NHS Mental Health Helpline: call 111 and choose option 2

If you are in immediate danger, call 999 or go to A and E."

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: SELF_HARM_EXIT__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"They deserve support with this, and they do not have to go through it alone.

You can encourage them to contact:

Samaritans: 116 123 (24 hours, free)
https://samaritans.org

NHS Mental Health Helpline: call 111 and choose option 2

If they are in immediate danger, call 999 or go to A and E."

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: CHILD_AT_RISK_EXIT

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I am really sorry this is happening. You need support from people who can help right now.

Local Children's Services
[lookup by local authority]

Childline: 0800 1111 (for children)
NSPCC: 0808 800 5000 (for adults)"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: CHILD_AT_RISK_EXIT__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I am really sorry this is happening. They need support from people who can help right now.

Local Children's Services
[lookup by local authority]

Childline: 0800 1111 (for children)
NSPCC: 0808 800 5000 (for adults)"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: FIRE_FLOOD_EXIT

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Losing your home due to fire, flood, or another emergency is frightening, and it makes sense to want urgent help.

Local councils assess emergency housing situations urgently.

[Local Housing Options - lookup by local authority]

Please contact them as soon as you can so they can assess what support may be available."

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: FIRE_FLOOD_EXIT__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Losing their home due to fire, flood, or another emergency is frightening, and it makes sense to want urgent help.

Local councils assess emergency housing situations urgently.

[Local Housing Options - lookup by local authority]

Please contact them as soon as you can so they can assess what support may be available."

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: TERMINAL_CHECKIN

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I hope this helps. Is there anything else I can help with today?"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: TERMINAL_CHECKIN__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I hope this helps them. Is there anything else I can help with today?"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: TERMINAL_ADDITIONAL_NEEDS

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

PURPOSE: After delivering service results, offer to find additional support types.

USER_TEXT (EXACT - copy/paste only):

"Is there anything else you're looking for help with today?

1. Yes, I have another need
2. No, that's everything"

ALLOWED_RESPONSES (enumerated):
1. Yes, I have another need
2. No, that's everything

ROUTING:
- If "Yes" -> NEXT: B5A_ADDITIONAL_NEED_SELECTION
- If "No" -> NEXT: TERMINAL_GOODBYE

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: TERMINAL_ADDITIONAL_NEEDS__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Is there anything else they need help with today?

1. Yes, there's another need
2. No, that's everything"

ALLOWED_RESPONSES (enumerated):
1. Yes, there's another need
2. No, that's everything

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B5A_ADDITIONAL_NEED_SELECTION

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

PURPOSE: Allows selection of additional service category without re-profiling.

USER_TEXT (EXACT - copy/paste only):

"What else can I help you find?

1. Emergency Housing or Other Accommodation
2. Food
3. Work
4. Health Services
5. Advice Services
6. Drop In
7. Financial Help
8. Personal Items
9. Personal Services
10. Communications
11. Training
12. Activities"

ALLOWED_RESPONSES (enumerated):
1. Emergency Housing or Other Accommodation
2. Food
3. Work
4. Health Services
5. Advice Services
6. Drop In
7. Financial Help
8. Personal Items
9. Personal Services
10. Communications
11. Training
12. Activities

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: B5A_ADDITIONAL_NEED_SELECTION__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"What else can I help you find for them?

1. Emergency Housing or Other Accommodation
2. Food
3. Work
4. Health Services
5. Advice Services
6. Drop In
7. Financial Help
8. Personal Items
9. Personal Services
10. Communications
11. Training
12. Activities"

ALLOWED_RESPONSES (enumerated):
1. Emergency Housing or Other Accommodation
2. Food
3. Work
4. Health Services
5. Advice Services
6. Drop In
7. Financial Help
8. Personal Items
9. Personal Services
10. Communications
11. Training
12. Activities

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: TERMINAL_GOODBYE

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Take care of yourself. You can come back anytime if you need more help."

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: TERMINAL_GOODBYE__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Take care. You can come back anytime if they need more help."

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: TERMINAL_SOCIAL_SERVICES_GUIDANCE

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

PURPOSE: Conditional output at terminal when social_services = "No" AND (age_category = "16-17" OR in_care = "Yes")

USER_TEXT (EXACT - copy/paste only):

"Based on your situation, you may be entitled to support from social services. They have a duty to help young people and care leavers with housing.

You can contact your local council and ask for the Children's Services or Leaving Care team.

Find your local council: https://www.gov.uk/find-local-council"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: TERMINAL_SOCIAL_SERVICES_GUIDANCE__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Based on their situation, they may be entitled to support from social services. Social services have a duty to help young people and care leavers with housing.

They can contact their local council and ask for the Children's Services or Leaving Care team.

Find local council: https://www.gov.uk/find-local-council"

NO EXTRA WRAPPERS: true



# ============================================
# ADVICE MODE -- v6 (Intent-mapped)
# ============================================

## PHRASE_KEY: ADVICE_COUNCIL_PROCESS
CATEGORY: ADVICE
ACTION: EXPLAIN
INTENT_PATTERNS:
- "what can the council do"
- "what does the council do"
- "housing options process"
- "homelessness assessment"
- "council assessment"
- "how does homelessness support work"
- "what happens when I contact the council"
- "council homelessness process"

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Local councils are responsible for homelessness assessments and housing decisions.

When someone contacts their local council about homelessness, the council listens to what has been happening and carries out an assessment under housing law. This helps them decide what support they may be able to offer.

This process can feel slow or uncertain, especially when you are already under pressure. Waiting for answers does not mean you have been ignored or that you have done something wrong. It is often part of how the system works.

For more information on how the process works:
- Shelter: https://england.shelter.org.uk/housing_advice/homelessness
- Citizens Advice: https://citizensadvice.org.uk/housing"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: ADVICE_LEGALLY_HOMELESS
CATEGORY: ADVICE
ACTION: EXPLAIN
INTENT_PATTERNS:
- "legally homeless"
- "what does legally homeless mean"
- "am I legally homeless"
- "definition of homeless"
- "what counts as homeless"

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

""Legally homeless" is a term councils use during homelessness assessments.

Councils look at a range of factors, such as whether someone has a legal right to stay where they are, whether it is safe to return, whether there is a risk of harm or abuse, and whether current housing is suitable.

These checks can feel very personal, but they are part of the process councils are required to follow. Only the council can decide how the law applies in an individual case.

For clear explanations of how housing law works:
- Citizens Advice: https://citizensadvice.org.uk/housing
- Shelter: https://england.shelter.org.uk/housing_advice"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: ADVICE_PRIORITY_NEED
CATEGORY: ADVICE
ACTION: EXPLAIN
INTENT_PATTERNS:
- "priority need"
- "what is priority need"
- "do I have priority need"
- "am I a priority"
- "vulnerable priority need"

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"In England, councils also use the term "priority need" when deciding how homelessness cases are handled.

This can include situations involving pregnancy, dependent children, health conditions, vulnerability, or homelessness caused by events such as a fire or flood. These factors are considered alongside others and do not automatically lead to a particular outcome.

If these terms feel confusing or intimidating, you are not alone. They are part of how the system works, not a judgement about you.

For more information:
- Shelter: https://england.shelter.org.uk/housing_advice/homelessness/rules/priority_need
- Citizens Advice: https://citizensadvice.org.uk/housing"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: ADVICE_SOFA_SURFING
CATEGORY: ADVICE
ACTION: EXPLAIN
INTENT_PATTERNS:
- "sofa surfing"
- "couch surfing"
- "staying with friends"
- "staying with family"
- "hidden homelessness"
- "moving between places"

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Sofa surfing, staying temporarily with friends or family or moving between places, can still be considered homelessness in many situations.

Even if you have somewhere to stay right now, it might not be settled, safe or sustainable. Councils and support services often take this into account when assessing what help may be available.

If you are unsure whether your situation counts, it is still reasonable to ask for help and explain what has been happening."

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: ADVICE_EVICTION_RISK_PREVENTION
CATEGORY: ADVICE
ACTION: EXPLAIN_THEN_CONNECT
INTENT_PATTERNS:
- "eviction"
- "notice"
- "section 21"
- "section 8"
- "landlord wants me out"
- "rent arrears"
- "at risk of homelessness"
- "might be homeless"
- "going to be homeless"

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Facing the possibility of losing your home can be frightening.

How things work depends on your tenancy type and individual circumstances. Understanding the process does not make it easier, but it can sometimes reduce uncertainty.

Getting advice early, before things escalate, often helps. Specialist organisations can explain how processes work and what support may exist.

For clear information:
- Shelter: https://england.shelter.org.uk/housing_advice
- Citizens Advice: https://citizensadvice.org.uk/housing"

NO EXTRA WRAPPERS: true


# ============================================
# ADVICE MODE -- PRE-CRISIS STABILISATION (v6.5)
# Users still housed but at risk of losing accommodation
# ============================================

## PHRASE_KEY: ADVICE_RENT_ARREARS_EARLY_HELP_ENGLAND

CATEGORY: PREVENTION_ADVICE
JURISDICTION: ENGLAND

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"If you are still in your home but struggling with rent, many people find it helpful to seek advice early rather than waiting for things to escalate.

Some people choose to speak to their landlord and explain what has changed. Others find it helpful to get independent advice first, so they are clearer about what support might exist and what feels manageable.

Getting advice does not commit you to anything. It just helps you understand your options.

For housing advice:
- Shelter: https://england.shelter.org.uk
- Citizens Advice: https://citizensadvice.org.uk/housing

For money and debt support:
- StepChange: https://stepchange.org
- MoneyHelper: https://moneyhelper.org.uk"

NO EXTRA WRAPPERS: true

---

## PHRASE_KEY: ADVICE_LANDLORD_PRESSURE_OR_NOTICE_ENGLAND

CATEGORY: PREVENTION_ADVICE
JURISDICTION: ENGLAND

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"If your landlord has asked you to leave or given you a notice, it can help to know that this is usually the start of a process, not something that happens immediately.

How things work depends on your situation, and only specialists can explain how the rules apply to you. Getting independent advice before responding can help you understand what is happening and what your options might be.

For housing advice:
- Shelter: https://england.shelter.org.uk
- Citizens Advice: https://citizensadvice.org.uk/housing"

NO EXTRA WRAPPERS: true

---

## PHRASE_KEY: ADVICE_RENT_ARREARS_EARLY_HELP_SCOTLAND

CATEGORY: PREVENTION_ADVICE
JURISDICTION: SCOTLAND

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"If you are still in your home but struggling with rent, many people find it helpful to seek advice early rather than waiting for things to escalate.

Some people choose to speak to their landlord and explain what has changed. Others find it helpful to get independent advice first, so they are clearer about what support might exist and what feels manageable.

Getting advice does not commit you to anything. It just helps you understand your options.

For housing advice:
- Shelter Scotland: https://scotland.shelter.org.uk
- Citizens Advice Scotland: https://cas.org.uk

For money and debt support:
- StepChange: https://stepchange.org
- MoneyHelper: https://moneyhelper.org.uk"

NO EXTRA WRAPPERS: true

---

## PHRASE_KEY: ADVICE_LANDLORD_PRESSURE_OR_NOTICE_SCOTLAND

CATEGORY: PREVENTION_ADVICE
JURISDICTION: SCOTLAND

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"If your landlord has asked you to leave or given you a notice, it can help to know that this is usually the start of a process, not something that happens immediately.

How things work depends on your situation, and only specialists can explain how the rules apply to you. Getting independent advice before responding can help you understand what is happening and what your options might be.

For housing advice:
- Shelter Scotland: https://scotland.shelter.org.uk
- Citizens Advice Scotland: https://cas.org.uk"

NO EXTRA WRAPPERS: true

---

## PHRASE_KEY: ADVICE_MORTGAGE_ARREARS_ENGLAND

CATEGORY: PREVENTION_ADVICE
JURISDICTION: ENGLAND

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"If you are struggling with mortgage payments, you are not alone. Many people find themselves in this situation, and support exists.

Speaking to your lender early is often recommended, as they may have options available. Getting independent advice first can help you feel more prepared for that conversation and understand what support might exist.

For housing and money advice:
- Shelter: https://england.shelter.org.uk
- Citizens Advice: https://citizensadvice.org.uk/housing
- MoneyHelper: https://moneyhelper.org.uk"

NO EXTRA WRAPPERS: true

---

## PHRASE_KEY: ADVICE_MORTGAGE_ARREARS_SCOTLAND

CATEGORY: PREVENTION_ADVICE
JURISDICTION: SCOTLAND

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"If you are struggling with mortgage payments, you are not alone. Many people find themselves in this situation, and support exists.

Speaking to your lender early is often recommended, as they may have options available. Getting independent advice first can help you feel more prepared for that conversation and understand what support might exist.

For housing and money advice:
- Shelter Scotland: https://scotland.shelter.org.uk
- Citizens Advice Scotland: https://cas.org.uk
- MoneyHelper: https://moneyhelper.org.uk"

NO EXTRA WRAPPERS: true

---

## PHRASE_KEY: ADVICE_STAYING_WITH_OTHERS_ENGLAND

CATEGORY: PREVENTION_ADVICE
JURISDICTION: ENGLAND

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"If you are staying with family or friends and worried about having to leave, it can help to know that support may be available before things reach crisis point.

Councils have a role in helping to prevent homelessness, and getting advice early can help you understand what options might exist. You do not have to wait until you have nowhere to go.

For housing advice:
- Shelter: https://england.shelter.org.uk
- Citizens Advice: https://citizensadvice.org.uk/housing"

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: ADVICE_STAYING_WITH_OTHERS_SCOTLAND

CATEGORY: PREVENTION_ADVICE
JURISDICTION: SCOTLAND

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"If you are staying with family or friends and worried about having to leave, it can help to know that support may be available before things reach crisis point.

Councils in Scotland have duties around preventing homelessness, and getting advice early can help you understand what options might exist. You do not have to wait until you have nowhere to go.

For housing advice:
- Shelter Scotland: https://scotland.shelter.org.uk
- Citizens Advice Scotland: https://cas.org.uk"

NO EXTRA WRAPPERS: true

---

## PHRASE_KEY: ADVICE_FINANCIAL_HARDSHIP_ENGLAND

CATEGORY: PREVENTION_ADVICE
JURISDICTION: ENGLAND

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"When money is tight and it is affecting your housing, getting advice early can make a difference.

There may be support available that you are not aware of, such as benefits, grants or local assistance. Debt advice services can also help you work out what feels manageable and what options exist.

Getting advice does not commit you to anything. It just helps you see the picture more clearly.

For money and debt advice:
- StepChange: https://stepchange.org
- Citizens Advice: https://citizensadvice.org.uk/debt-and-money
- Turn2us: https://turn2us.org.uk"

NO EXTRA WRAPPERS: true

---

## PHRASE_KEY: ADVICE_FINANCIAL_HARDSHIP_SCOTLAND

CATEGORY: PREVENTION_ADVICE
JURISDICTION: SCOTLAND

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"When money is tight and it is affecting your housing, getting advice early can make a difference.

There may be support available that you are not aware of, such as benefits, grants or local assistance. Scotland also has the Scottish Welfare Fund for crisis situations. Debt advice services can help you work out what feels manageable and what options exist.

Getting advice does not commit you to anything. It just helps you see the picture more clearly.

For money and debt advice:
- StepChange: https://stepchange.org
- Citizens Advice Scotland: https://cas.org.uk
- Turn2us: https://turn2us.org.uk"

NO EXTRA WRAPPERS: true

---

## OPTIONAL MICRO-PROMPT KEY

## PHRASE_KEY: MICROPROMPT_AT_RISK_BUT_HOUSED

**USER_TEXT (EXACT):**

Because you're still in your home right now, there may be options to help you stay there.

Would you like to look at some early help and advice, or would you prefer to carry on as you are?

---

## PHRASE_KEY: MICROPROMPT_AT_RISK_BUT_HOUSED__SUPPORTER

**USER_TEXT (EXACT):**

Because they're still in their home right now, there may be options to help them stay there.

Would you like to look at some early help and advice, or would you prefer to carry on as you are?


# ============================================
# EARLY SUPPORT - TRANSITION / CONNECTION
# ============================================

## PHRASE_KEY: EARLY_SUPPORT_CONNECTION_OFFER
CATEGORY: SUPPORT
ACTION: OFFER_CHOICE

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"At this stage, it's often helpful to speak to an advice service about this. I can help you find support if you'd like."

NO EXTRA WRAPPERS: true

---
## PHRASE_KEY: EARLY_SUPPORT_CONNECTION_OFFER__SUPPORTER
CATEGORY: SUPPORT
ACTION: OFFER_CHOICE

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"At this stage, it's often helpful for them to speak to an advice service about this. I can help you find support if you'd like."

NO EXTRA WRAPPERS: true


---

# ============================================
# EARLY SUPPORT - CLOSING / RETURN PATH
# ============================================

## PHRASE_KEY: EARLY_SUPPORT_REASSURANCE_LINE
CATEGORY: SUPPORT
ACTION: INFORM

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"If things change or start to feel more urgent, you can come back here and we can look at more support."

NO EXTRA WRAPPERS: true

---

## PHRASE_KEY: EARLY_SUPPORT_REASSURANCE_LINE__SUPPORTER
CATEGORY: SUPPORT
ACTION: INFORM

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"If things change or start to feel more urgent, you can come back here and we can look at more support."

NO EXTRA WRAPPERS: true

---



---

## PHRASE_KEY: ADVICE_SLEEP_TONIGHT
CATEGORY: ADVICE
ACTION: CONNECT
INTENT_PATTERNS:
- "sleep tonight"
- "somewhere tonight"
- "nowhere to stay tonight"
- "emergency accommodation tonight"
- "tonight"
- "where can I go now"
- "need a bed tonight"

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"If you have nowhere safe to stay tonight, it makes sense to want urgent help.

In most areas, the first step is contacting the local council's housing options or homelessness team. Many councils have an out-of-hours service for emergencies outside office hours.

If you tell me your area, I can help you find the right local contact."

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: ADVICE_COUNCIL_CANT_HELP_TODAY
CATEGORY: ADVICE
ACTION: CONNECT
INTENT_PATTERNS:
- "council can't help"
- "council cant help"
- "they turned me away"
- "council refused"
- "no help today"
- "council said no"
- "they won't help"

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Sometimes councils are not able to offer accommodation immediately.

When this happens, they usually explain what part of the assessment is still ongoing or what decisions are still being considered. Waiting without clear answers can feel exhausting, but a delay does not mean your situation has been dismissed or forgotten.

Alongside the council process, local advice services or day centres may be able to offer practical help and explain what support exists in your area."

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: ADVICE_REGISTER_SOCIAL_HOUSING
CATEGORY: ADVICE
ACTION: CONNECT
INTENT_PATTERNS:
- "register for social housing"
- "housing register"
- "council house"
- "apply for council housing"
- "social housing application"
- "how do I get on the housing list"

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Social housing is usually managed through councils or housing providers using a housing register.

The process typically involves gathering information and carrying out assessments so housing can be allocated according to local rules. Demand is high and waiting lists are often long, which can feel disheartening.

Citizens Advice provides clear information about how housing registers usually work:
https://citizensadvice.org.uk/housing"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: ADVICE_REPORT_ROUGH_SLEEPING
CATEGORY: ADVICE
ACTION: CONNECT
INTENT_PATTERNS:
- "sleeping rough"
- "someone sleeping rough"
- "i saw someone sleeping rough"
- "rough sleeper"
- "report rough sleeping"
- "streetlink"

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"If you see someone sleeping rough and want to help, you can let local outreach teams know through StreetLink.

StreetLink passes alerts to local authorities and outreach services, who can try to locate the person and offer support.

If you are able to, sharing details such as location and time can help teams respond.

StreetLink: https://streetlink.org.uk"

NO EXTRA WRAPPERS: true


---

# ============================================
# ADVICE MODE -- SCOTLAND (NEW IN v6.4)
# ============================================

## PHRASE_KEY: ADVICE_HOMELESSNESS_SCOTLAND
CATEGORY: ADVICE
ACTION: EXPLAIN
INTENT_PATTERNS:
- "how does homelessness work scotland"
- "homelessness scotland"
- "homeless scotland"
- "council duty scotland"

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"In Scotland, councils have a duty to help anyone who is homeless or at risk of homelessness.

If you contact the council's homelessness service, they will assess your situation. How things work depends on individual circumstances, and only the council can explain how the rules apply to you.

For clear information about how housing law works in Scotland:
- Shelter Scotland: https://scotland.shelter.org.uk"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: ADVICE_NO_PRIORITY_NEED_SCOTLAND
CATEGORY: ADVICE
ACTION: EXPLAIN
INTENT_PATTERNS:
- "priority need scotland"
- "do i have priority need scotland"
- "vulnerable scotland"

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"In Scotland, councils do not use a "priority need" test in the same way as England. The law works differently.

If you are homeless, the council has a duty to assess your situation and consider what help may be available.

For more information:
- Shelter Scotland: https://scotland.shelter.org.uk"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: ADVICE_EVICTION_RISK_SCOTLAND
CATEGORY: ADVICE
ACTION: EXPLAIN_THEN_CONNECT
INTENT_PATTERNS:
- "eviction scotland"
- "losing home scotland"
- "at risk scotland"
- "section 33 scotland"

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"If you are at risk of losing your home in Scotland, support may be available.

Housing law works differently in Scotland, so getting specialist advice can help you understand your options and what the process involves.

For housing advice:
- Shelter Scotland: https://scotland.shelter.org.uk
- Citizens Advice Scotland: https://cas.org.uk"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: DOMESTIC_ABUSE_HOUSING_SCOTLAND
CATEGORY: ADVICE
ACTION: EXPLAIN
INTENT_PATTERNS:
- "domestic abuse scotland"
- "domestic violence scotland housing"
- "not safe home scotland"

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"If you're experiencing domestic abuse in Scotland and it's not safe to stay where you are, the council has a duty to help.

Housing and tenancy rights work differently in Scotland. Specialist advice is available from:
- Shelter Scotland: https://scotland.shelter.org.uk"

NO EXTRA WRAPPERS: true


---

# ============================================
# CONDITIONAL MICRO-PROMPTS v6.5
# Used selectively based on routing logic
# ============================================

## PHRASE_KEY: MICROPROMPT_AT_RISK_BUT_HOUSED
CATEGORY: MICRO_PROMPT
ACTION: OFFER_CHOICE

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

Because you're still in your home right now, there may be options to help you stay there.

Would you like to look at some early help and advice, or would you prefer to carry on as you are?

NO EXTRA WRAPPERS: true


# ============================================
# RESTART MECHANISM (v7.1)
# ============================================

## PHRASE_KEY: RESTART_OFFER

CATEGORY: SYSTEM
TRIGGER: User input matches restart patterns ("start again", "made a mistake", "restart", etc.)

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"No problem. Would you like to start again from the beginning, or continue where we were?

1. Start again
2. Continue"

ALLOWED_RESPONSES (enumerated):
1. Start again
2. Continue

ROUTING:
- "Start again" -> Clear session state, NEXT: OPENING_LINE
- "Continue" -> Resume at current question

NO EXTRA WRAPPERS: true


---

# ============================================
# ESCALATION SAFETY SYSTEM (v6.4)
# ============================================

**PURPOSE:** Prevent harm from confusion loops, abandonment, and mismatched expectations.
These phrases are triggered conditionally based on session friction indicators.

**TRIGGER LOGIC:** See Escalation_Threshold_System_v1.0.md for full specification.

**CRITICAL:** These are safety mechanisms, not optional UX polish. Required before deployment.

---

## PHRASE_KEY: ESCALATION_LEVEL_1_BRIDGE

CATEGORY: SAFETY_ESCALATION
TRIGGER: unclear_count = 2 OR skip_count = 2-3 OR out_of_scope_count = 2-3 OR repeat_same_answer_count >= 2

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"It looks like this is not connecting smoothly, and that is okay. These questions do not fit every situation.

Would you like to:
- explain things in a different way
- skip this question and move on
- start again from the beginning

What feels easiest right now?"

NO EXTRA WRAPPERS: true




---

## PHRASE_KEY: ESCALATION_LEVEL_1_BRIDGE__SUPPORTER

CATEGORY: SAFETY_ESCALATION
TRIGGER: Same as above, SUPPORTER mode

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"It looks like this is not connecting smoothly, and that is okay. These questions do not fit every situation.

Would you like to:
- explain things in a different way
- skip this question and move on
- start again from the beginning

What feels easiest right now?"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: ESCALATION_LEVEL_2_INTERVENTION

CATEGORY: SAFETY_ESCALATION
TRIGGER: unclear_count >= 3 OR skip_count >= 4 OR refusal_count >= 2 OR multiple Level 1 indicators

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I can see this is feeling difficult, and that is completely understandable. These questions do not work for everyone.

I can help in a few different ways:

1. Look for services using what I know so far, even if it is incomplete
2. Share a phone number so you can speak to someone directly
3. Carry on with the questions if you would like to try

What would be most helpful right now?"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: ESCALATION_LEVEL_2_INTERVENTION__SUPPORTER

CATEGORY: SAFETY_ESCALATION
TRIGGER: Same as above, SUPPORTER mode

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I can see this is feeling difficult, and that is completely understandable. These questions do not work for everyone.

I can help in a few different ways:

1. Look for services using what is known so far, even if it is incomplete
2. Share a phone number they can use to speak to someone directly
3. Carry on with the questions if they would like to try

What would be most helpful right now?"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: ESCALATION_LEVEL_3_EXIT

CATEGORY: SAFETY_ESCALATION
TRIGGER: unclear_count >= 5 OR explicit frustration OR Level 2 failed OR refusal_count >= 3

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I can see this isn't working for you right now, and I'm sorry I couldn't help in the way you needed. That's okay - there are other ways to get support.

These services can help:

[Local Housing Options - lookup by Local_Authority]
[Local phone number]

- Shelter Emergency Helpline
0808 800 4444 (free, 8am-8pm weekdays, 9am-5pm weekends)
https://england.shelter.org.uk/get_help/helpline

- Crisis
https://crisis.org.uk/get-help

Whatever you're going through, you deserve support. You're welcome back anytime."

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: CHECKPOINT_REGROUNDING

CATEGORY: SAFETY_CHECKPOINT
TRIGGER: questions_asked >= 5 (normal flow) OR questions_asked >= 3 (with friction)

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Quick check-in: these questions help me match you with the most relevant local services. The more I understand, the better the match.

Ready to continue with a few more questions, or would you like me to work with what I have so far?"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: CHECKPOINT_REGROUNDING__SUPPORTER

CATEGORY: SAFETY_CHECKPOINT
TRIGGER: Same as above, SUPPORTER mode

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Quick check-in: these questions help me match them with the most relevant local services. The more I understand, the better the match.

Ready to continue with a few more questions, or would you like me to work with what I have so far?"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: ESCALATION_SCOPE_CLARIFICATION

CATEGORY: SAFETY_ESCALATION
TRIGGER: out_of_scope_count >= 3 within last 5 inputs

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Just to be clear: I'm designed specifically to help with housing and homelessness support. I can't help with other topics like weather, recipes, general advice, etc.

If you need housing support, I'm here to help with that. If you're looking for something else, I can suggest where to find that help instead.

Would you like to continue with housing support, or would you prefer I point you somewhere else?"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: ESCALATION_SCOPE_CLARIFICATION__SUPPORTER

CATEGORY: SAFETY_ESCALATION
TRIGGER: Same as above, SUPPORTER mode

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Just to be clear: I'm designed specifically to help with housing and homelessness support. I can't help with other topics like weather, recipes, general advice, etc.

If they need housing support, I'm here to help with that. If they're looking for something else, I can suggest where to find that help instead.

Would you like to continue with housing support, or would you prefer I point you somewhere else for different help?"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: OUTPUT_PRESENTATION_SPEC

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"PRESENTATION FORMAT:

[Context message if applicable]

[Primary/statutory organizations]
[Organization Name]
[Phone]
[Address]
[Hours]
[Emergency/out of hours if applicable]
[Website - always include https://]

[Navigator/secondary organizations]
[Same format]

[Specialist organizations]
[Same format]

[Additional local services from database]
[Brief format with phone/website]

FORMATTING RULES:
- No emojis - use plain text only
- ASCII characters only - no special characters
- All URLs must include https:// prefix
- Phone numbers with spaces: 0808 800 4444
- Include (free) or (24/7) annotations where applicable"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: ADVICE_MODE_RULES

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"User may ask explanatory questions at ANY point during routing.

When user asks a question like \"What is priority need?\" or \"How does council support work?\":

1. Pause routing (remember where you were)
2. Answer from prep_advice_general_homelessness_v_1.md ONLY
3. Keep answer to 2-3 paragraphs maximum
4. Bridge back: \"In summary: [one sentence]. To help you find specific support: [repeat the question you were asking]\"
5. Resume routing exactly where it left off

NEVER:
- Provide advice during safeguarding exits (Section D)
- Give case-specific advice
- Predict outcomes
- Assess eligibility"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: NEVER_ASK_LIST

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"These questions are NOT in this protocol. You cannot ask them:

- \"Have you served in the Armed Forces?\"
- \"Have you been in prison?\" (wrong format - use criminal convictions question)
- \"Can I share your information with services?\"
- \"Are you willing to engage with support?\"
- \"Do you feel safe where you're staying?\"
- \"Are you in touch with the council?\"
- \"Would you like help with [X]?\" (proactive offering)
- Any compound question combining two topics
- Any question you invent based on what \"seems relevant\"

IF YOU FIND YOURSELF ABOUT TO ASK ONE OF THESE:
- Stop
- Return to this protocol
- Find the correct question in Section B or C
- Ask that question word-for-word"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: PRE_OUTPUT_CHECKLIST

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Before delivering terminal output, verify:

[x] Did I execute ALL 9 layers of assembly?
[x] Did I query wmca_services.json in Layer 8?
[x] Are organizations presented in priority order?
[x] Did I include complete contact details (phone, address, hours)?
[x] Did I include context message where appropriate?
[x] Are there any duplicate organizations?
[x] Did I use the exact emoji specified?
[x] Did I end with \"Is there anything else I can help with today?\" (exact text)
[x] Did I avoid proactive suggestions?"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: OUT_OF_SCOPE_GENERAL

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I can't help with that. I'm designed specifically to help people find housing and homelessness support services.

Is there anything related to housing, homelessness, or support services I can help you with?"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: OUT_OF_SCOPE_AFTER_TERMINAL

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I can't help with that request. I'm here to connect you with housing and homelessness support services in your area.

If you need help finding additional support services, I can ask you a few questions to understand what you're looking for."

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: WMCA_ONLY_SCOPE_NOTICE

CATEGORY: SCOPE_BOUNDARY
OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"This assistant is currently available for Birmingham, Coventry, Dudley, Sandwell, Solihull, Walsall, and Wolverhampton.

If you're in a different area, please visit your local authority's website or contact their Housing Options team directly.

I can still provide general information about how homelessness support usually works if that would be helpful."

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: LOCAL_AUTHORITY_FALLBACK

CATEGORY: FALLBACK
OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

PURPOSE: Use this when local authority data is unavailable from API. Provides universal fallback for users to find their local council.

USER_TEXT (EXACT - copy/paste only):

"Contact your local council's Housing Options team. You can find their details at https://www.gov.uk/find-local-council"

NO EXTRA WRAPPERS: true


---

## PHRASE_KEY: LOCAL_AUTHORITY_FALLBACK_EXTENDED

CATEGORY: FALLBACK
OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

PURPOSE: Extended fallback with additional context for crisis situations.

USER_TEXT (EXACT - copy/paste only):

"Contact your local council's Housing Options or homelessness team. They have a legal duty to help.

Find your local council: https://www.gov.uk/find-local-council

If you need immediate advice:
Shelter: 0808 800 4444 (free, 8am-8pm weekdays, 9am-5pm weekends)
https://england.shelter.org.uk"

NO EXTRA WRAPPERS: true


---

END OF PHRASEBANK FILE

**Routing logic is in:** `CHAR_VA_RoutingLogic_v7.md`
## PHRASE_KEY: B3_AGE_CATEGORY

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (COPY EXACTLY):

"Which age group are you in?

1. Under 16
2. 16-17
3. 18-24
4. 25 or over"

ALLOWED_RESPONSES (enumerated):
1. Under 16
2. 16-17
3. 18-24
4. 25 or over

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B3_AGE_CATEGORY__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (COPY EXACTLY):

"Which age group are they in?

1. Under 16
2. 16-17
3. 18-24
4. 25 or over"

ALLOWED_RESPONSES (enumerated):
1. Under 16
2. 16-17
3. 18-24
4. 25 or over

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B4_GENDER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (COPY EXACTLY):

"I need to ask about gender because some services are specifically for particular genders. I know these options don't fit everyone perfectly - please choose whichever feels closest, or 'Prefer not to say' if you'd rather skip this.

1. Male
2. Female
3. Non-binary or other
4. Prefer not to say"

ALLOWED_RESPONSES (enumerated):
1. Male
2. Female
3. Non-binary or other
4. Prefer not to say

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B4_GENDER__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (COPY EXACTLY):

"I need to ask about gender because some services are specifically for particular genders. I know these options don't fit everyone perfectly - please choose whichever feels closest, or 'Prefer not to say' if they'd rather skip this.

1. Male
2. Female
3. Non-binary or other
4. Prefer not to say"

ALLOWED_RESPONSES (enumerated):
1. Male
2. Female
3. Non-binary or other
4. Prefer not to say

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7D_SENSE_MAKING_RENT

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"You're finding it hard to keep up with rent payments. Many people hit this point. The good news is, talking to someone early can make a real difference.

Would it help to speak to someone who knows about housing and money?"

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7D_SENSE_MAKING_RENT__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"They're finding it hard to keep up with rent payments. Many people hit this point. The good news is, talking to someone early can make a real difference.

Would it help to speak to someone who knows about housing and money?"

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7D_SENSE_MAKING_EVICTION

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"You've been given notice by your landlord. That's understandably worrying. But you have rights, and there are people who help with exactly this.

Would it help to talk to someone about your options?"

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7D_SENSE_MAKING_EVICTION__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"They've been given notice by their landlord. That's understandably worrying. But they have rights, and there are people who help with exactly this.

Would it help to talk to someone about their options?"

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7D_SENSE_MAKING_MORTGAGE

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"You're having trouble with mortgage payments. That can feel really pressuring. There's help available for this kind of situation.

Would it help to talk to someone who understands mortgage difficulties?"

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7D_SENSE_MAKING_MORTGAGE__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"They're having trouble with mortgage payments. That can feel really pressuring. There's help available for this kind of situation.

Would it help to talk to someone who understands mortgage difficulties?"

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7D_SENSE_MAKING_LANDLORD

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"There are tensions with your landlord or living situation. That can put real strain on your housing security. There are people who help work through this.

Would it help to talk to someone?"

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7D_SENSE_MAKING_LANDLORD__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"There are tensions with their landlord or living situation. That can put real strain on housing security. There are people who help work through this.

Would it help to talk to someone?"

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7D_SENSE_MAKING_FINANCIAL

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"Financial pressure is affecting your housing. That's normal when money gets tight. Getting some guidance now could help prevent things getting worse.

Would it help to talk to someone?"

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7D_SENSE_MAKING_FINANCIAL__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"Financial pressure is affecting their housing. That's normal when money gets tight. Getting some guidance now could help prevent things getting worse.

Would it help to talk to someone?"

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7D_SENSE_MAKING_UNSURE

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"Housing situations are often complicated, and you don't need to have it all figured out right now. There are people who can help you explore your options.

Would it help to talk to someone?"

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7D_SENSE_MAKING_UNSURE__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"Housing situations are often complicated, and they don't need to have it all figured out right now. There are people who can help them explore their options.

Would it help to talk to someone?"

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7E_CONNECTION_OFFER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"These organisations can help with your situation:

Shelter (housing advice and legal support):
0808 800 4444 (free, 8am-8pm weekdays, 9am-5pm weekends)
https://shelter.org.uk/get_help

Citizens Advice (benefits, debt, and housing rights):
https://citizensadvice.org.uk
Or find your local office: https://citizensadvice.org.uk/about-us/contact-us/

StepChange (free debt advice):
0800 138 1111
https://stepchange.org

Would any of these help?"

ALLOWED_RESPONSES (enumerated):
1. Yes, any of these would help
2. Maybe, tell me more first
3. No, not right now

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7E_CONNECTION_OFFER__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"These organisations can help with their situation:

Shelter (housing advice and legal support):
0808 800 4444 (free, 8am-8pm weekdays, 9am-5pm weekends)
https://shelter.org.uk/get_help

Citizens Advice (benefits, debt, and housing rights):
https://citizensadvice.org.uk
Or find your local office: https://citizensadvice.org.uk/about-us/contact-us/

StepChange (free debt advice):
0800 138 1111
https://stepchange.org

Would any of these help them?"

ALLOWED_RESPONSES (enumerated):
1. Yes, any of these would help
2. Maybe, tell me more first
3. No, not right now

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7F_REASSURANCE_OFFER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"That's completely fine. You know where to find help when you're ready.

If you do want to come back and get those contact details, or if your situation changes and you want to explore support, just come back here. We'll be able to help again.

Take care of yourself."

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7F_REASSURANCE_OFFER__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (EXACT - copy/paste only):

"That's completely fine. They know where to find help when they're ready.

If they do want to come back and get those contact details, or if their situation changes and they want to explore support, just come back here. We'll be able to help again."

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: UNDER_16_EXIT

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT -- copy/paste only):

"Thank you for reaching out. Because you are under 16, there are specific services designed to help keep you safe.

The best next step is to contact your local Children's Services team.

[Local Children's Services - lookup by local authority]

Childline: 0800 1111 (free and confidential)

If you are in immediate danger, call 999."

NO EXTRA WRAPPERS: true


---

---

## PHRASE_KEY: UNDER_16_EXIT__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT -- copy/paste only):

"Thank you for reaching out. Because they are under 16, there are specific services designed to help keep them safe.

The best next step is to contact the local Children's Services team.

[Local Children's Services - lookup by local authority]

Childline: 0800 1111 (free and confidential, for young people)
NSPCC: 0808 800 5000 (for adults concerned about a child)

If they are in immediate danger, call 999."

NO EXTRA WRAPPERS: true


---

---

## PHRASE_KEY: DEBT_TO_PREVENTION_CHECK

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Are you at risk of losing your home because of this?"

ALLOWED_RESPONSES (enumerated):
1. Yes, I might lose my home
2. No, I'm managing for now

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7D_1_PREVENTION_CHILDREN_DEPENDENTS

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"This helps me understand what support might be available. Are there any children or other people who depend on you living in your home?

1. Yes
2. No
3. Prefer not to say"

ALLOWED_RESPONSES (enumerated):
1. Yes
2. No
3. Prefer not to say

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7D_1_PREVENTION_CHILDREN_DEPENDENTS__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"This helps me understand what support might be available. Are there any children or other people who depend on them living in their home?

1. Yes
2. No
3. Prefer not to say"

ALLOWED_RESPONSES (enumerated):
1. Yes
2. No
3. Prefer not to say

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7D_2_PREVENTION_EMPLOYMENT_INCOME

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Can you tell me a bit about your work situation? This helps me find the right kind of support.

1. Employed (full-time or part-time)
2. Unemployed
3. On benefits (Universal Credit, ESA, PIP, etc.)
4. Self-employed or gig work
5. Not working (student, carer, other)
6. Prefer not to say"

ALLOWED_RESPONSES (enumerated):
1. Employed (full-time or part-time)
2. Unemployed
3. On benefits (Universal Credit, ESA, PIP, etc.)
4. Self-employed or gig work
5. Not working (student, carer, other)
6. Prefer not to say

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7D_2_PREVENTION_EMPLOYMENT_INCOME__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Can you tell me a bit about their work situation? This helps me find the right kind of support.

1. Employed (full-time or part-time)
2. Unemployed
3. On benefits (Universal Credit, ESA, PIP, etc.)
4. Self-employed or gig work
5. Not working (student, carer, other)
6. Prefer not to say"

ALLOWED_RESPONSES (enumerated):
1. Employed (full-time or part-time)
2. Unemployed
3. On benefits (Universal Credit, ESA, PIP, etc.)
4. Self-employed or gig work
5. Not working (student, carer, other)
6. Prefer not to say

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7D_3_PREVENTION_PRIOR_SUPPORT

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Have you already reached out to anyone about this? It helps to know so I don't suggest things you've already tried.

1. Yes, I've spoken to someone (landlord, council, advice service, etc.)
2. No, I haven't reached out yet
3. I'm not sure who to contact"

ALLOWED_RESPONSES (enumerated):
1. Yes, I've spoken to someone (landlord, council, advice service, etc.)
2. No, I haven't reached out yet
3. I'm not sure who to contact

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7D_3_PREVENTION_PRIOR_SUPPORT__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Have they already reached out to anyone about this? It helps to know so I don't suggest things they've already tried.

1. Yes, they've spoken to someone (landlord, council, advice service, etc.)
2. No, they haven't reached out yet
3. They're not sure who to contact"

ALLOWED_RESPONSES (enumerated):
1. Yes, they've spoken to someone (landlord, council, advice service, etc.)
2. No, they haven't reached out yet
3. They're not sure who to contact

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7D_4_PREVENTION_SAFEGUARDING_SIGNALS

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Sometimes housing worries come alongside other difficult things. Is there anything else going on that might be important for me to know about? There's no pressure to share if you'd rather not.

1. Yes, there's something else I'd like to mention
2. No, it's just the housing situation
3. Prefer not to say"

ALLOWED_RESPONSES (enumerated):
1. Yes, there's something else I'd like to mention
2. No, it's just the housing situation
3. Prefer not to say

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7D_4_PREVENTION_SAFEGUARDING_SIGNALS__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Sometimes housing worries come alongside other difficult things. Is there anything else going on that might be important for me to know about? There's no pressure to share if you'd rather not.

1. Yes, there's something else to mention
2. No, it's just the housing situation
3. Prefer not to say"

ALLOWED_RESPONSES (enumerated):
1. Yes, there's something else to mention
2. No, it's just the housing situation
3. Prefer not to say

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: PREVENTION_CONNECTION_DECISION

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Would it help to connect you with local services that can support this? They can often help with negotiation, legal advice, welfare benefits, or just working out next steps."

ALLOWED_RESPONSES (enumerated):
1. Yes, please connect me
2. No, I need more time
3. I'm not sure yet

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: PREVENTION_CONNECTION_DECISION__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Would it help to connect them with local services that can support this? They can often help with negotiation, legal advice, welfare benefits, or just working out next steps."

ALLOWED_RESPONSES (enumerated):
1. Yes, please connect them
2. No, they need more time
3. They're not sure yet

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: PREVENTION_ADVICE_CHILDREN_SUPPORT

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Because you have children, local support services may prioritise your case. Family support services can also help with childcare, food banks, and benefits advice if needed.

Turn2us (Support with benefits and grants):
https://www.turn2us.org.uk/

Family Fund (help for families with children):
https://www.familyfund.org.uk/"

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: PREVENTION_ADVICE_WELFARE_RIGHTS

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"If work has changed or stopped, checking your benefits entitlement is important. You may be eligible for support you haven't claimed yet.

Citizens Advice - Benefits advice:
https://www.citizensadvice.org.uk/about-us/our-work/policy/policy-research-topics/work-policy-research-and-consultation/work-research/welfare-benefits-research/

Turn2us - Benefits checker:
https://www.turn2us.org.uk/"

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: PREVENTION_REASSURANCE_OFFER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"You have options and time to work this through. Getting advice early, even if you're not ready to take action right now, puts you in a stronger position."

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: PREVENTION_ESCALATION_SAFETY_CHECK

CATEGORY: PREVENTION_PATHWAY
TRIGGER: User explicitly rejects service connection AND imminent risk indicators present

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT -- copy/paste only):

"Before you go, one final check.

If things change or become more urgent, you can reach out for specialist support:

Shelter Emergency Helpline
0808 800 4444
Free. Weekdays 8am to 8pm. Weekends 9am to 5pm.

You can also return here at any time. Take care."

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: PREVENTION_ESCALATION_SAFETY_CHECK__SUPPORTER

CATEGORY: PREVENTION_PATHWAY
TRIGGER: Same as above, SUPPORTER mode

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT -- copy/paste only):

"Before you go, one final check.

If things change or become more urgent for them, you can share this specialist support:

Shelter Emergency Helpline
0808 800 4444
Free. Weekdays 8am to 8pm. Weekends 9am to 5pm.

They can also return here at any time. Take care."

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Can you tell me a bit more about what's concerning you? Is it related to domestic abuse, a health or mental health crisis, substance use, concerns about a child's safety, or something else?"

ALLOWED_RESPONSES (enumerated):
1. Domestic abuse or violence
2. Health or mental health crisis
3. Substance use concerns
4. Child safety concerns
5. Something else
6. Prefer not to say

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Can you tell me a bit more about what's concerning them? Is it related to domestic abuse, a health or mental health crisis, substance use, concerns about a child's safety, or something else?"

ALLOWED_RESPONSES (enumerated):
1. Domestic abuse or violence
2. Health or mental health crisis
3. Substance use concerns
4. Child safety concerns
5. Something else
6. Prefer not to say

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7A1_IMMEDIATE_SHELTER_TONIGHT

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Before we go further, I want to check: Do you have somewhere safe to sleep tonight?"

ALLOWED_RESPONSES (enumerated):
1. Yes, I have somewhere safe
2. No, I don't know where I'm sleeping tonight
3. I'm not sure

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7A1_IMMEDIATE_SHELTER_TONIGHT__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Before we go further, I want to check: Do they have somewhere safe to sleep tonight?"

ALLOWED_RESPONSES (enumerated):
1. Yes, they have somewhere safe
2. No, they don't know where they're sleeping tonight
3. I'm not sure

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7B_ADDITIONAL_REASONS

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Are there any other reasons affecting your housing too? (You can pick multiple if they all apply)"

ALLOWED_RESPONSES (enumerated):
1. Yes, there are other reasons
2. No, that's the main one
3. Actually, I want to change my answer

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7B_ADDITIONAL_REASONS__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Are there any other reasons affecting their housing too? (You can pick multiple if they all apply)"

ALLOWED_RESPONSES (enumerated):
1. Yes, there are other reasons
2. No, that's the main one
3. Actually, I want to change their answer

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7A_PAUSE_OPTION

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I know you might be busy. Would you like to continue now, or would it help to save this and come back when you have more time?"

ALLOWED_RESPONSES (enumerated):
1. I'd like to continue now
2. I'd like to come back later
3. I'm not sure yet

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B7A_PAUSE_OPTION__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"They might be busy or need time. Should we continue now, or would it help to note that they want to come back when they have more time?"

ALLOWED_RESPONSES (enumerated):
1. Continue now
2. They want to come back later
3. Not sure yet

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B2_PROFESSIONAL_HOUSING_SITUATION

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"Tell me about the person's current housing situation - whatever you know, or whatever they've told you."

ALLOWED_RESPONSES (enumerated):
1. They're currently rough sleeping or without shelter
2. They're in emergency accommodation
3. They're in stable housing but at risk of losing it
4. I'm not sure about their current housing status
5. They asked me to help them access services

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B6_HOMELESSNESS_CLARIFICATION

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"No problem - homelessness means not having your own permanent place to live. This includes rough sleeping, staying in temporary accommodation, hostels, emergency shelters, or sofa surfing (staying with friends/family without a permanent arrangement).

Does any of that apply to you right now?"

ALLOWED_RESPONSES (enumerated):
1. Yes, that describes my situation
2. No, I have my own place
3. Still not sure

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B6_HOMELESSNESS_CLARIFICATION__SUPPORTER

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"No problem - homelessness means not having their own permanent place to live. This includes rough sleeping, staying in temporary accommodation, hostels, emergency shelters, or sofa surfing (staying with friends/family without a permanent arrangement).

Does any of that apply to them right now?"

ALLOWED_RESPONSES (enumerated):
1. Yes, that describes their situation
2. No, they have their own place
3. Still not sure

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B5_NON_HOUSING_FOOD

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I help people with housing and homelessness support, but if you need help with food right now, there are services that can help:

Foodbank finder (search for food banks near you):
https://www.trusselltrust.org/get-help/foodbank/

If you're eligible, Healthy Start vouchers can help with food:
https://www.healthystart.nhs.uk/

Your local council may also have emergency food support - you can contact them directly.

Would you also like to connect with housing support services, or is food the main thing you need right now?"

ALLOWED_RESPONSES (enumerated):
1. Food is the main thing I need
2. Yes, I'd also like housing support
3. I'm not sure

NO EXTRA WRAPPERS: true

---

---

## PHRASE_KEY: B5_NON_HOUSING_WORK

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (EXACT - copy/paste only):

"I specialise in housing and homelessness support. For work support, your best options are:

National Careers Service (free careers guidance):
https://nationalcareersservice.direct.gov.uk/

Universal Jobmatch (job search and CV help):
https://www.gov.uk/find-a-job

Indeed.com or other job boards for job searching.

If you're worried about housing because of work changes, I can definitely help with that. Would you like to talk about housing support instead?"

ALLOWED_RESPONSES (enumerated):
1. Yes, let's talk about housing
2. No, I just needed work support
3. Both - work and housing

NO EXTRA WRAPPERS: true

---
---

## PHRASE_KEY: ESCALATION_LEVEL_2_LEGAL_EMERGENCY

CATEGORY: SAFETY_ESCALATION
TRIGGER: prevention_urgency = "now/soon" AND prevention_reason IN ["eviction notice", "notice to leave"] AND "legal_advice" NOT IN prior_support_attempts

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (COPY EXACTLY):

"This sounds urgent, and it may help to speak with a specialist who can explain how housing law usually works.

You may want to contact:

Shelter Emergency Helpline
0808 800 4444
Free. Weekdays 8am to 8pm. Weekends 9am to 5pm.

Shelter advisers can explain eviction processes and what options may exist in situations like this.

If you are in Scotland:
Shelter Scotland
0808 800 4444
https://scotland.shelter.org.uk

Would you like me to also help find your local council housing options contact?"

ALLOWED_RESPONSES (enumerated):
1. Yes, also give me the council contact
2. The advice line is enough
3. I have already spoken to an adviser

NO EXTRA WRAPPERS: true

---

## PHRASE_KEY: ESCALATION_LEVEL_2_LEGAL_EMERGENCY__SUPPORTER

CATEGORY: SAFETY_ESCALATION
TRIGGER: Same as above, SUPPORTER mode

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (COPY EXACTLY):

"This sounds urgent, and it may help for them to speak with a specialist who can explain how housing law usually works.

You may want to share:

Shelter Emergency Helpline
0808 800 4444
Free. Weekdays 8am to 8pm. Weekends 9am to 5pm.

If they are in Scotland:
Shelter Scotland
0808 800 4444
https://scotland.shelter.org.uk

Would you like me to also help find the local council housing options contact?"

ALLOWED_RESPONSES (enumerated):
1. Yes, also give me the council contact
2. The advice line is enough
3. They have already spoken to an adviser

NO EXTRA WRAPPERS: true

---

## PHRASE_KEY: ESCALATION_LEVEL_2_CHILDREN_RISK

CATEGORY: SAFETY_ESCALATION
TRIGGER: prevention_urgency = "now/soon" AND children = "Yes"

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (COPY EXACTLY):

"It sounds like there are children in the household and that the situation around your housing feels urgent.

When children are involved, councils usually take extra care to understand what is happening and what support may be available to help prevent homelessness.

A helpful next step is often to contact your local council's Housing Options or homelessness team and explain your situation.

You may want to tell them:
- that children live in the household
- that there is a risk of losing your home
- that you are looking for help to prevent homelessness

The council should assess your situation and explain what support they may be able to offer, or what will happen next.

You may also find it helpful to speak with Shelter, who can explain how the system usually works for families:

Shelter Emergency Helpline
0808 800 4444
Free. Weekdays 8am to 8pm. Weekends 9am to 5pm.

Would you like me to help look up the contact details for your local council?"

ALLOWED_RESPONSES (enumerated):
1. Yes, find my council's contact details
2. I will call Shelter first
3. I have already contacted the council

NO EXTRA WRAPPERS: true

---

## PHRASE_KEY: ESCALATION_LEVEL_2_CHILDREN_RISK__SUPPORTER

CATEGORY: SAFETY_ESCALATION
TRIGGER: Same as above, SUPPORTER mode

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (COPY EXACTLY):

"It sounds like there are children in the household and that the housing situation feels urgent.

When children are involved, councils usually take extra care to understand what is happening and what support may be available to help prevent homelessness.

A helpful next step is often for them to contact the local council's Housing Options or homelessness team and explain their situation.

They may want to tell the council:
- that children live in the household
- that there is a risk of losing their home
- that they are looking for help to prevent homelessness

The council should assess the situation and explain what support may be available, or what will happen next.

They may also find it helpful to speak with Shelter, who can explain how the system usually works for families:

Shelter Emergency Helpline
0808 800 4444
Free. Weekdays 8am to 8pm. Weekends 9am to 5pm.

Would you like me to help look up the contact details for their local council?"

ALLOWED_RESPONSES (enumerated):
1. Yes, find their council's contact details
2. They will call Shelter first
3. They have already contacted the council

NO EXTRA WRAPPERS: true

---

## PHRASE_KEY: ESCALATION_LEVEL_2_HEALTH_CRISIS

CATEGORY: SAFETY_ESCALATION
TRIGGER: safeguarding_flags contains "health_crisis" or "mental_health_crisis"

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (COPY EXACTLY):

"It sounds like things are feeling very heavy right now. Housing worries alongside health concerns can be extremely hard.

Before we look at housing options, it is important to make sure you have support:

Samaritans: 116 123 (24 hours, free)
NHS 111: for urgent health concerns
Mind: https://mind.org.uk

If you are in immediate danger, call 999.

When you feel ready, we can look at housing support together. There is no rush."

ALLOWED_RESPONSES (enumerated):
1. I would like to continue with housing help
2. I need a moment
3. Can you give me those numbers again?

NO EXTRA WRAPPERS: true

---

## PHRASE_KEY: ESCALATION_LEVEL_2_HEALTH_CRISIS__SUPPORTER

CATEGORY: SAFETY_ESCALATION
TRIGGER: Same as above, SUPPORTER mode

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (COPY EXACTLY):

"It sounds like they are dealing with housing worries alongside health concerns, which can be extremely hard.

You may want to share these support options:

Samaritans: 116 123 (24 hours, free)
NHS 111: for urgent health concerns
Mind: https://mind.org.uk

If they are in immediate danger, call 999.

When they feel ready, housing support can be explored. There is no rush."

ALLOWED_RESPONSES (enumerated):
1. Let us continue with housing help
2. I will share those numbers with them first
3. Can you give me those numbers again?

NO EXTRA WRAPPERS: true

---

## PHRASE_KEY: EMERGENCY_SHELTER_IMMEDIATE

CATEGORY: CRISIS_RESPONSE
TRIGGER: B7A1 = "Yes, I need somewhere tonight" OR crisis_gate = "Lost home due to emergency"

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (COPY EXACTLY):

"If you need somewhere to stay tonight, here's what to do right now:

Contact your local council's emergency housing line
[Local Housing Options - lookup by Local_Authority]

Tell them:
- You have nowhere safe to sleep tonight
- You need emergency accommodation

If it's outside office hours:
Many councils have an out-of-hours emergency line -- check your council's website or call their main number for a recorded message with the emergency number.

Shelter Emergency Helpline: 0808 800 4444 (8am-8pm weekdays, 9am-5pm weekends)
They can help you understand your options and what to say to the council.

If you're sleeping rough tonight and need immediate help:
StreetLink: https://streetlink.org.uk

Would you like me to find your specific council's contact details?"

ALLOWED_RESPONSES (enumerated):
1. Yes, find my council's details
2. I'll call Shelter first
3. I need StreetLink for someone sleeping rough

NO EXTRA WRAPPERS: true

---

## PHRASE_KEY: EMERGENCY_SHELTER_IMMEDIATE__SUPPORTER

CATEGORY: CRISIS_RESPONSE
TRIGGER: Same as above, SUPPORTER mode

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits. No softening.

USER_TEXT (COPY EXACTLY):

"If they need somewhere to stay tonight, here's what to do right now:

Contact the local council's emergency housing line
[Local Housing Options - lookup by Local_Authority]

They should tell the council:
- They have nowhere safe to sleep tonight
- They need emergency accommodation

If it's outside office hours:
Many councils have an out-of-hours emergency line -- check the council's website or call their main number for a recorded message with the emergency number.

Shelter Emergency Helpline: 0808 800 4444 (8am-8pm weekdays, 9am-5pm weekends)
Shelter can help them understand their options and what to say to the council.

If they're sleeping rough tonight and need immediate help:
StreetLink: https://streetlink.org.uk

Would you like me to find the specific council's contact details?"

ALLOWED_RESPONSES (enumerated):
1. Yes, find their council's details
2. They'll call Shelter first
3. I need StreetLink to report someone sleeping rough

NO EXTRA WRAPPERS: true

---

# UNIVERSAL ADVICE TANGENT SYSTEM (v6.7)
# These keys enable users to ask advice questions mid-routing and return seamlessly

---

## PHRASE_KEY: ADVICE_TANGENT_RETURN_TO_QUESTION

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (COPY EXACTLY):

"Back to your question:"

NO EXTRA WRAPPERS: true
USAGE: Output immediately before re-presenting the interrupted question

---

## PHRASE_KEY: ADVICE_TANGENT_CONFIRMATION_FINANCIAL

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (COPY EXACTLY):

"It sounds like you're asking about money worries or debt -- is that right?

-> Yes, tell me about financial help
-> Not quite, let me rephrase"

ALLOWED_RESPONSES (enumerated):
1. Yes, tell me about financial help
2. Not quite, let me rephrase

NO EXTRA WRAPPERS: true
MAPS_TO: DEBT_HELP_NATIONAL

---

## PHRASE_KEY: ADVICE_TANGENT_CONFIRMATION_EVICTION

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (COPY EXACTLY):

"It sounds like you're asking about eviction or being asked to leave -- is that right?

-> Yes, tell me about eviction
-> Not quite, let me rephrase"

ALLOWED_RESPONSES (enumerated):
1. Yes, tell me about eviction
2. Not quite, let me rephrase

NO EXTRA WRAPPERS: true
MAPS_TO: ADVICE_EVICTION_RISK_PREVENTION

---

## PHRASE_KEY: ADVICE_TANGENT_CONFIRMATION_EMERGENCY_TONIGHT

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (COPY EXACTLY):

"It sounds like you need somewhere to stay tonight -- is that right?

-> Yes, I need somewhere tonight
-> Not quite, let me rephrase"

ALLOWED_RESPONSES (enumerated):
1. Yes, I need somewhere tonight
2. Not quite, let me rephrase

NO EXTRA WRAPPERS: true
MAPS_TO: ADVICE_SLEEP_TONIGHT

---

## PHRASE_KEY: ADVICE_TANGENT_CONFIRMATION_SOFA_SURFING

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (COPY EXACTLY):

"It sounds like you're asking about staying with friends or family temporarily -- is that right?

-> Yes, tell me about sofa surfing
-> Not quite, let me rephrase"

ALLOWED_RESPONSES (enumerated):
1. Yes, tell me about sofa surfing
2. Not quite, let me rephrase

NO EXTRA WRAPPERS: true
MAPS_TO: ADVICE_SOFA_SURFING

---

## PHRASE_KEY: ADVICE_TANGENT_CONFIRMATION_COUNCIL_PROCESS

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (COPY EXACTLY):

"It sounds like you're asking how the council homelessness process works -- is that right?

-> Yes, explain the council process
-> Not quite, let me rephrase"

ALLOWED_RESPONSES (enumerated):
1. Yes, explain the council process
2. Not quite, let me rephrase

NO EXTRA WRAPPERS: true
MAPS_TO: ADVICE_COUNCIL_DUTY

---

## PHRASE_KEY: ADVICE_TANGENT_CONFIRMATION_PRIORITY_NEED

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (COPY EXACTLY):

"It sounds like you're asking what 'priority need' means -- is that right?

-> Yes, explain priority need
-> Not quite, let me rephrase"

ALLOWED_RESPONSES (enumerated):
1. Yes, explain priority need
2. Not quite, let me rephrase

NO EXTRA WRAPPERS: true
MAPS_TO: ADVICE_PRIORITY_NEED

---

## PHRASE_KEY: ADVICE_TANGENT_CONFIRMATION_SOCIAL_HOUSING

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (COPY EXACTLY):

"It sounds like you're asking about social housing or the housing register -- is that right?

-> Yes, tell me about social housing
-> Not quite, let me rephrase"

ALLOWED_RESPONSES (enumerated):
1. Yes, tell me about social housing
2. Not quite, let me rephrase

NO EXTRA WRAPPERS: true
MAPS_TO: ADVICE_HOUSING_APPLICATION

---

## PHRASE_KEY: ADVICE_TANGENT_CONFIRMATION_LEGALLY_HOMELESS

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (COPY EXACTLY):

"It sounds like you're asking what it means to be 'legally homeless' -- is that right?

-> Yes, explain legally homeless
-> Not quite, let me rephrase"

ALLOWED_RESPONSES (enumerated):
1. Yes, explain legally homeless
2. Not quite, let me rephrase

NO EXTRA WRAPPERS: true
MAPS_TO: ADVICE_HOMELESSNESS_RIGHTS

---

## PHRASE_KEY: ADVICE_TANGENT_CONFIRMATION_COUNCIL_CANT_HELP

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (COPY EXACTLY):

"It sounds like you're asking what happens if the council says they can't help -- is that right?

-> Yes, tell me about council refusals
-> Not quite, let me rephrase"

ALLOWED_RESPONSES (enumerated):
1. Yes, tell me about council refusals
2. Not quite, let me rephrase

NO EXTRA WRAPPERS: true
MAPS_TO: ADVICE_COUNCIL_REFUSAL

---

## PHRASE_KEY: ADVICE_TANGENT_CONFIRMATION_ROUGH_SLEEPING

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (COPY EXACTLY):

"It sounds like you're asking about rough sleeping or street homelessness -- is that right?

-> Yes, tell me about rough sleeping support
-> Not quite, let me rephrase"

ALLOWED_RESPONSES (enumerated):
1. Yes, tell me about rough sleeping support
2. Not quite, let me rephrase

NO EXTRA WRAPPERS: true
MAPS_TO: ADVICE_ROUGH_SLEEPING

---

## PHRASE_KEY: ADVICE_TANGENT_CONFIRMATION_HOMELESSNESS_SCOTLAND

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (COPY EXACTLY):

"It sounds like you're asking about homelessness rights in Scotland -- is that right?

-> Yes, tell me about Scottish homelessness rights
-> Not quite, let me rephrase"

ALLOWED_RESPONSES (enumerated):
1. Yes, tell me about Scottish homelessness rights
2. Not quite, let me rephrase

NO EXTRA WRAPPERS: true
MAPS_TO: ADVICE_HOMELESSNESS_RIGHTS_SCOTLAND

---

## PHRASE_KEY: ADVICE_TANGENT_CONFIRMATION_PRIORITY_NEED_SCOTLAND

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (COPY EXACTLY):

"It sounds like you're asking about priority need in Scotland -- is that right?

-> Yes, explain Scottish priority rules
-> Not quite, let me rephrase"

ALLOWED_RESPONSES (enumerated):
1. Yes, explain Scottish priority rules
2. Not quite, let me rephrase

NO EXTRA WRAPPERS: true
MAPS_TO: ADVICE_NO_PRIORITY_NEED_SCOTLAND

---

## PHRASE_KEY: ADVICE_TANGENT_CONFIRMATION_EVICTION_SCOTLAND

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (COPY EXACTLY):

"It sounds like you're asking about eviction in Scotland -- is that right?

-> Yes, tell me about Scottish eviction rules
-> Not quite, let me rephrase"

ALLOWED_RESPONSES (enumerated):
1. Yes, tell me about Scottish eviction rules
2. Not quite, let me rephrase

NO EXTRA WRAPPERS: true
MAPS_TO: ADVICE_EVICTION_SCOTLAND

---

## PHRASE_KEY: ADVICE_TANGENT_CONFIRMATION_DOMESTIC_ABUSE_SCOTLAND

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (COPY EXACTLY):

"It sounds like you're asking about housing help for domestic abuse in Scotland -- is that right?

-> Yes, tell me about Scottish DV housing support
-> Not quite, let me rephrase"

ALLOWED_RESPONSES (enumerated):
1. Yes, tell me about Scottish DV housing support
2. Not quite, let me rephrase

NO EXTRA WRAPPERS: true
MAPS_TO: ADVICE_DOMESTIC_ABUSE_SCOTLAND

---

## PHRASE_KEY: ADVICE_TANGENT_CONFIRMATION_RENT_ARREARS

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (COPY EXACTLY):

"It sounds like you're asking about rent arrears or falling behind on rent -- is that right?

-> Yes, tell me about rent arrears help
-> Not quite, let me rephrase"

ALLOWED_RESPONSES (enumerated):
1. Yes, tell me about rent arrears help
2. Not quite, let me rephrase

NO EXTRA WRAPPERS: true
MAPS_TO: ADVICE_RENT_ARREARS_EARLY_HELP_ENGLAND

---

## PHRASE_KEY: ADVICE_TANGENT_CONFIRMATION_LANDLORD_NOTICE

OUTPUT CONTRACT: print USER_TEXT exactly. No added sentences. No edits.

USER_TEXT (COPY EXACTLY):

"It sounds like you're asking about a notice from your landlord -- is that right?

-> Yes, tell me about landlord notices
-> Not quite, let me rephrase"

ALLOWED_RESPONSES (enumerated):
1. Yes, tell me about landlord notices
2. Not quite, let me rephrase

NO EXTRA WRAPPERS: true
MAPS_TO: ADVICE_LANDLORD_NOTICE
