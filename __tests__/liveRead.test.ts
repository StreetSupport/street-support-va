// Live read of the platform (plan B1a).
// The VA finds services by distance from the person, as the website does, and
// never tells someone there is no local support when it could not load it.

import type { SessionState } from '../lib/types';
import { createSession, processInput } from '../lib/stateMachine';
import { getServicesForNeed } from '../lib/serviceMatcher';
import { runWithServicePool, type ServicePool } from '../lib/data/servicePool';
import {
  TtlCache,
  decodeEntities,
  mapProviderRows,
  mapServiceRow,
} from '../lib/data/platformMapping';

function sessionAt(gate: SessionState['currentGate'], profile: Partial<SessionState> = {}): SessionState {
  return { ...createSession('test'), currentGate: gate, ...profile };
}

const row = (over: Record<string, unknown> = {}) => ({
  _id: 'svc1',
  ServiceProviderKey: 'org-a',
  ServiceProviderName: 'Org A &amp; Friends',
  Info: 'Food parcels &#39;every&#39; Tuesday',
  ParentCategoryKey: 'foodbank',
  SubCategoryKey: 'general',
  IsAppointmentOnly: false,
  IsTelephoneService: true,
  Address: { Location: { type: 'Point', coordinates: [-2.12, 52.58] as [number, number] } },
  distance: 1234,
  ...over,
});

function readyPool(): ServicePool {
  const services = [
    mapServiceRow(row({ _id: 'near', ServiceProviderKey: 'org-near', distance: 300 }))!,
    mapServiceRow(row({ _id: 'far', ServiceProviderKey: 'org-far', distance: 4200 }))!,
    mapServiceRow(row({ _id: 'health', ServiceProviderKey: 'org-h', ParentCategoryKey: 'medical', distance: 100 }))!,
  ];
  return {
    status: 'ready',
    radiusKm: 5,
    services,
    contacts: mapProviderRows([
      { Key: 'org-near', Name: 'Near Pantry', Telephone: '01902 000001', Website: 'near.example.org' },
      { Key: 'org-far', Name: 'Far Foodbank', Telephone: null, Website: 'https://far.example.org' },
    ]),
  };
}

describe('Live read: mapping platform rows', () => {
  test('maps a ProvidedServices row to the matcher shape', () => {
    const s = mapServiceRow(row())!;
    expect(s.service_id).toBe('svc1');
    expect(s.organization_id).toBe('org-a');
    expect(s.name).toBe('Org A & Friends');
    expect(s.description).toBe("Food parcels 'every' Tuesday");
    expect(s.category).toEqual({ parent: 'foodbank', sub: 'general' });
    expect(s.access).toEqual({ appointment_only: false, telephone_service: true });
    // GeoJSON is [longitude, latitude]
    expect(s.location).toEqual({ latitude: 52.58, longitude: -2.12, has_location: true });
    expect(s.distance_km).toBe(1.23);
  });

  test('drops a row with no organisation or category', () => {
    expect(mapServiceRow(row({ ServiceProviderKey: null }))).toBeNull();
    expect(mapServiceRow(row({ ParentCategoryKey: null }))).toBeNull();
  });

  test('decodes the entities the website decodes', () => {
    expect(decodeEntities('A &lt;b&gt; &quot;c&quot; &#x27;d&#x27; &#8217;')).toBe('A <b> "c" \'d\' ’');
  });

  test('the cache forgets after its time to live', () => {
    const c = new TtlCache<number>(60_000);
    c.set('k', 1, 0);
    expect(c.get('k', 59_000)).toBe(1);
    expect(c.get('k', 61_000)).toBeUndefined();
  });
});

describe('Live read: matching from the pool', () => {
  test('a person sees services near them, whatever council they are in', () => {
    const shown = runWithServicePool(readyPool(), () =>
      getServicesForNeed('Food', { localAuthority: 'Walsall' } as any)
    );
    expect(shown.map(s => s.organizationId)).toEqual(['org-near', 'org-far']);
  });

  test('contact details come from the published organisation', () => {
    const shown = runWithServicePool(readyPool(), () =>
      getServicesForNeed('Food', { localAuthority: null } as any)
    );
    expect(shown[0]).toMatchObject({ name: 'Near Pantry', phone: '01902 000001', website: 'https://near.example.org' });
    expect(shown[1]).toMatchObject({ name: 'Far Foodbank', phone: null, website: 'https://far.example.org' });
  });

  test('without a pool, the fixed file is used exactly as before', () => {
    const withoutPool = getServicesForNeed('Food', { localAuthority: 'Wolverhampton' } as any);
    expect(withoutPool.length).toBeGreaterThan(0);
    expect(withoutPool.some(s => s.organizationId === 'org-near')).toBe(false);
  });
});

describe('Live read: when the database does not answer', () => {
  test('the VA says it cannot load local services, not that there are none', () => {
    const session = sessionAt('B5_MAIN_SUPPORT_NEED', { localAuthority: 'Wolverhampton', routeType: 'QUICK' });
    const result = runWithServicePool({ status: 'unavailable' }, () => processInput(session, '2')); // Food
    expect(result.text).toContain("can't load local");
    expect(result.text).not.toContain("haven't found");
    expect(result.text).not.toContain('not finding');
  });

  test('national floors still show when local results are unavailable', () => {
    const session = sessionAt('B5_MAIN_SUPPORT_NEED', { localAuthority: 'Wolverhampton', routeType: 'QUICK' });
    // Health asks profile questions first; answer them to reach the result
    let s = session;
    let result = processInput(s, '4'); // Health
    s = { ...s, ...result.stateUpdates };
    for (let i = 0; i < 6 && !result.text.includes('NATIONAL RESOURCES') && !result.text.includes("can't load"); i++) {
      const pick = s.currentGate === 'B5_PROFILE_AGE' ? '4' : '2';
      result = runWithServicePool({ status: 'unavailable' }, () => processInput(s, pick));
      s = { ...s, ...result.stateUpdates };
    }
    expect(result.text).toContain("can't load local");
    expect(result.text).toContain('NHS 111');
  });
});
