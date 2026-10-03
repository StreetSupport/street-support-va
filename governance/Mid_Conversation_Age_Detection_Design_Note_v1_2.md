> Source copy, converted 2 October 2026 from `Mid_Conversation_Age_Detection_Design_Note_v1_2.docx` (sha256 b9871f9690113228301114d62cbfd8dfc334e8ec722057a42442c4e2d650e7ea), supplied by the Managing Director. This Markdown file is the source under the repository's direction rule; the Word file was the only previous copy and is now a derived record. Content unchanged.

**Mid-Conversation Age Detection**

**Design Note v1.2**

|                 |                                                                              |
|-----------------|------------------------------------------------------------------------------|
| **Status**      | Approved and implemented. Signed off by James Cross via PR \#16, April 2026. |
| **Author**      | Matt Lambert, Managing Director, Street Support Network                      |
| **Date**        | 4 March 2026 (v1.1); 15 April 2026 (v1.2)                                    |
| **Version**     | v1.2                                                                         |
| **Governed by** | Safeguarding Contract v3.1                                                   |
| **Depends on**  | Implemented and signed off. No outstanding dependencies.                     |

**Purpose**

This document defines the design for mid-conversation age detection in the Street Support Network Virtual Assistant. It answers the four questions raised by James Cross on 2 March 2026, and establishes the governance boundaries that must hold before any implementation is built.

This is a governance document first. Implementation follows from it, not the other way round.

**1. Governance Framing**

The following positions are fixed before any design decision is made.

- This feature escalates towards safeguarding only. It cannot downgrade a safeguarding pathway under any circumstances.

- It does not replace human safeguarding judgement. It is a routing trigger, not a decision-maker.

- It does not give the AI discretion. The AI matches an explicit pattern. A human-designed pathway handles everything that follows.

- Safeguarding decisions remain exclusively human. The VA routes to Children’s Services or equivalent. What happens next is entirely outside the system.

- Session ends on escalation. The under-16 exit is a terminal state. There is no re-entry, no continuation of the original pathway, and no mechanism for the user to bypass the exit once triggered.

If any proposed implementation cannot satisfy all five of these positions, it is not ready to build.

**2. The Problem This Solves**

A user may select “25 or over” at the age gate (B3_AGE_CATEGORY) and then, later in the conversation, explicitly state they are under 16. Without this feature, they remain in the adult pathway regardless of what they subsequently say. This is a safeguarding gap.

The existing under-16 gate, triggered at B3_AGE_CATEGORY, is correct and remains unchanged. This feature is a secondary catch for cases where a user does not disclose their age at the gate but does so later.

**3. Risk Decomposition**

Risk is not treated as a single “AI age detection risk”. The harm pathways are separated and assessed individually.

|         |                         |                                                              |                                                                    |
|---------|-------------------------|--------------------------------------------------------------|--------------------------------------------------------------------|
| **Ref** | **Failure Mode**        | **Description**                                              | **Safeguarding Harm**                                              |
| A       | False negative          | Under-16 user not detected — remains in adult pathway        | High — child in wrong pathway, no safeguarding exit                |
| B       | False positive          | Adult incorrectly routed to under-16 exit                    | Low — session ends, user can restart and select correct age        |
| C       | Inference creep         | System begins interpreting ambiguous language as age signals | High — erodes governance boundary, unpredictable behaviour         |
| D       | Silent override opacity | User does not understand why pathway changed                 | Medium — addressed by visible explanation on escalation            |
| E       | Reliance drift          | Team later expands triggers without governance review        | High — prevented by scope lock and change control in this document |

Proportionality conclusion: false negative carries greater safeguarding harm than false positive. This supports a high-sensitivity approach, but only within explicit, testable boundaries. The design must minimise false negatives without opening the door to inference.

*This design prioritises governance boundary integrity over maximum detection sensitivity. A trigger list that cannot be independently verified and tested is not acceptable regardless of the detection rate it might achieve.*

**4. Trigger Definition**

Principle: explicit, not inferred.

The trigger fires only on explicit age disclosure. No inference, no pattern-matching on tone or behaviour, no probabilistic judgement.

**Triggers that fire: numeric age**

Any explicit first-person statement of a numeric age below 16 triggers escalation. Examples:

- “I am 14” / “I’m 14” / “I am 15” / “I’m 15”

- “I’m 13” / “I am 13” / “I’m 12” / “I’m 11” / “I’m 10”

- Any explicit first-person statement of numeric age below 16

**Triggers that fire: school year equivalents**

The VA operates in the WMCA region (England). England, Wales and Northern Ireland share the same Year 1–11 system. School years map to age ranges as follows:

- Year 7 = age 11–12

- Year 8 = age 12–13

- Year 9 = age 13–14

- Year 10 = age 14–15

- Year 11 = age 15–16 (edge case — see below)

Years 7 to 10 trigger escalation unambiguously. Year 11 is excluded from the trigger list because a Year 11 student may be 15 (under 16, should trigger) or 16 (should not). The cost of a false negative for a 15-year-old in Year 11 is lower than the cost of a false positive for a 16-year-old incorrectly routed to the under-16 exit. A Year 11 student who is genuinely under 16 can still trigger via the numeric age path.

*Bounded inference declaration: school year triggers are accepted as categorical age declarations within the UK education system. This is a bounded inference approved for this specific purpose only. It does not create precedent for any other form of inference and does not extend to any school year system outside England, Wales and Northern Ireland without a separate governance review.*

**Triggers that do not fire**

- “I’m young” / “I’m still young”

- “Still at school” / “I’m in school”

- “My mum won’t let me” / “My parents”

- “I’m in trouble with my parents”

- Any phrase that implies youth without stating it explicitly

- Year 11 school year reference

- Numeric age 16 or over

**5. Confidence Threshold**

Explicit only. No probability threshold is involved because no inference is performed. Either a trigger pattern is matched or it is not. There is no gradation.

This is a deliberate design choice. A probabilistic threshold would require ongoing calibration, introduce opacity, and create a governance boundary that cannot be tested deterministically. The explicit-only approach is auditable and testable by inspection.

**6. Ambiguous Signal Handling**

Ambiguous signals are not actioned. If a message does not contain an explicit trigger from the defined list in Section 4, it does not fire.

Example: “My mum won’t let me” could be a child or an adult with a difficult parent. It does not trigger because it does not contain an explicit age disclosure.

Example: “I’m still young” does not trigger because it does not state a numeric age or school year equivalent.

This is not a gap in the design. It is the design. The cost of acting on ambiguous signals is inference creep (Failure Mode C in Section 3), which carries high safeguarding harm.

**7. Contextual Qualifiers**

Contextual qualifiers do not suppress escalation.

If a user states “I’m 14 but just looking for information for my mum”, the explicit age disclosure still triggers escalation. The qualifier is irrelevant to the trigger logic.

If a user states “I’m in Year 9 but I’m helping a friend”, the school year reference still triggers escalation.

This rule exists to close a developer loophole. Without it, a future implementer might suppress the trigger when contextual language suggests the disclosure is incidental. That decision is not for the code to make.

**8. Override Mechanism**

Silent escalation with a visible explanation.

When the trigger fires, the VA does not ask the user to confirm their age. It routes immediately to the under-16 exit and surfaces a plain-language explanation to the user at that point.

Rationale: a confirmation step introduces a risk that the user dismisses it and remains in the wrong pathway. Silent escalation with explanation preserves user trust while eliminating the bypass risk.

The implementation uses deterministic pattern matching, not LLM semantic interpretation. The trigger fires on a matched pattern from the enumerated list in Section 4. No language model judgement is involved in the trigger decision.

**9. Audit Logging**

The trigger event is logged. The log captures:

- Trigger type (AGE_NUMERIC or SCHOOL_YEAR)

- Trigger code (e.g. AGE_NUMERIC_14, SCHOOL_YEAR_9)

- Session ID

- Timestamp

- Pathway change event (adult pathway → under-16 exit)

The audit log does not capture raw user text. Categorical codes are sufficient for governance review and do not create a risk of inadvertently storing personal data.

**10. Scope Lock**

This feature is explicitly limited to the following:

- Age detection: under-16 only

- Trigger: explicit numeric age or unambiguous school year (Years 7–10)

- Outcome: terminal escalation to under-16 exit, session ends

This feature does not:

- Attempt vulnerability detection

- Attempt safeguarding risk scoring

- Infer capacity or mental state

- Infer emotional distress

- Modify any pathway other than under-16 escalation

- Apply to any age threshold other than 16

Any proposal to extend this feature beyond the above scope requires a new governance review and explicit trustee sign-off before implementation.

**11. Architectural Position**

This is not AI making safeguarding decisions.

The architecture is:

**Pattern detection → deterministic routing → human-designed pathway**

The AI component is limited to pattern matching against an enumerated trigger list. Everything that follows — the exit content, the organisations surfaced, the session termination — is human-designed and pre-approved in the Safeguarding Contract.

This distinction matters for:

- Public Explanation Test — can SSN explain this to a service user or journalist without qualification? Yes.

- ICO defensibility — processing is proportionate, purpose-limited, and auditable.

- Board reassurance — no AI discretion is exercised in the safeguarding pathway.

**12. Tests Required**

The following tests must pass before James’s final sign-off:

- Explicit numeric ages 10 to 15 each trigger escalation

- Explicit numeric age 16 or over does not trigger

- School years 7, 8, 9, 10 each trigger escalation

- School year 11 does not trigger

- School year 12 or above does not trigger

- Ambiguous phrases do not trigger (“my mum”, “I’m young”, “still at school”, “I’m in trouble with my parents”)

- Contextual qualifier alongside explicit trigger does not suppress escalation

- Trigger fires mid-conversation regardless of prior age gate selection

- Session terminates on trigger — no re-entry

- Explanation is surfaced to user on escalation

- Audit log captures trigger type, trigger code, session ID, timestamp, pathway change event

- Audit log does not capture raw user text

**13. Change Control**

Any change to the trigger list, threshold definition, or override mechanism requires:

1.  Version increment to this document

2.  Explicit trustee sign-off

3.  Updated tests before implementation

This applies regardless of how minor the proposed change appears. The trigger list is a governance document, not a developer configuration.

**Future Consideration: Scottish School Year Equivalents**

*This section is noted for future development only. It does not affect the current implementation and is not pre-approved.*

Street Support Network currently operates within the West Midlands Combined Authority region (England). Future expansion may include Scottish regions, including Glasgow and Edinburgh, where SSN has an existing presence.

Scotland uses a different school year system (S1–S6). S1–S4 maps unambiguously to ages 11–15 (under 16). If and when the VA expands to Scotland, Scottish school year equivalents should be considered for addition to the trigger list, gated on the user’s identified local authority being in Scotland.

The bounded inference declaration in Section 4 would need to be extended explicitly to cover Scottish school years if and when this is adopted. This requires a governance review at the point of expansion and is not pre-approved here.

*This document is a governance record. It is version controlled and must not be superseded by informal agreement or developer judgement. Changes require the process set out in Section 13.*

14\. Implementation Record (v1.2)

The following changes were made during implementation (PR \#16, April 2026) that differ from or extend the original design in this document. All changes were approved by James Cross via the PR review process.

14.1 LA-aware routing on intercept

The original design assumed the intercept would always have access to the user’s local authority, and that buildUnder16Exit would produce the correct LA-specific Children’s Services contact. In practice, session.localAuthority is not guaranteed to be set at the point the intercept fires.

Implemented behaviour: if session.localAuthority is already set when the intercept fires, the exit proceeds directly with the correct local Children’s Services number. If it is not set, the intercept routes to CRISIS_UNDER16_LOCATION to ask the user which area they are in, then exits with the correct local number once the answer is received.

14.2 Generic fallback removed from buildUnder16Exit

The previous implementation included a generic gov.uk/find-local-council fallback in buildUnder16Exit for cases where no LA was known. This was removed. The LA-aware routing in 14.1 guarantees that LA is always known at the point buildUnder16Exit is called. The only exception is “Somewhere else” at CRISIS_UNDER16_LOCATION, which routes to a Childline exit (0800 1111, free, 24/7) rather than a generic redirect. If buildUnder16Exit is ever called without a valid LA due to a code error, it now logs the error and recovers to CRISIS_UNDER16_LOCATION rather than returning a 500 error.

14.3 Location gate moved earlier in the flow

To support the LA-aware routing above, the location gate was moved to immediately after GATE0_CRISIS_DANGER. Previously, location was collected later in the flow, meaning session.localAuthority was null for most of a session. Moving the gate earlier means LA is known from the point the user completes the crisis gate, which is the earliest practical point in the flow. This restores the original WatsonX design. Geolocation is attempted first; if it fails or the user declines, the manual LA selection gate fires immediately. Tier 2 governance decision approved by James Cross, April 2026. Trustees notified at next meeting per Governance Decision Framework.

14.4 Document history

v1.1 (4 March 2026): Original design document. Governance framing, trigger definition, confidence threshold, ambiguous signal handling, override mechanism, audit logging, scope lock, architectural position, test requirements, and change control.

v1.2 (15 April 2026): Implementation record added (Section 14). Status updated to approved and implemented. LA-aware routing, generic fallback removal, and location gate change documented. PR \#16 reference added.

*This document is a governance record. It is version controlled and must not be superseded by informal agreement or developer judgement. Changes require the process set out in Section 13.*
