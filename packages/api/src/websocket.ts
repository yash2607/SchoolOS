import { io, type Socket } from "socket.io-client";
import type { Message } from "@schoolos/types";

export interface WebSocketOptions {
  onMessage?: (data: Message) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export interface WebSocketClient {
  disconnect: () => void;
  emit: (event: string, data?: unknown) => void;
  joinThread: (threadId: string) => void;
  leaveThread: (threadId: string) => void;
}

export function createWebSocketClient(
  _url: string,
  _token: string,
  _options?: WebSocketOptions
): WebSocketClient {
  const socket: Socket = io(`${_url}/messages`, {
    auth: { token: _token },
    transports: ["websocket"],
  });

  socket.on("connect", () => _options?.onConnect?.());
  socket.on("disconnect", () => _options?.onDisconnect?.());
  socket.on("connect_error", (error) => _options?.onError?.(error));
  socket.on("message:new", (message: Message) => _options?.onMessage?.(message));

  return {
    disconnect: () => socket.disconnect(),
    emit: (event, data) => socket.emit(event, data),
    joinThread: (threadId) => socket.emit("thread:join", { threadId }),
    leaveThread: (threadId) => socket.emit("thread:leave", { threadId }),
  };
}
