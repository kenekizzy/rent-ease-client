import { useState } from 'react'

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    bg: "bg-indigo-400",
    title: "Smart Analytics",
    desc: "Real-time insights & reports",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2}>
        <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
      </svg>
    ),
    bg: "bg-blue-400",
    title: "Easy Payments",
    desc: "Automated rent tracking",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    bg: "bg-yellow-400",
    title: "Instant Notifications",
    desc: "Stay updated on everything",
  },
];

const Login = () => {
  const [role, setRole] = useState("landlord");
  const [email, setEmail] = useState("john@example.com");
  const [password, setPassword] = useState("••••••••");
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);


  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #6b74d6 0%, #7b5ea7 100%)" }}>
      <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex"
        style={{ minHeight: 480 }}>

        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-center px-10 py-12 w-5/12"
          style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow">🏠</div>
            <span className="text-white text-xl font-bold tracking-wide">RentEase</span>
          </div>

          <h1 className="text-white text-3xl font-extrabold leading-tight mb-3">
            Simplify Your Rental Management
          </h1>
          <p className="text-indigo-200 text-sm mb-10 leading-relaxed">
            Streamline property management, track payments, and enhance tenant relationships all in one place.
          </p>

          <div className="flex flex-col gap-5">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${f.bg} shadow`}>
                  {f.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-indigo-200 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-white flex flex-col justify-center px-8 md:px-12 py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back</h2>
          <p className="text-gray-400 text-sm mb-7">Sign in to access your dashboard</p>

          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {["landlord", "tenant"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all font-medium text-sm capitalize
                  ${role === r
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 bg-white text-gray-500 hover:border-indigo-300"}`}>
                <span className="text-2xl">{r === "landlord" ? "👤" : "🏘️"}</span>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              placeholder="john@example.com"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition pr-11"
              />
              <button
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded accent-indigo-600"
              />
              <span className="text-sm text-gray-500">Remember me</span>
            </label>
            <button className="text-sm text-indigo-600 font-medium hover:underline">Forgot Password?</button>
          </div>

          {/* Sign In */}
          <button
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition hover:opacity-90 active:scale-95 shadow-md"
            style={{ background: "linear-gradient(90deg, #6b74d6, #7b5ea7)" }}>
            Sign In
          </button>

          <p className="text-center text-sm text-gray-400 mt-5">
            Don't have an account?{" "}
            <button className="text-indigo-600 font-semibold hover:underline">Sign up now</button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login