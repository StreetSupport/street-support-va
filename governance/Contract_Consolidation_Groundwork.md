# Contract consolidation: groundwork

**Status:** Parked until after the switch (Managing Director, 27 November 2026). Groundwork only: nothing here is decided, and no contract is changed by it.

**Why.** The assistant's rules sit across eleven contracts and notes. The same topic is often stated in several of them, so one decision has to be carried into several places, and versions drift. On 27 November, confirming what AI reads had to go into the design paper, the AI Usage Boundaries Contract and the backlog, and the same AI uses are also described in the Claude Use note and the Data Minimisation note.

**How it would be done.** After the switch, a group is brought together when one of its documents next needs changing, not all at once. Each merged contract keeps the version histories of the documents it replaces, so what changed when stays traceable. Trustees approve the commitments, not the contracts (proposal of 27 November 2026), so a merge changes the implementation index, not what trustees approve.

## The documents, as read on 27 November 2026

| Document | Newest copy | What it covers |
|---|---|---|
| Safeguarding Contract v3.3 | `docs/contracts-for-trustees-2026-11-11` (`9c69ed6`) | Invariants, hard-coded routes, the crisis gate, the free-text disclosure rule, AI in safeguarding contexts, Claude usage rules, testing, change control, governed data files |
| Mid-Conversation Age Detection Note v1.3 | `align/adults-18-contract-2026-11-23` | Under-16 triggers, threshold, override, logging, scope lock, tests, its own change control |
| Safety Disclosure Check Note v1.0 | `docs/safety-disclosure-check-note-2026-11-19` (`d4f3ba3`) | The check, the clarifying question, fixed patterns, "No AI", where it runs, what is recorded, tests, the trigger list |
| Service Matching Contract v3.2 | `align/adults-18-contract-2026-11-23` (`bb7ca16`) | Exclusion, not saying, selection, the quick route, output, zero matches, trans and non-binary answers, safeguarding, governance |
| Housing Pathway Endpoints Contract v1.5 (proposed) | `align/hosp-prison-veterans-endpoints-1-4-2026-11-20` (`8740ffd`) | The safety net, each housing pathway and its fixed contacts, hardcoded national organisations, what the assistant does not do, governance |
| Non-Housing Pathway Endpoints Contract v2.2 | `align/bills-energy-endpoints-2026-11-19` (`04d37f2`) | Floors and onward connection by V4 parent, zero matches, acknowledgement language, analytics signal, gap reporting, hardcoded national organisations, what the assistant must not do, governance |
| AI Usage Boundaries Contract v1.1 | `align/adults-18-contract-2026-11-23` (`03ad509`) | Where AI is used, constrained and not permitted, free-text handling, advice mode, translation, fallback, governance |
| Claude Use and Issue Reporting Note v1.0 | `align/ai-policy-claude-note-2026-11-23` (`5c752df`) | The three uses of Claude, what never goes in, issue reporting, data protection, governance tier |
| Data Minimisation and Lawful Basis Note v2.1 | `align/va-data-location-retention-2026-11-23` (`b21e347`) | Why each question is asked, lawful basis, sensitive data, the AI provider, what is kept, release conditions |
| Analytics Contract v2.1 | `docs/contracts-for-trustees-2026-11-11` (`6edc865`) | Events, permitted fields, operational intelligence, feedback, retention, access, exclusions |
| Analytics Contract Amendment 3 | `docs/data-protection-update-2026-11-08` (`6c69267`) | Waiting to be folded into the Analytics Contract |

## Where the same topic is stated more than once

| Topic | Stated in |
|---|---|
| What AI may and may not do | AI Usage Boundaries (whole); Safeguarding ("AI Usage in Safeguarding Contexts", "Claude Usage Rules"); Claude Use note (section 2); Data Minimisation (section 8); Safety Disclosure note (section 5) |
| Typed text that may signal risk | AI Usage Boundaries ("Free-Text Handling"); Safeguarding ("Free-Text Disclosure Rule"); Safety Disclosure note |
| Under 16 | Safeguarding; Age Detection note; Housing Endpoints ("Under 16"); Safety Disclosure note; Data Minimisation |
| Fixed national contacts | Housing Endpoints and Non-Housing Endpoints (each has "Hardcoded National Organisations" and a "does not do" list) |
| Nothing local found | Service Matching (section 10); Non-Housing Endpoints ("Zero-Match Handling") |
| What is kept, and for how long | Data Minimisation (sections 9 and 10); Analytics (fields, retention, feedback); Amendment 3; Claude Use note (section 5) |
| What is counted for reports | Analytics; Non-Housing Endpoints ("Analytics Signal", "WMCA Gap Reporting") |
| When a change comes back | Each document has its own governance or change control section: eight in all, with the Age Detection note's own stricter rule |

## Possible groups

| Group | Brings together | Notes |
|---|---|---|
| Safeguarding | Safeguarding Contract, Age Detection note, Safety Disclosure Check note | The two notes already sit under the Safeguarding Contract. The age rule's "however minor" return stays as a named exception |
| Matching and contacts | Service Matching Contract, both endpoints contracts | One contract for what is shown: chosen services, fixed contacts, nothing found |
| AI | AI Usage Boundaries Contract, Claude Use note | The AI Policy stays separate: it is public and approved by the board |
| Data | Data Minimisation note, Analytics Contract, Amendment 3 | What is asked, what is kept, what is counted, in one place. The DPIAs stay separate: they assess, they don't set rules |

Eleven documents would become four. The design paper, the DPIAs and the public policies stay as they are.

## Things to settle when the time comes

- Whether the single return rule in the proposal replaces the eight governance sections, so each merged contract only points to it.
- Whether the AI rules in the Safeguarding Contract move into the AI contract or stay with safeguarding, stated once and referred to from the other.
- Whether the Data Minimisation note, written as a note, becomes a contract when merged with the Analytics Contract.
- The AI Usage Boundaries Contract still permits AI to explain approved wording, which is not built and is recommended to be dropped (27 November 2026). Settle that first.
