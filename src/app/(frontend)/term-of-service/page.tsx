import Link from "next/link";
import React from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export const metadata = {
    title: 'Terms of Service - MaxFit AI',
    description: 'Read MaxFit AI\'s Terms of Service to understand the rules and guidelines for using our AI-powered fitness platform.',
    keywords: 'terms of service, user agreement, MaxFit AI terms, service conditions, legal terms',
    openGraph: {
        title: 'Terms of Service - MaxFit AI',
        description: 'Read MaxFit AI\'s Terms of Service to understand the rules and guidelines for using our platform.',
        type: 'website',
        url: 'https://www.maxfitai.com/term-of-service',
        siteName: 'MaxFit AI',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Terms of Service - MaxFit AI',
        description: 'Read MaxFit AI\'s Terms of Service to understand the rules and guidelines for using our platform.',
    },
}

export default function TermsOfServicePage() {
    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#000000] text-white">
                {/* Hero */}
                <section className="relative w-full min-h-[40vh] flex items-center justify-center bg-gradient-to-br from-gray-900/20 to-gray-800/60  border border-maxfit-neon-green/30">
                    <div className="relative z-10 max-w-5xl px-6 py-16 mt-6 text-center">
                        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
                            Terms of Service
                        </h1>
                        <p className="mt-6 text-slate-300 max-w-3xl mx-auto">
                            Please read these Terms of Service (“Terms”) carefully before using our website. By accessing or using our services, you agree to be bound by these Terms.
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
                <section className="max-w-6xl mx-auto px-6 py-12 space-y-10">
                    <article className="bg-gradient-to-br from-gray-900/20 to-gray-800/60  border border-maxfit-neon-green/30 p-8 rounded-xl shadow-lg space-y-6">
                        <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
                        <p className="text-white">
                            By accessing or using our website, you agree to comply with and be bound by these Terms. If you do not agree, please do not use our services.
                        </p>

                        <h2 className="text-xl font-semibold">2. Use of Services</h2>
                        <p className="text-white">
                            You agree to use our website only for lawful purposes and in accordance with these Terms. You may not use the service in any way that could damage, disable, or impair it.
                        </p>

                        <h2 className="text-xl font-semibold">3. Intellectual Property</h2>
                        <p className="text-white">
                            All content, logos, graphics, and software on this website are the property of the company or its licensors and are protected by applicable intellectual property laws.
                        </p>

                        <h2 className="text-xl font-semibold">4. User Accounts</h2>
                        <p className="text-white">
                            Certain services may require creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account.
                        </p>

                        <h2 className="text-xl font-semibold">5. Limitation of Liability</h2>
                        <p className="text-white">
                            We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of our website or services.
                        </p>

                        <h2 className="text-xl font-semibold">6. Termination</h2>
                        <p className="text-white">
                            We reserve the right to terminate or suspend access to our website without prior notice for violations of these Terms.
                        </p>

                        <h2 className="text-xl font-semibold">7. Governing Law</h2>
                        <p className="text-white">
                            These Terms are governed by and construed in accordance with the laws of [Your Country/State]. Any disputes shall be resolved in the courts of [Your Country/State].
                        </p>

                        <h2 className="text-xl font-semibold">8. Changes to Terms</h2>
                        <p className="text-white">
                            We may update these Terms from time to time. Changes will be posted on this page with an updated effective date.
                        </p>

                        <h2 className="text-xl font-semibold">9. Contact Us</h2>
                        <p className="text-white">
                            If you have any questions about these Terms, please contact us at{" "}
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
