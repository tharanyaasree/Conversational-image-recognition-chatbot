// Type definitions for the chat application

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  image_url?: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

// Content part for multimodal AI messages
export interface TextContent {
  type: "text";
  text: string;
}

export interface ImageContent {
  type: "image_url";
  image_url: { url: string };
}

export type ContentPart = TextContent | ImageContent;

// AI API message format
export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string | ContentPart[];
}
