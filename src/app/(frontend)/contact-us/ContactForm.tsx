"use client";

import React, { useState } from "react";

export default function ContactForm() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        message: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted:", form);
        // You can integrate your email/CRM backend here
        alert("Message sent successfully!");
        setForm({ name: "", email: "", message: "" });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block mb-2 font-medium text-slate-200">
                    Name
                </label>
                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-md bg-[#000000] text-white border border-slate-700 focus:border-[#B6E10A] outline-none"
                />
            </div>

            <div>
                <label className="block mb-2 font-medium text-slate-200">
                    Email
                </label>
                <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-md bg-[#000000] text-white border border-slate-700 focus:border-[#B6E10A] outline-none"
                />
            </div>

            <div>
                <label className="block mb-2 font-medium text-slate-200">
                    Message
                </label>
                <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full p-3 rounded-md bg-[#000000] text-white border border-slate-700 focus:border-[#B6E10A] outline-none"
                />
            </div>

            <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[#B6E10A] to-[#BAE60E] rounded-full font-semibold text-black hover:opacity-90 transition"
            >
                Send Message
            </button>
        </form>
    );
}