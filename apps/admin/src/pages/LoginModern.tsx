import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, type AdminUser } from "../store/authStore.js";
import { apiClient } from "../lib/api.js";
import { getDefaultPortalPath } from "../lib/portal.js";

type AuthMode = "password" | "otp" | "reset";
type OtpStage = "request" | "verify";

const TRUST_MARKERS = [
  { value: "500+", label: "schools onboarded" },
  { value: "2L+", label: "student records" },
  { value: "99.9%", label: "platform uptime" },
];

const BENEFITS = [
  "Unified academic, finance, attendance, and communication workflows",
  "Faster parent engagement with WhatsApp and in-app touchpoints",
  "Role-aware access for admin, teachers, and parents",
];

const S: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "32px 20px",
    background:
      "radial-gradient(circle at top left, rgba(102,126,234,0.25), transparent 30%), linear-gradient(145deg, #091224 0%, #152c52 45%, #0d1728 100%)",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  shell: {
    width: "100%",
    maxWidth: 1180,
    display: "grid",
    gridTemplateColumns: "1.08fr 0.92fr",
    borderRadius: 32,
    overflow: "hidden",
    background: "rgba(8, 15, 29, 0.18)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 32px 120px rgba(4, 10, 24, 0.42)",
    backdropFilter: "blur(18px)",
  },
  left: {
    position: "relative",
    padding: "42px 42px 36px",
    color: "#F8FAFC",
    background:
      "linear-gradient(180deg, rgba(8,21,42,0.9) 0%, rgba(11,22,42,0.78) 100%), radial-gradient(circle at top right, rgba(73,109,255,0.3), transparent 30%)",
  },
  glow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 78% 12%, rgba(95, 129, 255, 0.28), transparent 18%), radial-gradient(circle at 18% 78%, rgba(25, 200, 171, 0.18), transparent 22%)",
    pointerEvents: "none",
  },
  leftContent: { position: "relative", zIndex: 1, display: "grid", gap: 28 },
  logoRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  brand: { display: "flex", alignItems: "center", gap: 14 },
  logoMark: {
    width: 54,
    height: 54,
    borderRadius: 18,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #90A7FF 0%, #4F6DFF 100%)",
    color: "#081221",
    fontWeight: 900,
    fontSize: 22,
    boxShadow: "0 16px 40px rgba(79,109,255,0.35)",
  },
  brandTitle: { margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em" },
  brandSub: {
    margin: "4px 0 0",
    color: "rgba(226,232,240,0.72)",
    fontSize: 12,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 14px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#D7E3FF",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  badgeDot: { width: 7, height: 7, borderRadius: 999, background: "#22C55E" },
  hero: { marginTop: 22 },
  eyebrow: {
    margin: "0 0 12px",
    color: "#9FB3FF",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  headline: {
    margin: 0,
    fontSize: 50,
    fontWeight: 900,
    lineHeight: 1.02,
    letterSpacing: "-0.05em",
    maxWidth: 480,
  },
  headlineAccent: { color: "#93C5FD" },
  body: {
    margin: "18px 0 0",
    maxWidth: 520,
    color: "rgba(226,232,240,0.78)",
    fontSize: 16,
    lineHeight: 1.75,
  },
  markerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 14,
    marginTop: 8,
  },
  markerCard: {
    padding: "18px 18px 16px",
    borderRadius: 22,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  markerValue: { margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: "-0.04em" },
  markerLabel: {
    margin: "6px 0 0",
    color: "rgba(226,232,240,0.62)",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  benefitPanel: {
    borderRadius: 26,
    padding: 26,
    background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  benefitTitle: { margin: 0, fontSize: 17, fontWeight: 800 },
  benefitList: { display: "grid", gap: 14, marginTop: 18 },
  benefitItem: { display: "flex", gap: 12, alignItems: "flex-start" },
  benefitIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "rgba(147,197,253,0.14)",
    color: "#BFDBFE",
    flexShrink: 0,
    fontWeight: 900,
  },
  benefitText: { margin: 0, color: "rgba(226,232,240,0.78)", lineHeight: 1.6, fontSize: 14 },
  right: {
    padding: "40px 36px",
    background:
      "linear-gradient(180deg, rgba(248,250,252,0.98) 0%, rgba(239,244,255,0.98) 100%)",
    display: "flex",
    alignItems: "center",
  },
  formWrap: { width: "100%", maxWidth: 452, margin: "0 auto" },
  overline: {
    margin: 0,
    color: "#4F46E5",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  title: {
    margin: "14px 0 8px",
    color: "#0F172A",
    fontSize: 36,
    fontWeight: 900,
    letterSpacing: "-0.04em",
  },
  subtitle: { margin: 0, color: "#475569", fontSize: 15, lineHeight: 1.7 },
  modeRow: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
    marginTop: 28,
    padding: 8,
    borderRadius: 20,
    background: "#E2E8F0",
  },
  modeBtn: {
    border: "none",
    borderRadius: 14,
    padding: "14px 16px",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
    transition: "all 0.18s ease",
  },
  modeBtnActive: {
    background: "#FFFFFF",
    color: "#0F172A",
    boxShadow: "0 12px 30px rgba(15,23,42,0.1)",
  },
  modeBtnIdle: { background: "transparent", color: "#475569" },
  card: {
    marginTop: 18,
    background: "#FFFFFF",
    borderRadius: 28,
    border: "1px solid #E2E8F0",
    boxShadow: "0 20px 40px rgba(15, 23, 42, 0.07)",
    padding: 26,
  },
  sectionTitle: { margin: 0, color: "#0F172A", fontSize: 19, fontWeight: 800 },
  sectionBody: { margin: "8px 0 0", color: "#64748B", fontSize: 14, lineHeight: 1.7 },
  form: { display: "grid", gap: 18, marginTop: 24 },
  field: { display: "grid", gap: 8 },
  fieldRow: { display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center" },
  label: { fontSize: 13, fontWeight: 800, color: "#334155" },
  helper: { fontSize: 12, color: "#64748B" },
  input: {
    width: "100%",
    boxSizing: "border-box",
    borderRadius: 18,
    border: "1px solid #CBD5E1",
    background: "#F8FAFC",
    padding: "15px 16px",
    fontSize: 15,
    color: "#0F172A",
    outline: "none",
  },
  phoneWrap: {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    alignItems: "center",
    borderRadius: 18,
    border: "1px solid #CBD5E1",
    background: "#F8FAFC",
    overflow: "hidden",
  },
  phonePrefix: {
    padding: "15px 16px",
    background: "#EEF2FF",
    color: "#334155",
    fontSize: 13,
    fontWeight: 800,
    borderRight: "1px solid #CBD5E1",
  },
  phoneInput: {
    border: "none",
    background: "transparent",
    padding: "15px 16px",
    fontSize: 15,
    outline: "none",
    color: "#0F172A",
  },
  phoneValid: {
    paddingRight: 16,
    color: "#0F766E",
    fontWeight: 900,
    fontSize: 18,
  },
  actionBtn: {
    border: "none",
    borderRadius: 18,
    padding: "16px 18px",
    fontSize: 15,
    fontWeight: 800,
    color: "#FFFFFF",
    cursor: "pointer",
    background: "linear-gradient(135deg, #1D4ED8 0%, #4338CA 100%)",
    boxShadow: "0 18px 38px rgba(67, 56, 202, 0.26)",
  },
  actionBtnMuted: {
    border: "1px solid #CBD5E1",
    borderRadius: 18,
    padding: "15px 18px",
    fontSize: 14,
    fontWeight: 800,
    background: "#F8FAFC",
    color: "#334155",
    cursor: "pointer",
  },
  disabled: { opacity: 0.62, cursor: "not-allowed" },
  error: {
    borderRadius: 18,
    border: "1px solid #FECACA",
    background: "#FEF2F2",
    color: "#B91C1C",
    padding: "12px 14px",
    fontSize: 13,
    lineHeight: 1.6,
  },
  success: {
    borderRadius: 18,
    border: "1px solid #BFDBFE",
    background: "#EFF6FF",
    color: "#1E40AF",
    padding: "12px 14px",
    fontSize: 13,
    lineHeight: 1.6,
  },
  otpRow: { display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 10 },
  otpBox: {
    width: "100%",
    height: 60,
    borderRadius: 18,
    border: "1px solid #CBD5E1",
    background: "#F8FAFC",
    textAlign: "center",
    fontSize: 24,
    fontWeight: 900,
    color: "#0F172A",
    outline: "none",
  },
  footer: {
    marginTop: 18,
    fontSize: 12,
    color: "#64748B",
    lineHeight: 1.7,
    textAlign: "center",
  },
  formActions: { display: "grid", gap: 12 },
};

const formatIndianMobile = (raw: string) => `+91${raw.replace(/\D/g, "").slice(0, 10)}`;

export function LoginModernPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated, user } = useAuthStore();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [mode, setMode] = useState<AuthMode>("password");
  const [otpStage, setOtpStage] = useState<OtpStage>("request");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [schoolCode, setSchoolCode] = useState("DEMO01");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resetPhone, setResetPhone] = useState("");
  const [resetOtpStage, setResetOtpStage] = useState<OtpStage>("request");
  const [resetOtp, setResetOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetCountdown, setResetCountdown] = useState(0);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const resetOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(getDefaultPortalPath(user?.role), { replace: true });
    }
  }, [isAuthenticated, navigate, user?.role]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (resetCountdown <= 0) return;
    const timer = setTimeout(() => setResetCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [resetCountdown]);

  const resetOtpFlow = () => {
    setOtpStage("request");
    setOtp(["", "", "", "", "", ""]);
    setCountdown(0);
    setInfo("");
  };

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError("");
    setInfo("");
    if (nextMode === "password") {
      resetOtpFlow();
    }
  };

  const resetPasswordFlow = () => {
    setResetOtpStage("request");
    setResetPhone("");
    setResetOtp(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
    setResetCountdown(0);
    setInfo("");
  };

  const completeLogin = async (payload: {
    accessToken: string;
    refreshToken: string;
    user: AdminUser;
    school: { id: string; name: string };
  }) => {
    await setAuth(
      { ...payload.user, schoolName: payload.school?.name ?? "" },
      payload.accessToken,
      payload.refreshToken,
    );
    navigate(getDefaultPortalPath(payload.user.role), { replace: true });
  };

  const handlePasswordLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setInfo("");

    if (!identifier.trim()) {
      setError("Enter your school email address or phone number.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        user: AdminUser;
        school: { id: string; name: string };
      }>("/api/v1/auth/login", {
        identifier: identifier.trim(),
        password,
        schoolCode: schoolCode.trim() || undefined,
      });
      await completeLogin(data);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } }; message?: string };
      setError(apiError?.response?.data?.message ?? apiError?.message ?? "Unable to sign in right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setInfo("");

    if (phone.length !== 10) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/api/v1/auth/otp/send", {
        mobile: formatIndianMobile(phone),
        schoolCode: schoolCode.trim() || undefined,
      });
      setOtpStage("verify");
      setCountdown(30);
      setInfo("OTP sent successfully. Enter the 6-digit code from WhatsApp.");
      setTimeout(() => otpRefs.current[0]?.focus(), 80);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } }; message?: string };
      setError(apiError?.response?.data?.message ?? apiError?.message ?? "Unable to send OTP right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setError("");
    if (value && index < next.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
    if (next.every(Boolean) && value) {
      void handleVerifyOtp(next.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (code = otp.join("")) => {
    if (code.length !== 6) {
      setError("Enter the full 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { data } = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        user: AdminUser;
        school: { id: string; name: string };
      }>("/api/v1/auth/otp/verify", {
        mobile: formatIndianMobile(phone),
        otp: code,
        schoolCode: schoolCode.trim() || undefined,
      });
      await completeLogin(data);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } }; message?: string };
      setError(apiError?.response?.data?.message ?? apiError?.message ?? "Invalid OTP.");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || loading) return;
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await apiClient.post("/api/v1/auth/otp/send", {
        mobile: formatIndianMobile(phone),
        schoolCode: schoolCode.trim() || undefined,
      });
      setCountdown(30);
      setOtp(["", "", "", "", "", ""]);
      setInfo("A fresh OTP is on its way to your WhatsApp number.");
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } }; message?: string };
      setError(apiError?.response?.data?.message ?? apiError?.message ?? "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setInfo("");

    if (resetPhone.length !== 10) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/api/v1/auth/otp/send", {
        mobile: formatIndianMobile(resetPhone),
        schoolCode: schoolCode.trim() || undefined,
      });
      setResetOtpStage("verify");
      setResetCountdown(30);
      setInfo("OTP sent. Verify it and choose your new password.");
      setTimeout(() => resetOtpRefs.current[0]?.focus(), 80);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } }; message?: string };
      setError(apiError?.response?.data?.message ?? apiError?.message ?? "Unable to send OTP right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...resetOtp];
    next[index] = value.slice(-1);
    setResetOtp(next);
    setError("");
    if (value && index < next.length - 1) {
      resetOtpRefs.current[index + 1]?.focus();
    }
  };

  const handleResetOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !resetOtp[index] && index > 0) {
      resetOtpRefs.current[index - 1]?.focus();
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setInfo("");

    if (resetOtp.join("").length !== 6) {
      setError("Enter the full 6-digit OTP.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        user: AdminUser;
        school: { id: string; name: string };
      }>("/api/v1/auth/password/reset", {
        mobile: formatIndianMobile(resetPhone),
        otp: resetOtp.join(""),
        newPassword,
        schoolCode: schoolCode.trim() || undefined,
      });
      await completeLogin(data);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } }; message?: string };
      setError(apiError?.response?.data?.message ?? apiError?.message ?? "Unable to set password right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendResetOtp = async () => {
    if (resetCountdown > 0 || loading) return;
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await apiClient.post("/api/v1/auth/otp/send", {
        mobile: formatIndianMobile(resetPhone),
        schoolCode: schoolCode.trim() || undefined,
      });
      setResetCountdown(30);
      setResetOtp(["", "", "", "", "", ""]);
      setInfo("A fresh OTP has been sent for password setup.");
      setTimeout(() => resetOtpRefs.current[0]?.focus(), 50);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } }; message?: string };
      setError(apiError?.response?.data?.message ?? apiError?.message ?? "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const passwordDisabled = loading || !identifier.trim() || password.length < 8;
  const otpRequestDisabled = loading || phone.length !== 10;
  const otpVerifyDisabled = loading || otp.some((digit) => !digit);
  const resetRequestDisabled = loading || resetPhone.length !== 10;
  const resetSubmitDisabled =
    loading ||
    resetOtp.some((digit) => !digit) ||
    newPassword.length < 8 ||
    confirmPassword.length < 8;

  return (
    <div style={S.page}>
      <div style={S.shell}>
        <section style={S.left}>
          <div style={S.glow} />
          <div style={S.leftContent}>
            <div style={S.logoRow}>
              <div style={S.brand}>
                <div style={S.logoMark}>SO</div>
                <div>
                  <p style={S.brandTitle}>SchoolOS</p>
                  <p style={S.brandSub}>Premium school ERP suite</p>
                </div>
              </div>
              <div style={S.badge}>
                <span style={S.badgeDot} />
                Secure identity
              </div>
            </div>

            <div style={S.hero}>
              <p style={S.eyebrow}>Administrative control center</p>
              <h1 style={S.headline}>
                A modern <span style={S.headlineAccent}>school operating system</span> for every stakeholder.
              </h1>
              <p style={S.body}>
                Move between password-based sign-in and WhatsApp OTP without friction.
                SchoolOS keeps access simple while preserving a premium, trustworthy entry point for your ERP.
              </p>
            </div>

            <div style={S.markerGrid}>
              {TRUST_MARKERS.map((item) => (
                <div key={item.label} style={S.markerCard}>
                  <p style={S.markerValue}>{item.value}</p>
                  <p style={S.markerLabel}>{item.label}</p>
                </div>
              ))}
            </div>

            <div style={S.benefitPanel}>
              <p style={S.benefitTitle}>Why this login flow feels better</p>
              <div style={S.benefitList}>
                {BENEFITS.map((benefit) => (
                  <div key={benefit} style={S.benefitItem}>
                    <div style={S.benefitIcon}>+</div>
                    <p style={S.benefitText}>{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={S.right}>
          <div style={S.formWrap}>
            <p style={S.overline}>Welcome back</p>
            <h2 style={S.title}>Sign in your way</h2>
            <p style={S.subtitle}>
              Use your school email or phone number with a password, or switch to OTP
              when you want a faster phone-based sign-in.
            </p>

            <div style={S.modeRow}>
              {[
                { key: "password", label: "Password login" },
                { key: "otp", label: "OTP login" },
                { key: "reset", label: "Set password" },
              ].map((item) => {
                const active = mode === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    style={{ ...S.modeBtn, ...(active ? S.modeBtnActive : S.modeBtnIdle) }}
                    onClick={() => handleModeChange(item.key as AuthMode)}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div style={S.card}>
              {mode === "password" ? (
                <>
                  <p style={S.sectionTitle}>Email or phone with password</p>
                  <p style={S.sectionBody}>
                    Works with your school-issued credentials. Use email for staff accounts or your registered phone number for parent access.
                  </p>

                  <form style={S.form} onSubmit={handlePasswordLogin}>
                    <div style={S.field}>
                      <label style={S.label}>Email address or phone number</label>
                      <input
                        style={S.input}
                        type="text"
                        value={identifier}
                        autoFocus
                        placeholder="admin@schoolos.app or 9876543210"
                        onChange={(event) => setIdentifier(event.target.value)}
                      />
                    </div>

                    <div style={S.field}>
                      <div style={S.fieldRow}>
                        <label style={S.label}>Password</label>
                        <span style={S.helper}>Minimum 8 characters</span>
                      </div>
                      <input
                        style={S.input}
                        type="password"
                        value={password}
                        placeholder="Enter your password"
                        onChange={(event) => setPassword(event.target.value)}
                      />
                    </div>

                    <div style={S.field}>
                      <div style={S.fieldRow}>
                        <label style={S.label}>School code</label>
                        <span style={S.helper}>Optional</span>
                      </div>
                      <input
                        style={S.input}
                        type="text"
                        value={schoolCode}
                        placeholder="DEMO01"
                        onChange={(event) => setSchoolCode(event.target.value.toUpperCase())}
                      />
                    </div>

                    {error ? <div style={S.error}>{error}</div> : null}

                    <div style={S.formActions}>
                      <button
                        type="submit"
                        disabled={passwordDisabled}
                        style={{ ...S.actionBtn, ...(passwordDisabled ? S.disabled : null) }}
                      >
                        {loading ? "Signing in..." : "Continue to SchoolOS"}
                      </button>
                    </div>
                  </form>
                </>
              ) : mode === "otp" ? (
                <>
                  <p style={S.sectionTitle}>Phone number with WhatsApp OTP</p>
                  <p style={S.sectionBody}>
                    Great for parent access and quick sign-ins. Enter your phone number, receive a secure OTP, then verify it here.
                  </p>

                  {otpStage === "request" ? (
                    <form style={S.form} onSubmit={handleSendOtp}>
                      <div style={S.field}>
                        <label style={S.label}>Registered phone number</label>
                        <div style={S.phoneWrap}>
                          <div style={S.phonePrefix}>IN +91</div>
                          <input
                            style={S.phoneInput}
                            type="tel"
                            value={phone}
                            autoFocus
                            maxLength={10}
                            placeholder="9876543210"
                            onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                          />
                          {phone.length === 10 ? <div style={S.phoneValid}>OK</div> : null}
                        </div>
                      </div>

                      <div style={S.field}>
                        <div style={S.fieldRow}>
                          <label style={S.label}>School code</label>
                          <span style={S.helper}>Optional</span>
                        </div>
                        <input
                          style={S.input}
                          type="text"
                          value={schoolCode}
                          placeholder="DEMO01"
                          onChange={(event) => setSchoolCode(event.target.value.toUpperCase())}
                        />
                      </div>

                      {error ? <div style={S.error}>{error}</div> : null}
                      {info ? <div style={S.success}>{info}</div> : null}

                      <button
                        type="submit"
                        disabled={otpRequestDisabled}
                        style={{ ...S.actionBtn, ...(otpRequestDisabled ? S.disabled : null) }}
                      >
                        {loading ? "Sending OTP..." : "Send OTP via WhatsApp"}
                      </button>
                    </form>
                  ) : (
                    <div style={S.form}>
                      <div style={S.field}>
                        <div style={S.fieldRow}>
                          <label style={S.label}>Enter the 6-digit OTP</label>
                          <span style={S.helper}>Sent to +91 {phone}</span>
                        </div>
                        <div style={S.otpRow}>
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              ref={(element) => {
                                otpRefs.current[index] = element;
                              }}
                              style={S.otpBox}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(event) => handleOtpChange(index, event.target.value)}
                              onKeyDown={(event) => handleOtpKeyDown(index, event)}
                            />
                          ))}
                        </div>
                      </div>

                      {error ? <div style={S.error}>{error}</div> : null}
                      {info ? <div style={S.success}>{info}</div> : null}

                      <div style={S.formActions}>
                        <button
                          type="button"
                          disabled={otpVerifyDisabled}
                          onClick={() => void handleVerifyOtp()}
                          style={{ ...S.actionBtn, ...(otpVerifyDisabled ? S.disabled : null) }}
                        >
                          {loading ? "Verifying..." : "Verify and sign in"}
                        </button>
                        <button
                          type="button"
                          style={S.actionBtnMuted}
                          onClick={() => {
                            resetOtpFlow();
                            setError("");
                          }}
                        >
                          Use a different number
                        </button>
                        <button
                          type="button"
                          style={{ ...S.actionBtnMuted, ...(countdown > 0 || loading ? S.disabled : null) }}
                          disabled={countdown > 0 || loading}
                          onClick={() => void handleResendOtp()}
                        >
                          {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p style={S.sectionTitle}>Set or reset password with OTP</p>
                  <p style={S.sectionBody}>
                    Verify your registered phone number with OTP, create a fresh password,
                    and we will sign you in automatically.
                  </p>

                  {resetOtpStage === "request" ? (
                    <form style={S.form} onSubmit={handleSendResetOtp}>
                      <div style={S.field}>
                        <label style={S.label}>Registered phone number</label>
                        <div style={S.phoneWrap}>
                          <div style={S.phonePrefix}>IN +91</div>
                          <input
                            style={S.phoneInput}
                            type="tel"
                            value={resetPhone}
                            autoFocus
                            maxLength={10}
                            placeholder="9876543210"
                            onChange={(event) =>
                              setResetPhone(event.target.value.replace(/\D/g, "").slice(0, 10))
                            }
                          />
                          {resetPhone.length === 10 ? <div style={S.phoneValid}>OK</div> : null}
                        </div>
                      </div>

                      <div style={S.field}>
                        <div style={S.fieldRow}>
                          <label style={S.label}>School code</label>
                          <span style={S.helper}>Optional</span>
                        </div>
                        <input
                          style={S.input}
                          type="text"
                          value={schoolCode}
                          placeholder="DEMO01"
                          onChange={(event) => setSchoolCode(event.target.value.toUpperCase())}
                        />
                      </div>

                      {error ? <div style={S.error}>{error}</div> : null}
                      {info ? <div style={S.success}>{info}</div> : null}

                      <button
                        type="submit"
                        disabled={resetRequestDisabled}
                        style={{ ...S.actionBtn, ...(resetRequestDisabled ? S.disabled : null) }}
                      >
                        {loading ? "Sending OTP..." : "Send OTP for password setup"}
                      </button>
                    </form>
                  ) : (
                    <div style={S.form}>
                      <div style={S.field}>
                        <div style={S.fieldRow}>
                          <label style={S.label}>Enter the 6-digit OTP</label>
                          <span style={S.helper}>Sent to +91 {resetPhone}</span>
                        </div>
                        <div style={S.otpRow}>
                          {resetOtp.map((digit, index) => (
                            <input
                              key={index}
                              ref={(element) => {
                                resetOtpRefs.current[index] = element;
                              }}
                              style={S.otpBox}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(event) => handleResetOtpChange(index, event.target.value)}
                              onKeyDown={(event) => handleResetOtpKeyDown(index, event)}
                            />
                          ))}
                        </div>
                      </div>

                      <div style={S.field}>
                        <div style={S.fieldRow}>
                          <label style={S.label}>New password</label>
                          <span style={S.helper}>Minimum 8 characters</span>
                        </div>
                        <input
                          style={S.input}
                          type="password"
                          value={newPassword}
                          placeholder="Create a strong password"
                          onChange={(event) => setNewPassword(event.target.value)}
                        />
                      </div>

                      <div style={S.field}>
                        <label style={S.label}>Confirm password</label>
                        <input
                          style={S.input}
                          type="password"
                          value={confirmPassword}
                          placeholder="Re-enter your password"
                          onChange={(event) => setConfirmPassword(event.target.value)}
                        />
                      </div>

                      {error ? <div style={S.error}>{error}</div> : null}
                      {info ? <div style={S.success}>{info}</div> : null}

                      <div style={S.formActions}>
                        <button
                          type="button"
                          disabled={resetSubmitDisabled}
                          onClick={() => void handleResetPassword()}
                          style={{ ...S.actionBtn, ...(resetSubmitDisabled ? S.disabled : null) }}
                        >
                          {loading ? "Setting password..." : "Set password and sign in"}
                        </button>
                        <button
                          type="button"
                          style={S.actionBtnMuted}
                          onClick={() => {
                            resetPasswordFlow();
                            setError("");
                          }}
                        >
                          Use a different number
                        </button>
                        <button
                          type="button"
                          style={{
                            ...S.actionBtnMuted,
                            ...(resetCountdown > 0 || loading ? S.disabled : null),
                          }}
                          disabled={resetCountdown > 0 || loading}
                          onClick={() => void handleResendResetOtp()}
                        >
                          {resetCountdown > 0 ? `Resend in ${resetCountdown}s` : "Resend OTP"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <p style={S.footer}>
              Password login works for configured accounts. If your account is still OTP-first,
              use the set-password flow once and future sign-ins can use email or phone plus password.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
