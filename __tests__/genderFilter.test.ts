/**
 * Gender filtering of matched services.
 *
 * Before this fix the filter matched substrings, so "female" counted as
 * "male" and every "Female only" service also counted as men-only. Women
 * were hidden from women's services, and men were hidden from services that
 * only mentioned pregnancy or mothers.
 *
 * A service is now restricted only by the platform's "Female only" or
 * "Male only" label, or by a description that opens with that wording.
 * A name alone never restricts: a women's organisation may run services for
 * men (Service Matching Contract: restriction must be explicit, not implied).
 */
import { getServicesForNeed, getServicesByCategory, filterByProfile, hasConflictingGenderLabels } from '../lib/serviceMatcher';
import servicesData from '../lib/data/wmca_services_v7.json';
import type { UserProfile } from '../lib/types';

type AnyService = { name: string; description: string; client_groups?: string[] };
type Service = Parameters<typeof filterByProfile>[0][number];
const allServices = (servicesData as unknown as { services: Service[] }).services;
// A full profile with every answer unset, so each test states only what it needs.
const profile = (answers: Partial<UserProfile>): UserProfile => ({
  localAuthority: null, supportNeed: null, gender: null, ageCategory: null, lgbtq: null,
  criminalConvictions: null, hasChildren: null, sleepingSituation: null, mentalHealth: null, physicalHealth: null,
  ...answers,
});

const names = (list: { name: string }[]) => list.map(s => s.name);
const wolverhampton = (gender: string | null) => profile({ localAuthority: 'Wolverhampton', ageCategory: '25+', gender });
// Five services carry both labels. A contradiction restricts nothing, so they are left out here.
const labelled = (label: string) => allServices.filter(s => {
  const g = s.client_groups || [];
  return g.includes(label) && !(g.includes('Female only') && g.includes('Male only'));
});
const findService = (namePrefix: string, test: (s: AnyService) => boolean = () => true) =>
  allServices.find(s => s.name.startsWith(namePrefix) && test(s))!;
const shownTo = (service: AnyService, gender: string) =>
  filterByProfile([service as unknown as Service], profile({ gender })).length === 1;

describe('Gender filter: services are restricted only by what they explicitly state', () => {

  test('a woman in Wolverhampton looking for activities is shown the Women and Families Resource Centre', () => {
    const shown = names(getServicesForNeed('Activities', wolverhampton('Female')));
    expect(shown).toContain('The Women and Families Resource Centre (WFRC)');
  });

  test('a woman sees the same activities as someone who skipped the gender question', () => {
    const skipped = names(getServicesForNeed('Activities', wolverhampton(null)));
    const woman = names(getServicesForNeed('Activities', wolverhampton('Female')));
    expect(woman).toEqual(skipped);
  });

  test('across every council and need, a man is never shown a service labelled female only', () => {
    // Matched results carry no labels, so check each result against its source record
    const femaleOnly = new Set(labelled('Female only').map(s => `${s.name}|${s.description}`));
    const councils = ['Wolverhampton', 'Coventry', 'Birmingham', 'Walsall', 'Solihull', 'Dudley', 'Sandwell'];
    for (const localAuthority of councils) {
      // Need names as the VA passes them (B5_MAIN_SUPPORT_NEED), where gender is asked
      for (const need of ['Activities', 'Drop In', 'Health']) {
        const shown = getServicesForNeed(need, profile({ localAuthority, ageCategory: '25+', gender: 'Male' }));
        expect(shown.some(s => femaleOnly.has(`${s.name}|${s.description}`))).toBe(false);
      }
    }
  });

  test('in Wolverhampton activities, a woman is excluded from the men-only listings that someone who skipped gender is offered', () => {
    // Full category retrieval before ranking: the top five shown never happen to include a men-only listing,
    // so this checks the exclusion at the matching stage itself
    const offered = getServicesByCategory('Wolverhampton', ['activities']);
    const menOnlyOffered = offered.filter(s => (s.client_groups || []).includes('Male only') && !(s.client_groups || []).includes('Female only'));
    expect(menOnlyOffered.length).toBeGreaterThan(0);
    const toWoman = filterByProfile(offered, profile({ gender: 'Female' }));
    const toSkipped = filterByProfile(offered, profile({ gender: null }));
    expect(toWoman.some(s => menOnlyOffered.includes(s))).toBe(false);
    expect(menOnlyOffered.every(s => toSkipped.includes(s))).toBe(true);
  });

  test('a description opening with a women only session does not restrict the whole service', () => {
    const service = { name: 'Example community centre', description: 'Women only sessions are available on Tuesdays. Other sessions are open to everyone.', client_groups: [] };
    expect(shownTo(service, 'Male')).toBe(true);
  });

  test('a description opening with a men only group does not restrict the whole service', () => {
    const service = { name: 'Example hub', description: 'Men only group on Thursday evenings; the hub is open to all.', client_groups: [] };
    expect(shownTo(service, 'Female')).toBe(true);
  });

  test('the listings labelled both female only and male only are exactly the known ones, so any new contradiction is seen', () => {
    // Known contradictions, to be corrected at source. A new one fails this test.
    const conflicting = Array.from(new Set(allServices.filter(s => hasConflictingGenderLabels(s)).map(s => s.name))).sort();
    expect(conflicting).toEqual([
      'Changing Lives - IRIS Project Sexual exploitation, sex work and sexual violence support',
      'Cranstoun Housing Support [Birmingham]',
      'Trident Reach',
    ].sort());
  });

  test('a service labelled both female only and male only is shown to everyone', () => {
    const both = allServices.find(s => (s.client_groups || []).includes('Female only') && (s.client_groups || []).includes('Male only'))!;
    expect(both).toBeDefined();
    expect(shownTo(both, 'Male')).toBe(true);
    expect(shownTo(both, 'Female')).toBe(true);
  });

  test('a woman is shown every service labelled female only, and a man none of them', () => {
    const femaleOnly = labelled('Female only');
    expect(femaleOnly.length).toBeGreaterThan(0);
    expect(femaleOnly.every(s => shownTo(s, 'Female'))).toBe(true);
    expect(femaleOnly.some(s => shownTo(s, 'Male'))).toBe(false);
  });

  test('a man is shown every service labelled male only, and a woman none of them', () => {
    const maleOnly = labelled('Male only');
    expect(maleOnly.length).toBeGreaterThan(0);
    expect(maleOnly.every(s => shownTo(s, 'Male'))).toBe(true);
    expect(maleOnly.some(s => shownTo(s, 'Female'))).toBe(false);
  });

  test('a woman is not shown accommodation whose description opens "Male only"', () => {
    const hope = findService('Hope Into Action - Bushbury');
    expect(hope).toBeDefined();
    expect(shownTo(hope, 'Female')).toBe(false);
  });

  test('a man is not hidden from a women\'s organisation by its name alone', () => {
    const bcwa = findService('Black Country Womens Aid', s => !(s.client_groups || []).includes('Female only'));
    expect(bcwa).toBeDefined();
    expect(shownTo(bcwa, 'Male')).toBe(true);
  });

  test('a man is not hidden from a service that runs one women only session', () => {
    const oasis = findService('OASIS Mental Health Support', s => /plus a women only session/i.test(s.description));
    expect(oasis).toBeDefined();
    expect(shownTo(oasis, 'Male')).toBe(true);
  });

  test('a man is not hidden from a service that welcomes men and women', () => {
    const sanctuary = findService('Wolverhampton City Of Sanctuary', s => /men, women/i.test(s.description));
    expect(sanctuary).toBeDefined();
    expect(shownTo(sanctuary, 'Male')).toBe(true);
  });

  test('a description saying it is not a women only service does not restrict it', () => {
    const service = { name: 'Example drop-in', description: 'We are not a women only service; everyone is welcome.', client_groups: [] };
    expect(shownTo(service, 'Male')).toBe(true);
  });

  test.each(['Non-binary or other', 'Prefer not to say', 'Trans Female', 'Trans Male'])(
    'a person answering "%s" is shown every service, because only an exact Male or Female answer filters',
    (gender: string) => {
      expect(filterByProfile(allServices, profile({ gender }))).toHaveLength(allServices.length);
    }
  );
});
