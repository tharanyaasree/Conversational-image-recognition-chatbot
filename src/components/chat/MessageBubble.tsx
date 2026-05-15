import { Bot, User } from "lucide-react";
import type { Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-2.5 animate-message-in ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
          isUser ? "bg-primary" : "bg-muted"
        }`}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-primary-foreground" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>

      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-200 ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "glass text-foreground rounded-bl-md"
        }`}
      >
        {message.image_url && (
          <div className="mb-2">
            <img
              src={message.image_url}
              alt="Uploaded"
              className="rounded-lg max-h-52 w-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.image_url!, "_blank")}
            />
          </div>
        )}

        {message.content && (
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </p>
        )}

        <p
          className={`text-[10px] mt-1 ${
            isUser ? "text-primary-foreground/60" : "text-muted-foreground"
          } text-right`}
        >
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}
