/**
 * Fallback: when the assistant cannot carry on, the person still leaves with
 * routes that work at that time of day (AI Usage Boundaries Contract).
 */
import endpointsData from '../lib/data/housing-pathway-endpoints.json';
import { buildFallbackMessage } from '../lib/fallback';
import { buildFallbackText } from '../lib/fallbackText';

const wolverhampton = (endpointsData as Record<string, { housingOptions: { phone: string; phoneOOH: string } }>).wolverhampton.housingOptions;

describe('fallback when the assistant cannot carry on', () => {
  test('someone in Wolverhampton sees their council and its out-of-hours line', () => {
    const text = buildFallbackMessage({ localAuthority: 'Wolverhampton' });
    expect(text).toContain(wolverhampton.phone);
    expect(text).toContain(wolverhampton.phoneOOH);
  });

  test('someone whose area is not yet known is told to call their council out of hours', () => {
    const text = buildFallbackMessage(null);
    expect(text).toMatch(/out-of-hours line/);
  });

  test('everyone sees Shelter with its hours, StreetLink and 999', () => {
    for (const text of [buildFallbackMessage(null), buildFallbackMessage({ localAuthority: 'Walsall' })]) {
      expect(text).toContain('0808 800 4444');
      expect(text).toMatch(/closed at weekends/);
      expect(text).toContain('streetlink.org.uk');
      expect(text).toContain('999');
    }
  });

  test('Samaritans shows only where the conversation involved self-harm', () => {
    expect(buildFallbackMessage({ safeguardingType: 'SELF_HARM' })).toContain('116 123');
    expect(buildFallbackMessage({ safeguardingType: 'DOMESTIC_ABUSE' })).not.toContain('116 123');
  });

  test('the widget\'s own fallback, used when the server cannot be reached, carries the same routes', () => {
    expect(buildFallbackText(null)).toBe(buildFallbackMessage(null));
  });
});
