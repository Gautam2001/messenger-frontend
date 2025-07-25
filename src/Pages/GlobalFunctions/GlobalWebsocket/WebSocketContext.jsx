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
      debug: (str) => console.log("[STOMP]", str), // Optional: comment out later
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("[WebSocket] Connected");
        setConnected(true);

        client.subscribe(`/topic/messages/${userId}`, (message) => {
          try {
            const body = JSON.parse(message.body);
            console.log("[WebSocket] Message received:", body);
            listenersRef.current.forEach((cb) => cb(body));
          } catch (err) {
            console.error("Failed to parse message body:", err);
          }
        });
      },
      onDisconnect: () => {
        console.log("[WebSocket] Disconnected");
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
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
      clientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      });
    }
  };

  const addMessageListener = (callback) => {
    listenersRef.current.push(callback);

    // Return unsubscribe function
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
