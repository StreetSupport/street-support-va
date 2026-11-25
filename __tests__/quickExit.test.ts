// Quick exit ("Exit this page"): "Quick exit: proposal for review",
// Managing Director, 19 November 2026.

import type { SessionState } from '../lib/types';
import { createSession, processInput } from '../lib/stateMachine';
import { QUICK_EXIT_NOTE } from '../lib/phrasebank';
import { EXIT_REPLACE_URL, EXIT_REPLACES_HISTORY, EXIT_URL, createShiftCounter, performExit, shouldReloadOnPageShow } from '../lib/quickExit';

function sessionAt(gate: SessionState['currentGate'], over: Partial<SessionState> = {}): SessionState {
  return { ...createSession('test'), currentGate: gate, localAuthority: 'Wolverhampton', ...over };
}

describe('Exit this page: what happens on press', () => {
  test('someone pressing exit has the screen covered, the conversation cleared and requests cancelled before the tab leaves', () => {
    const order: string[] = [];
    let went: string | null = null;
    performExit({
      cover: () => order.push('cover'),
      cancelRequests: () => order.push('cancel'),
      clear: () => order.push('clear'),
      navigate: (url) => { order.push('navigate'); went = url; },
    });
    expect(order).toEqual(['cover', 'cancel', 'clear', 'navigate']);
    expect(went).toBe(EXIT_URL);
  });

  test('the tab still leaves if clearing the conversation fails', () => {
    let went = false;
    performExit({
      cover: () => { throw new Error('no body'); },
      cancelRequests: () => { throw new Error('nothing to cancel'); },
      clear: () => { throw new Error('state error'); },
      navigate: () => { went = true; },
    });
    expect(went).toBe(true);
  });

  test('people are sent to BBC Weather, a page that is the same for everyone', () => {
    expect(EXIT_URL).toBe('https://www.bbc.co.uk/weather');
  });

  test('BBC Weather opens in a new tab, and this tab is replaced with a weather search, out of its history', () => {
    const calls: string[] = [];
    performExit({
      cover: () => {}, cancelRequests: () => {}, clear: () => {},
      openTab: (url) => calls.push(`open ${url}`),
      navigate: (url, replace) => calls.push(`${replace ? 'replace' : 'go'} ${url}`),
    });
    expect(EXIT_REPLACES_HISTORY).toBe(true);
    expect(calls).toEqual([`open ${EXIT_URL}`, `replace ${EXIT_REPLACE_URL}`]);
  });

  test('if the new tab is blocked, this tab still leaves', () => {
    let went: string | null = null;
    performExit({
      cover: () => {}, cancelRequests: () => {}, clear: () => {},
      openTab: () => { throw new Error('blocked'); },
      navigate: (url) => { went = url; },
    });
    expect(went).toBe(EXIT_REPLACE_URL);
  });

  test('a page restored from the browser cache, for example on Back, reloads empty', () => {
    expect(shouldReloadOnPageShow(true)).toBe(true);
    expect(shouldReloadOnPageShow(false)).toBe(false);
  });
});

describe('Exit this page: Shift three times', () => {
  test('someone pressing Shift three times within five seconds leaves', () => {
    const c = createShiftCounter();
    expect(c.onKeyDown('Shift', 0)).toBe(false);
    expect(c.onKeyDown('Shift', 800)).toBe(false);
    expect(c.onKeyDown('Shift', 1600)).toBe(true);
  });

  test('someone typing capitals at normal speed does not trigger it', () => {
    const c = createShiftCounter();
    // "I Need Help": Shift, then a letter, each time
    const keys = ['Shift', 'I', ' ', 'Shift', 'N', 'e', 'e', 'd', ' ', 'Shift', 'H', 'e', 'l', 'p'];
    expect(keys.map((k, i) => c.onKeyDown(k, i * 150)).some(Boolean)).toBe(false);
  });

  test('presses more than five seconds apart do not add up', () => {
    const c = createShiftCounter();
    c.onKeyDown('Shift', 0);
    c.onKeyDown('Shift', 3000);
    expect(c.onKeyDown('Shift', 6000)).toBe(false);
  });

  test('holding Shift down counts once', () => {
    const c = createShiftCounter();
    c.onKeyDown('Shift', 0);
    expect(c.onKeyDown('Shift', 30, true)).toBe(false);
    expect(c.onKeyDown('Shift', 60, true)).toBe(false);
    expect(c.onKeyDown('Shift', 90, true)).toBe(false);
    expect(c.onKeyDown('Shift', 400)).toBe(false);
  });
});

describe('The safety note', () => {
  test('someone choosing Safety from harm is told how to leave quickly before the first question', () => {
    const r = processInput(sessionAt('B5_MAIN_SUPPORT_NEED', { routeType: 'QUICK' }), '2');
    expect(r.stateUpdates.currentGate).toBe('SAFETY_TYPE_OF_HARM');
    expect(r.text).toContain(QUICK_EXIT_NOTE);
    // 999 still comes first, and the question after the note
    expect(r.text.indexOf('999')).toBeLessThan(r.text.indexOf(QUICK_EXIT_NOTE));
    expect(r.text.indexOf(QUICK_EXIT_NOTE)).toBeLessThan(r.text.indexOf('Which of these'));
  });

  test('a supporter is shown the same note', () => {
    const r = processInput(sessionAt('B5_MAIN_SUPPORT_NEED', { routeType: 'QUICK', isSupporter: true, userType: 'SUPPORTER' }), '2');
    expect(r.text).toContain(QUICK_EXIT_NOTE);
  });

  test('someone at the domestic abuse exit is shown help first, then how to leave quickly', () => {
    const r = processInput(sessionAt('DV_CHILDREN_ASK', { dvGender: 'Female' }), '2');
    expect(r.sessionEnded).toBe(true);
    expect(r.text).toContain(QUICK_EXIT_NOTE);
    expect(r.text.indexOf('0808 2000 247')).toBeLessThan(r.text.indexOf(QUICK_EXIT_NOTE));
  });

  test('where an exit closes on its 999 line, that line stays last', () => {
    const r = processInput(sessionAt('DV_CHILDREN_ASK', { dvGender: 'Female', isSupporter: true, userType: 'SUPPORTER', localAuthority: null }), '2');
    expect(r.text).toContain(QUICK_EXIT_NOTE);
    expect(r.text.trim().endsWith("If they're in immediate danger, call 999.")).toBe(true);
  });

  test('someone at the sexual violence exit is shown help first, then how to leave quickly', () => {
    const r = processInput(sessionAt('SA_GENDER_ASK'), '2');
    expect(r.sessionEnded).toBe(true);
    expect(r.text).toContain(QUICK_EXIT_NOTE);
    expect(r.text.indexOf('SEXUAL VIOLENCE SUPPORT')).toBeGreaterThan(-1);
    expect(r.text.indexOf(QUICK_EXIT_NOTE)).toBeGreaterThan(r.text.indexOf('SEXUAL VIOLENCE SUPPORT'));
  });

  test('the note never promises the exit clears browsing history', () => {
    expect(QUICK_EXIT_NOTE).toContain('not your browsing history');
  });
});

describe('The safety note on every domestic abuse and sexual violence exit', () => {
  const audiences: Array<[string, Partial<SessionState>]> = [
    ['self', { isSupporter: false, userType: 'SELF' }],
    ['supporter', { isSupporter: true, userType: 'SUPPORTER' }],
    ['professional', { isSupporter: true, userType: 'PROFESSIONAL' }],
  ];
  const genders = ['1', '2', '3', '4']; // female, male, non-binary or other, prefer not to say
  const count = (text: string) => text.split(QUICK_EXIT_NOTE).length - 1;

  test('every exit shows the note exactly once, with and without local services', () => {
    const misses: string[] = [];
    for (const la of ['Wolverhampton', null]) {
      for (const [who, a] of audiences) {
        for (const g of genders) {
          const dvGender = ['Female', 'Male', 'Non-binary or other', 'Prefer not to say'][Number(g) - 1];
          for (const children of ['1', '2']) {
            const r = processInput(sessionAt('DV_CHILDREN_ASK', { ...a, dvGender, localAuthority: la }), children);
            if (count(r.text) !== 1) misses.push(`DV ${who} ${dvGender} children=${children} la=${la}`);
          }
          const sa = processInput(sessionAt('SA_GENDER_ASK', { ...a, localAuthority: la }), g);
          if (count(sa.text) !== 1) misses.push(`SA ${who} gender=${g} la=${la}`);
        }
      }
    }
    expect(misses).toEqual([]);
  });

  test('where nothing local follows the help, the 999 line stays last', () => {
    const misses: string[] = [];
    for (const [who, a] of audiences) {
      for (const g of genders) {
        const dvGender = ['Female', 'Male', 'Non-binary or other', 'Prefer not to say'][Number(g) - 1];
        for (const children of ['1', '2']) {
          const r = processInput(sessionAt('DV_CHILDREN_ASK', { ...a, dvGender, localAuthority: null }), children);
          const last = r.text.trim().split('\n').pop() ?? '';
          if (!/call 999\.?$/.test(last.trim())) misses.push(`DV ${who} ${dvGender} children=${children}`);
        }
      }
    }
    expect(misses).toEqual([]);
  });
});

describe('The safety note on the Safety route\'s help-now exits', () => {
  test.each([['DOMESTIC_ABUSE', '0808 2000 247'], ['SEXUAL_VIOLENCE', '0808 500 2222']])(
    'someone choosing help now for %s sees the help first, then how to leave quickly, with nothing asked in between',
    (harm: string, line: string) => {
      const r = processInput(sessionAt('SAFETY_OK_TO_CONTINUE', { safetyHarm: harm as SessionState['safetyHarm'] }), '2');
      expect(r.sessionEnded).toBe(true);
      expect(r.text.split(QUICK_EXIT_NOTE).length - 1).toBe(1);
      expect(r.text.indexOf('999')).toBeLessThan(r.text.indexOf(line));
      expect(r.text.indexOf(line)).toBeLessThan(r.text.indexOf(QUICK_EXIT_NOTE));
    },
  );
});
