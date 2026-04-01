// Shared types for the Street Support VA
// Single source of truth — no imports from other project files

// ============================================================
// GATE TYPE
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
  // Early Flow
  | 'PREFERRED_NAME_ASK'
  | 'ACCESS_LOCATION_ASK'
  | 'RETURN_USER_ASK'
  | 'RETURN_USER_FOLLOWUP'
  // Profiling
  | 'IMMIGRATION_STATUS_ASK'
  | 'LGBTQ_SPECIALIST_ASK'
  // Advice Mode
  | 'B4_ADVICE_TOPIC_SELECTION'
  | 'ADVICE_BRIDGE'
  // Core Profiling
  | 'B1_LOCAL_AUTHORITY'
  | 'B2_WHO_FOR'
  | 'B3_AGE_CATEGORY'
  | 'B4_GENDER'
  | 'B5_MAIN_SUPPORT_NEED'
  | 'B5A_ADVICE_TYPE'
  | 'B5_PROFILE_AGE'
  | 'B5_PROFILE_GENDER'
  | 'B5_PROFILE_LGBTQ'
  | 'B5_PROFILE_CONVICTIONS'
  | 'B5_PROFILE_CHILDREN'
  | 'B5A_ADDITIONAL_NEED_SELECTION'
  | 'B6_HOMELESSNESS_STATUS'
  | 'HOUSING_OPTIONS_INVOLVEMENT_ASK'
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

// ============================================================
// SESSION STATE
// ============================================================

export interface SessionState {
  sessionId: string;
  currentGate: GateType;

  // Route tracking
  routeType: 'FULL' | 'QUICK' | null;
  intentType: 'ADVICE' | 'SERVICES' | 'ORGANISATION' | null;

  // Early flow
  preferredName: string | null;
  accessLocation: string | null;
  returnUser: boolean | null;
  returnOutcome: string | null;
  housingOptionsInvolvement: boolean | null;

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
  adviceSubcategory: string | null;
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

  // Terminal outcome
  terminalOutcome: string | null;

  // Timestamps
  timestampStart: string;
  timestampEnd: string | null;
}

// ============================================================
// ROUTING RESULT
// ============================================================

export interface RoutingResult {
  text: string;
  options?: string[];
  stateUpdates: Partial<SessionState>;
  sessionEnded?: boolean;
  responseType?: string;
}

export interface TerminalResult {
  text: string;
  terminalOutcome?: string;
}

// ============================================================
// SERVICE TYPES
// ============================================================

export interface MatchedService {
  name: string;
  description: string;
  phone: string | null;
  website: string | null;
  category: string;
  appointmentOnly: boolean;
  matchScore: number;
  organizationId: string;
  isDropIn?: boolean;
}

export interface DefaultOrg {
  name: string;
  phone: string | null;
  website: string | null;
  description: string;
  isCouncil?: boolean;
  isDropIn?: boolean;
  availabilityNote?: string;
}

export interface UserProfile {
  localAuthority: string | null;
  supportNeed: string | null;
  gender: string | null;
  ageCategory: string | null;
  lgbtq: boolean | null;
  criminalConvictions: string | null;
  hasChildren: boolean | null;
  sleepingSituation: string | null;
  mentalHealth: string | null;
  physicalHealth: string | null;
  immigrationStatus?: string | null;
  publicFunds?: string | null;
  lgbtqServicePreference?: string | null;
  dv?: boolean;
  adviceSubcategory?: string | null;
}

export interface ServiceCard {
  name: string;
  phone?: string;
  website?: string;
  description?: string;
  category: string;
  isVerified?: boolean;
  isDropIn?: boolean;
}

// ============================================================
// HELPER
// ============================================================

/**
 * Build a UserProfile from a SessionState.
 * Uses detailedGender/detailedAge when available (Section C path),
 * falls back to gender/ageCategory (non-housing path where detailed* are null).
 */
export function toUserProfile(session: SessionState): UserProfile {
  return {
    localAuthority: session.localAuthority,
    supportNeed: session.supportNeed,
    gender: session.detailedGender || session.gender,
    ageCategory: session.detailedAge || session.ageCategory,
    lgbtq: session.lgbtq,
    criminalConvictions: session.criminalConvictions,
    hasChildren: (session.hasChildren === true || session.pregnant === true) ? true : session.hasChildren,
    sleepingSituation: session.sleepingSituation,
    mentalHealth: session.mentalHealth,
    physicalHealth: session.physicalHealth,
    immigrationStatus: session.immigrationStatus,
    publicFunds: session.publicFunds,
    lgbtqServicePreference: session.lgbtqServicePreference,
    dv: session.safeguardingType === 'DOMESTIC_ABUSE',
    adviceSubcategory: session.adviceSubcategory,
  };
}
