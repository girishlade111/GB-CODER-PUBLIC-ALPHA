import React from 'react';
import {
  Code2, Zap, Globe, Shield, Users, Brain, Sparkles, Lightbulb,
  Wrench, Instagram, Linkedin, Github, Codepen, Mail, Link,
  CheckCircle, Rocket, Target, Award, Heart, ArrowRight, ExternalLink,
  Layers, Palette, Smartphone, Clock
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const AboutPage: React.FC = () => {
  const { isDark } = useTheme();

  const keyBenefits = [
    {
      icon: <CheckCircle className="w-5 h-5" />,
      text: "Free to use - Lifetime free access",
      bgColor: isDark ? "bg-gray-800" : "bg-gray-100"
    },
    {
      icon: <Brain className="w-5 h-5" />,
      text: "AI powered suggestions",
      bgColor: isDark ? "bg-gray-800" : "bg-gray-100"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      text: "One-click code enhancement",
      bgColor: isDark ? "bg-gray-800" : "bg-gray-100"
    },
    {
      icon: <Globe className="w-5 h-5" />,
      text: "Live preview as you type",
      bgColor: isDark ? "bg-gray-800" : "bg-gray-100"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      text: "No login required",
      bgColor: isDark ? "bg-gray-800" : "bg-gray-100"
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      text: "Ad-free experience",
      bgColor: isDark ? "bg-gray-800" : "bg-gray-100"
    }
  ];

  const coreFeatures = [
    {
      icon: <Code2 className="w-7 h-7" />,
      title: "Write & Run Code",
      description: "Edit HTML, CSS, and JavaScript in a professional Monaco-based editor",
      bgColor: isDark ? "bg-gray-800" : "bg-white"
    },
    {
      icon: <Brain className="w-7 h-7" />,
      title: "AI Assistance",
      description: "Get intelligent suggestions to improve and optimize your code",
      bgColor: isDark ? "bg-gray-800" : "bg-white"
    },
    {
      icon: <Globe className="w-7 h-7" />,
      title: "Live Preview",
      description: "See your changes in real-time with instant browser rendering",
      bgColor: isDark ? "bg-gray-800" : "bg-white"
    },
    {
      icon: <Layers className="w-7 h-7" />,
      title: "Project Management",
      description: "Organize your work with projects and version history",
      bgColor: isDark ? "bg-gray-800" : "bg-white"
    }
  ];

  const aiCapabilities = [
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Smart Suggestions",
      description: "Real-time AI-powered recommendations for better code"
    },
    {
      icon: <Wrench className="w-6 h-6" />,
      title: "Auto Enhancement",
      description: "Automatically improve code quality and performance"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Context Aware",
      description: "AI understands your code context for relevant suggestions"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Best Practices",
      description: "Learn and apply industry-standard coding patterns"
    }
  ];

  const stats = [
    { value: "100%", label: "Browser-based", icon: <Globe className="w-5 h-5" /> },
    { value: "0$", label: "Forever Free", icon: <Heart className="w-5 h-5" /> },
    { value: "24/7", label: "Available", icon: <Clock className="w-5 h-5" /> },
    { value: "∞", label: "Possibilities", icon: <Rocket className="w-5 h-5" /> }
  ];

  const socialLinks = [
    {
      name: "Instagram",
      url: "https://www.instagram.com/girish_lade_/",
      icon: <Instagram className="w-5 h-5" />
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/girish-lade-075bba201/",
      icon: <Linkedin className="w-5 h-5" />
    },
    {
      name: "GitHub",
      url: "https://github.com/girishlade111",
      icon: <Github className="w-5 h-5" />
    },
    {
      name: "Codepen",
      url: "https://codepen.io/Girish-Lade-the-looper",
      icon: <Codepen className="w-5 h-5" />
    },
    {
      name: "Email",
      url: "mailto:girishlade111@gmail.com",
      icon: <Mail className="w-5 h-5" />
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'
    }`}>
      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About GB Coder - AI-Powered Online Code Editor",
          "description": "AI-powered online code editor & compiler for HTML, CSS, JS with live preview & smart suggestions",
          "url": window.location.href,
          "mainEntity": {
            "@type": "Organization",
            "name": "GB Coder",
            "founder": "Girish Lade",
            "foundingDate": "2024"
          }
        })}
      </script>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium mb-6 ${
              isDark ? 'bg-gray-800 text-gray-300 border border-gray-700' : 'bg-white text-gray-700 border border-gray-200'
            }`}>
              <Sparkles className="w-4 h-4" />
              AI-Powered Code Editor
            </div>

            {/* Main Heading */}
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Code Smarter with{' '}
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                AI Assistance
              </span>
            </h1>

            {/* Subtitle */}
            <p className={`text-xl sm:text-2xl max-w-3xl mx-auto mb-8 leading-relaxed ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Write, preview, and enhance HTML, CSS, and JavaScript instantly.
              The modern way to build for the web.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => window.location.href = '/'}
                className={`inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all duration-200 hover:scale-105 ${
                  isDark
                    ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                Start Coding
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="https://ladestack.in"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                  isDark
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Visit Website
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-12 border-y ${isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3 ${
                  isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                }`}>
                  {stat.icon}
                </div>
                <div className={`text-3xl font-bold mb-1 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {stat.value}
                </div>
                <div className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Everything You Need to Code
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              A complete development environment in your browser
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreFeatures.map((feature, index) => (
              <div
                key={index}
                className={`group p-6 rounded-lg border transition-all duration-300 hover:scale-105 ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-lg mb-4 ${
                  isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  {feature.icon}
                </div>
                <h3 className={`text-lg font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={`text-sm leading-relaxed ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className={`py-16 sm:py-24 ${isDark ? 'bg-gray-900/50' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Why Developers Love GB Coder
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Built for productivity, designed for simplicity
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {keyBenefits.map((benefit, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-200 hover:scale-105 ${benefit.bgColor}`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                  isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}>
                  {benefit.icon}
                </div>
                <span className={`font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {benefit.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Capabilities Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Powered by Advanced AI
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Intelligent features that help you write better code
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiCapabilities.map((capability, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg border text-center transition-all duration-300 hover:scale-105 ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${
                  isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  {capability.icon}
                </div>
                <h3 className={`text-lg font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {capability.title}
                </h3>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {capability.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Creator Section */}
      <section className={`py-16 sm:py-24 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg mb-6 ${
            isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'
          }`}>
            <Users className="w-8 h-8" />
          </div>

          <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Built by Developers, for Developers
          </h2>

          <p className={`text-lg leading-relaxed mb-6 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            GB Coder is created by <strong className={isDark ? 'text-gray-200' : 'text-gray-900'}>Girish Lade</strong>, an experienced programmer,
            AI tools maker, and UI/UX engineer. Our mission is to make coding faster, smarter, and more accessible
            using the power of artificial intelligence.
          </p>

          <div className={`p-6 rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <p className={`text-lg mb-4 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <span className="font-semibold">Explore more projects:</span>
            </p>
            <a
              href="https://ladestack.in"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 font-semibold text-lg transition-colors ${
                isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              ladestack.in
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Connect Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Connect With Us
          </h2>
          <p className={`text-lg mb-8 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Follow our journey and stay updated
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center gap-2 px-5 py-3 rounded-lg border-2 font-medium transition-all duration-200 hover:scale-105 ${
                  isDark
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {social.icon}
                <span>{social.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`relative overflow-hidden rounded-lg p-8 sm:p-12 text-center border ${
            isDark
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <div className="relative">
              <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Ready to Code Smarter?
              </h2>
              <p className={`text-lg mb-8 max-w-2xl mx-auto ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Join developers who are already building better with AI assistance.
                Start coding for free, no signup required.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className={`inline-flex items-center gap-2 px-8 py-4 font-semibold rounded-lg transition-all duration-200 hover:scale-105 ${
                  isDark
                    ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                Open Editor
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className={`py-8 border-t ${
        isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className={`text-sm ${
              isDark ? 'text-gray-500' : 'text-gray-600'
            }`}>
              © 2024 GB Coder. Built with ❤️ by Girish Lade.
            </p>
            <div className="flex items-center gap-6">
              <a href="/privacy" className={`text-sm hover:underline ${
                isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
              }`}>
                Privacy Policy
              </a>
              <a href="/terms" className={`text-sm hover:underline ${
                isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
              }`}>
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
