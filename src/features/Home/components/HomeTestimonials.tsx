import React from 'react'
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "James Okafor",
    role: "Portfolio Landlord · Lagos",
    avatar: "JO",
    color: "bg-blue-100 text-blue-700",
    quote:
      "RentEasy cut my rent collection time by 80%. I manage 30 units and everything just works — the reminders, the receipts, the reports.",
    stars: 5,
  },
  {
    name: "Amaka Eze",
    role: "Property Manager · Abuja",
    avatar: "AE",
    color: "bg-purple-100 text-purple-700",
    quote:
      "My tenants love being able to pay online and track their lease. The complaints feature has made maintenance so much faster.",
    stars: 5,
  },
  {
    name: "Taiwo Adeyemi",
    role: "Real Estate Investor · Port Harcourt",
    avatar: "TA",
    color: "bg-green-100 text-green-700",
    quote:
      "The financial reports are incredible. I can see which properties are performing and make smarter investment decisions.",
    stars: 5,
  },
];

const HomeTestimonials = () => {
  return (
    <section id="testimonials" className="py-24 px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-14">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Trusted by thousands of landlords</h2>
                <p className="text-lg text-gray-400">Don&apos;t just take our word for it.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((t, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(t.stars)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-5 italic">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${t.color}`}>
                        {t.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{t.name}</p>
                        <p className="text-xs text-gray-400">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
  )
}

export default HomeTestimonials