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
import { phrase, safeguardingExit, buildUnder16Exit, childrensServicesBlock, housingOptionsBlock } from './shared';
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

  const { they, their, theyre } = getPronouns(isSupporter);

  let text = '';

  text += `I'm really sorry ${theyre} dealing with this. Losing ${their} home to fire or flood is traumatic, and ${they} deserve support right now.\n\n`;
  text += `The council's housing team is the place to start for emergency accommodation. Here's what to do:\n\n`;

  if (councilHousing) {
    text += `EMERGENCY HOUSING\n`;
    text += `${councilHousing.name}\n`;
    text += `${councilHousing.phone}`;
    if (councilHousing.phoneOOH) {
      text += ` (out of hours: ${councilHousing.phoneOOH})`;
    }
    text += `\n`;
    text += `${councilHousing.website}\n\n`;
    text += `Tell them ${theyre} homeless because of a fire or flood and ${they} need somewhere to stay today.\n\n`;
  } else {
    text += `EMERGENCY HOUSING\n`;
    text += `Contact ${their} local council immediately\n`;
    text += `https://www.gov.uk/find-local-council\n\n`;
    text += `Tell them ${theyre} homeless because of a fire or flood and ${they} need somewhere to stay today.\n\n`;
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
        ...phrase('CRISIS_FIRE_FLOOD_LOCATION', session.userType),
        stateUpdates: { currentGate: 'CRISIS_FIRE_FLOOD_LOCATION' }
      };
    case 7: // None apply — collect location before intent
      return phrase('LOCATION_CONSENT', session.userType);
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
  // No answer at all: the general exit. "Prefer not to say" is still asked
  // about children, because a Yes now adds Children's Services.
  if (!dvGender) {
    return buildGeneralDVExit({ ...session, dvGender });
  }
  return {
    ...phrase('DV_CHILDREN_ASK', session.userType),
    stateUpdates: { currentGate: 'DV_CHILDREN_ASK', dvGender }
  };
}

export function handleDVChildrenAsk(session: SessionState, choice: number | null): RoutingResult {
  // Gender not given: the general exit (Safeguarding Contract 3.3). A
  // non-binary or other answer is an answer, and keeps its exit.
  // A Yes adds the council's Children's Services, as the original phrasebank
  // (v7.1) did for every "children: yes" exit (restored, Managing Director,
  // 26 November 2026).
  // Every exit also gives the council's Housing Options, as all twelve of the
  // original's domestic abuse exits did (restored, same decision).
  const dvChildren = choice === 1;
  const children = dvChildren ? childrensServicesBlock(session) : '';
  const housing = `\n\nHOUSING OPTIONS\n${housingOptionsBlock(session)}`;
  if (!session.dvGender || session.dvGender === 'Prefer not to say') {
    const general = buildGeneralDVExit(session);
    return { ...general, text: general.text + children + housing };
  }
  const dvExitKey = getDVExitKey(session.dvGender, dvChildren);
  const result = safeguardingExit(dvExitKey, session.userType, 'DOMESTIC_ABUSE');
  const localDV = buildLocalDVInfo(session);
  return { ...result, text: beforeClosing999(result.text, children + housing) + localDV };
}

export function handleSAGenderAsk(session: SessionState, choice: number | null): RoutingResult {
  const saGenders = ['Female', 'Male', 'Non-binary or other', 'Prefer not to say'];
  const saGender = choice ? saGenders[choice - 1] : null;
  // Gender not given: the general exit (Safeguarding Contract 3.3).
  if (!saGender || saGender === 'Prefer not to say') return buildGeneralSAExit(session);
  const saExitKey = getSAExitKey(saGender);
  const result = safeguardingExit(saExitKey, session.userType, 'SEXUAL_VIOLENCE');
  const sarcInfo = buildSARCInfo(session);
  return { ...result, text: result.text + sarcInfo };
}

// ============================================================================
// Strict reading at the crisis question and the questions it leads to
// ============================================================================
//
// James Cross's review of #69 (24 November 2026), agreed by the Managing
// Director on 25 November 2026. Our safeguarding routes bypass the AI, so at
// these questions only a chosen option counts: a single option number, as the
// buttons send, or an option's exact words. Free text is never matched by
// keyword and never sent to Claude. A first unclear answer asks again; a
// second shows help at once (crisisQuestionFallback), never the general
// escalation, which leads away from the question.

export const STRICT_CRISIS_GATES = ['GATE0_CRISIS_DANGER', 'DV_GENDER_ASK', 'DV_CHILDREN_ASK', 'SA_GENDER_ASK'] as const;

export function isStrictCrisisGate(gate: string): boolean {
  return (STRICT_CRISIS_GATES as readonly string[]).includes(gate);
}

export function parseStrictChoice(input: string, options?: string[]): number | null {
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) {
    const n = Number(trimmed);
    return options && n >= 1 && n <= options.length ? n : null;
  }
  if (!options || trimmed === '') return null;
  const norm = (t: string) => t.toLowerCase().replace(/\s+/g, ' ').trim();
  const i = options.findIndex(o => norm(o) === norm(trimmed));
  return i >= 0 ? i + 1 : null;
}

// ============================================================================
// General exits where gender is not given (Safeguarding Contract 3.3,
// Managing Director, 11 November 2026): 999 first, the local organisations,
// and each national line with a note of who it is for and when it is open.
// The person chooses. Lines and hours read from each organisation's own site
// on 25 November 2026 (Managing Director, 25 November 2026).
// ============================================================================

type Audience = 'SELF' | 'SUPPORTER' | 'PROFESSIONAL';

function audienceOf(session: SessionState): Audience {
  if (session.userType === 'PROFESSIONAL') return 'PROFESSIONAL';
  return session.isSupporter || session.userType === 'SUPPORTER' ? 'SUPPORTER' : 'SELF';
}

function opening(audience: Audience, sorry: string): string {
  if (audience === 'SELF') return `If you're in immediate danger, call 999.\n\n${sorry} Here is who can help. You can choose who to contact.`;
  if (audience === 'SUPPORTER') return `If they're in immediate danger, call 999.\n\nThese services can help right now. They can choose who to contact.`;
  return `If they're in immediate danger, call 999.\n\nHere are the specialist contacts.`;
}

// Who each local organisation is for, in public words (Managing Director,
// 25 November 2026), from the target field in safeguarding-endpoints.json.
const LOCAL_DV_FOR: Record<string, string> = {
  "Birmingham & Solihull Women's Aid": 'For women and children',
  'Valley House': 'For anyone aged 16 and over',
  'Coventry Haven — Safe to Talk Helpline': 'For women',
  "Black Country Women's Aid": 'For women and children. Men can call the office line to be referred',
  'The Haven Wolverhampton': 'For women and children, including LGBTQ+ people',
};

function localDVForEveryone(session: SessionState): string {
  const la = session.localAuthority?.toLowerCase().replace(/\s+/g, '') || '';
  if (!la) return '';
  const dvLocal = (safeguardingEndpoints.dv_local as unknown as Record<string, DVLocalOrg | DVLocalOrg[]>)[la];
  if (!dvLocal) return '';
  const orgs = Array.isArray(dvLocal) ? dvLocal : [dvLocal];
  const blocks = orgs.map(org => {
    const lines = [org.name.replace(' — ', ': ')];
    const forLine = LOCAL_DV_FOR[org.name];
    if (forLine) lines.push(forLine);
    if (org.phone_24hr) {
      lines.push(`${org.phone_24hr} (24-hour line)`);
      if (org.phone_office) lines.push(`${org.phone_office} (office line${officeHours(org.availability)})`);
    } else if (org.phone) {
      lines.push(`${org.phone} (${org.availability})`);
    }
    lines.push(org.url);
    return lines.join('\n');
  });
  return `\n\nLOCAL DOMESTIC ABUSE SUPPORT\n${blocks.join('\n\n')}`;
}

// "24hr line: always. Office: Mon-Fri 9am-5pm" -> ", Monday to Friday, 9am to 5pm"
function officeHours(availability?: string): string {
  const m = availability?.match(/Office:\s*(.+)$/);
  if (!m) return '';
  return ', ' + m[1].replace('Mon-Fri', 'Monday to Friday,').replace(/(\d+(?:am|pm))-(\d+(?:am|pm))/, '$1 to $2').replace(/,\s*,/, ',');
}

const NDAH = `National Domestic Violence Helpline
For women
0808 2000 247 (24/7, free, confidential)
https://nationaldahelpline.org.uk`;

const MANKIND = `ManKind Initiative
For men
0808 800 1170 (Monday to Friday, 10am to 4pm, not bank holidays)
https://mankind.org.uk`;

const GALOP = `Galop
For LGBTQ+ people aged 18 and over
0800 999 5428 (weekdays: see galop.org.uk for today's hours)
https://galop.org.uk`;

const RAPE_CRISIS = `Rape Crisis England & Wales
For anyone aged 16 and over
0808 500 2222 (free, confidential, 24/7)
https://rapecrisis.org.uk`;

const SURVIVORS_UK = `SurvivorsUK
For men, boys and non-binary people
0808 801 0332 (Monday to Friday, 10am to 12pm)
Webchat every day, 12pm to 8pm: https://survivorsuk.org`;

const SHELTER_DV = `HOUSING ADVICE
Shelter - Domestic Violence Advice
https://england.shelter.org.uk/housing_advice/homelessness/priority_need/at_risk_of_domestic_abuse`;

export function buildGeneralDVExit(session: SessionState): RoutingResult {
  const text = opening(audienceOf(session), "I'm really sorry this is happening.")
    + localDVForEveryone(session)
    + `\n\nNATIONAL DOMESTIC ABUSE LINES\n${NDAH}\n\n${MANKIND}\n\n${GALOP}\n\n${SHELTER_DV}`;
  return { ...safeguardingExit('DV_GENERAL', session.userType, 'DOMESTIC_ABUSE'), text };
}

export function buildGeneralSAExit(session: SessionState): RoutingResult {
  const text = opening(audienceOf(session), "I'm really sorry this has happened.")
    + buildSARCInfo(session)
    + `\n\nNATIONAL SEXUAL VIOLENCE LINES\n${RAPE_CRISIS}\n\n${SURVIVORS_UK}\n\n${GALOP}`;
  return { ...safeguardingExit('SA_GENERAL', session.userType, 'SEXUAL_VIOLENCE'), text };
}

// ============================================================================
// After a second unclear answer at one of the strict questions
// ============================================================================

function crisisUnclearHelp(session: SessionState): RoutingResult {
  const self = audienceOf(session) === 'SELF';
  const text = [
    self ? `If you're in immediate danger, call 999.` : `If they're in immediate danger, call 999.`,
    `I'm not sure I've understood, so here is who can help right now. ${self ? 'You' : 'They'} can choose who to contact.`,
    `DOMESTIC ABUSE\nNational Domestic Violence Helpline\nFor women\n0808 2000 247 (24/7, free, confidential)\n\nManKind Initiative\nFor men\n0808 800 1170 (Monday to Friday, 10am to 4pm, not bank holidays)`,
    `SEXUAL VIOLENCE\nRape Crisis England & Wales\n0808 500 2222 (free, confidential, 24/7)`,
    self ? `IF YOU'RE THINKING ABOUT HARMING YOURSELF\nSamaritans\n116 123 (free, 24/7)` : `IF THEY'RE THINKING ABOUT HARMING THEMSELVES\nSamaritans\n116 123 (free, 24/7)`,
    self ? `IF YOU'RE UNDER 16\nChildline\n0800 1111` : `IF THEY'RE UNDER 16\nChildline\n0800 1111`,
    `If none of these is what ${self ? 'you need' : 'they need'}, we can carry on and find other support.`,
  ].join('\n\n');
  return { text, options: ['Carry on'], stateUpdates: { currentGate: 'CRISIS_UNCLEAR_HELP' }, sessionEnded: false };
}

/** "Carry on" after the crisis help: where "None of these apply" goes. */
export function handleCrisisUnclearHelp(session: SessionState): RoutingResult {
  return handleCrisisDanger(session, 7);
}

/** Puts a block before an exit's closing 999 line, which stays last. */
function beforeClosing999(text: string, block: string): string {
  if (!block) return text;
  const i = text.lastIndexOf('\n\n');
  const last = i >= 0 ? text.slice(i + 2) : '';
  return i >= 0 && /999/.test(last) ? text.slice(0, i) + block + text.slice(i) : text + block;
}

/** What a second unclear answer at a strict question leads to. */
export function crisisQuestionFallback(session: SessionState): RoutingResult {
  switch (session.currentGate) {
    case 'DV_GENDER_ASK': {
      const general = buildGeneralDVExit(session);
      return { ...general, text: `${general.text}\n\nHOUSING OPTIONS\n${housingOptionsBlock(session)}` };
    }
    case 'DV_CHILDREN_ASK':
      // As if Yes (Managing Director, 25 November 2026)
      return handleDVChildrenAsk(session, 1);
    case 'SA_GENDER_ASK':
      return buildGeneralSAExit(session);
    default:
      return crisisUnclearHelp(session);
  }
}
