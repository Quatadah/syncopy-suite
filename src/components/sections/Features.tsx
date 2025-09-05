import { Card, CardBody } from "@heroui/react";
import {
    Clock,
    Code,
    Folder,
    Image,
    Keyboard,
    Link,
    Search,
    Shield,
    Smartphone,
    Star,
    Tag,
    Zap
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: "Instant Sync",
      description: "Your clipboard items sync instantly across all your devices with real-time updates."
    },
    {
      icon: Shield,
      title: "End-to-End Encrypted",
      description: "Your data is encrypted before leaving your device. We can't see your clipboard content."
    },
    {
      icon: Search,
      title: "Powerful Search",
      description: "Find any clipboard item instantly with our lightning-fast search and smart filters."
    },
    {
      icon: Smartphone,
      title: "Cross-Platform",
      description: "Works seamlessly on Windows, macOS, Linux, iOS, Android, and web browsers."
    },
    {
      icon: Tag,
      title: "Smart Organization",
      description: "Organize clips with tags, folders, and boards. Auto-categorization with AI."
    },
    {
      icon: Star,
      title: "Favorites & Pins",
      description: "Pin frequently used items and mark favorites for quick access anytime."
    },
    {
      icon: Code,
      title: "Code Snippets",
      description: "Syntax highlighting for code, formatted previews, and smart language detection."
    },
    {
      icon: Image,
      title: "Rich Content",
      description: "Support for text, images, links, files, and rich formatted content."
    },
    {
      icon: Link,
      title: "Smart Previews",
      description: "Automatic link previews, image thumbnails, and content-aware suggestions."
    },
    {
      icon: Folder,
      title: "Multiple Boards",
      description: "Create separate boards for work, personal, projects, and different contexts."
    },
    {
      icon: Clock,
      title: "Full History",
      description: "Never lose anything with complete clipboard history and timeline view."
    },
    {
      icon: Keyboard,
      title: "Keyboard Shortcuts",
      description: "Lightning-fast access with customizable hotkeys and productivity shortcuts."
    }
  ];

  return (
    <section id="features" className="py-20 px-6 bg-surface/30">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything you need in a{" "}
            <span className="gradient-text">clipboard manager</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to supercharge your productivity 
            and keep your important content organized.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="hover-lift cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardBody className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            Ready to revolutionize your clipboard workflow?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-hero text-white px-8 py-3 rounded-lg text-lg font-medium hover:opacity-90 transition-opacity">
              Start Free Trial
            </button>
            <button className="border border-border px-8 py-3 rounded-lg text-lg font-medium hover:bg-surface transition-colors">
              View Pricing
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;