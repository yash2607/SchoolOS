import "../global.css";
import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import Toast from "react-native-toast-message";
import { createQueryClient, configureApiClient } from "@schoolos/api";
import { tokenStorage } from "../lib/tokenStorage";

const queryClient = createQueryClient();

configureApiClient(tokenStorage);

export default function RootLayout(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <BottomSheetModalProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(parent)" />
            <Stack.Screen name="(teacher)" />
            <Stack.Screen name="(admin)" />
          </Stack>
          <Toast />
        </BottomSheetModalProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
