# VA V4 Redesign: Design Note

*Working draft, 4 November 2026. From the Managing Director. Copied from the working document (main tab rev 36, Design check tab rev 4, Variants review tab rev 2), every paragraph checked against the document. Under the direction rule this file is the source.*

This note settles how the VA asks what someone needs and matches them to services once the platform holds V4 categories. Status: the Managing Director's decisions were settled on 4 November 2026, except the design of the opening question, which is to come back to.

## Purpose and status

- **What it covers:** the first question, any follow-up question, how profile answers meet population tags, and the mechanics of reading V4 data. It does not cover the Safety route, the housing situation question or the conviction pathway, which are designed separately.
- **Why now:** the V4 redesign is one piece of work, built together with the matcher and the contract update. It is built against a test file of West Midlands V4 listings (580 listings, 93% matched in full to the copy of the site), then switched to live data when V4 reaches the copy.
- **Governance route:** design direction is the Managing Director's. The build goes to the technical lead by pull request. The Service Matching Contract change goes to trustees by email, with responses recorded.
- **Everything marked proposed** is a recommendation, not a decision, until the Managing Director settles it.

## Decided inputs

These are earlier decisions, carried into the redesign. This is a review of the whole design for best fit, so any of them can be revisited where new information shows a better fit (Managing Director, 4 November 2026). Where this note proposes a change, it says so.

| Rule | Decided |
| --- | --- |
| The VA reads the live platform database, as the website does, under the same rules | Managing Director, 29 and 31 October 2026 |
| Search is by distance from the person, never by council. Council stays only for statutory routes | Managing Director, 2 November 2026, from the website read |
| Up to five services that fit, on top of the statutory routes and fixed contacts. A good fit, not the best fit. No points or weights | Managing Director, 1 November 2026 |
| Phase plays no part in routing | Pathway Position, Not Phase (#115); Phase Framework PH-R01 |
| Categories are search-shaped: ten parents, with places to start outside them | Platform Scope and Service Principles v4, board 18 August 2026 |
| Population is a separate way of searching, not a category | Platform Scope and Service Principles v4 |
| Stated area restrictions show on the service card, in the organisation's words | Area restrictions proposal, 2 November 2026 |
| Safety is reached through the Safety route, open to everyone | Managing Director, 2 November 2026 |
| The housing situation question, with its routing for each answer | Managing Director, 3 November 2026 (VA #40) |
| When the database cannot be reached, the VA says so and shows the national contacts | Managing Director, 4 November 2026 (VA #41) |

## The design lens: noticing, visibility, connection, holding

The redesign is reviewed against the outcomes in the narrative, not only against earlier VA decisions (Managing Director, 4 November 2026). As the Managing Director defined them in November 2026:

| Outcome | What it means | What it asks of the VA |
| --- | --- | --- |
| Noticing | Someone, often in the person's circle of support, noticing pressures build up | Ask what else is making things harder, rather than answering only the first need |
| Visibility | Making services visible, and the links between protective factors and housing instability; possibly where someone sits on the pathway | Show the services behind the need, not only the need named |
| Connection | Connecting people onwards, an outcome in itself | Every route offers onward connection, unless the person declines |
| Holding | About transition | May not fit the VA's prevention work; to be settled |

The same principle as for food applies to every category: answer the need asked for, explore what sits underneath, and offer onward connection unless the person declines.

## Review: categories that go straight to results

Today several needs reach results with no further question, so nothing is noticed and no onward connection is offered.

| Need today | What happens now | V4 parent |
| --- | --- | --- |
| Food | Location only, straight to results | Food |
| Personal items, Personal services, Communications | Location only, straight to results | Essentials |
| Advice | One advice-type question, then results | Finance, Employment, Immigration, Health, Housing |
| Health, Work, Financial, Training, Activities, Drop in | Profile questions (age, gender and others) to filter, then results | Health, Employment, Finance, Activities |

**Proposed: the noticing step fits the need (Managing Director, 4 November 2026).** Connection is always offered; where and how follows the need. One question for everyone does not fit: someone looking for a shower should not be asked what else is going on before they can have one.

| Need | Shape | Why |
| --- | --- | --- |
| Dignity provision: showers, laundry, toiletries, period products, emergency clothing | Results first, no question. After them, one offer: "If you need somewhere to stay tonight, or other help, I can help with that too." | Dignity provision in Essentials is the recorded exception that needs no Connection (Three Test Framework, section 4). Someone looking for a shower may be sleeping rough, so the offer leads with tonight |
| Food | One question that explores what sits underneath and offers onward connection, unless the person declines ("just show me food near me") | Food is in scope through Connection (FOOD-REFERRAL-CONNECTION) |
| Finance, Health, Addiction, Employment | A noticing question before results: is anything else making things harder at the moment? The person can say "just show me the services" | These are often the pressures that build towards losing a home |
| Housing | The housing situation question | Already designed (VA #40) |
| Safety from harm | The Safety route | Already designed |

An answer to a noticing question, or a yes to the offer, hands off to the prevention pathway's own noticing step (Extract 2.8), so there is one noticing design, not two. Which Essentials items count as dignity provision follows the Essentials crib. Immigration and Activities: to settle in the review.

## Decision 1: the first question

**Decided (Managing Director, 4 November 2026):** eight options on the first screen, grouped so that where a group has a second screen, it is the follow-up question that group needed anyway. This replaces today's twelve options, which were built for the old categories, and an earlier draft of eleven, one per V4 parent.

| # | Option | V4 parents | Second screen |
| --- | --- | --- | --- |
| 1 | Somewhere to live, or help to keep my home | Housing | The housing situation question (VA #40) |
| 2 | Staying safe from abuse, exploitation or harm | Safety from harm | The Safety route |
| 3 | Food, clothes or other everyday things | Food, Essentials | A hot meal; food to take home; clothes; toiletries or period products; a phone or getting online; something else |
| 4 | Money, debt, benefits or work | Finance, Employment | Debt; benefits; bills and energy; grants; work or training; something else |
| 5 | Health, drugs, alcohol or gambling | Health, Addiction | Mental health; physical health; sexual health; drugs or alcohol; gambling; something else |
| 6 | Immigration or asylum | Immigration | None: show everything |
| 7 | Things to do and people to meet | Activities | None: show everything |
| 8 | I'm not sure where to start | Places to start | As Decision 4 |

**Why this shape**

- Eleven, one per parent, was too many for one screen. Grouping cuts it to eight and adds a step only for work: it sits in the money group, where its own follow-up was going to be skipped anyway. Inside each group the second screen uses the website's categories, so a person moving between the VA and the website still finds the same places. "Something else" on each second screen shows the whole group, which covers items not named, such as baby items and pet welfare.
- "Advice" is no longer its own option. In V4 advice sits inside the parent of the problem: housing advice under Housing, debt advice under Finance. Legal advice follows the problem it is about.
- Housing comes first because it is the commonest need. Safety comes second so it is never buried, as the go-live plan puts it on the main menu.
- "Not sure where to start" gives places to start a front door, in line with the place-to-start working note: surfaced before someone has to choose a category.
- The supporter variant uses the same options in the third person.

Drugs, alcohol or gambling sits with health, named in the label because some people do not think of addiction as health. Mental health and sexual health on that second screen are health data and need the Data Minimisation Note and Appropriate Policy Document covered before launch (Pathway Review 8.3).

**Already decided, and to carry into whichever shape is chosen:**

- Safety from harm is on the menu in plain words; Employment and Activities are not prevention entries (Decisions and Delivery Extract 2.2).
- Prevention is entered from Housing, Finance, Food, Essentials, Health and Addiction (Extract 2.8). The new question must hand off to prevention from each.
- The opening question ("What are you looking for today?": advice, help connecting, a specific organisation) stays. Nothing connects to its answers yet because what each leads to has not been designed (Managing Director, 4 November 2026). Designing it is part of the redesign, to come back to after Decisions 1 and 2.
- Every question needs a documented purpose in the question register (design principle 3).

## Decision 2: follow-up questions

**Merged into Decision 1 (4 November 2026).** The grouped options carry their follow-up as their second screen. Every second screen has "something else, or not sure", which shows the whole group. For the rest:

| Need | Second question |
| --- | --- |
| Housing | The housing situation question already decides it |
| Safety from harm | The Safety route's type-of-harm question decides it |
| Food and everyday things; Money and work; Health, drugs, alcohol or gambling | The group's second screen, in Decision 1 |
| Immigration | None: people often cannot tell which applies |
| Activities | None: show both |
| Places to start | None |

Settled with Decision 1 on 4 November 2026.

**Already decided or recorded:**

- Food carries the connection asked of every listing: the question explores what sits underneath and offers onward connection, unless the person declines (Managing Director, 4 November 2026). This sharpens the 2 November line (Extract 2.5: one skippable question, with "Just show me food near me") by saying what the question is for: the skip is the person declining, not the default.
- An advice-type selector already exists (benefits, debt, employment, immigration, health, legal, general). It is the template for the Finance question.
- A mental health option is health data. It needs the Data Minimisation Note and Appropriate Policy Document covered before it is asked (Pathway Review 8.3); the same is likely for sexual health and palliative care.

## Population: decided 1 November

Not a decision for this note. The Managing Director settled it on 1 November 2026 (VA Design and Service Matching Proposal, section 1.3 and section 8, question 1); this note carries it onto V4.

- **A population tag means "designed for".** It lifts a service to the front for someone in the group. It never lowers or hides a service for someone outside it. No points, no weights.
- **Only a stated restriction excludes**, through the Service Matching Contract's hard gates at high confidence. Still open, as proposed on 1 November: the reading rule, a three-part test (an established hard gate applies; the listing states the restriction in terms, such as "women only"; the person's answer clearly meets it).
- **A population question is asked only where the person's area and need include services tagged for that group** (section 3.8).
- **On V4,** the profile answers meet the V4 tags: gender (Women, Men), age 16 to 24 (Young people), care leaver, LGBTQ+, children or pregnant (Parents and families), criminal record, refugee, asylum seeker or other immigration status (Refugees, Asylum seekers, Migrants), and ethnicity (Ethnic minority communities). People with dogs, Sex workers and Veterans have no question (section 8, question 4).
- **Using ethnicity** to lift services is special category data used for routing, and needs its Article 9 basis first (section 8, question 8).
- **Where the tags sit:** on `GroupedProvidedServices`, not the `ProvidedServices` rows the live read uses today (section 8, question 3). The live read must read that layer too.

## Decision 4: places to start as the VA's fallback

**Why places to start exist** (A Place to Start working note). They are valued "not for the specialist help they give but for how easy they are to reach and how readily they connect a person on": somewhere you walk into or phone, without referral, when you do not know what you need, and someone helps you work it out and points you on. They came from removing drop-in and warm space, and are surfaced early, before someone has to choose a category, so a person who simply wants to reach out is not sent into a complicated search first.

**What follows for the VA** (Managing Director, 4 November 2026). The VA is designed to fulfil part of that same function: help someone work out what they need, and connect them on. Where it achieves the aims and gets someone connected, a further step to a place to start is unnecessary and could become a barrier. So a place to start is the VA's fallback, not a step on every route.

**Proposed: when the VA offers a place to start.**

1. **The person would rather talk to someone.** "I'd rather talk to someone" is already among the prevention pressures (Extract 2.8); the same choice is open from "not sure where to start".
2. **The person cannot yet name what is wrong,** after the VA has tried to help them work it out, through the noticing step.
3. **The VA cannot connect them on** for what they have named, early in their journey.

Never for crisis, safeguarding exits or under 16 (PTS-PH03; Pathway Review 1.1). Several pressures: fallback wording at launch; matching by organisation shape, including housing-factor organisations with a broader remit, comes later (Extract 3.1; Managing Director, 4 November 2026). Places to start count within the five results.

**"I'm not sure where to start" on the first question** therefore leads first to the VA helping the person work it out, with a place to start offered alongside as the human alternative, not instead of it.

## Decision 5: who the VA is talking to

"Who is it for" answers two separate questions (Managing Director, 4 November 2026). Is the person here? That decides who the VA speaks to. Is the helper a professional? That decides the tone towards the helper.

- **Facilitating** is empowering digital access: the supporter sits at the computer in place of the person, and the person sits beside them. The VA speaks to the person, as "you", as if they were typing.
- **Looking on behalf** of someone who is not there: the VA speaks to the helper about the person, as "they".
- **Tone towards a professional** differs from tone towards a friend or family member: reassurance that helps an ad hoc supporter can sound patronising to a professional. That is why the professional variant exists.

| Situation | Speaks to | Tone |
| --- | --- | --- |
| Myself | The person, "you" | Warm |
| Helping someone who is here with me (friend, family or professional) | The person, "you" | Warm, as for myself |
| Looking for someone who is not here: friend or family | The helper, "they" | Warm and reassuring |
| Looking for someone who is not here: professional | The helper, "they" | Plain and direct, no reassurance |
| Not sure, or just trying to find the right place | The person, "you" | Warm |

**The rule across all of them:** tone can differ; information never does. Every number, opening hour and option appears in every version.

**Safety in a facilitated conversation.** The person may not be able to speak freely in front of whoever is typing. The Safety route and the early safety question need a deliberate answer for this, such as a line saying they can come back on their own, or a discreet way to reach help. To design with the Safety route; changes go through the Safeguarding Contract.

**Visibility.** Recording facilitated sessions separately shows how much assisted digital access takes place. That needs a line in the VA Analytics Contract.

**Review of the current wording:** see the Variants review tab.

## Mechanics

These need no judgement. They follow from what the test file showed on 3 and 4 November.

- **Selection follows 1 November (section 1.3):** services for the need and the kind of help, in the area; hard gates only; one per organisation; five or fewer shown; more than five, designed-for services first and the rest in a rotating order. Distance decides the area, not the order (section 8, question 10).
- **Read accommodation too.** The website keeps accommodation in a separate collection (`TemporaryAccommodation`, 7 of the 51 unmatched test-file services). The live read reads only `ProvidedServices`, so Emergency accommodation and Supported housing listings would never appear. The matcher reads both, as the website does.
- **Services not tied to a place.** The live read's distance search drops any service without a map location: 26 in the test file, 10 of them phone services. They need their own short section, shown where they fit the need.
- **Places to start** belong early in someone's journey: before crisis, when they cannot yet name what is wrong (places to start crib, section 1). They are not a general fallback and never a crisis way in (PTS-PH03). How the VA reaches them is Decision 4. The three listings whose only placement is a place to start (Home-Start Birmingham, Stay and Play, the Family Centres) surface only there.
- **Fewer than five, or none:** the VA must never say there is no local support where the categories simply are not mapped (section 8, question 13).
- **Category codes.** The test file uses V4 names. The database codes come from the import format the technical lead is agreeing; the matcher holds them as named constants until then.
- **Cards** mirror the website's, per organisation, with "Get in touch" and "See all on Street Support" (section 1.3). Stated area restrictions show on the card in the organisation's words.

## Accessibility

The redesign works to the standard already set in the Accessibility Alignment Note v1.0 (March 2026): WCAG 2.1 AA for the screen, WCAG 2.2 cognitive criteria and W3C COGA for the conversation. It is the planned point for two items that note deferred until the flow changed: the plain English review of option labels, and the twelve options on the support-need question.

- **Already done:** the three critical fixes (new messages announced, dialog role, send button label), merged in PR #13, 28 March 2026.
- **Still open, VA backlog item 41, before launch:** contrast of the teal, visible focus, real headings in results (not capitals over rows of dashes), grouped buttons, 44px tap targets, and a plain English instruction for the AI's own wording.
- **Later, as the note decided:** audio and voice interaction (to be re-scoped), multilingual support, easy read.

**Two rules added by this redesign:**

1. **Each option is presented once.** The chat screen already removes the numbered list from the question text when buttons show (`stripInstructionsAndOptions`). The redesign keeps every question in the form it strips, and the build checks each new gate.
2. **Each option starts with different words, and is short.** People using their device's own voice control pick a button by saying its words, and listeners tell options apart by how they begin. This is separate from the VA itself talking, which stays later.

The Accessibility Alignment Note judged that the twelve options "cannot be meaningfully collapsed" with the old categories. The V4 categories change that premise, which is why the note deferred the review to a change of flow.

The first question is grouped (Decision 1): eight options on the first screen, and six or fewer on every second screen.

## Contract and governance

One contract update, one build, one review.

1. **Service Matching Contract.** The redraft already proposed in VA #34 (Part 3) is the starting point. It gains the three decisions above and the mechanics. Trustees review it by email, with responses recorded, before the trial (M6 at the latest).
2. **Build.** One pull request to the technical lead: the first question, any follow-ups, the matcher on V4 categories, the accommodation read, and tests for every route. Safeguarding-adjacent, so it goes first in his queue.
3. **From the technical lead:** the V4 category codes in the import format.
4. **Data protection:** if population matching uses the ethnicity answer, the D2 write-up covers it (Article 9 condition) before launch.

**Also needed:**

- The Housing and Non-Housing Pathway Endpoints Contracts and the Service Matching Contract type services by the 11 or 12 old categories. Addiction, Immigration, Essentials and Safety have no type or national floor. Reclassifying needs governance review (Extract 2.12).
- The Service Matching Contract's two layout lines disagree ("the minimum signposting layer is shown first" against "local dynamic results above it"), and its status reads Draft while the Governance Overview calls it an approved baseline. The redraft settles both.

**Backlog items the redesign absorbs:** 80 (V4 alignment: category maps, population gates; its "read the governed baseline" line is superseded by the live read), 42 (progress line), 59 (the stateUpdates fault in the support-need handlers), 2.1 (extract the results builder), 17 (saying why a service was chosen). Items 12 and 14 (scoring) are superseded by the 1 November "no points" decision and can close.

## Failure modes and edge cases

| Risk | What happens | Guard |
| --- | --- | --- |
| Someone in danger picks a category, not Safety | They see ordinary results | The crisis gate comes before the first question; the housing safety question asks about harm in plain words |
| A category finds nothing nearby | An empty answer | The statutory route and national contacts always show; the VA never says there is no local support. Whether a place to start is offered here is the open question in Pathway Review 8.4 |
| The live data has a V4 service the matcher cannot place | It is never shown | The category codes are tested against the copy before switching; unknown codes are logged, not guessed |
| A population tag is read as a restriction | Someone is wrongly turned away | Only stated restrictions hide; a test for each |
| Too many questions | People leave before results | Follow-ups only where they change the help, each with "not sure" |
| The test file drifts from the live data | Results differ at the switch | The file records its baseline commit and copy; the switch is tested on the copy with V4 loaded (M4a) |
| An under-16 reaches a category | Wrong services for a child | Mid-conversation age detection fires before any classifier, as now |

## Decisions for the Managing Director

| # | Decision | Proposed | Your answer |
| --- | --- | --- | --- |
| 1a | First question: options and order | Decided 4 November 2026: eight grouped options, Housing first, Safety second, "not sure where to start" last |  |
| 1b | First question: wording | As in the table under Decision 1 |  |
| 1c | One screen of eleven, or grouped | Decided 4 November 2026: grouped, eight on the first screen |  |
| 2 | Follow-up questions | Decided 4 November 2026: merged into Decision 1; no follow-up for Immigration, Activities or places to start |  |
| 3 | What a matching population tag does | Decided 1 November: a tag only lifts a service to the front. Open from then: the reading rule for stated restrictions |  |
| 4 | When the VA offers a place to start, as its fallback | Decided 4 November 2026: offered when the person would rather talk to someone, cannot yet name what is wrong, or the VA cannot connect them on. Several pressures: fallback wording at launch, organisation shape later |  |

The earlier design checked against noticing, visibility and connection, with 16 questions: Design check

---

# Design check: the earlier VA design against noticing, visibility and connection

Review of the earlier VA design against the narrative outcomes, 4 November 2026. Working material for the design note; nothing here is decided. 46 rows across six areas, then three lists: what works against noticing or connection, where sources contradict each other, and questions for the Managing Director.

## How this was done

- **Sources:** nine VA governance documents, read in full: DSMP, the VA Design and Service Matching Proposal (1 Nov); Extract, the Decisions and Delivery Extract (2 Nov); pr, the Pathway Review (31 Oct); ep, the Early Prevention Pathway Design Note v2.0 (2 Jul, with its 2 Oct header note); qr, the Quick Route Design Note v1.1 (13 Mar); pip, Principles in Practice (Mar); qpr, the Question Purpose Register (31 Oct); nhpe, the Non-Housing Pathway Endpoints Contract v1.0 (28 Feb); smc, the Service Matching Contract v2 (Mar, draft).
- **Outcomes:** used exactly as the Managing Director defined them. Holding is not scored: its definition is unsettled and may not fit the VA's prevention work.
- **The 4 November principles** override anything earlier. Rows say where an older line is superseded, with dates.
- **Columns:** N = noticing, V = visibility, C = connection: Yes, Partly, No or Works against. Recommendation is Keep, Change or Question.

## 1. Entry and first questions

| # | Source | Date | Decision | N | V | C | Superseded? | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1.1 | qr; pr 3.4; DSMP Part 1 | 13 Mar; 31 Oct | The crisis gate comes first on every route and is never skipped. Under 16 is always an option | No: not its job | Partly: exits show contacts | Yes | No | Keep. Worth checking in user testing whether an opening that leads with crisis deters someone early in their journey |
| 1.2 | Extract 2.2 | 2 Nov | Main menu moves to V4 needs, Safety from harm in plain words. Employment and Activities are not prevention entries | Partly: Employment loses its way into noticing | Yes | Partly | In part, by 4 Nov: Employment gets a noticing question | Change: drop "Employment not a prevention entry". Activities: Question |
| 1.3 | pr 7.1, 7.2; qpr | 8 May; 31 Oct | Supporter and professional answers change wording only | Partly: nothing is shaped for what supporters have noticed | Partly | Partly: no onward offer for the supporter | No. Extract 3.13 parks helper access | Question: should the supporter route carry its own noticing step and onward offer at launch? |
| 1.4 | Extract 1.10 | 2 Nov | "Not sure" at who-is-it-for leads to a place to start | Partly | Partly | Yes | No | Question: is uncertainty about who the help is for the same signal as not being able to name what is wrong? |
| 1.5 | qr; pr 3.1; DSMP 1.1 principle 4 | 13 Mar; 31 Oct | The quick route assumes no complicating circumstances, for data minimisation and completion | Works against, in part: fewer moments to disclose | Partly: tags have no effect there | Yes | pr 3.1 added completion to qr's purpose | Keep. Change: the noticing step runs on the quick route too |
| 1.6 | pr 4.1; DSMP 1.1 principle 3 | 31 Oct | Every question needs a documented purpose; ask only what still changes the next steps, and recommend once one set remains | Works against if read strictly | Partly | Partly | In part, by 4 Nov. qr's "no governance basis" for non-routing questions is superseded by DSMP 1.1 | Change: record noticing and onward connection as documented purposes |
| 1.7 | pr 4.3 layer 1; qpr | 31 Oct | Protective prompts such as "anything else going on" are always asked | Yes | Partly | Partly: the substance use follow-up "leads nowhere specific" | No | Keep. Change: give the substance use follow-up an onward route to Addiction |
| 1.8 | pr 1.1; DSMP 1.1 principle 1; Extract 1.3 | 31 Oct; 2 Nov | The VA surfaces facts and never applies them: no priority need, entitlement or duty language | No | Yes | Yes | No | Keep |

## 2. Housing

| # | Source | Date | Decision | N | V | C | Superseded? | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2.1 | pr 4.1; DSMP 1.1 principle 2 | 31 Oct | Each housing outcome is a pathway ending in a useful set of next steps | Partly | Yes | Yes | No | Keep |
| 2.2 | Extract 2.3 | 2 Nov | Crisis housing: branch on materialisation; safety early and plainly; fixed order; no Addiction pointer; Shelter always present | Partly | Yes | Partly: "no Addiction pointer" removes an onward link | No | Question: why no Addiction pointer? Cannot establish the reason |
| 2.3 | Extract 2.8; pr 8.3 | 31 Oct; 2 Nov | Prevention position is worked out, not asked | Partly | Partly | Partly | Yes: pr 8.3 proposed asking; Extract 2.8 replaces it | Question: is the housing situation question the crisis branch, with prevention position still worked out? |
| 2.4 | Extract 1.11; pr 4.3 layer 2 | 31 Oct; 2 Nov | Housing floor: Housing Options for everyone; once housing is in view, Housing Options, a housing-factor specialist and Shelter | No | Yes | Yes | No | Keep. See 3.4 |
| 2.5 | pr 5.2; Extract 2.10 | 31 Oct; 2 Nov | Care leavers 16 to 24 are asked "ever been in care" and which council | Partly | Yes | Yes | Replaces "currently looked after", 16 to 20 | Keep. Touches holding |
| 2.6 | DSMP 1.2; pr 2.2; Extract 2.4 | 22 to 30 Oct; 2 Nov | 16 and 17 year olds see Children's Services first and only what they can reach | No | Yes | Yes | No | Keep. Question: does the young people's prevention route carry the noticing step and a place to start after Children's Services? |
| 2.7 | Extract 2.19, 1.5 | 2 to 3 Nov | Convictions: arson to the specialist and statutory routes; disclosure guidance otherwise. Prison and hospital discharge as situations | No | Yes | Yes | No | Keep. Touches holding |

## 3. Prevention and places to start

| # | Source | Date | Decision | N | V | C | Superseded? | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 3.1 | ep routing spine; ep 2 Oct note | 2 Jul; 2 Oct | One prevention gate, four modes set by pathway position and imminency | Partly | Yes | Partly | In part: Extract 2.8 works position out | Keep the architecture; record that position is worked out |
| 3.2 | ep items 2, 3 | 2 Jul | Prevention shows only services human-reviewed as Strengthen | No | Works against: hides unreviewed services | Partly | Yes: 23 Sep decision (PR #115), per ep's 2 Oct note | Change: retire it |
| 3.3 | ep item 1; Extract 3.1 | 2 Jul; 2 Nov | Protective factor is metadata; never routes | No | Partly: nothing shows the person how a pressure links to housing | No | No | Question: should the awareness line or card show that link, within "factor never routes"? |
| 3.4 | ep surfaced pool; pr 8.3; Extract 1.11 | 2 Jul; 31 Oct; 2 Nov | ep: no housing endpoints upstream unless housing is raised. pr: Housing Options and Shelter always beside places to start | Yes (ep) | Partly | Partly | Unclear: the lines conflict | Question: does Housing Options show early and beside places to start? |
| 3.5 | pr 8.1; ep item 4 | 2 Jul; 31 Oct | A place to start: walk in or phone, no referral, welcomed, oriented, connected on. Offered once, early in prevention, as a choice. Never for crisis, safeguarding exits or under 16 | Yes | Yes | Yes | No. Consistent with 4 Nov | Keep |
| 3.6 | pr 8.1, 8.3 | 29 Oct | One pressure to its specialist; several, or not knowing, to a place to start | Partly | Partly | Partly: can split one person across services | Yes, by 4 Nov: not settled | Change: remove from "settled" |
| 3.7 | Extract 3.1 | 2 Nov | One organisation that fits, by its shape, not a specialist per pressure. Fallback wording at launch; shape data later | Partly | Partly: shape is free text, about 80 values, six "housing broader remit" in WMCA | Yes | No | Question: point people to housing-factor specialists with a broader remit at launch, or later? |
| 3.8 | Extract 2.8 | 2 Nov | Prevention entered from Housing, Finance, Food, Essentials, Health, Addiction, with a noticing step and awareness line. Pressures are a multi-select | Yes | Partly | Yes | In part, by 4 Nov: Essentials is results first; Employment gets a noticing question | Change: Essentials results first with the offer after; add Employment |
| 3.9 | pr 8.3 | 31 Oct | Every place to start in the council is shown, with one fixed sentence | No | Yes | Yes | No | Question: does the five-result cap apply? Cannot establish |
| 3.10 | pr 8.4 point 1 | 31 Oct | Proposed: where safety is among several pressures, the Safety specialist leads | Partly | Yes | Yes | No | Keep. Settle as proposed |

## 4. Non-housing categories

| # | Source | Date | Decision | N | V | C | Superseded? | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 4.1 | nhpe, smc typology | 28 Feb; Mar | Type A (Food, Personal Items, Personal Services, Drop In, Activities, Communications): honest acknowledgement, never a national number | No | Yes | Works against, if read across the whole category: can bar an onward offer | In part, by 4 Nov | Change: a Type A result can carry an onward offer for the underlying need, with no national number for the physical need itself |
| 4.2 | Extract 2.5 | 2 Nov | Food: one optional question, "Just show me food near me"; voucher route where needed | Partly | Yes | Partly: no onward offer after results stated | In part, by 4 Nov | Change: add the onward offer. Question: does "Just show me food near me" decline the offer, or only the question? |
| 4.3 | nhpe; Extract 2.8 | 28 Feb; 2 Nov | Dignity provision shows local results; Essentials listed as a prevention entry with a noticing step | Partly | Yes | No: no offer after results | Yes, by 4 Nov | Change: results first, then the offer |
| 4.4 | nhpe; Extract 2.12 | 28 Feb; 2 Nov | Type B and C always show a verified national floor (NHS 111, Turn2Us, Citizens Advice, Jobcentre Plus, National Careers Service) | No | Yes | Yes | No | Keep |
| 4.5 | qpr; nhpe; Extract 2.2, 2.12 | 28 Feb to 2 Nov | Finance, Health, Addiction and Employment ask only routing questions, no noticing question | No | Partly | Partly | Yes, by 4 Nov | Change: add a noticing question before results, purpose recorded |
| 4.6 | nhpe zero-match; DSMP I8 | 28 Feb; 1 Nov | When nothing matches: say so, leave a door open, browse link, gap signal; never "no support" where categories are unmapped | No | Yes | Partly | No | Keep |
| 4.7 | nhpe "Connector, not assessor" | 28 Feb | The VA does not assess eligibility, advise on entitlements or recommend which service to use | No | Partly | Yes | Conflicts with DSMP 1.3 "a sound recommendation" | Change: reword to "does not rank or judge providers" |
| 4.8 | smc LGBTQ+ modifier; DSMP 3.7 | Mar; 1 Nov | LGBTQ+ modifies only housing, DV, SA and health; DSMP proposes tags for every population | No | Works against (old rule) | Partly | Proposed, not approved | Change: adopt the DSMP proposal, keeping the national LGBTQ+ contacts |

## 5. Matching and results

| # | Source | Date | Decision | N | V | C | Superseded? | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5.1 | DSMP 1.3 | 1 Nov | Up to five tailored services beside statutory routes and fixed contacts; good fit; "See all on Street Support" | No | Partly | Yes | Specifies smc's parked limits | Keep |
| 5.2 | DSMP 1.3, 3.5 | 1 Nov | Need, kind of help, area; one per organisation; designed-for first; rotating order; no points | No | Yes | Yes | Replaces the points system | Keep |
| 5.3 | Extract 2.1; DSMP 8 Q10 | 1 to 2 Nov | Area is a 5 km distance search; council only for statutory routes. "Look further away" open | No | Partly | Partly | Yes: council-based area replaced | Question: offer "look further away" when few match? |
| 5.4 | DSMP 1.3, 8 Q2; smc hard gates | Mar; 1 Nov | Left out only by a hard gate, stated in terms, clearly met. A tag only lifts | No | Yes | Yes | No | Keep |
| 5.5 | DSMP 3.4, 3.8, 6 Q2 | 1 Nov, proposed | Group-only services not selected for someone who has not said they are in the group; population questions asked only where tagged services exist | Works against, in part: under-disclosure | Partly | Partly | No | Question, already put in DSMP 6 |
| 5.6 | smc ranking, declined answers | Mar | When unsure, include and rank lower; output limits parked | No | Partly | Partly | Yes, by DSMP Part 3 (proposed) | Change: redraft on DSMP Part 3 |
| 5.7 | smc two layers; DSMP Part 3 | Mar; 1 Nov | Fixed contacts, then matched local services | No | Yes | Yes | Order conflicts inside smc and with nhpe | Question: which comes first on screen? |
| 5.8 | DSMP 1.3, I5 | 1 Nov | Cards per organisation, full service text. Open: say why chosen? | No | Yes | Yes | No | Keep |
| 5.9 | DSMP 1.3; Extract 3.2 | 1 to 2 Nov | "Get in touch" button, tap recorded; completion proposed as asked to contact one service; closing "What feels like your next step?" proposed | Yes, with the closing question | No | Yes | No | Keep. Change: count an accepted onward offer as completion too |
| 5.10 | DSMP 8 Q11, 3.6; qpr B12 | 31 Oct; 1 Nov | The organisation already supporting the person is left out | No | Works against if silent | Partly | No | Question: should the card say "You're already in touch with X"? |
| 5.11 | Extract 3.6 | 2 Nov | A local contact line as a human touch point; later | No | No | Yes | No | Question: does it belong with places to start at launch? |

## 6. Safety, where it touches the outcomes

| # | Source | Date | Decision | N | V | C | Superseded? | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 6.1 | pr 6.2, 6.4; Extract 2.7 | 31 Oct; 2 Nov | Domestic abuse: help first, then location, then services and housing. Today the exit ends the session | No | Yes | Today's exit works against; the planned sequence fixes it | No | Keep. A planned remedy |
| 6.2 | Extract 2.6 | 2 Nov | The Safety route: open to everyone, plain type-of-harm question, exploitation named, no reporting option | Yes | Yes | Yes | No | Keep |

## What works against noticing or connection

1. A strict reading of "ask only what changes the next steps" (pr 4.1) leaves no room for a noticing question (1.6).
2. The Type A "no national number" rule, read across the category, can bar an onward offer inside Food and dignity provision (4.1).
3. Food with no stated onward offer after results (4.2).
4. Finance, Health, Addiction and Employment with no noticing question; Employment "not a prevention entry" (1.2, 4.5).
5. Supporter answers change wording only, though noticing often sits with the circle of support (1.3).
6. "No Addiction pointer" in crisis housing (2.2).
7. The substance use follow-up leads nowhere specific (1.7).
8. The quick route's assumed "no", and targeted population questions, reduce moments to disclose (1.5, 5.5).
9. A specialist per pressure can split one person across several services (3.6).
10. Leaving out the organisation already supporting someone without saying so (5.10).
11. The domestic abuse exit ending the session today, already planned for fixing (6.1).

## Where sources contradict each other

1. **Layer order.** smc: "The minimum signposting layer is shown first." smc's typology table and nhpe: "Local dynamic results above it."
2. **Counting pressures.** pr 8.1: "Several, or not knowing, lead to a place to start." pr 1.1: "it does not depend on the VA first counting pressures." Extract 3.1: "One organisation that fits, not a specialist per pressure."
3. **Asking position.** pr 8.3 asks it; Extract 2.8: "Position worked out, not asked."
4. **Housing early in prevention.** ep: "no housing endpoints surface unless the user raises housing." pr 8.3: "Housing Options and Shelter always shown alongside."
5. **Area.** DSMP 1.3 by council; Extract 2.1 by distance from the person.
6. **Recommending.** nhpe: no recommendations; DSMP Part 1: "We do not rank or recommend providers"; DSMP 1.3: "a sound recommendation".
7. **What a question needs.** qr: "no governance basis" outside routing; DSMP 1.1: routing, safeguarding, accessibility or another agreed reason.
8. **The consent screen.** qr: "an explicit, informed choice"; pr 1.4: a data protection check; qpr: "Contradicts the March removal of consent gates."
9. **Places to start and the cap.** pr 8.3: every place to start in the council; DSMP 1.3: up to five. Cannot establish whether they count.
10. **Two senses of "not sure".** pr 8.3: not sure what the problem is; Extract 1.10: not sure who the help is for.

## Questions for the Managing Director, most consequential first

1. **Places to start.** Beyond the person's own choice and "cannot yet name what is wrong", what leads to one? Point people to housing-factor specialists with a broader remit at launch, or later?
2. **Circle of support.** Should a supporter get their own noticing step and onward offer, at launch or later?
3. **Type A amendment.** May Food and dignity provision results carry an onward offer despite the no-national-number rule?
4. **Noticing questions.** Are the Finance, Health, Addiction and Employment questions the same as the prevention noticing step? Does Activities get one?
5. **Food decline.** Does "Just show me food near me" decline the onward offer, or only the question?
6. **Housing in early prevention.** Does Housing Options show upstream and beside places to start?
7. **Housing situation question.** Is it the crisis branch, with prevention position still worked out?
8. **Visibility.** Should the awareness line or card show how a pressure links to housing?
9. **Places to start and the five-result cap.**
10. **Crisis housing "no Addiction pointer".** Why, and does an onward offer apply?
11. **"Not sure" at who-is-it-for.** Is a place to start the intended answer?
12. **Already supporting.** Should the card say so?
13. **Layer order.** Fixed contacts first, or local results first?
14. **Why chosen.** Should cards say why a service was chosen?
15. **"Look further away"** when few match.
16. **Holding.** Not assessed while its definition is unsettled.

## Answers, 4 November 2026 (Managing Director)

| Question | Answer |
| --- | --- |
| 1. Places to start | A fallback in a sense. The VA is designed to fulfil part of the same function; where it achieves the aims and gets someone connected, an extra step is unnecessary and might become a barrier. Carried into Decision 4 |
| 2. Circle of support | Someone facilitating the conversation should see very little difference. Someone looking on behalf of another person clearly differs. Variants checked: see below |
| 3. Type A amendment | "Whatever is most likely to lead to connection." The Non-Housing Pathway Endpoints Contract's no-national-number rule is to be amended, through the contract's own change route, so Food and dignity provision results can carry an onward offer |
| 4. Noticing questions | "If it fits yes but otherwise we need to adapt to different circumstances." The same noticing step where it fits; adapted where it does not |
| 5. Food decline | "Just show me food near me" declines the question only. A light onward offer still follows the results, as for dignity provision |
| 6. Housing in early prevention | Housing Options always shows. Housing Options, a housing-factor specialist and Shelter show together once housing is in view (Extract 1.11, which replaces the July note) |
| 7. Housing situation question | Settled by VA #40: "keep things steady" goes to prevention, the other answers to crisis |
| 8. Visibility | Yes: one sentence beside the results showing how a pressure links to housing. It never changes which services show |
| 9. Places to start and the cap | Places to start count within the five. They are the fallback, not an extra list |
| 10. Crisis housing, no Addiction pointer | Reason cannot be established. Crisis results stay as they are; Addiction is offered afterwards through the noticing step |
| 11. "Not sure" at who-is-it-for | Not a route to a place to start: unsure who the help is for differs from unsure what is wrong. Treated as myself, as the code does now |
| 12. Already supporting | Yes: "You're already in touch with X, so it isn't listed again" |
| 13. Layer order | Statutory route first (Housing Options), then local services, then national helplines, as in VA #40 |
| 14. Why chosen | Later, not at launch (backlog item 17) |
| 15. Look further away | Yes, offered when few services match |
| Several pressures and organisation shape | Fallback wording at launch; matching by organisation shape, including housing-factor organisations with a broader remit, later (Extract 3.1, 2 November) |
| 16. Holding | Parked until its definition is settled |

**Variants in the code (staging, 4 November 2026).** "Who is it for" has four answers. "Someone I'm supporting" and "I'm a professional or organisation" both set the supporter wording (94 phrases). Sixteen safeguarding exit phrases (under 16, domestic abuse, sexual assault, self-harm) also have a professional version; every other phrase falls back to the supporter wording. "Not sure / just trying to find the right place" is treated as myself. The professional exits are shorter and assume professional knowledge, for example "You'll know what to do from here", and drop details such as "24 hours, free" for Samaritans. Nothing distinguishes someone facilitating, sitting with the person, from someone looking on behalf of another; the go-live plan puts the worker-beside-someone option after the switch.

---

# Variants review: supporter and professional wording

Read from the VA's staging branch (`cd67b68`) on 4 November 2026. The safety exits follow the Supporter and Professional Language Review v1.1, which James signed off in May 2026 (PR #20). They are not reopened here. One finding needs action: outside the safety exits, professionals hear warm reassurance written for friends and family.

## How the variants work now

- "Someone I'm supporting" and "I'm a professional or organisation" both use the supporter wording, "they" (94 phrases).
- Sixteen safety exit phrases also have a professional version. Every other phrase falls back to the supporter wording for a professional.
- "Not sure / just trying to find the right place" uses the "myself" wording.
- Nothing tells facilitating (the person beside the supporter) from looking on behalf.

## 1. Professional safety messages: v1.1 governs

An earlier draft of this tab proposed changing four professional safety messages. On 4 November they were checked against v1.1, and each difference from the supporter version is deliberate:

- The NSPCC adult helpline is left out because it is for non-professionals worried about a child. Professionals go to Children's Services directly.
- "You'll know your next steps from here" assumes the professional knows what to do. It also avoids implying a duty to refer that may not exist.
- Childline is worded for the professional to pass on to the young person.
- The professional self-harm message is approved v1.1 wording but isn't used yet. Connecting it is backlog item 72.

"Information is never less" (Decision 5) does not reach these: each is a choice of tone or leaves out a resource not meant for professionals. No change is proposed. Reopening any of them would take a v1.2 review for James, and only if something substantial has changed.

## 2. Reassurance professionals hear that was written for friends and family

These have no professional version, so a professional gets them as written:

| Where | Wording a professional hears |
| --- | --- |
| Housing results, closing line (built in code, both results layouts) | "They've taken an important step by reaching out today." |
| Self-harm exit (built in code) | "I'm really glad they reached out. They deserve support with this, and they're not alone." |
| Where are they living (`B7_HOUSED_SITUATION`) | "Thank you for reaching out on their behalf. Whatever's brought you here, I'll do my best to help." Replaced by VA #40's housing situation question |
| Where are they sleeping (`B7_HOMELESS_SLEEPING_SITUATION`) | "I'm sorry they're going through this." Replaced by VA #40 |
| Mental health acknowledgement (`B9C`) | "Mental health can affect so many parts of life." |
| No recourse to public funds acknowledgement (`C3Q1C`) | "Thank you for sharing that. I know this situation can be really difficult… I'll do my best" |
| Under 16 exit (`UNDER_16_EXIT`) | "Thank you for reaching out." |
| Domestic abuse, sexual assault, self-harm exits (supporter versions) | "You don't have to work this out on your own." A professional gets the professional version here |

**Proposed:** a professional version, plain and direct with the same information, for each row above that is not a safety exit. Two of them go with VA #40. The safety exit rows are covered by v1.1. The self-harm opener goes with item 72, which connects the approved professional version. The under-16 line is checked against v1.1 before anything changes.

## 3. Facilitating

When someone is helping a person who is beside them, every phrase above should be the "myself" version, spoken to the person. That needs the new "who is it for" answer (Decision 5); no new wording, because the "myself" phrases already exist.
