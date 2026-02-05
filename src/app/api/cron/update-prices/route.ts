// src/app/api/cron/update-prices/route.ts
// Scheduled cron job to update product prices
import { NextRequest, NextResponse } from "next/server";
import { updateAllPrices, triggerPriceAlerts } from "@/lib/price-scraper";

// Verify cron secret to prevent unauthorized calls
function verifyCronSecret(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");

  if (!cronSecret) {
    console.warn("CRON_SECRET not set");
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(req: NextRequest) {
  try {
    // Verify request
    if (!verifyCronSecret(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting price update job...");

    // Update prices
    const priceResult = await updateAllPrices();

    // Trigger alerts
    const alertResult = await triggerPriceAlerts();

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      prices: priceResult,
      alerts: alertResult,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to update prices", details: String(error) },
      { status: 500 },
    );
  }
}
