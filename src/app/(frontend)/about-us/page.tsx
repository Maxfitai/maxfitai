import React from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export const metadata = {
    title: 'About Us - MaxFit AI',
    description: 'Learn about Mehdi Technologies and our mission to provide high-quality AI-powered fitness solutions. Discover our vision for digital excellence in health and wellness.',
    keywords: 'about MaxFit AI, Mehdi Technologies, AI fitness company, fitness technology mission, wellness innovation',
    openGraph: {
        title: 'About Us - MaxFit AI',
        description: 'Learn about Mehdi Technologies and our mission to provide high-quality AI-powered fitness solutions.',
        type: 'website',
        url: 'https://www.maxfitai.com/about-us',
        siteName: 'MaxFit AI',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'About Us - MaxFit AI',
        description: 'Learn about Mehdi Technologies and our mission to provide high-quality AI-powered fitness solutions.',
    },
}

export default function AboutUsPage() {
    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#000000] text-white">
                {/* Hero */}
                <section className="relative w-full min-h-[40vh] flex items-center justify-center bg-gradient-to-br from-gray-900/20 to-gray-800/60  border border-maxfit-neon-green/30">
                    <div className="relative z-10 max-w-5xl px-6 py-16 text-center">
                        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
                            About Us
                        </h1>
                        <p className="mt-6 text-slate-300 max-w-3xl mx-auto text-lg md:text-xl">
                            Learn more about Mehdi Technologies — our mission, vision, and the
                            team behind the projects.
                        </p>
                    </div>
                </section>

                {/* Content */}
                <section className="max-w-6xl mx-auto px-6 py-12 space-y-10">
                    <article className="bg-gradient-to-br from-gray-900/20 to-gray-800/60  border border-maxfit-neon-green/30 p-10 rounded-xl shadow-lg space-y-8">
                        <h2 className="text-xl font-semibold border-b border-slate-700 pb-2">
                            Our Mission
                        </h2>
                        <p className="text-slate-200">
                            We aim to provide high-quality web and AI solutions, delivering
                            scalable, secure, and user-friendly applications to startups and
                            enterprises alike.
                        </p>

                        <h2 className="text-xl font-semibold border-b border-slate-700 pb-2">
                            Our Vision
                        </h2>
                        <p className="text-slate-200">
                            To become a leading technology partner, helping businesses leverage
                            innovation to achieve digital excellence.
                        </p>

                        <h2 className="text-xl font-semibold border-b border-slate-700 pb-2">
                            Our Values
                        </h2>
                        <ul className="list-disc list-inside space-y-3 text-slate-200">
                            <li>Clean & Scalable Code</li>
                            <li>Transparent Communication</li>
                            <li>Timely Delivery</li>
                            <li>Client-Focused Solutions</li>
                            <li>Innovation & Creativity</li>
                        </ul>

                        <h2 className="text-xl font-semibold border-b border-slate-700 pb-2">
                            Our Team
                        </h2>
                        <p className="text-slate-200">
                            Our expert team consists of full-stack developers, designers, and
                            AI specialists dedicated to building exceptional digital experiences.
                        </p>
                    </article>
                </section>

                <Footer />
            </main>
        </>
    );
}
