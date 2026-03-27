'use client'

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { EyeIcon, EyeOffIcon, Loader2, CheckCircle2, ChevronRight, ChevronLeft, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/api";
import { toast } from "sonner";

const signupSchema = z.object({
  role: z.enum(["landlord", "tenant"]),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional().refine(val => !val || val.length >= 7, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, "You must accept the terms"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

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

const StrengthBar = ({ password }: { password: string }) => {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password || '')).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-gray-200", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];

  if (!password) return null;

  return (
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
  );
}

export default function RentEaseSignup() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
    defaultValues: {
      role: "landlord",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger } = form;
  const watchRole = watch("role");
  const watchPassword = watch("password");
  const watchConfirm = watch("confirmPassword");

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 0) fieldsToValidate = ["role"];
    if (step === 1) fieldsToValidate = ["firstName", "lastName", "email", "phone"];

    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/register', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
      });

      toast.success("Account created successfully!");
      setStep(3); // Success step
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-500"
      style={{ background: "linear-gradient(135deg, #6b74d6 0%, #7b5ea7 100%)" }}>
      <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex bg-white/10 backdrop-blur-md" style={{ minHeight: 520 }}>

        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-center px-10 py-12 w-5/12 border-r border-white/10">
          <Link href="/" className="flex items-center gap-3 mb-10 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform">🏠</div>
            <span className="text-white text-xl font-bold tracking-wide">RentEase</span>
          </Link>
          <h1 className="text-white text-3xl font-extrabold leading-tight mb-3">
            Join Thousands of Property Managers
          </h1>
          <p className="text-indigo-100/80 text-sm mb-10 leading-relaxed">
            Create your free account and start managing your properties smarter today.
          </p>
          <div className="flex flex-col gap-6 mb-12">
            {features.map(f => (
              <div key={f.title} className="flex items-center gap-4 group">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${f.bg} shadow-lg group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-indigo-100/60 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-4">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${i < step ? "bg-green-400 text-white shadow-lg shadow-green-400/20" : i === step ? "bg-white text-indigo-600 shadow-xl" : "bg-white/10 text-white/40 border border-white/10"}`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-sm font-medium transition-colors ${i === step ? "text-white" : i < step ? "text-green-300" : "text-white/40"}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-white flex flex-col justify-center px-8 md:px-12 py-10">
          {/* Mobile stepper */}
          <div className="flex gap-2 mb-8 md:hidden">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? "bg-indigo-600" : "bg-gray-100"}`} />
            ))}
          </div>

          {step < 3 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
              <p className="text-gray-500 text-sm">
                Step {step + 1} of {steps.length} — <span className="text-indigo-600 font-semibold">{steps[step]}</span>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* STEP 0: Role */}
            {step === 0 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">I am a...</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'landlord', label: 'Landlord', icon: '👤', desc: 'I own or manage properties' },
                      { id: 'tenant', label: 'Tenant', icon: '🏘️', desc: 'Looking for a rental' }
                    ].map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setValue("role", r.id as any)}
                        className={`flex flex-col items-center gap-3 py-6 px-4 rounded-2xl border-2 transition-all group
                          ${watchRole === r.id ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm" : "border-gray-100 bg-white text-gray-400 hover:border-indigo-200"}`}>
                        <span className={`text-3xl transition-transform ${watchRole === r.id ? 'scale-110' : 'group-hover:scale-110'}`}>{r.icon}</span>
                        <span className="font-bold">{r.label}</span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60 text-center leading-tight">
                          {r.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={nextStep}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(90deg, #6b74d6, #7b5ea7)" }}>
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-gray-400 font-medium">Or join with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/google`}
                  className="w-full py-3 rounded-xl border-2 border-gray-100 flex items-center justify-center gap-3 font-bold text-gray-600 hover:border-indigo-200 transition-all active:scale-[0.98]">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </button>
              </div>
            )}

            {/* STEP 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">First Name</label>
                    <input
                      {...register("firstName")}
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none focus:ring-2 focus:ring-indigo-100
                        ${errors.firstName ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-indigo-500'}`}
                      placeholder="Nnamdi" />
                    {errors.firstName && <p className="text-red-500 text-[10px] font-medium">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Last Name</label>
                    <input
                      {...register("lastName")}
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none focus:ring-2 focus:ring-indigo-100
                        ${errors.lastName ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-indigo-500'}`}
                      placeholder="Abioye" />
                    {errors.lastName && <p className="text-red-500 text-[10px] font-medium">{errors.lastName.message}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                  <input
                    {...register("email")}
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none focus:ring-2 focus:ring-indigo-100
                      ${errors.email ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-indigo-500'}`}
                    placeholder="nnamdi@example.com" type="email" />
                  {errors.email && <p className="text-red-500 text-[10px] font-medium">{errors.email.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    {...register("phone")}
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none focus:ring-2 focus:ring-indigo-100
                      ${errors.phone ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-indigo-500'}`}
                    placeholder="+234 800 000 0000" type="tel" />
                  {errors.phone && <p className="text-red-500 text-[10px] font-medium">{errors.phone.message}</p>}
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={prevStep}
                    className="flex-1 py-3 rounded-xl border-2 border-gray-100 text-gray-600 font-bold text-sm hover:border-indigo-200 transition-all flex items-center justify-center gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button type="button" onClick={nextStep}
                    className="flex-1 py-3 rounded-xl text-white font-bold text-sm transition-all hover:shadow-lg hover:shadow-indigo-200 flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(90deg, #6b74d6, #7b5ea7)" }}>
                    Next Step
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Security */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Password</label>
                  <div className="relative">
                    <input
                      {...register("password")}
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none focus:ring-2 focus:ring-indigo-100 pr-11
                        ${errors.password ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-indigo-500'}`}
                      placeholder="Min. 8 characters"
                      type={showPass ? "text" : "password"} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-indigo-600 transition-colors">
                      {showPass ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                  <StrengthBar password={watchPassword} />
                  {errors.password && <p className="text-red-500 text-[10px] font-medium">{errors.password.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
                  <div className="relative">
                    <input
                      {...register("confirmPassword")}
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none focus:ring-2 focus:ring-indigo-100 pr-11
                        ${errors.confirmPassword ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-indigo-500'}`}
                      placeholder="Re-enter password"
                      type={showConfirm ? "text" : "password"} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-indigo-600 transition-colors">
                      {showConfirm ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                  {watchConfirm && watchPassword === watchConfirm && (
                    <p className="text-green-500 text-[10px] font-medium">✓ Passwords match</p>
                  )}
                  {errors.confirmPassword && <p className="text-red-500 text-[10px] font-medium">{errors.confirmPassword.message}</p>}
                </div>

                <label className="flex items-start gap-3 cursor-pointer p-1 group">
                  <input type="checkbox" {...register("terms")}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 flex-shrink-0" />
                  <span className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors">
                    I agree to the{" "}
                    <button type="button" className="text-indigo-600 font-bold hover:underline">Terms</button> and{" "}
                    <button type="button" className="text-indigo-600 font-bold hover:underline">Privacy Policy</button>
                  </span>
                </label>
                {errors.terms && <p className="text-red-500 text-[10px] font-medium">{errors.terms.message}</p>}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={prevStep}
                    className="flex-1 py-3 rounded-xl border-2 border-gray-100 text-gray-600 font-bold text-sm hover:border-indigo-200 transition-all flex items-center justify-center gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button type="submit" disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl text-white font-bold text-sm transition-all hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(90deg, #6b74d6, #7b5ea7)" }}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* STEP 3: Success */}
          {step === 3 && (
            <div className="text-center py-4 space-y-6">
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2 animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h3>
                <p className="text-gray-500 text-sm leading-relaxed px-4">
                  Welcome aboard! Your profile is ready. Check your email for a confirmation link.
                </p>
              </div>
              <button onClick={() => router.push("/login")}
                className="w-full py-4 rounded-xl text-white font-bold text-sm transition-all hover:shadow-lg shadow-indigo-200 active:scale-[0.98]"
                style={{ background: "linear-gradient(90deg, #6b74d6, #7b5ea7)" }}>
                Start Now
              </button>
            </div>
          )}

          {step < 3 && (
            <div className="mt-8 pt-8 border-t border-gray-50 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-4">
                <Shield className="w-3 h-3" />
                <span>Secure, encrypted registration</span>
              </div>
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
