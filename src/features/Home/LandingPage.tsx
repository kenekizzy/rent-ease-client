"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Star,
  ArrowRight,
  Menu,
  X,
  BarChart3,
  Bell,
  FileText,
  CreditCard,
  Shield,
  Zap,
  Users,
  TrendingUp,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import HomeNavbar from "./components/HomeNavbar";
import HomeHero from "./components/HomeHero";
import HomeFeatures from "./components/HomeFeatures";
import HomeHowItWorks from "./components/HomeHowItWorks";
import HomeTestimonials from "./components/HomeTestimonials";
import HomeFooter from "./components/HomeFooter";
import HomeFAQ from "./components/HomeFAQ";

const stats = [
  { value: "12,000+", label: "Landlords" },
  { value: "48,000+", label: "Properties Managed" },
  { value: "₦2.4B+", label: "Rent Collected" },
  { value: "99.9%", label: "Uptime" },
];

const LandingPage = () => {

  return (
   <div className="bg-white min-h-screen font-sans">
      <HomeNavbar />

      <HomeHero />
      
      {/* STATS */}
      <section className="py-16 bg-indigo-600">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-extrabold text-white mb-1">{s.value}</p>
              <p className="text-indigo-200 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <HomeFeatures />
      
      <HomeHowItWorks />

      <HomeTestimonials />
      
      <HomeFAQ />

      {/* CTA */}
      <section className="py-24 px-6 bg-indigo-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Ready to simplify your property management?
          </h2>
          <p className="text-indigo-200 text-lg mb-8">
            Join 12,000+ landlords who trust RentEasy to manage their properties with ease.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-7 py-4 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-indigo-300 text-xs mt-4">No credit card required · Free</p>
        </div>
      </section>

      <HomeFooter />
    </div>
  )
}

export default LandingPage