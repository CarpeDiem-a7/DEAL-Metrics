// src/app/api/alerts/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productTitle, targetPrice, alertType, sourceUrl } = body;

    // Find or create product by title
    let product = await prisma.product.findFirst({
      where: {
        title: { contains: productTitle, mode: "insensitive" },
      },
    });

    if (!product) {
      // Create new product entry
      product = await prisma.product.create({
        data: {
          title: productTitle,
          slug: productTitle.toLowerCase().replace(/\s+/g, "-"),
          categoryId: "uncategorized", // Placeholder
          minPrice: targetPrice,
          maxPrice: targetPrice * 1.5,
          productType: "uncategorized",
        },
      });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create price alert
    const alert = await prisma.priceAlert.create({
      data: {
        userId: user.id,
        productId: product.id,
        targetPrice,
        alertType,
        dropPercentage: alertType === "drop_percentage" ? 10 : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      alertId: alert.id,
      message: `Price alert set for ₹${targetPrice}`,
    });
  } catch (error) {
    console.error("Alert creation error:", error);
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 },
    );
  }
}
