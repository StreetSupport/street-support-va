// Street Support VA v7 Service Matcher
// Filters services from WMCA JSON based on user profile

import servicesData from './data/wmca_services_v7.json';
import orgsData from './data/wmca_organizations_v7.json';

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

interface MatchedService {
  name: string;
  description: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  category: string;
  appointmentOnly: boolean;
  matchScore: number;
}

interface UserProfile {
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
}

// ============================================================
// HARDCODED DEFAULT ORGANIZATIONS BY LOCAL AUTHORITY
// These always appear first in terminal output
// ============================================================

interface DefaultOrg {
  name: string;
  phone: string | null;
  website: string | null;
  description: string;
}

const defaultOrgsByLA: Record<string, DefaultOrg[]> = {
  wolverhampton: [
    {
      name: "Wolverhampton Council Housing Options",
      phone: "01902 556789",
      website: "https://www.wolverhampton.gov.uk/housing/homeless-and-at-risk",
      description: "Council duty to help if homeless or at risk"
    },
    {
      name: "P3 Navigator Wolverhampton",
      phone: "01902 572190",
      website: "https://www.p3charity.org/services/wolverhampton-navigator",
      description: "Drop-in support for housing, benefits, debt, and more"
    }
  ],
  birmingham: [
    {
      name: "Birmingham Council Housing Options",
      phone: "0121 303 7410",
      website: "https://www.birmingham.gov.uk/info/20010/housing",
      description: "Council duty to help if homeless or at risk"
    }
  ],
  coventry: [
    {
      name: "Coventry Council Homelessness Prevention",
      phone: "024 7683 1800",
      website: "https://www.coventry.gov.uk/housing-advice-options",
      description: "Council duty to help if homeless or at risk"
    },
    {
      name: "P3 Coventry",
      phone: "024 7622 0099",
      website: "https://www.p3charity.org/services/coventry",
      description: "Housing and homelessness support"
    }
  ],
  dudley: [
    {
      name: "Dudley Council Housing Options",
      phone: "0300 555 2345",
      website: "https://www.dudley.gov.uk/residents/housing/",
      description: "Council duty to help if homeless or at risk"
    }
  ],
  sandwell: [
    {
      name: "Sandwell Council Housing Support",
      phone: "0121 368 1166",
      website: "https://www.sandwell.gov.uk/housing",
      description: "Council duty to help if homeless or at risk"
    },
    {
      name: "P3 Sandwell",
      phone: "0121 500 5540",
      website: "https://www.p3charity.org/services/sandwell",
      description: "Housing and homelessness support"
    }
  ],
  solihull: [
    {
      name: "Solihull Council Housing Options",
      phone: "0121 704 8000",
      website: "https://www.solihull.gov.uk/housing",
      description: "Council duty to help if homeless or at risk"
    }
  ],
  walsall: [
    {
      name: "Walsall Council Housing Options",
      phone: "01922 652529",
      website: "https://www.walsall.gov.uk/housing",
      description: "Council duty to help if homeless or at risk"
    }
  ]
};

// ============================================================
// LGBTQ+ SPECIALIST ORGANISATIONS (National)
// Surfaced when lgbtq = true
// ============================================================

const lgbtqOrgs: DefaultOrg[] = [
  {
    name: "akt (Albert Kennedy Trust)",
    phone: "0161 228 3308",
    website: "https://www.akt.org.uk",
    description: "LGBTQ+ young people aged 16-25 facing homelessness"
  },
  {
    name: "Stonewall Housing",
    phone: "020 7359 5767",
    website: "https://stonewallhousing.org",
    description: "LGBTQ+ housing advice and support"
  }
];

// ============================================================
// IMMIGRATION & NRPF SPECIALIST ORGANISATIONS
// Surfaced when immigration status indicates need
// ============================================================

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
  },
  {
    name: "Together with Migrant Children",
    phone: null,
    website: "https://togetherwithmigrantchildren.org.uk",
    description: "Support for migrant children and families"
  },
  {
    name: "Just for Kids Law",
    phone: null,
    website: "https://www.justforkidslaw.org",
    description: "Legal advice for children and young people"
  }
];

const immigrationOrgsByLA: Record<string, DefaultOrg[]> = {
  wolverhampton: [
    {
      name: "Refugee and Migrant Centre (RMC)",
      phone: "01902 311554",
      website: "https://rmcentre.org.uk",
      description: "West Midlands immigration and refugee support"
    }
  ],
  birmingham: [
    {
      name: "Refugee and Migrant Centre (RMC)",
      phone: "0121 236 4817",
      website: "https://rmcentre.org.uk",
      description: "West Midlands immigration and refugee support"
    },
    {
      name: "Entraide",
      phone: "0121 350 0010",
      website: "https://entraide.org.uk",
      description: "Support for migrants and refugees in Birmingham"
    }
  ],
  sandwell: [
    {
      name: "Brushstrokes Community Project",
      phone: "0121 565 2234",
      website: "https://brushstrokessandwell.org.uk",
      description: "Support for migrants and refugees in Sandwell"
    }
  ],
  solihull: [
    {
      name: "Entraide",
      phone: "0121 350 0010",
      website: "https://entraide.org.uk",
      description: "Support for migrants and refugees"
    }
  ]
};

// ============================================================
// LOCAL WOMEN'S AID BY AREA
// For DV exits - to be used by phrasebank
// ============================================================

export const womensAidByLA: Record<string, DefaultOrg> = {
  wolverhampton: {
    name: "The Haven Wolverhampton",
    phone: "08000 194 400",
    website: "https://www.havenrefuge.org.uk",
    description: "Domestic abuse support for women and children"
  },
  birmingham: {
    name: "Birmingham and Solihull Women's Aid",
    phone: "0808 800 0028",
    website: "https://bswaid.org",
    description: "Domestic abuse support for women and children"
  },
  solihull: {
    name: "Birmingham and Solihull Women's Aid",
    phone: "0808 800 0028",
    website: "https://bswaid.org",
    description: "Domestic abuse support for women and children"
  },
  coventry: {
    name: "Coventry Haven Women's Aid",
    phone: "0800 111 4998",
    website: "https://coventryhaven.co.uk",
    description: "Domestic abuse support for women and children"
  },
  dudley: {
    name: "Black Country Women's Aid",
    phone: "0121 552 6448",
    website: "https://blackcountrywomensaid.co.uk",
    description: "Domestic abuse support for women and children"
  },
  sandwell: {
    name: "Black Country Women's Aid",
    phone: "0121 552 6448",
    website: "https://blackcountrywomensaid.co.uk",
    description: "Domestic abuse support for women and children"
  },
  walsall: {
    name: "Black Country Women's Aid",
    phone: "0121 552 6448",
    website: "https://blackcountrywomensaid.co.uk",
    description: "Domestic abuse support for women and children"
  }
};

// ============================================================
// LOCAL CHILDREN'S SERVICES BY AREA
// ============================================================

export const childrensServicesByLA: Record<string, DefaultOrg> = {
  wolverhampton: {
    name: "Wolverhampton Children's Services",
    phone: "01902 555392",
    website: "https://www.wolverhampton.gov.uk/children-and-young-people",
    description: "Safeguarding and support for children"
  },
  birmingham: {
    name: "Birmingham Children's Trust",
    phone: "0121 303 1888",
    website: "https://www.birminghamchildrenstrust.co.uk",
    description: "Safeguarding and support for children"
  },
  coventry: {
    name: "Coventry Children's Services",
    phone: "024 7678 8555",
    website: "https://www.coventry.gov.uk/childrens-services",
    description: "Safeguarding and support for children"
  },
  dudley: {
    name: "Dudley Children's Services",
    phone: "0300 555 0050",
    website: "https://www.dudley.gov.uk/residents/care-and-health/childrens-services/",
    description: "Safeguarding and support for children"
  },
  sandwell: {
    name: "Sandwell Children's Services",
    phone: "0121 569 3100",
    website: "https://www.sandwell.gov.uk/childrens-services",
    description: "Safeguarding and support for children"
  },
  solihull: {
    name: "Solihull Children's Services",
    phone: "0121 788 4300",
    website: "https://www.solihull.gov.uk/children-and-family-support",
    description: "Safeguarding and support for children"
  },
  walsall: {
    name: "Walsall Children's Services",
    phone: "0300 555 2866",
    website: "https://www.walsall.gov.uk/children-and-young-people",
    description: "Safeguarding and support for children"
  }
};

export function getDefaultOrgs(localAuthority: string | null): DefaultOrg[] {
  if (!localAuthority) return [];
  const la = localAuthority.toLowerCase().replace(/\s+/g, '');
  return defaultOrgsByLA[la] || [];
}

export function getLGBTQOrgs(): DefaultOrg[] {
  return lgbtqOrgs;
}

export function getImmigrationOrgs(localAuthority: string | null): DefaultOrg[] {
  const national = [...immigrationOrgs];
  if (localAuthority) {
    const la = localAuthority.toLowerCase().replace(/\s+/g, '');
    const local = immigrationOrgsByLA[la] || [];
    return [...national, ...local];
  }
  return national;
}

export function getWomensAid(localAuthority: string | null): DefaultOrg | null {
  if (!localAuthority) return null;
  const la = localAuthority.toLowerCase().replace(/\s+/g, '');
  return womensAidByLA[la] || null;
}

export function getChildrensServices(localAuthority: string | null): DefaultOrg | null {
  if (!localAuthority) return null;
  const la = localAuthority.toLowerCase().replace(/\s+/g, '');
  return childrensServicesByLA[la] || null;
}

// Map B5 support need to service category.parent
const needToCategoryMap: Record<string, string[]> = {
  'Emergency Housing': ['accommodation', 'housing'],
  'Food': ['food'],
  'Work': ['employment', 'training'],
  'Health': ['health', 'mental-health'],
  'Advice': ['advice', 'support'],
  'Drop In': ['dropin'],
  'Financial': ['support', 'advice'],
  'Items': ['items'],
  'Services': ['support'],
  'Comms': ['support'],
  'Training': ['training', 'employment'],
  'Activities': ['activities', 'dropin']
};

// Map client group keywords
const clientGroupKeywords = {
  lgbtq: ['LGBT+', 'Gay', 'Lesbian', 'Bisexual', 'Transgender', 'LGBTQ'],
  exOffender: ['Ex-Offenders', 'Ex-offenders'],
  families: ['Families', 'Children'],
  youth: ['Young People', 'Youth', '16-25'],
  roughSleeper: ['Rough sleepers', 'Homeless'],
  mentalHealth: ['Mental Health', 'Mental health'],
  veterans: ['Armed forces veterans', 'Veterans'],
  refugees: ['Refugees', 'Asylum seekers']
};

function normalizeLA(la: string | null): string {
  if (!la) return '';
  return la.toLowerCase().replace(/\s+/g, '').replace('cityof', '');
}

function getOrgContact(orgId: string): Organization['contact'] | null {
  const org = (orgsData as any).organizations.find((o: Organization) => o.organization_id === orgId);
  return org?.contact || null;
}

function calculateMatchScore(service: Service, profile: UserProfile): number {
  let score = 0;
  
  // Category match (highest weight)
  const categories = needToCategoryMap[profile.supportNeed || ''] || [];
  if (categories.includes(service.category.parent)) {
    score += 50;
  }
  
  // Client group matches
  const groups = service.client_groups || [];
  
  if (profile.lgbtq && groups.some(g => clientGroupKeywords.lgbtq.some(k => g.includes(k)))) {
    score += 20;
  }
  
  if (profile.criminalConvictions && profile.criminalConvictions !== 'None' && profile.criminalConvictions !== 'Prefer not to say') {
    if (groups.some(g => clientGroupKeywords.exOffender.some(k => g.includes(k)))) {
      score += 15;
    }
  }
  
  if (profile.hasChildren && groups.some(g => clientGroupKeywords.families.some(k => g.includes(k)))) {
    score += 15;
  }
  
  if ((profile.ageCategory === '16-17' || profile.ageCategory === '18-24') && 
      groups.some(g => clientGroupKeywords.youth.some(k => g.includes(k)))) {
    score += 15;
  }
  
  if (profile.sleepingSituation?.includes('Rough') && 
      groups.some(g => clientGroupKeywords.roughSleeper.some(k => g.includes(k)))) {
    score += 20;
  }
  
  if (profile.mentalHealth && profile.mentalHealth !== 'None' && profile.mentalHealth !== 'Prefer not to say') {
    if (groups.some(g => clientGroupKeywords.mentalHealth.some(k => g.includes(k)))) {
      score += 15;
    }
  }
  
  // Verified org bonus
  const org = (orgsData as any).organizations.find((o: Organization) => o.organization_id === service.organization_id);
  if (org?.verified) {
    score += 5;
  }
  
  // Good contact info bonus
  const contact = getOrgContact(service.organization_id);
  if (contact?.quality === 'HIGH') {
    score += 10;
  } else if (contact?.quality === 'MEDIUM') {
    score += 5;
  }
  
  return score;
}

export function matchServices(profile: UserProfile, limit: number = 5): MatchedService[] {
  const la = normalizeLA(profile.localAuthority);
  
  if (!la) {
    return [];
  }
  
  // Filter by local authority
  let services = (servicesData as any).services.filter((s: Service) => 
    normalizeLA(s.local_authority) === la
  );
  
  // Score and sort
  const scored = services.map((s: Service) => ({
    service: s,
    score: calculateMatchScore(s, profile)
  }));
  
  scored.sort((a: any, b: any) => b.score - a.score);
  
  // Take top matches with score > 0
  const topMatches = scored
    .filter((s: any) => s.score > 0)
    .slice(0, limit);
  
  // If no good matches, fall back to any services in the area with the right category
  if (topMatches.length === 0) {
    const categories = needToCategoryMap[profile.supportNeed || ''] || [];
    const fallback = services
      .filter((s: Service) => categories.includes(s.category.parent))
      .slice(0, limit);
    
    return fallback.map((s: Service) => {
      const contact = getOrgContact(s.organization_id);
      return {
        name: s.name,
        description: s.description.substring(0, 200) + (s.description.length > 200 ? '...' : ''),
        phone: contact?.phone || null,
        email: contact?.email || null,
        website: contact?.website ? (contact.website.startsWith('http') ? contact.website : `https://${contact.website}`) : null,
        category: s.category.parent,
        appointmentOnly: s.access?.appointment_only || false,
        matchScore: 0
      };
    });
  }
  
  return topMatches.map((m: any) => {
    const s = m.service;
    const contact = getOrgContact(s.organization_id);
    return {
      name: s.name,
      description: s.description.substring(0, 200) + (s.description.length > 200 ? '...' : ''),
      phone: contact?.phone || null,
      email: contact?.email || null,
      website: contact?.website ? (contact.website.startsWith('http') ? contact.website : `https://${contact.website}`) : null,
      category: s.category.parent,
      appointmentOnly: s.access?.appointment_only || false,
      matchScore: m.score
    };
  });
}

export function formatServicesForTerminal(services: MatchedService[], profile: UserProfile): string {
  if (services.length === 0) {
    return '';
  }
  
  let text = '';
  
  services.forEach((s, i) => {
    text += `${s.name}\n`;
    if (s.phone) {
      text += `${formatPhone(s.phone)}\n`;
    }
    if (s.website) {
      text += `${s.website}\n`;
    }
    if (s.appointmentOnly) {
      text += `(Appointment only)\n`;
    }
    text += '\n';
  });
  
  return text;
}

export function formatDefaultOrgs(orgs: DefaultOrg[]): string {
  let text = '';
  
  orgs.forEach(org => {
    text += `${org.name}\n`;
    if (org.phone) {
      text += `${formatPhone(org.phone)}\n`;
    }
    if (org.website) {
      text += `${org.website}\n`;
    }
    text += '\n';
  });
  
  return text;
}

function formatPhone(phone: string): string {
  // Format phone numbers nicely
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    // UK format: 0808 800 4444
    if (cleaned.startsWith('08')) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)} (free)`;
    }
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
}
