import React from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ContactForm from "./ContactForm";

export const metadata = {
    title: 'Contact Us - MaxFit AI',
    description: 'Get in touch with MaxFit AI. Have questions about our AI-powered fitness platform? Contact our team for support and assistance.',
    keywords: 'contact MaxFit AI, fitness app support, AI coach help, customer service, get in touch',
    openGraph: {
        title: 'Contact Us - MaxFit AI',
        description: 'Get in touch with MaxFit AI. Have questions about our AI-powered fitness platform?',
        type: 'website',
        url: 'https://www.maxfitai.com/contact-us',
        siteName: 'MaxFit AI',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Contact Us - MaxFit AI',
        description: 'Get in touch with MaxFit AI. Have questions about our AI-powered fitness platform?',
    },
}

export default function ContactUsPage() {
    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#000000] text-white">
                {/* Hero */}
                <section className="relative w-full min-h-[40vh] flex items-center justify-center bg-gradient-to-br from-gray-900/20 to-gray-800/60  border border-maxfit-neon-green/30">
                    <div className="relative z-10 max-w-5xl px-6 py-16 text-center">
                        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
                            Contact Us
                        </h1>
                        <p className="mt-6 text-slate-300 max-w-3xl mx-auto text-lg md:text-xl">
                            Have questions or need assistance? Reach out to our team.
                        </p>
                    </div>
                </section>

                {/* Contact Form */}
                <section className="max-w-4xl mx-auto px-6 py-12">
                    <article className="bg-gradient-to-br from-gray-900/20 to-gray-800/60  border border-maxfit-neon-green/30 p-10 rounded-xl shadow-lg space-y-8">
                        <ContactForm />
                    </article>
                </section>
            </main>

            <Footer />
        </>
    );
}
