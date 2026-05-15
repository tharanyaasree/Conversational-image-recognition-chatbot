import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Bot, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: name },
        },
      });
      if (error) throw error;
      toast({ title: "Account created", description: "Welcome! You're now signed in." });
      navigate("/");
    } catch (err: any) {
      toast({
        title: "Sign up failed",
        description: err?.message ?? "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      <button
        type="button"
        onClick={handleBack}
        aria-label="Go back"
        className="fixed top-4 left-4 z-50 w-10 h-10 rounded-full border border-border bg-background/80 backdrop-blur flex items-center justify-center text-foreground hover:bg-accent transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      {/* Left - Promotion */}
      <div className="lg:w-[40%] bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center px-6 py-12 lg:py-0 relative overflow-hidden order-2 lg:order-1">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary-foreground/10 blur-xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-primary-foreground/5 blur-2xl" />

        <div className="relative z-10 text-center text-primary-foreground space-y-4 max-w-xs animate-fade-up">
          <h2 className="text-2xl font-bold">Welcome Back!</h2>
          <p className="text-sm text-primary-foreground/80 leading-relaxed">
            Already have an account? Sign in to continue your AI conversations.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate("/login")}
            className="rounded-xl border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 hover:text-primary-foreground"
          >
            Sign In
          </Button>
        </div>
      </div>

      {/* Right - Register Form */}
      <div className="flex-1 lg:w-[60%] flex items-center justify-center px-6 py-12 bg-background order-1 lg:order-2">
        <div className="w-full max-w-md space-y-8 animate-fade-up">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">AI Chatbot</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">Create Your Account</h1>
            <p className="text-sm text-muted-foreground mt-1">Get started with AI-powered image recognition</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 rounded-xl border border-border bg-muted/30 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 rounded-xl border border-border bg-muted/30 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              required
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                className="w-full h-11 rounded-xl border border-border bg-muted/30 px-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl text-sm font-semibold">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
