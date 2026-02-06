/**
 * Homeless continuation handlers
 *
 * Handles homeless continuation gates:
 * - B8_DURATION
 * - B9_REASON
 * - B10_INCOME
 * - B11_PRIOR_USE
 * - B12_ALREADY_SUPPORTED
 * - B12A_WHICH_ORG
 *
 * These handlers collect additional information for users who are
 * currently homeless, including duration, reason, and support status.
 */

import { getPhrase } from '../phrasebank';
import type { SessionState, RoutingResult, GateType } from '../stateMachine';

// ============================================================================
// Helper functions (copied from stateMachine.ts - will be shared later)
// ============================================================================

function phrase(key: string, isSupporter: boolean): RoutingResult {
  const p = getPhrase(key, isSupporter);
  return {
    text: p?.text || `[Missing phrase: ${key}]`,
    options: p?.options,
    stateUpdates: { currentGate: key as GateType },
    sessionEnded: false,
    responseType: p?.responseType,
  };
}

// ============================================================================
// Gate handlers
// ============================================================================

export function handleB8Duration(session: SessionState, choice: number | null): RoutingResult {
  const durationOptions = ['Less than a week', '1-4 weeks', '1-6 months', '6-12 months', 'Over a year'];
  const duration = choice ? durationOptions[choice - 1] : null;

  return {
    ...phrase('B9_REASON', session.isSupporter),
    stateUpdates: { currentGate: 'B9_REASON', duration }
  };
}

export function handleB9Reason(session: SessionState, choice: number | null): RoutingResult {
  const b9Options = ['Relationship breakdown', 'Domestic abuse', 'Lost job', 'Asked to leave', 'End of tenancy', 'Prison/hospital', 'Mental health', 'Substance use', 'Other'];
  const b9Reason = choice ? b9Options[choice - 1] : null;

  // Domestic abuse -> DV routing
  if (choice === 2) {
    return phrase('DV_GENDER_ASK', session.isSupporter);
  }

  // Mental health acknowledgment
  let extraText = '';
  if (choice === 7) {
    const ack = getPhrase('B9C_MENTAL_HEALTH_ACKNOWLEDGMENT', session.isSupporter);
    extraText = (ack?.text || '') + '\n\n';
  }

  const b10 = getPhrase('B10_INCOME', session.isSupporter);
  return {
    text: extraText + b10?.text,
    options: b10?.options,
    stateUpdates: { currentGate: 'B10_INCOME', reason: b9Reason },
    sessionEnded: false
  };
}

export function handleB10Income(session: SessionState, choice: number | null): RoutingResult {
  const incomeOptions = ['Employment', 'Benefits', 'Family/friends', 'No income', 'Prefer not to say'];
  const income = choice ? incomeOptions[choice - 1] : null;

  return {
    ...phrase('B11_PRIOR_USE', session.isSupporter),
    stateUpdates: { currentGate: 'B11_PRIOR_USE', income }
  };
}

export function handleB11PriorUse(session: SessionState, choice: number | null): RoutingResult {
  const priorUseOptions = ['Yes', 'No', 'Not sure'];
  const priorUse = choice ? priorUseOptions[choice - 1] : null;

  return {
    ...phrase('B12_ALREADY_SUPPORTED', session.isSupporter),
    stateUpdates: { currentGate: 'B12_ALREADY_SUPPORTED', priorUse }
  };
}

export function handleB12AlreadySupported(
  session: SessionState,
  choice: number | null,
  buildTerminalServices: (session: SessionState) => string
): RoutingResult {
  const alreadySupported = choice === 1;

  if (alreadySupported) {
    return {
      ...phrase('B12A_WHICH_ORG', session.isSupporter),
      stateUpdates: { currentGate: 'B12A_WHICH_ORG', alreadySupported: true }
    };
  }

  // Go to Section C or terminal
  if (session.routeType === 'FULL') {
    return {
      ...phrase('C2_CONSENT_GATE', session.isSupporter),
      stateUpdates: { currentGate: 'C2_CONSENT_GATE', alreadySupported: false }
    };
  } else {
    const services = buildTerminalServices(session);
    const additionalNeeds = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
    return {
      text: services + '\n' + additionalNeeds?.text,
      options: additionalNeeds?.options,
      stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', alreadySupported: false },
      sessionEnded: false
    };
  }
}

export function handleB12AWhichOrg(
  session: SessionState,
  input: string,
  buildTerminalServices: (session: SessionState) => string
): RoutingResult {
  // Free text input - store and continue
  if (session.routeType === 'FULL') {
    return {
      ...phrase('C2_CONSENT_GATE', session.isSupporter),
      stateUpdates: { currentGate: 'C2_CONSENT_GATE', currentSupportingOrg: input }
    };
  } else {
    const services = buildTerminalServices(session);
    const additionalNeeds = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
    return {
      text: services + '\n' + additionalNeeds?.text,
      options: additionalNeeds?.options,
      stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', currentSupportingOrg: input },
      sessionEnded: false
    };
  }
}
