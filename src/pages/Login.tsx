import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Bot, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: "Welcome back!" });
      navigate("/");
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err?.message ?? "Invalid credentials",
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
      {/* Left - Login Form */}
      <div className="flex-1 lg:w-[60%] flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-up">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">AI Chatbot</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">Login to Your Account</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in with your email and password</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
            </Button>
          </form>
        </div>
      </div>

      {/* Right - Signup Promotion */}
      <div className="lg:w-[40%] bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center px-6 py-12 lg:py-0 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-primary-foreground/10 blur-xl" />
        <div className="absolute bottom-20 left-10 w-40 h-40 rounded-full bg-primary-foreground/5 blur-2xl" />

        <div className="relative z-10 text-center text-primary-foreground space-y-4 max-w-xs animate-fade-up">
          <h2 className="text-2xl font-bold">New Here?</h2>
          <p className="text-sm text-primary-foreground/80 leading-relaxed">
            Sign up and discover a great amount of new opportunities!
          </p>
          <Button
            variant="outline"
            onClick={() => navigate("/register")}
            className="rounded-xl border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 hover:text-primary-foreground"
          >
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
