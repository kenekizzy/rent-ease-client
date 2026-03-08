import { ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'

const HomeHero = () => {
  return (
    <section className="pt-32 pb-24 px-6 bg-gradient-to-b from-indigo-50/60 to-white">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <Zap className="w-3 h-3" />
                The smarter way to manage rentals
              </span>
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                Property management{" "}
                <span className="text-indigo-600">made simple</span>
              </h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                RentFlow helps landlords collect rent on time, manage tenants effortlessly, and grow their portfolio — all from one beautiful dashboard.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
                <Link
                  href="/signup"
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm"
                >
                  Start for free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold px-6 py-3.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  Request Demo
                </Link>
              </div>
              <p className="text-xs text-gray-400">No credit card required · Free</p>
            </div>
    
            {/* Hero Dashboard Preview */}
            <div className="max-w-5xl mx-auto mt-16 rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
              <div className="bg-gray-800 px-4 py-2.5 flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="flex-1 mx-4">
                  <div className="bg-gray-700 rounded-md h-5 w-48 mx-auto" />
                </div>
              </div>
              <div className="bg-gray-50 p-6 flex gap-4" style={{ minHeight: 320 }}>
                <div className="w-40 bg-white rounded-xl p-3 flex-shrink-0 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <div className="w-6 h-6 bg-indigo-600 rounded" />
                    <div className="h-3 bg-gray-200 rounded w-16" />
                  </div>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={`flex items-center gap-2 px-2 py-2 rounded-lg mb-1 ${i === 0 ? "bg-indigo-50" : ""}`}>
                      <div className={`w-3 h-3 rounded ${i === 0 ? "bg-indigo-400" : "bg-gray-200"}`} />
                      <div className={`h-2.5 rounded w-16 ${i === 0 ? "bg-indigo-200" : "bg-gray-200"}`} />
                    </div>
                  ))}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "24 Properties", color: "bg-indigo-50" },
                      { label: "22/24 Occupied", color: "bg-green-50" },
                      { label: "$48,500 Income", color: "bg-blue-50" },
                      { label: "$4,200 Pending", color: "bg-orange-50" },
                    ].map((c, i) => (
                      <div key={i} className={`${c.color} rounded-xl p-3`}>
                        <div className="h-2 bg-gray-200 rounded w-8 mb-2" />
                        <div className="h-4 bg-gray-300 rounded w-16 mb-1" />
                        <div className="h-2 bg-gray-200 rounded w-12" />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
                      <div className="flex items-end gap-1 h-20">
                        {[60, 75, 65, 80, 70, 90].map((h, i) => (
                          <div key={i} className="flex-1 bg-indigo-200 rounded-t" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-100" />
                            <div className="flex-1">
                              <div className="h-2 bg-gray-200 rounded w-24 mb-1" />
                              <div className="h-2 bg-gray-100 rounded w-16" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
  )
}

export default HomeHero