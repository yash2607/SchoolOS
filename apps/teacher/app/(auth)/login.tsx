import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { apiClient, extractApiError } from "@schoolos/api";
import { Button, Input } from "@schoolos/ui";

export default function TeacherLoginScreen(): React.JSX.Element {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    setError(null);
    const normalized = mobile.startsWith("+91") ? mobile : `+91${mobile}`;
    if (!/^\+91[6-9]\d{9}$/.test(normalized)) {
      setError("Please enter a valid 10-digit mobile number");
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

  const handleGoogleSSO = () => {
    // TODO: [PHASE-1] Open Google OAuth WebView
    // router.push('/auth/sso?provider=google')
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 bg-background px-6">
          <View className="flex-1 items-center justify-center pb-8">
            <View className="w-20 h-20 bg-primary rounded-2xl items-center justify-center mb-4">
              <Text className="text-white text-3xl font-bold">S</Text>
            </View>
            <Text className="text-3xl font-bold text-text-primary">SchoolOS</Text>
            <Text className="text-text-secondary text-base mt-2">Teacher Portal</Text>
          </View>

          <View className="bg-surface rounded-2xl p-6 shadow-sm mb-4">
            <Text className="text-xl font-bold text-text-primary mb-6">Teacher Login</Text>
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
                  autoCapitalize="none"
                />
              </View>
            </View>
            <Button label="Send OTP" onPress={handleSendOtp} loading={loading} size="lg" />
          </View>

          <View className="bg-surface rounded-2xl p-4 mb-8 gap-3">
            <Text className="text-center text-text-secondary text-sm">Or sign in with</Text>
            <TouchableOpacity
              onPress={handleGoogleSSO}
              className="flex-row items-center justify-center border border-gray-200 rounded-xl p-3 gap-2"
            >
              <Text className="text-lg">G</Text>
              <Text className="text-text-primary font-medium">Continue with Google</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
