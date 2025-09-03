import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export const PLAN_LIMIT_MESSAGE = "PLAN_LIMIT"
export const RATE_LIMIT_MESSAGE = "RATE_LIMIT"

export function errorToast(message: string) {
    if (message === PLAN_LIMIT_MESSAGE) {
        const toastId = toast.error("You've reached the plan limit", {
            action: <Button
                size='sm'
                asChild
                onClick={() => toast.dismiss(toastId)}
            >
                <Link href='/app/upgrade'>Upgrade</Link>
            </Button>
        })
        return
    }

    if (message === RATE_LIMIT_MESSAGE) {
        toast.error("Please slow down", {
            description: "You're making too many requests"
        })
        return
    }

    toast.error(message)
}