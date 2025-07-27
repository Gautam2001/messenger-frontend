// WebSocketContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Client } from "@stomp/stompjs";

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children, token, userId }) => {
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef([]);

  useEffect(() => {
    if (!token || !userId) return;

    const baseUrl = import.meta.env.VITE_MESSENGER_URL.replace(/^http/, "ws");
    const wsUrl = `${baseUrl}ws?token=${encodeURIComponent(token)}`;

    const client = new Client({
      webSocketFactory: () => new WebSocket(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        if (
          str.includes("SEND") ||
          str.includes("CONNECTED") ||
          str.includes("DISCONNECTED") ||
          str.includes("ERROR")
        ) {
          console.log("[STOMP]", str);
        }
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ [WebSocket] Connected");
        setConnected(true);

        client.subscribe(`/topic/messages/${userId}`, (message) => {
          try {
            const body = JSON.parse(message.body);
            console.log("📩 [WebSocket] Message received:", body);
            listenersRef.current.forEach((cb) => cb(body));
          } catch (err) {
            console.error("❌ [WebSocket] Failed to parse message body:", err);
          }
        });
      },
      onDisconnect: () => {
        console.log("❌ [WebSocket] Disconnected");
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error("💥 [WebSocket] STOMP error:", frame.headers["message"]);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [token, userId]);

  const sendMessage = (destination, body) => {
    if (clientRef.current && connected) {
      console.log("📤 [WebSocket] Sending to:", destination, "Payload:", body);
      try {
        clientRef.current.publish({
          destination,
          body: JSON.stringify(body),
        });
        console.log("✅ [WebSocket] Message published");
      } catch (err) {
        console.error("❌ [WebSocket] Publish error:", err);
      }
    } else {
      console.warn(
        "⚠️ [WebSocket] Cannot send — not connected or client missing"
      );
    }
  };

  const addMessageListener = (callback) => {
    listenersRef.current.push(callback);
    return () => {
      listenersRef.current = listenersRef.current.filter(
        (cb) => cb !== callback
      );
    };
  };

  return (
    <WebSocketContext.Provider
      value={{
        connected,
        sendMessage,
        addMessageListener,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
