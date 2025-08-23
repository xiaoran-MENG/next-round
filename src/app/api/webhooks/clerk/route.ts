import { upsertUser, deleteUser } from "@/features/users/db";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const event = await verifyWebhook(request)

        switch (event.type) {
            case "user.created":
                case "user.updated":
                    const data = event.data
                    const email = data.email_addresses.find(e =>
                        e.id === data.primary_email_address_id
                    )?.email_address
                    
                    if (!email) return new Response("No primary email found", { status: 400 })

                    await upsertUser({
                        id: data.id,
                        name: `${data.first_name} ${data.last_name}`,
                        email,
                        imageUrl: data.image_url,
                        createdAt: new Date(data.created_at),
                        updatedAt: new Date(data.updated_at)
                    })
                    break
            case "user.deleted":
                if (!event.data.id) return new Response("No user ID found", { status: 400 })
                await deleteUser(event.data.id)
                break;
        }
    } catch  {
        return new Response("Invalid webhook signature", { status: 400 })
    }

    return new Response("Webhook received successfully", { status: 200 })
}