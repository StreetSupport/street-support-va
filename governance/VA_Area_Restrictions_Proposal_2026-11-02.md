# Area restrictions and local connection in the VA

2 November 2026 · Matt Lambert

*Exported from the working copy at https://claude.ai/artifact/34dpXGFjumG8ZsuRMWqFXx (revision 12), 2 November 2026. This file is the repo record.*

## Proposal

The VA will find services by distance, as the website does, so some people will be shown services they cannot use because of where they live. This paper proposes two measures that deal with that honestly, without the VA judging anyone's eligibility.

1. **Stated restrictions shown on the card,** in the organisation's own words and attributed to it, where the listing states one.
2. **A field on the platform for who a service is open to,** including area, set by the organisation. Agreed in principle now, designed and built after launch.

Nothing is excluded on area. Otherwise the VA presents results as the website does, with Housing Options first on every housing result. **Decision asked:** adopt both, measure 1 for launch and measure 2 after it.

## The issue

**Distance search.** The VA will read the platform as the website does (decided 31 October). The website never searches by council: Find Help fetches every service within a radius of the person, 5 km by default, with 1 to 25 km offered; location pages search from the location's point (`streetsupport-platform-web` main at `33202ae`, read 2 November). So the VA will show services across council borders. The council is still used for the statutory routes, which come from the endpoints file.

**The council's own duty is not the problem.** The Homelessness Code of Guidance, chapter 10 (updated 15 October 2026): councils are generally not required to make local connection inquiries (10.15); referral to another council is discretionary and only from the relief stage, and the first council keeps the duty until notice (10.32, 10.36 to 10.38); referral is barred where the person would be at risk of domestic abuse or other violence (10.51 to 10.54). Housing Options can always be approached where the person is.

**Other services do restrict by area.**

- Oxford City Council applies local connection to "most" commissioned accommodation services; outreach, day centres and employment support do not require it; care leavers, people fleeing violence and severe weather are exempt.
- Crisis's evaluation of reconnection (Johnsen and Jones, 2015) found that in every case study area, rough sleepers who refused reconnection were denied council-funded hostels and day centres, and that people with no local connection anywhere were left without essential services.
- In the West Midlands, P3's Dickens Lodge in Wolverhampton states "Local connection required" on Homeless England.

**Our own listings.** A pattern search of all 301 WMCA organisations and 1,399 services in the 28 October baseline (September capture text) found about 24 organisations that state an area restriction:

| Kind | Organisations | Mostly |
| --- | --- | --- |
| Council area or local connection, stated plainly | 5 | Addiction, housing support, mental health, a community grocer, Birmingham Housing Options |
| Council area, worded as who it serves | 5 | Money advice, employment |
| Postcode area or distance, stated plainly | 10 | Food pantries and grocers, money advice, a baby bank |
| Neighbourhood, loosely worded | 4 | Food |

**No accommodation listing states a local connection requirement.** Dickens Lodge's SSN listing does not, though Homeless England records one. So the larger risk is a restriction that exists but is not written down, which the VA cannot see. Postcode and distance limits matter more than council ones: a 5 km search will show a pantry limited to 3 miles, or a shop limited to 1.6 km, to people outside it.

Birmingham Housing Options' own listing says it is for residents or those with a local connection, which is narrower than the duty. The VA's statutory route does not use that text.

## What changes

| Measure | What the person sees | Why | When |
| --- | --- | --- | --- |
| 1. Stated restrictions on the card | The organisation's own words, attributed to it, for example "This service says it is open to people living in CV4 and CV5" | Covers the 24 organisations that state one; judges nothing; brings forward part of the parked "show stated restrictions" option (E2) | Launch; with the card build (I5), 23 November round |
| 2. A "who it is open to" field on the platform | Nothing at launch. Later, conditions shown from the field instead of found in text | Restrictions are visible today only when an organisation writes them into its description; the VA is what creates the need for a field (extract 3.9). Mechanical, through the admin form, not outreach | After launch; agreed now |

Measure 1 needs a rule for when listing text counts as a stated restriction; that is the reading rule already open (I2). Until it is settled, measure 1 applies to restrictions stated plainly, the first and third rows of the count. The VA never turns ambiguous wording into a restriction: the listing text is still shown as written, and the restriction is always attributed to the organisation, because it belongs to the listing, not to an assessment by SSN.

Measure 2 agrees that the platform needs to capture conditions. The field's design is decided later, since residency, postcode, referral routes, local connection and service-specific criteria may not fit one field.

**Unwritten conditions.** Accommodation that requires local connection without saying so is covered by what the VA already does: Housing Options is shown first on every housing result, as the first step, and is where someone finds out what accommodation they can use. The WMCA trial (M5) will show whether wasted contacts happen in practice, and partners checking their own listings in the trial may add their conditions.

## Ruled out

- **Leaving services out on area.** Local connection is not where someone is now: it turns on six months' residence in the last twelve, family, work or care history. Excluding on it would be the VA judging eligibility, which it never does. Postcode limits could be tested against the person's postcode, but location is not one of the Service Matching Contract's hard gates; adding it would be a contract change under trustee review, for about 15 food and advice services.
- **Searching by council instead of distance.** It would break the decision that the VA reads the platform as the website does, and it would hide services just over a border that a person can use, while still showing restricted services within the council.
- **Cross-checking listings against an outside directory** such as Homeless England. It would find unwritten accommodation restrictions, but it is a new external data source under the Data Enrichment Contract, with its own governance. Not for launch; it could be considered alongside measure 2.
- **Asking the person about local connection.** It would add a question whose answer the VA cannot use without judging eligibility, against the rule that there has to be a reason to ask.
- **A standard line on every accommodation result** about local connection or conditions. Considered and dropped (MD, 2 November). The website shows accommodation without one; it would introduce a barrier the organisation has not stated, against the principle of showing what is known; repeated on every card it is noise; and Housing Options, already first, is the route that resolves it.

## Risks and edge cases

| Risk | Safeguard |
| --- | --- |
| A stated restriction is out of date or mis-worded | Shown as the organisation's own words, attributed to it; correction is the organisation's, through the listing |
| An oddly worded restriction is missed | The count is a pattern search; misses stay visible to the person in the listing text, and the field (measure 2) closes this |
| A restriction stated loosely ("for local residents") is shown as if strict | Measure 1 applies only to plainly stated restrictions until the reading rule (I2) is settled |
| Severe weather overrides local connection rules in some areas | No change: the VA shows the severe weather notice from the website's status |

## Authority and review

- **Measure 1: Tier 2.** It applies settled principles: the VA surfaces facts and does not apply them; it excludes only on the hard gates. Showing a restriction excludes no one, so matching logic is unchanged. Reviewed by the technical lead through the card build PR.
- **Measure 2: the Managing Director's decision in principle now; design and build with the technical lead after launch.** It adds a field to the platform and admin form. If the VA later uses the field to leave services out, that is a Service Matching Contract change under trustee review, decided then, not now.
- **Review sought:** whether the two measures are sufficient and proportionate, and whether anything here needs more than Tier 2.

## Sources

- [Homelessness Code of Guidance, chapter 10](https://www.gov.uk/guidance/homelessness-code-of-guidance-for-local-authorities/chapter-10-local-connection-and-referrals-to-another-housing-authority)
- [Oxford City Council: no local connection scoping](https://mycouncil.oxford.gov.uk/documents/s42998/No%20Local%20Connection%20Scoping%20Template%20V2.pdf)
- [Crisis: The reconnection of rough sleepers within the UK (Johnsen and Jones, 2015)](https://www.crisis.org.uk/media/237144/the_reconnection_of_rough_sleepers_within_the_uk_an-_evaluation_2015.pdf)
- [Homeless England: P3 Dickens Lodge](https://homeless.org.uk/homeless-england/service/p3-dickens-lodge)
- [P3: Wolverhampton complex needs accommodation](https://p3charity.org/services/wolverhampton-complex-needs-accommodation)
- Website code: `streetsupport-platform-web` main at `33202ae`, read 2 November 2026
- WMCA baseline, 28 October 2026 (`align/wmca-aftermath-2026-10-28` at `14facaa`), with source packages from `feat/v4-source-evidence`; count run 2 November 2026
- [VA decisions and delivery extract](https://claude.ai/artifact/2WBdV7XmQ9tZg59vDE1HDj), items 2.1, 2.13 and 3.9
