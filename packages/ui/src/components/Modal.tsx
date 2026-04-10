import React from "react";
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  type ViewStyle,
  type AccessibilityRole,
} from "react-native";

export interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeStyles: Record<string, ViewStyle> = {
  sm: { maxWidth: 320 },
  md: { maxWidth: 440 },
  lg: { maxWidth: 560 },
};

export function Modal({
  isVisible,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps): React.JSX.Element {
  return (
    <RNModal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
        activeOpacity={1}
        onPress={onClose}
        accessibilityLabel="Close dialog"
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 24,
            width: "100%",
            ...sizeStyles[size],
          }}
          accessibilityRole={"dialog" as unknown as AccessibilityRole}
          accessibilityViewIsModal
        >
          {title && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#1A1A2E", flex: 1 }}>
                {title}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Text style={{ fontSize: 20, color: "#6B7280", paddingLeft: 8 }}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
}
