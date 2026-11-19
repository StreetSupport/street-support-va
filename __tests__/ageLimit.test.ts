/**
 * Age and matched services.
 *
 * Before this fix, a service tagged for young people was hidden from anyone
 * over 24, and one tagged for older people from anyone under 25. A tag says
 * who a service is designed for, not who it is only for. The Service
 * Matching Contract allows an age exclusion only on an explicitly stated
 * limit (hard gate A), and where it is unclear, the service is shown.
 */
import { matchesStatedAgeLimit } from '../lib/serviceMatcher';

describe('Age: a service is hidden only by an explicitly stated limit', () => {
  test('someone aged 25 or over is shown a service designed for young people', () => {
    expect(matchesStatedAgeLimit(['Young People'], '25+')).toBe(true);
  });

  test('someone aged 18 to 24 is shown a service designed for older people', () => {
    expect(matchesStatedAgeLimit(['Older people'], '18-24')).toBe(true);
  });

  test('someone aged 18 to 24 is shown a service for 16 to 25 year olds only', () => {
    expect(matchesStatedAgeLimit(['16-25 only'], '18-24')).toBe(true);
  });

  test('someone aged 50 or over is not shown a service for 16 to 25 year olds only', () => {
    expect(matchesStatedAgeLimit(['16-25 only'], '50+')).toBe(false);
  });

  test('someone in the 25+ band is still shown a 16 to 25 only service, because they may be 25', () => {
    expect(matchesStatedAgeLimit(['16-25 only'], '25+')).toBe(true);
  });

  test('someone who has not given their age is never hidden from a service by age', () => {
    expect(matchesStatedAgeLimit(['16-25 only'], null)).toBe(true);
  });
});
