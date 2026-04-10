import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  type TouchableOpacityProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  style?: StyleProp<ViewStyle>;
}

const variantStyles = {
  primary: {
    container: "bg-[#1B3A6B] rounded-xl",
    text: "text-white font-semibold",
  },
  secondary: {
    container: "bg-white border border-[#2E7DD1] rounded-xl",
    text: "text-[#2E7DD1] font-semibold",
  },
  danger: {
    container: "bg-[#B91C1C] rounded-xl",
    text: "text-white font-semibold",
  },
  ghost: {
    container: "rounded-xl",
    text: "text-[#2E7DD1] font-semibold",
  },
} as const;

const sizeStyles = {
  sm: { container: "px-3 py-2", text: "text-sm" },
  md: { container: "px-4 py-3", text: "text-base" },
  lg: { container: "px-6 py-4", text: "text-lg" },
} as const;

export function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  size = "md",
  style,
}: ButtonProps): React.JSX.Element {
  const isDisabled = disabled || loading;

  const handlePress = () => {
    // TODO: [PHASE-0] Add expo-haptics import in apps — cannot import here as package-level dep
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      style={[{ opacity: isDisabled ? 0.4 : 1 }, style]}
      className={`flex-row items-center justify-center ${variantStyles[variant].container} ${sizeStyles[size].container}`}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" || variant === "danger" ? "#FFFFFF" : "#2E7DD1"}
        />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={`${variantStyles[variant].text} ${sizeStyles[size].text}`}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
