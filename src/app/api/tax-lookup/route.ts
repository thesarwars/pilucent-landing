import { NextRequest, NextResponse } from "next/server";
import { geocodeCounty, calculateTax } from "@/utils/TaxLookUp";
import MNSalesTaxLookup from "@/utils/MNTaxLookup";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const street = searchParams.get("street") || "";
  const city = searchParams.get("city") || "";
  const state = searchParams.get("state") || "NY";
  const zip = searchParams.get("zip") || "";
  const saleYearParam = searchParams.get("saleYear");
  const saleYear = saleYearParam ? parseInt(saleYearParam, 10) : undefined;

  if (!street || !city) {
    return NextResponse.json(
      { error: "street and city are required" },
      { status: 400 },
    );
  }

  try {
    if (state == "NY") {
      const county = await geocodeCounty(street, city, state, zip);
      if (!county) {
        return NextResponse.json(
          { error: "County not found" },
          { status: 404 },
        );
      }
      const tax = calculateTax(county);
      if (!tax) {
        return NextResponse.json(
          { error: "Tax data not found for county" },
          { status: 404 },
        );
      }
      return NextResponse.json({
        input: { street, city, state, zip },
        matchedAddress: `${street}, ${city}, ${state} ${zip}`,
        county,
        tax,
      });
    } else if (state == "MN") {
      const res = await MNSalesTaxLookup(street, city, state, zip, saleYear);
      return NextResponse.json(res);
    }
  } catch (err: any) {
    console.log(err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
