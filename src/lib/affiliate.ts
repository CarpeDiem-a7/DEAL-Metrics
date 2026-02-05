// src/lib/affiliate.ts
// Affiliate link management and tracking

import { prisma } from "./prisma";
import crypto from "crypto";

export interface AffiliateRedirectData {
  affiliateLinkId: string;
  productId: string;
  storeId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Generate secure affiliate redirect URL
 */
export function generateAffiliateLink(
  baseUrl: string,
  affiliateTag: string,
): string {
  // Append affiliate tag to URL
  if (baseUrl.includes("amazon.in")) {
    return `${baseUrl}?tag=${affiliateTag}`;
  }

  if (baseUrl.includes("flipkart.com")) {
    return `${baseUrl}&affid=${affiliateTag}`;
  }

  // Generic approach
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}affiliate=${affiliateTag}`;
}

/**
 * Validate affiliate URL
 */
export function isValidAffiliateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;

    // Whitelist allowed domains
    const allowedDomains = [
      "amazon.in",
      "flipkart.com",
      "myntra.com",
      "ajio.com",
      "meesho.com",
      "tataccliq.com",
      "croma.com",
      "nykaa.com",
      "firstcry.com",
      "reliance.com",
    ];

    return allowedDomains.some((domain) => host.includes(domain));
  } catch {
    return false;
  }
}

/**
 * Create or update affiliate link
 */
export async function createAffiliateLink(data: {
  productId: string;
  storeId: string;
  affiliateUrl: string;
  affiliateTag: string;
  commissionRate: number;
}) {
  // Validate URL
  if (!isValidAffiliateUrl(data.affiliateUrl)) {
    throw new Error("Invalid affiliate URL domain");
  }

  try {
    const existing = await prisma.affiliateLink.findUnique({
      where: {
        productId_storeId: {
          productId: data.productId,
          storeId: data.storeId,
        },
      },
    });

    if (existing) {
      return prisma.affiliateLink.update({
        where: { id: existing.id },
        data: {
          affiliateUrl: data.affiliateUrl,
          affiliateTag: data.affiliateTag,
          commissionRate: data.commissionRate,
        },
      });
    }

    return prisma.affiliateLink.create({
      data,
    });
  } catch (error) {
    console.error("Error creating affiliate link:", error);
    throw error;
  }
}

/**
 * Track affiliate click
 */
export async function trackAffiliateClick(data: AffiliateRedirectData) {
  try {
    const clickLog = await prisma.clickLog.create({
      data: {
        userId: data.userId || "anonymous",
        affiliateLinkId: data.affiliateLinkId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });

    // Update click count on affiliate link
    await prisma.affiliateLink.update({
      where: { id: data.affiliateLinkId },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });

    return clickLog;
  } catch (error) {
    console.error("Error tracking click:", error);
    throw error;
  }
}

/**
 * Generate unique hash for tracking
 */
export function generateTrackingHash(
  affiliateLinkId: string,
  userId: string,
  timestamp: number,
): string {
  const data = `${affiliateLinkId}:${userId}:${timestamp}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Get affiliate stats for user
 */
export async function getUserAffiliateStats(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clickLogs: {
          include: { affiliateLink: true },
        },
      },
    });

    if (!user) return null;

    const totalClicks = user.clickLogs.length;
    const uniqueProducts = new Set(
      user.clickLogs.map((log) => log.affiliateLink.productId),
    ).size;

    return {
      totalClicks,
      uniqueProducts,
      earnings: user.affiliateBalance,
      paid: user.affiliatePaid,
    };
  } catch (error) {
    console.error("Error getting affiliate stats:", error);
    throw error;
  }
}

/**
 * Calculate commission for affiliate
 */
export async function calculateAffiliateCommission(affiliateLinkId: string) {
  try {
    const link = await prisma.affiliateLink.findUnique({
      where: { id: affiliateLinkId },
      include: {
        product: {
          include: {
            prices: {
              orderBy: { recordedAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!link) throw new Error("Affiliate link not found");

    const currentPrice = link.product.prices[0]?.price || link.product.minPrice;
    const commission = (currentPrice * link.commissionRate) / 100;

    return {
      affiliateLinkId,
      currentPrice,
      commissionRate: link.commissionRate,
      estimatedCommission: commission,
    };
  } catch (error) {
    console.error("Error calculating commission:", error);
    throw error;
  }
}

/**
 * Payout affiliate earnings
 */
export async function payoutAffiliateEarnings(userId: string, amount: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.affiliateBalance < amount) {
      throw new Error("Insufficient balance");
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        affiliateBalance: { decrement: amount },
        affiliatePaid: { increment: amount },
      },
    });

    // Log transaction
    console.log(`Payout to ${userId}: ₹${amount}`);

    return updated;
  } catch (error) {
    console.error("Error processing payout:", error);
    throw error;
  }
}
