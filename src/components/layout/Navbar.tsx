import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Clipboard, 
  User, 
  Moon, 
  Sun, 
  Github, 
  Download 
} from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
            <Clipboard className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold">ClipSync</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#screenshots" className="text-muted-foreground hover:text-foreground transition-colors">
            Screenshots
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          
          <Button variant="ghost" className="hidden sm:flex items-center space-x-2">
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </Button>

          <Button variant="ghost" className="hidden sm:flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Extension</span>
          </Button>

          <Button variant="ghost" className="flex items-center space-x-2" asChild>
            <Link to="/auth">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          </Button>

          <Button 
            className="bg-gradient-hero hover:opacity-90 text-white"
            asChild
          >
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;