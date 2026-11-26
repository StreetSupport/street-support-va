/**
 * Local sections on the Safety from harm results screen (Managing Director,
 * 20 November 2026). One screen: these go below the contacts already shown,
 * which never change.
 *
 * - 16 and 17 year olds: the local Children's Services contact, with out of
 *   hours where held, from housing-pathway-endpoints.json. No new contact data.
 * - Everyone: matched local V4 Safety from harm listings, read live with the
 *   same cap and fixed-file fallback as housing (serviceMatcher.ts). Where the
 *   read fails, times out or finds nothing, the section is left out.
 *
 * The immediate danger exit and the under-16 exit never reach this: they are
 * built elsewhere and never start the read (liveReadGates.ts).
 *
 * Changes require safeguarding test coverage.
 */

import type { SessionState } from '../types';
import { toUserProfile } from '../types';
import { getPhrase } from '../phrasebank';
import { getSafetyFromHarmServices } from '../serviceMatcher';
import { childrenServicesData } from './shared';

function isSupporterAudience(session: SessionState): boolean {
  return session.userType === 'SUPPORTER' || session.isSupporter === true;
}

function childrensServices16To17(session: SessionState): string {
  const age = session.detailedAge || session.ageCategory;
  if (age !== '16-17') return '';
  const la = session.localAuthority?.toLowerCase().replace(/\s+/g, '') || '';
  const cs = childrenServicesData[la];
  if (!cs) return '';
  const lead = getPhrase('SAFETY_16_17_CHILDRENS_SERVICES', isSupporterAudience(session))?.text ?? '';
  let text = `CHILDREN'S SERVICES\n${lead}\n\n${cs.name}\n${cs.phone}`;
  if (cs.phoneOOH) text += ` (out of hours: ${cs.phoneOOH})`;
  text += `\n${cs.website}`;
  return text;
}

function localListings(session: SessionState, gender: string | null): string {
  const profile = { ...toUserProfile(session), gender };
  const services = getSafetyFromHarmServices(session.safetyHarm, profile);
  if (services.length === 0) return '';
  const lead = getPhrase('SAFETY_LOCAL_SERVICES_INTRO', isSupporterAudience(session))?.text ?? '';
  const lines = services.map(svc => {
    let s = svc.name;
    if (svc.phone) s += `\n${svc.phone}`;
    if (svc.website) s += `\n${svc.website}`;
    if (svc.description) s += `\n${svc.description}`;
    return s;
  });
  return [`LOCAL SERVICES\n${lead}`, ...lines].join('\n\n');
}

// `gender` is the answer the person gave on this route, where one was asked;
// otherwise the one already given. Only an explicit Male or Female can hide a
// women-only or men-only listing (hard gate B).
export function safetyLocalSections(session: SessionState, gender?: string | null): string {
  const g = gender !== undefined ? gender : (session.detailedGender || session.gender);
  const parts = [childrensServices16To17(session), localListings(session, g ?? null)].filter(Boolean);
  return parts.length ? '\n\n' + parts.join('\n\n') : '';
}

// The crisis gate's domestic abuse and sexual violence flows, when reached from
// the Safety route ("Yes, I'm OK to carry on"), end on the Safety results screen.
export function reachedFromSafetyRoute(session: SessionState): boolean {
  return session.v4Option === 'safety' && !!session.safetyHarm;
}
