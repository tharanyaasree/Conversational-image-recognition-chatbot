import { Bot, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onNewChat: () => void;
  onToggleSidebar: () => void;
}

export function ChatHeader({ onNewChat, onToggleSidebar }: ChatHeaderProps) {
  return (
    <header className="glass-strong flex items-center justify-between px-4 py-2.5 border-b border-border/50">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="md:hidden h-8 w-8"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground flex items-center gap-1">
              New Chat
              <Sparkles className="h-3 w-3 text-primary" />
            </h1>
            <p className="text-[10px] text-muted-foreground">AI Vision Assistant</p>
          </div>
        </div>
      </div>
    </header>
  );
}
