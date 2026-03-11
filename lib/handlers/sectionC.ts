/**
 * Section C handlers - Detailed profiling
 *
 * Handles Section C profiling gates:
 * - C2_CONSENT_GATE
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
function shouldAskSocialServicesQuestions(session: SessionState): boolean {
  const age = session.detailedAge || session.ageCategory;
  return age === '16-17' || age === '18-20';
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
    const imm = getPhrase('C3Q1_IMMIGRATION_STATUS', session.isSupporter);
    return {
      text: (ack?.text || '') + '\n\n' + (imm?.text || ''),
      options: imm?.options,
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

  return {
    ...phrase('C3Q3_AGE', session.isSupporter),
    stateUpdates: { currentGate: 'C3Q3_AGE', hasChildren }
  };
}

export function handleC3Q3Age(session: SessionState, choice: number | null): RoutingResult {
  const detailedAgeOptions = ['Under 16', '16-17', '18-20', '21-24', '25+'];
  const detailedAge = choice ? detailedAgeOptions[choice - 1] : null;

  // Under 16 safeguarding
  if (choice === 1) {
    return buildUnder16Exit(session);
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
  const ethOptions = ['White British', 'White Other', 'Black African', 'Black Caribbean', 'Asian', 'Mixed'];
  const eth = choice ? ethOptions[choice - 1] : null;

  return {
    ...phrase('C3Q7_PHYSICAL_HEALTH', session.isSupporter),
    stateUpdates: { currentGate: 'C3Q7_PHYSICAL_HEALTH', ethnicity: eth }
  };
}

export function handleC3Q7PhysicalHealth(session: SessionState, choice: number | null): RoutingResult {
  const phOptions = ['None', 'Mobility', 'Visual', 'Hearing', 'Verbal', 'Neurological'];
  const ph = choice ? phOptions[choice - 1] : null;

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
