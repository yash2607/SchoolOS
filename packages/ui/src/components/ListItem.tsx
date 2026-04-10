import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export interface ListItemProps {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  variant?: "default" | "destructive";
}

export function ListItem({
  title,
  subtitle,
  left,
  right,
  onPress,
  disabled = false,
  variant = "default",
}: ListItemProps): React.JSX.Element {
  const titleColor = variant === "destructive" ? "#B91C1C" : "#1A1A2E";

  const content = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {left && <View style={{ marginRight: 12 }}>{left}</View>}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "500", color: titleColor }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {right && <View style={{ marginLeft: 8 }}>{right}</View>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityLabel={title}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View accessibilityLabel={title}>{content}</View>;
}
