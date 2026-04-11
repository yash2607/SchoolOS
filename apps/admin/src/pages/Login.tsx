import { useState, useRef, useEffect, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, type AdminUser } from "../store/authStore.js";
import { apiClient } from "../lib/api.js";

type Step = "phone" | "otp";

const S: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background: "linear-gradient(135deg, #0f1f3d 0%, #1b3a6b 60%, #0f1f3d 100%)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  card: {
    display: "flex",
    width: "100%",
    maxWidth: 960,
    minHeight: 560,
    borderRadius: 24,
    overflow: "hidden",
    boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
  },
  left: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 48,
    width: "45%",
    background: "linear-gradient(160deg, #1B3A6B 0%, #0c1a33 100%)",
    flexShrink: 0,
  },
  right: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 48,
    background: "#ffffff",
  },
  logoRow: { display: "flex", alignItems: "center", gap: 10 },
  logoBox: {
    width: 40, height: 40,
    borderRadius: 12,
    background: "#2E7DD1",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 800, fontSize: 18, color: "#fff",
  },
  logoText: { fontSize: 20, fontWeight: 700, color: "#fff" },
  badge: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "4px 12px", borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 16,
  },
  dot: { width: 6, height: 6, borderRadius: 999, background: "#4ade80" },
  headline: {
    fontSize: 36, fontWeight: 800, color: "#fff",
    lineHeight: 1.25, margin: "0 0 12px",
  },
  accent: { color: "#2E7DD1" },
  subtext: { fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 },
  statsRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 32 },
  statBox: {
    borderRadius: 16, padding: "16px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  statValue: { fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 2px" },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.45)" },
  copyright: { fontSize: 11, color: "rgba(255,255,255,0.2)" },

  // Right panel
  heading: { fontSize: 26, fontWeight: 800, color: "#1A1A2E", margin: "0 0 6px" },
  subheading: { fontSize: 14, color: "#6B7280", margin: "0 0 32px" },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 },
  phoneWrap: {
    display: "flex", overflow: "hidden",
    borderRadius: 12, border: "2px solid #E5E7EB",
    transition: "border-color 0.2s",
  },
  phonePrefix: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "0 16px", background: "#F9FAFB",
    borderRight: "2px solid #E5E7EB",
    fontSize: 14, fontWeight: 600, color: "#4A4A6A",
    whiteSpace: "nowrap" as const,
  },
  phoneInput: {
    flex: 1, padding: "14px 16px",
    border: "none", outline: "none",
    fontSize: 14, color: "#1A1A2E", background: "transparent",
  },
  input: {
    width: "100%", padding: "14px 16px",
    borderRadius: 12, border: "2px solid #E5E7EB",
    fontSize: 14, color: "#1A1A2E", outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s",
  },
  hint: { fontSize: 12, color: "#9CA3AF", marginTop: 6 },
  error: {
    display: "flex", alignItems: "flex-start", gap: 10,
    padding: "12px 16px", borderRadius: 12,
    background: "#FEF2F2", border: "1px solid #FECACA",
    fontSize: 13, color: "#B91C1C", marginTop: 8,
  },
  btn: {
    width: "100%", padding: "14px",
    borderRadius: 12, border: "none",
    fontSize: 14, fontWeight: 700, color: "#fff",
    cursor: "pointer", transition: "background 0.2s",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    marginTop: 8,
  },
  btnPrimary: { background: "#1B3A6B" },
  btnDisabled: { background: "#93C5FD", cursor: "not-allowed" },
  backBtn: {
    display: "flex", alignItems: "center", gap: 6,
    background: "none", border: "none", cursor: "pointer",
    fontSize: 13, color: "#6B7280", marginBottom: 24, padding: 0,
  },
  otpRow: { display: "flex", gap: 10, justifyContent: "space-between", margin: "0 0 24px" },
  otpBoxFilled: {
    width: 52, height: 56, borderRadius: 14,
    border: "2px solid #1B3A6B", background: "#EFF6FF",
    textAlign: "center" as const, fontSize: 22, fontWeight: 800,
    color: "#1A1A2E", outline: "none", transition: "all 0.15s",
  },
  otpBoxEmpty: {
    width: 52, height: 56, borderRadius: 14,
    border: "2px solid #E5E7EB", background: "#F9FAFB",
    textAlign: "center" as const, fontSize: 22, fontWeight: 800,
    color: "#1A1A2E", outline: "none", transition: "all 0.15s",
  },
  resend: { textAlign: "center" as const, fontSize: 13, color: "#6B7280", marginTop: 20 },
  resendBtnActive: {
    background: "none", border: "none",
    fontSize: 13, fontWeight: 700, color: "#2E7DD1",
    cursor: "pointer", padding: 0,
  },
  resendBtnDisabled: {
    background: "none", border: "none",
    fontSize: 13, fontWeight: 700, color: "#9CA3AF",
    cursor: "not-allowed", padding: 0,
  },
  footer: { fontSize: 11, color: "#D1D5DB", textAlign: "center" as const, marginTop: 32 },
};

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

  const fmt = (raw: string) => `+91${raw.replace(/\D/g, "")}`;

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (phone.length < 10) { setError("Enter a valid 10-digit phone number"); return; }
    setLoading(true);
    try {
      await apiClient.post("/api/v1/auth/otp/send", { mobile: fmt(phone) });
      setStep("otp");
      setCountdown(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e2?.response?.data?.message ?? e2?.message ?? "Network error — check your connection");
    } finally { setLoading(false); }
  };

  const otpChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[i] = val.slice(-1); setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
    if (next.every((d) => d) && val) void verifyOtp(next.join(""));
  };

  const otpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const verifyOtp = async (code?: string) => {
    const c = code ?? otp.join("");
    if (c.length !== 6) { setError("Enter all 6 digits"); return; }
    setError(""); setLoading(true);
    try {
      const { data } = await apiClient.post<{
        user: AdminUser; school: { id: string; name: string };
        accessToken: string; refreshToken: string;
      }>("/api/v1/auth/otp/verify", { mobile: fmt(phone), otp: c });
      await setAuth({ ...data.user, schoolName: data.school?.name ?? "" }, data.accessToken, data.refreshToken);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e2?.response?.data?.message ?? e2?.message ?? "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally { setLoading(false); }
  };

  const resend = async () => {
    if (countdown > 0) return;
    setError(""); setLoading(true);
    try {
      await apiClient.post("/api/v1/auth/otp/send", { mobile: fmt(phone) });
      setCountdown(30); setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch { setError("Failed to resend OTP"); }
    finally { setLoading(false); }
  };

  const isDisabled = loading || (step === "phone" ? phone.length < 10 : otp.some((d) => !d));

  return (
    <div style={S.page}>
      <div style={S.card}>

        {/* ── Left branding panel ── */}
        <div style={S.left}>
          <div style={S.logoRow}>
            <div style={S.logoBox}>S</div>
            <span style={S.logoText}>SchoolOS</span>
          </div>

          <div>
            <div style={S.badge}>
              <div style={S.dot} />
              Admin Portal · Secure Login
            </div>
            <h1 style={S.headline}>
              Manage your school<br />
              <span style={S.accent}>smarter.</span>
            </h1>
            <p style={S.subtext}>
              Attendance, academics, fees &amp; communication — all in one place.
            </p>
            <div style={S.statsRow}>
              {[["500+", "Schools"], ["2L+", "Students"], ["99.9%", "Uptime"]].map(([v, l]) => (
                <div key={l} style={S.statBox}>
                  <p style={S.statValue}>{v}</p>
                  <p style={S.statLabel}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          <p style={S.copyright}>© {new Date().getFullYear()} SchoolOS. All rights reserved.</p>
        </div>

        {/* ── Right form panel ── */}
        <div style={S.right}>
          {step === "phone" ? (
            <>
              <p style={S.heading}>Welcome back</p>
              <p style={S.subheading}>Sign in with your phone number</p>

              <form onSubmit={sendOtp}>
                {/* Phone */}
                <label style={S.label}>Phone Number</label>
                <div style={S.phoneWrap}>
                  <div style={S.phonePrefix}>🇮🇳 +91</div>
                  <input
                    style={S.phoneInput}
                    type="tel" value={phone} autoFocus maxLength={10}
                    placeholder="98765 43210"
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  />
                  {phone.length === 10 && <div style={{ display: "flex", alignItems: "center", paddingRight: 12, color: "#1A7A4A", fontSize: 20 }}>✓</div>}
                </div>

                {/* School code */}
                <div style={{ marginTop: 20 }}>
                  <label style={S.label}>School Code</label>
                  <input
                    style={S.input} type="text" value={schoolCode}
                    placeholder="e.g. DEMO01"
                    onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                  />
                  <p style={S.hint}>Provided by your school administrator</p>
                </div>

                {error && <div style={S.error}>⚠ {error}</div>}

                <button type="submit" disabled={isDisabled} style={{ ...S.btn, ...(isDisabled ? S.btnDisabled : S.btnPrimary) }}>
                  {loading ? "Sending OTP…" : "Send OTP via WhatsApp →"}
                </button>
              </form>

              <p style={S.footer}>© {new Date().getFullYear()} SchoolOS · Secure Admin Portal</p>
            </>
          ) : (
            <>
              <button style={S.backBtn} onClick={() => { setStep("phone"); setError(""); setOtp(["","","","","",""]); }}>
                ← Change number
              </button>

              <p style={S.heading}>Enter OTP</p>
              <p style={S.subheading}>
                Sent via WhatsApp to <strong style={{ color: "#1A1A2E" }}>+91 {phone}</strong>
              </p>

              <div style={S.otpRow}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    style={digit ? S.otpBoxFilled : S.otpBoxEmpty}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={(e) => otpChange(i, e.target.value)}
                    onKeyDown={(e) => otpKey(i, e)}
                  />
                ))}
              </div>

              {error && <div style={S.error}>⚠ {error}</div>}

              <button
                disabled={isDisabled}
                style={{ ...S.btn, ...(isDisabled ? S.btnDisabled : S.btnPrimary), marginTop: 16 }}
                onClick={() => void verifyOtp()}
              >
                {loading ? "Verifying…" : "Verify & Sign In"}
              </button>

              <p style={S.resend}>
                Didn't receive it?{" "}
                <button style={countdown > 0 || loading ? S.resendBtnDisabled : S.resendBtnActive} onClick={() => void resend()} disabled={countdown > 0 || loading}>
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                </button>
              </p>

              <p style={S.footer}>© {new Date().getFullYear()} SchoolOS · Secure Admin Portal</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
