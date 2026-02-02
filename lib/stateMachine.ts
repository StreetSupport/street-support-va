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
  DefaultOrg,
  UserProfile
} from './serviceMatcher';

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

// ============================================================
// CHECK IF SOCIAL SERVICES QUESTIONS SHOULD BE ASKED
// Only for 16-17 and 18-20 age groups (priority need assessment)
// ============================================================

function shouldAskSocialServicesQuestions(session: SessionState): boolean {
  const age = session.detailedAge || session.ageCategory;
  return age === '16-17' || age === '18-20';
}

// ============================================================
// TERMINAL OUTPUT BUILDER - RESTRUCTURED v7.1
// Clear hierarchy: First Step -> Outreach -> Local Support -> Specialist -> Youth -> Safety Net
// ============================================================

function buildTerminalServices(session: SessionState): string {
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
    // GATE 0: CRISIS
    // ========================================
    case 'GATE0_CRISIS_DANGER':
      switch (choice) {
        case 1: // Immediate danger
          return safeguardingExit('IMMEDIATE_PHYSICAL_DANGER_EXIT', session.isSupporter, 'IMMEDIATE_DANGER');
        case 2: // Domestic abuse -> ask gender
          return phrase('DV_GENDER_ASK', session.isSupporter);
        case 3: // Sexual violence -> ask gender
          return phrase('SA_GENDER_ASK', session.isSupporter);
        case 4: // Self-harm
          return safeguardingExit('SELF_HARM_EXIT', session.isSupporter, 'SELF_HARM');
        case 5: // Under 16
          return safeguardingExit('UNDER_16_EXIT', session.isSupporter, 'UNDER_16');
        case 6: // Fire/flood
          return safeguardingExit('FIRE_FLOOD_EXIT', session.isSupporter, 'FIRE_FLOOD');
        case 7: // None apply
          return phrase('GATE1_INTENT', session.isSupporter);
        default:
          return phrase('GATE0_CRISIS_DANGER', session.isSupporter);
      }
    
    // ========================================
    // DV ROUTING
    // ========================================
    case 'DV_GENDER_ASK':
      const dvGenders = ['Female', 'Male', 'Non-binary or other', 'Prefer not to say'];
      const dvGender = choice ? dvGenders[choice - 1] : null;
      return {
        ...phrase('DV_CHILDREN_ASK', session.isSupporter),
        stateUpdates: { currentGate: 'DV_CHILDREN_ASK', dvGender }
      };
    
    case 'DV_CHILDREN_ASK':
      const dvChildren = choice === 1;
      const dvExitKey = getDVExitKey(session.dvGender, dvChildren);
      return safeguardingExit(dvExitKey, session.isSupporter, 'DOMESTIC_ABUSE');
    
    // ========================================
    // SA ROUTING
    // ========================================
    case 'SA_GENDER_ASK':
      const saGenders = ['Female', 'Male', 'Non-binary or other', 'Prefer not to say'];
      const saGender = choice ? saGenders[choice - 1] : null;
      const saExitKey = getSAExitKey(saGender);
      return safeguardingExit(saExitKey, session.isSupporter, 'SEXUAL_VIOLENCE');
    
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
        ...phrase('B1_LOCAL_AUTHORITY', session.isSupporter),
        stateUpdates: { currentGate: 'B1_LOCAL_AUTHORITY', routeType }
      };
    
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
        return safeguardingExit('UNDER_16_EXIT', session.isSupporter, 'UNDER_16');
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
        // Non-housing needs (Food, Items, Comms, etc.) - go straight to terminal
        // No need to ask age/gender for these
        const servicesSimple = buildTerminalServices({ ...session, supportNeed: need });
        const additionalNeedsSimple = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
        return {
          text: servicesSimple + '\n' + additionalNeedsSimple?.text,
          options: additionalNeedsSimple?.options,
          stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', supportNeed: need, needCount: session.needCount + 1 },
          sessionEnded: false
        };
      }
    
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
    // PREVENTION PATHWAY (B7B-B7E)
    // ========================================
    case 'B7B_PREVENTION_REASON':
      const reasonOptions = ['Rent arrears', 'Eviction notice', 'Mortgage arrears', 'Family/friends notice', 'Financial difficulties', 'Prefer not to say'];
      const prevReason = choice ? reasonOptions[choice - 1] : null;
      
      return {
        ...phrase('B7C_PREVENTION_URGENCY', session.isSupporter),
        stateUpdates: { currentGate: 'B7C_PREVENTION_URGENCY', preventionReason: prevReason }
      };
    
    case 'B7C_PREVENTION_URGENCY':
      const urgencyOptions = ['Now/soon', 'Months away', 'Not sure'];
      const urgency = choice ? urgencyOptions[choice - 1] : null;
      
      return {
        ...phrase('B7D_1_PREVENTION_CHILDREN_DEPENDENTS', session.isSupporter),
        stateUpdates: { currentGate: 'B7D_1_PREVENTION_CHILDREN_DEPENDENTS', preventionUrgency: urgency }
      };
    
    case 'B7D_1_PREVENTION_CHILDREN_DEPENDENTS':
      const prevChildrenOptions = ['Yes', 'No', 'Prefer not to say'];
      const prevChildren = choice ? prevChildrenOptions[choice - 1] : null;
      
      return {
        ...phrase('B7D_2_PREVENTION_EMPLOYMENT_INCOME', session.isSupporter),
        stateUpdates: { currentGate: 'B7D_2_PREVENTION_EMPLOYMENT_INCOME', preventionChildren: prevChildren }
      };
    
    case 'B7D_2_PREVENTION_EMPLOYMENT_INCOME':
      const empOptions = ['Employed', 'Unemployed', 'Benefits', 'Self-employed', 'Not working', 'Prefer not to say'];
      const emp = choice ? empOptions[choice - 1] : null;
      
      return {
        ...phrase('B7D_3_PREVENTION_PRIOR_SUPPORT', session.isSupporter),
        stateUpdates: { currentGate: 'B7D_3_PREVENTION_PRIOR_SUPPORT', preventionEmployment: emp }
      };
    
    case 'B7D_3_PREVENTION_PRIOR_SUPPORT':
      const priorOptions = ['Yes spoken to someone', 'No not yet', 'Not sure who'];
      const prior = choice ? priorOptions[choice - 1] : null;
      
      return {
        ...phrase('B7D_4_PREVENTION_SAFEGUARDING_SIGNALS', session.isSupporter),
        stateUpdates: { currentGate: 'B7D_4_PREVENTION_SAFEGUARDING_SIGNALS', preventionPriorSupport: prior }
      };
    
    case 'B7D_4_PREVENTION_SAFEGUARDING_SIGNALS':
      const sigOptions = ['Yes something else', 'No just housing', 'Prefer not to say'];
      const sig = choice ? sigOptions[choice - 1] : null;
      
      if (choice === 1) {
        // Something else -> follow up
        return {
          ...phrase('B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP', session.isSupporter),
          stateUpdates: { currentGate: 'B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP', preventionSafeguardingSignals: sig }
        };
      }
      
      // Check escalation triggers
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
      
      // Normal terminal
      const servicesB7D4 = buildTerminalServices(session);
      const additionalNeedsB7D4 = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
      return {
        text: servicesB7D4 + '\n' + additionalNeedsB7D4?.text,
        options: additionalNeedsB7D4?.options,
        stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', preventionSafeguardingSignals: sig },
        sessionEnded: false
      };
    
    case 'B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP':
      const followupOptions = ['Domestic abuse', 'Health crisis', 'Substance use', 'Child safety', 'Something else', 'Prefer not to say'];
      const followup = choice ? followupOptions[choice - 1] : null;
      
      switch (choice) {
        case 1: // Domestic abuse -> DV routing
          return phrase('DV_GENDER_ASK', session.isSupporter);
        case 2: // Health crisis
          const health = getPhrase('ESCALATION_LEVEL_2_HEALTH_CRISIS', session.isSupporter);
          return {
            text: health?.text || '',
            stateUpdates: { currentGate: 'SESSION_END', safeguardingType: 'HEALTH_CRISIS', timestampEnd: new Date().toISOString() },
            sessionEnded: true
          };
        case 4: // Child safety
          return safeguardingExit('CHILD_AT_RISK_EXIT', session.isSupporter, 'CHILD_AT_RISK');
        default: // Continue to terminal
          const services2 = buildTerminalServices(session);
          const additionalNeeds2 = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
          return {
            text: services2 + '\n' + additionalNeeds2?.text,
            options: additionalNeeds2?.options,
            stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS' },
            sessionEnded: false
          };
      }
    
    // ========================================
    // HOMELESS CONTINUATION (B8-B12)
    // ========================================
    case 'B8_DURATION':
      const durationOptions = ['Less than a week', '1-4 weeks', '1-6 months', '6-12 months', 'Over a year'];
      const duration = choice ? durationOptions[choice - 1] : null;
      
      return {
        ...phrase('B9_REASON', session.isSupporter),
        stateUpdates: { currentGate: 'B9_REASON', duration }
      };
    
    case 'B9_REASON':
      const b9Options = ['Relationship breakdown', 'Domestic abuse', 'Lost job', 'Asked to leave', 'End of tenancy', 'Prison/hospital', 'Mental health', 'Substance use', 'Other'];
      const b9Reason = choice ? b9Options[choice - 1] : null;
      
      // Domestic abuse -> DV routing
      if (choice === 2) {
        return phrase('DV_GENDER_ASK', session.isSupporter);
      }
      
      // Mental health acknowledgment
      let nextGate: GateType = 'B10_INCOME';
      let extraText = '';
      if (choice === 7) {
        const ack = getPhrase('B9C_MENTAL_HEALTH_ACKNOWLEDGMENT', session.isSupporter);
        extraText = (ack?.text || '') + '\n\n';
      }
      
      const b10 = getPhrase('B10_INCOME', session.isSupporter);
      return {
        text: extraText + b10?.text,
        options: b10?.options,
        stateUpdates: { currentGate: 'B10_INCOME', reason: b9Reason },
        sessionEnded: false
      };
    
    case 'B10_INCOME':
      const incomeOptions = ['Employment', 'Benefits', 'Family/friends', 'No income', 'Prefer not to say'];
      const income = choice ? incomeOptions[choice - 1] : null;
      
      return {
        ...phrase('B11_PRIOR_USE', session.isSupporter),
        stateUpdates: { currentGate: 'B11_PRIOR_USE', income }
      };
    
    case 'B11_PRIOR_USE':
      const priorUseOptions = ['Yes', 'No', 'Not sure'];
      const priorUse = choice ? priorUseOptions[choice - 1] : null;
      
      return {
        ...phrase('B12_ALREADY_SUPPORTED', session.isSupporter),
        stateUpdates: { currentGate: 'B12_ALREADY_SUPPORTED', priorUse }
      };
    
    case 'B12_ALREADY_SUPPORTED':
      const alreadySupported = choice === 1;
      
      if (alreadySupported) {
        return {
          ...phrase('B12A_WHICH_ORG', session.isSupporter),
          stateUpdates: { currentGate: 'B12A_WHICH_ORG', alreadySupported: true }
        };
      }
      
      // Go to Section C or terminal
      if (session.routeType === 'FULL') {
        return {
          ...phrase('C2_CONSENT_GATE', session.isSupporter),
          stateUpdates: { currentGate: 'C2_CONSENT_GATE', alreadySupported: false }
        };
      } else {
        const servicesB12 = buildTerminalServices(session);
        const additionalNeedsB12 = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
        return {
          text: servicesB12 + '\n' + additionalNeedsB12?.text,
          options: additionalNeedsB12?.options,
          stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', alreadySupported: false },
          sessionEnded: false
        };
      }
    
    case 'B12A_WHICH_ORG':
      // Free text input - store and continue
      if (session.routeType === 'FULL') {
        return {
          ...phrase('C2_CONSENT_GATE', session.isSupporter),
          stateUpdates: { currentGate: 'C2_CONSENT_GATE', currentSupportingOrg: input }
        };
      } else {
        const servicesB12A = buildTerminalServices(session);
        const additionalNeedsB12A = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
        return {
          text: servicesB12A + '\n' + additionalNeedsB12A?.text,
          options: additionalNeedsB12A?.options,
          stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', currentSupportingOrg: input },
          sessionEnded: false
        };
      }
    
    // ========================================
    // SECTION C: DETAILED PROFILING
    // ========================================
    case 'C2_CONSENT_GATE':
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
        // No consent -> skip to terminal
        const servicesC2 = buildTerminalServices(session);
        const additionalNeedsC2 = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
        return {
          text: servicesC2 + '\n' + additionalNeedsC2?.text,
          options: additionalNeedsC2?.options,
          stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', consentGiven: false },
          sessionEnded: false
        };
      }
    
    case 'C3Q1_IMMIGRATION_STATUS':
      const immOptions = ['British', 'EUSS', 'Refugee', 'Leave to remain', 'Asylum seeker', 'No status', 'Prefer not to say'];
      const imm = choice ? immOptions[choice - 1] : null;
      
      // EUSS -> follow up
      if (choice === 2) {
        return {
          ...phrase('C3Q1A_EUSS_FOLLOWUP', session.isSupporter),
          stateUpdates: { currentGate: 'C3Q1A_EUSS_FOLLOWUP', immigrationStatus: imm }
        };
      }
      
      // No status -> acknowledgment + public funds
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
      
      // Continue to children
      return {
        ...phrase('C3Q2_DEPENDENT_CHILDREN', session.isSupporter),
        stateUpdates: { currentGate: 'C3Q2_DEPENDENT_CHILDREN', immigrationStatus: imm }
      };
    
    case 'C3Q1A_EUSS_FOLLOWUP':
      const eussOptions = ['Settled', 'Pre-settled', 'Unsure'];
      const euss = choice ? eussOptions[choice - 1] : null;
      
      // Pre-settled -> public funds question
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
    
    case 'C3Q1B_PUBLIC_FUNDS_FOLLOWUP':
      const pfOptions = ['Yes', 'No', 'Not sure'];
      const pf = choice ? pfOptions[choice - 1] : null;
      
      return {
        ...phrase('C3Q2_DEPENDENT_CHILDREN', session.isSupporter),
        stateUpdates: { currentGate: 'C3Q2_DEPENDENT_CHILDREN', publicFunds: pf }
      };
    
    case 'C3Q2_DEPENDENT_CHILDREN':
      const hasChildrenC = choice === 1;
      
      return {
        ...phrase('C3Q3_AGE', session.isSupporter),
        stateUpdates: { currentGate: 'C3Q3_AGE', hasChildren: hasChildrenC }
      };
    
    case 'C3Q3_AGE':
      const detailedAgeOptions = ['Under 16', '16-17', '18-20', '21-24', '25+'];
      const detailedAge = choice ? detailedAgeOptions[choice - 1] : null;
      
      // Under 16 safeguarding
      if (choice === 1) {
        return safeguardingExit('UNDER_16_EXIT', session.isSupporter, 'UNDER_16');
      }
      
      return {
        ...phrase('C3Q4_GENDER', session.isSupporter),
        stateUpdates: { currentGate: 'C3Q4_GENDER', detailedAge }
      };
    
    case 'C3Q4_GENDER':
      const detailedGenderOptions = ['Male', 'Female', 'Trans Female', 'Trans Male'];
      const detailedGender = choice ? detailedGenderOptions[choice - 1] : null;
      
      // Pregnancy question only for female/trans female
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
    
    case 'C3Q5_PREGNANCY':
      const pregnant = choice === 1;
      
      return {
        ...phrase('C3Q6_ETHNICITY', session.isSupporter),
        stateUpdates: { currentGate: 'C3Q6_ETHNICITY', pregnant }
      };
    
    case 'C3Q6_ETHNICITY':
      const ethOptions = ['White British', 'White Other', 'Black African', 'Black Caribbean', 'Asian', 'Mixed'];
      const eth = choice ? ethOptions[choice - 1] : null;
      
      return {
        ...phrase('C3Q7_PHYSICAL_HEALTH', session.isSupporter),
        stateUpdates: { currentGate: 'C3Q7_PHYSICAL_HEALTH', ethnicity: eth }
      };
    
    case 'C3Q7_PHYSICAL_HEALTH':
      const phOptions = ['None', 'Mobility', 'Visual', 'Hearing', 'Verbal', 'Neurological'];
      const ph = choice ? phOptions[choice - 1] : null;
      
      return {
        ...phrase('C3Q8_MENTAL_HEALTH', session.isSupporter),
        stateUpdates: { currentGate: 'C3Q8_MENTAL_HEALTH', physicalHealth: ph }
      };
    
    case 'C3Q8_MENTAL_HEALTH':
      const mhOptions = ['None', 'Depression', 'Anxiety', 'PTSD', 'Bipolar', 'Schizophrenia', 'Neurodivergence', 'Learning difficulties', 'Prefer not to say'];
      const mh = choice ? mhOptions[choice - 1] : null;
      
      return {
        ...phrase('C3Q9_CRIMINAL_CONVICTIONS', session.isSupporter),
        stateUpdates: { currentGate: 'C3Q9_CRIMINAL_CONVICTIONS', mentalHealth: mh }
      };
    
    case 'C3Q9_CRIMINAL_CONVICTIONS':
      const ccOptions = ['None', 'Arson', 'Sexual', 'Violent', 'Prefer not to say'];
      const cc = choice ? ccOptions[choice - 1] : null;
      
      return {
        ...phrase('C3Q10_LGBTQ', session.isSupporter),
        stateUpdates: { currentGate: 'C3Q10_LGBTQ', criminalConvictions: cc }
      };
    
    case 'C3Q10_LGBTQ':
      const lgbtq = choice === 1;
      
      if (lgbtq) {
        return {
          ...phrase('C3Q10A_LGBTQ_SERVICE_PREFERENCE', session.isSupporter),
          stateUpdates: { currentGate: 'C3Q10A_LGBTQ_SERVICE_PREFERENCE', lgbtq: true }
        };
      }
      
      // UPDATED v7.1: Only ask social services questions for 16-17 and 18-20
      const updatedSession1 = { ...session, lgbtq: false };
      if (shouldAskSocialServicesQuestions(updatedSession1)) {
        return {
          ...phrase('C3Q11_CURRENTLY_IN_CARE', session.isSupporter),
          stateUpdates: { currentGate: 'C3Q11_CURRENTLY_IN_CARE', lgbtq: false }
        };
      } else {
        // Skip to terminal for 21-24 and 25+
        const servicesC10 = buildTerminalServices(updatedSession1);
        const additionalNeedsC10 = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
        return {
          text: servicesC10 + '\n' + additionalNeedsC10?.text,
          options: additionalNeedsC10?.options,
          stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', lgbtq: false },
          sessionEnded: false
        };
      }
    
    case 'C3Q10A_LGBTQ_SERVICE_PREFERENCE':
      const lgbtqPrefOptions = ['Specialist first', 'Local only', 'Show both'];
      const lgbtqPref = choice ? lgbtqPrefOptions[choice - 1] : null;
      
      // UPDATED v7.1: Only ask social services questions for 16-17 and 18-20
      const updatedSession2 = { ...session, lgbtqServicePreference: lgbtqPref };
      if (shouldAskSocialServicesQuestions(updatedSession2)) {
        return {
          ...phrase('C3Q11_CURRENTLY_IN_CARE', session.isSupporter),
          stateUpdates: { currentGate: 'C3Q11_CURRENTLY_IN_CARE', lgbtqServicePreference: lgbtqPref }
        };
      } else {
        // Skip to terminal for 21-24 and 25+
        const servicesC10A = buildTerminalServices(updatedSession2);
        const additionalNeedsC10A = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
        return {
          text: servicesC10A + '\n' + additionalNeedsC10A?.text,
          options: additionalNeedsC10A?.options,
          stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', lgbtqServicePreference: lgbtqPref },
          sessionEnded: false
        };
      }
    
    case 'C3Q11_CURRENTLY_IN_CARE':
      const inCare = choice === 1;
      
      return {
        ...phrase('C3Q12_SOCIAL_SERVICES', session.isSupporter),
        stateUpdates: { currentGate: 'C3Q12_SOCIAL_SERVICES', inCare }
      };
    
    case 'C3Q12_SOCIAL_SERVICES':
      const ssOptions = ['Yes', 'No', 'Prefer not to say'];
      const ss = choice ? ssOptions[choice - 1] : null;
      
      // Terminal with full profile
      const servicesC12 = buildTerminalServices({ ...session, socialServices: ss });
      const additionalNeedsC12 = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
      return {
        text: servicesC12 + '\n' + additionalNeedsC12?.text,
        options: additionalNeedsC12?.options,
        stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', socialServices: ss },
        sessionEnded: false
      };
    
    // ========================================
    // TERMINAL & ADDITIONAL NEEDS
    // ========================================
    case 'TERMINAL_ADDITIONAL_NEEDS':
      if (choice === 1 && session.needCount < 3) {
        // Another need
        return {
          ...phrase('B5_MAIN_SUPPORT_NEED', session.isSupporter),
          stateUpdates: { currentGate: 'B5_MAIN_SUPPORT_NEED' }
        };
      } else {
        // Done
        const goodbye = getPhrase('TERMINAL_GOODBYE', session.isSupporter);
        return {
          text: goodbye?.text || 'Take care.',
          stateUpdates: { currentGate: 'SESSION_END', timestampEnd: new Date().toISOString() },
          sessionEnded: true
        };
      }
    
    // ========================================
    // ESCALATION
    // ========================================
    case 'ESCALATION_LEVEL_1':
      switch (choice) {
        case 1: // Explain differently -> retry current
          return phrase(session.currentGate, session.isSupporter);
        case 2: // Skip
          // Would need to track "next gate" - for now go to terminal
          const servicesEsc1 = buildTerminalServices(session);
          const additionalNeedsEsc1 = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
          return {
            text: servicesEsc1 + '\n' + additionalNeedsEsc1?.text,
            options: additionalNeedsEsc1?.options,
            stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS', skipCount: session.skipCount + 1 },
            sessionEnded: false
          };
        case 3: // Restart
          return getFirstMessage(createSession(session.sessionId));
        default:
          return phrase('ESCALATION_LEVEL_1', session.isSupporter);
      }
    
    case 'ESCALATION_LEVEL_2':
      switch (choice) {
        case 1: // Services with what we have
          const services2 = buildTerminalServices(session);
          const additionalNeeds2 = getPhrase('TERMINAL_ADDITIONAL_NEEDS', session.isSupporter);
          return {
            text: services2 + '\n' + additionalNeeds2?.text,
            options: additionalNeeds2?.options,
            stateUpdates: { currentGate: 'TERMINAL_ADDITIONAL_NEEDS' },
            sessionEnded: false
          };
        case 2: // Phone number
          const exit = getPhrase('ESCALATION_LEVEL_3_EXIT', session.isSupporter);
          return {
            text: exit?.text || '',
            stateUpdates: { currentGate: 'SESSION_END', escalationLevel: 3, timestampEnd: new Date().toISOString() },
            sessionEnded: true
          };
        case 3: // Continue
          return phrase(session.currentGate, session.isSupporter);
        default:
          return phrase('ESCALATION_LEVEL_2', session.isSupporter);
      }
    
    default:
      // Fallback
      return phrase('GATE0_CRISIS_DANGER', session.isSupporter);
  }
}
