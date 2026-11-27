/**
 * Section C handlers - Detailed profiling
 *
 * Handles Section C profiling gates:
 * - C2_CONSENT_GATE
 * - ARMED_FORCES_ASK
 * - C3Q1_IMMIGRATION_STATUS
 * - C3Q1A_EUSS_FOLLOWUP
 * - C3Q1B_PUBLIC_FUNDS_FOLLOWUP
 * - C3Q2_DEPENDENT_CHILDREN
 * - C3Q3_AGE
 * - C3Q4_GENDER
 * - C3Q5_PREGNANCY
 * - C3Q6_ETHNICITY
 * - C3Q7_PHYSICAL_HEALTH
 * - C3Q8_MENTAL_HEALTH
 * - C3Q9_CRIMINAL_CONVICTIONS
 * - C3Q10_LGBTQ
 * - C3Q10A_LGBTQ_SERVICE_PREFERENCE
 * - C3Q11_EVER_IN_CARE_16_17, C3Q11_EVER_IN_CARE
 * - C3Q11A_CARE_COUNCIL
 *
 * These handlers collect detailed profile information for service matching.
 * C3Q3_AGE includes safeguarding routing for under-16s.
 */

import { getPhrase } from '../phrasebank';
import type { SessionState, RoutingResult, TerminalResult, CareExperience } from '../types';
import { phrase, buildUnder16Exit } from './shared';

// "Have you ever been in care?" is asked at 16 to 24, on the full route only
// (VA Pathway Review 5.2; Managing Director, 20 November 2026). It replaces the
// "currently looked after" and "social services" questions. 25 and over are
// never asked: the answer would not change what they are shown. The 16 and 17
// question on every housing route (B5_YOUTH_SOCIAL_SERVICES) is unchanged.
// Everyone aged 16 to 24 (Managing Director, 6 November 2026): leaving care
// support runs to 25. Age is asked once, in four bands; 18-20 and 21-24 are
// read too, for sessions that carry the older split.
export function isAged16To24(session: SessionState): boolean {
  const age = session.detailedAge || session.ageCategory;
  return ['16-17', '18-24', '18-20', '21-24'].includes(age || '');
}

export function shouldAskCareQuestion(session: SessionState): boolean {
  return session.routeType === 'FULL' && isAged16To24(session);
}

function careQuestionGate(session: SessionState): 'C3Q11_EVER_IN_CARE_16_17' | 'C3Q11_EVER_IN_CARE' {
  const age = session.detailedAge || session.ageCategory;
  return age === '16-17' ? 'C3Q11_EVER_IN_CARE_16_17' : 'C3Q11_EVER_IN_CARE';
}

// Option order at the care questions.
const CARE_16_17: CareExperience[] = ['IN_CARE_NOW', 'LEFT_CARE', 'SOCIAL_WORKER', 'NO', 'NOT_SURE', 'PREFER_NOT'];
const CARE_18_24: CareExperience[] = ['YES', 'NO', 'NOT_SURE', 'PREFER_NOT'];
// The council keys of housing-pathway-endpoints.json, in the order the
// council question lists them, then the three other answers.
export const CARE_COUNCILS = ['wolverhampton', 'birmingham', 'coventry', 'dudley', 'sandwell', 'solihull', 'walsall'];
const CARE_COUNCIL_ANSWERS = [...CARE_COUNCILS, 'ELSEWHERE', 'NOT_SURE', 'PREFER_NOT'];

// Whether this care answer goes on to "Which council looked after you?".
export function careAnswerAsksCouncil(gate: string, choice: number | null): boolean {
  if (!choice) return false;
  if (gate === 'C3Q11_EVER_IN_CARE_16_17') return choice === 1 || choice === 2;
  if (gate === 'C3Q11_EVER_IN_CARE') return choice === 1;
  return false;
}

// The armed forces question is asked only in the crisis housing conversation:
// home lost, about to lose it, leaving prison or hospital, staying somewhere,
// nowhere tonight. Not on the keep-things-steady prevention route, and not of
// 16 and 17 year olds (Managing Director, 2 November 2026; Service Matching and
// Questions Design Note 3.3 and 3.4). Age is asked before the housing situation
// question on every housing route; where it is not known, the question is not
// asked.
const CRISIS_HOUSING: SessionState['housingSituation'][] = [
  'LOSING_HOME', 'STAYING_SOMEWHERE', 'LEAVING_PRISON', 'LEAVING_HOSPITAL', 'NOWHERE_TONIGHT',
];

export function shouldAskArmedForces(session: SessionState): boolean {
  if (!CRISIS_HOUSING.includes(session.housingSituation)) return false;
  const age = session.detailedAge || session.ageCategory;
  return !!age && age !== '16-17' && age !== 'Under 16';
}

// ============================================================================
// Gate handlers
// ============================================================================

export function handleC2ConsentGate(
  session: SessionState,
  choice: number | null,
  buildTerminalServices: (session: SessionState) => TerminalResult
): RoutingResult {
  if (choice === 1) {
    const ack = getPhrase('C2A_CONSENT_ACKNOWLEDGED', session.isSupporter);
    // The armed forces question has already been asked, before this screen.
    const next = getPhrase('C3Q1_IMMIGRATION_STATUS', session.isSupporter);
    return {
      text: (ack?.text || '') + '\n\n' + (next?.text || ''),
      options: next?.options,
      stateUpdates: { currentGate: 'C3Q1_IMMIGRATION_STATUS', consentGiven: true },
      sessionEnded: false
    };
  } else {
    // No consent -> skip to terminal
    const result = buildTerminalServices(session);
    const additionalNeeds = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
    return {
      text: result.text + '\n' + additionalNeeds?.text,
      options: additionalNeeds?.options,
      stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', consentGiven: false, ...(result.terminalOutcome ? { terminalOutcome: result.terminalOutcome } : {}) },
      sessionEnded: false
    };
  }
}

// Yes true, No false, Prefer not to say null: not stated, so services for
// veterans are not selected. Asked before the more-questions screen, so the
// answer leads there on the full route and to the results on the quick route.
export function handleArmedForcesAsk(
  session: SessionState,
  choice: number | null,
  buildTerminalServices: (session: SessionState) => TerminalResult
): RoutingResult {
  const servedInArmedForces = choice === 1 ? true : (choice === 2 ? false : null);
  if (session.routeType === 'FULL') {
    return {
      ...phrase('C2_CONSENT_GATE', session.isSupporter),
      stateUpdates: { currentGate: 'C2_CONSENT_GATE', servedInArmedForces }
    };
  }
  const result = buildTerminalServices({ ...session, servedInArmedForces });
  const additionalNeeds = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
  return {
    text: result.text + '\n' + additionalNeeds?.text,
    options: additionalNeeds?.options,
    stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', servedInArmedForces, ...(result.terminalOutcome ? { terminalOutcome: result.terminalOutcome } : {}) },
    sessionEnded: false
  };
}

export function handleC3Q1ImmigrationStatus(session: SessionState, choice: number | null): RoutingResult {
  const immOptions = ['British', 'EUSS', 'Refugee', 'Leave to remain', 'Asylum seeker', 'No status', 'Prefer not to say'];
  const imm = choice ? immOptions[choice - 1] : null;

  // EUSS -> follow up
  if (choice === 2) {
    return {
      ...phrase('C3Q1A_EUSS_FOLLOWUP', session.isSupporter),
      stateUpdates: { currentGate: 'C3Q1A_EUSS_FOLLOWUP', immigrationStatus: imm }
    };
  }

  // No status -> acknowledgment + public funds
  if (choice === 6) {
    const ack = getPhrase('C3Q1C_NRPF_ACKNOWLEDGMENT', session.isSupporter);
    const pf = getPhrase('C3Q1B_PUBLIC_FUNDS_FOLLOWUP', session.isSupporter);
    return {
      text: (ack?.text || '') + '\n\n' + (pf?.text || ''),
      options: pf?.options,
      stateUpdates: { currentGate: 'C3Q1B_PUBLIC_FUNDS_FOLLOWUP', immigrationStatus: imm },
      sessionEnded: false
    };
  }

  // Continue to children
  return {
    ...phrase('C3Q2_DEPENDENT_CHILDREN', session.isSupporter),
    stateUpdates: { currentGate: 'C3Q2_DEPENDENT_CHILDREN', immigrationStatus: imm }
  };
}

export function handleC3Q1AEussFollowup(session: SessionState, choice: number | null): RoutingResult {
  const eussOptions = ['Settled', 'Pre-settled', 'Unsure'];
  const euss = choice ? eussOptions[choice - 1] : null;

  // Pre-settled -> public funds question
  if (choice === 2) {
    return {
      ...phrase('C3Q1B_PUBLIC_FUNDS_FOLLOWUP', session.isSupporter),
      stateUpdates: { currentGate: 'C3Q1B_PUBLIC_FUNDS_FOLLOWUP', eussStatus: euss }
    };
  }

  return {
    ...phrase('C3Q2_DEPENDENT_CHILDREN', session.isSupporter),
    stateUpdates: { currentGate: 'C3Q2_DEPENDENT_CHILDREN', eussStatus: euss }
  };
}

export function handleC3Q1BPublicFundsFollowup(session: SessionState, choice: number | null): RoutingResult {
  const pfOptions = ['Yes', 'No', 'Not sure'];
  const pf = choice ? pfOptions[choice - 1] : null;

  return {
    ...phrase('C3Q2_DEPENDENT_CHILDREN', session.isSupporter),
    stateUpdates: { currentGate: 'C3Q2_DEPENDENT_CHILDREN', publicFunds: pf }
  };
}

export function handleC3Q2DependentChildren(session: SessionState, choice: number | null): RoutingResult {
  const hasChildren = choice === 1;

  // Age is asked once, before B6, on every housing route. Section C asks it
  // only if it is somehow missing.
  const knownAge = session.detailedAge || session.ageCategory;
  if (knownAge) {
    return {
      ...phrase('C3Q4_GENDER', session.isSupporter),
      stateUpdates: { currentGate: 'C3Q4_GENDER', hasChildren, detailedAge: knownAge }
    };
  }

  return {
    ...phrase('C3Q3_AGE', session.isSupporter),
    stateUpdates: { currentGate: 'C3Q3_AGE', hasChildren }
  };
}

export function handleC3Q3Age(session: SessionState, choice: number | null): RoutingResult {
  const detailedAgeOptions = ['Under 16', '16-17', '18-24', '25+'];
  const detailedAge = choice ? detailedAgeOptions[choice - 1] : null;

  // Under 16 safeguarding — exit directly if LA known, otherwise ask for area first
  if (choice === 1) {
    if (session.localAuthority) {
      return buildUnder16Exit(session);
    }
    return {
      ...phrase('CRISIS_UNDER16_LOCATION', session.isSupporter),
      stateUpdates: { currentGate: 'CRISIS_UNDER16_LOCATION' }
    };
  }

  return {
    ...phrase('C3Q4_GENDER', session.isSupporter),
    stateUpdates: { currentGate: 'C3Q4_GENDER', detailedAge }
  };
}

export function handleC3Q4Gender(session: SessionState, choice: number | null): RoutingResult {
  const detailedGenderOptions = ['Male', 'Female', 'Trans Female', 'Trans Male'];
  const detailedGender = choice ? detailedGenderOptions[choice - 1] : null;

  // Pregnancy question only for female/trans female
  if (choice === 2 || choice === 3) {
    return {
      ...phrase('C3Q5_PREGNANCY', session.isSupporter),
      stateUpdates: { currentGate: 'C3Q5_PREGNANCY', detailedGender }
    };
  }

  return {
    ...phrase('C3Q6_ETHNICITY', session.isSupporter),
    stateUpdates: { currentGate: 'C3Q6_ETHNICITY', detailedGender }
  };
}

export function handleC3Q5Pregnancy(session: SessionState, choice: number | null): RoutingResult {
  const pregnant = choice === 1;

  return {
    ...phrase('C3Q6_ETHNICITY', session.isSupporter),
    stateUpdates: { currentGate: 'C3Q6_ETHNICITY', pregnant }
  };
}

export function handleC3Q6Ethnicity(session: SessionState, choice: number | null): RoutingResult {
  // Option 7, prefer not to say, stores null
  const ethOptions: (string | null)[] = ['White British', 'White Other', 'Black African', 'Black Caribbean', 'Asian', 'Mixed', null];
  const eth = choice ? (ethOptions[choice - 1] ?? null) : null;

  return {
    ...phrase('C3Q7_PHYSICAL_HEALTH', session.isSupporter),
    stateUpdates: { currentGate: 'C3Q7_PHYSICAL_HEALTH', ethnicity: eth }
  };
}

export function handleC3Q7PhysicalHealth(session: SessionState, choice: number | null): RoutingResult {
  // Option 7, prefer not to say, stores null
  const phOptions: (string | null)[] = ['None', 'Mobility', 'Visual', 'Hearing', 'Verbal', 'Neurological', null];
  const ph = choice ? (phOptions[choice - 1] ?? null) : null;

  return {
    ...phrase('C3Q8_MENTAL_HEALTH', session.isSupporter),
    stateUpdates: { currentGate: 'C3Q8_MENTAL_HEALTH', physicalHealth: ph }
  };
}

export function handleC3Q8MentalHealth(session: SessionState, choice: number | null): RoutingResult {
  const mhOptions = ['None', 'Depression', 'Anxiety', 'PTSD', 'Bipolar', 'Schizophrenia', 'Neurodivergence', 'Learning difficulties', 'Prefer not to say'];
  const mh = choice ? mhOptions[choice - 1] : null;

  return {
    ...phrase('C3Q9_CRIMINAL_CONVICTIONS', session.isSupporter),
    stateUpdates: { currentGate: 'C3Q9_CRIMINAL_CONVICTIONS', mentalHealth: mh }
  };
}

export function handleC3Q9CriminalConvictions(session: SessionState, choice: number | null): RoutingResult {
  const ccOptions = ['None', 'Arson', 'Sexual', 'Violent', 'Prefer not to say'];
  const cc = choice ? ccOptions[choice - 1] : null;

  return {
    ...phrase('C3Q10_LGBTQ', session.isSupporter),
    stateUpdates: { currentGate: 'C3Q10_LGBTQ', criminalConvictions: cc }
  };
}

export function handleC3Q10Lgbtq(
  session: SessionState,
  choice: number | null,
  buildTerminalServices: (session: SessionState) => TerminalResult
): RoutingResult {
  const lgbtq = choice === 1;

  if (lgbtq) {
    return {
      ...phrase('C3Q10A_LGBTQ_SERVICE_PREFERENCE', session.isSupporter),
      stateUpdates: { currentGate: 'C3Q10A_LGBTQ_SERVICE_PREFERENCE', lgbtq: true }
    };
  }

  // Ask the care question of everyone aged 16 to 24, on the full route
  const updatedSession = { ...session, lgbtq: false };
  if (shouldAskCareQuestion(updatedSession)) {
    const gate = careQuestionGate(updatedSession);
    return {
      ...phrase(gate, session.isSupporter),
      stateUpdates: { currentGate: gate, lgbtq: false }
    };
  } else {
    // 25 and over: results
    const result = buildTerminalServices(updatedSession);
    const additionalNeeds = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
    return {
      text: result.text + '\n' + additionalNeeds?.text,
      options: additionalNeeds?.options,
      stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', lgbtq: false, ...(result.terminalOutcome ? { terminalOutcome: result.terminalOutcome } : {}) },
      sessionEnded: false
    };
  }
}

export function handleC3Q10ALgbtqServicePreference(
  session: SessionState,
  choice: number | null,
  buildTerminalServices: (session: SessionState) => TerminalResult
): RoutingResult {
  const lgbtqPrefOptions = ['Specialist first', 'Local only', 'Show both'];
  const lgbtqPref = choice ? lgbtqPrefOptions[choice - 1] : null;

  // Ask the care question of everyone aged 16 to 24, on the full route
  const updatedSession = { ...session, lgbtqServicePreference: lgbtqPref };
  if (shouldAskCareQuestion(updatedSession)) {
    const gate = careQuestionGate(updatedSession);
    return {
      ...phrase(gate, session.isSupporter),
      stateUpdates: { currentGate: gate, lgbtqServicePreference: lgbtqPref }
    };
  } else {
    // 25 and over: results
    const result = buildTerminalServices(updatedSession);
    const additionalNeeds = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
    return {
      text: result.text + '\n' + additionalNeeds?.text,
      options: additionalNeeds?.options,
      stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', lgbtqServicePreference: lgbtqPref, ...(result.terminalOutcome ? { terminalOutcome: result.terminalOutcome } : {}) },
      sessionEnded: false
    };
  }
}

function careResults(
  session: SessionState,
  updates: Partial<SessionState>,
  buildTerminalServices: (session: SessionState) => TerminalResult
): RoutingResult {
  const result = buildTerminalServices({ ...session, ...updates } as SessionState);
  const additionalNeeds = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
  return {
    text: result.text + '\n' + additionalNeeds?.text,
    options: additionalNeeds?.options,
    stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', ...updates, ...(result.terminalOutcome ? { terminalOutcome: result.terminalOutcome } : {}) },
    sessionEnded: false
  };
}

// "Have you ever been in care?" In care now, left care, or Yes go on to the
// council question; every other answer shows results. At 16 and 17, "No, but
// I have a social worker" keeps the "already involved" layout and No the
// standard one, as the B5_YOUTH_SOCIAL_SERVICES answers do; Not sure and
// Prefer not to say leave the answer given there as it was.
export function handleCareEverInCare(
  session: SessionState,
  choice: number | null,
  buildTerminalServices: (session: SessionState) => TerminalResult
): RoutingResult {
  const gate = session.currentGate;
  const answers = gate === 'C3Q11_EVER_IN_CARE_16_17' ? CARE_16_17 : CARE_18_24;
  const careExperience = choice && choice >= 1 && choice <= answers.length ? answers[choice - 1] : null;
  if (!careExperience) return phrase(gate, session.isSupporter);

  if (careAnswerAsksCouncil(gate, choice)) {
    return {
      ...phrase('C3Q11A_CARE_COUNCIL', session.isSupporter),
      stateUpdates: { currentGate: 'C3Q11A_CARE_COUNCIL', careExperience }
    };
  }

  const updates: Partial<SessionState> = { careExperience, careCouncil: null };
  if (gate === 'C3Q11_EVER_IN_CARE_16_17') {
    if (careExperience === 'SOCIAL_WORKER') updates.socialServices = 'Yes';
    if (careExperience === 'NO') updates.socialServices = 'No';
  }
  return careResults(session, updates, buildTerminalServices);
}

// "Which council looked after you?" Then results.
export function handleCareCouncil(
  session: SessionState,
  choice: number | null,
  buildTerminalServices: (session: SessionState) => TerminalResult
): RoutingResult {
  const careCouncil = choice && choice >= 1 && choice <= CARE_COUNCIL_ANSWERS.length ? CARE_COUNCIL_ANSWERS[choice - 1] : null;
  if (!careCouncil) return phrase('C3Q11A_CARE_COUNCIL', session.isSupporter);
  return careResults(session, { careCouncil }, buildTerminalServices);
}
