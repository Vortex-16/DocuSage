import { ChatInterface } from "@/components/app/chat/chat-interface";
import { ChevronRight } from "lucide-react";

export default function ChatPage() {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <span>DocuSage</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">Chat</span>
            </div>
            <div className="flex-1 -m-4 lg:-m-6">
                <ChatInterface />
            </div>
        </div>
    );
}
