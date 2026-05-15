// Animated typing indicator shown while AI is responding
import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-2 animate-message-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted">
        <Bot className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="bg-chat-bot border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-typing-dot" style={{ animationDelay: "0s" }} />
          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-typing-dot" style={{ animationDelay: "0.2s" }} />
          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-typing-dot" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>
    </div>
  );
}
