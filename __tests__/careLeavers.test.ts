// Care leavers on the full route (VA Pathway Review 5.2; Managing Director,
// 20 November 2026). "Have you ever been in care?" at 16 to 24, then "Which
// council looked after you?", and the results each answer leads to.

import type { SessionState } from '../lib/types';
import { toUserProfile } from '../lib/types';
import { createSession, processInput } from '../lib/stateMachine';
import { getPhrase, phrasebank } from '../lib/phrasebank';
import { getHousingAdviceServices } from '../lib/serviceMatcher';
import { runWithServicePool, type ServicePool } from '../lib/data/servicePool';
import { mapProviderRows, mapServiceRow, type PlatformServiceRow } from '../lib/data/platformMapping';
import endpointsData from '../lib/data/housing-pathway-endpoints.json';

const endpoints = endpointsData as unknown as Record<string, Record<string, unknown>>;

const sessionAt = (gate: SessionState['currentGate'], p: Partial<SessionState> = {}): SessionState =>
  ({ ...createSession('test'), currentGate: gate, ...p });

function converse(start: SessionState, inputs: string[]) {
  let s = start;
  let r = { text: '', stateUpdates: {} } as ReturnType<typeof processInput>;
  for (const input of inputs) {
    r = processInput(s, input);
    s = { ...s, ...r.stateUpdates } as SessionState;
  }
  return { result: r, session: s };
}

// A young person on the full housing route, staying somewhere for now, who has
// answered the LGBTQ+ question. The next answer is "No".
const fullRoute = (p: Partial<SessionState>): SessionState => sessionAt('C3Q10_LGBTQ', {
  routeType: 'FULL', supportNeed: 'Emergency Housing', homeless: true,
  housingSituation: 'STAYING_SOMEWHERE', sleepingSituation: 'Staying somewhere for now',
  localAuthority: 'Wolverhampton', ...p,
});

const sixteen = (p: Partial<SessionState> = {}) => fullRoute({ ageCategory: '16-17', detailedAge: '16-17', youthSocialServicesAsked: true, ...p });
// Age is asked once, in four bands (6 November 2026): a 19 and a 22 year old
// both answer 18-24. The two names are kept for the design's scenarios.
const nineteen = (p: Partial<SessionState> = {}) => fullRoute({ ageCategory: '18-24', detailedAge: '18-24', localAuthority: 'Sandwell', ...p });
const twentyTwo = (p: Partial<SessionState> = {}) => fullRoute({ ageCategory: '18-24', detailedAge: '18-24', localAuthority: 'Sandwell', ...p });

// Answers at the council question.
const WOLVERHAMPTON = '1', BIRMINGHAM = '2', ELSEWHERE = '8', NOT_SURE_COUNCIL = '9', PREFER_NOT_COUNCIL = '10';

const results = (start: SessionState, careAnswers: string[]) => {
  const { result } = converse(start, ['2', ...careAnswers]); // '2': not LGBTQ+
  expect(result.stateUpdates.currentGate).toBe('TERMINAL_ADDITIONAL_NEEDS');
  return result.text;
};

// Positions, to check the order things are shown in.
function inOrder(text: string, ...parts: string[]) {
  const at = parts.map(p => text.indexOf(p));
  expect(parts.filter((_, i) => at[i] < 0)).toEqual([]);
  expect([...at].sort((a, b) => a - b)).toEqual(at);
}

const E1 = 'YOUR SOCIAL WORKER OR PERSONAL ADVISER';
const E1_LINE = 'If you have a personal adviser, you can talk to them about your housing.';
const E3 = 'The council that looked after you: ask for the leaving care team.';
const FACTS = 'Leaving care teams support young people who have been in care. Help with housing is part of what they do. They will look at your situation with you.';
const FIND = 'https://www.gov.uk/find-local-council';
const BIRMINGHAM_CS = '0121 303 1888 (out of hours: 0121 675 4806)';
const WOLVERHAMPTON_CS = '01902 555392 (out of hours: 01902 552999)';
const WOLVERHAMPTON_HO = 'City of Wolverhampton Council Housing Options';
const SANDWELL_HO = 'Sandwell Council Housing Solutions';
const NAVIGATOR = 'Young Persons Team (Wolverhampton Homes)';
const SHELTER = 'IF YOU NEED MORE HELP';
const CHILDREN_PHONES = ['0121 303 1888', '024 7678 8555', '0300 555 0050', '0121 569 3100', '0121 788 4300', '0300 555 2866', '01902 555392'];

// E6 for 18-24 in Sandwell: the young people's section (Sandwell has no navigator).
const NAVIGATOR_OR_YOUTH = "YOUNG PEOPLE'S SUPPORT";
const count = (text: string, part: string) => text.split(part).length - 1;

// A leaving care entry held for a council, for the tests that need one. No
// council has one in the data yet: each would be confirmed at the council's site.
function withLeavingCare(council: string, fn: () => void) {
  endpoints[council].leavingCare = {
    name: `${council} leaving care team (test entry)`, phone: '0000 000 0001', website: 'https://example.org/leaving-care',
    source: 'test', verified: '2026-11-20',
  };
  try { fn(); } finally { delete endpoints[council].leavingCare; }
}

describe('who is asked', () => {
  test.each([
    ['16 or 17', sixteen(), 'C3Q11_EVER_IN_CARE_16_17'],
    ['18 to 24', nineteen(), 'C3Q11_EVER_IN_CARE'],
    ['18 to 24, from an older session carrying 21-24', fullRoute({ ageCategory: '18-24', detailedAge: '21-24' }), 'C3Q11_EVER_IN_CARE'],
  ])('%s on the full route is asked whether they have ever been in care', (_l, start, gate) => {
    const r = processInput(start, '2');
    expect(r.stateUpdates.currentGate).toBe(gate);
    expect(r.text).toContain('Have you ever been in care?');
    expect(r.text).toContain("Being in care means living in foster care, a children's home, or a placement the council arranged.");
  });

  test('a supporter is asked about the young person', () => {
    expect(processInput(sixteen({ isSupporter: true }), '2').text).toContain('Have they ever been in care?');
    expect(processInput(nineteen({ isSupporter: true }), '2').text).toContain('Have they ever been in care?');
    expect(processInput(nineteen({ isSupporter: true }), '2').text).not.toContain('you');
  });

  test('the options are those decided, for each age band', () => {
    expect(getPhrase('C3Q11_EVER_IN_CARE_16_17', false)?.options).toEqual(
      ['In care now', "Was in care but I've left", 'No, but I have a social worker', 'No', 'Not sure', 'Prefer not to say']);
    expect(getPhrase('C3Q11_EVER_IN_CARE_16_17', true)?.options).toEqual(
      ['In care now', "Was in care but they've left", 'No, but they have a social worker', 'No', 'Not sure', 'Prefer not to say']);
    expect(getPhrase('C3Q11_EVER_IN_CARE', false)?.options).toEqual(['Yes', 'No', 'Not sure', 'Prefer not to say']);
    expect(getPhrase('C3Q11A_CARE_COUNCIL', false)?.options).toEqual(
      ['Wolverhampton', 'Birmingham', 'Coventry', 'Dudley', 'Sandwell', 'Solihull', 'Walsall', 'Somewhere else', 'Not sure', 'Prefer not to say']);
    expect(getPhrase('C3Q11A_CARE_COUNCIL', true)?.text).toContain('Which council looked after them?');
  });

  test('a 26 year old is never asked about care', () => {
    const r = processInput(fullRoute({ ageCategory: '25 or over', detailedAge: '25+' }), '2');
    expect(r.stateUpdates.currentGate).toBe('TERMINAL_ADDITIONAL_NEEDS');
    expect(r.text).not.toContain('ever been in care');
    expect(r.text).not.toContain('LEAVING CARE TEAM');
  });

  test('the quick route never asks', () => {
    const r = processInput(nineteen({ routeType: 'QUICK' }), '2');
    expect(r.stateUpdates.currentGate).toBe('TERMINAL_ADDITIONAL_NEEDS');
  });

  test('only in care now, left care or yes go on to the council question', () => {
    for (const a of ['1', '2']) expect(converse(sixteen(), ['2', a]).result.stateUpdates.currentGate).toBe('C3Q11A_CARE_COUNCIL');
    for (const a of ['3', '4', '5', '6']) expect(converse(sixteen(), ['2', a]).result.stateUpdates.currentGate).toBe('TERMINAL_ADDITIONAL_NEEDS');
    expect(converse(nineteen(), ['2', '1']).result.stateUpdates.currentGate).toBe('C3Q11A_CARE_COUNCIL');
    for (const a of ['2', '3', '4']) expect(converse(nineteen(), ['2', a]).result.stateUpdates.currentGate).toBe('TERMINAL_ADDITIONAL_NEEDS');
  });

  test('never asks how long, at what age or under which section', () => {
    for (const key of ['C3Q11_EVER_IN_CARE_16_17', 'C3Q11_EVER_IN_CARE', 'C3Q11A_CARE_COUNCIL']) {
      for (const supporter of [false, true]) {
        expect(getPhrase(key, supporter)?.text).not.toMatch(/how long|what age|section|Children's Act/i);
      }
    }
  });
});

describe('16 and 17', () => {
  test('in care now, looked after by Birmingham, living in Wolverhampton: their worker, Birmingham Children\'s Services with out of hours, then Wolverhampton Housing Options, the youth navigator and Shelter', () => {
    const text = results(sixteen(), ['1', BIRMINGHAM]);
    inOrder(text, E1, "CHILDREN'S SERVICES", "Birmingham Children's Trust", BIRMINGHAM_CS, WOLVERHAMPTON_HO, NAVIGATOR, SHELTER);
    expect(text).not.toContain('01902 555392');
  });

  test('left care, looked after by Birmingham: their worker, then the council that looked after them, its Children\'s Services, then Housing Options, the navigator and Shelter', () => {
    const text = results(sixteen(), ['2', BIRMINGHAM]);
    inOrder(text, E1, 'LEAVING CARE TEAM', E3, FIND, FACTS, BIRMINGHAM_CS, WOLVERHAMPTON_HO, NAVIGATOR, SHELTER);
    expect(text).not.toContain('01902 555392');
  });

  test('left care, where Birmingham\'s leaving care team is held: that team, not the fallback', () => {
    withLeavingCare('birmingham', () => {
      const text = results(sixteen(), ['2', BIRMINGHAM]);
      inOrder(text, E1, 'LEAVING CARE TEAM', FACTS, 'birmingham leaving care team (test entry)', '0000 000 0001', WOLVERHAMPTON_HO, NAVIGATOR, SHELTER);
      expect(text).not.toContain(E3);
    });
  });

  test.each([['somewhere else', ELSEWHERE], ['not sure which council', NOT_SURE_COUNCIL], ['prefer not to say which council', PREFER_NOT_COUNCIL]])(
    'in care or left, %s: their worker, ask the council that looked after them, then Children\'s Services where they are now', (_l, council) => {
      for (const inCare of ['1', '2']) {
        const text = results(sixteen(), [inCare, council]);
        inOrder(text, E1, E3, FIND, "Wolverhampton Children's Services", WOLVERHAMPTON_CS, WOLVERHAMPTON_HO, NAVIGATOR, SHELTER);
        expect(text).not.toContain('0121 303 1888');
      }
    });

  test('no, but I have a social worker: today\'s "already involved" layout', () => {
    const text = results(sixteen({ socialServices: null }), ['3']);
    expect(text).toContain('If you need something different, or more help alongside that, these can help too.');
    expect(text).not.toContain(E1);
    expect(text).not.toContain('LEAVING CARE TEAM');
  });

  test('no: today\'s layout, Children\'s Services first, and no leaving care section', () => {
    const text = results(sixteen({ socialServices: 'Yes' }), ['4']);
    inOrder(text, "Wolverhampton Children's Services", WOLVERHAMPTON_HO, SHELTER);
    expect(text).not.toContain('If you need something different');
    expect(text).not.toContain('LEAVING CARE TEAM');
    expect(text).not.toContain('Children\'s Services can check this with you');
  });

  test('not sure: today\'s layout with the one-line note', () => {
    const text = results(sixteen({ socialServices: 'No' }), ['5']);
    inOrder(text, "Wolverhampton Children's Services", "If you're not sure whether you have been in care, Children's Services can check this with you.", WOLVERHAMPTON_HO);
    expect(text).not.toContain('LEAVING CARE TEAM');
  });

  // Prefer not to say is not stated (Managing Director, 11 November 2026):
  // today's layout, exactly as if the care question had not been asked.
  test.each([
    [false, 'Yes'], [false, 'No'], [false, null], [true, 'Yes'], [true, 'No'], [true, null],
  ] as const)('prefer not to say (supporter %s, earlier social worker answer %s): today\'s layout only, nothing selected on the answer', (isSupporter, socialServices) => {
    const declined = results(sixteen({ isSupporter, socialServices }), ['6']);
    const notAsked = processInput(sixteen({ isSupporter, socialServices, routeType: 'QUICK' }), '2').text;
    expect(declined).toBe(notAsked);
    expect(declined).not.toContain('LEAVING CARE TEAM');
    expect(declined).not.toContain(E1);
    expect(declined).not.toContain('been in care, the leaving care team can help');
  });

  test('prefer not to say, even where the local leaving care team is held: nothing added', () => {
    withLeavingCare('wolverhampton', () => {
      const text = results(sixteen({ socialServices: 'Yes' }), ['6']);
      expect(text).not.toContain('wolverhampton leaving care team (test entry)');
      expect(text).not.toContain('LEAVING CARE TEAM');
    });
  });

  test('a 17 year old who has never been in care sees exactly what they see today', () => {
    const today = processInput(sessionAt('B7_HOMELESS_SLEEPING_SITUATION', {
      routeType: 'QUICK', supportNeed: 'Emergency Housing', ageCategory: '16-17', localAuthority: 'Wolverhampton', socialServices: 'No',
    }), '3').text;
    const withAnswer = results(sixteen({ socialServices: 'No', housingSituation: null, sleepingSituation: 'Sofa surfing' }), ['4']);
    expect(withAnswer).toBe(today);
  });

  test('supporter: the same routes, about the young person', () => {
    const text = results(sixteen({ isSupporter: true }), ['2', BIRMINGHAM]);
    expect(text).toContain('If they have a social worker or personal adviser, they can talk to them about where they are living.');
    expect(text).toContain('The council that looked after them: ask for the leaving care team.');
    expect(text).toContain('They will look at their situation with them.');
    expect(results(sixteen({ isSupporter: true, socialServices: 'No' }), ['5']))
      .toContain("If they're not sure whether they have been in care, Children's Services can check this with them.");
  });
});

describe('18 to 24', () => {
  test('a 19 year old in Sandwell, looked after by Birmingham: Birmingham first, then Sandwell Housing Options', () => {
    withLeavingCare('birmingham', () => {
      const text = results(nineteen(), ['1', BIRMINGHAM]);
      inOrder(text, E1_LINE, 'LEAVING CARE TEAM', 'birmingham leaving care team (test entry)', SANDWELL_HO, SHELTER);
      expect(text).toContain('Support from a leaving care team can continue until your 25th birthday.');
      expect(text).not.toContain(E3);
    });
  });

  test('Yes, a named council with no leaving care entry: the find-your-council line and Housing Options, never an unverified number', () => {
    const text = results(nineteen(), ['1', BIRMINGHAM]);
    inOrder(text, E1_LINE, E3, FIND, FACTS, SANDWELL_HO, SHELTER);
    for (const phone of CHILDREN_PHONES) expect(text).not.toContain(phone);
  });

  test('a 22 year old looked after outside the region: ask the council that looked after them, local Housing Options, and no other council\'s number', () => {
    const text = results(twentyTwo(), ['1', ELSEWHERE]);
    inOrder(text, E1_LINE, E3, FIND, 'Support from a leaving care team can continue until your 25th birthday.', SANDWELL_HO, SHELTER);
    for (const phone of CHILDREN_PHONES) expect(text).not.toContain(phone);
  });

  test('Yes, somewhere else, where the local leaving care team is held: it follows Housing Options as local information', () => {
    withLeavingCare('sandwell', () => {
      const text = results(twentyTwo(), ['1', ELSEWHERE]);
      inOrder(text, E1_LINE, 'LEAVING CARE TEAM', E3, FIND, SANDWELL_HO, 'The leaving care team where you are now can tell you what is available locally.', 'sandwell leaving care team (test entry)', NAVIGATOR_OR_YOUTH, SHELTER);
      expect(count(text, 'LEAVING CARE TEAM')).toBe(1);
      expect(count(text, FIND)).toBe(1);
      expect(text).not.toContain('Ask Sandwell council for the leaving care team.');
    });
  });

  test('Yes, somewhere else, supporter, where the local leaving care team is held: it follows Housing Options, with one heading and one link', () => {
    withLeavingCare('sandwell', () => {
      const text = results(twentyTwo({ isSupporter: true }), ['1', ELSEWHERE]);
      inOrder(text, 'If they have a personal adviser, they can talk to them about their housing.', 'LEAVING CARE TEAM',
        'The council that looked after them: ask for the leaving care team.', FIND, SANDWELL_HO,
        'The leaving care team where they are now can tell them what is available locally.', 'sandwell leaving care team (test entry)', NAVIGATOR_OR_YOUTH, SHELTER);
      expect(count(text, 'LEAVING CARE TEAM')).toBe(1);
      expect(count(text, FIND)).toBe(1);
    });
  });

  test.each([[false, 'The leaving care team where you are now can tell you what is available locally.'], [true, 'The leaving care team where they are now can tell them what is available locally.']])(
    'Yes, somewhere else, with no local leaving care entry (supporter %s): E1 line, the E3 block, Housing Options, then the local fallback line', (isSupporter, line) => {
      const text = results(twentyTwo({ isSupporter }), ['1', ELSEWHERE]);
      const e1 = isSupporter ? 'If they have a personal adviser, they can talk to them about their housing.' : E1_LINE;
      inOrder(text, e1, 'LEAVING CARE TEAM', E3.replace(isSupporter ? 'you:' : '#', 'them:'), FIND, SANDWELL_HO, line, 'Ask Sandwell council for the leaving care team.', NAVIGATOR_OR_YOUTH, SHELTER);
      expect(count(text, 'Ask Sandwell council for the leaving care team.')).toBe(1);
      expect(count(text, 'LEAVING CARE TEAM')).toBe(1);
      expect(count(text, FIND)).toBe(1);
      expect(count(text, line)).toBe(1);
      for (const phone of CHILDREN_PHONES) expect(text).not.toContain(phone);
    });

  test('Yes, not sure which council: the leaving care team where they are now can help find who is responsible', () => {
    const text = results(nineteen(), ['1', NOT_SURE_COUNCIL]);
    inOrder(text, 'The leaving care team where you are now can help you find who is responsible.', 'Ask Sandwell council for the leaving care team.', FIND, SANDWELL_HO, SHELTER);
    expect(text).not.toContain(E1_LINE);
  });

  // Council not stated (11 November 2026 rule): the route for being in care with
  // no council named, and nothing selected on the strength of a council.
  test.each([
    [false, E1_LINE, E3],
    [true, 'If they have a personal adviser, they can talk to them about their housing.', 'The council that looked after them: ask for the leaving care team.'],
  ] as const)('Yes, prefer not to say which council (supporter %s): E1 line, the E3 block with its link, then the standard results', (isSupporter, e1, e3) => {
    withLeavingCare('sandwell', () => {
      const text = results(nineteen({ isSupporter }), ['1', PREFER_NOT_COUNCIL]);
      inOrder(text, e1, 'LEAVING CARE TEAM', e3, FIND, SANDWELL_HO, SHELTER);
      expect(count(text, 'LEAVING CARE TEAM')).toBe(1);
      expect(count(text, FIND)).toBe(1);
      expect(text).not.toContain('sandwell leaving care team (test entry)');
      expect(text).not.toContain('find who is responsible');
      expect(text).not.toMatch(/Ask \w+ council for the leaving care team/);
      for (const phone of CHILDREN_PHONES) expect(text).not.toContain(phone);
    });
  });

  test('16-17 in care, prefer not to say which council: their worker, E3 with its link, then Children\'s Services where they are now, and no other council\'s number', () => {
    for (const isSupporter of [false, true]) {
      const text = results(sixteen({ isSupporter }), ['1', PREFER_NOT_COUNCIL]);
      inOrder(text, 'YOUR SOCIAL WORKER OR PERSONAL ADVISER', 'LEAVING CARE TEAM', FIND, "Wolverhampton Children's Services", WOLVERHAMPTON_HO, SHELTER);
      for (const phone of CHILDREN_PHONES.filter(p => p !== '01902 555392')) expect(text).not.toContain(phone);
    }
  });

  test('not sure whether they were in care: the leaving care team can check', () => {
    const text = results(nineteen(), ['3']);
    inOrder(text, "If you're not sure whether you have been in care, the leaving care team where you are now can check for you.", 'Ask Sandwell council for the leaving care team.', SANDWELL_HO, SHELTER);
  });

  test('No: standard results, with no leaving care section', () => {
    const text = results(nineteen(), ['2']);
    expect(text).not.toContain('LEAVING CARE TEAM');
    expect(text).not.toContain('leaving care');
    inOrder(text, 'YOUR FIRST STEP', SANDWELL_HO, SHELTER);
  });

  test('Prefer not to say is not stated: the standard results, the same as No, self and supporter', () => {
    for (const isSupporter of [false, true]) {
      const declined = results(nineteen({ isSupporter }), ['4']);
      expect(declined).toBe(results(nineteen({ isSupporter }), ['2']));
      expect(declined).not.toContain('LEAVING CARE TEAM');
      expect(declined).not.toContain('been in care, the leaving care team can help');
    }
    withLeavingCare('sandwell', () => {
      expect(results(nineteen(), ['4'])).not.toContain('sandwell leaving care team (test entry)');
    });
  });

  test('every care output includes Housing Options and Shelter', () => {
    const answers = [['1', BIRMINGHAM], ['1', ELSEWHERE], ['1', NOT_SURE_COUNCIL], ['1', PREFER_NOT_COUNCIL], ['2'], ['3'], ['4']];
    for (const start of [nineteen(), twentyTwo(), nineteen({ isSupporter: true })]) for (const a of answers) {
      const text = results(start, a);
      expect([a, text.includes(SANDWELL_HO), text.includes(SHELTER)]).toEqual([a, true, true]);
    }
    for (const a of [['1', BIRMINGHAM], ['2', BIRMINGHAM], ['1', ELSEWHERE], ['2', NOT_SURE_COUNCIL], ['3'], ['4'], ['5'], ['6']]) {
      const text = results(sixteen(), a);
      expect([a, text.includes(WOLVERHAMPTON_HO), text.includes(SHELTER)]).toEqual([a, true, true]);
    }
  });

  test('supporter: the same routes, about the young person', () => {
    const text = results(twentyTwo({ isSupporter: true }), ['1', ELSEWHERE]);
    expect(text).toContain('If they have a personal adviser, they can talk to them about their housing.');
    expect(text).toContain('The council that looked after them: ask for the leaving care team.');
    expect(text).toContain('Support from a leaving care team can continue until their 25th birthday.');
    expect(results(nineteen({ isSupporter: true }), ['3'])).toContain('the leaving care team where they are now can check for them.');
    expect(results(nineteen({ isSupporter: true }), ['1', NOT_SURE_COUNCIL])).toContain('can help them find who is responsible.');
  });
});

describe('one wording for how long leaving care support can continue, 18 to 24', () => {
  const SELF = 'Support from a leaving care team can continue until your 25th birthday.';
  const SUPPORTER = 'Support from a leaving care team can continue until their 25th birthday.';
  test.each([['18-24', nineteen], ['21-24 (older session)', (p: Partial<SessionState> = {}) => twentyTwo({ detailedAge: '21-24', ...p })]] as const)('%s, self and supporter, every Yes route that shows it', (_l, start) => {
    for (const council of [BIRMINGHAM, ELSEWHERE]) {
      const self = results(start(), ['1', council]);
      const sup = results(start({ isSupporter: true }), ['1', council]);
      expect(count(self, SELF)).toBe(1);
      expect(count(sup, SUPPORTER)).toBe(1);
      for (const t of [self, sup]) expect(t).not.toMatch(/until 21|after 21|ask for it|on request|priority need|intentionally homeless/i);
    }
  });

  test('no care phrase treats 21 as the end of support', () => {
    for (const k of Object.keys(phrasebank).filter(k => /^(CARE_|C3Q11)/.test(k))) {
      expect([k, /\b21\b/.test(phrasebank[k].text)]).toEqual([k, false]);
    }
  });
});

describe('the wording states facts and never applies them', () => {
  test('no care leaver phrase says entitled, duty or must, other than a duty team', () => {
    const keys = Object.keys(phrasebank).filter(k => /^(CARE_|C3Q11|SAFETY_16_17)/.test(k));
    expect(keys.length).toBeGreaterThan(20);
    for (const k of keys) {
      const t = phrasebank[k].text.replace(/duty team/g, '');
      expect([k, /entitled|\bduty\b|\bmust\b|have a right/i.test(t)]).toEqual([k, false]);
    }
  });

  test('no care result says entitled, duty or must, other than a duty team', () => {
    const runs = [[sixteen(), ['1', BIRMINGHAM]], [sixteen(), ['2', ELSEWHERE]], [nineteen(), ['1', BIRMINGHAM]], [twentyTwo(), ['1', ELSEWHERE]], [nineteen(), ['3']], [nineteen(), ['4']]] as const;
    for (const [start, a] of runs) {
      const text = results(start, [...a]).replace(/duty team/g, '');
      expect(/entitled|\bduty\b|\bmust\b/i.test(text)).toBe(false);
    }
  });
});

describe('services designed for care leavers are lifted', () => {
  const row = (id: string, keys?: string[]): PlatformServiceRow => ({
    _id: id, ServiceProviderKey: `org-${id}`, ServiceProviderName: `Service ${id}`, Info: `Service ${id} description`,
    ParentCategoryKey: 'housing', SubCategoryKey: 'housing-advice', IsAppointmentOnly: false, IsTelephoneService: false,
    ClientGroupKeys: keys, Address: { Location: { type: 'Point', coordinates: [-2.12, 52.58] } }, distance: 100,
  });
  const pool = (): ServicePool => {
    const services = [row('a'), row('b', ['care-leavers'])].map(r => mapServiceRow(r)!);
    return { status: 'ready', radiusKm: 5, services, contacts: mapProviderRows(services.map(s => ({ Key: s.organization_id, Name: s.name, Telephone: null, Website: null }))) };
  };
  const order = (p: Partial<SessionState>) => runWithServicePool(pool(), () =>
    getHousingAdviceServices(toUserProfile({ ...createSession('t'), localAuthority: 'Wolverhampton', ...p } as SessionState)).map(s => s.name));

  test.each(['YES', 'IN_CARE_NOW', 'LEFT_CARE'] as const)('%s lifts them', careExperience => {
    expect(order({ careExperience })).toEqual(['Service b', 'Service a']);
  });

  test.each(['NO', 'NOT_SURE', 'PREFER_NOT', 'SOCIAL_WORKER'] as const)('%s lifts nothing, and hides nothing', careExperience => {
    expect(order({ careExperience })).toEqual(['Service a', 'Service b']);
  });

  test('Prefer not to say at the care question, reached by answering it, lifts nothing', () => {
    const { session } = converse(nineteen(), ['2', '4']);
    expect(session.careExperience).toBe('PREFER_NOT');
    expect(toUserProfile(session).careExperienced).toBe(false);
  });
});
