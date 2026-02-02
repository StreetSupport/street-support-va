// Street Support VA v7.1.3 Service Matcher
// UPDATES:
// - Local service matching for ALL needs (not just housing)
// - Profile-based filtering for relevant categories
// - Location-only filtering for food/items/comms/services
// - Database-driven service lookup by category

import servicesData from './data/wmca_services_v7.json';
import orgsData from './data/wmca_organizations_v7.json';

// ============================================================
// TYPES
// ============================================================

interface Service {
  service_id: string;
  organization_id: string;
  local_authority: string;
  name: string;
  description: string;
  category: {
    parent: string;
    sub: string;
  };
  access: {
    appointment_only: boolean;
    telephone_service: boolean;
  };
  location: {
    latitude: number | null;
    longitude: number | null;
    has_location: boolean;
  };
  client_groups: string[];
}

interface Organization {
  organization_id: string;
  name: string;
  verified: boolean;
  contact: {
    email: string | null;
    phone: string | null;
    website: string | null;
    quality: string;
  };
  areas_served: string[];
}

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
}

// ============================================================
// CATEGORY MAPPINGS
// ============================================================

// Map B5 support needs to database category.parent values
const needToCategoryMap: Record<string, string[]> = {
  'Emergency Housing': ['accom'],
  'Food': ['foodbank'],
  'Work': ['employment'],
  'Health': ['medical'],
  'Advice': ['support'],
  'Drop In': ['dropin'],
  'Financial': ['financial', 'support'],
  'Items': ['items'],
  'Services': ['services'],
  'Comms': ['communications'],
  'Training': ['training'],
  'Activities': ['activities']
};

// Needs where profile (gender, age, LGBTQ+, etc.) should affect filtering
const profileRelevantNeeds = ['Health', 'Work', 'Financial', 'Training', 'Activities', 'Drop In'];

// Needs where we just match on location (profile doesn't matter)
const locationOnlyNeeds = ['Food', 'Items', 'Services', 'Comms'];

// Client group keywords for matching
const clientGroupKeywords = {
  women: ['Women', 'Female', 'Girls'],
  men: ['Men', 'Male', 'Boys'],
  lgbtq: ['LGBT+', 'Gay', 'Lesbian', 'Bisexual', 'Transgender', 'LGBTQ'],
  youth: ['Young People', 'Youth', '16-25', 'Young Adults'],
  families: ['Families', 'Children', 'Parents'],
  elderly: ['Older people', 'Elderly', 'Over 50'],
  mentalHealth: ['Mental Health', 'Mental health'],
  roughSleepers: ['Rough sleepers', 'Homeless'],
  refugees: ['Refugees', 'Asylum seekers', 'Migrants'],
  exOffenders: ['Ex-Offenders', 'Ex-offenders', 'Offenders']
};

// ============================================================
// HARDCODED DEFAULT ORGANIZATIONS BY LOCAL AUTHORITY
// ============================================================

const defaultOrgsByLA: Record<string, DefaultOrg[]> = {
  wolverhampton: [
    {
      name: "Wolverhampton Council Housing Options",
      phone: "01902 556789",
      website: "https://www.wolverhampton.gov.uk/housing/homeless-and-at-risk",
      description: "Council duty to help if homeless or at risk",
      isCouncil: true
    },
    {
      name: "P3 Navigator Wolverhampton",
      phone: "01902 572190",
      website: "https://www.p3charity.org/services/wolverhampton-navigator",
      description: "Drop-in housing advice. No appointment needed. Help with housing, benefits, debt and more.",
      isDropIn: true
    }
  ],
  birmingham: [
    {
      name: "Birmingham Council Housing Options",
      phone: "0121 303 7410",
      website: "https://www.birmingham.gov.uk/info/20010/housing",
      description: "Council duty to help if homeless or at risk",
      isCouncil: true
    },
    {
      name: "SIFA Fireside",
      phone: "0121 766 1700",
      website: "https://www.sifafireside.co.uk",
      description: "Drop-in support for people who are homeless or vulnerably housed",
      isDropIn: true
    }
  ],
  coventry: [
    {
      name: "Coventry Council Homelessness Prevention",
      phone: "024 7683 1800",
      website: "https://www.coventry.gov.uk/housing-advice-options",
      description: "Council duty to help if homeless or at risk",
      isCouncil: true
    },
    {
      name: "P3 Coventry",
      phone: "024 7622 0099",
      website: "https://www.p3charity.org/services/coventry",
      description: "Drop-in housing advice. No appointment needed. Help with housing, benefits, debt and more.",
      isDropIn: true
    }
  ],
  dudley: [
    {
      name: "Dudley Council Housing Options",
      phone: "0300 555 2345",
      website: "https://www.dudley.gov.uk/residents/housing/",
      description: "Council duty to help if homeless or at risk",
      isCouncil: true
    }
  ],
  sandwell: [
    {
      name: "Sandwell Council Housing Support",
      phone: "0121 368 1166",
      website: "https://www.sandwell.gov.uk/housing",
      description: "Council duty to help if homeless or at risk",
      isCouncil: true
    },
    {
      name: "P3 Sandwell",
      phone: "0121 500 5540",
      website: "https://www.p3charity.org/services/sandwell",
      description: "Drop-in housing advice. No appointment needed. Help with housing, benefits, debt and more.",
      isDropIn: true
    }
  ],
  solihull: [
    {
      name: "Solihull Council Housing Options",
      phone: "0121 704 8000",
      website: "https://www.solihull.gov.uk/housing",
      description: "Council duty to help if homeless or at risk",
      isCouncil: true
    }
  ],
  walsall: [
    {
      name: "Walsall Council Housing Options",
      phone: "01922 652529",
      website: "https://www.walsall.gov.uk/housing",
      description: "Council duty to help if homeless or at risk",
      isCouncil: true
    }
  ]
};

// ============================================================
// SPECIALIST ORGANISATIONS
// ============================================================

const lgbtqOrgs: DefaultOrg[] = [
  {
    name: "akt (Albert Kennedy Trust)",
    phone: "0161 228 3308",
    website: "https://www.akt.org.uk",
    description: "Support for LGBTQ+ young people aged 16-25 facing homelessness"
  },
  {
    name: "Stonewall Housing",
    phone: "020 7359 5767",
    website: "https://stonewallhousing.org",
    description: "LGBTQ+ housing advice and support"
  }
];

const immigrationOrgs: DefaultOrg[] = [
  {
    name: "Migrant Help",
    phone: "0808 8010 503",
    website: "https://www.migranthelpuk.org",
    description: "Support for asylum seekers and refugees"
  },
  {
    name: "Project 17",
    phone: null,
    website: "https://project17.org.uk",
    description: "Advice for families with No Recourse to Public Funds"
  }
];

const youthOrgs: DefaultOrg[] = [
  {
    name: "Centrepoint",
    phone: "0808 800 0661",
    website: "https://centrepoint.org.uk",
    description: "Support for young people aged 16-25 facing homelessness"
  },
  {
    name: "Nightstop UK",
    phone: null,
    website: "https://www.nightstop.org.uk",
    description: "Emergency accommodation for young people in safe volunteer homes"
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function normalizeLA(la: string | null): string {
  if (!la) return '';
  return la.toLowerCase().replace(/\s+/g, '').replace('cityof', '');
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    if (cleaned.startsWith('08')) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
}

function getOrgContact(orgId: string): Organization['contact'] | null {
  const orgs = (orgsData as any).organizations as Organization[];
  const org = orgs.find(o => o.organization_id === orgId);
  return org?.contact || null;
}

function getOrgName(orgId: string): string | null {
  const orgs = (orgsData as any).organizations as Organization[];
  const org = orgs.find(o => o.organization_id === orgId);
  return org?.name || null;
}

/**
 * Check if service matches gender filter
 */
function matchesGender(clientGroups: string[], gender: string | null): boolean {
  if (!gender) return true;
  
  const genderLower = gender.toLowerCase();
  
  // Check if service is gender-restricted
  const isWomenOnly = clientGroups.some(g => 
    clientGroupKeywords.women.some(k => g.toLowerCase().includes(k.toLowerCase()))
  );
  const isMenOnly = clientGroups.some(g => 
    clientGroupKeywords.men.some(k => g.toLowerCase().includes(k.toLowerCase()))
  );
  
  // If service targets specific gender, check match
  if (isWomenOnly && !['female', 'woman', 'girl'].some(g => genderLower.includes(g))) {
    return false;
  }
  if (isMenOnly && !['male', 'man', 'boy'].some(g => genderLower.includes(g))) {
    return false;
  }
  
  return true;
}

/**
 * Check if service matches age filter
 */
function matchesAge(clientGroups: string[], ageCategory: string | null): boolean {
  if (!ageCategory) return true;
  
  const isYouthService = clientGroups.some(g => 
    clientGroupKeywords.youth.some(k => g.includes(k))
  );
  const isElderlyService = clientGroups.some(g => 
    clientGroupKeywords.elderly.some(k => g.includes(k))
  );
  
  // Youth services: only show to young people
  if (isYouthService) {
    return ['16-17', '18-24', '18-20', '21-24'].includes(ageCategory);
  }
  
  // Elderly services: only show to older people
  if (isElderlyService) {
    return ageCategory === '25+' || ageCategory === '50+';
  }
  
  return true;
}

/**
 * Calculate match score for a service based on profile
 */
function calculateMatchScore(service: Service, profile: UserProfile): number {
  let score = 50; // Base score for category match
  
  const groups = service.client_groups || [];
  
  // LGBTQ+ match
  if (profile.lgbtq && groups.some(g => 
    clientGroupKeywords.lgbtq.some(k => g.includes(k))
  )) {
    score += 20;
  }
  
  // Youth match
  if (['16-17', '18-24', '18-20', '21-24'].includes(profile.ageCategory || '') && 
      groups.some(g => clientGroupKeywords.youth.some(k => g.includes(k)))) {
    score += 15;
  }
  
  // Family match
  if (profile.hasChildren && groups.some(g => 
    clientGroupKeywords.families.some(k => g.includes(k))
  )) {
    score += 15;
  }
  
  // Mental health match
  if (profile.mentalHealth && profile.mentalHealth !== 'None' && profile.mentalHealth !== 'Prefer not to say') {
    if (groups.some(g => clientGroupKeywords.mentalHealth.some(k => g.includes(k)))) {
      score += 15;
    }
  }
  
  // Drop-in bonus (more accessible)
  if (!service.access.appointment_only) {
    score += 10;
  }
  
  // Telephone service bonus
  if (service.access.telephone_service) {
    score += 5;
  }
  
  return score;
}

// ============================================================
// CORE SERVICE MATCHING FUNCTIONS
// ============================================================

/**
 * Get services by category and location
 */
export function getServicesByCategory(
  localAuthority: string | null, 
  categories: string[]
): Service[] {
  if (!localAuthority || categories.length === 0) return [];
  
  const la = normalizeLA(localAuthority);
  const services = (servicesData as any).services as Service[];
  
  return services.filter(s => {
    const serviceLA = normalizeLA(s.local_authority);
    const matchesLA = serviceLA === la;
    const matchesCategory = categories.includes(s.category.parent);
    return matchesLA && matchesCategory;
  });
}

/**
 * Filter services based on user profile (gender, age, etc.)
 */
export function filterByProfile(services: Service[], profile: UserProfile): Service[] {
  return services.filter(s => {
    const groups = s.client_groups || [];
    
    // Gender filter
    if (!matchesGender(groups, profile.gender)) {
      return false;
    }
    
    // Age filter
    if (!matchesAge(groups, profile.ageCategory)) {
      return false;
    }
    
    return true;
  });
}

/**
 * Score and sort services, return top matches
 */
export function rankServices(services: Service[], profile: UserProfile, limit: number = 5): MatchedService[] {
  // Score each service
  const scored = services.map(s => ({
    service: s,
    score: calculateMatchScore(s, profile)
  }));
  
  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);
  
  // Deduplicate by organization (keep highest scoring)
  const seenOrgs = new Set<string>();
  const deduplicated = scored.filter(item => {
    if (seenOrgs.has(item.service.organization_id)) {
      return false;
    }
    seenOrgs.add(item.service.organization_id);
    return true;
  });
  
  // Take top N
  const top = deduplicated.slice(0, limit);
  
  // Convert to MatchedService format
  return top.map(item => {
    const s = item.service;
    const contact = getOrgContact(s.organization_id);
    const orgName = getOrgName(s.organization_id);
    
    return {
      name: orgName || s.name,
      description: s.description.length > 150 
        ? s.description.substring(0, 150) + '...' 
        : s.description,
      phone: contact?.phone || null,
      website: contact?.website 
        ? (contact.website.startsWith('http') ? contact.website : `https://${contact.website}`)
        : null,
      category: s.category.parent,
      appointmentOnly: s.access.appointment_only,
      matchScore: item.score,
      organizationId: s.organization_id,
      isDropIn: !s.access.appointment_only
    };
  });
}

/**
 * Main function: Get matched services for a non-housing need
 */
export function getServicesForNeed(need: string, profile: UserProfile): MatchedService[] {
  const categories = needToCategoryMap[need] || [];
  if (categories.length === 0) return [];
  
  // Get services matching category and location
  let services = getServicesByCategory(profile.localAuthority, categories);
  
  // Apply profile filtering if relevant for this need
  if (profileRelevantNeeds.includes(need)) {
    services = filterByProfile(services, profile);
  }
  // For location-only needs, skip profile filtering
  
  // Rank and return top matches
  return rankServices(services, profile, 5);
}

/**
 * Check if a need uses profile-based filtering
 */
export function isProfileRelevantNeed(need: string): boolean {
  return profileRelevantNeeds.includes(need);
}

/**
 * Check if a need is location-only
 */
export function isLocationOnlyNeed(need: string): boolean {
  return locationOnlyNeeds.includes(need);
}

// ============================================================
// EXISTING HOUSING-RELATED FUNCTIONS
// ============================================================

export function getDefaultOrgs(localAuthority: string | null): DefaultOrg[] {
  if (!localAuthority) return [];
  const la = normalizeLA(localAuthority);
  return defaultOrgsByLA[la] || [];
}

export function getCouncilOrg(localAuthority: string | null): DefaultOrg | null {
  const orgs = getDefaultOrgs(localAuthority);
  return orgs.find(o => o.isCouncil) || null;
}

export function getLocalSupportOrgs(localAuthority: string | null): DefaultOrg[] {
  const orgs = getDefaultOrgs(localAuthority);
  return orgs.filter(o => !o.isCouncil);
}

export function getSpecialistOrgs(profile: UserProfile): DefaultOrg[] {
  const orgs: DefaultOrg[] = [];
  
  if (profile.lgbtq) {
    const pref = profile.lgbtqServicePreference;
    if (pref !== 'Local only') {
      orgs.push(...lgbtqOrgs);
    }
  }
  
  if (profile.immigrationStatus === 'No status' || 
      profile.immigrationStatus === 'Asylum seeker' ||
      profile.publicFunds === 'No') {
    orgs.push(...immigrationOrgs);
  }
  
  return orgs;
}

export function getYouthOrgs(profile: UserProfile): DefaultOrg[] {
  const age = profile.ageCategory;
  if (age === '16-17' || age === '18-24' || age === '18-20' || age === '21-24') {
    return youthOrgs;
  }
  return [];
}

export function getShelterInfo(jurisdiction: 'ENGLAND' | 'SCOTLAND' = 'ENGLAND'): DefaultOrg {
  if (jurisdiction === 'SCOTLAND') {
    return {
      name: "Shelter Scotland",
      phone: "0808 800 4444",
      website: "https://scotland.shelter.org.uk",
      description: "Free housing advice helpline"
    };
  }
  return {
    name: "Shelter",
    phone: "0808 800 4444",
    website: "https://england.shelter.org.uk",
    description: "Free housing advice helpline (8am-8pm weekdays, 9am-5pm weekends)"
  };
}

export function getStreetLinkInfo(): DefaultOrg {
  return {
    name: "StreetLink",
    phone: "0300 500 0914",
    website: "https://streetlink.org.uk",
    description: "Alert local outreach teams to help someone sleeping rough"
  };
}

export function formatPhoneNumber(phone: string | null): string {
  if (!phone) return '';
  return formatPhone(phone);
}
