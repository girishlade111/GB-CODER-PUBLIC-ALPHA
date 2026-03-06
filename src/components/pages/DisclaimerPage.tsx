import React, { useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { AlertTriangle, Shield, Code, ExternalLink } from 'lucide-react';

const DisclaimerPage: React.FC = () => {
    const { isDark } = useTheme();

    useEffect(() => {
        document.title = 'Disclaimer - GB Coder';
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className={`min-h-screen transition-colors ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <AlertTriangle className={`w-12 h-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                        </div>
                    </div>
                    <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Disclaimer
                    </h1>
                    <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Important information about using GB Coder
                    </p>
                    <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                        Last updated: November 20, 2024
                    </p>
                </div>

                {/* Content */}
                <div className={`rounded-lg border p-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    {/* General Disclaimer */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>General Disclaimer</h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            GB Coder is provided "as is" for educational and development purposes. The information and tools provided on this platform are offered without any warranties of any kind, either express or implied.
                        </p>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            By using GB Coder, you acknowledge and agree to the terms outlined in this disclaimer.
                        </p>
                    </section>

                    {/* AI-Generated Code Disclaimer */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <Code className="w-6 h-6 text-gray-400" />
                            AI-Generated Code Disclaimer
                        </h2>

                        <div className={`p-4 mb-4 rounded-lg border-l-4 ${isDark ? 'bg-gray-700 border-gray-500' : 'bg-gray-100 border-gray-400'}`}>
                            <p className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>⚠️ Important Notice About AI Features</p>
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                AI-powered features use Google Gemini AI and may produce code that is incorrect, insecure, or suboptimal.
                            </p>
                        </div>

                        <h3 className={`text-xl font-semibold mb-3 mt-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Limitations:</h3>
                        <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <li><strong>Accuracy:</strong> AI suggestions may contain errors, bugs, or logical flaws</li>
                            <li><strong>Security:</strong> AI-generated code may have security vulnerabilities</li>
                            <li><strong>Best Practices:</strong> AI may not follow industry best practices or coding standards</li>
                            <li><strong>Context:</strong> AI lacks full context of your project requirements</li>
                            <li><strong>Testing:</strong> AI-generated code has not been tested or validated</li>
                            <li><strong>License:</strong> AI may suggest code with licensing conflicts</li>
                        </ul>

                        <h3 className={`text-xl font-semibold mb-3 mt-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Your Responsibility:</h3>
                        <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <li>Review and understand all AI-generated code before using it</li>
                            <li>Test thoroughly before deploying to production</li>
                            <li>Verify security and performance implications</li>
                            <li>Ensure code complies with your project's requirements</li>
                            <li>Check for licensing and copyright issues</li>
                        </ul>
                    </section>

                    {/* No Warranty Disclaimer */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Warranty</h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            GB Coder makes no warranties or representations about:
                        </p>
                        <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <li>The accuracy, reliability, or completeness of code or suggestions</li>
                            <li>The suitability of the service for your specific needs</li>
                            <li>Uninterrupted or error-free operation</li>
                            <li>Security of your code or data</li>
                            <li>Compatibility with production environments</li>
                        </ul>
                    </section>

                    {/* External Libraries Disclaimer */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <ExternalLink className="w-6 h-6 text-gray-400" />
                            External Libraries Disclaimer
                        </h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            GB Coder allows you to import external libraries (Bootstrap, jQuery, React, etc.) from third-party CDNs:
                        </p>
                        <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <li><strong>No Control:</strong> We don't host or control external libraries</li>
                            <li><strong>Third-Party Responsibility:</strong> Libraries are maintained by their respective creators</li>
                            <li><strong>Security Risks:</strong> External libraries may have vulnerabilities</li>
                            <li><strong>Availability:</strong> CDN services may experience downtime</li>
                            <li><strong>Version Changes:</strong> Library versions may change without notice</li>
                            <li><strong>Licensing:</strong> You are responsible for complying with library licenses</li>
                        </ul>
                    </section>

                    {/* Data Loss Disclaimer */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <Shield className="w-6 h-6 text-gray-400" />
                            Data Loss Disclaimer
                        </h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            All code and data are stored locally in your browser's LocalStorage:
                        </p>
                        <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <li><strong>Volatile Storage:</strong> Data may be lost if you clear browser cache/data</li>
                            <li><strong>No Backups:</strong> We do not maintain backups of your code</li>
                            <li><strong>Browser-Specific:</strong> Data is not synced across browsers or devices</li>
                            <li><strong>No Recovery:</strong> Once deleted, data cannot be recovered</li>
                        </ul>
                        <p className={`mt-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            ⚠️ Always export important projects using the download feature!
                        </p>
                    </section>

                    {/* Service Availability Disclaimer */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Service Availability</h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            GB Coder is a free service and we make no guarantees about:
                        </p>
                        <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <li>Continuous availability of the service</li>
                            <li>Maintenance schedules or downtime</li>
                            <li>Future updates or feature additions</li>
                            <li>Long-term service continuity</li>
                        </ul>
                    </section>

                    {/* Educational Purpose */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Educational Purpose</h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            GB Coder is designed primarily for:
                        </p>
                        <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <li>Learning web development</li>
                            <li>Prototyping and experimentation</li>
                            <li>Testing code snippets</li>
                            <li>Educational demonstrations</li>
                        </ul>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            While you may use it for any purpose, we recommend thorough testing and validation before using generated code in production environments.
                        </p>
                    </section>

                    {/* Third-Party Services */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Third-Party Services</h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            GB Coder integrates with third-party services:
                        </p>
                        <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <li><strong>Google Gemini AI:</strong> Subject to Google's terms and policies</li>
                            <li><strong>CDN Providers:</strong> jsDelivr, unpkg, cdnjs - subject to their terms</li>
                            <li><strong>Monaco Editor:</strong> Microsoft's code editor component</li>
                        </ul>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            We are not responsible for the availability, performance, or policies of these third-party services.
                        </p>
                    </section>

                    {/* Limitation of Liability */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Limitation of Liability</h2>
                        <p className={`mb-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            GB Coder and its creator shall not be liable for:
                        </p>
                        <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <li>Any damages arising from use of the service</li>
                            <li>Loss of data, code, or work</li>
                            <li>Security breaches or vulnerabilities in user code</li>
                            <li>Errors or bugs in AI-generated code</li>
                            <li>Issues with external libraries or third-party services</li>
                            <li>Production incidents caused by code created with GB Coder</li>
                        </ul>
                    </section>

                    {/* User Responsibility */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Your Responsibility</h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            As a user of GB Coder, you are solely responsible for:
                        </p>
                        <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <li>All code you create, modify, or deploy</li>
                            <li>Testing and validating code before production use</li>
                            <li>Security audits and vulnerability assessments</li>
                            <li>Compliance with applicable laws and regulations</li>
                            <li>Backup and preservation of important work</li>
                            <li>Proper attribution and licensing of external libraries</li>
                        </ul>
                    </section>

                    {/* Updates to Disclaimer */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Updates to This Disclaimer</h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            This disclaimer may be updated from time to time. Continued use of GB Coder after changes constitutes acceptance of the updated disclaimer.
                        </p>
                    </section>

                    {/* Contact */}
                    <section>
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Questions?</h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            If you have questions about this disclaimer:
                        </p>
                        <ul className={`list-none space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <li><strong>Email:</strong> <a href="mailto:girishlade111@gmail.com" className="underline hover:text-gray-400">girishlade111@gmail.com</a></li>
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

export default DisclaimerPage;
