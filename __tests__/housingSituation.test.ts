// The housing situation question (Managing Director, 3 November 2026).
// One question replaces "are you homeless" and the two where-are-you questions.
// Option 1 is prevention. Options 2 to 6 are crisis. Option 2 is crisis although
// the person is still in their home: the loss has materialised.

import type { SessionState } from '../lib/types';
import { createSession, processInput } from '../lib/stateMachine';
import { getPhrase } from '../lib/phrasebank';

function sessionAt(gate: SessionState['currentGate'], profile: Partial<SessionState> = {}): SessionState {
  return { ...createSession('test'), currentGate: gate, ...profile };
}

const adult = (profile: Partial<SessionState> = {}): Partial<SessionState> => ({
  localAuthority: 'Wolverhampton',
  supportNeed: 'Emergency Housing',
  ageCategory: '25 or over',
  routeType: 'QUICK',
  ...profile,
});

// Answer the housing situation question, then "not in touch with Housing Options"
function answer(option: string, profile: Partial<SessionState> = {}) {
  let session = sessionAt('B6_HOMELESSNESS_STATUS', adult(profile));
  const first = processInput(session, option);
  session = { ...session, ...first.stateUpdates } as SessionState;
  const second = processInput(session, '2');
  return { first, result: second, session: { ...session, ...second.stateUpdates } as SessionState };
}

describe('the housing situation question', () => {
  test('asks which situation is closest, with six answers', () => {
    const phrase = getPhrase('B6_HOMELESSNESS_STATUS', false);
    expect(phrase?.text).toContain('Which of these is closest to your housing situation at the moment?');
    expect(phrase?.options).toHaveLength(6);
    expect(phrase?.options?.[3]).toBe('Leaving prison or hospital with nowhere to go');
  });

  test('each option starts with different words, for voice control', () => {
    for (const supporter of [false, true]) {
      const starts = (getPhrase('B6_HOMELESSNESS_STATUS', supporter)?.options || []).map(o => o.split(' ').slice(0, 2).join(' '));
      expect(new Set(starts).size).toBe(6);
    }
  });

  test('a supporter is asked about the person they are helping', () => {
    const phrase = getPhrase('B6_HOMELESSNESS_STATUS', true);
    expect(phrase?.text).toContain('closest to their housing situation');
    expect(phrase?.options?.[1]).toBe('About to lose their home, like an eviction date or being told to leave');
  });

  test.each([
    ['1', 'KEEP_STEADY'], ['2', 'LOSING_HOME'], ['3', 'STAYING_SOMEWHERE'],
    ['4', 'LEAVING_INSTITUTION'], ['5', 'NOWHERE_TONIGHT'], ['6', 'NOT_SURE'],
  ])('answer %s is kept and goes on to the Housing Options question', (option, situation) => {
    const result = processInput(sessionAt('B6_HOMELESSNESS_STATUS', adult()), option);
    expect(result.stateUpdates.housingSituation).toBe(situation);
    expect(result.stateUpdates.currentGate).toBe('HOUSING_OPTIONS_INVOLVEMENT_ASK');
  });

  test('not sure makes no assumption about being homeless', () => {
    const result = processInput(sessionAt('B6_HOMELESSNESS_STATUS', adult()), '6');
    expect(result.stateUpdates.homeless).toBeNull();
    expect(result.stateUpdates.sleepingSituation).toBeNull();
  });
});

describe('someone who wants help to keep things steady', () => {
  test('goes to the prevention questions', () => {
    const { result } = answer('1');
    expect(result.stateUpdates.currentGate).toBe('B7B_PREVENTION_REASON');
    expect(result.stateUpdates.preventionNeed).toBe(true);
  });
});

describe('someone about to lose their home', () => {
  test('sees Housing Options first, told to contact them as soon as they can', () => {
    const text = answer('2').result.text;
    expect(text.indexOf('YOUR FIRST STEP')).toBeLessThan(text.indexOf('LOCAL HOUSING ADVICE'));
    expect(text).toContain('They can help when you\'re about to lose your home, so it\'s best to contact them as soon as you can.');
  });

  test('sees local housing advice and Shelter, but not the adult housing navigator or StreetLink', () => {
    const text = answer('2').result.text;
    expect(text).toContain('LOCAL HOUSING ADVICE');
    expect(text).toContain('Shelter');
    expect(text).not.toContain('P3 Wolverhampton');
    expect(text).not.toContain('StreetLink');
  });

  test('a young adult still sees the young people\'s route', () => {
    const text = answer('2', { ageCategory: '18-24' }).result.text;
    expect(text).toContain('Young Persons Team');
    expect(text).not.toContain('P3 Wolverhampton');
  });

  test('on the full route, skips how long this has been going on and goes to the reason', () => {
    expect(answer('2', { routeType: 'FULL' }).result.stateUpdates.currentGate).toBe('B9_REASON');
  });
});

describe('someone who has already lost their home, or is not sure', () => {
  test('staying somewhere for now: results with the housing navigator, no StreetLink', () => {
    const text = answer('3').result.text;
    expect(text).toContain('P3 Wolverhampton');
    expect(text).not.toContain('StreetLink');
    expect(text).not.toContain('LOCAL HOUSING ADVICE');
  });

  test('leaving prison or hospital: told they can ask the staff to refer them', () => {
    const text = answer('4').result.text;
    expect(text).toContain('If you\'re still in prison or hospital, you can ask the staff there to refer you to the council\'s housing team.');
  });

  test('a supporter is told the person can ask the staff to refer them', () => {
    const text = answer('4', { isSupporter: true }).result.text;
    expect(text).toContain('If they\'re still in prison or hospital, they can ask the staff there to refer them to the council\'s housing team.');
  });

  test('sleeping rough or nowhere tonight: StreetLink is shown, and it is urgent', () => {
    const text = answer('5').result.text;
    expect(text).toContain('OUTREACH SUPPORT');
    expect(text).toContain('https://streetlink.org.uk');
    expect(text).toContain('nowhere to stay tonight - this is urgent');
  });

  test('not sure: Housing Options, the navigator and Shelter, without StreetLink', () => {
    const text = answer('6').result.text;
    expect(text).toContain('YOUR FIRST STEP');
    expect(text).toContain('P3 Wolverhampton');
    expect(text).toContain('Shelter');
    expect(text).not.toContain('StreetLink');
    expect(text).not.toContain('homelessness assessment');
  });

  test.each(['3', '4', '5', '6'])('on the full route, answer %s goes on to how long this has been going on', option => {
    expect(answer(option, { routeType: 'FULL' }).result.stateUpdates.currentGate).toBe('B8_DURATION');
  });
});

describe('someone keeping things steady who then says they have been told to leave', () => {
  // Answer 1 at the housing situation question, then the prevention reason.
  function preventionReason(option: string, profile: Partial<SessionState> = {}) {
    const { session } = answer('1', profile);
    return processInput(session, option);
  }

  test.each([
    ['2', 'Eviction notice'], ['4', 'Family/friends notice'],
  ])('answer %s goes to the about-to-lose-home results', (option, reason) => {
    const result = preventionReason(option);
    expect(result.stateUpdates.housingSituation).toBe('LOSING_HOME');
    expect(result.stateUpdates.preventionNeed).toBe(false);
    expect(result.stateUpdates.preventionReason).toBe(reason);
    expect(result.text).toContain('They can help when you\'re about to lose your home, so it\'s best to contact them as soon as you can.');
    expect(result.text).toContain('LOCAL HOUSING ADVICE');
    expect(result.text).not.toContain('P3 Wolverhampton');
  });

  test.each(['2', '4'])('on the full route, answer %s goes on to the reason, as for anyone about to lose their home', option => {
    expect(preventionReason(option, { routeType: 'FULL' }).stateUpdates.currentGate).toBe('B9_REASON');
  });

  test.each(['1', '3', '5', '6'])('answer %s stays on the prevention questions', option => {
    expect(preventionReason(option).stateUpdates.currentGate).toBe('B7C_PREVENTION_URGENCY');
  });
});
