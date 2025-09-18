"use client";

import clippyLogo from "@/assets/images/clippy-logo.png";
import HeroGeometric from "@/components/sections/HeroGeometric";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSEO } from "@/hooks/useSEO";
import { motion, useScroll, useTransform } from "framer-motion";
import {
    ArrowRight,
    Clock,
    Code,
    Folder,
    Github,
    Globe,
    Heart,
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
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  
  // SEO optimization
  useSEO({
    title: "Clippy - Your Clipboard, Everywhere | Free Open Source Clipboard Manager",
    description: "The most powerful clipboard manager that syncs across all your devices. Never lose important content again with smart organization, instant search, and end-to-end encryption. Free and open source.",
    keywords: "clipboard manager, sync, productivity, cross-platform, clipboard history, copy paste, organize clips, open source, free, encryption, code snippets, productivity tool",
    url: "https://clippy.app/",
    image: "https://clippy.app/clippy-logo.png",
    type: "website",
    tags: ["clipboard", "productivity", "sync", "open source", "encryption", "cross-platform"]
  });
  
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: Zap,
      title: "Instant Sync",
      description: "Your clipboard items sync instantly across all your devices with real-time updates",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: Shield,
      title: "End-to-End Encrypted",
      description: "Your data is encrypted before leaving your device. We can't see your clipboard content",
      color: "from-green-400 to-blue-500"
    },
    {
      icon: Search,
      title: "Powerful Search",
      description: "Find any clipboard item instantly with our lightning-fast search and smart filters",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: Smartphone,
      title: "Cross-Platform",
      description: "Works seamlessly on Windows, macOS, Linux, iOS, Android, and web browsers",
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: Tag,
      title: "Smart Organization",
      description: "Organize clips with tags, folders, and boards. Auto-categorization with AI",
      color: "from-indigo-400 to-purple-500"
    },
    {
      icon: Star,
      title: "Favorites & Pins",
      description: "Pin frequently used items and mark favorites for quick access anytime",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: Code,
      title: "Code Snippets",
      description: "Syntax highlighting for code, formatted previews, and smart language detection",
      color: "from-red-400 to-pink-500"
    },
    {
      icon: Image,
      title: "Rich Content",
      description: "Support for text, images, links, files, and rich formatted content",
      color: "from-green-400 to-blue-500"
    },
    {
      icon: Link,
      title: "Smart Previews",
      description: "Automatic link previews, image thumbnails, and content-aware suggestions",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: Folder,
      title: "Multiple Boards",
      description: "Create separate boards for work, personal, projects, and different contexts",
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: Clock,
      title: "Full History",
      description: "Never lose anything with complete clipboard history and timeline view",
      color: "from-red-400 to-pink-500"
    },
    {
      icon: Keyboard,
      title: "Keyboard Shortcuts",
      description: "Lightning-fast access with customizable hotkeys and productivity shortcuts",
      color: "from-indigo-400 to-purple-500"
    }
  ];

  const githubStats = [
    { icon: Github, label: "Open Source", value: "100% Free" },
    { icon: Star, label: "GitHub Stars", value: "⭐ Star Us" },
    { icon: Heart, label: "Community", value: "Contributors Welcome" },
    { icon: Globe, label: "Platforms", value: "All Devices" }
  ];

  // Selection state management
  const [selectedFeatures, setSelectedFeatures] = useState<Set<number>>(new Set());
  const [selectedCommunity, setSelectedCommunity] = useState<Set<number>>(new Set());

  // Selection helper functions
  const toggleFeatureSelection = (index: number) => {
    setSelectedFeatures(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleCommunitySelection = (index: number) => {
    setSelectedCommunity(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const clearAllSelections = () => {
    setSelectedFeatures(new Set());
    setSelectedCommunity(new Set());
  };

  // Selection state for UI
  const featuresSelection = useMemo(() => {
    if (selectedFeatures.size === 0) return new Set([]);
    if (selectedFeatures.size === features.length) return "all";
    return selectedFeatures;
  }, [selectedFeatures, features.length]);

  const communitySelection = useMemo(() => {
    if (selectedCommunity.size === 0) return new Set([]);
    if (selectedCommunity.size === 3) return "all"; // 3 community cards
    return selectedCommunity;
  }, [selectedCommunity]);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative dark" data-theme="dark">
      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundSize: '256px 256px'
      }} />
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          style={{ y }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        />
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]) }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-indigo-600/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        />
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]) }}
          className="absolute top-40 left-1/2 w-96 h-96 bg-gradient-to-r from-emerald-600/20 to-teal-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        />
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "50%"]) }}
          className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-r from-violet-600/15 to-purple-500/15 rounded-full mix-blend-multiply filter blur-3xl opacity-25"
        />
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]) }}
          className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-teal-600/15 to-cyan-500/15 rounded-full mix-blend-multiply filter blur-3xl opacity-25"
        />
      </div>

      {/* Sticky Glassmorphism Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-4 left-0 right-0 z-50 w-full px-4"
      >
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 shadow-2xl">
            <div className="flex items-center justify-between w-full">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img 
                  src={clippyLogo} 
                  alt="Clippy Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
                Clippy
              </span>
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-300 hover:text-blue-300 transition-colors px-3 py-2 rounded-lg hover:bg-white/5">Features</a>
              <a href="#community" className="text-gray-300 hover:text-blue-300 transition-colors px-3 py-2 rounded-lg hover:bg-white/5">Community</a>
              <a href="https://github.com/Quatadah/syncopy-suite" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center px-3 py-2 rounded-lg hover:bg-white/5">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </a>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="from-blue-600 to-cyan-600 shadow-blue-500/10 hover:from-blue-700 rounded-full border-none bg-gradient-to-r shadow-md hover:to-cyan-700"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <HeroGeometric 
        badge="Free & Open Source"
        title1="Your Clipboard,"
        title2="Everywhere"
      />

      {/* Selection Toolbar */}
      {(selectedFeatures.size > 0 || selectedCommunity.size > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="text-white text-sm font-medium">
                {selectedFeatures.size + selectedCommunity.size} item{selectedFeatures.size + selectedCommunity.size !== 1 ? 's' : ''} selected
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={clearAllSelections}
                className="border-white/20 text-white bg-white/5 hover:bg-white/10"
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* GitHub Stats Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
          >
            {githubStats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center group cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-16 h-16 mx-auto mb-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/10 group-hover:border-blue-400/30 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  <stat.icon className="w-8 h-8 text-blue-400 group-hover:text-blue-300" />
                </div>
                <div className="text-lg font-bold text-white group-hover:text-blue-100 transition-colors duration-300">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32 px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-6">
              Powerful{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Features
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-4">
              Everything you need to supercharge your productivity and keep your important content organized across all devices.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {features.map((feature, index) => {
              const isSelected = selectedFeatures.has(index);
              return (
                <motion.div key={index} variants={fadeInUp}>
                  <Card 
                    className={`
                      backdrop-blur-xl transition-all duration-500 group h-full relative overflow-hidden cursor-pointer
                      ${isSelected 
                        ? 'bg-blue-500/20 border-blue-400/50 shadow-2xl shadow-blue-500/20 scale-105' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-white/5 hover:scale-105'
                      }
                    `}
                    onClick={() => toggleFeatureSelection(index)}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 z-20">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      </div>
                    )}
                    
                    {/* Glassmorphism overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-500 ${
                      isSelected 
                        ? 'from-blue-500/10 to-transparent opacity-100' 
                        : 'from-white/5 to-transparent opacity-0 group-hover:opacity-100'
                    }`} />
                    
                    <CardContent className="p-8 relative z-10">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-xl ${
                        isSelected ? 'scale-110 shadow-xl' : ''
                      }`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className={`text-2xl font-semibold mb-4 transition-colors duration-300 ${
                        isSelected ? 'text-blue-100' : 'text-white group-hover:text-white'
                      }`}>
                        {feature.title}
                      </h3>
                      <p className={`leading-relaxed transition-colors duration-300 ${
                        isSelected ? 'text-blue-200' : 'text-gray-300 group-hover:text-gray-100'
                      }`}>
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* GitHub Community Section */}
      <section id="community" className="relative z-10 py-32 px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Open Source{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Community
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built by developers, for developers. Join our open source community and help make Clippy even better.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Github,
                title: "Contribute",
                description: "Help improve Clippy by contributing code, reporting bugs, or suggesting new features.",
                buttonText: "View on GitHub",
                buttonAction: () => window.open('https://github.com/Quatadah/syncopy-suite', '_blank'),
                gradient: "from-blue-500 to-cyan-500",
                borderColor: "border-blue-400/30",
                bgColor: "bg-blue-500/10",
                hoverBg: "hover:bg-blue-500/20"
              },
              {
                icon: Star,
                title: "Star Us",
                description: "Show your support by starring our repository. It helps others discover Clippy.",
                buttonText: "Star Repository",
                buttonAction: () => window.open('https://github.com/Quatadah/syncopy-suite', '_blank'),
                gradient: "from-emerald-500 to-teal-500",
                borderColor: "border-emerald-400/30",
                bgColor: "bg-emerald-500/10",
                hoverBg: "hover:bg-emerald-500/20"
              },
              {
                icon: Heart,
                title: "Free Forever",
                description: "Clippy is completely free and open source. No subscriptions, no hidden costs, no limits.",
                buttonText: "Get Started",
                buttonAction: () => navigate('/dashboard'),
                gradient: "from-indigo-500 to-purple-500",
                borderColor: "border-indigo-400/30",
                bgColor: "bg-indigo-500/10",
                hoverBg: "hover:bg-indigo-500/20"
              }
            ].map((item, index) => {
              const isSelected = selectedCommunity.has(index);
              return (
                <motion.div key={index} variants={fadeInUp}>
                  <Card 
                    className={`
                      backdrop-blur-xl transition-all duration-500 group h-full relative overflow-hidden cursor-pointer
                      ${isSelected 
                        ? 'bg-blue-500/20 border-blue-400/50 shadow-2xl shadow-blue-500/20 scale-105' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-white/5 hover:scale-105'
                      }
                    `}
                    onClick={() => toggleCommunitySelection(index)}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 z-20">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      </div>
                    )}
                    
                    {/* Glassmorphism overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-500 ${
                      isSelected 
                        ? 'from-blue-500/10 to-transparent opacity-100' 
                        : 'from-white/5 to-transparent opacity-0 group-hover:opacity-100'
                    }`} />
                    
                    <CardContent className="p-8 text-center relative z-10">
                      <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-r ${item.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-xl ${
                        isSelected ? 'scale-110 shadow-xl' : ''
                      }`}>
                        <item.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className={`text-2xl font-semibold mb-4 transition-colors duration-300 ${
                        isSelected ? 'text-blue-100' : 'text-white group-hover:text-white'
                      }`}>
                        {item.title}
                      </h3>
                      <p className={`leading-relaxed mb-6 transition-colors duration-300 ${
                        isSelected ? 'text-blue-200' : 'text-gray-300 group-hover:text-gray-100'
                      }`}>
                        {item.description}
                      </p>
                      <Button 
                        variant="outline"
                        className={`${item.borderColor} text-white ${item.bgColor} ${item.hoverBg} backdrop-blur-sm hover:scale-105 transition-all duration-300 ${
                          isSelected ? 'border-blue-400/50 bg-blue-500/20' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          item.buttonAction();
                        }}
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.buttonText}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              Ready to{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Transform
              </span>{" "}
              Your Workflow?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join our open source community and start using the most powerful free clipboard manager.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="from-blue-600 to-cyan-600 shadow-blue-500/10 hover:from-blue-700 rounded-full border-none bg-gradient-to-r shadow-md hover:to-cyan-700 text-lg px-8 py-4 h-auto group hover:scale-105 transition-all duration-300"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 h-auto border-blue-400/30 text-white bg-blue-500/10 hover:bg-blue-500/20 backdrop-blur-sm hover:scale-105 transition-all duration-300 rounded-full"
                onClick={() => window.open('https://github.com/Quatadah/syncopy-suite', '_blank')}
              >
                <Github className="w-5 h-5 mr-2" />
                View on GitHub
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-20 px-6 border-t border-gray-700/50">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl overflow-hidden">
                  <img 
                    src={clippyLogo} 
                    alt="Clippy Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                  Clippy
                </span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
                A powerful, free clipboard manager that syncs across all your devices. 
                Open source and built by developers, for developers.
              </p>
              <div className="flex space-x-4">
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="from-blue-600 to-cyan-600 shadow-blue-500/10 hover:from-blue-700 rounded-full border-none bg-gradient-to-r shadow-md hover:to-cyan-700"
                >
                  Get Started
                </Button>
                <Button 
                  variant="outline" 
                  className="border-blue-400/30 text-white bg-blue-500/10 hover:bg-blue-500/20 backdrop-blur-sm rounded-full"
                  onClick={() => window.open('https://github.com/Quatadah/syncopy-suite', '_blank')}
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#features" className="hover:text-blue-300 transition-colors">Features</a></li>
                <li><a href="#community" className="hover:text-blue-300 transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-blue-300 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-blue-300 transition-colors">Extension</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Open Source</h3>
              <ul className="space-y-3 text-gray-300">
                <li><a href="https://github.com/Quatadah/syncopy-suite" className="hover:text-blue-300 transition-colors flex items-center" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  Repository
                </a></li>
                <li><a href="https://github.com/Quatadah/syncopy-suite/issues" className="hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">Report Bug</a></li>
                <li><a href="https://github.com/Quatadah/syncopy-suite/discussions" className="hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">Discussions</a></li>
                <li><a href="https://github.com/Quatadah/syncopy-suite/blob/main/README.md" className="hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">Documentation</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700/50 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Clippy. Open source and free forever.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
              <a href="https://github.com/Quatadah/syncopy-suite/blob/main/LICENSE" className="hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">License</a>
              <a href="https://github.com/Quatadah/syncopy-suite/blob/main/PRIVACY.md" className="hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">Privacy</a>
              <a href="https://github.com/Quatadah/syncopy-suite/blob/main/CONTRIBUTING.md" className="hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">Contributing</a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Bottom Gradient Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black to-black/80 via-transparent" />
    </div>
  );
};

export default Landing;