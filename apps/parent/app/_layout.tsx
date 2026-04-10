import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import Toast from "react-native-toast-message";
import { createQueryClient } from "@schoolos/api";
import { configureApiClient } from "@schoolos/api";
import { tokenStorage } from "../lib/tokenStorage";

const queryClient = createQueryClient();

// Wire up the secure token storage to the API client
configureApiClient(tokenStorage);

export default function RootLayout(): React.JSX.Element {
  useEffect(() => {
    // Listen for auth logout events from the API interceptor
    const handleLogout = () => {
      // Handled by the auth store
    };

    if (typeof window !== "undefined") {
      window.addEventListener("auth:logout", handleLogout);
      return () => window.removeEventListener("auth:logout", handleLogout);
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <BottomSheetModalProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <Toast />
        </BottomSheetModalProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
