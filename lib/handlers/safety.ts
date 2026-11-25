/**
 * Safety from harm route (Safeguarding Contract 3.3)
 *
 * - SAFETY_TYPE_OF_HARM: one type of harm (Managing Director, 12 November 2026)
 * - SAFETY_OK_TO_CONTINUE: whether the person is OK to carry on
 *
 * Hard-coded, outside the crisis gate. Its own two questions bypass the service
 * matcher and AI (strict reading here and in the chat route). The reused
 * crisis questions it hands to (DV_GENDER_ASK, DV_CHILDREN_ASK, SA_GENDER_ASK)
 * and the crisis gate itself get the same strict reading, with help after a
 * second unclear answer, in #93 (on top of #85). Adds no option to the crisis gate. Help is shown first (999 on the first screen).
 * Nothing stored identifies the person; there is no reporting option. The
 * mid-conversation under-16 check runs on this route as on every other, in the
 * chat route, before this handler.
 *
 * Domestic abuse and sexual violence: on "Yes, I'm OK to carry on" they reuse
 * the crisis gate's own flows exactly as written; on "No, show me help now" they
 * show help at once (Managing Director, 18 November 2026). The crisis flows stay
 * as written ("Domestic abuse (C2 to C4) is launch-dependent: the current exits
 * stay if the review is not done", VA Design and Service Matching Proposal,
 * 1 November 2026). The general exit the contract requires where gender is
 * not given (Managing Director, 11 November 2026) is built in the crisis gate
 * flows in #93, not here.
 *
 * Reached from the first question's Safety option (B5). The quick exit the
 * contract requires is in lib/quickExit.ts. The route stays off
 * (VA_SAFETY_ROUTE, lib/safetyRouteSwitch.ts) until its release conditions are
 * met: Safeguarding Contract 3.3 ratified by the trustees; the quick exit
 * verified; the strict reading at the crisis gate (Safety from harm proposal,
 * decision 6) and the general exit where gender is not given, both in #93,
 * merged; and the new helpline numbers and hours confirmed by a person.
 *
 * Changes require safeguarding test coverage.
 */

import type { SessionState, RoutingResult } from '../types';
import { phrase } from './shared';
import { buildLocalDVInfo, buildSARCInfo } from './crisis';
import { QUICK_EXIT_NOTE } from '../phrasebank';
import safeguardingEndpoints from '../data/safeguarding-endpoints.json';

type Harm = 'DOMESTIC_ABUSE' | 'SEXUAL_VIOLENCE' | 'MODERN_SLAVERY' | 'OTHER';

export const SAFETY_GATES = ['SAFETY_TYPE_OF_HARM', 'SAFETY_OK_TO_CONTINUE'] as const;

export function isSafetyGate(gate: string): boolean {
  return (SAFETY_GATES as readonly string[]).includes(gate);
}

// Strict reading on the Safety route. The person chooses (Safeguarding Contract
// 3.3); nothing is inferred. Only a single option number, as the buttons send,
// or an option's exact text counts. Free text, several numbers, or an empty
// message is unclear: it is never matched by keyword and never sent to the AI.
export function parseSafetyChoice(input: string, options?: string[]): number | null {
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

// Option order in SAFETY_TYPE_OF_HARM. Forced marriage and FGM sit under
// Domestic abuse in the taxonomy (Platform Scope v4: "Domestic abuse (incl. FGM
// and forced marriage)"). Debt bondage is modern slavery.
const HARM_BY_OPTION: Harm[] = [
  'DOMESTIC_ABUSE', // someone close hurting, threatening or controlling
  'DOMESTIC_ABUSE', // forced to marry
  'DOMESTIC_ABUSE', // FGM
  'SEXUAL_VIOLENCE', // sexual assault
  'MODERN_SLAVERY', // made to work, money or documents taken, controlled
  'MODERN_SLAVERY', // paying off a debt by being made to work
  'OTHER', // something else
];

interface NationalLine {
  name: string;
  phone: string;
  availability: string | null;
  url: string;
}

const national = (safeguardingEndpoints as unknown as {
  safety_from_harm_national: {
    modern_slavery_helpline: NationalLine;
    salvation_army_referral: NationalLine;
  };
}).safety_from_harm_national;

function line(l: NationalLine): string {
  const hours = l.availability ? ` (${l.availability})` : '';
  return `${l.name}\n${l.phone}${hours}\n${l.url}`;
}

function emergencyFirst(supporter: boolean): string {
  return supporter
    ? `If they are in immediate danger, call 999. If they can't speak, call 999 and cough or tap if they can. On a mobile, press 55 when asked.`
    : `If you are in immediate danger, call 999. If you can't speak, call 999 and cough or tap if you can. On a mobile, press 55 when you're asked.`;
}

function endSafety(text: string, type: string): RoutingResult {
  return {
    text,
    stateUpdates: {
      currentGate: 'SESSION_END',
      safeguardingTriggered: true,
      safeguardingType: type,
      timestampEnd: new Date().toISOString(),
    },
    sessionEnded: true,
  };
}

function isSupporterAudience(session: SessionState): boolean {
  return session.userType === 'SUPPORTER' || session.isSupporter === true;
}

function wayBack(supporter: boolean): string {
  return supporter
    ? `If they need help with anything else, I'm here.`
    : `If you need help with anything else, I'm here.`;
}

function modernSlaveryExit(session: SessionState): RoutingResult {
  const supporter = isSupporterAudience(session);
  const lead = `No one should be forced to work or be controlled. Here is who can help.`;
  const text = [
    emergencyFirst(supporter),
    lead,
    `MODERN SLAVERY REFERRAL HELPLINE\n${line(national.salvation_army_referral)}`,
    `MODERN SLAVERY AND EXPLOITATION\n${line(national.modern_slavery_helpline)}`,
    wayBack(supporter),
  ].join('\n\n');
  return endSafety(text, 'MODERN_SLAVERY');
}

// "Something else", and an answer the route cannot read: help is shown first,
// and where the person has not said, they see every option and choose (draft
// trustee paper on the VA contracts, 17 November 2026, decision 4; Safeguarding
// Contract 3.3, general exit where gender is not given, applied by analogy). Every national line on the route, 999 first; the person chooses.
// The domestic abuse and sexual violence lines are the ones the crisis exits
// already show.
export function generalSafetyExit(session: SessionState): RoutingResult {
  const supporter = isSupporterAudience(session);
  const lead = supporter
    ? `Here is who can help. They can choose who to contact.`
    : `Here is who can help. You can choose who to contact.`;
  const text = [
    emergencyFirst(supporter),
    lead,
    `DOMESTIC ABUSE\nNational Domestic Violence Helpline\n0808 2000 247 (24/7, free, confidential)\nhttps://nationaldahelpline.org.uk`,
    `SEXUAL VIOLENCE\nRape Crisis England & Wales\n0808 500 2222 (Free, confidential, 24/7)`,
    `MODERN SLAVERY REFERRAL HELPLINE\n${line(national.salvation_army_referral)}`,
    `MODERN SLAVERY AND EXPLOITATION\n${line(national.modern_slavery_helpline)}`,
    wayBack(supporter),
  ].join('\n\n');
  return endSafety(text, 'SAFETY_GENERAL');
}

// Entry from the main menu (and, later, the housing safety question).
export function startSafetyRoute(session: SessionState): RoutingResult {
  return phrase('SAFETY_TYPE_OF_HARM', session.isSupporter);
}

export function handleSafetyTypeOfHarm(session: SessionState, choice: number | null): RoutingResult {
  const harm = choice && choice >= 1 && choice <= HARM_BY_OPTION.length ? HARM_BY_OPTION[choice - 1] : null;
  if (!harm) return phrase('SAFETY_TYPE_OF_HARM', session.isSupporter);
  const next = phrase('SAFETY_OK_TO_CONTINUE', session.isSupporter);
  return { ...next, stateUpdates: { ...next.stateUpdates, safetyHarm: harm } };
}

// "No, show me help now" for domestic abuse and sexual violence: help at once,
// with no further questions (Managing Director, 18 November 2026: what offers
// people the best protection). Every line the crisis exits use, each with who it
// is for in the existing exits' own words, where they have one, so the person
// chooses. Lines and their
// routing are those already in the phrasebank and safeguarding-endpoints.json.
function domesticAbuseHelpNow(session: SessionState): RoutingResult {
  const supporter = isSupporterAudience(session);
  const text = [
    emergencyFirst(supporter),
    supporter ? `Here is who can help. They can choose who to contact.` : `Here is who can help. You can choose who to contact.`,
    `DOMESTIC ABUSE SUPPORT\nNational Domestic Violence Helpline\n0808 2000 247 (24/7, free, confidential)\nhttps://nationaldahelpline.org.uk`,
    `DOMESTIC ABUSE SUPPORT\nManKind Initiative\n0808 800 1170\nhttps://mankind.org.uk\nConfidential support for men affected by domestic violence`,
    `DOMESTIC ABUSE SUPPORT\nGalop\n0800 999 5428\nhttps://galop.org.uk\nNational helpline for LGBTQ+ people affected by abuse or violence`,
  ].join('\n\n') + buildLocalDVInfo(session) +
    `\n\nHOUSING ADVICE\nShelter - Domestic Violence Advice\nhttps://england.shelter.org.uk/housing_advice/homelessness/priority_need/at_risk_of_domestic_abuse` +
    // How to leave quickly, after the help, with no question or delay before it
    // (Managing Director, 19 November 2026).
    '\n\n' + QUICK_EXIT_NOTE + '\n\n' + wayBack(supporter);
  return endSafety(text, 'DOMESTIC_ABUSE');
}

function sexualViolenceHelpNow(session: SessionState): RoutingResult {
  const supporter = isSupporterAudience(session);
  const text = [
    emergencyFirst(supporter),
    supporter ? `Here is who can help. They can choose who to contact.` : `Here is who can help. You can choose who to contact.`,
    `SEXUAL VIOLENCE SUPPORT\nRape Crisis England & Wales\n0808 500 2222 (Free, confidential, 24/7)\nhttps://rapecrisis.org.uk`,
    `SEXUAL VIOLENCE SUPPORT\nSurvivorsUK\n020 3598 3898\nhttps://survivorsuk.org\nSpecialist, confidential support for men and boys aged 16 and over`,
    `SEXUAL VIOLENCE SUPPORT\nGalop\n0800 999 5428\nhttps://galop.org.uk\nNational helpline for LGBTQ+ people affected by abuse or violence`,
  ].join('\n\n') + buildSARCInfo(session) + '\n\n' + QUICK_EXIT_NOTE + '\n\n' + wayBack(supporter);
  return endSafety(text, 'SEXUAL_VIOLENCE');
}

export function handleSafetyOkToContinue(session: SessionState, choice: number | null): RoutingResult {
  if (choice !== 1 && choice !== 2) return phrase('SAFETY_OK_TO_CONTINUE', session.isSupporter);
  const helpNow = choice === 2;

  // Yes: the crisis gate's tailored flows, as written. No: help at once.
  switch (session.safetyHarm) {
    case 'DOMESTIC_ABUSE':
      return helpNow ? domesticAbuseHelpNow(session) : phrase('DV_GENDER_ASK', session.userType);
    case 'SEXUAL_VIOLENCE':
      return helpNow ? sexualViolenceHelpNow(session) : phrase('SA_GENDER_ASK', session.userType);
    case 'MODERN_SLAVERY':
      return modernSlaveryExit(session);
    default:
      return generalSafetyExit(session);
  }
}
