import { Bot, ArrowRight, Sparkles, Image, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onStartChat: () => void;
}

export function HeroSection({ onStartChat }: HeroSectionProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl text-center space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-muted-foreground animate-fade-up">
          <Sparkles className="h-3 w-3 text-primary" />
          Powered by Advanced AI Vision
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight animate-fade-up" style={{ animationDelay: "0.1s" }}>
          Ask, Upload, and{" "}
          <span className="text-primary">Understand</span>{" "}
          Instantly
        </h1>

        {/* Subheading */}
        <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
          AI-powered chatbot with image recognition. Upload any image and get
          intelligent, context-aware responses in real-time.
        </p>

        {/* CTA */}
        <div className="flex items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <Button
            size="lg"
            onClick={onStartChat}
            className="gap-2 rounded-xl text-sm px-6 h-11 animate-pulse-glow"
          >
            Start Chat
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Demo preview */}
        <div className="mt-10 glass rounded-2xl p-4 max-w-md mx-auto animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <div className="space-y-3">
            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-3 py-2 text-xs max-w-[70%]">
                What's in this image?
              </div>
            </div>
            {/* Bot message */}
            <div className="flex justify-start gap-2">
              <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                <Bot className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="bg-muted/50 rounded-2xl rounded-bl-md px-3 py-2 text-xs text-foreground max-w-[70%]">
                I can see a beautiful landscape with mountains and a sunset...
              </div>
            </div>
            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-3 py-2 text-xs max-w-[70%]">
                Can you identify the location?
              </div>
            </div>
          </div>

          {/* Features row */}
          <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Image className="h-3 w-3" /> Image Recognition
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <MessageSquare className="h-3 w-3" /> Context-Aware
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
