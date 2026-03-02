// Street Support VA v7.1.3 Service Matcher
// UPDATES:
// - Local service matching for ALL needs (not just housing)
// - Profile-based filtering for relevant categories
// - Location-only filtering for food/items/comms/services
// - Database-driven service lookup by category

import servicesData from './data/wmca_services_v7.json';
import orgsData from './data/wmca_organizations_v7.json';
import laContacts from './data/la-contacts.json';
import endpointsData from './data/housing-pathway-endpoints.json';
import type { MatchedService, DefaultOrg, UserProfile } from './types';

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
// DEFAULT ORGANIZATIONS BY LOCAL AUTHORITY (from la-contacts.json)
// ============================================================

const defaultOrgsByLA: Record<string, DefaultOrg[]> = Object.fromEntries(
  Object.entries(laContacts).map(([la, data]) => {
    const orgs: DefaultOrg[] = [
      {
        name: data.councilHousing.name,
        phone: data.councilHousing.phone,
        website: data.councilHousing.website,
        description: "Council duty to help if homeless or at risk",
        isCouncil: true
      },
      ...data.supportOrgs.map(org => ({
        name: org.name,
        phone: org.phone,
        website: org.website,
        description: org.description,
        isDropIn: org.isDropIn
      }))
    ];
    return [la, orgs];
  })
);

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

function getEndpointData(localAuthority: string | null): any {
  if (!localAuthority) return null;
  const la = normalizeLA(localAuthority);
  return (endpointsData as any)[la] || null;
}

function ageCategoryToNumber(ageCategory: string | null): number | null {
  if (!ageCategory) return null;
  const match = ageCategory.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
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
 * Checks client_groups, name, and description for gender-specific terms
 */
function matchesGender(service: Service, gender: string | null): boolean {
  if (!gender) return true;
  
  const genderLower = gender.toLowerCase();
  const clientGroups = service.client_groups || [];
  const name = service.name.toLowerCase();
  const desc = service.description.toLowerCase();
  
  // Women-only indicators
  const womenOnlyTerms = ['women', 'woman', 'female', 'girls', 'mothers', 'period poverty', 'period products', 'menstrual', 'maternity', 'pregnancy'];
  const menOnlyTerms = ['men only', 'for men', 'male only', 'fathers'];
  
  // Check if service is gender-restricted via client_groups
  const hasWomenClientGroup = clientGroups.some(g => 
    clientGroupKeywords.women.some(k => g.toLowerCase().includes(k.toLowerCase()))
  );
  const hasMenClientGroup = clientGroups.some(g => 
    clientGroupKeywords.men.some(k => g.toLowerCase().includes(k.toLowerCase()))
  );
  
  // Check if service name/description indicates women-only
  const nameDescIndicatesWomenOnly = womenOnlyTerms.some(term => 
    name.includes(term) || desc.includes(term)
  );
  
  // Check if service name/description indicates men-only
  const nameDescIndicatesMenOnly = menOnlyTerms.some(term => 
    name.includes(term) || desc.includes(term)
  );
  
  // Determine if service is gender-restricted
  const isWomenOnly = hasWomenClientGroup || nameDescIndicatesWomenOnly;
  const isMenOnly = hasMenClientGroup || nameDescIndicatesMenOnly;
  
  // If user is male and service is women-only, exclude
  if (isWomenOnly && ['male', 'man', 'boy'].some(g => genderLower.includes(g))) {
    return false;
  }
  
  // If user is female and service is men-only, exclude
  if (isMenOnly && ['female', 'woman', 'girl'].some(g => genderLower.includes(g))) {
    return false;
  }
  
  return true;;
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
  const desc = service.description.toLowerCase();
  
  // LGBTQ+ match - boost services targeting LGBTQ+ users
  if (profile.lgbtq && groups.some(g => 
    clientGroupKeywords.lgbtq.some(k => g.includes(k))
  )) {
    score += 20;
  }
  
  // Youth match - boost youth-focused services for young users
  if (['16-17', '18-24', '18-20', '21-24'].includes(profile.ageCategory || '') && 
      groups.some(g => clientGroupKeywords.youth.some(k => g.includes(k)))) {
    score += 15;
  }
  
  // Family match - boost family services when user has children
  if (profile.hasChildren && groups.some(g => 
    clientGroupKeywords.families.some(k => g.includes(k))
  )) {
    score += 15;
  }
  
  // Ex-offender match - boost services that support people with convictions
  if (profile.criminalConvictions === 'Yes') {
    if (groups.some(g => clientGroupKeywords.exOffenders.some(k => g.toLowerCase().includes(k.toLowerCase())))) {
      score += 20;
    }
    // Also check description for relevant terms
    if (desc.includes('ex-offender') || desc.includes('criminal record') || desc.includes('conviction')) {
      score += 10;
    }
  }
  
  // NRPF match - boost services that support people with no recourse to public funds
  if (profile.publicFunds === 'No' || profile.publicFunds === 'No, I have no recourse to public funds') {
    if (groups.some(g => clientGroupKeywords.refugees.some(k => g.includes(k)))) {
      score += 20;
    }
    // Also check description for relevant terms
    if (desc.includes('nrpf') || desc.includes('no recourse') || desc.includes('asylum') || desc.includes('refugee') || desc.includes('migrant')) {
      score += 15;
    }
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
    
    // Gender filter - pass full service for name/description checking
    if (!matchesGender(s, profile.gender)) {
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
  const orgs: DefaultOrg[] = [];

  if (age === '16-17' || age === '18-24' || age === '18-20' || age === '21-24') {
    orgs.push(...youthOrgs);
  }

  const endpoint = getEndpointData(profile.localAuthority);
  const userAge = ageCategoryToNumber(age);
  if (endpoint?.navigatorOrgs && userAge !== null) {
    for (const nav of endpoint.navigatorOrgs) {
      if (nav.ageMax !== null && nav.ageMax !== undefined &&
          nav.ageMin != null && nav.ageMin <= userAge && nav.ageMax >= userAge) {
        orgs.push({
          name: nav.name,
          phone: nav.phone || null,
          website: nav.website || null,
          description: nav.description,
        });
      }
    }
  }

  return orgs;
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

// ============================================================
// HOUSING PATHWAY ENDPOINT LOOKUPS
// ============================================================

export function getNavigatorOrgs(localAuthority: string | null): DefaultOrg[] {
  const endpoint = getEndpointData(localAuthority);
  if (!endpoint?.navigatorOrgs) return [];
  return endpoint.navigatorOrgs.map((nav: any) => ({
    name: nav.name,
    phone: nav.phone || null,
    website: nav.website || null,
    description: nav.description,
    isDropIn: true,
  }));
}

export function getDVOrgs(localAuthority: string | null): DefaultOrg[] {
  const endpoint = getEndpointData(localAuthority);
  if (!endpoint?.dvOrgs) return [];
  const orgs: DefaultOrg[] = [];
  for (const org of Object.values(endpoint.dvOrgs as Record<string, any>)) {
    if (org && typeof org === 'object' && org.name) {
      orgs.push({
        name: org.name,
        phone: org.phone || org.phone_24hr || null,
        website: org.website ? (org.website.startsWith('http') ? org.website : `https://${org.website}`) : null,
        description: org.description || `Local domestic abuse support${org.hours ? ` (${org.hours})` : ''}`,
      });
    }
  }
  return orgs;
}

export function getImmigrationOrgs(localAuthority: string | null): DefaultOrg[] {
  const endpoint = getEndpointData(localAuthority);
  if (!endpoint?.immigrationOrgs) return [];
  return endpoint.immigrationOrgs.map((org: any) => ({
    name: org.name,
    phone: org.phone || null,
    website: org.website ? (org.website.startsWith('http') ? org.website : `https://${org.website}`) : null,
    description: org.description,
  }));
}

