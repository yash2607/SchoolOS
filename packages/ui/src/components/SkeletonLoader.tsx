import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

export interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  lines?: number;
  variant?: "rectangle" | "text-lines" | "card";
}

function SkeletonRect({
  width,
  height,
  borderRadius,
}: {
  width: number | string;
  height: number;
  borderRadius: number;
}): React.JSX.Element {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  // interpolate() returns AnimatedInterpolation which ViewStyle accepts at runtime
  // but strict TS types require an explicit cast here.
  const bgColor = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E0E0E0", "#F5F5F5"],
  }) as unknown as string;

  // AnimatedInterpolation IS valid for backgroundColor at runtime;
  // the strict types require a cast because outputRange is typed as string[]|number[]
  // rather than ColorValue[], producing AnimatedInterpolation<string|number> vs <ColorValue>.
  const animatedStyle = {
    width,
    height,
    borderRadius,
    backgroundColor: bgColor,
  } as unknown as import("react-native").ViewStyle;

  return (
    <Animated.View
      style={animatedStyle}
      accessibilityElementsHidden
    />
  );
}

export function SkeletonLoader({
  width = "100%",
  height = 16,
  borderRadius = 8,
  lines = 1,
  variant = "rectangle",
}: SkeletonLoaderProps): React.JSX.Element {
  if (variant === "text-lines") {
    return (
      <View style={{ gap: 8 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonRect
            key={i}
            width={i === lines - 1 && lines > 1 ? "70%" : "100%"}
            height={height}
            borderRadius={4}
          />
        ))}
      </View>
    );
  }

  if (variant === "card") {
    return (
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          padding: 16,
          gap: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 1,
        }}
      >
        <SkeletonRect width="60%" height={18} borderRadius={4} />
        <SkeletonRect width="100%" height={12} borderRadius={4} />
        <SkeletonRect width="80%" height={12} borderRadius={4} />
      </View>
    );
  }

  return <SkeletonRect width={width} height={height} borderRadius={borderRadius} />;
}
