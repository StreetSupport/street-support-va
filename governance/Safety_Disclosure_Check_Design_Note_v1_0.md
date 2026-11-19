# Safety Disclosure Check: Design Note

Status: draft design • 19 November 2026 • Version 1.0

- **Decided:** the design decisions, taken by the Managing Director on 19 November 2026, pending the technical lead's review (section 10).
- **The trigger list (Appendix A):** approved by the Managing Director, 19 November 2026, pending the technical lead's review.
- **Awaiting the technical lead:** confirmation of four contract readings, and the checks listed in section 11.
- **Technical feasibility review may proceed.**

## 1. What it is for

A person can say something about their safety in their own words at any point in a conversation.

**What the Safeguarding Contract requires (v3.3, Free-Text Disclosure Rule).** Such disclosures "must be treated as authoritative". The rule requires:
- "Recognition that disclosure can happen anywhere";
- "Override capability when it does".

**What exists today.** The under-16 age check is the only free-text mechanism. The contract's Safety route trigger also covers a person who "describes being unsafe where they live, including being made to work or controlled". Until now that has only been reachable through the menu.

**What this note adds.** A second mechanism, for safety, built on the age check's pattern but tailored (Managing Director, 19 November 2026). It is intended to implement the Free-Text Disclosure Rule, subject to the Managing Director's decisions in section 10 and the technical lead's review.

## 2. How it differs from the age check

| | Under-16 age check | Safety disclosure check |
|---|---|---|
| What it looks for | An explicit age or school year | An explicit first-person statement of harm or danger |
| What it leads to | The under-16 exit; where the area is not yet known, the area question comes first | One clarifying question; the person decides |
| How narrow | Very narrow, because it ends the conversation | Wider: a false alarm costs one question (Managing Director, 19 November 2026) |
| Who reads the text | Fixed patterns only | Fixed patterns only (section 5) |

## 3. The clarifying question

The wording is fixed in the phrasebank and never written by the AI. Help comes first:

> If you're in immediate danger, call 999. It sounds like you might not be safe at the moment. Would you like to see help with staying safe?
>
> 1. Yes, show me help with staying safe
> 2. No, carry on

**Approved (Managing Director, 19 November 2026):** the quick exit note follows the question, as it does on the Safety route ("Need to leave quickly? Press "Exit this page"…"). That is the existing approved wording.

**Reading the answer.** The answer is read strictly, by code only. It never goes to the AI, the scope check, the advice check or the unclear-answer escalation (section 5).
- **Yes.** "1", the full option text, or a whole message that is one of: yes, y, yeah, yep, yes please, ok, okay, please.
- **An explicit statement.** An answer that matches any line in Appendix A, in any family, counts exactly as Yes. It is itself an explicit first-person statement, so it is the confirmation, not an inference from unclear words (Managing Director, 19 November 2026).
- **No.** "2", the full option text, or a whole message that is one of: no, n, nope, no thanks, no thank you, carry on.
- **Anything else:** unclear.

**What happens next.**
- **Yes:** the Safety from harm route, at its type-of-harm question. The conversation stays on that route and does not return to the original request afterwards. Once a safety issue has been confirmed, the conversation has moved on (Managing Director, 19 November 2026).
- **No:** back to where they were (defined below).
- **Unclear:** also back to where they were. The 999 line has already been shown. Treating an unclear answer as Yes would be silent inference, which the contract's confirmation rule exists to prevent (rationale: "Prevents silent inference") (Managing Director, 19 November 2026).

**"Back to where they were".** The question they were at is shown again, with the answers they had already given kept. The message that triggered the check is not applied as an answer to that question. For example, someone at the age question who types "I'm 30 and my partner hits me", then answers No, is asked the age question again.

**How often.** The question is asked once for each family in Appendix A (Managing Director, 19 November 2026).
- **Approved (Managing Director, 19 November 2026):**
  - A clear No uses up every family the triggering message matched. For example, "my partner hits me and said he'll kill me" matches families B and G.
  - An unclear answer uses up nothing, so a later explicit statement asks again.
- A later statement from a different family asks again, with the same question. A second, different disclosure is expected to be rare.
- Nothing is recorded about the check (section 7), so any revisiting will rest on evidence from testing or from people using the service.

**What entering the Safety route sets.** Yes sets the same state as the route's existing entries:
- `v4Option` is "safety";
- `supportNeed` is "V4:safety";
- the unclear-answer count goes back to 0, so one unclear reply at the type-of-harm question is asked again rather than skipping to the general help screen.

**Supporter sessions (approved, Managing Director, 19 November 2026).** The check also runs when someone came in as a supporter or professional. It fires only on first-person statements, which are then about the person typing. So Yes switches the conversation to the person's own wording ("Which of these is closest to what is happening?"), not "to them".

This follows the UNICEF Safer Chatbots Implementation Guide (2022, p.10): "given that keyword-based detection is an imperfect solution, you should always check with the user whether they were indeed trying to seek help, allowing them to continue their experience if not". In its design, a No returns the person to where they left off, as here.

The contract prohibits the AI from inferring "crisis, abuse, or diagnosis without user confirmation". The question is how that confirmation is obtained: the person's answer decides the route, not the check (Managing Director, 19 November 2026).

## 4. What the fixed patterns look for

**Scope.** First person only: plainly about the person's own safety (Managing Director, 19 November 2026). Street Support connects people to help. It is not a safeguarding body, so the assistant does not take on statements about other people. A supporter is asked about the person they are helping at the crisis gate.

**Past as well as present (approved, Managing Director, 19 November 2026).** Statements about the past trigger as well as statements about now. "I was raped" and "I was cut as a girl" are both covered by the Safety route's own situations, and the person can still say No.

**Word forms and context.**
- Each pattern covers common word forms and misspellings. UNICEF p.05 gives "forsd" for "forced", and p.11 gives "force, forced, forcing, abuse, abusing, abused".
- Words often used in other contexts are left out. UNICEF p.09 asks: "Are any of these words likely to be used in a different context not indicative of harm? If so, remove them".

The families follow the Safety route's own situations. A (feeling unsafe) and G (threats to life) have no option of their own on the route; they lead to its "Something else" option and the general help it gives.

**The full list is in Appendix A, approved by the Managing Director, 19 November 2026, pending the technical lead's review.** The table below summarises it.

| Family | Examples that trigger | Examples that do not |
|---|---|---|
| A. Feeling unsafe or in danger | "I feel unsafe", "I'm not safe", "I'm scared to go home", "I'm in danger" | "is this site safe", "in danger of eviction" |
| B. Someone hurting, threatening or controlling me | "my partner hits me", "he hurts me", "she threatens me", "he won't let me leave", "I'm experiencing coercive control" | "my back hurts me", "my landlord threatened me with eviction" |
| C. Forced marriage and honour | "they're making me marry", "I'm being forced to marry", "honour-based abuse" said of myself | "getting married next year" |
| D. FGM | "they want to cut me", "I had FGM" | "they're going to cut me off", "what is FGM" |
| E. Sexual violence | "I was raped", "he raped me", "I was sexually assaulted", "I was sexually abused" | "Rape Crisis" |
| F. Exploitation and modern slavery | "they took my passport", "made to work for nothing", "they won't let me leave the house", "working to pay off a debt to them" | "I work too much", "the Home Office has my passport" |
| G. Threats to life | "he said he'll kill me", "the people I owe are going to kill me", "my boss will kill me" | |

Not in scope of this check:
- **Suicide and self-harm.** The crisis gate covers them, and they need their own decision.
- **Under-16 age.** The age check runs first.

## 5. No AI

Patterns only (Managing Director, 19 November 2026). The AI does not read messages for this check, and it does not read answers to the clarifying question. That keeps the check predictable and testable. It sends nothing new to the AI provider. And it keeps the assistant from moving towards handling safeguarding itself.

**The clarifying question's own step** is read strictly, as the Safety route's steps already are. It is excluded from:
- `interpretWithClaude`;
- `checkScope`;
- `detectAdviceQuestion`;
- the unclear-answer escalation.

Some wordings will be missed. That is the known limit of keyword checks. UNICEF's Safer Chatbots guide calls them "an imperfect solution" (p.03 and p.10) and recommends the confirming question this note uses.

## 6. Where it runs

- **On every typed message, after the under-16 check.** In `app/api/chat/route.ts`, `interceptUnder16Age` runs on each typed message before any classifier. The code comment reads "Must fire BEFORE any Claude classifier". The safety check sits directly after it, before the scope and advice checks and before any step's own handling, including the noticing step. The technical lead to confirm the order in review.
- **Not at these steps,** where the person is already on a safeguarding route or the conversation has ended:
  - `GATE0_CRISIS_DANGER` (the crisis gate);
  - `CRISIS_UNDER16_LOCATION` and `CRISIS_FIRE_FLOOD_LOCATION`;
  - `SAFETY_TYPE_OF_HARM` and `SAFETY_OK_TO_CONTINUE`;
  - `DV_GENDER_ASK`, `DV_CHILDREN_ASK` and `SA_GENDER_ASK`;
  - `ESCALATION_LEVEL_1` to `ESCALATION_LEVEL_3`;
  - `SESSION_END`;
  - the clarifying question's own step.

  These are named as a list in code, with a test for each.
- **The per-family limit** is held in the conversation's own state (section 3).

## 7. What is recorded

Nothing is recorded for the check itself (Managing Director, 19 November 2026). Street Support takes no identifying information, so a record of the check could not be acted on, and none is kept.

What does exist, stated plainly:
- **The step log.** The hosting logs the name of each step the conversation reaches, never what was typed (Data Minimisation note v2.1, section 9). So the clarifying question's step name appears there when it is asked.
- **The conversation's own state.** The families already declined are held there for that conversation only, to apply the per-family limit. That state travels with the conversation and is not kept by Street Support.
- **On Yes.** The Safety route records what it records today: the safeguarding type in the session-end record. The Analytics Contract lists a "Safeguarding pathway triggered" event, but no code emits it today.

There is no event for the check, no copy of what was typed, and no field for it in the session record.

## 8. Failure modes

- **Missed phrasing.** The patterns will miss some wordings. Because nothing is logged, the list is reviewed and extended from research and testing.
- **False alarms.** Each costs one question, which interrupts the person's task. Wording that puts help first and asks, rather than tells, keeps it from feeling like an accusation.
- **Statements about someone else** ("he hits her"). The patterns are first person only, so these do not trigger.
- **A person typing in another language.** The patterns are English only. The traditional FGM terms are the exception (Appendix A, D).
- **Repeated words in one message.** The check fires once.
- **The question on screen when someone walks in.** The quick exit is always there, and the note after the question says how to use it (section 3).
- **Two 999 lines in a row.** A Yes shows the type-of-harm question, which also starts with 999. Accepted: it is help repeated, not a contradiction.

## 9. Tests (user scenarios)

**Journeys, end to end.**
- Someone who types "my partner hits me" at any step is asked the question, with 999 first.
- "Yes", "yes please" or "1" reaches the type-of-harm question, with the unclear-answer count back at 0. "No", "no thanks" or "2" returns to the same question with the earlier answers kept, and the triggering message is not applied.
- An unclear answer returns to the previous step. An answer that is itself an explicit statement goes to the Safety route.
- The answer to the clarifying question never reaches the AI.
- After a No, the families that message matched do not ask again. A different family does.
- The under-16 check still runs first: "I'm 14 and my dad hits me" goes to the under-16 exit, by way of the area question where the area is not yet known.
- The check does not run at any step listed in section 6.
- No event or field records the check, and nothing typed is kept.

**Every line in Appendix A becomes a test in both directions.** Each "triggers" example must trigger, and each "does not trigger" example must stay silent. A release does not go ahead unless all of them pass. This is the release gate used by the Muslim Council of Britain's helper, where "If even one fails to show the crisis help card, the new version does not go live". The UNICEF guide (p.11) asks teams to "thoroughly test the new mechanism using as many of the trigger words as you can, in as many different flows" and to try to "'break' the system".

## 10. Decisions

Taken by the Managing Director, 19 November 2026:
- an unclear answer goes back to where they were (section 3);
- an answer that is itself an explicit statement counts as Yes (section 3);
- asked once for each family (section 3);
- first person only (section 4);
- wider than the age check, because a false alarm costs one question (section 2);
- patterns only, no AI (section 5);
- nothing recorded for the check itself (section 7);
- no supporter wording for the question (section 3);
- no return to the original request after the Safety route (section 3);
- idioms such as "my boss will kill me" trigger (Appendix A, G);
- traditional FGM terms trigger within a first-person statement (Appendix A, D);
- no safety word, because it adds another mechanism to explain, maintain and test;
- no external review by default: the list is drawn from research and tested internally.

Approved by the Managing Director, 19 November 2026, pending the technical lead's review:
- **The per-family limit.** A clear No uses up every family the message matched; an unclear answer uses up nothing (section 3).
- **Supporter sessions.** Yes switches to the person's own wording on the Safety route (section 3).
- **Past statements.** These trigger as well as present ones (section 4).
- **The quick exit note** goes after the clarifying question (section 3).

**The trigger list (Appendix A)** is approved by the Managing Director, 19 November 2026, pending the technical lead's review. The technical lead checks feasibility, the processing order and the tests in the pull request.

## 11. Contract consistency, for the technical lead

The decisions above are recorded. These points check that the note's reading of the Safeguarding Contract v3.3 holds. They are not proposals to change the design.

1. **Unclear answers and "fallback to normal flow".** Among the things the AI is not permitted to do, the contract lists "Add 'fallback to normal flow' logic", with the rationale "Safeguarding is not recoverable to normal flow".
   - The note reads this as applying once someone is on a safeguarding route.
   - At the clarifying question, no safeguarding signal has been confirmed: the person is being asked whether there is one. Returning them on an unclear answer is the person's flow, not the AI's.
   - To confirm that reading.
2. **First person only and the Free-Text Disclosure Rule.** The rule says disclosures "may occur via free text at any point" and requires "Recognition that disclosure can happen anywhere". It does not say whose disclosure.
   - The note reads it as covering the person using the assistant. Supporters are asked about the person they help at the crisis gate.
   - Street Support's role explains the decision, but it is not itself a contractual exception.
   - To confirm that reading, or to record that the rule needs a sentence saying so.
3. **"Must be treated as authoritative".** The note treats a matched statement as authoritative by acting on it at once. It stops whatever was happening and offers the Safety route, rather than routing without asking.
   - The confirming question exists because keyword matching is imperfect (UNICEF p.10).
   - To confirm that asking first is consistent with "authoritative".
4. **Invariant 1: "A disclosure at any point resets the flow".** A Yes resets the flow to the Safety route. A No keeps earlier answers, because the person has said there is nothing to act on.
   - The contract continues: "Previously collected data does not influence safeguarding exits". The Safety route already reads only the person's area and who they are. The note adds nothing to that.
   - To confirm that reading.

**Also for the technical lead to verify in the pull request:**
- that the sentence boundaries and the four-word spacing rule match every "triggers" example in Appendix A and none of the "does not trigger" examples;
- that the clarifying question's answer is read strictly, including an explicit statement counting as Yes, without passing through `interpretWithClaude`, the scope or advice checks, or the unclear-answer escalation;
- that the negation exception (Appendix A, rule 6) keeps lines such as "he won't let me leave" triggering.

## 12. Sources

**UNICEF, Safer Chatbots Implementation Guide (2022).** UNICEF East Asia Pacific; piloted in Tanzania, Uganda and Bulgaria. Page numbers are the guide's printed ones. Used for:
- the confirming question, and returning on No (p.10);
- removing words used in other contexts (p.09);
- misspellings and local vocabulary (p.05: "forsd" for "forced"; "defiled");
- word forms (p.11: "force, forced, forcing, abuse, abusing, abused");
- testing (p.11);
- preferring a few national, well-established referral services that can be kept checked (p.08).

This note departs from it deliberately in five places, each a Managing Director decision of 19 November 2026:
1. **Third-person statements.** Its example fires on "My neighbour is experiencing gender based violence" (p.09). This check is first person only.
2. **The global safety word** (p.04, p.07, p.11). Not adopted.
3. **Monitoring.** It tracks "What they typed to trigger it" and suggests browsing users' conversation histories (p.12). Nothing is kept here.
4. **Co-creation with external specialists and user advisors** (p.06, p.07). Not by default.
5. **Returning after the safeguarding flow.** It returns the person "to the point they left off in the original flow" (p.10, p.11). Here, a Yes stays on the Safety route.

Its generic trigger list and response template are in a "Useful Resources folder which accompanies this guidelines document" (p.13). Neither is in the guide itself, so Appendix A is drawn from the sources below.

**Other sources:**
- **Muslim Council of Britain, "How this helper keeps you safe".** The release gate: each version must pass a fixed set of crisis messages.
- **Unseen, "Spot the signs of modern slavery".** Used for family F:
  - documents confiscated;
  - unable to leave alone;
  - living in accommodation provided by the employer;
  - restricted access to earnings;
  - phone taken.
- **Karma Nirvana, "How do I know".** Used for family C: forced marriage, being threatened with being taken abroad to marry, and honour-based abuse.
- **DomesticShelters.org, "Am I experiencing abuse?"** Used for family B: isolation, monitoring, threats to hurt me, my children or pets, and not respecting no.
- **Refuge, jargon buster.** Used for families B and C: the UK terms coercive control, economic abuse, tech abuse, stalking and honour-based abuse.
- **Scottish Government, "Responding to Female Genital Mutilation (FGM) in Scotland: multi-agency guidance".** Used for family D: traditional terms for FGM.
- **Franklin et al., RANLP 2023, safeguarding concerns in schoolchildren's messages.** Used for the matching rules: the kinds of false positive in keyword libraries, namely words inside other words ("gunna"), polysemy, positive sentiment and other languages.

## Appendix A. Trigger list (approved by the Managing Director, 19 November 2026, pending the technical lead's review)

### How a line matches (all families)

1. **Whole words only, ignoring case.** "Raped" matches; "grapes" does not.
2. **Common text forms count the same.** "I'm", "Im" and "I am" alike; "don't" and "dont" alike; apostrophes optional. Known misspellings are added to each line.
3. **Sentence.** A sentence ends at a full stop, question mark, exclamation mark or line break. With none, the whole message is one sentence.
4. **The order that counts.** Where a line has a doer, an act and "me", they appear in that order in one sentence, with at most four other words between each. "My partner hits me" matches. "I hit my partner" does not.
5. **Doers.**
   - **[someone close]:** he, she, they, my partner, husband, wife, boyfriend, girlfriend, ex, dad, father, mum, mother, stepdad, stepmum, brother, sister, son, daughter, cousin, uncle, aunt, in-laws, mother-in-law, father-in-law, family, carer, landlord, boss, employer.
   - **[anyone]:** [someone close], plus someone, somebody, a man, a woman, a stranger, a group, people, the people I owe.
6. **Negation.** A line does not match when "not", "never", "doesn't", "don't", "didn't", "hasn't" or "no longer" comes directly before its act. Examples: "he doesn't hit me", "they never took my passport".
   - **The exception.** Where a negation is part of the line's own wording, it is part of the match, not a reason to stop it. These are:
     - "I don't feel safe" and "I'm not safe" (A);
     - "won't let me", "doesn't let me", "don't let me" and "won't allow me" (B and F);
     - "without my consent" (E).
   - **In the code,** each line carries its own wording, and the negation check looks only at words outside it. Each of these lines has a test showing it still triggers, alongside one showing a plain negation ("he doesn't hit me") does not.
7. **Questions about words or services** do not match. These are messages that begin "what is", "what does", "what's", "where is", "where can I", "how do I find" or "is there a", for example "what does coercive control mean" or "where is Rape Crisis". There is no rule about question marks: "is it normal that my partner hits me?" matches.
8. **Hypotheticals** do not match when the sentence begins "what if" or "if someone". Everything else is matched as written, and the person can say No.

The table gives the intended meaning. The code expresses rules 1 to 8 exactly, and the pull request shows each line with its tests.

### A. Feeling unsafe or in danger
| Triggers | Does not trigger |
|---|---|
| I don't feel safe; I feel unsafe; I'm not safe; I'm unsafe | is it safe; safe to eat; I feel safe now |
| I'm scared / afraid / frightened to go home | I'm scared of the interview; scared of spiders |
| I'm scared / afraid / frightened of [someone close] | |
| I'm in danger; my life is in danger; I fear for my life | in danger of (anything): in danger of eviction; in danger of losing my job |

### B. Someone hurting, threatening or controlling me
| Triggers | Does not trigger |
|---|---|
| [someone close] hits / hit / beats / beat / punches / kicks / slaps / hurts / hurt / strangled / choked me | my back hurts me; my feet hurt; [anyone] hit me with (a sanction, a bill, bills, arrears, a fine, a charge) |
| [someone close] pushed me (a single act, past tense) | [someone close] keeps pushing me to (anything): pushing me to move out |
| [someone close] threatens / threatened me; threatens / threatened to hurt me / my kids / my children / my pet / my dog | [anyone] threatened me with (eviction, court, bailiffs, a section 21, a sanction) |
| [someone close] won't let me leave / go out / see my friends / see my family / have money / have my phone | won't let me (anything else): won't let me pay later |
| [someone close] controls my money / checks my phone / tracks my phone / reads my messages | [anyone] takes money out of my benefits (deductions) |
| I'm being abused / hit / beaten / controlled / stalked; I'm in an abusive relationship; I'm experiencing domestic abuse / domestic violence / coercive control / economic abuse | domestic abuse services near me; abuse of power |

### C. Forced marriage and honour
| Triggers | Does not trigger |
|---|---|
| [anyone] making / forcing / forced / forsd me to marry; I'm being forced to marry; forced into marriage (of me); they want me to marry someone I don't want | I'm getting married; marriage advice |
| [anyone] threatening / threatened / going to take me abroad to marry / to get married | going abroad on holiday |
| I'm experiencing honour-based abuse / honour-based violence | what is honour-based abuse |
| [anyone] will kill me if I don't marry | |

Shame or dishonour on its own is not a trigger: it is not a statement of harm. Threats that go with it are covered by families B and G.

### D. FGM
| Triggers | Does not trigger |
|---|---|
| [anyone] want / wants / going / plan / planning to cut me; taking me abroad to be cut | cut my hair; cut my benefits; [anyone] going to cut me off |
| I was cut as a girl / child; I've had FGM; I have had FGM; I had FGM | FGM services; what is FGM |
| I had [traditional term]; [anyone] want / wants / going / plan / planning to do [traditional term] to me; taking me abroad for [traditional term] | a traditional term on its own |

**The traditional terms** come from the Scottish Government guidance: thara, khitan, khifad, megrez, absum, mekhnishab, kutairi, ibi, ugwu, sunna, bondo, sonde, gudiniin, halalays, qodiin, tahoor, bagne, gadja, fanadu di mindjer, niaka, kuyango and musolula karoola.
- **How they match.** They trigger only within a first-person statement, the same way "cut" does, never on their own (Managing Director, 19 November 2026).
- **Why include them.** Someone with limited English is more likely to use their community's word than "FGM".
- **Known false alarms.** Some terms are also used for male circumcision, and some are ordinary words or names (for example "Ugwu"). Within "I had [term]", either may occasionally ask a question that was not needed. That costs one question.

### E. Sexual violence
| Triggers | Does not trigger |
|---|---|
| I was raped; I've been raped; [anyone] raped me | Rape Crisis (a service name); rape on its own |
| I was / I've been sexually assaulted / sexually abused; [anyone] sexually assaulted / sexually abused me | sexual health clinic |
| I was violated; [anyone] forced / made me have sex; [anyone] touched me when I said no / without my consent | |

### F. Exploitation and modern slavery
| Triggers | Does not trigger |
|---|---|
| [someone close] took / has / have / keeps / kept my passport / documents / ID / papers / phone | I lost my passport; my passport expired; the Home Office / council / jobcentre has / kept my passport / ID / papers |
| [anyone] forced / made me work for nothing / for no money / for free / for them; I'm made to work for nothing / for no money / for free | I'm forced to work two jobs; the jobcentre made me do a placement; I work too much |
| [anyone] takes / take / keeps / keep my wages / my pay | [anyone] takes money out of my benefits |
| [someone close] won't let me leave the house / where I work / where I live; I'm locked in; they keep me in the house | I can't leave the house (no one is stopping them: anxiety, health); I'm not allowed to leave after (a time): hostel curfew |
| I have to work to pay off a debt to them; [anyone] make / makes me work to pay what I owe | I owe money; I'm in debt (Finance, not safety) |

### G. Threats to life
| Triggers | Does not trigger |
|---|---|
| [anyone] said / says / threatened [he'll / she'll / they'll / he will / she will / they will / to] kill me | |
| [anyone] is / are going to kill me; [anyone] will kill me | |

**Idioms.** Phrases that read as idioms elsewhere, such as "my boss will kill me", trigger. Someone using a homelessness assistant is there to find help, so the literal reading is the safer one in this setting (Managing Director, 19 November 2026). Threats from people the person owes, such as drug-debt threats, are covered by [anyone].

**Out of scope of this check:**
- **Suicide and self-harm.** The crisis gate covers them, and they need their own decision.
- **Under-16 age.** The age check runs first.
