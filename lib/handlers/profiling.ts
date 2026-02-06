/**
 * Core profiling handlers
 *
 * Handles profiling gates:
 * - B1_LOCAL_AUTHORITY
 * - B2_WHO_FOR
 * - B3_AGE_CATEGORY
 * - B4_GENDER
 * - B5_MAIN_SUPPORT_NEED
 * - B6_HOMELESSNESS_STATUS
 * - B7_HOUSED_SITUATION
 * - B7_HOMELESS_SLEEPING_SITUATION
 * - B7A_PREVENTION_GATE
 *
 * These handlers collect user profile information for service matching.
 * B3_AGE_CATEGORY includes safeguarding routing for under-16s.
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

// Children's Services contact info by Local Authority (for under-16 exit)
const childrenServicesData: Record<string, { name: string; phone: string; outOfHours?: string; website: string }> = {
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

// ============================================================================
// Exit builders
// ============================================================================

function buildUnder16Exit(session: SessionState): RoutingResult {
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

// ============================================================================
// Gate handlers
// ============================================================================

export function handleB1LocalAuthority(session: SessionState, choice: number | null): RoutingResult {
  const laOptions = ['Wolverhampton', 'Coventry', 'Birmingham', 'Walsall', 'Solihull', 'Dudley', 'Sandwell', 'Other'];
  const la = choice ? laOptions[choice - 1] : null;

  if (la === 'Other') {
    const notice = getPhrase('WMCA_ONLY_SCOPE_NOTICE', session.isSupporter);
    return {
      text: notice?.text || '',
      stateUpdates: { currentGate: 'SESSION_END', localAuthority: 'Other', timestampEnd: new Date().toISOString() },
      sessionEnded: true
    };
  }

  return {
    ...phrase('B2_WHO_FOR', session.isSupporter),
    stateUpdates: { currentGate: 'B2_WHO_FOR', localAuthority: la }
  };
}

export function handleB2WhoFor(session: SessionState, choice: number | null): RoutingResult {
  const userTypes: Record<number, 'SELF' | 'SUPPORTER' | 'PROFESSIONAL'> = {
    1: 'SELF',
    2: 'SUPPORTER',
    3: 'PROFESSIONAL',
    4: 'SELF'
  };
  const userType = userTypes[choice || 1];
  const isSupporter = userType === 'SUPPORTER' || userType === 'PROFESSIONAL';

  // Go straight to support need - age/gender asked later only if needed
  return {
    ...phrase('B5_MAIN_SUPPORT_NEED', isSupporter),
    stateUpdates: { currentGate: 'B5_MAIN_SUPPORT_NEED', userType, isSupporter }
  };
}

export function handleB3AgeCategory(session: SessionState, choice: number | null): RoutingResult {
  const ageOptions = ['Under 16', '16-17', '18-24', '25 or over'];
  const age = choice ? ageOptions[choice - 1] : null;

  // Under 16 safeguarding exit
  if (choice === 1) {
    return buildUnder16Exit(session);
  }

  // Youth flag for 16-17
  const youthFlag = choice === 2;

  // Full route asks gender, quick route skips to B5
  if (session.routeType === 'FULL') {
    return {
      ...phrase('B4_GENDER', session.isSupporter),
      stateUpdates: { currentGate: 'B4_GENDER', ageCategory: age, youthServicesFlag: youthFlag }
    };
  } else {
    return {
      ...phrase('B5_MAIN_SUPPORT_NEED', session.isSupporter),
      stateUpdates: { currentGate: 'B5_MAIN_SUPPORT_NEED', ageCategory: age, youthServicesFlag: youthFlag }
    };
  }
}

export function handleB4Gender(session: SessionState, choice: number | null): RoutingResult {
  const genderOptions = ['Male', 'Female', 'Non-binary or other', 'Prefer not to say'];
  const gender = choice ? genderOptions[choice - 1] : null;

  return {
    ...phrase('B5_MAIN_SUPPORT_NEED', session.isSupporter),
    stateUpdates: { currentGate: 'B5_MAIN_SUPPORT_NEED', gender }
  };
}

export function handleB6HomelessnessStatus(session: SessionState, choice: number | null): RoutingResult {
  const homeless = choice === 1;

  if (homeless) {
    return {
      ...phrase('B7_HOMELESS_SLEEPING_SITUATION', session.isSupporter),
      stateUpdates: { currentGate: 'B7_HOMELESS_SLEEPING_SITUATION', homeless: true }
    };
  } else {
    return {
      ...phrase('B7_HOUSED_SITUATION', session.isSupporter),
      stateUpdates: { currentGate: 'B7_HOUSED_SITUATION', homeless: false }
    };
  }
}

export function handleB7HousedSituation(session: SessionState, choice: number | null): RoutingResult {
  const housedOptions = ['At home', 'Friends/family', 'Council temp', 'Other temp'];
  const housed = choice ? housedOptions[choice - 1] : null;

  // Friends/family or temp = actually homeless (sofa surfing)
  if (choice && choice >= 2) {
    return {
      ...phrase('B7_HOMELESS_SLEEPING_SITUATION', session.isSupporter),
      stateUpdates: { currentGate: 'B7_HOMELESS_SLEEPING_SITUATION', housedSituation: housed, homeless: true }
    };
  }

  // At home -> prevention gate
  return {
    ...phrase('B7A_PREVENTION_GATE', session.isSupporter),
    stateUpdates: { currentGate: 'B7A_PREVENTION_GATE', housedSituation: housed }
  };
}

// Note: B5_MAIN_SUPPORT_NEED, B7A_PREVENTION_GATE, and B7_HOMELESS_SLEEPING_SITUATION
// depend on buildTerminalServices and routeToNextProfileQuestion which are complex
// functions with many dependencies. These handlers will be added once the terminal
// building logic is extracted to a shared module.
