import React, { useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { Cookie, Database, Settings, Trash2 } from 'lucide-react';

const CookiePolicyPage: React.FC = () => {
    const { isDark } = useTheme();

    useEffect(() => {
        document.title = 'Cookie Policy - GB Coder';
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className={`min-h-screen transition-colors ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <Cookie className={`w-12 h-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                        </div>
                    </div>
                    <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Cookie Policy
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
                            This Cookie Policy explains how GB Coder uses cookies and similar technologies. Unlike most websites, GB Coder does <strong>not use traditional HTTP cookies</strong>. Instead, we use browser LocalStorage for essential functionality.
                        </p>
                    </section>

                    {/* What We Use */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <Database className="w-6 h-6 text-gray-400" />
                            What We Use Instead of Cookies
                        </h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            GB Coder uses <strong>browser LocalStorage</strong>, which is similar to cookies but with important differences:
                        </p>
                        <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <li><strong>Storage Location:</strong> Data is stored locally in your browser</li>
                            <li><strong>Server Transmission:</strong> Unlike cookies, LocalStorage data is never automatically sent to servers</li>
                            <li><strong>Size Limit:</strong> Can store up to 5-10MB (cookies: 4KB)</li>
                            <li><strong>Expiration:</strong> Persists until manually deleted (doesn't expire)</li>
                            <li><strong>Scope:</strong> Only accessible by GB Coder on your device</li>
                        </ul>
                    </section>

                    {/* What We Store */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>What We Store</h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            We store the following data in LocalStorage:
                        </p>

                        <div className="space-y-4">
                            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>1. Code Content</h3>
                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Your HTML, CSS, and JavaScript code is saved locally for persistence across sessions.
                                </p>
                                <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <strong>Key:</strong> <code>gb-coder-html</code>, <code>gb-coder-css</code>, <code>gb-coder-javascript</code>
                                </p>
                            </div>

                            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>2. Theme Preferences</h3>
                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Your chosen theme (dark or light mode) to maintain consistency.
                                </p>
                                <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <strong>Key:</strong> <code>gb-coder-theme</code>
                                </p>
                            </div>

                            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>3. Code Snippets</h3>
                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Your saved code snippets with names, descriptions, tags, and categories.
                                </p>
                                <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <strong>Key:</strong> <code>gb-coder-snippets</code>
                                </p>
                            </div>

                            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>4. Code History</h3>
                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Undo/redo history for your code changes.
                                </p>
                                <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <strong>Key:</strong> <code>gb-coder-history</code>
                                </p>
                            </div>

                            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>5. External Libraries</h3>
                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    List of external CSS/JS libraries you've added (Bootstrap, jQuery, etc.).
                                </p>
                                <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <strong>Key:</strong> <code>gb-coder-external-libraries</code>
                                </p>
                            </div>

                            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>6. Settings</h3>
                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Auto-save preferences and other editor settings.
                                </p>
                                <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <strong>Key:</strong> <code>gb-coder-autosave-enabled</code>, etc.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Third-Party Cookies */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Third-Party Cookies</h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            GB Coder itself does not use cookies, but third-party services we integrate with may use cookies:
                        </p>
                        <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <li><strong>CDN Providers (jsDelivr, unpkg, cdnjs):</strong> May use cookies for analytics and performance tracking</li>
                            <li><strong>Google Gemini AI API:</strong> May use cookies as per Google's policies</li>
                        </ul>
                    </section>

                    {/* How to Control */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <Settings className="w-6 h-6 text-gray-400" />
                            How to Control LocalStorage
                        </h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            You have full control over LocalStorage data:
                        </p>

                        <h3 className={`text-xl font-semibold mb-3 mt-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>View Stored Data</h3>
                        <ol className={`list-decimal pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <li>Open your browser's Developer Tools (F12 or Ctrl+Shift+I)</li>
                            <li>Go to the "Application" tab (Chrome) or "Storage" tab (Firefox)</li>
                            <li>Click on "Local Storage" in the left sidebar</li>
                            <li>Select your GB Coder domain</li>
                            <li>View all stored keys and values</li>
                        </ol>

                        <h3 className={`text-xl font-semibold mb-3 mt-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Delete Stored Data</h3>
                        <ol className={`list-decimal pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <li><strong>Clear All Data:</strong> Browser Settings → Privacy → Clear browsing data → Check "Cookies and other site data"</li>
                            <li><strong>Clear Specific Keys:</strong> In Developer Tools → Application → Local Storage → Right-click key → Delete</li>
                            <li><strong>Disable LocalStorage:</strong> Most browsers allow disabling LocalStorage in privacy settings (GB Coder won't work without it)</li>
                        </ol>
                    </section>

                    {/* Impact of Disabling */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <Trash2 className="w-6 h-6 text-gray-400" />
                            Impact of Clearing LocalStorage
                        </h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            If you clear LocalStorage, the following will happen:
                        </p>
                        <ul className={`list-disc pl-6 mb-4 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <li>All unsaved code will be lost</li>
                            <li>Saved snippets will be deleted</li>
                            <li>Code history will be cleared</li>
                            <li>Theme preferences will reset to default</li>
                            <li>External library selections will be removed</li>
                        </ul>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <strong>Recommendation:</strong> Export important projects as ZIP files before clearing LocalStorage.
                        </p>
                    </section>

                    {/* Updates to Policy */}
                    <section className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Updates to This Policy</h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated "Last updated" date.
                        </p>
                    </section>

                    {/* Contact */}
                    <section>
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Contact Us</h2>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Questions about our LocalStorage usage?
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

export default CookiePolicyPage;
