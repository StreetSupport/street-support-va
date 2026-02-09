/**
 * Core profiling handlers
 *
 * Handles profiling gates:
 * - B1_LOCAL_AUTHORITY
 * - B2_WHO_FOR
 * - B3_AGE_CATEGORY
 * - B4_GENDER
 * - B5_MAIN_SUPPORT_NEED
 * - B6_HOMELESSNESS_STATUS
 * - B7_HOUSED_SITUATION
 * - B7_HOMELESS_SLEEPING_SITUATION
 * - B7A_PREVENTION_GATE
 *
 * These handlers collect user profile information for service matching.
 * B3_AGE_CATEGORY includes safeguarding routing for under-16s.
 */

import { getPhrase } from '../phrasebank';
import type { SessionState, RoutingResult } from '../stateMachine';
import { phrase, buildUnder16Exit } from './shared';

// ============================================================================
// Gate handlers
// ============================================================================

export function handleB1LocalAuthority(session: SessionState, choice: number | null): RoutingResult {
  const laOptions = ['Wolverhampton', 'Coventry', 'Birmingham', 'Walsall', 'Solihull', 'Dudley', 'Sandwell', 'Other'];
  const la = choice ? laOptions[choice - 1] : null;

  if (la === 'Other') {
    const notice = getPhrase('WMCA_ONLY_SCOPE_NOTICE', session.isSupporter);
    return {
      text: notice?.text || '',
      stateUpdates: { currentGate: 'SESSION_END', localAuthority: 'Other', timestampEnd: new Date().toISOString() },
      sessionEnded: true
    };
  }

  return {
    ...phrase('B2_WHO_FOR', session.isSupporter),
    stateUpdates: { currentGate: 'B2_WHO_FOR', localAuthority: la }
  };
}

export function handleB2WhoFor(session: SessionState, choice: number | null): RoutingResult {
  const userTypes: Record<number, 'SELF' | 'SUPPORTER' | 'PROFESSIONAL'> = {
    1: 'SELF',
    2: 'SUPPORTER',
    3: 'PROFESSIONAL',
    4: 'SELF'
  };
  const userType = userTypes[choice || 1];
  const isSupporter = userType === 'SUPPORTER' || userType === 'PROFESSIONAL';

  // Go straight to support need - age/gender asked later only if needed
  return {
    ...phrase('B5_MAIN_SUPPORT_NEED', isSupporter),
    stateUpdates: { currentGate: 'B5_MAIN_SUPPORT_NEED', userType, isSupporter }
  };
}

export function handleB3AgeCategory(session: SessionState, choice: number | null): RoutingResult {
  const ageOptions = ['Under 16', '16-17', '18-24', '25 or over'];
  const age = choice ? ageOptions[choice - 1] : null;

  // Under 16 safeguarding exit
  if (choice === 1) {
    return buildUnder16Exit(session);
  }

  // Youth flag for 16-17
  const youthFlag = choice === 2;

  // Full route asks gender, quick route skips to B5
  if (session.routeType === 'FULL') {
    return {
      ...phrase('B4_GENDER', session.isSupporter),
      stateUpdates: { currentGate: 'B4_GENDER', ageCategory: age, youthServicesFlag: youthFlag }
    };
  } else {
    return {
      ...phrase('B5_MAIN_SUPPORT_NEED', session.isSupporter),
      stateUpdates: { currentGate: 'B5_MAIN_SUPPORT_NEED', ageCategory: age, youthServicesFlag: youthFlag }
    };
  }
}

export function handleB4Gender(session: SessionState, choice: number | null): RoutingResult {
  const genderOptions = ['Male', 'Female', 'Non-binary or other', 'Prefer not to say'];
  const gender = choice ? genderOptions[choice - 1] : null;

  return {
    ...phrase('B5_MAIN_SUPPORT_NEED', session.isSupporter),
    stateUpdates: { currentGate: 'B5_MAIN_SUPPORT_NEED', gender }
  };
}

export function handleB6HomelessnessStatus(session: SessionState, choice: number | null): RoutingResult {
  const homeless = choice === 1;

  if (homeless) {
    return {
      ...phrase('B7_HOMELESS_SLEEPING_SITUATION', session.isSupporter),
      stateUpdates: { currentGate: 'B7_HOMELESS_SLEEPING_SITUATION', homeless: true }
    };
  } else {
    return {
      ...phrase('B7_HOUSED_SITUATION', session.isSupporter),
      stateUpdates: { currentGate: 'B7_HOUSED_SITUATION', homeless: false }
    };
  }
}

export function handleB7HousedSituation(session: SessionState, choice: number | null): RoutingResult {
  const housedOptions = ['At home', 'Friends/family', 'Council temp', 'Other temp'];
  const housed = choice ? housedOptions[choice - 1] : null;

  // Friends/family or temp = actually homeless (sofa surfing)
  if (choice && choice >= 2) {
    return {
      ...phrase('B7_HOMELESS_SLEEPING_SITUATION', session.isSupporter),
      stateUpdates: { currentGate: 'B7_HOMELESS_SLEEPING_SITUATION', housedSituation: housed, homeless: true }
    };
  }

  // At home -> prevention gate
  return {
    ...phrase('B7A_PREVENTION_GATE', session.isSupporter),
    stateUpdates: { currentGate: 'B7A_PREVENTION_GATE', housedSituation: housed }
  };
}

// Note: B5_MAIN_SUPPORT_NEED, B7A_PREVENTION_GATE, and B7_HOMELESS_SLEEPING_SITUATION
// depend on buildTerminalServices and routeToNextProfileQuestion which are complex
// functions with many dependencies. These handlers will be added once the terminal
// building logic is extracted to a shared module.
