import syncopyLogo from "@/assets/images/syncopy-logo.png";
import { Button } from "@heroui/react";
import {
    Download,
    Github,
    Moon,
    Sun,
    User
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden">
            <img 
              src={syncopyLogo} 
              alt="Syncopy Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xl font-semibold font-bricolage">
            Syncopy
          </span>
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
            size="sm"
            onClick={toggleTheme}
            className="rounded-full w-9 h-9 p-0"
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

          <Link to="/auth">
            <Button variant="ghost" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Button>
          </Link>

          <Link to="/auth">
            <Button className="bg-gradient-hero hover:opacity-90 text-white">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;