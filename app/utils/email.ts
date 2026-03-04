// app/utils/email.ts
import nodemailer from "nodemailer";
import prisma from "../db.server";

export async function sendLowStockAlert(
  shop: string,
  productId: string,
  available: number
) {
  // Fetch merchant’s email
  const merchant = await prisma.shop.findUnique({
    where: { shop },
  });

  if (!merchant?.email) {
    console.warn(`No email found for shop ${shop}, skipping alert.`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `"Low Stock Alerts" <${process.env.EMAIL_USER}>`,
    to: merchant.email, // 👈 send to merchant’s real email
    subject: `⚠️ Low Stock Alert`,
    text: `Product ${productId} is low on stock: only ${available} left.`,
  });
}

