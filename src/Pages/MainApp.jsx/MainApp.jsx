import React, { useEffect, useState, useRef } from "react";
import "./MainApp.css";
import Sidebar from "./Sidebar/Sidebar";
import ContactList from "./ContactList/ContactList";
import ChatWindow from "./ChatWindow/ChatWindow";
import { useApiClients } from "../../Api/useApiClients";
import { usePopup } from "../GlobalFunctions/GlobalPopup/GlobalPopupContext";
import { useWebSocket } from "../GlobalFunctions/GlobalWebsocket/WebSocketContext";

const MainApp = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [liveMessage, setLiveMessage] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [myUsername, setMyUsername] = useState("");
  const { messengerApi } = useApiClients();
  const { showPopup } = usePopup();
  const { addMessageListener } = useWebSocket();
  const seenMessageIdsRef = useRef(new Set());

  useEffect(() => {
    const loginData = JSON.parse(sessionStorage.getItem("LoginData"));
    const username = loginData?.username;
    if (username) setMyUsername(username);

    const fetchContacts = async () => {
      try {
        const res = await messengerApi.post("/messenger/contacts", {
          username,
        });
        if (res.data.status === "0") {
          setContacts(res.data.contactList || []);
        } else {
          showPopup(res.data.message || "Failed to load contacts", "error");
        }
      } catch {
        showPopup("Network error while loading contacts", "error");
      }
    };

    fetchContacts();
  }, []);

  // WebSocket listener – runs once after username is available
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

      // Always update contact list for latest message
      setContacts((prevContacts) => {
        const isSenderMe = msg.sender === myUsername;
        const contactUsername = isSelfChat
          ? myUsername
          : isSenderMe
          ? msg.receiver
          : msg.sender;

        const existing = prevContacts.find(
          (c) => c.contactUsername === contactUsername
        );

        const contactName = existing
          ? existing.contactName
          : contactUsername.split("@")[0];

        const timestamp = new Date(msg.sentAt).toISOString();

        const updatedContact = {
          contactUsername,
          contactName,
          latestMessage: msg.content,
          timestamp,
          status: msg.status || "SENT",
        };

        const existingIndex = prevContacts.findIndex(
          (c) => c.contactUsername === contactUsername
        );

        if (existingIndex !== -1) {
          const updated = [...prevContacts];
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...updatedContact,
          };
          return updated.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );
        } else {
          return [updatedContact, ...prevContacts];
        }
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
