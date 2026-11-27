// Which turns read services from the platform database. Kept apart from the
// chat route so it can be tested without a server or a database.
//
// A read runs only where the answer can lead to matched results, so a slow or
// failed read never delays any other turn. Crisis and under-16 turns never
// read: their contacts are fixed in code and data, not in the database. The
// Safety from harm results screen reads for its local listings only, alongside
// fixed contacts that show whatever the read does (SAFETY_RESULT_GATES).

import type { SessionState } from '../types';
import type { ServicePool } from './servicePool';
import { noticingLeadsToResults } from '../noticing';
import { parseUserInput } from '../stateMachine';
import { getPhrase } from '../phrasebank';
import { careAnswerAsksCouncil, shouldAskArmedForces, shouldAskCareQuestion } from '../handlers/sectionC';
import { FIRST_OPTIONS } from './v4Categories';
import { parseSafetyChoice } from '../handlers/safety';

// Gates whose answer can lead to a matched (non-housing) result.
export const MATCHING_GATES = new Set<string>([
  'B5_MAIN_SUPPORT_NEED',
  'B5_SECOND_SCREEN',
  'B5_NOTICING',
  'B5A_ADVICE_TYPE',
  'B5_PROFILE_AGE',
  'B5_PROFILE_GENDER',
  'B5_PROFILE_LGBTQ',
  'B5_PROFILE_CONVICTIONS',
  'B5_PROFILE_CHILDREN',
  'LGBTQ_SPECIALIST_ASK',
  'IMMIGRATION_STATUS_ASK',
]);

// Gates whose answer can lead to the housing results (Managing Director,
// 20 November 2026). Read only on the housing route, and only when this answer
// shows the housing results (housingResultsThisTurn). Where the read fails,
// times out or finds nothing, housing uses the fixed file (serviceMatcher.ts).
// The prevention safeguarding questions (B7D_4, B7D_4A) are left out, so a
// safeguarding answer is never kept waiting on the database; housing results
// reached from them use the fixed file.
export const HOUSING_RESULT_GATES = new Set<string>([
  'HOUSING_OPTIONS_INVOLVEMENT_ASK',
  'B7A_PREVENTION_GATE',
  'B7_HOMELESS_SLEEPING_SITUATION',
  'B7B_PREVENTION_REASON',
  'B12_ALREADY_SUPPORTED',
  'B12A_WHICH_ORG',
  'ARMED_FORCES_ASK',
  'C2_CONSENT_GATE',
  'C3Q10_LGBTQ',
  'C3Q10A_LGBTQ_SERVICE_PREFERENCE',
  'C3Q11_EVER_IN_CARE_16_17',
  'C3Q11_EVER_IN_CARE',
  'C3Q11A_CARE_COUNCIL',
  'ESCALATION_LEVEL_1',
  'ESCALATION_LEVEL_2',
]);

// Whether this answer, at one of the housing results gates, shows the housing
// results. Mirrors the state machine's own branches, so other answers there
// (the escalation phone number, starting again at the crisis question, the
// next question) never wait on the database. The 16 and 17 care questions
// never read. Where this says no and results do show, they come from
// the fixed file, so a mismatch costs local results, never a wait.
export function housingResultsThisTurn(session: SessionState, input: string): boolean {
  const gate = session.currentGate;
  const choice = parseUserInput(input, getPhrase(gate, session.isSupporter)?.options);
  const quick = session.routeType === 'QUICK';
  const age = session.detailedAge || session.ageCategory;
  switch (gate) {
    case 'HOUSING_OPTIONS_INVOLVEMENT_ASK':
      return quick && !!session.housingSituation && session.housingSituation !== 'KEEP_STEADY';
    case 'B7A_PREVENTION_GATE':
      return choice === 2;
    case 'B7_HOMELESS_SLEEPING_SITUATION':
      return quick;
    case 'B7B_PREVENTION_REASON':
      return quick && (choice === 2 || choice === 4);
    // The armed forces question comes next where it applies (review of #80,
    // 27 November 2026); the results then follow its answer.
    case 'B12_ALREADY_SUPPORTED':
      return choice !== 1 && session.routeType !== 'FULL' && !shouldAskArmedForces(session);
    case 'B12A_WHICH_ORG':
      return session.routeType !== 'FULL' && !shouldAskArmedForces(session);
    case 'ARMED_FORCES_ASK':
      return session.routeType !== 'FULL';
    case 'C2_CONSENT_GATE':
      return choice !== 1;
    case 'C3Q10_LGBTQ':
      return choice !== 1 && !shouldAskCareQuestion({ ...session, lgbtq: false });
    case 'C3Q10A_LGBTQ_SERVICE_PREFERENCE':
      return !shouldAskCareQuestion(session);
    case 'C3Q11_EVER_IN_CARE_16_17':
      return false;
    case 'C3Q11_EVER_IN_CARE': {
      const options = getPhrase(gate, session.isSupporter)?.options ?? [];
      return age !== '16-17' && choice !== null && choice <= options.length && !careAnswerAsksCouncil(gate, choice);
    }
    case 'C3Q11A_CARE_COUNCIL': {
      const options = getPhrase(gate, session.isSupporter)?.options ?? [];
      return age !== '16-17' && choice !== null && choice <= options.length;
    }
    case 'ESCALATION_LEVEL_1':
      return choice === 2;
    case 'ESCALATION_LEVEL_2':
      return choice === 1;
    default:
      return false;
  }
}

// Safeguarding never waits on the database: choosing Safety from harm at the
// first question, and "Under 16" at the age question, never start the read.
export function safeguardingExitThisTurn(session: SessionState, input: string): boolean {
  const gate = session.currentGate;
  const choice = parseUserInput(input, getPhrase(gate, session.isSupporter)?.options);
  if (gate === 'B5_MAIN_SUPPORT_NEED') {
    return choice !== null && FIRST_OPTIONS[choice - 1]?.id === 'safety';
  }
  if (gate === 'B5_PROFILE_AGE') return choice === 1;
  return false;
}

// The Safety from harm results screen (Managing Director, 20 November 2026):
// read where this answer shows it, for its local listings. Never at the first
// question or the type of harm question, and never at the crisis gate: the
// immediate danger and under-16 exits never start the read. The domestic abuse
// and sexual violence questions read only when reached from the Safety route.
export const SAFETY_RESULT_GATES = new Set<string>(['SAFETY_OK_TO_CONTINUE', 'DV_CHILDREN_ASK', 'SA_GENDER_ASK']);

export function safetyResultsThisTurn(session: SessionState, input: string): boolean {
  const gate = session.currentGate;
  if (session.v4Option !== 'safety' || !session.safetyHarm) return false;
  if (gate === 'SAFETY_OK_TO_CONTINUE') {
    const choice = parseSafetyChoice(input, getPhrase(gate, session.isSupporter)?.options);
    if (choice !== 1 && choice !== 2) return false;
    // "Yes, I'm OK to carry on" for domestic abuse or sexual violence asks the
    // next question; every other answer shows help.
    return !(choice === 1 && (session.safetyHarm === 'DOMESTIC_ABUSE' || session.safetyHarm === 'SEXUAL_VIOLENCE'));
  }
  return gate === 'DV_CHILDREN_ASK' || gate === 'SA_GENDER_ASK';
}

// `input` is what the state machine is given for this turn.
export function readsLiveAt(session: SessionState, input: string): boolean {
  // Distance needs a point. Without one (council chosen from the list), the
  // fixed file is used for now; searching from the council's own point, as the
  // website's location pages do, follows with the V4 work.
  if (session.latitude == null || session.longitude == null) return false;
  if (HOUSING_RESULT_GATES.has(session.currentGate)) {
    return session.supportNeed === 'Emergency Housing' && housingResultsThisTurn(session, input);
  }
  if (SAFETY_RESULT_GATES.has(session.currentGate)) return safetyResultsThisTurn(session, input);
  if (!MATCHING_GATES.has(session.currentGate)) return false;
  if (safeguardingExitThisTurn(session, input)) return false;
  // At the noticing step, read only when the answer leads to results, so the
  // Safety route is never kept waiting on the database.
  if (session.currentGate === 'B5_NOTICING' && !noticingLeadsToResults(session, input)) return false;
  return true;
}

// The pool for this turn: the read starts only where readsLiveAt allows it.
export function poolForTurn(
  session: SessionState,
  input: string,
  load: (latitude: number, longitude: number) => Promise<ServicePool>,
): Promise<ServicePool | null> {
  if (!readsLiveAt(session, input)) return Promise.resolve(null);
  return load(session.latitude!, session.longitude!);
}
