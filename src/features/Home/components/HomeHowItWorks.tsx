import React from 'react'
import { Building2, TrendingUp, Users } from 'lucide-react';

const HomeHowItWorks = () => {
  return (
    <section className="py-24 px-6 bg-gray-50">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-14">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Up and running in minutes</h2>
                <p className="text-lg text-gray-400">Three simple steps to transform how you manage rentals.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { step: "01", icon: Users, title: "Create your account", desc: "Sign up for free and add your properties in minutes. No setup fee required." },
                  { step: "02", icon: Building2, title: "Add tenants & leases", desc: "Invite tenants to their portal. Upload lease documents and set rent due dates." },
                  { step: "03", icon: TrendingUp, title: "Collect & grow", desc: "Receive rent on time, track payments, resolve issues, and grow your portfolio." },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="relative">
                      {i < 2 && (
                        <div className="hidden md:block absolute top-10 left-full w-full h-px bg-indigo-200 z-0" style={{ width: "calc(100% - 2rem)", left: "calc(50% + 2rem)" }} />
                      )}
                      <div className="text-center relative z-10">
                        <div className="w-20 h-20 bg-white border-2 border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                          <Icon className="w-7 h-7 text-indigo-600" />
                        </div>
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{s.step}</span>
                        <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2">{s.title}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
  )
}

export default HomeHowItWorks