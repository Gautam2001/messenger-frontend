// MainApp.jsx
import React, { useEffect, useState, useRef } from "react";
import "./MainApp.css";
import Sidebar from "./Sidebar/Sidebar";
import ContactList from "./ContactList/ContactList";
import ChatWindow from "./ChatWindow/ChatWindow";
import { useApiClients } from "../../Api/useApiClients";
import { usePopup } from "../GlobalFunctions/GlobalPopup/GlobalPopupContext";
import { useWebSocket } from "../GlobalFunctions/GlobalWebsocket/WebSocketContext";

const MainApp = () => {
  const [myUsername, setMyUsername] = useState("");
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [liveMessage, setLiveMessage] = useState(null);
  const seenMessageIdsRef = useRef(new Set());

  const { messengerApi } = useApiClients();
  const { showPopup } = usePopup();
  const { addMessageListener } = useWebSocket();

  const fetchContacts = async () => {
    const loginData = JSON.parse(sessionStorage.getItem("LoginData"));
    const username = loginData?.username;
    if (!username) {
      showPopup("User not logged in. Please re-login.", "error");
      return;
    }

    try {
      const res = await messengerApi.post("/messenger/contacts", { username });
      if (res.data.status === "0") {
        setContacts(res.data.contactList || []);
      } else {
        showPopup(res.data.message || "Failed to load contacts", "error");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Network error while loading contacts.";
      showPopup(msg, "error");
    }
  };

  const updateDeliveredAndFetchContacts = async (username) => {
    try {
      const res = await messengerApi.post("/messenger/message-delivered", {
        username,
      });
      if (res.data.status !== "0") {
        showPopup(
          res.data.message || "Failed to update delivered status",
          "error"
        );
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Network error during delivery update.";
      showPopup(msg, "error");
    }

    await fetchContacts();
  };

  useEffect(() => {
    const loginData = JSON.parse(sessionStorage.getItem("LoginData"));
    const username = loginData?.username;
    if (!username) {
      showPopup("User not logged in. Please re-login.", "error");
      return;
    }
    setMyUsername(username);
    updateDeliveredAndFetchContacts(username);
  }, []);

  useEffect(() => {
    if (!myUsername) return;

    const listener = (msg) => {
      const isSelfChat =
        msg.sender === myUsername && msg.receiver === myUsername;
      const isInCurrentChat =
        selectedContact &&
        ((msg.sender === selectedContact.contactUsername &&
          msg.receiver === myUsername) ||
          (msg.sender === myUsername &&
            msg.receiver === selectedContact.contactUsername) ||
          isSelfChat);

      if (isInCurrentChat && !seenMessageIdsRef.current.has(msg.messageId)) {
        seenMessageIdsRef.current.add(msg.messageId);
        setLiveMessage(msg);
      }

      setContacts((prev) => {
        const contactUsername = isSelfChat
          ? myUsername
          : msg.sender === myUsername
          ? msg.receiver
          : msg.sender;

        const existingIndex = prev.findIndex(
          (c) => c.contactUsername === contactUsername
        );
        const updatedContact = {
          contactUsername,
          contactName:
            prev[existingIndex]?.contactName || contactUsername.split("@")[0],
          latestMessage: msg.content,
          timestamp: new Date(msg.sentAt).toISOString(),
          status: msg.status || "SENT",
        };

        const updated = [...prev];
        if (existingIndex !== -1) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...updatedContact,
          };
        } else {
          updated.unshift(updatedContact);
        }

        return updated.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
      });
    };

    const unsubscribe = addMessageListener(listener);
    return unsubscribe;
  }, [myUsername, selectedContact]);

  return (
    <div className="main-layout">
      <Sidebar />
      <ContactList
        onSelectContact={setSelectedContact}
        contacts={contacts}
        setContacts={setContacts}
      />
      <div className="chat-container">
        {selectedContact ? (
          <ChatWindow
            contact={selectedContact}
            setSelectedContact={setSelectedContact}
            liveMessage={liveMessage}
            refreshContacts={fetchContacts}
          />
        ) : (
          <div className="chat-window-placeholder">
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainApp;
