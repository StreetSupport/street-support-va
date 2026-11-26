> Source copy, converted 2 October 2026 from `Accessibility_Alignment_Note_v1_0.docx` (sha256 8d34f74fea335e83ba8e1afb4a1ad3cb8f44332923654afc5249c7b041a992b3), supplied by the Managing Director. This Markdown file is the source under the repository's direction rule; the Word file was the only previous copy and is now a derived record. Content unchanged.

**Street Support Network**

**Accessibility Alignment: Governance Note**

*Document type: Governance Note*

*Status: Findings complete, fixes not yet implemented*

*Date: March 2026*

*Scope: Virtual Assistant frontend (ChatWidget.tsx) and conversational design*

**Purpose**

This note documents a comprehensive accessibility review of the Virtual Assistant, conducted in March 2026. It covers technical interface accessibility (WCAG compliance), cognitive accessibility, situational accessibility, and broader inclusion considerations relevant to the VA’s user population.

The review was prompted by a governance assessment of whether the VA’s design decisions are consistently justified from the user’s perspective. Accessibility is a core expression of that principle: the system must work for the people who actually use it, not a theoretical user with full capacity and ideal conditions.

**Standards Referenced**

|                                             |                                                                                                                                                                |                                                                                |
|---------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------|
| **Standard**                                | **Scope**                                                                                                                                                      | **Status**                                                                     |
| WCAG 2.1 AA                                 | Technical interface accessibility: screen reader support, keyboard navigation, colour contrast, focus management, touch targets, ARIA roles, heading structure | Code-level audit complete. 47 issues identified.                               |
| WCAG 2.2 (cognitive criteria)               | Additional success criteria for cognitive accessibility introduced in WCAG 2.2, including focus appearance, dragging alternatives, and consistent help         | Reviewed. No additional issues beyond WCAG 2.1 findings.                       |
| W3C COGA (Cognitive Accessibility Guidance) | Design patterns for users with cognitive and learning disabilities: clear language, manageable choices, error recovery, consistent navigation                  | Assessed against current build. See Cognitive Accessibility section.           |
| Mencap Easy Read Guidelines                 | Content design for people with learning disabilities: short sentences, simple words, supported by images                                                       | Noted as future consideration. See Easy Read section.                          |
| British Standard BS 8878:2010               | Web accessibility code of practice: process for integrating accessibility into design and procurement                                                          | Referenced for process. Accessibility integrated into governance review cycle. |

**Part 1: WCAG 2.1 AA Technical Findings**

A code-level review of ChatWidget.tsx (the sole frontend component) identified 47 issues across seven categories. All fixes are contained within this single file. None affect routing logic, safeguarding tests, phrasebank content, data files, or backend systems.

**Critical (blocks screen reader users entirely)**

|         |                                                                                                                                 |                                           |
|---------|---------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------|
| **Ref** | **Issue**                                                                                                                       | **Fix**                                   |
| \#32    | No aria-live on message container. New messages appear silently. The entire conversational flow is invisible to screen readers. | Add aria-live="polite" to messages div    |
| \#12    | No dialog role or focus trap on widget. Keyboard users can tab behind it. Screen readers have no widget identity.               | Add role="dialog", aria-modal, aria-label |
| \#3     | Send button has no accessible name. Contains only an SVG icon. Screen reader announces "button" with no context.                | Add aria-label="Send message"             |

**High (significant barriers)**

|                  |                                                                                                                                |                                               |
|------------------|--------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|
| **Ref**          | **Issue**                                                                                                                      | **Fix**                                       |
| \#18, \#22, \#23 | Primary teal (#38ae8e) on white fails contrast at 3.2:1. Affects all links, phone numbers, and header text. AA requires 4.5:1. | Darken teal (e.g. \#2d8a72 gives 4.5:1)       |
| \#25–31          | No visible focus states on any interactive element. Keyboard users cannot see where they are.                                  | Add focus:ring classes alongside hover styles |
| \#1–2            | Restart and close buttons have title only, no aria-label.                                                                      | Add aria-label to both buttons                |
| \#36             | No distinction between user and assistant messages for screen readers.                                                         | Add aria-label with message source            |
| \#4–9            | Six decorative SVG icons lack aria-hidden="true".                                                                              | Add aria-hidden="true" to decorative SVGs     |
| \#10–11          | Phone and website links lack descriptive aria-labels.                                                                          | Add aria-label with service name and action   |

**Medium (degraded experience)**

|               |                                                                                                                                           |                                             |
|---------------|-------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------|
| **Ref**       | **Issue**                                                                                                                                 | **Fix**                                     |
| \#38–43       | Touch targets on header buttons (32px), send button (40px), quick reply buttons (40px), and service card links (40px) below 44px minimum. | Increase padding on affected elements       |
| \#44–47       | Heading hierarchy invalid: h1 inside h2, h4 skipping h3, section headers not rendered as headings.                                        | Restructure heading levels                  |
| \#14–17       | Quick reply and conversation starter buttons lack group roles. Service cards not keyboard-navigable as units.                             | Add role="group", aria-label, tabindex      |
| \#33–35, \#37 | Typing indicator, message list, session ended bar, and widget lack appropriate ARIA roles.                                                | Add ARIA roles (status, log, alert, region) |

**Visual Impact of WCAG Fixes**

The critical fixes add HTML attributes only. No visual change. The colour contrast fix produces a slightly deeper teal. Focus states appear only during keyboard navigation. Touch target fixes marginally increase button sizes. Heading and ARIA changes are structural with no visual effect.

**Implementation**

**Timing:** Implement now. Single PR, four commits (critical, contrast, focus states, structural). All changes in ChatWidget.tsx only.

**Part 2: Cognitive Accessibility**

Assessed against W3C COGA (Cognitive Accessibility Guidance) and WCAG 2.2 cognitive criteria. The VA’s user population includes people under extreme stress, people with learning disabilities, and people with cognitive impairment. Cognitive accessibility is not a secondary concern for this system.

**Language and reading level**

**Current position:** Phrasebank content has had human review for plain language. Option labels have been assessed for clarity as part of the design process.

**Gap:** The LLM generates conversational responses outside phrasebank content (contextual framing, transitions, acknowledgements). No reading level constraint is specified for this conversational layer. The system prompt does not include a plain English instruction.

**Timing:** Implement now. Add a plain English instruction to the system prompt specifying approximately age 11–12 reading level for all conversational output. Minimal effort.

**Number of choices per question**

**Current position:** Most gates offer 2–7 options. Two gates have higher counts: B5 (support need) has 12 options and the immigration status gate has 10 options.

**Mitigation:** The quick route work (backlog item 33) is designed to reduce the number of questions asked per pathway, only presenting questions where the answer changes the terminal output. This reduces overall cognitive load without changing the option counts on individual questions.

**Assessment:** The 12 support need options reflect genuine categories that cannot be meaningfully collapsed without losing routing accuracy. The 10 immigration options mirror terminology on official documentation, which is the most accessible approach for that population. No change recommended at this time. Review after the quick route work is implemented to assess whether the reduced question count addresses the cognitive load concern.

**Option label clarity**

**Current position:** Most option labels are self-explanatory. Some category names inherited from the SSN platform may be unclear to users unfamiliar with service terminology.

**Timing:** Review after quick route implementation. If option labels are surfaced differently in the revised flow, the labels should be assessed for plain English at that point.

**Error recovery**

**Current position:** The quick route design (backlog item 33) includes mid-session correction: users can change a previous answer and the system re-evaluates forward from that point. This is a strong error recovery mechanism.

**Assessment:** Adequate once implemented. No additional work needed.

**Progress indication**

**Current position:** No progress indicator exists. Users have no sense of how many questions remain.

**Timing:** Implement now. A single phrasebank line after B5 acknowledging the remaining flow ("Thanks. Just a couple more questions so I can show you what’s available in your area."). Scoped as backlog item 42.

**Part 3: Motor Accessibility**

**Keyboard navigation**

**Current position:** Covered by the WCAG findings above. Focus states, dialog trapping, and card navigation all need fixing.

**Timing:** Implement now as part of the WCAG PR.

**Completing the flow without typing**

**Current position:** The VA uses button-based option selection for all profiling gates. The free-text input exists for mid-conversation disclosures (safeguarding triggers) but should not be required to complete the standard flow.

**Action needed:** Verify in code that no point in the flow requires typing to proceed. If confirmed, document as a design feature. If not, fix.

**Timing:** Verify now. Quick Claude Code check.

**Part 4: Situational Accessibility**

Situational disability describes a temporary state that mimics permanent disability. For the VA’s user population, this is the most prevalent accessibility concern. Someone in crisis has reduced cognitive capacity. Someone in a noisy hostel has reduced ability to concentrate. Someone on a bus has a small screen and one hand free. Someone who is frightened has reduced ability to process complex information.

The VA’s user population is disproportionately affected by situational disability compared to the general population. Every design decision that reduces cognitive load, shortens the flow, simplifies language, or reduces the number of choices per screen is an accessibility improvement for this group.

**Design decisions that already address situational accessibility**

Button-based options rather than free-text input for all routing questions: reduces cognitive and motor burden.

Quick route design (item 33): reduces question count by only asking questions that change the output for the current pathway.

Card-based terminal output with expand pattern (scoped March 2026): reduces information overwhelm by letting users choose which services to explore rather than presenting everything at once.

Honest zero-match acknowledgement (PR \#6): does not pretend to have results when none exist, reducing confusion.

Progress acknowledgement after B5 (item 42): provides reassurance that the process is nearly complete.

**Assessment**

The current build and planned work address situational accessibility through design rather than as a separate feature. No additional items needed beyond what is already scoped.

**Part 5: Broader Inclusion Considerations**

**Multilingual support**

**Current position:** English only. No multilingual support in the current build.

**Context:** Multilingual support was partially implemented in the GPT version of the assistant and is planned for the codebase. It follows after the English version is stable and launched.

**Timing:** Later. Implement after English launch. Significant effort (full phrasebank translation, LLM conversational output in target languages, option label translation, terminal output translation).

**Audio and voice interaction**

**Current position:** The VA is entirely text-based. There is no audio input or output.

**Context:** An audio capability was previously scoped but the documentation has been lost. This would need re-scoping. Audio interaction would serve users with low literacy, visual impairment, or situational constraints (e.g. unable to read a screen).

**Timing:** Later. Requires re-scoping. Significant effort and design considerations around privacy (audio in shared spaces), accuracy (speech recognition for diverse accents), and safeguarding (how crisis disclosures via voice are handled).

**Easy-read mode**

**Current position:** No easy-read mode exists.

**What it would involve:** A parallel set of phrasebank content written to Mencap easy-read standards: shorter sentences, simpler words, potentially supported by images or symbols. Toggled by a user preference at the start of the session.

**Timing:** Later. Significant effort to produce and maintain two content sets. Consider after multilingual support, as the translation infrastructure may support easy-read as an additional content variant.

**Low literacy**

**Current position:** The VA is entirely text-based. Users with low literacy can navigate the button-based options (short labels) but may struggle with longer phrasebank content in terminal outputs and conversational framing.

**Mitigation:** The plain English system prompt instruction (see Cognitive Accessibility) helps. The card-based terminal design reduces the amount of text visible at any one time. Audio support (see above) would be the substantive solution.

**Timing:** Partially addressed by plain English instruction (now). Substantively addressed by audio support (later).

**Implementation Summary**

|                                        |                      |                         |                   |
|----------------------------------------|----------------------|-------------------------|-------------------|
| **Item**                               | **Timing**           | **Effort**              | **Standard**      |
| WCAG 2.1 AA fixes (47 issues)          | **Now**              | Single PR, four commits | WCAG 2.1 AA       |
| Plain English system prompt            | **Now**              | One line addition       | W3C COGA          |
| Progress acknowledgement (item 42)     | **Now**              | One phrasebank line     | W3C COGA          |
| Verify flow completable without typing | **Now**              | Code check only         | WCAG 2.1 AA       |
| Option label plain English review      | After quick route    | Content review          | W3C COGA          |
| Multilingual support                   | After English launch | Significant             | WCAG 3.1.1        |
| Audio and voice interaction            | Later (re-scope)     | Significant             | WCAG 1.2, BS 8878 |
| Easy-read mode                         | Later                | Significant             | Mencap guidelines |

**Governance Position**

The current state of the ChatWidget means the VA is not usable by screen reader users. This is the most urgent finding. The WCAG fixes close this gap without affecting any other aspect of the system.

Cognitive and situational accessibility are substantially addressed by existing design decisions (button-based options, quick route, card-based terminal, honest zero-match handling) with two small additions needed now (plain English system prompt, progress acknowledgement).

Broader inclusion features (multilingual, audio, easy-read) are documented as planned or future work. Their absence is a known limitation of the current English text-only build, not an oversight.

Once the WCAG fixes and the two cognitive accessibility items are implemented, the VA will meet WCAG 2.1 AA at the code level and W3C COGA guidance at the design level for its current feature set. This does not constitute a full accessibility audit with assistive technology users, which would be a separate and recommended step before public launch.

Accessibility Alignment: Governance Note \| Version 1.0 \| March 2026
