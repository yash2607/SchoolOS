import React from "react";
import { View, TouchableOpacity, type ViewStyle } from "react-native";

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  padding?: "sm" | "md" | "lg";
  shadow?: boolean;
  border?: boolean;
  style?: ViewStyle;
}

const paddingMap = { sm: 8, md: 16, lg: 24 } as const;

export function Card({
  children,
  onPress,
  padding = "md",
  shadow = true,
  border = false,
  style,
}: CardProps): React.JSX.Element {
  const containerStyle: ViewStyle = {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: paddingMap[padding],
    borderWidth: border ? 1 : 0,
    borderColor: "#E5E7EB",
    ...(shadow
      ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
        }
      : {}),
    ...style,
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={containerStyle}
        activeOpacity={0.85}
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}
