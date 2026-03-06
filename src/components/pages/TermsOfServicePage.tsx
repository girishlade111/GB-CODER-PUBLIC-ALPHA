import React, { useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { FileText, AlertTriangle, Scale, XCircle } from 'lucide-react';

const TermsOfServicePage: React.FC = () => {
    const { isDark } = useTheme();

    useEffect(() => {
        document.title = 'Terms of Service - GB Coder';
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className={`min-h-screen transition-colors ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <FileText className={`w-12 h-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                        </div>
                    </div>
                    <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Terms of Service
                    </h1>
                    <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Last updated: November 20, 2024
                    </p>
                </div>

                {/* Content */}
                <div className={`rounded-lg border p-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    {/* Introduction */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Introduction</h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Welcome to GB Coder. By accessing or using our service, you agree to be bound by these Terms of Service ("Terms"). Please read them carefully.
                        </p>
                    </section>

                    {/* Acceptance of Terms */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>1. Acceptance of Terms</h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            By using GB Coder, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, please do not use our service.
                        </p>
                    </section>

                    {/* Service Description */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>2. Service Description</h2>
                        <p className={`mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            GB Coder is a free, web-based code editor that provides:
                        </p>
                        <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <li>HTML, CSS, and JavaScript code editing with syntax highlighting</li>
                            <li>Live preview of your code</li>
                            <li>AI-powered code enhancement and suggestions (requires your own API key)</li>
                            <li>External library management for CSS/JS libraries</li>
                            <li>Code snippet storage and management</li>
                            <li>Code history and version control</li>
                            <li>Integrated console for debugging</li>
                        </ul>
                    </section>

                    {/* User Responsibilities */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <Scale className="w-6 h-6 text-gray-400" />
                            3. User Responsibilities
                        </h2>
                        <p className={`mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            You agree to:
                        </p>
                        <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <li>Use GB Coder only for lawful purposes</li>
                            <li>Not use the service to create, store, or share malicious, harmful, or illegal code</li>
                            <li>Not attempt to hack, disrupt, or damage the service or its infrastructure</li>
                            <li>Not use the service to send spam or unsolicited communications</li>
                            <li>Respect intellectual property rights of others</li>
                            <li>Provide your own Google Gemini API key for AI features</li>
                            <li>Accept responsibility for any code you create or execute</li>
                        </ul>
                    </section>

                    {/* Intellectual Property */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>4. Intellectual Property</h2>
                        <h3 className={`text-xl font-semibold mb-3 mt-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Your Code</h3>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            You retain full ownership of any code you create using GB Coder. We do not claim any rights to your code. Your code is stored locally in your browser and is not transmitted to our servers.
                        </p>
                        <h3 className={`text-xl font-semibold mb-3 mt-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Our Platform</h3>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            GB Coder, including its source code, design, and functionality, is owned by Girish Lade. All rights reserved. The service is provided under the MIT License for open-source use.
                        </p>
                    </section>

                    {/* API Usage and Limitations */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>5. API Usage and Limitations</h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            AI features require your own Google Gemini API key. You are responsible for:
                        </p>
                        <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <li>Obtaining and managing your API key</li>
                            <li>Complying with Google's API terms of service</li>
                            <li>Any costs associated with API usage</li>
                            <li>Keeping your API key secure and confidential</li>
                        </ul>
                    </section>

                    {/* Disclaimer of Warranties */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <AlertTriangle className="w-6 h-6 text-gray-400" />
                            6. Disclaimer of Warranties
                        </h2>
                        <p className={`mb-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            GB CODER IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND.
                        </p>
                        <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <li>We do not warrant that the service will be uninterrupted, secure, or error-free</li>
                            <li>We do not guarantee the accuracy, reliability, or completeness of AI suggestions</li>
                            <li>We are not responsible for any loss of data stored in your browser's LocalStorage</li>
                            <li>External libraries loaded from CDNs are provided by third parties and we make no warranties about them</li>
                            <li>You are solely responsible for reviewing and testing all code before deploying it to production</li>
                        </ul>
                    </section>

                    {/* Limitation of Liability */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>7. Limitation of Liability</h2>
                        <p className={`mb-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW, GB CODER AND ITS CREATOR SHALL NOT BE LIABLE FOR ANY:
                        </p>
                        <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <li>Indirect, incidental, special, consequential, or punitive damages</li>
                            <li>Loss of profits, data, use, or goodwill</li>
                            <li>Service interruptions or errors</li>
                            <li>Damages resulting from use of AI-generated code</li>
                            <li>Issues with external libraries loaded from CDNs</li>
                            <li>Security breaches or data loss in your browser</li>
                        </ul>
                    </section>

                    {/* Service Availability */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>8. Service Availability</h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            We strive to provide GB Coder as a free service, but we reserve the right to:
                        </p>
                        <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <li>Modify, suspend, or discontinue the service at any time without notice</li>
                            <li>Limit features or access for maintenance or improvements</li>
                            <li>Change these Terms of Service at any time</li>
                        </ul>
                    </section>

                    {/* Termination */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <XCircle className="w-6 h-6 text-gray-400" />
                            9. Termination
                        </h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            We may terminate or suspend your access to GB Coder immediately, without prior notice, if you violate these Terms. Since GB Coder does not require registration, termination typically means blocking access from your IP address.
                        </p>
                    </section>

                    {/* Governing Law */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>10. Governing Law</h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai, India.
                        </p>
                    </section>

                    {/* Changes to Terms */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>11. Changes to Terms</h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on this page. Your continued use of GB Coder after changes constitutes acceptance of the modified Terms.
                        </p>
                    </section>

                    {/* Contact */}
                    <section>
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>12. Contact Information</h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            For questions about these Terms, contact:
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

export default TermsOfServicePage;
