import React from "react";
import "./MainApp.css";
import Sidebar from "./Sidebar/Sidebar";
import ContactList from "./ContactList/ContactList";
import ChatWindow from "./ChatWindow/ChatWindow";

const MainApp = () => {
  return (
    <div className="main-layout">
      <Sidebar />
      <ContactList />
      <ChatWindow />
    </div>
  );
};

export default MainApp;
