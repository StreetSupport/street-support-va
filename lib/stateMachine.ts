// Street Support VA v7.1 State Machine - COMPLETE VERSION
// Full routing logic from CHAR_VA_RoutingLogic_v7.md
// UPDATES v7.1:
// - Social services questions (C3Q11/C3Q12) only for 16-17 and 18-20
// - Restructured terminal output with clear hierarchy
// - Trauma-informed language, Shelter as safety net

import { getPhrase } from './phrasebank';
import { getPronouns } from './utils/pronouns';
import type { GateType, SessionState, RoutingResult, TerminalResult } from './types';
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
  getServicesForNeed,
  isProfileRelevantNeed,
} from './serviceMatcher';
import {
  handleCrisisDanger,
  handleCrisisUnder16Location,
  handleCrisisFireFloodLocation,
  handleDVGenderAsk,
  handleDVChildrenAsk,
  handleSAGenderAsk,
} from './handlers/crisis';
import { buildUnder16Exit, childrenServicesData } from './handlers/shared';
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
    specialCategoryConsent: null,
    lgbtqSpecialist: null,
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

// ============================================================
// NEED TO CATEGORY MAPPING
// Maps user-selected needs to service category parents in wmca_services_v7.json
// ============================================================

const needToCategoryMap: Record<string, string> = {
  'Emergency Housing': 'accom',
  'Food': 'foodbank',
  'Work': 'employment',
  'Health': 'medical',
  'Advice': 'support',
  'Drop In': 'dropin',
  'Financial': 'financial',
  'Items': 'items',
  'Services': 'services',
  'Comms': 'communications',
  'Training': 'training',
  'Activities': 'activities'
};

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
function routeToNextProfileQuestion(session: SessionState): RoutingResult {
  const need = session.supportNeed || '';
  const required = needProfileRequirements[need] || [];
  
  // Check each required field in order
  for (const field of required) {
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
    
    // LGBTQ (with special category consent gate)
    if (field === 'lgbtq' && session.lgbtq == null) {
      // Ask for consent before special category questions
      if (session.specialCategoryConsent == null) {
        return {
          ...phrase('SPECIAL_CATEGORY_CONSENT', session.isSupporter),
          stateUpdates: { currentGate: 'SPECIAL_CATEGORY_CONSENT' }
        };
      }
      // Consent given — ask the question
      if (session.specialCategoryConsent === true) {
        return {
          ...phrase('B5_PROFILE_LGBTQ', session.isSupporter),
          stateUpdates: {
            currentGate: 'B5_PROFILE_LGBTQ',
            gender: session.gender
          }
        };
      }
      // Consent declined — lgbtq already set to false by handler, so this won't fire
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
  
  // All required fields collected - go to terminal
  const result = buildTerminalServices(session);
  const additionalNeeds = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
  return {
    text: result.text + '\n' + additionalNeeds?.text,
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
    },
    {
      name: 'Find NHS Services',
      website: 'https://www.nhs.uk/service-search',
      description: 'Find GPs, pharmacies, hospitals and other NHS services'
    }
  ],
  'Financial': [
    {
      name: 'Turn2us Benefits Calculator',
      website: 'https://www.turn2us.org.uk/get-support',
      description: 'Check what benefits you could be entitled to'
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
      phone: '0800 100 900',
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

function buildNonHousingTerminal(session: SessionState): TerminalResult {
  const need = session.supportNeed || 'support';
  const la = session.localAuthority || 'your area';
  const displayName = needDisplayNames[need] || need.toLowerCase();
  const categoryKey = needToCategoryMap[need] || '';

  // Build profile for service matching
  const profile = toUserProfile(session);

  // Get matched local services
  const localServices = getServicesForNeed(need, profile);
  const fallbacks = nationalFallbacks[need] || [];
  const hasLocalServices = localServices.length > 0;

  // Zero-match path
  if (!hasLocalServices) {
    return buildZeroMatchTerminal(need, la, fallbacks, categoryKey, displayName, session.isSupporter);
  }

  let text = '';

  // Opening line - personalised if profile was used
  if (isProfileRelevantNeed(need)) {
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

  // LGBT Foundation for LGBTQ+ users on Health need
  if (session.lgbtq === true && need === 'Health') {
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

  return { text: text.trim() };
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

  // ----------------------------------------
  // 16-17 WITH SOCIAL SERVICES — special layout
  // ----------------------------------------
  const effectiveAge = session.detailedAge || session.ageCategory;
  const is16_17 = effectiveAge === '16-17';
  const hasSocialServices = session.socialServices === 'Yes';

  if (is16_17 && hasSocialServices) {
    text += `I've found some services that can help with ${possessive} situation.\n\n`;

    // Children's Services as primary route
    const csPhrase = getPhrase('TERMINAL_YOUTH_16_17_CHILDRENS_SERVICES', isSupporter);
    text += `YOUR FIRST STEP\n`;
    text += `---------------\n`;
    text += `${csPhrase?.text}\n\n`;

    const laKey = session.localAuthority?.toLowerCase().replace(/\s+/g, '') || '';
    const childServices = childrenServicesData[laKey];
    if (childServices) {
      text += `${childServices.name}\n`;
      text += `${childServices.phone}`;
      if (childServices.phoneOOH) {
        text += ` (out of hours: ${childServices.phoneOOH})`;
      }
      text += `\n`;
      text += `${childServices.website}\n\n`;
    }

    // Age-filtered navigator orgs as secondary
    if (navigatorOrgs.length > 0) {
      const navIntro = getPhrase('TERMINAL_YOUTH_16_17_NAVIGATOR_INTRO', isSupporter);
      text += `LOCAL SUPPORT\n`;
      text += `-------------\n`;
      text += `${navIntro?.text}\n\n`;

      for (const org of navigatorOrgs) {
        text += `${org.name}\n`;
        if (org.phone) text += `${org.phone}\n`;
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

  // ----------------------------------------
  // YOUR FIRST STEP - Council Housing Options
  // ----------------------------------------
  text += `YOUR FIRST STEP\n`;
  text += `---------------\n`;
  
  if (councilOrg) {
    text += `${councilOrg.name}\n`;
    if (councilOrg.phone) {
      text += `${councilOrg.phone}\n`;
    }
    if (councilOrg.website) {
      text += `${councilOrg.website}\n`;
    }
    text += `\n`;
    text += `They have a legal duty to assess ${possessive} situation. `;
    
    // Contextual advice based on situation
    if (session.sleepingSituation?.toLowerCase().includes('rough')) {
      text += `Explain what's happening and ask for a homelessness assessment. Let them know ${theyre} sleeping rough - this is urgent.\n`;
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
    text += `They have a legal duty to help ${pronoun}. Ask for a homelessness assessment.\n`;
  }
  
  text += `\n`;
  
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
  // LOCAL SUPPORT - Drop-in services and navigator orgs
  // ----------------------------------------
  const allLocalOrgs = [...localSupportOrgs, ...navigatorOrgs];
  if (allLocalOrgs.length > 0) {
    text += `LOCAL SUPPORT\n`;
    text += `-------------\n`;

    for (const org of allLocalOrgs) {
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

    // Project 17
    text += `Project 17\n`;
    text += `https://project17.org.uk\n`;
    text += `Specialist support for families with no recourse to public funds\n\n`;

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
    text += `Based on ${possessive} situation, ${they} may be entitled to support from social services. `;
    text += `They have a duty to help young people and care leavers with housing.\n\n`;
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

// ============================================================
// MAIN ROUTING
// ============================================================

export function processInput(session: SessionState, input: string): RoutingResult {
  const gate = session.currentGate;
  const p = getPhrase(gate, session.isSupporter);
  const choice = parseUserInput(input, p?.options);
  
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
            ...phrase('B1_LOCAL_AUTHORITY', session.isSupporter),
            stateUpdates: { currentGate: 'B1_LOCAL_AUTHORITY', intentType: 'ORGANISATION' }
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
            text: goodbye?.text || 'Take care.',
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
        ...phrase('LOCATION_CONSENT', session.isSupporter),
        stateUpdates: { currentGate: 'LOCATION_CONSENT', routeType },
        responseType: 'location_consent'
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
        ...phrase('PREFERRED_NAME_ASK', session.isSupporter),
        stateUpdates: { currentGate: 'PREFERRED_NAME_ASK', localAuthority: la }
      };

    // ========================================
    // EARLY FLOW: NAME, ACCESS LOCATION, RETURN USER
    // ========================================
    case 'PREFERRED_NAME_ASK': {
      const nameInput = input?.trim() || '';
      const skipped = nameInput === '' || nameInput.toLowerCase() === 'skip' || choice === 1;
      return {
        ...phrase('ACCESS_LOCATION_ASK', session.isSupporter),
        stateUpdates: {
          currentGate: 'ACCESS_LOCATION_ASK',
          preferredName: skipped ? null : nameInput
        }
      };
    }

    case 'ACCESS_LOCATION_ASK': {
      const accessOptions = ['Library', 'Community centre', 'Council office', 'At home', 'On my phone', 'Other'];
      const accessLoc = choice ? accessOptions[choice - 1] : null;
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
        // No - new user, proceed to B2
        return {
          ...phrase('B2_WHO_FOR', session.isSupporter),
          stateUpdates: { currentGate: 'B2_WHO_FOR', returnUser: false }
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
      
      // Under 16 safeguarding exit
      if (choice === 1) {
        return buildUnder16Exit(session);
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
    
    case 'B5_MAIN_SUPPORT_NEED':
      const needOptions = ['Emergency Housing', 'Food', 'Work', 'Health', 'Advice', 'Drop In', 'Financial', 'Items', 'Services', 'Comms', 'Training', 'Activities'];
      const need = choice ? needOptions[choice - 1] : null;

      // Advice routes to subcategory selection
      if (need === 'Advice') {
        return {
          ...phrase('B5A_ADVICE_TYPE', session.isSupporter),
          stateUpdates: { currentGate: 'B5A_ADVICE_TYPE', supportNeed: need, needCount: session.needCount + 1 }
        };
      }

      // Housing needs require full profiling
      const housingRelatedNeeds = ['Emergency Housing'];
      const needsFullProfiling = housingRelatedNeeds.includes(need || '');

      if (needsFullProfiling) {
        // Continue to homelessness status question
        return {
          ...phrase('B6_HOMELESSNESS_STATUS', session.isSupporter),
          stateUpdates: { currentGate: 'B6_HOMELESSNESS_STATUS', supportNeed: need, needCount: session.needCount + 1 }
        };
      } else {
        // Non-housing need - route to category-specific profiling
        const updatedSession = { ...session, supportNeed: need, needCount: session.needCount + 1 };
        return routeToNextProfileQuestion(updatedSession);
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
      const profAgeOptions = ['Under 18', '18-24', '25 or over'];
      const profAge = choice ? profAgeOptions[choice - 1] : null;
      
      // Map to standard age categories
      let mappedProfAge = profAge;
      if (profAge === 'Under 18') mappedProfAge = '16-17';
      if (profAge === '25 or over') mappedProfAge = '25+';
      
      const sessionWithAge = { ...session, ageCategory: mappedProfAge };
      return routeToNextProfileQuestion(sessionWithAge);
    
    case 'B5_PROFILE_GENDER':
      const profGenderOptions = ['Male', 'Female', 'Non-binary or other', 'Prefer not to say'];
      const profGender = choice ? profGenderOptions[choice - 1] : null;
      
      const sessionWithGender = { ...session, gender: profGender };
      return routeToNextProfileQuestion(sessionWithGender);
    
    case 'SPECIAL_CATEGORY_CONSENT': {
      if (choice === 1) {
        const consentedSession = { ...session, specialCategoryConsent: true };
        return routeToNextProfileQuestion(consentedSession);
      } else {
        const declinedSession = {
          ...session, specialCategoryConsent: false,
          lgbtq: false, ethnicity: 'declined_consent',
          physicalHealth: 'declined_consent', mentalHealth: 'declined_consent'
        };
        return routeToNextProfileQuestion(declinedSession);
      }
    }

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
      return routeToNextProfileQuestion(sessionWithLgbtq);
    }

    case 'LGBTQ_SPECIALIST_ASK': {
      const lgbtqSpec = choice === 1;
      const sessionWithSpec = { ...session, lgbtqSpecialist: lgbtqSpec };
      return routeToNextProfileQuestion(sessionWithSpec);
    }

    case 'B5_PROFILE_CONVICTIONS':
      const convictionOptions = ['Yes', 'No', 'Prefer not to say'];
      const convictions = choice ? convictionOptions[choice - 1] : null;
      
      const sessionWithConvictions = { ...session, criminalConvictions: convictions };
      return routeToNextProfileQuestion(sessionWithConvictions);
    
    case 'IMMIGRATION_STATUS_ASK': {
      const immigrationMap: Record<number, { status: string; funds: string | null }> = {
        1: { status: 'british_irish', funds: 'Yes' },
        2: { status: 'refugee', funds: 'Yes' },
        3: { status: 'ilr', funds: 'Yes' },
        4: { status: 'ltr_with_pf', funds: 'Yes' },
        5: { status: 'ltr_no_pf', funds: 'No' },
        6: { status: 'eu_settled', funds: 'Yes' },
        7: { status: 'eu_pre_settled', funds: 'Not sure' },
        8: { status: 'asylum_seeker', funds: 'No' },
        9: { status: 'undocumented', funds: 'No' },
        10: { status: 'prefer_not_to_say', funds: null },
      };
      const mapped = choice ? immigrationMap[choice] : null;
      const sessionWithImmigration = {
        ...session,
        immigrationStatus: mapped?.status || null,
        publicFunds: mapped?.funds ?? null,
      };
      return routeToNextProfileQuestion(sessionWithImmigration);
    }
    
    case 'B5_PROFILE_CHILDREN':
      // 1 = Yes, 2 = No, 3 = Prefer not to say
      const childrenValue = choice === 1 ? true : (choice === 2 ? false : null);
      
      const sessionWithChildren = { ...session, hasChildren: childrenValue };
      return routeToNextProfileQuestion(sessionWithChildren);
    
    case 'B6_HOMELESSNESS_STATUS':
      const homeless = choice === 1;
      return {
        ...phrase('HOUSING_OPTIONS_INVOLVEMENT_ASK', session.isSupporter),
        stateUpdates: { currentGate: 'HOUSING_OPTIONS_INVOLVEMENT_ASK', homeless }
      };

    // TODO: Wire housingOptionsInvolvement into buildTerminalServices — when true,
    // deprioritise Housing Options in terminal output and lead with navigator/specialist orgs instead
    case 'HOUSING_OPTIONS_INVOLVEMENT_ASK': {
      const hoInvolvement = choice === 1 ? true : (choice === 2 ? false : null);
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
        const resultB7 = buildTerminalServices({ ...session, sleepingSituation: sleeping });
        const additionalNeedsB7 = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);

        // Add StreetLink for rough sleeping
        let text = resultB7.text;
        if (choice === 1) {
          const streetlink = getPhrase('STREETLINK_SIGNPOST', session.isSupporter);
          text = (streetlink?.text || '') + '\n\n' + resultB7.text;
        }

        return {
          text: text + '\n' + additionalNeedsB7?.text,
          options: additionalNeedsB7?.options,
          stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', sleepingSituation: sleeping, ...(resultB7.terminalOutcome ? { terminalOutcome: resultB7.terminalOutcome } : {}) },
          sessionEnded: false
        };
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

