import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { apiClient, extractApiError } from "@schoolos/api";
import { Button, Input } from "@schoolos/ui";

export default function LoginScreen(): React.JSX.Element {
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
      const apiError = extractApiError(err);
      setError(apiError.error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 bg-background px-6">
          <View className="flex-1 items-center justify-center pb-8">
            <View className="w-20 h-20 bg-primary rounded-2xl items-center justify-center mb-4">
              <Text className="text-white text-3xl font-bold">S</Text>
            </View>
            <Text className="text-3xl font-bold text-text-primary">SchoolOS</Text>
            <Text className="text-text-secondary text-base mt-2 text-center">
              The all-in-one school management platform
            </Text>
          </View>

          <View className="bg-surface rounded-2xl p-6 shadow-sm mb-8">
            <Text className="text-xl font-bold text-text-primary mb-6">
              Sign In
            </Text>

            {error && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <Text className="text-error text-sm">{error}</Text>
              </View>
            )}

            <View className="flex-row items-center mb-4">
              <View className="bg-gray-100 rounded-l-xl px-3 py-3.5 border border-r-0 border-gray-300">
                <Text className="text-base text-text-primary">🇮🇳 +91</Text>
              </View>
              <View className="flex-1">
                <Input
                  value={mobile}
                  onChangeText={setMobile}
                  placeholder="Mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  autoComplete="tel"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <Button
              label="Send OTP"
              onPress={handleSendOtp}
              loading={loading}
              size="lg"
            />
          </View>

          <Text className="text-center text-text-secondary text-xs pb-6">
            By logging in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
