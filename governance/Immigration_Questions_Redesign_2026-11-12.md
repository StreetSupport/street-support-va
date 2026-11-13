# Immigration questions and routing: redesign

12 November 2026. Decisions are the Managing Director's, from the session of 12 November 2026, unless marked (proposed). Nothing is built.

## Why

The VA asks immigration status in two places with two different questions. The profile question on the work and money routes has ten options. The housing route's question has seven, and asks about public funds only after "no immigration status" or EU pre-settled. So the housing route never identifies someone with leave to remain and no recourse to public funds, and an asylum-seeking family never sees the family support block. Refused asylum seekers have no option on either route.

## Principle

Start from the endpoints and ask only what separates them (Managing Director, 12 November 2026). One design serves every route where the answer changes the result: crisis housing always, as question 6 in the order of 2 November, and the needs where the Service Matching and Questions Design Note of 8 November asks immigration (Finance, Health, Employment and Immigration). The VA surfaces where help is; it never tells anyone what they are entitled to.

## The questions

**1. Gate.** "Are you a British or Irish citizen, or settled in the UK?"
- Yes
- No
- Not sure
- Prefer not to say

(proposed) "Settled" covers indefinite leave to remain and EU settled status. Prefer not to say stores `null`, as for every such answer, and the person continues on the ordinary route.

**2. Only after No or Not sure.** "Which of these is closest to your situation?"
1. I've been granted refugee status or leave to stay
2. My asylum claim has been refused
3. I have a visa that says no recourse to public funds
4. I don't have a current immigration status
5. I'm still waiting for a decision on an asylum claim
6. I'm not sure

"My asylum claim has been refused" is the Managing Director's wording: people in that situation recognise themselves.

Each question keeps a supporter variant. (proposed) Both say why they are asked in words matching the Terms and Conditions (version 2: answers "are not linked to your identity and cannot be used to identify you"), for example: "This helps us find the right services. Your answer isn't linked to who you are." The current wording, "Your answer is confidential", promises more than the terms say.

## Where each answer points

| Answer | What the person sees |
|---|---|
| Gate yes, or prefer not to say | The ordinary route, unchanged |
| Granted refugee status or leave to stay | The ordinary route, plus resettlement services (Immigration, Resettlement and Integration) |
| Asylum claim refused | Hope Projects, which covers all seven councils, plus local immigration advice. (proposed) Hope Projects is lifted from its live platform listing rather than hard-coded, so its details stay the organisation's own responsibility (decision of 31 October) |
| Visa with no recourse to public funds | Local immigration advice, plus accommodation that accepts people with no recourse where it is listed in the area |
| No current immigration status | As for no recourse |
| Waiting for an asylum decision | Migrant Help only, for problems with asylum support. People in the asylum system normally have accommodation and support from the Home Office, so housing and immigration help is not what they come for (Managing Director) |
| Not sure | Local immigration advice; where none is held, the Immigration floor of 8 November: the Immigration Advice Authority's Adviser Finder |

**Families.** Children or a pregnancy come from the household question already asked. With answers 2, 3 or 4, the family support block shows as now: the council's children's services, Project 17 and Migrant Help.

**Population tags** (8 November design note, section 4): refugee status or leave to stay lifts "Refugees"; refused or waiting lifts "Asylum seekers"; no recourse or no current status lifts "Migrants". Lifting hides nothing.

**Overlays, unchanged.** LGBTQ+ (Micro Rainbow), women's provision and the Safety route's immigration trigger (decided 2 November).

## Parked

- **Care needs for refused asylum seekers.** Too rare to design for now (Managing Director, 12 November 2026).
- **Single adults with no recourse beyond immigration advice.** Waits on the scoping in `NRPF_scoping_2026-11-12`: each organisation's real remit and each council's offer.

## Checks, 12 November 2026

- **Hope Projects.** Its own website could not be reached from this session. Birmingham City of Sanctuary's page (modified November 2023) describes it as helping "destitute asylum-seekers and other new migrants barred from public funds", with referral through partner organisations; no phone or email given. If it is lifted from its live listing, no hard-coded contact is needed. Its wider remit feeds the scoping's check 1.
- **Confidentiality wording.** Checked against Terms and Conditions version 2: see the proposed wording above. Version 3 is in draft and should carry the same line.

## Governance

- Routing change: Service Matching Contract and Housing Pathway Endpoints Contract. Hope Projects as a hard-coded endpoint is a contact data change under the Endpoints Contract.
- Question change: the question purpose register and the Data Minimisation Note need entries for both questions.
- Build with the wider question rework set out in the Service Matching and Questions Design Note (8 November, VA #50), not separately: the same handlers and question order are changing there (Managing Director, 12 November 2026). Implementation by pull request for the technical lead, labelled consequential.
- Hope Projects as a hard-coded endpoint would be a contact data change under the Endpoints Contract; lifting it from the live listing avoids that.
