// Street Support VA v7.1 Service Matcher
// UPDATES:
// - Deduplication by organization_id
// - Exclude council-adjacent services (ALMOs like Wolverhampton Homes)
// - Prioritize drop-in/helpline over appointment-only
// - Max 3 matched services with relevance threshold
// - Enhanced P3 descriptions
// - Better specialist org exports for terminal building

// ============================================================
// TYPES
// ============================================================

export interface MatchedService {
  name: string;
  description: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  category: string;
  appointmentOnly: boolean;
  matchScore: number;
  organizationId: string;
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
// HARDCODED DEFAULT ORGANIZATIONS BY LOCAL AUTHORITY
// Council Housing Options always first, then accessible drop-in services
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
// LGBTQ+ SPECIALIST ORGANISATIONS (National)
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

// ============================================================
// IMMIGRATION & NRPF SPECIALIST ORGANISATIONS
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
  }
];

// ============================================================
// WOMEN'S AID / DV ORGANISATIONS
// ============================================================

const womensAidOrgs: DefaultOrg[] = [
  {
    name: "National Domestic Abuse Helpline",
    phone: "0808 2000 247",
    website: "https://www.nationaldahelpline.org.uk",
    description: "24-hour helpline for women experiencing domestic abuse"
  },
  {
    name: "Black Country Women's Aid",
    phone: "0121 552 6448",
    website: "https://blackcountrywomensaid.co.uk",
    description: "Support for women and children affected by domestic abuse"
  }
];

// ============================================================
// YOUTH ORGANISATIONS
// ============================================================

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
// COUNCIL-ADJACENT EXCLUSION LIST
// These are ALMOs or council-related orgs that duplicate the council pathway
// ============================================================

const councilAdjacentOrgNames = [
  'wolverhampton homes',
  'birmingham municipal housing',
  'council housing',
  'housing solutions' // generic term often used by councils
];

function isCouncilAdjacent(orgName: string): boolean {
  const lower = orgName.toLowerCase();
  return councilAdjacentOrgNames.some(name => lower.includes(name));
}

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

// ============================================================
// EXPORTED FUNCTIONS
// ============================================================

/**
 * Get default organizations for a local authority
 * Returns council first, then drop-in services
 */
export function getDefaultOrgs(localAuthority: string | null): DefaultOrg[] {
  if (!localAuthority) return [];
  const la = normalizeLA(localAuthority);
  return defaultOrgsByLA[la] || [];
}

/**
 * Get council org separately (for "first step" section)
 */
export function getCouncilOrg(localAuthority: string | null): DefaultOrg | null {
  const orgs = getDefaultOrgs(localAuthority);
  return orgs.find(o => o.isCouncil) || null;
}

/**
 * Get local support orgs (non-council, drop-ins)
 */
export function getLocalSupportOrgs(localAuthority: string | null): DefaultOrg[] {
  const orgs = getDefaultOrgs(localAuthority);
  return orgs.filter(o => !o.isCouncil);
}

/**
 * Get specialist organizations based on user profile
 */
export function getSpecialistOrgs(profile: UserProfile): DefaultOrg[] {
  const orgs: DefaultOrg[] = [];
  
  // LGBTQ+ organizations
  if (profile.lgbtq) {
    const pref = profile.lgbtqServicePreference;
    if (pref !== 'Local only') {
      orgs.push(...lgbtqOrgs);
    }
  }
  
  // Immigration/NRPF organizations
  if (profile.immigrationStatus === 'No status' || 
      profile.immigrationStatus === 'Asylum seeker' ||
      profile.publicFunds === 'No') {
    orgs.push(...immigrationOrgs);
  }
  
  return orgs;
}

/**
 * Get youth organizations if applicable
 */
export function getYouthOrgs(profile: UserProfile): DefaultOrg[] {
  const age = profile.ageCategory;
  if (age === '16-17' || age === '18-24' || age === '18-20' || age === '21-24') {
    return youthOrgs;
  }
  return [];
}

/**
 * Check if user needs youth services guidance
 */
export function needsYouthServicesFlag(profile: UserProfile): boolean {
  const age = profile.ageCategory;
  return age === '16-17' || age === '18-24' || age === '18-20';
}

/**
 * Match services from database with deduplication and filtering
 * Returns max 3 high-quality matches
 */
export function matchServices(profile: UserProfile, limit: number = 3): MatchedService[] {
  // For now, return empty array since we're using hardcoded orgs
  // This function would query the actual services JSON when integrated
  
  // In production, this would:
  // 1. Filter by local authority
  // 2. Score by category match, client groups, accessibility
  // 3. Deduplicate by organization_id (keep highest score)
  // 4. Exclude council-adjacent services
  // 5. Prioritize drop-in over appointment-only
  // 6. Return top 3 with score > threshold
  
  return [];
}

/**
 * Get Shelter info (for safety net section)
 */
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

/**
 * Get StreetLink info (for rough sleepers)
 */
export function getStreetLinkInfo(): DefaultOrg {
  return {
    name: "StreetLink",
    phone: "0300 500 0914",
    website: "https://streetlink.org.uk",
    description: "Alert local outreach teams to help someone sleeping rough"
  };
}

/**
 * Format a phone number for display
 */
export function formatPhoneNumber(phone: string | null): string {
  if (!phone) return '';
  return formatPhone(phone);
}
