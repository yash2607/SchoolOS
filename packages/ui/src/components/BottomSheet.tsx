import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, type AccessibilityRole } from "react-native";

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: string[];
  title?: string;
  variant?: "default" | "fullscreen";
}

// Production apps must use @gorhom/bottom-sheet directly for full functionality.
// This component provides the props interface; apps wire the real BottomSheet.
// TODO: [PHASE-2] Wire @gorhom/bottom-sheet in both apps using this interface.
export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  variant = "default",
}: BottomSheetProps): React.JSX.Element | null {
  if (!isOpen) return null;

  const maxHeight = variant === "fullscreen" ? "95%" : "60%";

  return (
    <>
      {/* Backdrop */}
      <TouchableOpacity
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
        onPress={onClose}
        accessibilityLabel="Close"
      />
      {/* Sheet */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight,
          backgroundColor: "#FFFFFF",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingBottom: 34,
        }}
        accessibilityRole={"dialog" as unknown as AccessibilityRole}
        accessibilityViewIsModal
      >
        {/* Drag handle */}
        <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 8 }}>
          <View
            style={{
              width: 36,
              height: 4,
              backgroundColor: "#D1D5DB",
              borderRadius: 2,
            }}
          />
        </View>
        {title && (
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#1A1A2E",
              paddingHorizontal: 20,
              paddingBottom: 12,
            }}
          >
            {title}
          </Text>
        )}
        {children}
      </View>
    </>
  );
}
