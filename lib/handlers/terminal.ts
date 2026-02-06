/**
 * Terminal and escalation handlers
 *
 * Handles terminal and escalation gates:
 * - TERMINAL_ADDITIONAL_NEEDS
 * - ESCALATION_LEVEL_1
 * - ESCALATION_LEVEL_2
 *
 * These handlers manage the end of conversation flow,
 * additional needs selection, and escalation pathways.
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

export function handleTerminalAdditionalNeeds(session: SessionState, choice: number | null): RoutingResult {
  if (choice === 1 && session.needCount < 3) {
    // Another need
    return {
      ...phrase('B5_MAIN_SUPPORT_NEED', session.isSupporter),
      stateUpdates: { currentGate: 'B5_MAIN_SUPPORT_NEED' }
    };
  } else {
    // Done
    const goodbye = getPhrase('TERMINAL_GOODBYE', session.isSupporter);
    return {
      text: goodbye?.text || 'Take care.',
      stateUpdates: { currentGate: 'SESSION_END', timestampEnd: new Date().toISOString() },
      sessionEnded: true
    };
  }
}

export function handleEscalationLevel1(
  session: SessionState,
  choice: number | null,
  buildTerminalServices: (session: SessionState) => string,
  restartSession: () => RoutingResult
): RoutingResult {
  switch (choice) {
    case 1: // Explain differently -> retry current
      return phrase(session.currentGate, session.isSupporter);
    case 2: // Skip
      // Would need to track "next gate" - for now go to terminal
      const services = buildTerminalServices(session);
      const additionalNeeds = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
      return {
        text: services + '\n' + additionalNeeds?.text,
        options: additionalNeeds?.options,
        stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', skipCount: session.skipCount + 1 },
        sessionEnded: false
      };
    case 3: // Restart
      return restartSession();
    default:
      return phrase('ESCALATION_LEVEL_1', session.isSupporter);
  }
}

export function handleEscalationLevel2(
  session: SessionState,
  choice: number | null,
  buildTerminalServices: (session: SessionState) => string
): RoutingResult {
  switch (choice) {
    case 1: // Services with what we have
      const services = buildTerminalServices(session);
      const additionalNeeds = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
      return {
        text: services + '\n' + additionalNeeds?.text,
        options: additionalNeeds?.options,
        stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS' },
        sessionEnded: false
      };
    case 2: // Phone number
      const exit = getPhrase('ESCALATION_LEVEL_3_EXIT', session.isSupporter);
      return {
        text: exit?.text || '',
        stateUpdates: { currentGate: 'SESSION_END', escalationLevel: 3, timestampEnd: new Date().toISOString() },
        sessionEnded: true
      };
    case 3: // Continue
      return phrase(session.currentGate, session.isSupporter);
    default:
      return phrase('ESCALATION_LEVEL_2', session.isSupporter);
  }
}
