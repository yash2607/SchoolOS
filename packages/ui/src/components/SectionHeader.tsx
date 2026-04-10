import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export interface SectionHeaderProps {
  title: string;
  action?: { label: string; onPress: () => void };
  count?: number;
}

export function SectionHeader({ title, action, count }: SectionHeaderProps): React.JSX.Element {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#1A1A2E" }}>{title}</Text>
        {count !== undefined && (
          <View
            style={{
              backgroundColor: "#E5E7EB",
              borderRadius: 9999,
              paddingHorizontal: 6,
              paddingVertical: 2,
              marginLeft: 6,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#4A4A6A" }}>{count}</Text>
          </View>
        )}
      </View>
      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          accessibilityLabel={action.label}
          accessibilityRole="button"
        >
          <Text style={{ fontSize: 14, color: "#2E7DD1", fontWeight: "500" }}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
