import { useState, useCallback } from "react";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { LiveCamera } from "@/components/chat/LiveCamera";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { useChat } from "@/hooks/useChat";
import { useTheme } from "@/hooks/useTheme";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const { isDark, toggle: toggleTheme } = useTheme();
  const {
    messages,
    conversationId,
    isLoading,
    sendMessage,
    loadConversation,
    setMessages,
    setConversationId,
    stopGeneration,
  } = useChat();

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
  }, [setMessages, setConversationId]);

  const handleSelectConversation = useCallback(
    async (id: string) => {
      await loadConversation(id);
      setShowChat(true);
    },
    [loadConversation]
  );

  const handleStartChat = () => {
    setShowChat(true);
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Navbar isDark={isDark} onToggleTheme={toggleTheme} />
      <LiveCamera />

      {!showChat ? (
        <HeroSection onStartChat={handleStartChat} />
      ) : (
        <div className="flex flex-1 min-h-0">
          <ConversationSidebar
            activeId={conversationId}
            onSelect={handleSelectConversation}
            onNew={handleNewChat}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <main className="flex-1 min-w-0">
            <ChatContainer
              messages={messages}
              isLoading={isLoading}
              onSend={sendMessage}
              onStop={stopGeneration}
              onNewChat={handleNewChat}
              onToggleSidebar={() => setSidebarOpen(true)}
            />
          </main>
        </div>
      )}
    </div>
  );
};

export default Index;
