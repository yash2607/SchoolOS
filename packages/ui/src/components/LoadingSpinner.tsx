import React from "react";
import { View, ActivityIndicator } from "react-native";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  overlay?: boolean;
}

const sizeMap = { sm: "small", md: "large", lg: "large" } as const;

export function LoadingSpinner({
  size = "md",
  color = "#2E7DD1",
  overlay = false,
}: LoadingSpinnerProps): React.JSX.Element {
  if (overlay) {
    return (
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255,255,255,0.85)",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999,
        }}
        accessibilityLabel="Loading"
        accessibilityRole="progressbar"
      >
        <ActivityIndicator size={sizeMap[size]} color={color} />
      </View>
    );
  }

  return (
    <View
      style={{ alignItems: "center", justifyContent: "center", padding: 16 }}
      accessibilityLabel="Loading"
      accessibilityRole="progressbar"
    >
      <ActivityIndicator size={sizeMap[size]} color={color} />
    </View>
  );
}
