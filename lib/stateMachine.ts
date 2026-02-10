// Street Support VA v7.1 State Machine - COMPLETE VERSION
// Full routing logic from CHAR_VA_RoutingLogic_v7.md
// UPDATES v7.1:
// - Social services questions (C3Q11/C3Q12) only for 16-17 and 18-20
// - Restructured terminal output with clear hierarchy
// - Trauma-informed language, Shelter as safety net

import { getPhrase, PhraseEntry } from './phrasebank';
import {
  getCouncilOrg,
  getLocalSupportOrgs,
  getSpecialistOrgs,
  getYouthOrgs,
  getShelterInfo,
  getStreetLinkInfo,
  getServicesForNeed,
  isProfileRelevantNeed,
  DefaultOrg,
  UserProfile,
  MatchedService
} from './serviceMatcher';
import {
  handleCrisisDanger,
  handleCrisisUnder16Location,
  handleCrisisFireFloodLocation,
  handleDVGenderAsk,
  handleDVChildrenAsk,
  handleSAGenderAsk,
} from './handlers/crisis';
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
// TYPES
// ============================================================

export type GateType = 
  // Init & Gates
  | 'INIT'
  | 'GATE0_CRISIS_DANGER'
  | 'GATE1_INTENT'
  | 'GATE2_ROUTE_SELECTION'
  // Location Detection
  | 'LOCATION_CONSENT'
  | 'LOCATION_POSTCODE'
  | 'LOCATION_RESULT'
  | 'LOCATION_CONFIRM'
  | 'LOCATION_OUTSIDE_WMCA'
  // Advice Mode
  | 'B4_ADVICE_TOPIC_SELECTION'
  | 'ADVICE_BRIDGE'
  // Core Profiling
  | 'B1_LOCAL_AUTHORITY'
  | 'B2_WHO_FOR'
  | 'B3_AGE_CATEGORY'
  | 'B4_GENDER'
  | 'B5_MAIN_SUPPORT_NEED'
  | 'B5_PROFILE_AGE'
  | 'B5_PROFILE_GENDER'
  | 'B5_PROFILE_LGBTQ'
  | 'B5_PROFILE_CONVICTIONS'
  | 'B5_PROFILE_NRPF'
  | 'B5_PROFILE_CHILDREN'
  | 'B5A_ADDITIONAL_NEED_SELECTION'
  | 'B6_HOMELESSNESS_STATUS'
  | 'B7_HOUSED_SITUATION'
  | 'B7_HOMELESS_SLEEPING_SITUATION'
  | 'B7A_PREVENTION_GATE'
  // Prevention Pathway
  | 'B7B_PREVENTION_REASON'
  | 'B7C_PREVENTION_URGENCY'
  | 'B7D_1_PREVENTION_CHILDREN_DEPENDENTS'
  | 'B7D_2_PREVENTION_EMPLOYMENT_INCOME'
  | 'B7D_3_PREVENTION_PRIOR_SUPPORT'
  | 'B7D_4_PREVENTION_SAFEGUARDING_SIGNALS'
  | 'B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP'
  // Homeless Continuation
  | 'B8_DURATION'
  | 'B9_REASON'
  | 'B10_INCOME'
  | 'B11_PRIOR_USE'
  | 'B12_ALREADY_SUPPORTED'
  | 'B12A_WHICH_ORG'
  // Section C Profiling
  | 'C2_CONSENT_GATE'
  | 'C3Q1_IMMIGRATION_STATUS'
  | 'C3Q1A_EUSS_FOLLOWUP'
  | 'C3Q1B_PUBLIC_FUNDS_FOLLOWUP'
  | 'C3Q2_DEPENDENT_CHILDREN'
  | 'C3Q3_AGE'
  | 'C3Q4_GENDER'
  | 'C3Q5_PREGNANCY'
  | 'C3Q6_ETHNICITY'
  | 'C3Q7_PHYSICAL_HEALTH'
  | 'C3Q8_MENTAL_HEALTH'
  | 'C3Q9_CRIMINAL_CONVICTIONS'
  | 'C3Q10_LGBTQ'
  | 'C3Q10A_LGBTQ_SERVICE_PREFERENCE'
  | 'C3Q11_CURRENTLY_IN_CARE'
  | 'C3Q12_SOCIAL_SERVICES'
  // Safeguarding Routing
  | 'DV_GENDER_ASK'
  | 'DV_CHILDREN_ASK'
  | 'SA_GENDER_ASK'
  // Crisis Location Gates
  | 'CRISIS_UNDER16_LOCATION'
  | 'CRISIS_FIRE_FLOOD_LOCATION'
  // Terminal
  | 'TERMINAL_SERVICES'
  | 'TERMINAL_ADDITIONAL_NEEDS'
  | 'SESSION_END'
  // Escalation
  | 'ESCALATION_LEVEL_1'
  | 'ESCALATION_LEVEL_2'
  | 'ESCALATION_LEVEL_3';

export interface SessionState {
  sessionId: string;
  currentGate: GateType;
  
  // Route tracking
  routeType: 'FULL' | 'QUICK' | null;
  intentType: 'ADVICE' | 'SERVICES' | 'ORGANISATION' | null;
  
  // Core profile
  localAuthority: string | null;
  latitude: number | null;
  longitude: number | null;
  locationMethod: 'GEOLOCATION' | 'POSTCODE' | 'MANUAL' | null;
  jurisdiction: 'ENGLAND' | 'SCOTLAND';
  userType: 'SELF' | 'SUPPORTER' | 'PROFESSIONAL' | null;
  ageCategory: string | null;
  gender: string | null;
  supportNeed: string | null;
  additionalNeeds: string[];
  needCount: number;
  
  // Homelessness
  homeless: boolean | null;
  sleepingSituation: string | null;
  housedSituation: string | null;
  
  // Homeless continuation (B8-B12)
  duration: string | null;
  reason: string | null;
  income: string | null;
  priorUse: string | null;
  alreadySupported: boolean | null;
  currentSupportingOrg: string | null;
  
  // Prevention pathway
  preventionNeed: boolean | null;
  preventionReason: string | null;
  preventionUrgency: string | null;
  preventionChildren: string | null;
  preventionEmployment: string | null;
  preventionPriorSupport: string | null;
  preventionSafeguardingSignals: string | null;
  
  // Section C profiling
  consentGiven: boolean | null;
  immigrationStatus: string | null;
  eussStatus: string | null;
  publicFunds: string | null;
  hasChildren: boolean | null;
  detailedAge: string | null;
  detailedGender: string | null;
  pregnant: boolean | null;
  ethnicity: string | null;
  physicalHealth: string | null;
  mentalHealth: string | null;
  criminalConvictions: string | null;
  lgbtq: boolean | null;
  lgbtqServicePreference: string | null;
  inCare: boolean | null;
  socialServices: string | null;
  
  // Flags
  isSupporter: boolean;
  youthServicesFlag: boolean;
  
  // Safeguarding
  safeguardingTriggered: boolean;
  safeguardingType: string | null;
  dvGender: string | null;
  dvChildren: boolean | null;
  saGender: string | null;
  
  // Escalation
  unclearCount: number;
  skipCount: number;
  escalationLevel: number;
  
  // Timestamps
  timestampStart: string;
  timestampEnd: string | null;
}

export interface RoutingResult {
  text: string;
  options?: string[];
  stateUpdates: Partial<SessionState>;
  sessionEnded?: boolean;
  responseType?: string; // For special handling in widget (e.g., 'request_geolocation', 'postcode_input')
}

// ============================================================
// SESSION CREATION
// ============================================================

export function createSession(sessionId: string): SessionState {
  return {
    sessionId,
    currentGate: 'INIT',
    routeType: null,
    intentType: null,
    localAuthority: null,
    latitude: null,
    longitude: null,
    locationMethod: null,
    jurisdiction: 'ENGLAND',
    userType: null,
    ageCategory: null,
    gender: null,
    supportNeed: null,
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

function safeguardingExit(key: string, isSupporter: boolean, type: string): RoutingResult {
  const p = getPhrase(key, isSupporter);
  return {
    text: p?.text || `[Missing phrase: ${key}]`,
    stateUpdates: {
      currentGate: 'SESSION_END',
      safeguardingTriggered: true,
      safeguardingType: type,
      timestampEnd: new Date().toISOString(),
    },
    sessionEnded: true,
  };
}

// Children's Services contact info by Local Authority
const childrenServicesData: Record<string, { name: string; phone: string; outOfHours?: string; website: string }> = {
  wolverhampton: {
    name: "Wolverhampton Children's Services",
    phone: "01902 555392",
    outOfHours: "01902 552999",
    website: "https://www.wolverhampton.gov.uk/children-and-young-people"
  },
  birmingham: {
    name: "Birmingham Children's Trust",
    phone: "0121 303 1888",
    outOfHours: "0121 675 4806",
    website: "https://www.birminghamchildrenstrust.co.uk"
  },
  coventry: {
    name: "Coventry Children's Services",
    phone: "024 7678 8555",
    outOfHours: "024 7683 2222",
    website: "https://www.coventry.gov.uk/childrens-services"
  },
  dudley: {
    name: "Dudley Children's Services",
    phone: "0300 555 0050",
    outOfHours: "0300 555 8574",
    website: "https://www.dudley.gov.uk/resident/care-health/children-and-family-care/"
  },
  sandwell: {
    name: "Sandwell Children's Trust",
    phone: "0121 569 3100",
    outOfHours: "0121 569 2355",
    website: "https://www.sandwellchildrenstrust.org"
  },
  solihull: {
    name: "Solihull Children's Services",
    phone: "0121 788 4300",
    outOfHours: "0121 605 6060",
    website: "https://www.solihull.gov.uk/children-and-family-support"
  },
  walsall: {
    name: "Walsall Children's Services",
    phone: "0300 555 2866",
    outOfHours: "0300 555 2922",
    website: "https://go.walsall.gov.uk/children-and-young-people"
  }
};

// Build Under 16 exit with local Children's Services info
function buildUnder16Exit(session: SessionState): RoutingResult {
  const isSupporter = session.isSupporter;
  const la = session.localAuthority?.toLowerCase().replace(/\s+/g, '') || '';
  const childServices = childrenServicesData[la];
  
  let text = '';
  
  if (isSupporter) {
    text += `Thank you for reaching out. Because they are under 16, there are specialist services that can help keep them safe. It's really good that you're looking for support for them.\n\n`;
  } else {
    text += `Thank you for reaching out. Because you are under 16, there are specialist services that can help keep you safe. It takes courage to ask for help, and you've done the right thing.\n\n`;
  }
  
  // Local Children's Services (if we have LA info)
  if (childServices) {
    text += `CHILDREN'S SERVICES\n`;
    text += `${childServices.name}\n`;
    // Combine phone numbers on one line if there's an out of hours number
    if (childServices.outOfHours) {
      text += `${childServices.phone} (out of hours: ${childServices.outOfHours})\n`;
    } else {
      text += `${childServices.phone}\n`;
    }
    text += `${childServices.website}\n`;
    text += `They can talk through what's happening and help work out the best support\n\n`;
  } else {
    text += `CHILDREN'S SERVICES\n`;
    text += `Local council Children's Services\n`;
    text += `https://www.gov.uk/find-local-council\n`;
    text += `They can talk through what's happening and help work out the best support\n\n`;
  }
  
  // Childline
  text += `SPECIALIST HELPLINE\n`;
  text += `Childline\n`;
  text += `0800 1111 (free, confidential, 24/7)\n`;
  text += `https://www.childline.org.uk\n`;
  text += `${isSupporter ? 'A free helpline for young people to call or chat online about anything' : 'A free helpline where you can call or chat online about anything'}\n\n`;
  
  if (isSupporter) {
    text += `SPECIALIST HELPLINE\n`;
    text += `NSPCC Helpline (for adults)\n`;
    text += `0808 800 5000 (free, 24/7)\n`;
    text += `https://www.nspcc.org.uk/keeping-children-safe/reporting-abuse/\n`;
    text += `For adults who are worried about a child\n\n`;
  }
  
  // Warm sign-off with separator
  text += `---\n`;
  text += `Please reach out when you feel ready. I'll be here if you need help finding other services later.\n\n`;
  text += `If ${isSupporter ? 'they are' : 'you are'} in immediate danger, call 999.`;
  
  return {
    text,
    stateUpdates: {
      currentGate: 'SESSION_END',
      safeguardingTriggered: true,
      safeguardingType: 'UNDER_16',
      timestampEnd: new Date().toISOString(),
    },
    sessionEnded: true,
  };
}

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

// Local council Housing Options contact info by Local Authority
const councilHousingData: Record<string, { name: string; phone: string; outOfHours?: string; website: string }> = {
  wolverhampton: {
    name: "Wolverhampton Council Housing Options",
    phone: "01902 556789",
    outOfHours: "01902 552999",
    website: "https://www.wolverhampton.gov.uk/housing/homeless"
  },
  birmingham: {
    name: "Birmingham City Council Housing Options",
    phone: "0121 303 7410",
    outOfHours: "0121 675 4806",
    website: "https://www.birmingham.gov.uk/info/20017/housing_options_and_homelessness"
  },
  coventry: {
    name: "Coventry City Council Housing",
    phone: "024 7683 3552",
    outOfHours: "024 7683 2222",
    website: "https://www.coventry.gov.uk/homelessness"
  },
  dudley: {
    name: "Dudley Council Housing Options",
    phone: "0300 555 8283",
    outOfHours: "0300 555 8574",
    website: "https://www.dudley.gov.uk/residents/housing/homelessness/"
  },
  sandwell: {
    name: "Sandwell Council Housing Solutions",
    phone: "0121 368 1166",
    outOfHours: "0121 569 2355",
    website: "https://www.sandwell.gov.uk/housing"
  },
  solihull: {
    name: "Solihull Council Housing Options",
    phone: "0121 704 6000",
    outOfHours: "0121 605 6060",
    website: "https://www.solihull.gov.uk/Housing/Homelessness-and-housing-advice"
  },
  walsall: {
    name: "Walsall Council Housing Options",
    phone: "0300 555 8565",
    outOfHours: "0300 555 2922",
    website: "https://go.walsall.gov.uk/housing/homelessness_and_housing_advice"
  }
};

// Build Fire/Flood exit with local council info
function buildFireFloodExit(session: SessionState): RoutingResult {
  const isSupporter = session.isSupporter;
  const la = session.localAuthority?.toLowerCase().replace(/\s+/g, '') || '';
  const council = councilHousingData[la];
  
  let text = '';
  
  text += `Losing ${isSupporter ? 'their' : 'your'} home due to fire, flood, or another emergency is frightening. ${isSupporter ? 'They deserve' : 'You deserve'} support, and help is available.\n\n`;
  
  // Local council (if we have LA info)
  if (council) {
    text += `LOCAL COUNCIL\n`;
    text += `${council.name}\n`;
    // Combine phone numbers on one line if there's an out of hours number
    if (council.outOfHours) {
      text += `${council.phone} (out of hours: ${council.outOfHours})\n`;
    } else {
      text += `${council.phone}\n`;
    }
    text += `${council.website}\n`;
    text += `Contact them as soon as ${isSupporter ? 'they' : 'you'} can - they assess emergency situations urgently\n\n`;
  } else {
    text += `LOCAL COUNCIL\n`;
    text += `Local council housing team\n`;
    text += `https://www.gov.uk/find-local-council\n`;
    text += `Contact them as soon as ${isSupporter ? 'they' : 'you'} can - they assess emergency situations urgently\n\n`;
  }
  
  // Shelter - priority need page (fire/flood is automatic priority need)
  text += `HOUSING ADVICE\n`;
  text += `Shelter\n`;
  text += `0808 800 4444 (free, 8am-8pm weekdays, 9am-5pm weekends)\n`;
  text += `https://england.shelter.org.uk/housing_advice/homelessness/rules/priority_need\n`;
  text += `People made homeless by fire or flood have priority need for housing - Shelter can explain ${isSupporter ? 'their' : 'your'} rights\n\n`;
  
  // Warm sign-off with separator
  text += `---\n`;
  text += `Please reach out when ${isSupporter ? 'they' : 'you'} can. I'll be here if you need help finding other services later.`;
  
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

// Build Self-Harm exit with proper framing
function buildSelfHarmExit(session: SessionState): RoutingResult {
  const isSupporter = session.isSupporter;
  
  let text = '';
  
  text += `${isSupporter ? 'They deserve' : 'You deserve'} support with this, and ${isSupporter ? 'they don\'t' : 'you don\'t'} have to go through it alone.\n\n`;
  
  // Samaritans
  text += `MENTAL HEALTH SUPPORT\n`;
  text += `Samaritans\n`;
  text += `116 123 (24 hours, free)\n`;
  text += `https://www.samaritans.org\n`;
  text += `They're there to listen, any time of day or night - no judgement, no pressure\n\n`;
  
  // NHS
  text += `MENTAL HEALTH SUPPORT\n`;
  text += `NHS Mental Health Helpline\n`;
  text += `Call 111, choose option 2\n`;
  text += `https://www.nhs.uk/mental-health/\n`;
  text += `24/7 mental health crisis support\n\n`;
  
  // Mind
  text += `MENTAL HEALTH SUPPORT\n`;
  text += `Mind\n`;
  text += `0300 123 3393 (Mon-Fri 9am-6pm)\n`;
  text += `https://www.mind.org.uk/information-support/helplines/\n`;
  text += `Information and support for mental health\n\n`;
  
  // Warm sign-off with separator
  text += `---\n`;
  text += `Please reach out when ${isSupporter ? 'they feel' : 'you feel'} able to. I'll be here if you need help finding other services later. `;
  text += `${isSupporter ? '' : 'Take care of yourself.'}\n\n`;
  text += `If ${isSupporter ? 'they are' : 'you are'} in immediate danger, call 999 or go to A&E.`;
  
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

// ============================================================
// CHECK IF SOCIAL SERVICES QUESTIONS SHOULD BE ASKED
// Only for 16-17 and 18-20 age groups (priority need assessment)
// ============================================================

function shouldAskSocialServicesQuestions(session: SessionState): boolean {
  const age = session.detailedAge || session.ageCategory;
  return age === '16-17' || age === '18-20';
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
  
  // Location-only needs - no profiling required
  'Food': [],
  'Items': [],
  'Services': [],
  'Comms': []
};

// Map profile fields to their gate names
const profileFieldToGate: Record<string, GateType> = {
  'age': 'B5_PROFILE_AGE',
  'gender': 'B5_PROFILE_GENDER',
  'lgbtq': 'B5_PROFILE_LGBTQ',
  'convictions': 'B5_PROFILE_CONVICTIONS',
  'nrpf': 'B5_PROFILE_NRPF',
  'children': 'B5_PROFILE_CHILDREN'
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
    
    // LGBTQ
    if (field === 'lgbtq' && session.lgbtq === undefined) {
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
    
    // NRPF / Public funds access
    if (field === 'nrpf' && session.publicFunds === undefined) {
      return {
        ...phrase('B5_PROFILE_NRPF', session.isSupporter),
        stateUpdates: { 
          currentGate: 'B5_PROFILE_NRPF',
          criminalConvictions: session.criminalConvictions 
        }
      };
    }
    
    // Children/dependents
    if (field === 'children' && session.hasChildren === undefined) {
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
  const services = buildTerminalServices(session);
  const additionalNeeds = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
  return {
    text: services + '\n' + additionalNeeds?.text,
    options: additionalNeeds?.options,
    stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS' },
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
  'Food': [
    {
      name: 'Find a Food Bank',
      website: 'https://www.trusselltrust.org/get-help/find-a-foodbank/',
      description: 'Search for your nearest Trussell Trust food bank'
    }
  ],
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
      name: 'Citizens Advice',
      phone: '0800 144 8848',
      website: 'https://www.citizensadvice.org.uk/debt-and-money/',
      description: 'Free advice on benefits, debt and money problems'
    },
    {
      name: 'Turn2us',
      website: 'https://www.turn2us.org.uk',
      description: 'Benefits calculator and grants search'
    }
  ],
  'Work': [
    {
      name: 'Jobcentre Plus',
      website: 'https://www.gov.uk/contact-jobcentre-plus',
      description: 'Help with job searching, benefits and training'
    },
    {
      name: 'National Careers Service',
      phone: '0800 100 900',
      website: 'https://nationalcareers.service.gov.uk',
      description: 'Free careers advice and support'
    }
  ],
  'Training': [
    {
      name: 'National Careers Service',
      phone: '0800 100 900',
      website: 'https://nationalcareers.service.gov.uk',
      description: 'Free careers advice, skills assessment and training information'
    }
  ]
};

function buildNonHousingTerminal(session: SessionState): string {
  const need = session.supportNeed || 'support';
  const la = session.localAuthority || 'your area';
  const displayName = needDisplayNames[need] || need.toLowerCase();
  const categoryKey = needToCategoryMap[need] || '';
  
  // Build profile for service matching
  const profile: UserProfile = {
    localAuthority: session.localAuthority,
    supportNeed: session.supportNeed,
    gender: session.gender,
    ageCategory: session.ageCategory,
    lgbtq: session.lgbtq,
    criminalConvictions: session.criminalConvictions,
    hasChildren: session.hasChildren,
    sleepingSituation: session.sleepingSituation,
    mentalHealth: session.mentalHealth,
    physicalHealth: session.physicalHealth,
    immigrationStatus: session.immigrationStatus,
    publicFunds: session.publicFunds
  };
  
  // Get matched local services
  const localServices = getServicesForNeed(need, profile);
  const fallbacks = nationalFallbacks[need] || [];
  const hasLocalServices = localServices.length > 0;
  const hasFallbacks = fallbacks.length > 0;
  
  let text = '';
  
  // Opening line - personalised if profile was used
  if (isProfileRelevantNeed(need) && hasLocalServices) {
    text += `Based on what you have told me, here are some ${displayName} in ${la} that may be able to help.\n\n`;
  } else if (hasLocalServices) {
    text += `Here are some ${displayName} in ${la}.\n\n`;
  } else {
    text += `Here is some information about ${displayName}.\n\n`;
  }
  
  // Local services section
  if (hasLocalServices) {
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
  }
  
  // National fallbacks section
  if (hasFallbacks) {
    if (hasLocalServices) {
      text += `---\n\n`;
    }
    text += `NATIONAL RESOURCES\n`;
    text += `------------------\n\n`;
    
    for (const svc of fallbacks) {
      text += `${svc.name}\n`;
      if (svc.phone) {
        text += `${svc.phone}\n`;
      }
      text += `${svc.website}\n`;
      text += `${svc.description}\n\n`;
    }
  }
  
  // If no local services found, add search link
  if (!hasLocalServices && categoryKey && la !== 'your area') {
    text += `---\n\n`;
    text += `FIND MORE SERVICES\n`;
    text += `------------------\n\n`;
    text += `Search for ${displayName} in ${la}:\n`;
    text += `https://streetsupport.net/${la.toLowerCase().replace(/\s+/g, '-')}/find-help/category/?category=${categoryKey}\n`;
  }
  
  // Always add search link at the end if we have local services (for more options)
  if (hasLocalServices && categoryKey && la !== 'your area') {
    text += `---\n\n`;
    text += `Find more ${displayName} in ${la}:\n`;
    text += `https://streetsupport.net/${la.toLowerCase().replace(/\s+/g, '-')}/find-help/category/?category=${categoryKey}\n`;
  }
  
  return text.trim();
}

// ============================================================
// TERMINAL OUTPUT BUILDER - RESTRUCTURED v7.1
// Clear hierarchy: First Step -> Outreach -> Local Support -> Specialist -> Youth -> Safety Net
// ============================================================

function buildTerminalServices(session: SessionState): string {
  // Check if this is a non-housing need
  const housingRelatedNeeds = ['Emergency Housing', 'Advice'];
  if (session.supportNeed && !housingRelatedNeeds.includes(session.supportNeed)) {
    return buildNonHousingTerminal(session);
  }
  
  const la = session.localAuthority || 'your local council';
  const isSupporter = session.isSupporter;
  const pronoun = isSupporter ? 'them' : 'you';
  const possessive = isSupporter ? 'their' : 'your';
  const they = isSupporter ? 'they' : 'you';
  const theyve = isSupporter ? "they've" : "you've";
  const theyre = isSupporter ? "they're" : "you're";
  
  // Build user profile for service matching
  const profile: UserProfile = {
    localAuthority: session.localAuthority,
    supportNeed: session.supportNeed,
    gender: session.detailedGender || session.gender,
    ageCategory: session.detailedAge || session.ageCategory,
    lgbtq: session.lgbtq,
    criminalConvictions: session.criminalConvictions,
    hasChildren: session.hasChildren,
    sleepingSituation: session.sleepingSituation,
    mentalHealth: session.mentalHealth,
    physicalHealth: session.physicalHealth,
    immigrationStatus: session.immigrationStatus,
    publicFunds: session.publicFunds,
    lgbtqServicePreference: session.lgbtqServicePreference,
  };
  
  // Get services
  const councilOrg = getCouncilOrg(session.localAuthority);
  const localSupportOrgs = getLocalSupportOrgs(session.localAuthority);
  const specialistOrgs = getSpecialistOrgs(profile);
  const youthOrgs = getYouthOrgs(profile);
  const shelter = getShelterInfo(session.jurisdiction);
  const streetLink = getStreetLinkInfo();
  
  let text = '';
  
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
  // LOCAL SUPPORT - P3 and other drop-in services
  // ----------------------------------------
  if (localSupportOrgs.length > 0) {
    text += `LOCAL SUPPORT\n`;
    text += `-------------\n`;
    
    for (const org of localSupportOrgs) {
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
  if (specialistOrgs.length > 0) {
    text += `SPECIALIST SUPPORT\n`;
    text += `------------------\n`;
    
    for (const org of specialistOrgs) {
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
  
  return text;
}

// ============================================================
// FIRST MESSAGE
// ============================================================

export function getFirstMessage(session: SessionState): RoutingResult {
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
        ...phrase('B2_WHO_FOR', session.isSupporter),
        stateUpdates: { currentGate: 'B2_WHO_FOR', localAuthority: la }
      };
    
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
      
      // Housing-related needs require full profiling (age, gender, homelessness status, etc.)
      const housingRelatedNeeds = ['Emergency Housing', 'Advice'];
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
    
    case 'B5_PROFILE_LGBTQ':
      // 1 = Yes, 2 = No, 3 = Prefer not to say
      const lgbtqValue = choice === 1 ? true : (choice === 2 ? false : null);
      
      const sessionWithLgbtq = { ...session, lgbtq: lgbtqValue };
      return routeToNextProfileQuestion(sessionWithLgbtq);
    
    case 'B5_PROFILE_CONVICTIONS':
      const convictionOptions = ['Yes', 'No', 'Prefer not to say'];
      const convictions = choice ? convictionOptions[choice - 1] : null;
      
      const sessionWithConvictions = { ...session, criminalConvictions: convictions };
      return routeToNextProfileQuestion(sessionWithConvictions);
    
    case 'B5_PROFILE_NRPF':
      // 1 = Yes (has access), 2 = No (NRPF), 3 = Not sure, 4 = Prefer not to say
      const nrpfOptions = ['Yes', 'No', 'Not sure', 'Prefer not to say'];
      const nrpfValue = choice ? nrpfOptions[choice - 1] : null;
      
      const sessionWithNrpf = { ...session, publicFunds: nrpfValue };
      return routeToNextProfileQuestion(sessionWithNrpf);
    
    case 'B5_PROFILE_CHILDREN':
      // 1 = Yes, 2 = No, 3 = Prefer not to say
      const childrenValue = choice === 1 ? true : (choice === 2 ? false : null);
      
      const sessionWithChildren = { ...session, hasChildren: childrenValue };
      return routeToNextProfileQuestion(sessionWithChildren);
    
    case 'B6_HOMELESSNESS_STATUS':
      const homeless = choice === 1;
      
      if (homeless) {
        return {
          ...phrase('B7_HOMELESS_SLEEPING_SITUATION', session.isSupporter),
          stateUpdates: { currentGate: 'B7_HOMELESS_SLEEPING_SITUATION', homeless: true }
        };
      } else {
        return {
          ...phrase('B7_HOUSED_SITUATION', session.isSupporter),
          stateUpdates: { currentGate: 'B7_HOUSED_SITUATION', homeless: false }
        };
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
          const servicesB7A = buildTerminalServices(session);
          const additionalNeedsB7A = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
          return {
            text: servicesB7A + '\n' + additionalNeedsB7A?.text,
            options: additionalNeedsB7A?.options,
            stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', preventionNeed: false },
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
        const servicesB7 = buildTerminalServices({ ...session, sleepingSituation: sleeping });
        const additionalNeedsB7 = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
        
        // Add StreetLink for rough sleeping
        let text = servicesB7;
        if (choice === 1) {
          const streetlink = getPhrase('STREETLINK_SIGNPOST', session.isSupporter);
          text = (streetlink?.text || '') + '\n\n' + servicesB7;
        }
        
        return {
          text: text + '\n' + additionalNeedsB7?.text,
          options: additionalNeedsB7?.options,
          stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', sleepingSituation: sleeping },
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

// Handle LOCATION_OUTSIDE_WMCA response
export function processOutsideWMCAResponse(session: SessionState, choice: number): RoutingResult {
  if (choice === 1) {
    // Continue anyway
    return {
      ...phrase('B2_WHO_FOR', session.isSupporter),
      stateUpdates: { currentGate: 'B2_WHO_FOR' }
    };
  } else {
    // Let them select different area
    return {
      ...phrase('B1_LOCAL_AUTHORITY', session.isSupporter),
      stateUpdates: { 
        currentGate: 'B1_LOCAL_AUTHORITY', 
        locationMethod: 'MANUAL',
        localAuthority: null,
        latitude: null,
        longitude: null
      }
    };
  }
}
