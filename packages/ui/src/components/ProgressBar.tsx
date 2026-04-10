import React from "react";
import { View, Text } from "react-native";

export interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  showLabel?: boolean;
  variant?: "linear" | "circular";
}

export function ProgressBar({
  value,
  max,
  color = "#2E7DD1",
  showLabel = false,
  variant = "linear",
}: ProgressBarProps): React.JSX.Element {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  if (variant === "circular") {
    // Simplified circular indicator — real impl uses react-native-svg in apps
    // TODO: [PHASE-2] Replace with SVG-based circular progress in apps
    return (
      <View style={{ alignItems: "center" }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            borderWidth: 4,
            borderColor: "#E5E7EB",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "700", color }}>
            {Math.round(pct)}%
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      {showLabel && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <Text style={{ fontSize: 12, color: "#6B7280" }}>{Math.round(pct)}%</Text>
          <Text style={{ fontSize: 12, color: "#6B7280" }}>{value}/{max}</Text>
        </View>
      )}
      <View
        style={{
          height: 6,
          backgroundColor: "#E5E7EB",
          borderRadius: 3,
          overflow: "hidden",
        }}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max, now: value }}
      >
        <View
          style={{
            height: "100%",
            width: `${pct}%`,
            backgroundColor: color,
            borderRadius: 3,
          }}
        />
      </View>
    </View>
  );
}
