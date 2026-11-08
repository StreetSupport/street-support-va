# Data Minimisation and Lawful Basis Note

| | |
|---|---|
| **Status** | Draft |
| **Date** | November 2026 |
| **Version** | 2.0 |
| **Author** | Matt Lambert |
| **Related documents** | Service Matching and Questions Design Note v1.0; Service Matching Contract v2; Appropriate Policy Document v1.1; Data Protection Impact Assessment (pipeline repo, `governance/Data_Protection_Impact_Assessment_VA_v1_0.md`); VA Analytics Contract v2.0; Privacy Policy; How We Work: Our Governing Principles |

## 1. Purpose

This note sets out what personal data the virtual assistant handles, why, on what legal basis, and how the design keeps it to the minimum. It is the reference for regulators, funders and partners who ask how the assistant handles personal data.

## 2. What the assistant handles

The assistant does not ask for anything that identifies a person: no address, date of birth or contact details. There is no account, no login and no link between one conversation and another.

Within one conversation, it asks questions that change which help a person is shown. The answers are held only while the conversation runs, in the page's memory and on the server. Nothing is saved in the browser; closing the page clears it.

Three things leave the conversation:

- **Typed text the assistant cannot match** goes to its AI provider, Anthropic, to be understood (section 8). Button choices are never sent.
- **A session record** is kept (section 9), and the counts reported are drawn from it.
- **A preferred name**, if the person gives one, is used only to address them during the conversation. It is never sent to the AI provider, never counted and never kept.

## 3. Minimisation by design

A question is asked only if its answer adds an endpoint or changes the local match (Service Matching and Questions Design Note, section 3.1). A need asks a population question only if its parent category holds services designed for that group, or the answer adds an endpoint. This note then decides, question by question and pathway by pathway, whether that question is asked: a question whose necessity on a pathway cannot be recorded here is not asked there.

The population questions are a choice: "Would you like to answer a few more questions so I can find services that fit you better?" A person who skips them still gets the statutory routes, fixed contacts and local services for their need.

Collecting data a pathway does not need would breach Article 5(1)(c) whatever the person agreed to. The question test is the minimisation mechanism.

## 4. Why a consent screen is not used

An earlier version asked people to consent on a screen before any profiling questions. It was removed because consent cannot make unnecessary collection lawful, consent bundled with access to help is not freely given, and the wording did not meet the regulator's requirements for explicit consent.

The extra-questions screen that replaced it is a choice about the conversation. It is not consent and is never relied on as a legal basis. Where consent is the basis for a sensitive question (section 6), it is given at that question.

## 5. Legal basis for all processing: Article 6

The basis is legitimate interests (Article 6(1)(f)), for every field on every pathway.

- **Legitimate interest:** connecting people to support that fits them, and understanding whether the service reaches the people who need it. This is SSN's charitable purpose.
- **Necessity:** only answers that change the help shown are asked (section 3). A session record without identifiers is the least that shows whether the service is reaching people.
- **Balance:** nothing identifies the person; answers last only as long as the conversation; only a session record without identifiers is kept; every question can be skipped without losing access to help. A person who prefers to answer nothing can use the website's search and map.

## 6. Sensitive information: Articles 9 and 10

**The principle.** Every sensitive question says, in one natural line, why it is asked. Answering a question that states its purpose is the person's explicit consent (Article 9(2)(a)). Declining loses nothing essential: the statutory routes, fixed contacts and helplines are always shown.

The question takes one of two forms:

- **Where the answer only adds specialist services**, the question is an offer: "Specialist services exist for people who identify as LGBTQ+. If that's relevant to you, would you like us to include them? It's up to you, and we only use your answer to find services." The choices are "Yes, include them" and "No thanks". The assistant records yes or nothing, never no, so no prefer-not-to-say option is needed.
- **Where the answer routes**, the question is asked directly with its reason, and prefer not to say is offered.

**Criminal offence data.** Convictions are asked directly with their reason. The condition is consent (DPA 2018, Schedule 1, Part 3, paragraph 29).

**Sensitive information given by choosing help.** Some answers reveal health or sexual information through the help a person chooses rather than a question about them: choosing Addiction or Health as the need; the noticing step's "health, including how I'm feeling" and "drink, drugs or gambling"; and the type-of-harm question's FGM and sexual assault options. The opening of every conversation says, beside the privacy link: "Anything you tell me is used only to find help for you. If you type something, our AI provider reads it to understand you. Nothing that could identify you is kept by us." Choosing an option after that is choosing to share it for that purpose.

**Substantial public interest is not relied on.** Version 1.1 of this note relied on substantial public interest for LGBTQ+ on the domestic abuse and sexual assault pathways, citing Schedule 1 paragraph 12. Paragraph 12 concerns regulatory requirements relating to unlawful acts and dishonesty; safeguarding is paragraph 18. Paragraph 18 does not fit either: it applies only where consent cannot be given, cannot reasonably be sought or would prejudice protection, and the Safety pathway asks whether the person is OK to carry on before any further question. Consent is available, so it is used.

**Health and disability are not asked.** V4 holds no health or disability population tag, and listings say too little for the answer to change the match (Managing Director, 2 November 2026).

## 7. Field and pathway table

Article 6 basis is legitimate interests throughout. "Consent" means explicit consent given at a question that states its purpose (section 6).

| Field | Pathways asked | Purpose | Category | Article 9 or 10 condition | Declined or skipped |
|---|---|---|---|---|---|
| Crisis gate | Every conversation | Safeguarding screening | Ordinary | None | Not skippable |
| Who it is for | Every conversation | Sets the framing of every question | Ordinary | None | Not sure leads to a place to start |
| Preferred name | Every conversation, optional | Addressing the person during the conversation | Ordinary | None | Not used |
| Council area | Every conversation | Statutory routes and local services | Ordinary | None | Required for local results; the website's map needs nothing |
| Housing situation | Housing | Sets position and the subcategories matched | Ordinary | None | Housing Options, navigator and Shelter shown |
| Safety (unsafe at home, including exploitation) | Crisis housing | Moves the person to the Safety pathway | Ordinary | None | Housing continues |
| Age | Housing; Finance; Health; Addiction; Employment; Activities; modern slavery | Safeguarding for under 18s; services designed for young people | Ordinary | None | Shown without the age lift |
| Care (ever been in care, 16 to 24) | Crisis housing; Finance; Health; Employment | Leaving care contacts; services designed for care leavers | Ordinary | None | Standard results |
| In care or with a social worker (16 and 17) | Every housing route for 16 and 17 year olds | Whether their worker or duty team comes first | Ordinary | None | Children's Services first |
| Armed forces | Crisis housing; Finance; Employment | Services designed for veterans | Ordinary | None | No lift |
| Immigration status | Crisis housing; Finance; Health; Employment; Immigration; Safety (safe accommodation, modern slavery) | Public funds routes; regulated advice; designed-for services | Ordinary | None | Standard results |
| Household and gender | Crisis housing; Finance; Health; Addiction; Immigration; Employment; Essentials; Activities; sex work option | Stated restrictions; designed-for services | Ordinary | None | Restrictions not applied against the person |
| Children | Crisis housing; Finance; Health; Employment; Essentials; Safety (safe accommodation) | Household routes; designed-for services | Ordinary | None | Standard results |
| Pregnancy, including a partner | Crisis housing | Changes which housing help is right | Health | Consent | Prefer not to say; standard results |
| Dogs | Crisis housing where the result is accommodation; Essentials | Services that take dogs; Dogs Trust | Ordinary | None | No lift |
| LGBTQ+ (offer form) | Crisis housing; Health; Addiction; Immigration | Specialist services added | Sexual orientation | Consent | Recorded as nothing |
| LGBTQ+ or gender (direct, with reason) | Safety: domestic abuse and sexual violence | Changes the organisations and endpoints | Sexual orientation | Consent, after "OK to carry on" | Prefer not to say; helplines and emergency numbers always shown |
| Ethnicity | Every pathway that asks population questions, except Food | Services run by and for the person's community; reach and equity counts | Racial or ethnic origin | Consent, both purposes stated | Prefer not to say; no lift, not counted |
| Convictions, and type if yes | Crisis housing (last; not 16 and 17); Health; Employment | Specialist endpoints, including the arson route; designed-for services | Criminal offence data | Consent, Schedule 1 Part 3 paragraph 29 | Prefer not to say; standard results |
| Need chosen; noticing-step pressures; type of harm | As chosen | The help asked for | Health or sexual information where the option reveals it | Consent, given by choosing after the opening sentence | Not asked; the person chooses |
| Food question | Food | The noticing step; the voucher route | Ordinary | None | "Just show me food near me" |
| Access location, used before, outcome | As in section 10 | Reach and accessibility | Ordinary | None | Optional |

The population questions on each need follow the Service Matching and Questions Design Note, section 3.7, and are built only once their row here is confirmed against the build.

## 8. The AI provider

Typed text that the assistant cannot match to an option is sent to Anthropic's API to be understood: whether a message is about housing at all, whether it is an advice question, and which option the person meant. Only that one message is sent, with a short instruction. No conversation history, no identifier and no button choices are sent. The under-16 check runs on the server before any of these calls.

- **Role:** Anthropic is a processor acting for SSN.
- **Terms:** SSN's API account is held under Anthropic's Commercial Terms, which incorporate its data processing addendum.
- **Retention:** Anthropic deletes API inputs and outputs within 30 days, unless agreed otherwise, required by law, or needed to enforce its usage policy. Where a message is flagged under the usage policy, it may be kept for up to two years (Anthropic Privacy Center, checked 8 November 2026).
- **Location:** processing takes place outside the UK; the Privacy Policy says so.
- **Minimising what is sent:** the server matches typed text against the options before anything is sent, so only text it cannot match goes to the API (VA backlog 81).

Typed text can contain anything, including a name or an address. The opening sentence (section 6) tells people that the AI provider reads what they type.

## 9. What is kept

What is kept is a **session record**: one line for each conversation, written to the hosting's logs when it ends. It holds a random session id, council area, user type, age band, need, housing status, safeguarding type, escalation level, duration and route. Nothing in it identifies the person, and it is not linked to any other conversation. It is kept for as long as the hosting keeps its logs. While the conversation runs, the hosting also logs each step's gate, the council area found and any advice topic detected; never what the person typed (technical lead, 8 November 2026).

The answers added by this note, including ethnicity, and the operational intelligence fields in section 10 are kept only as counts: outcomes by council area, need and route, and ethnicity by council area and census group. Reports leave out any small number that could point to someone.

## 10. Operational intelligence fields

Access location, used before and outcome for returning users stay as in version 1.1: enumerated, optional, legitimate interests, not special category. They are kept only as counts.

## 11. Purpose limitation

Answers are used only to find help for the person in that conversation, and to produce the session record and the counts drawn from it. Nothing is used for any other purpose, shared at individual level, or linked across conversations.

## 12. Risk and proportionality

The data protection impact assessment (pipeline repo, `governance/Data_Protection_Impact_Assessment_VA_v1_0.md`) weighs each flow. The risk to people from the assistant's processing is low, and the benefit is help that fits their situation. The controls in this note are proportionate to that.

## 13. Outstanding actions

Implementation checks, none of which changes the design or its risk assessment:

1. The Anthropic account: an API account under the Commercial Terms and data processing addendum, with API inputs not used for training (Managing Director).
2. The hosting keeps only the session record and step logs in section 9, for as long as it keeps logs, with no IP address or other identifier (technical lead, at the account check in the week of 23 November).
3. This note's table checked against the built question map before launch.
4. The Privacy Policy and the other footer documents updated to match (go-live plan, workstream H).

One focused legal check: that the consent wording in section 6 and the appendix meets the standard for explicit consent, and whether consent for criminal offence data needs an appropriate policy document (pipeline repo, `governance/Appropriate_Policy_Document_v1_1.md`).

## 14. Relationship to governing principles

- **We act on what is confirmed, not what we infer:** the assistant uses only what people choose to tell it.
- **Privacy and dignity are protected throughout:** nothing identifying is asked or kept; every sensitive question says why it is asked and can be declined.
- **Controls are proportionate to the potential for harm:** low-risk processing, controls to match.

## Appendix: question wording for the phrasebank

For the technical lead's review with the build.

| Question | Wording | Choices |
|---|---|---|
| Opening sentence, beside the privacy link | "Anything you tell me is used only to find help for you. If you type something, our AI provider reads it to understand you. Nothing that could identify you is kept by us." | None |
| LGBTQ+, offer form | "Specialist services exist for people who identify as LGBTQ+. If that's relevant to you, would you like us to include them? It's up to you, and we only use your answer to find services." | Yes, include them / No thanks |
| LGBTQ+ in domestic abuse and sexual violence | "Some organisations specialise in supporting LGBTQ+ people affected by abuse. Is that relevant to you?" | Yes / No / Prefer not to say |
| Pregnancy | "Is anyone in your household pregnant, including you or a partner? This can change which housing help is right for you." | Yes / No / Prefer not to say |
| Ethnicity | "Some services are run by and for particular communities. If you tell us your ethnicity, we can show you those, and it helps us check we're reaching every community. It's up to you." | Census groups / Prefer not to say |
| Convictions | "Some services work with people who have a criminal record, and some convictions change which services are best placed to help. Do you have any criminal convictions? It's up to you." | Yes / No / Prefer not to say |

## Document history

| Version | Date | Change |
|---|---|---|
| 1.0 | March 2026 | Initial note |
| 1.1 | March 2026 | Operational intelligence fields added |
| 2.0 | November 2026 | Brought into line with the Service Matching and Questions Design Note. Sensitive questions state their purpose and rest on explicit consent; substantial public interest no longer relied on, and the paragraph 12 citation corrected. Criminal offence data, pregnancy, ethnicity and information given by choosing help added. The AI provider recorded as a processor. Only aggregate counts kept. Field and pathway table rebuilt for the V4 question map |

## Sources

- Data Minimisation and Lawful Basis Note v1.1 (VA repo, `docs/va-review-2026-10-31`); Appropriate Policy Document v1.0 and Data Protection Policy v3 (pipeline repo, main); VA Analytics Contract v2.0 (VA repo, `docs/va-review-2026-10-31`).
- Service Matching and Questions Design Note v1.0 (VA #50).
- `app/api/chat/route.ts` on VA `staging`: the three API calls and the session-end log.
- Data Protection Act 2018, Schedule 1, Parts 2 and 3 (legislation.gov.uk, enacted text).
- Anthropic Privacy Center, "How long do you store commercial API data", checked 8 November 2026.
- Managing Director decisions, 8 November 2026.
