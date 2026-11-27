# Safety disclosure check: a bounded list and a visible route

Proposal for review. Managing Director, 26 November 2026. Draft, revised after three independent reviews on the same day. Nothing here is built.

## The point in brief

The safety disclosure check (#72) looks for statements of harm in what people type. A list of phrases can never be complete, because people describe harm in endless ways. Each addition also brings new false alarms, which then need exclusions of their own. Left open, the list grows without end and gets harder to test.

So the list should be a safety net, not the main way in. A visible route lets anyone choose safety wherever the Safety route is available in the conversation, so no one depends on the list to catch their words.

## The ways in today

- **The crisis question,** asked once, at the start of every conversation.
- **The first question's option** "Staying safe from abuse, exploitation or harm". It is hidden while the Safety route is switched off.
- **"Feeling unsafe" at the noticing question.** This is asked only after the money, health and everyday things needs, not after housing, and not of supporters. It moves to the top of that list in a change that is committed but not yet pushed. While the Safety route is switched off, it goes to the crisis question (the technical lead's review of #73).
- **The safety disclosure check,** on typed text at any step. It is built but not yet pushed or reviewed. While the Safety route is switched off, Yes goes to the crisis question, as "Feeling unsafe" does.

Only the crisis question reaches everyone, and only once, at the start.

## Proposal

1. **A visible route wherever the Safety route is available.** A small link reading "Help with staying safe", using wording already in the current phrasebank.
   - It opens a confirming question. Yes goes on to the Safety route. No returns the person to where they were, so a mistaken press costs one screen and nothing else.
   - It works exactly as the check's question does (note, sections 3 and 6), except for its wording. The answer is read strictly by code and never by the AI. An unclear answer goes back to where the person was. The question's own step joins the steps where the check does not run. Yes sets the same state as the other ways in and lands at the type-of-harm question.
   - The question needs its own version. The check's question says "It sounds like you might not be safe at the moment", which fits something typed but not a button the person chose. The draft, using wording already in the current phrasebank: "If you're in immediate danger, call 999. Would you like to see help with staying safe?", with the same two answers and the quick exit note after it. To settle with the label.
   - It is placed away from "Exit this page" and looks different, so it is never pressed by mistake while someone is trying to leave. It is not given the exit's tab position.
   - It is hidden at every step where the check does not run (note, section 6). The one possible exception is the end of a conversation: someone may only recognise a safety concern after reading their results. Whether it shows there is for the technical lead and the safeguarding review to settle.
   - While the Safety route is switched off, there are two options. It could be hidden. Or it could go to the crisis question, as "Feeling unsafe" and the check already do, though that question has no option for forced marriage, FGM or exploitation. The others are reached only when someone has said something about their safety; a link on every screen invites anyone to press it, so the gap matters more. To decide.
2. **The list is bounded once the technical lead has reviewed it.** Bounded means controlled and reviewed at set points, not closed to correction when evidence shows a real problem. It covers Appendix A, his changes and the corrections of 26 November 2026, which are so far recorded only in the build. Those corrections are: "kicked me out" does not trigger, and "threatened" needs "me" or "to hurt" straight after it. The list sticks to plain, high-confidence statements and accepts that unusual wording will be missed.
3. **A rule for changing it.** The note already says the list is reviewed and extended from research and testing (section 8). This proposal adds that changes are gathered and decided together at set points, the first after the trial, not added as they arise. The Managing Director decides each change.
4. **Later, a simpler shape for the list.** The people who do harm are already held as word lists in the code. Acts and objects are still written inside phrases. Moving them into tables, with a test that tries each new word against every line, would make additions smaller and safer. This is worth doing only if the list keeps changing.

## What does not change

- **No AI.** The check stays patterns only (Managing Director, 19 November 2026), and the visible route needs no AI.
- **Nothing new logged.** The route records nothing beyond what the Safety route already records. As for the check (note, section 7), the hosting step log names each step reached, never what was typed. So the confirming question's step name appears there, which partly shows that someone came in that way.
- **The confirming question.** No still returns the person to where they were, and Yes still does not return them to their original request afterwards (note, section 10).

## Costs, failure modes and edge cases

- **It is a new mechanism.** The safety word was turned down partly because it "adds another mechanism to explain, maintain and test" (note, section 10). The visible route avoids the explaining, but not the rest. It needs a test for each entry, a safeguarding review by the technical lead and a recheck of the quick exit's release gate (design paper, work items 1 and 2).
- **Someone watching the screen.** A label about safety on every screen tells an onlooker what the page is for. A quieter label is possible, but it would be harder to understand. To decide.
- **Supporters.** A supporter who presses it is probably asking for the person they help, so they should keep supporter wording. The check is different, because it fires only on first-person statements. The draft question is first person, so supporters need their own version, using "If they are in danger right now, call 999", already in the phrasebank.
- **Building it.** The Safety route's first question is already shared, but the menu, the noticing step and the check each set up the rest themselves. The widget would need a new signal to the chat route, as the location widget already has.
- **Wording.** The original phrasebank's never-ask list bars proactive offers such as "Would you like help with [X]?". A link that waits to be pressed is not an offer in that sense, and the check's approved question already asks one. Both phrasebanks to be checked again before the wording is fixed.
- **Wording the list misses.** This is expected. Nothing typed is logged, so evidence comes from testing and from watching the trial. The visible route offers another way to reach support when the list does not recognise someone's words. It cannot guarantee that someone will notice, understand or choose it.
- **Seeing whether it is used.** The session record does not show which way someone came in. No field is added for now: use is seen by watching user testing. The case can be made later if the way in turns out to matter (Managing Director, 26 November 2026).
- **Small screens and accessibility.** The link has to fit on a phone, be reachable by keyboard and be read properly by screen readers.

## Decisions needed

1. Whether to take this approach.
2. Timing. Recommended: after the trial. The check itself is not yet reviewed or merged, and the Safety route may be switched off for the trial.
3. The label: "Help with staying safe", or something quieter for an onlooker. With it, the wording of the button's confirming question, for the person and for supporters (point 1).
4. Supporters: keep supporter wording when they press it? The second review recommends keeping it, with the existing conversation context.
5. While the Safety route is switched off: hide the link, or send it to the crisis question as the other ways in do (point 1).

**Decided (Managing Director, 26 November 2026):** no route field in the session record for now.

## For the technical lead

- Where in the widget can the link sit, away from the exit, on a phone?
- Is a sentinel message, like the location widget's, the right signal to the chat route?
- Would one shared entry to the Safety route, used by every way in, be worth building first?
