/**
 * Safety disclosure check: the clarifying question and where it leads
 * (Safety Disclosure Check Design Note v1.0, sections 3 and 6). The patterns
 * are in lib/safetyDisclosure.ts.
 *
 * Runs on every typed message, in the chat route, directly after the under-16
 * check and before the scope and advice checks and any step's own handling.
 * Its own step is read strictly, by code only: never by interpretWithClaude,
 * checkScope, detectAdviceQuestion or the unclear-answer escalation (section 5).
 * Nothing about it is logged (section 7).
 *
 * Changes require safeguarding test coverage.
 */

import type { GateType, RoutingResult, SessionState } from '../types';
import { getPhrase } from '../phrasebank';
import { phrase } from './shared';
import { startSafetyRoute } from './safety';
import { crisisQuestionFallback } from './crisis';
import { isSafetyRouteEnabled } from '../safetyRouteSwitch';
import { secondScreenPhraseKey } from '../stateMachine';
import { HOUSING_OFFER_OPTIONS, housingOfferText, noticingMultiSelect, noticingOptions, noticingText, notSureMultiSelect, notSureOptions, notSureText } from '../noticing';
import { detectDisclosure, readDisclosureAnswer } from '../safetyDisclosure';

export const SAFETY_DISCLOSURE_GATE: GateType = 'SAFETY_DISCLOSURE_CHECK';

// Where the check does not run: the person is already on a safeguarding route,
// or the conversation has ended (section 6). The note also lists
// ESCALATION_LEVEL_3, which no step uses.
export const SAFETY_CHECK_EXCLUDED_GATES: readonly GateType[] = [
  'GATE0_CRISIS_DANGER',
  'CRISIS_UNDER16_LOCATION',
  'CRISIS_FIRE_FLOOD_LOCATION',
  'SAFETY_TYPE_OF_HARM',
  'SAFETY_OK_TO_CONTINUE',
  'DV_GENDER_ASK',
  'DV_CHILDREN_ASK',
  'SA_GENDER_ASK',
  'ESCALATION_LEVEL_1',
  'ESCALATION_LEVEL_2',
  'SESSION_END',
  'SAFETY_DISCLOSURE_CHECK',
];

/**
 * The clarifying question, when a typed message matches a family not yet used
 * up. Otherwise null, and the message is handled as it would be without the
 * check. The message itself is not applied as an answer (section 3).
 */
export function interceptSafetyDisclosure(session: SessionState, message: string): RoutingResult | null {
  if (SAFETY_CHECK_EXCLUDED_GATES.includes(session.currentGate)) return null;
  const declined = session.safetyCheckDeclined ?? [];
  const matched = detectDisclosure(message);
  if (!matched.some(f => !declined.includes(f))) return null;
  const question = phrase('SAFETY_DISCLOSURE_CHECK', false);
  return {
    ...question,
    stateUpdates: {
      currentGate: SAFETY_DISCLOSURE_GATE,
      safetyCheckPending: matched,
      safetyCheckReturnGate: session.currentGate,
    },
  };
}

// The question they were at, shown again with the answers they had given kept
// (section 3, "Back to where they were").
export function questionAgain(session: SessionState, gate: GateType): RoutingResult {
  const s = session.isSupporter;
  switch (gate) {
    case 'B5_SECOND_SCREEN': {
      const r = phrase(secondScreenPhraseKey(session.v4Option), s);
      return { ...r, stateUpdates: { currentGate: 'B5_SECOND_SCREEN' } };
    }
    case 'B5_NOTICING':
      return { text: noticingText(session), options: noticingOptions(session), multiSelect: noticingMultiSelect(session), stateUpdates: { currentGate: 'B5_NOTICING' } };
    case 'B5_NOT_SURE':
      return { text: notSureText(), options: notSureOptions(), multiSelect: notSureMultiSelect(), stateUpdates: { currentGate: 'B5_NOT_SURE' } };
    case 'B5_HOUSING_OFFER':
      return {
        text: housingOfferText(session.noticingHousing === 'keep-home' ? 'keep-home' : 'no-settled-place'),
        options: HOUSING_OFFER_OPTIONS,
        stateUpdates: { currentGate: 'B5_HOUSING_OFFER' },
      };
    case 'LOCATION_POSTCODE':
      return { ...phrase('LOCATION_POSTCODE_REQUEST', s), stateUpdates: { currentGate: 'LOCATION_POSTCODE' }, responseType: 'postcode_input' };
    case 'CRISIS_UNCLEAR_HELP':
      // The help shown after a second unclear answer at the crisis question
      // (#93), with its "Carry on".
      return crisisQuestionFallback(session);
    case 'LOCATION_RESULT':
      // Waiting for the location widget: ask how they want to share it again.
      return phrase('LOCATION_CONSENT', s);
    case 'LOCATION_CONFIRM': {
      const p = getPhrase('LOCATION_CONFIRM', s);
      const la = session.localAuthority ?? '';
      return {
        text: p?.text?.replace('[LOCAL_AUTHORITY]', la) || `I've detected you're in ${la}. Is this correct?`,
        options: p?.options || ["Yes, that's correct", 'I need help in a different area'],
        stateUpdates: { currentGate: 'LOCATION_CONFIRM' },
      };
    }
    default: {
      const r = phrase(gate, s);
      return { ...r, stateUpdates: { currentGate: gate } };
    }
  }
}

/** The answer at the clarifying question (section 3). */
export function handleSafetyDisclosureAnswer(session: SessionState, message: string): RoutingResult {
  const options = getPhrase('SAFETY_DISCLOSURE_CHECK', false)?.options ?? [];
  const answer = readDisclosureAnswer(message, options);
  const done = { safetyCheckPending: [], safetyCheckReturnGate: null };

  if (answer === 'yes') {
    // The person's own wording from here, also where they came in as a
    // supporter: the statement was about them (section 3).
    // The session-end record keeps who they came in as (safetyCheckCameAs).
    const cameAs = session.userType === 'SUPPORTER' || session.userType === 'PROFESSIONAL' ? session.userType : null;
    const own = { isSupporter: false, ...(cameAs ? { userType: 'SELF' as const, safetyCheckCameAs: cameAs } : {}) };
    // While the Safety route's switch is off, the crisis question, as for
    // "Feeling unsafe" at the noticing step (James Cross's review of #73).
    if (!isSafetyRouteEnabled()) {
      const crisis = phrase('GATE0_CRISIS_DANGER', false);
      return { ...crisis, stateUpdates: { ...crisis.stateUpdates, ...own, ...done, unclearCount: 0 } };
    }
    const r = startSafetyRoute({ ...session, isSupporter: false });
    return {
      ...r,
      stateUpdates: { ...r.stateUpdates, ...own, ...done, v4Option: 'safety', v4Choice: null, supportNeed: 'V4:safety', unclearCount: 0 },
    };
  }

  // No uses up every family the message matched; unclear uses up nothing.
  // Either way, back to where they were, the trigger not applied.
  const gate = session.safetyCheckReturnGate ?? 'GATE1_INTENT';
  const declined = answer === 'no'
    ? Array.from(new Set([...(session.safetyCheckDeclined ?? []), ...(session.safetyCheckPending ?? [])]))
    : session.safetyCheckDeclined ?? [];
  const back = questionAgain(session, gate);
  return { ...back, stateUpdates: { ...back.stateUpdates, ...done, safetyCheckDeclined: declined } };
}
