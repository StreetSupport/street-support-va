/**
 * Crisis routing handlers
 *
 * Handles safeguarding-critical gates:
 * - GATE0_CRISIS_DANGER (entry point)
 * - CRISIS_UNDER16_LOCATION
 * - CRISIS_FIRE_FLOOD_LOCATION
 * - DV_GENDER_ASK, DV_CHILDREN_ASK
 * - SA_GENDER_ASK
 *
 * These handlers route vulnerable users to appropriate exits.
 * Changes require safeguarding test coverage.
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

// Children's Services contact info by Local Authority
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

// Council Housing Options contact info by Local Authority
const councilHousingData: Record<string, { name: string; phone: string; outOfHours?: string; website: string }> = {
  wolverhampton: {
    name: "Wolverhampton Council Housing Options",
    phone: "01902 556789",
    outOfHours: "01902 552999",
    website: "https://www.wolverhampton.gov.uk/housing/homeless"
  },
  birmingham: {
    name: "Birmingham Council Housing Options",
    phone: "0121 303 7410",
    website: "https://www.birmingham.gov.uk/info/20169/homelessness"
  },
  coventry: {
    name: "Coventry Council Housing Options",
    phone: "024 7683 3333",
    website: "https://www.coventry.gov.uk/housing-options"
  },
  dudley: {
    name: "Dudley Council Housing Options",
    phone: "0300 555 8283",
    website: "https://www.dudley.gov.uk/resident/housing/"
  },
  sandwell: {
    name: "Sandwell Council Housing Options",
    phone: "0121 368 1166",
    website: "https://www.sandwell.gov.uk/housing"
  },
  solihull: {
    name: "Solihull Council Housing Options",
    phone: "0121 704 8000",
    website: "https://www.solihull.gov.uk/housing"
  },
  walsall: {
    name: "Walsall Council Housing Options",
    phone: "0300 555 8085",
    website: "https://go.walsall.gov.uk/housing"
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

function buildFireFloodExit(session: SessionState): RoutingResult {
  const isSupporter = session.isSupporter;
  const la = session.localAuthority?.toLowerCase().replace(/\s+/g, '') || '';
  const councilHousing = councilHousingData[la];

  const they = isSupporter ? 'they' : 'you';
  const their = isSupporter ? 'their' : 'your';
  const them = isSupporter ? 'them' : 'you';
  const theyre = isSupporter ? "they're" : "you're";

  let text = '';

  text += `I'm really sorry ${theyre} dealing with this. Losing ${their} home to fire or flood is traumatic, and ${they} deserve support right now.\n\n`;
  text += `The council has a legal duty to help ${them} find emergency accommodation. Here's what to do:\n\n`;

  if (councilHousing) {
    text += `EMERGENCY HOUSING\n`;
    text += `${councilHousing.name}\n`;
    text += `${councilHousing.phone}`;
    if (councilHousing.outOfHours) {
      text += ` (out of hours: ${councilHousing.outOfHours})`;
    }
    text += `\n`;
    text += `${councilHousing.website}\n\n`;
    text += `Tell them ${theyre} homeless due to fire or flood. This is a priority need - they must help ${them} today.\n\n`;
  } else {
    text += `EMERGENCY HOUSING\n`;
    text += `Contact ${their} local council immediately\n`;
    text += `https://www.gov.uk/find-local-council\n\n`;
    text += `Tell them ${theyre} homeless due to fire or flood. This is a priority need - they must help ${them} today.\n\n`;
  }

  text += `ADDITIONAL SUPPORT\n`;
  text += `Shelter Emergency Helpline\n`;
  text += `0808 800 4444 (free, 8am-8pm weekdays, 9am-5pm weekends)\n`;
  text += `https://www.shelter.org.uk\n`;
  text += `They can help if ${they} have any trouble getting the council to help.\n\n`;

  text += `---\n`;
  text += `If ${they} need help with anything else, I'm here.`;

  return {
    text,
    stateUpdates: {
      currentGate: 'SESSION_END',
      safeguardingTriggered: true,
      safeguardingType: 'FIRE_FLOOD',
      timestampEnd: new Date().toISOString(),
    },
    sessionEnded: true,
  };
}

function buildSelfHarmExit(session: SessionState): RoutingResult {
  const isSupporter = session.isSupporter;
  const they = isSupporter ? 'they' : 'you';
  const their = isSupporter ? 'their' : 'your';
  const them = isSupporter ? 'them' : 'you';
  const theyre = isSupporter ? "they're" : "you're";

  let text = '';

  text += `I'm really glad ${they} reached out. ${isSupporter ? "It's clear you" : "You"} care about getting support, and that matters.\n\n`;
  text += `${isSupporter ? 'Their' : 'Your'} feelings are valid, and there are people who want to listen without judgement.\n\n`;

  text += `SOMEONE TO TALK TO\n`;
  text += `Samaritans\n`;
  text += `116 123 (free, 24/7)\n`;
  text += `https://www.samaritans.org\n`;
  text += `${isSupporter ? 'They can call or email jo@samaritans.org any time' : 'You can call or email jo@samaritans.org any time'}\n\n`;

  text += `NHS MENTAL HEALTH SUPPORT\n`;
  text += `NHS 111\n`;
  text += `111 (free, 24/7)\n`;
  text += `https://www.nhs.uk/mental-health/\n`;
  text += `For urgent mental health support and local crisis services\n\n`;

  text += `MIND INFOLINE\n`;
  text += `Mind\n`;
  text += `0300 123 3393\n`;
  text += `https://www.mind.org.uk/information-support/helplines/\n`;
  text += `Information and support for mental health\n\n`;

  text += `---\n`;
  text += `Please take care. I'll be here if ${they} need help finding other services later.`;

  return {
    text,
    stateUpdates: {
      currentGate: 'SESSION_END',
      safeguardingTriggered: true,
      safeguardingType: 'SELF_HARM',
      timestampEnd: new Date().toISOString(),
    },
    sessionEnded: true,
  };
}

// ============================================================================
// DV/SA routing helpers
// ============================================================================

function getDVExitKey(gender: string | null, hasChildren: boolean | null): string {
  const g = gender?.toLowerCase() || 'other';
  const c = hasChildren ? 'YES' : 'NO';

  if (g === 'female') return `DV_FEMALE_CHILDREN_${c}`;
  if (g === 'male') return `DV_MALE_CHILDREN_${c}`;
  return `DV_LGBTQ_CHILDREN_${c}`;
}

function getSAExitKey(gender: string | null): string {
  const g = gender?.toLowerCase() || 'other';

  if (g === 'female') return 'SA_FEMALE_16PLUS';
  if (g === 'male') return 'SA_MALE_16PLUS';
  return 'SA_LGBTQ_OR_NONBINARY';
}

// ============================================================================
// Gate handlers
// ============================================================================

export function handleCrisisDanger(session: SessionState, choice: number | null): RoutingResult {
  switch (choice) {
    case 1: // Immediate danger
      return safeguardingExit('IMMEDIATE_PHYSICAL_DANGER_EXIT', session.isSupporter, 'IMMEDIATE_DANGER');
    case 2: // Domestic abuse -> ask gender
      return phrase('DV_GENDER_ASK', session.isSupporter);
    case 3: // Sexual violence -> ask gender
      return phrase('SA_GENDER_ASK', session.isSupporter);
    case 4: // Self-harm
      return buildSelfHarmExit(session);
    case 5: // Under 16 -> ask location first
      return {
        ...phrase('CRISIS_UNDER16_LOCATION', session.isSupporter),
        stateUpdates: { currentGate: 'CRISIS_UNDER16_LOCATION' }
      };
    case 6: // Fire/flood -> ask location first
      return {
        ...phrase('CRISIS_FIRE_FLOOD_LOCATION', session.isSupporter),
        stateUpdates: { currentGate: 'CRISIS_FIRE_FLOOD_LOCATION' }
      };
    case 7: // None apply
      return phrase('GATE1_INTENT', session.isSupporter);
    default:
      return phrase('GATE0_CRISIS_DANGER', session.isSupporter);
  }
}

export function handleCrisisUnder16Location(session: SessionState, choice: number | null): RoutingResult {
  // Options: 1=Wolverhampton, 2=Birmingham, 3=Coventry, 4=Dudley, 5=Sandwell, 6=Solihull, 7=Walsall, 8=Somewhere else, 9=Prefer not to say
  const under16LAs = ['Wolverhampton', 'Birmingham', 'Coventry', 'Dudley', 'Sandwell', 'Solihull', 'Walsall'];
  if (choice && choice >= 1 && choice <= 7) {
    const la = under16LAs[choice - 1];
    return buildUnder16Exit({ ...session, localAuthority: la });
  } else {
    // Somewhere else or prefer not to say - show generic
    return buildUnder16Exit(session);
  }
}

export function handleCrisisFireFloodLocation(session: SessionState, choice: number | null): RoutingResult {
  // Same options as above
  const fireFloodLAs = ['Wolverhampton', 'Birmingham', 'Coventry', 'Dudley', 'Sandwell', 'Solihull', 'Walsall'];
  if (choice && choice >= 1 && choice <= 7) {
    const la = fireFloodLAs[choice - 1];
    return buildFireFloodExit({ ...session, localAuthority: la });
  } else {
    // Somewhere else or prefer not to say - show generic
    return buildFireFloodExit(session);
  }
}

export function handleDVGenderAsk(session: SessionState, choice: number | null): RoutingResult {
  const dvGenders = ['Female', 'Male', 'Non-binary or other', 'Prefer not to say'];
  const dvGender = choice ? dvGenders[choice - 1] : null;
  return {
    ...phrase('DV_CHILDREN_ASK', session.isSupporter),
    stateUpdates: { currentGate: 'DV_CHILDREN_ASK', dvGender }
  };
}

export function handleDVChildrenAsk(session: SessionState, choice: number | null): RoutingResult {
  const dvChildren = choice === 1;
  const dvExitKey = getDVExitKey(session.dvGender, dvChildren);
  return safeguardingExit(dvExitKey, session.isSupporter, 'DOMESTIC_ABUSE');
}

export function handleSAGenderAsk(session: SessionState, choice: number | null): RoutingResult {
  const saGenders = ['Female', 'Male', 'Non-binary or other', 'Prefer not to say'];
  const saGender = choice ? saGenders[choice - 1] : null;
  const saExitKey = getSAExitKey(saGender);
  return safeguardingExit(saExitKey, session.isSupporter, 'SEXUAL_VIOLENCE');
}
