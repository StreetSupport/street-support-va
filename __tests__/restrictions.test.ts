// The record of restrictions (lib/restrictions.ts): the contract's rules, on
// real listings from the reviewed record of 23 November 2026.
import { filterByProfile } from '../lib/serviceMatcher';
import { recordFor, excludedByAge } from '../lib/restrictions';
import { toUserProfile, type UserProfile, type SessionState } from '../lib/types';

const base: UserProfile = {
  localAuthority: 'Birmingham', supportNeed: null, gender: null, ageCategory: null,
  lgbtq: null, criminalConvictions: null, hasChildren: null, sleepingSituation: null,
  mentalHealth: null, physicalHealth: null,
};
const person = (p: Partial<UserProfile>): UserProfile => ({ ...base, ...p });

// A service as the matcher sees it, carrying the listing id that joins it to the record.
const svc = (listing_id: string | null, client_groups: string[] = []) => ({
  service_id: `s-${listing_id}`, organization_id: 'o', local_authority: 'Birmingham',
  name: 'A service', description: 'A description', category: { parent: 'housing', sub: 'advice' },
  access: { appointment_only: false, telephone_service: false },
  location: { latitude: null, longitude: null, has_location: false },
  client_groups, listing_id,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const shown = (s: any, p: UserProfile): boolean => filterByProfile([s], p).length === 1;

const AGE_25_PLUS = 'change-grow-live-coventry-cgl#L1';
const AGE_16_25 = 'bardsley-youth-project#PTS-LD-bardsley-youth-project-02';
const WOMEN_ONLY = 'fwt-a-centre-for-women#L1.1';
const MEN_ONLY = 'pioneergroup#PTS-LD-pioneergroup-11';
const FOR_REFUGEES = 'ewa-cic-european-rsquo-s-welfare-association-cic#L3';
const WOMEN_OR_YOUNG = 'aspiring-futures-cic#L3';
const LEAVING_PRISON = 'good-shepherd-wolverhampton#L6';
const OVER_25_OR_FAMILIES = 'birmingham-city-council-housing-solutions#L1';

describe('switched off (the default until December)', () => {
  const saved = process.env.VA_RESTRICTIONS;
  beforeAll(() => { delete process.env.VA_RESTRICTIONS; });
  afterAll(() => { if (saved !== undefined) process.env.VA_RESTRICTIONS = saved; });

  test('the record governs nothing', () => {
    expect(recordFor(svc(WOMEN_ONLY))).toBeNull();
    expect(shown(svc(WOMEN_ONLY), person({ gender: 'Male' }))).toBe(true);
  });

  test('the label-based filter is unchanged', () => {
    expect(shown(svc(null, ['Female only']), person({ gender: 'Male' }))).toBe(false);
  });
});

describe('switched on', () => {
  const saved = process.env.VA_RESTRICTIONS;
  beforeAll(() => { process.env.VA_RESTRICTIONS = 'on'; });
  afterAll(() => {
    if (saved === undefined) delete process.env.VA_RESTRICTIONS; else process.env.VA_RESTRICTIONS = saved;
  });

  test('a listing the record has no entry for has no restriction', () => {
    expect(recordFor(svc('no-such-listing#L1'))).toEqual([]);
    expect(shown(svc('no-such-listing#L1', ['Female only']), person({ gender: 'Male' }))).toBe(true);
  });

  test('a service with no listing id keeps the label-based filter', () => {
    expect(shown(svc(null, ['Female only']), person({ gender: 'Male' }))).toBe(false);
  });

  describe('gate A: age stated in terms', () => {
    test('excludes a stated age wholly outside', () => {
      expect(shown(svc(AGE_25_PLUS), person({ ageCategory: '18-24' }))).toBe(false);
      expect(shown(svc(AGE_16_25), person({ ageCategory: 'Under 16' }))).toBe(false);
    });
    test('shows a stated age inside or overlapping', () => {
      expect(shown(svc(AGE_25_PLUS), person({ ageCategory: '25+' }))).toBe(true);
      expect(shown(svc(AGE_16_25), person({ ageCategory: '16-17' }))).toBe(true);
      // 25+ includes 25, which 16 to 25 covers: overlapping, so shown.
      expect(shown(svc(AGE_16_25), person({ ageCategory: '25+' }))).toBe(true);
    });
    test('no age given never excludes', () => {
      expect(shown(svc(AGE_25_PLUS), person({}))).toBe(true);
    });
    test('either-or: over 25, or families with children', () => {
      expect(shown(svc(OVER_25_OR_FAMILIES), person({ ageCategory: '18-24' }))).toBe(true);
      expect(shown(svc(OVER_25_OR_FAMILIES), person({ ageCategory: '18-24', hasChildren: true }))).toBe(true);
      expect(shown(svc(OVER_25_OR_FAMILIES), person({ ageCategory: '18-24', hasChildren: false }))).toBe(false);
      expect(shown(svc(OVER_25_OR_FAMILIES), person({ ageCategory: '25+', hasChildren: false }))).toBe(true);
    });
    test('either-or with a branch the assistant cannot check never excludes', () => {
      expect(shown(svc('change-grow-live-cgl-birmingham#L1'), person({ ageCategory: '16-17' }))).toBe(true);
    });
    test('either-or where every branch fails on age excludes', () => {
      expect(shown(svc('trident-reach#L2'), person({ ageCategory: '16-17' }))).toBe(false);
      expect(shown(svc('trident-reach#L2'), person({ ageCategory: '18-24' }))).toBe(true);
    });
    test('by place: the branch for the person\'s council applies', () => {
      // St Basils is also designed for young people, so test its age alone.
      const basils = recordFor(svc('st-basils#L1.1'))!;
      expect(excludedByAge(basils, person({ localAuthority: 'Coventry', ageCategory: '25+' }))).toBe(true);
      expect(excludedByAge(basils, person({ localAuthority: 'Birmingham', ageCategory: '25+' }))).toBe(false);
      const rethink = svc('rethink-mental-illness#L1');
      expect(shown(rethink, person({ localAuthority: 'Wolverhampton', ageCategory: '16-17' }))).toBe(false);
      expect(shown(rethink, person({ localAuthority: 'City of Wolverhampton', ageCategory: '16-17' }))).toBe(false);
      expect(shown(rethink, person({ localAuthority: 'Walsall', ageCategory: '16-17' }))).toBe(true);
      expect(shown(rethink, person({ localAuthority: 'Dudley', ageCategory: '16-17' }))).toBe(true);
    });
  });

  describe('gate B: a women\'s or men\'s service', () => {
    test('excludes only on an explicit answer of the other gender', () => {
      expect(shown(svc(WOMEN_ONLY), person({ gender: 'Male' }))).toBe(false);
      expect(shown(svc(MEN_ONLY), person({ gender: 'Female' }))).toBe(false);
      expect(shown(svc(WOMEN_ONLY), person({ gender: 'Female' }))).toBe(true);
    });
    test.each(['Non-binary or other', 'Prefer not to say', null])('%s never excludes', g => {
      expect(shown(svc(WOMEN_ONLY), person({ gender: g }))).toBe(true);
      expect(shown(svc(MEN_ONLY), person({ gender: g }))).toBe(true);
    });
  });

  describe('designed for a group: recommended only where the person has said it applies', () => {
    test('selected where stated', () => {
      expect(shown(svc(FOR_REFUGEES), person({ immigrationStatus: 'Refugee' }))).toBe(true);
    });
    test('not selected where not asked, declined or answered otherwise', () => {
      expect(shown(svc(FOR_REFUGEES), person({}))).toBe(false);
      expect(shown(svc(FOR_REFUGEES), person({ immigrationStatus: 'Prefer not to say' }))).toBe(false);
      expect(shown(svc(FOR_REFUGEES), person({ immigrationStatus: 'British' }))).toBe(false);
    });
    test('refugees, asylum seekers and migrants are kept apart', () => {
      expect(shown(svc(FOR_REFUGEES), person({ immigrationStatus: 'Asylum seeker' }))).toBe(false);
      expect(shown(svc(FOR_REFUGEES), person({ immigrationStatus: 'EUSS' }))).toBe(false);
    });
    test('either-or: selected when either group is stated', () => {
      expect(shown(svc(WOMEN_OR_YOUNG), person({ gender: 'Female', ageCategory: '25+' }))).toBe(true);
      expect(shown(svc(WOMEN_OR_YOUNG), person({ gender: 'Male', ageCategory: '18-24' }))).toBe(true);
      expect(shown(svc(WOMEN_OR_YOUNG), person({ gender: 'Male', ageCategory: '25+' }))).toBe(false);
    });
    test('parents of a child under 5 surface under Parents and families', () => {
      expect(shown(svc('home-start-birmingham#L1'), person({ hasChildren: true }))).toBe(true);
      expect(shown(svc('home-start-birmingham#L1'), person({}))).toBe(false);
    });
    test('means-tested benefits: the income or work answer', () => {
      expect(shown(svc('love-your-neighbour-birmingham#L2'), person({ onBenefits: true }))).toBe(true);
      expect(shown(svc('love-your-neighbour-birmingham#L2'), person({}))).toBe(false);
    });
    test('leaving prison: selected only where the person said they are leaving prison', () => {
      expect(shown(svc(LEAVING_PRISON), person({ sleepingSituation: 'Leaving prison' }))).toBe(true);
      expect(shown(svc(LEAVING_PRISON), person({ criminalConvictions: 'Yes' }))).toBe(false);
    });
  });
});

describe('answers as the assistant stores them', () => {
  const saved = process.env.VA_RESTRICTIONS;
  beforeAll(() => { process.env.VA_RESTRICTIONS = 'on'; });
  afterAll(() => {
    if (saved === undefined) delete process.env.VA_RESTRICTIONS; else process.env.VA_RESTRICTIONS = saved;
  });
  const fromSession = (s: Partial<SessionState>): UserProfile => toUserProfile({ ...(s as SessionState) });

  test('a housing-route offence type counts as a criminal record', () => {
    const forRecords = svc('coventry-city-council-homelessness-prevention-service#L2');
    for (const cc of ['Yes', 'Arson', 'Sexual', 'Violent']) {
      expect(shown(forRecords, { ...fromSession({ criminalConvictions: cc }), localAuthority: 'Coventry' })).toBe(true);
    }
    for (const cc of ['None', 'No', 'Prefer not to say', null]) {
      expect(shown(forRecords, { ...fromSession({ criminalConvictions: cc }), localAuthority: 'Coventry' })).toBe(false);
    }
  });

  test('the prevention children answer counts as Parents and families', () => {
    const p = fromSession({ preventionChildren: 'Yes', hasChildren: null, pregnant: null } as Partial<SessionState>);
    expect(p.hasChildren).toBe(true);
    expect(shown(svc('home-start-birmingham#L1'), { ...base, ...p, localAuthority: 'Birmingham' })).toBe(true);
  });

  test('income or work benefits set onBenefits', () => {
    expect(fromSession({ income: 'Benefits' } as Partial<SessionState>).onBenefits).toBe(true);
    expect(fromSession({ preventionEmployment: 'Benefits' } as Partial<SessionState>).onBenefits).toBe(true);
    expect(fromSession({ income: 'Employment' } as Partial<SessionState>).onBenefits).toBe(false);
  });
});
