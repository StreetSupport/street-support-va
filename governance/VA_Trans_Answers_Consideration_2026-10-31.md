# How the VA handles trans answers when filtering services

*Working draft, revision 4, 31 October 2026. Prepared by Claude for the Managing Director, to check the decision has been properly considered. Revision 2 follows the Managing Director's review: a population tag is not an access restriction, Option D goes into the question review, the authority question is set against the Governance Decision Framework rather than answered here, and the legal account is labelled as such. Revision 3 added section 4A: what SSN's governance documents already say and how the question links to neutrality. Revision 4 follows the Managing Director's review of 4A: the contract's wording supports non-exclusion, the alternative reading is an extension needing governance, and the VA's narrow, agreed authority to withhold is distinguished from extending it. It reads the VA code at `dd10813` and the VA governance documents at `4ec0de2`. It sets out the law, the positions people hold, the options and their failure modes. The recommendation rests on SSN's existing principles. It does not take a position on the wider public debate.*

---

## 1. The decision

The gender filter fix (preview, 31 October) has to treat two answers some way: "Trans Female" and "Trans Male". The full route offers them at C3Q4. The question is whether either answer should hide any service from the person.

**In the fix as drafted,** neither answer hides anything, the same as "Non-binary or other" and "Prefer not to say". Only an exact "Male" or "Female" answer filters.

**Two things to keep apart.**
- **The immediate fix.** Correcting the substring fault, so "male" inside "female" no longer hides services, is the technical priority. It stands on its own.
- **The trans question.** How the filter treats trans answers is a separate question. The interim handling in the fix (exclude nothing) is the least exclusionary placeholder. It is not a policy decision, and it is not approved because this paper recommends it.

---

## 2. What the VA does today

**Where gender is asked.**

| Where | Options | Stored as |
|---|---|---|
| Health, Activities, Drop In (B5) | Male, Female, Non-binary or other, Prefer not to say | `gender` |
| Full route, housing, Section C (C3Q4) | Male, Female, Trans Female (male to female), Trans Male (female to male) | `detailedGender` |
| Domestic abuse and sexual violence exits | Female, Male, Non-binary or other, Prefer not to say | `dvGender` |

**What the answers change.**
- **The full-route answer** replaces `gender` in the profile when it is given (`toUserProfile`, `lib/types.ts`). So it feeds the service gender filter in any later non-housing need.
- **The housing results** do not read gender at all.
- **The pregnancy question** is asked after "Female" or "Trans Female", and not after "Trans Male".
- **The domestic abuse and sexual violence answers** pick which national helpline is shown. They do not filter local services.

**How the old filter treated trans answers.** It matched substrings, and both "trans female" and "trans male" contain "male". So both were treated as men:
- A trans woman was hidden from every women-only service.
- A trans man was hidden from every women-only service as well.
- Neither outcome came from a decision. Both were side effects of the same fault that hid women from women's services.

**The wording of C3Q4.** It says some services are "based on biological factors", and that "we ask about your current biological gender". It then offers gender identity options. That mixes sex and gender in one question, and the pregnancy branch follows neither consistently. This was written before the 2025 judgment, and nothing in the record says why it is worded this way.

**What the governance documents say.**
- **Service Matching Contract, hard gate on gender.** A restriction must be explicit, not implied. "Prefer not to say" and "non-binary or inclusive phrasing" must never exclude. Gendered focus does not equal gendered restriction.
- **Nothing else.** No VA governance document mentions trans users.

---

## 3. The law as it stands: this paper's account

*This section is this paper's account of the position, drawn from the judgment's summaries and from solicitors' published commentary listed in the sources. It is not independently verified legal advice, and should not be relied on as such.*

**The Supreme Court judgment.** *For Women Scotland v The Scottish Ministers* [2025] UKSC 16, 16 April 2025, held that "sex" in the Equality Act 2010 means biological sex. A gender recognition certificate does not change it for Equality Act purposes.

**The EHRC services code.** The updated code of practice came into force on 5 August 2026. Its relevant points, as summarised by solicitors:
- Single-sex services under the Act's exceptions are provided on the basis of biological sex.
- If a provider admits people of the other biological sex, the service is no longer single-sex. That can expose the provider to sex discrimination claims from people it excludes.
- It gives the example that a trans woman would be excluded from a women-only service. It also says a trans man may be lawfully excluded from a women-only service if he presents as male.
- Whether single-sex provision is proportionate is the **provider's** assessment, made case by case. It weighs safety, privacy and dignity against the impact on those excluded, including trans people.
- Trans people remain protected from gender reassignment discrimination. Providers should consider less intrusive alternatives where they can.
- Asking someone about their sex must be justified and handled sensitively. Asking about a gender recognition certificate is irrelevant, and onward disclosure of certificate information acquired in an official capacity can be an offence.

**Still uncertain.** The code is statutory guidance, not legislation, and courts interpret the Act. *Good Law Project v EHRC* [2026] EWHC 279 (Admin) commented on trans-inclusive facilities; that comment was not binding and permission to appeal is being sought. Solicitors note that parts of the code's application remain uncertain.

**What this means for SSN.** SSN does not run single-sex services; it lists them. The access decision, and the proportionality assessment behind it, belong to each provider. Nothing in the sources read places a duty on a directory or signposting service to filter people by sex.

**Data protection.**
- Gender identity is not automatically special category data under UK GDPR. The ICO's position, as reported, is that it depends on context. It becomes special category where it reveals health, medical care, sexual orientation or sex life.
- A trans answer can reveal gender history, so it carries the same care.
- The Data Minimisation Note and the Appropriate Policy Document do not cover gender identity. That is a gap whichever option is chosen.

---

## 4. The positions people hold

These are set out as their holders would put them, without a verdict.

**Women's sector and sex-based rights view.**
- Women-only services, refuges in particular, exist because of women's needs for safety, privacy and trauma recovery. The law now says they are based on biological sex.
- Showing a women-only service to someone the service will not admit gives a false impression of availability. It may also put the provider in a difficult position.
- A signposting tool should respect the service's stated boundaries.

**Trans organisations' view.**
- The code leaves trans people with less access and risks pushing them into separate "third spaces" or leaving gaps.
- Scottish Trans notes that being left with no suitable provision is very unlikely to be proportionate.
- A trans person in housing crisis is already at higher risk. A tool that hides services, or misreports them, adds to exclusion at the worst moment.

**What both views share.** Both are better served when the VA reports what each service says about who it is for. Neither is served when the VA guesses on the provider's behalf.

---

## 4A. What SSN's governance already says

*Added in revision 3. Read from the project copies of each document, converted 31 October 2026.*

### The Service Matching Contract (v2.0, March 2026)

**Hard gate B, explicit gender restriction.** A service may be withheld only if:
- the service is explicitly "women only" and the user has explicitly stated male; or
- the service is explicitly "men only" and the user has explicitly stated female.

Its conditions: the user must have chosen to answer the gender question; the service restriction must be explicit, not implied; and confidence must be HIGH.

Its governance boundaries:
- "Prefer not to say" never excludes.
- "Non-binary or inclusive phrasing" never excludes.
- "Gendered focus does not equal gendered restriction."

**A closed list.** Hard gate rules are "the only matcher behaviours permitted to withhold services from view". A service must not be excluded solely because of unclear eligibility fields, lack of information on either side, or perceived relevance or fit.

**Its own review triggers.** The contract must be reviewed if exclusion rules are proposed to change or expand. "Any proposal to add a new exclusion rule (expanding system authority)" is a named trigger. "Material changes to service matching logic require explicit trustee review."

### How We Work: Our Governing Principles, principle 13

Our role is to surface what exists and connect people to it, not to evaluate, rank or judge the organisations that provide it. People using our systems get a fair view of what is available to them. We do not hide services because they are inconvenient to surface. The system exists to serve the person in front of it.

### The Neutrality Principle Note (June 2026)

SSN helps people find support and connects them to it. We do not judge, rank or favour the organisations we list. The rules are clear, and we apply them the same way to every service. We organise the structure of the platform; we do not pass judgement on the organisations within it.

### What follows for the options

**On the contract as written, a trans answer does not meet hard gate B.**
- The person has answered "Trans Female" or "Trans Male", not "Male" or "Female".
- The list of reasons to withhold a service is closed.
- So nothing is withheld on a trans answer.

**Consequences.**
- **Option A is the contract's own outcome, not a new choice.** The old behaviour, which treated both trans answers as male, fell outside the contract. It was a fault, not a policy.
- **Options B and C would each add a way of withholding services that the contract does not contain.** That is the contract's own review trigger, and its trustee review requirement for material changes to matching logic.
- **The A+ notice withholds nothing, so the exclusion rules do not reach it.** It is new user-facing content, so it still needs agreeing.

### Does a trans answer meet hard gate B?

**The contract's wording supports non-exclusion.**
- Hard gate B requires the person to have *explicitly stated* male (or female) before a women-only (or men-only) service is withheld.
- A person choosing "Trans Female (male to female)" has selected an answer labelled Trans Female. They have not been asked, separately, to state their sex, and have not done so.
- Treating the parenthetical as a separate declaration for exclusion purposes would mean the matcher deriving something the person was not asked to confirm.
- The contract also requires HIGH confidence and forbids exclusion on unclear information.

**An alternative reading has been raised.** It holds that "(male to female)" states sex at birth, and that since *For Women Scotland* (2025) that counts as having stated male for a women-only service. The mirror applies to "Trans Male (female to male)". Adopting that reading would not be applying the existing rule. It would extend it, by deriving an exclusion from part of an answer's wording. That needs confirmation through the contract's review and governance process. It is not to be assumed from the question's wording.

**What the record shows.**
- The contract was written in March 2026, before the updated EHRC code (in force 5 August 2026).
- The option wording was written before the judgment, and the record does not explain it.

Option D would remove the point on the housing route, because the option would no longer be offered there.

### How this links to neutrality

**What neutrality does not decide.** As SSN defines it, neutrality is about not judging organisations and applying rules evenly. On its own it does not choose between filtering rules: filtering by birth sex could also be applied evenly.

**SSN already has a narrow, agreed authority to withhold.** The Service Matching Contract lets the VA withhold a service in defined cases: an explicit restriction meeting an explicit answer, at high confidence. Applying that rule is not making the provider's access decision for it. It reflects a restriction the provider has stated, against an answer the person has given.

**The distinction that matters** is between:
- **applying the established, explicit exclusion rule**, which sits within existing authority; and
- **extending it**, by interpreting an answer or a service description beyond what has been agreed. That is what needs further authority.

**Principle 13 points the same way from the person's side:** a fair view of what is available, with nothing hidden for convenience.

So the contract's narrow authority, read with neutrality and principle 13, supports showing services wherever the explicit conditions are not met. That is a position on SSN's role, not on the wider debate.

## 5. Options

| | Option | What a trans woman sees | What a trans man sees |
|---|---|---|---|
| **A** | Filter nothing for trans answers. *(The fix as drafted)* | Everything, including women-only and men-only services | Everything |
| **A+** | As A, and show each service's stated restriction as a fact, such as "This service says it is for women only" | Everything, with restrictions visible | Everything, with restrictions visible |
| **B** | Filter by birth sex (Trans Female filtered as male, Trans Male as female) | Not women-only services | Not men-only services |
| **C** | Filter by stated identity (Trans Female filtered as female, Trans Male as male) | Not men-only services; women-only shown | Not women-only services; men-only shown |
| **D** | Stop asking gender identity on the housing route; ask only "could pregnancy apply" | Not asked. Non-housing needs ask Male, Female, Non-binary or Prefer not to say, and the person chooses | As for a trans woman |

**A: filter nothing.**
- **For:** the VA makes no eligibility judgement. It follows the Service Matching Contract ("never exclude" for inclusive answers) and the principle that the VA surfaces facts and does not apply them. Nobody is wrongly hidden from help.
- **Against:** a trans woman may be shown a women-only service that, under the code, will very likely turn her away. That costs a contact, and possibly a distressing refusal at a vulnerable moment. It may also mean an unexpected enquiry for the provider.

**A+: filter nothing, and state restrictions.**
- **For:** everything in A. Each person can also see the service's own stated boundary before contacting it. This serves both positions in section 4.
- **Against:** it is a little more work, because results need a short line where a service has a restriction label. It depends on providers stating restrictions explicitly; some women-only services carry no label today.
- **A population tag is not an access restriction.** The V4 population tags (Women, Men) say who a service is designed for. A service designed for women does not, by that alone, have a women-only access rule. The notice must use only a restriction the provider has explicitly stated, never one inferred from a population tag.

**B: filter by birth sex.**
- **For:** it mirrors the code's default for single-sex services and shows fewer services a person cannot use.
- **Against:** the VA would make the provider's proportionality decision for it. The code says that decision is the provider's, case by case, and some flexibility can be lawful. It would also treat a trans man as automatically able to use a women-only service, which the code says he may not be. It requires the person to disclose birth sex to a machine, which sits uneasily with the code's caution about asking at all. This is a policy position on a contested issue, not an application of a settled principle.

**C: filter by stated identity.**
- **For:** it reflects how the person describes themselves.
- **Against:** it shows women-only services to trans women as available, contrary to the code's stated position, and hides men-only services from them. Like B, it applies an eligibility view on the provider's behalf.

**D: stop asking gender identity on the housing route.**
- **For:** the housing results never use gender. Today it only opens the pregnancy question and carries over to later non-housing needs. Asking "could pregnancy apply to you or someone you live with?" serves the routing purpose directly, without asking about sex or identity. It removes the mixed sex and gender wording, and the inconsistent pregnancy branch. It also fits the routing principle agreed on 31 October.
- **Against:** a person who later picks Health, Activities or Drop In is asked gender there instead, so the filter question does not go away; it moves. The full route loses gender data for analysis, if that was an intended use. The question purpose register lists it as routing and population.

**A+ and D can be combined.** They answer different questions: A+ is how the filter treats answers, and D is whether housing asks at all.

---

## 6. Recommendation

**Proposed working option: A+, with D taken into the question review.** Neither is approved policy because this paper recommends it. Both go into the service matching review, where the technical lead considers implementation and the appropriate authority confirms any open rule or governance question.

**Why A+ is the strongest working option.**
1. **It fits the principle that the VA surfaces facts and does not apply them** (decided 31 October). Who may use a single-sex service is the provider's decision under the code. A+ leaves it with them and tells the person what the service says.
2. **It is consistent with the Service Matching Contract as written:** restrictions must be explicit, and inclusive answers never exclude.
3. **It holds whichever way the law develops.** If the code is upheld, providers apply it. If case law moves, nothing in the VA needs to change.
4. **It is the least harmful way to be wrong.** Being shown a service you cannot use costs a contact. Being hidden from one you could use can cost you help.

**Why D deserves serious consideration.** C3Q4 asks about biological gender while offering gender identity answers, and the housing results do not use the answer. Asking directly for the routing information actually needed avoids collecting gender information unnecessarily. The exact question, and its effect on later non-housing needs and on analysis, still need review.

**What authority is needed: to be checked, not assumed.** The Governance Decision Framework (v1.0, March 2026) turns on what kind of change is made:
- **Tier 2, technical lead:** an improvement in how an existing principle is implemented, which cannot reduce protection. The principle being implemented must be nameable. Where a Tier 2 change touches a Tier 3 area, trustees are notified at the next meeting.
- **Tier 3, board:** a change to a governing principle. Service matching rules are named as governing principles. A change goes to Tier 3 if it cannot be shown not to reduce protection or alter a principle, or if the principle it implements cannot be named.

Applied to each part, as questions for the review rather than answers:

| Part | Principle it would implement | Open question |
|---|---|---|
| Substring fix | Service Matching Contract, hard gate on gender: restriction explicit, not implied; gendered focus is not restriction; prefer not to say never excludes | Likely Tier 2: it restores what the contract already says and increases protection |
| Trans answers exclude nothing | Hard gate B: exclusion only where the user has explicitly stated male or female; the hard gates are a closed list (section 4A) | The contract's wording supports non-exclusion (section 4A). Adopting the alternative reading would extend the rule and go through the contract's review |
| A+ restriction notice | Restrictions must be explicit; the VA surfaces facts | Whether a new user-facing notice is implementation of that rule, or a new commitment |
| D, replacing C3Q4 | Data minimisation constraints | Whether removing a profiling question and adding another changes a data protection principle or implements one |
| B or C | None identified | Each adds a way of withholding services the contract does not contain. The contract names that as a review trigger and requires explicit trustee review of material changes to matching logic (section 4A) |

**What A+ would need.**
- A one-line restriction notice in results, drawn only from a restriction the provider has explicitly stated: the "Female only" or "Male only" label, or explicit wording. Never a population tag, a name or an inference.
- An agreed wording for that notice. For example: "This service says it is for women only. Contact them to check before you go."
- The Data Minimisation Note and Appropriate Policy Document updated to cover gender identity.
- A test per answer: a trans woman, a trans man, non-binary and prefer not to say each see every service, with the notice where one applies.

**What D would need, if chosen.**
- C3Q4 replaced by a question asking directly for what routing needs, likely whether pregnancy applies, with "prefer not to say". The wording is for the review.
- A decision on whether gender is still wanted on the full route for analysis. If it is, it moves to an optional end section, with its purpose recorded.

---

## 7. Failure modes and edge cases

- **A trans woman is refused at a women-only service the VA showed her.** Mitigation: the A+ notice tells her before she contacts them. The refusal is the provider's lawful decision, not the VA's.
- **A survivor of domestic abuse is concerned about who else may use a women-only refuge.** The VA's choice does not change who the refuge admits; the refuge decides. A+ shows the refuge's own stated restriction.
- **Restriction labels are missing or wrong.** Unlabelled services show no notice; some women-only services have no label today. The fix is providers stating restrictions explicitly, for example through the listing review at rollout. It is not the V4 population tags: a population tag says who a service is designed for, not who it admits. Five services currently carry both "Female only" and "Male only"; those need correcting at source.
- **The notice reads as a judgement on the person.** The wording must state what the service says, never "you may not be eligible". It should be reviewed alongside the supporter and professional language.
- **Domestic abuse helplines.** The national lines are chosen by the gender the person gives (Female, Male, Non-binary or other). Each helpline sets its own policy, and the VA shows all three when gender is declined (proposed, D6 in the pathway review). No change is needed here.
- **Data held in the session.** A trans answer reveals gender history. It is held in session state only and is not logged today. That should stay true, and be recorded in the Data Minimisation Note.
- **The law changes again.** A+ is the option least exposed to that, because it encodes no reading of who may use what.

---

## 8. Next steps

1. **Now:** the substring fix goes to James as its own pull request. It is the immediate technical priority. Its interim handling of trans answers (exclude nothing) is flagged in the description as a placeholder pending the review, not a decision.
2. **Into the service matching review:** A+ as the working option, and D as part of the question review. The technical lead considers implementation. The applicable authority under the Governance Decision Framework is confirmed there, using the table in section 6.
3. **For you, when the review reaches it:**
   - whether to confirm non-exclusion as the reading of hard gate B for the trans options, or send the alternative reading through the contract's review (section 4A);
   - which option, A, A+, B or C;
   - whether to take D forward, and its exact question;
   - the wording of the restriction notice, if A+;
   - any authority question the review cannot settle at Tier 2.

---

## Sources

- *For Women Scotland Ltd v The Scottish Ministers* [2025] UKSC 16. Summaries: [Bates Wells, what charities need to know](https://bateswells.co.uk/updates/the-for-women-scotland-judgment-what-do-charities-need-to-know/); [Trowers, what it means for service providers](https://www.trowers.com/insights/what-does-the-for-women-scotland-case-mean-for-service-providers)
- EHRC updated services code: [Lewis Silkin, August 2026](https://www.lewissilkin.com/insights/2026/08/05/the-new-ehrc-code-of-practice-for-service-providers-what-does-it-mean-for-single-sex-services); [Capsticks, now in force](https://www.capsticks.com/insights/the-ehrcs-updated-services-code-is-now-in-force-what-should-employers-know); [Bevan Brittan, key changes](https://www.bevanbrittan.com/insights/articles/2026/ehrc-updated-code-of-practice-for-services-key-changes-single-sex-services-and-separate-sex-services/)
- [Good Law Project v EHRC [2026] EWHC 279 (Admin)](https://caselaw.nationalarchives.gov.uk/ewhc/admin/2026/279)
- [Scottish Trans, thoughts on the updated code, May 2026](https://www.scottishtrans.org/supreme-court-ruling-on-sex-in-the-equality-act/our-thoughts-on-the-ehrcs-updated-code-of-practice-may-2026/)
- [Lewis Silkin, gender identity data](https://www.lewissilkin.com/insights/2024/02/08/gender-identity-data-in-the-workplace)
- VA code at `dd10813`: `lib/phrasebank.ts` (C3Q4_GENDER), `lib/handlers/sectionC.ts` (`handleC3Q4Gender`), `lib/types.ts` (`toUserProfile`), `lib/serviceMatcher.ts` (`matchesGender`)
- `governance/Service_Matching_Contract_v2.md`: hard gate B, the closed list of exclusions, and the governance review triggers
- How We Work: Our Governing Principles, principle 13; Neutrality Principle Note (June 2026); Governance Decision Framework v1.0 (project copies converted 31 October 2026)
