import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  Clipboard, 
  Zap, 
  Shield, 
  Smartphone,
  Monitor,
  Chrome
} from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="pt-32 pb-16 px-6 text-center">
      <div className="container mx-auto max-w-4xl">
        {/* Hero Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-surface rounded-full text-sm text-muted-foreground border mb-8 animate-fade-in">
          <Zap className="w-4 h-4 mr-2 text-primary" />
          Sync your clipboard across all devices
        </div>

        {/* Main Headlines */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
          Your Clipboard,{" "}
          <span className="gradient-text">Everywhere</span>
        </h1>

        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-slide-up [animation-delay:0.1s]">
          Never lose important clips again. ClipSync seamlessly syncs your clipboard 
          across all devices with powerful organization and instant search.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up [animation-delay:0.2s]">
          <Button 
            size="lg" 
            className="bg-gradient-hero hover:opacity-90 text-white text-lg px-8 py-3 h-auto"
            onClick={() => navigate('/dashboard')}
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 py-3 h-auto hover-lift"
          >
            <Chrome className="w-5 h-5 mr-2" />
            Add Extension
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center items-center gap-8 text-muted-foreground animate-fade-in [animation-delay:0.3s]">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-success" />
            <span>End-to-end encrypted</span>
          </div>
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-primary" />
            <span>Works on all devices</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clipboard className="w-5 h-5 text-accent" />
            <span>Unlimited clips</span>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mt-20 relative animate-scale-in [animation-delay:0.4s]">
          <div className="bg-gradient-card rounded-2xl p-8 shadow-large max-w-4xl mx-auto">
            <div className="bg-background rounded-xl p-6 shadow-medium">
              {/* Mock Dashboard Preview */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-destructive rounded-full"></div>
                  <div className="w-3 h-3 bg-warning rounded-full"></div>
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                </div>
                <div className="text-sm text-muted-foreground">ClipSync Dashboard</div>
              </div>
              
              <div className="space-y-3">
                {/* Mock clipboard items */}
                <div className="bg-surface p-4 rounded-lg border flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Monitor className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Meeting Notes</div>
                      <div className="text-sm text-muted-foreground">Copied 2 minutes ago</div>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse-glow"></div>
                </div>
                
                <div className="bg-surface p-4 rounded-lg border flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clipboard className="w-5 h-5 text-accent" />
                    <div>
                      <div className="font-medium">API Documentation Link</div>
                      <div className="text-sm text-muted-foreground">Copied 1 hour ago</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-surface p-4 rounded-lg border flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-warning" />
                    <div>
                      <div className="font-medium">Design Inspiration</div>
                      <div className="text-sm text-muted-foreground">Copied 3 hours ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;