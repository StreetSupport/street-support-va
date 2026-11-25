/**
 * The Safety from harm route's switch (James Cross's review of #69).
 *
 * Off unless VA_SAFETY_ROUTE is "on". While it is off, the first question does
 * not offer the Safety option, its numbers close up, and nothing typed or chosen
 * there reaches the Safety route. The crisis question is not affected.
 */

import type { SessionState } from '../lib/types';
import { createSession, processInput } from '../lib/stateMachine';
import { getPhrase } from '../lib/phrasebank';
import { visibleFirstOptions } from '../lib/data/v4Categories';

const SAFETY = 'Staying safe from abuse, exploitation or harm';

function sessionAt(gate: SessionState['currentGate'], over: Partial<SessionState> = {}): SessionState {
  return { ...createSession('test'), currentGate: gate, localAuthority: 'Wolverhampton', routeType: 'QUICK', ...over };
}

const saved = process.env.VA_SAFETY_ROUTE;
afterEach(() => {
  process.env.VA_SAFETY_ROUTE = saved;
});

describe('Safety route switch off (the default)', () => {
  beforeEach(() => {
    delete process.env.VA_SAFETY_ROUTE;
  });

  test.each([[false], [true]])('the first question leaves Safety out and renumbers (supporter: %s)', (supporter: boolean) => {
    const p = getPhrase('B5_MAIN_SUPPORT_NEED', supporter)!;
    expect(p.options).toHaveLength(7);
    expect(p.options).not.toContain(SAFETY);
    expect(p.text).not.toContain(SAFETY);
    const numbered = p.text.split('\n').filter(l => /^\d+\. /.test(l));
    expect(numbered).toEqual(p.options!.map((o, i) => `${i + 1}. ${o}`));
    expect(p.text.startsWith(supporter ? 'What would they like help with?' : 'What would you like help with?')).toBe(true);
  });

  test('visibleFirstOptions leaves Safety out', () => {
    expect(visibleFirstOptions().map(o => o.id)).not.toContain('safety');
    expect(visibleFirstOptions()).toHaveLength(7);
  });

  test('2 is now food, clothes or other everyday things, not the Safety route', () => {
    const r = processInput(sessionAt('B5_MAIN_SUPPORT_NEED'), '2');
    expect(r.stateUpdates.currentGate).toBe('B5_SECOND_SCREEN');
    expect(r.stateUpdates.v4Option).toBe('everyday');
  });

  test('typing the Safety label does not reach the Safety route', () => {
    const r = processInput(sessionAt('B5_MAIN_SUPPORT_NEED'), SAFETY);
    expect(r.stateUpdates.currentGate).not.toBe('SAFETY_TYPE_OF_HARM');
  });

  test('the last option is still reachable by its new number', () => {
    const r = processInput(sessionAt('B5_MAIN_SUPPORT_NEED'), '7');
    expect(r.stateUpdates.v4Option).toBe('not-sure');
  });

  test('the crisis question is unchanged', () => {
    const p = getPhrase('GATE0_CRISIS_DANGER', false)!;
    expect(p.options).toContain('Domestic abuse');
    expect(p.options).toHaveLength(7);
  });
});

describe('Safety route switch on', () => {
  beforeEach(() => {
    process.env.VA_SAFETY_ROUTE = 'on';
  });

  test('the first question offers Safety second, and 2 reaches the route', () => {
    const p = getPhrase('B5_MAIN_SUPPORT_NEED', false)!;
    expect(p.options).toHaveLength(8);
    expect(p.options![1]).toBe(SAFETY);
    const r = processInput(sessionAt('B5_MAIN_SUPPORT_NEED'), '2');
    expect(r.stateUpdates.currentGate).toBe('SAFETY_TYPE_OF_HARM');
  });

  test('any other value counts as off', () => {
    process.env.VA_SAFETY_ROUTE = 'true';
    expect(getPhrase('B5_MAIN_SUPPORT_NEED', false)!.options).toHaveLength(7);
  });
});
