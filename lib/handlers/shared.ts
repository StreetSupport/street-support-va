/**
 * Shared handler helpers
 *
 * Contains functions used by multiple handler files:
 * - phrase() — used by all 7 handler files
 * - safeguardingExit() — used by crisis.ts, prevention.ts
 * - buildUnder16Exit() — used by crisis.ts, profiling.ts, sectionC.ts
 * - childrenServicesData — used by crisis.ts, profiling.ts, sectionC.ts
 */

import { getPhrase } from '../phrasebank';
import type { SessionState, RoutingResult, GateType } from '../types';
import endpointsData from '../data/housing-pathway-endpoints.json';

export function phrase(key: string, audience: 'SELF' | 'SUPPORTER' | 'PROFESSIONAL' | null | boolean): RoutingResult {
  const p = getPhrase(key, audience);
  return {
    text: p?.text || `[Missing phrase: ${key}]`,
    options: p?.options,
    stateUpdates: { currentGate: key as GateType },
    sessionEnded: false,
    responseType: p?.responseType,
  };
}

export function safeguardingExit(key: string, audience: 'SELF' | 'SUPPORTER' | 'PROFESSIONAL' | null | boolean, type: string): RoutingResult {
  const p = getPhrase(key, audience);
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

// Children's Services contact info by Local Authority
export const childrenServicesData = Object.fromEntries(
  Object.entries(endpointsData)
    .filter(([key]) => key !== '_metadata')
    .map(([la, data]) => [la, (data as { childrenServices: { name: string; phone: string; phoneOOH?: string; website: string } }).childrenServices])
) as Record<string, { name: string; phone: string; phoneOOH?: string; website: string }>;

export function buildUnder16Exit(session: SessionState): RoutingResult {
  const la = session.localAuthority?.toLowerCase().replace(/\s+/g, '') || '';
  const childServices = childrenServicesData[la];

  // Local Children's Services — LA must be known by this point.
  // All call sites should route through CRISIS_UNDER16_LOCATION first
  // if LA is not yet set, so this is never reached without a valid LA.
  // If it IS reached without one, log the error and recover by asking for area.
  if (!childServices) {
    console.error(`[VA] buildUnder16Exit called without valid LA (got: ${JSON.stringify(session.localAuthority)}, sessionId: ${session.sessionId}). Recovering to CRISIS_UNDER16_LOCATION.`);
    const locationPhrase = getPhrase('CRISIS_UNDER16_LOCATION', session.userType);
    return {
      text: locationPhrase?.text || '',
      options: locationPhrase?.options,
      stateUpdates: {
        currentGate: 'CRISIS_UNDER16_LOCATION' as GateType,
        safeguardingTriggered: true,
        safeguardingType: 'UNDER_16',
      },
    };
  }

  let text = '';

  // Opener
  text += getPhrase('UNDER16_EXIT_OPENER', session.userType)?.text || '';

  // Local Children's Services — data-driven, stays inline
  text += `CHILDREN'S SERVICES\n`;
  text += `${childServices.name}\n`;
  if (childServices.phoneOOH) {
    text += `${childServices.phone} (out of hours: ${childServices.phoneOOH})\n`;
  } else {
    text += `${childServices.phone}\n`;
  }
  text += `${childServices.website}\n`;

  // Next-steps reinforcement
  text += getPhrase('UNDER16_EXIT_NEXT_STEPS', session.userType)?.text || '';

  // Childline
  text += getPhrase('UNDER16_EXIT_CHILDLINE_FOR_YOUNG_PERSON', session.userType)?.text || '';

  // NSPCC — supporter-only entry. Selector returns null for SELF users
  // (no base entry exists), so this contributes nothing for SELF.
  text += getPhrase('UNDER16_EXIT_NSPCC_FOR_ADULT', session.userType)?.text || '';

  // Warm sign-off
  text += getPhrase('UNDER16_EXIT_SIGN_OFF', session.userType)?.text || '';

  // 999 line
  text += getPhrase('UNDER16_EXIT_999', session.userType)?.text || '';

  return {
    text,
    stateUpdates: {
      currentGate: 'SESSION_END',
      safeguardingTriggered: true,
      safeguardingType: 'UNDER_16',
      timestampEnd: new Date().toISOString(),
    },
    sessionEnded: true,
  };
}
