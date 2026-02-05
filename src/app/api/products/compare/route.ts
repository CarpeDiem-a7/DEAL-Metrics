// src/app/api/products/compare/route.ts
// Price comparison API endpoint
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { CACHE_KEYS, CACHE_TTL } from "@/lib/redis";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(req);
    const rateLimit = await checkRateLimit(
      ip,
      "/api/products/compare",
      RATE_LIMITS.COMPARISON,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", resetIn: rateLimit.resetIn },
        { status: 429 },
      );
    }

    const body = await req.json();
    const { productId, productTitle, productUrl, storeName } = body;

    if (!productId && !productTitle) {
      return NextResponse.json(
        { error: "Product ID or title required" },
        { status: 400 },
      );
    }

    // Check cache first
    let product;
    const cacheKey = CACHE_KEYS.PRODUCT(productId || "search");

    if (productId) {
      const cachedProduct = await redis.get(cacheKey);
      if (cachedProduct) {
        return NextResponse.json(JSON.parse(cachedProduct));
      }

      product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          prices: {
            include: { store: true },
            orderBy: { price: "asc" },
          },
          offers: { include: { store: true } },
          affiliateLinks: { include: { store: true } },
        },
      });
    } else {
      // Search by title
      product = await prisma.product.findFirst({
        where: {
          title: { contains: productTitle, mode: "insensitive" },
        },
        include: {
          prices: {
            include: { store: true },
            orderBy: { price: "asc" },
            take: 10,
          },
          offers: { include: { store: true } },
          affiliateLinks: { include: { store: true } },
        },
      });
    }

    if (!product) {
      return NextResponse.json(
        { error: "Product not found", similar: [] },
        { status: 404 },
      );
    }

    // Format response
    const comparison = {
      product: {
        id: product.id,
        title: product.title,
        slug: product.slug,
        description: product.description,
        image: product.imageUrl,
        brand: product.brand,
        rating: product.rating,
        reviewCount: product.reviewCount,
      },
      prices: product.prices.map((p) => ({
        store: p.store.displayName,
        storeName: p.store.name,
        logo: p.store.logo,
        price: p.price,
        originalPrice: p.originalPrice,
        discount: p.discount,
        inStock: p.inStock,
        url: p.url,
        affiliateUrl: product.affiliateLinks.find(
          (a) => a.storeId === p.storeId,
        )?.affiliateUrl,
        recordedAt: p.recordedAt,
      })),
      offers: product.offers.map((o) => ({
        title: o.title,
        description: o.description,
        store: o.store.displayName,
        validTill: o.validTill,
      })),
      bestPrice: product.prices[0]?.price || product.minPrice,
      priceDropPercentage: product.lowestEverPrice
        ? Math.round(
            ((product.prices[0]?.price - product.lowestEverPrice) /
              product.lowestEverPrice) *
              100,
          )
        : null,
    };

    // Cache the comparison
    await redis.setex(cacheKey, CACHE_TTL.PRICES, JSON.stringify(comparison));

    return NextResponse.json(comparison);
  } catch (error) {
    console.error("Product comparison error:", error);
    return NextResponse.json(
      { error: "Failed to compare prices" },
      { status: 500 },
    );
  }
}
