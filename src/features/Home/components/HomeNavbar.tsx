import { Building2, X, Menu } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const HomeNavbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
  return (
          <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900 text-lg">RentEasy</span>
              </div>
    
              <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Features</a>
                <a href="#testimonials" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Testimonials</a>
                <a href="#faq" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">FAQ</a>
              </div>
    
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login" className="text-sm text-gray-600 font-medium hover:text-gray-900 px-3 py-2 transition-colors">
                  Log in
                </Link>
                <Link href="/signup" className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">
                  Get Started
                </Link>
              </div>
    
              <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
    
            {menuOpen && (
              <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
                <a href="#features" className="block text-sm text-gray-600">Features</a>
                <a href="#testimonials" className="block text-sm text-gray-600">Testimonials</a>
                <a href="#faq" className="block text-sm text-gray-600">FAQ</a>
                <Link href="/signup" className="block text-sm bg-indigo-600 text-white font-medium px-4 py-2.5 rounded-lg text-center">
                  Get Started
                </Link>
              </div>
            )}
          </nav>
  )
}

export default HomeNavbar