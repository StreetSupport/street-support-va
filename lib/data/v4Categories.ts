// V4 categories for the VA: what each first-screen option and second-screen
// choice looks for on the platform.
//
// Sources:
// - The options and second screens: VA V4 Redesign Design Note, Decision 1
//   (Managing Director, 4 November 2026), as carried by the Service Matching
//   and Questions Design Note v1.1 (13 November 2026).
// - The taxonomy: Platform Scope and Service Principles v4, consolidated taxonomy.
// - The keys: read from the platform copy (database streetsupport), 18 November
//   2026. A key the copy does not yet carry is null here, and is never guessed
//   (design note, "unknown codes are logged, not guessed").
//
// Pure data and functions, used by the first question (stateMachine.ts) and the matcher.

export const V4_PARENTS = [
  'housing',
  'safety-from-harm',
  'food',
  'essentials',
  'finance',
  'employment',
  'health',
  'addiction',
  'immigration',
  'activities',
] as const;

export type V4Parent = (typeof V4_PARENTS)[number];

// Subcategory keys by parent. null: in the taxonomy but not yet on the copy.
export const V4_SUBCATEGORIES: Record<V4Parent, Record<string, string | null>> = {
  housing: {
    'Emergency accommodation': 'emergency-accommodation',
    'Supported housing': 'supported-housing',
    'Move-on accommodation': 'move-on-accommodation',
    'Tenancy setup': 'tenancy-setup',
    Advice: 'housing-advice',
  },
  'safety-from-harm': {
    'Domestic abuse': 'domestic-abuse',
    'Sexual violence': 'sexual-violence',
    'Modern slavery and trafficking': 'modern-slavery-and-trafficking',
  },
  food: {
    'Hot meals': 'hot-meals',
    Groceries: 'groceries',
  },
  essentials: {
    'Personal Care': 'personal-care',
    Clothing: 'clothing',
    'Period products': 'period-products',
    'Baby items': null,
    'Pet welfare': 'pet-welfare',
    Communications: 'communications',
  },
  finance: {
    'Debt and money management': 'debt-and-money-management',
    Benefits: 'benefits',
    'Bills and energy': 'bills-and-energy',
    Grants: 'grants',
  },
  employment: {
    Jobs: 'jobs',
    Skills: 'skills',
    Advice: 'employment-advice',
  },
  health: {
    'Mental health': 'mental-health',
    'Physical health': 'physical-health',
    'Sexual health': null,
    'Palliative care': null,
  },
  addiction: {
    Drugs: 'drugs',
    Alcohol: 'alcohol',
    Gambling: 'gambling',
  },
  immigration: {
    'Asylum, Immigration and Entitlements': 'asylum-immigration-and-entitlements',
    'Resettlement and Integration': 'resettlement-and-integration',
  },
  activities: {
    'Social connection': 'social-connection',
    'Health and wellbeing': 'health-and-wellbeing',
  },
};

// One part of what a choice looks for. subs absent: every service in the parent.
export interface CategoryPart {
  parent: V4Parent;
  subs?: string[];
}

export interface Choice {
  label: string;
  parts: CategoryPart[];
  // Set where the choice names a subcategory the copy does not yet carry. The
  // choice then looks at the whole parent, as "something else" does, until the
  // key is confirmed.
  pendingKey?: string;
}

export type FirstOptionId =
  | 'housing'
  | 'safety'
  | 'everyday'
  | 'money-work'
  | 'health'
  | 'immigration'
  | 'activities'
  | 'not-sure';

export interface FirstOption {
  id: FirstOptionId;
  label: string;
  // How the option is answered. 'matched': the matcher reads these categories.
  // 'routed': the option leads to a route designed elsewhere, not the matcher.
  kind: 'matched' | 'routed';
  // 'noticing-step': "Not sure" leads first to the VA helping the person work it
  // out, with the choice of a place to start (Service Matching and Questions
  // Design Note v1.1, section 2, Managing Director, 13 November 2026, replacing
  // the 4 November "lead to a place to start").
  route?: 'housing-situation' | 'safety' | 'noticing-step';
  parents: V4Parent[];
  secondScreen?: Choice[];
}

import { isSafetyRouteEnabled } from '../safetyRouteSwitch';

const subs = (parent: V4Parent, ...names: string[]): CategoryPart => ({
  parent,
  subs: names.map(n => {
    const key = V4_SUBCATEGORIES[parent][n];
    if (!key) throw new Error(`No key on the copy for ${parent} / ${n}`);
    return key;
  }),
});

const whole = (...parents: V4Parent[]): CategoryPart[] => parents.map(parent => ({ parent }));

// Decision 1, in order. Labels as the design note writes them.
export const FIRST_OPTIONS: FirstOption[] = [
  {
    id: 'housing',
    label: 'Somewhere to live, or help to keep my home',
    kind: 'routed',
    route: 'housing-situation',
    parents: ['housing'],
  },
  {
    id: 'safety',
    label: 'Staying safe from abuse, exploitation or harm',
    kind: 'routed',
    route: 'safety',
    parents: ['safety-from-harm'],
  },
  {
    id: 'everyday',
    label: 'Food, clothes or other everyday things',
    kind: 'matched',
    parents: ['food', 'essentials'],
    secondScreen: [
      { label: 'A hot meal', parts: [subs('food', 'Hot meals')] },
      { label: 'Food to take home', parts: [subs('food', 'Groceries')] },
      { label: 'Clothes', parts: [subs('essentials', 'Clothing')] },
      { label: 'Toiletries or period products', parts: [subs('essentials', 'Personal Care', 'Period products')] },
      { label: 'A phone or getting online', parts: [subs('essentials', 'Communications')] },
      { label: 'Something else', parts: whole('food', 'essentials') },
    ],
  },
  {
    id: 'money-work',
    label: 'Money, debt, benefits or work',
    kind: 'matched',
    parents: ['finance', 'employment'],
    secondScreen: [
      { label: 'Debt', parts: [subs('finance', 'Debt and money management')] },
      { label: 'Benefits', parts: [subs('finance', 'Benefits')] },
      { label: 'Bills and energy', parts: [subs('finance', 'Bills and energy')] },
      { label: 'Grants', parts: [subs('finance', 'Grants')] },
      { label: 'Work or training', parts: whole('employment') },
      { label: 'Something else', parts: whole('finance', 'employment') },
    ],
  },
  {
    id: 'health',
    label: 'Health, drugs, alcohol or gambling',
    kind: 'matched',
    parents: ['health', 'addiction'],
    secondScreen: [
      { label: 'Mental health', parts: [subs('health', 'Mental health')] },
      { label: 'Physical health', parts: [subs('health', 'Physical health')] },
      { label: 'Sexual health', parts: whole('health'), pendingKey: 'health / Sexual health' },
      { label: 'Drugs or alcohol', parts: [subs('addiction', 'Drugs', 'Alcohol')] },
      { label: 'Gambling', parts: [subs('addiction', 'Gambling')] },
      { label: 'Something else', parts: whole('health', 'addiction') },
    ],
  },
  {
    id: 'immigration',
    label: 'Immigration or asylum',
    kind: 'matched',
    parents: ['immigration'],
  },
  {
    id: 'activities',
    label: 'Things to do and people to meet',
    kind: 'matched',
    parents: ['activities'],
  },
  {
    id: 'not-sure',
    label: "I'm not sure where to start",
    kind: 'routed',
    route: 'noticing-step',
    parents: [],
  },
];

/** The first question's options as offered: without Safety while its switch is off. */
export function visibleFirstOptions(): FirstOption[] {
  return isSafetyRouteEnabled() ? FIRST_OPTIONS : FIRST_OPTIONS.filter(o => o.id !== 'safety');
}

export function firstOption(id: FirstOptionId): FirstOption {
  const option = FIRST_OPTIONS.find(o => o.id === id);
  if (!option) throw new Error(`Unknown first option: ${id}`);
  return option;
}

// What a matched option looks for, given the second-screen choice if any. No
// choice, or an option with no second screen, looks at every parent it covers.
export function partsFor(id: FirstOptionId, choiceLabel?: string): CategoryPart[] {
  const option = firstOption(id);
  if (option.kind !== 'matched') return [];
  if (!option.secondScreen || !choiceLabel) return whole(...option.parents);
  const choice = option.secondScreen.find(c => c.label === choiceLabel);
  if (!choice) throw new Error(`Unknown choice for ${id}: ${choiceLabel}`);
  return choice.parts;
}

export function matchesParts(
  category: { parent: string; sub: string },
  parts: CategoryPart[],
): boolean {
  return parts.some(
    p => p.parent === category.parent && (!p.subs || p.subs.includes(category.sub)),
  );
}

// A service's keys checked against the taxonomy. The live read logs, and does
// not guess, a key it does not know. Safety from harm with no subcategory is
// known: sex work services sit there (Platform Scope v4).
export function isKnownV4Category(parent: string, sub: string): boolean {
  if (!(V4_PARENTS as readonly string[]).includes(parent)) return false;
  if (parent === 'safety-from-harm' && sub === '') return true;
  return Object.values(V4_SUBCATEGORIES[parent as V4Parent]).includes(sub);
}

// Population tags on the copy (ClientGroups collection, 18 November 2026). On a
// service they are in ProvidedServices.ClientGroupKeys, as plain keys: 118 of the
// 1,413 published V4-parent services carry at least one, and all 15 occur. A tag
// means "designed for": it lifts a service for someone in the group and never
// hides it from anyone else (decided 1 November 2026). Not yet read by the matcher.
export const V4_POPULATION_TAGS = [
  'women',
  'men',
  'families',
  'young-people',
  'care-leavers',
  'lgbtq',
  'people-with-criminal-records',
  'refugees',
  'asylum-seekers',
  'migrants',
  'ethnic-minority-communities',
  'veterans',
  'people-with-dogs',
  'sex-workers',
  'modern-slavery-survivors',
] as const;

// Places to start: only those whose own public information supports the
// function are shown at the switch; the rest wait for the organisation to
// confirm (Managing Director, 12 November 2026).
export function placeToStartShown(doc: { Publish?: string | null }): boolean {
  return doc.Publish === 'show at the switch';
}
