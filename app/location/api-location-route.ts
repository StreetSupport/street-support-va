import { NextRequest, NextResponse } from 'next/server';

/**
 * Postcode and Geolocation API
 * 
 * Uses postcodes.io (free, no API key required)
 * 
 * Endpoints:
 * - POST with { postcode } → lookup postcode, return lat/lon/Local Authority
 * - POST with { latitude, longitude } → reverse geocode, return Local Authority
 */

interface PostcodeResult {
  success: boolean;
  latitude?: number;
  longitude?: number;
  localAuthority?: string;
  postcode?: string;
  error?: string;
}

// WMCA Local Authorities we support
const SUPPORTED_LOCAL_AUTHORITIES = [
  'Wolverhampton',
  'Birmingham',
  'Coventry',
  'Dudley',
  'Sandwell',
  'Solihull',
  'Walsall',
  'City of Wolverhampton',
  'City of Birmingham',
  'City of Coventry',
];

// Normalize LA name to match our system
function normalizeLocalAuthority(adminDistrict: string): string {
  if (!adminDistrict) return '';
  
  // Remove "City of" prefix for consistency
  let normalized = adminDistrict
    .replace(/^City of /i, '')
    .trim();
  
  // Check if it's in our supported list
  const supported = SUPPORTED_LOCAL_AUTHORITIES.find(
    la => la.toLowerCase().includes(normalized.toLowerCase()) ||
          normalized.toLowerCase().includes(la.toLowerCase())
  );
  
  return supported ? normalized : adminDistrict;
}

// Check if LA is in WMCA region
function isInWMCA(adminDistrict: string): boolean {
  if (!adminDistrict) return false;
  const normalized = adminDistrict.toLowerCase();
  return SUPPORTED_LOCAL_AUTHORITIES.some(
    la => la.toLowerCase().includes(normalized) ||
          normalized.includes(la.toLowerCase().replace('city of ', ''))
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postcode, latitude, longitude } = body;

    // Route 1: Postcode lookup
    if (postcode) {
      const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
      
      const response = await fetch(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(cleanPostcode)}`,
        { 
          headers: { 'Accept': 'application/json' },
          next: { revalidate: 86400 } // Cache for 24 hours
        }
      );

      if (!response.ok) {
        // Try terminated postcodes (historical)
        const terminatedResponse = await fetch(
          `https://api.postcodes.io/terminated_postcodes/${encodeURIComponent(cleanPostcode)}`,
          { headers: { 'Accept': 'application/json' } }
        );
        
        if (terminatedResponse.ok) {
          const data = await terminatedResponse.json();
          if (data.result) {
            return NextResponse.json({
              success: true,
              latitude: data.result.latitude,
              longitude: data.result.longitude,
              localAuthority: normalizeLocalAuthority(data.result.admin_district),
              postcode: data.result.postcode,
              isInWMCA: isInWMCA(data.result.admin_district),
              isTerminated: true
            });
          }
        }
        
        return NextResponse.json({
          success: false,
          error: 'Invalid postcode'
        });
      }

      const data = await response.json();
      
      if (data.result) {
        return NextResponse.json({
          success: true,
          latitude: data.result.latitude,
          longitude: data.result.longitude,
          localAuthority: normalizeLocalAuthority(data.result.admin_district),
          postcode: data.result.postcode,
          isInWMCA: isInWMCA(data.result.admin_district)
        });
      }

      return NextResponse.json({
        success: false,
        error: 'Postcode not found'
      });
    }

    // Route 2: Reverse geocoding from coordinates
    if (latitude !== undefined && longitude !== undefined) {
      const response = await fetch(
        `https://api.postcodes.io/postcodes?lon=${longitude}&lat=${latitude}&limit=1`,
        { 
          headers: { 'Accept': 'application/json' },
          next: { revalidate: 3600 } // Cache for 1 hour
        }
      );

      if (!response.ok) {
        return NextResponse.json({
          success: false,
          error: 'Could not determine location'
        });
      }

      const data = await response.json();
      
      if (data.result && data.result.length > 0) {
        const result = data.result[0];
        return NextResponse.json({
          success: true,
          latitude: result.latitude,
          longitude: result.longitude,
          localAuthority: normalizeLocalAuthority(result.admin_district),
          postcode: result.postcode,
          isInWMCA: isInWMCA(result.admin_district)
        });
      }

      // If no postcode found, try outcode (partial postcode) lookup
      const outcodeResponse = await fetch(
        `https://api.postcodes.io/outcodes?lon=${longitude}&lat=${latitude}&limit=1`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (outcodeResponse.ok) {
        const outcodeData = await outcodeResponse.json();
        if (outcodeData.result && outcodeData.result.length > 0) {
          const result = outcodeData.result[0];
          // Outcodes return admin_district as an array
          const adminDistrict = Array.isArray(result.admin_district) 
            ? result.admin_district[0] 
            : result.admin_district;
          
          return NextResponse.json({
            success: true,
            latitude: result.latitude,
            longitude: result.longitude,
            localAuthority: normalizeLocalAuthority(adminDistrict),
            isInWMCA: isInWMCA(adminDistrict),
            approximate: true
          });
        }
      }

      return NextResponse.json({
        success: false,
        error: 'Location not in UK or could not be determined'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Please provide either a postcode or coordinates'
    });

  } catch (error) {
    console.error('Postcode API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Service temporarily unavailable'
    });
  }
}
