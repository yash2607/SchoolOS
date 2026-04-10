export const COLORS = {
  primary: "#1B3A6B",
  accent: "#2E7DD1",
  background: "#F5F7FA",
  surface: "#FFFFFF",
  error: "#B91C1C",
  warning: "#D4600A",
  success: "#1A7A4A",
  textPrimary: "#1A1A2E",
  textSecondary: "#4A4A6A",

  // Attendance status colors
  present: "#1A7A4A",
  absent: "#B91C1C",
  late: "#D4600A",
  authorizedAbsent: "#7C3AED",

  // UI chrome
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  tabBarBackground: "#FFFFFF",
  tabBarBorder: "#E5E7EB",
  activeTab: "#2E7DD1",
  inactiveTab: "#6B7280",

  // Overlays
  overlay: "rgba(0,0,0,0.5)",
  shimmer: "#E0E0E0",
  shimmerHighlight: "#F5F5F5",
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const TYPOGRAPHY = {
  fontFamily: {
    regular: "System",
    medium: "System",
    bold: "System",
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    display: 32,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const SHADOW = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
} as const;
