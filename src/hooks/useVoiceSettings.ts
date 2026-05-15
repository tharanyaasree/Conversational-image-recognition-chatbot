import { useEffect, useState } from "react";

export const LANGUAGES = [
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "es-ES", label: "Spanish" },
  { code: "fr-FR", label: "French" },
  { code: "de-DE", label: "German" },
  { code: "it-IT", label: "Italian" },
  { code: "pt-BR", label: "Portuguese (BR)" },
  { code: "hi-IN", label: "Hindi" },
  { code: "ta-IN", label: "Tamil" },
  { code: "te-IN", label: "Telugu" },
  { code: "ja-JP", label: "Japanese" },
  { code: "ko-KR", label: "Korean" },
  { code: "zh-CN", label: "Chinese (Simplified)" },
  { code: "ar-SA", label: "Arabic" },
  { code: "ru-RU", label: "Russian" },
];

type Listener = () => void;
const listeners = new Set<Listener>();

const state = {
  voiceEnabled: localStorage.getItem("voiceEnabled") === "true",
  language: localStorage.getItem("voiceLanguage") || "en-US",
};

function emit() {
  listeners.forEach((l) => l());
}

export function speak(text: string, lang: string) {
  if (!("speechSynthesis" in window) || !text) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

export function useVoiceSettings() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);

  return {
    voiceEnabled: state.voiceEnabled,
    language: state.language,
    setVoiceEnabled: (v: boolean) => {
      state.voiceEnabled = v;
      localStorage.setItem("voiceEnabled", String(v));
      if (!v) stopSpeaking();
      emit();
    },
    setLanguage: (l: string) => {
      state.language = l;
      localStorage.setItem("voiceLanguage", l);
      emit();
    },
  };
}
