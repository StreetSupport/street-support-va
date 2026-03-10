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
import type { SessionState, RoutingResult, TerminalResult } from '../types';
import { phrase } from './shared';

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
  buildTerminalServices: (session: SessionState) => TerminalResult,
  restartSession: () => RoutingResult
): RoutingResult {
  switch (choice) {
    case 1: // Explain differently -> retry current
      return phrase(session.currentGate, session.isSupporter);
    case 2: // Skip
      // Would need to track "next gate" - for now go to terminal
      const result = buildTerminalServices(session);
      const additionalNeeds = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
      return {
        text: result.text + '\n' + additionalNeeds?.text,
        options: additionalNeeds?.options,
        stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', skipCount: session.skipCount + 1, ...(result.terminalOutcome ? { terminalOutcome: result.terminalOutcome } : {}) },
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
  buildTerminalServices: (session: SessionState) => TerminalResult
): RoutingResult {
  switch (choice) {
    case 1: // Services with what we have
      const result2 = buildTerminalServices(session);
      const additionalNeeds = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
      return {
        text: result2.text + '\n' + additionalNeeds?.text,
        options: additionalNeeds?.options,
        stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', ...(result2.terminalOutcome ? { terminalOutcome: result2.terminalOutcome } : {}) },
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
