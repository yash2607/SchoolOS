import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Animated,
  TouchableOpacity,
  type TextInputProps,
  type KeyboardType,
} from "react-native";

export interface InputProps {
  label?: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardType;
  leftIcon?: React.ReactNode;
  maxLength?: number;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoComplete?: TextInputProps["autoComplete"];
  rightActionLabel?: string;
  onRightActionPress?: () => void;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = "default",
  leftIcon,
  maxLength,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  autoCapitalize = "sentences",
  autoComplete,
  rightActionLabel,
  onRightActionPress,
}: InputProps): React.JSX.Element {
  const [isFocused, setIsFocused] = useState(false);
  const labelAnim = useRef(
    new Animated.Value(value.length > 0 ? 1 : 0)
  ).current;

  const animateLabel = (toValue: number) => {
    Animated.timing(labelAnim, {
      toValue,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const handleFocus = () => {
    setIsFocused(true);
    animateLabel(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) animateLabel(0);
  };

  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [14, -8],
  });

  const labelSize = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12],
  });

  const borderColor = error
    ? "#B91C1C"
    : isFocused
    ? "#2E7DD1"
    : "#D1D5DB";

  return (
    <View className="mb-4">
      <View
        style={{
          borderWidth: 1,
          borderColor,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingTop: label ? 16 : 12,
          paddingBottom: 12,
          backgroundColor: disabled ? "#F9FAFB" : "#FFFFFF",
          flexDirection: "row",
          alignItems: multiline ? "flex-start" : "center",
        }}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <View className="flex-1">
          {label && (
            <Animated.Text
              style={{
                position: "absolute",
                top: labelTop,
                fontSize: labelSize,
                color: error ? "#B91C1C" : isFocused ? "#2E7DD1" : "#6B7280",
                backgroundColor: "#FFFFFF",
                paddingHorizontal: 2,
                left: 0,
              }}
            >
              {label}
            </Animated.Text>
          )}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={label ? undefined : placeholder}
            placeholderTextColor="#9CA3AF"
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            maxLength={maxLength}
            editable={!disabled}
            multiline={multiline}
            numberOfLines={multiline ? numberOfLines : undefined}
            autoCapitalize={autoCapitalize}
            autoComplete={autoComplete}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{
              fontSize: 16,
              color: "#1A1A2E",
              paddingTop: 0,
              paddingBottom: 0,
              minHeight: multiline ? numberOfLines * 24 : undefined,
            }}
            accessibilityLabel={label ?? placeholder}
          />
        </View>
        {rightActionLabel && onRightActionPress ? (
          <TouchableOpacity
            onPress={onRightActionPress}
            disabled={disabled}
            className="ml-2 self-center rounded-full px-2 py-1"
            accessibilityRole="button"
            accessibilityLabel={rightActionLabel}
          >
            <Text className="text-xs font-bold uppercase tracking-[1px] text-[#2E7DD1]">
              {rightActionLabel}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {error && (
        <Text className="text-[#B91C1C] text-sm mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
}
