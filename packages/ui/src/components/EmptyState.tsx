import React from "react";
import { View, Text } from "react-native";
import { Button } from "./Button.js";

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onPress: () => void };
  variant?: "default" | "error";
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
}: EmptyStateProps): React.JSX.Element {
  return (
    <View
      style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}
      accessibilityLiveRegion="polite"
    >
      <View style={{ marginBottom: 16, opacity: variant === "error" ? 0.8 : 0.6 }}>
        {icon}
      </View>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          color: variant === "error" ? "#B91C1C" : "#1A1A2E",
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: "#6B7280",
          textAlign: "center",
          lineHeight: 22,
          marginBottom: action ? 24 : 0,
        }}
      >
        {description}
      </Text>
      {action && (
        <Button
          label={action.label}
          onPress={action.onPress}
          variant="primary"
          size="md"
        />
      )}
    </View>
  );
}
