import { DataSourcesClient } from "@/components/app/data-sources/data-sources-client";
import { ChevronRight } from "lucide-react";

export default function DataSourcesPage() {
    return (
        <div className="flex flex-col h-full">
             <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <span>DocuSage</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">Data Sources</span>
            </div>
            <div className="flex-1">
                <DataSourcesClient />
            </div>
        </div>
    );
}
