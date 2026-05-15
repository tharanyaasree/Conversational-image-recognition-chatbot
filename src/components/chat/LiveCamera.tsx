import { useEffect, useRef, useState } from "react";
import { X, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLiveCamera } from "@/hooks/useLiveCamera";
import { speak, stopSpeaking, useVoiceSettings } from "@/hooks/useVoiceSettings";
import { toast } from "@/hooks/use-toast";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const INTERVAL_MS = 7000;

export function LiveCamera() {
  const { active, setActive } = useLiveCamera();
  const { language } = useVoiceSettings();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const busyRef = useRef(false);
  const [description, setDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  // Start/stop camera stream
  useEffect(() => {
    if (!active) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      stopSpeaking();
      setDescription("");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        toast({ title: "Live camera on", description: "Describing surroundings..." });
      } catch (e) {
        console.error(e);
        toast({ title: "Camera unavailable", description: "Please grant camera permission.", variant: "destructive" });
        setActive(false);
      }
    })();

    return () => { cancelled = true; };
  }, [active, setActive]);

  // Capture & analyze loop
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      if (!busyRef.current) analyzeFrame();
    }, INTERVAL_MS);
    // First analysis shortly after start
    const first = setTimeout(() => { if (!busyRef.current) analyzeFrame(); }, 1500);
    return () => { clearInterval(interval); clearTimeout(first); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, language]);

  const analyzeFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;
    busyRef.current = true;
    setAnalyzing(true);
    try {
      const w = 640;
      const h = (video.videoHeight / video.videoWidth) * w || 480;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.75);

      const prompt = `You are assisting a visually impaired person navigating their surroundings. In 1-2 short sentences, describe what is directly in front of them, mention obstacles, people, doors, stairs, or hazards, and give a brief navigation cue if needed. Respond in language code: ${language}. Be concise and clear.`;

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: dataUrl } },
              ],
            },
          ],
        }),
      });

      if (!resp.ok || !resp.body) return;
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl); buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") break;
          try {
            const d = JSON.parse(j).choices?.[0]?.delta?.content;
            if (d) full += d;
          } catch {}
        }
      }
      if (full) {
        setDescription(full);
        speak(full, language);
      }
    } catch (e) {
      console.error("Live cam analyze error:", e);
    } finally {
      busyRef.current = false;
      setAnalyzing(false);
    }
  };

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col animate-fade-up">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Eye className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Live Navigation Mode</h2>
            <p className="text-xs text-muted-foreground">AI describes your surroundings</p>
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={() => setActive(false)} className="rounded-lg">
          <X className="h-4 w-4 mr-1" /> Stop
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="relative max-w-2xl w-full">
          <video ref={videoRef} playsInline muted className="w-full rounded-2xl border border-border/50 shadow-lg" />
          <canvas ref={canvasRef} className="hidden" />
          {analyzing && (
            <div className="absolute top-3 right-3 glass-strong px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs">
              <Loader2 className="h-3 w-3 animate-spin text-primary" /> Analyzing
            </div>
          )}
        </div>
      </div>

      {description && (
        <div className="px-4 pb-6">
          <div className="max-w-2xl mx-auto glass-strong rounded-xl p-4 border border-border/50">
            <p className="text-sm text-foreground leading-relaxed">{description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
