import React from "react";
import { TouchableOpacity, View } from "react-native";

export type AttendanceDotStatus =
  | "present"
  | "absent"
  | "late"
  | "authorized_absent"
  | "none";

export interface AttendanceDotProps {
  status: AttendanceDotStatus;
  date: string;
  onPress?: () => void;
  size?: number;
}

const statusColorMap: Record<AttendanceDotStatus, string> = {
  present: "#1A7A4A",
  absent: "#B91C1C",
  late: "#D4600A",
  authorized_absent: "#7C3AED",
  none: "transparent",
};

const statusLabelMap: Record<AttendanceDotStatus, string> = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  authorized_absent: "Authorized Absence",
  none: "No data",
};

export function AttendanceDot({
  status,
  date,
  onPress,
  size = 8,
}: AttendanceDotProps): React.JSX.Element {
  const color = statusColorMap[status];
  const label = `${statusLabelMap[status]} on ${date}`;

  const dot = (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        borderWidth: status === "none" ? 0 : 0,
      }}
      accessibilityLabel={label}
    />
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        accessibilityLabel={label}
        accessibilityRole="button"
      >
        {dot}
      </TouchableOpacity>
    );
  }

  return dot;
}
