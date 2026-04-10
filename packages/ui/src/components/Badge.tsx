import React from "react";
import { View, Text } from "react-native";

export interface BadgeProps {
  label: string;
  color?: "green" | "red" | "orange" | "blue" | "gray" | "purple";
  size?: "sm" | "md";
}

const colorMap = {
  green: { bg: "#D1FAE5", text: "#065F46" },
  red: { bg: "#FEE2E2", text: "#991B1B" },
  orange: { bg: "#FEF3C7", text: "#92400E" },
  blue: { bg: "#DBEAFE", text: "#1E40AF" },
  gray: { bg: "#F3F4F6", text: "#374151" },
  purple: { bg: "#EDE9FE", text: "#5B21B6" },
} as const;

export function Badge({ label, color = "gray", size = "md" }: BadgeProps): React.JSX.Element {
  const { bg, text } = colorMap[color];
  const fontSize = size === "sm" ? 11 : 13;
  const px = size === "sm" ? 6 : 8;
  const py = size === "sm" ? 2 : 4;

  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 9999,
        paddingHorizontal: px,
        paddingVertical: py,
        alignSelf: "flex-start",
      }}
      accessibilityLabel={label}
    >
      <Text style={{ color: text, fontSize, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}
