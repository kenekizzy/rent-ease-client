import { useState } from "react";

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    bg: "bg-indigo-400",
    title: "Smart Analytics",
    desc: "Real-time insights & reports",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2}>
        <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
      </svg>
    ),
    bg: "bg-blue-400",
    title: "Easy Payments",
    desc: "Automated rent tracking",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    bg: "bg-yellow-400",
    title: "Instant Notifications",
    desc: "Stay updated on everything",
  },
];

const steps = ["Account Type", "Personal Info", "Security"];

function StrengthBar({ password }: { password: string }) {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-gray-200", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];
  return password ? (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= score ? colors[score] : "bg-gray-200"}`} />
        ))}
      </div>
      <p className={`text-xs font-medium ${["", "text-red-400", "text-yellow-500", "text-blue-500", "text-green-500"][score]}`}>
        {labels[score]}
      </p>
    </div>
  ) : null;
}

export default function RentEaseSignup() {
  const [page, setPage] = useState("signup"); // "signup" | "login"
  const [step, setStep] = useState(0);
  const [role, setRole] = useState("landlord");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "", terms: false });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!form.firstName.trim()) e.firstName = "First name is required";
      if (!form.lastName.trim()) e.lastName = "Last name is required";
      if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Enter a valid email";
      if (form.phone && !form.phone.match(/^\+?[\d\s\-()]{7,}$/)) e.phone = "Enter a valid phone number";
    }
    if (step === 2) {
      if (form.password.length < 8) e.password = "Password must be at least 8 characters";
      if (form.password !== form.confirm) e.confirm = "Passwords do not match";
      if (!form.terms) e.terms = "You must accept the terms";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const back = () => { setErrors({}); setStep(s => s - 1); };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-xl border text-sm text-gray-700 outline-none transition
    ${errors[field] ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"}`;

  if (page === "login") {
    // Minimal login redirect placeholder
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "linear-gradient(135deg, #6b74d6 0%, #7b5ea7 100%)" }}>
        <div className="bg-white rounded-2xl p-10 text-center shadow-2xl max-w-sm w-full">
          <div className="text-4xl mb-4">🏠</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Welcome to RentEase</h2>
          <p className="text-gray-400 text-sm mb-6">You'd be redirected to the login page.</p>
          <button onClick={() => { setPage("signup"); setStep(0); }}
            className="text-indigo-600 font-semibold text-sm hover:underline">
            ← Back to Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #6b74d6 0%, #7b5ea7 100%)" }}>
      <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex" style={{ minHeight: 520 }}>

        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-center px-10 py-12 w-5/12"
          style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow">🏠</div>
            <span className="text-white text-xl font-bold tracking-wide">RentEase</span>
          </div>
          <h1 className="text-white text-3xl font-extrabold leading-tight mb-3">
            Join Thousands of Property Managers
          </h1>
          <p className="text-indigo-200 text-sm mb-10 leading-relaxed">
            Create your free account and start managing your properties smarter today.
          </p>
          <div className="flex flex-col gap-5">
            {features.map(f => (
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

          {/* Step progress on left panel */}
          <div className="mt-12">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-3 mb-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all
                  ${i < step ? "bg-green-400 text-white" : i === step ? "bg-white text-indigo-600" : "bg-white/20 text-white/50"}`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-sm font-medium ${i === step ? "text-white" : i < step ? "text-green-300" : "text-white/40"}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-white flex flex-col justify-center px-8 md:px-12 py-10">

          {/* Mobile stepper */}
          <div className="flex gap-2 mb-6 md:hidden">
            {steps.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? "bg-indigo-500" : "bg-gray-200"}`} />
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">Create Account</h2>
          <p className="text-gray-400 text-sm mb-6">
            Step {step + 1} of {steps.length} — <span className="text-indigo-500 font-medium">{steps[step]}</span>
          </p>

          {/* STEP 0: Role */}
          {step === 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">I am a...</p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {["landlord", "tenant"].map(r => (
                  <button key={r} onClick={() => setRole(r)}
                    className={`flex flex-col items-center gap-3 py-6 rounded-xl border-2 transition-all font-medium text-sm
                      ${role === r ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 bg-white text-gray-500 hover:border-indigo-300"}`}>
                    <span className="text-3xl">{r === "landlord" ? "👤" : "🏘️"}</span>
                    <span className="capitalize">{r}</span>
                    <span className="text-xs font-normal text-gray-400 px-3 text-center">
                      {r === "landlord" ? "I own or manage properties" : "I'm looking to rent a property"}
                    </span>
                  </button>
                ))}
              </div>
              <button onClick={next}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition hover:opacity-90 active:scale-95 shadow-md"
                style={{ background: "linear-gradient(90deg, #6b74d6, #7b5ea7)" }}>
                Continue
              </button>
            </div>
          )}

          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input className={inputClass("firstName")} placeholder="John"
                    value={form.firstName} onChange={e => set("firstName", e.target.value)} />
                  {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input className={inputClass("lastName")} placeholder="Doe"
                    value={form.lastName} onChange={e => set("lastName", e.target.value)} />
                  {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input className={inputClass("email")} placeholder="john@example.com" type="email"
                  value={form.email} onChange={e => set("email", e.target.value)} />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input className={inputClass("phone")} placeholder="+1 234 567 8900" type="tel"
                  value={form.phone} onChange={e => set("phone", e.target.value)} />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={back}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-indigo-300 transition">
                  Back
                </button>
                <button onClick={next}
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm transition hover:opacity-90 active:scale-95 shadow-md"
                  style={{ background: "linear-gradient(90deg, #6b74d6, #7b5ea7)" }}>
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Security */}
          {step === 2 && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input className={inputClass("password")} placeholder="Min. 8 characters"
                    type={showPass ? "text" : "password"}
                    value={form.password} onChange={e => set("password", e.target.value)} />
                  <button onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
                <StrengthBar password={form.password} />
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input className={inputClass("confirm")} placeholder="Re-enter your password"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirm} onChange={e => set("confirm", e.target.value)} />
                  <button onClick={() => setShowConfirm(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
                {form.confirm && form.password === form.confirm && (
                  <p className="text-green-500 text-xs mt-1">✓ Passwords match</p>
                )}
                {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm}</p>}
              </div>
              <label className="flex items-start gap-2 cursor-pointer mb-5">
                <input type="checkbox" checked={form.terms} onChange={e => set("terms", e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-indigo-600 flex-shrink-0" />
                <span className="text-sm text-gray-500 leading-relaxed">
                  I agree to the{" "}
                  <button className="text-indigo-600 font-medium hover:underline">Terms of Service</button>{" "}
                  and{" "}
                  <button className="text-indigo-600 font-medium hover:underline">Privacy Policy</button>
                </span>
              </label>
              {errors.terms && <p className="text-red-400 text-xs -mt-3 mb-3">{errors.terms}</p>}
              <div className="flex gap-3">
                <button onClick={back}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-indigo-300 transition">
                  Back
                </button>
                <button onClick={next}
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm transition hover:opacity-90 active:scale-95 shadow-md"
                  style={{ background: "linear-gradient(90deg, #6b74d6, #7b5ea7)" }}>
                  Create Account
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Success */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Account Created!</h3>
              <p className="text-gray-400 text-sm mb-2">
                Welcome, <span className="text-indigo-600 font-semibold">{form.firstName}</span>! Your{" "}
                <span className="capitalize font-medium text-gray-600">{role}</span> account is ready.
              </p>
              <p className="text-gray-400 text-xs mb-8">We've sent a confirmation to <span className="text-indigo-500">{form.email}</span></p>
              <button onClick={() => setPage("login")}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition hover:opacity-90 shadow-md"
                style={{ background: "linear-gradient(90deg, #6b74d6, #7b5ea7)" }}>
                Go to Sign In
              </button>
            </div>
          )}

          {step < 3 && (
            <p className="text-center text-sm text-gray-400 mt-5">
              Already have an account?{" "}
              <button onClick={() => setPage("login")} className="text-indigo-600 font-semibold hover:underline">Sign in</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}