import { useRef, useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";
import { Bot, Image, Code, FileText, Lightbulb } from "lucide-react";
import type { Message } from "@/types/chat";
import { speak, useVoiceSettings } from "@/hooks/useVoiceSettings";

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  onSend: (text: string, image?: File) => void;
  onStop: () => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
}

const suggestions = [
  { icon: Image, text: "Describe this image", color: "text-blue-400" },
  { icon: Code, text: "Help me with coding", color: "text-green-400" },
  { icon: FileText, text: "Summarize this content", color: "text-orange-400" },
  { icon: Lightbulb, text: "Solve this problem", color: "text-purple-400" },
];

export function ChatContainer({
  messages,
  isLoading,
  onSend,
  onStop,
  onNewChat,
  onToggleSidebar,
}: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSpokenRef = useRef<string | null>(null);
  const { voiceEnabled, language } = useVoiceSettings();

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  // Speak last assistant message when finished
  useEffect(() => {
    if (!voiceEnabled || isLoading) return;
    const last = messages[messages.length - 1];
    if (last && last.role === "assistant" && last.content && last.id !== lastSpokenRef.current) {
      lastSpokenRef.current = last.id;
      speak(last.content, language);
    }
  }, [messages, isLoading, voiceEnabled, language]);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader onNewChat={onNewChat} onToggleSidebar={onToggleSidebar} />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 animate-float">
              <Bot className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2 animate-fade-up">
              How can I help you today?
            </h2>
            <p className="text-sm text-muted-foreground mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Upload an image and ask me anything. I can identify objects,
              describe scenes, read text, and answer questions.
            </p>
            <div className="grid grid-cols-2 gap-3 w-full animate-fade-up" style={{ animationDelay: "0.2s" }}>
              {suggestions.map((s) => (
                <button
                  key={s.text}
                  onClick={() => onSend(s.text)}
                  className="glass flex items-center gap-2.5 px-4 py-3 rounded-xl text-left text-sm text-foreground hover:bg-accent/30 transition-all duration-200 hover:scale-[1.02] group"
                >
                  <s.icon className={`h-4 w-4 ${s.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-xs">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <TypingIndicator />
            )}
          </div>
        )}
      </div>

      <ChatInput onSend={onSend} isLoading={isLoading} onStop={onStop} />
    </div>
  );
}
