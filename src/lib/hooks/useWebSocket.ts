"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buildBackendWebSocketUrl } from "@/lib/api/http";

interface UseWebSocketOptions<TReceive, TSend> {
  enabled?: boolean;
  reconnectMs?: number;
  heartbeatMs?: number;
  getHeartbeatPayload?: () => TSend;
  onMessage?: (payload: TReceive) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

interface UseWebSocketResult<TSend> {
  connected: boolean;
  error: string | null;
  send: (payload: TSend) => boolean;
}

export function useWebSocket<TReceive = Record<string, unknown>, TSend = Record<string, unknown>>(
  path: string,
  options?: UseWebSocketOptions<TReceive, TSend>,
): UseWebSocketResult<TSend> {
  const {
    enabled = true,
    reconnectMs = 1500,
    heartbeatMs = 0,
    getHeartbeatPayload,
    onMessage,
    onOpen,
    onClose,
  } = options ?? {};

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const heartbeatTimerRef = useRef<number | null>(null);
  const manualCloseRef = useRef(false);

  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dummyEnabled = process.env.NEXT_PUBLIC_USE_DUMMY_DATA === "true";

  const clearTimers = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (heartbeatTimerRef.current !== null) {
      window.clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  const send = useCallback((payload: TSend): boolean => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      socket.send(JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!enabled || dummyEnabled) {
      return;
    }

    manualCloseRef.current = false;

    const connect = () => {
      const wsUrl = buildBackendWebSocketUrl(path);
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setConnected(true);
        setError(null);
        onOpen?.();

        if (heartbeatMs > 0 && getHeartbeatPayload) {
          heartbeatTimerRef.current = window.setInterval(() => {
            const heartbeat = getHeartbeatPayload();
            try {
              socket.send(JSON.stringify(heartbeat));
            } catch {
              // Ignore send failures here; reconnect flow handles broken sockets.
            }
          }, heartbeatMs);
        }
      };

      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as TReceive;
          onMessage?.(parsed);
        } catch {
          // Ignore non-JSON payloads for this typed hook.
        }
      };

      socket.onerror = () => {
        setError("WebSocket connection error");
      };

      socket.onclose = () => {
        setConnected(false);
        clearTimers();
        onClose?.();

        if (!manualCloseRef.current) {
          reconnectTimerRef.current = window.setTimeout(connect, reconnectMs);
        }
      };
    };

    connect();

    return () => {
      manualCloseRef.current = true;
      clearTimers();
      const socket = socketRef.current;
      socketRef.current = null;
      if (socket && socket.readyState <= WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [
    clearTimers,
    dummyEnabled,
    enabled,
    getHeartbeatPayload,
    heartbeatMs,
    onClose,
    onMessage,
    onOpen,
    path,
    reconnectMs,
  ]);

  return {
    connected,
    error,
    send,
  };
}
