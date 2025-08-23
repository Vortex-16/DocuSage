import { PolicyCheckTool } from "@/components/app/policy-check/policy-check-tool";
import { ChevronRight } from "lucide-react";

export default function PolicyCheckPage() {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <span>DocuSage</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">Policy Check</span>
            </div>
            <div className="flex-1">
                <PolicyCheckTool />
            </div>
        </div>
    );
}
