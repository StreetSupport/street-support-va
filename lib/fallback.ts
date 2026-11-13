/**
 * The server's fallback: the fixed text, with the person's council where the
 * area is already known. Council numbers come from
 * housing-pathway-endpoints.json (Housing Pathway Endpoints Contract).
 */
import endpointsData from './data/housing-pathway-endpoints.json';
import { buildFallbackText, type HousingOptions } from './fallbackText';

export type FallbackContext = {
  localAuthority?: string | null;
  safeguardingType?: string | null;
  isSupporter?: boolean;
} | null;

export function buildFallbackMessage(context: FallbackContext): string {
  const key = (context?.localAuthority || '').toLowerCase().replace(/\s+/g, '');
  const entry = key
    ? (endpointsData as Record<string, { housingOptions?: HousingOptions }>)[key]
    : undefined;
  return buildFallbackText(entry?.housingOptions || null, {
    isSupporter: context?.isSupporter === true,
    selfHarm: context?.safeguardingType === 'SELF_HARM',
  });
}
