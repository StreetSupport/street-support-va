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

// Council contacts by Local Authority, for blocks shown inside results and exits.
type Contact = {
  name: string; phone: string; phoneOOH?: string; website: string;
  phoneOption?: string; phoneHours?: string; phoneOOHNote?: string; phoneNote?: string;
};

const housingOptionsData = Object.fromEntries(
  Object.entries(endpointsData)
    .filter(([key]) => key !== '_metadata')
    .map(([la, data]) => [la, (data as { housingOptions: Contact }).housingOptions])
) as Record<string, Contact>;

const childrenServicesFull = Object.fromEntries(
  Object.entries(endpointsData)
    .filter(([key]) => key !== '_metadata')
    .map(([la, data]) => [la, (data as { childrenServices: Contact }).childrenServices])
) as Record<string, Contact>;

// Everything the data holds about a number: menu option, hours, notes (such as
// Birmingham's adult-only out-of-hours line). A menu option is left out for
// Children's Services: the Managing Director decided on 26 November 2026 to
// leave Walsall's "option 2" out, so the number stays right if the menu changes.
function contactLines(c: Contact, withOption: boolean): string {
  const main = [c.phone, withOption ? c.phoneOption : undefined].filter(Boolean).join(', ');
  const lines = [c.name, c.phoneHours ? `${main} (${c.phoneHours})` : main];
  if (c.phoneNote) lines.push(c.phoneNote);
  if (c.phoneOOH) lines.push(`Out of hours: ${c.phoneOOH}${c.phoneOOHNote ? ` (${c.phoneOOHNote})` : ''}`);
  lines.push(c.website);
  return lines.join('\n');
}

function isSelf(session: SessionState): boolean {
  return !session.isSupporter && session.userType !== 'SUPPORTER' && session.userType !== 'PROFESSIONAL';
}

/**
 * The council's Children's Services, as the original phrasebank (v7.1) added
 * to every "children: yes" domestic abuse exit and the child-at-risk exit
 * (restored, Managing Director, 26 November 2026). Where the area isn't known
 * yet (the crisis question comes first), the way to find it.
 */
export function childrensServicesBlock(session: SessionState): string {
  const la = session.localAuthority?.toLowerCase().replace(/\s+/g, '') || '';
  const cs = childrenServicesFull[la];
  const whose = isSelf(session) ? 'your' : 'their';
  const body = cs
    ? contactLines(cs, false)
    : `Contact ${whose} local council and ask for Children's Services:\nhttps://www.gov.uk/find-local-council`;
  return `\n\nCHILDREN'S SERVICES\n${body}`;
}

/** The council's Housing Options team, or the way to find it. */
export function housingOptionsBlock(session: SessionState): string {
  const la = session.localAuthority?.toLowerCase().replace(/\s+/g, '') || '';
  const ho = housingOptionsData[la];
  const whose = isSelf(session) ? 'your' : 'their';
  return ho ? contactLines(ho, true) : `Find ${whose} local council: https://www.gov.uk/find-local-council`;
}

/** Heading for the Housing Options block, in the right voice. */
export function housingOptionsHeading(session: SessionState): string {
  return isSelf(session) ? "YOUR COUNCIL'S HOUSING OPTIONS TEAM" : "THE COUNCIL'S HOUSING OPTIONS TEAM";
}

/** Puts a block straight after an exit's opening paragraph. */
export function afterOpening(text: string, block: string): string {
  const i = text.indexOf('\n\n');
  return i < 0 ? text + block : text.slice(0, i) + block + text.slice(i);
}

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

  // NSPCC and warm sign-off — included for SELF and SUPPORTER, excluded for
  // PROFESSIONAL per Supporter and Professional Language Review v1.1 §1.4.
  // NSPCC adult helpline is for non-professionals worried about a child;
  // professionals call Children's Services directly. Warm sign-off is
  // inappropriate register for the professional context.
  // (For SELF, NSPCC has no base entry so the selector returns null —
  // contributes nothing — preserving prior behaviour.)
  if (session.userType !== 'PROFESSIONAL') {
    text += getPhrase('UNDER16_EXIT_NSPCC_FOR_ADULT', session.userType)?.text || '';
    text += getPhrase('UNDER16_EXIT_SIGN_OFF', session.userType)?.text || '';
  }

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
