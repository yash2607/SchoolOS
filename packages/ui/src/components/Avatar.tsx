import React from "react";
import { View, Text, Image } from "react-native";

export interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: number;
  badge?: React.ReactNode;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + (parts[parts.length - 1]?.charAt(0) ?? "")).toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    "#1B3A6B", "#2E7DD1", "#1A7A4A", "#D4600A",
    "#7C3AED", "#0891B2", "#B45309", "#BE185D",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash + name.charCodeAt(i)) % colors.length;
  }
  return colors[hash] ?? "#1B3A6B";
}

export function Avatar({ uri, name, size = 40, badge }: AvatarProps): React.JSX.Element {
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          accessibilityLabel={`${name}'s photo`}
        />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bgColor,
            alignItems: "center",
            justifyContent: "center",
          }}
          accessibilityLabel={name}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: size * 0.4,
              fontWeight: "600",
            }}
          >
            {initials}
          </Text>
        </View>
      )}
      {badge && (
        <View style={{ position: "absolute", bottom: -2, right: -2 }}>
          {badge}
        </View>
      )}
    </View>
  );
}
