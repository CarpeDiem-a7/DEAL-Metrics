// src/lib/price-scraper.ts
// Service for fetching and caching product prices from e-commerce platforms
import { prisma } from "./prisma";
import redis from "./redis";
import { CACHE_KEYS, CACHE_TTL } from "./redis";

interface PriceData {
  storeId: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  inStock: boolean;
  url: string;
}

/**
 * Main function to update prices for a product
 */
export async function updateProductPrices(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) return null;

    const prices: PriceData[] = [];

    // Fetch from each platform (simplified - use actual APIs)
    // prices.push(await fetchAmazonPrice(product));
    // prices.push(await fetchFlipkartPrice(product));
    // etc.

    // For demo, use mock data
    prices.push({
      storeId: "amazon",
      price: Math.floor(product.minPrice * 0.95),
      discount: 5,
      inStock: true,
      url: `https://amazon.in/s?k=${encodeURIComponent(product.title)}`,
    });

    // Save to database
    const records = await Promise.all(
      prices.map(async (p) => {
        const store = await prisma.store.findUnique({
          where: { name: p.storeId },
        });

        if (!store) return null;

        return prisma.price.create({
          data: {
            productId,
            storeId: store.id,
            price: p.price,
            originalPrice: p.originalPrice,
            discount: p.discount,
            inStock: p.inStock,
            url: p.url,
            recordedAt: new Date(),
          },
        });
      }),
    );

    // Update product min/max prices
    const allPrices = prices.map((p) => p.price);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);

    await prisma.product.update({
      where: { id: productId },
      data: {
        minPrice,
        maxPrice,
        lowestEverPrice: Math.min(
          product.lowestEverPrice || minPrice,
          minPrice,
        ),
      },
    });

    // Cache update
    const cacheKey = CACHE_KEYS.PRODUCT(productId);
    await redis.del(cacheKey);

    return records.filter((r) => r !== null);
  } catch (error) {
    console.error("Price scraping error:", error);
    throw error;
  }
}

/**
 * Trigger price alerts for users
 */
export async function triggerPriceAlerts() {
  try {
    const alerts = await prisma.priceAlert.findMany({
      where: {
        isActive: true,
        notified: false,
      },
      include: {
        product: {
          include: {
            prices: {
              orderBy: { recordedAt: "desc" },
              take: 1,
            },
          },
        },
        user: true,
      },
    });

    for (const alert of alerts) {
      const latestPrice =
        alert.product.prices[0]?.price || alert.product.minPrice;

      let shouldAlert = false;

      if (alert.alertType === "below") {
        shouldAlert = latestPrice <= alert.targetPrice;
      } else if (
        alert.alertType === "drop_percentage" &&
        alert.dropPercentage
      ) {
        const priceDropPercent =
          ((alert.product.maxPrice - latestPrice) / alert.product.maxPrice) *
          100;
        shouldAlert = priceDropPercent >= alert.dropPercentage;
      }

      if (shouldAlert) {
        // Create notification
        await prisma.notification.create({
          data: {
            userId: alert.user.id,
            type: "price_alert",
            title: `Price Alert: ${alert.product.title}`,
            message: `Price dropped to ₹${latestPrice.toLocaleString()}!`,
            link: `/products/${alert.product.slug}`,
            sentVia: ["email", "push"],
          },
        });

        // Mark alert as notified
        await prisma.priceAlert.update({
          where: { id: alert.id },
          data: {
            notified: true,
            notificationSentAt: new Date(),
          },
        });
      }
    }

    return { processed: alerts.length };
  } catch (error) {
    console.error("Alert trigger error:", error);
    throw error;
  }
}

/**
 * Batch update all products' prices
 */
export async function updateAllPrices() {
  try {
    const products = await prisma.product.findMany({
      where: { verified: true },
      select: { id: true },
    });

    const results = await Promise.allSettled(
      products.map((p) => updateProductPrices(p.id)),
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(
      `Price update complete: ${successful} successful, ${failed} failed`,
    );

    return { successful, failed, total: products.length };
  } catch (error) {
    console.error("Batch price update error:", error);
    throw error;
  }
}
