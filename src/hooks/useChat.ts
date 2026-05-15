// Custom hook for chat functionality: sending messages, streaming AI responses, managing history
import { useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { Message, AIMessage, ContentPart } from "@/types/chat";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Load messages for a conversation
  const loadConversation = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (data) {
      setMessages(data);
      setConversationId(convId);
    }
  }, []);

  // Start a new conversation
  const newConversation = useCallback(async () => {
    const { data } = await supabase
      .from("conversations")
      .insert({ title: "New Conversation" })
      .select()
      .single();
    if (data) {
      setConversationId(data.id);
      setMessages([]);
      return data.id;
    }
    return null;
  }, []);

  // Upload image to storage and return public URL
  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("chat-images")
      .upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("chat-images").getPublicUrl(path);
    return data.publicUrl;
  }, []);

  // Convert image URL to base64 for AI API
  const toBase64 = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  // Send a message with optional image
  const sendMessage = useCallback(
    async (text: string, imageFile?: File) => {
      setIsLoading(true);
      let convId = conversationId;

      // Create conversation if needed
      if (!convId) {
        const { data } = await supabase
          .from("conversations")
          .insert({ title: text.slice(0, 50) || "Image Chat" })
          .select()
          .single();
        if (!data) { setIsLoading(false); return; }
        convId = data.id;
        setConversationId(convId);
      }

      // Upload image if provided (requires authentication)
      let imageUrl: string | undefined;
      if (imageFile) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          const { toast } = await import("@/hooks/use-toast");
          toast({
            title: "Sign in required",
            description: "Please log in or register to upload images.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        try {
          imageUrl = await uploadImage(imageFile);
        } catch (e) {
          console.error("Image upload failed:", e);
          setIsLoading(false);
          return;
        }
      }

      // Save user message to DB
      const { data: userMsg } = await supabase
        .from("messages")
        .insert({
          conversation_id: convId,
          role: "user",
          content: text,
          image_url: imageUrl || null,
        })
        .select()
        .single();

      if (!userMsg) { setIsLoading(false); return; }

      setMessages((prev) => [...prev, userMsg]);

      // Build AI message history with context
      const allMessages = [...messages, userMsg];
      const aiMessages: AIMessage[] = [];

      for (const msg of allMessages) {
        if (msg.role === "user") {
          if (msg.image_url) {
            const base64 = await toBase64(msg.image_url);
            const parts: ContentPart[] = [
              { type: "image_url", image_url: { url: base64 } },
            ];
            if (msg.content) parts.unshift({ type: "text", text: msg.content });
            aiMessages.push({ role: "user", content: parts });
          } else {
            aiMessages.push({ role: "user", content: msg.content });
          }
        } else {
          aiMessages.push({ role: "assistant", content: msg.content });
        }
      }

      // Stream AI response
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: aiMessages }),
          signal: controller.signal,
        });

        if (!resp.ok || !resp.body) {
          const errData = await resp.json().catch(() => ({}));
          console.error("Chat API error:", errData);
          setIsLoading(false);
          return;
        }

        // Create placeholder assistant message
        let assistantContent = "";
        const tempId = crypto.randomUUID();
        const assistantMsg: Message = {
          id: tempId,
          conversation_id: convId!,
          role: "assistant",
          content: "",
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // Parse SSE stream
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newlineIdx: number;
          while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIdx);
            buffer = buffer.slice(newlineIdx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                assistantContent += delta;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === tempId ? { ...m, content: assistantContent } : m
                  )
                );
              }
            } catch {
              // partial JSON, skip
            }
          }
        }

        // Save assistant message to DB
        const { data: savedMsg } = await supabase
          .from("messages")
          .insert({
            conversation_id: convId,
            role: "assistant",
            content: assistantContent,
          })
          .select()
          .single();

        if (savedMsg) {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? savedMsg : m))
          );
        }

        // Update conversation title from first message
        if (allMessages.length <= 1) {
          await supabase
            .from("conversations")
            .update({ title: text.slice(0, 60) || "Image Chat", updated_at: new Date().toISOString() })
            .eq("id", convId);
        }
      } catch (e: any) {
        if (e.name !== "AbortError") console.error("Stream error:", e);
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [conversationId, messages, uploadImage]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    messages,
    conversationId,
    isLoading,
    sendMessage,
    loadConversation,
    newConversation,
    stopGeneration,
    setMessages,
    setConversationId,
  };
}
