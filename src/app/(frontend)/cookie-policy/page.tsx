import React from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export const metadata = {
    title: 'Cookie Policy - MaxFit AI',
    description: 'Learn about how MaxFit AI uses cookies and similar technologies to enhance your experience on our website. Understand your privacy rights.',
    keywords: 'cookie policy, privacy policy, website cookies, data privacy, MaxFit AI cookies',
    openGraph: {
        title: 'Cookie Policy - MaxFit AI',
        description: 'Learn about how MaxFit AI uses cookies and similar technologies to enhance your experience.',
        type: 'website',
        url: 'https://www.maxfitai.com/cookie-policy',
        siteName: 'MaxFit AI',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Cookie Policy - MaxFit AI',
        description: 'Learn about how MaxFit AI uses cookies and similar technologies to enhance your experience.',
    },
}

export default function CookiePolicyPage() {
    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#000000] text-white">
                {/* Hero */}
                <section className="relative w-full min-h-[40vh] flex items-center justify-center bg-gradient-to-br from-gray-900/20 to-gray-800/60  border border-maxfit-neon-green/30">
                    <div className="relative z-10 max-w-5xl px-6 py-16 text-center">
                        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
                            Cookie Policy
                        </h1>
                        <p className="mt-6 text-slate-300 max-w-3xl mx-auto text-lg md:text-xl">
                            This Cookie Policy explains how we use cookies and similar technologies to enhance your experience on our website.
                        </p>
                    </div>
                </section>

                {/* Content */}
                <section className="max-w-6xl mx-auto px-6 py-12 space-y-10">
                    <article className="bg-gradient-to-br from-gray-900/20 to-gray-800/60  border border-maxfit-neon-green/30 p-10 rounded-xl shadow-lg space-y-8">
                        <h2 className="text-xl font-semibold border-b border-slate-700 pb-2">
                            1. What Are Cookies?
                        </h2>
                        <p className="text-slate-200">
                            Cookies are small text files stored on your device by your browser that help websites remember information about your visit.
                        </p>

                        <h2 className="text-xl font-semibold border-b border-slate-700 pb-2">
                            2. How We Use Cookies
                        </h2>
                        <ul className="list-disc list-inside space-y-3 text-slate-200">
                            <li>To improve website functionality and performance.</li>
                            <li>To remember user preferences and settings.</li>
                            <li>To analyze website traffic and usage patterns.</li>
                            <li>To provide personalized content and marketing.</li>
                        </ul>

                        <h2 className="text-xl font-semibold border-b border-slate-700 pb-2">
                            3. Types of Cookies We Use
                        </h2>
                        <ul className="list-disc list-inside space-y-3 text-slate-200">
                            <li><strong>Essential Cookies:</strong> Necessary for website functionality.</li>
                            <li><strong>Performance Cookies:</strong> Help us understand website performance.</li>
                            <li><strong>Functional Cookies:</strong> Remember preferences and enhance user experience.</li>
                            <li><strong>Marketing Cookies:</strong> Track activity to provide relevant advertising.</li>
                        </ul>

                        <h2 className="text-xl font-semibold border-b border-slate-700 pb-2">
                            4. Third-Party Cookies
                        </h2>
                        <p className="text-slate-200">
                            Some cookies may be set by third-party services we use, such as analytics and advertising providers. We do not control these cookies, and their use is subject to the third party’s privacy policies.
                        </p>

                        <h2 className="text-xl font-semibold border-b border-slate-700 pb-2">
                            5. Managing Cookies
                        </h2>
                        <p className="text-slate-200">
                            You can manage or disable cookies through your browser settings. Please note that some website features may not function properly if cookies are disabled.
                        </p>

                        <h2 className="text-xl font-semibold border-b border-slate-700 pb-2">
                            6. Changes to This Policy
                        </h2>
                        <p className="text-slate-200">
                            We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated effective date.
                        </p>

                        <h2 className="text-xl font-semibold border-b border-slate-700 pb-2">
                            7. Contact Us
                        </h2>
                        <p className="text-slate-200">
                            If you have any questions about this Cookie Policy, please contact us at{" "}
                            <a
                                href="mailto:info@maxfitai.com"
                                className="text-[#B6E10A] hover:underline"
                            >
                                info@maxfitai.com
                            </a>.
                        </p>
                    </article>
                </section>

                <Footer />
            </main>
        </>
    );
}
