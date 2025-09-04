import { BackLink } from "@/components/BackLink";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PricingTable } from "@/services/clerk/components/PricingTable";
import { AlertTriangle } from "lucide-react";

export default function UpgradePage() {
    return <div className="container py-4 max-w-6xl">
        <div className="mb-4">
            <BackLink href="/app">Back to Dashboard</BackLink>
        </div>

        <div className="space-y-16">
            <Alert variant="warning">
                <AlertTriangle className="sise-6" />
                <AlertTitle>Reached Plan Limit</AlertTitle>
                <AlertDescription>
                    You have reached the plan limit. Please upgrade to unlock all features.
                </AlertDescription>
            </Alert>
            <PricingTable />
        </div>
    </div>
}