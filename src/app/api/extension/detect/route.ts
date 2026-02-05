// src/app/api/extension/detect/route.ts
// Extension API: Detect product from URL and return comparison data
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { CACHE_KEYS, CACHE_TTL } from "@/lib/redis";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/utils";

interface ExtensionRequest {
  extensionId?: string;
  userId?: string;
  currentUrl: string;
  pageTitle?: string;
  productTitle?: string;
  productPrice?: number;
  storeName?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(req);
    const rateLimit = await checkRateLimit(
      ip,
      "/api/extension/detect",
      RATE_LIMITS.COMPARISON,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    const body: ExtensionRequest = await req.json();
    const {
      extensionId,
      userId,
      currentUrl,
      productTitle,
      productPrice,
      storeName,
    } = body;

    if (!productTitle) {
      return NextResponse.json(
        { error: "Product title required", comparison: null },
        { status: 400 },
      );
    }

    // Find product in database
    const product = await prisma.product.findFirst({
      where: {
        title: { contains: productTitle, mode: "insensitive" },
      },
      include: {
        prices: {
          include: { store: true },
          orderBy: { price: "asc" },
          take: 10,
        },
        offers: {
          include: { store: true },
          where: { validTill: { gt: new Date() }, active: true },
        },
        affiliateLinks: {
          include: { store: true },
          where: { active: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({
        found: false,
        message: "Product not in database",
        comparison: null,
      });
    }

    // Get bank offers
    const bankOffers = await prisma.bankOffer.findMany({
      where: {
        active: true,
        validTill: { gt: new Date() },
      },
      take: 5,
    });

    // Get best prices by store
    const bestPrices = product.prices.slice(0, 5).map((p) => ({
      store: p.store.displayName,
      logo: p.store.logo,
      price: p.price,
      discount: p.discount,
      affiliateUrl: product.affiliateLinks.find((a) => a.storeId === p.storeId)
        ?.affiliateUrl,
    }));

    const response = {
      found: true,
      product: {
        id: product.id,
        title: product.title,
        image: product.imageUrl,
        brand: product.brand,
      },
      bestPrice: bestPrices[0]?.price || product.minPrice,
      alternatives: bestPrices.slice(1, 4),
      bankOffers: bankOffers?.slice(0, 3) || [],
      priceDropAlert: {
        enabled: false,
        message: "Set price alert to get notified",
      },
    };

    // Log extension event
    if (userId) {
      await prisma.extensionEvent.create({
        data: {
          userId,
          eventType: "comparison_viewed",
          productUrl: currentUrl,
          productTitle: product.title,
          storeName: storeName,
        },
      });
    }

    // Cache response
    const cacheKey = CACHE_KEYS.EXTENSION_CACHE(extensionId || "anonymous");
    await redis.setex(cacheKey, CACHE_TTL.PRICES, JSON.stringify(response));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Extension detect error:", error);
    return NextResponse.json(
      { error: "Failed to detect product" },
      { status: 500 },
    );
  }
}
