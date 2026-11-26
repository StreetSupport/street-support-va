// Population tags and housing on the live read (Managing Director,
// 20 November 2026). No database: every read is a pool built here.

import type { SessionState, UserProfile } from '../lib/types';
import { createSession, heldTransAnswer, parseGenderInput, processInput } from '../lib/stateMachine';
import { getPhrase } from '../lib/phrasebank';
import { getHousingAdviceServices, getServicesForNeed } from '../lib/serviceMatcher';
import { runWithServicePool, type ServicePool } from '../lib/data/servicePool';
import {
  FailureMemory,
  LIVE_READ_TIMEOUT_MS,
  liveReadClientOptions,
  mapProviderRows,
  mapServiceRow,
  type PlatformServiceRow,
} from '../lib/data/platformMapping';
import { HOUSING_RESULT_GATES, MATCHING_GATES, poolForTurn, readsLiveAt } from '../lib/data/liveReadGates';
import { FIRST_OPTIONS, V4_POPULATION_TAGS } from '../lib/data/v4Categories';
import { toUserProfile } from '../lib/types';

const profile = (p: Partial<UserProfile>): UserProfile => ({
  localAuthority: 'Wolverhampton',
  supportNeed: null,
  gender: null,
  ageCategory: null,
  lgbtq: null,
  criminalConvictions: null,
  hasChildren: null,
  sleepingSituation: null,
  mentalHealth: null,
  physicalHealth: null,
  ...p,
});

const row = (id: string, parent: string, sub: string, keys?: unknown, over: Partial<PlatformServiceRow> = {}): PlatformServiceRow => ({
  _id: id,
  ServiceProviderKey: `org-${id}`,
  ServiceProviderName: `Service ${id}`,
  Info: `Service ${id} description`,
  ParentCategoryKey: parent,
  SubCategoryKey: sub,
  IsAppointmentOnly: false,
  IsTelephoneService: false,
  ClientGroupKeys: keys,
  Address: { Location: { type: 'Point', coordinates: [-2.12, 52.58] } },
  distance: 100,
  ...over,
});

// A pool built only from database-shaped rows, as the live read builds it.
function poolOf(rows: PlatformServiceRow[]): ServicePool {
  const services = rows.map(r => mapServiceRow(r)!);
  return {
    status: 'ready',
    radiusKm: 5,
    services,
    contacts: mapProviderRows(services.map(s => ({ Key: s.organization_id, Name: s.name, Telephone: '01902 000300', Website: null }))),
  };
}

const emptyPool = (): ServicePool => ({ status: 'ready', radiusKm: 5, services: [], contacts: {} });
const unavailable = (): ServicePool => ({ status: 'unavailable' });

const sessionAt = (gate: SessionState['currentGate'], p: Partial<SessionState> = {}): SessionState =>
  ({ ...createSession('test'), currentGate: gate, ...p });

function converse(start: SessionState, inputs: string[], pool: ServicePool | null) {
  let s = start;
  let r = { text: '', stateUpdates: {} } as ReturnType<typeof processInput>;
  for (const input of inputs) {
    r = runWithServicePool(pool, () => processInput(s, input));
    s = { ...s, ...r.stateUpdates } as SessionState;
  }
  return r;
}

const housingAdult = (p: Partial<SessionState> = {}): Partial<SessionState> => ({
  localAuthority: 'Wolverhampton',
  supportNeed: 'Emergency Housing',
  ageCategory: '25 or over',
  routeType: 'QUICK',
  ...p,
});

// Quick route: the housing situation, then "not in touch with Housing Options".
const quickHousing = (option: string, pool: ServicePool | null, p: Partial<SessionState> = {}) =>
  converse(sessionAt('B6_HOMELESSNESS_STATUS', housingAdult(p)), [option, '2'], pool).text;

describe('population tags from the live read', () => {
  test('a service tagged on the platform carries its tags', () => {
    const s = mapServiceRow(row('a', 'housing', 'supported-housing', ['veterans', 'people-with-criminal-records']))!;
    expect(s.client_groups).toEqual(['veterans', 'people-with-criminal-records']);
  });

  test('every one of the 15 V4 tags is carried', () => {
    const s = mapServiceRow(row('a', 'housing', 'supported-housing', [...V4_POPULATION_TAGS]))!;
    expect(s.client_groups.length).toBe(15);
  });

  test('a service with no tags, or tags in another shape, carries none', () => {
    expect(mapServiceRow(row('a', 'food', 'x'))!.client_groups).toEqual([]);
    expect(mapServiceRow(row('b', 'food', 'x', null))!.client_groups).toEqual([]);
    expect(mapServiceRow(row('c', 'food', 'x', 'veterans'))!.client_groups).toEqual([]);
  });

  test('an old label or an unknown key is dropped, so it cannot hide a service', () => {
    const s = mapServiceRow(row('a', 'dropin', 'x', ['Female only', 'Male only', '16-25 only', 'unknown-key', 7, 'women']))!;
    expect(s.client_groups).toEqual(['women']);
  });
});

describe('a tag lifts a service for the people it is designed for', () => {
  const dropins = () => poolOf([
    row('plain1', 'dropin', 'x'),
    row('plain2', 'dropin', 'x'),
    row('lgbtq', 'dropin', 'x', ['lgbtq'], { distance: 4000 }),
    row('youth', 'dropin', 'x', ['young-people']),
    row('vets', 'dropin', 'x', ['veterans']),
    row('women', 'dropin', 'x', ['women']),
    row('men', 'dropin', 'x', ['men']),
  ]);
  const shown = (p: Partial<UserProfile>) =>
    runWithServicePool(dropins(), () => getServicesForNeed('Drop In', profile(p))).map(s => s.organizationId);

  test('an LGBTQ+ person sees the service designed for LGBTQ+ people first', () => {
    expect(shown({ lgbtq: true })[0]).toBe('org-lgbtq');
  });

  test('a veteran sees the service designed for veterans first', () => {
    expect(shown({ servedInArmedForces: true })[0]).toBe('org-vets');
  });

  test('a young person sees the service designed for young people first', () => {
    expect(shown({ ageCategory: '18-24' })[0]).toBe('org-youth');
  });

  test('untagged services are still listed alongside a lifted one, where the list has room', () => {
    const ids = shown({ lgbtq: true });
    expect(ids).toContain('org-plain1');
    expect(ids).toContain('org-plain2');
  });
});

describe('a tag never hides a service from anyone else', () => {
  const pool = () => poolOf([
    row('youth', 'dropin', 'x', ['young-people']),
    row('women', 'dropin', 'x', ['women']),
    row('men', 'dropin', 'x', ['men']),
    row('families', 'dropin', 'x', ['families']),
  ]);
  const shown = (p: Partial<UserProfile>) =>
    runWithServicePool(pool(), () => getServicesForNeed('Drop In', profile(p))).map(s => s.organizationId).sort();
  const all = ['org-families', 'org-men', 'org-women', 'org-youth'];

  test('someone aged 25 or over still sees the service designed for young people', () => {
    expect(shown({ ageCategory: '25+' })).toEqual(all);
  });

  test('a man still sees the service designed for women, and a woman the one for men', () => {
    expect(shown({ gender: 'Male' })).toEqual(all);
    expect(shown({ gender: 'Female' })).toEqual(all);
  });

  test('someone without children still sees the service designed for families', () => {
    expect(shown({ hasChildren: false })).toEqual(all);
  });
});

describe('people leaving prison and veterans, from tags read live', () => {
  const housing = () => poolOf([
    row('prison', 'housing', 'supported-housing', ['people-with-criminal-records']),
    row('vets', 'housing', 'supported-housing', ['veterans']),
    row('plain', 'housing', 'emergency-accommodation', []),
  ]);

  test('someone leaving prison sees the service tagged for people with criminal records', () => {
    const text = quickHousing('4', housing());
    expect(text).toContain('SERVICES FOR PEOPLE LEAVING PRISON');
    const section = text.slice(text.indexOf('SERVICES FOR PEOPLE LEAVING PRISON'));
    expect(section).toContain('Service prison');
    expect(section.split('\n\n\n')[0]).not.toContain('Service vets');
  });

  test('where nothing near them is tagged, there is no prison section', () => {
    const text = quickHousing('4', poolOf([row('plain', 'housing', 'emergency-accommodation', [])]));
    expect(text).not.toContain('SERVICES FOR PEOPLE LEAVING PRISON');
  });
});

describe('housing results fall back to the fixed file', () => {
  const fixed = () => getHousingAdviceServices(profile({}));

  test('the fixed file has local housing advice for this area', () => {
    expect(fixed().length).toBeGreaterThan(0);
  });

  test('when the read times out or fails, housing advice comes from the fixed file', () => {
    // A timeout or any database error reaches the matcher as "unavailable".
    expect(runWithServicePool(unavailable(), () => getHousingAdviceServices(profile({})))).toEqual(fixed());
  });

  test('when the read returns nothing, housing advice comes from the fixed file', () => {
    expect(runWithServicePool(emptyPool(), () => getHousingAdviceServices(profile({})))).toEqual(fixed());
  });

  test('when the read returns no housing advice, housing advice comes from the fixed file', () => {
    const foodOnly = poolOf([row('food', 'food', 'x')]);
    expect(runWithServicePool(foodOnly, () => getHousingAdviceServices(profile({})))).toEqual(fixed());
  });

  test('when the read returns housing advice, that is what is shown', () => {
    const live = poolOf([row('adv', 'housing', 'housing-advice')]);
    const shown = runWithServicePool(live, () => getHousingAdviceServices(profile({})));
    expect(shown.map(s => s.organizationId)).toEqual(['org-adv']);
  });

  test('someone about to lose their home sees the same results on a failed read as with no read', () => {
    expect(quickHousing('2', unavailable())).toBe(quickHousing('2', null));
    expect(quickHousing('2', emptyPool())).toBe(quickHousing('2', null));
    expect(quickHousing('2', null)).toContain('LOCAL HOUSING ADVICE');
  });

  test('a failed read on the housing route never says local services cannot be loaded', () => {
    expect(quickHousing('2', unavailable())).not.toContain("can't load");
  });
});

describe('which turns read live', () => {
  const at = (gate: string, p: Partial<SessionState> = {}) =>
    sessionAt(gate as SessionState['currentGate'], { latitude: 52.58, longitude: -2.12, supportNeed: 'Emergency Housing', ...p });

  // Sessions on the housing route, across both routes, ages and situations.
  const variants: Partial<SessionState>[] = [];
  for (const routeType of ['QUICK', 'FULL'] as const)
    for (const ageCategory of ['25 or over', '18-24', '16-17'])
      for (const housingSituation of [null, 'KEEP_STEADY', 'LOSING_HOME', 'LEAVING_PRISON'] as SessionState['housingSituation'][])
        variants.push({ routeType, ageCategory, housingSituation, localAuthority: 'Wolverhampton', youthSocialServicesAsked: ageCategory === '16-17' });
  const ANSWERS = ['1', '2', '3', '4', '5', '6', '7'];
  const showsResults = (r: ReturnType<typeof processInput>) => r.stateUpdates?.currentGate === 'TERMINAL_ADDITIONAL_NEEDS';

  test('at every housing results question, the read starts only for an answer that shows housing results', () => {
    let reads = 0;
    for (const gate of HOUSING_RESULT_GATES) for (const v of variants) for (const answer of ANSWERS) {
      const s = at(gate, v);
      if (readsLiveAt(s, answer)) {
        reads++;
        expect([gate, answer, showsResults(processInput(s, answer))]).toEqual([gate, answer, true]);
      }
    }
    expect(reads).toBeGreaterThan(0);
  });

  test('every answer there that shows housing results reads live, except the 16 and 17 care questions', () => {
    for (const gate of HOUSING_RESULT_GATES) for (const v of variants) for (const answer of ANSWERS) {
      const s = at(gate, v);
      const exempt = gate === 'C3Q11_EVER_IN_CARE_16_17' || (gate.startsWith('C3Q11') && v.ageCategory === '16-17');
      if (showsResults(processInput(s, answer)) && !exempt) {
        expect([gate, v.routeType, v.ageCategory, v.housingSituation, answer, readsLiveAt(s, answer)])
          .toEqual([gate, v.routeType, v.ageCategory, v.housingSituation, answer, true]);
      }
    }
  });

  const calls = (s: SessionState, answer: string) => {
    let n = 0;
    poolForTurn(s, answer, () => { n++; return Promise.resolve(emptyPool()); });
    return n;
  };

  test('the escalation phone number never calls the read', () => {
    expect(calls(at('ESCALATION_LEVEL_2'), '2')).toBe(0);
    expect(processInput(at('ESCALATION_LEVEL_2'), '2').sessionEnded).toBe(true);
  });

  test('starting again at the crisis question never calls the read', () => {
    expect(calls(at('ESCALATION_LEVEL_1'), '3')).toBe(0);
    expect(processInput(at('ESCALATION_LEVEL_1'), '3').stateUpdates?.currentGate).toBe('GATE0_CRISIS_DANGER');
  });

  test('the 16 and 17 care questions never call the read', () => {
    for (const answer of ['1', '2', '3', '4', '5', '6']) {
      expect(calls(at('C3Q11_EVER_IN_CARE_16_17', { ageCategory: '16-17', routeType: 'FULL' }), answer)).toBe(0);
    }
    for (const answer of ['1', '2', '8', '9', '10']) {
      expect(calls(at('C3Q11A_CARE_COUNCIL', { ageCategory: '16-17', routeType: 'FULL', careExperience: 'LEFT_CARE' }), answer)).toBe(0);
    }
  });

  test('an answer that leads to the next question never calls the read', () => {
    expect(calls(at('B7A_PREVENTION_GATE'), '1')).toBe(0);
    expect(calls(at('C2_CONSENT_GATE', { routeType: 'FULL' }), '1')).toBe(0);
    expect(calls(at('B12_ALREADY_SUPPORTED', { routeType: 'FULL' }), '2')).toBe(0);
  });

  test('an answer that shows housing results calls the read once', () => {
    expect(calls(at('B7A_PREVENTION_GATE'), '2')).toBe(1);
    expect(calls(at('ESCALATION_LEVEL_2'), '1')).toBe(1);
  });

  test('housing results questions do not read live for another need', () => {
    for (const gate of HOUSING_RESULT_GATES) expect(readsLiveAt(at(gate, { supportNeed: 'Food', routeType: 'QUICK' }), '2')).toBe(false);
  });

  test('without a location point nothing reads live', () => {
    expect(readsLiveAt(at('B7A_PREVENTION_GATE', { latitude: null, longitude: null }), '2')).toBe(false);
  });

  test('the crisis question, the Safety route and the prevention safeguarding questions never read live', () => {
    const never = [
      'GATE0_CRISIS_DANGER', 'CRISIS_UNDER16_LOCATION', 'SAFETY_TYPE_OF_HARM', 'SAFETY_OK_TO_CONTINUE',
      'DV_GENDER_ASK', 'SA_GENDER_ASK', 'B7D_4_PREVENTION_SAFEGUARDING_SIGNALS', 'B7D_4A_PREVENTION_SAFEGUARDING_FOLLOW_UP',
    ];
    for (const gate of never) {
      expect(readsLiveAt(at(gate), '1')).toBe(false);
      expect(MATCHING_GATES.has(gate) || HOUSING_RESULT_GATES.has(gate)).toBe(false);
    }
  });
});

describe('crisis contacts are unaffected by the live read', () => {
  // A live pool carrying a made-up phone number, which never appears.
  const decoy = (): ServicePool => ({
    status: 'ready', radiusKm: 5,
    services: [mapServiceRow(row('decoy', 'safety-from-harm', 'domestic-abuse', ['women']))!],
    contacts: { 'org-decoy': { name: 'Decoy Org', phone: '00000 999999', website: null } },
  });

  test('every crisis answer gives the same contacts with a live pool, a failed read or none', () => {
    for (const answer of ['1', '2', '3', '4', '5', '6']) {
      const s = sessionAt('GATE0_CRISIS_DANGER', { localAuthority: 'Wolverhampton' });
      const without = runWithServicePool(null, () => processInput(s, answer)).text;
      expect(runWithServicePool(decoy(), () => processInput(s, answer)).text).toBe(without);
      expect(runWithServicePool(unavailable(), () => processInput(s, answer)).text).toBe(without);
      expect(without).not.toContain('00000 999999');
    }
  });

  test('the council housing team on the housing results is the same with a live pool', () => {
    const live = quickHousing('3', decoy());
    const none = quickHousing('3', null);
    const first = (t: string) => t.slice(t.indexOf('YOUR FIRST STEP'), t.indexOf('YOUR FIRST STEP') + 300);
    expect(live).toContain('YOUR FIRST STEP');
    expect(first(live)).toBe(first(none));
    expect(live).not.toContain('00000 999999');
  });

  test('under 16 is still option 2 at the crisis question, for the person and for a supporter', () => {
    for (const supporter of [false, true]) {
      expect((getPhrase('GATE0_CRISIS_DANGER', supporter)?.options || [])[1]).toMatch(/under 16/i);
    }
  });
});

describe('the connection timeout', () => {
  test('is 3 seconds', () => {
    expect(LIVE_READ_TIMEOUT_MS).toBe(3000);
  });

  test('is used for connecting, finding a server and waiting on a query', () => {
    const o = liveReadClientOptions();
    expect(o.connectTimeoutMS).toBe(LIVE_READ_TIMEOUT_MS);
    expect(o.serverSelectionTimeoutMS).toBe(LIVE_READ_TIMEOUT_MS);
    expect(o.socketTimeoutMS).toBe(LIVE_READ_TIMEOUT_MS);
  });
});

describe('after a failed read', () => {
  test('later turns go straight to the fixed file for 60 seconds', () => {
    const m = new FailureMemory();
    expect(m.recentlyFailed(1_000)).toBe(false);
    m.recordFailure(1_000);
    expect(m.recentlyFailed(1_001)).toBe(true);
    expect(m.recentlyFailed(60_999)).toBe(true);
    expect(m.recentlyFailed(61_000)).toBe(false);
  });

  test('a good read clears the memory', () => {
    const m = new FailureMemory();
    m.recordFailure(1_000);
    m.clear();
    expect(m.recentlyFailed(1_001)).toBe(false);
  });
});

describe('safeguarding answers never wait on the database', () => {
  const at = (gate: string, isSupporter: boolean) =>
    sessionAt(gate as SessionState['currentGate'], { latitude: 52.58, longitude: -2.12, localAuthority: 'Wolverhampton', isSupporter });
  const calls = (s: SessionState, answer: string) => {
    let n = 0;
    poolForTurn(s, answer, () => { n++; return Promise.resolve(emptyPool()); });
    return n;
  };
  const SAFETY = String(FIRST_OPTIONS.findIndex(o => o.id === 'safety') + 1);

  for (const isSupporter of [false, true]) {
    const who = isSupporter ? 'a supporter' : 'the person';

    test(`${who} choosing Safety from harm at the first question never calls the read`, () => {
      const s = at('B5_MAIN_SUPPORT_NEED', isSupporter);
      expect(calls(s, SAFETY)).toBe(0);
      expect(processInput(s, SAFETY).stateUpdates?.v4Option).toBe('safety');
    });

    test(`${who} answering Under 16 at the age question never calls the read`, () => {
      const s = { ...at('B5_PROFILE_AGE', isSupporter), supportNeed: 'Emergency Housing' };
      expect(calls(s, '1')).toBe(0);
      expect(processInput(s, '1').stateUpdates?.currentGate).not.toBe('B6_HOMELESSNESS_STATUS');
    });

    test(`${who} giving another age still calls the read once`, () => {
      expect(calls(at('B5_PROFILE_AGE', isSupporter), '4')).toBe(1);
    });
  }
});

// Services near the person: one untagged, one designed for men, one for women,
// one for ethnic minority communities. Untagged first, so any lift shows.
const liftPool = () => poolOf([
  row('plain', 'dropin', 'x'),
  row('men', 'dropin', 'x', ['men']),
  row('women', 'dropin', 'x', ['women']),
  row('ethnic', 'dropin', 'x', ['ethnic-minority-communities']),
]);

function answered(gate: string, answer: string, isSupporter: boolean): SessionState {
  const s = sessionAt(gate as SessionState['currentGate'], { localAuthority: 'Wolverhampton', isSupporter });
  return { ...s, ...processInput(s, answer).stateUpdates } as SessionState;
}

const shownFor = (s: SessionState) =>
  runWithServicePool(liftPool(), () => getServicesForNeed('Drop In', toUserProfile(s))).map(x => x.organizationId);

describe('a gender answer lifts services designed for that gender', () => {
  const gates: [string, Record<string, string>][] = [
    ['B5_PROFILE_GENDER', { Male: '1', Female: '2', 'Non-binary or other': '3', 'Prefer not to say': '4' }],
    ['C3Q4_GENDER', { Male: '1', Female: '2', 'Trans Female': '3', 'Trans Male': '4' }],
  ];

  for (const isSupporter of [false, true]) for (const [gate, answers] of gates) {
    const who = `${isSupporter ? 'a supporter' : 'the person'} at ${gate}`;

    test(`${who}: Male sees the service designed for men first`, () => {
      expect(shownFor(answered(gate, answers.Male, isSupporter))[0]).toBe('org-men');
    });

    test(`${who}: Female sees the service designed for women first`, () => {
      expect(shownFor(answered(gate, answers.Female, isSupporter))[0]).toBe('org-women');
    });

    test(`${who}: a Female answer never hides an untagged service, nor the one designed for men`, () => {
      const ids = shownFor(answered(gate, answers.Female, isSupporter));
      expect(ids).toContain('org-plain');
      expect(ids).toContain('org-men');
      expect(ids.length).toBe(4);
    });

    test(`${who}: a Male answer never hides an untagged service, nor the one designed for women`, () => {
      const ids = shownFor(answered(gate, answers.Male, isSupporter));
      expect(ids).toContain('org-plain');
      expect(ids).toContain('org-women');
      expect(ids.length).toBe(4);
    });

    test(`${who}: the other answers lift nothing and hide nothing`, () => {
      for (const label of Object.keys(answers).filter(l => l !== 'Male' && l !== 'Female')) {
        expect([label, shownFor(answered(gate, answers[label], isSupporter))])
          .toEqual([label, ['org-plain', 'org-men', 'org-women', 'org-ethnic']]);
      }
    });
  }

  test('a service restricted to women in its description is still not shown to a Male answer', () => {
    const pool = poolOf([row('wo', 'dropin', 'x', [], { Info: 'Women only accommodation' }), row('plain', 'dropin', 'x')]);
    const ids = runWithServicePool(pool, () => getServicesForNeed('Drop In', profile({ gender: 'Male' }))).map(x => x.organizationId);
    expect(ids).toEqual(['org-plain']);
  });
});

describe('an ethnicity answer lifts services for ethnic minority communities', () => {
  const LIFTS: [string, string][] = [
    ['White (Other)', '2'], ['Black (African)', '3'], ['Black (Caribbean)', '4'], ['Asian', '5'], ['Mixed or Multiethnic Groups', '6'],
  ];
  const NO_LIFT: [string, string][] = [['White (British)', '1'], ['Prefer not to say', '7']];

  for (const isSupporter of [false, true]) {
    const who = isSupporter ? 'a supporter' : 'the person';

    test(`${who}: each answer other than White (British) sees those services first`, () => {
      for (const [label, answer] of LIFTS) {
        expect([label, shownFor(answered('C3Q6_ETHNICITY', answer, isSupporter))[0]]).toEqual([label, 'org-ethnic']);
      }
    });

    test(`${who}: White (British) and Prefer not to say lift nothing and hide nothing`, () => {
      for (const [label, answer] of NO_LIFT) {
        expect([label, shownFor(answered('C3Q6_ETHNICITY', answer, isSupporter))])
          .toEqual([label, ['org-plain', 'org-men', 'org-women', 'org-ethnic']]);
      }
    });

    test(`${who}: the answer is kept in the conversation and moves on to the next question`, () => {
      const s = answered('C3Q6_ETHNICITY', '5', isSupporter);
      expect(s.ethnicity).toBe('Asian');
      expect(s.currentGate).toBe('C3Q7_PHYSICAL_HEALTH');
    });
  }
});

describe('a typed gender answer is read on whole words', () => {
  const genderAfter = (gate: string, typed: string, isSupporter: boolean) => {
    const s = answered(gate, typed, isSupporter);
    return s.detailedGender || s.gender;
  };
  // A women-only service, and one untagged, to show whether anything is hidden.
  const womenOnlyShown = (gate: string, typed: string, isSupporter: boolean) => {
    const pool = poolOf([row('wo', 'dropin', 'x', [], { Info: 'Women only accommodation' }), row('plain', 'dropin', 'x')]);
    const s = answered(gate, typed, isSupporter);
    return runWithServicePool(pool, () => getServicesForNeed('Drop In', toUserProfile(s))).some(x => x.organizationId === 'org-wo');
  };

  for (const isSupporter of [false, true]) for (const gate of ['B5_PROFILE_GENDER', 'C3Q4_GENDER']) {
    const who = `${isSupporter ? 'a supporter' : 'the person'} at ${gate}`;
    const options = getPhrase(gate, isSupporter)?.options;

    test(`${who}: typing "female" is Female, and women-only services are not hidden`, () => {
      expect(genderAfter(gate, 'female', isSupporter)).toBe('Female');
      expect(womenOnlyShown(gate, 'female', isSupporter)).toBe(true);
    });

    test(`${who}: typing "FEMALE " is Female`, () => {
      expect(genderAfter(gate, 'FEMALE ', isSupporter)).toBe('Female');
    });

    test(`${who}: typing "I'm a woman" is Female, so women-only services are not hidden`, () => {
      expect(parseGenderInput("I'm a woman", options, gate)).toBe(2);
      expect(genderAfter(gate, "I'm a woman", isSupporter)).toBe('Female');
      expect(womenOnlyShown(gate, "I'm a woman", isSupporter)).toBe(true);
    });

    test(`${who}: typing "I'm a man" is Male`, () => {
      expect(genderAfter(gate, "I'm a man", isSupporter)).toBe('Male');
    });

    for (const typed of ['not male', 'not female', "I'm not a man", 'not a woman']) {
      test(`${who}: typing "${typed}" names nothing and is never read as Male or Female`, () => {
        expect(parseGenderInput(typed, options, gate)).toBeNull();
        expect(genderAfter(gate, typed, isSupporter)).not.toBe('Male');
        expect(genderAfter(gate, typed, isSupporter)).not.toBe('Female');
        expect(womenOnlyShown(gate, typed, isSupporter)).toBe(true);
      });
    }

    test(`${who}: typing "male" is Male`, () => {
      expect(genderAfter(gate, 'male', isSupporter)).toBe('Male');
    });

    test(`${who}: the buttons and numbers read as before`, () => {
      expect(genderAfter(gate, '1', isSupporter)).toBe('Male');
      expect(genderAfter(gate, '2', isSupporter)).toBe('Female');
      expect(parseGenderInput('2', options)).toBe(2);
    });

    if (gate === 'C3Q4_GENDER') {
      test(`${who}: typing "trans female" is Trans Female, and women-only services are not hidden`, () => {
        expect(genderAfter(gate, 'trans female', isSupporter)).toBe('Trans Female');
        expect(womenOnlyShown(gate, 'trans female', isSupporter)).toBe(true);
      });

      test(`${who}: typing "trans male" or "Trans Male" is Trans Male`, () => {
        expect(genderAfter(gate, 'trans male', isSupporter)).toBe('Trans Male');
        expect(genderAfter(gate, 'Trans Male', isSupporter)).toBe('Trans Male');
      });
    }
  }
});

describe('a trans answer typed where there is no trans option', () => {
  // One women-only and one men-only service by description, one tagged for
  // women, one for men, and one untagged, in that order.
  const pool = () => poolOf([
    row('wo', 'dropin', 'x', [], { Info: 'Women only accommodation' }),
    row('mo', 'dropin', 'x', [], { Info: 'Men only accommodation' }),
    row('women', 'dropin', 'x', ['women']),
    row('men', 'dropin', 'x', ['men']),
    row('plain', 'dropin', 'x'),
  ]);
  const ALL = ['org-wo', 'org-mo', 'org-women', 'org-men', 'org-plain'];
  const shown = (s: SessionState) =>
    runWithServicePool(pool(), () => getServicesForNeed('Drop In', toUserProfile(s))).map(x => x.organizationId);

  for (const isSupporter of [false, true]) for (const gate of ['B5_PROFILE_GENDER']) {
    const who = `${isSupporter ? 'a supporter' : 'the person'} at ${gate}`;
    const options = getPhrase(gate, isSupporter)?.options;

    for (const typed of ['trans male', 'trans female', "I'm trans"]) {
      test(`${who}: "${typed}" is never read as Male or Female, and goes to neither the parser's options nor the AI`, () => {
        expect(parseGenderInput(typed, options, gate)).toBeNull();
        expect(heldTransAnswer(gate, typed)).toBe(true);
        const s = answered(gate, typed, isSupporter);
        expect(s.gender).toBe('Trans');
        expect(s.gender).not.toBe('Male');
        expect(s.gender).not.toBe('Female');
      });

      test(`${who}: "${typed}" hides no women-only or men-only service and lifts nothing`, () => {
        expect(shown(answered(gate, typed, isSupporter))).toEqual(ALL);
      });
    }

    test(`${who}: the conversation moves on and the gender question is not asked again`, () => {
      const s = answered(gate, 'trans male', isSupporter);
      expect(s.currentGate).not.toBe(gate);
      expect(s.currentGate).not.toBe('B5_PROFILE_GENDER');
    });
  }

  test('at C3Q4, Trans Female and Trans Male are still read as their own options', () => {
    expect(heldTransAnswer('C3Q4_GENDER', 'trans male')).toBe(false);
    expect(answered('C3Q4_GENDER', 'trans male', false).detailedGender).toBe('Trans Male');
    expect(answered('C3Q4_GENDER', 'trans female', true).detailedGender).toBe('Trans Female');
  });

  test('a word that only starts with trans, such as transport, is not held', () => {
    expect(heldTransAnswer('B5_PROFILE_GENDER', 'transport')).toBe(false);
  });
});

const TRANS_PHRASES = ['trans', 'transgender', 'male to female', 'female to male', 'trans man', 'trans woman', 'transgender man', 'transgender woman'];

describe('every trans phrase is read as trans before anything else', () => {
  const pool = () => poolOf([
    row('wo', 'dropin', 'x', [], { Info: 'Women only accommodation' }),
    row('mo', 'dropin', 'x', [], { Info: 'Men only accommodation' }),
    row('women', 'dropin', 'x', ['women']),
    row('men', 'dropin', 'x', ['men']),
    row('plain', 'dropin', 'x'),
  ]);
  const ALL = ['org-wo', 'org-mo', 'org-women', 'org-men', 'org-plain'];
  const shown = (s: SessionState) =>
    runWithServicePool(pool(), () => getServicesForNeed('Drop In', toUserProfile(s))).map(x => x.organizationId);

  for (const isSupporter of [false, true]) {
    const who = isSupporter ? 'a supporter' : 'the person';

    for (const gate of ['B5_PROFILE_GENDER']) {
      for (const typed of [...TRANS_PHRASES, 'MtF', 'FtM']) {
        test(`${who} at ${gate}: "${typed}" is held as Trans, hides nothing and lifts nothing`, () => {
          const s = answered(gate, typed, isSupporter);
          expect(s.gender).toBe('Trans');
          expect(heldTransAnswer(gate, typed)).toBe(true);
          expect(shown(s)).toEqual(ALL);
        });
      }
    }

    const options = getPhrase('C3Q4_GENDER', isSupporter)?.options;
    for (const typed of ['trans woman', 'transgender woman', 'trans female', 'MtF', 'male to female', "I'm male to female"]) {
      test(`${who} at C3Q4_GENDER: "${typed}" is Trans Female`, () => {
        expect(answered('C3Q4_GENDER', typed, isSupporter).detailedGender).toBe('Trans Female');
      });
    }
    for (const typed of ['trans man', 'transgender man', 'trans male', 'FtM', 'female to male', "I'm female to male"]) {
      test(`${who} at C3Q4_GENDER: "${typed}" is Trans Male, and is not asked about pregnancy`, () => {
        const s = answered('C3Q4_GENDER', typed, isSupporter);
        expect(s.detailedGender).toBe('Trans Male');
        expect(s.currentGate).toBe('C3Q6_ETHNICITY');
      });
    }
    for (const typed of ['trans', 'transgender']) {
      test(`${who} at C3Q4_GENDER: "${typed}" does not say which, so it goes to the AI reading`, () => {
        expect(parseGenderInput(typed, options, 'C3Q4_GENDER')).toBeNull();
      });
    }
  }
});

describe('the domestic abuse and sexual violence gender questions', () => {
  const at = (gate: string, isSupporter: boolean) =>
    sessionAt(gate as SessionState['currentGate'], { localAuthority: 'Wolverhampton', isSupporter, userType: isSupporter ? 'SUPPORTER' : 'SELF' } as Partial<SessionState>);
  // DV: the gender answer, then "No" to children, to reach the helpline.
  const dvExit = (answer: string, isSupporter: boolean) => {
    const s = at('DV_GENDER_ASK', isSupporter);
    const s2 = { ...s, ...processInput(s, answer).stateUpdates } as SessionState;
    return processInput(s2, '2').text;
  };
  const saExit = (answer: string, isSupporter: boolean) => processInput(at('SA_GENDER_ASK', isSupporter), answer).text;

  for (const isSupporter of [false, true]) {
    const who = isSupporter ? 'a supporter' : 'the person';

    test(`${who} typing "male" at the domestic abuse question reaches the men's helpline, as the Male button does`, () => {
      expect(dvExit('male', isSupporter)).toBe(dvExit('2', isSupporter));
      expect(dvExit('male', isSupporter)).not.toBe(dvExit('1', isSupporter));
    });

    test(`${who} typing "female" at the domestic abuse question reaches the women's helpline, as the Female button does`, () => {
      expect(dvExit('female', isSupporter)).toBe(dvExit('1', isSupporter));
    });

    test(`${who} typing "male" at the sexual violence question reaches the men's helpline, as the Male button does`, () => {
      expect(saExit('male', isSupporter)).toBe(saExit('2', isSupporter));
      expect(saExit('male', isSupporter)).not.toBe(saExit('1', isSupporter));
    });

    test(`${who} typing "female" at the sexual violence question reaches the women's helpline, as the Female button does`, () => {
      expect(saExit('female', isSupporter)).toBe(saExit('1', isSupporter));
    });

    test(`${who}: the buttons there read as before`, () => {
      const s = at('DV_GENDER_ASK', isSupporter);
      expect(processInput(s, '1').stateUpdates?.dvGender).toBe('Female');
      expect(processInput(s, '2').stateUpdates?.dvGender).toBe('Male');
    });

    test(`${who}: "not male" there is never read as Male`, () => {
      for (const gate of ['DV_GENDER_ASK', 'SA_GENDER_ASK']) {
        expect(parseGenderInput('not male', getPhrase(gate, isSupporter)?.options, gate)).toBeNull();
      }
      expect(processInput(at('DV_GENDER_ASK', isSupporter), 'not male').stateUpdates?.dvGender).not.toBe('Male');
    });

    for (const typed of ['trans man', 'trans woman', 'trans']) {
      test(`${who}: "${typed}" there goes to the AI reading, with no new exit`, () => {
        for (const gate of ['DV_GENDER_ASK', 'SA_GENDER_ASK']) {
          expect(parseGenderInput(typed, getPhrase(gate, isSupporter)?.options, gate)).toBeNull();
        }
      });
    }
  }
});
