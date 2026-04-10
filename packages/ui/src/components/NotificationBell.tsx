import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";

export interface NotificationBellProps {
  count: number;
  onPress: () => void;
  animated?: boolean;
}

export function NotificationBell({
  count,
  onPress,
  animated = false,
}: NotificationBellProps): React.JSX.Element {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated && count > 0) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [animated, count, pulse]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ position: "relative", padding: 4 }}
      accessibilityLabel={`Notifications, ${count} unread`}
      accessibilityRole="button"
    >
      <Animated.View style={{ transform: [{ scale: animated && count > 0 ? pulse : 1 }] }}>
        {/* Bell icon — apps use @expo/vector-icons Ionicons */}
        <Text style={{ fontSize: 22 }}>🔔</Text>
      </Animated.View>
      {count > 0 && (
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            backgroundColor: "#B91C1C",
            borderRadius: 9999,
            minWidth: 18,
            height: 18,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 3,
          }}
          accessibilityElementsHidden
        >
          <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}>
            {count > 99 ? "99+" : count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
