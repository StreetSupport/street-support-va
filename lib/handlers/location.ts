/**
 * Location flow handlers
 *
 * Handles location detection gates:
 * - LOCATION_CONSENT
 * - LOCATION_POSTCODE
 * - LOCATION_RESULT
 * - LOCATION_CONFIRM
 * - LOCATION_OUTSIDE_WMCA
 *
 * These handlers manage geolocation, postcode lookup, and LA confirmation.
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

export function handleLocationConsent(session: SessionState, choice: number | null): RoutingResult {
  // Choice 1: Share location (widget will handle geolocation)
  // Choice 2: Enter postcode
  // Choice 3: Don't want to share
  if (choice === 1) {
    // Widget will request geolocation and send back result
    // This is handled by the widget, not here
    // The widget will call processInput with location data
    return {
      text: '',
      stateUpdates: { currentGate: 'LOCATION_RESULT' },
      responseType: 'request_geolocation'
    };
  } else if (choice === 2) {
    return {
      ...phrase('LOCATION_POSTCODE_REQUEST', session.isSupporter),
      stateUpdates: { currentGate: 'LOCATION_POSTCODE' },
      responseType: 'postcode_input'
    };
  } else {
    // User doesn't want to share - fall back to manual selection
    return {
      ...phrase('B1_LOCAL_AUTHORITY', session.isSupporter),
      stateUpdates: { currentGate: 'B1_LOCAL_AUTHORITY', locationMethod: 'MANUAL' }
    };
  }
}

export function handleLocationPostcode(session: SessionState, choice: number | null): RoutingResult {
  // This is handled specially - widget sends postcode to /api/location
  // and then calls processInput with the result
  // If we get here with a choice, it's the postcode retry/fallback menu
  if (choice === 1) {
    // Try again
    return {
      ...phrase('LOCATION_POSTCODE_REQUEST', session.isSupporter),
      stateUpdates: { currentGate: 'LOCATION_POSTCODE' },
      responseType: 'postcode_input'
    };
  } else {
    // Select from list
    return {
      ...phrase('B1_LOCAL_AUTHORITY', session.isSupporter),
      stateUpdates: { currentGate: 'B1_LOCAL_AUTHORITY', locationMethod: 'MANUAL' }
    };
  }
}

export function handleLocationResult(session: SessionState, choice: number | null): RoutingResult {
  // Widget sends location data here after geo/postcode lookup
  // This case should be handled by processLocationInput, not processInput
  // Fallback to manual selection
  return {
    ...phrase('B1_LOCAL_AUTHORITY', session.isSupporter),
    stateUpdates: { currentGate: 'B1_LOCAL_AUTHORITY', locationMethod: 'MANUAL' }
  };
}

export function handleLocationConfirm(session: SessionState, choice: number | null): RoutingResult {
  // User confirms detected LA or wants to select different area
  if (choice === 1) {
    // Confirmed - proceed to B2_WHO_FOR
    return {
      ...phrase('B2_WHO_FOR', session.isSupporter),
      stateUpdates: { currentGate: 'B2_WHO_FOR' }
    };
  } else {
    // Want different area - show manual selection, clear location data
    return {
      ...phrase('B1_LOCAL_AUTHORITY', session.isSupporter),
      stateUpdates: {
        currentGate: 'B1_LOCAL_AUTHORITY',
        locationMethod: 'MANUAL',
        localAuthority: null,
        latitude: null,
        longitude: null
      }
    };
  }
}

export function handleLocationOutsideWMCA(session: SessionState, choice: number | null): RoutingResult {
  // User is outside WMCA area - they chose whether to continue or select different area
  if (choice === 1) {
    // Continue anyway with detected LA
    return {
      ...phrase('B2_WHO_FOR', session.isSupporter),
      stateUpdates: { currentGate: 'B2_WHO_FOR' }
    };
  } else {
    // Let them select different area - clear location data
    return {
      ...phrase('B1_LOCAL_AUTHORITY', session.isSupporter),
      stateUpdates: {
        currentGate: 'B1_LOCAL_AUTHORITY',
        locationMethod: 'MANUAL',
        localAuthority: null,
        latitude: null,
        longitude: null
      }
    };
  }
}
