import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Button, Input } from "@schoolos/ui";
import { apiClient, extractApiError } from "@schoolos/api";

const TRUST_MARKERS = [
  { value: "2L+", label: "students" },
  { value: "99.9%", label: "uptime" },
  { value: "24/7", label: "support" },
];

export default function PremiumLoginScreen(): React.JSX.Element {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    setError(null);
    const normalized = mobile.startsWith("+91") ? mobile : `+91${mobile}`;

    if (!/^\+91[6-9]\d{9}$/.test(normalized)) {
      setError("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/api/v1/auth/otp/send", { mobile: normalized });
      router.push({ pathname: "/(auth)/otp", params: { mobile: normalized } });
    } catch (err) {
      setError(extractApiError(err).error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#102A43" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View className="flex-1 bg-[#102A43]">
          <View className="px-6 pb-8 pt-16">
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                borderColor: "rgba(255,255,255,0.12)",
                borderWidth: 1,
              }}
              className="rounded-[32px] p-6"
            >
              <View className="mb-8 flex-row items-center justify-between">
                <View>
                  <View className="mb-4 h-16 w-16 items-center justify-center rounded-[20px] bg-[#F0B429]">
                    <Text className="text-2xl font-black tracking-[1.5px] text-[#102A43]">
                      SO
                    </Text>
                  </View>
                  <Text className="text-3xl font-black text-white">
                    SchoolOS
                  </Text>
                  <Text className="mt-2 text-xs font-semibold uppercase tracking-[2px] text-[#9FB3C8]">
                    Premium School ERP
                  </Text>
                </View>

                <View className="rounded-full bg-[#0F766E] px-3 py-2">
                  <Text className="text-xs font-bold uppercase tracking-[1.2px] text-white">
                    Secure Login
                  </Text>
                </View>
              </View>

              <Text className="max-w-[280px] text-[34px] font-black leading-[40px] text-white">
                Manage your school smarter.
              </Text>
              <Text className="mt-3 text-base leading-6 text-[#BCCCDC]">
                Attendance, academics, fees, communication, and parent engagement in
                one polished platform.
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
                    <Text className="text-2xl font-black text-white">
                      {item.value}
                    </Text>
                    <Text className="mt-1 text-xs font-medium uppercase tracking-[1px] text-[#9FB3C8]">
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className="flex-1 rounded-t-[36px] bg-[#FBF8F2] px-6 pb-8 pt-8">
            <Text className="text-3xl font-black text-[#102A43]">
              Welcome back
            </Text>
            <Text className="mt-2 text-base text-[#486581]">
              Sign in with your phone number to access your school workspace.
            </Text>

            <View className="mt-8 rounded-[28px] bg-white p-5 shadow-sm">
              <Text className="mb-3 text-sm font-bold uppercase tracking-[1.1px] text-[#486581]">
                Phone Number
              </Text>

              <View className="mb-1 flex-row items-center overflow-hidden rounded-[18px] border border-[#D9E2EC] bg-[#F8FAFC]">
                <View className="border-r border-[#D9E2EC] bg-[#F0F4F8] px-4 py-4">
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

              <Text className="mb-4 text-xs text-[#829AB1]">
                Use the number registered with your school administrator.
              </Text>

              {error && (
                <View className="mb-4 rounded-[18px] border border-[#F7C7C9] bg-[#FFF1F2] px-4 py-3">
                  <Text className="text-sm font-medium text-[#C53030]">
                    {error}
                  </Text>
                </View>
              )}

              <Button
                label="Send OTP via WhatsApp"
                onPress={handleSendOtp}
                loading={loading}
                size="lg"
                style={{
                  backgroundColor: "#1F3A68",
                  borderRadius: 18,
                  minHeight: 58,
                }}
              />
            </View>

            <View className="mt-6 rounded-[24px] bg-[#E6FFFA] px-5 py-4">
              <Text className="text-xs font-bold uppercase tracking-[1.2px] text-[#0F766E]">
                Why schools choose us
              </Text>
              <Text className="mt-2 text-sm leading-6 text-[#234E52]">
                Faster parent communication, simpler fee collection, cleaner reporting,
                and one premium dashboard for every stakeholder.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
