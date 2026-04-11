import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, type AdminUser } from "../store/authStore.js";
import { apiClient } from "../lib/api.js";

type Step = "phone" | "otp";

export function LoginPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [schoolCode, setSchoolCode] = useState("DEMO01");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const formatPhone = (raw: string) => `+91${raw.replace(/\D/g, "")}`;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (phone.length < 10) { setError("Enter a valid 10-digit phone number"); return; }
    setLoading(true);
    try {
      await apiClient.post("/api/v1/auth/otp/send", { mobile: formatPhone(phone) });
      setStep("otp");
      setCountdown(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: { message?: string } } };
      setError(e2?.response?.data?.message ?? "Failed to send OTP. Check your number and school code.");
    } finally { setLoading(false); }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (next.every((d) => d) && value) void handleVerifyOtp(next.join(""));
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleVerifyOtp = async (code?: string) => {
    const otpCode = code ?? otp.join("");
    if (otpCode.length !== 6) { setError("Enter all 6 digits"); return; }
    setError("");
    setLoading(true);
    try {
      const { data } = await apiClient.post<{
        user: AdminUser;
        school: { id: string; name: string };
        accessToken: string;
        refreshToken: string;
      }>("/api/v1/auth/otp/verify", { mobile: formatPhone(phone), otp: otpCode });
      await setAuth({ ...data.user, schoolName: data.school?.name ?? "" }, data.accessToken, data.refreshToken);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: { message?: string } } };
      setError(e2?.response?.data?.message ?? "Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError("");
    setLoading(true);
    try {
      await apiClient.post("/api/v1/auth/otp/send", { mobile: formatPhone(phone) });
      setCountdown(30);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch { setError("Failed to resend OTP"); }
    finally { setLoading(false); }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#0F1F3D]">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#2E7DD1]/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#1B3A6B]/40 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2E7DD1]/10 blur-2xl" />
      </div>

      {/* Left panel — branding (hidden on mobile) */}
      <div className="relative hidden flex-col justify-between p-12 lg:flex lg:w-1/2">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2E7DD1]">
            <span className="text-lg font-bold text-white">S</span>
          </div>
          <span className="text-xl font-bold text-white">SchoolOS</span>
        </div>

        {/* Center content */}
        <div>
          <h1 className="mb-4 text-5xl font-bold leading-tight text-white">
            Manage your school<br />
            <span className="text-[#2E7DD1]">smarter.</span>
          </h1>
          <p className="text-lg text-white/60">
            One platform for attendance, academics, fees, and communication.
          </p>

          {/* Stats row */}
          <div className="mt-10 grid grid-cols-3 gap-6">
            {[
              { label: "Schools", value: "500+" },
              { label: "Students", value: "2L+" },
              { label: "Uptime", value: "99.9%" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-sm text-white/50">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-white/30">© {new Date().getFullYear()} SchoolOS. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="relative flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2E7DD1]">
              <span className="text-lg font-bold text-white">S</span>
            </div>
            <span className="text-xl font-bold text-white">SchoolOS</span>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
            {step === "phone" ? (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white">Welcome back</h2>
                  <p className="mt-1 text-sm text-white/50">Sign in to your admin portal</p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-5">
                  {/* Phone field */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/70">Phone Number</label>
                    <div className="flex overflow-hidden rounded-xl border border-white/10 bg-white/5 transition focus-within:border-[#2E7DD1] focus-within:ring-2 focus-within:ring-[#2E7DD1]/30">
                      <div className="flex items-center gap-2 border-r border-white/10 px-4">
                        <span className="text-base">🇮🇳</span>
                        <span className="text-sm font-medium text-white/60">+91</span>
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="98765 43210"
                        className="flex-1 bg-transparent px-4 py-3.5 text-sm text-white placeholder-white/30 outline-none"
                        autoFocus
                        maxLength={10}
                      />
                    </div>
                  </div>

                  {/* School code field */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/70">School Code</label>
                    <input
                      type="text"
                      value={schoolCode}
                      onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                      placeholder="e.g. DEMO01"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-[#2E7DD1] focus:ring-2 focus:ring-[#2E7DD1]/30"
                    />
                    <p className="mt-1.5 text-xs text-white/30">Provided by your school administrator</p>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20">
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading || phone.length < 10}
                    className="relative w-full overflow-hidden rounded-xl bg-[#2E7DD1] py-3.5 text-sm font-semibold text-white transition hover:bg-[#1B3A6B] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending OTP…
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Send OTP via WhatsApp
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <>
                {/* Back */}
                <button
                  onClick={() => { setStep("phone"); setError(""); setOtp(["","","","","",""]); }}
                  className="mb-6 flex items-center gap-1.5 text-sm text-white/50 transition hover:text-white"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Change number
                </button>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white">Enter OTP</h2>
                  <p className="mt-1 text-sm text-white/50">
                    Sent to{" "}
                    <span className="font-semibold text-white">+91 {phone.replace(/(\d{5})(\d{5})/, "$1 $2")}</span>
                  </p>
                </div>

                {/* OTP boxes */}
                <div className="mb-6 flex justify-between gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`h-14 w-14 rounded-2xl border-2 bg-white/5 text-center text-xl font-bold text-white outline-none transition ${
                        digit
                          ? "border-[#2E7DD1] bg-[#2E7DD1]/10"
                          : "border-white/10 focus:border-[#2E7DD1] focus:bg-[#2E7DD1]/5"
                      }`}
                    />
                  ))}
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20">
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}

                {/* Verify button */}
                <button
                  onClick={() => void handleVerifyOtp()}
                  disabled={loading || otp.some((d) => !d)}
                  className="mb-5 w-full rounded-xl bg-[#2E7DD1] py-3.5 text-sm font-semibold text-white transition hover:bg-[#1B3A6B] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Verifying…
                    </span>
                  ) : "Verify & Sign In"}
                </button>

                {/* Resend */}
                <div className="text-center text-sm text-white/40">
                  Didn't receive it?{" "}
                  <button
                    onClick={() => void handleResend()}
                    disabled={countdown > 0 || loading}
                    className="font-semibold text-[#2E7DD1] transition hover:text-white disabled:text-white/20 disabled:cursor-not-allowed"
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-white/20">
            © {new Date().getFullYear()} SchoolOS · Secure Admin Portal
          </p>
        </div>
      </div>
    </div>
  );
}
