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
import endpointsData from '../data/housing-pathway-endpoints.json';
import safeguardingEndpoints from '../data/safeguarding-endpoints.json';

interface EndpointEntry {
  housingOptions: { name: string; phone: string; phoneOOH?: string; website: string };
}

const councilHousingData = Object.fromEntries(
  Object.entries(endpointsData)
    .filter(([key]) => key !== '_metadata')
    .map(([la, data]) => [la, (data as EndpointEntry).housingOptions])
) as Record<string, { name: string; phone: string; phoneOOH?: string; website: string }>;

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
    if (councilHousing.phoneOOH) {
      text += ` (out of hours: ${councilHousing.phoneOOH})`;
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
  const { they, their, theyre } = getPronouns(isSupporter);

  let text = '';

  text += `I'm really glad ${they} reached out. ${they.charAt(0).toUpperCase() + they.slice(1)} deserve support with this, and ${theyre} not alone.\n\n`;
  text += `${their.charAt(0).toUpperCase() + their.slice(1)} feelings are valid, and there are people who want to listen without judgement.\n\n`;

  text += `SOMEONE TO TALK TO\n`;
  text += `Samaritans\n`;
  text += `116 123 (free, 24/7)\n`;
  text += `https://www.samaritans.org\n`;
  text += `${they.charAt(0).toUpperCase() + they.slice(1)} can call or email jo@samaritans.org any time\n\n`;

  text += `NHS MENTAL HEALTH SUPPORT\n`;
  text += `NHS 111\n`;
  text += `111 (free, 24/7)\n`;
  text += `https://www.nhs.uk/mental-health/\n`;
  text += `For urgent mental health support and local crisis services\n\n`;

  text += `MIND INFOLINE\n`;
  text += `Mind\n`;
  text += `0300 123 3393 (Mon-Fri 9am-6pm)\n`;
  text += `https://www.mind.org.uk/information-support/helplines/\n`;
  text += `Information and support for mental health\n\n`;

  text += `---\n`;
  text += `Please take care. I'll be here if ${they} need help finding other services later.\n\n`;
  text += `If ${theyre} in immediate danger, call 999 or go to A&E.`;

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
// Local safeguarding info builders
// ============================================================================

function buildSARCInfo(session: SessionState): string {
  const age = session.ageCategory;
  const isYoung = age === 'Under 16' || age === '16-17';
  const sarc = isYoung
    ? safeguardingEndpoints.sarc.under_18
    : safeguardingEndpoints.sarc.adult;

  let text = '\n\nLOCAL SEXUAL ASSAULT REFERRAL CENTRE\n';
  text += `${sarc.name}\n`;
  text += `${sarc.phone} (${sarc.availability})\n`;
  text += `${sarc.url}\n`;
  text += sarc.referral_note;
  return text;
}

interface DVLocalOrg {
  name: string;
  phone?: string;
  phone_24hr?: string;
  phone_office?: string;
  availability: string;
  url: string;
  ooh_fallback?: string;
}

function buildLocalDVInfo(session: SessionState): string {
  const la = session.localAuthority?.toLowerCase().replace(/\s+/g, '') || '';
  if (!la) return '';

  const dvLocal = (safeguardingEndpoints.dv_local as unknown as Record<string, DVLocalOrg | DVLocalOrg[]>)[la];
  if (!dvLocal) return '';

  const orgs = Array.isArray(dvLocal) ? dvLocal : [dvLocal];
  let text = '\n\nLOCAL DOMESTIC ABUSE SUPPORT\n';

  for (let i = 0; i < orgs.length; i++) {
    if (i > 0) text += '\n';
    const org = orgs[i];
    text += `${org.name}\n`;
    if (org.phone_24hr) {
      text += `${org.phone_24hr} (24hr crisis line)`;
      if (org.phone_office) text += ` / ${org.phone_office} (office hours)`;
    } else if (org.phone) {
      text += `${org.phone}`;
    }
    text += ` — ${org.availability}\n`;
    text += `${org.url}\n`;
    if (org.ooh_fallback) {
      text += `${org.ooh_fallback}\n`;
    }
  }

  return text;
}

// ============================================================================
// Gate handlers
// ============================================================================

export function handleCrisisDanger(session: SessionState, choice: number | null): RoutingResult {
  switch (choice) {
    case 1: // Immediate danger
      return safeguardingExit('IMMEDIATE_PHYSICAL_DANGER_EXIT', session.userType, 'IMMEDIATE_DANGER');
    case 2: // Under 16 -> ask location first
      return {
        ...phrase('CRISIS_UNDER16_LOCATION', session.userType),
        stateUpdates: {
          currentGate: 'CRISIS_UNDER16_LOCATION',
          safeguardingTriggered: true,
          safeguardingType: 'UNDER_16',
        },
      };
    case 3: // Self-harm
      return buildSelfHarmExit(session);
    case 4: // Domestic abuse -> ask gender
      return phrase('DV_GENDER_ASK', session.userType);
    case 5: // Sexual violence -> ask gender
      return phrase('SA_GENDER_ASK', session.userType);
    case 6: // Fire/flood -> ask location first
      return {
        ...phrase('CRISIS_FIRE_FLOOD_LOCATION', session.isSupporter),
        stateUpdates: { currentGate: 'CRISIS_FIRE_FLOOD_LOCATION' }
      };
    case 7: // None apply — collect location before intent
      return phrase('LOCATION_CONSENT', session.isSupporter);
    default:
      return phrase('GATE0_CRISIS_DANGER', session.userType);
  }
}

export function handleCrisisUnder16Location(session: SessionState, choice: number | null): RoutingResult {
  // Options: 1=Wolverhampton, 2=Birmingham, 3=Coventry, 4=Dudley, 5=Sandwell, 6=Solihull, 7=Walsall, 8=Somewhere else
  const under16LAs = ['Wolverhampton', 'Birmingham', 'Coventry', 'Dudley', 'Sandwell', 'Solihull', 'Walsall'];
  if (choice && choice >= 1 && choice <= 7) {
    const la = under16LAs[choice - 1];
    return buildUnder16Exit({ ...session, localAuthority: la });
  }
  // Somewhere else — no LA to look up, so surface Childline directly
  const exit = phrase('CRISIS_UNDER16_SOMEWHERE_ELSE', session.userType);
  return {
    ...exit,
    stateUpdates: {
      currentGate: 'SESSION_END',
      safeguardingTriggered: true,
      safeguardingType: 'UNDER_16',
      timestampEnd: new Date().toISOString(),
    },
    sessionEnded: true,
  };
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
    ...phrase('DV_CHILDREN_ASK', session.userType),
    stateUpdates: { currentGate: 'DV_CHILDREN_ASK', dvGender }
  };
}

export function handleDVChildrenAsk(session: SessionState, choice: number | null): RoutingResult {
  const dvChildren = choice === 1;
  const dvExitKey = getDVExitKey(session.dvGender, dvChildren);
  const result = safeguardingExit(dvExitKey, session.userType, 'DOMESTIC_ABUSE');
  const localDV = buildLocalDVInfo(session);
  return { ...result, text: result.text + localDV };
}

export function handleSAGenderAsk(session: SessionState, choice: number | null): RoutingResult {
  const saGenders = ['Female', 'Male', 'Non-binary or other', 'Prefer not to say'];
  const saGender = choice ? saGenders[choice - 1] : null;
  const saExitKey = getSAExitKey(saGender);
  const result = safeguardingExit(saExitKey, session.userType, 'SEXUAL_VIOLENCE');
  const sarcInfo = buildSARCInfo(session);
  return { ...result, text: result.text + sarcInfo };
}
