// Tax lookup utilities
const BASE = "https://geocoding.geo.census.gov/geocoder";

// Tax rates and county data
const STATE_RATE = 0.04;
const MCTD_RATE = 0.00375;
const NYC_COMBINED = 0.08875;
const NYC_CODE = '8081';

// HTML এর exact data from Pub 718
const COUNTIES: Record<string, { rate: number; code: string; nyc?: boolean; mctd?: boolean }> = {
  'ALBANY': { rate: 0.08, code: '0181' },
  'ALLEGANY': { rate: 0.085, code: '0221' },
  'BRONX': { rate: NYC_COMBINED, code: NYC_CODE, nyc: true },
  'BROOME': { rate: 0.08, code: '0321' },
  'CATTARAUGUS': { rate: 0.08, code: '0481' },
  'CAYUGA': { rate: 0.08, code: '0511' },
  'CHAUTAUQUA': { rate: 0.08, code: '0651' },
  'CHEMUNG': { rate: 0.08, code: '0711' },
  'CHENANGO': { rate: 0.08, code: '0861' },
  'CLINTON': { rate: 0.08, code: '0921' },
  'COLUMBIA': { rate: 0.08, code: '1021' },
  'CORTLAND': { rate: 0.08, code: '1131' },
  'DELAWARE': { rate: 0.08, code: '1221' },
  'DUTCHESS': { rate: 0.08125, code: '1311', mctd: true },
  'ERIE': { rate: 0.0875, code: '1451' },
  'ESSEX': { rate: 0.08, code: '1521' },
  'FRANKLIN': { rate: 0.08, code: '1621' },
  'FULTON': { rate: 0.08, code: '1791' },
  'GENESEE': { rate: 0.08, code: '1811' },
  'GREENE': { rate: 0.08, code: '1911' },
  'HAMILTON': { rate: 0.08, code: '2011' },
  'HERKIMER': { rate: 0.0825, code: '2121' },
  'JEFFERSON': { rate: 0.08, code: '2221' },
  'KINGS': { rate: NYC_COMBINED, code: NYC_CODE, nyc: true },
  'LEWIS': { rate: 0.08, code: '2321' },
  'LIVINGSTON': { rate: 0.08, code: '2411' },
  'MADISON': { rate: 0.08, code: '2511' },
  'MONROE': { rate: 0.08, code: '2611' },
  'MONTGOMERY': { rate: 0.08, code: '2781' },
  'NASSAU': { rate: 0.08625, code: '2811', mctd: true },
  'NEW YORK': { rate: NYC_COMBINED, code: NYC_CODE, nyc: true },
  'NIAGARA': { rate: 0.08, code: '2911' },
  'ONEIDA': { rate: 0.0875, code: '3010' },
  'ONONDAGA': { rate: 0.08, code: '3121' },
  'ONTARIO': { rate: 0.075, code: '3211' },
  'ORANGE': { rate: 0.08125, code: '3321', mctd: true },
  'ORLEANS': { rate: 0.08, code: '3481' },
  'OSWEGO': { rate: 0.08, code: '3501' },
  'OTSEGO': { rate: 0.08, code: '3621' },
  'PUTNAM': { rate: 0.08375, code: '3731', mctd: true },
  'QUEENS': { rate: NYC_COMBINED, code: NYC_CODE, nyc: true },
  'RENSSELAER': { rate: 0.08, code: '3881' },
  'RICHMOND': { rate: NYC_COMBINED, code: NYC_CODE, nyc: true },
  'ROCKLAND': { rate: 0.08375, code: '3921', mctd: true },
  'ST. LAWRENCE': { rate: 0.08, code: '4091' },
  'SARATOGA': { rate: 0.07, code: '4111' },
  'SCHENECTADY': { rate: 0.08, code: '4241' },
  'SCHOHARIE': { rate: 0.08, code: '4321' },
  'SCHUYLER': { rate: 0.08, code: '4411' },
  'SENECA': { rate: 0.08, code: '4511' },
  'STEUBEN': { rate: 0.08, code: '4691' },
  'SUFFOLK': { rate: 0.08625, code: '4711', mctd: true },
  'SULLIVAN': { rate: 0.08, code: '4821' },
  'TIOGA': { rate: 0.08, code: '4921' },
  'TOMPKINS': { rate: 0.08, code: '5081' },
  'ULSTER': { rate: 0.08, code: '5111' },
  'WARREN': { rate: 0.07, code: '5281' },
  'WASHINGTON': { rate: 0.07, code: '5311' },
  'WAYNE': { rate: 0.08, code: '5421' },
  'WESTCHESTER': { rate: 0.08375, code: '5581', mctd: true },
  'WYOMING': { rate: 0.08, code: '5621' },
  'YATES': { rate: 0.08, code: '5721' },
};

// HTML এর exact city to county mapping
const CITY_TO_COUNTY: Record<string, string> = {
  // NYC
  "NEW YORK": "NEW YORK", "MANHATTAN": "NEW YORK", "BROOKLYN": "KINGS", 
  "QUEENS": "QUEENS", "BRONX": "BRONX", "STATEN ISLAND": "RICHMOND",
  // Westchester
  "YONKERS": "WESTCHESTER", "MOUNT VERNON": "WESTCHESTER", 
  "NEW ROCHELLE": "WESTCHESTER", "WHITE PLAINS": "WESTCHESTER",
  // Nassau/Suffolk samples  
  "HEMPSTEAD": "NASSAU", "GLEN COVE": "NASSAU", "LONG BEACH": "NASSAU", "OYSTER BAY": "NASSAU",
  "RIVERHEAD": "SUFFOLK", "HUNTINGTON": "SUFFOLK", "ISLIP": "SUFFOLK", "SMITHTOWN": "SUFFOLK", 
  "EAST HAMPTON": "SUFFOLK", "SOUTHAMPTON": "SUFFOLK",
  // Monroe area
  "ROCHESTER": "MONROE", "GREECE": "MONROE", "IRONDEQUOIT": "MONROE", "BRIGHTON": "MONROE", 
  "PITTSFORD": "MONROE", "HENRIETTA": "MONROE", "WEBSTER": "MONROE", "FAIRPORT": "MONROE", 
  "HILTON": "MONROE", "BROCKPORT": "MONROE", "SPENCERPORT": "MONROE", "GATES": "MONROE", 
  "CHILI": "MONROE", "PENFIELD": "MONROE", "PERINTON": "MONROE", "EAST ROCHESTER": "MONROE",
  // Orange
  "MIDDLETOWN": "ORANGE", "GOSHEN": "ORANGE", "NEWBURGH": "ORANGE", "NEW WINDSOR": "ORANGE", 
  "WARWICK": "ORANGE", "CHESTER": "ORANGE", "PORT JERVIS": "ORANGE", "CORNWALL": "ORANGE", 
  "WASHINGTONVILLE": "ORANGE", "BLOOMING GROVE": "ORANGE", "WALDEN": "ORANGE", "MONTGOMERY": "ORANGE", 
  "MAYBROOK": "ORANGE", "GREENWOOD LAKE": "ORANGE", "HARRIMAN": "ORANGE", "HIGHLAND FALLS": "ORANGE", 
  "WOODBURY": "ORANGE", "TUXEDO PARK": "ORANGE",
  // Rockland
  "MONSEY": "ROCKLAND", "SPRING VALLEY": "ROCKLAND", "NANUET": "ROCKLAND", "NYACK": "ROCKLAND", 
  "SUFFERN": "ROCKLAND", "PEARL RIVER": "ROCKLAND", "HAVERSTRAW": "ROCKLAND", "CONGERS": "ROCKLAND", 
  "STONY POINT": "ROCKLAND", "POMONA": "ROCKLAND", "TAPPAN": "ROCKLAND", "ORANGEBURG": "ROCKLAND", 
  "BLAUVELT": "ROCKLAND", "WEST NYACK": "ROCKLAND", "WEST HAVERSTRAW": "ROCKLAND", "HILLBURN": "ROCKLAND", 
  "GARNERVILLE": "ROCKLAND", "VALLEY COTTAGE": "ROCKLAND", "PIERMONT": "ROCKLAND",
  // Adirondacks sample
  "LONG LAKE": "HAMILTON",
  // Other major cities
  "BUFFALO": "ERIE",
  "ALBANY": "ALBANY", 
  "SYRACUSE": "ONONDAGA",
  "UTICA": "ONEIDA",
};

// HTML এর exact ZIP mappings
const ZIP_EXACT_TO_COUNTY: Record<string, string> = {
  // Orange (partial but broad coverage)
  '10924': 'ORANGE', '10925': 'ORANGE', '10926': 'ORANGE', '10928': 'ORANGE', '10930': 'ORANGE', 
  '10940': 'ORANGE', '10941': 'ORANGE', '10950': 'ORANGE', '10953': 'ORANGE', '10958': 'ORANGE', 
  '10959': 'ORANGE', '10963': 'ORANGE', '10969': 'ORANGE', '10973': 'ORANGE', '10975': 'ORANGE', 
  '10988': 'ORANGE', '10990': 'ORANGE', '10992': 'ORANGE', '10996': 'ORANGE',
  // Rockland
  '10901': 'ROCKLAND', '10913': 'ROCKLAND', '10920': 'ROCKLAND', '10923': 'ROCKLAND', '10927': 'ROCKLAND', 
  '10931': 'ROCKLAND', '10952': 'ROCKLAND', '10954': 'ROCKLAND', '10956': 'ROCKLAND', '10960': 'ROCKLAND', 
  '10962': 'ROCKLAND', '10964': 'ROCKLAND', '10965': 'ROCKLAND', '10968': 'ROCKLAND', '10970': 'ROCKLAND', 
  '10974': 'ROCKLAND', '10976': 'ROCKLAND', '10977': 'ROCKLAND', '10980': 'ROCKLAND', '10983': 'ROCKLAND', 
  '10984': 'ROCKLAND', '10987': 'ROCKLAND', '10989': 'ROCKLAND', '10993': 'ROCKLAND', '10994': 'ROCKLAND',
};

// HTML এর ZIP prefix patterns
const ZIP_PREFIX_TO_COUNTY = [
  { prefixes: ['100', '101', '102'], county: 'NEW YORK' },
  { prefixes: ['103'], county: 'RICHMOND' },
  { prefixes: ['104'], county: 'BRONX' },
  { prefixes: ['112'], county: 'KINGS' },
  { prefixes: ['111', '113', '114', '116'], county: 'QUEENS' },
  { prefixes: ['110', '115', '118'], county: 'NASSAU' },
  { prefixes: ['117', '119'], county: 'SUFFOLK' },
  { prefixes: ['146'], county: 'MONROE' },
  { prefixes: ['105', '106', '107'], county: 'WESTCHESTER' },
  { prefixes: ['125'], county: 'DUTCHESS' },
  { prefixes: ['127'], county: 'SULLIVAN' },
  { prefixes: ['128'], county: 'WARREN' },
];

export interface TaxInfo {
  combined: number;
  code: string;
  county: string;
  mctd: boolean;
  breakdown: {
    state: number;
    mctd: number;
    local: number;
  };
}

/**
 * Get county from address using Census geocoding API (HTML এর exact logic)
 */
export async function geocodeCounty(
  street: string, 
  city: string, 
  state: string = 'NY', 
  zip: string = ''
): Promise<string> {
  let county = '';

  try {
    // Step 1: Try fetch → geographies (may be CORS-blocked but works in Next.js)
    const u = new URL('https://geocoding.geo.census.gov/geocoder/locations/address');
    u.searchParams.set('street', street || '');
    if (city) u.searchParams.set('city', city);
    u.searchParams.set('state', state || 'NY');
    if (zip) u.searchParams.set('zip', zip);
    u.searchParams.set('benchmark', 'Public_AR_Current');
    u.searchParams.set('format', 'json');

    const locRes = await fetch(u.toString());
    if (locRes.ok) {
      const locData = await locRes.json();
      const match = locData?.result?.addressMatches?.[0];
      const lat = match?.coordinates?.y;
      const lon = match?.coordinates?.x;

      if (lat && lon) {
        const geoUrl = new URL('https://geocoding.geo.census.gov/geocoder/geographies/coordinates');
        geoUrl.searchParams.set('x', lon);
        geoUrl.searchParams.set('y', lat);
        geoUrl.searchParams.set('benchmark', 'Public_AR_Current');
        geoUrl.searchParams.set('vintage', 'Current_Current');
        geoUrl.searchParams.set('layers', 'County');
        geoUrl.searchParams.set('format', 'json');

        const geoRes = await fetch(geoUrl.toString());
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          const countyName = geoData?.result?.geographies?.Counties?.[0]?.NAME;
          if (countyName) {
            county = countyName.toUpperCase().replace(/\s+COUNTY$/, '').trim();
          }
        }
      }
    }
  } catch (error) {
    console.log('Census API failed, using offline inference:', error);
  }

  // Step 2: Fallback to offline inference (HTML এর exact logic)
  if (!county) {
    county = inferCountyOffline(city, zip);
  }

  return county;
}

/**
 * Infer county from city name and ZIP using HTML's exact offline mapping
 */
function inferCountyOffline(city?: string, zip?: string): string {
  if (!city && !zip) return '';
  
  // 1) Check exact ZIP first (for Orange/Rockland 109xx ambiguity)
  if (zip && ZIP_EXACT_TO_COUNTY[zip]) {
    return ZIP_EXACT_TO_COUNTY[zip];
  }
  
  // 2) Check city mapping
  if (city) {
    const c = city.trim().toUpperCase();
    if (CITY_TO_COUNTY[c]) {
      return CITY_TO_COUNTY[c];
    }
  }
  
  // 3) Check ZIP prefixes as fallback
  if (zip && zip.length >= 3) {
    const zip3 = zip.substring(0, 3);
    for (const item of ZIP_PREFIX_TO_COUNTY) {
      if (item.prefixes.includes(zip3)) {
        return item.county;
      }
    }
  }
  
  return '';
}

/**
 * Format percentage like HTML (removes .000 from end)
 */
export function formatPercent(rate: number): string {
  return (rate * 100).toFixed(3).replace(/\.000$/, '') + '%';
}

/**
 * Calculate tax information for a given county (HTML এর exact logic)
 */
export function calculateTax(county: string): TaxInfo | null {
  const c = county.trim().toUpperCase();
  const info = COUNTIES[c];
  
  if (!info) return null;

  const state = STATE_RATE;
  const mctd = (info.mctd || info.nyc) ? MCTD_RATE : 0;
  const local = +(info.rate - state - mctd).toFixed(5);

  return {
    combined: info.rate,
    code: info.code,
    county: c,
    mctd: !!(info.mctd || info.nyc),
    breakdown: { state, mctd, local },
  };
}
