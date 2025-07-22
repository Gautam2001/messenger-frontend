import React, { useEffect, useState } from "react";
import "./MainApp.css";
import Sidebar from "./Sidebar/Sidebar";
import ContactList from "./ContactList/ContactList";
import ChatWindow from "./ChatWindow/ChatWindow";
import { useApiClients } from "../../Api/useApiClients";
import { usePopup } from "../GlobalFunctions/GlobalPopup/GlobalPopupContext";

const MainApp = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [contacts, setContacts] = useState([]);
  const { messengerApi } = useApiClients();
  const { showPopup } = usePopup();

  useEffect(() => {
    const fetchContacts = async () => {
      const loginData = JSON.parse(sessionStorage.getItem("LoginData"));
      const username = loginData?.username;
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
            contacts={contacts}
            setContacts={setContacts}
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
