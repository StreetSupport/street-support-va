// Safety from harm route (Safeguarding Contract 3.3; Service Matching and
// Questions Design Note 3.6). Hard-coded, outside the crisis gate, bypasses the
// matcher and AI.

import type { GateType, SessionState } from '../lib/types';
import { createSession, processInput, interceptUnder16Age } from '../lib/stateMachine';
import { getPhrase } from '../lib/phrasebank';
import { startSafetyRoute, parseSafetyChoice, isSafetyGate } from '../lib/handlers/safety';

function sessionAt(gate: GateType, extra: Partial<SessionState> = {}): SessionState {
  return { ...createSession('test'), currentGate: gate, ...extra };
}

// Walk the route: type of harm, then OK to carry on.
function walk(harmOption: number, okOption: number, extra: Partial<SessionState> = {}) {
  let s = sessionAt('SAFETY_TYPE_OF_HARM', extra);
  const r1 = processInput(s, String(harmOption));
  s = { ...s, ...r1.stateUpdates };
  const r2 = processInput(s, String(okOption));
  return { first: r1, result: r2, session: { ...s, ...r2.stateUpdates } };
}

describe('Safety from harm route', () => {
  test('starts with the type of harm, with 999 shown first', () => {
    const r = startSafetyRoute(createSession('test'));
    expect(r.stateUpdates?.currentGate).toBe('SAFETY_TYPE_OF_HARM');
    expect(r.text.indexOf('999')).toBeGreaterThanOrEqual(0);
    expect(r.text.indexOf('999')).toBeLessThan(r.text.indexOf('Which of these'));
  });

  test('the person chooses one type of harm, then is asked if they are OK to carry on', () => {
    const { first } = walk(1, 1);
    expect(first.stateUpdates?.currentGate).toBe('SAFETY_OK_TO_CONTINUE');
  });

  test('the crisis gate gains no option', () => {
    expect(getPhrase('GATE0_CRISIS_DANGER', false)?.options).toEqual([
      'Immediate physical danger',
      'Under 16 and need protection',
      'Thoughts of harming myself',
      'Domestic abuse',
      'Sexual violence',
      'Lost home due to fire, flood, or emergency',
      'None of these apply',
    ]);
  });

  test.each([
    [1, 'someone close'],
    [2, 'pressure to marry'],
    [3, 'cutting'],
  ])('domestic abuse option %i (%s): OK to carry on goes into the crisis gate domestic abuse flow', (opt) => {
    expect(walk(opt, 1).result.stateUpdates?.currentGate).toBe('DV_GENDER_ASK');
  });

  test.each([1, 2, 3])('domestic abuse option %i: show me help now shows help at once, with no questions', (opt) => {
    const { result, session } = walk(opt, 2);
    expect(result.sessionEnded).toBe(true);
    expect(result.options).toBeUndefined();
    expect(session.safeguardingType).toBe('DOMESTIC_ABUSE');
    expect(result.text.indexOf('999')).toBeLessThan(result.text.indexOf('National Domestic Violence Helpline'));
    for (const l of ['National Domestic Violence Helpline', 'ManKind Initiative', 'Galop']) expect(result.text).toContain(l);
    expect(result.text.indexOf('Galop')).toBeLessThan(result.text.indexOf('Shelter - Domestic Violence Advice'));
  });

  test('domestic abuse help now includes the local domestic abuse organisation where the area is known', () => {
    const { result } = walk(1, 2, { localAuthority: 'Wolverhampton' });
    expect(result.text).toContain('LOCAL DOMESTIC ABUSE SUPPORT');
  });

  test('a supporter sees third-person wording on the help-now exits', () => {
    for (const opt of [1, 4]) {
      const { result } = walk(opt, 2, { userType: 'SUPPORTER', isSupporter: true });
      expect(result.text).toContain('If they are in immediate danger');
      expect(result.text).toContain('They can choose who to contact');
    }
  });

  test('sexual violence: OK to carry on goes into the crisis gate sexual violence flow', () => {
    expect(walk(4, 1).result.stateUpdates?.currentGate).toBe('SA_GENDER_ASK');
  });

  test('sexual violence: show me help now shows every line and the local SARC, with no questions', () => {
    const { result, session } = walk(4, 2);
    expect(result.sessionEnded).toBe(true);
    expect(session.safeguardingType).toBe('SEXUAL_VIOLENCE');
    for (const l of ['Rape Crisis', 'SurvivorsUK', 'Galop', 'SEXUAL ASSAULT REFERRAL CENTRE']) expect(result.text).toContain(l);
    expect(result.text.indexOf('999')).toBeLessThan(result.text.indexOf('Rape Crisis'));
  });

  test('the options describe situations without naming the harm', () => {
    const opts = [false, true].flatMap(sup => getPhrase('SAFETY_TYPE_OF_HARM', sup)?.options ?? []);
    for (const o of opts) expect(/FGM|mutilation|forced marriage|sexual assault|rape|domestic abuse|slavery|trafficking/i.test(o)).toBe(false);
  });

  test('each option starts with different words, for voice control', () => {
    for (const sup of [false, true]) {
      const first = (getPhrase('SAFETY_TYPE_OF_HARM', sup)?.options ?? []).map(o => o.split(' ')[0]);
      expect(new Set(first).size).toBe(first.length);
    }
  });

  test.each([5, 6])('modern slavery option %i shows 999 first, then the 24/7 line before the line that closes overnight', (opt) => {
    const { result, session } = walk(opt, 2);
    expect(result.sessionEnded).toBe(true);
    expect(session.safeguardingType).toBe('MODERN_SLAVERY');
    expect(result.text.indexOf('999')).toBeLessThan(result.text.indexOf('Salvation Army'));
    expect(result.text.indexOf('Salvation Army')).toBeLessThan(result.text.indexOf('Modern Slavery & Exploitation Helpline'));
    expect(result.text).toContain('not overnight');
  });

  test('the new exits offer a way back', () => {
    expect(walk(5, 1).result.text).toContain("I'm here");
    expect(walk(7, 1).result.text).toContain("I'm here");
  });

  test('a supporter sees third-person wording on the modern slavery exit', () => {
    const { result } = walk(5, 1, { userType: 'SUPPORTER', isSupporter: true });
    expect(result.text).toContain('If they are in immediate danger');
  });

  test('if the chosen harm is somehow missing, the person still gets every line', () => {
    const s = sessionAt('SAFETY_OK_TO_CONTINUE', { safetyHarm: null });
    const r = processInput(s, '1');
    expect(r.sessionEnded).toBe(true);
    expect(r.text).toContain('National Domestic Violence Helpline');
  });

  test('domestic abuse followed through: the exit marks the session as a domestic abuse safeguarding exit', () => {
    let { session } = walk(1, 1);
    // Female, then no children: everyone is asked about children (children restoration, bcbc536)
    let r = processInput(session, '1');
    session = { ...session, ...r.stateUpdates };
    r = processInput(session, '2');
    expect(r.sessionEnded).toBe(true);
    expect(r.stateUpdates?.safeguardingTriggered).toBe(true);
    expect(r.stateUpdates?.safeguardingType).toBe('DOMESTIC_ABUSE');
    expect(r.text).toContain('999');
  });

  test('sexual assault followed through: the exit marks the session and shows the local SARC', () => {
    const { session } = walk(4, 1);
    // Prefer not to say: reaches the open gap (no general exit yet where gender
    // is not given); this test checks only that the exit is marked and shows the SARC.
    const r = processInput(session, '4');
    expect(r.sessionEnded).toBe(true);
    expect(r.stateUpdates?.safeguardingType).toBe('SEXUAL_VIOLENCE');
    expect(r.text).toContain('SEXUAL ASSAULT REFERRAL CENTRE');
  });

  test('something else shows every line on the route, 999 first, and the person chooses', () => {
    const { result, session } = walk(7, 1);
    expect(result.sessionEnded).toBe(true);
    expect(session.safeguardingType).toBe('SAFETY_GENERAL');
    for (const l of ['National Domestic Violence Helpline', 'Rape Crisis', 'Modern Slavery & Exploitation Helpline', 'Salvation Army']) {
      expect(result.text).toContain(l);
    }
    expect(result.text.indexOf('999')).toBeLessThan(result.text.indexOf('National Domestic Violence Helpline'));
  });

  test('an unclear answer asks again rather than guessing', () => {
    const s = sessionAt('SAFETY_TYPE_OF_HARM');
    expect(processInput(s, '99').stateUpdates?.currentGate).toBe('SAFETY_TYPE_OF_HARM');
  });

  test.each([
    ['I was made to have sex'],
    ['someone raped me'],
    ['he forced me to have sex'],
    ['1 and 4'],
    [''],
    ['   '],
  ])('free text "%s" is never read as a choice: the person is asked to choose', (text) => {
    const s = sessionAt('SAFETY_TYPE_OF_HARM');
    expect(parseSafetyChoice(text, getPhrase('SAFETY_TYPE_OF_HARM', false)?.options)).toBeNull();
    expect(processInput(s, text).stateUpdates?.currentGate).toBe('SAFETY_TYPE_OF_HARM');
  });

  test('a button number or the exact option text is a choice', () => {
    const opts = getPhrase('SAFETY_TYPE_OF_HARM', false)?.options;
    expect(parseSafetyChoice('4', opts)).toBe(4);
    expect(parseSafetyChoice(' sexual things were done to me without my agreement ', opts)).toBe(4);
  });

  test('both Safety gates are marked, so the chat route keeps the AI and the general escalation off them', () => {
    expect(isSafetyGate('SAFETY_TYPE_OF_HARM')).toBe(true);
    expect(isSafetyGate('SAFETY_OK_TO_CONTINUE')).toBe(true);
    expect(isSafetyGate('GATE1_INTENT')).toBe(false);
  });

  test('a supporter sees third-person wording', () => {
    const r = startSafetyRoute({ ...createSession('test'), isSupporter: true });
    expect(r.text).toContain('If they are in danger');
  });

  test('an explicit under-16 disclosure on the route goes to the under-16 exit', () => {
    const s = sessionAt('SAFETY_TYPE_OF_HARM');
    const r = interceptUnder16Age(s, "I'm 14");
    expect(r).not.toBeNull();
    expect(r!.stateUpdates?.safeguardingType).toBe('UNDER_16');
  });

  test('there is no reporting option', () => {
    for (const key of ['SAFETY_TYPE_OF_HARM', 'SAFETY_OK_TO_CONTINUE']) {
      const opts = getPhrase(key, false)?.options ?? [];
      expect(opts.some(o => /report/i.test(o))).toBe(false);
    }
  });
});
