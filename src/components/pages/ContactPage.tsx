import React, { useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { Mail, Instagram, Linkedin, Github, Codepen, MapPin, Send, CheckCircle, Copy } from 'lucide-react';

const ContactPage: React.FC = () => {
    const { isDark } = useTheme();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [formStatus, setFormStatus] = useState<'idle' | 'success'>('idle');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        document.title = 'Contact Us - GB Coder';
        window.scrollTo(0, 0);
    }, []);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
        if (!formData.message.trim()) newErrors.message = 'Message is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        console.log('Form submitted:', formData);
        setFormStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });

        setTimeout(() => setFormStatus('idle'), 5000);
    };

    const copyEmail = () => {
        navigator.clipboard.writeText('girishlade111@gmail.com');
    };

    return (
        <div className={`min-h-screen transition-colors ${isDark ? 'bg-[#1e1e1e] text-gray-100' : 'bg-gray-50 text-gray-900'
            }`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <Mail className={`w-12 h-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
                    <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Have questions? We'd love to hear from you.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Contact Form */}
                    <div className={`rounded-lg border p-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                        <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>

                        {formStatus === 'success' && (
                            <div className={`mb-6 p-4 rounded-lg border flex items-center gap-2 ${
                                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                            }`}>
                                <CheckCircle className="w-5 h-5 text-gray-500" />
                                <p className="text-gray-500">
                                    Thank you! Your message has been recorded. We'll get back to you soon.
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${isDark
                                            ? 'bg-gray-700 border-gray-600 text-white focus:border-gray-500'
                                            : 'bg-white border-gray-300 text-gray-900 focus:border-gray-400'
                                        } focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-20`}
                                    placeholder="Your name"
                                />
                                {errors.name && <p className="mt-1 text-sm text-gray-500">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${isDark
                                            ? 'bg-gray-700 border-gray-600 text-white focus:border-gray-500'
                                            : 'bg-white border-gray-300 text-gray-900 focus:border-gray-400'
                                        } focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-20`}
                                    placeholder="your.email@example.com"
                                />
                                {errors.email && <p className="mt-1 text-sm text-gray-500">{errors.email}</p>}
                            </div>

                            {/* Subject */}
                            <div>
                                <label htmlFor="subject" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    Subject *
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${isDark
                                            ? 'bg-gray-700 border-gray-600 text-white focus:border-gray-500'
                                            : 'bg-white border-gray-300 text-gray-900 focus:border-gray-400'
                                        } focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-20`}
                                    placeholder="What is this about?"
                                />
                                {errors.subject && <p className="mt-1 text-sm text-gray-500">{errors.subject}</p>}
                            </div>

                            {/* Message */}
                            <div>
                                <label htmlFor="message" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    Message *
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={5}
                                    className={`w-full px-4 py-2 rounded-lg border transition-colors resize-none ${isDark
                                            ? 'bg-gray-700 border-gray-600 text-white focus:border-gray-500'
                                            : 'bg-white border-gray-300 text-gray-900 focus:border-gray-400'
                                        } focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-20`}
                                    placeholder="Your message..."
                                />
                                {errors.message && <p className="mt-1 text-sm text-gray-500">{errors.message}</p>}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                                    isDark
                                        ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                                }`}
                            >
                                <Send className="w-5 h-5" />
                                Send Message
                            </button>
                        </form>

                        <p className={`mt-4 text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                            Note: This is a client-side form. Your message will be logged but not sent via email. For direct contact, please use the email address below.
                        </p>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-6">
                        {/* Direct Contact */}
                        <div className={`rounded-lg border p-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}>
                            <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>

                            <div className="space-y-4">
                                {/* Email */}
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                        <Mail className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold mb-1">Email</p>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href="mailto:girishlade111@gmail.com"
                                                className={`hover:underline ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                                            >
                                                girishlade111@gmail.com
                                            </a>
                                            <button
                                                onClick={copyEmail}
                                                className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                                title="Copy email"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                        <MapPin className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                                    </div>
                                    <div>
                                        <p className="font-semibold mb-1">Location</p>
                                        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Mumbai, India</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className={`rounded-lg border p-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}>
                            <h2 className="text-2xl font-semibold mb-6">Connect With Us</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <a
                                    href="https://www.instagram.com/girish_lade_/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-3 p-4 rounded-lg transition-colors ${isDark
                                            ? 'bg-gray-700 hover:bg-gray-600'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                >
                                    <Instagram className="w-5 h-5" />
                                    <span className="font-medium">Instagram</span>
                                </a>

                                <a
                                    href="https://www.linkedin.com/in/girish-lade-075bba201/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-3 p-4 rounded-lg transition-colors ${isDark
                                            ? 'bg-gray-700 hover:bg-gray-600'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                >
                                    <Linkedin className="w-5 h-5" />
                                    <span className="font-medium">LinkedIn</span>
                                </a>

                                <a
                                    href="https://github.com/girishlade111"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-3 p-4 rounded-lg transition-colors ${isDark
                                            ? 'bg-gray-700 hover:bg-gray-600'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                >
                                    <Github className="w-5 h-5" />
                                    <span className="font-medium">GitHub</span>
                                </a>

                                <a
                                    href="https://codepen.io/Girish-Lade-the-looper"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-3 p-4 rounded-lg transition-colors ${isDark
                                            ? 'bg-gray-700 hover:bg-gray-600'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                >
                                    <Codepen className="w-5 h-5" />
                                    <span className="font-medium">CodePen</span>
                                </a>
                            </div>
                        </div>

                        {/* Creator Info */}
                        <div className={`rounded-lg border p-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}>
                            <h2 className="text-2xl font-semibold mb-4">About the Creator</h2>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                GB Coder is created and maintained by <strong>Girish Lade</strong>, a passionate developer from Mumbai, India. Feel free to reach out for questions, feedback, or collaboration opportunities!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
