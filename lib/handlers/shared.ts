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
import type { SessionState, RoutingResult, GateType } from '../stateMachine';

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
export const childrenServicesData: Record<string, { name: string; phone: string; outOfHours?: string; website: string }> = {
  wolverhampton: {
    name: "Wolverhampton Children's Services",
    phone: "01902 555392",
    outOfHours: "01902 552999",
    website: "https://www.wolverhampton.gov.uk/children-and-young-people"
  },
  birmingham: {
    name: "Birmingham Children's Trust",
    phone: "0121 303 1888",
    outOfHours: "0121 675 4806",
    website: "https://www.birminghamchildrenstrust.co.uk"
  },
  coventry: {
    name: "Coventry Children's Services",
    phone: "024 7678 8555",
    outOfHours: "024 7683 2222",
    website: "https://www.coventry.gov.uk/childrens-services"
  },
  dudley: {
    name: "Dudley Children's Services",
    phone: "0300 555 0050",
    outOfHours: "0300 555 8574",
    website: "https://www.dudley.gov.uk/resident/care-health/children-and-family-care/"
  },
  sandwell: {
    name: "Sandwell Children's Trust",
    phone: "0121 569 3100",
    outOfHours: "0121 569 2355",
    website: "https://www.sandwellchildrenstrust.org"
  },
  solihull: {
    name: "Solihull Children's Services",
    phone: "0121 788 4300",
    outOfHours: "0121 605 6060",
    website: "https://www.solihull.gov.uk/children-and-family-support"
  },
  walsall: {
    name: "Walsall Children's Services",
    phone: "0300 555 2866",
    outOfHours: "0300 555 2922",
    website: "https://go.walsall.gov.uk/children-and-young-people"
  }
};

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
