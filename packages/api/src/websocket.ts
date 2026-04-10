// WebSocket client stub — real implementation uses socket.io-client
// Configured per-app with proper token management
// TODO: [PHASE-6] Implement full socket.io-client integration

export interface WebSocketOptions {
  onMessage?: (data: unknown) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export interface WebSocketClient {
  disconnect: () => void;
  emit: (event: string, data?: unknown) => void;
}

// Stub — replaced per-app with real socket.io-client instance
export function createWebSocketClient(
  _url: string,
  _token: string,
  _options?: WebSocketOptions
): WebSocketClient {
  console.warn("[WebSocket] Stub implementation. Configure in app.");
  return {
    disconnect: () => {},
    emit: () => {},
  };
}
