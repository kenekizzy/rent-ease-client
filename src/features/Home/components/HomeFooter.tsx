import React from 'react'
import { Building2, Shield } from 'lucide-react'

const HomeFooter = () => {
  return (
    <footer className="bg-gray-900 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white text-lg">RentEasy</span>
              </div>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                The modern property management platform built for landlords who want to grow.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-10">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Product</p>
                <ul className="space-y-2">
                  {["Features", "Changelog", "Roadmap"].map((l) => (
                    <li key={l}><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Company</p>
                <ul className="space-y-2">
                  {["About", "Blog"].map((l) => (
                    <li key={l}><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Support</p>
                <ul className="space-y-2">
                  {["Help Center", "Contact", "Privacy", "Terms"].map((l) => (
                    <li key={l}><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500">© 2026 RentEasy. All rights reserved.</p>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs text-gray-500">SSL Secured · ISO 27001 Certified</span>
            </div>
          </div>
        </div>
      </footer>
  )
}

export default HomeFooter