// src/lib/utils.ts
import { NextRequest } from "next/server";

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return (forwarded?.split(",")[0].trim() || req.ip || "127.0.0.1") as string;
}

export function generateApiKey(): string {
  return (
    "dh_" +
    Buffer.from(Date.now() + Math.random().toString())
      .toString("base64")
      .substring(0, 32)
  );
}

export function generateAffiliateId(): string {
  return "aff_" + Math.random().toString(36).substring(2, 11);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

export function getDiscountPercentage(
  original: number,
  current: number,
): number {
  if (original <= 0) return 0;
  return Math.round(((original - current) / original) * 100);
}
