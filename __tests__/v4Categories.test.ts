// V4 category maps (backlog item 80, A1; VA V4 Redesign Design Note, Decision 1).

import {
  FIRST_OPTIONS,
  V4_PARENTS,
  firstOption,
  isKnownV4Category,
  matchesParts,
  partsFor,
  placeToStartShown,
} from '../lib/data/v4Categories';

describe('first screen', () => {
  test('eight options, housing first and safety second so safety is never buried', () => {
    expect(FIRST_OPTIONS).toHaveLength(8);
    expect(FIRST_OPTIONS[0].id).toBe('housing');
    expect(FIRST_OPTIONS[1].id).toBe('safety');
  });

  test('every V4 parent is reachable from the first screen', () => {
    const covered = new Set(FIRST_OPTIONS.flatMap(o => o.parents));
    for (const p of V4_PARENTS) expect(covered.has(p)).toBe(true);
  });

  test('safety never goes to the matcher: it takes the Safety route', () => {
    const safety = firstOption('safety');
    expect(safety.kind).toBe('routed');
    expect(safety.route).toBe('safety');
    expect(partsFor('safety')).toEqual([]);
  });

  test('not sure where to start leads to the VA helping work it out, not a category', () => {
    expect(firstOption('not-sure').route).toBe('noticing-step');
    expect(partsFor('not-sure')).toEqual([]);
  });

  test('each option starts with different words, for voice control', () => {
    const firstWords = FIRST_OPTIONS.map(o => o.label.split(' ')[0]);
    expect(new Set(firstWords).size).toBe(firstWords.length);
  });

  test('second screens have six or fewer choices and end with something else', () => {
    for (const o of FIRST_OPTIONS.filter(x => x.secondScreen)) {
      expect(o.secondScreen!.length).toBeLessThanOrEqual(6);
      expect(o.secondScreen![o.secondScreen!.length - 1].label).toBe('Something else');
    }
  });
});

describe('what a person is shown', () => {
  const svc = (parent: string, sub: string) => ({ parent, sub });

  test('someone after a hot meal sees hot meals, not food banks', () => {
    const parts = partsFor('everyday', 'A hot meal');
    expect(matchesParts(svc('food', 'hot-meals'), parts)).toBe(true);
    expect(matchesParts(svc('food', 'groceries'), parts)).toBe(false);
  });

  test('something else shows the whole group, including baby items and pet welfare', () => {
    const parts = partsFor('everyday', 'Something else');
    expect(matchesParts(svc('essentials', 'pet-welfare'), parts)).toBe(true);
    expect(matchesParts(svc('food', 'groceries'), parts)).toBe(true);
  });

  test('someone with debt sees debt advice, not jobs', () => {
    const parts = partsFor('money-work', 'Debt');
    expect(matchesParts(svc('finance', 'debt-and-money-management'), parts)).toBe(true);
    expect(matchesParts(svc('employment', 'jobs'), parts)).toBe(false);
  });

  test('work or training shows all of employment', () => {
    const parts = partsFor('money-work', 'Work or training');
    for (const sub of ['jobs', 'skills', 'employment-advice']) {
      expect(matchesParts(svc('employment', sub), parts)).toBe(true);
    }
  });

  test('drugs or alcohol shows both, and not gambling', () => {
    const parts = partsFor('health', 'Drugs or alcohol');
    expect(matchesParts(svc('addiction', 'drugs'), parts)).toBe(true);
    expect(matchesParts(svc('addiction', 'alcohol'), parts)).toBe(true);
    expect(matchesParts(svc('addiction', 'gambling'), parts)).toBe(false);
  });

  test('sexual health has no key on the copy yet, so it shows all of health rather than nothing', () => {
    const choice = firstOption('health').secondScreen!.find(c => c.label === 'Sexual health')!;
    expect(choice.pendingKey).toBeDefined();
    expect(matchesParts(svc('health', 'physical-health'), choice.parts)).toBe(true);
  });

  test('immigration and activities show everything in the parent', () => {
    expect(matchesParts(svc('immigration', 'resettlement-and-integration'), partsFor('immigration'))).toBe(true);
    expect(matchesParts(svc('activities', 'social-connection'), partsFor('activities'))).toBe(true);
  });

  test('an old-taxonomy service is not matched by a V4 choice', () => {
    expect(matchesParts(svc('foodbank', 'foodbank'), partsFor('everyday', 'Food to take home'))).toBe(false);
  });
});

describe('keys the VA does not know are flagged, not guessed', () => {
  test('V4 keys from the copy are known', () => {
    expect(isKnownV4Category('housing', 'emergency-accommodation')).toBe(true);
    expect(isKnownV4Category('safety-from-harm', '')).toBe(true);
  });

  test('old keys are not', () => {
    expect(isKnownV4Category('accom', 'emergency')).toBe(false);
    expect(isKnownV4Category('activities', 'arts')).toBe(false);
  });
});

describe('places to start', () => {
  test('only those marked show at the switch are offered', () => {
    expect(placeToStartShown({ Publish: 'show at the switch' })).toBe(true);
    expect(placeToStartShown({ Publish: 'confirm first' })).toBe(false);
    expect(placeToStartShown({})).toBe(false);
  });
});
