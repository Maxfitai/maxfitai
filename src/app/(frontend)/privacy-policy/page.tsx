import Link from "next/link";
import React from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export const metadata = {
    title: 'Privacy Policy - MaxFit AI',
    description: 'Read MaxFit AI\'s Privacy Policy to understand how we collect, use, and protect your personal information. Your privacy is important to us.',
    keywords: 'privacy policy, data protection, personal information, MaxFit AI privacy, user data',
    openGraph: {
        title: 'Privacy Policy - MaxFit AI',
        description: 'Read MaxFit AI\'s Privacy Policy to understand how we collect, use, and protect your personal information.',
        type: 'website',
        url: 'https://www.maxfitai.com/privacy-policy',
        siteName: 'MaxFit AI',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Privacy Policy - MaxFit AI',
        description: 'Read MaxFit AI\'s Privacy Policy to understand how we collect, use, and protect your personal information.',
    },
}

export default function PrivacyPolicyPage() {
    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#000000] text-white">
                {/* Hero */}
                <section className="relative w-full min-h-[40vh] flex items-center justify-center bg-gradient-to-br from-gray-900/20 to-gray-800/60  border border-maxfit-neon-green/30">
                    <div className="relative z-10 max-w-5xl px-6 py-16 mt-6 text-center">
                        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
                            Privacy Policy
                        </h1>
                        <p className="mt-6 text-slate-300 max-w-3xl mx-auto text-lg md:text-xl">
                            This Privacy Policy explains how we collect, use, disclose, and
                            safeguard your information when you visit our website.
                        </p>

                        <div className="mt-8 inline-flex rounded-full bg-gradient-to-r from-[#B6E10A] to-[#BAE60E] p-[2px]">
                            <Link
                                href="/"
                                className="px-6 py-2 bg-[#212121] rounded-full text-white font-semibold hover:opacity-90 transition"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Content */}
                <section className="max-w-6xl mx-auto px-6 py-12">
                    <article className="bg-gradient-to-br from-gray-900/20 to-gray-800/60  border border-maxfit-neon-green/30 p-10 rounded-xl shadow-lg space-y-8">
                        <h2 className="text-xl font-semibold  pb-2">
                            1. Information We Collect
                        </h2>
                        <ul className="list-disc list-inside space-y-3 text-slate-200">
                            <li>
                                <strong>Personal Information:</strong> We may collect personal
                                information such as your name, email address, and any other
                                information you provide when contacting us or subscribing.
                            </li>
                            <li>
                                <strong>Usage Data:</strong> We collect information about how you
                                use our website, including your IP address, browser type, pages
                                visited, and time spent on our site.
                            </li>
                            <li>
                                <strong>Cookies:</strong> We use cookies and similar technologies
                                to enhance your experience and analyze site usage.
                            </li>
                        </ul>

                        <h2 className="text-xl font-semibold  pb-2">
                            2. How We Use Your Information
                        </h2>
                        <ul className="list-disc list-inside space-y-3 text-slate-200">
                            <li>To provide and maintain our website and services.</li>
                            <li>To improve and personalize your experience.</li>
                            <li>
                                To communicate with you — responding to inquiries and sending
                                updates.
                            </li>
                            <li>To analyze usage and trends to improve our website.</li>
                        </ul>

                        <h2 className="text-xl font-semibold  pb-2">
                            3. Sharing Your Information
                        </h2>
                        <p className="text-slate-200">
                            We do not sell, trade, or rent your personal information. Trusted
                            service providers may access your info only to help us operate the
                            website.
                        </p>

                        <h2 className="text-xl font-semibold  pb-2">
                            4. Data Security
                        </h2>
                        <p className="text-slate-200">
                            We take reasonable measures to protect your information. No
                            internet transmission is 100% secure.
                        </p>

                        <h2 className="text-xl font-semibold  pb-2">
                            5. Third-Party Links
                        </h2>
                        <p className="text-slate-200">
                            Our website may contain links to third-party sites. We are not
                            responsible for their content or privacy practices.
                        </p>

                        <h2 className="text-xl font-semibold  pb-2">
                            6. Children’s Privacy
                        </h2>
                        <p className="text-slate-200">
                            Our website is not intended for children under 13. We do not
                            knowingly collect personal information from children under 13.
                        </p>

                        <h2 className="text-xl font-semibold  pb-2">
                            7. Changes to This Policy
                        </h2>
                        <p className="text-slate-200">
                            Updates may occur periodically. Changes will appear on this page
                            with an updated effective date.
                        </p>

                        <h2 className="text-xl font-semibold  pb-2">
                            8. Contact Us
                        </h2>
                        <p className="text-slate-200">
                            Questions? Contact us at{" "}
                            <a
                                href="mailto:info@maxfitai.com"
                                className="text-[#B6E10A] hover:underline"
                            >
                                info@maxfitai.com
                            </a>
                            .
                        </p>
                    </article>
                </section>

                <Footer />
            </main>
        </>
    );
}
