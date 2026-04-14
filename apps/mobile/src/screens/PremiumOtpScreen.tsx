import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "@schoolos/ui";
import { apiClient, extractApiError } from "@schoolos/api";
import { OTP_RESEND_COOLDOWN_SECONDS, OTP_VALIDITY_SECONDS } from "@schoolos/config";
import type { AuthUser, ChildProfile } from "@schoolos/types";
import { tokenStorage } from "../../lib/tokenStorage";
import { getGroupForRole } from "../../lib/roleRouter";
import { useAuthStore } from "../../store/authStore";

const OTP_LENGTH = 6;

export default function PremiumOtpScreen(): React.JSX.Element {
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
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);
    setError(null);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (nextOtp.every((item) => item !== "")) {
      void handleVerify(nextOtp.join(""));
    }
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
        user: {
          id: string;
          name: string;
          role: string;
          schoolId: string;
          sessionId: string;
          email: string | null;
          mobileE164: string | null;
          ssoProvider: null;
          isActive: boolean;
          lastLoginAt: string | null;
          createdAt: string;
        };
        school: { id: string; name: string; timezone: string; logoUrl: string | null };
        teacherId?: string;
      }>("/api/v1/auth/otp/verify", { mobile, otp: otpCode });

      await tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
      const user = response.data.user as AuthUser;
      setAuth(user, response.data.school, response.data.teacherId);

      if (user.role === "PARENT") {
        try {
          const childrenRes = await apiClient.get<
            Array<{
              id: string;
              firstName: string;
              lastName: string;
              gradeId: string;
              sectionId: string;
              studentCode: string;
              photoUrl?: string | null;
              blurhash?: string | null;
            }>
          >("/api/v1/me/children");

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

  const formatTime = (value: number) =>
    `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, "0")}`;

  return (
    <View className="flex-1 bg-[#102A43] px-6 pt-14">
      <TouchableOpacity onPress={() => router.back()} className="mb-6 self-start rounded-full bg-white/10 px-4 py-2">
        <Text className="text-sm font-semibold text-white">Back</Text>
      </TouchableOpacity>

      <View className="rounded-[34px] bg-[#FBF8F2] p-6 shadow-sm">
        <View className="mb-6 rounded-[24px] bg-[#1F3A68] p-5">
          <Text className="text-xs font-bold uppercase tracking-[1.3px] text-[#F0B429]">
            Secure Access
          </Text>
          <Text className="mt-3 text-3xl font-black text-white">Enter OTP</Text>
          <Text className="mt-2 text-sm leading-6 text-[#D9E2EC]">
            We sent a 6-digit verification code to {mobile}. Enter it below to
            unlock your premium school workspace.
          </Text>
        </View>

        {error && (
          <View className="mb-5 rounded-[18px] border border-[#F7C7C9] bg-[#FFF1F2] px-4 py-3">
            <Text className="text-sm font-medium text-[#C53030]">{error}</Text>
          </View>
        )}

        <Animated.View
          style={{ transform: [{ translateX: shakeAnim }] }}
          className="mb-5 flex-row justify-between"
        >
          {Array.from({ length: OTP_LENGTH }).map((_, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              value={otp[index] ?? ""}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              style={{
                width: 48,
                height: 64,
                borderRadius: 18,
                borderWidth: 2,
                borderColor: otp[index] ? "#0F766E" : "#D9E2EC",
                backgroundColor: otp[index] ? "#F0FDFA" : "#FFFFFF",
                textAlign: "center",
                fontSize: 24,
                fontWeight: "800",
                color: "#102A43",
              }}
              accessibilityLabel={`OTP digit ${index + 1}`}
            />
          ))}
        </Animated.View>

        <View className="mb-5 rounded-[20px] bg-[#F0F4F8] px-4 py-4">
          <Text className="text-center text-sm font-medium text-[#486581]">
            {countdown > 0
              ? `Code expires in ${formatTime(countdown)}`
              : "Code expired. Request a fresh OTP to continue."}
          </Text>
        </View>

        <Button
          label={loading ? "Verifying..." : "Verify and continue"}
          onPress={() => void handleVerify()}
          loading={loading}
          size="lg"
          disabled={otp.some((digit) => !digit)}
          style={{
            backgroundColor: "#0F766E",
            borderRadius: 18,
            minHeight: 58,
          }}
        />

        <TouchableOpacity
          onPress={() => void handleResend()}
          disabled={resendCooldown > 0 || resending}
          className="mt-5 items-center"
        >
          <Text
            className={`text-sm ${
              resendCooldown > 0
                ? "text-[#829AB1]"
                : "font-bold text-[#1F3A68]"
            }`}
          >
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : resending
                ? "Sending..."
                : "Resend OTP"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
