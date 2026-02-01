// Street Support VA v7 State Machine - COMPLETE VERSION
// Full routing logic from CHAR_VA_RoutingLogic_v7.md

import { getPhrase, PhraseEntry } from './phrasebank';
import { matchServices, formatServicesForTerminal, getDefaultOrgs, formatDefaultOrgs, getLGBTQOrgs, getImmigrationOrgs, getWomensAid, getChildrensServices } from './serviceMatcher';

// ============================================================
// TYPES
// ============================================================

export type GateType = 
  // Init & Gates
  | 'INIT'
  | 'GATE0_CRISIS_DANGER'
  | 'GATE1_INTENT'
  | 'GATE2_ROUTE_SELECTION'
  // Advice Mode
  | 'B4_ADVICE_TOPIC_SELECTION'
  | 'ADVICE_BRIDGE'
  // Core Profiling
  | 'B1_LOCAL_AUTHORITY'
  | 'B2_WHO_FOR'
  | 'B3_AGE_CATEGORY'
  | 'B4_GENDER'
  | 'B5_MAIN_SUPPORT_NEED'
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
  sessionEnded: boolean;
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

// Build dynamic DV exit with local Women's Aid and Children's Services
function buildDVExit(session: SessionState, hasChildren: boolean): RoutingResult {
  const isSupporter = session.isSupporter;
  const gender = session.dvGender?.toLowerCase() || 'other';
  
  let text = isSupporter 
    ? "I'm really sorry this is happening to them. They deserve support, and these services are here to help. They can talk through options, help with safety planning, and connect them with emergency housing if needed. Everything is confidential.\n\n"
    : "I'm really sorry this is happening. You deserve support, and these services are here to help. They can talk through your options, help with safety planning, and connect you with emergency housing if needed. Everything is confidential.\n\n";
  
  // National DV helpline (for women) or ManKind (for men) or Galop (for LGBTQ+)
  if (gender === 'female') {
    text += `National Domestic Violence Helpline\n`;
    text += `0808 2000 247 (24/7, free, confidential)\n`;
    text += `https://nationaldahelpline.org.uk\n\n`;
  } else if (gender === 'male') {
    text += `ManKind Initiative\n`;
    text += `0808 800 1170\n`;
    text += `https://mankind.org.uk\n`;
    text += `Confidential support for men affected by domestic violence\n\n`;
  } else {
    text += `Galop\n`;
    text += `0800 999 5428\n`;
    text += `https://galop.org.uk\n`;
    text += `National helpline for LGBTQ+ people affected by abuse or violence\n\n`;
  }
  
  // Local Women's Aid (for women)
  if (gender === 'female') {
    const womensAid = getWomensAid(session.localAuthority);
    if (womensAid) {
      text += `${womensAid.name}\n`;
      if (womensAid.phone) text += `${womensAid.phone}\n`;
      if (womensAid.website) text += `${womensAid.website}\n`;
      text += '\n';
    }
  }
  
  // Children's Services (if has children)
  if (hasChildren) {
    const childrensServices = getChildrensServices(session.localAuthority);
    if (childrensServices) {
      text += `${childrensServices.name}\n`;
      if (childrensServices.phone) text += `${childrensServices.phone}\n`;
      if (childrensServices.website) text += `${childrensServices.website}\n`;
      text += '\n';
    }
  }
  
  // Local Housing Options
  const defaultOrgs = getDefaultOrgs(session.localAuthority);
  const housingOptions = defaultOrgs.find(o => o.name.includes('Housing Options') || o.name.includes('Housing'));
  if (housingOptions) {
    text += `${housingOptions.name}\n`;
    if (housingOptions.phone) text += `${housingOptions.phone}\n`;
    if (housingOptions.website) text += `${housingOptions.website}\n`;
    text += '\n';
  }
  
  // Shelter DV advice
  text += `Shelter - Domestic Violence Advice\n`;
  text += `https://england.shelter.org.uk/housing_advice/homelessness/priority_need/at_risk_of_domestic_abuse\n`;
  
  return {
    text,
    stateUpdates: {
      currentGate: 'SESSION_END',
      safeguardingTriggered: true,
      safeguardingType: 'DOMESTIC_ABUSE',
      dvChildren: hasChildren,
      timestampEnd: new Date().toISOString(),
    },
    sessionEnded: true,
  };
}

function buildTerminalServices(session: SessionState): string {
  const la = session.localAuthority || 'your local council';
  const isSupporter = session.isSupporter;
  const pronoun = isSupporter ? 'them' : 'you';
  
  // Build profile for matching
  const profile = {
    localAuthority: session.localAuthority,
    supportNeed: session.supportNeed,
    gender: session.gender || session.detailedGender,
    ageCategory: session.ageCategory || session.detailedAge,
    lgbtq: session.lgbtq,
    criminalConvictions: session.criminalConvictions,
    hasChildren: session.hasChildren,
    sleepingSituation: session.sleepingSituation,
    mentalHealth: session.mentalHealth,
    physicalHealth: session.physicalHealth
  };
  
  let text = `Based on what ${isSupporter ? "you've told me about their situation" : "you've told me"}, here are some services that can help:\n\n`;
  
  // 1. DEFAULTS FIRST - Council Housing Options + P3 (if applicable)
  const defaultOrgs = getDefaultOrgs(session.localAuthority);
  if (defaultOrgs.length > 0) {
    text += formatDefaultOrgs(defaultOrgs);
  }
  
  // 2. LGBTQ+ SPECIALIST SERVICES (if lgbtq = true)
  if (session.lgbtq) {
    const lgbtqOrgs = getLGBTQOrgs();
    if (lgbtqOrgs.length > 0) {
      text += formatDefaultOrgs(lgbtqOrgs);
    }
  }
  
  // 3. IMMIGRATION/NRPF SPECIALIST SERVICES (if applicable)
  const needsImmigrationSupport = 
    session.immigrationStatus === 'Asylum seeker' ||
    session.immigrationStatus === 'No status' ||
    session.publicFunds === 'No';
  
  if (needsImmigrationSupport) {
    const immigrationOrgs = getImmigrationOrgs(session.localAuthority);
    if (immigrationOrgs.length > 0) {
      text += formatDefaultOrgs(immigrationOrgs);
    }
  }
  
  // 4. MATCHED SERVICES - based on profile from JSON
  const matchedServices = matchServices(profile, 3);
  if (matchedServices.length > 0) {
    text += formatServicesForTerminal(matchedServices, profile);
  }
  
  // 5. SHELTER - always include as national fallback
  text += `Shelter\n`;
  text += `0808 800 4444 (free, 8am-8pm weekdays, 9am-5pm weekends)\n`;
  text += `https://england.shelter.org.uk\n\n`;
  
  // 6. STREETLINK if rough sleeping
  if (session.sleepingSituation?.toLowerCase().includes('rough')) {
    text += `StreetLink - to alert local outreach teams\n`;
    text += `https://streetlink.org.uk\n\n`;
  }
  
  // 7. YOUTH SERVICES if flagged
  if (session.youthServicesFlag) {
    text += `Centrepoint - support for young people\n`;
    text += `0808 800 0661\n`;
    text += `https://centrepoint.org.uk\n\n`;
  }
  
  // 8. SOCIAL SERVICES GUIDANCE for young people / care leavers
  if ((session.ageCategory === '16-17' || session.inCare) && session.socialServices === 'No') {
    const guidance = getPhrase('TERMINAL_SOCIAL_SERVICES_GUIDANCE', false);
    if (guidance) {
      text += '\n' + guidance.text + '\n';
    }
  }
  
  return text;
}

function terminalWithAdditionalNeeds(session: SessionState, extraUpdates: Partial<SessionState> = {}): RoutingResult {
  const services = buildTerminalServices(session);
  const addNeeds = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
  return {
    text: services + '\n' + (addNeeds?.text || ''),
    options: addNeeds?.options,
    stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', ...extraUpdates },
    sessionEnded: false
  };
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
    // GATE 0: CRISIS
    // ========================================
    case 'GATE0_CRISIS_DANGER': {
      switch (choice) {
        case 1: return safeguardingExit('IMMEDIATE_PHYSICAL_DANGER_EXIT', session.isSupporter, 'IMMEDIATE_DANGER');
        case 2: return phrase('DV_GENDER_ASK', session.isSupporter);
        case 3: return phrase('SA_GENDER_ASK', session.isSupporter);
        case 4: return safeguardingExit('SELF_HARM_EXIT', session.isSupporter, 'SELF_HARM');
        case 5: return safeguardingExit('UNDER_16_EXIT', session.isSupporter, 'UNDER_16');
        case 6: return safeguardingExit('FIRE_FLOOD_EXIT', session.isSupporter, 'FIRE_FLOOD');
        case 7: return phrase('GATE1_INTENT', session.isSupporter);
        default: return phrase('GATE0_CRISIS_DANGER', session.isSupporter);
      }
    }
    
    // ========================================
    // DV ROUTING
    // ========================================
    case 'DV_GENDER_ASK': {
      const dvGenders = ['Female', 'Male', 'Non-binary or other', 'Prefer not to say'];
      const dvGender = choice ? dvGenders[choice - 1] : null;
      return {
        ...phrase('DV_CHILDREN_ASK', session.isSupporter),
        stateUpdates: { currentGate: 'DV_CHILDREN_ASK', dvGender }
      };
    }
    
    case 'DV_CHILDREN_ASK': {
      const dvChildren = choice === 1;
      // Use dynamic DV exit builder with local orgs
      return buildDVExit(session, dvChildren);
    }
    
    // ========================================
    // SA ROUTING
    // ========================================
    case 'SA_GENDER_ASK': {
      const saGenders = ['Female', 'Male', 'Non-binary or other', 'Prefer not to say'];
      const saGender = choice ? saGenders[choice - 1] : null;
      const saExitKey = getSAExitKey(saGender);
      return safeguardingExit(saExitKey, session.isSupporter, 'SEXUAL_VIOLENCE');
    }
    
    // ========================================
    // GATE 1: INTENT
    // ========================================
    case 'GATE1_INTENT': {
      switch (choice) {
        case 1:
          return {
            ...phrase('B4_ADVICE_TOPIC_SELECTION', session.isSupporter),
            stateUpdates: { currentGate: 'B4_ADVICE_TOPIC_SELECTION', intentType: 'ADVICE' }
          };
        case 2:
          return {
            ...phrase('GATE2_ROUTE_SELECTION', session.isSupporter),
            stateUpdates: { currentGate: 'GATE2_ROUTE_SELECTION', intentType: 'SERVICES' }
          };
        case 3:
          return {
            ...phrase('B1_LOCAL_AUTHORITY', session.isSupporter),
            stateUpdates: { currentGate: 'B1_LOCAL_AUTHORITY', intentType: 'ORGANISATION' }
          };
        default:
          return phrase('GATE1_INTENT', session.isSupporter);
      }
    }
    
    // ========================================
    // ADVICE MODE
    // ========================================
    case 'B4_ADVICE_TOPIC_SELECTION': {
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
    }
    
    case 'ADVICE_BRIDGE': {
      switch (choice) {
        case 1:
          return phrase('GATE2_ROUTE_SELECTION', session.isSupporter);
        case 2:
          return phrase('B4_ADVICE_TOPIC_SELECTION', session.isSupporter);
        case 3: {
          const goodbye = getPhrase('TERMINAL_GOODBYE', session.isSupporter);
          return {
            text: goodbye?.text || 'Take care.',
            stateUpdates: { currentGate: 'SESSION_END', timestampEnd: new Date().toISOString() },
            sessionEnded: true
          };
        }
        default:
          return phrase('ADVICE_BRIDGE', session.isSupporter);
      }
    }
    
    // ========================================
    // GATE 2: ROUTE SELECTION
    // ========================================
    case 'GATE2_ROUTE_SELECTION': {
      const routeType = choice === 1 ? 'FULL' : 'QUICK';
      return {
        ...phrase('B1_LOCAL_AUTHORITY', session.isSupporter),
        stateUpdates: { currentGate: 'B1_LOCAL_AUTHORITY', routeType }
      };
    }
    
    // ========================================
    // SECTION B: CORE PROFILING
    // ========================================
    case 'B1_LOCAL_AUTHORITY': {
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
    }
    
    case 'B2_WHO_FOR': {
      const userTypes: Record<number, 'SELF' | 'SUPPORTER' | 'PROFESSIONAL'> = {
        1: 'SELF',
        2: 'SUPPORTER',
        3: 'PROFESSIONAL',
        4: 'SELF'
      };
      const userType = userTypes[choice || 1];
      const isSupporter = userType === 'SUPPORTER' || userType === 'PROFESSIONAL';
      
      return {
        ...phrase('B3_AGE_CATEGORY', isSupporter),
        stateUpdates: { currentGate: 'B3_AGE_CATEGORY', userType, isSupporter }
      };
    }
    
    case 'B3_AGE_CATEGORY': {
      const ageOptions = ['Under 16', '16-17', '18-24', '25 or over'];
      const age = choice ? ageOptions[choice - 1] : null;
      
      if (choice === 1) {
        return safeguardingExit('UNDER_16_EXIT', session.isSupporter, 'UNDER_16');
      }
      
      const youthFlag = choice === 2;
      
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
    }
    
    case 'B4_GENDER': {
      const genderOptions = ['Male', 'Female', 'Non-binary or other', 'Prefer not to say'];
      const gender = choice ? genderOptions[choice - 1] : null;
      
      return {
        ...phrase('B5_MAIN_SUPPORT_NEED', session.isSupporter),
        stateUpdates: { currentGate: 'B5_MAIN_SUPPORT_NEED', gender }
      };
    }
    
    case 'B5_MAIN_SUPPORT_NEED': {
      const needOptions = ['Emergency Housing', 'Food', 'Work', 'Health', 'Advice', 'Drop In', 'Financial', 'Items', 'Services', 'Comms', 'Training', 'Activities'];
      const need = choice ? needOptions[choice - 1] : null;
      
      return {
        ...phrase('B6_HOMELESSNESS_STATUS', session.isSupporter),
        stateUpdates: { currentGate: 'B6_HOMELESSNESS_STATUS', supportNeed: need, needCount: session.needCount + 1 }
      };
    }
    
    case 'B6_HOMELESSNESS_STATUS': {
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
    }
    
    case 'B7_HOUSED_SITUATION': {
      const housedOptions = ['At home', 'Friends/family', 'Council temp', 'Other temp'];
      const housed = choice ? housedOptions[choice - 1] : null;
      
      if (choice && choice >= 2) {
        return {
          ...phrase('B7_HOMELESS_SLEEPING_SITUATION', session.isSupporter),
          stateUpdates: { currentGate: 'B7_HOMELESS_SLEEPING_SITUATION', housedSituation: housed, homeless: true }
        };
      }
      
      return {
        ...phrase('B7A_PREVENTION_GATE', session.isSupporter),
        stateUpdates: { currentGate: 'B7A_PREVENTION_GATE', housedSituation: housed }
      };
    }
    
    case 'B7A_PREVENTION_GATE': {
      switch (choice) {
        case 1:
          return {
            ...phrase('B7B_PREVENTION_REASON', session.isSupporter),
            stateUpdates: { currentGate: 'B7B_PREVENTION_REASON', preventionNeed: true }
          };
        case 2:
          return terminalWithAdditionalNeeds(session, { preventionNeed: false });
        case 3:
          return phrase('B6_HOMELESSNESS_STATUS', session.isSupporter);
        default:
          return phrase('B7A_PREVENTION_GATE', session.isSupporter);
      }
    }
    
    case 'B7_HOMELESS_SLEEPING_SITUATION': {
      const sleepingOptions = ['Rough sleeping', 'Emergency accommodation', 'Sofa surfing', 'Council temp', 'Other temp'];
      const sleeping = choice ? sleepingOptions[choice - 1] : null;
      
      if (session.routeType === 'QUICK') {
        let text = buildTerminalServices({ ...session, sleepingSituation: sleeping });
        
        if (choice === 1) {
          const streetlink = getPhrase('STREETLINK_SIGNPOST', session.isSupporter);
          text = (streetlink?.text || '') + '\n\n' + text;
        }
        
        const addNeeds = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
        return {
          text: text + '\n' + (addNeeds?.text || ''),
          options: addNeeds?.options,
          stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', sleepingSituation: sleeping },
          sessionEnded: false
        };
      } else {
        return {
          ...phrase('B8_DURATION', session.isSupporter),
          stateUpdates: { currentGate: 'B8_DURATION', sleepingSituation: sleeping }
        };
      }
    }
    
    // ========================================
    // PREVENTION PATHWAY (B7B-B7E)
    // ========================================
    case 'B7B_PREVENTION_REASON': {
      const reasonOptions = ['Rent arrears', 'Eviction notice', 'Mortgage arrears', 'Family/friends notice', 'Financial difficulties', 'Prefer not to say'];
      const prevReason = choice ? reasonOptions[choice - 1] : null;
      
      return {
        ...phrase('B7C_PREVENTION_URGENCY', session.isSupporter),
        stateUpdates: { currentGate: 'B7C_PREVENTION_URGENCY', preventionReason: prevReason }
      };
    }
    
    case 'B7C_PREVENTION_URGENCY': {
      const urgencyOptions = ['Now/soon', 'Months away', 'Not sure'];
      const urgency = choice ? urgencyOptions[choice - 1] : null;
      
      return {
        ...phrase('B7D_1_PREVENTION_CHILDREN_DEPENDENTS', session.isSupporter),
        stateUpdates: { currentGate: 'B7D_1_PREVENTION_CHILDREN_DEPENDENTS', preventionUrgency: urgency }
      };
    }
    
    case 'B7D_1_PREVENTION_CHILDREN_DEPENDENTS': {
      const prevChildrenOptions = ['Yes', 'No', 'Prefer not to say'];
      const prevChildren = choice ? prevChildrenOptions[choice - 1] : null;
      
      return {
        ...phrase('B7D_2_PREVENTION_EMPLOYMENT_INCOME', session.isSupporter),
        stateUpdates: { currentGate: 'B7D_2_PREVENTION_EMPLOYMENT_INCOME', preventionChildren: prevChildren }
      };
    }
    
    case 'B7D_2_PREVENTION_EMPLOYMENT_INCOME': {
      const empOptions = ['Employed', 'Unemployed', 'Benefits', 'Self-employed', 'Not working', 'Prefer not to say'];
      const emp = choice ? empOptions[choice - 1] : null;
      
      return {
        ...phrase('B7D_3_PREVENTION_PRIOR_SUPPORT', session.isSupporter),
        stateUpdates: { currentGate: 'B7D_3_PREVENTION_PRIOR_SUPPORT', preventionEmployment: emp }
      };
    }
    
    case 'B7D_3_PREVENTION_PRIOR_SUPPORT': {
      const priorOptions = ['Yes spoken to someone', 'No not yet', 'Not sure who'];
      const prior = choice ? priorOptions[choice - 1] : null;
      
      return {
        ...phrase('B7D_4_PREVENTION_SAFEGUARDING_SIGNALS', session.isSupporter),
        stateUpdates: { currentGate: 'B7D_4_PREVENTION_SAFEGUARDING_SIGNALS', preventionPriorSupport: prior }
      };
    }
    
    case 'B7D_4_PREVENTION_SAFEGUARDING_SIGNALS': {
      const sigOptions = ['Yes something else', 'No just housing', 'Prefer not to say'];
      const sig = choice ? sigOptions[choice - 1] : null;
      
      if (choice === 1) {
        return {
          ...phrase('B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP', session.isSupporter),
          stateUpdates: { currentGate: 'B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP', preventionSafeguardingSignals: sig }
        };
      }
      
      const isUrgent = session.preventionUrgency === 'Now/soon';
      const hasChildren = session.preventionChildren === 'Yes';
      const isEviction = session.preventionReason?.includes('Eviction');
      
      if (isUrgent && isEviction) {
        const legal = getPhrase('ESCALATION_LEVEL_2_LEGAL_EMERGENCY', session.isSupporter);
        return {
          text: legal?.text || '',
          stateUpdates: { currentGate: 'SESSION_END', escalationLevel: 2, timestampEnd: new Date().toISOString() },
          sessionEnded: true
        };
      }
      
      if (isUrgent && hasChildren) {
        const childRisk = getPhrase('ESCALATION_LEVEL_2_CHILDREN_RISK', session.isSupporter);
        return {
          text: childRisk?.text || '',
          stateUpdates: { currentGate: 'SESSION_END', escalationLevel: 2, timestampEnd: new Date().toISOString() },
          sessionEnded: true
        };
      }
      
      return terminalWithAdditionalNeeds(session, { preventionSafeguardingSignals: sig });
    }
    
    case 'B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP': {
      switch (choice) {
        case 1:
          return phrase('DV_GENDER_ASK', session.isSupporter);
        case 2: {
          const health = getPhrase('ESCALATION_LEVEL_2_HEALTH_CRISIS', session.isSupporter);
          return {
            text: health?.text || '',
            stateUpdates: { currentGate: 'SESSION_END', safeguardingType: 'HEALTH_CRISIS', timestampEnd: new Date().toISOString() },
            sessionEnded: true
          };
        }
        case 4:
          return safeguardingExit('CHILD_AT_RISK_EXIT', session.isSupporter, 'CHILD_AT_RISK');
        default:
          return terminalWithAdditionalNeeds(session);
      }
    }
    
    // ========================================
    // HOMELESS CONTINUATION (B8-B12)
    // ========================================
    case 'B8_DURATION': {
      const durationOptions = ['Less than a week', '1-4 weeks', '1-6 months', '6-12 months', 'Over a year'];
      const duration = choice ? durationOptions[choice - 1] : null;
      
      return {
        ...phrase('B9_REASON', session.isSupporter),
        stateUpdates: { currentGate: 'B9_REASON', duration }
      };
    }
    
    case 'B9_REASON': {
      const b9Options = ['Relationship breakdown', 'Domestic abuse', 'Lost job', 'Asked to leave', 'End of tenancy', 'Prison/hospital', 'Mental health', 'Substance use', 'Other'];
      const b9Reason = choice ? b9Options[choice - 1] : null;
      
      if (choice === 2) {
        return phrase('DV_GENDER_ASK', session.isSupporter);
      }
      
      let extraText = '';
      if (choice === 7) {
        const ack = getPhrase('B9C_MENTAL_HEALTH_ACKNOWLEDGMENT', session.isSupporter);
        extraText = (ack?.text || '') + '\n\n';
      }
      
      const b10 = getPhrase('B10_INCOME', session.isSupporter);
      return {
        text: extraText + (b10?.text || ''),
        options: b10?.options,
        stateUpdates: { currentGate: 'B10_INCOME', reason: b9Reason },
        sessionEnded: false
      };
    }
    
    case 'B10_INCOME': {
      const incomeOptions = ['Employment', 'Benefits', 'Family/friends', 'No income', 'Prefer not to say'];
      const income = choice ? incomeOptions[choice - 1] : null;
      
      return {
        ...phrase('B11_PRIOR_USE', session.isSupporter),
        stateUpdates: { currentGate: 'B11_PRIOR_USE', income }
      };
    }
    
    case 'B11_PRIOR_USE': {
      const priorUseOptions = ['Yes', 'No', 'Not sure'];
      const priorUse = choice ? priorUseOptions[choice - 1] : null;
      
      return {
        ...phrase('B12_ALREADY_SUPPORTED', session.isSupporter),
        stateUpdates: { currentGate: 'B12_ALREADY_SUPPORTED', priorUse }
      };
    }
    
    case 'B12_ALREADY_SUPPORTED': {
      const alreadySupported = choice === 1;
      
      if (alreadySupported) {
        return {
          ...phrase('B12A_WHICH_ORG', session.isSupporter),
          stateUpdates: { currentGate: 'B12A_WHICH_ORG', alreadySupported: true }
        };
      }
      
      if (session.routeType === 'FULL') {
        return {
          ...phrase('C2_CONSENT_GATE', session.isSupporter),
          stateUpdates: { currentGate: 'C2_CONSENT_GATE', alreadySupported: false }
        };
      } else {
        return terminalWithAdditionalNeeds(session, { alreadySupported: false });
      }
    }
    
    case 'B12A_WHICH_ORG': {
      if (session.routeType === 'FULL') {
        return {
          ...phrase('C2_CONSENT_GATE', session.isSupporter),
          stateUpdates: { currentGate: 'C2_CONSENT_GATE', currentSupportingOrg: input }
        };
      } else {
        return terminalWithAdditionalNeeds(session, { currentSupportingOrg: input });
      }
    }
    
    // ========================================
    // SECTION C: DETAILED PROFILING
    // ========================================
    case 'C2_CONSENT_GATE': {
      if (choice === 1) {
        const ack = getPhrase('C2A_CONSENT_ACKNOWLEDGED', session.isSupporter);
        const imm = getPhrase('C3Q1_IMMIGRATION_STATUS', session.isSupporter);
        return {
          text: (ack?.text || '') + '\n\n' + (imm?.text || ''),
          options: imm?.options,
          stateUpdates: { currentGate: 'C3Q1_IMMIGRATION_STATUS', consentGiven: true },
          sessionEnded: false
        };
      } else {
        return terminalWithAdditionalNeeds(session, { consentGiven: false });
      }
    }
    
    case 'C3Q1_IMMIGRATION_STATUS': {
      const immOptions = ['British', 'EUSS', 'Refugee', 'Leave to remain', 'Asylum seeker', 'No status', 'Prefer not to say'];
      const imm = choice ? immOptions[choice - 1] : null;
      
      if (choice === 2) {
        return {
          ...phrase('C3Q1A_EUSS_FOLLOWUP', session.isSupporter),
          stateUpdates: { currentGate: 'C3Q1A_EUSS_FOLLOWUP', immigrationStatus: imm }
        };
      }
      
      if (choice === 6) {
        const ack = getPhrase('C3Q1C_NRPF_ACKNOWLEDGMENT', session.isSupporter);
        const pf = getPhrase('C3Q1B_PUBLIC_FUNDS_FOLLOWUP', session.isSupporter);
        return {
          text: (ack?.text || '') + '\n\n' + (pf?.text || ''),
          options: pf?.options,
          stateUpdates: { currentGate: 'C3Q1B_PUBLIC_FUNDS_FOLLOWUP', immigrationStatus: imm },
          sessionEnded: false
        };
      }
      
      return {
        ...phrase('C3Q2_DEPENDENT_CHILDREN', session.isSupporter),
        stateUpdates: { currentGate: 'C3Q2_DEPENDENT_CHILDREN', immigrationStatus: imm }
      };
    }
    
    case 'C3Q1A_EUSS_FOLLOWUP': {
      const eussOptions = ['Settled', 'Pre-settled', 'Unsure'];
      const euss = choice ? eussOptions[choice - 1] : null;
      
      if (choice === 2) {
        return {
          ...phrase('C3Q1B_PUBLIC_FUNDS_FOLLOWUP', session.isSupporter),
          stateUpdates: { currentGate: 'C3Q1B_PUBLIC_FUNDS_FOLLOWUP', eussStatus: euss }
        };
      }
      
      return {
        ...phrase('C3Q2_DEPENDENT_CHILDREN', session.isSupporter),
        stateUpdates: { currentGate: 'C3Q2_DEPENDENT_CHILDREN', eussStatus: euss }
      };
    }
    
    case 'C3Q1B_PUBLIC_FUNDS_FOLLOWUP': {
      const pfOptions = ['Yes', 'No', 'Not sure'];
      const pf = choice ? pfOptions[choice - 1] : null;
      
      return {
        ...phrase('C3Q2_DEPENDENT_CHILDREN', session.isSupporter),
        stateUpdates: { currentGate: 'C3Q2_DEPENDENT_CHILDREN', publicFunds: pf }
      };
    }
    
    case 'C3Q2_DEPENDENT_CHILDREN': {
      const hasChildrenC = choice === 1;
      
      // Skip C3Q3_AGE and C3Q4_GENDER - already collected at B3/B4
      // Check if pregnancy question needed (female or non-binary from B4)
      const genderLower = (session.gender || '').toLowerCase();
      if (genderLower === 'female' || genderLower.includes('non-binary')) {
        return {
          ...phrase('C3Q5_PREGNANCY', session.isSupporter),
          stateUpdates: { currentGate: 'C3Q5_PREGNANCY', hasChildren: hasChildrenC }
        };
      }
      
      // Male or prefer not to say - skip pregnancy, go to ethnicity
      return {
        ...phrase('C3Q6_ETHNICITY', session.isSupporter),
        stateUpdates: { currentGate: 'C3Q6_ETHNICITY', hasChildren: hasChildrenC }
      };
    }
    
    case 'C3Q3_AGE': {
      const detailedAgeOptions = ['Under 16', '16-17', '18-20', '21-24', '25+'];
      const detailedAge = choice ? detailedAgeOptions[choice - 1] : null;
      
      if (choice === 1) {
        return safeguardingExit('UNDER_16_EXIT', session.isSupporter, 'UNDER_16');
      }
      
      return {
        ...phrase('C3Q4_GENDER', session.isSupporter),
        stateUpdates: { currentGate: 'C3Q4_GENDER', detailedAge }
      };
    }
    
    case 'C3Q4_GENDER': {
      const detailedGenderOptions = ['Male', 'Female', 'Trans Female', 'Trans Male'];
      const detailedGender = choice ? detailedGenderOptions[choice - 1] : null;
      
      if (choice === 2 || choice === 3) {
        return {
          ...phrase('C3Q5_PREGNANCY', session.isSupporter),
          stateUpdates: { currentGate: 'C3Q5_PREGNANCY', detailedGender }
        };
      }
      
      return {
        ...phrase('C3Q6_ETHNICITY', session.isSupporter),
        stateUpdates: { currentGate: 'C3Q6_ETHNICITY', detailedGender }
      };
    }
    
    case 'C3Q5_PREGNANCY': {
      const pregnant = choice === 1;
      
      return {
        ...phrase('C3Q6_ETHNICITY', session.isSupporter),
        stateUpdates: { currentGate: 'C3Q6_ETHNICITY', pregnant }
      };
    }
    
    case 'C3Q6_ETHNICITY': {
      const ethOptions = ['White British', 'White Other', 'Black African', 'Black Caribbean', 'Asian', 'Mixed'];
      const eth = choice ? ethOptions[choice - 1] : null;
      
      return {
        ...phrase('C3Q7_PHYSICAL_HEALTH', session.isSupporter),
        stateUpdates: { currentGate: 'C3Q7_PHYSICAL_HEALTH', ethnicity: eth }
      };
    }
    
    case 'C3Q7_PHYSICAL_HEALTH': {
      const phOptions = ['None', 'Mobility', 'Visual', 'Hearing', 'Verbal', 'Neurological'];
      const ph = choice ? phOptions[choice - 1] : null;
      
      return {
        ...phrase('C3Q8_MENTAL_HEALTH', session.isSupporter),
        stateUpdates: { currentGate: 'C3Q8_MENTAL_HEALTH', physicalHealth: ph }
      };
    }
    
    case 'C3Q8_MENTAL_HEALTH': {
      const mhOptions = ['None', 'Depression', 'Anxiety', 'PTSD', 'Bipolar', 'Schizophrenia', 'Neurodivergence', 'Learning difficulties', 'Prefer not to say'];
      const mh = choice ? mhOptions[choice - 1] : null;
      
      return {
        ...phrase('C3Q9_CRIMINAL_CONVICTIONS', session.isSupporter),
        stateUpdates: { currentGate: 'C3Q9_CRIMINAL_CONVICTIONS', mentalHealth: mh }
      };
    }
    
    case 'C3Q9_CRIMINAL_CONVICTIONS': {
      const ccOptions = ['None', 'Arson', 'Sexual', 'Violent', 'Prefer not to say'];
      const cc = choice ? ccOptions[choice - 1] : null;
      
      return {
        ...phrase('C3Q10_LGBTQ', session.isSupporter),
        stateUpdates: { currentGate: 'C3Q10_LGBTQ', criminalConvictions: cc }
      };
    }
    
    case 'C3Q10_LGBTQ': {
      const lgbtq = choice === 1;
      
      if (lgbtq) {
        return {
          ...phrase('C3Q10A_LGBTQ_SERVICE_PREFERENCE', session.isSupporter),
          stateUpdates: { currentGate: 'C3Q10A_LGBTQ_SERVICE_PREFERENCE', lgbtq: true }
        };
      }
      
      return {
        ...phrase('C3Q11_CURRENTLY_IN_CARE', session.isSupporter),
        stateUpdates: { currentGate: 'C3Q11_CURRENTLY_IN_CARE', lgbtq: false }
      };
    }
    
    case 'C3Q10A_LGBTQ_SERVICE_PREFERENCE': {
      const lgbtqPrefOptions = ['Specialist first', 'Local only', 'Show both'];
      const lgbtqPref = choice ? lgbtqPrefOptions[choice - 1] : null;
      
      return {
        ...phrase('C3Q11_CURRENTLY_IN_CARE', session.isSupporter),
        stateUpdates: { currentGate: 'C3Q11_CURRENTLY_IN_CARE', lgbtqServicePreference: lgbtqPref }
      };
    }
    
    case 'C3Q11_CURRENTLY_IN_CARE': {
      const inCare = choice === 1;
      
      return {
        ...phrase('C3Q12_SOCIAL_SERVICES', session.isSupporter),
        stateUpdates: { currentGate: 'C3Q12_SOCIAL_SERVICES', inCare }
      };
    }
    
    case 'C3Q12_SOCIAL_SERVICES': {
      const ssOptions = ['Yes', 'No', 'Prefer not to say'];
      const ss = choice ? ssOptions[choice - 1] : null;
      
      return terminalWithAdditionalNeeds({ ...session, socialServices: ss }, { socialServices: ss });
    }
    
    // ========================================
    // TERMINAL & ADDITIONAL NEEDS
    // ========================================
    case 'TERMINAL_ADDITIONAL_NEEDS': {
      if (choice === 1 && session.needCount < 3) {
        return {
          ...phrase('B5_MAIN_SUPPORT_NEED', session.isSupporter),
          stateUpdates: { currentGate: 'B5_MAIN_SUPPORT_NEED' }
        };
      } else {
        const goodbye = getPhrase('TERMINAL_GOODBYE', session.isSupporter);
        return {
          text: goodbye?.text || 'Take care.',
          stateUpdates: { currentGate: 'SESSION_END', timestampEnd: new Date().toISOString() },
          sessionEnded: true
        };
      }
    }
    
    // ========================================
    // ESCALATION
    // ========================================
    case 'ESCALATION_LEVEL_1': {
      switch (choice) {
        case 1:
          return phrase(session.currentGate, session.isSupporter);
        case 2:
          return terminalWithAdditionalNeeds(session, { skipCount: session.skipCount + 1 });
        case 3:
          return getFirstMessage(createSession(session.sessionId));
        default:
          return phrase('ESCALATION_LEVEL_1', session.isSupporter);
      }
    }
    
    case 'ESCALATION_LEVEL_2': {
      switch (choice) {
        case 1:
          return terminalWithAdditionalNeeds(session);
        case 2: {
          const exit = getPhrase('ESCALATION_LEVEL_3_EXIT', session.isSupporter);
          return {
            text: exit?.text || '',
            stateUpdates: { currentGate: 'SESSION_END', escalationLevel: 3, timestampEnd: new Date().toISOString() },
            sessionEnded: true
          };
        }
        case 3:
          return phrase(session.currentGate, session.isSupporter);
        default:
          return phrase('ESCALATION_LEVEL_2', session.isSupporter);
      }
    }
    
    default:
      return phrase('GATE0_CRISIS_DANGER', session.isSupporter);
  }
}
