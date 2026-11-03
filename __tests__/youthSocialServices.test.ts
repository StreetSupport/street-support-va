// 16 and 17 year olds (Managing Director, 2 and 3 November 2026):
// - one plain question, on every housing route: in care, or in touch with a
//   social worker? It decides whether their worker or duty team comes first;
// - someone already involved and still looking is told, neutrally, that other
//   services can help too.

import type { SessionState } from '../lib/types';
import { createSession, processInput } from '../lib/stateMachine';
import { getPhrase } from '../lib/phrasebank';

function sessionAt(gate: SessionState['currentGate'], profile: Partial<SessionState> = {}): SessionState {
  return { ...createSession('test'), currentGate: gate, ...profile };
}

const housing16 = (profile: Partial<SessionState> = {}) => ({
  localAuthority: 'Wolverhampton',
  supportNeed: 'Emergency Housing',
  ...profile,
});

describe('16 and 17: in care or a social worker, asked on every housing route', () => {
  test.each(['QUICK', 'FULL'] as const)('on the %s route, a 16 year old is asked once their age is known', routeType => {
    const result = processInput(sessionAt('B5_PROFILE_AGE', housing16({ routeType })), '2');
    expect(result.stateUpdates.currentGate).toBe('B5_YOUTH_SOCIAL_SERVICES');
    expect(result.text).toBe('Are you in care, or in touch with a social worker at the moment?');
    expect(result.options).toEqual(['Yes', 'No', 'Not sure', 'Prefer not to say']);
  });

  test('a supporter is asked about the young person', () => {
    const result = processInput(sessionAt('B5_PROFILE_AGE', housing16({ isSupporter: true })), '2');
    expect(result.text).toBe('Are they in care, or in touch with a social worker at the moment?');
  });

  test('an adult is not asked, and goes straight to the homelessness question', () => {
    const result = processInput(sessionAt('B5_PROFILE_AGE', housing16()), '4'); // 25 or over
    expect(result.stateUpdates.currentGate).toBe('B6_HOMELESSNESS_STATUS');
  });

  test('the answer is kept, and not sure or prefer not to say store nothing', () => {
    const at = () => sessionAt('B5_YOUTH_SOCIAL_SERVICES', housing16({ ageCategory: '16-17' }));
    expect(processInput(at(), '1').stateUpdates.socialServices).toBe('Yes');
    expect(processInput(at(), '2').stateUpdates.socialServices).toBe('No');
    expect(processInput(at(), '3').stateUpdates.socialServices).toBeNull();
    expect(processInput(at(), '4').stateUpdates.socialServices).toBeNull();
    expect(processInput(at(), '1').stateUpdates.currentGate).toBe('B6_HOMELESSNESS_STATUS');
  });

  test('the full route does not ask the old social services questions again', () => {
    const session = sessionAt('C3Q10_LGBTQ', housing16({
      routeType: 'FULL', ageCategory: '16-17', detailedAge: '16-17', homeless: true,
      socialServices: 'Yes', youthSocialServicesAsked: true,
    }));
    const result = processInput(session, '2'); // not LGBTQ+
    expect(result.stateUpdates.currentGate).toBe('TERMINAL_ADDITIONAL_NEEDS');
  });

  test('an 18-20 year old on the full route is still asked the care questions', () => {
    const session = sessionAt('C3Q10_LGBTQ', housing16({
      routeType: 'FULL', ageCategory: '18-24', detailedAge: '18-20', homeless: true,
    }));
    const result = processInput(session, '2');
    expect(result.stateUpdates.currentGate).toBe('C3Q11_CURRENTLY_IN_CARE');
  });

  test('the supporter variant exists for the question', () => {
    expect(getPhrase('B5_YOUTH_SOCIAL_SERVICES', true)?.options).toContain('Prefer not to say');
  });
});

describe('16 and 17 already involved and still looking for help', () => {
  const resultsFor = (socialServices: string | null) => processInput(
    sessionAt('B7_HOMELESS_SLEEPING_SITUATION', housing16({
      routeType: 'QUICK', ageCategory: '16-17', homeless: true, socialServices,
    })),
    '3' // sofa surfing
  ).text;

  test('they see their Children\'s Services first, then a neutral line that other services can help too', () => {
    const text = resultsFor('Yes');
    const line = 'If you need something different, or more help alongside that, these can help too.';
    expect(text).toContain(line);
    expect(text.indexOf('Wolverhampton Children\'s Services')).toBeLessThan(text.indexOf(line));
  });

  test('someone not involved does not see that line', () => {
    expect(resultsFor('No')).not.toContain('something different');
    expect(resultsFor(null)).not.toContain('something different');
  });
});
