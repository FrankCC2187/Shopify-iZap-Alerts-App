import prisma from "../db.server";
import nodemailer from "nodemailer";

export async function inventoryUpdateHandler(topic: string, shop: string, body: string) {
  const payload = JSON.parse(body);
  const { inventory_item_id, available } = payload;

  // Check product-specific threshold first
  const threshold = await prisma.threshold.findFirst({
    where: { productId: inventory_item_id.toString() },
  });

  // Get shop settings
  const shopSettings = await prisma.shop.findUnique({
    where: { shop },
    select: { email: true, defaultThreshold: true },
  });

  // Decide which threshold to use
  const activeThreshold = threshold?.threshold ?? shopSettings?.defaultThreshold ?? null;

  if (activeThreshold !== null && available < activeThreshold) {
    await sendLowStockAlert(shopSettings?.email || "merchant@example.com", inventory_item_id, available);
  }
}

async function sendLowStockAlert(email: string, productId: string, available: number) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `"Low Stock Alerts" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `⚠️ Low Stock Alert`,
    text: `Product ${productId} is low on stock: only ${available} left.`,
  });
}
