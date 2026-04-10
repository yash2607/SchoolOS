import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Avatar } from "./Avatar.js";
import type { ChildProfile } from "@schoolos/types";

export interface ChildSwitcherHeaderProps {
  children: ChildProfile[];
  activeChildId: string;
  onChange: (id: string) => void;
}

export function ChildSwitcherHeader({
  children,
  activeChildId,
  onChange: _onChange,
}: ChildSwitcherHeaderProps): React.JSX.Element {
  const activeChild = children.find((c) => c.id === activeChildId);

  if (!activeChild) {
    return <View />;
  }

  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#FFFFFF",
      }}
      accessibilityLabel={`Active child: ${activeChild.fullName}. Tap to switch.`}
      accessibilityRole="button"
      accessibilityHint="Opens child switcher"
    >
      <Avatar
        uri={activeChild.photoUrl}
        name={activeChild.fullName}
        size={32}
      />
      <View style={{ marginLeft: 8, flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: "#1A1A2E" }}>
          {activeChild.fullName}
        </Text>
        <Text style={{ fontSize: 12, color: "#6B7280" }}>
          Admission: {activeChild.admissionNo}
        </Text>
      </View>
      {children.length > 1 && (
        <Text style={{ color: "#2E7DD1", fontSize: 18, marginLeft: 4 }}>⌄</Text>
      )}
    </TouchableOpacity>
  );
}
