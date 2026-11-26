// Mapping and caching for the live read. No database code here, so it can be
// tested without a connection.
//
// Field names follow the website's /api/services route
// (streetsupport-platform-web main at 33202ae, read 2 November 2026):
// ProvidedServices rows, joined to ServiceProviders on ServiceProviderKey = Key.

import type { PoolContact, PoolService } from './servicePool';
import { V4_POPULATION_TAGS } from './v4Categories';

// The website's Find Help default (DEFAULT_SEARCH_RADIUS_KM = 5).
export const DEFAULT_RADIUS_KM = 5;

// The longest the VA waits on the database for one turn, connecting and both
// queries together, before it gives up and uses the fixed file or says it
// cannot load local services (Managing Director, 20 November 2026). The driver
// timeouts use the same limit.
export const LIVE_READ_TIMEOUT_MS = 3_000;

export function liveReadClientOptions() {
  return {
    connectTimeoutMS: LIVE_READ_TIMEOUT_MS,
    serverSelectionTimeoutMS: LIVE_READ_TIMEOUT_MS,
    socketTimeoutMS: LIVE_READ_TIMEOUT_MS,
  };
}

export class LiveReadTimeout extends Error {
  constructor() {
    super('Live read timed out');
    this.name = 'LiveReadTimeout';
  }
}

// The whole read raced against one timer, so a turn waits at most `ms`.
export function withTimeout<T>(work: Promise<T>, ms: number = LIVE_READ_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new LiveReadTimeout()), ms);
  });
  return Promise.race([work, timeout]).finally(() => clearTimeout(timer));
}

// After a failed read, later turns go straight to the fixed file for the same
// time the website caches a read, rather than waiting on the database again.
export class FailureMemory {
  private failedAt: number | null = null;

  constructor(private holdMs: number = CACHE_TTL_MS) {}

  recordFailure(now: number = Date.now()): void {
    this.failedAt = now;
  }

  clear(): void {
    this.failedAt = null;
  }

  recentlyFailed(now: number = Date.now()): boolean {
    if (this.failedAt === null) return false;
    if (now - this.failedAt >= this.holdMs) {
      this.failedAt = null;
      return false;
    }
    return true;
  }
}

// The website caches service reads for 60 seconds per server instance
// (CACHE_TTL.services). The VA is no slower than the website to reflect a change.
export const CACHE_TTL_MS = 60_000;
const CACHE_MAX_ENTRIES = 200;

export interface PlatformServiceRow {
  _id: unknown;
  ServiceProviderKey?: string | null;
  ServiceProviderName?: string | null;
  Info?: string | null;
  ParentCategoryKey?: string | null;
  SubCategoryKey?: string | null;
  IsAppointmentOnly?: boolean | null;
  IsTelephoneService?: boolean | null;
  ClientGroupKeys?: unknown;
  Address?: { Location?: { type?: string; coordinates?: [number, number] } | null } | null;
  distance?: number | null; // metres, from $geoNear
}

export interface PlatformProviderRow {
  Key?: string | null;
  Name?: string | null;
  Telephone?: string | null;
  Website?: string | null;
}

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x27;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
};

// The website HTML-decodes name and description before showing them.
export function decodeEntities(text: string): string {
  return text
    .replace(/&(amp|lt|gt|quot|apos|nbsp|#39|#x27);/g, m => ENTITIES[m] ?? m)
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

const KNOWN_TAGS: ReadonlySet<string> = new Set(V4_POPULATION_TAGS);

export function populationTags(keys: unknown): string[] {
  if (!Array.isArray(keys)) return [];
  const tags = keys.filter((k): k is string => typeof k === 'string' && KNOWN_TAGS.has(k));
  return Array.from(new Set(tags));
}

export function mapServiceRow(row: PlatformServiceRow): PoolService | null {
  const orgKey = row.ServiceProviderKey ?? null;
  const parent = row.ParentCategoryKey ?? null;
  if (!orgKey || !parent) return null;

  const coords = row.Address?.Location?.coordinates;
  const hasCoords = Array.isArray(coords) && coords.length === 2;

  return {
    service_id: String(row._id),
    organization_id: orgKey,
    // Not held on the platform. Local results come by distance, as on the
    // website, so the matcher does not filter by council for pooled services.
    local_authority: '',
    name: decodeEntities(row.ServiceProviderName ?? ''),
    description: decodeEntities(row.Info ?? ''),
    category: { parent, sub: row.SubCategoryKey ?? '' },
    access: {
      appointment_only: row.IsAppointmentOnly === true,
      telephone_service: row.IsTelephoneService === true,
    },
    location: {
      latitude: hasCoords ? coords![1] : null,
      longitude: hasCoords ? coords![0] : null,
      has_location: hasCoords,
    },
    // Population tags from ProvidedServices.ClientGroupKeys, V4 keys only
    // (v4Categories.ts). A tag lifts a service for someone in the group and
    // never hides it from anyone else. Any other value is dropped, so no old
    // label can switch on the label-based age and gender filters. Gender
    // restrictions stated in the description are still read.
    client_groups: populationTags(row.ClientGroupKeys),
    distance_km: typeof row.distance === 'number' ? Math.round(row.distance / 10) / 100 : null,
  };
}

export function mapProviderRows(rows: PlatformProviderRow[]): Record<string, PoolContact> {
  const contacts: Record<string, PoolContact> = {};
  for (const r of rows) {
    if (!r.Key) continue;
    contacts[r.Key] = {
      name: r.Name ? decodeEntities(r.Name) : null,
      phone: r.Telephone?.trim() || null,
      website: r.Website?.trim() || null,
    };
  }
  return contacts;
}

// Small per-instance cache, keyed by rounded location and radius.
export class TtlCache<V> {
  private entries = new Map<string, { at: number; value: V }>();

  constructor(private ttlMs: number = CACHE_TTL_MS, private max: number = CACHE_MAX_ENTRIES) {}

  get(key: string, now: number = Date.now()): V | undefined {
    const hit = this.entries.get(key);
    if (!hit) return undefined;
    if (now - hit.at > this.ttlMs) {
      this.entries.delete(key);
      return undefined;
    }
    return hit.value;
  }

  set(key: string, value: V, now: number = Date.now()): void {
    if (this.entries.size >= this.max) {
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) this.entries.delete(oldest);
    }
    this.entries.set(key, { at: now, value });
  }
}

export function cacheKey(latitude: number, longitude: number, radiusKm: number): string {
  // About 100 m: close enough that people in the same place share a read.
  return `${latitude.toFixed(3)},${longitude.toFixed(3)},${radiusKm}`;
}
