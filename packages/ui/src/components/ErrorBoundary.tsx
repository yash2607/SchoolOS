import React, { Component, type ErrorInfo } from "react";
import { View, Text } from "react-native";
import { Button } from "./Button.js";

export interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  children: React.ReactNode;
  variant?: "default" | "inline";
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  override render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View
          style={{
            flex: this.props.variant === "inline" ? 0 : 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#B91C1C", marginBottom: 8 }}>
            Something went wrong
          </Text>
          <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 16 }}>
            {this.state.error?.message ?? "An unexpected error occurred"}
          </Text>
          <Button label="Try Again" onPress={this.handleRetry} variant="secondary" size="sm" />
        </View>
      );
    }

    return this.props.children;
  }
}
