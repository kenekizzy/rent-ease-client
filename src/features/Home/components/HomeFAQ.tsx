"use client"
import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
    {
        q: "Is there a free trial?",
        a: "Yes! RentEasy is absolutely free to use",
    },
    {
        q: "How does online rent collection work?",
        a: "Tenants receive automated payment reminders and can pay via card or bank transfer. Funds are deposited directly to your account.",
    },
    {
        q: "Can tenants access their own portal?",
        a: "Absolutely. Every tenant gets a dedicated portal to pay rent, submit complaints, view documents, and track their lease.",
    },
    {
        q: "Is my data secure?",
        a: "We use bank-level 256-bit SSL encryption and store all data on ISO 27001-certified servers. Your data is always safe.",
    },
];

const HomeFAQ = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    return (
        <section id="faq" className="py-24 px-6">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-14">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Frequently asked questions</h2>
                </div>
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-sm font-semibold text-gray-900">{faq.q}</span>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                            </button>
                            {openFaq === i && (
                                <div className="px-5 pb-4">
                                    <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HomeFAQ