// Street Support VA v7.1 State Machine - COMPLETE VERSION
// Full routing logic from CHAR_VA_RoutingLogic_v7.md
// UPDATES v7.1:
// - Social services questions (C3Q11/C3Q12) only for 16-17 and 18-20
// - Restructured terminal output with clear hierarchy
// - Trauma-informed language, Shelter as safety net

import { getPhrase } from './phrasebank';
import { getPronouns } from './utils/pronouns';
import { cleanPreferredName, withNameBeforeFullStop } from './utils/preferredName';
import type { GateType, HousingSituation, SessionState, RoutingResult, TerminalResult } from './types';
import { toUserProfile } from './types';
export type { GateType, SessionState, RoutingResult };
import {
  getCouncilOrg,
  getLocalSupportOrgs,
  getNavigatorOrgs,
  getDVOrgs,
  getImmigrationOrgs,
  getSpecialistOrgs,
  getYouthOrgs,
  getShelterInfo,
  getStreetLinkInfo,
  getOpFortitudeInfo,
  getServicesForNeed,
  getHousingAdviceServices,
  getHousingServicesForPopulation,
  isProfileRelevantNeed,
  getPrimaryCategoryKey,
} from './serviceMatcher';
import {
  handleCrisisDanger,
  handleCrisisUnder16Location,
  handleCrisisFireFloodLocation,
  handleDVGenderAsk,
  handleDVChildrenAsk,
  handleSAGenderAsk,
} from './handlers/crisis';
import { isSafetyRouteEnabled } from './safetyRouteSwitch';
import { handleSafetyTypeOfHarm, handleSafetyOkToContinue, isSafetyGate, parseSafetyChoice, startSafetyRoute } from './handlers/safety';
import { firstOption, partsFor, visibleFirstOptions, type FirstOptionId } from './data/v4Categories';
import { buildUnder16Exit, childrenServicesData } from './handlers/shared';
import { getServicePool } from './data/servicePool';
import { DIGNITY_OFFER, HOUSING_OFFER_OPTIONS, NOTICING_UNCLEAR, noticingDangerLine, noticingUnclear, awarenessLine, housingOfferText, isDignityChoice, noticingMultiSelect, noticingOptions, noticingOutcome, noticingText, parseNoticing, takesNoticingStep, NO_PLACE_TO_START, notSureMultiSelect, notSureOptions, notSureOutcome, notSureText } from './noticing';
import {
  handleLocationConsent,
  handleLocationPostcode,
  handleLocationResult,
  handleLocationConfirm,
  handleLocationOutsideWMCA,
} from './handlers/location';
import {
  handleB7BPreventionReason,
  handleB7CPreventionUrgency,
  handleB7D1PreventionChildrenDependents,
  handleB7D2PreventionEmploymentIncome,
  handleB7D3PreventionPriorSupport,
  handleB7D4PreventionSafeguardingSignals,
  handleB7D4APreventionSafeguardingFollowUp,
} from './handlers/prevention';
import {
  handleB8Duration,
  handleB9Reason,
  handleB10Income,
  handleB11PriorUse,
  handleB12AlreadySupported,
  handleB12AWhichOrg,
} from './handlers/homeless';
import {
  handleC2ConsentGate,
  handleArmedForcesAsk,
  handleC3Q1ImmigrationStatus,
  handleC3Q1AEussFollowup,
  handleC3Q1BPublicFundsFollowup,
  handleC3Q2DependentChildren,
  handleC3Q3Age,
  handleC3Q4Gender,
  handleC3Q5Pregnancy,
  handleC3Q6Ethnicity,
  handleC3Q7PhysicalHealth,
  handleC3Q8MentalHealth,
  handleC3Q9CriminalConvictions,
  handleC3Q10Lgbtq,
  handleC3Q10ALgbtqServicePreference,
  handleC3Q11CurrentlyInCare,
  handleC3Q12SocialServices,
} from './handlers/sectionC';
import {
  handleTerminalAdditionalNeeds,
  handleEscalationLevel1,
  handleEscalationLevel2,
} from './handlers/terminal';

// ============================================================
// SESSION CREATION
// ============================================================

export function createSession(sessionId: string): SessionState {
  return {
    sessionId,
    currentGate: 'INIT',
    routeType: null,
    intentType: null,
    preferredName: null,
    accessLocation: null,
    returnUser: null,
    returnOutcome: null,
    housingOptionsInvolvement: null,
    housingSituation: null,
    localAuthority: null,
    latitude: null,
    longitude: null,
    locationMethod: null,
    jurisdiction: 'ENGLAND',
    userType: null,
    ageCategory: null,
    gender: null,
    supportNeed: null,
    adviceSubcategory: null,
    additionalNeeds: [],
    needCount: 0,
    homeless: null,
    sleepingSituation: null,
    housedSituation: null,
    duration: null,
    reason: null,
    income: null,
    priorUse: null,
    alreadySupported: null,
    currentSupportingOrg: null,
    preventionNeed: null,
    preventionReason: null,
    preventionUrgency: null,
    preventionChildren: null,
    preventionEmployment: null,
    preventionPriorSupport: null,
    preventionSafeguardingSignals: null,
    consentGiven: null,
    immigrationStatus: null,
    eussStatus: null,
    publicFunds: null,
    hasChildren: null,
    detailedAge: null,
    detailedGender: null,
    pregnant: null,
    ethnicity: null,
    physicalHealth: null,
    mentalHealth: null,
    criminalConvictions: null,
    lgbtq: null,
    lgbtqServicePreference: null,
    inCare: null,
    socialServices: null,
    youthSocialServicesAsked: false,
    servedInArmedForces: null,
    isSupporter: false,
    youthServicesFlag: false,
    safeguardingTriggered: false,
    safeguardingType: null,
    dvGender: null,
    dvChildren: null,
    saGender: null,
    unclearCount: 0,
    skipCount: 0,
    escalationLevel: 0,
    terminalOutcome: null,
    timestampStart: new Date().toISOString(),
    timestampEnd: null,
  };
}

// ============================================================
// HELPERS
// ============================================================

function phrase(key: string, audience: 'SELF' | 'SUPPORTER' | 'PROFESSIONAL' | null | boolean): RoutingResult {
  const p = getPhrase(key, audience);
  return {
    text: p?.text || `[Missing phrase: ${key}]`,
    options: p?.options,
    stateUpdates: { currentGate: key as GateType },
    sessionEnded: false,
    responseType: p?.responseType,
  };
}

const needDisplayNames: Record<string, string> = {
  'Emergency Housing': 'emergency housing',
  'Food': 'food support',
  'Work': 'employment support',
  'Health': 'health services',
  'Advice': 'advice and support',
  'Drop In': 'drop-in services',
  'Financial': 'financial help',
  'Items': 'essential items',
  'Services': 'support services',
  'Comms': 'communication support',
  'Training': 'training opportunities',
  'Activities': 'activities and groups'
};

// ============================================================
// CATEGORY-SPECIFIC PROFILING CONFIGURATION
// Defines what profile questions are needed for each support need
// ============================================================

// What profile fields each need requires for effective service matching
const needProfileRequirements: Record<string, string[]> = {
  // Health: Age (youth clinics), Gender (women's health), LGBTQ (inclusive services)
  'Health': ['age', 'gender', 'lgbtq'],
  
  // Work: Age (youth employment), Convictions (ex-offender programs), NRPF (right to work)
  'Work': ['age', 'convictions', 'nrpf'],
  
  // Financial: NRPF (benefits eligibility), Children (family support)
  'Financial': ['nrpf', 'children'],
  
  // Training: Age (youth training, adult education)
  'Training': ['age'],
  
  // Activities: Age (youth/elderly groups), Gender (some gender-specific)
  'Activities': ['age', 'gender'],
  
  // Drop In: Age (youth drop-ins), Gender (some gender-specific)
  'Drop In': ['age', 'gender'],
  
  // Advice: subcategory selection provides targeting, no further profiling
  'Advice': [],

  // Location-only needs - no profiling required
  'Food': [],
  'Items': [],
  'Services': [],
  'Comms': []
};

/**
 * Determines the next profile question to ask based on the support need
 * and what profile data has already been collected.
 * Returns terminal output when all required fields are collected.
 */
// Profile questions by V4 parent: the Service Matching and Questions Design
// Note, 3.7 (Managing Director, 8 November 2026), limited to the questions the
// VA already asks. Care, armed forces, dogs and ethnicity are added when built,
// and every question needs its data protection row (D2) before launch.
const v4ParentRequirements: Record<string, string[]> = {
  food: [],
  essentials: ['gender', 'children'],
  finance: ['age', 'gender', 'nrpf', 'children'],
  employment: ['age', 'gender', 'convictions', 'nrpf', 'children'],
  health: ['age', 'gender', 'lgbtq', 'convictions', 'nrpf', 'children'],
  addiction: ['age', 'gender', 'lgbtq'],
  immigration: ['gender', 'lgbtq', 'nrpf'],
  activities: ['age', 'gender'],
};
const PROFILE_ORDER = ['age', 'gender', 'lgbtq', 'convictions', 'nrpf', 'children'];

// The phrase shown at B5_SECOND_SCREEN depends on the first-question option.
export function secondScreenPhraseKey(v4Option: string | null | undefined): string {
  return v4Option === 'everyday' ? 'B5_SECOND_EVERYDAY' : v4Option === 'money-work' ? 'B5_SECOND_MONEY_WORK' : 'B5_SECOND_HEALTH';
}

function v4Parents(session: SessionState): string[] {
  if (!session.v4Option) return [];
  return [...new Set(partsFor(session.v4Option as FirstOptionId, session.v4Choice ?? undefined).map(p => p.parent))];
}

function v4Requirements(session: SessionState): string[] {
  const wanted = new Set(v4Parents(session).flatMap(p => v4ParentRequirements[p] ?? []));
  return PROFILE_ORDER.filter(f => wanted.has(f));
}

// The national contacts for each V4 need: which ones, from the design note's
// table (Service Matching and Questions Design Note v1.1, section 9; Managing
// Director, 8 November 2026) and bills and energy (Managing Director,
// 19 November 2026); names, numbers, hours and framing from the Non-Housing
// Pathway Endpoints Contract's national table (2.2, contacts checked at source
// 11, 13 and 19 November 2026). Where the two documents differ, see the PR.
type Floor = { name: string; phone?: string; website: string; description: string };
const V4_FLOORS: Record<string, Floor> = {
  nhs111: {
    name: 'NHS 111',
    phone: '111',
    website: 'https://111.nhs.uk',
    description: 'For urgent medical help when it is not an emergency. Free, 24 hours a day',
  },
  lgbtFoundation: {
    name: 'LGBT Foundation',
    phone: '0345 3 30 30 30',
    website: 'https://lgbt.foundation',
    description: 'The LGBT Foundation can provide specialist health advice and support. Monday to Friday, 9am to 6pm',
  },
  citizensAdvice: {
    name: 'Citizens Advice Adviceline',
    phone: '0800 144 8848',
    website: 'https://www.citizensadvice.org.uk',
    description: 'Best for debt and money advice. Free and confidential. Usually 9am to 5pm, Monday to Friday',
  },
  jobcentrePlus: {
    name: 'Jobcentre Plus',
    website: 'https://www.gov.uk/contact-jobcentre-plus',
    description: 'Your local Jobcentre can connect you with employment support',
  },
  nationalCareersAdult: {
    name: 'National Careers Service',
    phone: '0800 072 0288',
    website: 'https://nationalcareers.service.gov.uk',
    description: 'Free careers advice from a careers adviser, for people aged 18 and over in England. 8am to 6pm, Monday to Friday. The website can help you find local training',
  },
  nationalCareersYoung: {
    name: 'National Careers Service',
    website: 'https://nationalcareers.service.gov.uk',
    description: 'Free careers advice and help to find local training',
  },
  frank: {
    name: 'FRANK',
    phone: '0300 123 6600',
    website: 'https://www.talktofrank.com',
    description: 'Confidential advice about drugs, any time. You can also text 82111',
  },
  gamblingHelpline: {
    name: 'National Gambling Helpline (GamCare)',
    phone: '0808 8020 133',
    website: 'https://www.gamcare.org.uk',
    description: 'Free support with gambling, 24 hours a day, every day. Live chat on the website',
  },
  migrantHelp: {
    name: 'Migrant Help asylum helpline',
    phone: '0808 8010 503',
    website: 'https://www.migranthelpuk.org',
    description: 'Free helpline for people waiting for an asylum decision',
  },
  citizensAdviceImmigration: {
    // Someone to speak to for everyone not waiting for an asylum decision
    // (Managing Director, 20 November 2026). "All Citizens Advice advisers are
    // registered with the IAA" (citizensadvice.org.uk, immigration, read
    // 20 November 2026). The Adviser Finder is left out while it is unavailable
    // (GOV.UK notice, updated 18 November 2026) and adds little we do not list.
    name: 'Citizens Advice Adviceline',
    phone: '0800 144 8848',
    website: 'https://www.citizensadvice.org.uk/immigration/',
    description: 'Free, confidential advice from advisers registered with the immigration regulator. Usually 9am to 5pm, Monday to Friday',
  },
  jcwi: {
    // For people without status (Managing Director, 20 November 2026);
    // number and hours from jcwi.org.uk/our-helplines, read 20 November 2026.
    name: 'JCWI Irregular Migrants Helpline',
    phone: '0800 160 1004',
    website: 'https://jcwi.org.uk/our-helplines',
    description: 'Free, confidential legal advice if you are in the UK without status. Mondays, Tuesdays and Thursdays, 10am to 1pm',
  },
  project17: {
    // Website only (contract): its only published number is a mobile with no
    // hours. Its speciality is families with children (Charity Commission,
    // 1152621; Tower Hamlets and Cumberland directories, read 20 November 2026),
    // so the line says so and people decide whether it fits them
    // (Managing Director, 20 November 2026).
    name: 'Project 17',
    website: 'https://www.project17.org.uk',
    description: 'For families with children who have no recourse to public funds',
  },
  turn2usBenefits: {
    name: 'Turn2us Benefits Calculator',
    website: 'https://www.turn2us.org.uk/get-support',
    description: 'Best for benefits: check which benefits could help you. Website only',
  },
  turn2usGrants: {
    name: 'Turn2us Grants Search',
    website: 'https://grants-search.turn2us.org.uk',
    description: 'Best for grants: search for charitable grants you may be eligible for. Website only',
  },
  nea: {
    name: "National Energy Action's Energy Advice and Support Service",
    phone: '0800 304 7159',
    website: 'https://www.nea.org.uk/advice/',
    description: 'Free energy advice, including help with energy bills. Open Monday to Thursday 10am to 4pm, Friday 10am to 12.30pm',
  },
  citizensAdviceEnergy: {
    name: 'Citizens Advice energy line',
    phone: '0808 223 1133',
    website: 'https://www.citizensadvice.org.uk/energyadvice',
    description: 'Advice on energy. 9am to 5pm, Monday to Friday, not on public holidays',
  },
};

// `zeroMatch`: nothing local matched, or local results could not be loaded.
// The energy pair is for that case only (decision of 19 November 2026; the
// contract's national table).
function v4Fallbacks(session: SessionState, zeroMatch: boolean): Floor[] {
  if (!session.v4Option) return [];
  const parts = partsFor(session.v4Option as FirstOptionId, session.v4Choice ?? undefined);
  const out: Floor[] = [];
  // Deduped by entry, not by name: two entries share the name "Citizens Advice
  // Adviceline" with different lines on what each is for, and neither may be lost.
  const push = (f: Floor | undefined) => { if (f && !out.includes(f)) out.push(f); };
  for (const part of parts) {
    const subs = part.subs ?? [];
    const has = (k: string) => subs.length === 0 || subs.includes(k);
    switch (part.parent) {
      case 'health':
        push(V4_FLOORS.nhs111);
        if (session.lgbtq === true) push(V4_FLOORS.lgbtFoundation);
        break;
      case 'finance': {
        // Citizens Advice and Turn2us for every money need, each saying what it
        // is best for, the one for the person's question first (Managing
        // Director, 19 November 2026).
        const all = [V4_FLOORS.citizensAdvice, V4_FLOORS.turn2usBenefits, V4_FLOORS.turn2usGrants];
        const first = subs.includes('benefits') ? V4_FLOORS.turn2usBenefits
          : subs.includes('grants') ? V4_FLOORS.turn2usGrants
          : subs.includes('debt-and-money-management') ? V4_FLOORS.citizensAdvice : undefined;
        // Bills and energy with nothing local: National Energy Action first (decision of 19 November 2026).
        if (zeroMatch && subs.includes('bills-and-energy')) { push(V4_FLOORS.nea); push(V4_FLOORS.citizensAdviceEnergy); }
        push(first);
        for (const f of all) push(f);
        break;
      }
      case 'employment':
        push(V4_FLOORS.jobcentrePlus);
        // The phone line is for 18 and over; the website for under-18s (contract).
        push(session.ageCategory === '16-17' ? V4_FLOORS.nationalCareersYoung : V4_FLOORS.nationalCareersAdult);
        break;
      case 'addiction':
        // No national alcohol line has been verified at source (design note, section 11).
        // FRANK is the drugs floor; "Drugs or alcohol" carries both keys.
        if (has('drugs')) push(V4_FLOORS.frank);
        if (has('gambling')) push(V4_FLOORS.gamblingHelpline);
        break;
      case 'immigration':
        // Someone to speak to, every time (Managing Director, 20 November 2026).
        if (session.immigrationStatus === 'Asylum seeker') push(V4_FLOORS.migrantHelp);
        else if (session.immigrationStatus && session.immigrationStatus !== 'Prefer not to say') push(V4_FLOORS.citizensAdviceImmigration);
        else { push(V4_FLOORS.migrantHelp); push(V4_FLOORS.citizensAdviceImmigration); }
        if (session.immigrationStatus === 'No status') push(V4_FLOORS.jcwi);
        // Anyone who may have no recourse to public funds, except people waiting
        // for an asylum decision: leave to remain with no recourse, no status, or no status given
        // (Managing Director, 20 November 2026).
        if ((session.immigrationStatus === 'Leave to remain' && session.publicFunds === 'No')
          || session.immigrationStatus === 'No status'
          || !session.immigrationStatus || session.immigrationStatus === 'Prefer not to say') push(V4_FLOORS.project17);
        break;
    }
  }
  return out;
}

function v4DisplayName(session: SessionState): string {
  const option = session.v4Option ? firstOption(session.v4Option as FirstOptionId) : null;
  const label = session.v4Choice && session.v4Choice !== 'Something else' ? session.v4Choice : option?.label ?? 'support';
  return `services for ${label.toLowerCase()}`;
}

// Each profile answer is carried forward with whichever question comes next,
// so no answer is lost when questions come in a different order for
// different needs.
function routeToNextProfileQuestion(session: SessionState, after?: 'age' | 'gender' | 'lgbtq' | 'convictions' | 'nrpf' | 'children'): RoutingResult {
  const asked = [...new Set([...(session.profileAsked ?? []), ...(after ? [after] : [])])];
  const result = nextProfileQuestion({ ...session, profileAsked: asked }, after);
  const carried: Partial<SessionState> = {
    profileAsked: asked,
    ageCategory: session.ageCategory,
    gender: session.gender,
    lgbtq: session.lgbtq,
    criminalConvictions: session.criminalConvictions,
    immigrationStatus: session.immigrationStatus,
    publicFunds: session.publicFunds,
    hasChildren: session.hasChildren,
  };
  return { ...result, stateUpdates: { ...carried, ...result.stateUpdates } };
}

function nextProfileQuestion(session: SessionState, after?: 'age' | 'gender' | 'lgbtq' | 'convictions' | 'nrpf' | 'children'): RoutingResult {
  const need = session.supportNeed || '';
  const required = session.v4Option ? v4Requirements(session) : (needProfileRequirements[need] || []);

  // Check each required field in order
  for (const field of required) {
    // Skip the field we just answered — prevents re-triggering on null PNTS values
    if (after && field === after) continue;
    // Skip any field already asked, so "prefer not to say" is not asked again
    if (session.profileAsked?.includes(field)) continue;

    // Age
    if (field === 'age' && !session.ageCategory) {
      return {
        ...phrase('B5_PROFILE_AGE', session.isSupporter),
        stateUpdates: { 
          currentGate: 'B5_PROFILE_AGE', 
          supportNeed: session.supportNeed,
          needCount: session.needCount
        }
      };
    }
    
    // Gender
    if (field === 'gender' && !session.gender) {
      return {
        ...phrase('B5_PROFILE_GENDER', session.isSupporter),
        stateUpdates: { 
          currentGate: 'B5_PROFILE_GENDER',
          ageCategory: session.ageCategory 
        }
      };
    }
    
    // LGBTQ
    if (field === 'lgbtq' && session.lgbtq == null) {
      return {
        ...phrase('B5_PROFILE_LGBTQ', session.isSupporter),
        stateUpdates: {
          currentGate: 'B5_PROFILE_LGBTQ',
          gender: session.gender
        }
      };
    }
    
    // Criminal convictions
    if (field === 'convictions' && !session.criminalConvictions) {
      return {
        ...phrase('B5_PROFILE_CONVICTIONS', session.isSupporter),
        stateUpdates: { 
          currentGate: 'B5_PROFILE_CONVICTIONS',
          ageCategory: session.ageCategory 
        }
      };
    }
    
    // Immigration status (derives publicFunds)
    if (field === 'nrpf' && session.immigrationStatus == null) {
      return {
        ...phrase('IMMIGRATION_STATUS_ASK', session.isSupporter),
        stateUpdates: {
          currentGate: 'IMMIGRATION_STATUS_ASK',
          criminalConvictions: session.criminalConvictions
        }
      };
    }
    
    // Children/dependents
    if (field === 'children' && session.hasChildren == null) {
      return {
        ...phrase('B5_PROFILE_CHILDREN', session.isSupporter),
        stateUpdates: { 
          currentGate: 'B5_PROFILE_CHILDREN',
          publicFunds: session.publicFunds 
        }
      };
    }
  }
  
  // All required fields collected. The noticing step comes before the
  // results, once a session, where the need takes it (design note 3.5).
  if (takesNoticingStep(session)) {
    return {
      text: noticingText(session),
      options: noticingOptions(session),
      multiSelect: noticingMultiSelect(session),
      stateUpdates: { currentGate: 'B5_NOTICING', noticingAsked: true, unclearCount: 0 },
    };
  }
  // "Not sure where to start" with more than one pressure ticked: the
  // awareness line with the results (Managing Director, 26 November 2026).
  return finishWithResults(session, session.notSureAware ? awarenessLine(session) : undefined);
}

// The in-person route for "not sure where to start": a place to start where
// one can be offered; the assistant cannot read them yet (work item 20), so
// for now the line and the first question again (Managing Director,
// 8 November 2026), without "not sure where to start", so it cannot lead
// round in a circle (#73 review; Managing Director, 26 November 2026).
function notSureInPerson(session: SessionState, updates: Partial<SessionState>): RoutingResult {
  const menu = firstQuestionWithoutNotSure(session);
  return { ...menu, text: `${NO_PLACE_TO_START}\n\n${menu.text}`, stateUpdates: { ...menu.stateUpdates, ...updates, notSureInPersonShown: true } };
}

// The first question with "not sure where to start" left off. It is the last
// option, so the others keep their numbers.
function firstQuestionWithoutNotSure(session: SessionState): RoutingResult {
  const menu = phrase('B5_MAIN_SUPPORT_NEED', session.isSupporter);
  const all = menu.options ?? [];
  if (!/not sure where to start/i.test(all[all.length - 1] ?? '')) return menu;
  const options = all.slice(0, -1);
  const intro = menu.text.split('\n').filter(line => !/^\d+\. /.test(line)).join('\n').trimEnd();
  return { ...menu, text: `${intro}\n\n${options.map((o, i) => `${i + 1}. ${o}`).join('\n')}`, options };
}

// The results for the person's need, then the question about other needs.
// `lead` is shown before the results (the noticing step's awareness line).
// The awareness line says "Here's help with ...", so it leads only where local
// services are listed; it is not shown above a zero-match or "can't load" result
// (Safeguarding Contract, invariant 5: confidence matches the data). After
// dignity items, the one onward offer follows the results (design note 3.7).
function finishWithResults(session: SessionState, lead?: string): RoutingResult {
  const result = buildTerminalServices(session);
  const additionalNeeds = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
  const shownLead = lead && result.hasLocal ? lead + '\n\n' : '';
  const offer = isDignityChoice(session) ? '\n' + DIGNITY_OFFER + '\n' : '';
  return {
    text: shownLead + result.text + '\n' + offer + additionalNeeds?.text,
    options: additionalNeeds?.options,
    stateUpdates: {
      currentGate: 'TERMINAL_ADDITIONAL_NEEDS' as const,
      ...(result.terminalOutcome ? { terminalOutcome: result.terminalOutcome } : {})
    },
    sessionEnded: false
  };
}

// Note: Local services are now fetched dynamically via getServicesForNeed()
// National fallbacks are defined in buildNonHousingTerminal()

// ============================================================
// NON-HOUSING TERMINAL BUILDER
// For Food, Health, Items, Work, etc. - uses local service matching
// ============================================================

// National fallback services for each need type
const nationalFallbacks: Record<string, Array<{name: string; phone?: string; website: string; description: string}>> = {
  'Food': [],
  'Health': [
    {
      name: 'NHS 111',
      phone: '111',
      website: 'https://111.nhs.uk',
      description: 'For urgent medical help when it is not an emergency'
    }
  ],
  'Financial': [
    {
      name: 'Turn2us Benefits Calculator',
      website: 'https://www.turn2us.org.uk/get-support',
      description: 'Check which benefits could help you'
    },
    {
      name: 'Turn2us Grants Search',
      website: 'https://grants-search.turn2us.org.uk',
      description: 'Search for charitable grants you may be eligible for'
    }
  ],
  'Work': [
    {
      name: 'Jobcentre Plus',
      website: 'https://www.gov.uk/contact-jobcentre-plus',
      description: 'Help with job searching, benefits and training'
    }
  ],
  'Training': [
    {
      name: 'National Careers Service',
      phone: '0800 072 0288', // adults 18+ (nationalcareers.service.gov.uk/contact-us, 19 November 2026); 0800 100 900 is retired
      website: 'https://nationalcareers.service.gov.uk',
      description: 'Free careers advice, skills assessment and training information'
    }
  ],
  'Advice': [
    {
      name: 'Citizens Advice',
      phone: '0800 144 8848',
      website: 'https://www.citizensadvice.org.uk',
      description: 'Free, confidential advice on benefits, debt, housing, legal and other issues'
    }
  ]
};

function buildSSNBrowseLink(displayName: string, la: string, categoryKey: string): string {
  const slug = la.toLowerCase().replace(/\s+/g, '-');
  return `https://streetsupport.net/${slug}/find-help/category/?category=${categoryKey}`;
}

function buildNationalFallbacksBlock(fallbacks: Array<{name: string; phone?: string; website: string; description: string}>): string {
  let text = `NATIONAL RESOURCES\n`;
  text += `------------------\n\n`;
  for (const svc of fallbacks) {
    text += `${svc.name}\n`;
    if (svc.phone) {
      text += `${svc.phone}\n`;
    }
    text += `${svc.website}\n`;
    text += `${svc.description}\n\n`;
  }
  return text;
}

function buildZeroMatchTerminal(
  need: string,
  la: string,
  fallbacks: Array<{name: string; phone?: string; website: string; description: string}>,
  categoryKey: string,
  displayName: string,
  isSupporter: boolean
): { text: string; terminalOutcome: string } {
  const hasFallbacks = fallbacks.length > 0;
  let text = '';

  if (hasFallbacks) {
    // Type B/C: national floor exists
    text += `I haven't found specific ${displayName} in ${la} yet, but these national services can help.\n\n`;
    text += buildNationalFallbacksBlock(fallbacks);
  } else {
    // Type A: no national fallback — honest acknowledgement
    const phraseText = getPhrase('TERMINAL_ZERO_MATCH_NO_FALLBACK', isSupporter)?.text || '';
    text += phraseText
      .replace('{category}', displayName)
      .replace('{la}', la) + '\n\n';
  }

  // SSN browse link
  if (categoryKey && la !== 'your area') {
    text += `---\n\n`;
    text += `Browse ${displayName} in ${la}:\n`;
    text += buildSSNBrowseLink(displayName, la, categoryKey) + '\n';
  }

  return { text: text.trim(), terminalOutcome: 'NO_SUITABLE_PATHWAY' };
}

// Live read failed: say so plainly. Never tell the person there is no local
// support when the VA simply could not load it. National floors still show.
// Wording proposed, 2 November 2026, for approval.
function buildLocalResultsUnavailableTerminal(
  la: string,
  fallbacks: Array<{name: string; phone?: string; website: string; description: string}>,
  categoryKey: string,
  displayName: string
): { text: string; terminalOutcome: string } {
  let text = `I can't load local ${displayName} right now.`;
  text += fallbacks.length > 0
    ? ` These national services can help in the meantime.\n\n` + buildNationalFallbacksBlock(fallbacks)
    : ` Please try again in a few minutes.\n\n`;

  if (categoryKey && la !== 'your area') {
    text += `---\n\n`;
    text += `You can also search ${displayName} in ${la} on Street Support:\n`;
    text += buildSSNBrowseLink(displayName, la, categoryKey) + '\n';
  }

  return { text: text.trim(), terminalOutcome: 'LOCAL_RESULTS_UNAVAILABLE' };
}

function buildNonHousingTerminal(session: SessionState): TerminalResult {
  const need = session.supportNeed || 'support';
  const la = session.localAuthority || 'your area';
  const v4 = !!session.v4Option;
  const displayName = v4 ? v4DisplayName(session) : (needDisplayNames[need] || need.toLowerCase());
  // The "see all" link moves to the V4 category with the matcher (design note, 4.6).
  const categoryKey = v4 ? (v4Parents(session)[0] ?? '') : getPrimaryCategoryKey(need);

  // Build profile for service matching
  const profile = toUserProfile(session);

  // Live read unavailable: say so, do not fall back to the January file
  if (getServicePool()?.status === 'unavailable') {
    const shown = v4 ? v4Fallbacks(session, true) : (nationalFallbacks[need] || []);
    return buildLocalResultsUnavailableTerminal(la, shown, categoryKey, displayName);
  }

  // Get matched local services
  const localServices = getServicesForNeed(need, profile);
  const hasLocalServices = localServices.length > 0;
  const fallbacks = v4 ? v4Fallbacks(session, !hasLocalServices) : (nationalFallbacks[need] || []);

  // Zero-match path
  if (!hasLocalServices) {
    return buildZeroMatchTerminal(need, la, fallbacks, categoryKey, displayName, session.isSupporter);
  }

  let text = '';

  // Opening line - personalised if profile was used
  if (v4 ? v4Requirements(session).length > 0 : isProfileRelevantNeed(need)) {
    text += `Based on what you have told me, here are some ${displayName} in ${la} that may be able to help.\n\n`;
  } else {
    text += `Here are some ${displayName} in ${la}.\n\n`;
  }

  // Local services section
  text += `LOCAL SERVICES\n`;
  text += `--------------\n\n`;

  for (const svc of localServices) {
    text += `${svc.name}\n`;
    if (svc.phone) {
      text += `${svc.phone}\n`;
    }
    if (svc.website) {
      text += `${svc.website}\n`;
    }
    // Description with access note
    let desc = svc.description;
    if (svc.isDropIn) {
      desc += ` No appointment needed.`;
    } else if (svc.appointmentOnly) {
      desc += ` Appointment required.`;
    }
    text += `${desc}\n\n`;
  }

  // National fallbacks section
  if (fallbacks.length > 0) {
    text += `---\n\n`;
    text += buildNationalFallbacksBlock(fallbacks);
  }

  // LGBT Foundation for LGBTQ+ users on Health need (V4: among the national contacts above)
  if (!v4 && session.lgbtq === true && need === 'Health') {
    const lgbtPhrase = getPhrase('TERMINAL_LGBT_FOUNDATION_HEALTH', session.isSupporter);
    if (!fallbacks.length) text += `---\n\n`;
    text += `LGBT Foundation\n`;
    text += `0345 3 30 30 30\n`;
    text += `https://lgbt.foundation\n`;
    text += (lgbtPhrase?.text || '') + '\n\n';
  }

  // Search link for more options
  if (categoryKey && la !== 'your area') {
    text += `---\n\n`;
    text += `Find more ${displayName} in ${la}:\n`;
    text += buildSSNBrowseLink(displayName, la, categoryKey) + '\n';
  }

  return { text: text.trim(), hasLocal: true };
}

// ============================================================
// HOUSING SITUATION (Managing Director, 3 November 2026)
// ============================================================

const HOUSING_SITUATION_BY_CHOICE: Record<number, HousingSituation> = {
  1: 'KEEP_STEADY',
  2: 'LOSING_HOME',
  3: 'STAYING_SOMEWHERE',
  4: 'LEAVING_PRISON',
  5: 'LEAVING_HOSPITAL',
  6: 'NOWHERE_TONIGHT',
  7: 'NOT_SURE',
};

// The older fields the rest of the conversation reads, set from the answer.
// Not sure makes no assumption either way.
const HOUSING_SITUATION_STATE: Record<HousingSituation, Partial<SessionState>> = {
  KEEP_STEADY: { homeless: false, housedSituation: 'At home', sleepingSituation: null },
  LOSING_HOME: { homeless: false, housedSituation: 'At home', sleepingSituation: null },
  STAYING_SOMEWHERE: { homeless: true, housedSituation: null, sleepingSituation: 'Staying somewhere for now' },
  LEAVING_PRISON: { homeless: true, housedSituation: null, sleepingSituation: 'Leaving prison' },
  LEAVING_HOSPITAL: { homeless: true, housedSituation: null, sleepingSituation: 'Leaving hospital' },
  NOWHERE_TONIGHT: { homeless: true, housedSituation: null, sleepingSituation: 'Rough sleeping or nowhere tonight' },
  NOT_SURE: { homeless: null, housedSituation: null, sleepingSituation: null },
};

function isRoughSleeping(session: SessionState): boolean {
  return !!session.sleepingSituation?.toLowerCase().includes('rough');
}

// Housing results at the end of the quick route, with StreetLink first for
// someone sleeping rough or with nowhere to stay tonight.
function housingResultsTerminal(session: SessionState): RoutingResult {
  const result = buildTerminalServices(session);
  const additionalNeeds = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);

  let text = result.text;
  if (isRoughSleeping(session)) {
    const streetlink = getPhrase('STREETLINK_SIGNPOST', session.isSupporter);
    text = (streetlink?.text || '') + '\n\n' + result.text;
  }

  return {
    text: text + '\n' + additionalNeeds?.text,
    options: additionalNeeds?.options,
    stateUpdates: {
      currentGate: 'TERMINAL_ADDITIONAL_NEEDS',
      sleepingSituation: session.sleepingSituation,
      housingOptionsInvolvement: session.housingOptionsInvolvement,
      ...(result.terminalOutcome ? { terminalOutcome: result.terminalOutcome } : {}),
    },
    sessionEnded: false
  };
}

// After the Housing Options question: prevention for option 1, crisis results
// for the rest. On the full route, someone about to lose their home skips
// "how long has this been going on" and goes to the reason question.
function routeHousingSituation(session: SessionState): RoutingResult {
  const hoUpdate = { housingOptionsInvolvement: session.housingOptionsInvolvement };

  if (session.housingSituation === 'KEEP_STEADY') {
    return {
      ...phrase('B7B_PREVENTION_REASON', session.isSupporter),
      stateUpdates: { currentGate: 'B7B_PREVENTION_REASON', preventionNeed: true, ...hoUpdate }
    };
  }

  if (session.routeType === 'QUICK') {
    return housingResultsTerminal(session);
  }

  if (session.housingSituation === 'LOSING_HOME') {
    return {
      ...phrase('B9_REASON', session.isSupporter),
      stateUpdates: { currentGate: 'B9_REASON', ...hoUpdate }
    };
  }

  return {
    ...phrase('B8_DURATION', session.isSupporter),
    stateUpdates: { currentGate: 'B8_DURATION', ...hoUpdate }
  };
}

// An eviction notice, or being told to leave by family or friends, means the
// loss has materialised while the person is still housed, so they are about
// to lose their home, not keeping things steady (Managing Director,
// 3 and 6 November 2026). They go on as if they had chosen that answer.
function routeNoticeToLeave(session: SessionState, choice: number): RoutingResult {
  const losing: Partial<SessionState> = {
    housingSituation: 'LOSING_HOME',
    ...HOUSING_SITUATION_STATE.LOSING_HOME,
    preventionNeed: false,
    preventionReason: choice === 2 ? 'Eviction notice' : 'Family/friends notice',
  };
  const result = routeHousingSituation({ ...session, ...losing } as SessionState);
  return { ...result, stateUpdates: { ...losing, ...result.stateUpdates } };
}

// ============================================================
// TERMINAL OUTPUT BUILDER - RESTRUCTURED v7.1
// Clear hierarchy: First Step -> Outreach -> Local Support -> Specialist -> Youth -> Safety Net
// ============================================================

function buildTerminalServices(session: SessionState): TerminalResult {
  // Check if this is a non-housing need
  const housingRelatedNeeds = ['Emergency Housing'];
  if (session.supportNeed && !housingRelatedNeeds.includes(session.supportNeed)) {
    return buildNonHousingTerminal(session);
  }
  
  const la = session.localAuthority || 'your local council';
  const isSupporter = session.isSupporter;
  const { they, their: possessive, them: pronoun, theyre, theyve } = getPronouns(isSupporter);
  
  // Build user profile for service matching
  const profile = toUserProfile(session);

  // Get services
  const councilOrg = getCouncilOrg(session.localAuthority);
  const localSupportOrgs = getLocalSupportOrgs(session.localAuthority);
  const navigatorOrgs = getNavigatorOrgs(session.localAuthority, session.detailedAge || session.ageCategory);
  const specialistOrgs = getSpecialistOrgs(profile);
  const dvOrgs = getDVOrgs(session.localAuthority);
  const localImmigrationOrgs = getImmigrationOrgs(session.localAuthority);
  const youthOrgs = getYouthOrgs(profile);
  const shelter = getShelterInfo(session.jurisdiction);
  const streetLink = getStreetLinkInfo();
  
  let text = '';

  const heading = (title: string): string => `${title}\n${'-'.repeat(title.length)}\n`;
  const serviceLines = (svc: { name: string; phone?: string | null; website?: string | null; description?: string | null }): string => {
    let s = `${svc.name}\n`;
    if (svc.phone) s += `${svc.phone}\n`;
    if (svc.website) s += `${svc.website}\n`;
    if (svc.description) s += `${svc.description}\n`;
    return s + `\n`;
  };

  // ----------------------------------------
  // LEAVING PRISON - local services that work specifically with people leaving
  // prison, where any, shown first (Housing Pathway Endpoints Contract 1.4,
  // Leaving Prison). Selected by the V4 population tag only. The data carries
  // no referral field, so the referral line goes on the section, not per
  // service.
  // LEAVING HOSPITAL - no structured field identifies hospital discharge
  // services, so there are none to surface yet (Housing Pathway Endpoints
  // Contract 1.4, Leaving Hospital). Where a section of them is ever shown,
  // its referral line names the staff looking after the person at the
  // hospital. No keyword search.
  // ----------------------------------------
  const prisonLeaverServices = session.housingSituation === 'LEAVING_PRISON'
    ? getHousingServicesForPopulation('people-with-criminal-records', profile)
    : [];
  // Someone still in prison or hospital can ask the staff there to refer them
  // to the council's housing team (Endpoints Contract 1.4).
  const institution = session.housingSituation === 'LEAVING_PRISON' ? 'prison'
    : session.housingSituation === 'LEAVING_HOSPITAL' ? 'hospital' : null;
  const staffReferralLine = institution
    ? `If ${theyre} still in ${institution}, ${they} can ask the staff there to refer ${pronoun} to this team.\n`
    : '';
  // 16 and 17 year olds: youth justice worker; adults: probation officer
  // (Managing Director, 20 November 2026).
  const prisonLeaverSection = (): string => {
    if (prisonLeaverServices.length === 0) return '';
    const officer = is16_17 ? 'youth justice worker' : 'probation officer';
    let s = heading('SERVICES FOR PEOPLE LEAVING PRISON');
    s += `Some of these take referrals only. If so, the referral comes through ${possessive} ${officer} or the team in the prison that deals with release and housing.\n\n`;
    for (const svc of prisonLeaverServices) s += serviceLines(svc);
    return s;
  };

  // ----------------------------------------
  // 16-17 WITH SOCIAL SERVICES — special layout
  // ----------------------------------------
  const effectiveAge = session.detailedAge || session.ageCategory;
  const is16_17 = effectiveAge === '16-17';
  const hasSocialServices = session.socialServices === 'Yes';

  // Children's Services framing and LA duty team contact, shown first for every 16-17 year old
  const childrensServicesFirstStep = (): string => {
    const csPhrase = getPhrase('TERMINAL_YOUTH_16_17_CHILDRENS_SERVICES', isSupporter);
    let cs = `${csPhrase?.text}\n\n`;

    const laKey = session.localAuthority?.toLowerCase().replace(/\s+/g, '') || '';
    const childServices = childrenServicesData[laKey];
    if (childServices) {
      cs += `${childServices.name}\n`;
      cs += `${childServices.phone}`;
      if (childServices.phoneOOH) {
        cs += ` (out of hours: ${childServices.phoneOOH})`;
      }
      cs += `\n`;
      cs += `${childServices.website}\n\n`;
    }
    return cs;
  };

  if (is16_17 && hasSocialServices) {
    text += `I've found some services that can help with ${possessive} situation.\n\n`;

    // Children's Services as primary route
    text += `YOUR FIRST STEP\n`;
    text += `---------------\n`;
    text += childrensServicesFirstStep();

    // Already involved and still looking: say so neutrally, without judging
    // the worker (Managing Director, 2 and 3 November 2026)
    text += `If ${they} need something different, or more help alongside that, these can help too.\n\n`;
    text += prisonLeaverSection();

    // Age-filtered navigator orgs as secondary
    if (navigatorOrgs.length > 0) {
      const navIntro = getPhrase('TERMINAL_YOUTH_16_17_NAVIGATOR_INTRO', isSupporter);
      text += `LOCAL SUPPORT\n`;
      text += `-------------\n`;
      text += `${navIntro?.text}\n\n`;

      for (const org of navigatorOrgs) {
        text += `${org.name}\n`;
        if (org.phone) text += `${org.phone}\n`;
        if (org.email) text += `${org.email}\n`;
        if (org.availabilityNote) text += `${org.availabilityNote}\n`;
        if (org.website) text += `${org.website}\n`;
        if (org.description) text += `${org.description}\n`;
        text += `\n`;
      }
    } else {
      // No navigator orgs — reinforce statutory route + Childline
      const reinforcement = getPhrase('TERMINAL_YOUTH_16_17_NO_NAVIGATOR_REINFORCEMENT', isSupporter);
      text += `${reinforcement?.text}\n\n`;
    }

    // Housing Options as additional resource
    if (councilOrg) {
      text += `HOUSING OPTIONS\n`;
      text += `---------------\n`;
      text += `${councilOrg.name}\n`;
      if (councilOrg.phone) text += `${councilOrg.phone}\n`;
      if (councilOrg.website) text += `${councilOrg.website}\n`;
      // Needs the technical lead's eye: 16 and 17 year olds with a social
      // worker also see the staff referral line for prison or hospital
      // (review, 20 November 2026). Safeguarding-adjacent layout.
      if (staffReferralLine) text += staffReferralLine;
      text += `\n`;
    }

    // Shelter safety net
    text += `IF YOU NEED MORE HELP\n`;
    text += `---------------------\n`;
    text += `If ${theyre} finding it hard to get through to services, or ${they}'d like to talk through ${possessive} options with someone, Shelter's helpline is there for ${pronoun}:\n\n`;
    text += `${shelter.name}\n`;
    text += `${shelter.phone} (free, 8am-8pm weekdays, 9am-5pm weekends)\n`;
    text += `${shelter.website}\n\n`;
    text += `They can explain ${possessive} rights, help ${pronoun} prepare for conversations with the council, and support ${pronoun} if things aren't going well.\n\n`;

    // Warm close
    text += `---\n\n`;
    text += `${theyve.charAt(0).toUpperCase() + theyve.slice(1)} taken an important step by reaching out today.`;

    return { text };
  }

  // ----------------------------------------
  // OPENING - Acknowledge their situation
  // ----------------------------------------
  text += `I've found some services that can help with ${possessive} situation.\n\n`;

  // 16 and 17 year olds see Children's Services first, then these.
  if (!is16_17) text += prisonLeaverSection();

  // ----------------------------------------
  // YOUR FIRST STEP - Council Housing Options
  // 16-17 not involved with social services: Children's Services first, then Housing Options
  // (the children's services duty takes precedence for 16 and 17 year olds)
  // ----------------------------------------
  text += `YOUR FIRST STEP\n`;
  text += `---------------\n`;

  if (is16_17) {
    text += childrensServicesFirstStep();
    text += `HOUSING OPTIONS\n`;
    text += `---------------\n`;
  }

  if (councilOrg) {
    text += `${councilOrg.name}\n`;
    if (councilOrg.phone) {
      text += `${councilOrg.phone}\n`;
    }
    if (councilOrg.website) {
      text += `${councilOrg.website}\n`;
    }
    text += `\n`;
    text += `This is the council's housing team. `;
    
    // Contextual advice based on situation
    if (session.housingSituation === 'NOWHERE_TONIGHT') {
      text += `Explain what's happening and ask for a homelessness assessment. Let them know ${theyre} sleeping rough or have nowhere to stay tonight - this is urgent.\n`;
    } else if (session.sleepingSituation?.toLowerCase().includes('rough')) {
      text += `Explain what's happening and ask for a homelessness assessment. Let them know ${theyre} sleeping rough - this is urgent.\n`;
    } else if (session.housingSituation === 'LOSING_HOME') {
      text += `They can help when ${theyre} about to lose ${possessive} home, so it's best to contact them as soon as ${they} can.\n`;
    } else if (session.housingSituation === 'LEAVING_PRISON' || session.housingSituation === 'LEAVING_HOSPITAL') {
      text += `Explain what's happening and ask for a homelessness assessment.\n`;
      text += staffReferralLine;
    } else if (session.homeless || session.sleepingSituation) {
      text += `Explain what's happening and ask for a homelessness assessment.\n`;
    } else if (session.preventionNeed) {
      text += `Let them know ${theyre} at risk of losing ${possessive} home - they can help before it becomes a crisis.\n`;
    } else {
      text += `Ask for a housing assessment and explain ${possessive} circumstances.\n`;
    }
  } else {
    // Fallback if no council org found
    text += `${la} Council Housing Options\n`;
    text += `https://www.gov.uk/find-local-council\n\n`;
    text += `This is the council's housing team. Ask for a homelessness assessment.\n`;
    text += staffReferralLine;
  }
  
  text += `\n`;

  // 16 and 17 year olds: after Children's Services and Housing Options.
  if (is16_17) text += prisonLeaverSection();
  
  // ----------------------------------------
  // STREETLINK - If rough sleeping (urgent outreach)
  // ----------------------------------------
  if (session.sleepingSituation?.toLowerCase().includes('rough')) {
    text += `OUTREACH SUPPORT\n`;
    text += `----------------\n`;
    text += `${streetLink.name}\n`;
    text += `${streetLink.website}\n`;
    if (streetLink.phone) {
      text += `${streetLink.phone}\n`;
    }
    text += `\n`;
    text += `This alerts local outreach teams to ${possessive} location so they can find ${pronoun} and offer support.\n\n`;
  }

  // ----------------------------------------
  // VETERANS - a yes to the armed forces question (Housing Pathway Endpoints
  // Contract 1.4, Veterans). Op FORTITUDE always, then local housing services
  // designed for veterans, where any, by the V4 population tag. No or prefer
  // not to say changes nothing.
  // ----------------------------------------
  if (session.servedInArmedForces === true) {
    text += heading('SUPPORT FOR VETERANS');
    text += serviceLines(getOpFortitudeInfo(isSupporter));
    for (const svc of getHousingServicesForPopulation('veterans', profile)) text += serviceLines(svc);
  }
  
  // ----------------------------------------
  // LOCAL HOUSING ADVICE - someone about to lose their home
  // Organisations that help at this point, from the platform's housing and
  // legal advice listings (Managing Director, 3 November 2026)
  // ----------------------------------------
  const losingHome = session.housingSituation === 'LOSING_HOME';
  if (losingHome) {
    const housingAdvice = getHousingAdviceServices(profile);
    if (housingAdvice.length > 0) {
      text += `LOCAL HOUSING ADVICE\n`;
      text += `--------------------\n`;
      for (const svc of housingAdvice) {
        text += `${svc.name}\n`;
        if (svc.phone) text += `${svc.phone}\n`;
        if (svc.website) text += `${svc.website}\n`;
        if (svc.description) text += `${svc.description}\n`;
        text += `\n`;
      }
    }
  }

  // ----------------------------------------
  // LOCAL SUPPORT - Drop-in services and navigator orgs
  // Someone about to lose their home is not shown the adult housing navigators,
  // which are for exploring other options. Young people's routes stay.
  // ----------------------------------------
  const shownNavigators = losingHome ? navigatorOrgs.filter(n => n.isYouthRoute) : navigatorOrgs;
  const allLocalOrgs = [...localSupportOrgs, ...shownNavigators];
  if (allLocalOrgs.length > 0) {
    text += `LOCAL SUPPORT\n`;
    text += `-------------\n`;

    for (const org of allLocalOrgs) {
      text += `${org.name}\n`;
      if (org.phone) {
        text += `${org.phone}\n`;
      }
      if (org.email) {
        text += `${org.email}\n`;
      }
      if (org.availabilityNote) {
        text += `${org.availabilityNote}\n`;
      }
      if (org.website) {
        text += `${org.website}\n`;
      }
      if (org.description) {
        text += `${org.description}\n`;
      }
      text += `\n`;
    }
  }
  
  // ----------------------------------------
  // SPECIALIST SUPPORT - LGBTQ+, Immigration, etc
  // ----------------------------------------
  const isNRPF = profile.immigrationStatus === 'No status' ||
                 profile.immigrationStatus === 'Asylum seeker' ||
                 profile.publicFunds === 'No';
  const allSpecialistOrgs = [...specialistOrgs, ...(isNRPF ? localImmigrationOrgs : [])];
  if (allSpecialistOrgs.length > 0) {
    text += `SPECIALIST SUPPORT\n`;
    text += `------------------\n`;

    for (const org of allSpecialistOrgs) {
      text += `${org.name}\n`;
      if (org.phone) {
        text += `${org.phone}\n`;
      }
      if (org.website) {
        text += `${org.website}\n`;
      }
      if (org.description) {
        text += `${org.description}\n`;
      }
      text += `\n`;
    }
  }

  // ----------------------------------------
  // NRPF FAMILY SUPPORT - for NRPF/uncertain + dependents (children or pregnant)
  // ----------------------------------------
  const isNRPFUncertain = profile.publicFunds === 'No' || profile.publicFunds === 'Not sure';
  const hasDependents = profile.hasChildren === true; // already includes pregnant via toUserProfile
  if (isNRPFUncertain && hasDependents) {
    const nrpfFamilyPhrase = getPhrase('TERMINAL_NRPF_FAMILY_SUPPORT', isSupporter);
    text += `FAMILY & IMMIGRATION SUPPORT\n`;
    text += `----------------------------\n`;

    // LA-specific Children's Services
    const laKey = session.localAuthority?.toLowerCase().replace(/\s+/g, '') || '';
    const childServices = childrenServicesData[laKey];
    if (childServices) {
      text += `${childServices.name}\n`;
      text += `${childServices.phone}\n`;
      if (childServices.website) {
        text += `${childServices.website}\n`;
      }
    }
    text += (nrpfFamilyPhrase?.text || '') + '\n\n';

    // Project 17, only if not already shown in the specialist section, as for
    // Migrant Help below; one description everywhere (Managing Director,
    // 20 November 2026).
    if (!allSpecialistOrgs.some(o => o.name === 'Project 17')) {
      text += `Project 17\n`;
      text += `https://www.project17.org.uk\n`;
      text += `For families with children who have no recourse to public funds\n\n`;
    }

    // Migrant Help — only if not already shown in specialist section
    const migrantHelpInSpecialist = allSpecialistOrgs.some(o => o.name === 'Migrant Help');
    if (!migrantHelpInSpecialist) {
      text += `Migrant Help\n`;
      text += `0808 8010 503\n`;
      text += `https://www.migranthelpuk.org\n`;
      text += `Support for asylum seekers and refugees\n\n`;
    }
  }

  // ----------------------------------------
  // DOMESTIC ABUSE SUPPORT - Local DV orgs alongside national floor
  // ----------------------------------------
  if (profile.dv && dvOrgs.length > 0) {
    text += `DOMESTIC ABUSE SUPPORT\n`;
    text += `----------------------\n`;
    text += `National Domestic Abuse Helpline\n`;
    text += `0808 2000 247 (free, 24/7)\n`;
    text += `nationaldahelpline.org.uk\n\n`;

    for (const org of dvOrgs) {
      text += `${org.name}\n`;
      if (org.phone) {
        text += `${org.phone}\n`;
      }
      if (org.website) {
        text += `${org.website}\n`;
      }
      if (org.description) {
        text += `${org.description}\n`;
      }
      text += `\n`;
    }
  }
  
  // ----------------------------------------
  // YOUTH SERVICES - for 16-24
  // ----------------------------------------
  const showYouth = session.youthServicesFlag || 
    session.ageCategory === '16-17' || 
    session.ageCategory === '18-24' || 
    session.detailedAge === '16-17' || 
    session.detailedAge === '18-20' ||
    session.detailedAge === '21-24';
    
  if (showYouth && youthOrgs.length > 0) {
    text += `YOUNG PEOPLE'S SUPPORT\n`;
    text += `----------------------\n`;
    
    for (const org of youthOrgs) {
      text += `${org.name}\n`;
      if (org.phone) {
        text += `${org.phone}\n`;
      }
      if (org.email) {
        text += `${org.email}\n`;
      }
      if (org.website) {
        text += `${org.website}\n`;
      }
      if (org.description) {
        text += `${org.description}\n`;
      }
      text += `\n`;
    }
  }
  
  // ----------------------------------------
  // SOCIAL SERVICES GUIDANCE - for care leavers / young people not engaged
  // ----------------------------------------
  const showSocialServicesGuidance = 
    (session.ageCategory === '16-17' || session.detailedAge === '16-17' || session.detailedAge === '18-20' || session.inCare) 
    && session.socialServices === 'No';
    
  if (showSocialServicesGuidance) {
    text += `IMPORTANT FOR YOUNG PEOPLE\n`;
    text += `--------------------------\n`;
    text += `Children's Services can also help young people and care leavers with housing.\n\n`;
    text += `Contact ${possessive} local council and ask for the Children's Services or Leaving Care team.\n`;
    text += `https://www.gov.uk/find-local-council\n\n`;
  }
  
  // ----------------------------------------
  // SAFETY NET - Shelter (always last, reframed as support)
  // ----------------------------------------
  text += `IF YOU NEED MORE HELP\n`;
  text += `---------------------\n`;
  text += `If ${theyre} finding it hard to get through to services, or ${they}'d like to talk through ${possessive} options with someone, Shelter's helpline is there for ${pronoun}:\n\n`;
  text += `${shelter.name}\n`;
  text += `${shelter.phone} (free, 8am-8pm weekdays, 9am-5pm weekends)\n`;
  text += `${shelter.website}\n\n`;
  text += `They can explain ${possessive} rights, help ${pronoun} prepare for conversations with the council, and support ${pronoun} if things aren't going well.\n\n`;
  
  // ----------------------------------------
  // WARM CLOSE
  // ----------------------------------------
  text += `---\n\n`;
  text += `${theyve.charAt(0).toUpperCase() + theyve.slice(1)} taken an important step by reaching out today.`;

  return { text };
}

// ============================================================
// FIRST MESSAGE
// ============================================================

export function getFirstMessage(_session: SessionState): RoutingResult {
  const opening = getPhrase('OPENING_LINE', false);
  const lang = getPhrase('LANG_HINT_LINE', false);
  const crisis = getPhrase('GATE0_CRISIS_DANGER', false);
  
  const text = `${opening?.text}\n\n${lang?.text}\n\n${crisis?.text}`;
  
  return {
    text,
    options: crisis?.options,
    stateUpdates: { currentGate: 'GATE0_CRISIS_DANGER' },
    sessionEnded: false,
  };
}

// ============================================================
// INPUT PARSING
// ============================================================

export function parseUserInput(input: string, options?: string[]): number | null {
  const trimmed = input.trim();

  // Direct number
  const num = parseInt(trimmed, 10);
  if (!isNaN(num) && num >= 1 && (!options || num <= options.length)) {
    return num;
  }

  // Text matching
  if (options) {
    const lower = trimmed.toLowerCase();
    for (let i = 0; i < options.length; i++) {
      if (options[i].toLowerCase().includes(lower) || lower.includes(options[i].toLowerCase().split(' ')[0])) {
        return i + 1;
      }
    }
  }

  return null;
}

// Housing situation question only (review, 20 November 2026):
// - an answer that pairs a leaving phrase with prison or hospital ("released
//   from prison", "discharged from hospital", "coming out of the hospital") goes
//   to that answer, whatever its first word; a passing mention ("my mum is in
//   hospital") does not;
// - an answer that says "nowhere" and names neither prison nor hospital goes to
//   sleeping rough or nowhere to stay tonight.
// Anything else goes through parseUserInput, with the prison and hospital
// answers kept out of its text matching (review, 20 November 2026): their first
// words caught "leaving care", "leaving my partner" and anything containing
// "coming". They are reached only by their number or by the leaving phrase.
const LEAVING_PHRASE = String.raw`\b(?:leaving|coming out of|getting out of|released from|discharged from|just out of|out of)\s+(?:the\s+)?`;

export function parseHousingSituationInput(input: string, options?: string[]): number | null {
  const trimmed = input.trim();
  if (options && !/^\d+$/.test(trimmed)) {
    const leavingPrison = new RegExp(LEAVING_PHRASE + String.raw`prison\b`, 'i').test(trimmed);
    const leavingHospital = new RegExp(LEAVING_PHRASE + String.raw`hospital\b`, 'i').test(trimmed);
    if (leavingPrison !== leavingHospital) {
      const word = leavingPrison ? 'prison' : 'hospital';
      const i = options.findIndex(o => new RegExp(String.raw`\b${word}\b`, 'i').test(o));
      if (i >= 0) return i + 1;
    }
    if (/\bnowhere\b/i.test(trimmed) && !/\b(prison|hospital)\b/i.test(trimmed)) {
      const i = options.findIndex(o => /\bnowhere to stay tonight\b/i.test(o));
      if (i >= 0) return i + 1;
    }
    // Same length, so numbers still reach every answer; a masked option never
    // matches typed text.
    const masked = options.map(o => (/\b(prison|hospital)\b/i.test(o) ? '\u0000' : o));
    return parseUserInput(input, masked);
  }
  return parseUserInput(input, options);
}

// ============================================================
// MID-CONVERSATION UNDER-16 SAFEGUARDING DETECTION
// ============================================================
//
// Intercepts free-text user input at every gate and looks for explicit
// disclosure of under-16 age. Triggers an immediate safeguarding exit
// regardless of where in the conversation the user currently is, even if
// they previously declared an adult age at B3_AGE_CATEGORY.
//
// Trigger patterns are intentionally narrow:
//   1. First-person numeric statement of ages 10-15 ("I'm 14", "I am 13").
//   2. England/Wales/NI school years 7-10 ("Year 9", "yr 10").
//
// Deliberately NOT triggered by: ages 16+, Years 11+, ambiguous phrases
// like "I'm young" or "still at school". A trigger fires even when wrapped
// in contextual qualifiers ("I'm 14 but asking for my mum").

export type AgeTriggerResult =
  | { triggered: true; type: 'AGE_NUMERIC' | 'SCHOOL_YEAR'; code: string }
  | { triggered: false };

// First-person statement: "i'm/i am/im" + age 10-15.
// Negative lookahead excludes unit-of-measurement false positives
// ("I'm 14 minutes late", "I'm 14 years older than her").
const NUMERIC_AGE_RE = /\bi[\u2018\u2019']?\s*a?m\s+(1[0-5])\b(?!\s+(?:minutes?|mins?|hours?|hrs?|days?|weeks?|wks?|months?|miles?|km|kilometres?|kilometers?|metres?|meters?|feet|ft|inches?|stone|kgs?|lbs?|pounds?|percent|%|years?\s+(?:older|younger|ago)))/i;

// England/Wales/NI school years 7-10. Year 11+ deliberately excluded
// because Year 11 students may already be 16.
const SCHOOL_YEAR_RE = /\b(?:year|yr)\s*(10|7|8|9)\b/i;

export function detectUnder16Age(input: string): AgeTriggerResult {
  if (!input) return { triggered: false };

  const numMatch = input.match(NUMERIC_AGE_RE);
  if (numMatch) {
    return { triggered: true, type: 'AGE_NUMERIC', code: `AGE_NUMERIC_${numMatch[1]}` };
  }

  const yearMatch = input.match(SCHOOL_YEAR_RE);
  if (yearMatch) {
    return { triggered: true, type: 'SCHOOL_YEAR', code: `SCHOOL_YEAR_${yearMatch[1]}` };
  }

  return { triggered: false };
}

// Categorical audit log for safeguarding triggers. Never includes raw user input.
function logUnder16Trigger(
  sessionId: string,
  fromGate: string,
  trigger: { type: string; code: string }
): void {
  console.log('[VA] SAFEGUARDING_TRIGGER:', JSON.stringify({
    event: 'UNDER_16_DETECTED',
    type: trigger.type,
    code: trigger.code,
    sessionId,
    fromGate,
    timestamp: new Date().toISOString(),
    pathwayChange: 'TERMINATED_TO_UNDER_16_EXIT',
  }));
}

// Mid-conversation intercept. Returns a session-ending RoutingResult if
// the input discloses under-16 age, otherwise returns null so the caller
// can continue normal processing.
export function interceptUnder16Age(session: SessionState, input: string): RoutingResult | null {
  const trigger = detectUnder16Age(input);
  if (!trigger.triggered) return null;

  logUnder16Trigger(session.sessionId, session.currentGate, trigger);

  const prefix = getPhrase('UNDER16_INTERCEPT_PREFIX', session.userType);
  const explanation = prefix ? `${prefix.text}\n\n` : '';

  // If LA is already known, exit directly with localised Children's Services info.
  // Otherwise, route to CRISIS_UNDER16_LOCATION to ask for their area first.
  if (session.localAuthority) {
    const exit = buildUnder16Exit(session);
    return {
      ...exit,
      text: explanation + exit.text,
    };
  }

  const locationPhrase = getPhrase('CRISIS_UNDER16_LOCATION', session.userType);
  return {
    text: explanation + (locationPhrase?.text || ''),
    options: locationPhrase?.options,
    stateUpdates: {
      currentGate: 'CRISIS_UNDER16_LOCATION',
      safeguardingTriggered: true,
      safeguardingType: 'UNDER_16',
    },
  };
}

// ============================================================
// MAIN ROUTING
// ============================================================

export function processInput(session: SessionState, input: string): RoutingResult {
  const gate = session.currentGate;
  const p = getPhrase(gate, session.isSupporter);
  // The Safety route reads only a chosen option, never a keyword (safety.ts).
  const choice = isSafetyGate(gate) ? parseSafetyChoice(input, p?.options)
    : gate === 'B6_HOMELESSNESS_STATUS' ? parseHousingSituationInput(input, p?.options)
    : parseUserInput(input, p?.options);
  
  switch (gate) {
    
    // ========================================
    // GATE 0: CRISIS (handlers in lib/handlers/crisis.ts)
    // ========================================
    case 'GATE0_CRISIS_DANGER':
      return handleCrisisDanger(session, choice);

    case 'CRISIS_UNDER16_LOCATION':
      return handleCrisisUnder16Location(session, choice);

    case 'CRISIS_FIRE_FLOOD_LOCATION':
      return handleCrisisFireFloodLocation(session, choice);

    // ========================================
    // DV ROUTING (handlers in lib/handlers/crisis.ts)
    // ========================================
    case 'DV_GENDER_ASK':
      return handleDVGenderAsk(session, choice);

    case 'DV_CHILDREN_ASK':
      return handleDVChildrenAsk(session, choice);

    // ========================================
    // SA ROUTING (handlers in lib/handlers/crisis.ts)
    // ========================================
    case 'SA_GENDER_ASK':
      return handleSAGenderAsk(session, choice);

    // ========================================
    // SAFETY FROM HARM ROUTE (handlers in lib/handlers/safety.ts)
    // ========================================
    case 'SAFETY_TYPE_OF_HARM':
      return handleSafetyTypeOfHarm(session, choice);

    case 'SAFETY_OK_TO_CONTINUE':
      return handleSafetyOkToContinue(session, choice);
    
    // ========================================
    // GATE 1: INTENT
    // ========================================
    case 'GATE1_INTENT':
      switch (choice) {
        case 1: // Advice
          return {
            ...phrase('B4_ADVICE_TOPIC_SELECTION', session.isSupporter),
            stateUpdates: { currentGate: 'B4_ADVICE_TOPIC_SELECTION', intentType: 'ADVICE' }
          };
        case 2: // Help connecting
          return {
            ...phrase('GATE2_ROUTE_SELECTION', session.isSupporter),
            stateUpdates: { currentGate: 'GATE2_ROUTE_SELECTION', intentType: 'SERVICES' }
          };
        case 3: // Specific org
          return {
            ...phrase('PREFERRED_NAME_ASK', session.isSupporter),
            stateUpdates: { currentGate: 'PREFERRED_NAME_ASK', intentType: 'ORGANISATION' }
          };
        default:
          return phrase('GATE1_INTENT', session.isSupporter);
      }
    
    // ========================================
    // ADVICE MODE
    // ========================================
    case 'B4_ADVICE_TOPIC_SELECTION':
      // Map selection to advice content
      const adviceKeys: Record<number, string> = {
        1: 'ADVICE_PRIORITY_NEED',
        2: 'ADVICE_EVICTION_RISK_PREVENTION',
        3: 'ADVICE_COUNCIL_PROCESS',
        4: 'ADVICE_REGISTER_SOCIAL_HOUSING',
        5: 'ADVICE_LANDLORD_PRESSURE_OR_NOTICE_ENGLAND',
        6: 'ADVICE_LEGALLY_HOMELESS'
      };
      const adviceKey = adviceKeys[choice || 6] || 'ADVICE_COUNCIL_PROCESS';
      const adviceContent = getPhrase(adviceKey, session.isSupporter);
      const boundary = getPhrase('ADVICE_BOUNDARY', session.isSupporter);
      const bridge = getPhrase('ADVICE_BRIDGE', session.isSupporter);
      
      return {
        text: `${adviceContent?.text}\n\n${boundary?.text}\n\n${bridge?.text}`,
        options: bridge?.options,
        stateUpdates: { currentGate: 'ADVICE_BRIDGE' },
        sessionEnded: false
      };
    
    case 'ADVICE_BRIDGE':
      switch (choice) {
        case 1: // Connect to services
          return phrase('GATE2_ROUTE_SELECTION', session.isSupporter);
        case 2: // Another question
          return phrase('B4_ADVICE_TOPIC_SELECTION', session.isSupporter);
        case 3: // Done
          const goodbye = getPhrase('TERMINAL_GOODBYE', session.isSupporter);
          return {
            text: withNameBeforeFullStop(goodbye?.text || 'Take care.', session.preferredName),
            stateUpdates: { currentGate: 'SESSION_END', timestampEnd: new Date().toISOString() },
            sessionEnded: true
          };
        default:
          return phrase('ADVICE_BRIDGE', session.isSupporter);
      }
    
    // ========================================
    // GATE 2: ROUTE SELECTION
    // ========================================
    case 'GATE2_ROUTE_SELECTION':
      const routeType = choice === 1 ? 'FULL' : 'QUICK';
      return {
        ...phrase('PREFERRED_NAME_ASK', session.isSupporter),
        stateUpdates: { currentGate: 'PREFERRED_NAME_ASK', routeType }
      };
    
    // ========================================
    // LOCATION DETECTION (handlers in lib/handlers/location.ts)
    // ========================================
    case 'LOCATION_CONSENT':
      return handleLocationConsent(session, choice);

    case 'LOCATION_POSTCODE':
      return handleLocationPostcode(session, choice);

    case 'LOCATION_RESULT':
      return handleLocationResult(session, choice);

    case 'LOCATION_CONFIRM':
      return handleLocationConfirm(session, choice);

    case 'LOCATION_OUTSIDE_WMCA':
      return handleLocationOutsideWMCA(session, choice);
    
    // ========================================
    // SECTION B: CORE PROFILING
    // ========================================
    case 'B1_LOCAL_AUTHORITY':
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
        ...phrase('GATE1_INTENT', session.isSupporter),
        stateUpdates: { currentGate: 'GATE1_INTENT', localAuthority: la }
      };

    // ========================================
    // EARLY FLOW: NAME, ACCESS LOCATION, RETURN USER
    // ========================================
    case 'PREFERRED_NAME_ASK': {
      // The chat route passes the typed text here unparsed. The option parser
      // is not used: it reads many short names as "Skip".
      const raw = input?.trim() || '';
      const skipped = raw === '1' || raw.toLowerCase() === 'skip';
      const name = skipped ? null : cleanPreferredName(raw);
      const next = phrase('ACCESS_LOCATION_ASK', session.isSupporter);
      return {
        ...next,
        text: name ? `Thanks, ${name}. ${next.text}` : next.text,
        stateUpdates: {
          currentGate: 'ACCESS_LOCATION_ASK',
          preferredName: name
        }
      };
    }

    case 'ACCESS_LOCATION_ASK': {
      const accessOptions: (string | null)[] = ['Library', 'Community centre', 'Council office', 'At home', 'On my phone', 'Other', null];
      const accessLoc = choice ? (accessOptions[choice - 1] ?? null) : null;
      return {
        ...phrase('RETURN_USER_ASK', session.isSupporter),
        stateUpdates: { currentGate: 'RETURN_USER_ASK', accessLocation: accessLoc }
      };
    }

    case 'RETURN_USER_ASK':
      if (choice === 1) {
        // Yes - returning user, ask follow-up
        return {
          ...phrase('RETURN_USER_FOLLOWUP', session.isSupporter),
          stateUpdates: { currentGate: 'RETURN_USER_FOLLOWUP', returnUser: true }
        };
      } else {
        // No, or prefer not to say (null) - proceed to B2
        return {
          ...phrase('B2_WHO_FOR', session.isSupporter),
          stateUpdates: { currentGate: 'B2_WHO_FOR', returnUser: choice === 2 ? false : null }
        };
      }

    case 'RETURN_USER_FOLLOWUP': {
      const outcomeOptions = ['Yes, it helped', 'Some of it', 'No, it didn\'t work out', 'Prefer not to say'];
      const outcome = choice ? outcomeOptions[choice - 1] : null;
      return {
        ...phrase('B2_WHO_FOR', session.isSupporter),
        stateUpdates: { currentGate: 'B2_WHO_FOR', returnOutcome: outcome }
      };
    }

    case 'B2_WHO_FOR':
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
    
    case 'B3_AGE_CATEGORY':
      const ageOptions = ['Under 16', '16-17', '18-24', '25 or over'];
      const age = choice ? ageOptions[choice - 1] : null;

      // Under 16 safeguarding — exit directly if LA known, otherwise ask for area first
      if (choice === 1) {
        if (session.localAuthority) {
          return buildUnder16Exit(session);
        }
        return {
          ...phrase('CRISIS_UNDER16_LOCATION', session.userType),
          stateUpdates: { currentGate: 'CRISIS_UNDER16_LOCATION' }
        };
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
    
    case 'B4_GENDER':
      const genderOptions = ['Male', 'Female', 'Non-binary or other', 'Prefer not to say'];
      const gender = choice ? genderOptions[choice - 1] : null;
      
      return {
        ...phrase('B5_MAIN_SUPPORT_NEED', session.isSupporter),
        stateUpdates: { currentGate: 'B5_MAIN_SUPPORT_NEED', gender }
      };
    
    case 'B5_MAIN_SUPPORT_NEED': {
      // The first question in V4 terms (Decision 1, Managing Director, 4 November 2026).
      // Numbered as offered: Safety is left out while its switch is off.
      const offered = visibleFirstOptions();
      // After the in-person route "not sure where to start" is left off (#73
      // review). It is the last option, so the others keep their numbers.
      const shown = session.notSureInPersonShown ? offered.filter(o => o.id !== 'not-sure') : offered;
      const option = choice && choice >= 1 && choice <= shown.length ? shown[choice - 1] : null;
      if (!option) return session.notSureInPersonShown ? firstQuestionWithoutNotSure(session) : phrase('B5_MAIN_SUPPORT_NEED', session.isSupporter);
      if (session.notSureInPersonShown) {
        // A real option is chosen: the first question is whole again from here.
        const r = processInput({ ...session, notSureInPersonShown: false }, input);
        return { ...r, stateUpdates: { ...r.stateUpdates, notSureInPersonShown: false } };
      }
      const needCount = session.needCount + 1;

      if (option.id === 'housing') {
        const need = 'Emergency Housing';
        // Every housing route asks age before B6. Age decides the under-16 exit
        // and the 16-17 route, so it cannot wait for Section C: the full route
        // reaches Section C only with consent, the prevention branch never
        // reaches it, and the organisation-details route skips it.
        if (!session.ageCategory) {
          return {
            ...phrase('B5_PROFILE_AGE', session.isSupporter),
            stateUpdates: { currentGate: 'B5_PROFILE_AGE', supportNeed: need, needCount, v4Option: 'housing', v4Choice: null }
          };
        }

        // Continue to homelessness status question
        return {
          ...phrase('B6_HOMELESSNESS_STATUS', session.isSupporter),
          stateUpdates: { currentGate: 'B6_HOMELESSNESS_STATUS', supportNeed: need, needCount, v4Option: 'housing', v4Choice: null }
        };
      }

      if (option.id === 'safety') {
        // Hard-coded Safety route (Safeguarding Contract 3.3): bypasses the matcher and AI.
        const r = startSafetyRoute(session);
        return { ...r, stateUpdates: { ...r.stateUpdates, v4Option: 'safety', v4Choice: null, supportNeed: 'V4:safety', needCount } };
      }

      if (option.id === 'not-sure') {
        // The assistant helps the person work it out, through the noticing
        // question, with the choice of someone in person (design paper, Part
        // C, section 2; Managing Director, 26 November 2026). Supporters are
        // not offered the noticing question (3.5), so they go to the in-person
        // route.
        const ns = { v4Option: 'not-sure', v4Choice: null, supportNeed: 'V4:not-sure', needCount, unclearCount: 0 };
        if (session.isSupporter) return notSureInPerson(session, ns);
        return { text: notSureText(), options: notSureOptions(), multiSelect: notSureMultiSelect(), stateUpdates: { currentGate: 'B5_NOT_SURE', noticingAsked: true, ...ns } };
      }

      if (option.secondScreen) {
        const key = secondScreenPhraseKey(option.id);
        const r = phrase(key, session.isSupporter);
        return { ...r, stateUpdates: { ...r.stateUpdates, currentGate: 'B5_SECOND_SCREEN', v4Option: option.id, v4Choice: null, supportNeed: `V4:${option.id}`, needCount } };
      }

      const updated = { ...session, v4Option: option.id, v4Choice: null, supportNeed: `V4:${option.id}`, needCount };
      const next = routeToNextProfileQuestion(updated);
      return { ...next, stateUpdates: { v4Option: option.id, v4Choice: null, supportNeed: `V4:${option.id}`, needCount, ...next.stateUpdates } };
    }

    case 'B5_SECOND_SCREEN': {
      const option = session.v4Option ? firstOption(session.v4Option as FirstOptionId) : null;
      const choices = option?.secondScreen ?? [];
      const picked = choice && choice >= 1 && choice <= choices.length ? choices[choice - 1] : null;
      if (!option || !picked) {
        const key = secondScreenPhraseKey(option?.id);
        return { ...phrase(key, session.isSupporter), stateUpdates: { currentGate: 'B5_SECOND_SCREEN' } };
      }
      const supportNeed = `V4:${option.id}:${picked.label}`;
      const updated = { ...session, v4Choice: picked.label, supportNeed };
      const next = routeToNextProfileQuestion(updated);
      return { ...next, stateUpdates: { v4Choice: picked.label, supportNeed, ...next.stateUpdates } };
    }

    case 'B5_NOTICING': {
      // Read as option numbers or one option's exact words only (lib/noticing.ts).
      const picked = parseNoticing(input, noticingOptions(session));
      if (!picked) {
        // Ask once more; after that, show their results, so no one is held here.
        if (session.unclearCount >= 1) {
          const done = finishWithResults(session);
          return { ...done, text: `${noticingDangerLine(session.isSupporter)}\n\n${done.text}`, stateUpdates: { ...done.stateUpdates, unclearCount: 0 } };
        }
        return { text: `${noticingUnclear(session.isSupporter)}\n\n${noticingText(session)}`, options: noticingOptions(session), multiSelect: noticingMultiSelect(session), stateUpdates: { currentGate: 'B5_NOTICING', unclearCount: session.unclearCount + 1 } };
      }
      const { outcome } = noticingOutcome(session, picked);
      if (outcome === 'safety') {
        // While the Safety route's switch is off, the crisis question: hard-coded,
        // live, and covering domestic abuse, sexual violence and immediate danger
        // (James Cross's review of #73, 25 November 2026).
        if (!isSafetyRouteEnabled()) {
          return { ...phrase('GATE0_CRISIS_DANGER', session.isSupporter), stateUpdates: { currentGate: 'GATE0_CRISIS_DANGER', unclearCount: 0 } };
        }
        const r = startSafetyRoute(session);
        return { ...r, stateUpdates: { ...r.stateUpdates, v4Option: 'safety', v4Choice: null, supportNeed: 'V4:safety', unclearCount: 0 } };
      }
      if (outcome === 'housing') {
        // Results for what they came for first, then housing offered as a
        // choice, never entered automatically (Managing Director, 19 November 2026).
        const { named } = noticingOutcome(session, picked);
        const which = named.includes('no-settled-place') ? 'no-settled-place' : 'keep-home';
        const others = named.some(id => !['no-settled-place', 'keep-home', 'nothing-else', 'not-sure'].includes(id));
        const result = buildTerminalServices(session);
        const lead = others && result.hasLocal ? awarenessLine(session) + '\n\n' : '';
        return {
          text: `${lead}${result.text}\n\n${housingOfferText(which)}`,
          options: HOUSING_OFFER_OPTIONS,
          stateUpdates: {
            currentGate: 'B5_HOUSING_OFFER', noticingHousing: which, unclearCount: 0,
            ...(result.terminalOutcome ? { terminalOutcome: result.terminalOutcome } : {}),
          },
        };
      }
      const done = finishWithResults(session, outcome === 'aware' ? awarenessLine(session) : undefined);
      return { ...done, stateUpdates: { ...done.stateUpdates, unclearCount: 0 } };
    }

    case 'B5_NOT_SURE': {
      // Read as option numbers or one option's exact words only, as at the
      // noticing question: never by the AI.
      const picked = parseNoticing(input, notSureOptions());
      if (!picked) {
        // Ask once more; after that, the in-person route, so no one is held here.
        if (session.unclearCount >= 1) {
          const r = notSureInPerson(session, { unclearCount: 0 });
          return { ...r, text: `${noticingDangerLine(session.isSupporter)}\n\n${r.text}` };
        }
        return { text: `${noticingUnclear(session.isSupporter)}\n\n${notSureText()}`, options: notSureOptions(), multiSelect: notSureMultiSelect(), stateUpdates: { currentGate: 'B5_NOT_SURE', unclearCount: session.unclearCount + 1 } };
      }
      const outcome = notSureOutcome(picked);
      if (outcome.kind === 'safety') {
        // As "Feeling unsafe" at the noticing question.
        if (!isSafetyRouteEnabled()) {
          return { ...phrase('GATE0_CRISIS_DANGER', session.isSupporter), stateUpdates: { currentGate: 'GATE0_CRISIS_DANGER', unclearCount: 0 } };
        }
        const r = startSafetyRoute(session);
        return { ...r, stateUpdates: { ...r.stateUpdates, v4Option: 'safety', v4Choice: null, supportNeed: 'V4:safety', unclearCount: 0 } };
      }
      if (outcome.kind === 'in-person') return notSureInPerson(session, { unclearCount: 0 });
      // Housing, or the first pressure ticked that has a topic: as if chosen on
      // the first question. "Not sure" was counted as the need, so it is not
      // counted twice.
      const id = outcome.kind === 'housing' ? 'housing' : outcome.option;
      const number = visibleFirstOptions().findIndex(o => o.id === id) + 1;
      const r = processInput({ ...session, currentGate: 'B5_MAIN_SUPPORT_NEED', needCount: Math.max(0, session.needCount - 1), unclearCount: 0 }, String(number));
      const aware = outcome.kind === 'topic' && outcome.others;
      return { ...r, stateUpdates: { ...r.stateUpdates, unclearCount: 0, noticingAsked: true, ...(aware ? { notSureAware: true } : {}) } };
    }

    case 'B5_HOUSING_OFFER': {
      const pick = parseNoticing(input, HOUSING_OFFER_OPTIONS);
      const one = pick && pick.length === 1 ? pick[0] : null;
      if (one === 1) {
        const housing = { supportNeed: 'Emergency Housing', v4Option: 'housing', v4Choice: null, unclearCount: 0, needCount: session.needCount + 1 };
        if (!session.ageCategory) {
          return { ...phrase('B5_PROFILE_AGE', session.isSupporter), stateUpdates: { currentGate: 'B5_PROFILE_AGE', ...housing } };
        }
        return { ...phrase('B6_HOMELESSNESS_STATUS', session.isSupporter), stateUpdates: { currentGate: 'B6_HOMELESSNESS_STATUS', ...housing } };
      }
      if (one === null && session.unclearCount < 1) {
        return {
          text: `${NOTICING_UNCLEAR}\n\n${housingOfferText(session.noticingHousing === 'keep-home' ? 'keep-home' : 'no-settled-place')}`,
          options: HOUSING_OFFER_OPTIONS,
          stateUpdates: { currentGate: 'B5_HOUSING_OFFER', unclearCount: session.unclearCount + 1 },
        };
      }
      // Staying with these results (or a second unclear answer): the usual
      // question about anything else, so no one is left without a next step.
      const more = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
      return { text: more?.text ?? '', options: more?.options, stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', unclearCount: 0 } };
    }

    case 'B5A_ADVICE_TYPE':
      const adviceOptions = ['Advice:Benefits', 'Advice:Debt', 'Advice:Employment', 'Advice:Immigration', 'Advice:Health', 'Advice:Legal', 'Advice:General'];
      const adviceSub = choice ? adviceOptions[choice - 1] : null;
      const adviceSession = { ...session, adviceSubcategory: adviceSub };
      return routeToNextProfileQuestion(adviceSession);

    // ============================================================
    // CATEGORY-SPECIFIC PROFILING GATES
    // ============================================================
    
    case 'B5_PROFILE_AGE':
      const profAgeOptions = ['Under 16', '16-17', '18-24', '25 or over'];
      const profAge = choice ? profAgeOptions[choice - 1] : null;

      // Under 16 safeguarding — same exit as B3_AGE_CATEGORY
      if (choice === 1) {
        if (session.localAuthority) {
          return buildUnder16Exit(session);
        }
        return {
          ...phrase('CRISIS_UNDER16_LOCATION', session.userType),
          stateUpdates: { currentGate: 'CRISIS_UNDER16_LOCATION' }
        };
      }

      // Map to standard age categories
      let mappedProfAge = profAge;
      if (profAge === '25 or over') mappedProfAge = '25+';
      const profYouthFlag = choice === 2;

      // Emergency Housing, 16 or 17: ask whether they are in care or have a
      // social worker, on every route. It decides whether their worker or duty
      // team comes first (Managing Director, 2 and 3 November 2026).
      if (session.supportNeed === 'Emergency Housing' && profYouthFlag) {
        return {
          ...phrase('B5_YOUTH_SOCIAL_SERVICES', session.isSupporter),
          stateUpdates: { currentGate: 'B5_YOUTH_SOCIAL_SERVICES', ageCategory: mappedProfAge, youthServicesFlag: true }
        };
      }

      // Emergency Housing continues to the homelessness status question
      if (session.supportNeed === 'Emergency Housing') {
        return {
          ...phrase('B6_HOMELESSNESS_STATUS', session.isSupporter),
          stateUpdates: { currentGate: 'B6_HOMELESSNESS_STATUS', ageCategory: mappedProfAge, youthServicesFlag: profYouthFlag }
        };
      }

      const sessionWithAge = { ...session, ageCategory: mappedProfAge };
      return routeToNextProfileQuestion(sessionWithAge, 'age');
    
    case 'B5_YOUTH_SOCIAL_SERVICES': {
      // Yes, No; Not sure and prefer not to say store null
      const youthSsOptions: (string | null)[] = ['Yes', 'No', null, null];
      const youthSs = choice ? (youthSsOptions[choice - 1] ?? null) : null;
      return {
        ...phrase('B6_HOMELESSNESS_STATUS', session.isSupporter),
        stateUpdates: { currentGate: 'B6_HOMELESSNESS_STATUS', socialServices: youthSs, youthSocialServicesAsked: true }
      };
    }

    case 'B5_PROFILE_GENDER':
      const profGenderOptions = ['Male', 'Female', 'Non-binary or other', 'Prefer not to say'];
      const profGender = choice ? profGenderOptions[choice - 1] : null;
      
      const sessionWithGender = { ...session, gender: profGender };
      return routeToNextProfileQuestion(sessionWithGender, 'gender');
    
    case 'B5_PROFILE_LGBTQ': {
      // 1 = Yes, 2 = No, 3 = Prefer not to say
      const lgbtqValue = choice === 1 ? true : (choice === 2 ? false : null);
      if (lgbtqValue === true) {
        return {
          ...phrase('LGBTQ_SPECIALIST_ASK', session.isSupporter),
          stateUpdates: { currentGate: 'LGBTQ_SPECIALIST_ASK', lgbtq: true }
        };
      }
      const sessionWithLgbtq = { ...session, lgbtq: lgbtqValue };
      const lgbtqResult = routeToNextProfileQuestion(sessionWithLgbtq, 'lgbtq');
      return {
        ...lgbtqResult,
        stateUpdates: {
          ...lgbtqResult.stateUpdates,
          lgbtq: lgbtqValue,
        },
      };
    }

    case 'LGBTQ_SPECIALIST_ASK': {
      const lgbtqPref = choice === 1 ? 'Specialist first' : 'Show both';
      const sessionWithSpec = { ...session, lgbtqServicePreference: lgbtqPref };
      const specResult = routeToNextProfileQuestion(sessionWithSpec, 'lgbtq');
      return {
        ...specResult,
        stateUpdates: {
          ...specResult.stateUpdates,
          lgbtqServicePreference: lgbtqPref,
        },
      };
    }

    case 'B5_PROFILE_CONVICTIONS':
      const convictionOptions = ['Yes', 'No', 'Prefer not to say'];
      const convictions = choice ? convictionOptions[choice - 1] : null;
      
      const sessionWithConvictions = { ...session, criminalConvictions: convictions };
      return routeToNextProfileQuestion(sessionWithConvictions, 'convictions');
    
    case 'IMMIGRATION_STATUS_ASK': {
      const immigrationMap: Record<number, { status: string; funds: string | null }> = {
        1: { status: 'British', funds: 'Yes' },
        2: { status: 'Refugee', funds: 'Yes' },
        3: { status: 'Indefinite leave to remain', funds: 'Yes' },
        4: { status: 'Leave to remain', funds: 'Yes' },
        5: { status: 'Leave to remain', funds: 'No' },
        6: { status: 'EUSS', funds: 'Yes' },
        7: { status: 'EUSS', funds: 'Not sure' },
        8: { status: 'Asylum seeker', funds: 'No' },
        9: { status: 'No status', funds: 'No' },
        10: { status: 'Prefer not to say', funds: null },
      };
      const mapped = choice ? immigrationMap[choice] : null;
      const immigrationStatus = mapped?.status || null;
      const publicFunds = mapped?.funds ?? null;
      const sessionWithImmigration = {
        ...session,
        immigrationStatus,
        publicFunds,
      };
      const result = routeToNextProfileQuestion(sessionWithImmigration, 'nrpf');
      return {
        ...result,
        stateUpdates: {
          ...result.stateUpdates,
          immigrationStatus,
          publicFunds,
        },
      };
    }
    
    case 'B5_PROFILE_CHILDREN':
      // 1 = Yes, 2 = No, 3 = Prefer not to say
      const childrenValue = choice === 1 ? true : (choice === 2 ? false : null);
      
      const sessionWithChildren = { ...session, hasChildren: childrenValue };
      return routeToNextProfileQuestion(sessionWithChildren, 'children');
    
    case 'B6_HOMELESSNESS_STATUS': {
      // Housing situation question (Managing Director, 3 November 2026).
      // Option 1 is prevention. Options 2 to 6 are crisis: for option 2 the loss
      // has materialised although the person is still in their home.
      const situation = HOUSING_SITUATION_BY_CHOICE[choice ?? 0];
      if (!situation) {
        return phrase('B6_HOMELESSNESS_STATUS', session.isSupporter);
      }
      return {
        ...phrase('HOUSING_OPTIONS_INVOLVEMENT_ASK', session.isSupporter),
        stateUpdates: {
          currentGate: 'HOUSING_OPTIONS_INVOLVEMENT_ASK',
          housingSituation: situation,
          ...HOUSING_SITUATION_STATE[situation],
        }
      };
    }

    // TODO: Wire housingOptionsInvolvement into buildTerminalServices — when true,
    // deprioritise Housing Options in terminal output and lead with navigator/specialist orgs instead
    case 'HOUSING_OPTIONS_INVOLVEMENT_ASK': {
      const hoInvolvement = choice === 1 ? true : (choice === 2 ? false : null);
      if (session.housingSituation) {
        return routeHousingSituation({ ...session, housingOptionsInvolvement: hoInvolvement });
      }
      // Sessions started before the housing situation question keep the old route
      if (session.homeless) {
        return {
          ...phrase('B7_HOMELESS_SLEEPING_SITUATION', session.isSupporter),
          stateUpdates: { currentGate: 'B7_HOMELESS_SLEEPING_SITUATION', housingOptionsInvolvement: hoInvolvement }
        };
      } else {
        return {
          ...phrase('B7_HOUSED_SITUATION', session.isSupporter),
          stateUpdates: { currentGate: 'B7_HOUSED_SITUATION', housingOptionsInvolvement: hoInvolvement }
        };
      }
    }

    case 'B7_HOUSED_SITUATION':
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
    
    case 'B7A_PREVENTION_GATE':
      switch (choice) {
        case 1: // At risk
          return {
            ...phrase('B7B_PREVENTION_REASON', session.isSupporter),
            stateUpdates: { currentGate: 'B7B_PREVENTION_REASON', preventionNeed: true }
          };
        case 2: // Just info -> terminal
          const resultB7A = buildTerminalServices(session);
          const additionalNeedsB7A = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
          return {
            text: resultB7A.text + '\n' + additionalNeedsB7A?.text,
            options: additionalNeedsB7A?.options,
            stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', preventionNeed: false, ...(resultB7A.terminalOutcome ? { terminalOutcome: resultB7A.terminalOutcome } : {}) },
            sessionEnded: false
          };
        case 3: // Change answer -> back to B6
          return phrase('B6_HOMELESSNESS_STATUS', session.isSupporter);
        default:
          return phrase('B7A_PREVENTION_GATE', session.isSupporter);
      }
    
    case 'B7_HOMELESS_SLEEPING_SITUATION':
      const sleepingOptions = ['Rough sleeping', 'Emergency accommodation', 'Sofa surfing', 'Council temp', 'Other temp'];
      const sleeping = choice ? sleepingOptions[choice - 1] : null;
      
      // Quick route goes to terminal, Full route continues to B8
      if (session.routeType === 'QUICK') {
        return housingResultsTerminal({ ...session, sleepingSituation: sleeping });
      } else {
        return {
          ...phrase('B8_DURATION', session.isSupporter),
          stateUpdates: { currentGate: 'B8_DURATION', sleepingSituation: sleeping }
        };
      }
    
    // ========================================
    // PREVENTION PATHWAY (handlers in lib/handlers/prevention.ts)
    // ========================================
    case 'B7B_PREVENTION_REASON':
      if (choice === 2 || choice === 4) {
        return routeNoticeToLeave(session, choice);
      }
      return handleB7BPreventionReason(session, choice);

    case 'B7C_PREVENTION_URGENCY':
      return handleB7CPreventionUrgency(session, choice);

    case 'B7D_1_PREVENTION_CHILDREN_DEPENDENTS':
      return handleB7D1PreventionChildrenDependents(session, choice);

    case 'B7D_2_PREVENTION_EMPLOYMENT_INCOME':
      return handleB7D2PreventionEmploymentIncome(session, choice);

    case 'B7D_3_PREVENTION_PRIOR_SUPPORT':
      return handleB7D3PreventionPriorSupport(session, choice);

    case 'B7D_4_PREVENTION_SAFEGUARDING_SIGNALS':
      return handleB7D4PreventionSafeguardingSignals(session, choice, buildTerminalServices);

    case 'B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP':
      return handleB7D4APreventionSafeguardingFollowUp(session, choice, buildTerminalServices);
    
    // ========================================
    // HOMELESS CONTINUATION (B8-B12)
    // ========================================
    case 'B8_DURATION':
      return handleB8Duration(session, choice);
    
    case 'B9_REASON':
      return handleB9Reason(session, choice);
    
    case 'B10_INCOME':
      return handleB10Income(session, choice);
    
    case 'B11_PRIOR_USE':
      return handleB11PriorUse(session, choice);
    
    case 'B12_ALREADY_SUPPORTED':
      return handleB12AlreadySupported(session, choice, buildTerminalServices);
    
    case 'B12A_WHICH_ORG':
      return handleB12AWhichOrg(session, input, buildTerminalServices);
    
    // ========================================
    // SECTION C: DETAILED PROFILING
    // ========================================
    case 'C2_CONSENT_GATE':
      return handleC2ConsentGate(session, choice, buildTerminalServices);

    case 'ARMED_FORCES_ASK':
      return handleArmedForcesAsk(session, choice);
    
    case 'C3Q1_IMMIGRATION_STATUS':
      return handleC3Q1ImmigrationStatus(session, choice);
    
    case 'C3Q1A_EUSS_FOLLOWUP':
      return handleC3Q1AEussFollowup(session, choice);
    
    case 'C3Q1B_PUBLIC_FUNDS_FOLLOWUP':
      return handleC3Q1BPublicFundsFollowup(session, choice);
    
    case 'C3Q2_DEPENDENT_CHILDREN':
      return handleC3Q2DependentChildren(session, choice);
    
    case 'C3Q3_AGE':
      return handleC3Q3Age(session, choice);
    
    case 'C3Q4_GENDER':
      return handleC3Q4Gender(session, choice);
    
    case 'C3Q5_PREGNANCY':
      return handleC3Q5Pregnancy(session, choice);
    
    case 'C3Q6_ETHNICITY':
      return handleC3Q6Ethnicity(session, choice);
    
    case 'C3Q7_PHYSICAL_HEALTH':
      return handleC3Q7PhysicalHealth(session, choice);
    
    case 'C3Q8_MENTAL_HEALTH':
      return handleC3Q8MentalHealth(session, choice);
    
    case 'C3Q9_CRIMINAL_CONVICTIONS':
      return handleC3Q9CriminalConvictions(session, choice);
    
    case 'C3Q10_LGBTQ':
      return handleC3Q10Lgbtq(session, choice, buildTerminalServices);
    
    case 'C3Q10A_LGBTQ_SERVICE_PREFERENCE':
      return handleC3Q10ALgbtqServicePreference(session, choice, buildTerminalServices);
    
    case 'C3Q11_CURRENTLY_IN_CARE':
      return handleC3Q11CurrentlyInCare(session, choice);
    
    case 'C3Q12_SOCIAL_SERVICES':
      return handleC3Q12SocialServices(session, choice, buildTerminalServices);
    
    // ========================================
    // TERMINAL & ADDITIONAL NEEDS
    // ========================================
    case 'TERMINAL_ADDITIONAL_NEEDS':
      return handleTerminalAdditionalNeeds(session, choice);
    
    // ========================================
    // ESCALATION
    // ========================================
    case 'ESCALATION_LEVEL_1':
      return handleEscalationLevel1(
        session,
        choice,
        buildTerminalServices,
        () => getFirstMessage(createSession(session.sessionId))
      );
    
    case 'ESCALATION_LEVEL_2':
      return handleEscalationLevel2(session, choice, buildTerminalServices);
    
    default:
      // Fallback
      return phrase('GATE0_CRISIS_DANGER', session.isSupporter);
  }
}

// ============================================================
// LOCATION INPUT PROCESSING
// ============================================================

interface LocationData {
  success: boolean;
  localAuthority?: string;
  latitude?: number;
  longitude?: number;
  isWMCA?: boolean;
  isInWMCA?: boolean; // Also accept this variant
  isScotland?: boolean;
  error?: string;
}

export function processLocationInput(session: SessionState, locationData: LocationData): RoutingResult {
  // Handle location detection result
  
  if (!locationData.success || !locationData.localAuthority) {
    // Location detection failed - show invalid postcode message or fall back to manual
    if (session.currentGate === 'LOCATION_POSTCODE') {
      return {
        ...phrase('LOCATION_POSTCODE_INVALID', session.isSupporter),
        stateUpdates: { currentGate: 'LOCATION_POSTCODE' }
      };
    }
    // Fall back to manual selection
    return {
      ...phrase('B1_LOCAL_AUTHORITY', session.isSupporter),
      stateUpdates: { currentGate: 'B1_LOCAL_AUTHORITY', locationMethod: 'MANUAL' }
    };
  }
  
  // Location detected successfully
  const la = locationData.localAuthority;
  const jurisdiction: 'ENGLAND' | 'SCOTLAND' = locationData.isScotland ? 'SCOTLAND' : 'ENGLAND';
  const locationMethod = session.currentGate === 'LOCATION_POSTCODE' ? 'POSTCODE' : 'GEOLOCATION';
  
  // Check if outside WMCA area - accept both property names
  const inWMCA = locationData.isWMCA ?? locationData.isInWMCA ?? false;
  
  if (!inWMCA) {
    // Store the detected LA but show notice about limited coverage
    return {
      ...phrase('LOCATION_OUTSIDE_WMCA', session.isSupporter),
      stateUpdates: { 
        currentGate: 'LOCATION_OUTSIDE_WMCA',
        localAuthority: la,
        latitude: locationData.latitude || null,
        longitude: locationData.longitude || null,
        locationMethod,
        jurisdiction
      }
    };
  }
  
  // WMCA area - ask user to confirm the detected LA
  const confirmPhrase = getPhrase('LOCATION_CONFIRM', session.isSupporter);
  const confirmText = confirmPhrase?.text?.replace('[LOCAL_AUTHORITY]', la) || `I've detected you're in ${la}. Is this correct?`;
  
  return {
    text: confirmText,
    options: confirmPhrase?.options || ["Yes, that's correct", "I need help in a different area"],
    stateUpdates: { 
      currentGate: 'LOCATION_CONFIRM',
      localAuthority: la,
      latitude: locationData.latitude || null,
      longitude: locationData.longitude || null,
      locationMethod,
      jurisdiction
    }
  };
}

