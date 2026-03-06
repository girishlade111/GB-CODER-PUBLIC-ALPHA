import React, { useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { Shield, Lock, Database, Globe, Mail } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  const { isDark } = useTheme();

  useEffect(() => {
    document.title = 'Privacy Policy - GB Coder';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <Shield className={`w-12 h-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </div>
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Privacy Policy
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Last updated: November 20, 2024
          </p>
        </div>

        {/* Content */}
        <div className={`rounded-lg border p-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {/* Introduction */}
          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Introduction
            </h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Welcome to GB Coder ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our AI-powered code editor.
            </p>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              GB Coder is a free, browser-based code editor that <strong>does not require login or registration</strong>. We prioritize user privacy and minimal data collection.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Database className="w-6 h-6 text-gray-400" />
              Information We Collect
            </h2>

            <h3 className={`text-xl font-semibold mb-3 mt-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>1. Information Stored Locally</h3>
            <p className={`mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              GB Coder stores the following data locally in your browser using LocalStorage:
            </p>
            <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li><strong>Code Content:</strong> Your HTML, CSS, and JavaScript code</li>
              <li><strong>Code Snippets:</strong> Saved code snippets with names, descriptions, and tags</li>
              <li><strong>Code History:</strong> Undo/redo history for your code sessions</li>
              <li><strong>User Preferences:</strong> Theme settings (dark/light mode), auto-save preferences</li>
              <li><strong>External Libraries:</strong> List of external CSS/JS libraries you've added</li>
            </ul>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <strong>Important:</strong> This data is stored <strong>only on your device</strong> and is never transmitted to our servers or any third party.
            </p>

            <h3 className={`text-xl font-semibold mb-3 mt-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>2. Google Gemini AI API</h3>
            <p className={`mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              When you use AI features (code enhancement, suggestions, chat assistant), your code is sent to Google's Gemini AI API for processing. This includes:
            </p>
            <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Code snippets you request AI assistance with</li>
              <li>Chat messages sent to the AI assistant</li>
            </ul>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              This data is processed according to <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400">Google's Privacy Policy</a>. We use your own API key for AI features, which means the data is associated with your Google account, not ours.
            </p>

            <h3 className={`text-xl font-semibold mb-3 mt-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>3. External Libraries (CDN)</h3>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              When you add external libraries (Bootstrap, jQuery, etc.), these are loaded from third-party CDNs (jsDelivr, unpkg, cdnjs). These CDN providers may collect standard web analytics data such as IP addresses and usage statistics.
            </p>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Lock className="w-6 h-6 text-gray-400" />
              How We Use Your Information
            </h2>
            <p className={`mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              We use the information we collect to:
            </p>
            <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Provide and maintain the code editor functionality</li>
              <li>Process AI-powered code enhancement requests</li>
              <li>Save your work and preferences locally on your device</li>
              <li>Enable features like code history, snippets, and auto-save</li>
              <li>Load external libraries you request</li>
            </ul>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              We <strong>do not</strong>:
            </p>
            <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Track your activity across websites</li>
              <li>Sell your data to third parties</li>
              <li>Require registration or login</li>
              <li>Store your code on our servers</li>
              <li>Use cookies for advertising or tracking</li>
            </ul>
          </section>

          {/* Data Storage and Security */}
          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Data Storage and Security</h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              All your code and preferences are stored locally in your browser's LocalStorage. This means:
            </p>
            <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Data persists only on your device</li>
              <li>Clearing browser data will delete your code and settings</li>
              <li>Data is not accessible from other devices or browsers</li>
              <li>We recommend regularly exporting important projects</li>
            </ul>
          </section>

          {/* Your Rights and Choices */}
          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Your Rights and Choices</h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              You have complete control over your data:
            </p>
            <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li><strong>Access:</strong> View all your data in browser DevTools (Application → LocalStorage)</li>
              <li><strong>Delete:</strong> Clear browser data or use browser settings to delete specific data</li>
              <li><strong>Export:</strong> Download your code as ZIP files using the export feature</li>
              <li><strong>Opt-out of AI:</strong> Simply don't use AI features; the editor works fully without them</li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Third-Party Services</h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              GB Coder integrates with the following third-party services:
            </p>
            <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li><strong>Google Gemini AI:</strong> For AI-powered code assistance (privacy policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400">Google Privacy</a>)</li>
              <li><strong>CDN Providers:</strong> jsDelivr, unpkg, cdnjs for external libraries</li>
              <li><strong>Monaco Editor:</strong> Microsoft's open-source code editor component</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Children's Privacy</h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              GB Coder is suitable for users of all ages. We do not knowingly collect personal information from children. Since we don't require registration and only use local storage, there is no collection of personally identifiable information.
            </p>
          </section>

          {/* Changes to This Policy */}
          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Changes to This Privacy Policy</h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Mail className="w-6 h-6 text-gray-400" />
              Contact Us
            </h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className={`list-none space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li><strong>Email:</strong> <a href="mailto:girishlade111@gmail.com" className="underline hover:text-gray-400">girishlade111@gmail.com</a></li>
              <li><strong>Creator:</strong> Girish Lade</li>
              <li><strong>Location:</strong> Mumbai, India</li>
            </ul>
          </section>
        </div>

        {/* Footer Note */}
        <div className={`mt-8 text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
          <p>© 2024 GB Coder. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
