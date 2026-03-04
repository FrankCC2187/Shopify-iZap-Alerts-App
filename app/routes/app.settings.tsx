// app/routes/app.settings.tsx
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);

  const shopSettings = await prisma.shop.findUnique({
    where: { shop: session.shop },
    select: { email: true, defaultThreshold: true },
  });

  return shopSettings || { email: "", defaultThreshold: 0 };
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const email = formData.get("email")?.toString();
  const threshold = parseInt(formData.get("threshold")?.toString() || "0", 10);

  let message = "Saved!";

  if (email) {
    await prisma.shop.upsert({
      where: { shop: session.shop },
      update: { email, defaultThreshold: threshold },
      create: { shop: session.shop, email, defaultThreshold: threshold },
    });
  } else {
    message = "Email is required.";
  }

  return { message };
}

export default function Settings() {
  const actionData = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Low Stock Settings</h1>

      {actionData?.message && (
        <p className="my-2 text-green-700">{actionData.message}</p>
      )}

      <Form method="post" className="space-y-4">
        <div>
          <label className="block mb-1">Notification Email:</label>
          <input
            type="email"
            name="email"
            defaultValue={data.email || ""}
            required
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label className="block mb-1">Default Stock Threshold:</label>
          <input
            type="number"
            name="threshold"
            min="0"
            defaultValue={data.defaultThreshold ?? 0}
            className="border p-2 w-full"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded"
        >
          Save
        </button>
      </Form>
    </div>
  );
}
