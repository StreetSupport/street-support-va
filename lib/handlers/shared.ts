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
import laContacts from '../data/la-contacts.json';

export function phrase(key: string, isSupporter: boolean): RoutingResult {
  const p = getPhrase(key, isSupporter);
  return {
    text: p?.text || `[Missing phrase: ${key}]`,
    options: p?.options,
    stateUpdates: { currentGate: key as GateType },
    sessionEnded: false,
    responseType: p?.responseType,
  };
}

export function safeguardingExit(key: string, isSupporter: boolean, type: string): RoutingResult {
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

// Children's Services contact info by Local Authority
export const childrenServicesData = Object.fromEntries(
  Object.entries(laContacts).map(([la, data]) => [la, data.childrenServices])
) as Record<string, { name: string; phone: string; outOfHours?: string; website: string }>;

export function buildUnder16Exit(session: SessionState): RoutingResult {
  const isSupporter = session.isSupporter;
  const la = session.localAuthority?.toLowerCase().replace(/\s+/g, '') || '';
  const childServices = childrenServicesData[la];

  let text = '';

  if (isSupporter) {
    text += `Thank you for reaching out. Because they are under 16, there are specialist services that can help keep them safe. It's really good that you're looking for support for them.\n\n`;
  } else {
    text += `Thank you for reaching out. Because you are under 16, there are specialist services that can help keep you safe. It takes courage to ask for help, and you've done the right thing.\n\n`;
  }

  // Local Children's Services (if we have LA info)
  if (childServices) {
    text += `CHILDREN'S SERVICES\n`;
    text += `${childServices.name}\n`;
    if (childServices.outOfHours) {
      text += `${childServices.phone} (out of hours: ${childServices.outOfHours})\n`;
    } else {
      text += `${childServices.phone}\n`;
    }
    text += `${childServices.website}\n`;
    text += `They can talk through what's happening and help work out the best support\n\n`;
  } else {
    text += `CHILDREN'S SERVICES\n`;
    text += `Local council Children's Services\n`;
    text += `https://www.gov.uk/find-local-council\n`;
    text += `They can talk through what's happening and help work out the best support\n\n`;
  }

  // Childline
  text += `SPECIALIST HELPLINE\n`;
  text += `Childline\n`;
  text += `0800 1111 (free, confidential, 24/7)\n`;
  text += `https://www.childline.org.uk\n`;
  text += `${isSupporter ? 'A free helpline for young people to call or chat online about anything' : 'A free helpline where you can call or chat online about anything'}\n\n`;

  if (isSupporter) {
    text += `SPECIALIST HELPLINE\n`;
    text += `NSPCC Helpline (for adults)\n`;
    text += `0808 800 5000 (free, 24/7)\n`;
    text += `https://www.nspcc.org.uk/keeping-children-safe/reporting-abuse/\n`;
    text += `For adults who are worried about a child\n\n`;
  }

  // Warm sign-off with separator
  text += `---\n`;
  text += `Please reach out when you feel ready. I'll be here if you need help finding other services later.\n\n`;
  text += `If ${isSupporter ? 'they are' : 'you are'} in immediate danger, call 999.`;

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
