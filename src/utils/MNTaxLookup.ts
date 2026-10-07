import fs from "fs";
import path from "path";

interface TaxInfo {
  combined: number;
  code: string;
  county: string;
  mctd: boolean;
  breakdown: Record<string, number>;
}

interface LookupInput {
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface LookupResponse {
  input?: LookupInput;
  matchedAddress?: string;
  county?: string;
  tax?: TaxInfo;
  error?: string;
}

export default async function MNSalesTaxLookup(
  street: string,
  city: string,
  state: string = "MN",
  zip: string,
  saleYear?: number,
): Promise<LookupResponse> {
  const year = saleYear || new Date().getFullYear();

  let ZIPMAP: Record<string, any> | null = null;
  let RAW_ROWS: any[] = [];

  /** Load JSON dataset directly from filesystem — picks the right file based on sale year */
  function loadDOR(): void {
    const jsonFile =
      year >= 2026
        ? "mn_sales_tax_2026q2_augmented.json"
        : "mn_sales_tax_2025q4_augmented.json";
    const filePath = path.join(process.cwd(), "public", jsonFile);
    const raw = fs.readFileSync(filePath, "utf-8");
    const j = JSON.parse(raw);
    RAW_ROWS = j.raw_rows || [];
  }

  /** Load ZIP CSV fallback from filesystem */
  function loadZIPCSV(): void {
    const filePath = path.join(
      process.cwd(),
      "public",
      "TAXRATES_ZIP5_MN202510.csv",
    );
    const text = fs.readFileSync(filePath, "utf-8");
    const rows = text.trim().split(/\r?\n/);
    const hdr = rows.shift()?.split(",") || [];
    const idx = Object.fromEntries(hdr.map((h, i) => [h.trim(), i]));
    ZIPMAP = {};

    rows.forEach((line: string) => {
      const cols = line.split(",");
      const z = cols[idx["ZipCode"]]?.trim();
      if (!z) return;
      ZIPMAP![z] = Object.fromEntries(
        Object.entries({
          taxRegionName: cols[idx["TaxRegionName"]]?.trim() || "",
          combined_rate: +cols[idx["EstimatedCombinedRate"]] || 0,
          state_rate: +cols[idx["StateRate"]] || 0,
          county_rate: +cols[idx["EstimatedCountyRate"]] || 0,
          city_rate: +cols[idx["EstimatedCityRate"]] || 0,
          special_rate: +cols[idx["EstimatedSpecialRate"]] || 0,
        }).filter(([_, v]) => v !== null && v !== undefined && v !== 0),
      );
    });
  }

  /** Main lookup */
  async function lookup(): Promise<LookupResponse> {
    if (state !== "MN") {
      return { error: "This tool only supports Minnesota (MN)." };
    }

    if (!zip && !street) {
      return { error: "Enter at least a ZIP (preferred) or a street." };
    }

    if (!RAW_ROWS.length) loadDOR();

    // ✅ Try to match JSON by city or ZIP
    const match =
      RAW_ROWS.find((r) =>
        r.place_name?.toUpperCase().includes(city.toUpperCase()),
      ) || RAW_ROWS.find((r) => r.zip === zip);

    if (match) {
      const rates = match.rates || {};
      const breakdown: Record<string, number> = {};

      // Dynamically copy all available numeric fields except combined_rate
      for (const [key, val] of Object.entries(rates)) {
        if (typeof val === "number" && key !== "combined_rate") {
          breakdown[key] = val;
        }
      }

      return {
        input: { street, city, state, zip },
        matchedAddress: `${street}, ${city}, ${state} ${zip}`,
        county: match.county || "UNKNOWN",
        tax: {
          combined: rates.combined_rate || 0,
          code: match.place_name || "UNKNOWN",
          county: match.county || "UNKNOWN",
          mctd: false,
          breakdown,
        },
      };
    }

    // ❌ If not found, fallback to ZIP CSV
    if (!ZIPMAP) loadZIPCSV();

    const zipRow = ZIPMAP?.[String(zip).slice(0, 5)];
    if (zipRow) {
      const breakdown: Record<string, number> = {};
      for (const [key, val] of Object.entries(zipRow)) {
        if (typeof val === "number" && key !== "combined_rate") {
          breakdown[key] = val;
        }
      }

      return {
        input: { street, city, state, zip },
        matchedAddress: `${street}, ${city}, ${state} ${zip}`,
        county: "UNKNOWN",
        tax: {
          combined: zipRow.combined_rate || 0,
          code: zipRow.taxRegionName || "N/A",
          county: "UNKNOWN",
          mctd: false,
          breakdown,
        },
      };
    }

    return { error: "Lookup failed. No match found in JSON or ZIP data." };
  }

  return await lookup();
}
