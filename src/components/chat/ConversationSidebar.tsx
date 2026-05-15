import { useEffect, useState } from "react";
import {
  MessageSquare, Plus, Trash2, Search, Image as ImageIcon, Bookmark,
  Settings, User, ChevronLeft, LogOut, Moon, Sun, BookmarkCheck,
  Volume2, Languages, Download, Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "@/hooks/use-toast";
import { useVoiceSettings, LANGUAGES } from "@/hooks/useVoiceSettings";
import type { Conversation } from "@/types/chat";

interface ConversationSidebarProps {
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  isOpen: boolean;
  onClose: () => void;
}

type Filter = "all" | "saved" | "images";

export function ConversationSidebar({
  activeId,
  onSelect,
  onNew,
  isOpen,
  onClose,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<(Conversation & { is_saved?: boolean })[]>([]);
  const [imageMessages, setImageMessages] = useState<{ id: string; image_url: string; conversation_id: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [showImages, setShowImages] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isDark, toggle: toggleTheme } = useTheme();
  const { voiceEnabled, setVoiceEnabled, language, setLanguage } = useVoiceSettings();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });
      if (data) setConversations(data as any);
    };
    load();

    const channel = supabase
      .channel("conversations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => load()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadImages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("id, image_url, conversation_id")
      .not("image_url", "is", null)
      .order("created_at", { ascending: false });
    if (data) setImageMessages(data as any);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await supabase.from("conversations").delete().eq("id", id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleSaved = async (e: React.MouseEvent, conv: Conversation & { is_saved?: boolean }) => {
    e.stopPropagation();
    const next = !conv.is_saved;
    await supabase.from("conversations").update({ is_saved: next } as any).eq("id", conv.id);
    setConversations((prev) => prev.map((c) => c.id === conv.id ? { ...c, is_saved: next } : c));
    toast({ title: next ? "Chat saved" : "Removed from saved" });
  };

  const filtered = conversations
    .filter((c) => filter !== "saved" || c.is_saved)
    .filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSignOut = async () => {
    await signOut();
    setShowProfile(false);
    toast({ title: "Signed out" });
    navigate("/login");
  };

  const handleClearAll = async () => {
    if (!confirm("Delete all conversations? This cannot be undone.")) return;
    await supabase.from("conversations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setConversations([]);
    setShowSettings(false);
    toast({ title: "All chats cleared" });
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed md:relative z-50 top-0 left-0 h-full w-72 glass-strong flex flex-col transition-all duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <Button onClick={onNew} className="flex-1 gap-2 h-9 rounded-lg text-sm">
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden h-9 w-9 ml-2">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-muted/50 border border-border/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        <div className="px-3 py-1 flex items-center justify-between">
          <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
            {filter === "saved" ? "Saved Chats" : "Recent Chats"}
          </p>
          {filter === "saved" && (
            <button onClick={() => setFilter("all")} className="text-[10px] text-primary hover:underline">
              Show all
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 scrollbar-thin">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground mt-8">
              {searchQuery ? "No matching chats" : filter === "saved" ? "No saved chats" : "No conversations yet"}
            </p>
          ) : (
            filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => { onSelect(conv.id); onClose(); }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs transition-all duration-200 group mb-0.5 ${
                  activeId === conv.id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "hover:bg-muted/50 text-foreground"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                <span className="truncate flex-1">{conv.title}</span>
                <button
                  onClick={(e) => toggleSaved(e, conv)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                  title={conv.is_saved ? "Unsave" : "Save chat"}
                >
                  {conv.is_saved
                    ? <BookmarkCheck className="h-3 w-3 text-primary" />
                    : <Bookmark className="h-3 w-3 text-muted-foreground" />}
                </button>
                <button
                  onClick={(e) => handleDelete(e, conv.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </button>
              </button>
            ))
          )}
        </div>

        <div className="px-3 py-2 space-y-0.5 border-t border-border/50">
          <button
            onClick={async () => { await loadImages(); setShowImages(true); }}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <ImageIcon className="h-3.5 w-3.5" /> Images
          </button>
          <button
            onClick={() => setFilter(filter === "saved" ? "all" : "saved")}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors ${
              filter === "saved" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" /> Saved Chats
          </button>
        </div>

        <div className="px-3 py-2 border-t border-border/50 space-y-0.5">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Settings className="h-3.5 w-3.5" /> Settings
          </button>
          <button
            onClick={() => user ? setShowProfile(true) : navigate("/login")}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <User className="h-3.5 w-3.5" /> {user ? "Profile" : "Sign In"}
          </button>
        </div>
      </aside>

      {/* Images dialog */}
      <Dialog open={showImages} onOpenChange={setShowImages}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Uploaded Images</DialogTitle>
            <DialogDescription>All images from your chats</DialogDescription>
          </DialogHeader>
          {imageMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No images yet</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto">
              {imageMessages.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { onSelect(m.conversation_id); setShowImages(false); }}
                  className="aspect-square rounded-lg overflow-hidden border border-border/50 hover:opacity-80 transition"
                >
                  <img src={m.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Manage your preferences</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 text-sm">
                {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                Dark Mode
              </div>
              <Switch checked={isDark} onCheckedChange={toggleTheme} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 text-sm">
                <Volume2 className="h-4 w-4" />
                Voice Output
              </div>
              <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
            </div>

            <div className="p-3 rounded-lg border border-border/50 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Languages className="h-4 w-4" />
                Language
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full h-9 px-2 rounded-md bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground">Used for voice input & speech output.</p>
            </div>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                const data = JSON.stringify(conversations, null, 2);
                const blob = new Blob([data], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "conversations.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="h-4 w-4 mr-2" /> Export Chats
            </Button>

            <Button variant="destructive" className="w-full" onClick={handleClearAll}>
              <Trash2 className="h-4 w-4 mr-2" /> Clear All Conversations
            </Button>

            <div className="p-3 rounded-lg border border-border/50 flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Conversational Image AI Chatbot v1.0 — Powered by Lovable AI.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription>Your account details</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-border/50 space-y-1">
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-medium">{(user?.user_metadata as any)?.full_name || "—"}</p>
            </div>
            <div className="p-3 rounded-lg border border-border/50 space-y-1">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
            <Button variant="destructive" className="w-full" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
