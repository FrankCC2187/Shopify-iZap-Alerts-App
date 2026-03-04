import type { ActionFunctionArgs } from "@remix-run/node";
import { inventoryUpdateHandler } from "../webhooks/inventory";

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.text();
  const topic = request.headers.get("X-Shopify-Topic") || "";
  const shop = request.headers.get("X-Shopify-Shop-Domain") || "";

  console.log("\x1b[36m%s\x1b[0m", "📦 Webhook received!");
  console.log("\x1b[33mTopic:\x1b[0m", topic);
  console.log("\x1b[33mShop:\x1b[0m", shop);

  try {
    const parsed = JSON.parse(body);
    console.log("\x1b[32mPayload:\x1b[0m", JSON.stringify(parsed, null, 2));
  } catch {
    console.log("\x1b[31mFailed to parse body\x1b[0m", body);
  }

  await inventoryUpdateHandler(topic, shop, body);

  console.log("\x1b[32m✅ inventoryUpdateHandler completed successfully\x1b[0m");

  return new Response(null, { status: 200 });
};
