/**
 * Prevention pathway handlers
 *
 * Handles prevention profiling gates:
 * - B7B_PREVENTION_REASON
 * - B7C_PREVENTION_URGENCY
 * - B7D_1_PREVENTION_CHILDREN_DEPENDENTS
 * - B7D_2_PREVENTION_EMPLOYMENT_INCOME
 * - B7D_3_PREVENTION_PRIOR_SUPPORT
 * - B7D_4_PREVENTION_SAFEGUARDING_SIGNALS
 * - B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP
 *
 * These handlers collect prevention-specific information and route
 * to appropriate escalation exits or terminal services.
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

function safeguardingExit(key: string, isSupporter: boolean, type: string): RoutingResult {
  const p = getPhrase(key, isSupporter);
  return {
    text: p?.text || `[Missing phrase: ${key}]`,
    stateUpdates: {
      currentGate: 'SESSION_END',
      safeguardingTriggered: true,
      safeguardingType: type,
      timestampEnd: new Date().toISOString(),
    },
    sessionEnded: true,
  };
}

// ============================================================================
// Gate handlers
// ============================================================================

export function handleB7BPreventionReason(session: SessionState, choice: number | null): RoutingResult {
  const reasonOptions = ['Rent arrears', 'Eviction notice', 'Mortgage arrears', 'Family/friends notice', 'Financial difficulties', 'Prefer not to say'];
  const prevReason = choice ? reasonOptions[choice - 1] : null;

  return {
    ...phrase('B7C_PREVENTION_URGENCY', session.isSupporter),
    stateUpdates: { currentGate: 'B7C_PREVENTION_URGENCY', preventionReason: prevReason }
  };
}

export function handleB7CPreventionUrgency(session: SessionState, choice: number | null): RoutingResult {
  const urgencyOptions = ['Now/soon', 'Months away', 'Not sure'];
  const urgency = choice ? urgencyOptions[choice - 1] : null;

  return {
    ...phrase('B7D_1_PREVENTION_CHILDREN_DEPENDENTS', session.isSupporter),
    stateUpdates: { currentGate: 'B7D_1_PREVENTION_CHILDREN_DEPENDENTS', preventionUrgency: urgency }
  };
}

export function handleB7D1PreventionChildrenDependents(session: SessionState, choice: number | null): RoutingResult {
  const prevChildrenOptions = ['Yes', 'No', 'Prefer not to say'];
  const prevChildren = choice ? prevChildrenOptions[choice - 1] : null;

  return {
    ...phrase('B7D_2_PREVENTION_EMPLOYMENT_INCOME', session.isSupporter),
    stateUpdates: { currentGate: 'B7D_2_PREVENTION_EMPLOYMENT_INCOME', preventionChildren: prevChildren }
  };
}

export function handleB7D2PreventionEmploymentIncome(session: SessionState, choice: number | null): RoutingResult {
  const empOptions = ['Employed', 'Unemployed', 'Benefits', 'Self-employed', 'Not working', 'Prefer not to say'];
  const emp = choice ? empOptions[choice - 1] : null;

  return {
    ...phrase('B7D_3_PREVENTION_PRIOR_SUPPORT', session.isSupporter),
    stateUpdates: { currentGate: 'B7D_3_PREVENTION_PRIOR_SUPPORT', preventionEmployment: emp }
  };
}

export function handleB7D3PreventionPriorSupport(session: SessionState, choice: number | null): RoutingResult {
  const priorOptions = ['Yes spoken to someone', 'No not yet', 'Not sure who'];
  const prior = choice ? priorOptions[choice - 1] : null;

  return {
    ...phrase('B7D_4_PREVENTION_SAFEGUARDING_SIGNALS', session.isSupporter),
    stateUpdates: { currentGate: 'B7D_4_PREVENTION_SAFEGUARDING_SIGNALS', preventionPriorSupport: prior }
  };
}

// Note: B7D_4_PREVENTION_SAFEGUARDING_SIGNALS and B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP
// depend on buildTerminalServices which is a complex function with many dependencies.
// These handlers need the terminal building logic to be extracted to a shared module first.
// For now, they include the escalation logic but use a placeholder for terminal building.

export function handleB7D4PreventionSafeguardingSignals(
  session: SessionState,
  choice: number | null,
  buildTerminalServices: (session: SessionState) => string
): RoutingResult {
  const sigOptions = ['Yes something else', 'No just housing', 'Prefer not to say'];
  const sig = choice ? sigOptions[choice - 1] : null;

  if (choice === 1) {
    // Something else -> follow up
    return {
      ...phrase('B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP', session.isSupporter),
      stateUpdates: { currentGate: 'B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP', preventionSafeguardingSignals: sig }
    };
  }

  // Check escalation triggers
  const isUrgent = session.preventionUrgency === 'Now/soon';
  const hasChildren = session.preventionChildren === 'Yes';
  const isEviction = session.preventionReason?.includes('Eviction');

  if (isUrgent && isEviction) {
    const legal = getPhrase('ESCALATION_LEVEL_2_LEGAL_EMERGENCY', session.isSupporter);
    return {
      text: legal?.text || '',
      stateUpdates: { currentGate: 'SESSION_END', escalationLevel: 2, timestampEnd: new Date().toISOString() },
      sessionEnded: true
    };
  }

  if (isUrgent && hasChildren) {
    const childRisk = getPhrase('ESCALATION_LEVEL_2_CHILDREN_RISK', session.isSupporter);
    return {
      text: childRisk?.text || '',
      stateUpdates: { currentGate: 'SESSION_END', escalationLevel: 2, timestampEnd: new Date().toISOString() },
      sessionEnded: true
    };
  }

  // Normal terminal
  const services = buildTerminalServices(session);
  const additionalNeeds = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
  return {
    text: services + '\n' + additionalNeeds?.text,
    options: additionalNeeds?.options,
    stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', preventionSafeguardingSignals: sig },
    sessionEnded: false
  };
}

export function handleB7D4APreventionSafeguardingFollowUp(
  session: SessionState,
  choice: number | null,
  buildTerminalServices: (session: SessionState) => string
): RoutingResult {
  const followupOptions = ['Domestic abuse', 'Health crisis', 'Substance use', 'Child safety', 'Something else', 'Prefer not to say'];
  const followup = choice ? followupOptions[choice - 1] : null;

  switch (choice) {
    case 1: // Domestic abuse -> DV routing
      return phrase('DV_GENDER_ASK', session.isSupporter);
    case 2: // Health crisis
      const health = getPhrase('ESCALATION_LEVEL_2_HEALTH_CRISIS', session.isSupporter);
      return {
        text: health?.text || '',
        stateUpdates: { currentGate: 'SESSION_END', safeguardingType: 'HEALTH_CRISIS', timestampEnd: new Date().toISOString() },
        sessionEnded: true
      };
    case 4: // Child safety
      return safeguardingExit('CHILD_AT_RISK_EXIT', session.isSupporter, 'CHILD_AT_RISK');
    default: // Continue to terminal
      const services = buildTerminalServices(session);
      const additionalNeeds = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
      return {
        text: services + '\n' + additionalNeeds?.text,
        options: additionalNeeds?.options,
        stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS' },
        sessionEnded: false
      };
  }
}
