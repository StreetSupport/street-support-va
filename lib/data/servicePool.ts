// Live read of the platform: the service pool for one request.
//
// The VA reads services from the platform database the same way the website
// does (Managing Director, 31 October 2026). The chat route loads the services
// near the person once per request, before the state machine runs, and makes
// them available here. The matcher reads them from here instead of the fixed
// January 2026 file.
//
// AsyncLocalStorage keeps each request's pool separate, so concurrent
// conversations never see each other's services. When no pool is set, the
// matcher uses the fixed file exactly as before.

import { AsyncLocalStorage } from 'node:async_hooks';

export interface PoolService {
  service_id: string;
  organization_id: string;
  local_authority: string;
  name: string;
  description: string;
  category: { parent: string; sub: string };
  access: { appointment_only: boolean; telephone_service: boolean };
  location: { latitude: number | null; longitude: number | null; has_location: boolean };
  client_groups: string[];
  distance_km: number | null;
}

export interface PoolContact {
  name: string | null;
  phone: string | null;
  website: string | null;
}

export type ServicePool =
  | {
      status: 'ready';
      services: PoolService[];
      contacts: Record<string, PoolContact>;
      radiusKm: number;
    }
  | {
      // The database did not answer. Local results are unavailable; the VA
      // says so plainly rather than telling the person there is no support.
      status: 'unavailable';
    };

const storage = new AsyncLocalStorage<ServicePool | null>();

export function runWithServicePool<T>(pool: ServicePool | null, fn: () => T): T {
  return storage.run(pool, fn);
}

export function getServicePool(): ServicePool | null {
  return storage.getStore() ?? null;
}

export function isLiveReadEnabled(): boolean {
  return process.env.VA_SERVICE_SOURCE === 'platform';
}
