// The record of restrictions (Service Matching Contract 3.2, gates A and B and
// section 6). Built in the enrichment pipeline and reviewed on 23 November 2026.
// It is in the build but not switched on until December: VA_RESTRICTIONS=on
// switches it on. Until then the matcher behaves exactly as before.
//
// For a service the record covers, the record replaces the label-based guesses:
// - Only the hard gates exclude: an age stated in terms (gate A), and a women's
//   or men's service (gate B). They exclude only on a stated answer that falls
//   wholly outside; no answer, or "prefer not to say", never excludes.
// - An either-or or per-location age is held as branches (age_branches): it
//   excludes only when no branch admits the person; the branch for their council
//   applies; a branch whose condition can't be checked always admits.
// - A service designed for a group, or shown only where a condition applies, is
//   recommended only to someone who has said the group or condition applies.
//   It is never excluded: it stays under "See all on Street Support".
// - Everything else (welcomes or focus, "How to get it" wording) limits nothing.

import recordData from './data/wmca_restriction_record_2026-11-25.json';
import type { UserProfile } from './types';

export interface RestrictionEntry {
  listing_id: string;
  kind: string;
  group_or_condition: string | null;
  min_age: number | null;
  max_age: number | null;
  either_or: string[];
  exclusion_effect: string;
  age_branches: AgeBranch[];
}

/** One branch of an either-or or per-location age (age_branches_2026-11-23.json). */
export interface AgeBranch {
  place?: string;
  min_age?: number;
  max_age?: number;
  condition?: string;
}

const ENTRIES = (recordData as { entries: RestrictionEntry[] }).entries;
const BY_LISTING = new Map<string, RestrictionEntry[]>();
for (const e of ENTRIES) {
  const list = BY_LISTING.get(e.listing_id) ?? [];
  list.push(e);
  BY_LISTING.set(e.listing_id, list);
}

export function restrictionsOn(): boolean {
  return process.env.VA_RESTRICTIONS === 'on';
}

/** The join between a platform service and the record: the V4 listing id.
 * The platform does not carry it yet; to confirm with the technical lead. */
export function listingIdFor(service: { listing_id?: string | null }): string | null {
  return service.listing_id ?? null;
}

/** The record's entries for a service, or null when the record does not govern it
 * (switched off, or no listing id). A listing with no entries has no restriction. */
export function recordFor(service: { listing_id?: string | null }): RestrictionEntry[] | null {
  if (!restrictionsOn()) return null;
  const id = listingIdFor(service);
  if (!id) return null;
  return BY_LISTING.get(id) ?? [];
}

// Age categories as the assistant stores them, as ranges.
const AGE_RANGES: Record<string, [number, number]> = {
  'Under 16': [0, 15],
  '16-17': [16, 17],
  '18-20': [18, 20],
  '21-24': [21, 24],
  '18-24': [18, 24],
  '25+': [25, Infinity],
  '50+': [50, Infinity],
};

const YOUNG = ['Under 16', '16-17', '18-20', '21-24', '18-24'];
const ETHNIC_MINORITY_ANSWERS = ['White Other', 'Black African', 'Black Caribbean', 'Asian', 'Mixed'];
// Refugees, asylum seekers and migrants are kept apart: "Migrants" is any other
// immigration status (design note 3.7; MD, 23 November 2026: EEA nationals,
// Ukraine, Hong Kong and Afghan resettlement schemes).
const OTHER_STATUS = ['EUSS', 'Leave to remain', 'No status'];

/** Whether the person has said a group or condition applies to them. Groups the
 * assistant doesn't ask about are never stated. */
export function groupStated(group: string | null, profile: UserProfile): boolean {
  const age = profile.ageCategory ?? '';
  switch (group) {
    case 'Women': return (profile.gender ?? '').trim() === 'Female';
    case 'Men': return (profile.gender ?? '').trim() === 'Male';
    case 'Young people': return YOUNG.includes(age);
    case 'LGBTQ+': return profile.lgbtq === true;
    case 'Parents and families':
    // Too narrow to ask separately: surfaced as Parents and families (MD, 23 November 2026).
    case 'Parents and families (child under 5)':
      return profile.hasChildren === true;
    // The income or work answer (MD, 23 November 2026). Distance is not checked here.
    case 'means-tested benefits; within 1.6km': return profile.onBenefits === true;
    // The dogs question on the housing route, once built (design note 3.7).
    case 'People with dogs': return profile.hasDog === true;
    // "Yes" on the profile route; the offence type on the housing route (C3Q9).
    case 'People with criminal records':
      return ['Yes', 'Arson', 'Sexual', 'Violent'].includes(profile.criminalConvictions ?? '');
    case 'Refugees': return profile.immigrationStatus === 'Refugee';
    case 'Asylum seekers': return profile.immigrationStatus === 'Asylum seeker';
    case 'Migrants': return OTHER_STATUS.includes(profile.immigrationStatus ?? '');
    case 'Veterans': return profile.servedInArmedForces === true;
    case 'Care leavers': return profile.careExperienced === true;
    case 'Ethnic minority communities': return ETHNIC_MINORITY_ANSWERS.includes(profile.ethnicity ?? '');
    // Answered on the housing route (Managing Director, 23 November 2026, decision 62).
    case 'leaving prison': return profile.sleepingSituation === 'Leaving prison';
    default: return false;
  }
}

function isAgeGate(e: RestrictionEntry): boolean {
  return e.exclusion_effect === 'age gate (A)';
}

function isGenderGate(e: RestrictionEntry): boolean {
  return e.exclusion_effect.startsWith('gender gate (B)');
}

function isSelection(e: RestrictionEntry): boolean {
  return e.exclusion_effect.startsWith('recommended only to people who have said')
    || e.exclusion_effect.startsWith('selection only');
}

function outside(lo: number, hi: number, min?: number | null, max?: number | null): boolean {
  return (min != null && hi < min) || (max != null && lo > max);
}

// A branch's condition fails only on an answer that says it doesn't apply. Only
// children is held that way; the profile can't tell "not a care leaver" from
// unasked, and other conditions aren't asked, so their branches admit.
function conditionFails(condition: string | undefined, profile: UserProfile): boolean {
  if (condition === 'Parents and families') return profile.hasChildren === false;
  return false;
}

/** An either-or or per-location age: excluded only when no branch admits the person.
 * Branches for other places are set aside; if none is for the person's place, all count. */
export function excludedByBranches(branches: AgeBranch[], profile: UserProfile): boolean {
  const range = profile.ageCategory ? AGE_RANGES[profile.ageCategory] : undefined;
  if (!range || branches.length === 0) return false;
  const [lo, hi] = range;
  // As the matcher normalises councils: "City of Wolverhampton" is Wolverhampton.
  const norm = (x: string): string => x.toLowerCase().replace(/\s+/g, '').replace('cityof', '');
  const la = norm(profile.localAuthority ?? '');
  const local = branches.filter(b => b.place && norm(b.place) === la);
  const relevant = local.length > 0 ? local : branches;
  return !relevant.some(b => !outside(lo, hi, b.min_age, b.max_age) && !conditionFails(b.condition, profile));
}

/** Gate A: a stated age excludes only when the person's age lies wholly outside it;
 * an either-or or per-location age only when no branch admits them. */
export function excludedByAge(entries: RestrictionEntry[], profile: UserProfile): boolean {
  const range = profile.ageCategory ? AGE_RANGES[profile.ageCategory] : undefined;
  if (!range) return false;
  const [lo, hi] = range;
  if (entries.filter(isAgeGate).some(e => outside(lo, hi, e.min_age, e.max_age))) return true;
  const held = entries.find(e => e.age_branches && e.age_branches.length > 0);
  return held ? excludedByBranches(held.age_branches, profile) : false;
}

/** Gate B: only an explicit Male or Female answer excludes. */
export function excludedByGender(entries: RestrictionEntry[], gender: string | null): boolean {
  const answer = (gender ?? '').trim();
  return entries.filter(isGenderGate).some(e =>
    (e.group_or_condition === 'Women' && answer === 'Male')
    || (e.group_or_condition === 'Men' && answer === 'Female'));
}

/** Selection: every designed-for or condition entry must be met. Either-or entries
 * are met when any branch is stated. An entry naming no group can't be stated, so
 * it limits nothing. */
export function selectable(entries: RestrictionEntry[], profile: UserProfile): boolean {
  return entries.filter(isSelection).every(e => {
    if (e.either_or.length > 0) return e.either_or.some(g => groupStated(g, profile));
    if (e.group_or_condition === null) return true;
    return groupStated(e.group_or_condition, profile);
  });
}
