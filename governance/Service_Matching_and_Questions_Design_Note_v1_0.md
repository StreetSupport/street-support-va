# Service Matching and Questions: Design Note

*Version 1.0, draft for review, 8 November 2026. Tracker item I1 (VA #34). From the Managing Director.*

This note brings together, in one place, what the virtual assistant asks and how it chooses which local services to show. It gathers decisions already recorded across several documents and pull requests, adds the decisions of 8 November, and corrects earlier records where they now conflict. Section 11 lists what is still open, section 12 the work to complete, and section 13 the review of 8 November.

It creates no new reason to hide a service: exclusion stays within the Service Matching Contract's hard gates. The contract changes it needs (I3a, I3b) go through the contract's own approval.

Each decision carries its source. Anything marked *proposed* is not yet decided.

---

## 1. Purpose

The assistant asks questions so it can offer proper tailored solutions: services that, on the face of what they say and who they serve, fit the person and the point they have reached. It shows a few so the person is not overwhelmed. The rest stay one tap away, so selecting is not hiding and is not treating organisations differently.

Matching aims for a good fit, not the single best fit. It is not an exact science. (MD, 1 November 2026.)

---

## 2. Where the person is: position, not phase

**Phase belongs to services, is analytical only and does not route.** For a person, the assistant works out their position on the pathway from what they say. Nobody is asked to pick prevention. (MD, 2 November 2026; Pathway Position, Not Phase, pipeline #115.)

**The first question** offers eight grouped options, each with a second screen: Housing; Safety; Food, clothes or everyday things; Money, debt, benefits or work; Health, drugs, alcohol or gambling; Immigration or asylum; Things to do; Not sure where to start. (VA V4 Redesign Design Note, Decision 1, 4 November 2026.) Safety from harm is on the main menu in plain words. (MD, 2 November 2026.)

**Not sure** leads to a place to start. A place to start is a recommendation, not a need or an entry point. Where an area has none, nothing is offered in its place. (MD, 2 November 2026; Design Note, Decision 4.)

**Housing positions** are set by the housing situation question, "Which of these is closest to your housing situation at the moment?" (MD, 3 November 2026; VA #40):

| Answer | Position | Housing subcategories matched |
|---|---|---|
| Somewhere to live, want help to keep things steady | Prevention | Advice, through the prevention conversation (section 3.5) |
| Somewhere to live, but going to lose it | Crisis, still housed: the loss has materialised | Advice: local housing and legal advice (Endpoints Contract 1.2) |
| Staying somewhere for now | Crisis, home lost | Emergency accommodation and Supported housing; standard housing endpoints |
| Sleeping rough or nowhere tonight | Crisis, home lost | Emergency accommodation and Supported housing; StreetLink offered, marked urgent |
| Leaving prison or hospital | Crisis, home lost | Emergency accommodation and Supported housing; the line that staff there can refer them to the council's housing team; no StreetLink |
| In a hostel or supported housing, or recently moved in after being homeless (new answer) | After: rebuilding | Move-on accommodation and Tenancy setup; Tenancy setup for someone recently moved in |
| Not sure, or something else | Not assumed | Housing Options, the navigator and Shelter |

The rebuilding answer is one answer, not two, to keep the question short; a follow-up can split it if testing shows people do not recognise themselves in it. Housing Options and Shelter stay on the floor. (MD, 8 November 2026.) It changes the question every housing conversation starts with, so it is safeguarding-adjacent and goes to the technical lead with tests for each answer, including each of the rebuilding answer's two cases.

Answers that share subcategories keep their own endpoints, as the Endpoints Contract 1.2 sets them; each is tested on its own (VA #40).

Choosing subcategories by position is required, otherwise the assistant offers services that only appear to match: before loss of home and after loss of home need different help. It is a rule in the assistant, read from the subcategory, with no new platform field. It selects; it hides nothing, and the rest stay behind "See all". (MD, 8 November 2026.)
**Within prevention**, the line is whether housing has come into view, not how many pressures there are. It changes only on what the person states. (MD, 2 November 2026.)

---

## 3. The questions

### 3.1 The test for a question

**A question belongs if its answer adds an endpoint or changes the local match.** (Working note, 2 November 2026, applied to crisis housing.) There has to be a reason to ask a question. (MD, 2 November 2026.)

Whether a question is worth asking depends on what the answer means for the person, not only on what listings say. An arson conviction matters even though no listing mentions arson, because it adds specialist endpoints. (MD, 8 November 2026; C11.) So the test is not whether tagged services exist in the area (section 10).

**Applied by parent, nationally.** A need asks a question if its parent holds services designed for that group anywhere, or if the answer adds an endpoint. Every area asks the same questions for the same need. (MD, 8 November 2026.)

**Optional, and ordered by consequence.** The extra questions stay a choice. Within each need, questions that add an endpoint or meet a stated restriction come first, then those that only lift a designed-for service. (MD, 8 November 2026.)

**Data protection first.** LGBTQ+, health and ethnicity are special category data and convictions are criminal offence data. Each question on each pathway is written into the data protection notes (D2) before it is built. (MD, 8 November 2026.) The rule above proposes a question; D2 decides whether it is asked. A question whose necessity on a pathway cannot be recorded there is not asked on that pathway. The extra-questions screen is a choice about the conversation, not consent, and is never relied on as a lawful basis.

**Ethnicity** is asked among the extra questions on every pathway that asks population questions, introduced by why it is asked: "Some services are run by and for particular communities. Telling us your ethnicity helps us show you those." Answers use the five census high-level groups with a short list beneath each. A tagged service is lifted where the community it names includes the person's census group, or where it serves minoritised communities generally. The tagged listings name particular communities (in the WMCA data: African women; African Caribbean; South Asian men; Chinese; Black and minoritised women; Black, Asian and minority ethnic young people; or "culturally sensitive" with no community named), so one broad lift would raise services designed for someone else. The community each tagged listing names is recorded once, by a person, from its text, and kept with the listing. (MD, 8 November 2026, replacing the earlier "any answer except White British" rule after the review of 8 November.) Reach and equity analysis is aggregate only, under the Analytics Contract's small-numbers limits. (MD, 8 November 2026; register Q1.)

The map is reviewed once the national baseline lands, since national data will add groups to parents.

Prevention may ask more than crisis, because understanding the situation is its purpose. Each exploratory question still carries a documented purpose in the question register. (MD, 2 November 2026.)

### 3.2 Before any pathway

- **Who it is for:** asked early because it sets the framing of every question. (MD, 2 November 2026.) "Not sure" is kept and leads to a place to start, not silently turned into "myself" (extract 1.10).
- **Preferred name:** kept, for conversational purposes. Never sent to Claude for interpretation; the under-16 check runs first. (MD, 3 November 2026; VA #38.)
- **Extra questions:** offered as a choice, not a consent gate: "Would you like to answer a few more questions so I can find services that fit you better?" (MD, 3 November 2026; VA #38.)
- **Prefer not to say** is offered throughout and stores nothing. (VA #38.)
- **Route choice:** the quicker route says which circumstances it does not ask about. (MD, 6 November 2026; VA #47.)

### 3.3 Crisis housing

In this order (MD, 2 November 2026):

1. The housing situation question (section 2).
2. Safety, early and plainly, including exploitation. A yes moves the person to the Safety pathway, and Housing Options travels with them through its Safety listing.
3. Age.
4. Care: asked of everyone aged 16 to 24. (MD, 6 November 2026; VA #46.) Worded as "ever been in care". (MD, 2 and 8 November 2026.)
5. "Have you ever served in the armed forces?" (MD, 2 November 2026.)
6. Immigration status.
7. Household and gender together; pregnancy and children asked of everyone, pregnancy covering a partner.
8. LGBTQ+.
9. Convictions, last.

**Dogs:** "Do you have a dog with you?", with Yes, No and Prefer not to say. Asked inside the household moment, after household and gender, only where the result is accommodation (home lost). It lifts services that take dogs and hides nothing, because "no dogs" is not an established hard gate. On a yes, the assistant shows Dogs Trust's Together Through Homelessness scheme (free vet care and a directory of dog-friendly homelessness services; 020 7833 7611, tth@dogstrust.org.uk, checked at dogstrust.org.uk on 8 November 2026) and one line: "Many places to stay can't take dogs, so it's worth checking with each one before you go." Local vet care is not promised until West Midlands coverage is confirmed. (MD, 8 November 2026.)

**Not asked in crisis housing:** health and disability (listings say too little, so asking would over-promise; recorded as a possible gap in listings and provision); substance use (it would not filter, and Addiction is reached as its own need). (MD, 2 November 2026.)

### 3.4 Sixteen and seventeen

They stay under safeguarding, in a conversation with choice, not a hard exit. (MD, 2 November 2026.)

- One plain question on every housing route: "Are you in care, or in touch with a social worker at the moment?" (MD, 2 and 3 November 2026; VA #39.)
- Asked: children's services involvement, pregnancy and children, LGBTQ+ and immigration. Not asked: convictions and armed forces. (MD, 2 November 2026.)
- Where already involved: "If you need something different, or more help alongside that, these can help too." (VA #39.)
- A young people's prevention route before launch, built around family mediation. (MD, 2 November 2026; C10.)

### 3.5 Prevention

- **The noticing step:** after the need, the assistant asks what else is putting pressure on the person, holds the pressures they name together and reflects the link back in approved wording. It rests only on what the person states. (MD, 2 November 2026.) The wording (MD, 8 November 2026): "Thanks. Sometimes one thing is tied up with others. Is anything else putting pressure on you at the moment?" Multi-select, leaving out the need already chosen: money, work or bills; health, including how I'm feeling; family or relationships; drink, drugs or gambling; keeping my home or paying rent; I don't have a settled place to live; feeling unsafe; nothing else; I'm not sure. A skip, "Just show me help with [need]", so declining still gets what they came for.
- **The awareness line** is the Managing Director's wording of 2 November 2026. Until the matcher can find one organisation that fits across pressures (it needs the shape field), it ends with a fallback instead (MD, 8 November 2026):
  - *Area with a place to start:* "Thanks for telling me. When a few things are pressing at once, they can start to affect each other, including impacting your housing situation. Here's help with [their need]. If you'd like someone to look at the wider picture with you, [place to start] is a good place to start."
  - *Area without:* "Thanks for telling me. When a few things are pressing at once, they can start to affect each other, including impacting your housing situation. Here's help with [their need]. When you speak to them, it's worth mentioning the other things going on, so they can see the wider picture too."
- **"I don't have a settled place to live"** is an option in the noticing step for every need, leading to the housing situation question. Offered among the pressures, never asked of everyone. (MD, 8 November 2026.)
- **Essentials and Health** run like Food: one optional noticing step, results either way. For dignity items such as showers and laundry, results come first. (MD, 8 November 2026.)
- **Finance crisis entry:** no separate entry. A person whose home is at risk names it at the noticing step, which leads to the materialisation check and the housing situation question. (MD, 8 November 2026, adopting the proposal of 2 November.)
- **Once housing is in view:** Housing Options, a housing-factor specialist and Shelter. (MD, 2 November 2026.)
- **Entries:** Finance goes straight to prevention. Addiction gets a full exploration, and the person can always step out and get the addiction services they came for. Employment and Activities are not prevention entries. Essentials is, where the link is financial difficulty. (MD, 2 November 2026.)

### 3.6 Safety from harm

Reached from the crisis gate, the safety question in housing, the main menu or a disclosure. Once on it, the conversation is the same, and nothing already answered is asked again. (MD, 2 November 2026.)

**Safeguarding comes first.** Reusing answers never suppresses a safeguarding exit or reset. The Safeguarding Contract's requirements hold on every entry: prescribed exits bypass the matcher and the AI, a safeguarding signal overrides existing state, the crisis gate runs on every new session or restart, and no failure ends in a dead end. Each entry route is tested for these before the Safety pathway is released, and the technical lead reviews it for safeguarding.

- **Type of harm,** multi-select in plain words: someone close hurting, threatening or controlling me; being forced to marry; FGM; sexual assault; being made to work, having money or documents taken, or being controlled where I live or go; being made to work to pay off a debt; something else. (MD, 2 November 2026.)
- **Then:** whether the person is OK to carry on. A no reuses the matching crisis gate exit exactly as written. (MD, 2 November 2026.)
- **Domestic abuse and sexual violence:** outcomes are access to safe accommodation, someone to talk to, and advice on what I can do. Gender and LGBTQ+ are asked wherever an outcome lists organisations, because orientation or gender changes the organisations and the endpoints. (MD, 2 and 8 November 2026; register Q6.) Access to safe accommodation also asks children and immigration status, because the domestic abuse layer routes on children and no recourse to public funds limits refuge access. (MD, 8 November 2026.)
- **Modern slavery and trafficking:** open to everyone. Outcomes are getting out safely, and advice on what I can do. Age and immigration are asked; gender and LGBTQ+ are not, because support runs through the National Referral Mechanism. (MD, 2 November 2026.)
- **Sex work:** reached through the Safety pathway, where its listings sit with no subcategory. (MD, 2 November 2026.) The assistant never identifies anyone as a sex worker: the person chooses. (MD, 8 November 2026):
  - "Support for people who sell or swap sex" sits on the Safety second screen, not in the type-of-harm list, so it is not framed as harm.
  - Then "What would help most?": staying safe while working (tagged services and sexual health); help to make changes (tagged services and exit support); something has happened to me (the type-of-harm question).
  - Gender is the only population question.
  - The sexual violence route also includes these listings as candidates.
  - The option stays out of the launch build until its wording has been tested with the organisations whose listings carry the tag. Until then those services are reached through "See all" and the sexual violence route. (MD, 8 November 2026.)
- **Advice on what I can do:** a link to the website's advice page, opened in a new tab, with one approved line saying what the page covers. No second copy of the advice. (MD, 8 November 2026.)

### 3.7 Other needs

- **Food:** one optional question, with "Just show me food near me" as a first-class choice. Where a service needs a voucher, show how to get one. (MD, 2 November 2026.)
- **Population questions by need,** under the rule in 3.1 (MD, 8 November 2026), subject to D2. Ethnicity is added to each list except Food:

| Need | Questions |
|---|---|
| Finance | Age, care (16 to 24), armed forces, immigration, children, gender |
| Health | Age, gender, LGBTQ+, children, immigration, care, convictions |
| Addiction | Age, gender, LGBTQ+ |
| Immigration | Status, gender, LGBTQ+ |
| Employment | Age, gender, care, convictions, immigration, armed forces, children |
| Essentials | Dogs, gender, children |
| Activities | Age, gender |

Drawn from the WMCA listing packs of 1 November 2026, the only data read so far.

---

## 4. How services are chosen

1. **Need, kind of help and area.** Services in the V4 category, and the subcategory set by the person's position, near them. Near means the website's distance search, widened when nothing is found within 5 km. (MD, 6 November 2026.)
2. **Hard gates.** Leave out only services whose listing plainly says the person cannot use them (section 5).
3. **One per organisation.** An organisation appears once, on one card, with each of its matched services inside it (I5). Its fit is the fit of its best-matching service, not the sum across its services, so the same answer is never counted twice.
4. **Five or fewer: show them all.**
5. **More than five: order by fit** (section 6), and show the first five.
6. **"See all on Street Support"** after the cards. It opens the website's listing for the category and area. That page applies none of the assistant's choices about the person: it is not narrowed by position and applies no hard gates, so it shows broader platform results, not the assistant's filtered set. Every service the assistant did not exclude is reachable there. Today the link goes to the council area's page for an old category (`buildSSNBrowseLink`, VA `staging`); it moves to the V4 category with the matcher build.

These come in addition to the statutory routes and fixed contacts, which are always shown. (MD, 1 November 2026.)

---

## 5. When a service is left out

Only where all three hold:

- an established hard gate in the Service Matching Contract applies (age, gender, jurisdiction, access barrier);
- the listing states the restriction **in terms**, such as "women only", "open only to", "Female only" or "16-25 only";
- the person's answer clearly falls outside it.

Anything weaker excludes nothing: "especially", "mainly", "designed for", "welcomes". (MD, 8 November 2026.) Neither the platform nor V4 holds a restriction field (MD, 1 November 2026). Population tags mean "designed for" and never hide a service.

**Where it is unclear, the service is shown.** An overlapping age band, a declined answer, or a restriction on one session of a wider service excludes nothing. In a combined listing, a restriction in one section does not exclude the whole record.

**Already in place:** the gender filter (VA #32) and the age fix (VA #49) apply this rule to labels.

**To test before the text rule is relied on:** a women-only session inside a wider service; a service mainly for young people; an age limit on one activity only.

---

## 6. Ordering: tailoring by fit

When more than five remain, each is ordered by how many of the person's answers it fits. Each criterion counts once and every criterion counts the same. A criterion counts only where the person has said something **and** the listing states the matching thing explicitly; a blank never counts, for or against. Equal fits rotate, so no organisation always comes first. (MD, 8 November 2026.)

**Not favouritism.** An organisation whose listing states more of what someone needs has given better evidence that it fits. The same rule applies to every service. (MD, 8 November 2026.) Completeness alone lifts nothing: a tag counts only where the person has given the matching answer.

**Not the old points system,** which used fixed weights chosen by us and scored empty boxes. Here there are no weights, and nothing counts unless both sides have stated it.

| Person's answer | Listing evidence |
|---|---|
| Age | "Young people" tag |
| Gender | "Women" or "Men" tag |
| LGBTQ+ | "LGBTQ+" tag |
| Children or pregnancy | "Parents and families" tag |
| Care | "Care leavers" tag |
| Armed forces | "Veterans" tag |
| Dogs | "People with dogs" tag |
| Immigration status | "Refugees", "Asylum seekers" or "Migrants" tag |
| Convictions | "People with criminal records" tag |
| Ethnicity | The community the listing names, as recorded with the listing (3.1). The "Ethnic minority communities" tag alone lifts nothing. Used once its Article 9 basis is recorded in D2 |

"Sex workers" and "Survivors of modern slavery" are reached through the Safety pathway rather than ordered by a question.

**Tests,** on controlled fixtures with repeated runs:

- A service designed for the person's situation comes ahead of one that is not, where they otherwise fit equally.
- Equal fits rotate, and no organisation comes first more often than the others over many runs.
- A blank never moves a service, and extra tags with no matching answer move nothing.
- An organisation with several matched services is ordered by its best one.
- A declined or changed answer never excludes a service, so an optional question never becomes an eligibility condition.
- "See all" opens the V4 category page for the person's area, and every service the assistant did not exclude appears there.

How often equal fits arise, and whether rotation needs more definition, is reviewed once the matcher runs. (MD, 8 November 2026.)

---

## 7. The organisation already supporting someone

Where the person says an organisation is already supporting them, it is left out of their suggestions, silently. (MD, 8 November 2026.) This is not yet a reason the contract records, so it goes through I3b with the contract amendments to trustees by email. It is not built until that approval is recorded.

---

## 8. The card

It follows the website's card as far as possible: one per organisation, with each matched service inside it (I5). Where a service was raised because it is designed for the person's situation, the card says "Designed for …". The hide button in the domestic abuse pathway covers the case where someone else may see the screen. (MD, 8 November 2026.)

---

## 9. Few or no matches

The person always receives a response: matched services, or the fallback for their need. The assistant never says there is no local support.

- **One to four:** show them, then "See all on Street Support".
- **None, after widening:** depends on the parent. (MD, 8 November 2026.)

The contract's typology (Non-Housing Pathway Endpoints Contract v1.0) carried to V4 (MD, 8 November 2026; tracker B2):

| V4 parent | Type | When nothing matches |
|---|---|---|
| Housing | Own pathway | The council route and fixed contacts |
| Safety from harm | Own pathway | The safeguarding routes, emergency numbers and the Modern Slavery Helpline |
| Health | B | NHS 111; LGBT Foundation for LGBTQ+ users |
| Finance | B | Turn2Us for benefits and grants; Citizens Advice for money advice, including debt |
| Employment | C | Jobcentre Plus for jobs; National Careers Service for skills |
| Addiction | B (new) | By subject: FRANK for drugs, 0300 123 6600 (nhs.uk); the National Gambling Helpline, 0808 8020 133, free, 24 hours (gamcare.org.uk); alcohol floor not yet verified at source |
| Immigration | C (new) | Asylum seekers: Migrant Help's asylum helpline, 0808 8010 503, free, 24/7 (migranthelpuk.org). Everyone else: the Immigration Advice Authority's Adviser Finder on GOV.UK, framed as finding regulated advice near you |
| Food, Essentials, Activities | A | Honest acknowledgement, "See all", gap signal |
| Place to start | None | Nothing offered in its place (MD, 2 November 2026). An honest line and the main menu again (MD, 8 November 2026): "There isn't a drop-in near you that we know of. Choosing what's closest from these will help me find the right support." |

**Three cases kept apart.** No match for this search is a fact the assistant can state. No service known locally is what the honest acknowledgement says ("that we know of"). No service existing cannot be inferred, so the assistant never says it. The search failing and the location being missing are handled and tested separately from a search that returns nothing.

Immigration is type C, not B, because immigration advice can only come from a regulated adviser; a national number that gives no advice would be false comfort. Contacts checked on 8 November 2026 and rechecked before build. A typology change is a contract review trigger, so this goes to trustees by email with the C9 amendments.

---

## 10. Corrections to earlier records

| Record | What it says | Now |
|---|---|---|
| VA Design and Service Matching Proposal (1 Nov), section 3.8, section 4 and section 8 question 6; VA V4 Redesign Design Note (4 Nov), Population | A population question is asked only where area and need include services tagged for that group | Replaced by the test in 3.1 (MD, 8 November 2026) |
| Working note (2 Nov), crisis housing | Pets left out for now | Dogs question added for accommodation (MD, 8 November 2026) |
| Question register, Q1 | Ethnicity: ask everyone or targeted | Asked among the extra questions on every pathway asking population questions; census groups (MD, 8 November 2026). A service is lifted by the community it names (3.1) |
| Question register, Q2 | Preferred name: remove or keep | Kept, for conversation (MD, 3 November 2026; VA #38) |
| Question register, Q5 | Consent screen | A choice, not a gate (MD, 3 November 2026; VA #38) |
| Question register, Q6 | Orientation as the routing input in domestic abuse and sexual assault: proposal | Confirmed (MD, 8 November 2026); for safeguarding review |
| Question register, Q7; VA #46 | Care asked as "currently in care" and "in contact with social services" | Wording to become "ever been in care" (MD, 2 and 8 November 2026) |
| Service Matching Design Note draft v1.0 | Veterans, people with dogs and sex workers have no question | Corrected in sections 3 and 6 |

---

## 11. Left to explore (Managing Director)

1. **Quick exit:** not yet designed. It must cover the assistant and any website page it links to, including the advice pages (3.6).
2. **Rotation of equal fits:** reviewed in practice once the matcher runs.
3. **Alcohol floor for Addiction:** left open for now; no national alcohol helpline has been verified at source. (MD, 8 November 2026.)

**Parked by decision**

- Completion and the "Get in touch" button: its own session, with the Analytics Contract amendment. (MD, 8 November 2026.)
- Honour-based violence, helper access, and the routing engine. (MD, 2 November 2026.)

---

## 12. Work to be completed

Things this design needs that do not yet exist. Rounds are the VA plan's review weeks. Where the record gives a round, it is cited; the others were set by the Managing Director on 8 November 2026. Each row closes on the evidence in its "Test evidence" column and, where needed, the approval named, cited by the pull request or record that closes it. This gives trustees the control position without a second register.

| # | Work | Owner | When | Test evidence | Approval needed |
|---|---|---|---|---|---|
| 1 | Quick exit design, covering the assistant and linked website pages. A release gate for the journeys it covers | MD; James | Week of 16 November (extract: C3) | Works from every Safety screen and linked page | Safeguarding review, James |
| 2 | Safety pathway: every entry route preserves the prescribed exits, state reset and restart (3.6), and a safeguarding disclosure at any question, on any pathway, interrupts the sequence at once | Claude Code; James | With the Safety build | One test per entry route; one per question for interruption | Safeguarding review, James |
| 3 | Website advice: check the domestic abuse and sexual violence pages; write the modern slavery page from official guidance | MD | Before launch (extract 2.16: by M6) | Page read against its approved line | MD |
| 4 | One approved line per advice page, in the phrasebank | MD drafts; James reviews | With each page; Safety lines week of 16 November | Phrasebank entry | James |
| 5 | Data protection (D2): for every question on every pathway, its purpose, necessity there, lawful basis, special category or criminal offence condition, data flow, retention, effect on matching and what happens on a decline. Ethnicity under Article 9; LGBTQ+, health and convictions beyond domestic abuse and sexual violence; dogs. Correct the Appropriate Policy Document's "no logs" line. Record that the extra-questions screen is not consent | MD; James reviews the notes | By M6 (extract 2.14, 2.20) | Each built question has a D2 row | As the D2 notes require |
| 6 | Ethnicity: record the community each tagged listing names (3.1) | MD | Before the ethnicity question is built | 14 WMCA listings recorded | MD |
| 7 | Four VA contracts for board ratification: Housing Pathway Endpoints, Non-Housing Pathway Endpoints, Service Matching v2 and VA Analytics v2. The VA works to all four, but none has been ratified. The technical lead checks each against the code first, and the VA Governance Overview's "Approved baseline" lines are corrected in the same pass. Already recorded: pipeline `reports/board_preparation/JAMES_VA_CONTRACTS_FOR_RATIFICATION.md` and `PIPELINE_BACKLOG.md`, both on main. Other status lines that read draft are wording not yet updated (MD, 8 November 2026) | James, then MD | As the backlog item sets it: before the board papers | Each contract checked against the code | Board ratification |
| 8 | Endpoints Contract: endpoints for the rebuilding position; Dogs Trust on a dogs yes | MD | Drafts week of 16 November (extract 2.17) | Endpoints tested per answer | Trustees by email, with the C9 amendments |
| 9 | Non-Housing Endpoints Contract amended for the V4 typology, including the alcohol floor verified at source | MD | Drafts week of 16 November (extract 2.12, 2.17) | Each floor's source, audience, coverage and wording recorded | Trustees by email, with the C9 amendments |
| 10 | Service Matching Contract: the already-supporting exclusion (I3b). Not built until approved | MD | With the C9 amendments | Approval recorded | Trustees by email |
| 11 | Dogs Trust: confirm which West Midlands towns the vet scheme covers | MD | Week of 9 November | Reply from Dogs Trust | None |
| 12 | Sex work wording tested with the organisations whose listings carry the tag; the option is added only after | MD | After launch | Their responses recorded | MD |
| 13 | Phrasebank wording: the rebuilding answer, the dogs line, both fallback lines, "I don't have a settled place to live", the sex work option and question, the ethnicity introduction | MD drafts; James reviews | With the build that uses each | Phrasebank entries | James |
| 14 | Care question worded as "ever been in care" (VA #46 still asks "currently in care") | Claude Code; James | Week of 16 November | Tests for 16 to 24 | Safeguarding review, James |
| 15 | Route choice screen lists ethnicity (VA #47) | Claude Code; James | With #47 | Screen test | James |
| 16 | Matcher and question map built in V4 terms, replacing `needProfileRequirements`: the housing situation question's new answer, dogs, ethnicity, organisation fit, rotation. Not the sex work option, which is outside launch scope (work item 12) | Claude Code; James | Week of 23 November, with the matcher (extract 2.13: I1 to I9) | The fixture and repeated-run tests in section 6; zero results, search failure and missing location tested separately (section 9) | James |
| 17 | Mark what this note supersedes: the tag-presence rule in the 1 November proposal and the 4 November design note; the reading rule and the no-question tags in the 4 November note; answers to the question register's questions 1, 2, 5, 6 and 7 | Claude Code; James | With this note's PR | Diff | James |
| 18 | Review the question map against the national baseline, including whether people recognise themselves in the wording | MD | When the national baseline lands | Map compared with national populations and endpoints | MD |

---

## 13. Review of 8 November 2026

An AI-assisted documentary review of this note (draft, not adopted) found the design coherent and suitable for continued development and testing, with release dependent on the work above. Its findings and where each is handled:

| Finding | Handled in |
|---|---|
| A1 Safeguarding routing and quick exit | 3.6; work items 1 and 2 |
| A2 Sensitive questions and data protection | 3.1, including the ethnicity lift by named community; work items 5 and 6 |
| A3 Contract amendments and authority | Section 7; work items 7 to 10. The Governance Decision Framework is adopted (board authority register, May 2026); the review had a draft copy. Four VA contracts await board ratification, as the technical lead recorded in October (work item 7); other draft status lines are wording not yet updated |
| A4 Matching and neutrality | Sections 4 and 6. Fuller listings ranking higher is a settled decision (MD, 8 November 2026); completeness alone lifts nothing |
| A5 Housing position mapping | Section 2 table split; tests per answer |
| A6 Missing matches and fallback | Section 9; work items 9 and 16 |
| A7 Question consistency | Section 6 tests; work item 18 |
| A8 Traceability | Section 12's evidence and approval columns |

**Second review, 8 November 2026.** A second documentary review found the design "substantially satisfied", with implementation assurance outstanding, and no wholesale revision indicated. Its three observations are handled: the ethnicity row in section 6 now says the named community controls the lift; section 4 says "See all" shows broader platform results, not the assistant's filtered set; work item 2 covers a safeguarding disclosure interrupting any question. The next review should check the evidence in section 12 rather than repeat the design review.

**Third review, 8 November 2026.** A third, targeted review found no new contradiction and no governance issue requiring the design to be reopened, and treats the note as the working design specification, subject to its approval arrangements. Its two wording points are applied: section 9 now says the person always receives a response or a fallback, and work item 16 states that the sex work option is outside launch scope.

---

## 14. Accessibility

The assistant meets WCAG 2.2 level AA, as the website does, and follows the W3C's cognitive accessibility guidance. The brand green is #236c58 (6.25:1 against white), shared with the website. (Managing Director, 8 November 2026; VA Accessibility Proposal, 8 November 2026.)

**Every screen:**

- Colours come from one shared setting, never a colour typed in.
- Every control is a real button or link, and its visible words begin its accessible name.
- Buttons are at least 44 by 44 pixels (good practice for phone use; the AA minimum is 24 by 24), with a visible focus outline.
- Text at 4.5:1 and control edges at 3:1. Colour is never the only signal.
- After each answer, focus moves to the new reply, so its question and any context, including crisis numbers, are read in full before the person responds.
- The person can see how many services were found, move between them easily, and see that more are on Street Support.
- A request for reduced motion is respected.

**Offer questions** ("Yes, include them" / "No thanks"): the buttons are grouped with the question, so they make sense read alone, and the choice is echoed back as text, not shown by colour.

**"Designed for" on cards:** written words, after the service name and within the same card, worded as who the service is shaped for, never as an exclusion.

**Advice links:** say they open in a new tab, are named after the organisation or page, and are underlined.

**The quick exit, when designed:**

- A visible button with words, in the same place on every screen of the pathway.
- Reached in one or two presses of Tab, at least 44 by 44 pixels, and usable by mouse, touch, keyboard and switch access.
- No confirmation step and no time limit.
- Any keyboard shortcut must not be a single letter and must not use Escape, which closes the chat.

Where the quick exit goes and what it clears are safeguarding decisions, made separately.

**Before launch:** the interface fixes in the VA Accessibility Proposal; checks in a browser and with the main screen readers; contrast of every component in every state; and a few realistic journeys end to end on a phone and by keyboard or screen reader. Testing with people who use assistive technology is recommended where it can be arranged.

---

## Sources

- VA analytics and questions working note, 2 November 2026 (Claude Docs; no repo copy).
- VA Decisions and Delivery Extract, 2 November 2026 (`docs/va-review-2026-10-31`).
- VA V4 Redesign Design Note, 4 November 2026 (VA #42).
- VA #34, Design and Service Matching Proposal, with the technical lead's answers of 5 November 2026.
- VA #38, #39, #40, #46 and #47: decisions of 3 and 6 November 2026.
- Housing Pathway Endpoints Contract 1.2 (VA #45).
- Service Matching Contract v2.0; Three Test Framework 3.4; Shaping a Service Listing.
- Managing Director decisions in conversation, 8 November 2026.
