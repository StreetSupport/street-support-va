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

import type { SessionState, RoutingResult } from '../types';
import { phrase, safeguardingExit, buildUnder16Exit } from './shared';
import { getPronouns } from '../utils/pronouns';

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
// Exit builders (local to crisis)
// ============================================================================

function buildFireFloodExit(session: SessionState): RoutingResult {
  const isSupporter = session.isSupporter;
  const la = session.localAuthority?.toLowerCase().replace(/\s+/g, '') || '';
  const councilHousing = councilHousingData[la];

  const { they, their, them, theyre } = getPronouns(isSupporter);

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
  const { they, their, them, theyre } = getPronouns(isSupporter);

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
