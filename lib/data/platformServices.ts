// Live read of services from the platform database, server side only.
//
// Mirrors the website's /api/services route (streetsupport-platform-web main
// at 33202ae, read 2 November 2026):
// - ProvidedServices with IsPublished: true, found by $geoNear on
//   Address.Location within the radius, nearest first;
// - the organisation from ServiceProviders on ServiceProviderKey = Key.
//
// Differences from the website, both deliberate:
// - Phone and website: the website's Find Help card has none and links to the
//   organisation page, which reads Telephone and Website from ServiceProviders
//   with IsPublished: true. The VA shows contact details on its cards, so it
//   reads them the way the organisation page does, published organisations only.
// - Category filtering happens in memory in the matcher, so one read per
//   location serves every need.
//
// The connection string comes from MONGODB_URI only, as on the website, and is
// never logged. Use the VA's own read-only database user.

import { MongoClient } from 'mongodb';
import type { ServicePool } from './servicePool';
import {
  DEFAULT_RADIUS_KM,
  TtlCache,
  cacheKey,
  mapProviderRows,
  mapServiceRow,
  type PlatformProviderRow,
  type PlatformServiceRow,
} from './platformMapping';

const DB_NAME = 'streetsupport';

let clientPromise: Promise<MongoClient> | null = null;

function getClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return Promise.reject(new Error('MONGODB_URI is not set'));
  }
  if (!clientPromise) {
    clientPromise = new MongoClient(uri, {
      connectTimeoutMS: 10_000,
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 30_000,
    })
      .connect()
      .catch(err => {
        clientPromise = null; // allow a later request to retry
        throw err;
      });
  }
  return clientPromise;
}

const cache = new TtlCache<Extract<ServicePool, { status: 'ready' }>>();

export async function loadServicesNear(
  latitude: number,
  longitude: number,
  radiusKm: number = DEFAULT_RADIUS_KM
): Promise<ServicePool> {
  const key = cacheKey(latitude, longitude, radiusKm);
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    const client = await getClient();
    const db = client.db(DB_NAME);

    const rows = (await db
      .collection('ProvidedServices')
      .aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [longitude, latitude] },
            distanceField: 'distance',
            maxDistance: radiusKm * 1000,
            spherical: true,
            query: { IsPublished: true },
          },
        },
        {
          $project: {
            _id: 1,
            ServiceProviderKey: 1,
            ServiceProviderName: 1,
            Info: 1,
            ParentCategoryKey: 1,
            SubCategoryKey: 1,
            IsAppointmentOnly: 1,
            IsTelephoneService: 1,
            'Address.Location': 1,
            distance: 1,
          },
        },
      ])
      .toArray()) as PlatformServiceRow[];

    const services = rows
      .map(mapServiceRow)
      .filter((s): s is NonNullable<typeof s> => s !== null);

    const keys = Array.from(new Set(services.map(s => s.organization_id)));
    const providers = keys.length
      ? ((await db
          .collection('ServiceProviders')
          .find(
            { Key: { $in: keys }, IsPublished: true },
            { projection: { _id: 0, Key: 1, Name: 1, Telephone: 1, Website: 1 } }
          )
          .toArray()) as PlatformProviderRow[])
      : [];

    const pool: Extract<ServicePool, { status: 'ready' }> = {
      status: 'ready',
      services,
      contacts: mapProviderRows(providers),
      radiusKm,
    };
    cache.set(key, pool);
    return pool;
  } catch (err) {
    // Categorical only: no coordinates, no connection details.
    console.error('[VA] Live read failed:', err instanceof Error ? err.name : 'unknown');
    return { status: 'unavailable' };
  }
}
