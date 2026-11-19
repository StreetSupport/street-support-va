// The first question in V4 terms (Decision 1, Managing Director, 4 November
// 2026): eight options, three of them with a second screen, matched to the V4
// categories as they will be at the switch.

import type { SessionState } from '../lib/types';
import { createSession, processInput } from '../lib/stateMachine';
import { runWithServicePool, type ServicePool } from '../lib/data/servicePool';
import { mapProviderRows, mapServiceRow } from '../lib/data/platformMapping';
import { parseSafetyChoice } from '../lib/handlers/safety';
import { getPhrase } from '../lib/phrasebank';

function sessionAt(gate: SessionState['currentGate'], over: Partial<SessionState> = {}): SessionState {
  return { ...createSession('test'), currentGate: gate, localAuthority: 'Wolverhampton', routeType: 'QUICK', ...over };
}

function step(s: SessionState, input: string) {
  const r = processInput(s, input);
  return { r, s: { ...s, ...r.stateUpdates } as SessionState };
}

const row = (id: string, parent: string, sub: string, distance: number) => ({
  _id: id,
  ServiceProviderKey: `org-${id}`,
  ServiceProviderName: `Org ${id}`,
  Info: `Service ${id}`,
  ParentCategoryKey: parent,
  SubCategoryKey: sub,
  IsAppointmentOnly: false,
  IsTelephoneService: false,
  Address: { Location: { type: 'Point', coordinates: [-2.12, 52.58] as [number, number] } },
  distance,
});

function v4Pool(): ServicePool {
  const rows = [
    row('hot', 'food', 'hot-meals', 100),
    row('groc', 'food', 'groceries', 200),
    row('debt', 'finance', 'debt-and-money-management', 300),
    row('jobs', 'employment', 'jobs', 400),
    row('dv', 'safety-from-harm', 'domestic-abuse', 50),
  ];
  return {
    status: 'ready',
    radiusKm: 5,
    services: rows.map(r => mapServiceRow(r)!),
    contacts: mapProviderRows(rows.map(r => ({ Key: r.ServiceProviderKey, Name: r.ServiceProviderName, Telephone: null, Website: null }))),
  } as ServicePool;
}

describe('First question: eight options', () => {
  test('a person is offered eight options', () => {
    const s = sessionAt('B4_GENDER');
    const { r } = step(s, '3'); // any gender answer leads to the first question
    expect(r.stateUpdates.currentGate).toBe('B5_MAIN_SUPPORT_NEED');
    expect(r.options).toHaveLength(8);
  });

  test('somewhere to live goes to the housing route, asking age first', () => {
    const { r } = step(sessionAt('B5_MAIN_SUPPORT_NEED'), '1');
    expect(r.stateUpdates.currentGate).toBe('B5_PROFILE_AGE');
    expect(r.stateUpdates.supportNeed).toBe('Emergency Housing');
  });

  test('staying safe goes to the Safety from harm route, not the matcher', () => {
    const { r } = step(sessionAt('B5_MAIN_SUPPORT_NEED'), '2');
    expect(r.stateUpdates.currentGate).toBe('SAFETY_TYPE_OF_HARM');
  });

  test.each([[3], [4], [5]])('option %i opens a second screen of six or fewer choices', (n: number) => {
    const { r } = step(sessionAt('B5_MAIN_SUPPORT_NEED'), String(n));
    expect(r.stateUpdates.currentGate).toBe('B5_SECOND_SCREEN');
    expect(r.options!.length).toBeLessThanOrEqual(6);
  });

  test('immigration goes straight to its profile questions', () => {
    const { r } = step(sessionAt('B5_MAIN_SUPPORT_NEED'), '6');
    expect(r.stateUpdates.currentGate).toBe('B5_PROFILE_GENDER');
  });

  test('a supporter is offered the same eight options', () => {
    const { r } = step(sessionAt('B5_MAIN_SUPPORT_NEED', { isSupporter: true, userType: 'SUPPORTER' }), '99');
    expect(r.options).toHaveLength(8);
  });
});

describe('Second screen: what is shown', () => {
  test('someone wanting a hot meal is shown hot meals, not food to take home', () => {
    let { s } = step(sessionAt('B5_MAIN_SUPPORT_NEED'), '3');
    const r = runWithServicePool(v4Pool(), () => processInput(s, '1'));
    expect(r.text).toContain('Org hot');
    expect(r.text).not.toContain('Org groc');
  });

  test('someone with a debt question is shown money services after their profile questions, and no jobs', () => {
    let { s } = step(sessionAt('B5_MAIN_SUPPORT_NEED'), '4');
    let r = processInput(s, '1'); // Debt
    s = { ...s, ...r.stateUpdates };
    for (let i = 0; i < 8 && !r.text.includes('Org '); i++) {
      const pick = s.currentGate === 'B5_PROFILE_AGE' ? '4' : '2';
      r = runWithServicePool(v4Pool(), () => processInput(s, pick));
      s = { ...s, ...r.stateUpdates };
    }
    expect(r.text).toContain('Org debt');
    expect(r.text).not.toContain('Org jobs');
  });

  test('a domestic abuse listing is never shown through the matcher from another option', () => {
    let { s } = step(sessionAt('B5_MAIN_SUPPORT_NEED'), '3');
    const r = runWithServicePool(v4Pool(), () => processInput(s, '6')); // Something else
    expect(r.text).not.toContain('Org dv');
  });

  test('an answer outside the second screen asks again, and keeps the screen', () => {
    let { s } = step(sessionAt('B5_MAIN_SUPPORT_NEED'), '5');
    const r = processInput(s, '9');
    expect(r.stateUpdates.currentGate).toBe('B5_SECOND_SCREEN');
    expect(r.options).toHaveLength(6);
  });
});

describe('Every choice reaches a result', () => {
  // Options 3 to 7; options 3, 4 and 5 with each of their six choices.
  const paths: string[][] = [
    ...[3, 4, 5].flatMap(o => [1, 2, 3, 4, 5, 6].map(c => [String(o), String(c)])),
    ['6'], ['7'],
  ];
  test.each(paths.map(p => [p.join(' then '), p]))('%i: every question asked once, then the results', (_label: string, path: string[]) => {
    let s = sessionAt('B5_MAIN_SUPPORT_NEED');
    let r = processInput(s, path[0]);
    s = { ...s, ...r.stateUpdates };
    for (const p of path.slice(1)) { r = processInput(s, p); s = { ...s, ...r.stateUpdates }; }
    const asked: string[] = [];
    for (let i = 0; i < 10 && !String(s.currentGate).startsWith('TERMINAL'); i++) {
      expect(asked.includes(s.currentGate)).toBe(false);
      asked.push(s.currentGate);
      // 25 or over at the age question; "No" or the second option elsewhere
      r = processInput(s, s.currentGate === 'B5_PROFILE_AGE' ? '4' : '2');
      s = { ...s, ...r.stateUpdates };
    }
    expect(String(s.currentGate).startsWith('TERMINAL')).toBe(true);
  });
});

describe('Fixes from the independent review', () => {
  test('someone who prefers not to say whether they are LGBTQ+ is not asked again', () => {
    let { s } = step(sessionAt('B5_MAIN_SUPPORT_NEED'), '5');
    ({ s } = step(s, '1')); // Mental health
    let lgbtqAsks = 0;
    for (let i = 0; i < 12 && !String(s.currentGate).startsWith('TERMINAL'); i++) {
      if (s.currentGate === 'B5_PROFILE_LGBTQ') lgbtqAsks++;
      const pick = s.currentGate === 'B5_PROFILE_AGE' ? '4' : s.currentGate === 'B5_PROFILE_LGBTQ' ? '3' : '2';
      ({ s } = step(s, pick));
    }
    expect(lgbtqAsks).toBe(1);
    expect(String(s.currentGate).startsWith('TERMINAL')).toBe(true);
  });

  test('someone asking about immigration is always shown Citizens Advice', () => {
    let { r, s } = step(sessionAt('B5_MAIN_SUPPORT_NEED'), '6');
    for (let i = 0; i < 8 && !String(s.currentGate).startsWith('TERMINAL'); i++) ({ r, s } = step(s, '2'));
    expect(r.text).toContain('Citizens Advice');
  });

  test('choosing housing after an earlier need leaves nothing from that need behind', () => {
    const { r } = step(sessionAt('B5_MAIN_SUPPORT_NEED', { v4Option: 'everyday', v4Choice: 'A hot meal', ageCategory: '25+' }), '1');
    expect(r.stateUpdates.v4Choice).toBeNull();
    expect(r.stateUpdates.v4Option).toBe('housing');
  });

  test('typed words that are not an option are not read as one on the menu screens', () => {
    const everyday = getPhrase('B5_SECOND_EVERYDAY', false)!.options;
    const first = getPhrase('B5_MAIN_SUPPORT_NEED', false)!.options;
    expect(parseSafetyChoice('my partner hurts me', everyday)).toBeNull();
    expect(parseSafetyChoice("i'm staying with friends", first)).toBeNull();
    expect(parseSafetyChoice('a hot meal', everyday)).toBe(1);
  });
});
