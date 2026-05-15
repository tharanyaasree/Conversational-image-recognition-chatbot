import { Bot, Moon, Sun, LogIn, UserPlus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface NavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Navbar({ isDark, onToggleTheme }: NavbarProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out" });
  };

  const initial =
    ((user?.user_metadata as any)?.full_name?.[0] || user?.email?.[0] || "U").toUpperCase();

  return (
    <nav className="glass-strong sticky top-0 z-50 border-b border-border/50">
      <div className="flex items-center justify-between h-14 px-4 md:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary animate-pulse-glow">
            <Bot className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground hidden sm:block">
            Conversational Image AI Chatbot
          </span>
          <span className="text-sm font-semibold text-foreground sm:hidden">
            AI Chatbot
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onToggleTheme} className="h-8 w-8 rounded-lg">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {user ? (
            <>
              <div
                className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold"
                title={user.email || ""}
              >
                {initial}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="h-8 gap-1.5 rounded-lg text-xs border-border/50 hover:bg-accent/50"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/login")}
                className="h-8 gap-1.5 rounded-lg text-xs border-border/50 hover:bg-accent/50"
              >
                <LogIn className="h-3.5 w-3.5" />
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/register")}
                className="h-8 gap-1.5 rounded-lg text-xs"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
