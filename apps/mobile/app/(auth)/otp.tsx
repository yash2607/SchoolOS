import { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Animated } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { apiClient, extractApiError } from "@schoolos/api";
import { Button } from "@schoolos/ui";
import type { AuthUser, ChildProfile } from "@schoolos/types";
import { useAuthStore } from "../../store/authStore";
import { tokenStorage } from "../../lib/tokenStorage";
import { getGroupForRole } from "../../lib/roleRouter";
import { OTP_VALIDITY_SECONDS, OTP_RESEND_COOLDOWN_SECONDS } from "@schoolos/config";

const OTP_LENGTH = 6;

export default function OtpScreen(): React.JSX.Element {
  const { mobile } = useLocalSearchParams<{ mobile: string }>();
  const router = useRouter();
  const { setAuth, setLinkedChildren } = useAuthStore();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(OTP_VALIDITY_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(OTP_RESEND_COOLDOWN_SECONDS);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleOtpChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError(null);
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    if (newOtp.every((d) => d !== "")) void handleVerify(newOtp.join(""));
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const shakeInputs = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleVerify = async (code?: string) => {
    const otpCode = code ?? otp.join("");
    if (otpCode.length < OTP_LENGTH) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        user: { id: string; name: string; role: string; schoolId: string; sessionId: string; email: string | null; mobileE164: string | null; ssoProvider: null; isActive: boolean; lastLoginAt: string | null; createdAt: string };
        school: { id: string; name: string; timezone: string; logoUrl: string | null };
        teacherId?: string;
      }>("/api/v1/auth/otp/verify", { mobile, otp: otpCode });
      await tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
      const user = response.data.user as AuthUser;
      setAuth(user, response.data.school, response.data.teacherId);
      if (user.role === "PARENT") {
        try {
          const childrenRes = await apiClient.get<Array<{
            id: string;
            firstName: string;
            lastName: string;
            gradeId: string;
            sectionId: string;
            studentCode: string;
            photoUrl?: string | null;
            blurhash?: string | null;
          }>>("/api/v1/me/children");

          const children = childrenRes.data.map<ChildProfile>((child) => ({
            id: child.id,
            fullName: `${child.firstName} ${child.lastName}`.trim(),
            photoUrl: child.photoUrl ?? null,
            blurhash: child.blurhash ?? null,
            gradeId: child.gradeId,
            sectionId: child.sectionId,
            admissionNo: child.studentCode,
          }));
          setLinkedChildren(children);
        } catch {
          setLinkedChildren([]);
        }
      }
      router.replace(getGroupForRole(user.role));
    } catch (err) {
      setError(extractApiError(err).error.message);
      shakeInputs();
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await apiClient.post("/api/v1/auth/otp/send", { mobile });
      setResendCooldown(OTP_RESEND_COOLDOWN_SECONDS);
      setCountdown(OTP_VALIDITY_SECONDS);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(extractApiError(err).error.message);
    } finally {
      setResending(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <View className="flex-1 bg-background px-6 pt-16">
      <TouchableOpacity onPress={() => router.back()} className="mb-6">
        <Text className="text-accent text-base">← Back</Text>
      </TouchableOpacity>
      <Text className="text-2xl font-bold text-text-primary mb-2">Enter OTP</Text>
      <Text className="text-text-secondary text-base mb-8">
        We&apos;ve sent a 6-digit code to {mobile}
      </Text>
      {error && (
        <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
          <Text className="text-error text-sm">{error}</Text>
        </View>
      )}
      <Animated.View style={{ transform: [{ translateX: shakeAnim }] }} className="flex-row justify-between mb-6">
        {Array.from({ length: OTP_LENGTH }).map((_, i) => (
          <TextInput
            key={i}
            ref={(ref) => { inputRefs.current[i] = ref; }}
            value={otp[i] ?? ""}
            onChangeText={(v) => handleOtpChange(v, i)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
            keyboardType="number-pad"
            maxLength={1}
            style={{ width: 48, height: 56, borderWidth: 2, borderColor: otp[i] ? "#2E7DD1" : "#D1D5DB", borderRadius: 12, textAlign: "center", fontSize: 22, fontWeight: "700", color: "#1A1A2E", backgroundColor: "#FFFFFF" }}
            accessibilityLabel={`OTP digit ${i + 1}`}
          />
        ))}
      </Animated.View>
      <Text className="text-center text-text-secondary text-sm mb-6">
        {countdown > 0 ? `Code expires in ${formatTime(countdown)}` : "Code expired — please resend"}
      </Text>
      <Button
        label={loading ? "Verifying..." : "Verify OTP"}
        onPress={() => void handleVerify()}
        loading={loading}
        size="lg"
        disabled={otp.some((d) => !d)}
      />
      <TouchableOpacity
        onPress={() => void handleResend()}
        disabled={resendCooldown > 0 || resending}
        className="mt-4 items-center"
      >
        <Text className={`text-base ${resendCooldown > 0 ? "text-gray-400" : "text-accent font-semibold"}`}>
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : resending ? "Sending..." : "Resend OTP"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
