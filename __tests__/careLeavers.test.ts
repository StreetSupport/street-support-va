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
// Every leaving care number held, and their out of hours numbers.
const LEAVING_CARE_PHONES = Object.values(endpoints).flatMap(e => {
  const lc = (e as { leavingCare?: { phone?: string; phoneOOH?: string } }).leavingCare;
  return lc ? [lc.phone, lc.phoneOOH].filter((x): x is string => !!x).map(x => x.replace(/ \(.*\)$/, '')) : [];
});

// A test entry in place of a council's leaving care entry, and a council with
// none, for the routes that need them. The entry held in the data is restored
// after each.
const restore = (council: string, held: unknown) => {
  if (held === undefined) delete endpoints[council].leavingCare;
  else endpoints[council].leavingCare = held;
};
function withLeavingCare(council: string, fn: () => void) {
  const held = endpoints[council].leavingCare;
  endpoints[council].leavingCare = {
    name: `${council} leaving care team (test entry)`, phone: '0000 000 0001', website: 'https://example.org/leaving-care',
    source: 'test', verified: '2026-11-20',
  };
  try { fn(); } finally { restore(council, held); }
}
function withoutLeavingCare(council: string, fn: () => void) {
  const held = endpoints[council].leavingCare;
  delete endpoints[council].leavingCare;
  try { fn(); } finally { restore(council, held); }
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

  test('left care, looked after by Birmingham, where no leaving care team is held: their worker, then the council that looked after them, its Children\'s Services, then Housing Options, the navigator and Shelter', () => {
    withoutLeavingCare('birmingham', () => {
      const text = results(sixteen(), ['2', BIRMINGHAM]);
      inOrder(text, E1, 'LEAVING CARE TEAM', E3, FIND, FACTS, BIRMINGHAM_CS, WOLVERHAMPTON_HO, NAVIGATOR, SHELTER);
      expect(text).not.toContain('01902 555392');
    });
  });

  test('left care, where Birmingham\'s leaving care team is held: that team, not the fallback', () => {
    withLeavingCare('birmingham', () => {
      const text = results(sixteen(), ['2', BIRMINGHAM]);
      inOrder(text, E1, 'LEAVING CARE TEAM', FACTS, 'birmingham leaving care team (test entry)', '0000 000 0001', WOLVERHAMPTON_HO, NAVIGATOR, SHELTER);
      expect(text).not.toContain(E3);
    });
  });

  test.each([false, true])('a Sandwell 17 year old who left Birmingham\'s care (supporter %s): Birmingham\'s leaving care team, then Sandwell Children\'s Services with out of hours, then Sandwell Housing Options, and no Birmingham Children\'s Services number', isSupporter => {
    const text = results(sixteen({ isSupporter, localAuthority: 'Sandwell' }), ['2', BIRMINGHAM]);
    inOrder(text, 'LEAVING CARE TEAM', '18+ Care Leavers Service\n0121 464 1229', "CHILDREN'S SERVICES",
      "Sandwell Children's Trust\n0121 569 3100 (out of hours: 0121 569 2355)", SANDWELL_HO);
    expect(count(text, "CHILDREN'S SERVICES")).toBe(1);
    expect(text).not.toContain('0121 303 1888');
    expect(text).not.toContain("Birmingham Children's Trust");
    expect(text).not.toContain(E3);
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
    expect(text).toContain('They will look at their situation with them.');
    withoutLeavingCare('birmingham', () => {
      expect(results(sixteen({ isSupporter: true }), ['2', BIRMINGHAM])).toContain('The council that looked after them: ask for the leaving care team.');
    });
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
    withoutLeavingCare('birmingham', () => {
      const text = results(nineteen(), ['1', BIRMINGHAM]);
      inOrder(text, E1_LINE, E3, FIND, FACTS, SANDWELL_HO, SHELTER);
      for (const phone of CHILDREN_PHONES) expect(text).not.toContain(phone);
    });
  });

  test('a 22 year old looked after outside the region, where no local leaving care team is held: ask the council that looked after them, local Housing Options, and no other council\'s number', () => {
    withoutLeavingCare('sandwell', () => {
      const text = results(twentyTwo(), ['1', ELSEWHERE]);
      inOrder(text, E1_LINE, E3, FIND, 'Support from a leaving care team can continue until your 25th birthday.', SANDWELL_HO, SHELTER);
      for (const phone of CHILDREN_PHONES) expect(text).not.toContain(phone);
    });
  });

  // Looked after outside the area (Managing Director, 20 November 2026): the
  // local council's leaving care team is not shown, neither its number nor the
  // "Ask <council> council" line.
  test.each([false, true])('a Sandwell 22 year old looked after somewhere else (supporter %s): E1 line, the E3 block, Sandwell Housing Options, E6 and E7, and no leaving care number', isSupporter => {
    expect(endpoints.sandwell.leavingCare).toBeTruthy();
    const text = results(twentyTwo({ isSupporter }), ['1', ELSEWHERE]);
    const e1 = isSupporter ? 'If they have a personal adviser, they can talk to them about their housing.' : E1_LINE;
    const e3 = isSupporter ? 'The council that looked after them: ask for the leaving care team.' : E3;
    inOrder(text, e1, 'LEAVING CARE TEAM', e3, FIND, SANDWELL_HO, NAVIGATOR_OR_YOUTH, SHELTER);
    expect(count(text, 'LEAVING CARE TEAM')).toBe(1);
    expect(count(text, FIND)).toBe(1);
    for (const phone of LEAVING_CARE_PHONES) expect([phone, text.includes(phone)]).toEqual([phone, false]);
    expect(text).not.toContain('Care Experienced Team');
    expect(text).not.toMatch(/Ask \w+ council for the leaving care team/);
    expect(text).not.toContain('can tell you what is available locally');
    expect(text).not.toContain('can tell them what is available locally');
  });

  test('Yes, not sure which council, where no local leaving care team is held: the leaving care team where they are now can help find who is responsible', () => {
    withoutLeavingCare('sandwell', () => {
      const text = results(nineteen(), ['1', NOT_SURE_COUNCIL]);
      inOrder(text, 'The leaving care team where you are now can help you find who is responsible.', 'Ask Sandwell council for the leaving care team.', FIND, SANDWELL_HO, SHELTER);
      expect(text).not.toContain(E1_LINE);
    });
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

  test('not sure whether they were in care, where no local leaving care team is held: the leaving care team can check', () => {
    withoutLeavingCare('sandwell', () => {
      const text = results(nineteen(), ['3']);
      inOrder(text, "If you're not sure whether you have been in care, the leaving care team where you are now can check for you.", 'Ask Sandwell council for the leaving care team.', SANDWELL_HO, SHELTER);
    });
  });

  // The two not-sure answers, where the local leaving care team is held: the
  // team, then one caveat line under it (Managing Director, 20 November 2026).
  test.each([
    ['not sure which council', false, ['1', NOT_SURE_COUNCIL], 'If Sandwell looked after you, this team can support you. If it was a different council, they may be able to help you work out which one, or give you some support in the meantime.'],
    ['not sure which council', true, ['1', NOT_SURE_COUNCIL], 'If Sandwell looked after them, this team can support them. If it was a different council, they may be able to help work out which one, or give some support in the meantime.'],
    ['not sure if in care', false, ['3'], "If you're not sure whether you were in care, this team may be able to check whether Sandwell looked after you. If it was a different council, that council's leaving care team can help."],
    ['not sure if in care', true, ['3'], "If they're not sure whether they were in care, this team may be able to check whether Sandwell looked after them. If it was a different council, that council's leaving care team can help."],
  ] as const)('Sandwell, %s (supporter %s): the local team with its number and out of hours, the caveat line once under it, then Housing Options', (_l, isSupporter, answers, caveat) => {
    const text = results(nineteen({ isSupporter }), [...answers]);
    inOrder(text, 'LEAVING CARE TEAM', 'Care Experienced Team\n0121 569 8565 (out of hours: 0121 569 3100)\n', caveat, SANDWELL_HO, SHELTER);
    expect(text).toContain(`0121 569 3100)\n${caveat}\n`);
    expect(count(text, caveat)).toBe(1);
    expect(count(text, 'LEAVING CARE TEAM')).toBe(1);
    expect(text).not.toContain('find who is responsible');
    expect(text).not.toContain('can check for you');
    expect(text).not.toContain('can check for them');
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
    withoutLeavingCare('sandwell', () => {
      expect(results(nineteen({ isSupporter: true }), ['3'])).toContain('the leaving care team where they are now can check for them.');
      expect(results(nineteen({ isSupporter: true }), ['1', NOT_SURE_COUNCIL])).toContain('can help them find who is responsible.');
    });
  });
});

// The leaving care teams of the seven councils, confirmed by the Managing
// Director from each council's or trust's own page, 20 November 2026.
describe('confirmed leaving care teams', () => {
  const OPTION: Record<string, string> = { wolverhampton: '1', birmingham: '2', coventry: '3', dudley: '4', sandwell: '5', solihull: '6', walsall: '7' };
  const TEAM: Record<string, [string, string]> = {
    birmingham: ['18+ Care Leavers Service', '0121 464 1229 (out of hours: 0121 675 4806)\n'],
    coventry: ['Through Care', '024 7678 7808\ndutythroughcare@coventry.gov.uk\nhttps://www.coventry.gov.uk/route21\n'],
    dudley: ['Care leavers personal advisers', '01384 813223 (Monday to Friday, 9am to 5pm) (out of hours: 0300 555 8574)\n'],
    sandwell: ['Care Experienced Team', '0121 569 8565 (out of hours: 0121 569 3100)\n'],
    solihull: ['Next Steps team', '0121 717 1473 (option 1) (Monday to Friday, 9am to 5pm)\n'],
    walsall: ['Transition and Leaving Care Hub', '01922 650575\n'],
    wolverhampton: ['REACH Leaving Care Team', '01902 551155\nAsk to speak to a Duty Worker\nhttps://www.wolveschildrenincare.com/\n'],
  };
  const TEAM_PHONES: Record<string, string> = {
    birmingham: '0121 464 1229', coventry: '024 7678 7808', dudley: '01384 813223', sandwell: '0121 569 8565',
    solihull: '0121 717 1473', walsall: '01922 650575', wolverhampton: '01902 551155',
  };
  const e1Line = (isSupporter: boolean) => isSupporter ? 'If they have a personal adviser, they can talk to them about their housing.' : E1_LINE;
  const both = [false, true] as const;

  test.each(both)('a Sandwell 19 year old looked after by Birmingham (supporter %s): Birmingham\'s team and number first, then Sandwell Housing Options, and no other council\'s number', isSupporter => {
    const text = results(nineteen({ isSupporter }), ['1', BIRMINGHAM]);
    inOrder(text, e1Line(isSupporter), 'LEAVING CARE TEAM', '18+ Care Leavers Service\n0121 464 1229 (out of hours: 0121 675 4806)\n', SANDWELL_HO, SHELTER);
    expect(text).not.toContain(E3);
    for (const [k, phone] of Object.entries(TEAM_PHONES)) if (k !== 'birmingham') expect([k, text.includes(phone)]).toEqual([k, false]);
    for (const phone of CHILDREN_PHONES) expect(text).not.toContain(phone);
  });

  test.each(Object.keys(TEAM))('%s: its team shows its exact number, self and supporter, 18 to 24 and 16 or 17 left care', council => {
    const [name, lines] = TEAM[council];
    for (const isSupporter of both) {
      for (const text of [results(nineteen({ isSupporter }), ['1', OPTION[council]]), results(sixteen({ isSupporter }), ['2', OPTION[council]])]) {
        inOrder(text, 'LEAVING CARE TEAM', `${name}\n${lines}`);
        expect(text).not.toContain(E3);
        for (const [k, phone] of Object.entries(TEAM_PHONES)) if (k !== council) expect([council, k, text.includes(phone)]).toEqual([council, k, false]);
      }
    }
  });

  test.each(both)('Wolverhampton shows the Duty Worker note after the number (supporter %s)', isSupporter => {
    for (const text of [results(nineteen({ isSupporter }), ['1', WOLVERHAMPTON]), results(sixteen({ isSupporter }), ['2', WOLVERHAMPTON])]) {
      expect(text).toContain('REACH Leaving Care Team\n01902 551155\nAsk to speak to a Duty Worker\n');
    }
  });

  test.each(both)('Dudley and Solihull show their hours (supporter %s)', isSupporter => {
    const dudley = results(nineteen({ isSupporter }), ['1', OPTION.dudley]);
    const solihull = results(nineteen({ isSupporter }), ['1', OPTION.solihull]);
    expect(dudley).toContain('01384 813223 (Monday to Friday, 9am to 5pm)');
    expect(solihull).toContain('0121 717 1473 (option 1) (Monday to Friday, 9am to 5pm)');
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
