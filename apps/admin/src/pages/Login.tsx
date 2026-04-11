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

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    return `+91${digits}`;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (phone.length < 10) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    try {
      await apiClient.post("/api/v1/auth/otp/send", {
        mobile: formatPhone(phone),
      });
      setStep("otp");
      setCountdown(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: { message?: string } } };
      setError(e2?.response?.data?.message ?? "Failed to send OTP. Check number and school code.");
    } finally {
      setLoading(false);
    }
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
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
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
      const user: AdminUser = { ...data.user, schoolName: data.school?.name ?? "" };
      await setAuth(user, data.accessToken, data.refreshToken);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: { message?: string } } };
      setError(e2?.response?.data?.message ?? "Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError("");
    setLoading(true);
    try {
      await apiClient.post("/api/v1/auth/otp/send", {
        mobile: formatPhone(phone),
      });
      setCountdown(30);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch { setError("Failed to resend OTP"); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1B3A6B]">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">SchoolOS</h1>
          <p className="mt-1 text-sm text-[#4A4A6A]">Admin Portal</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
          {step === "phone" ? (
            <>
              <h2 className="mb-1 text-xl font-semibold text-[#1A1A2E]">Sign in</h2>
              <p className="mb-6 text-sm text-[#4A4A6A]">Enter your phone number to receive an OTP</p>
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#1A1A2E]">Phone Number</label>
                  <div className="flex overflow-hidden rounded-lg border border-gray-200 focus-within:border-[#2E7DD1] focus-within:ring-2 focus-within:ring-[#2E7DD1]/20">
                    <span className="flex items-center bg-gray-50 px-3 text-sm text-[#4A4A6A] border-r border-gray-200">+91</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="9876543210"
                      className="flex-1 px-3 py-3 text-sm outline-none"
                      autoFocus
                      maxLength={10}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#1A1A2E]">School Code</label>
                  <input
                    type="text"
                    value={schoolCode}
                    onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                    placeholder="e.g. DEMO01"
                    className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-[#2E7DD1] focus:ring-2 focus:ring-[#2E7DD1]/20"
                  />
                  <p className="mt-1 text-xs text-[#4A4A6A]">Provided by your school administrator</p>
                </div>
                {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-[#B91C1C]">{error}</div>}
                <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#1B3A6B] py-3 text-sm font-semibold text-white transition hover:bg-[#2E7DD1] disabled:opacity-60">
                  {loading ? "Sending…" : "Send OTP"}
                </button>
              </form>
            </>
          ) : (
            <>
              <button onClick={() => { setStep("phone"); setError(""); setOtp(["","","","","",""]); }}
                className="mb-4 flex items-center gap-1 text-sm text-[#4A4A6A] hover:text-[#1A1A2E]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h2 className="mb-1 text-xl font-semibold text-[#1A1A2E]">Enter OTP</h2>
              <p className="mb-6 text-sm text-[#4A4A6A]">
                Sent to <span className="font-medium text-[#1A1A2E]">+91 {phone}</span>
              </p>
              <div className="mb-6 flex justify-center gap-3">
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
                    className="h-12 w-12 rounded-xl border-2 border-gray-200 text-center text-lg font-bold text-[#1A1A2E] outline-none transition focus:border-[#2E7DD1] focus:ring-2 focus:ring-[#2E7DD1]/20"
                  />
                ))}
              </div>
              {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-[#B91C1C]">{error}</div>}
              <button onClick={() => void handleVerifyOtp()} disabled={loading || otp.some((d) => !d)}
                className="mb-4 w-full rounded-lg bg-[#1B3A6B] py-3 text-sm font-semibold text-white transition hover:bg-[#2E7DD1] disabled:opacity-60">
                {loading ? "Verifying…" : "Verify OTP"}
              </button>
              <div className="text-center text-sm text-[#4A4A6A]">
                Didn't receive it?{" "}
                <button onClick={() => void handleResend()} disabled={countdown > 0 || loading}
                  className="font-medium text-[#2E7DD1] disabled:text-gray-400">
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                </button>
              </div>
            </>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-[#4A4A6A]">© {new Date().getFullYear()} SchoolOS. All rights reserved.</p>
      </div>
    </div>
  );
}
