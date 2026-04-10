/**
 * Global type augmentations for the UI package.
 *
 * Adds NativeWind v4 `className` prop to all React Native components.
 */
import "react-native";

declare module "react-native" {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
}
