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
  const [messageListeners, setMessageListeners] = useState([]);

  useEffect(() => {
    if (!token || !userId) return;

    const baseUrl = import.meta.env.VITE_MESSENGER_URL.replace(/^http/, "ws");
    const wsUrl = `${baseUrl}ws?token=${encodeURIComponent(token)}`;

    const client = new Client({
      webSocketFactory: () => new WebSocket(wsUrl),
      //   debug: (str) => console.log("[STOMP]", str), //comment this later
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Connected to WebSocket");
        setConnected(true);

        client.subscribe(`/topic/messages/${userId}`, (message) => {
          const body = JSON.parse(message.body);
          messageListeners.forEach((callback) => callback(body));
        });
      },
      onDisconnect: () => {
        console.log("Disconnected from WebSocket");
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
    setMessageListeners((prev) => [...prev, callback]);
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
