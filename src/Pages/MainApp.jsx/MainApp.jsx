import React, { useState } from "react";
import "./MainApp.css";
import Sidebar from "./Sidebar/Sidebar";
import ContactList from "./ContactList/ContactList";
import ChatWindow from "./ChatWindow/ChatWindow";

const MainApp = () => {
  const [selectedContact, setSelectedContact] = useState(null);

  return (
    <div className="main-layout">
      <Sidebar />
      <ContactList onSelectContact={setSelectedContact} />
      <div className="chat-container">
        {selectedContact ? (
          <ChatWindow
            contact={selectedContact}
            setSelectedContact={setSelectedContact}
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
