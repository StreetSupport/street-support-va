/**
 * Care leaver endpoints on the housing results (VA Pathway Review 5.2;
 * Managing Director, 20 November 2026).
 *
 * E1 Your social worker or personal adviser (text)
 * E2 The leaving care team of a council (`leavingCare` in
 *    housing-pathway-endpoints.json, only where held with a source)
 * E3 "The council that looked after you: ask for the leaving care team", with
 *    the find-your-council link
 * E4 Children's Services, with out of hours (existing data)
 * E5 Housing Options, E6 the youth navigator, E7 Shelter: shown by the results
 *    layout as today, after these.
 *
 * Where a council has no `leavingCare` entry, it falls back to E3 text, plus
 * E4 at 16 and 17. Never an unverified number.
 *
 * The wording states facts and never applies them: no "entitled", no "duty"
 * or "must" (except "duty team", a council team's name).
 *
 * Safeguarding-adjacent (16 and 17 in care now): changes need the technical
 * lead's review.
 */

import type { SessionState } from '../types';
import { getPhrase } from '../phrasebank';
import endpointsData from '../data/housing-pathway-endpoints.json';
import { childrenServicesData } from './shared';

export interface LeavingCareEntry {
  name: string;
  deliveredBy?: string;
  phone?: string;
  phoneHours?: string;
  phoneOOH?: string;
  website?: string;
  localOfferUrl?: string;
  source: string;
  verified: string;
}

export interface CareSections {
  // Replaces the first step, before Housing Options.
  first?: string;
  // After Housing Options.
  afterHousing?: string;
  // 16 and 17, "Not sure": one line after Children's Services.
  notSureNote?: string;
}

const FIND_COUNCIL = 'https://www.gov.uk/find-local-council';

const laKey = (la: string | null | undefined): string => la?.toLowerCase().replace(/\s+/g, '') || '';

type Endpoints = Record<string, { name?: string; leavingCare?: LeavingCareEntry }>;

export function leavingCareFor(key: string): LeavingCareEntry | null {
  const entry = (endpointsData as unknown as Endpoints)[key]?.leavingCare;
  return entry && entry.source && entry.verified ? entry : null;
}

function councilName(key: string): string | null {
  return (endpointsData as unknown as Endpoints)[key]?.name ?? null;
}

function p(key: string, supporter: boolean): string {
  return getPhrase(key, supporter)?.text ?? '';
}

function heading(title: string): string {
  return `${title}\n${'-'.repeat(title.length)}\n`;
}

function e2Lines(lc: LeavingCareEntry): string {
  let s = `${lc.name}\n`;
  if (lc.phone) {
    s += lc.phone;
    if (lc.phoneHours) s += ` (${lc.phoneHours})`;
    if (lc.phoneOOH) s += ` (out of hours: ${lc.phoneOOH})`;
    s += `\n`;
  }
  if (lc.website) s += `${lc.website}\n`;
  if (lc.localOfferUrl) s += `${lc.localOfferUrl}\n`;
  return s + `\n`;
}

// E4: Children's Services for a council, with out of hours where held.
function e4(key: string, supporter: boolean): string {
  const cs = childrenServicesData[key];
  if (!cs) return '';
  let s = heading("CHILDREN'S SERVICES");
  s += `${p('TERMINAL_YOUTH_16_17_CHILDRENS_SERVICES', supporter)}\n\n`;
  s += `${cs.name}\n${cs.phone}`;
  if (cs.phoneOOH) s += ` (out of hours: ${cs.phoneOOH})`;
  s += `\n${cs.website}\n\n`;
  return s;
}

// E3: the council that looked after them, with the find-your-council link.
function e3(supporter: boolean): string {
  return heading('LEAVING CARE TEAM') + `${p('CARE_E3_ASK_COUNCIL', supporter)}\n${FIND_COUNCIL}\n\n`;
}

function e1Block(supporter: boolean): string {
  return heading('YOUR SOCIAL WORKER OR PERSONAL ADVISER') + `${p('CARE_E1_SOCIAL_WORKER', supporter)}\n\n`;
}

function facts(session: SessionState, supporter: boolean): string {
  const age = session.detailedAge || session.ageCategory;
  let s = p('CARE_LEAVING_CARE_FACTS', supporter);
  if (age === '18-20' || age === '21-24' || age === '18-24') s += ` ${p('CARE_SUPPORT_AGE_18_24', supporter)}`;
  return s;
}

// E2 for a named council, or its fallback: E3 text (plus E4 at 16 and 17).
function e2OrFallback(session: SessionState, key: string, supporter: boolean, is16_17: boolean): string {
  const lc = leavingCareFor(key);
  if (lc) return heading('LEAVING CARE TEAM') + `${facts(session, supporter)}\n\n` + e2Lines(lc);
  return e3(supporter).replace(/\n\n$/, '\n') + `${facts(session, supporter)}\n\n` + (is16_17 ? e4(key, supporter) : '');
}

// E2 where they are now, with its line, or its fallback: the line, then ask
// the local council for the leaving care team, with the find-your-council link.
function e2Local(session: SessionState, lineKey: string, supporter: boolean): string {
  const key = laKey(session.localAuthority);
  const line = p(lineKey, supporter);
  const lc = key ? leavingCareFor(key) : null;
  if (lc) return heading('LEAVING CARE TEAM') + `${line}\n\n` + e2Lines(lc);
  const name = key ? councilName(key) : null;
  const ask = name
    ? `Ask ${name} council for the leaving care team.`
    : p('CARE_ASK_LOCAL_COUNCIL', supporter);
  return heading('LEAVING CARE TEAM') + `${line}\n${ask}\n${FIND_COUNCIL}\n\n`;
}

const isCouncil = (c: string | null | undefined): c is string => !!c && !!councilName(c);

export function careSections(session: SessionState): CareSections {
  const supporter = session.isSupporter === true || session.userType === 'SUPPORTER';
  const age = session.detailedAge || session.ageCategory;
  const answer = session.careExperience ?? null;
  const council = session.careCouncil ?? null;
  const here = laKey(session.localAuthority);

  if (age === '16-17') {
    if (answer === 'IN_CARE_NOW' && isCouncil(council)) {
      return { first: e1Block(supporter) + e4(council, supporter) };
    }
    if (answer === 'LEFT_CARE' && isCouncil(council)) {
      return { first: e1Block(supporter) + e2OrFallback(session, council, supporter, true) };
    }
    if (answer === 'IN_CARE_NOW' || answer === 'LEFT_CARE') {
      // Somewhere else, not sure, or council not stated (prefer not to say):
      // E3, then Children's Services where they are now, as for every 16 and
      // 17 year old. Nothing is selected on the strength of a council.
      return { first: e1Block(supporter) + e3(supporter) + (here ? e4(here, supporter) : '') };
    }
    if (answer === 'NOT_SURE') return { notSureNote: p('CARE_16_17_NOT_SURE_NOTE', supporter) };
    // Prefer not to say is not stated (Managing Director, 11 November 2026):
    // today's layout, nothing selected on the answer.
    return {};
  }

  if (!['18-20', '21-24', '18-24'].includes(age ?? '')) return {};

  if (answer === 'YES') {
    const e1 = `${p('CARE_E1_LINE', supporter)}\n\n`;
    if (isCouncil(council)) return { first: e1 + e2OrFallback(session, council, supporter, false) };
    if (council === 'ELSEWHERE') {
      // E3 block (one heading, one link) first; then, after Housing Options,
      // the leaving care team where they are now as local information: the
      // team where held, otherwise "Ask <council> council for the leaving
      // care team". No second heading or link.
      const lc = here ? leavingCareFor(here) : null;
      const name = here ? councilName(here) : null;
      const ask = name ? `Ask ${name} council for the leaving care team.` : p('CARE_ASK_LOCAL_COUNCIL', supporter);
      return {
        first: e1 + e3(supporter).replace(/\n\n$/, '\n') + `${facts(session, supporter)}\n\n`,
        afterHousing: `${p('CARE_LA_LOCAL_INFO', supporter)}\n` + (lc ? e2Lines(lc) : `${ask}\n\n`),
      };
    }
    // Council not stated (prefer not to say, Managing Director, 11 November
    // 2026): the route for being in care with no council named, E1 line and
    // the E3 block with its link. Nothing selected on the strength of a council.
    if (council === 'PREFER_NOT') {
      return { first: e1 + e3(supporter).replace(/\n\n$/, '\n') + `${facts(session, supporter)}\n\n` };
    }
    // Not sure which council.
    return { first: e2Local(session, 'CARE_LA_FIND_RESPONSIBLE', supporter) };
  }
  if (answer === 'NOT_SURE') return { first: e2Local(session, 'CARE_LA_CAN_CHECK', supporter) };
  // No, and Prefer not to say (not stated, 11 November 2026): standard results.
  return {};
}
