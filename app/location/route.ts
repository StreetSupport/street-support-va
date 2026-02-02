import { NextRequest, NextResponse } from 'next/server';

/**
 * Location API - Postcode lookup and reverse geocoding
 * Uses postcodes.io (free, no API key required)
 */

// WMCA Local Authority names
const WMCA_NAMES = ['wolverhampton', 'birmingham', 'coventry', 'dudley', 'sandwell', 'solihull', 'walsall'];

// Check if LA is in WMCA region
function checkWMCA(adminDistrict: string): boolean {
  if (!adminDistrict) return false;
  const lower = adminDistrict.toLowerCase();
  return WMCA_NAMES.some(name => lower.includes(name));
}

// Clean LA name for display
function cleanLA(adminDistrict: string): string {
  if (!adminDistrict) return '';
  return adminDistrict.replace(/^City of /i, '').trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postcode, latitude, longitude } = body;

    // POSTCODE LOOKUP
    if (postcode) {
      const clean = postcode.replace(/\s+/g, '').toUpperCase();
      
      const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(clean)}`);
      
      if (!res.ok) {
        return NextResponse.json({ success: false, error: 'Invalid postcode' });
      }

      const data = await res.json();
      
      if (data.result) {
        return NextResponse.json({
          success: true,
          latitude: data.result.latitude,
          longitude: data.result.longitude,
          localAuthority: cleanLA(data.result.admin_district),
          postcode: data.result.postcode,
          isWMCA: checkWMCA(data.result.admin_district)
        });
      }

      return NextResponse.json({ success: false, error: 'Postcode not found' });
    }

    // REVERSE GEOCODE (from coordinates)
    if (latitude !== undefined && longitude !== undefined) {
      const res = await fetch(`https://api.postcodes.io/postcodes?lon=${longitude}&lat=${latitude}&limit=1`);

      if (!res.ok) {
        return NextResponse.json({ success: false, error: 'Could not determine location' });
      }

      const data = await res.json();
      
      if (data.result && data.result.length > 0) {
        const r = data.result[0];
        return NextResponse.json({
          success: true,
          latitude: r.latitude,
          longitude: r.longitude,
          localAuthority: cleanLA(r.admin_district),
          postcode: r.postcode,
          isWMCA: checkWMCA(r.admin_district)
        });
      }

      return NextResponse.json({ success: false, error: 'Location not found' });
    }

    return NextResponse.json({ success: false, error: 'Provide postcode or coordinates' });

  } catch (error) {
    console.error('Location API error:', error);
    return NextResponse.json({ success: false, error: 'Service error' });
  }
}
