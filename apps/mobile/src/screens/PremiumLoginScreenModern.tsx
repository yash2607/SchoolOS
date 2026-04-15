import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Button, Input } from "@schoolos/ui";
import { apiClient, extractApiError } from "@schoolos/api";
import type { AuthUser, ChildProfile } from "@schoolos/types";
import { tokenStorage } from "../../lib/tokenStorage";
import { getGroupForRole } from "../../lib/roleRouter";
import { useAuthStore } from "../../store/authStore";

type AuthMode = "password" | "otp" | "reset";

const TRUST_MARKERS = [
  { value: "2L+", label: "students" },
  { value: "99.9%", label: "uptime" },
  { value: "24/7", label: "support" },
];

export default function PremiumLoginScreenModern(): React.JSX.Element {
  const router = useRouter();
  const { setAuth, setLinkedChildren } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [resetMobile, setResetMobile] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetStage, setResetStage] = useState<"request" | "verify">("request");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const loadParentChildren = async () => {
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
  };

  const completeLogin = async (payload: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
    school: { id: string; name: string; timezone: string; logoUrl: string | null };
    teacherId?: string;
  }) => {
    await tokenStorage.setTokens(payload.accessToken, payload.refreshToken);
    setAuth(payload.user, payload.school, payload.teacherId);

    if (payload.user.role === "PARENT") {
      await loadParentChildren();
    }

    router.replace(getGroupForRole(payload.user.role));
  };

  const handlePasswordLogin = async () => {
    setError(null);
    setInfo(null);

    if (!identifier.trim()) {
      setError("Enter your school email address or phone number");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        user: AuthUser;
        school: { id: string; name: string; timezone: string; logoUrl: string | null };
        teacherId?: string;
      }>("/api/v1/auth/login", {
        identifier: identifier.trim(),
        password,
      });

      setInfo("Login successful. Opening your workspace...");
      await completeLogin(response.data);
    } catch (err) {
      setError(extractApiError(err).error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setError(null);
    setInfo(null);
    const normalized = mobile.startsWith("+91") ? mobile : `+91${mobile}`;

    if (!/^\+91[6-9]\d{9}$/.test(normalized)) {
      setError("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/api/v1/auth/otp/send", { mobile: normalized });
      setInfo("OTP sent successfully. Enter the code on the next screen.");
      router.push({ pathname: "/(auth)/otp", params: { mobile: normalized } });
    } catch (err) {
      setError(extractApiError(err).error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetOtp = async () => {
    setError(null);
    setInfo(null);
    const normalized = resetMobile.startsWith("+91") ? resetMobile : `+91${resetMobile}`;

    if (!/^\+91[6-9]\d{9}$/.test(normalized)) {
      setError("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/api/v1/auth/otp/send", { mobile: normalized });
      setResetStage("verify");
      setInfo("OTP sent. Enter it below and create your new password.");
    } catch (err) {
      setError(extractApiError(err).error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError(null);
    setInfo(null);
    const normalized = resetMobile.startsWith("+91") ? resetMobile : `+91${resetMobile}`;

    if (!/^\+91[6-9]\d{9}$/.test(normalized)) {
      setError("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    if (resetOtp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        user: AuthUser;
        school: { id: string; name: string; timezone: string; logoUrl: string | null };
        teacherId?: string;
      }>("/api/v1/auth/password/reset", {
        mobile: normalized,
        otp: resetOtp,
        newPassword,
      });

      setInfo("Password updated successfully. Signing you in...");
      await new Promise((resolve) => setTimeout(resolve, 650));
      await completeLogin(response.data);
    } catch (err) {
      setError(extractApiError(err).error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendResetOtp = async () => {
    setError(null);
    setInfo(null);
    const normalized = resetMobile.startsWith("+91") ? resetMobile : `+91${resetMobile}`;

    if (!/^\+91[6-9]\d{9}$/.test(normalized)) {
      setError("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/api/v1/auth/otp/send", { mobile: normalized });
      setResetOtp("");
      setInfo("A fresh OTP is on the way.");
    } catch (err) {
      setError(extractApiError(err).error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#0B1730" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View className="flex-1 bg-[#0B1730]">
          <View className="px-6 pb-8 pt-16">
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.07)",
                borderColor: "rgba(255,255,255,0.1)",
                borderWidth: 1,
              }}
              className="rounded-[34px] p-6"
            >
              <View className="mb-8 flex-row items-center justify-between">
                <View>
                  <View className="mb-4 h-16 w-16 items-center justify-center rounded-[20px] bg-[#9FB3FF]">
                    <Text className="text-2xl font-black tracking-[1.5px] text-[#0B1730]">
                      SO
                    </Text>
                  </View>
                  <Text className="text-3xl font-black text-white">SchoolOS</Text>
                  <Text className="mt-2 text-xs font-semibold uppercase tracking-[2px] text-[#C7D2FE]">
                    Premium School ERP
                  </Text>
                </View>

                <View className="rounded-full bg-[#1D4ED8]/80 px-3 py-2">
                  <Text className="text-xs font-bold uppercase tracking-[1.2px] text-white">
                    Secure Login
                  </Text>
                </View>
              </View>

              <Text className="max-w-[300px] text-[34px] font-black leading-[40px] text-white">
                Access your school workspace beautifully.
              </Text>
              <Text className="mt-3 text-base leading-6 text-[#C7D2FE]">
                Sign in with password when you have credentials, or switch to OTP for
                a faster phone-based flow.
              </Text>

              <View className="mt-8 flex-row justify-between">
                {TRUST_MARKERS.map((item) => (
                  <View
                    key={item.label}
                    style={{
                      backgroundColor: "rgba(255,255,255,0.06)",
                      borderColor: "rgba(255,255,255,0.08)",
                      borderWidth: 1,
                      width: "31%",
                    }}
                    className="rounded-[22px] px-3 py-4"
                  >
                    <Text className="text-2xl font-black text-white">{item.value}</Text>
                    <Text className="mt-1 text-xs font-medium uppercase tracking-[1px] text-[#C7D2FE]">
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className="flex-1 rounded-t-[36px] bg-[#F8FAFC] px-6 pb-8 pt-8">
            <Text className="text-3xl font-black text-[#0F172A]">Welcome back</Text>
            <Text className="mt-2 text-base text-[#475569]">
              Choose how you want to sign in to your SchoolOS account.
            </Text>

            <View className="mt-6 flex-row rounded-[22px] bg-[#E2E8F0] p-2">
              {[
                { key: "password", label: "Password" },
                { key: "otp", label: "OTP" },
                { key: "reset", label: "Set Password" },
              ].map((item) => {
                const active = mode === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => {
                      setMode(item.key as AuthMode);
                      setError(null);
                    }}
                    style={{
                      flex: 1,
                      borderRadius: 16,
                      backgroundColor: active ? "#FFFFFF" : "transparent",
                      paddingVertical: 14,
                      shadowColor: active ? "#0F172A" : "transparent",
                      shadowOpacity: active ? 0.08 : 0,
                      shadowRadius: 12,
                      shadowOffset: { width: 0, height: 8 },
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        fontWeight: "800",
                        color: active ? "#0F172A" : "#475569",
                      }}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View className="mt-6 rounded-[28px] bg-white p-5 shadow-sm">
              {mode === "password" ? (
                <>
                  <Text className="text-xl font-black text-[#0F172A]">
                    Login with email or phone
                  </Text>
                  <Text className="mt-2 text-sm leading-6 text-[#64748B]">
                    Use your school email address or registered phone number with your
                    password.
                  </Text>

                  <View className="mt-6">
                    <Text className="mb-3 text-sm font-bold uppercase tracking-[1.1px] text-[#486581]">
                      Email or Phone
                    </Text>
                    <View className="rounded-[18px] border border-[#D9E2EC] bg-[#F8FAFC] px-1 pt-4">
                      <Input
                        value={identifier}
                        onChangeText={setIdentifier}
                        placeholder="admin@schoolos.app or 9876543210"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  <View className="mt-4">
                    <Text className="mb-3 text-sm font-bold uppercase tracking-[1.1px] text-[#486581]">
                      Password
                    </Text>
                    <View className="rounded-[18px] border border-[#D9E2EC] bg-[#F8FAFC] px-1 pt-4">
                      <Input
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() => setShowPassword((value) => !value)}
                      className="mt-2 self-end"
                    >
                      <Text className="text-xs font-bold uppercase tracking-[1px] text-[#2E7DD1]">
                        {showPassword ? "Hide" : "Show"} password
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {error && (
                    <View className="mt-4 rounded-[18px] border border-[#F7C7C9] bg-[#FFF1F2] px-4 py-3">
                      <Text className="text-sm font-medium text-[#C53030]">{error}</Text>
                    </View>
                  )}
                  {info && (
                    <View className="mt-4 rounded-[18px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3">
                      <Text className="text-sm font-medium text-[#1E40AF]">{info}</Text>
                    </View>
                  )}

                  <View className="mt-6">
                    <Button
                      label="Sign in with password"
                      onPress={handlePasswordLogin}
                      loading={loading}
                      size="lg"
                      style={{
                        backgroundColor: "#1D4ED8",
                        borderRadius: 18,
                        minHeight: 58,
                      }}
                    />
                  </View>

                  <TouchableOpacity onPress={() => setMode("reset")} className="mt-4 items-center">
                    <Text className="text-sm font-bold text-[#4338CA]">
                      Forgot password? Set it with OTP
                    </Text>
                  </TouchableOpacity>
                </>
              ) : mode === "otp" ? (
                <>
                  <Text className="text-xl font-black text-[#0F172A]">
                    Login with phone and OTP
                  </Text>
                  <Text className="mt-2 text-sm leading-6 text-[#64748B]">
                    We will send a 6-digit verification code to your WhatsApp number.
                  </Text>

                  <View className="mt-6">
                    <Text className="mb-3 text-sm font-bold uppercase tracking-[1.1px] text-[#486581]">
                      Phone Number
                    </Text>
                    <View className="mb-1 flex-row items-center overflow-hidden rounded-[18px] border border-[#D9E2EC] bg-[#F8FAFC]">
                      <View className="border-r border-[#D9E2EC] bg-[#EEF2FF] px-4 py-4">
                        <Text className="text-sm font-bold text-[#334E68]">IN +91</Text>
                      </View>
                      <View className="flex-1 px-1 pt-4">
                        <Input
                          value={mobile}
                          onChangeText={setMobile}
                          placeholder="Enter mobile number"
                          keyboardType="phone-pad"
                          maxLength={10}
                          autoComplete="tel"
                          autoCapitalize="none"
                        />
                      </View>
                    </View>
                  </View>

                  {error && (
                    <View className="mt-4 rounded-[18px] border border-[#F7C7C9] bg-[#FFF1F2] px-4 py-3">
                      <Text className="text-sm font-medium text-[#C53030]">{error}</Text>
                    </View>
                  )}
                  {info && (
                    <View className="mt-4 rounded-[18px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3">
                      <Text className="text-sm font-medium text-[#1E40AF]">{info}</Text>
                    </View>
                  )}

                  <View className="mt-6">
                    <Button
                      label="Send OTP via WhatsApp"
                      onPress={handleSendOtp}
                      loading={loading}
                      size="lg"
                      style={{
                        backgroundColor: "#0F766E",
                        borderRadius: 18,
                        minHeight: 58,
                      }}
                    />
                  </View>
                </>
              ) : (
                <>
                  <Text className="text-xl font-black text-[#0F172A]">
                    Set or reset password
                  </Text>
                  <Text className="mt-2 text-sm leading-6 text-[#64748B]">
                    Verify your phone number with OTP, then create a new password and
                    sign in instantly.
                  </Text>

                  {resetStage === "request" ? (
                    <>
                      <View className="mt-6">
                        <Text className="mb-3 text-sm font-bold uppercase tracking-[1.1px] text-[#486581]">
                          Phone Number
                        </Text>
                        <View className="mb-1 flex-row items-center overflow-hidden rounded-[18px] border border-[#D9E2EC] bg-[#F8FAFC]">
                          <View className="border-r border-[#D9E2EC] bg-[#EEF2FF] px-4 py-4">
                            <Text className="text-sm font-bold text-[#334E68]">IN +91</Text>
                          </View>
                          <View className="flex-1 px-1 pt-4">
                            <Input
                              value={resetMobile}
                              onChangeText={setResetMobile}
                              placeholder="Enter mobile number"
                              keyboardType="phone-pad"
                              maxLength={10}
                              autoComplete="tel"
                              autoCapitalize="none"
                            />
                          </View>
                        </View>
                      </View>

                      {error && (
                        <View className="mt-4 rounded-[18px] border border-[#F7C7C9] bg-[#FFF1F2] px-4 py-3">
                          <Text className="text-sm font-medium text-[#C53030]">{error}</Text>
                        </View>
                      )}
                      {info && (
                        <View className="mt-4 rounded-[18px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3">
                          <Text className="text-sm font-medium text-[#1E40AF]">{info}</Text>
                        </View>
                      )}

                      <View className="mt-6">
                        <Button
                          label="Send OTP for password setup"
                          onPress={handleSendResetOtp}
                          loading={loading}
                          size="lg"
                          style={{
                            backgroundColor: "#7C3AED",
                            borderRadius: 18,
                            minHeight: 58,
                          }}
                        />
                      </View>
                    </>
                  ) : (
                    <>
                      <View className="mt-6">
                        <Text className="mb-3 text-sm font-bold uppercase tracking-[1.1px] text-[#486581]">
                          6-digit OTP
                        </Text>
                        <View className="rounded-[18px] border border-[#D9E2EC] bg-[#F8FAFC] px-1 pt-4">
                          <Input
                            value={resetOtp}
                            onChangeText={(value) => setResetOtp(value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="Enter OTP"
                            keyboardType="number-pad"
                            maxLength={6}
                            autoCapitalize="none"
                          />
                        </View>
                      </View>

                      <View className="mt-4">
                        <Text className="mb-3 text-sm font-bold uppercase tracking-[1.1px] text-[#486581]">
                          New Password
                        </Text>
                        <View className="rounded-[18px] border border-[#D9E2EC] bg-[#F8FAFC] px-1 pt-4">
                          <Input
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Create a strong password"
                            secureTextEntry={!showNewPassword}
                            autoCapitalize="none"
                          />
                        </View>
                        <TouchableOpacity
                          onPress={() => setShowNewPassword((value) => !value)}
                          className="mt-2 self-end"
                        >
                          <Text className="text-xs font-bold uppercase tracking-[1px] text-[#2E7DD1]">
                            {showNewPassword ? "Hide" : "Show"} password
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View className="mt-4">
                        <Text className="mb-3 text-sm font-bold uppercase tracking-[1.1px] text-[#486581]">
                          Confirm Password
                        </Text>
                        <View className="rounded-[18px] border border-[#D9E2EC] bg-[#F8FAFC] px-1 pt-4">
                          <Input
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Re-enter your password"
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                          />
                        </View>
                        <TouchableOpacity
                          onPress={() => setShowConfirmPassword((value) => !value)}
                          className="mt-2 self-end"
                        >
                          <Text className="text-xs font-bold uppercase tracking-[1px] text-[#2E7DD1]">
                            {showConfirmPassword ? "Hide" : "Show"} password
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {error && (
                        <View className="mt-4 rounded-[18px] border border-[#F7C7C9] bg-[#FFF1F2] px-4 py-3">
                          <Text className="text-sm font-medium text-[#C53030]">{error}</Text>
                        </View>
                      )}
                      {info && (
                        <View className="mt-4 rounded-[18px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3">
                          <Text className="text-sm font-medium text-[#1E40AF]">{info}</Text>
                        </View>
                      )}

                      <View className="mt-6">
                        <Button
                          label="Set password and sign in"
                          onPress={handleResetPassword}
                          loading={loading}
                          size="lg"
                          style={{
                            backgroundColor: "#7C3AED",
                            borderRadius: 18,
                            minHeight: 58,
                          }}
                        />
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          setResetStage("request");
                          setResetOtp("");
                          setNewPassword("");
                          setConfirmPassword("");
                          setError(null);
                          setInfo(null);
                        }}
                        className="mt-4 items-center"
                      >
                        <Text className="text-sm font-bold text-[#7C3AED]">Use a different number</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleResendResetOtp} className="mt-3 items-center">
                        <Text className="text-sm font-bold text-[#4338CA]">Resend OTP</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}
            </View>

            <View className="mt-6 rounded-[24px] bg-[#E0F2FE] px-5 py-4">
              <Text className="text-xs font-bold uppercase tracking-[1.2px] text-[#1D4ED8]">
                Access choices
              </Text>
              <Text className="mt-2 text-sm leading-6 text-[#1E3A8A]">
                Password login is ideal for fully configured accounts. If your account is
                still OTP-first, use the set-password flow once and future sign-ins can use
                email or phone plus password.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
