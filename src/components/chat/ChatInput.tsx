import { useState, useRef, useEffect } from "react";
import { Send, ImagePlus, X, Square, Mic, MicOff, Camera, Volume2, VolumeX, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceSettings, stopSpeaking } from "@/hooks/useVoiceSettings";
import { useLiveCamera } from "@/hooks/useLiveCamera";
import { toast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSend: (text: string, image?: File) => void;
  isLoading: boolean;
  onStop: () => void;
}

export function ChatInput({ onSend, isLoading, onStop }: ChatInputProps) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const { voiceEnabled, setVoiceEnabled, language } = useVoiceSettings();
  const { active: liveCamActive, setActive: setLiveCamActive } = useLiveCamera();

  // Setup SpeechRecognition
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = language;
    rec.onresult = (e: any) => {
      let transcript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      // Voice command detection for live camera
      const lower = transcript.toLowerCase().trim();
      const onCmds = ["turn on camera", "turn on the camera", "start camera", "start the camera", "open camera", "live camera on", "start live camera", "enable camera"];
      const offCmds = ["turn off camera", "turn off the camera", "stop camera", "stop the camera", "close camera", "live camera off", "stop live camera", "disable camera"];
      if (onCmds.some((c) => lower.includes(c))) {
        setLiveCamActive(true);
        setText("");
        try { rec.stop(); } catch {}
        return;
      }
      if (offCmds.some((c) => lower.includes(c))) {
        setLiveCamActive(false);
        setText("");
        try { rec.stop(); } catch {}
        return;
      }
      setText((prev) => (e.resultIndex === 0 ? transcript : prev + transcript));
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    return () => { try { rec.stop(); } catch {} };
  }, [language]);

  const toggleMic = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      toast({ title: "Voice input unavailable", description: "Your browser doesn't support speech recognition.", variant: "destructive" });
      return;
    }
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      try { rec.start(); setListening(true); } catch {}
    }
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({ title: "Invalid image", description: "Please upload JPG, PNG, GIF, or WebP." , variant: "destructive"});
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Max 10MB.", variant: "destructive" });
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  };

  const handleSend = () => {
    if (!text.trim() && !imageFile) return;
    onSend(text.trim(), imageFile || undefined);
    setText("");
    removeImage();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoiceOutput = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled) stopSpeaking();
    toast({ title: voiceEnabled ? "Voice output off" : "Voice output on" });
  };

  return (
    <div className="glass-strong border-t border-border/50 px-4 py-3">
      {imagePreview && (
        <div className="mb-2 relative inline-block animate-fade-up">
          <img src={imagePreview} alt="Preview" className="h-16 rounded-lg object-cover border border-border/50" />
          <button
            onClick={removeImage}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:scale-110 transition-transform"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="max-w-3xl mx-auto flex items-end gap-2">
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => fileRef.current?.click()} disabled={isLoading} className="h-9 w-9 rounded-lg hover:bg-accent/50" title="Upload image">
            <ImagePlus className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => cameraRef.current?.click()} disabled={isLoading} className="h-9 w-9 rounded-lg hover:bg-accent/50" title="Take photo">
            <Camera className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLiveCamActive(!liveCamActive)}
            className={`h-9 w-9 rounded-lg hover:bg-accent/50 ${liveCamActive ? "bg-primary/20" : ""}`}
            title={liveCamActive ? "Stop live navigation camera" : "Start live navigation camera (say 'turn on camera')"}
          >
            <Eye className={`h-4 w-4 ${liveCamActive ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMic}
            disabled={isLoading}
            className={`h-9 w-9 rounded-lg hover:bg-accent/50 ${listening ? "bg-destructive/20 animate-pulse" : ""}`}
            title={listening ? "Stop listening" : "Voice input"}
          >
            {listening ? <MicOff className="h-4 w-4 text-destructive" /> : <Mic className="h-4 w-4 text-muted-foreground" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleVoiceOutput}
            className="h-9 w-9 rounded-lg hover:bg-accent/50"
            title={voiceEnabled ? "Voice output on" : "Voice output off"}
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          </Button>
        </div>

        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={listening ? "Listening..." : imageFile ? "Ask about this image..." : "Message your AI chatbot..."}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-border/50 bg-muted/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 max-h-32 transition-all"
          style={{ minHeight: "40px" }}
          disabled={isLoading}
        />

        {isLoading ? (
          <Button variant="destructive" size="icon" onClick={onStop} className="h-9 w-9 rounded-lg flex-shrink-0">
            <Square className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="icon" onClick={handleSend} disabled={!text.trim() && !imageFile} className="h-9 w-9 rounded-lg flex-shrink-0">
            <Send className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
