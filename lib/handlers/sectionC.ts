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
 * - C3Q11_CURRENTLY_IN_CARE
 * - C3Q12_SOCIAL_SERVICES
 *
 * These handlers collect detailed profile information for service matching.
 * C3Q3_AGE includes safeguarding routing for under-16s.
 */

import { getPhrase } from '../phrasebank';
import type { SessionState, RoutingResult, TerminalResult } from '../types';
import { phrase, buildUnder16Exit } from './shared';

// Check if social services questions should be asked
// Only for 16-17 and 18-20 age groups (priority need assessment)
export function shouldAskSocialServicesQuestions(session: SessionState): boolean {
  const age = session.detailedAge || session.ageCategory;
  // 16 and 17 year olds are asked once, before the homelessness question
  if (age === '16-17' && session.youthSocialServicesAsked) return false;
  return age === '16-17' || age === '18-20';
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

  // Age is asked before B6 on every housing route. Section C asks it again
  // only to split 18-24 into 18-20 and 21-24, which decides whether the
  // social services questions (C3Q11, C3Q12) are asked.
  if (session.ageCategory && session.ageCategory !== '18-24') {
    return {
      ...phrase('C3Q4_GENDER', session.isSupporter),
      stateUpdates: { currentGate: 'C3Q4_GENDER', hasChildren, detailedAge: session.ageCategory }
    };
  }

  return {
    ...phrase('C3Q3_AGE', session.isSupporter),
    stateUpdates: { currentGate: 'C3Q3_AGE', hasChildren }
  };
}

export function handleC3Q3Age(session: SessionState, choice: number | null): RoutingResult {
  const detailedAgeOptions = ['Under 16', '16-17', '18-20', '21-24', '25+'];
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

  // UPDATED v7.1: Only ask social services questions for 16-17 and 18-20
  const updatedSession = { ...session, lgbtq: false };
  if (shouldAskSocialServicesQuestions(updatedSession)) {
    return {
      ...phrase('C3Q11_CURRENTLY_IN_CARE', session.isSupporter),
      stateUpdates: { currentGate: 'C3Q11_CURRENTLY_IN_CARE', lgbtq: false }
    };
  } else {
    // Skip to terminal for 21-24 and 25+
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

  // UPDATED v7.1: Only ask social services questions for 16-17 and 18-20
  const updatedSession = { ...session, lgbtqServicePreference: lgbtqPref };
  if (shouldAskSocialServicesQuestions(updatedSession)) {
    return {
      ...phrase('C3Q11_CURRENTLY_IN_CARE', session.isSupporter),
      stateUpdates: { currentGate: 'C3Q11_CURRENTLY_IN_CARE', lgbtqServicePreference: lgbtqPref }
    };
  } else {
    // Skip to terminal for 21-24 and 25+
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

export function handleC3Q11CurrentlyInCare(session: SessionState, choice: number | null): RoutingResult {
  const inCare = choice === 1;

  return {
    ...phrase('C3Q12_SOCIAL_SERVICES', session.isSupporter),
    stateUpdates: { currentGate: 'C3Q12_SOCIAL_SERVICES', inCare }
  };
}

export function handleC3Q12SocialServices(
  session: SessionState,
  choice: number | null,
  buildTerminalServices: (session: SessionState) => TerminalResult
): RoutingResult {
  const ssOptions = ['Yes', 'No', 'Prefer not to say'];
  const ss = choice ? ssOptions[choice - 1] : null;

  // Terminal with full profile
  const result = buildTerminalServices({ ...session, socialServices: ss });
  const additionalNeeds = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
  return {
    text: result.text + '\n' + additionalNeeds?.text,
    options: additionalNeeds?.options,
    stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', socialServices: ss, ...(result.terminalOutcome ? { terminalOutcome: result.terminalOutcome } : {}) },
    sessionEnded: false
  };
}
